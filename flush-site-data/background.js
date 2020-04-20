'use strict';

browser.browserAction.onClicked.addListener(
	ev => browser.browsingData.remove( {},
			{cache: true, cookies: true, indexedDB: true, localStorage: true, serviceWorkers: true} )
		.then(res => browser.tabs.query({}))
		.then(tabs => tabs.forEach(
			tab => browser.tabs.executeScript(tab.id, {code: 'sessionStorage.clear()'}) ))

		.then(res => browser.notifications.create( null,
			{ 'type': 'basic', 'priority': 1, 'iconUrl': 'icon.svg',
				'title': 'Site data cleanup success',
				'message': 'Flushed stored data and sessionStorage in all tabs' } ))
		.then(note_id => new Promise(resolve => setTimeout(resolve, 2000, note_id)))
		.then(note_id => browser.notifications.clear(note_id))

		.catch(err => console.error('Site data cleanup FAILED', err)) )
