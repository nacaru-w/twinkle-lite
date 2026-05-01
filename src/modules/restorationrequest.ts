import { QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { PageRestorationType } from "types/twinkle-types";
import { currentPageName, currentPageNameNoUnderscores } from "./../utils/utils";

let Window: SimpleWindowInstance;
let chosenRestorationType: PageRestorationType | null = null;
let step = 0;

const noticeboardDictionary: Record<PageRestorationType, string> = {
    'redTemplateDeletion': 'Wikipedia:Tablón de anuncios de los bibliotecarios/Portal/Archivo/Solicitudes de restauración/Actual',
    'deletionThroughRequest': 'Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Solicitudes_de_nueva_consulta/Actual'
}

export async function createRestorationRequestFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Solicitar restauración');
    Window.addFooterLink('Tablón de restauraciones', 'Wikipedia:Tablón de anuncios de los bibliotecarios/Portal/Archivo/Solicitudes de restauración/Actual');

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    const typeSelectionMenu = form.append({
        type: 'field',
        name: 'restorationTypeRadioMenu',
        label: `¿Cómo fue borrado el artículo?`,
    })

    typeSelectionMenu.append({
        type: 'radio',
        name: 'restorationType',
        id: 'deletionType',
        event: (e: Event) => {
            chosenRestorationType = (e.target as HTMLInputElement).value as PageRestorationType;
            setSubmitButtonDisabled(!chosenRestorationType);
            toggleShowMenu(chosenRestorationType);
        },
        list: [
            {
                label: 'Borrado rápido o por plantilla roja de 30 días',
                value: 'redTemplateDeletion',
            },
            {
                label: 'Borrado a través de consulta de borrado',
                value: 'deletionThroughRequest',
            },
        ]
    })

    // Menu for pages deleted through red templates
    const redTemplateDeletionField = form.append({
        type: 'field',
        name: 'redTemplateDeletionReasonField',
        label: 'Opciones',
        style: 'display: none;'
    })

    redTemplateDeletionField.append({
        type: 'textarea',
        name: 'reason',
        label: 'Describe el motivo:',
        tooltip: 'Describe aquí el motivo por el cual crees que el artículo debería de ser restaurado. Puedes usar wikicódigo en tu descripción. NO AÑADAS TU FIRMA, se hará automáticamente.',
    })

    // Menu for pages deleted through deletion request
    const deletionThroughRequestField = form.append({
        type: 'field',
        name: 'deletionThroughRequestReasonField',
        label: 'Opciones',
        style: 'display: none;'
    })

    deletionThroughRequestField.append({
        type: 'input',
        name: 'deletedPageName',
        label: 'Nombre del artículo borrado:',
        value: currentPageNameNoUnderscores,
        tooltip: 'Proporciona aquí el nombre del artículo que fue borrado, sin el prefijo «Wikipedia:». Por ejemplo, si la página borrada fue «Wikipedia:Ejemplo», solo debes escribir «Ejemplo».',
        required: true
    });

    deletionThroughRequestField.append({
        type: 'input',
        name: 'deletionDiscussionPageName',
        label: 'Consulta de borrado:',
        value: `Wikipedia:Consultas de borrado/${currentPageNameNoUnderscores}`,
        tooltip: 'Proporciona aquí el enlace interno a la página donde se produjo la consulta de borrado. Por ejemplo, «Wikipedia:Consultas de borrado/Ejemplo».',
        required: true,
        style: 'margin-bottom: 0.5em; width: 100%;',
    });

    deletionThroughRequestField.append({
        type: 'input',
        name: 'sandboxPageLink',
        label: 'Enlace a la página del taller:',
        tooltip: 'Proporciona aquí el enlace interno al taller donde se encuentra la nueva versión del artículo que quieres restaurar. Por ejemplo, «Usuario:Nombre/taller».',
        required: true
    });

    deletionThroughRequestField.append({
        type: 'textarea',
        name: 'reason',
        label: 'Describe el motivo:',
        tooltip: 'Describe aquí el motivo por el cual crees que el artículo debería de ser restaurado. Puedes usar wikicódigo en tu descripción. NO AÑADAS TU FIRMA, se hará automáticamente.',
    });

    form.append({
        type: 'submit',
        id: 'restorationSubmitButton',
        label: 'Enviar',
    })

    const result = form.render();
    Window.setContent(result);
    Window.display();

    setSubmitButtonDisabled(!chosenRestorationType);
}

function setSubmitButtonDisabled(disabled: boolean): void {
    const submitButton = document.querySelector<HTMLButtonElement>('.morebits-dialog-buttonpane .submitButtonProxy');
    if (!submitButton) return;
    if (disabled) {
        submitButton.setAttribute('disabled', '');
    } else {
        submitButton.removeAttribute('disabled');
    }
}

function toggleShowMenu(menuToShow: PageRestorationType): void {
    const fields = document.querySelectorAll<HTMLFieldSetElement>('fieldset[name$="ReasonField"]');
    fields.forEach(field => {
        const name = field.getAttribute('name') ?? '';
        const show = name.startsWith(menuToShow);
        field.style.display = show ? '' : 'none';
        field.disabled = !show;
    });
}

function submitMessage() {
    console.log("doneee");
}