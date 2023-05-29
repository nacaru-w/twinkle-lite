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