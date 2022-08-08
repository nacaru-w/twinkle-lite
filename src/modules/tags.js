import * as utils from "./utils";

function createFormWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
	Window.setTitle('Añadir plantilla');
	Window.addFooterLink('Portal de mantenimiento', 'Portal:Mantenimiento');
	let form = new Morebits.quickForm(submitMessage);

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
}

export { createFormWindow };