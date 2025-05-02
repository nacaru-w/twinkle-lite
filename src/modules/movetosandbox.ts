import { QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { currentPageName, getCreator } from "./../utils/utils";

let Window: SimpleWindowInstance;

export async function createMTSFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Trasladar artículo al taller del usuario');
    Window.addFooterLink('Taller de usuario', 'Ayuda:Taller')

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);


    const result = form.render();
    Window.setContent(result);
    Window.display();

}

async function submitMessage(e: Event) {
    const creator = await getCreator();
    console.log(creator)
}