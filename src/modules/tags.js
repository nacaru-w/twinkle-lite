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

function linkBuilder(link) {
	let fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`
	return `<a href="${fullLink}" target="_blank">(+)</a>`
}

function listBuilder(list) {
	// let filteredList = templateDict.filter(template => {
	// 	const { code, description } = template;
	// 	return code.includes(searchInput) || description.includes(searchInput);
	// });
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
			if (this.value) {
				const searchInput = document.getElementById("search");
				function flushList() {
					const tagWorkArea = document.getElementById("tagWorkArea");
					tagWorkArea.innerHTML = '';

				}
				flushList();
				console.log(searchInput.value);
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