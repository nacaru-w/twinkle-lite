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
		id: 'protect',
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

	utils.getProtectionStatus(utils.currentPageName).then(function (protectionLevel) {
		// Displays protection level on page
		let showProtection = document.querySelector("div[name='currentProtection'] > span.quickformDescription");
		showProtection.innerHTML = `Nivel actual de protección:<span style="color:royalblue; font-weight: bold;"> ${protectionLevel} <span>`
		// Disables "unprotect" option if not applicable
		if (protectionLevel == 'sin protección') {
			let unprotectDiv = document.getElementById('protect').childNodes[1]
			unprotectDiv.firstChild.setAttribute('disabled', '');
		}

	})
}

function submitMessage(e) {
	let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
	if (input.reason === ``) {
		alert("No se ha establecido un motivo.");
	} else {
		utils.createStatusWindow();
		new Morebits.status("Paso 1", `solicitando la ${input.protection} de la página...`, "info");
		new mw.Api().edit(
			"Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Protección_de_artículos/Actual",
			buildEditOnNoticeboard(input)
		)
			.then(function () {
				new Morebits.status("Finalizado", "actualizando página...", "status");
				setTimeout(() => { location.reload() }, 1500);
			})
			.catch(function () {
				new Morebits.status("Se ha producido un error", "Comprueba las ediciones realizadas", "error")
				setTimeout(() => { location.reload() }, 4000);
			})

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
			summary: `Solicitando ${input.protection} de [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
			minor: false
		}
	}
}

export { createFormWindow };
