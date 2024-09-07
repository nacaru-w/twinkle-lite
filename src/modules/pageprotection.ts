import { QuickFormElementInstance, ListElementData, SimpleWindowInstance } from "types/morebits-types";
import { createStatusWindow, currentPageName, currentPageNameNoUnderscores, finishMorebitsStatus, getProtectionStatus, parseTimestamp } from "./../utils/utils";
import { ApiEditPageParams } from "types-mediawiki/api_params";
import { ProtectionStatus } from "types/twinkle-types";

let Window: SimpleWindowInstance;

// Options for the radio button menu
const radioProtectionOptions: ListElementData[] = [
    {
        type: 'option',
        value: "protección",
        label: "Solicitar protección",
        checked: true
    },
    {
        type: 'option',
        value: "desprotección",
        label: "Solicitar desprotección"
    }
];

// List of motives for requesting protection, displayed in a dropdown menu
const listMotiveOptions: { name: string }[] = [
    { name: "Vandalismo" },
    { name: "SPAM" },
    { name: "Información falsa o especulativa" },
    { name: "Guerra de ediciones" },
    { name: "Otro" }
]

/**
 * Converts the listMotiveOptions to ListElementData type for use in the Morebits select element.
 * @returns The Morebits-adapted list of motive options.
 */
function adaptMotiveOptions(): ListElementData[] {
    let dropDownOptions = [];
    for (let motive of listMotiveOptions) {
        let option = { type: 'option', value: motive.name, label: motive.name };
        dropDownOptions.push(option);
    }
    return dropDownOptions
}

/**
 * Constructs a string indicating the protection expiry time.
 * @param protectionExpiry - The expiry date of the protection.
 * @returns The formatted expiry string.
 */
function protectionStatusTextBuilder(protectionExpiry: string): string {
    switch (protectionExpiry) {
        case '':
            return ''
        case 'infinity':
            return '(protegido para siempre)'
        default:
            return `(hasta el ${parseTimestamp(protectionExpiry)})`
    }
}

/**
 * Builds the edit parameters for a noticeboard edit MW API request.
 * @param input - The user input from the form.
 * @returns A function that takes a revision and returns the edit parameters.
 */
function buildEditOnNoticeboard(input: any): (revision: any) => ApiEditPageParams {
    let title = `== ${input.protection == "desprotección" ? 'Solicitud de desprotección de ' : ''}[[${currentPageNameNoUnderscores}]] ==`;
    return (revision: any) => {
        const editParams: ApiEditPageParams = {
            text: revision.content + `\n
${title} 
;Artículo(s) 
* {{a|${currentPageNameNoUnderscores}}}
;Causa 
${input.reason ? input.reason : input.motive}
; Usuario que lo solicita
* ~~~~ 
;Respuesta
(a rellenar por un bibliotecario)`,
            summary: `Solicitando ${input.protection} de [[${currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
            minor: false
        }
        return editParams
    }
}

/**
 * Fetches and adds protection status to form window
 */
async function fetchAndShowProtectionStatus(): Promise<void> {
    // Fetches the current protection status of the article and updates the form accordingly
    const protection: ProtectionStatus = await getProtectionStatus(currentPageName);
    // Displays protection level on page
    const showProtection = document.querySelector("div[name='currentProtection'] > span.quickformDescription");
    if (showProtection) {
        showProtection.innerHTML = `Nivel actual de protección:<span style="color:royalblue; font-weight: bold;"> ${protection.level} <span style="font-weight: normal;">${protectionStatusTextBuilder(protection.expiry)}</span>`;
        // Disables "unprotect" option if not applicable
        if (protection.level == 'sin protección') {
            let unprotectDiv: HTMLElement | undefined = document.getElementById('protect')?.children[1] as HTMLElement;
            if (unprotectDiv && unprotectDiv.firstChild instanceof HTMLElement) {
                unprotectDiv.firstChild.setAttribute('disabled', '');
            }
        }
    }
}

/**
 * Creates the Morebits' form window for requesting page protection.
 */
export function createPageProtectionFormWindow(): void {
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Solicitar protección de la página');
    Window.addFooterLink('Política de protección', 'Wikipedia:Política de protección');

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    const radioField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Tipo:',
    });

    radioField.append({
        type: 'radio',
        name: 'protection',
        id: 'protect',
        event:
            function (e: Event) {
                let nameToModify: HTMLElement | null = document.querySelector("select[name='motive']")
                if (nameToModify) {
                    if ((e.target as HTMLInputElement).value !== "protección") {
                        nameToModify.setAttribute('disabled', "")
                    } else {
                        nameToModify.removeAttribute('disabled')
                    }
                }
            },
        list: radioProtectionOptions
    })

    form.append({
        type: 'div',
        name: 'currentProtection',
        label: `Nivel actual de protección: `,
    })

    const textAreaAndReasonField = form.append({
        type: 'field',
        label: 'Opciones:',
    });

    textAreaAndReasonField.append({
        type: 'select',
        name: 'motive',
        label: 'Selecciona el motivo:',
        list: adaptMotiveOptions(),
        disabled: false
    });

    textAreaAndReasonField.append({
        type: 'textarea',
        name: 'reason',
        label: 'Desarrolla la razón:',
        tooltip: 'Si no se rellena este campo, se utilizará como razón la seleccionada en la lista de motivos (si no se ha seleccionado «otro»). Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente.'
    });
    form.append({
        type: 'submit',
        label: 'Aceptar'
    });

    let result = form.render();
    Window.setContent(result);
    Window.display();

    fetchAndShowProtectionStatus();

}

/**
 * Handles the form submission process.
 * @param e - The event object from the form submission.
 */
function submitMessage(e: Event): void {
    const form = e.target as HTMLFormElement;
    const input = Morebits.quickForm.getInputData(form);
    if (input.motive == 'Otro' && !input.reason) {
        alert("Se ha seleccionado «Otro» como motivo pero no se ha establecido un motivo.");
    } else {
        const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
        createStatusWindow(statusWindow);
        new Morebits.status("Paso 1", `solicitando la ${input.protection} de la página...`, "info");
        new mw.Api().edit(
            "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Protección_de_artículos/Actual",
            buildEditOnNoticeboard(input)
        )
            .then(function () {
                finishMorebitsStatus(Window, statusWindow, 'finished', false);
            })
            .catch(function (error: Error) {
                finishMorebitsStatus(Window, statusWindow, 'error');
                console.error(`Error: ${error}`);
            })

    }
}