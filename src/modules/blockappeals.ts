import { QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { api, calculateTimeDifferenceBetweenISO, createStatusWindow, currentPageName, finishMorebitsStatus, getBlockInfo, getContent, relevantUserName, showConfirmationDialog } from "./../utils/utils";
import { BlockAppealResolution, BlockInfoObject } from "types/twinkle-types";
import { convertDateToISO } from "./../utils/dateUtils";

let Window: SimpleWindowInstance;
let blockInfoObject: BlockInfoObject | null;

const resolutionOptions: BlockAppealResolution[] = ['Rechazo', 'Aprobación', 'Archivo', 'Filtro', 'Extención'];

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
            // TODO: implement IP range
            blockStatusDiv.innerHTML = 'El usuario no está bloqueado o su bloqueo es de rango de IP';
        }
    }
}

function modifyFooterLink() {
    const element = document.querySelector('span.morebits-dialog-footerlinks> a') as HTMLAnchorElement;
    element.href = `https://es.wikipedia.org/w/index.php?title=Especial:Registro&page=${relevantUserName}&type=block`;
}

export function fetchAppeal(pageContent: string): string | null {
    // Regular expression to match the beginning of the {{desbloquear}} template
    const desbloquearStartPattern = /{{\s*desbloquear\s*\|/i;
    const match = desbloquearStartPattern.exec(pageContent);

    // If no match is found, return null
    if (!match) {
        return null;
    }

    // Start reading after the match
    const startIndex = match.index + match[0].length;
    let braceCount = 1; // Starts at 1 because we've already identified the opening {{
    let result = '';
    let i = startIndex;

    // Process the content character by character
    while (i < pageContent.length) {
        const char = pageContent[i];
        const nextTwoChars = pageContent.slice(i, i + 2);

        if (nextTwoChars === '{{') {
            // Increment brace count for an opening brace
            braceCount++;
            result += '{{';
            i += 2;
        } else if (nextTwoChars === '}}') {
            // Decrement brace count for a closing brace
            braceCount--;
            if (braceCount === 0) {
                // If brace count reaches zero, stop parsing
                i += 2;
                break;
            }
            result += '}}';
            i += 2;
        } else {
            // Append current character to the result
            result += char;
            i++;
        }
    }

    // Trim the result and handle optional "1=" prefix
    result = result.trim();
    if (result.startsWith('1=')) {
        result = result.slice(2).trim(); // Remove "1=" and any leading whitespace
    }

    return result || null;
}


export function prepareAppealResolutionTemplate(appeal: string, explanation: string, resolution: BlockAppealResolution): string {
    return `{{Desbloqueo revisado|1=${appeal}|2=${explanation} ~~~~|3=${resolution.toLowerCase()}|4={{safesubst:TESParam}}}}`;
}

export function substitutePageContent(text: string, newTemplate: string): string {
    // 1. Find all <nowiki>...</nowiki> ranges
    const nowikiRanges: Array<[number, number]> = [];
    const nowikiPattern = /<nowiki>([\s\S]*?)<\/nowiki>/gi;

    let nwMatch;
    while ((nwMatch = nowikiPattern.exec(text)) !== null) {
        const start = nwMatch.index;
        const end = nwMatch.index + nwMatch[0].length;
        nowikiRanges.push([start, end]);
    }

    // 2. Locate the desbloquear template
    const desbloquearStartPattern = /{{\s*desbloquear\s*\|/i;
    const match = desbloquearStartPattern.exec(text);

    if (!match) {
        return text; // No template found
    }

    const templateStart = match.index;

    // 3. Check if the template starts inside a <nowiki> block
    for (const [start, end] of nowikiRanges) {
        if (templateStart >= start && templateStart < end) {
            // Template is inside <nowiki>: do NOT modify
            return text;
        }
    }

    // 4. Your original brace-matching logic
    let braceCount = 1;
    let i = match.index + match[0].length;

    while (i < text.length) {
        const nextTwo = text.slice(i, i + 2);

        if (nextTwo === '{{') {
            braceCount++;
            i += 2;
        } else if (nextTwo === '}}') {
            braceCount--;
            i += 2;
            if (braceCount === 0) break;
        } else {
            i++;
        }
    }

    const before = text.slice(0, templateStart);
    const after = text.slice(i);

    return before + newTemplate + after;
}


async function makeEdit(pageContent: string, newTemplate: string, resolution: BlockAppealResolution) {
    new Morebits.status("Paso 1", "cerrando la petición de desbloqueo...", "info");
    await api.edit(
        currentPageName,
        (revision: any) => ({
            text: substitutePageContent(pageContent, newTemplate),
            summary: `Cierro petición de desbloqueo con resultado: ${resolution.toLowerCase()} mediante [[WP:TL|Twinkle Lite]]`,
            minor: false
        })
    )
}


async function submitMessage(e: Event) {
    if (showConfirmationDialog('¿Seguro que quieres enviar la resolución de la solicitud de desbloqueo?')) {
        const form = e.target;
        const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);

        const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
        createStatusWindow(statusWindow);

        const content = await getContent(currentPageName);

        if (content) {
            const appeal = fetchAppeal(content);

            if (appeal) {
                const filledTemplate = prepareAppealResolutionTemplate(appeal, input.reason, input.resolution);
                try {
                    await makeEdit(content, filledTemplate, input.resolution);
                    finishMorebitsStatus(Window, statusWindow, 'finished', true);
                } catch (error) {
                    finishMorebitsStatus(Window, statusWindow, 'error');
                    console.error(error);
                }
            }

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