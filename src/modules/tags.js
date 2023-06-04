import * as utils from "./utils";

const templateDict = [
	{
		code: "example",
		description: "This is just an example template",
		subgroup: [
			{
				type: 'input',
				name: 'exampleInput',
				parameter: '1',
				label: 'Example label'
			}
		]
	},
	{
		code: "example2",
		description: "This is just another example",
	},
	{
		code: "example3",
		description: "This is yet something else",
	}
]

const articleDict = [
	{
		code: "autotrad",
		description: "Uso de automatismo en traducciones de nula calidad"
	},
	{
		code: "categorizar",
		description: "Artículos sin categorías"
	},
	{
		code: "contextualizar",
		description: "El tema o ámbito no está claramente redactado"
	},
	{
		code: "complejo",
		description: "Textos difíciles de entender"
	},
	{
		code: "curiosidades",
		description: "Textos con sección de curiosidades"
	},
	{
		code: "desactualizado",
		description: "página con información obsoleta"
	},
	{
		code: "en desarrollo",
		description: "Páginas en construcción o siendo editadas activamente"
	},
	{
		code: "evento actual",
		description: ""
	},
	{
		code: "ficticio",
		description: "Sin enfoque desde un punto de vista real"
	},
	{
		code: "formato de referencias",
		description: "Referencias incorrectas o mal construidas"
	},
	{
		code: "fuente primaria",
		description: "Información no verificable"
	},
	{
		code: "fusionar",
		descripción: "Sugerir una fusión",
		subgroup: [
			{
				type: 'input',
				name: 'exampleInput',
				parameter: '1',
				label: 'Artículo objetivo'
			}
		]
	},
	{
		code: "globalizar",
		description: "Existe sesgo territorial",
		subgroup: [
			{
				type: 'input',
				name: 'exampleInput',
				parameter: '1',
				label: 'Cultura o territorio'
			}
		]
	},
	{
		code: "infraesbozo",
		description: "Contenido insuficiente como para constituir un esbozo de artículo o anexo válido",
	},
	{
		code: "mal traducido",
		description: "Escasa calidad de una traducción de otro idioma"
	},
	{
		code: "mejorar redacción",
		description: "Redacciones que no siguen el manual de estilo"
	},
	{
		code: "no neutralidad",
		description: "Artículos sesgados o claramente decantados en una dirección",
		subgroup: [
			{
				type: 'input',
				name: 'exampleInput',
				parameter: '1',
				label: 'Razón del sesgo',
				tooltip: 'Desarrolla las razones del sesgo. Es importante, también, desarrollarlas exhaustivamente en la PD',
				required: true
			}
		]
	},
	{
		code: "plagio",
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
	{
		code: "polémico",
		description: "Temas susceptibles a guerras de edición o vandalismo"
	},
	{
		code: "promocional",
		description: "Texto con marcado carácter publicitario, no neutral"
	},
	{
		code: "publicidad",
		description: "Contenido comercial que defiende proselitismos o propaganda"
	},
	{
		code: "PVfan",
		description: "Escritos poco neutrales, con punto de vista fanático"
	},
	{
		code: "referencias",
		description: "Artículos sin una sola referencia"
	},
	{
		code: "referencias adicionales",
		description: "Artículos con falta de referencias"
	},
	{
		code: "renombrar",
		description: "Para proponer un renombrado de una página",
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
	{
		code: "revisar traducción",
		description: "texto traducido legible pero necesita un repaso lingüístico"
	},
	{
		code: "wikificar",
		description: "Textos con mal formato o que no cumplen el manual de estilo"
	},
]

const PDDict = [
	{
		code: "discusión protegida",
		description: "PDs protegidas ante edición"
	},
	{
		code: "no es un foro",
		description: "Discusiones con muchas conversaciones irrelevantes"
	},
	{
		code: "página usuario",
		description: "Para páginas de usuario"
	}

]

const userWarnDict = [
	{
		code: "planvad",
		description: "contribuciones vandálicas o altamente perjudiciales",
	}
]

function linkBuilder(link) {
	let fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`
	return `<a href="${fullLink}" target="_blank">(+)</a>`
}

function listBuilder(list) {
	let finalList = [];
	for (let item of list) {
		let template = {};
		template.label = `{{${item.code}}} · ${item.description} ${linkBuilder(item.code)}`
		template.value = item.code
		template.subgroup = "subgroup" in item ? item.subgroup : '';
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

	let result = form.render();
	Window.setContent(result);
	Window.display();
}

function submitMessage(e) {
	let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
}

export { createFormWindow };