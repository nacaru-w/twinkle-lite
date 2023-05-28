import * as utils from "./utils";

const templateDict = [
	{
		code: "{{example}}",
		description: "This is just an example template"
	},
	{
		code: "{{example2}}",
		description: "This is just another example"
	}
]

function listBuilder(searchInput) {
	let filteredList = templateDict.filter(template => {
		const { code, description } = template;
		return code.includes(searchInput) || description.includes(searchInput);
	});
	let finalList = [];
	for (let item of filteredList) {
		let template = {};
		template.label = `${item.code} · ${item.description}`
		template.value = item.code
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
		list: listBuilder("other"),
		label: 'jgvjh'
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