waterfox
========

.. contents::
  :backlinks: none



Description
-----------

Various extensions and hacks that I use with `Mozilla Firefox browser`_
forks like Waterfox_.

Note that while Firefox is an modern okay browser, I wouldn't recommend using it
in its original form, as same as vanilla Chrome/Chromium, it comes loaded with
various adware and malware, due to commercial interests of parent org (Mozilla).
So I'd highly recommend always using stripped-down forks like Waterfox_ instead,
or `Ungoogled Chromium`_ in case of Chrome/Chromium.

One important feature of such forks is that they allow tinkering with browser
extensions freely, instead of forcing them to be installed only from "official"
place as-is, locked-down with mandatory centralized signing.

.. _Mozilla Firefox browser: https://www.mozilla.org/en-US/firefox/new/
.. _Waterfox: https://www.waterfox.net/
.. _Ungoogled Chromium: https://ungoogled-software.github.io/



Extensions and tweaks for them
------------------------------

Any of these can be zipped into xpi like this::

  % cd new-tab
  % zip -r ~/Downloads/new-tab.xpi *

| And then installed by simply opening (Ctrl+O) that file in waterfox.
| This won't work in official firefox due to hardcoded mandatory extension signing.
|

All \*.local addon patches are usually just a bunch of overlay/replacement
files, which can be used to replace ones in original .xpi archive.


new-tab
```````

Simple new-tab homepage with some non-eye-burning background image and JS checks
for some parameters in `ghacks user.js`_ or similar must-have sane settings preset
(see `this handy comparison page`_ for more).

I install ghacks as vendor.js, so it'd be easy to diff or override as necessary,
so if waterfox screws up loading that, it might not be immediately obvious,
hence that simple option-check in every new tab.

Main purpose though is to just make new tabs non-white, as whoever thought that
white screen is an acceptable default is/was probably blind (by now) :)

.. _ghacks user.js: https://github.com/ghacksuserjs/ghacks-user.js/
.. _this handy comparison page: https://jm42.github.io/compare-user.js/


proxy-toggle.local
``````````````````

Icons' tweak for `proxy-toggle`_ addon, replacing black ones with green/red
ones, depending on whether proxy is enabled/disabled (note - red=enabled).

Useful with any dark background theme, which makes default icons nearly
invisible, plus color-coding is nice.

.. _proxy-toggle: https://addons.mozilla.org/en-US/firefox/addon/proxy-toggle/


add-custom-search-engine.local
``````````````````````````````

Replacement for `add-custom-search-engine`_ addon, only changing manifest.json
to add keyboard shortcut to be used instead of a button.

Might be in upstream at some point, see `add-custom-search-engine/pull/13`_.

.. _add-custom-search-engine: https://addons.mozilla.org/en-US/firefox/addon/add-custom-search-engine/
.. _add-custom-search-engine/pull/13: https://github.com/evilpie/add-custom-search-engine/pull/13



Misc helpers
------------

Various useful helper code, data and configuration snippets.


redirector.ml
`````````````

Simple liteweight HTTP stub daemon to serve redirects, translating requests with
encoded search queries to proper URLs.

Intended to work around Firefox search plugins' limitation of not allowing
non-encoded search queries, so any URL-building via search keywords is limited
to GET/POST keywords only.

This workaround is to run simple redirector httpd on localhost, which would
translate and redirect e.g. ``/github-repo/mk-fg%2Fwaterfox`` from
"mk-fg/waterfox" query to ``https://github.com/mk-fg/waterfox`` (this repo on github).

Any kind of more complex shortcut-expanding and URL-making logic can be added
here later as well, limited only by imagination and convenience, potentially
turning firefox search bar into some kind of command line.

Written in OCaml_ to be relatively fast and liteweight.

Can be compiled with::

  % ocamlopt -o redirector -O2 unix.cmxa str.cmxa redirector.ml
  % strip redirector

Run with -h/--help for info on command-line options.

.. _OCaml: https://ocaml.org/



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

  | For pre-58 firefox only, dumps opened tabs and data for a bunch of old addons.
  | Generally useful for tab-hoarding and extensions with complex configurations/states.

- `firefox-homepage-generator`_ - old firefox homepage generator.

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

.. _ff_backup: https://github.com/mk-fg/fgtk#ff_backup
.. _firefox-homepage-generator: https://github.com/mk-fg/firefox-homepage-generator
.. _convergence: https://github.com/mk-fg/convergence
