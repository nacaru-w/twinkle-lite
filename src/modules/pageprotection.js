import * as utils from "./utils";

let listProtectionOptions = [
	{ code: "protección", name: "Solicitar protección", default: true },
	{ code: "desprotección", name: "Solicitar desprotección" }
]

function getProtectionTypeOptions() {
	let dropDownOptions = [];
	for (let chosenType of listProtectionOptions) {
		let option = { type: 'option', value: chosenType.code, label: chosenType.name, checked: chosenType.default };
		dropDownOptions.push(option);
	}
	return dropDownOptions;
}

let listMotiveOptions = [
	{ name: "Vandalismo" },
	{ name: "SPAM" },
	{ name: "Información falsa o especulativa" },
	{ name: "Guerra de ediciones" },
	{ name: "Otro" }
]

function getMotiveOptions() {
	let dropDownOptions = [];
	for (let motive of listMotiveOptions) {
		let option = { type: 'option', value: motive.name, label: motive.name, checked: motive.default };
		dropDownOptions.push(option);
	}
	return dropDownOptions
}

function protectionFromGetReply(data) {
	let pages = data.query.pages;
	for (let p in pages) {
		let protectionLevel = pages[p].protection[0]?.level
		switch (protectionLevel) {
			case 'sysop':
				return 'solo bibliotecarios';
			case 'autoconfirmed':
				return 'solo usuarios autoconfirmados';
			default:
				return 'sin protección';
		}
	}
}

// Returns the protection status of the page as a string through a query to the mw API
function getProtectionStatus() {
	let params = {
		action: 'query',
		prop: 'info',
		inprop: 'protection',
		titles: utils.currentPageName,
		format: 'json',
	}
	let apiPromise = new mw.Api().get(params);
	let protectionPromise = apiPromise.then(protectionFromGetReply);

	return protectionPromise;
}

function createFormWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
	Window.setScriptName('Twinkle Lite');
	Window.setTitle('Solicitar protección de la página');
	Window.addFooterLink('Política de protección', 'Wikipedia:Política de protección');
	let form = new Morebits.quickForm(submitMessage);
	
	let radioField = form.append({
		type: 'field',
		label: 'Tipo:',
	});

	radioField.append({
		type: 'radio',
		name: 'protection',
		event:
			function (e) {
				let nameToModify = document.querySelector("select[name='motive']")
				if (e.target.value !== "protección") {
					nameToModify.setAttribute('disabled', "")
				} else {
					nameToModify.removeAttribute('disabled', "")
				}
			},
		list: getProtectionTypeOptions()
	})

	form.append({
		type: 'div',
		name: 'currentProtection',
		label: `Nivel actual de protección: `
	})

	let textAreaAndReasonField = form.append({
		type: 'field',
		label: 'Opciones:',
	});

	textAreaAndReasonField.append({
		type: 'select',
		name: 'motive',
		label: 'Selecciona el motivo:',
		list: getMotiveOptions(),
		disabled: false
	});

	textAreaAndReasonField.append({
		type: 'textarea',
		name: 'reason',
		label: 'Desarrolla la razón:',
		tooltip: 'Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente.'
	});
	form.append({
		type: 'submit',
		label: 'Aceptar'
	});

	let result = form.render();
	Window.setContent(result);
	Window.display();

	getProtectionStatus().then(function (protectionLevel) {
		document.querySelector("div[name='currentProtection'] > span.quickformDescription")
			.innerHTML = `Nivel actual de protección:<span style="color:royalblue; font-weight: bold;"> ${protectionLevel} <span>`
	})
}

function submitMessage(e) {
	let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
	if (input.reason === ``) {
		alert("No se ha establecido un motivo.");
	} else {
		if (window.confirm(`¿Quieres solicitar la ${input.protection} del artículo ${utils.currentPageNameWithoutUnderscores}?`)) {
			console.log("Posting message on the noticeboard...");
			utils.createStatusWindow();
			new Morebits.status("Paso 1", `solicitando la ${input.protection} de la página...`, "info");
			new mw.Api().edit(
				"Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Protección_de_artículos/Actual",
				buildEditOnNoticeboard(input)
			)
				.then(function () {
					console.log('Refreshing...');
					new Morebits.status("Finalizado", "actualizando página...", "status");
					setTimeout(() => { location.reload() }, 1500);
				})
		}

	}
}

function buildEditOnNoticeboard(input) {
	let title = `== Solicitud de ${input.protection} de [[${utils.currentPageNameWithoutUnderscores}]] ==`;
	if (input.protection === 'protección') {
		if (input.motive !== 'Otro') {
			title = `== Solicitud de ${input.protection} de [[${utils.currentPageNameWithoutUnderscores}]] por ${input.motive.toLowerCase()} ==`;
		}
	};
	return (revision) => {
		return {
			text: revision.content + `\n
${title} 
;Artículo(s) 
* {{a|${utils.currentPageNameWithoutUnderscores}}}
;Causa 
${input.reason}
; Usuario que lo solicita
* ~~~~ 
;Respuesta
(a rellenar por un bibliotecario)`,
			summary: `Solicitando ${input.protection} de [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]].`,
			minor: false
		}
	}
}

export { createFormWindow };
