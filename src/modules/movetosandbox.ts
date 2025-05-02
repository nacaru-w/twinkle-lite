import { QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { createStatusWindow, currentPageName, finishMorebitsStatus, getContent, getCreator, isPageMissing, movePage } from "./../utils/utils";

let Window: SimpleWindowInstance;
let creator: string | null;
let step = 0;

export async function createMTSFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Trasladar artículo al taller del usuario');
    Window.addFooterLink('Talleres de usuario', 'Ayuda:Taller')

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    creator = await getCreator();

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

    await movePage(currentPageName,
        isSandboxEmpty ? sandbox : `${sandbox}/${currentPageName}`,
        false,
        false
    );
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