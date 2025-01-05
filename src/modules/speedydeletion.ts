import { QuickFormElementInstance, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { SpeedyDeletionCriteriaType, SpeedyDeletionCriteriaCategories } from "types/twinkle-types";
import { createStatusWindow, currentNamespace, currentPageName, currentPageNameNoUnderscores, currentUser, finishMorebitsStatus, getContent, getCreator, isPageMissing } from "./../utils/utils";

let Window: SimpleWindowInstance
let deletionTemplateExists: boolean;

let criteriaLists: SpeedyDeletionCriteriaCategories = {
    general: [
        { code: "g1", name: "G1. Vandalismo" },
        { code: "g2", name: "G2. Faltas de etiqueta" },
        { code: "g3", name: "G3. Páginas promocionales" },
        { code: "g4", name: "G4. Páginas de pruebas de edición" },
        { code: "g5", name: "G5. Bulos, fraudes" },
        { code: "g6", name: "G6. Violaciones de derechos de autor" },
        { code: "g7", name: "G7. Páginas de discusión huérfanas" },
        { code: "g8", name: "G8. Borrado de una página para dejar sitio" },
        { code: "g9", name: "G9. Recreación de material borrado" },
        { code: "g10", name: "G10. Para mantenimiento elemental" },
        { code: "g11", name: "G11. A petición del único autor" }
    ], articles: [
        {
            code: "a1", name: "A1. Viola «lo que Wikipedia no es»", subgroup: {
                type: 'checkbox',
                name: 'subA',
                list: [
                    { value: "a1.1", label: "A1.1 Artículos que solo incluyen enlaces" },
                    { value: "a1.2", label: "A1.2 Definiciones de diccionario o recetas" },
                    { value: "a1.3", label: "A1.3 Fuente primaria" },
                    { value: "a1.4", label: "A1.4 Ensayos de opinión" }
                ]
            },
        },
        { code: "a2", name: "A2. Infraesbozo" },
        { code: "a3", name: "A3. Páginas sin traducir o traducciones automáticas" },
        { code: "a4", name: "A4. Contenido no enciclopédico o sin relevancia" },
        {
            code: "a5", name: "A5. Artículo duplicado", subgroup: {
                type: "input",
                name: "originalArticleName",
                label: "Nombre del artículo original: ",
                tooltip: "Escribe el nombre del artículo sin utilizar wikicódigo. Ej.: «Granada (fruta)», «Ensalada» o «Plantilla:Atajos»",
                required: true
            }
        }
    ], redirects: [
        { code: "r1", name: "R1. Redirecciones a páginas inexistentes" },
        { code: "r2", name: "R2. Redirecciones de un espacio de nombres a otro" },
        { code: "r3", name: "R3. Redirecciones automáticas innecesarias" },
        { code: "r4", name: "R4. Redirecciones incorrectas o innecesarias" },
    ], categories: [
        { code: "c1", name: "C1. Categorías vacías" },
        { code: "c2", name: "C2. Categorías trasladadas o renombradas" },
        { code: "c3", name: "C3. Categorías que violan la política de categorías" }
    ], userpages: [
        { code: "u1", name: "U1. A petición del propio usuario" },
        { code: "u2", name: "U2. Usuario inexistente" },
        { code: "u3", name: "U3. Violación de la política de páginas de usuario" }
    ], templates: [
        { code: "p1", name: "P1. Violación de la política de plantillas de navegación" },
        { code: "p2", name: "P2. Subpágina de documentación huérfana" },
        { code: "p3", name: "P3. Plantillas de un solo uso" }
    ], other: [
        {
            code: "other", name: "Otra razón", subgroup: {
                type: "input",
                name: "otherreason",
                label: "Establece la razón: ",
                tooltip: "Puedes utilizar wikicódigo en tu respuesta",
                required: true
            }
        }
    ]
}

/**
 * Retrieves the list of criteria options for the specified type of speedy deletion.
 * @param {SpeedyDeletionCriteriaType} criteriaType - The type of criteria to retrieve.
 * @returns {Array} An array of criteria options.
 */
function getOptions(criteriaType: SpeedyDeletionCriteriaType): { value: string, label: string, checked?: boolean, subgroup?: any }[] {
    let options = [];
    for (let chosenType of criteriaLists[criteriaType]) {
        let option = { value: chosenType.code, label: chosenType.name, checked: chosenType.default, subgroup: chosenType.subgroup };
        options.push(option);
    }
    return options;
}

/**
 * Creates and displays the Morebits form window.
 */
export async function createSpeedyDeletionFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Solicitar borrado rápido');
    Window.addFooterLink('Criterios para el borrado rápido', 'Wikipedia:Criterios para el borrado rápido');

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

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
        style: "padding-left: 1em; padding-top:0.5em;"
    })

    let gField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Criterios generales:',
    });
    gField.append({
        type: 'checkbox',
        name: 'general',
        list: getOptions("general")
    })

    if (currentNamespace == 0 || currentNamespace == 104 && !mw.config.get('wgIsRedirect')) {
        const aField: QuickFormElementInstance = form.append({
            type: 'field',
            label: 'Criterios para artículos y anexos:',
        })

        aField.append({
            type: 'checkbox',
            name: 'article',
            list: getOptions("articles")
        })
    }

    if (mw.config.get('wgIsRedirect')) {
        const rField: QuickFormElementInstance = form.append({
            type: 'field',
            label: 'Criterios para páginas de redirección:',
        })
        rField.append({
            type: 'checkbox',
            name: 'redirect',
            list: getOptions("redirects")
        })
    }

    if (currentNamespace == 14) {
        const cField: QuickFormElementInstance = form.append({
            type: 'field',
            label: 'Criterios para categorías:',
        })
        cField.append({
            type: 'checkbox',
            name: 'categories',
            list: getOptions("categories")
        })
    }

    if (currentNamespace == 2) {
        const uField: QuickFormElementInstance = form.append({
            type: 'field',
            label: 'Criterios para páginas de usuario:',
        })
        uField.append({
            type: 'checkbox',
            name: 'userpages',
            list: getOptions("userpages")
        })
    }

    if (currentNamespace == 10) {
        const tField: QuickFormElementInstance = form.append({
            type: 'field',
            label: 'Criterios para plantillas:',
        })
        tField.append({
            type: 'checkbox',
            name: 'templates',
            list: getOptions("templates")
        })
    }

    form.append({
        type: 'checkbox',
        name: 'other',
        list: getOptions("other"),
        style: "padding-left: 1em; padding-bottom: 0.5em"
    })

    form.append({
        type: 'submit',
        label: 'Aceptar'
    });

    let result = form.render();
    Window.setContent(result);
    Window.display();
    // After the content has been displayed, we will call the api
    // to check if a deletion template already exists and store
    // the info in a global variable
    deletionTemplateExists = await checkExistingDeletionTemplate();
}

