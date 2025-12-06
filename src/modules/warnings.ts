// ** Warn module **
// Posts a warning message on a user discussion page that can be selected as part of a series of options of a checkbox list

import { QuickFormElementInstance, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { templateParamsDictionary, WarningsModuleProcessedList, WarningTemplateDict } from "types/twinkle-types";
import { createStatusWindow, currentPageName, currentUser, finishMorebitsStatus, isPageMissing, relevantUserName, isCurrentUserSysop, showConfirmationDialog, api } from "./../utils/utils";

let Window: SimpleWindowInstance;
let warnedUser: string;

// Dictionary holding the different template definitions with descriptions and 
// optional subgroups for specific parameters
const templateDict: WarningTemplateDict = {
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
    "aviso bloqueado": {
        description: "para notificar a usuarios que han recibido un bloqueo",
        sysopOnly: true,
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso bloqueado-1',
                label: 'Motivo del bloqueo',
                tooltip: 'Escribe el motivo del bloqueo del usuario. Puedes usar wikicódigo.',
                required: true
            },
            {
                type: 'input',
                name: '_param-aviso bloqueado-2',
                label: '(sólo bloqueos parciales) Artículo del bloqueo parcial',
                tooltip: 'Rellena este parámetro sólo si el usuario han recibido un bloqueo parcial: escribe el nombre del artículo que ya no deberá editar sin utilizar corchetes.',
            }
        ]
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
            },
            {
                type: 'checkbox',
                list:
                    [{
                        name: '_param-aviso copyvio-plagio',
                        label: 'El artículo posee contenido plagiado',
                        tooltip: 'Marca esta casilla si hay indicios de que el contenido ha sido plagiado. Se recomienda que vaya acompañada de la plantilla {{plagio}} en el artículo'
                    }],
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
            },
            {
                type: 'input',
                name: '_param-aviso noesunforo2-2',
                label: 'Texto personalizado',
                tooltip: 'Un texto personalizado que aparece al final final. De no rellenarse, aparecerá simplemente «gracias»'
            }
        ]
    },
    "aviso nombre inapropiado": {
        description: "nombres de usuario que van contra la política de nombres de usuario",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso nombre inapropiado-1',
                label: 'Tipo de nombre inapropiado',
                tooltip: 'Para especificar el problema del nombre del usuario. Opciones admitidas: «confuso», «publicitario», «insultante» o «difamatorio»'
            }
        ]
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
                name: '_param-aviso sin" sentido-1',
                label: 'Artículo en el que se llevó a cabo la edición',
                tooltip: 'Escribe el nombre del artículo en el que se llevó a cabo la edición sin sentido o bulo. No uses corchetes, el enlace se añadirá automáticamente',
                required: true
            }
        ]
    },
    "aviso spam1": {
        description: "usuarios con ediciones que podrían considerarse spam",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso spam1-1',
                label: 'Artículo en el que se llevó a cabo el spam'
            },
            {
                type: 'input',
                name: '_param-aviso spam1-2',
                label: 'Texto adicional',
                tooltip: 'Un texto personalizado que aparece al final final. De no rellenarse, aparecerá simplemente «gracias»'
            }
        ]
    },
    "aviso spam2": {
        description: "usuarios que han dejado spam en varias ocasiones",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso spam2-1',
                label: 'Artículo en el que se llevó a cabo el spam'
            },
            {
                type: 'input',
                name: '_param-aviso spam2-2',
                label: 'Texto adicional',
                tooltip: 'Un texto personalizado que aparece al final final. De no rellenarse, aparecerá simplemente «gracias»'
            }
        ]
    },
    "aviso spam3": {
        description: "usuarios que llevan a cabo spam de forma reiterada",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso spam3-1',
                label: 'Artículo en el que se llevó a cabo el spam'
            },
            {
                type: 'input',
                name: '_param-aviso spam3-2',
                label: 'Texto adicional',
                tooltip: 'Un texto personalizado que aparece al final final. De no rellenarse, aparecerá simplemente «gracias»'
            }
        ]
    },
    "aviso spam4": {
        description: "usuarios que han llevado a cabo spam, último aviso previo al bloqueo",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso spam4-1',
                label: 'Artículo en el que se llevó a cabo el spam'
            },
            {
                type: 'input',
                name: '_param-aviso spam4-2',
                label: 'Texto adicional',
                tooltip: 'Un texto personalizado que aparece al final final. De no rellenarse, aparecerá simplemente «gracias»'
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
        description: "usuarios que han intentado votar sin cumplir los requisitos",
        subgroup: [
            {
                type: 'input',
                name: '_param-aviso votonulo"-1',
                label: 'Especificar tipo (opciones: «proselitismo» o «títere»)',
                tooltip: '(Opcional) Especifica si se trataba de «proselitismo» o «títere». El parámetro solo acepta estas dos opciones, de lo contrario dejará un mensaje por defecto.'
            }
        ]
    },
    "aviso usuario títere": {
        description: "usuarios que han creado una cuenta para eludir/evadir bloqueos",
        sysopOnly: true,
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
function listBuilder(list: WarningTemplateDict) {
    let finalList = [];
    for (let item in list) {
        if (!list[item].sysopOnly || (list[item].sysopOnly && isCurrentUserSysop)) {
            const template: WarningsModuleProcessedList = {
                name: item,
                value: item,
                label: `{{${item}}} · ${list[item].description} ${descriptionLinkBuilder(item)}`,
                subgroup: list[item]?.subgroup ? list[item].subgroup : null
            };
            finalList.push(template)
        }
    }
    return finalList;
}

/**
 * Builds the posted template string based on the provided parameters.
 * @param paramObj - The template dictionary with the assigned parameters.
 * @returns A formatted string with the template and its parameters.
 */
function templateBuilder(paramObj: templateParamsDictionary): string {
    let allTemplatesString = ''
    for (const element in paramObj) {
        let finalString = `{{sust:${element}`;
        if (paramObj[element]?.params) {
            for (let param of paramObj[element]?.params) {
                const templatedParameter = `|${param.paramName}=${param.paramValue}`
                finalString += templatedParameter;
            }
        }
        finalString += '}}\n'
        allTemplatesString += finalString
    }

    return allTemplatesString;
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

function paramAssigner(templateList: string[], input: QuickFormInputObject): templateParamsDictionary {
    let finalObj: templateParamsDictionary = {}
    for (const element of templateList) {
        finalObj[element] = {};
        for (const [key, value] of Object.entries(input)) {
            if (key.includes('_param') && key.includes(element) && value) {
                if (!finalObj[element].params) {
                    finalObj[element].params = []
                }
                finalObj[element].params.push({
                    "paramName": key.split('-').pop()!,
                    "paramValue": value
                })
            }
        }
    }
    return finalObj;
}

/**
 * Creates the Morebits window holding the form.
 * @param warnedUserFromDOM - The username of the warned user fetched from the DOM.
 */
export function createWarningsFormWindow(warnedUserFromDOM: string | null): void {

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
    Window.setTitle(`Avisar al usuario ${warnedUser}`);
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
            const searchInput = document.getElementById("search") as HTMLInputElement;
            const allCheckboxDivs = document.querySelectorAll("#checkboxContainer > div");
            const searchString = searchInput.value.toLowerCase();

            allCheckboxDivs.forEach(div => {
                const el = div as HTMLElement;
                const label = el.querySelector("label");
                const text = label?.textContent?.toLowerCase() ?? el.textContent?.toLowerCase() ?? "";

                if (!searchString || text.includes(searchString)) {
                    el.style.display = '';
                } else {
                    el.style.display = 'none';
                }
            });
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

    // Prevent the user from submitting if no templates were selected
    if (templateList.length == 0) {
        alert("Selecciona al menos una plantilla");
        return;
    }

    let templateParams: templateParamsDictionary = paramAssigner(templateList, input);
    // Prevent the user from warning themselves
    if (warnedUser == currentUser) {
        alert("No puedes dejarte un aviso a ti mismo");
        return;
    } else {
        if (showConfirmationDialog(`¿Estás seguro de que quieres dejar un aviso a ${warnedUser}?`)) {
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
                return api.create(
                    `Usuario_discusión:${warnedUser}`,
                    { summary: `Añadiendo aviso de usuario mediante [[WP:Twinkle Lite|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}` },
                    `${templateBuilder(templateParams)}~~~~`
                );
            } else {
                return api.edit(
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