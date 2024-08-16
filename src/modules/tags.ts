// ** Tags module **
// Allows users to add a tag in articles. The tag can be selected as part of a series of options of a checkbox list

import { QuickFormElementInstance, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { createStatusWindow, currentNamespace, currentPageName, currentUser, finishMorebitsStatus, getCreator, isPageMissing, stripTalkPagePrefix } from "./utils";
import { TagTemplateDict, TagTemplateListElement, templateParamsDictionary } from "types/twinkle-types";

let Window: SimpleWindowInstance;

// Dictionary that stores the templates, the description, as well as the parameter and the name of the warning template if any of them is applicable
// Template parameters are set in the subgroup, specifically in the 'name' key, their syntax is as follows:
// `_param-parent template name-parameter identifier`
// If the parameter doesn't have an identifier, then just type a «1»

const relevantPageName: string = stripTalkPagePrefix(currentPageName);
const relevantPageNameNoUnderscores: string = relevantPageName.replace(/_/g, ' ');

// Dictionary of tag templates containing descriptions, warnings, and parameters.
// Templates are categorized with optional parameters and additional properties like 'groupable' and 'sust'.
const tagTemplateDict: TagTemplateDict = {
    "artículo bueno": {
        description: "para etiquetar artículos que han obtenido la calificación de AB",
    },
    "autotrad": {
        warning: "aviso autotrad",
        description: "uso de automatismo en traducciones de nula calidad",
        sust: true
    },
    "bulo": {
        warning: "aviso destruir|2=bulo",
        description: "páginas falsas que constituyen bulos o hoax"
    },
    "categorizar": {
        warning: "aviso categorizar",
        description: "artículos sin categorías"
    },
    "CDI": {
        warning: "aviso conflicto de interés",
        description: "escrita bajo conflicto de interés"
    },
    "contextualizar": {
        warning: "aviso contextualizar",
        description: "el tema o ámbito no está claramente redactado. Plantilla de 30 días.",
        sust: true
    },
    "complejo": {
        description: "textos difíciles de entender",
        subgroup: [
            {
                type: 'input',
                name: '_param-complejo-1',
                label: 'Explica por qué es complejo',
                tooltip: 'Desarrolla brevemente por qué consideras que el artículo posee una elevada complejidad'
            }
        ],
        groupable: true,
        sust: true
    },
    "copyedit": {
        warning: "aviso copyedit",
        description: "necesita una revisión de ortografía y gramática",
        groupable: true
    },
    "curiosidades": {
        description: "textos con sección de curiosidades"
    },
    "desactualizado": {
        description: "página con información obsoleta",
        groupable: true,
        sust: true
    },
    "en desarrollo": {
        description: "páginas en construcción o siendo editadas activamente",
        subgroup: [
            {
                type: 'input',
                name: '_param-en desarrollo-1',
                label: 'Nombre del editor',
                tooltip: 'Escribe el nombre del usuario que está desarrollando el artículo, no utilices ningún tipo de Wikicódigo'
            }
        ],
        sust: true
    },
    "evento actual": {
        description: "artículos de actualidad cuya información es susceptible a cambiar"
    },
    "excesivamente detallado": {
        description: "demasiada información sobre temas triviales",
        sust: true
    },
    "experto": {
        description: "artículos muy técnicos con deficiencias de contenido solo corregibles por un experto",
        groupable: true,
    },
    "ficticio": {
        description: "sin enfoque desde un punto de vista real",
        groupable: true,
        sust: true
    },
    "formato de referencias": {
        warning: "aviso formato de referencias",
        description: "referencias incorrectas o mal construidas",
        groupable: true,
        sust: true
    },
    "fuente primaria": {
        warning: "aviso fuente primaria",
        description: "información no verificable. Plantilla de 30 días.",
        sust: true
    },
    "fuentes no fiables": {
        description: "referencias que no siguen la política de fuentes fiables",
        warning: "aviso fuentes no fiables",
        sust: true
    },
    "fusionar": {
        description: "sugerir una fusión",
        subgroup: [
            {
                type: 'input',
                name: '_param-fusionar-1',
                label: 'Artículo objetivo',
                tooltip: 'Escribe el nombre del artículo con el que quieres fusionar esta página. No uses Wikicódigo.'
            }
        ],
        sust: true
    },
    "globalizar": {
        warning: "aviso globalizar",
        description: "existe sesgo territorial",
        subgroup: [
            {
                type: 'input',
                name: '_param-globalizar-1',
                label: 'Cultura o territorio del sesgo'
            }
        ],
        groupable: true,
        sust: true
    },
    "infraesbozo": {
        warning: "aviso infraesbozo",
        description: "contenido insuficiente como para constituir un esbozo de artículo o anexo válido. Plantilla de 30 días",
        sust: true
    },
    "largo": {
        description: "artículos excesivamente largos que deberían subdividirse en varios",
        groupable: true
    },
    "mal traducido": {
        warning: "aviso mal traducido",
        description: "escasa calidad de una traducción de otro idioma",
        groupable: true
    },
    "mejorar redacción": {
        description: "redacciones que no siguen el manual de estilo",
        groupable: true,
        sust: true
    },
    "no es un foro": {
        description: "páginas de discusión que han recibido grandes cantidades de conversación irrelevante",
        talkPage: true
    },
    "no neutralidad": {
        warning: "aviso no neutralidad",
        description: "artículos sesgados o claramente decantados en una dirección",
        subgroup: [
            {
                type: 'input',
                name: `_param-no neutralidad-motivo`,
                label: 'Razón del sesgo',
                tooltip: 'Describe brevemente la razón del sesgo. Es importante, también, desarrollarla más exhaustivamente en la PD',
                required: true
            }
        ],
        groupable: true
    },
    "plagio": {
        warning: "aviso destruir|2=plagio",
        description: "artículos copiados, que violan derechos de autor",
        subgroup: [
            {
                type: 'input',
                name: '_param-plagio-1',
                label: 'URL origen del plagio',
                tooltip: 'Copia y pega aquí la URL de la página externa en la que se halla el texto original',
                required: true
            }
        ],
        sust: true
    },
    "polémico": {
        description: "temas susceptibles a guerras de edición o vandalismo",
        talkPage: true
    },
    "pr": {
        description: "para atribuir el artículo a un wikiproyecto",
        subgroup: [
            {
                type: 'input',
                name: '_param-pr-1',
                label: 'Nombre del wikiproyecto',
                tooltip: 'Escribe aquí el nombre del Wikiproyecto (esta plantilla se coloca en la PD automáticamente)',
                required: true
            }
        ],
        talkPage: true
    },
    "promocional": {
        warning: "aviso promocional",
        description: "texto con marcado carácter publicitario, no neutral. Plantilla de 30 días",
        subgroup: [
            {
                type: 'input',
                name: '_param-promocional-motivo',
                label: 'Motivo (opcional)',
                tooltip: 'Rellena este campo para especificar el motivo por el que se ha colocado la plantilla',
                required: false
            }
        ],
        sust: true
    },
    "publicidad": {
        description: "contenido comercial que defiende proselitismos o propaganda",
        groupable: true,
        sust: true

    },
    "pvfan": {
        warning: "aviso no neutralidad|2=PVfan",
        description: "escritos poco neutrales, con punto de vista fanático",
        groupable: true,
        sust: true
    },
    "referencias": {
        warning: "aviso referencias",
        description: "artículos sin una sola referencia",
        groupable: true,
        sust: true
    },
    "referencias adicionales": {
        warning: "aviso referencias",
        description: "artículos con falta de referencias",
        groupable: true,
        sust: true
    },
    "renombrar": {
        description: "para proponer un renombrado de una página",
        subgroup: [
            {
                type: 'input',
                name: '_param-renombrar-1',
                label: 'Nuevo nombre sugerido',
                required: true
            }
        ],
        sust: true
    },
    "revisar traducción": {
        description: "texto traducido legible pero necesita un repaso lingüístico"
    },
    "sin relevancia": {
        warning: "aviso sin relevancia",
        description: "artículos que no superan umbral de relevancia. Plantilla de 30 días",
        sust: true
    },
    "traducción": {
        description: "artículos que se están traduciendo desde otro idioma",
        subgroup: [
            {
                type: 'input',
                name: '_param-traducción-ci',
                label: 'Código ISO del idioma (opcional)',
                tooltip: 'Añade el código ISO del idioma del que procede la traducción. Ejemplo: «en» para artículos que proceden de la Wikipedia en inglés o «fr» si vienen de frwiki',
                required: false
            }
        ]
    },
    "traducción incompleta": {
        warning: "aviso traducción incompleta",
        description: "artículos que han sido traducidos solo parcialmente",
        groupable: true,
        sust: true
    },
    "wikificar": {
        warning: "aviso wikificar",
        description: "textos con mal formato o que no cumplen el manual de estilo",
        groupable: true,
        sust: true
    }
}

/** 
 * Builds the hyperlink for each tag template that links to its Wikipedia page.
 * @param link - The name of the tag template.
 * @returns A string containing the HTML anchor tag for the link.
 */
function linkBuilder(link: string): string {
    let fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`
    return `<a href="${fullLink}" target="_blank">(+)</a>`
}

/**
 * Builds the list of template options to be displayed in the checkbox list.
 * @returns An array of objects representing each template option.
 */
function listBuilder(): TagTemplateListElement[] {
    let finalList = [];
    for (let item in tagTemplateDict) {
        let template: TagTemplateListElement = {
            name: item,
            value: item,
            label: `{{${item}}} · ${tagTemplateDict[item].description} ${linkBuilder(item)}`,
            subgroup: tagTemplateDict[item]?.subgroup ? tagTemplateDict[item].subgroup : ''
        };
        finalList.push(template)
    }
    return finalList;
}

/**
 * Groups multiple templates into a single "problemas artículo" template if possible.
 * @param templateList - Array of selected template names.
 * @returns An array with the grouped templates if applicable, or the original list.
 */
function groupTemplates(templateList: string[]): string[] {
    if (templateList.length > 1) { //Avoids grouping only one template
        let newList = [];
        let groupedTemplates = 'problemas artículo'; // Name of the template that can be used to group up other templates
        let groupedTemplatesNumber = 0;
        for (let template of templateList) {
            // For each template on the list, it attaches it to the problemas artículo template
            // or it pushed it to the list of ungroupable templates
            if (tagTemplateDict[template]?.groupable) {
                groupedTemplatesNumber++;
                groupedTemplates += `|${template}`;
            } else {
                newList.push(template);
            }
        }
        if (groupedTemplatesNumber > 1) {
            // At the end, the grouped templates are added to the normal list
            // as in reality it acts as one more template. This only happens
            // if more than one groupable template is found, otherwise there's no
            // point in using the problemas artículo template
            newList.push(groupedTemplates);
            return newList
        } else {
            return templateList
        }
    }

    return templateList
}

/**
 * Creates a grouped warning template string for the talk page if grouped templates are found.
 * @param templateList - Array of selected template names.
 * @returns The grouped warning template string, or false if no grouped template exists.
 */
function createGroupedWarning(templateList: any[] /* TODO */): string | false {
    const groupedTemplate = templateList.find(element => element.includes("problemas artículo|"))
    if (groupedTemplate) {
        const groupedWwarning = groupedTemplate.replace("problemas artículo", `aviso PA|${relevantPageNameNoUnderscores}`);
        return groupedWwarning;
    }
    return false
}

/**
 * Builds the final template string that will be added to the page based on the selected templates and parameters.
 * @param templateObj - Object containing selected templates and their parameters.
 * @returns The final template string to be added to the page.
 */
function templateBuilder(templateObj: templateParamsDictionary): string {
    let finalString = '';
    for (const element in templateObj) {
        let needsSust = tagTemplateDict[element]?.sust ? true : false; // Check whether the template uses sust or not (TP templates don't)
        if (element.includes('problemas artículo|')) {
            needsSust = true;
        }
        const parameter = templateObj[element]?.param ? `|${templateObj[element].param}=` : '';
        const parameterValue = templateObj[element]?.paramValue || '';
        finalString += `{{${needsSust ? 'sust:' : ''}${element}${parameter}${parameterValue}}}\n`;
    }
    return finalString;
}

/**
 * Performs an edit on the specified Wikipedia page by adding the constructed templates to it.
 * @param templates - Object containing selected templates and their parameters.
 * @param input - Object containing form input values.
 * @param pagename - Name of the page to edit.
 * @returns A promise that resolves when the edit is complete.
 */
async function makeEdit(templates: templateParamsDictionary, input: QuickFormInputObject, pagename: string): Promise<any> {
    return await new mw.Api().edit(
        pagename,
        (revision) => {
            return {
                text: templateBuilder(templates) + revision.content,
                summary: `Añadiendo plantilla mediante [[WP:TL|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}`,
                minor: false
            }
        }
    )
}

/**
 * Assigns parameters to the selected templates based on user input from Morebits form.
 * @param paramList - List of templates that may require parameters.
 * @param input - Object containing form input values.
 * @returns An object mapping templates to their assigned parameters.
 */
function paramAssigner(paramList: string[], input: QuickFormInputObject): templateParamsDictionary {
    const templatesWithParams: templateParamsDictionary = {};
    for (const element of paramList) {
        for (const [key, value] of Object.entries(input)) {
            if (key.includes('_param') && key.includes(element)) {
                templatesWithParams[element] = {
                    "param": key.split('-').pop()!,
                    "paramValue": value
                }
            }
        }
    }
    return templatesWithParams
}


/**
 * Makes all necessary edits to both the main page and its talk page based on the selected templates.
 * @param templateList - List of selected templates for the main page.
 * @param templateTalkPageList - List of selected templates for the talk page.
 * @param input - Object containing form input values.
 * @returns A promise that resolves when all edits are complete.
 */
async function makeAllEdits(templateList: string[], templateTalkPageList: string[], input: QuickFormInputObject): Promise<any> {
    if (templateList.length > 0) {
        const templateObj: templateParamsDictionary = paramAssigner(templateList, input);
        await makeEdit(templateObj, input, relevantPageName);
    }
    if (templateTalkPageList.length > 0) {
        // First step is to fix the talk page when in anexos' namespaces
        const talkPage = currentNamespace == 104 || currentNamespace == 105 ? `Anexo_discusión:${relevantPageName.substring(6)}` : `Discusión:${relevantPageName}`;

        const templateTalkPageObj: templateParamsDictionary = paramAssigner(templateTalkPageList, input);
        return isPageMissing(talkPage)
            .then(function (mustCreateNewTalkPage) {
                if (mustCreateNewTalkPage) {
                    return new mw.Api().create(
                        talkPage,
                        { summary: `Añadiendo plantilla mediante [[WP:TL|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}` },
                        templateBuilder(templateTalkPageObj)
                    );
                } else {
                    return makeEdit(
                        templateTalkPageObj,
                        input,
                        talkPage
                    );
                }
            })
    }
}

/**
 * Creates the Morebits form window where users can select and configure tags to be added to the page.
 */
function createFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Añadir plantilla');
    Window.addFooterLink('Portal de mantenimiento', 'Portal:Mantenimiento');

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'input',
        value: '',
        name: 'search',
        label: 'Búsqueda:',
        id: 'search',
        size: '30',
        event: function quickFilter() {
            const searchInput = document.getElementById("search") as HTMLInputElement;
            const allCheckboxDivs = document.querySelectorAll("#checkboxContainer > div") as NodeList;
            if (this.value) {
                // Flushes the list before calling the search query function, then does it as a callback so that it happens in the right order
                function flushList(callback: CallableFunction) {
                    for (let i = 0; i < allCheckboxDivs.length; i++) {
                        const div = allCheckboxDivs[i] as HTMLElement;
                        div.style.display = 'none';
                    }
                    callback();
                }
                // Finds matches for the search query within the checkbox list
                function updateList(searchString: string) {
                    for (let i = 0; i < allCheckboxDivs.length; i++) {
                        let checkboxText = allCheckboxDivs[i].childNodes[1].textContent as string
                        if (checkboxText.includes(searchString.toLowerCase()) || checkboxText.includes(searchString.toUpperCase())) {
                            const div = allCheckboxDivs[i] as HTMLElement;
                            div.style.display = '';
                        }
                    }
                }
                flushList(() => updateList(searchInput.value));
            }
            // Retrieves the full list if nothing is on the search input box
            if (!this.value) {
                for (let i = 0; i < allCheckboxDivs.length; i++) {
                    const div = allCheckboxDivs[i] as HTMLElement;
                    div.style.display = '';
                }
            }
        }
    });

    const optionBox: QuickFormElementInstance = form.append({
        type: 'div',
        id: 'tagWorkArea',
        className: 'morebits-scrollbox',
        style: 'max-height: 28em; min-height: 0.5em'
    });

    optionBox.append({
        type: 'checkbox',
        id: 'checkboxContainer',
        list: listBuilder(),
        label: 'checkOption'
    });

    const optionsField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Opciones:'
    });

    optionsField.append({
        type: 'checkbox',
        list:
            [{
                name: "notify",
                value: "notify",
                label: "Notificar al creador de la página si es posible",
                checked: false,
                tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador del artículo advertiéndole de la colocación de la plantilla"
            }],
    });

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
 * Extracts the selected templates from the form input and categorizes them into article templates and talk page templates.
 * @param input - The input data from the QuickForm.
 * @returns An object containing two arrays: one for the article templates (`templatelist`) and another for the talk page templates (`templateTalkPageList`).
 */
function extractParamsFromInput(input: QuickFormInputObject): { templatelist: string[], templateTalkPageList: string[] } {
    let temporaryTemplateList = [];
    let temporaryTemplateTalkPageList = [];
    for (const [key, value] of Object.entries(input)) {
        if (value && !key.includes('_param') && key != 'notify' && key != 'reason' && key != 'search') {
            if (tagTemplateDict[key]?.talkPage) {
                temporaryTemplateTalkPageList.push(key);
            } else {
                temporaryTemplateList.push(key);
            }
        }
    }
    return {
        templatelist: temporaryTemplateList,
        templateTalkPageList: temporaryTemplateTalkPageList
    }
}

/**
 * Joins all warning templates into a single string to be added to the user's talk page.
 * @param list - A list of templates to be joined.
 * @param groupedWarning - A grouped warning template name, if applicable.
 * @returns A string that contains all the warning templates formatted for the user's talk page.
 */
function joinAllWarnings(list: string[], groupedWarning: string | false): string {
    let finalString = groupedWarning ? `{{sust:${groupedWarning}}} ~~~~\n` : '';
    for (let template of list) {
        if (tagTemplateDict[template]?.warning) {
            finalString += `{{sust:${tagTemplateDict[template].warning}|${relevantPageNameNoUnderscores}}} ~~~~\n`
        }
    }
    return finalString
}

/**
 * Posts a warning message to the creator's talk page, if applicable.
 * @param templateList - The list of templates used.
 * @param groupedWarning - The grouped warning template name, if applicable.
 * @param creator - The username of the page creator.
 * @returns A promise that resolves when the warning message has been posted to the creator's talk page.
 */
async function postsMessage(templateList: string[], groupedWarning: string | false, creator: string | null): Promise<any> {
    if (creator && creator == currentUser) {
        return;
    } else {
        new Morebits.status("Paso 2", "publicando un mensaje de aviso en la página de discusión del creador (si es posible)...", "info");
        const mustCreateNewTalkPage: boolean = await isPageMissing(`Usuario_discusión:${creator}`);
        const warningTemplates = joinAllWarnings(templateList, groupedWarning);
        if (!warningTemplates) {
            return;
        }
        if (mustCreateNewTalkPage) {
            return new mw.Api().create(
                `Usuario_discusión:${creator}`,
                { summary: `Aviso al usuario de la colocación de una plantilla en [[${relevantPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
                `${warningTemplates}`
            );
        } else {
            return new mw.Api().edit(
                `Usuario_discusión:${creator}`,
                function (revision) {
                    return {
                        text: revision.content + `\n${warningTemplates}`,
                        summary: `Aviso al usuario de la colocación de una plantilla en [[${relevantPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                        minor: false
                    }
                }
            )
        }
    }
}

/**
 * Handles the submission of the form, triggering the process of generating and posting templates.
 * @param e - The event object from the form submission.
 */
function submitMessage(e: Event) {
    const form = e.target;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);

    let templates: { templatelist: string[], templateTalkPageList: string[] } = extractParamsFromInput(input);

    if (templates.templatelist.length < 1 && templates.templateTalkPageList.length < 1) {
        return alert('No se ha seleccionado ninguna plantilla');
    }

    templates.templatelist = groupTemplates(templates.templatelist);
    const groupedTemplateWarning = createGroupedWarning(templates.templatelist);

    const statusWindow = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow);
    new Morebits.status("Paso 1", `generando plantilla(s)...`, "info");

    makeAllEdits(templates.templatelist, templates.templateTalkPageList, input)
        .then(async () => {
            if (!input.notify) return;
            const pageCreator = await getCreator();
            postsMessage(templates.templatelist, groupedTemplateWarning, pageCreator)
        })
        .then(() => {
            finishMorebitsStatus(Window, statusWindow, "finished", true)
        })
        .catch((error) => {
            finishMorebitsStatus(Window, statusWindow, "error");
            console.error(`Error: ${error}`);
        })

}

export { createFormWindow }