/**
 * Submits the speedy deletion request and handles user notification if necessary.
 * @param {Event} e - The form submission event.
 */
function submitMessage(e: Event) {
    let form = e.target as HTMLFormElement;
    let input: QuickFormInputObject = Morebits.quickForm.getInputData(form);
    //This little condition removes the A1 criterion if any of its subcriteria are included
    if (input?.subA) {
        if (Array.isArray(input.subA) && input.subA.length > 0) {
            if (Array.isArray(input.article)) {
                input.article.shift();
            }
        }
    }
    // This will ask the user to confirm the action if there's a deletion template
    // in the article already, which is info we've previously stored as a global variable 
    if (deletionTemplateExists) {
        if (!confirm('Parece que ya existe una plantilla de borrado en el artículo, ¿deseas colocar la plantilla igualmente?')) {
            return
        }
    }
    const statusWindow = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow)
    new Morebits.status("Paso 1", `generando plantilla de borrado...`, "info");
    new mw.Api().edit(
        currentPageName,
        editBuilder(input)
    )
        .then(function () {
            return getCreator().then(postsMessage(input));
        })
        .then(function () {
            finishMorebitsStatus(Window, statusWindow, 'finished', true)
        })
        .catch(function (error) {
            finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(`Error: ${error}`);
        })
}


/**
 * Checks if a deletion template already exists on the current page.
 * @returns A promise that resolves to true if a deletion template exists, otherwise false.
 */
async function checkExistingDeletionTemplate(): Promise<boolean> {
    const regex: RegExp = /{{(?:sust:)?(?:destruir|d|db-ul|db-user|speedy|borrar|db|delete|eliminar|aviso\sborrar)\|.+?}}/i
    const content: string | null = await getContent(currentPageName);
    if (content && content.match(regex)) {
        return true
    }
    return false
}

/**
 * Builds the edit request payload for adding a speedy deletion template to a page.
 * @param {QuickFormInputObject} data - The input data from the form.
 * @returns A function that takes a revision and returns an edit request payload.
 */
function editBuilder(data: QuickFormInputObject): any {
    let template;
    if (currentNamespace == 10) {
        template = `<noinclude>{{destruir|${allCriteria(data)}}} \n</noinclude>`
    } else {
        template = `{{destruir|${allCriteria(data)}}} \n`
    }
    return (revision: any) => {
        return {
            text: template + revision.content,
            summary: `Añadiendo plantilla de borrado mediante [[WP:Twinkle Lite|Twinkle Lite]]${data?.originalArticleName ? `. Artículo existente de mayor calidad: [[${data.originalArticleName}]]` : ''}`,
            minor: false
        }
    }
}

/**
 * Concatenates all selected criteria into a single string for use in the deletion template.
 * @param {QuickFormInputObject} data - The input data from the form.
 * @returns A string of concatenated criteria.
 */
function allCriteria(data: QuickFormInputObject): string {
    let fields = [];
    for (let criteriaType in data) {
        if (criteriaType !== "other" && Array.isArray(data[criteriaType])) {
            fields.push(...data[criteriaType] as string[]);
        }
    }

    const reasonString = data?.otherreason ?? '';
    if (reasonString != '') {
        fields.push(reasonString);
    }
    return fields.join('|');
}

/**
 * Posts a notification message to the creator's talk page if the notify option is selected.
 * @param input - The input data from the form.
 * @returns A promise that resolves when the message is posted.
 */
function postsMessage(input: QuickFormInputObject): any | Promise<any> {
    if (!input.notify) return;
    return (creator: string) => {
        if (creator == currentUser) {
            return;
        } else {
            new Morebits.status("Paso 2", "publicando un mensaje en la página de discusión del creador...", "info");
            return isPageMissing(`Usuario_discusión:${creator}`)
                .then(function (mustCreateNewTalkPage: boolean) {
                    if (mustCreateNewTalkPage) {
                        return new mw.Api().create(
                            `Usuario_discusión:${creator}`,
                            { summary: `Aviso al usuario del posible borrado de [[${currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
                            `{{subst:Aviso destruir|${currentPageNameNoUnderscores}|${allCriteria(input)}}} ~~~~`
                        );
                    } else {
                        return new mw.Api().edit(
                            `Usuario_discusión:${creator}`,
                            function (revision: any) {
                                return {
                                    text: revision.content + `\n{{subst:Aviso destruir|${currentPageNameNoUnderscores}|${allCriteria(input)}}} ~~~~`,
                                    summary: `Aviso al usuario del posible borrado de [[${currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                                    minor: false
                                }
                            }
                        )
                    }
                })
        }
    }
}