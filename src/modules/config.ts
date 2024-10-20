import { SimpleWindowInstance } from "types/morebits-types";

let Window: SimpleWindowInstance;

function submitMessage(e: Event) {

}

export function createConfigWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Preferencias de Twinkle Lite');
    Window.addFooterLink('Documentación de Twinkle Lite', 'WP:TL')

    const form = new Morebits.quickForm(submitMessage);

    const result = form.render();
    Window.setContent(result);
    Window.display();

}