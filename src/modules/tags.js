// ** Tags module **
// Allows users to add a tag in articles. The tag can be selected as part of a series of options of a checkbox list

import * as utils from "./utils";

// Dictionary that stores the templates, the description, as well as the parameter and the name of the warning template if any of them is applicable
// Template parameters are set in the subgroup, specifically in the 'name' key, their syntax is as follows:
// `_param-parent template name-parameter identifier`
// If the parameter doesn't have an identifier, then just type a «1»

const templateDict = {
	"autotrad": {
		warning: "aviso autotrad",
		description: "uso de automatismo en traducciones de nula calidad"
	},
	"bulo": {
		warning: "aviso destruir|2=bulo",
		description: "páginas falsas que constituyen bulos o hoax"
	},
	"categorizar": {
		warning: "aviso categorizar",
		description: "artículos sin categorías"
	},
	"CDI": {
		warning: "aviso conflicto de interés",
		description: "escrita bajo conflicto de interés"
	},
	"categorizar": {
		warning: "aviso categorizar",
		description: "artículos que no poseen categorías"
	},
	"contextualizar": {
		warning: "aviso contextualizar",
		description: "el tema o ámbito no está claramente redactado. Plantilla de 30 días."
	},
	"complejo": {
		description: "textos difíciles de entender"
	},
	"copyedit": {
		warning: "aviso copyedit",
		description: "necesita una revisión de ortografía y gramática"
	},
	"curiosidades": {
		description: "textos con sección de curiosidades"
	},
	"desactualizado": {
		description: "página con información obsoleta"
	},
	"en desarrollo": {
		description: "páginas en construcción o siendo editadas activamente",
		subgroup: [
			{
				type: 'input',
				name: '_param-en desarrollo-1',
				label: 'Nombre del editor',
				tooltip: 'Escribe el nombre del usuario que está desarrollando el artículo, no utilices ningún tipo de Wikicódigo'
			}
		]
	},
	"evento actual": {
		description: "artículos de actualidad cuya información es susceptible a cambiar"
	},
	"excesivamente detallado": {
		description: "demasiada información sobre temas triviales"
	},
	"experto": {
		description: "artículos muy técnicos con deficiencias de contenido solo corregibles por un experto"
	},
	"ficticio": {
		description: "sin enfoque desde un punto de vista real"
	},
	"formato de referencias": {
		warning: "aviso formato de referencias",
		description: "referencias incorrectas o mal construidas"
	},
	"fuente primaria": {
		warning: "aviso fuente primaria",
		description: "información no verificable. Plantilla de 30 días."
	},
	"fuentes no fiables": {
		description: "referencias que no siguen la política de fuentes fiables"
	},
	"fusionar": {
		description: "sugerir una fusión",
		subgroup: [
			{
				type: 'input',
				name: '_param-fusionar-1',
				label: 'Artículo objetivo',
				tooltip: 'Escribe el nombre del artículo con el que quieres fusionar esta página. No uses Wikicódigo.'
			}
		]
	},
	"globalizar": {
		warning: "aviso globalizar",
		description: "existe sesgo territorial",
		subgroup: [
			{
				type: 'input',
				name: '_param-globalizar-1',
				label: 'Cultura o territorio del sesgo'
			}
		]
	},
	"infraesbozo": {
		warning: "aviso infraesbozo",
		description: "contenido insuficiente como para constituir un esbozo de artículo o anexo válido. Plantilla de 30 días",
	},
	"largo": {
		description: "artículos excesivamente largos que deberían subdividirse en varios"
	},
	"mal traducido": {
		warning: "aviso mal traducido",
		description: "escasa calidad de una traducción de otro idioma"
	},
	"mejorar redacción": {
		description: "redacciones que no siguen el manual de estilo"
	},
	"no neutralidad": {
		warning: "aviso no neutralidad",
		description: "artículos sesgados o claramente decantados en una dirección",
		subgroup: [
			{
				type: 'input',
				name: `_param-no neutralidad-motivo`,
				label: 'Razón del sesgo',
				tooltip: 'Describe brevemente la razón del sesgo. Es importante, también, desarrollarla más exhaustivamente en la PD',
				required: true
			}
		]
	},
	"plagio": {
		warning: "aviso destruir|2=plagio",
		description: "artículos copiados, que violan derechos de autor",
		subgroup: [
			{
				type: 'input',
				name: '_param-plagio-1',
				label: 'URL origen del plagio',
				tooltip: 'Copia y pega aquí la URL de la página externa en la que se halla el texto original',
				required: true
			}
		]
	},
	"polémico": {
		description: "temas susceptibles a guerras de edición o vandalismo"
	},
	// "pr": {
	// 	description: "para atribuir el artículo a un wikiproyecto",
	// 	subgroup: [
	// 		{
	// 			type: 'input',
	// 			name: '_param-pr-1',
	// 			label: 'Nombre del wikiproyecto',
	// 			tooltip: 'Escribe aquí el nombre del Wikiproyecto (esta plantilla se coloca en la PD automáticamente)',
	//			required: true
	// 		}
	// 	]
	// },
	"promocional": {
		warning: "aviso promocional",
		description: "texto con marcado carácter publicitario, no neutral. Plantilla de 30 días",
		subgroup: [
			{
				type: 'input',
				name: '_param-promocional-motivo',
				label: 'Motivo (opcional)',
				tooltip: 'Rellena este campo para especificar el motivo por el que se ha colocado la plantilla',
				required: false
			}
		]
	},
	"publicidad": {
		description: "contenido comercial que defiende proselitismos o propaganda"
	},
	"pvfan": {
		warning: "aviso no neutralidad|2=PVfan",
		description: "escritos poco neutrales, con punto de vista fanático"
	},
	"referencias": {
		warning: "aviso referencias",
		description: "artículos sin una sola referencia"
	},
	"referencias adicionales": {
		warning: "aviso referencias",
		description: "artículos con falta de referencias"
	},
	"renombrar": {
		description: "Para proponer un renombrado de una página",
		subgroup: [
			{
				type: 'input',
				name: '_param-renombrar-1',
				label: 'Nuevo nombre sugerido',
				required: true
			}
		]
	},
	"revisar traducción": {
		description: "texto traducido legible pero necesita un repaso lingüístico"
	},
	"sin relevancia": {
		warning: "aviso sin relevancia",
		description: "artículos que no superan umbral de relevancia. Plantilla de 30 días",
		subgroup: [
			{
				type: 'input',
				name: '_param-sin relevancia-motivo',
				label: 'Motivo (opcional)',
				tooltip: 'Rellena este campo para especificar el motivo por el que se ha colocado la plantilla',
				required: false
			}
		]
	},
	"traducción": {
		description: "artículos que se están traduciendo desde otro idioma",
		subgroup: [
			{
				type: 'input',
				name: '_param-traducción-ci',
				label: 'Código ISO del idioma (opcional)',
				tooltip: 'Añade el código ISO del idioma del que procede la traducción. Ejemplo: «en» para artículos que proceden de la Wikipedia en inglés o «fr» si vienen de frwiki',
				required: false
			}
		]
	},
	"traducción incompleta": {
		warning: "aviso traducción incompleta",
		description: "artículos que han sido traducidos solo parcialmente"
	},
	"wikificar": {
		warning: "aviso wikificar",
		description: "textos con mal formato o que no cumplen el manual de estilo"
	}
}

