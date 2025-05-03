import { QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { createStatusWindow, currentPageName, finishMorebitsStatus, getContent, getCreator, isPageMissing, movePage } from "./../utils/utils";

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

async function movePageToSandbox() {
    new Morebits.status(`Paso ${step + 1}`, "moviendo la página al taller del usuario", "info");

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

async function postMessageOnTalkPage() {
    console.log('postmessageontalkpage called')
}

async function submitMessage(e: Event) {
    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow);

    try {
        await movePageToSandbox()
        postMessageOnTalkPage();
        finishMorebitsStatus(Window, statusWindow, 'finished', true);
    } catch (error) {
        finishMorebitsStatus(Window, statusWindow, 'error');
        console.error(`Error: ${error}`);
    }

}