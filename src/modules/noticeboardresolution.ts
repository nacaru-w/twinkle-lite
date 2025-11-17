// ** Noticeboard resolution module **
// Handles the resolution of noticeboard entries, including fetching and updating entries.

import { SimpleWindowInstance } from "types/morebits-types";
import { currentPageName, extractNoticeboardTitle, getContent, createStatusWindow, finishMorebitsStatus, editPage, appendSectionToPage } from "./../utils/utils";
import { NoticeboardRequestInfo, NoticeboardResolutionInput } from "types/twinkle-types";



let Window: SimpleWindowInstance;
let step = 0;

let requestInfo: NoticeboardRequestInfo | null;
let localStorageSaveTimer: number | undefined;
let useAdminTabTemplate: boolean;
let sectionContent: string | null;

async function submitMessage(event: Event): Promise<void> {
    const form = event.target as HTMLFormElement;
    const input: NoticeboardResolutionInput = Morebits.quickForm.getInputData(form);

    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350)
    createStatusWindow(statusWindow);

    try {
        await editSection(input.resolutionText);
        deleteTextFromLocalStorage();
        if (input.notify) await notifyUser();
        finishMorebitsStatus(Window, statusWindow, 'finished', true);
        location.reload();
    } catch (error) {
        finishMorebitsStatus(Window, statusWindow, 'error');
        console.error(`Error: ${error}`);
    }

}

