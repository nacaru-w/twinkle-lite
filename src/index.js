import * as DeletionRequestMaker from "./modules/deletionrequestmaker";
import * as PageProtection from "./modules/pageprotection";
import * as SpeedyDeletion from "./modules/speedydeletion";
import * as Reports from "./modules/reports";
import * as Tags from "./modules/tags";
import * as Warns from "./modules/warnings"
import { currentNamespace } from "./modules/utils";

const loadDependencies = (callback) => {
	mw.loader.using(['mediawiki.user', 'mediawiki.util', 'mediawiki.Title', 'jquery.ui', 'mediawiki.api', 'mediawiki.ForeignApi']);
	callback();
}

const loadMorebits = (callback) => {
	mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript', 'text/javascript');
	mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');
	callback();
};

const initializeTwinkleLite = () => {
	console.log("Loading Twinkle Lite...");

	if (currentNamespace < 0 || !mw.config.get('wgArticleId')) {
		console.log("Special or non-existent page: PP will therefore not be loaded.");
		console.log("Special or non-existent page: DRM will therefore not be loaded.");
		console.log("Special or non-existent page: Speedy deletion will therefore not be loaded.");
	} else {
		const DRMportletLink = mw.util.addPortletLink('p-cactions', '#', 'Abrir CDB', 'example-button', 'Abre una consulta de borrado para esta página');
		DRMportletLink.onclick = DeletionRequestMaker.createFormWindow;
		const PPportletLink = mw.util.addPortletLink('p-cactions', '#', 'Pedir protección', 'example-button', 'Solicita que esta página sea protegida');
		PPportletLink.onclick = PageProtection.createFormWindow;
		const SDportletLink = mw.util.addPortletLink('p-cactions', '#', 'Borrado rápido', 'example-button', 'Solicita el borrado rápido de la página');
		SDportletLink.onclick = SpeedyDeletion.createFormWindow;
	}

	if (currentNamespace === 0 || currentNamespace === 104) {
		const TportleltLink = mw.util.addPortletLink('p-cactions', '#', 'Añadir plantilla', 'example-button', 'Añade una plantilla a la página');
		TportleltLink.onclick = Tags.createFormWindow;
	}

	if (currentNamespace === 2 || currentNamespace === 3 || (mw.config.get('wgPageName').indexOf("Especial:Contribuciones") > -1)) {
		const RportletLink = mw.util.addPortletLink('p-cactions', '#', 'Denunciar usuario', 'example-button', 'Informa de un problema en relación con el usuario');
		RportletLink.onclick = Reports.createFormWindow;
		const WportletLink = mw.util.addPortletLink('p-cactions', '#', 'Avisar al usuario', 'example-button', 'Deja una plantilla de aviso al usuario en su página de discusión');
		WportletLink.onclick = Warns.createFormWindow;
	} else {
		console.log("Non-user page: Reports will therefore not be loaded.");
	}
};

const loadTwinkleLite = () => {
	loadDependencies(() => {
		loadMorebits(() => {
			initializeTwinkleLite();
		});
	})
};

loadTwinkleLite();