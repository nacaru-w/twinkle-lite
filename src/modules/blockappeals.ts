import { QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { api, calculateTimeDifferenceBetweenISO, convertDateToISO, createStatusWindow, currentPageName, finishMorebitsStatus, getBlockInfo, getContent, relevantUserName } from "./../utils/utils";
import { BlockInfoObject } from "types/twinkle-types";

let Window: SimpleWindowInstance;
let blockInfoObject: BlockInfoObject | null;

const resolutionOptions: string[] = ['Rechazo', 'Aprobación'];

function getResolutionOptions() {
    return resolutionOptions.map((e) => {
        return { type: 'option', value: e, label: e };
    })
}

async function fetchAndShowBlockStatus() {
    blockInfoObject = await getBlockInfo(relevantUserName);
    const blockStatusDiv = document.querySelector("#blockStatus");

    if (blockStatusDiv) {
        if (blockInfoObject) {
            if (blockInfoObject.blockEnd == 'infinity') {
                blockStatusDiv.innerHTML = 'El usuario está bloqueado para siempre'
            } else {
                const currentTimeInISO = convertDateToISO(new Date());
                const timeUntilUnblock = calculateTimeDifferenceBetweenISO(currentTimeInISO, blockInfoObject.blockEnd);
                blockStatusDiv.innerHTML = `El bloqueo acabará en ${timeUntilUnblock.days} días y ${timeUntilUnblock.hours} horas.`
            }
        } else {
            // TODO: implementar rango de IP
            blockStatusDiv.innerHTML = 'El usuario no está bloqueado o su bloqueo es de rango de IP';
        }
    }
}

function modifyFooterLink() {
    const element = document.querySelector('span.morebits-dialog-footerlinks> a') as HTMLAnchorElement;
    element.href = `https://es.wikipedia.org/w/index.php?title=Especial:Registro&page=${relevantUserName}&type=block`;
}

function fetchAppeal(pageContent: string): string | null {
    // Regular expression to match both {{desbloquear|...}} and {{desbloquear|1=...}} patterns
    const desbloquearPattern = /{{\s*desbloquear\s*\|\s*(?:1=)?\s*([^}]*)}}/i;

    // Find the first match of the pattern in the page content
    const match = desbloquearPattern.exec(pageContent);

    // Return the extracted content if found, otherwise return null
    return match ? match[1].trim() : null;
}

function prepareAppealResolutionTemplate(appeal: string, explanation: string, resolution: string): string {
    return `{{Desbloqueo revisado|${appeal}|${explanation} ~~~~|${resolution.toLowerCase()}}}`
}

function substitutePageContent(template: string) {
    // TODO, the function should find the current "desbloquear" template and replace it with the new one
}

async function makeEdit(template: string, resolution: string) {
    new Morebits.status("Paso 1", "cerrando la petición de desbloqueo...", "info");
    await api.edit(
        currentPageName,
        (revision: any) => ({
            text: "", /* call substitutePageContent function with template */
            summary: `Cierro petición de desbloqueo con resultado: ${resolution.toLowerCase()}`,
            minor: false
        })
    )
}


async function submitMessage(e: Event) {
    const form = e.target;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);

    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow);

    const content = await getContent(currentPageName);

    console.log(input);

    const appeal = fetchAppeal(content);

    if (appeal) {
        const filledTemplate = prepareAppealResolutionTemplate(appeal, input.reason, input.resolution);
        try {
            await makeEdit(filledTemplate, input.resolution);
        } catch (error) {
            finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(error);
        }
    }


}

export function createBlockAppealsWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Revisar apelación de bloqueo');
    Window.addFooterLink('Historial de bloqueos del usuario', '');

    modifyFooterLink();

    const form = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'div',
        id: 'blockStatus',
        label: '⌛️ Cargando estado de bloqueo del usuario...'
    })

    const resolutionDiv = form.append({
        type: 'field',
        name: 'appealDiv',
        label: 'Resolución:'
    })

    resolutionDiv.append({
        type: 'select',
        id: 'resolutionSelect',
        name: 'resolution',
        label: 'Selecciona el resultado de la resolución:',
        list: getResolutionOptions()
    })

    resolutionDiv.append({
        type: 'textarea',
        id: 'reasonTextArea',
        name: 'reason',
        label: 'Describe detalladamente la resolución:',
        tooltip: 'Puedes usar Wikicódigo, pero no es necesario que añades la firma, esta aparecerá de forma automática.',
        required: true
    })

    form.append({
        type: 'submit',
        label: 'Aceptar',
    });

    const result = form.render();
    Window.setContent(result);
    Window.display();


    fetchAndShowBlockStatus();

}