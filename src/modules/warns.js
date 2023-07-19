// ** Warn module **
// Posts a warning message on a user discussion page that can be selected as part of a series of options of a checkbox list

import * as utils from "./utils";

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
    }
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
            const allRadioDivs = document.querySelectorAll("#radioContainer > div");
            if (this.value) {
                // Flushes the list before calling the search query function, then does it as a callback so that it happens in the right order
                function flushList(callback) {
                    for (let i = 0; i < allRadioDivs.length; i++) {
                        const div = allRadioDivs[i];
                        div.style.display = 'none';
                    }
                    callback();
                }
                // Finds matches for the search query within the checkbox list
                function updateList(searchString) {
                    for (let i = 0; i < allRadioDivs.length; i++) {
                        let checkboxText = allRadioDivs[i].childNodes[1].innerText
                        if (checkboxText.includes(searchString.toLowerCase()) || checkboxText.includes(searchString.toUpperCase())) {
                            const div = allRadioDivs[i];
                            div.style.display = '';
                        }
                    }
                }
                flushList(() => updateList(searchInput.value));
            }
            // Retrieves the full list if nothing is on the search input box
            if (this.value.length == 0) {
                for (let i = 0; i < allRadioDivs.length; i++) {
                    const div = allRadioDivs[i];
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
        type: 'radio',
        id: 'radioContainer',
        list: listBuilder(templateDict),
        label: 'radioOption'
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