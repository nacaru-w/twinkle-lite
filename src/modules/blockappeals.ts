import { SimpleWindowInstance } from "types/morebits-types";
import { calculateTimeDifferenceBetweenISO, convertDateToISO, getBlockInfo, relevantUserName } from "./../utils/utils";
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
                console.log(blockInfoObject);
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