function extractUsernameFromContent(sectionContent: string): string | null {
    if (!sectionContent) return null;

    // Step 1: Find the part after "; Usuario que lo solicita"
    const marker = /;\s*Usuario que lo solicita\s*/i;
    const markerMatch = sectionContent.match(marker);
    if (!markerMatch) return null;

    // Get substring starting after the marker
    const startIndex = sectionContent.indexOf(markerMatch[0]) + markerMatch[0].length;
    const afterMarker = sectionContent.slice(startIndex);

    // Step 2: Find the first [[Usuario:...]] link after the marker
    const userMatch = afterMarker.match(/\[\[\s*Usuario\s*:\s*([^|\]\n#]+)/i);
    if (!userMatch) return null;

    // Step 3: Clean up username
    return userMatch[1].trim().replace(/_/g, ' ');
}

async function generateUserNotification(noticeboard: string): Promise<string> {
    return `
(Este es un aviso generado automáticamente a través de [[WP:TL|Twinkle Lite]])
Tu solicitud en ${noticeboard} ha sido resuelta. Puedes acceder a la misma a través del siguiente enlace:
* [[Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/${noticeboard}/Actual#${requestInfo?.anchor}|Enlace a la resolución]].
Ten en cuenta que el enlace caducará una vez se haya archivado el hilo. Saludos. ~~~~
`
}

async function notifyUser() {
    if (sectionContent) {
        new Morebits.status(`Paso ${step += 1}`, "avisando al usuario...", "info");
        const notifiedUser = extractUsernameFromContent(sectionContent);
        const noticeboard = extractNoticeboardTitle(currentPageName);
        if (notifiedUser && noticeboard) {
            await appendSectionToPage(
                `Usuario_discusión:${notifiedUser}`,
                `Aviso de resolución de solicitud mediante [[WP:TL|Twinkle Lite]]`,
                `Resolución de tu solicitud ${noticeboard ? `en ${noticeboard}` : ''}`,
                await generateUserNotification(noticeboard)
            )
        }

    }
}

function replaceAnswerPlaceholder(sectionText: string, newText: string): string {
    return sectionText.replace(
        // match the line starting with "; Respuesta" and the text after it
        /(; *Respuesta\s*\n)([\s\S]*?)(?=(?:\n;|$))/,
        `$1${newText}\n`
    );
}

async function appendResolutionText(newText: string, sectionNumber: string) {
    new Morebits.status(`Paso ${step += 1}`, "añadiendo la resolución a la sección...", "info");

    return await editPage(
        currentPageName,
        "Resolviendo resolución mediante [[WP:TL|Twinkle Lite]]",
        newText,
        sectionNumber
    );
}

/**
 * Adapts the sysop resolution to the correct format, depending on whether the admin tab template is used or not.
 * @param {string} resolution - The sysop resolution to adapt.
 * @returns {string} The adapted sysop resolution.
 */
function adaptSysopResolution(resolution: string): string {
    if (useAdminTabTemplate) {
        return `{{admintab|1=${resolution}|2=~~~~|3=}}`
    } else {
        return `${resolution} ~~~~`
    }
}

async function editSection(sysopResolution: string): Promise<void> {
    new Morebits.status(`Paso ${step += 1}`, "obteniendo el contenido de la sección...", "info");
    sectionContent = await getContent(currentPageName, requestInfo?.sectionNumber?.toString());
    const adaptedResolution = adaptSysopResolution(sysopResolution);
    if (sectionContent) {
        const newSectionContent = replaceAnswerPlaceholder(sectionContent, adaptedResolution);
        if (newSectionContent) {
            await appendResolutionText(newSectionContent, requestInfo?.sectionNumber?.toString() || '');
        }
        return
    }
}

/**
 * Fetches the text saved in the local storage for the noticeboard resolution.
 * The key for the local storage item is `TL_noticeboard_resolution_text_<title>_<sectionNumber>`.
 * If the local storage item does not exist, it will return null.
 * @returns {string|null} The text saved in the local storage, or null if it does not exist.
 */
function fetchTextFromLocalStorage(): string | null {
    if (typeof (Storage) !== "undefined") {
        return localStorage.getItem(`TL_noticeboard_resolution_text_${requestInfo?.title}_${requestInfo?.sectionNumber}`);
    }
    return null;
}

/**
 * Saves a text in the local storage, but with a debounce of 500ms to avoid excessive writes.
 * If the text is empty, it will remove the item from the local storage instead.
 * @param {string} text - The text to be saved.
 */
function saveTextInLocalStorageDebounced(text: string): void {
    if (typeof Storage === "undefined") return;

    if (localStorageSaveTimer) {
        clearTimeout(localStorageSaveTimer);
    }

    localStorageSaveTimer = window.setTimeout(() => {
        localStorage.setItem(
            `TL_noticeboard_resolution_text_${requestInfo?.title}_${requestInfo?.sectionNumber}`,
            text
        );
        if (!text) {
            localStorage.removeItem(`TL_noticeboard_resolution_text_${requestInfo?.title}_${requestInfo?.sectionNumber}`);
        }
    }, 500);
}

function deleteTextFromLocalStorage(): void {
    if (typeof (Storage) !== "undefined") {
        localStorage.removeItem(`TL_noticeboard_resolution_text_${requestInfo?.title}_${requestInfo?.sectionNumber}`);
    }
}


function addListenerToTextarea(): void {
    const textarea = document.querySelector('textarea[name="resolutionText"]') as HTMLTextAreaElement;
    if (textarea) {
        textarea.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLTextAreaElement;
            saveTextInLocalStorageDebounced(target.value)
        });
    }
}

export function createNoticeboardResolutionWindow(headerInfo: NoticeboardRequestInfo | null, configUseAdminTabTemplate: boolean): void {
    // Includes request title with underscores as spaces and, if there are more than one
    // requests with the same title, the number represeting its position in descending
    // chronological order (1 being the oldest).
    requestInfo = headerInfo;
    useAdminTabTemplate = configUseAdminTabTemplate;

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
        name: 'resolutionText',
        label: 'Texto de la resolución:',
        value: fetchTextFromLocalStorage() || '',
        tooltip: 'Escribe un mensaje para el usuario que hizo la petición. Puedes usar wikitexto.',
        style: 'margin-top: 0',
    });

    const optionsField = form.append({
        type: 'field',
        label: 'Opciones:'
    });

    // optionsField.append({
    //     type: 'checkbox',
    //     list: [{
    //         name: 'underReview',
    //         value: 'underReview',
    //         label: 'Marcar esta solicitud como «en revisión»',
    //         checked: false
    //     }]
    // })

    // optionsField.append({
    //     type: 'checkbox',
    //     list: [{
    //         name: 'useAdmintabTemplate',
    //         value: 'useAdminTabTemplate',
    //         label: 'Usar la plantilla {{admintab}} al responder',
    //         checked: true
    //     }]
    // })

    optionsField.append({
        type: 'checkbox',
        list: [{
            name: 'notify',
            value: 'notify',
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

    addListenerToTextarea();

}