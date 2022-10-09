//// --- JS here MUST be semicolon-ified to work, as it gets auto-squeezed into one line in bookmark ---

// To move those from a separate/unnecessary bookmarks-toolbar:
// - Right-click on empty space in tab bar, set "Bookmarks Toolbar" -> "Only show on New Tabs"
// - "Customize Toolbar..." and drag bookmarks from toolbar to URL bar or such
// - Set "Bookmarks Toolbar" -> "Never Show", tweak bookmarklet names to something short

// Jfx - "fixed" from https://www.arp242.net/bookmarklets.html
// Removes all position=fixed headers/sidebars obstructing stuff
javascript:(() => document.querySelectorAll('*').forEach(e => {
	let p = getComputedStyle(e).getPropertyValue('position');
	if (p === 'fixed' || p === 'sticky') e.style.cssText += ' position: inherit !important' }))()

// Jsel - allows/fixes text selection on silly pages that try to disable it
javascript:(() => {
	document.head.appendChild(Object.assign( document.createElement('style'),
		{type: "text/css", innerHTML: '*, p, div { user-select: text !important; }'} ));
	let efn = () => true, text_inputs = ['text', 'password', 'email', 'number', 'tel', 'url'];
	document.body.querySelectorAll("*").forEach(e => {
		e.onseectstart = e.ondragstart = e.ondrag =
			e.oncontextmenu = e.onmousedown = e.onmouseup = efn;
		if (e.tagName === 'INPUT' && text_inputs.includes(e.type.toLowerCase())) {
			e.removeAttribute("disabled"); e.onkeydown = e.onkeyup = efn } }) })()
