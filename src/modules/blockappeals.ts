import { SimpleWindowInstance } from "types/morebits-types";

let Window: SimpleWindowInstance;

function submitMessage(e: Event) {
    console.log(e)
}

const resolutionOptions: string[] = ['Desbloquear', 'Mantener bloqueo', 'Extender bloqueo'];

function getResolutionOptions() {
    return resolutionOptions.map((e) => {
        return { type: 'option', value: e, label: e };
    })
}

export function createBlockAppealsWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Revisar apelación de bloqueo');
    Window.addFooterLink('Guía para apelar bloqueos', 'Ayuda:Guía para apelar bloqueos');

    const form = new Morebits.quickForm(submitMessage);

    const resolutionDiv = form.append({
        type: 'field',
        name: 'appealDiv',
        label: 'Resolución:'
    })

    resolutionDiv.append({
        type: 'select',
        id: 'resolutionSelect',
        name: 'resolutionSelect',
        label: 'Selecciona el resultado de la resolución:',
        list: getResolutionOptions()
    })

    resolutionDiv.append({
        type: 'textarea',
        id: 'resolutionTextarea',
        name: 'resolutionTextarea',
        label: 'Describe detalladamente la resolución:',
        tooltip: 'Puedes usar Wikicódigo, pero no es necesario que añades la firma, esta aparecerá de forma automática.'
    })

    const result = form.render();
    Window.setContent(result);
    Window.display();

}