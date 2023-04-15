// Forces Accept-Language header to a static english value
'use strict'

let accept_language_header = {name: 'Accept-Language', value: 'en, en-US;q=0.8'}
let accept_language_force = e => {
	let headers = e.requestHeaders.filter( h =>
		h.name.toLowerCase() !== "accept-language" )
	headers.push(accept_language_header)
	return {requestHeaders: headers} }

browser.webRequest.onBeforeSendHeaders.addListener(
	accept_language_force, {urls: ['<all_urls>']}, ['blocking', 'requestHeaders'] )
