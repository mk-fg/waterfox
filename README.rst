waterfox
========

.. contents::
  :backlinks: none

Repository URLs:

- https://github.com/mk-fg/waterfox
- https://codeberg.org/mk-fg/waterfox
- https://fraggod.net/code/git/waterfox



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


new-tab_
````````
.. _new-tab: new-tab

Simple new-tab homepage with some non-eye-burning background image and JS checks
for some parameters in `arkenfox/user.js`_ or similar must-have settings preset,
as well as testing AppArmor or similar confinement (via nativeMessaging_ call).

I install user.js preset as vendor.js, so it'd be easy to diff or override via
user.js as necessary, but if waterfox screws up loading that, it might not be
immediately obvious, and same for LSM profiles, hence these simple checks in
every new tab, where problem would be immediately obvious.

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
you want in all tabs (and not blind you), but that's what seem to work atm
(as of 2019, and still works for me in 2021, but maybe not all-necessary anymore).

fs-access-check binary for confinement-test should be built from fs_access_check.c
(see comments at the top there) and installed along with fs_access_check.json manifest
for nativeMessaging API calls to work - required since FF (rightfully) blocks any
direct file:// access from extensions.

.. _arkenfox/user.js: https://github.com/arkenfox/user.js
.. _nativeMessaging: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Native_messaging
.. _UserContent.css: http://kb.mozillazine.org/index.php?title=UserContent.css
.. _userChrome.css: https://www.userchrome.org/


force-english-language_
```````````````````````
.. _force-english-language: force-english-language

Forces Accept-Language and navigator.language(s) header/js values to identify
browser as using english locale, despite privacy.resistFingerprinting setting
(from e.g. `arkenfox/user.js`_) which hides this data.

Helps to avoid sites presenting themselves in inconsistent languages based on
IP or whatever else by default.

There is languageswitch_ addon which allows to change this lang on-the-fly,
but it doesn't work well with privacy.resistFingerprinting (e.g. only modifies header,
but does not add it), and is a lot more heavyweight than 10 JS lines here.

.. _languageswitch: https://addons.mozilla.org/en-US/firefox/addon/languageswitch/


flush-site-data_
````````````````
.. _flush-site-data: flush-site-data

Adds button/hotkey (default - Alt+C) to flush all cache, cookies, localStorage,
sessionStorage, indexedDB, serviceWorkers and pluginData - i.e. all tracking
stuff that sites store in browser.

Alternative to Ctrl + Shift + Delete firefox hotkey, but without prompting/checkboxes,
and also clearing sessionStorage in all tabs.

It does not clear downloads/history, passwords and form autocomplete data
that is (almost entirely) used in the browser UI, not by websites.

| Does not ask any questions or limits its scope in any way.
| Useful to log out of everything, like closing/reopening private browser window.
|

Looking at other similar extensions, haven't found one that does good-enough cleanup,
which seem to be pretty much this::

  browser.browsingData.remove({}, { cache: true, cookies: true,
      indexedDB: true, localStorage: true, serviceWorkers: true, ... })
    .then(res => browser.tabs.query({}))
    .then(tabs => tabs.forEach(
      tab => browser.tabs.executeScript(tab.id, {code: 'sessionStorage.clear()'}) ))

Most of them limit scope to list of domains derived from active tab,
ignore some stuff like localStorage, cache, indexedDB, or don't bother clearing
sessionStorage in tabs.

Issues 2s notification popup on success, and does console.error() on any failure.

Available on AMO as well: `addons.mozilla.org/flush-site-data`_

.. _addons.mozilla.org/flush-site-data: https://addons.mozilla.org/en-US/firefox/addon/flush-site-data/


bookmark-toolbar-hotkeys_
`````````````````````````
.. _bookmark-toolbar-hotkeys: bookmark-toolbar-hotkeys

Opens corresponding bookmarks or runs bookmarklets from Bookmark Toolbar
(even when hidden) on Alt-F1, Alt-F2, etc keys, configurable via the usual
"Manage Extension Shortcuts".

Same idea as `bookmark-toolbar-shortcut`_ addon, but with support for ``javascript:...``
bookmarklets_ (see `Bookmarklets to deal with annoying designs`_ post for some good examples),
proper error handling/indication (via popup notification),
and an updated manifest to include all permissions required for that.

This addon plus `bookmarklets.js`_ below provide an easy to tweak and use
harness to run small javascript snippets in context of arbitrary pages on-demand,
and can easily replace most of ad-hoc "tweak/style page contents" addons.

.. _bookmark-toolbar-shortcut: https://github.com/nuchi/bookmark-toolbar-shortcut
.. _Bookmarklets to deal with annoying designs: https://www.arp242.net/bookmarklets.html


http-version-icon_
``````````````````
.. _http-version-icon: http-version-icon

Shows tiny h3/h2/spdy/old protocol icon in the URL bar on the right.

Unlike extensions in AMO, it actually checks x-quic header for HTTP/3
(QUIC) detection, that I seem to have here in Waterfox G5.1.4 / 102+ ESR,
and is also much simplier than typical obfuscated layers of JS/TS crap there.

