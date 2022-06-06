//<syntaxhighlight lang="javascript">
mw.loader.load( 'https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript' );
mw.loader.load( 'https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css' );

console.log("Loading DeletionRequestMaker");

var listOptions = [
	{ code:'B', name:'Biografías'},
	{ code:'CAT', name:'Categorías'},
	{ code:'D', name:'Deportes y juegos'},
	{ code:'F', name:'Ficción y artes'},
	{ code:'I', name:'Inclasificables'},
	{ code:'L', name:'Lugares y transportes'},
	{ code:'M', name:'Música y medios de comunicación'},
	{ code:'N', name:'Consultas sin clasificar todavía'},
	{ code:'O', name:'Organizaciones, empresas y productos'},
	{ code:'P', name:'Plantillas y userboxes'},
	{ code:'S', name:'Sociedad'},
	{ code:'T', name:'Ciencia y tecnología'},
	{ code:'W', name:'Web e internet'}
];

function getCategoryOptions() {
	var categoryOptions = [];
	for (var category of listOptions){
		var option = {type:'option', value: category.code, label:category.name};
		categoryOptions.push(option);
	}
	return categoryOptions;
}

function createWindow() {
	var Window = new Morebits.simpleWindow(620, 530);
	Window.setTitle('Consulta de borrado');
	Window.setScriptName('Deletion Request Maker');
	Window.addFooterLink('Política de consultas de borrado', 'Wikipedia:Consultas_de_borrado_mediante_argumentación');
	var form = new Morebits.quickForm(submitMessage);
	form.append({
		type: 'textarea',
		name: 'reason',
		label: 'Describe el motivo:'
	});
	form.append({
		type: 'submit',
		label: 'Aceptar'
	});
	form.append({
				type: 'select',
				name: 'category',
				label: 'Selecciona la categoría de la página:',
				list: getCategoryOptions()
			});
	var result = form.render();
	Window.setContent(result);
	Window.display();
}

function submitMessage(e) {
	var form = e.target;
	var input = Morebits.quickForm.getInputData(form);
	if (input.reason === ``) {
		alert("No se ha establecido un motivo.");
	} else {
		alert(buildDeletionTemplate(input.category, input.reason));
		alert(buildEditSummaryMessage(mw.config.get('wgPageName')));
	}
}

function buildDeletionTemplate(category, reason) {
	return `{{sust:cdb2|pg={{sust:SUBPAGENAME}}|cat=${category}|texto=${reason}|{{sust:CURRENTDAY}}|{{sust:CURRENTMONTHNAME}}}} ~~~~`
}

function buildEditSummaryMessage(pagename) {
	return `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${pagename}]] mediante ''DeletionRequestMaker''.`
}

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
	console.log("special or non-existent page");
} else {
	var portletLink = mw.util.addPortletLink( 'p-cactions', '#', 'Ejemplo', 'example-button', 'make an example action' );
	portletLink.onclick = createWindow;
}


//</syntaxhighlight>
