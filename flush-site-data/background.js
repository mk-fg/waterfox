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
		.catch(err => console.error('Site data cleanup FAILED', err)) )
