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

function userFromGetReply(data) {
	let pages = data.query.pages,
		p;
	for ( p in pages ) {
		return pages[ p ].revisions[ 0 ].user;
	}
} 

// Returns a promise with the name of the user who created the page
function getCreator() {
	let params = {
		action: 'query',
		prop: 'revisions',
		titles: nominatedPageName,
		rvprop: 'user',
		rvdir: 'newer',
		format: 'json',
		rvlimit: 1,
	}
	let apiPromise = new mw.Api().get(params);
	let userPromise = apiPromise.then(userFromGetReply);

	return userPromise;
}

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
		label: 'Describe el motivo:',
		tooltip: 'Puedes usar wikicódigo en tu descripción, la firma se añadirá automáticamente.'
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
				return createDeletionRequestPage();
            } )
			.then( function () {
				return getCreator().then(postsMessage);
			})
			.then( function () {
				console.log('Refreshing...');
				location.reload();
			});
        }

	}
}

// function that builds the text to be inserted in the new DR page.
function buildDeletionTemplate(category, reason) {
	return `{{sust:cdb2|pg={{sust:SUBPAGENAME}}|cat=${category}|texto=${reason}|{{sust:CURRENTDAY}}|{{sust:CURRENTMONTHNAME}}}} ~~~~`
}

//function that fetches the two functions above and actually adds the text to the article to be submitted to DR.
function buildEditOnNominatedPage(revision) {
    return {
        text: '{{sust:cdb}}' + revision.content,
        summary: `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${nominatedPageName}]] mediante DeletionRequestMaker.`,
        minor: false
    };
}

//function that creates the page hosting the deletion request
//TODO the 'Test' line should later be replaced with buildDeletionTemplate(input.category, input.reason)
function createDeletionRequestPage() {
	return new mw.Api().create('Usuario:Nacaru/Taller/Tests/6', //TODO needs to be substituted with `Wikipedia:Consultas de borrado/${nominatedPageName}` after testing is over
	{ summary: `Creando página de discusión para el borrado de [[${nominatedPageName}]]`},
	'Test'
	);
}

function postsMessage(creator) {
	return new mw.Api().edit(
		`Usuario:${creator}/Taller/Tests/1`, // TODO Needs to be substituted with `Usuario_discusión:${creator}` after testing is over
		function (revision) {
			return {
				text: revision.content + `\n{{sust:Aviso cdb|${nominatedPageName}}} ~~~~`,
				summary: "Aviso al usuario de la apertura de una CDB mediante [[WP:DeletionRequestMaker]]",
				minor: false
				}
			}
		)
}

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
	console.log("special or non-existent page");
} else {
	let portletLink = mw.util.addPortletLink( 'p-cactions', '#', 'Abrir CDB', 'example-button', 'Abre una consulta de borrado para esta página' );
	portletLink.onclick = createWindow;
}


//</syntaxhighlight>
