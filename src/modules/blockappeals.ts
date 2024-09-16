import { SimpleWindowInstance } from "types/morebits-types";

let Window: SimpleWindowInstance;

function submitMessage(e: Event) {
    console.log(e)
}

export function createBlockAppealsWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Revisar apelación de bloqueo');
    Window.addFooterLink('Guía para apelar bloqueos', 'Ayuda:Guía para apelar bloqueos');

    const form = new Morebits.quickForm(submitMessage);

    const appealDiv = form.append({
        type: 'div',
        name: 'appealDiv',
        label: 'Opciones'
    })

    const result = form.render();
    Window.setContent(result);
    Window.display();

}