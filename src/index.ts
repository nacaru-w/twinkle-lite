import { createDeletionRequestMarkerFormWindow } from "./modules/deletionrequestmaker";
import { createBlockAppealsButton, createButton, createDRCButton, createHideButton } from "./utils/DOMutils";
import { checkIfOpenDR, currentAction, currentNamespace, currentPageName, currentUser, diffNewId, getConfigPage, isCurrentUserSysop } from "./utils/utils";
import { createSpeedyDeletionFormWindow } from "./modules/speedydeletion";
import { createPageProtectionFormWindow } from "./modules/pageprotection";
import { createTagsFormWindow } from "./modules/tags";
import { createReportsFormWindow } from "./modules/reports";
import { createWarningsFormWindow } from "./modules/warnings";
import { createHideFormWindow } from "./modules/hide";
import { createDRCFormWindow } from "./modules/deletionrequestcloser";
import { createFastBlockerButton } from "./modules/fastblocker";
import { createConfigWindow } from "./modules/config";

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

	const initializeTwinkleLite = async () => {
		const settings = await getConfigPage();

		if (+currentNamespace >= 0 || mw.config.get('wgArticleId')) {
			if (settings?.DRMActionsMenuCheckbox ?? true) {
				const DRMportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Abrir CDB', 'TL-button', 'Abre una consulta de borrado para esta página');
				if (DRMportletLink) {
					DRMportletLink.onclick = createDeletionRequestMarkerFormWindow;
				}
			}

			if (settings?.SDActionsMenuCheckbox ?? true) {
				const SDportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Borrado rápido', 'TL-button', 'Solicita el borrado rápido de la página');
				if (SDportletLink) {
					SDportletLink.onclick = createSpeedyDeletionFormWindow;
				}
			}

			if (settings?.PPActionMenuCheckbox ?? true) {
				const PPportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Pedir protección', 'TL-button', 'Solicita que esta página sea protegida');
				if (PPportletLink) {
					PPportletLink.onclick = createPageProtectionFormWindow;
				}
			}
		}

		if (currentNamespace === 0 || currentNamespace === 1 || currentNamespace === 104 || currentNamespace === 105) {
			if (settings?.tagsActionsMenuCheckbox ?? true) {
				const TportleltLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Añadir plantilla', 'TL-button', 'Añade una plantilla a la página');
				if (TportleltLink) {
					TportleltLink.onclick = createTagsFormWindow;
				}
			}
		}

		if (currentNamespace === 2 || currentNamespace === 3 || (mw.config.get('wgPageName').indexOf("Especial:Contribuciones") > -1)) {
			if (settings?.ReportsActionsMenuCheckbox ?? true) {
				const RportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Denunciar usuario', 'TL-button', 'Informa de un problema en relación con el usuario');
				if (RportletLink) {
					RportletLink.onclick = createReportsFormWindow;
				}
			}

			if (settings?.WarningsActionsMenuCheckbox ?? true) {
				const WportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Avisar al usuario', 'TL-button', 'Deja una plantilla de aviso al usuario en su página de discusión');
				if (WportletLink) {
					WportletLink.onclick = createWarningsFormWindow;
				}
			}

			if (settings?.BAButtonMenuCheckbox ?? true) {
				if (/* isCurrentUserSysop && */ currentNamespace === 3 || currentNamespace === 2) {
					const appealRequest = document.querySelector('.block-appeal');
					if (appealRequest) {
						createBlockAppealsButton(appealRequest);
					}
				}
			}
		}

		if (isCurrentUserSysop && currentNamespace == 4 && currentPageName.startsWith('Wikipedia:Consultas_de_borrado/')) {
			const openDeletionRequest = await checkIfOpenDR(currentPageName);
			if (openDeletionRequest) {
				if (settings?.DRCActionsMenuCheckbox ?? true) {
					const DRCportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Cerrar CDB', 'TL-button', 'Cierra esta consulta de borrado');
					if (DRCportletLink) {
						DRCportletLink.onclick = createDRCFormWindow;
					}
				}

				if (settings?.DRCPageMenuCheckbox ?? true) {
					const mwContentElement = document.querySelector('.mw-content-ltr')
					if (mwContentElement) {
						createDRCButton(mwContentElement);
					}
				}
			}
		}

		if (isCurrentUserSysop) {
			if (settings?.FBButtonMenuCheckbox ?? true) {
				createFastBlockerButton();
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
					if (settings?.ReportsUserToolLinksMenuCheckbox ?? true) {
						createButton('report-button', 'denunciar', '#924141', createReportsFormWindow);
					}
					if (settings?.WarningsUserToolLinksMenuCheckbox ?? true) {
						createButton('warning-button', 'aviso', 'teal', createWarningsFormWindow);
					}
				}
			})
		}

		if (diffNewId && !document.querySelector('.TL-hide-button')) {
			mw.hook('wikipage.content').add(() => {
				if (settings?.HideDiffPageCheckbox ?? true) {
					createHideButton(createHideFormWindow);
				}
			})
		}

		if (currentNamespace == 2 && currentPageName.endsWith(currentUser)) {
			const configLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Configuración de TL', 'TL-button', 'Configuración de Twinkle Lite')
			if (configLink) {
				configLink.onclick = () => createConfigWindow(settings);
			}
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