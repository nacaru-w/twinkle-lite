import { ListElementData, QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { api, createStatusWindow, currentPageName, currentPageNameNoUnderscores, finishMorebitsStatus, getCategories, getContent, getCreator, isPageMissing, removeUnderscores, showConfirmationDialog, stripCdbPrefix } from "./../utils/utils";
import { ApiEditPageParams } from "types-mediawiki/api_params";
import { WikimediaCategory } from "types/twinkle-types";

// Declaring the variable that will eventually hold the form window now will allow us to manipulate it more easily  later
let Window: SimpleWindowInstance;
let step = 0;
let deletionPage: string;
let deletionPageNoPrefix: string;

// This is the dictionary holding the options for the categories deletion requests can be classified as
const deletionRequestCategoryOptions: { code: string, name: string }[] = [
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

/**
 * Converts the deletion request categories into a format recognized by Morebits.
 * @returns A list of category options formatted for use in a dropdown menu.
 */
function getCategoryOptions(): ListElementData[] {
    let categoryOptions = [];
    for (let category of deletionRequestCategoryOptions) {
        let option = { type: 'option', value: category.code, label: category.name };
        categoryOptions.push(option);
    }
    return categoryOptions;
}

/**
 * Constructs the deletion template to be used on the deletion discussion page.
 * @param category - The category code for the deletion request.
 * @param reason - The reason provided for the deletion request.
 * @returns A Wikicode string representing the deletion template.
 */
function buildDeletionTemplate(category: string, reason: string) {
    const template = `{{sust:abreCdb|pg=${currentPageNameNoUnderscores}|cat=${category}|motivo=${reason}}} ~~~~`
    return template;
}

/**
 * Checks if a deletion request page has already been closed.
 * @param requestContent - The content of the deletion request page.
 * @param mappedCategories - The categories associated with the deletion request page.
 * @returns A boolean indicating if the deletion request page has already been closed.
 */
function isRequestClosed(
    requestContent: string,
    mappedCategories: string[] | undefined
): boolean {
    if (!requestContent) return false;

    const hasTemplates =
        requestContent.includes('{{archivo borrar cabecera') ||
        requestContent.includes('{{cierracdb-arr}}');

    const hasClosedCategory =
        mappedCategories?.some(c =>
            c.includes('Consultas de borrado con resultado')
        ) ?? false;

    return hasTemplates || hasClosedCategory;
}


/**
 * Creates a deletion request page if it doesn't already exist. If the page exists and has been closed, 
 * it prompts the user to start a second deletion discussion.
 * @param category - The category code for the deletion request.
 * @param reason - The reason provided for the deletion request.
 * @returns A promise that resolves when the deletion request page is created or the process is interrupted.
 */
async function createDeletionRequestPage(category: string, reason: string) {
    const missingPage: boolean = await isPageMissing(`Wikipedia:Consultas de borrado/${currentPageName}`);
    if (missingPage) {
        deletionPage = `Wikipedia:Consultas de borrado/${currentPageName}`
        deletionPageNoPrefix = stripCdbPrefix(deletionPage)
        return api.create(deletionPage,
            { summary: `Creando página de discusión para el borrado de [[${currentPageNameNoUnderscores}]], mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
            buildDeletionTemplate(category, reason)
        );
    } else {
        const content: string | null = await getContent(`Wikipedia:Consultas de borrado/${currentPageName}`);
        const deletionPageCategories = await getCategories(`Wikipedia:Consultas de borrado/${currentPageName}`);
        const mappedCategories = deletionPageCategories?.map((category: WikimediaCategory) => category.title);
        if (content && isRequestClosed(content, mappedCategories)) {
            const confirmMessage = `Parece que ya se había creado una consulta de borrado para ${currentPageNameNoUnderscores} cuyo resultado fue MANTENER. ¿Quieres abrir una segunda consulta?`;
            if (confirm(confirmMessage)) {
                deletionPage = `Wikipedia:Consultas de borrado/${currentPageName}_(2.ª_consulta)`
                deletionPageNoPrefix = stripCdbPrefix(deletionPage)
                return api.create(
                    deletionPage,
                    { summary: `Creando página de discusión para el borrado de [[${currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
                    buildDeletionTemplate(category, reason)
                )
            } else {
                new Morebits.status("Proceso interrumpido", "acción abortada por el usuario... actualizando página", "error")
                setTimeout(() => { location.reload() }, 4000);
                return null
            }
        } else {
            alert('Parece que ya existe una consulta en curso')
            new Morebits.status("Proceso interrumpido", "ya existe una consulta en curso", "error");
            setTimeout(() => { location.reload() }, 4000);
            return null
        }
    }
}

/**
 * Builds the edit parameters required to place the deletion template on the nominated page.
 * @param revision - The current revision of the page to be edited.
 * @returns An object containing the parameters necessary to make the edit.
 */
function buildEditOnNominatedPage(revision: any): ApiEditPageParams {
    return {
        text: `{{sust:cdbM|página=${deletionPageNoPrefix}}}\n` + revision.content,
        summary: `Añadiendo plantilla de consulta de borrado, véase [[Wikipedia:Consultas de borrado/${removeUnderscores(deletionPageNoPrefix)}]]; mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
        minor: false
    }
}

/**
 * Edits additional pages that have been nominated for deletion in the same discussion,
 * adding a cross-reference to the main nominated page.
 * @param article - The title of the article to be edited.
 * @returns A promise that resolves when the edit is complete.
 */
async function makeEditOnOtherNominatedPages(article: string): Promise<void> {
    await api.edit(
        article,
        (revision): ApiEditPageParams => {
            return {
                text: `{{sust:cdbM|página=${deletionPageNoPrefix}}}\n` + revision.content,
                summary: `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${deletionPageNoPrefix}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                minor: false
            }
        }
    )
}

/**
 * Posts a notification message on the talk page of the creator of the article, 
 * informing them of the deletion discussion.
 * @param creator - The username of the article's creator.
 * @param category - The category code of the article.
 * @returns A promise that resolves when the message is posted or the process is interrupted.
 */
async function notifyUser(creator: string | null, category: string): Promise<void> {
    if (creator) {
        const mustCreateNewTalkPage = await isPageMissing(`Usuario_discusión:${creator}`);
        if (mustCreateNewTalkPage) {
            return api.create(
                `Usuario_discusión:${creator}`,
                { summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Twinkle Lite|Twinkle Lite]]' },
                `{{sust:Aviso autor cdb|pg=${currentPageNameNoUnderscores}|cat=${category}}} ~~~~`
            )
        } else {
            return api.edit(
                `Usuario_discusión:${creator}`,
                (revision): ApiEditPageParams => {
                    return {
                        text: revision.content + `\n{{sust:Aviso autor cdb|pg=${currentPageNameNoUnderscores}|cat=${category}} ~~~~`,
                        summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Twinkle Lite|Twinkle Lite]]',
                        minor: false
                    }
                }
            )
        }
    }
}

