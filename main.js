//<syntaxhighlight lang="javascript">
mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript');
mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');


console.log("Loading Deletion Request Maker...");

let listOptions = [
	{ code: 'B', name: 'Biografías' },
	{ code: 'CAT', name: 'Categorías' },
	{ code: 'D', name: 'Deportes y juegos' },
	{ code: 'F', name: 'Ficción y artes' },
	{ code: 'I', name: 'Inclasificables' },
	{ code: 'L', name: 'Lugares y transportes' },
	{ code: 'M', name: 'Música y medios de comunicación' },
	{ code: 'N', name: 'Consultas sin clasificar todavía' },
	{ code: 'O', name: 'Organizaciones, empresas y productos' },
	{ code: 'P', name: 'Plantillas y userboxes' },
	{ code: 'S', name: 'Sociedad' },
	{ code: 'T', name: 'Ciencia y tecnología' },
	{ code: 'W', name: 'Web e internet' }
];

let nominatedPageName = mw.config.get('wgPageName')
let nominatedPageNameWithoutUnderscores = nominatedPageName.replaceAll('_', ' ')

//Returns a boolean that states whether a spot for the creation of the DR page is available
function canCreateDeletionRequestPage() {
	return isPageMissing(`Wikipedia:Consultas_de_Borrado/${nominatedPageName}`)
}

function isPageMissing(title) {
	let params = {
		action: 'query',
		titles: title,
		prop: 'pageprops',
		format: 'json'
	};
	let apiPromise = new mw.Api().get(params);
	return apiPromise.then(function (data) {
		let result = data.query.pages
		return result.hasOwnProperty("-1")
	});
}

function userFromGetReply(data) {
	let pages = data.query.pages,
		p;
	for (p in pages) {
		return pages[p].revisions[0].user;
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
	for (let category of listOptions) {
		let option = { type: 'option', value: category.code, label: category.name };
		categoryOptions.push(option);
	}
	return categoryOptions;
}

//Creates the window that holds the status messages
function createStatusWindow() {
	let Window = new Morebits.simpleWindow(400, 350);
	Window.setTitle('Procesando acciones');
	let statusdiv = document.createElement('div');
	statusdiv.style.padding = '15px';  // just so it doesn't look broken
	Window.setContent(statusdiv);
	Morebits.status.init(statusdiv);
	Window.display();
}

//Creates the window for the form that will later be filled with the pertinent info
function createFormWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
	Window.setTitle('Consulta de borrado');
	Window.setScriptName('Deletion Request Maker');
	Window.addFooterLink('Política de borrado', 'Wikipedia:Política de borrado');
	let form = new Morebits.quickForm(submitMessage);
	form.append({
		type: 'textarea',
		name: 'reason',
		label: 'Describe el motivo:',
		tooltip: 'Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente.'
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
		if (window.confirm(`Esto creará una consulta de borrado para el artículo ${nominatedPageNameWithoutUnderscores}, ¿estás seguro?`)) {
			console.log('Making sure another DR is not ongoing...');
			canCreateDeletionRequestPage()
				.then(function (canMakeNewDeletionRequest) {
					if (!canMakeNewDeletionRequest) {
						throw new Error('La página no puede crearse. Ya existe una candidatura en curso o esta se cerró en el pasado.')
					} else {
						createStatusWindow()
						new Morebits.status("Paso 1", "colocando plantilla en la página nominada...", "info");
						return new mw.Api().edit(
							nominatedPageName,
							buildEditOnNominatedPage
						);
					}
				})
				.then(function () {
					console.log('Creating deletion request page...');
					new Morebits.status("Paso 2", "creando la página de discusión de la consulta de borrado...", "info");
					return createDeletionRequestPage(input.category, input.reason);
				})
				.then(function () {
					console.log('Dropping a message on the creator\'s talk page...');
					new Morebits.status("Paso 3", "publicando un mensaje en la página de discusión del creador...", "info");
					return getCreator().then(postsMessage);
				})
				.then(function () {
					console.log('Refreshing...');
					new Morebits.status("Finalizado", "actualizando página...", "status");
					setTimeout(() => { location.reload() }, 2000);
				})
				.catch(function (error) {
					console.log('Aborted: nomination page already exists');
					alert(error.message);
				})
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
		text: '{{sust:cdb}}\n' + revision.content,
		summary: `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${nominatedPageName}]] mediante [[WP:Deletion Request Maker|Deletion Request Maker]].`,
		minor: false
	};
}

//function that creates the page hosting the deletion request
function createDeletionRequestPage(category, reason) {
	return new mw.Api().create(`Wikipedia:Consultas de borrado/${nominatedPageName}`,
		{ summary: `Creando página de discusión para el borrado de [[${nominatedPageNameWithoutUnderscores}]] mediante [[WP:Deletion Request Maker|Deletion Request Maker]]` },
		buildDeletionTemplate(category, reason)
	);
}

// Leaves a message on the creator's talk page
function postsMessage(creator) {
	return isPageMissing(`Usuario_discusión:${creator}`)
		.then(function (mustCreateNewTalkPage) {
			if (mustCreateNewTalkPage) {
				return new mw.Api().create(
					`Usuario_discusión:${creator}`,
					{ summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Deletion Request Maker|Deletion Request Maker]]' },
					`{{sust:Aviso cdb|${nominatedPageNameWithoutUnderscores}}} ~~~~`
				);
			} else {
				return new mw.Api().edit(
					`Usuario_discusión:${creator}`,
					function (revision) {
						return {
							text: revision.content + `\n{{sust:Aviso cdb|${nominatedPageNameWithoutUnderscores}}} ~~~~`,
							summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Deletion Request Maker|Deletion Request Maker]]',
							minor: false
						}
					}
				)
			}
		})
}

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
	console.log("Special or non-existent page: DRM will therefore not be loaded.");
} else {
	let portletLink = mw.util.addPortletLink('p-cactions', '#', 'Abrir CDB', 'example-button', 'Abre una consulta de borrado para esta página');
	portletLink.onclick = createFormWindow;
}


//</syntaxhighlight>
