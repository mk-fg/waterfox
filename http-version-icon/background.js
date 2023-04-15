// Displays tiny h3/h2/spdy/old protocol icon in the URL bar on the right
//
// To tweak icon colors, use this, for example, to make them all red:
//   cp icons-src/tab-proto-*-{16,32}.png . && mogrify -channel R -evaluate add 65535 *.png
// To calc color-offset line, run this in python shell:
//   c = 17, 234, 120 ; n = (2**16 - 1) / 255
//   print(' '.join(f'-channel {c} -evaluate add {v}' for c,v in zip('RGB', (round(n*c) for c in c))))
//
'use strict'

let tab_proto = new Map() // {tab_id: 'h3' / 'h2' / 'spdy', ...}


let http_ver_hdrs = {'x-firefox-http3': 'h3', 'x-firefox-spdy': 'h2'}
let http_ver_desc = { 'h3': 'http/3', 'h2': 'http/2',
	'spdy': 'pre-h2 spdy', 'old': 'old/unrecognized http' }

let http_ver_check = e => {
	if (e.tabId === -1 || e.type !== 'main_frame') return
	let proto = e.statusLine.match(/http\/([23])\./i)
	if (proto) proto = `h${proto[1]}`
	else { // try checking x-firefox-* headers
		proto = Object.fromEntries(
			(e.responseHeaders || []).map( h =>
				[http_ver_hdrs[h.name.toLowerCase()], h.value] ) )
		if (proto.h3) proto = 'h3'
		else if (proto.h2) proto = proto.h2.match(/^h2/) ? 'h2' : 'spdy'
		else proto = 'old' }
	tab_proto.set(e.tabId, proto) }

browser.webRequest.onHeadersReceived
	.addListener(http_ver_check, {urls: ['<all_urls>']}, ['responseHeaders'])


let set_tab_icon = tab_id => {
	let ver = tab_proto.get(tab_id)
	if (!ver) return browser.pageAction.hide(tab_id)
	browser.pageAction.show(tab_id)
	browser.pageAction.setIcon({ tabId: tab_id,
		path: {16: `tab-proto-${ver}-16.png`, 32: `tab-proto-${ver}-32.png`} })
	browser.pageAction.setTitle({tabId: tab_id, title: http_ver_desc[ver] || 'unkown'}) }

browser.webNavigation.onCommitted.addListener(
	e => { if (e.frameId === 0) set_tab_icon(e.tabId) })
browser.tabs.onActivated.addListener(e => set_tab_icon(e.tabId))
browser.tabs.onRemoved.addListener(tabId => tab_proto.delete(tabId))
