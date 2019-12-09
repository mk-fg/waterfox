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


Extensions and tweaks to them
-----------------------------

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
