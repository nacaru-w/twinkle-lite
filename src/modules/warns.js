// ** Warn module **
// Posts a warning message on a user discussion page that can be selected as part of a series of options of a checkbox list

import * as utils from "./utils";

const warnedUser = mw.config.get('wgRelevantUserName');

const templateDict = {
    "aviso blanqueo": {
        description: "usuarios que han blanqueado total o parcialmente páginas en general o de discusión asociada",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso blanqueo-1',
                label: 'Artículo en el que se realizó el blanqueo',
                tooltip: 'Escribe el nombre del artículo en el que se realizó el blanqueo parcial o total. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso blanqueo discusión": {
        description: "usuarios que han blanqueado total o parcialmente su página de discusión o la de otros usuarios",
    },
    "aviso categorizar": {
        description: "usuarios que han olvidado categorizar artículos",
        subgroup: [
            {
                type: 'input',
                name: '_aviso categorizar-1',
                label: 'Artículo en cuestión',
                tooltip: 'Escribe el nombre del artículo que no ha sido categorizado por el usuario. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso copyvio": {
        description: "usuarios que han creado artículos que vulneran derechos de autor",
        subgroup: [
            {
                type: 'input',
                name: '_aviso copyvio-1',
                label: 'Artículo en el que hay copyvio',
                tooltip: 'Escribe el nombre del artículo en el que se han vulnerado derechos de autor. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso etiqueta": {
        description: "usuarios que han faltado a la etiqueta, realizando ediciones o creando comentarios o páginas que pueden resultar ofensivas",
        subgroup: [
            {
                type: 'input',
                name: '_aviso etiqueta-1',
                label: 'Nombre del artículo donde se ha producido la falta de etiqueta',
                tooltip: 'Escribe donde se ha producido la falta de etiqueta. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso de guerra de ediciones": {
        description: "autores que han subido imágenes que no deberían estar en Commons",
        subgroup: [
            {
                type: 'input',
                name: '_aviso de guerra de ediciones-1',
                label: 'Nombre de la página en la que se ha dado la guerra de ediciones',
                tooltip: 'Escribe el nombre de la página en la que el usuario avisado ha participado en una guerra de ediciones. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso imagen": {
        description: "autores que han subido imágenes que no deberían estar en Commons",
        subgroup: [
            {
                type: 'input',
                name: '_aviso imagen-1',
                label: 'Nombre del archivo en Commons',
                tooltip: 'Escribe el nombre del archivo en Commons, incluyendo su extensión. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso noesunforo2": {
        description: "usuarios que forean en páginas de discusión",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso noesunforo2-1',
                label: 'Artículo en el que se realizó la edición',
                tooltip: 'Escribe el nombre del artículo en el que se cometió la prueba de edición. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso nombre inapropiado": {
        description: "nombres de usuario que van contra la política de nombres de usuario"
    },
    "aviso prueba1": {
        description: "usuarios que han realizado ediciones no apropiadas",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso prueba1-1',
                label: 'Artículo en el que se realizó la edición',
                tooltip: 'Escribe el nombre del artículo en el que se cometió la prueba de edición. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso prueba2": {
        description: "usuarios que han realizado ediciones vandálicas",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso prueba2-1',
                label: 'Artículo en el que se realizó el vandalismo',
                tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso prueba3": {
        description: "usuarios que han realizado más de una edición vandálica",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso prueba3-1',
                label: 'Artículo en el que se llevó a cabo el vandalismo',
                tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso prueba4": {
        description: "ultimo aviso a usuarios vandálicos antes de reportar",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso prueba4-1',
                label: 'Artículo en el que se llevó a cabo el vandalismo',
                tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso sin sentido": {
        description: "usuarios que crean páginas sin sentido o bulos",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso prueba4-1',
                label: 'Artículo en el que se llevó a cabo el vandalismo',
                tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente',
                required: true
            }
        ]
    },
    "aviso votonulo": {
        description: "usuarios que han intentado votar sin cumplir los requisitos"
    },
    "no retires plantillas de mantenimiento crítico": {
        description: "usuarios que han realizado ediciones perjudiciales o van más allá del vandalismo",
        subgroup: [
            {
                type: 'input',
                name: '_param-no retires plantillas de mantenimiento crítico-1',
                label: 'Artículo en el que se retiró la plantilla',
                tooltip: 'Escribe el nombre del artículo en el que se encontraba la plantilla retirada. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "planvand": {
        description: "usuarios que han realizado ediciones perjudiciales o van más allá del vandalismo",
        subgroup: [
            {
                type: 'input',
                name: '_param-planvand-1',
                label: 'Artículo en el que se llevó a cabo el vandalismo',
                tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "ten precaución en la retirada de plantillas de mantenimiento no crítico": {
        description: "usuarios que han retirado plantillas de mantenimiento no crítico sin explicaciones",
        subgroup: [
            {
                type: 'input',
                name: '_param-ten precaución en la retirada de plantillas de mantenimiento no crítico-nombre del artículo',
                label: 'Artículo en el que se llevó a cabo el vandalismo',
                tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
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

function templateBuilder(list) {
    let finalString = '';
    for (const element of list) {
        let parameter = list[element]?.param ? `|${list[element].param}=` : '';
        let parameterValue = list[element]?.paramValue || '';
        finalString += `{{sust:${element}${parameter}${parameterValue}}}\n`;
    }
    return finalString;
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
        `Usuario:Nacaru/Taller/Tests`,
        // `Usuario_discusión:${warnedUser}`, to use after tests
        function (revision) {
            return {
                text: revision.content + `\n${templateBuilder(templateList)}`,
                summary: `Añadiendo aviso de usuario mediante [[WP:TL|Twinkle Lite]]. ` + `${input.reason ? input.reason : ''}`,
                minor: false
            }
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

export { createFormWindow };