import * as DeletionRequestMaker from "./modules/deletionrequestmaker";
import * as PageProtection from "./modules/pageprotection";
import * as SpeedyDeletion from "./modules/speedydeletion";
import * as Reports from "./modules/reports";
import * as Tags from "./modules/tags";
import * as Warns from "./modules/warnings"
import * as Hide from "./modules/hide";
import { currentNamespace, currentPageName, currentAction, diffNewId } from "./modules/utils";

if (!window.TwinkleLite) {

	window.TwinkleLite = true;

	function createHideButton() {
		const parentElement = document.querySelector('.mw-diff-undo').parentElement;
		if (parentElement) {
			const hideButton = document.createElement('span');
			const tooltip = "Solicita que esta edición sea ocultada en el TAB";
			hideButton.innerHTML = ` (<a class="TL-hide-button" title="${tooltip}">ocultar</a>)`;
			parentElement.appendChild(hideButton);
			const hideLink = document.querySelector('.TL-hide-button');
			hideLink.addEventListener('click', () => {
				Hide.createFormWindow(diffNewId);
			});
		};
	}

	function createReportButton() {
		const usersNodeList = document.querySelectorAll('a.mw-usertoollinks-talk');
		if (usersNodeList) {
			usersNodeList.forEach(
				(element) => {
					if (element.parentElement.querySelector('a.extiw')) {
						return;
					}
					const newElement = document.createElement('span');
					newElement.textContent = ' · ';
					const elementChild = document.createElement('a')
					elementChild.id = 'report-button';
					elementChild.textContent = 'denunciar';
					elementChild.style.color = '#924141';
					elementChild.addEventListener('click', () => {
						let username;
						// This looks cumbersome but it's the only way to get the right username across both skins and instances
						if (currentPageName == "Especial:PáginasNuevas") {
							username = element.parentElement.parentElement.querySelector('bdi').innerText;
						} else {
							username = element.parentElement.parentElement.parentElement.querySelector('bdi').innerText;
						}
						Reports.createFormWindow(username);
					})
					newElement.append(elementChild);
					element.parentNode.insertBefore(newElement, element.nextSibling);
				}
			)
		}
	}

	function createWarningButton() {
		const usersNodeList = document.querySelectorAll('a.mw-usertoollinks-talk');
		if (usersNodeList) {
			usersNodeList.forEach(
				(element) => {
					if (element.parentElement.querySelector('a.extiw')) {
						return;
					}
					const newElement = document.createElement('span');
					newElement.textContent = ' · ';
					const elementChild = document.createElement('a');
					elementChild.id = 'warning-button';
					elementChild.textContent = 'aviso';
					elementChild.style.color = 'teal';
					elementChild.addEventListener('click', () => {
						// This looks cumbersome but it's the only way to get the right username across all skins and instances
						let username = element.parentElement.parentElement.parentElement.querySelector('bdi').innerText;
						Warns.createFormWindow(username);
					})
					newElement.append(elementChild);
					element.parentNode.insertBefore(newElement, element.nextSibling);
				})
		}
	}

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
			const DRMportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Abrir CDB', 'TL-button', 'Abre una consulta de borrado para esta página');
			if (DRMportletLink) {
				DRMportletLink.onclick = DeletionRequestMaker.createFormWindow;
			}
			const SDportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Borrado rápido', 'TL-button', 'Solicita el borrado rápido de la página');
			if (SDportletLink) {
				SDportletLink.onclick = SpeedyDeletion.createFormWindow;
			}
		}

		if (currentNamespace >= 0) {
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
				WportletLink.onclick = Warns.createFormWindow;
			}
		}

		if (
			currentAction == 'history' ||
			currentPageName == "Especial:Seguimiento" ||
			currentPageName == "Especial:CambiosRecientes" ||
			currentPageName == "Especial:PáginasNuevas" ||
			diffNewId !== null
		) {
			mw.hook('wikipage.content').add(() => {
				if (document.querySelectorAll('a.mw-userlink').length > 0 && !document.getElementById('report-button')) {
					createWarningButton();
					createReportButton();
				}
			})
		}

		if (diffNewId && !document.querySelector('.TL-hide-button')) {
			mw.hook('wikipage.content').add(() => {
				createHideButton();
			})
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
} else {
	console.log('Parece que Twinkle Lite se ha intentado cargar dos veces. Comprueba la configuración para evitar la doble importación del script.');
}

