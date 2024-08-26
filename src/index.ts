import * as DeletionRequestMaker from "./modules/deletionrequestmaker";
import * as PageProtection from "./modules/pageprotection";
import * as SpeedyDeletion from "./modules/speedydeletion";
import * as Reports from "./modules/reports";
import * as Tags from "./modules/tags";
import * as Warnings from "./modules/warnings"
import * as Hide from "./modules/hide";

import { createButton, createHideButton } from "./DOMutils/DOMutils";
import { currentAction, currentNamespace, currentPageName, diffNewId } from "./modules/utils";

// Let's check first whether the script has been already loaded through global variable
if (!window.IS_TWINKLE_LITE_LOADED) {
	window.IS_TWINKLE_LITE_LOADED = true;

	const loadDependencies = (callback: any) => {
		mw.loader.using(['mediawiki.user', 'mediawiki.util', 'mediawiki.Title', 'jquery.ui', 'mediawiki.api', 'mediawiki.ForeignApi']);
		callback();
	}
	const loadMorebits = (callback: any) => {
		mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript', 'text/javascript');
		mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');
		callback();
	};

	const initializeTwinkleLite = () => {

		if (+currentNamespace >= 0 || mw.config.get('wgArticleId')) {
			const DRMportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Abrir CDB', 'TL-button', 'Abre una consulta de borrado para esta página');
			if (DRMportletLink) {
				DRMportletLink.onclick = DeletionRequestMaker.createFormWindow;
			}
			const SDportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Borrado rápido', 'TL-button', 'Solicita el borrado rápido de la página');
			if (SDportletLink) {
				SDportletLink.onclick = SpeedyDeletion.createFormWindow;
			}
			const PPportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Pedir protección', 'TL-button', 'Solicita que esta página sea protegida');
			if (PPportletLink) {
				PPportletLink.onclick = PageProtection.createFormWindow;
			}
		}

		if (currentNamespace === 0 || currentNamespace === 1 || currentNamespace === 104 || currentNamespace === 105) {
			const TportleltLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Añadir plantilla', 'TL-button', 'Añade una plantilla a la página');
			if (TportleltLink) {
				TportleltLink.onclick = Tags.createFormWindow;
			}
		}

		if (currentNamespace === 2 || currentNamespace === 3 || (mw.config.get('wgPageName').indexOf("Especial:Contribuciones") > -1)) {
			const RportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Denunciar usuario', 'TL-button', 'Informa de un problema en relación con el usuario');
			if (RportletLink) {
				RportletLink.onclick = Reports.createFormWindow;
			}
			const WportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Avisar al usuario', 'TL-button', 'Deja una plantilla de aviso al usuario en su página de discusión');
			if (WportletLink) {
				WportletLink.onclick = Warnings.createFormWindow;
			}
		}

		if (
			currentAction == 'history' ||
			currentPageName == "Especial:Seguimiento" ||
			currentPageName == "Especial:CambiosRecientes" ||
			currentPageName == "Especial:PáginasNuevas" ||
			diffNewId
		) {
			mw.hook('wikipage.content').add(() => {
				if (document.querySelectorAll('a.mw-userlink').length > 0 && !document.getElementById('report-button')) {
					createButton('report-button', 'denunciar', '#924141', Reports.createFormWindow);
					createButton('warning-button', 'aviso', 'teal', Warnings.createFormWindow);
				}
			})
		}

		if (diffNewId && !document.querySelector('.TL-hide-button')) {
			mw.hook('wikipage.content').add(() => {
				createHideButton(Hide.createFormWindow);
			})
		}

		const loadTwinkleLite = () => {
			loadDependencies(() => {
				loadMorebits(() => {
					initializeTwinkleLite();
					console.log("Twinkle Lite cargado");
				});
			})
		};

		console.log("test");
		loadTwinkleLite();
	}

} else {
	console.warn('Parece que Twinkle Lite se ha intentado cargar dos veces. Comprueba la configuración para evitar la doble importación del script.');
}