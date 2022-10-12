(* Simple liteweight HTTP stub daemon to serve redirects,
 *   translating requests with encoded search queries to proper URLs.
 * Intended to run on localhost to be destination for browser search plugins
 *   to work around their limitations (e.g. encoding in firefox, no complex logic, etc).
 * Runs a single thread/process and handles all requests sequentially,
 *   assuming that it's not public internet and no connections will hang or stall intentionally.
 *
 * Request format: /<keyword>/<query>
 * Example translation: /github-repo/mk-fg%2Fwaterfox -> https://github.com/mk-fg/waterfox
 *
 * Build with:
 *   % ocamlopt -o redirector -O2 unix.cmxa str.cmxa redirector.ml
 *   % strip redirector
 *)


(* Command-line option defaults *)
let cli_bind = ref "localhost:8803"
let cli_oneshot = ref false
let cli_conn_queue = ref 30
let cli_conn_timeout = ref 3.
let cli_inactivity_timeout = ref 0
let cli_req_line_max_len = ref 2048 (* for "GET <url> HTTP/x.y" *)

(* Mapping of keywords to sites *)
(* Currently only for simple string-replacement/translation,
 *   but can be extended with callable logic here as necessary. *)
let kw_map = Hashtbl.create 4
let () = (
	Hashtbl.add kw_map "github-repo" "https://github.com/%q%";
	Hashtbl.add kw_map "codeberg-repo" "https://codeberg.org/%q%";
)


(* Command-line args processing *)
let () = Arg.parse
	[ ("-b", Arg.Set_string cli_bind,
			Printf.sprintf "host:port -- endpoint to bind listen socket to \
				(default: %s), ignored with systemd socket activation" !cli_bind );
		("-t", Arg.Set_int cli_inactivity_timeout,
			"seconds -- inactivity-stop timeout (no conns/requests), useful with systemd socket activation");
		("-1", Arg.Set cli_oneshot,
			"-- exit after handling first connection/request, for testing purposes") ]
	(fun arg -> raise (Arg.Bad ("Bogus extra arg : " ^ arg)))
	("Usage: " ^ Sys.argv.(0) ^ " [-b host:port] [-t seconds] [-1]\
		\n\nStub httpd to translate incoming browser-search queries to external redirects.\
		\nCan be started by systemd.socket unit, with ListenStream= and Accept=no mode.\n")

let host, port =
	let re = Str.regexp "^\\(.*\\):\\([0-9]+\\)$" in
	if not (Str.string_match re !cli_bind 0)
		then raise (Arg.Bad ("Incorrect host:port spec : " ^ !cli_bind))
		else
			Str.matched_group 1 !cli_bind,
			int_of_string (Str.matched_group 2 !cli_bind)

(* let () = Printf.printf "opts: bind=[%s:%d] oneshot=%b\n%!" host port !cli_oneshot *)


(* Main keyword/query -> http-response mapping logic *)
(* Currently this only does simple string translation
 *   mapping with slash-decoding to produce site paths for firefox:
 * /{kw}/{q} -> {kw-value with %q% replaced} *)
let kw_res =
	let res_redirect url = (
		"HTTP/1.1 302 Found\r\nLocation: "
		^ url ^ "\r\nContent-Length: 0\r\n\r\n" ) in
	let res_nx =
		let pre = "No redirect for: " in
		( fun url ->
			let res = pre ^ url in Printf.sprintf
				"HTTP/1.1 404 Not Found\r\n\
					Content-Type: text/plain; charset=utf-8\r\n\
					Content-Length: %d\r\n\r\n%s"
				(String.length res) res ) in
	let re_sub, re_sub_tpl = (Str.regexp "%2F", "/") in
	let kw_map_fmt =
		let re = Str.regexp "%q%" in
		(fun site url -> Str.replace_first re url site) in
	( fun kw q ->
		let url = Str.global_replace re_sub re_sub_tpl q in
		try
			let site = Hashtbl.find kw_map kw in
			let url = kw_map_fmt site url in
			res_redirect url
		with Not_found -> res_nx url )


(* Stub HTTP daemon implementation *)
(* Does not care about or react to any request headers *)

