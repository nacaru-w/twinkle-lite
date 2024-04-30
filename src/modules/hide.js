let diffID;
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
        `== Ocultar ${moreDiffs ? "ediciones" : "edición"} ==
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
    let form = e.target;
    let input = Morebits.quickForm.getInputData(form);
    console.log(input);
    console.log(buildMessage(input.moreDiffsString, input.reason));
}

export { createFormWindow };