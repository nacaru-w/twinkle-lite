import { SimpleWindowInstance } from "types/morebits-types";
import { calculateTimeDifferenceBetweenISO, getBlockInfo, relevantUserName } from "./../utils/utils";
import { BlockInfoObject } from "types/twinkle-types";

let Window: SimpleWindowInstance;
let blockInfoObject: BlockInfoObject | null;

function submitMessage(e: Event) {
    console.log(e)
}

const resolutionOptions: string[] = ['Desbloquear', 'Mantener bloqueo', 'Extender bloqueo'];

function getResolutionOptions() {
    return resolutionOptions.map((e) => {
        return { type: 'option', value: e, label: e };
    })
}

async function fetchAndShowBlockStatus() {
    blockInfoObject = await getBlockInfo(relevantUserName);
    console.log(blockInfoObject)
    const blockStatusDiv = document.querySelector("#blockStatus");

    if (blockStatusDiv) {
        if (blockInfoObject) {
            if (blockInfoObject.blockEnd == 'infinity') {
                blockStatusDiv.innerHTML = 'El usuario está bloqueado para siempre'
            } else {
                const timeUntilUnblock = calculateTimeDifferenceBetweenISO(blockInfoObject.blockStart, blockInfoObject.blockEnd)
                blockStatusDiv.innerHTML = `El bloqueo acabará en ${timeUntilUnblock.days} y ${timeUntilUnblock.hours}`
            }
        } else {
            // TODO: implementar rango de IP
            blockStatusDiv.innerHTML = 'El usuario no está bloqueado o su bloqueo es de rango de IP';
        }
    }
}

export function createBlockAppealsWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Revisar apelación de bloqueo');
    Window.addFooterLink('Guía para apelar bloqueos', 'Ayuda:Guía para apelar bloqueos');

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


    fetchAndShowBlockStatus();

}