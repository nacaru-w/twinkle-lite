import { QuickFormElementInstance, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { api, createPage, createStatusWindow, currentPageName, currentPageNameNoUnderscores, currentUser, editPage, finishMorebitsStatus, getContent, getCreator, isCurrentUserSysop, isPageMissing, movePage, pageHasDeletionTemplate, removeDeletionPageFromContent, showConfirmationDialog } from "./../utils/utils";

let Window: SimpleWindowInstance;
let creator: string | null;
let pageContent: string | null;
let hasDeletionTemplate: boolean;
let destinationPage: string;
let step = 0;

/**
 * Adds the disable attribute to the reason textarea element
 * 
 * @param disable - whether the area should be set to disabled or not
 */
function toggleTextAreaDisable(disable: boolean) {
    const textarea = document.querySelector("textarea[name='reason']");
    if (disable) {
        textarea?.setAttribute("disabled", 'true');
    } else {
        textarea?.removeAttribute("disabled");
    }
}

/**
 * Retrieves the content of the current page and checks if it has a deletion template.
 * If the current user is a sysop, it will set the page content and hasDeletionTemplate variables.
 * @returns A promise that resolves when the function has completed.
 */
async function setDeletionTemplateConfig(): Promise<void> {
    pageContent = await getContent(currentPageName);
    hasDeletionTemplate = pageHasDeletionTemplate(pageContent);
}

export async function createMTSFormWindow() {
    creator = await getCreator();
    if (isCurrentUserSysop) await setDeletionTemplateConfig();

    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle(`Trasladar artículo al taller del usuario ${creator}`);
    Window.addFooterLink('Talleres de usuario', 'Ayuda:Taller')

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    const optionsField = form.append({
        type: 'field',
        label: 'Opciones:',
    });

    optionsField.append({
        type: 'checkbox',
        list: [{
            name: "notify",
            value: "notify",
            label: "Dejar un mensaje en la página de discusión del creador",
            checked: true,
            tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador avisándole del traslado."
        }],
        event: (e: Event) => {
            const target = e.target as HTMLInputElement;
            if (target) {
                const notify = target.checked;
                toggleTextAreaDisable(!notify);
            }
        }
    })

    optionsField.append({
        type: 'checkbox',
        list: [{
            name: "watch",
            value: "watch",
            label: "Vigilar la página trasladada",
            checked: false,
        }]
    })

    if (isCurrentUserSysop) {
        optionsField.append({
            type: 'checkbox',
            list: [{
                name: 'removeDeletionTemplate',
                value: 'removeDeletionTemplate',
                label: 'Eliminar plantilla de borrado al realizar el traslado',
                checked: false,
                disabled: !hasDeletionTemplate,
                tooltip: 'Esta opción solo está disponible cuando el artículo incluye una plantilla de borrado rápido.'
            }],
        })
    }

    form.append({
        type: 'textarea',
        name: 'reason',
        label: 'Añade un comentario (opcional)',
        tooltip: 'Añade un comentario explicando las razones que aparecerá junto al mensaje dejado en la página de discusión del usuario.',
        style: 'margin-bottom: 0.5em;',
    })

    form.append({
        type: 'submit',
        label: 'Trasladar'
    })

    const result = form.render();
    Window.setContent(result);
    Window.display();
}

/**
 * Removes the deletion template from the page.
 * 
 * This function is called when the user selects the option to remove the deletion template
 * from the page. It will edit the page and remove the deletion template.
 * 
 * @returns A promise that resolves when the action is completed.
 */
async function removeDeletionTemplate() {
    new Morebits.status(`Paso ${step += 1}`, "eliminando la plantilla de borrado rápido", "info");
    await editPage(
        currentPageName,
        'Eliminando la plantilla de borrado rápido mediante [[WP:TL|Twinkle Lite]]',
        removeDeletionPageFromContent(pageContent!),
    )
}

/**
 * Calls the MW API to move the current article to the user's sandbox page.
 * If it's in use, it moves it into a subpage
 */
async function movePageToSandbox(watch: boolean) {
    new Morebits.status(`Paso ${step += 1}`, "moviendo la página al taller del usuario", "info");

    const sandbox = `Usuario:${creator}/Taller`;
    const isSubSandboxEmpty = await isPageMissing(`${sandbox}/${currentPageName}`);
    destinationPage = isSubSandboxEmpty ? `${sandbox}/${currentPageName}` : `${sandbox}/${currentPageName}/2`

    await movePage(currentPageName, {
        destination: destinationPage,
        removeRedirect: true,
        moveTalk: false,
        watch: watch,
        reason: 'Traslado al taller para que el usuario pueda seguir trabajando en el artículo (mediante [[WP:TL|Twinkle Lite]])'
    });
}

/**
 * Leaves a warning template on the creator's talk page, creating one if it doesn't exist
 * @param moveReason - the reason why the page was moved as described in the form
 */
async function postMessageOnTalkPage(moveReason: string) {
    if (creator == currentUser) return;

    new Morebits.status(`Paso ${step += 1}`, "publicando un mensaje en la página de discusión del creador...", "info");
    const summaryMessage = `Avisando al usuario del traslado de su artículo ${currentPageNameNoUnderscores} al [[${destinationPage}|taller]] mediante [[WP:TL|Twinkle Lite]]`;
    const talkPageTemplate = `{{sust:Aviso traslado al taller|${currentPageNameNoUnderscores}|${destinationPage.endsWith('/2') ? `${currentPageName}/2` : currentPageName}|razón=${moveReason}}} ~~~~`;
    const isTalkEmpty = await isPageMissing(`Usuario_discusión:${creator}`)
    if (isTalkEmpty) {
        return await createPage(
            `Usuario_discusión:${creator}`,
            talkPageTemplate,
            summaryMessage
        )
    } else {
        return await api.edit(
            `Usuario_discusión:${creator}`,
            (revision: any) => {
                return {
                    text: revision.content + `\n${talkPageTemplate}`,
                    summary: summaryMessage,
                    minor: false
                }
            }
        )
    }
}

async function postDeletionTemplate() {
    new Morebits.status(`Paso ${step += 1}`, "solicitando el borrado de la redirección...", "info");
    return await api.edit(
        currentPageName,
        (revision: any) => {
            return {
                text: '{{destruir|r2}}\n' + revision.content,
                summary: 'Dejando una plantilla de borrado en la página ahora trasladada mediante [[WP:TL|Twinkle Lite]].',
                minor: false
            }
        }
    )
}

async function submitMessage(e: Event) {
    if (showConfirmationDialog('¿Seguro que quieres trasladar este artículo al taller del usuario?')) {
        const form = e.target as HTMLFormElement;
        const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);
        const moveReason = input.reason;

        const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
        createStatusWindow(statusWindow);

        try {
            if (input.removeDeletionTemplate) await removeDeletionTemplate();
            await movePageToSandbox(input.watch);
            if (input.notify) await postMessageOnTalkPage(moveReason);
            if (!isCurrentUserSysop) await postDeletionTemplate();
            finishMorebitsStatus(Window, statusWindow, 'finished', true);
        } catch (error) {
            finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(`Error: ${error}`);
        }
    }
}