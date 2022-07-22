import * as utils from './utils';

function createFormWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
	Window.setTitle('Solicitar borrado rápido');
	Window.addFooterLink('Criterios para el borrado rápido', 'Wikipedia:Criterios para el borrado rápido');
	let form = new Morebits.quickForm(submitMessage);


    
	Window.setContent(result);
	Window.display();
}








export { createFormWindow };