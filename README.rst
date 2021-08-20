waterfox
========

.. contents::
  :backlinks: none



Description
-----------

Various extensions and hacks that I use with `Mozilla Firefox Browser`_
forks like Waterfox_.

Note that while Firefox is an okay modern browser, I wouldn't recommend using it
in its original form, since same as vanilla Chrome/Chromium, it comes loaded with
various adware and malware, due to commercial interests of parent org (Mozilla).
Would suggest using stripped-down forks like Waterfox_ instead,
or `Ungoogled Chromium`_ in case of Chrome/Chromium.

One important feature of such forks is that they allow tinkering with browser
extensions freely, instead of forcing them to be installed only from "official"
place as-is, locked-down with mandatory centralized signing.

.. _Mozilla Firefox Browser: https://www.mozilla.org/en-US/firefox/new/
.. _Waterfox: https://www.waterfox.net/
.. _Ungoogled Chromium: https://ungoogled-software.github.io/



Extensions and tweaks for them
------------------------------

Any of these can be zipped into xpi like this::

  % cd new-tab
  % zip -r ~/Downloads/new-tab.xpi *

| And then installed by simply opening (Ctrl+O) that file in waterfox.
| This won't work in official FF due to hardcoded mandatory extension signing.
|

All \*.local addon patches are usually just a bunch of overlay/replacement
files, which can be used to replace ones in original .xpi archive.


new-tab
```````

Simple new-tab homepage with some non-eye-burning background image and JS checks
for some parameters in `ghacks user.js`_ or similar must-have sane settings preset
(see `this handy comparison page`_ for more).

I install ghacks as vendor.js, so it'd be easy to diff or override as necessary,
but if waterfox screws up loading that, it might not be immediately obvious,
hence that simple option-check in every new tab.

Main purpose though is to just make new tabs non-white, as whoever thought that
white screen is an acceptable default was (or is) probably blind (by now) :)

Tabs will still momentarily flash white on opening though,
which can be fixed by something like this in `userContent.css`_::

  @-moz-document url-prefix(about:blank) {
    body { background-color:#18343f !important; }
  }

None of this would affect browser-start page btw, which can be changed via
browser.startup.page + browser.startup.homepage in user.js, with latter being set to
something like "moz-extension://a1ae59a3-e618-4e86-441f-7202f3acf593/init.html",
with extension UUID there from about:debugging or such.

Also, `userChrome.css`_ can be used to set bg color of that browser-start page::

  .browserContainer { background-color: #18343f !important; }

Not sure if it has to be this complicated to just have browser display something
you want in all tabs (and not blind you), but that's what seem to work atm.

.. _ghacks user.js: https://github.com/ghacksuserjs/ghacks-user.js/
.. _this handy comparison page: https://jm42.github.io/compare-user.js/
.. _UserContent.css: http://kb.mozillazine.org/index.php?title=UserContent.css
.. _userChrome.css: https://www.userchrome.org/


force-english-language
``````````````````````

Forces Accept-Language and navigator.language(s) header/js values to identify
browser as using english locale, despite privacy.resistFingerprinting setting
(from e.g. `ghacks user.js`_) which hides this data.

Helps to avoid sites presenting themselves in inconsistent languages based on
IP or whatever else by default.

There is languageswitch_ addon which allows to change this lang on-the-fly,
but it doesn't work well with privacy.resistFingerprinting (e.g. only modifies header,
but does not add it), and is a lot more heavyweight than 10 JS lines here.

.. _languageswitch: https://addons.mozilla.org/en-US/firefox/addon/languageswitch/


flush-site-data
```````````````

Adds button/hotkey (default - Alt+C) to flush all cache, cookies, localStorage,
sessionStorage, indexedDB and serviceWorkers data - i.e. all tracking stuff that
sites store in browser.

Alternative to Ctrl + Shift + Delete firefox hotkey, but without prompting/checkboxes,
and also clearing sessionStorage in all tabs, not just history and persistent data.

| Does not ask any questions or limits its scope in any way.
| Useful to log out of everything, like closing/reopening private browser window.
|

Looking at other similar extensions, haven't found one that does good-enough
cleanup, which is literally this::

  browser.browsingData.remove({}, { cache: true, cookies: true,
      indexedDB: true, localStorage: true, serviceWorkers: true })
    .then(res => browser.tabs.query({}))
    .then(tabs => tabs.forEach(
      tab => browser.tabs.executeScript(tab.id, {code: 'sessionStorage.clear()'}) ))

Most of them limit scope to some hacky list of domains derived from active tab,
ignore stuff like localStorage, cache, indexedDB, or don't bother clearing
sessionStorage in tabs.

Issues 2s notification popup on success, and does console.error() on any failure.

Available on AMO as well: `addons.mozilla.org/flush-site-data`_

.. _addons.mozilla.org/flush-site-data: https://addons.mozilla.org/en-US/firefox/addon/flush-site-data/


proxy-toggle.local
``````````````````

Icons' tweak for proxy-toggle_ addon, replacing black ones with green/red ones,
depending on whether proxy is enabled/disabled (note - red=enabled).

Useful with any dark background theme, which makes default all-black icons
nearly invisible, plus color-coding is nice.

.. _proxy-toggle: https://addons.mozilla.org/en-US/firefox/addon/proxy-toggle/



Misc helpers
------------

Various useful helper tools, data and configuration snippets.