/**
 * Handles the form submission event, orchestrating the creation of the deletion discussion page, 
 * editing the nominated page(s), and notifying the article's creator.
 * @param e - The form submission event.
 */
async function submitMessage(e: Event) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const input = Morebits.quickForm.getInputData(form);

    if (input.reason === ``) {
        alert("No se ha establecido un motivo.");
        return;
    }

    if (!showConfirmationDialog(`Esto creará una consulta de borrado para el artículo ${currentPageNameNoUnderscores}, ¿estás seguro?`)) {
        return;
    }

    const statusWindow = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow);
    new Morebits.status(`Paso ${step += 1}`, "comprobando disponibilidad y creando la página de discusión de la consulta de borrado...", "info");

    createDeletionRequestPage(input.category, input.reason)
        .then(function (result) {
            if (result == null) throw 'aborted';
            new Morebits.status(`Paso ${step += 1}`, "colocando plantilla en la(s) página(s) nominada(s)...", "info");
            return api.edit(currentPageName, buildEditOnNominatedPage);
        })
        .then(async function () {
            if (!input.notify) return;
            new Morebits.status(`Paso ${step += 1}`, "publicando un mensaje en la página de discusión del creador...", "info");
            const creator: string | null = await getCreator();
            return notifyUser(creator, input.category);
        })
        .then(function () {
            finishMorebitsStatus(Window, statusWindow, 'finished', true);
        })
        .catch(function (error) {
            if (error === 'aborted') return;
            finishMorebitsStatus(Window, statusWindow, 'error');
        });
}

/**
 * Creates the form window where the user will input the deletion request details.
 */
export function createDeletionRequestMarkerFormWindow(): void {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Consulta de borrado');
    Window.addFooterLink('Política de consultas de borrado', 'Wikipedia:Consultas de borrado mediante argumentación');

    const form = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'textarea',
        name: 'reason',
        label: 'Describe el motivo:',
        tooltip: 'Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente.'
    });

    const categoryField: QuickFormElementInstance = form.append({
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
                label: "Aplicar la CDB a más artículos (temporalmente deshabilitado)",
                checked: false,
                disabled: true
            }],
        style: "padding-left: 1em; padding-bottom:0.5em;",
        event: (e: any) => {
            // Morebits' buttons value is in English by default and there is no other way to translate the text that doesn't involve DOM manipulation
            // This fuction will find those values and translate them into Spanish
            const checked = e.target.checked
            const box = document.getElementById('otherArticleFieldBox');
            if (box) {
                if (checked) {
                    box.style.display = '';
                    const boxAddButton = document.querySelector('input[value="more"]') as HTMLButtonElement;
                    if (boxAddButton) {
                        boxAddButton.value = "añadir";
                        boxAddButton.style.marginTop = '0.3em';
                        boxAddButton.addEventListener('click', () => {
                            const boxRemoveButton = document.querySelector('input[value="remove"]') as HTMLButtonElement;
                            if (boxRemoveButton) {
                                boxRemoveButton.value = "eliminar";
                                boxRemoveButton.style.marginLeft = '0.3em';
                            }
                        })
                    }
                }
                else {
                    box.style.display = 'none';
                }
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

    form.append({
        type: 'submit',
        label: 'Aceptar'
    });

    const result = form.render();
    Window.setContent(result);
    Window.display();
}