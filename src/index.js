import * as DeletionRequestMaker from "./modules/deletionrequestmaker";
import * as PageProtection from "./modules/pageprotection";
import * as SpeedyDeletion from "./modules/speedydeletion";

mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript');
mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');

console.log("Loading Twinkle Lite...");

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
	console.log("Special or non-existent page: PP will therefore not be loaded.");
	console.log("Special or non-existent page: DRM will therefore not be loaded.");
	console.log("Special or non-existent page: Speedy deletion will therefore not be loaded.")
} else {
	let DRMportletLink = mw.util.addPortletLink('p-cactions', '#', 'Abrir CDB', 'example-button', 'Abre una consulta de borrado para esta página');
	DRMportletLink.onclick = DeletionRequestMaker.createFormWindow;
	let PPportletLink = mw.util.addPortletLink('p-cactions', '#', 'Pedir protección', 'example-button', 'Solicita que esta página sea protegida');
	PPportletLink.onclick = PageProtection.createFormWindow;
	let SDportletLink = mw.util.addPortletLink('p-cactions', '#', 'Borrado rápido', 'example-button', 'Solicita el borrado rápido de la página');
	SDportletLink.onclick = SpeedyDeletion.createFormWindow;
}

if (mw.config.get('wgNamespaceNumber') != 2 || mw.config.get('wgNamespaceNumber') != 3) {
	console.log("Non-user page: Reports will therefore not be loaded.")
} else {
	let RportletLink = mw.util.addPortletLink('p-cactions', '#', 'Borrado rápido', 'example-button', 'Solicita el borrado rápido de la página');
	RportletLink.onclick = Reports.createFormWindow;
}