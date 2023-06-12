import * as utils from "./utils";

const templateDict = {
	"autotrad": {
		warning: "aviso autotrad",
		description: "uso de automatismo en traducciones de nula calidad"
	},
	"categorizar": {
		warning: "aviso categorizar",
		description: "Artículos sin categorías"
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
				name: 'exampleInput',
				parameter: '1',
				label: 'Nombre del editor'
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
				name: 'exampleInput',
				parameter: '1',
				label: 'Artículo objetivo'
			}
		]
	},
	"globalizar": {
		warning: "aviso globalizar",
		description: "existe sesgo territorial",
		subgroup: [
			{
				type: 'input',
				name: 'exampleInput',
				parameter: '1',
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
				name: 'exampleInput',
				parameter: '1',
				label: 'URL origen del plagio',
				required: true
			}
		]
	},
	"polémico": {
		description: "temas susceptibles a guerras de edición o vandalismo"
	},
	"promocional": {
		code: "promocional",
		description: "texto con marcado carácter publicitario, no neutral. Plantilla de 30 días"
	},
	"publicidad": {
		description: "contenido comercial que defiende proselitismos o propaganda"
	},
	"PVfan": {
		warning: "aviso no neutralidad|2=PVfan",
		description: "escritos poco neutrales, con punto de vista fanático"
	},
	"referencias": {
		warning: "aviso referencias",
		description: "artículos sin una sola referencia"
	},
	"referencias adicionales": {
		code: "aviso referencias",
		description: "artículos con falta de referencias"
	},
	"renombrar": {
		description: "Para proponer un renombrado de una página",
		subgroup: [
			{
				type: 'input',
				name: 'exampleInput',
				parameter: '1',
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
		description: "artículos que no superan umbral de relevancia. Plantilla de 30 días"
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

function linkBuilder(link) {
	let fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`
	return `<a href="${fullLink}" target="_blank">(+)</a>`
}

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

function createFormWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
	Window.setScriptName('Twinkle Lite');
	Window.setTitle('Añadir plantilla');
	Window.addFooterLink('Portal de mantenimiento', 'Portal:Mantenimiento');
	let form = new Morebits.quickForm(submitMessage);

	form.append({
		type: 'input',
		value: '',
		label: 'Búsqueda:',
		id: 'search',
		size: '30',
		event: function quickFilter() {
			const searchInput = document.getElementById("search");
			const allCheckboxDivs = document.querySelectorAll("#checkboxContainer > div");
			if (this.value) {
				// Flushes the list before calling the search query function
				function flushList() {
					for (let i = 0; i < allCheckboxDivs.length; i++) {
						const div = allCheckboxDivs[i];
						div.style.display = 'none';
					}
				}
				// Finds matches for the search query within the checkbox list
				function updateList(searchString) {
					for (let i = 0; i < allCheckboxDivs.length; i++) {
						let checkboxText = allCheckboxDivs[i].childNodes[1].innerText
						if (checkboxText.includes(searchString)) {
							const div = allCheckboxDivs[i];
							div.style.display = '';
						}
					}
				}
				flushList();
				updateList(searchInput.value);
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
				tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador advertiéndole de la colocación de la plantilla"
			}],
	})

	optionsField.append({
		type: 'input',
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
	console.log(input)
	for (const [key, value] of Object.entries(input)) {
		if (value && !key.includes('_param')) {
			templateList.push([key])
		}
	}
	console.log(templateList)
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

	for (const element of templateList) {
		let parameter = templateList[element]?.param ? `|${templateList[element].param}=` : '';
		let parameterValue = templateList[element]?.paramValue || '';
		console.log(`{{${element}${parameter}${parameterValue}}}`);
	}

}

export { createFormWindow };