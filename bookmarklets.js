//// --- JS here MUST be semicolon-ified to work, as it gets auto-squeezed into one line in bookmark ---

// To move those from a separate/unnecessary bookmarks-toolbar:
// - Right-click on empty space in tab bar, set "Bookmarks Toolbar" -> "Only show on New Tabs"
// - "Customize Toolbar..." and drag bookmarks from toolbar to URL bar or such
// - Set "Bookmarks Toolbar" -> "Never Show", tweak bookmarklet names to something short

// readable and fixed from https://www.arp242.net/bookmarklets.html

// Jfx - "fixed" from https://www.arp242.net/bookmarklets.html
// Removes all position=fixed headers/sidebars obstructing stuff
javascript:(() => document.querySelectorAll('*').forEach(e => {
	let p = getComputedStyle(e).getPropertyValue('position');
	if (p === 'fixed' || p === 'sticky') e.style.cssText += ' position: inherit !important' }))()

// Jcc - "readable" from https://www.arp242.net/bookmarklets.html
// Forces black color instead of gray for good contrast, as a lite alternative to reader mode
javascript:(() => document.querySelectorAll('p, li, div').forEach(e => {
	e.style.color = '#000';
	e.style.font = '500 16px/1.7em sans-serif' }))()