// Builds the link to be displayed in each checkbox description
function linkBuilder(link) {
	let fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`
	return `<a href="${fullLink}" target="_blank">(+)</a>`
}

// Builds the list to be passed as parameter to the Morebits function that creates the box holding all the options
// The data is gathered from the dictionary
function listBuilder(list) {
	let finalList = [];
	for (let item in list) {
		let template = {};
		template.name = item
		template.value = item
		template.label = `{{${item}}} · ${list[item].description} ${linkBuilder(item)}`
		template.subgroup = list[item]?.subgroup ? list[item].subgroup : '';
		finalList.push(template)
	}
	return finalList;
}

// Creates the Morebits window holding the form
function createFormWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
	Window.setScriptName('Twinkle Lite');
	Window.setTitle('Añadir plantilla');
	Window.addFooterLink('Portal de mantenimiento', 'Portal:Mantenimiento');
	let form = new Morebits.quickForm(submitMessage);

	form.append({
		type: 'input',
		value: '',
		name: 'search',
		label: 'Búsqueda:',
		id: 'search',
		size: '30',
		event: function quickFilter() {
			const searchInput = document.getElementById("search");
			const allCheckboxDivs = document.querySelectorAll("#checkboxContainer > div");
			if (this.value) {
				// Flushes the list before calling the search query function, then does it as a callback so that it happens in the right order
				function flushList(callback) {
					for (let i = 0; i < allCheckboxDivs.length; i++) {
						const div = allCheckboxDivs[i];
						div.style.display = 'none';
					}
					callback();
				}
				// Finds matches for the search query within the checkbox list
				function updateList(searchString) {
					for (let i = 0; i < allCheckboxDivs.length; i++) {
						let checkboxText = allCheckboxDivs[i].childNodes[1].innerText
						if (checkboxText.includes(searchString.toLowerCase()) || checkboxText.includes(searchString.toUpperCase())) {
							const div = allCheckboxDivs[i];
							div.style.display = '';
						}
					}
				}
				flushList(() => updateList(searchInput.value));
			}
			// Retrieves the full list if nothing is on the search input box
			if (this.value.length == 0) {
				for (let i = 0; i < allCheckboxDivs.length; i++) {
					const div = allCheckboxDivs[i];
					div.style.display = '';
				}
			}
		}
	})

	let optionBox = form.append({
		type: 'div',
		id: 'tagWorkArea',
		className: 'morebits-scrollbox',
		style: 'max-height: 28em; min-height: 0.5em;'
	})

	optionBox.append({
		type: 'checkbox',
		id: 'checkboxContainer',
		list: listBuilder(templateDict),
		label: 'checkOption'
	})

	let optionsField = form.append({
		type: 'field',
		label: 'Opciones:'
	})

	optionsField.append({
		type: 'checkbox',
		list:
			[{
				name: "notify",
				value: "notify",
				label: "Notificar al creador de la página si es posible",
				checked: false,
				tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador del artículo advertiéndole de la colocación de la plantilla"
			}],
	})

	optionsField.append({
		type: 'input',
		name: 'reason',
		label: 'Razón:',
		tooltip: '(Opcional) Escribe aquí el resumen de edición explicando la razón por la que se ha añadido la plantilla',
		style: 'width: 80%; margin-top: 0.5em;'
	})

	form.append({
		type: 'submit',
		label: 'Aceptar'
	});

	let result = form.render();
	Window.setContent(result);
	Window.display();
}

function submitMessage(e) {
	let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
	let templateList = [];

	// First let's tidy up Morebit's array
	for (const [key, value] of Object.entries(input)) {
		if (value && !key.includes('_param') && key != 'notify' && key != 'reason' && key != 'search') {
			templateList.push([key])
		}
	}

	// Then we will assign each parameter to their corresponding value and make it accessible
	for (const element of templateList) {
		for (const [key, value] of Object.entries(input)) {
			if (key.includes('_param') && key.includes(element)) {
				templateList[element] = {
					"param": key.split('-').pop(),
					"paramValue": value
				}
			}
		}
	}

	utils.createStatusWindow();
	new Morebits.status("Paso 1", `generando plantilla...`, "info");
	new mw.Api().edit(
		utils.currentPageName,
		function (revision) {
			return {
				text: templateBuilder(templateList) + revision.content,
				summary: `Añadiendo plantilla mediante [[WP:TL|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}`,
				minor: false
			}
		})
		.then(function () {
			if (!input.notify) return;
			return utils.getCreator().then(postsMessage(templateList));
		})
		.then(function () {
			new Morebits.status("Finalizado", "actualizando página...", "status");
			setTimeout(() => { location.reload() }, 2000);
		})
		.catch(function () {
			new Morebits.status("Se ha producido un error", "Comprueba las ediciones realizadas", "error")
			setTimeout(() => { location.reload() }, 4000);
		})



}

function templateBuilder(list) {
	let finalString = '';
	for (const element of list) {
		let parameter = list[element]?.param ? `|${list[element].param}=` : '';
		let parameterValue = list[element]?.paramValue || '';
		finalString += `{{sust:${element}${parameter}${parameterValue}}}\n`;
	}
	return finalString;
}

function allWarnings(list) {
	let finalString = ''
	for (let template of list) {
		if (templateDict[template]?.warning) {
			finalString += `{{sust:${templateDict[template].warning}|${utils.currentPageNameWithoutUnderscores}}} ~~~~\n`
		}
	}
	return finalString
}

function postsMessage(templateList) {
	return (creator) => {
		if (creator == utils.currentUser) {
			return;
		} else {
			new Morebits.status("Paso 2", "publicando un mensaje de aviso en la página de discusión del creador (si es posible)...", "info");
			return utils.isPageMissing(`Usuario_discusión:${creator}`)
				.then(function (mustCreateNewTalkPage) {
					const templates = allWarnings(templateList);
					if (!templates) {
						return;
					}
					if (mustCreateNewTalkPage) {
						return new mw.Api().create(
							`Usuario_discusión:${creator}`,
							{ summary: `Aviso al usuario de la colocación de una plantilla en [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
							`${templates}`
						);
					} else {
						return new mw.Api().edit(
							`Usuario_discusión:${creator}`,
							function (revision) {
								return {
									text: revision.content + `\n${templates}`,
									summary: `Aviso al usuario de la colocación de una plantilla en [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
									minor: false
								}
							}
						)
					}
				})
		}
	}
}

export { createFormWindow };