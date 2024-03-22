import * as utils from "./utils";

// Declaring the variable that will eventually hold the form window now will allow us to manipulate it more easily  later
let Window;

// This is the dictionary holding the options for the categories deletion requests can be classified as
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

// This function will take the options from the options dictionary and assign them keys that morebits can recognise
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
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Consulta de borrado');
    Window.addFooterLink('Política de consultas de borrado', 'Wikipedia:Consultas de borrado mediante argumentación');
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
        style: "padding-left: 1em;"
    })

    form.append({
        type: 'checkbox',
        list:
            [{
                name: "otherArticles",
                value: "otherArticles",
                label: "Aplicar la CDB a más artículos",
                checked: false,
            }],
        style: "padding-left: 1em; padding-bottom:0.5em;",
        event: (e) => {
            // Morebits' buttons value is in English by default and there is no other way to translate the text that doesn't involve DOM manipulation
            // This fuction will find those values and translate them into Spanish
            const checked = e.target.checked;
            const box = document.getElementById('otherArticleFieldBox');
            if (checked) {
                box.style.display = '';
                const boxAddButton = document.querySelector('input[value="more"]');
                if (boxAddButton) {
                    boxAddButton.value = "añadir";
                    boxAddButton.style.marginTop = '0.3em';
                    boxAddButton.addEventListener('click', () => {
                        const boxRemoveButton = document.querySelector('input[value="remove"]');
                        if (boxRemoveButton) {
                            boxRemoveButton.value = "eliminar";
                            boxRemoveButton.style.marginLeft = '0.3em';
                        }
                    })
                }
            } else {
                box.style.display = 'none';
            }
        }
    })

    form.append({
        type: 'dyninput',
        label: 'Otros artículos a los que aplicar la consulta:',
        sublabel: 'Artículo:',
        name: 'otherArticleFieldBox',
        style: "display: none;",
        id: 'otherArticleFieldBox',
        tooltip: 'Escribe el nombre del artículo sin ningún tipo de wikicódigo'
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
            let statusWindow = new Morebits.simpleWindow(400, 350);
            utils.createStatusWindow(statusWindow);
            new Morebits.status("Paso 1", "comprobando disponibilidad y creando la página de discusión de la consulta de borrado...", "info");
            createDeletionRequestPage(input.category, input.reason)
                .then(function () {
                    new Morebits.status("Paso 2", "colocando plantilla en la(s) página(s) nominada(s)...", "info");
                    return new mw.Api().edit(
                        utils.currentPageName,
                        buildEditOnNominatedPage
                    )
                })
                .then(function () {
                    if (input.otherArticleFieldBox) {
                        const otherArticleArray = Array.from(document.querySelectorAll('input[name="otherArticleFieldBox"]')).map((o) => o.value);
                        for (let article of otherArticleArray) {
                            makeEditOnOtherNominatedPages(article);
                        }
                    }
                })
                .then(function () {
                    if (!input.notify) return;
                    new Morebits.status("Paso 3", "publicando un mensaje en la página de discusión del creador...", "info");
                    return utils.getCreator().then(postsMessage);
                })
                .then(function () {
                    new Morebits.status("✔️ Finalizado", "actualizando página...", "status");
                    setTimeout(() => { location.reload() }, 2000);
                })
                .catch(function () {
                    new Morebits.status("❌ Se ha producido un error", "Comprueba las ediciones realizadas", "error")
                    setTimeout(() => { location.reload() }, 4000);
                })
        }
    }
}

async function makeEditOnOtherNominatedPages(article) {
    await new mw.Api().edit(
        article,
        function (revision) {
            return {
                text: `{{sust:cdb|${utils.currentPageName}}}\n` + revision.content,
                summary: `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${utils.currentPageName}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                minor: false
            }
        }
    )
}

// function that builds the text to be inserted in the new DR page.
function buildDeletionTemplate(category, reason) {
    return `{{sust:cdb2|pg={{sust:SUBPAGENAME}}|cat=${category}|texto=${reason}|{{sust:CURRENTDAY}}|{{sust:CURRENTMONTHNAME}}}} ~~~~`
}

//function that fetches the two functions above and actually adds the text to the article to be submitted to DR.
function buildEditOnNominatedPage(revision) {
    return {
        text: '{{sust:cdb}}\n' + revision.content,
        summary: `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${utils.currentPageName}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
        minor: false
    };
}

//function that creates the page hosting the deletion request
function createDeletionRequestPage(category, reason) {
    return utils.isPageMissing(`Wikipedia:Consultas de borrado/${utils.currentPageName}`)
        .then((isPageMissing) => {
            if (isPageMissing) {
                return new mw.Api().create(`Wikipedia:Consultas de borrado/${utils.currentPageName}`,
                    { summary: `Creando página de discusión para el borrado de [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
                    buildDeletionTemplate(category, reason)
                );
            } else {
                utils.getContent(`Wikipedia:Consultas de borrado/${utils.currentPageName}`).then((content) => {
                    if (content.includes('{{archivo borrar cabecera') || content.includes('{{cierracdb-arr}}')) {
                        if (confirm(`Parece que ya se había creado una consulta de borrado para ${utils.currentPageNameWithoutUnderscores} cuyo resultado fue MANTENER. ¿Quieres abrir una segunda consulta?`)) {
                            return new mw.Api().create(
                                `Wikipedia:Consultas de borrado/${utils.currentPageName}_(segunda_consulta)`,
                                { summary: `Creando página de discusión para el borrado de [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
                                buildDeletionTemplate(category, reason))
                        } else {
                            new Morebits.status("Proceso interrumpido", "acción abortada por el usuario... actualizando página", "error")
                            setTimeout(() => { location.reload() }, 4000);
                        }
                    } else {
                        alert('Parece que ya existe una consulta en curso')
                        new Morebits.status("Proceso interrumpido", "ya existe una consulta en curso", "error");
                        setTimeout(() => { location.reload() }, 4000);
                    }
                })
            }
        })

}

// Leaves a message on the creator's talk page, if the page has not been created yet, it will do that
function postsMessage(creator) {
    return utils.isPageMissing(`Usuario_discusión:${creator}`)
        .then(function (mustCreateNewTalkPage) {
            if (mustCreateNewTalkPage) {
                return new mw.Api().create(
                    `Usuario_discusión:${creator}`,
                    { summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Twinkle Lite|Twinkle Lite]]' },
                    `{{sust:Aviso cdb|${utils.currentPageNameWithoutUnderscores}}} ~~~~`
                );
            } else {
                return new mw.Api().edit(
                    `Usuario_discusión:${creator}`,
                    function (revision) {
                        return {
                            text: revision.content + `\n{{sust:Aviso cdb|${utils.currentPageNameWithoutUnderscores}}} ~~~~`,
                            summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Twinkle Lite|Twinkle Lite]]',
                            minor: false
                        }
                    }
                )
            }
        })
}

export { createFormWindow };