import { createDeletionRequestMarkerFormWindow } from "./modules/deletionrequestmaker";
import { createBlockAppealsButton, createButton, createHideButton } from "./utils/DOMutils";
import { currentAction, currentNamespace, currentPageName, diffNewId } from "./utils/utils";
import { createSpeedyDeletionFormWindow } from "./modules/speedydeletion";
import { createPageProtectionFormWindow } from "./modules/pageprotection";
import { createTagsFormWindow } from "./modules/tags";
import { createReportsFormWindow } from "./modules/reports";
import { createWarningsFormWindow } from "./modules/warnings";
import { createHideFormWindow } from "./modules/hide";
import { createDRCFormWindow } from "./modules/deletionrequestcloser";

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
				DRMportletLink.onclick = createDeletionRequestMarkerFormWindow;
			}
			const SDportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Borrado rápido', 'TL-button', 'Solicita el borrado rápido de la página');
			if (SDportletLink) {
				SDportletLink.onclick = createSpeedyDeletionFormWindow;
			}
			const PPportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Pedir protección', 'TL-button', 'Solicita que esta página sea protegida');
			if (PPportletLink) {
				PPportletLink.onclick = createPageProtectionFormWindow;
			}
			const DRCportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Cerrar CDB', 'TL-button', 'Cierra esta consulta de borrado');
			if (DRCportletLink) {
				// TODO: should also check if user is sysop
				DRCportletLink.onclick = createDRCFormWindow;
			}
		}

		if (currentNamespace === 0 || currentNamespace === 1 || currentNamespace === 104 || currentNamespace === 105) {
			const TportleltLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Añadir plantilla', 'TL-button', 'Añade una plantilla a la página');
			if (TportleltLink) {
				TportleltLink.onclick = createTagsFormWindow;
			}
		}

		if (currentNamespace === 2 || currentNamespace === 3 || (mw.config.get('wgPageName').indexOf("Especial:Contribuciones") > -1)) {
			const RportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Denunciar usuario', 'TL-button', 'Informa de un problema en relación con el usuario');
			if (RportletLink) {
				RportletLink.onclick = createReportsFormWindow;
			}
			const WportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Avisar al usuario', 'TL-button', 'Deja una plantilla de aviso al usuario en su página de discusión');
			if (WportletLink) {
				WportletLink.onclick = createWarningsFormWindow;
			}

			if (currentNamespace === 3) {
				const appealRequest = document.querySelector('.block-appeal');
				if (appealRequest) {
					// TODO: should also check if user is sysop
					createBlockAppealsButton(appealRequest);
				}
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
					createButton('report-button', 'denunciar', '#924141', createReportsFormWindow);
					createButton('warning-button', 'aviso', 'teal', createWarningsFormWindow);
				}
			})
		}

		if (diffNewId && !document.querySelector('.TL-hide-button')) {
			mw.hook('wikipage.content').add(() => {
				createHideButton(createHideFormWindow);
			})
		}

	};

	const loadTwinkleLite = () => {
		loadDependencies(() => {
			loadMorebits(() => {
				initializeTwinkleLite();
				console.log("Twinkle Lite cargado");
			});
		})
	};

	loadTwinkleLite();

} else {
	console.warn('Parece que Twinkle Lite se ha intentado cargar dos veces. Comprueba la configuración para evitar la doble importación del script.');
}