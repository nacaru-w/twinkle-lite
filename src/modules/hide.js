let diffID;

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
                name: "otherArticles",
                value: "otherArticles",
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

function submitMessage(e) {
    let form = e.target;
    let input = Morebits.quickForm.getInputData(form);
    console.log(input);
}

export { createFormWindow };