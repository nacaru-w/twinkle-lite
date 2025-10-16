// ** Noticeboard resolution module **
// Handles the resolution of noticeboard entries, including fetching and updating entries.

import { QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { currentPageName, extractNoticeboardTitle } from "./../utils/utils";



let Window: SimpleWindowInstance;
let requestId: string;

async function submitMessage(event: Event): Promise<void> {
    const form = event.target as HTMLFormElement;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);
    console.log(input);
}

export function createNoticeboardResolutionWindow(headingId: string): void {
    // Includes request title with underscores as spaces and, if there are more than one
    // requests with the same title, the number represeting its position in descending
    // chronological order (1 being the oldest).
    requestId = headingId;

    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle(`Resolver petición en ${extractNoticeboardTitle(currentPageName)?.toLowerCase()}`);

    const form = new Morebits.quickForm(submitMessage);

    const textBoxField = form.append({
        type: 'field',
        label: 'Resolución'
    });

    textBoxField.append({
        type: 'textarea',
        name: 'text',
        label: 'Texto de la resolución:',
        tooltip: 'Escribe un mensaje para el usuario que hizo la petición. Puedes usar wikitexto.',
        style: 'margin-top: 0'
    });

    const optionsField = form.append({
        type: 'field',
        label: 'Opciones'
    });

    optionsField.append({
        type: 'checkbox',
        name: 'closeRequest',
        list: [{
            value: 'closeRequest',
            label: 'Avisar al usuario que realizó la petición',
            tooltip: 'Marca esta casilla si quieres que se le notifique al usuario que realizó la petición dejándole un mensaje en su página de discusión.',
            checked: false
        }],
    });

    form.append({
        type: 'submit',
        label: 'Publicar',
    });

    const result = form.render();
    Window.setContent(result);
    Window.display();

}