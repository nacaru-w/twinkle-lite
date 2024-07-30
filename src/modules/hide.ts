import { QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { createStatusWindow } from "./utils";
import { ApiEditPageParams } from "types-mediawiki/api_params";

let diffID: string;
let Window: SimpleWindowInstance;

/**
 * Updates the display status of the label for the additional diffs input field.
 * @param checkstatus - Determines whether the label should be displayed or hidden based on checkbox status.
 */
function updateLabel(checkstatus: boolean = false): void {
    const label: HTMLLabelElement | null = document.querySelector('label[for=moreDiffsInputField]');
    if (label) {
        if (checkstatus) {
            label.style.display = '';
        } else {
            label.style.display = 'none';
        }
    }
}

/**
 * Creates and displays the Morebits form window.
 * @param diff - The initial diff ID to be included in the request, fetched from UI.
 */
function createFormWindow(diff: string): void {
    diffID = diff;

    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Solicitar ocultado de edición');
    Window.addFooterLink('Política de supresores', 'Wikipedia:Supresores');

    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'textarea',
        name: 'reason',
        label: 'Describe el motivo (opcional)',
        tooltip: 'Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente'
    })

    const optionsField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Opciones: ',
    })

    optionsField.append({
        type: 'checkbox',
        list:
            [{
                name: 'moreDIffs',
                label: 'Incluir más diffs en la solicitud',
                checked: false,
            }],
        name: 'moreDiffsCheckbox',
        event: (e: Event) => {
            const checked = (e.target as HTMLInputElement).checked;
            const inputField = document.getElementById('moreDiffsInputField');
            if (checked) {
                inputField!.style.display = '';
            } else {
                inputField!.style.display = 'none';
            }
            updateLabel(checked);
        }
    })

    optionsField.append({
        type: 'input',
        label: 'Escribe el ID de otros diffs que quieras incluir, separados por comas:<br> <i>Ejemplo: «159710180, 159635315»</i><br>',
        tooltip: 'El ID es el número de nueve cifras que aparece al final de la URL en una página de diff después de «oldid=»',
        name: 'moreDiffsString',
        style: "display: none;",
        id: 'moreDiffsInputField',
    })

    form.append({
        type: 'submit',
        label: 'Aceptar'
    });

    const result = form.render();
    Window.setContent(result);
    Window.display();

    updateLabel();

}

/**
 * Processes the additional diffs input field string and returns an array of valid diff IDs.
 * @param input - The input string containing additional diff IDs separated by commas.
 * @returns An array of valid diff IDs.
 */
function makeDiffList(input: string): string[] {
    // This first step makes sure no characters that are either
    // numbers or commas are processed
    let processedDiffList = input.replace(/[^0-9,]+/g, "");
    let processedDiffListArray: string[] = processedDiffList.split(',');
    processedDiffListArray.unshift(diffID);
    return processedDiffListArray;
}

/**
 * Creates a formatted message listing the diffs to include in the board bullet list.
 * @param inputList - An array of diff IDs to be included in the message.
 * @returns A formatted string listing the diffs as bullet points with internal links.
 */
function makeDiffMessage(inputList: string[]): string {
    let iterations = inputList.length;
    let message = '';
    for (let diff of inputList) {
        iterations--;
        message += `* [[Especial:Diff/${diff}]]${iterations ? '\n' : ''}`;
    }
    return message;
}

/**
 * Builds the complete message to be posted to the board.
 * @param moreDiffs - The input string containing additional diff IDs separated by commas.
 * @param reason - The reason provided by the user in the corresponding field.
 * @returns The complete message to be posted to the board.
 */
function buildMessage(moreDiffs: string, reason: string): string {
    let diffList = [];

    if (moreDiffs) {
        diffList = makeDiffList(moreDiffs);
        console.log(diffList);
    } else {
        diffList.push(diffID);
    }

    const boardMessage =
        `\n== Ocultar ${moreDiffs ? "ediciones" : "edición"} ==
; Asunto
${makeDiffMessage(diffList)}
${reason ? `; Motivo\n${reason}` : ''}
; Usuario que lo solicita
* ~~~~
; Respuesta
(a rellenar por un bibliotecario)
`;
    return boardMessage
}

/**
 * Submits the message to the board by MW API interaction, requesting edit suppression.
 * @param e - The event triggered by the form submission.
 */
function submitMessage(e: Event): void {
    const board: string = "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Miscelánea/Actual";
    const form = e.target as HTMLFormElement;
    const input = Morebits.quickForm.getInputData(form);

    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow);
    new Morebits.status("Paso 1", `Solicitando el ocultado de ${input.moreDiffs ? 'las ediciones' : 'la edición'}...`, "info");

    new mw.Api().edit(
        board,
        (revision) => {
            const editParams: ApiEditPageParams = {
                text: revision.content + buildMessage(input.moreDiffsString, input.reason),
                summary: `Solicitando ocultado de ${input.moreDiffs ? 'ediciones' : 'una edición'} mediante [[WP:TL|Twinkle Lite]]`,
                minor: false
            }
            return editParams
        }
    ).then(() => {
        new Morebits.status("✔️ Finalizado", "cerrando ventana...", "status");
        setTimeout(() => {
            statusWindow.close();
            Window.close();
        }, 2500);
    })
        .catch(function (error: Error) {
            new Morebits.status("❌ Se ha producido un error", "comprueba las ediciones realizadas", "error");
            console.log(`Error: ${error}`);
        })

}

export { createFormWindow };