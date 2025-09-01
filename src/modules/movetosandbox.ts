import { QuickFormElementInstance, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { createPage, createStatusWindow, currentPageName, currentPageNameNoUnderscores, currentUser, finishMorebitsStatus, getCreator, isCurrentUserSysop, isPageMissing, movePage, showConfirmationDialog } from "./../utils/utils";

let Window: SimpleWindowInstance;
let creator: string | null;
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

export async function createMTSFormWindow() {
    creator = await getCreator();

    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle(`Trasladar artículo al taller del usuario ${creator}`);
    Window.addFooterLink('Talleres de usuario', 'Ayuda:Taller')

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    const textAreaAndReasonField = form.append({
        type: 'field',
        label: 'Opciones:',
    });

    textAreaAndReasonField.append({
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

    form.append({
        type: 'textarea',
        name: 'reason',
        label: 'Añade un comentario (opcional)',
        tooltip: 'Añade un comentario explicando las razones que aparecerá junto al mensaje dejado en la página de discusión del usuario.'
    })

    form.append({
        type: 'submit',
        label: 'Aceptar'
    })

    const result = form.render();
    Window.setContent(result);
    Window.display();
}

/**
 * Calls the MW API to move the current article to the user's sandbox page.
 * If it's in use, it moves it into a subpage
 */
async function movePageToSandbox() {
    new Morebits.status(`Paso ${step += 1}`, "moviendo la página al taller del usuario", "info");

    const sandbox = `Usuario:${creator}/Taller`;
    const isSubSandboxEmpty = await isPageMissing(`${sandbox}/${currentPageName}`);
    destinationPage = isSubSandboxEmpty ? `${sandbox}/${currentPageName}` : `${sandbox}/${currentPageName}/2`

    await movePage(currentPageName, {
        destination: destinationPage,
        removeRedirect: true,
        moveTalk: false,
        watch: true,
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
    const summaryMessage = `Avisando al usuario del traslado de su artículo ${currentPageNameNoUnderscores} al [[${destinationPage}|taller]] mediante [[WP:TL]]`;
    const talkPageTemplate = `{{sust:Aviso traslado al taller|${currentPageNameNoUnderscores}|${destinationPage.endsWith('/2') ? `${currentPageName}/2` : currentPageName}|razón=${moveReason}}} ~~~~`;
    const isTalkEmpty = await isPageMissing(`Usuario_discusión:${creator}`)
    if (isTalkEmpty) {
        return await createPage(
            `Usuario_discusión:${creator}`,
            talkPageTemplate,
            summaryMessage
        )
    } else {
        return await new mw.Api().edit(
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
    if (!isCurrentUserSysop) {
        new Morebits.status(`Paso ${step += 1}`, "solicitando el borrado de la redirección...", "info");
        return await new mw.Api().edit(
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
}

async function submitMessage(e: Event) {
    if (showConfirmationDialog('¿Seguro que quieres trasladar este artículo al taller del usuario?')) {
        const form = e.target as HTMLFormElement;
        const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);
        const moveReason = input.reason;

        const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
        createStatusWindow(statusWindow);

        try {
            await movePageToSandbox();
            if (input.notify) await postMessageOnTalkPage(moveReason);
            await postDeletionTemplate();
            finishMorebitsStatus(Window, statusWindow, 'finished', true);
        } catch (error) {
            finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(`Error: ${error}`);
        }
    }
}