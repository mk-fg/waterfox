'use strict'

// setTimeout in these checks is so that whatever happens (code bugs,
//   exceptions, stopped by browser in some way, etc) - result will be displayed.

let check_ghacks_userjs = c => {
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
		if (!check) show_fail_banner()
		check_executed = true }
	setTimeout(t => check_executed || show_fail_banner(), 200)
	check_ghacks_override() }

let check_fs_access = c => {
	// Tries to load random file:// path from local fs which browser shouldn't have access to
	let show_fail_banner = c => {
		document.body.classList.add('alert')
		document.body.innerHTML = '<h2>Browser confinement profile is BROKEN</h2>' }
	let check_executed = false,
		check_path = '/usr/share/doc/systemd/README'
	let check_fs_access = async c => {
		let res
		try { res = await fetch(`file://${check_path}`) } catch (err) { }
		if (res && (res.ok || res.status)) show_fail_banner()
		check_executed = true }
	setTimeout(t => check_executed || show_fail_banner(), 200)
	check_fs_access() }

window.onload = c => {
	check_ghacks_userjs()
	check_fs_access() }
