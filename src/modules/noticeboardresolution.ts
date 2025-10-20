// ** Noticeboard resolution module **
// Handles the resolution of noticeboard entries, including fetching and updating entries.

import { QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { currentPageName, extractNoticeboardTitle, api, getContent, createStatusWindow, finishMorebitsStatus, editPage } from "./../utils/utils";



let Window: SimpleWindowInstance;
let step = 0;
let requestInfo: { title: string; sectionNumber: number | string } | null;
let localStorageSaveTimer: number | undefined;

async function submitMessage(event: Event): Promise<void> {
    const form = event.target as HTMLFormElement;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);

    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350)
    createStatusWindow(statusWindow);

    try {
        await editSection(input.text);
        location.reload();
    } catch (error) {
        finishMorebitsStatus(Window, statusWindow, 'error');
        console.error(`Error: ${error}`);

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


async function editSection(sysopResolution: string): Promise<void> {
    new Morebits.status(`Paso ${step += 1}`, "obteniendo el contenido de la sección...", "info");
    const sectionContent = await getContent(currentPageName, requestInfo?.sectionNumber?.toString());
    if (sectionContent) {
        const newSectionContent = replaceAnswerPlaceholder(sectionContent, sysopResolution);
        if (newSectionContent) {
            await appendResolutionText(newSectionContent, requestInfo?.sectionNumber?.toString() || '');
        }
        return
    }
}

function fetchTextFromLocalStorage(): string | null {
    if (typeof (Storage) !== "undefined") {
        return localStorage.getItem(`TL_noticeboard_resolution_text_${requestInfo?.title}_${requestInfo?.sectionNumber}`);
    }
    return null;
}



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
    }, 500);
}


function addListenerToTextarea(): void {
    const textarea = document.querySelector('textarea[name="resolution-text"]') as HTMLTextAreaElement;
    if (textarea) {
        textarea.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLTextAreaElement;
            saveTextInLocalStorageDebounced(target.value)
        });
    }
}

export function createNoticeboardResolutionWindow(headerInfo: { title: string; sectionNumber: number | string } | null): void {
    // Includes request title with underscores as spaces and, if there are more than one
    // requests with the same title, the number represeting its position in descending
    // chronological order (1 being the oldest).
    requestInfo = headerInfo;
    console.log(requestInfo)

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
        name: 'resolution-text',
        label: 'Texto de la resolución:',
        value: fetchTextFromLocalStorage() || '',
        tooltip: 'Escribe un mensaje para el usuario que hizo la petición. Puedes usar wikitexto.',
        style: 'margin-top: 0',
    });

    const optionsField = form.append({
        type: 'field',
        label: 'Opciones:'
    });

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