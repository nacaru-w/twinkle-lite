import { QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { PageRestorationType, RestorationRequestInput } from "types/twinkle-types";
import { appendSectionToPage, createStatusWindow, currentPageName, currentPageNameNoUnderscores, finishMorebitsStatus, getCreator, getDeletedPageCreator } from "./../utils/utils";

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
        type: 'input',
        name: 'deletedPageName',
        label: 'Nombre del artículo borrado:',
        value: currentPageNameNoUnderscores,
        tooltip: 'Proporciona aquí el nombre del artículo que fue borrado, sin el prefijo «Wikipedia:». Por ejemplo, si la página borrada fue «Wikipedia:Ejemplo», solo debes escribir «Ejemplo».',
        required: true,
        style: 'margin-block: 0.25em;'
    });

    redTemplateDeletionField.append({
        type: 'textarea',
        name: 'reason',
        label: 'Describe el motivo:',
        tooltip: 'Describe aquí el motivo por el cual crees que el artículo debería de ser restaurado. Puedes usar wikicódigo en tu descripción. NO AÑADAS TU FIRMA, se hará automáticamente.',
        required: true
    })

    redTemplateDeletionField.append({
        type: 'checkbox',
        list: [{
            name: 'notify',
            value: 'notify',
            label: 'Avisar al usuario que creó inicialmente el artículo (si es posible)',
            tooltip: 'Marca esta casilla si quieres que se le notifique al usuario que creó inicialmente el artículo dejándole un mensaje en su página de discusión. Se omitirá si el usuario de la solicitud coincide con el creador.',
            checked: false
        }],
    });

    // Menu for pages deleted through deletion request
    const deletionThroughRequestField = form.append({
        type: 'field',
        name: 'deletionThroughRequestReasonField',
        label: 'Opciones',
        style: 'display: none;'
    })
    deletionThroughRequestField.append({
        type: 'input',
        name: 'sandboxPageLink',
        label: 'Enlace a la página del taller:',
        tooltip: 'Proporciona aquí el enlace interno al taller donde se encuentra la nueva versión del artículo que quieres restaurar. Por ejemplo, «Usuario:Nombre/taller».',
        required: true
    });

    deletionThroughRequestField.append({
        type: 'input',
        name: 'rDeletedPageName',
        label: 'Nombre del artículo borrado:',
        value: currentPageNameNoUnderscores,
        tooltip: 'Proporciona aquí el nombre del artículo que fue borrado, sin el prefijo «Wikipedia:». Por ejemplo, si la página borrada fue «Wikipedia:Ejemplo», solo debes escribir «Ejemplo».',
        required: true,
        style: 'margin-block: 0.25em;'
    });

    deletionThroughRequestField.append({
        type: 'input',
        name: 'deletionDiscussionPageLink',
        label: 'Consulta de borrado:',
        value: `Wikipedia:Consultas de borrado/${currentPageNameNoUnderscores}`,
        tooltip: 'Proporciona aquí el enlace interno a la página donde se produjo la consulta de borrado. Por ejemplo, «Wikipedia:Consultas de borrado/Ejemplo».',
        required: true,
        style: 'margin-bottom: 0.5em; width: 100%;',
    });


    deletionThroughRequestField.append({
        type: 'textarea',
        name: 'rReason',
        label: 'Describe el motivo:',
        tooltip: 'Describe aquí el motivo por el cual crees que el artículo debería de ser restaurado. Puedes usar wikicódigo en tu descripción. NO AÑADAS TU FIRMA, se hará automáticamente.',
        required: true
    });

    deletionThroughRequestField.append({
        type: 'checkbox',
        list: [{
            name: 'rNotify',
            value: 'rNotify',
            label: 'Avisar al usuario que creó inicialmente el artículo (si es posible)',
            tooltip: 'Marca esta casilla si quieres que se le notifique al usuario que creó inicialmente el artículo dejándole un mensaje en su página de discusión. Se omitirá si el usuario de la solicitud coincide con el creador.',
            checked: false
        }],
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

function getNoticeboardMessage(page: string, reason: string, deletionDiscussionLink?: string, sandboxLink?: string): string {
    if (chosenRestorationType === 'redTemplateDeletion') {
        return `
; Artículo
* {{a|${page}}}
; Razón
* ${reason}
; Usuario que lo solicita
* ~~~~
; Respuesta
(a rellenar por un bibliotecario)
`
    } else {
        return `
; Consulta
* ${reason}
; Enlace a la consulta de borrado
* [[${deletionDiscussionLink}]]
; Enlace al taller
* [[${sandboxLink}]]
; Usuario que consulta
* ~~~~
; Respuesta
(a rellenar por un bibliotecario)
`
    }
}

async function generateUserNotification(noticeboard: string, deletedPage: string): Promise<string> {
    return `
''(Este es un aviso generado automáticamente a través de [[WP:TL|Twinkle Lite]])''\n
He creado una solicitud para la restauración de un artículo que creaste: [[${deletedPage}]]. Puedes consultarla en el [[${noticeboard}#Solicitud de restauración de ${deletedPage}|tablón correspondiente]]. Saludos. ~~~~
`
}


async function notifyUser(deletedPage: string): Promise<void> {
    new Morebits.status(`Paso ${step += 1}`, "avisando al usuario...", "info");
    const creator = await getDeletedPageCreator(currentPageName);
    if (creator) {
        await appendSectionToPage(
            `Usuario_discusión:${creator}`,
            `Aviso de solicitud de restauración mediante [[WP:TL|Twinkle Lite]]`,
            `Aviso de solicitud de restauración del artículo [[${deletedPage}]]`,
            await generateUserNotification(noticeboardDictionary[chosenRestorationType!], deletedPage)
        )
    }
}

async function submitMessage(event: Event): Promise<void> {
    const form = event.target as HTMLFormElement;
    const input: RestorationRequestInput = Morebits.quickForm.getInputData(form);
    const deletedPage = (chosenRestorationType === 'redTemplateDeletion' ? input.deletedPageName : input.rDeletedPageName).trim();
    const reason = chosenRestorationType === 'redTemplateDeletion' ? input.reason : input.rReason;
    const notifyCreator = chosenRestorationType === 'redTemplateDeletion' ? input.notify : input.rNotify;

    // if (showConfirmationDialog(`¿Seguro que quieres solicitar la restauración de esta página?`)) {
    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(350, 100);
    createStatusWindow(statusWindow);
    new Morebits.status(`Paso ${step += 1}`, 'Extrayendo información del formulario...', "info");

    console.log("creator", await getDeletedPageCreator(currentPageName));
    console.log("input", input)

    if (chosenRestorationType) {
        try {
            new Morebits.status(`Paso ${step += 1}`, 'Creando la solicitud en el tablón correspondiente...', "info");
            await appendSectionToPage(
                noticeboardDictionary[chosenRestorationType],
                `Creando solicitud de restauración de ${deletedPage} mediante [[WP:TL|Twinkle Lite]]`,
                `Solicitud de restauración de [[${deletedPage}]]`,
                getNoticeboardMessage(deletedPage, reason, input.deletionDiscussionPageLink, input.sandboxPageLink)
            )
            if (notifyCreator) await notifyUser(deletedPage);
            finishMorebitsStatus(Window, statusWindow, 'finished', false);

        } catch (error) {
            finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(`Error: ${error}`);
        }
    }
    // }

}