import * as utils from "./utils";

let Window;

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

function protectionTextBuilder(protectionExpiry) {
	switch (protectionExpiry) {
		case undefined:
			return ''
		case 'infinity':
			return '(protegido para siempre)'
		default:
			return `(hasta el ${utils.parseTimeStamp(protectionExpiry)})`
	}
}


function createFormWindow() {
	Window = new Morebits.simpleWindow(620, 530);
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
		label: `Nivel actual de protección: `,
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
		tooltip: 'Si no se rellena este campo, se utilizará como razón la seleccionada en la lista de motivos (si no se ha seleccionado «otro»). Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente.'
	});
	form.append({
		type: 'submit',
		label: 'Aceptar'
	});

	let result = form.render();
	Window.setContent(result);
	Window.display();

	utils.getProtectionStatus(utils.currentPageName).then(function (protection) {
		// Displays protection level on page
		const showProtection = document.querySelector("div[name='currentProtection'] > span.quickformDescription");
		showProtection.innerHTML = `Nivel actual de protección:<span style="color:royalblue; font-weight: bold;"> ${protection.level} <span style="font-weight: normal;">${protectionTextBuilder(protection.expiry)}</span>`;
		// Disables "unprotect" option if not applicable
		if (protection.level == 'sin protección') {
			let unprotectDiv = document.getElementById('protect').childNodes[1]
			unprotectDiv.firstChild.setAttribute('disabled', '');
		}

	})
}

function submitMessage(e) {
	let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
	if (input.motive == 'Otro' && !input.reason) {
		alert("Se ha seleccionado «Otro» como motivo pero no se ha establecido un motivo.");
	} else {
		let statusWindow = new Morebits.simpleWindow(400, 350);
		utils.createStatusWindow(statusWindow);
		new Morebits.status("Paso 1", `solicitando la ${input.protection} de la página...`, "info");
		new mw.Api().edit(
			"Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Protección_de_artículos/Actual",
			buildEditOnNoticeboard(input)
		)
			.then(function () {
				new Morebits.status("✔️ Finalizado", "cerrando ventana...", "status");
				setTimeout(() => {
					statusWindow.close();
					Window.close();
				}, 2500);
			})
			.catch(function (error) {
				new Morebits.status("❌ Se ha producido un error", "Comprueba las ediciones realizadas", "error");
				console.log(`Error: ${error}`);
			})

	}
}

function buildEditOnNoticeboard(input) {
	let title = `== ${input.protection == "desprotección" ? 'Solicitud de desprotección de ' : ''}[[${utils.currentPageNameWithoutUnderscores}]] ==`;
	return (revision) => {
		return {
			text: revision.content + `\n
${title} 
;Artículo(s) 
* {{a|${utils.currentPageNameWithoutUnderscores}}}
;Causa 
${input.reason ? input.reason : input.motive}
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
