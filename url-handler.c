//
// Strict URL-schema-dispatcher binary for browser or similar link-clicky app.
// Intended to filter incoming URLs and only run limited compiled-in list of apps,
//  do it fast, and without an extensive list of external dependencies for this binary,
//  so that it can be easily used in e.g. AppArmor profile.
//
// Build: gcc -O2 -Dh=proto:handler[:...] -o url-handler url-handler.c && strip url-handler
// Run: ./url-handler magnet:some-magnet-link
//
// Note: -Dh=... parameter is the handler-spec of colon-delimeted list of "proto:command" values.
//   Example: -Dh='magnet:/usr/bin/my-torrent-app:irc:xchat:nntp:other-app'
//   Special -Ddebug can be used to enable various debug printf's.
//

#include <unistd.h>
#include <stdio.h>
#include <errno.h>
#include <error.h>
#include <string.h>


#define MAX_LEN_PROTO 20
#define MAX_LEN_HANDLER 200

#ifndef h
#define h ""
#endif
#define _STR(x) #x
#define STR(x) _STR(x)
#define HANDLER_SPEC STR(h)


int usage(char *cmd, int code) {
	fprintf(stderr, "\nUsage: %s protocol:[link]\n", cmd);
	fprintf( stderr,
		"\nOpens specified link according to compiled-in protocol-handler app,\n"
		" passing it exact link as a single argument. No environment scrubbing.\n\n" );
	return code; }


int main(int argc, char **argv) {
	if (argc != 2) return usage(argv[0], 1);
	if (!strcmp(argv[1], "-h") || !strcmp(argv[1], "--help")) return usage(argv[0], 0);
	if (!strchr(argv[1], ':')) return usage(argv[0], 1);

	int err = 0;
	char *arg_schema = strtok(strdup(argv[1]), ":");
	char *arg_link = strtok(NULL, "");
	if (!arg_link) arg_link = "";

#ifdef debug
	printf("- arg_schema: '%s'\n", arg_schema);
	printf("  arg_link: '%s'\n", arg_link);
	printf("  handler_spec: '%s'\n", HANDLER_SPEC);
#endif

	int match;
	char *h_schema, *h_path;
	h_schema = strtok(strdup(HANDLER_SPEC), ":");
	while (1) {
		if (!h_schema) break;
		h_path = strtok(NULL, ":");
		if (!h_path) break;

		match = !strcmp(arg_schema, h_schema);
#ifdef debug
		printf("- - schema: '%s'\n", h_schema);
		printf("    handler: '%s'\n", h_path);
		printf("    arg: '%s'\n", argv[1]);
		printf("    match: %d\n", match);
#endif
		if (!match) { h_schema = strtok(NULL, ":"); continue; }

		execlp(h_path, h_path, argv[1], NULL);
		err = errno;
		break;
	}

	if (err) error(2, err, "ERROR - failed to run URL handler for '%s'", arg_schema);
	fprintf(stderr, "ERROR: no handler for URL schema '%s'\n", arg_schema);
	return 1;
}
