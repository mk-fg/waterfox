'use strict'
window.onload = () => {

// Checks browserSettings.useDocumentFonts == false as an indicator that ghacks vendor.js is loaded.
// This option must not ever make it into user.js or prefs.js for this check to work.
// Alternative check, requiring much more invasive API:
//   https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/privacy
//   browser.privacy.network.networkPredictionEnabled.get({})

let show_fail_banner = c => {
	document.body.classList.add('alert')
	document.body.innerHTML = '<h2>ghacks user.js failed to load, browser is BROKEN</h2>' }

let check_executed = false

let check_ghacks_override = async c => {
	let check = await browser.permissions.contains({'permissions': ['browserSettings']})
	if (check) check = (await browser.browserSettings.useDocumentFonts.get({})).value === false
	check_executed = true
	if (!check) show_fail_banner() }

check_ghacks_override()
setTimeout(t => check_executed || show_fail_banner(), 200)

}
