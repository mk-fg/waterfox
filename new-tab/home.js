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
	// Tries to load random file:// path from local fs which browser shouldn't have access to.
	// Requires fs_access_check.c and fs_access_check.json manifest built/installed as well.
	// fetch(file://...) can't be used here due to https://bugzilla.mozilla.org/show_bug.cgi?id=1487353
	let show_fail_banner = c => {
		document.body.classList.add('alert')
		document.body.innerHTML = '<h2>Browser confinement profile is BROKEN</h2>' }
	let check_executed = false
	let check_fs_access = async c => {
		let check = false;
		try {
			check = await browser.permissions.contains({'permissions': ['nativeMessaging']})
			if (check) check = await browser.runtime.sendNativeMessage('fs_access_check', true)
		} catch (err) { check = false }
		if (check !== true) show_fail_banner()
		check_executed = true }
	setTimeout(t => check_executed || show_fail_banner(), 300)
	check_fs_access() }

window.onload = c => {
	check_ghacks_userjs()
	check_fs_access() }