let try_finally f x finally y =
	let res = try f x with e -> finally y; raise e in finally y; res
let rec eintr_loop f x =
	try f x with Unix.Unix_error (Unix.EINTR, _, _) -> eintr_loop f x
let fd_of_int (x: int) : Unix.file_descr = Obj.magic x

let reset_inactivity_timer () =
	if !cli_inactivity_timeout > 0 then ignore (Unix.alarm !cli_inactivity_timeout)

let tcp_conn_log conn_ep closed = ()
(* let tcp_conn_log conn_ep closed =
 * 	let addr_raw, port =
 * 		match conn_ep with
 * 			| Unix.ADDR_INET (a, n) -> (a, n)
 * 			|  _ -> failwith "not INET" in
 * 	let addr = Unix.string_of_inet_addr addr_raw in
 * 	let state = if closed then "-" else "+" in
 * 	(Printf.printf "conn %s %s:%d\n%!" state addr port) *)

let tcp_server_bind_listen ep queue =
	(* Try to get socket from systemd first *)
	try
		let pid = int_of_string (Unix.getenv "LISTEN_PID") in
		let fd_max = int_of_string (Unix.getenv "LISTEN_FDS") in
		if Unix.getpid () != pid then raise Not_found else
		if fd_max = 1 then fd_of_int 3 else
			raise (Arg.Bad "Too many fds passed from systemd")
	with Not_found | Failure _ ->
	(* Otherwise bind it normally *)
	let sock = Unix.socket Unix.PF_INET Unix.SOCK_STREAM 0 in
	try
		Unix.setsockopt sock Unix.SO_REUSEADDR true;
		Unix.bind sock ep;
		Unix.listen sock queue;
		sock
	with e -> Unix.close sock; raise e

let tcp_server sock conn_handler =
	Sys.set_signal Sys.sigpipe Sys.Signal_ignore;
	reset_inactivity_timer ();
	let rec conn_accept () =
		let conn, conn_ep = eintr_loop Unix.accept sock in
		reset_inactivity_timer ();
		let conn_handle () =
			tcp_conn_log conn_ep false;
			conn_handler conn conn_ep in
		let conn_close () =
			tcp_conn_log conn_ep true;
			Unix.close conn in
		try_finally conn_handle () conn_close ();
		if !cli_oneshot then () else conn_accept () in
	conn_accept ()

let conn_handler =
	let re_req = Str.regexp_case_fold "^GET /\\([^ /]+\\)/\\([^ ]+\\) HTTP" in
	let buff_len = !cli_req_line_max_len in
	let buff = Bytes.create buff_len in
	( fun conn conn_ep ->
		Unix.set_nonblock conn;
		let select () = Unix.select [conn] [] [conn] !cli_conn_timeout in
		let rec buff_recv pos =
			let r, w, x = eintr_loop select () in
			if List.length x > 0 || List.length r < 1 then 0 else
				let recv () = Unix.recv conn buff pos (buff_len - pos) [] in
				let pos = pos + eintr_loop recv () in
				try Bytes.index buff '\n' with Not_found -> buff_recv pos in
		ignore (buff_recv 0);
		let buff_str = Bytes.to_string (Bytes.trim buff) in
		if not (Str.string_match re_req buff_str 0) then () else
			let kw = Str.matched_group 1 buff_str in
			let q = Str.matched_group 2 buff_str in
			let res = kw_res kw q in
			let send () = Unix.send_substring conn res 0 (String.length res) [] in
			Unix.clear_nonblock conn;
			ignore (eintr_loop send ()) )

let () =
	let sig_done = (Sys.Signal_handle (fun sig_n -> exit 0)) in
		Sys.set_signal Sys.sigalrm sig_done;
		Sys.set_signal Sys.sigterm sig_done;
		Sys.set_signal Sys.sigint sig_done;
	let addr = (Unix.gethostbyname host).h_addr_list.(0) in
	let sock_ep = Unix.ADDR_INET (addr, port) in
	let sock = tcp_server_bind_listen sock_ep !cli_conn_queue in
	let server () = tcp_server sock conn_handler in
	Unix.handle_unix_error server ()
