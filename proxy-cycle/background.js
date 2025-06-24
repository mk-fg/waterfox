// Adds button to toggle browser proxy settings between multiple options hardcoded in "proxies" below.
// Based on Proxy Toggle Button addon. Dunno if private-mode warning is still needed.
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/proxy/settings
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/types/BrowserSetting/set
'use strict'

let private_allowed, pn, proxies = [
	{proxyType: 'none'}, // uses default "Proxy is DISABLED" label to match p0.svg
	// {proxyType: 'manual', socks: '127.0.0.1:123', proxyDNS: true, label: 'Local Proxy-A'},
	// {proxyType: 'manual', http: '11.22.33.44:234', httpProxyAll: true, label: 'Remote Proxy-B'},
	// {proxyType: 'system', label: 'System proxy settings from env-vars'},
	// ...
]

let cycle = () => {
	if (private_allowed === false) return browser.notifications.create(null, {
		type: 'basic', priority: 1, iconUrl: 'p0.svg',
		title: 'Allow Proxy Cycle in Private Windows', message:
			'In Firefox 67+, Proxy Toggle needs to be allowed in Private Windows.\n' +
			'Go to Tools > Add-ons > Proxy Cycle, set Run in Private Windows.' })
	browser.proxy.settings.get({}).then(fetched => {
		pn = (pn === undefined ? 0 : pn + 1) % proxies.length
		browser.proxy.settings.set({value: proxies[pn]})
		browser.browserAction.setIcon({path: `p${pn}.svg`})
		browser.browserAction.setTitle({title: proxies[pn].label || (
			!pn ? 'Proxy is DISABLED' : `Enabled proxy: ${pn} / ${proxies.length}` )}) })
}

// Cycle settings on button click
browser.browserAction.onClicked.addListener(cycle)
browser.proxy.settings.clear({}).then(cycle) // will set first "direct" option by default

// Original Proxy Toggle checks "allowed in Private Windows" to set proxy settings in FF 67+, idk if still needed
browser.extension.isAllowedIncognitoAccess().then(value => { private_allowed = value })