Icons are tiny png files, which can be easily recolored using ImageMagick_
command-line tools, for example, to make all icons yellow::

  % cd http-version-icon
  % cp icons-src/tab-proto-*-{16,32}.png .
  % mogrify -channel R -evaluate set 65535 *.png
  % zip http-version-icon@fraggod.net.xpi *.{png,js,json}

This works by setting 16-bit (0-65535) red (R) color-channel value in all icon files,
on top of current greenish #11EA78 color, producing #FFEA78 yellow result.

To make a "mogrify" command for any other color values you like, following lines can
be used in the python shell (one that pops-up when running ``python`` w/o arguments)::

  >>> c = 17, 234, 120 ; n = (2**16 - 1) / 255
  >>> print(' '.join( f'-channel {c} -evaluate set {v}'
        for c,v in zip('RGB', (round(n*c) for c in c)) ))

That will print mogrify-opts for rgb(17,234,120) color, use e.g.
``c = b'\x11\xEA\x78'`` to easily specify R,G,B channel values from
a hexadecimal notation like #11EA78 instead.

.. _ImageMagick: https://imagemagick.org/


proxy-toggle.local_
```````````````````
.. _proxy-toggle.local: proxy-toggle.local

Icons' tweak for proxy-toggle_ addon, replacing black ones with green/red ones,
depending on whether proxy is enabled/disabled (note - red=enabled).

Useful with any dark background theme, which makes default all-black icons
nearly invisible, plus color-coding is nice.

.. _proxy-toggle: https://addons.mozilla.org/en-US/firefox/addon/proxy-toggle/



Misc helpers
------------

Various useful helper tools, data and configuration snippets.


redirector.ml_
``````````````
.. _redirector.ml: redirector.ml

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
and not too heavy on memory use (~1M), unlike more typical scripts.

Can be compiled with::

  % ocamlopt -o redirector -O2 unix.cmxa str.cmxa redirector.ml
  % strip redirector

Run with -h/--help for info on command-line options.

Supports systemd socket-activation mode to only start on-demand and exit after
specified timeout of inactivity, to avoid hanging around if rarely used
(see ff-redirector.socket + .service in `mk-fg/de-setup repo`_ for unit examples).

.. _OCaml: https://ocaml.org/
.. _mk-fg/de-setup repo: https://github.com/mk-fg/de-setup


url-handler.c_
``````````````
.. _url-handler.c: url-handler.c

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

Being compiled C code, it is a very fast (<1ms) and light wrapper (15K with glibc).

.. _xdg-open: https://wiki.archlinux.org/index.php/Default_Applications
.. _user.js: http://kb.mozillazine.org/User.js_file


bookmarklets.js_
````````````````
.. _bookmarklets.js: bookmarklets.js

Random bookmarklets_ collected from somewhere or ad-hoc made to fix some local issue.

These are basically simple UserJS_ scripts that run on-demand (via button) in
page context to tweak styles or layout, without the hassle of being tied to
specific domains or always running there, potentially slowing stuff down or
breaking things.

Great for a trivial in-page automation ops like "remove all images",
"clear all position=fixed elements" or "make text black/selectable/etc",
and very easy to make and edit on-the-fly for whatever comes to mind.

Other bookmarklet collections that I've come across and borrowed from:

- `alanhogan/bookmarklets`_
- `loikein/geeky-bookmarklet-collection`_
- `squarefree.com/bookmarklets`_

.. _bookmarklets: https://en.wikipedia.org/wiki/Bookmarklet
.. _UserJS: https://openuserjs.org/
.. _alanhogan/bookmarklets: https://github.com/alanhogan/bookmarklets/
.. _loikein/geeky-bookmarklet-collection: https://github.com/loikein/geeky-bookmarklet-collection
.. _squarefree.com/bookmarklets: https://www.squarefree.com/bookmarklets/


Links to some external stuff I also use
---------------------------------------

- ff-cli_ - command-line script to interact with firefox(-ish).

  Allows to do things like list open tabs, bookmarks, compress/decompress
  .mozlz4 files (e.g. ``search.json.mozlz4``) and such.

- `AppArmor profile`_ - always nice to have for complex apps like browsers.

  More restricted than common distro defaults, with no access to /home outside
  of xdg junk dirs, profile and ~/Downloads, no access to devices, as well as
  many other limitations for stuff I don't use myself.

- Local `Waterfox Arch Linux PKGBUILD`_

  | Builds it from .tar.gz release archive, not the humongous and slow git checkout.
  | Can have some local patches/tweaks.

- cgrc_ - systemd-run wrapper for apps that can use some cgroup-limits, like browsers.

  Has a bunch of extra functionality on top of systemd-run and generally usable
  with just a slice + command name, instead of like 20 common/mandatory options
  needed with raw systemd-run interface.

- nbrpc_ - replacement for selective proxy enablement to route around various censorshit.

.. _ff-cli: https://github.com/mk-fg/fgtk#ff-cli
.. _AppArmor profile: https://github.com/mk-fg/apparmor-profiles/blob/master/profiles/waterfox
.. _Waterfox Arch Linux PKGBUILD: https://github.com/mk-fg/archlinux-pkgbuilds/tree/master/waterfox
.. _cgrc: https://github.com/mk-fg/fgtk#cgrc
.. _nbrpc: https://github.com/mk-fg/name-based-routing-policy-controller



Links to other outdated stuff
-----------------------------

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
