import { createStatusWindow } from "./utils";

let diffID, Window;
const board = "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Miscelánea/Actual";

function createFormWindow(diff) {
    diffID = diff;

    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Solicitar ocultado de edición');
    Window.addFooterLink('Política de supresores', 'Wikipedia:Supresores');

    let form = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'textarea',
        name: 'reason',
        label: 'Describe el motivo (opcional):',
        tooltip: 'Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente.'
    });

    let optionsField = form.append({
        type: 'field',
        label: 'Opciones:',
    })


    optionsField.append({
        type: 'checkbox',
        list:
            [{
                name: "moreDiffs",
                label: 'Incluir más diffs en la solicitud',
                checked: false,
            }],
        name: 'moreDiffsCheckbox',
        event: (e) => {
            const checked = e.target.checked;
            const inputField = document.getElementById('moreDiffsInputField');
            if (checked) {
                inputField.style.display = '';
            } else {
                inputField.style.display = 'none';
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


    let result = form.render();
    Window.setContent(result);
    Window.display();

    updateLabel();

}

function updateLabel(checkstatus = false) {
    const label = document.querySelector('label[for=moreDiffsInputField]');
    if (checkstatus) {
        label.style.display = '';
    } else {
        label.style.display = 'none';
    }
}

function makeDiffList(input) {
    // This first step makes sure no characters that are either
    // numbers or commas are processed
    let processedDiffList = input.replace(/[^0-9,]+/g, "");
    processedDiffList = processedDiffList.split(',');
    processedDiffList.unshift(diffID);
    return processedDiffList;
}

function makeDiffMessage(inputList) {
    let iterations = inputList.length;
    let message = '';
    for (let diff of inputList) {
        iterations--;
        message += `* [[Especial:Diff/${diff}]]${iterations ? '\n' : ''}`;
    }
    return message;
}

function buildMessage(moreDiffs, reason) {
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

function submitMessage(e) {
    const form = e.target;
    const input = Morebits.quickForm.getInputData(form);

    const statusWindow = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow);
    new Morebits.status("Paso 1", `Solicitando el ocultado de ${input.moreDiffs ? 'las ediciones' : 'la edición'}...`, "info");

    new mw.Api().edit(
        board,
        (revision) => {
            return {
                text: revision.content + buildMessage(input.moreDiffsString, input.reason),
                summary: `Solicitando ocultado de ${input.moreDiffs ? 'ediciones' : 'una edición'} mediante [[WP:TL|Twinkle Lite]]`,
                minor: false
            }
        }
    ).then(() => {
        new Morebits.status("✔️ Finalizado", "cerrando ventana...", "status");
        setTimeout(() => {
            statusWindow.close();
            Window.close();
        }, 2500);
    })
        .catch(function (error) {
            new Morebits.status("❌ Se ha producido un error", "comprueba las ediciones realizadas", "error");
            console.log(`Error: ${error}`);
        })

}

export { createFormWindow };