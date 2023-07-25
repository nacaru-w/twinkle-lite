// ** Warn module **
// Posts a warning message on a user discussion page that can be selected as part of a series of options of a checkbox list

import * as utils from "./utils";

const warnedUser = mw.config.get('wgRelevantUserName');

const templateDict = {
    "aviso prueba1": {
        description: "Usuarios que han realizado ediciones no apropiadas",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso prueba 1-1',
                label: 'Artículo en el que se realizó la edición',
                tooltip: 'Escribe el nombre del artículo en el que se cometió la prueba de edición. No uses corchetes'
            }
        ]
    },
    "aviso prueba2": {
        description: "Usuarios que han realizado ediciones vandálicas",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso prueba 2-1',
                label: 'Artículo en el que se realizó el vandalismo',
                tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes'
            }
        ]
    },
    "aviso prueba3": {
        description: "asdlasdjkna"
    },
    "aviso prueba4": {
        description: "asdlasdjkna"
    }
}

function linkBuilder(link) {
    let fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`
    return `<a href="${fullLink}" target="_blank">(+)</a>`
}

function listBuilder(list) {
    let finalList = [];
    for (let item in list) {
        let template = {};
        template.name = item
        template.value = item
        template.label = `{{${item}}} · ${list[item].description} ${linkBuilder(item)}`
        template.subgroup = list[item]?.subgroup ? list[item].subgroup : '';
        finalList.push(template)
    }
    return finalList;
}

// Creates the Morebits window holding the form
function createFormWindow() {
    let Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Avisar al usuario');
    Window.addFooterLink('Políticas y convenciones', 'Wikipedia:Políticas y convenciones');
    let form = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'input',
        value: '',
        name: 'search',
        label: 'Búsqueda:',
        id: 'search',
        size: '30',
        event: function quickFilter() {
            const searchInput = document.getElementById("search");
            const allCheckboxDivs = document.querySelectorAll("#checkboxContainer > div");
            if (this.value) {
                // Flushes the list before calling the search query function, then does it as a callback so that it happens in the right order
                function flushList(callback) {
                    for (let i = 0; i < allCheckboxDivs.length; i++) {
                        const div = allCheckboxDivs[i];
                        div.style.display = 'none';
                    }
                    callback();
                }
                // Finds matches for the search query within the checkbox list
                function updateList(searchString) {
                    for (let i = 0; i < allCheckboxDivs.length; i++) {
                        let checkboxText = allCheckboxDivs[i].childNodes[1].innerText
                        if (checkboxText.includes(searchString.toLowerCase()) || checkboxText.includes(searchString.toUpperCase())) {
                            const div = allCheckboxDivs[i];
                            div.style.display = '';
                        }
                    }
                }
                flushList(() => updateList(searchInput.value));
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
        list: listBuilder(templateDict)
    })

    let optionsField = form.append({
        type: 'field',
        label: 'Opciones:'
    })

    optionsField.append({
        type: 'input',
        name: 'reason',
        label: 'Razón:',
        tooltip: '(Opcional) Escribe aquí el resumen de edición explicando la razón por la que se ha añadido la plantilla',
        style: 'width: 80%; margin-top: 0.5em;'
    })

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
    let templateList = [];

    // First let's tidy up Morebit's array
    for (const [key, value] of Object.entries(input)) {
        if (value && !key.includes('_param') && key != 'notify' && key != 'reason' && key != 'search') {
            templateList.push([key])
        }
    }

    // Then we will assign each parameter to their corresponding value and make it accessible
    for (const element of templateList) {
        for (const [key, value] of Object.entries(input)) {
            if (key.includes('_param') && key.includes(element)) {
                templateList[element] = {
                    "param": key.split('-').pop(),
                    "paramValue": value
                }
            }
        }
    }

    utils.createStatusWindow();
    new Morebits.status("Paso 1", 'generando plantilla...', 'info');
    new mw.Api().edit(
        `Usuario_discusión:${warnedUser}`,
        function (revision) {
            return {
                text: revision.content + templateBuilder(templateList),
                summary: `Añadiendo aviso de usuario mediante [[WP:TL|Twinkle Lite]]. ` + `${input.reason ? input.reason : ''}`,
                minor: false
            }
        }

    )

}

export { createFormWindow };