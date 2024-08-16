// ** Warn module **
// Posts a warning message on a user discussion page that can be selected as part of a series of options of a checkbox list

import { QuickFormElementInstance, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { templateParamsDictionary, WarningsModuleProcessedList, WikipediaTemplateDict } from "types/twinkle-types";
import { createStatusWindow, currentPageName, currentUser, finishMorebitsStatus, isPageMissing, relevantUserName } from "./utils";

let Window: SimpleWindowInstance;
let warnedUser: string;

// Dictionary holding the different template definitions with descriptions and 
// optional subgroups for specific parameters
const templateDict: WikipediaTemplateDict = {
    "aviso autopromoción": {
        description: "usuarios creadores de páginas promocionales o de publicidad",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso autopromoción-1',
                label: 'Artículo promocional en cuestión',
                tooltip: 'Escribe el nombre del artículo considerado promocional o publicitario. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
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
                name: '_param-aviso categorizar-1',
                label: 'Artículo en cuestión',
                tooltip: 'Escribe el nombre del artículo que no ha sido categorizado por el usuario. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso conflicto de interés": {
        description: "usuarios que editan bajo conflicto de interés o que constituyen CPP y no respetan PVN"
    },
    "aviso copyvio": {
        description: "usuarios que han creado artículos que vulneran derechos de autor",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso copyvio-1',
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
                name: '_param-aviso etiqueta-1',
                label: 'Nombre del artículo donde se ha producido la falta de etiqueta',
                tooltip: 'Escribe el nombre de la página donde se ha producido la falta de etiqueta. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso firma": {
        description: "usuarios que han firmado artículos",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso firma-1',
                label: 'Nombre del artículo donde se ha firmado erróneamente',
                tooltip: 'Escribe el nombre del artículo donde se ha añadido una firma. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso guerra de ediciones": {
        description: "usuario que puede desconocer R3R y se encuentre en guerra o conflicto de ediciones",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso guerra de ediciones-1',
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
                name: '_param-aviso imagen-1',
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
                tooltip: 'Escribe el nombre del artículo en elviso noesunforo1 que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "aviso prueba4": {
        description: "ultimo aviso a usuarios vandálicos antes de denunciarlo en TAB",
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
                name: '_param-aviso sin sentido-1',
                label: 'Artículo en el que se llevó a cabo la edición',
                tooltip: 'Escribe el nombre del artículo en el que se llevó a cabo la edición sin sentido o bulo. No uses corchetes, el enlace se añadirá automáticamente',
                required: true
            }
        ]
    },
    "aviso topónimos de España": {
        description: "usuarios que no han tenido en cuenta WP:TOES",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso topónimos de España-1',
                label: 'Artículo en cuestión',
                tooltip: 'Escribe el nombre de la página en la que se ha violado la política de WP:TOES. No uses corchetes, el enlace se añadirá automáticamente',
            }
        ]
    },
    "aviso tradref": {
        description: "usuarios que han traducido un artículo pero no han agregado la atribución o referencias a copyright correspondientes",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso tradref-1',
                label: 'Nombre del artículo',
                tooltip: 'Escribe el nombre del artículo en el que no se ha añadido la atribución correcta, sin usar corchetes',
            }
        ]
    },
    "aviso traslado al taller": {
        description: "usuarios que han creado una página no apta para el espacio principal",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso traslado al taller-1',
                label: 'Página (del taller) en la que se encuentra el artículo trasladado',
                tooltip: 'Escribe el nombre de la página en la que se encuentra ahora el artículo (Ej.: si pones «EjemploDePágina», el enlace llevará a «Usuario:Ejemplo/Taller/EjemploDePágina»). No uses corchetes, el enlace se añadirá automáticamente',
            }
        ]
    },
    "aviso votonulo": {
        description: "usuarios que han intentado votar sin cumplir los requisitos"
    },
    "no amenaces con acciones legales": {
        description: "usuarios que han amenazado con denunciar o llevar a juicio a Wikipedia/otros usuarios",
        subgroup: [
            {
                type: 'input',
                name: '_param-no amenaces con acciones legales-1',
                label: 'Página en la que se llevó a cabo la amenaza',
                tooltip: '(Opcional) Escribe el nombre de la página en la que se llevó a cabo la amenaza. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    },
    "no retires plantillas de mantenimiento crítico": {
        description: "usuarios que han retirado plantillas de mantenimiento crítico sin consenso en PD",
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
        description: "usuarios que han realizado ediciones perjudiciales o que van más allá del vandalismo",
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
                name: '_param-ten precaución en la retirada de plantillas de mantenimiento no crítico-1',
                label: 'Artículo del que se retiró la plantilla',
                tooltip: 'Escribe el nombre del artículo en el que se produjo la retirada indebida de la plantilla de mantenimiento no crítico. No uses corchetes, el enlace se añadirá automáticamente'
            }
        ]
    }
}

