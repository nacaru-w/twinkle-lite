import * as utils from './utils';

let reportedUser = mw.config.get( "wgRelevantUserName" )

let listMotiveOptions = [
    {value: "CCPV", label: "Cuenta creada para vandalizar"},
    {value: "EDB", label: "Evasión de bloqueo"},
    {value: "3RR", label: "Guerra de ediciones"},
    {value: "NI", label: "Nombre inapropiado"},
    {value: "O", label: "Otro"},
    {value: "VDE", label: "Violación de etiqueta"},
    {value: "VEC", label: "Vandalismo en curso"},
    {value: "VP", label: "Vandalismo persistente"}
]

function getMotiveOptions() {
        let dropDownOptions = [];
        for (let motive of listMotiveOptions) {
            let option = {value: motive.value, label: motive.label, subgroup: motive.subgroup };
            dropDownOptions.push(option);
        }
        return dropDownOptions;
}

function createFormWindow() {
	let Window = new Morebits.simpleWindow(620, 530);
	Window.setTitle('Denunciar usuario');
	Window.addFooterLink('Tablón de anuncios de los bibliotecarios', 'Wikipedia:Tablón de anuncios de los bibliotecarios');
	let form = new Morebits.quickForm(submitMessage);

    let reportTypeField = form.append({
        type: 'field',
        label: 'Opciones:',
    })
    reportTypeField.append({
        type: 'select',
        label: 'Selecciona el motivo:',
        name: 'motive',
        list: getMotiveOptions(),
        event: 
            function (e) {
                let selectedOption = e.target.value
                document.querySelector("label[for='reasontextareanode']").innerText = 'Desarrolla la razón:'
                document.getElementById('articlefieldnode').setAttribute('style', 'display:none');
                switch (selectedOption) {
                    case '3RR' :
                        document.getElementById('articlefieldnode').removeAttribute('style')
                        break;
                    case 'VDE' :
                        document.querySelector("label[for='reasontextareanode']").innerText = 'Ediciones que constituyen una violación de etiqueta:'
                        break;
                    }
                }
            })

    let reportInfoField = form.append({
        type: 'field',
        label: 'Información:'
    })
    reportInfoField.append({
        type: 'dyninput',
        label: 'Usuarios denunciados:',
        sublabel: 'Usuario:',
        name: 'usernamefield',
        value: "",
        tooltip: 'Escribe el nombre del usuario denunciado sin ningún tipo de wikicódigo'
    })
    reportInfoField.append({
        type: 'dyninput',
        label: 'Artículo involucrado:',
        name: 'articlefieldbox',
        style: "display: none;",
        id: 'articlefieldnode',
        tooltip: 'Escribe el nombre del artículo sin ningún tipo de wikicódigo'
    })

    reportInfoField.append({
        type: 'textarea',
        label: 'Desarrolla la razón:',
        name: 'reason',
        tooltip: 'Incluye diffs si es necesario. Puedes usar wikicódigo. La firma se añadirá de forma automática.',
        id: 'reasontextareanode'
    })

    form.append({
		type: 'submit',
		label: 'Aceptar'
	});

	let result = form.render();
	Window.setContent(result);
	Window.display();

    document.querySelector('input[name="usernamefield"]').value = reportedUser
}

function submitMessage(e) {

	let form = e.target;
    let input = Morebits.quickForm.getInputData(form);
    let usernames = Array.from(document.querySelectorAll('input[name=usernamefield]')).map((o) => o.value)
    console.log(usernames)
    if (input.reason === `` && input.motive != 'NI') {
		alert("No se ha establecido un motivo.");
	} else {
        utils.createStatusWindow()
        switch (input.motive) {
            case "CCPV" :
                
        }

    }
}




export { createFormWindow };