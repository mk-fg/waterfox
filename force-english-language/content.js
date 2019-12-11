// Changes navigator.language value to english for js on all opened pages
'use strict'

Object.defineProperty(
	window.navigator.wrappedJSObject,
	'language', {value: 'en'} )
Object.defineProperty(
	window.navigator.wrappedJSObject,
	'languages', {value: cloneInto(['en-US'], window.navigator)} )
