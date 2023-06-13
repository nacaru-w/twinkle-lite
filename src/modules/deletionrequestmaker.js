import * as utils from "./utils";

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

//Returns a boolean that states whether a spot for the creation of the DR page is available
function canCreateDeletionRequestPage() {
    return utils.isPageMissing(`Wikipedia:Consultas_de_borrado/${utils.currentPageName}`)
}

function getCategoryOptions() {
    let categoryOptions = [];
    for (let category of listOptions) {
        let option = { type: 'option', value: category.code, label: category.name };
        categoryOptions.push(option);
    }
    return categoryOptions;
}

//Creates the window for the form that will later be filled with the pertinent info
function createFormWindow() {
    let Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Consulta de borrado');
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

    let categoryField = form.append({
        type: 'field',
        label: 'Categorías:',
    })

    categoryField.append({
        type: 'select',
        name: 'category',
        label: 'Selecciona la categoría de la página:',
        list: getCategoryOptions()
    });

    form.append({
        type: 'checkbox',
        list:
            [{
                name: "notify",
                value: "notify",
                label: "Notificar al creador de la página",
                checked: true,
                tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador advirtiéndole del posible borrado de su artículo"
            }],
        style: "padding-left: 1em; padding-bottom:0.5em;"
    })

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
        if (window.confirm(`Esto creará una consulta de borrado para el artículo ${utils.currentPageNameWithoutUnderscores}, ¿estás seguro?`)) {
            canCreateDeletionRequestPage()
                .then(function (canMakeNewDeletionRequest) {
                    if (!canMakeNewDeletionRequest) {
                        throw new Error('La página no puede crearse. Ya existe una candidatura en curso o esta se cerró en el pasado.')
                    } else {
                        utils.createStatusWindow()
                        new Morebits.status("Paso 1", "colocando plantilla en la página nominada...", "info");
                        return new mw.Api().edit(
                            utils.currentPageName,
                            buildEditOnNominatedPage
                        );
                    }
                })
                .then(function () {
                    new Morebits.status("Paso 2", "creando la página de discusión de la consulta de borrado...", "info");
                    return createDeletionRequestPage(input.category, input.reason);
                })
                .then(function () {
                    if (!input.notify) return;
                    new Morebits.status("Paso 3", "publicando un mensaje en la página de discusión del creador...", "info");
                    return utils.getCreator().then(postsMessage);
                })
                .then(function () {
                    new Morebits.status("Finalizado", "actualizando página...", "status");
                    setTimeout(() => { location.reload() }, 2000);
                })
                .catch(function () {
                    new Morebits.status("Se ha producido un error", "Comprueba las ediciones realizadas", "error")
                    setTimeout(() => { location.reload() }, 4000);
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
        summary: `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${utils.currentPageName}]] mediante [[WP:Twinke Lite|Twinke Lite]].`,
        minor: false
    };
}

//function that creates the page hosting the deletion request
function createDeletionRequestPage(category, reason) {
    return new mw.Api().create(`Wikipedia:Consultas de borrado/${utils.currentPageName}`,
        { summary: `Creando página de discusión para el borrado de [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinke Lite|Twinke Lite]]` },
        buildDeletionTemplate(category, reason)
    );
}

// Leaves a message on the creator's talk page
function postsMessage(creator) {
    return utils.isPageMissing(`Usuario_discusión:${creator}`)
        .then(function (mustCreateNewTalkPage) {
            if (mustCreateNewTalkPage) {
                return new mw.Api().create(
                    `Usuario_discusión:${creator}`,
                    { summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Twinke Lite|Twinke Lite]]' },
                    `{{sust:Aviso cdb|${utils.currentPageNameWithoutUnderscores}}} ~~~~`
                );
            } else {
                return new mw.Api().edit(
                    `Usuario_discusión:${creator}`,
                    function (revision) {
                        return {
                            text: revision.content + `\n{{sust:Aviso cdb|${utils.currentPageNameWithoutUnderscores}}} ~~~~`,
                            summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Twinke Lite|Twinke Lite]]',
                            minor: false
                        }
                    }
                )
            }
        })
}

export { createFormWindow };