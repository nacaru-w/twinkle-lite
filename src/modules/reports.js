import * as utils from './utils';

let reportedUser = mw.config.get( "wgRelevantUserName" )

let listMotiveOptions = [
    { value : "Cuenta creada para vandalizar" },
    { value : "Evasión de bloqueo" },
    { value : "Guerra de ediciones" },
    { value : "Nombre inapropiado" },
    { value : "Violación de etiqueta" },
    { value : "Vandalismo en curso" },
    { value : "Vandalismo persistente" },
    { value : "Otro" },
]

let motiveOptionsDict = { 
    "Cuenta creada para vandalizar" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual"},
    "Evasión de bloqueo" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual"},
    "Guerra de ediciones" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/3RR/Actual"},
    "Nombre inapropiado" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual"},
    "Violación de etiqueta" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Violación_de_etiqueta/Actual" },
    "Vandalismo en curso" :
        { "link" : "Wikipedia:Vandalismo_en_curso" },
    "Vandalismo persistente" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual"},
    "Otro" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual"}
}

function getMotiveOptions() {
        let dropDownOptions = [];
        for (let motive of listMotiveOptions) {
            let option = {value: motive.value, label: motive.value, subgroup: motive.subgroup};
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
                document.getElementById('otherreasonnode').setAttribute('style', 'display:none');
                switch (selectedOption) {
                    case 'Guerra de ediciones' :
                        document.getElementById('articlefieldnode').removeAttribute('style')
                        break;
                    case 'Violación de etiqueta' :
                        document.querySelector("label[for='reasontextareanode']").innerText = 'Ediciones que constituyen una violación de etiqueta:'
                        break;
                    case 'Otro' :
                        document.getElementById('otherreasonnode').removeAttribute('style')
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
        type: "input",
        name: "otherreason",
        id: "otherreasonnode",
        style: "display: none;",
        placeholder: "Título de la denuncia",
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
    let chosenMotive = input.motive
    console.log(chosenMotive)
    if (input.reason === `` && input.motive != 'NI') {
		alert("No se ha establecido un motivo."); }
    else if (input.motive == 'Otro' && input.otherreason == '' ) {
        alert("No se ha establecido un título para la denuncia")
	} else {
        utils.createStatusWindow()
        new Morebits.status("Paso 1", `creando denuncia en el tablón...`, "info");
        new mw.Api().edit(
            input.motive == "Wikipedia:Vandalismo_en_curso" ? input.motive : `Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/${input.motive}/Actual`,
            buildEditOnNoticeboard(input)
        )

    }
}

function buildEditOnNoticeboard (data) {
    title = input.motive 
    return (revision) => {
        return {

        }
    }
}

export { createFormWindow };