/**
 * Builds a description link for a given template link.
 * @param link - The link to the template.
 * @returns A formatted anchor tag with the full link to the template.
 */
function descriptionLinkBuilder(link: string) {
    const fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`;
    return `<a href="${fullLink}" target="_blank">(+)</a>`
}

/**
 * Builds a list of template data for use in the checkbox list.
 * @param list - The dictionary of templates.
 * @returns An array of processed list items.
 */
function listBuilder(list: WikipediaTemplateDict) {
    let finalList = [];
    for (let item in list) {
        const template: WarningsModuleProcessedList = {
            name: item,
            value: item,
            label: `{{${item}}} · ${list[item].description} ${descriptionLinkBuilder(item)}`,
            subgroup: list[item]?.subgroup ? list[item].subgroup : null
        };
        finalList.push(template)
    }
    return finalList;
}

/**
 * Builds the posted template string based on the provided parameters.
 * @param paramObj - The template dictionary with the assigned parameters.
 * @returns A formatted string with the template and its parameters.
 */
function templateBuilder(paramObj: templateParamsDictionary): string {
    let finalString = '';
    for (const element in paramObj) {
        const parameter = paramObj[element]?.param ? `|${paramObj[element].param}=` : '';
        const parameterValue = paramObj[element]?.paramValue || '';
        finalString += `{{sust:${element}${parameter}${parameterValue}}}\n`;
    }
    return finalString;
}

function extractParamsFromInput(input: QuickFormInputObject): string[] {
    let temporaryTemplateList = [];
    // First let's tidy up Morebit's array
    for (const [key, value] of Object.entries(input)) {
        if (value && !key.includes('_param') && key != 'notify' && key != 'reason' && key != 'search') {
            temporaryTemplateList.push(key);
        }
    }
    return temporaryTemplateList
}

function paramAssigner(paramList: string[], input: QuickFormInputObject): templateParamsDictionary {
    let finalObj: templateParamsDictionary = {}
    for (const element of paramList) {
        for (const [key, value] of Object.entries(input)) {
            if (key.includes('_param') && key.includes(element)) {
                finalObj[element] = {
                    "param": key.split('-').pop()!,
                    "paramValue": value
                };
            }
        }
    }
    return finalObj;
}

/**
 * Creates the Morebits window holding the form.
 * @param warnedUserFromDOM - The username of the warned user fetched from the DOM.
 */
function createFormWindow(warnedUserFromDOM: string | null) {

    // Something about the addPortletLink feature doesn't work well so this condition is unfortunately needed
    // Set the warned user from the DOM or fallback to the relevant username
    if (typeof warnedUserFromDOM == 'string') {
        warnedUser = warnedUserFromDOM;
    } else {
        warnedUser = relevantUserName;
    }

    // Initialize the Morebits window
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Avisar al usuario');
    Window.addFooterLink('Plantillas de aviso a usuario', 'Wikipedia:Plantillas de aviso a usuario');

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'input',
        value: '',
        name: 'search',
        label: 'Búsqueda:',
        id: 'search',
        size: 30,
        event: function quickFilter() {
            const searchInput = document.getElementById("search") as HTMLInputElement
            if (searchInput) {
                const allCheckboxDivs = document.querySelectorAll("#checkboxContainer > div");
                if (this.value) {
                    // Flushes the list before calling the search query function, then does it as a callback so that it happens in the right order
                    function flushList(callback: any) {
                        for (let i = 0; i < allCheckboxDivs.length; i++) {
                            const div = allCheckboxDivs[i] as HTMLElement;
                            div.style.display = 'none';
                        }
                        callback();
                    }
                    // Finds matches for the search query within the checkbox list
                    function updateList(searchString: string) {
                        for (let i = 0; i < allCheckboxDivs.length; i++) {
                            const checkboxText = allCheckboxDivs[i].childNodes[1].textContent
                            if (checkboxText) {
                                if (checkboxText.includes(searchString.toLowerCase()) || checkboxText.includes(searchString.toUpperCase())) {
                                    const div = allCheckboxDivs[i] as HTMLElement;
                                    div.style.display = '';
                                }
                            }
                        }
                    }
                    flushList(() => updateList(searchInput.value));
                }
                // Retrieves the full list if nothing is on the search input box
                if (this.value && this.value.length == 0) {
                    for (let i = 0; i < allCheckboxDivs.length; i++) {
                        const div = allCheckboxDivs[i] as HTMLElement;
                        div.style.display = '';
                    }
                }
            }

        }
    })

    const optionBox: QuickFormElementInstance = form.append({
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

    const optionsField: QuickFormElementInstance = form.append({
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

    const result = form.render();
    Window.setContent(result);
    Window.display();

}

/**
 * Handles the submission of the warning message form.
 * @param e - The event triggered on form submission.
 */
function submitMessage(e: Event) {
    const form = e.target as HTMLFormElement;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);

    let templateList: string[] = extractParamsFromInput(input);
    let templateParams: templateParamsDictionary = paramAssigner(templateList, input);

    // Prevent the user from warning themselves
    if (warnedUser == currentUser) {
        alert("No puedes dejarte un aviso a ti mismo");
        return;
    } else {
        // Create a status window to display progress
        const statusWindow = new Morebits.simpleWindow(400, 350);
        createStatusWindow(statusWindow)
        new Morebits.status("Paso 1", 'generando plantilla...', 'info');

        // Post the message to the user's discussion page
        postsMessage(templateParams, input)
            .then(function () {
                if (currentPageName.includes(`_discusión:${warnedUser}`)) {
                    finishMorebitsStatus(Window, statusWindow, 'finished', true);
                } else {
                    finishMorebitsStatus(Window, statusWindow, 'finished', false);
                }
            })
            .catch(function (error) {
                finishMorebitsStatus(Window, statusWindow, 'error');
                console.error(`Error: ${error}`);
            })
    }
}

/**
 * Posts the message to the user's discussion page.
 * @param templateParams - The parameters for the template.
 * @param input - The form input data.
 * @returns A promise that resolves when the message is posted.
 */
function postsMessage(templateParams: templateParamsDictionary, input: QuickFormInputObject) {
    new Morebits.status("Paso 2", "publicando aviso en la página de discusión del usuario", "info");
    return isPageMissing(`Usuario_discusión:${warnedUser}`)
        .then(function (mustCreateNewTalkPage) {
            if (mustCreateNewTalkPage) {
                return new mw.Api().create(
                    `Usuario_discusión:${warnedUser}`,
                    { summary: `Añadiendo aviso de usuario mediante [[WP:Twinkle Lite|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}` },
                    `${templateBuilder(templateParams)}~~~~`
                );
            } else {
                return new mw.Api().edit(
                    `Usuario_discusión:${warnedUser}`,
                    function (revision) {
                        return {
                            text: revision.content + `\n${templateBuilder(templateParams)}~~~~`,
                            summary: `Añadiendo aviso de usuario mediante [[WP:Twinkle Lite|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}`,
                            minor: false
                        }
                    }
                )
            }
        })
}

export { createFormWindow };