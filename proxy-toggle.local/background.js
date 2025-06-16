// Adds button to toggle browser proxy settings between
//   "System" (typically means "off") and "Manual" (i.e. enabled).
// Based on Proxy Toggle Button addon. Dunno if private-mode warning is still needed.
'use strict'

let privateAllowed

let updateIcon = () => browser.proxy.settings.get({}).then(fetched => {
	let newSetting = fetched.value, enabled = newSetting.proxyType !== 'system'
	browser.browserAction.setIcon({'path': enabled ? 'proxy-on.svg' : 'proxy-off.svg'})
	browser.browserAction.setTitle({ 'title':
		enabled ? 'Proxy is ENABLED, click to disable' : 'Proxy is DISABLED, click to enable' }) })

let toggleProxy = () => {
	if (!privateAllowed) return browser.notifications.create(null, {
		'type': 'basic', 'priority': 1, 'iconUrl': 'proxy-off.svg',
		'title': 'Allow Proxy Toggle in Private Windows', 'message':
			'In Firefox 67+, Proxy Toggle needs to be allowed in Private Windows.\n' +
			'Go to Tools > Add-ons > Proxy Toggle, set Run in Private Windows.' })
	browser.proxy.settings.get({}).then(fetched => {
		let newSetting = fetched.value
		newSetting.proxyType = newSetting.proxyType === 'system' ? 'manual' : 'system'
		browser.proxy.settings.set({'value': newSetting}); updateIcon() }) }

// Toggle on button click
browser.browserAction.onClicked.addListener(toggleProxy)

// See https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/types/BrowserSetting/set
// If debugging as a temp addon, it will reset to the default value (off), rather than the user-set one
browser.proxy.settings.clear({}).then(() => updateIcon())

// Original addon states that it must be allowed in Private Windows to set proxy settings in FF 67+, idk
browser.extension.isAllowedIncognitoAccess().then(value => { privateAllowed = value })
