import { QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";

let Window: SimpleWindowInstance;
let step = 0;

export async function createRestorationRequestFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Solicitar restauración');
    Window.addFooterLink('Tablón de restauraciones', 'Wikipedia:Tablón de anuncios de los bibliotecarios/Portal/Archivo/Solicitudes de restauración/Actual');

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);


    const result = form.render();
    Window.setContent(result);
    Window.display();
}

function submitMessage() {
    console.log("doneee");
}