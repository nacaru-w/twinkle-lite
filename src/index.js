import * as DeletionRequestMaker from "./modules/deletionrequestmaker";


mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript');
mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');

console.log("Loading Twinkle Lite...");

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
	console.log("Special or non-existent page: DRM will therefore not be loaded.");
} else {
	let portletLink = mw.util.addPortletLink('p-cactions', '#', 'Abrir CDB', 'example-button', 'Abre una consulta de borrado para esta página');
	portletLink.onclick = DeletionRequestMaker.createFormWindow;

}