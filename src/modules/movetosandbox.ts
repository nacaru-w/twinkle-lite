import { QuickFormElementInstance, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { createPage, createStatusWindow, currentPageName, finishMorebitsStatus, getContent, getCreator, isPageMissing, movePage } from "./../utils/utils";

let Window: SimpleWindowInstance;
let creator: string | null;
let destinationPage: string;
let step = 0;

export async function createMTSFormWindow() {
    creator = await getCreator();

    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle(`Trasladar artículo al taller del usuario ${creator}`);
    Window.addFooterLink('Talleres de usuario', 'Ayuda:Taller')

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

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
    step += 1;

    new Morebits.status(`Paso ${step}`, "moviendo la página al taller del usuario", "info");

    const sandbox = `Usuario:${creator}/Taller`;
    const isSandboxEmpty = await isPageMissing(sandbox);
    destinationPage = isSandboxEmpty ? sandbox : `${sandbox}/${currentPageName}`

    await movePage(currentPageName, {
        destination: destinationPage,
        leaveRedirect: false,
        moveTalk: false,
        watch: true
    });
}

/**
 * Leaves a warning template on the creator's talk page, creating one if it doesn't exist
 * @param moveReason - the reason why the page was moved as described in the form
 */
async function postMessageOnTalkPage(moveReason: string) {
    step += 1;

    new Morebits.status(`Paso ${step}`, "publicando un mensaje en la página de discusión del creador...", "info");
    const summaryMessage = `Avisando al usuario del traslado de su artículo ${currentPageName} al [[${destinationPage}|taller]] mediante [[WP:TL]]`;
    const talkPageTemplate = `{{Aviso traslado al taller|${currentPageName}|${destinationPage.endsWith('/Taller') ? '' : currentPageName}|razón=${moveReason}}}`;
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

async function submitMessage(e: Event) {
    const form = e.target as HTMLFormElement;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);
    const moveReason = input.reason;

    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow);

    try {
        await movePageToSandbox();
        await postMessageOnTalkPage(moveReason);
        finishMorebitsStatus(Window, statusWindow, 'finished', true);
    } catch (error) {
        finishMorebitsStatus(Window, statusWindow, 'error');
        console.error(`Error: ${error}`);
    }

}