//<syntaxhighlight lang="javascript">
mw.loader.load( 'https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript' );
mw.loader.load( 'https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css' );

console.log("Loading DeletionRequestMaker");

let listOptions = [
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

let nominatedPageName = mw.config.get('wgPageName')

function getCategoryOptions() {
	let categoryOptions = [];
	for (let category of listOptions){
		let option = {type:'option', value: category.code, label:category.name};
		categoryOptions.push(option);
	}
	return categoryOptions;
}

function createWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
	Window.setTitle('Consulta de borrado');
	Window.setScriptName('Deletion Request Maker');
	Window.addFooterLink('Política de consultas de borrado', 'Wikipedia:Consultas_de_borrado_mediante_argumentación');
	let form = new Morebits.quickForm(submitMessage);
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
	let result = form.render();
	Window.setContent(result);
	Window.display();
}

function submitMessage(e) {
	let form = e.target;
	let input = Morebits.quickForm.getInputData(form);
	if (input.reason === ``) {
		alert("No se ha establecido un motivo.");
	} else {
        if (window.confirm(`Esto creará una consulta de borrado para el artículo ${nominatedPageName}, ¿estás seguro?`)) {
            new mw.Api().edit(
                nominatedPageName,
                buildEditOnNominatedPage
            )
            .then( function () {
                console.log( 'Saved!' );
				createDeletionRequestPage();
                location.reload();
            } );
        }

	}
}

// function that builds the text to be inserted in the new DR page.
function buildDeletionTemplate(category, reason) {
	return `{{sust:cdb2|pg={{sust:SUBPAGENAME}}|cat=${category}|texto=${reason}|{{sust:CURRENTDAY}}|{{sust:CURRENTMONTHNAME}}}} ~~~~`
}

//function that builds the text for the edit summary.
function buildEditSummaryMessage(pagename) {
	return `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${pagename}]] mediante DeletionRequestMaker.`
}

//function that builds the template text to the article to be submitted to DR at the top of the page.
function addDeletionRequestTemplate(articleContent) {
    return '{{sust:cdb}}' + articleContent;
}

//function that fetches the two functions above and actually adds the text to the article to be submitted to DR.
function buildEditOnNominatedPage(revision) {
    return {
        text: addDeletionRequestTemplate(revision.content),
        summary: buildEditSummaryMessage(nominatedPageName),
        minor: false
    };
}

//function that creates the page hosting the deletion request
//the 'Test' line should later be replaced with buildDeletionTemplate(input.category, input.reason)
function createDeletionRequestPage() {
	new mw.Api().create('Usuario:Nacaru/Taller/Tests/2',
	{ summary: `Creando página de discusión para el borrado de [[${nominatedPageName}]]`},
	'Test'
	);
}

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
	console.log("special or non-existent page");
} else {
	let portletLink = mw.util.addPortletLink( 'p-cactions', '#', 'Abrir CDB', 'example-button', 'make an example action' );
	portletLink.onclick = createWindow;
}


//</syntaxhighlight>