redirector.ml
`````````````

Simple liteweight HTTP stub daemon to serve redirects, translating requests with
encoded search queries to proper URLs.

Intended to work around Firefox search plugins' limitation of not allowing
non-encoded search queries, so any URL-building via search keywords is limited
to GET/POST keywords only.

This workaround is to run simple redirector httpd on localhost, so that
e.g. ``gh mk-fg/waterfox`` query in url bar would translate to
``localhost:8080/github-repo/mk-fg%2Fwaterfox`` (note how query gets
url-escaped) and that'd redirect to ``https://github.com/mk-fg/waterfox``
(this repo on github), undoing the query url-escaping in this simple case.

Any kind of more complex shortcut-expanding and URL-making logic can be
added here later as well, limited only by imagination and convenience,
potentially turning firefox search bar into some kind of command line.

Written in OCaml_ to be simple, but relatively fast (native binary)
and liteweight (~1M).

Can be compiled with::

  % ocamlopt -o redirector -O2 unix.cmxa str.cmxa redirector.ml
  % strip redirector

Run with -h/--help for info on command-line options.

Supports systemd socket-activation mode to only start on-demand and exit after
specified timeout of inactivity, to avoid hanging around if rarely used
(see ff-redirector.socket + .service in `mk-fg/de-setup repo`_ for unit examples).

.. _OCaml: https://ocaml.org/
.. _mk-fg/de-setup repo: https://github.com/mk-fg/de-setup


url-handler.c
`````````````

Strict URL-scheme-dispatcher binary for browser or similar link-clicky app.

Intended to be assigned as a handler for e.g. "magnet:" and all other
URL-schemes, to run some specific compiled-in app, depending on scheme in passed
URL, kinda like xdg-open_.

It's especially handy to have single app for all of them with AppArmor and
similar containers, where each external binary would have to be whitelisted.
This one can be assigned with no confinement there, and be reasonably relied
upon to only run list of apps that were compiled-in, with URL as the only arg.

To assign handler app to a protocol in firefox,
first add protocol scheme via about:config or `user.js`_::

  user_pref("network.protocol-handler.expose.magnet", false);

| Now upon clicking that protocol link, FF will ask to specify handler app.
| (can be changed later under "Preferences - General - Applications")
|

Build this handler-wrapper with full list of all necessary handlers,
e.g. "mytorrent" for "magnet:" and "/opt/bin/mail-client" for "mailto:" in this example::

  % gcc -O2 \
    -Dh=magnet:mytorrent:mailto:/opt/bin/mail-client \
    -o url-handler url-handler.c
  % strip url-handler

(there's also an extra -Ddebug option to build it with "verbose mode" and
print additional info on scheme-matching process)

Assign produced binary as a handler for clicked link, and it will run e.g.
``/opt/bin/mail-client mailto:someone@gmail.com`` for all "mailto:" links from now on.

Being compiled C code, it is a very fast (<1ms) and light wrapper (15K).

.. _xdg-open: https://wiki.archlinux.org/index.php/Default_Applications
.. _user.js: http://kb.mozillazine.org/User.js_file



Links to other external stuff
-----------------------------

- `ff_mozlz4`_ - py3 script to decompress .mozlz4 files like ``search.json.mozlz4``.

- `AppArmor profile`_ - always nice to have for complex apps like browsers.

  More restricted than common distro defaults, with no access to /home outside
  of xdg junk dirs, profile and ~/Downloads, no access to devices, as well as
  many other limitations for stuff I don't use myself.

- My `Waterfox-Current Arch Linux PKGBUILD`_

  | Builds it from .tar.gz release archive, not the humongous and slow git checkout.
  | Can have some local patches/tweaks.

- cgrc_ - systemd-run wrapper for apps that can use some cgroup-limits, like browsers.

  Has a bunch of extra functionality on top of systemd-run and generally usable
  with just a slice + command name, instead of like 20 common/mandatory options
  needed with raw systemd-run interface.

.. _ff_mozlz4: https://github.com/mk-fg/fgtk#ff_mozlz4
.. _AppArmor profile: https://github.com/mk-fg/apparmor-profiles/blob/master/profiles/usr.bin.firefox
.. _Waterfox-Current Arch Linux PKGBUILD: https://github.com/mk-fg/archlinux-pkgbuilds/tree/master/waterfox-current
.. _cgrc: https://github.com/mk-fg/fgtk#cgrc



Links to some outdated stuff
----------------------------

Mostly scripts and such that I've used with pre-Quantum Firefox,
which allowed much more customization and had many other diffs in general.

- `ff_backup`_ - browser state tracking script, to auto-commit it into git by cron.

  | For pre-57 firefox only, dumps opened tabs and data for a bunch of old addons.
  | Generally useful for tab-hoarding and extensions with complex configurations/states.

- firefox-homepage-generator_ - old firefox homepage generator.

  Uses profile bookmarks and places dbs plus some other local data to produce
  custom internet-index page with a bunch of links to browse.

  Python2-based, also for old pre-58 FF versions.

- `convergence`_ - fork of abandoned Convergence addon by Moxie Marlinspike.

  Alternative mechanism for TLS cert validation, which uses distributed "network
  perspectives" instead of centralized "certificate authorities".

  "Notaries" (perspective-servers) must all agree on same cert signature for
  IP/host + SNI, which is then cached in local sqlite db (for preformance/privacy)
  and re-validated only when changed.

  Did maintain working client/server setup of it for a few years and used it myself.

  Was pretty good idea with absolutely terrible commercial CAs back in the day,
  but less needed now with Certificate Transparency efforts and Let's Encrypt,
  both mitigating main issues with such centralized model somewhat.

  See `Certificate Pinner`_ addon for a modern, simplier and a bit more manual
  opt-in solution for this task.

.. _ff_backup: https://github.com/mk-fg/fgtk#ff_backup
.. _firefox-homepage-generator: https://github.com/mk-fg/firefox-homepage-generator
.. _convergence: https://github.com/mk-fg/convergence
.. _Certificate Pinner: https://gitlab.com/heurekus/certificate-pinner-for-firefox/
