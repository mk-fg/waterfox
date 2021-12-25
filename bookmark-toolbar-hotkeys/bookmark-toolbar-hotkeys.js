'use strict';

browser.commands.onCommand.addListener(command => {
	let bm_n = command.split('-').pop(), bm_idx = bm_n - 1

	Promise.all([
			browser.windows.getCurrent()
				.then(w => browser.tabs.query({active: true, windowId: w.id})),
			browser.bookmarks.getChildren('toolbar_____')
				.then(bms => bm_idx < bms.length && bms[bm_idx].url) ])

		.then(([[tab], url]) => {
			if (!url) throw `Could not get bookmark toolbar URL with index=${bm_idx}`
			url.match(/^javascript:/) ?
				browser.tabs.executeScript(tab.id, {code: url.slice(11)}) :
				browser.tabs.update(tab.id, {url: url}) })

		.catch(err => browser.notifications.create(null, { 'type': 'basic', 'priority': 1,
			'title': `Bookmark Hotkey ${bm_n} failed to work`, 'message': `ERROR: ${err}` }))
})
