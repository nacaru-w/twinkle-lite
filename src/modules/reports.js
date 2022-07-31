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
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual" },
    "Evasión de bloqueo" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual" },
    "Guerra de ediciones" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/3RR/Actual" },
    "Nombre inapropiado" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual" },
    "Violación de etiqueta" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Violaciones_de_etiqueta/Actual" },
    "Vandalismo en curso" :
        { "link" : "Wikipedia:Vandalismo_en_curso" },
    "Vandalismo persistente" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual" },
    "Otro" :
        { "link" : "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Miscelánea/Actual" }
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
        label: 'Artículos involucrados:',
        sublabel: 'Artículo:',
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
    if (input.reason === `` && input.motive != 'NI') {
		alert("No se ha establecido un motivo.");
    } else if (input.motive == 'Otro' && input.otherreason == '' ) {
        alert("No se ha establecido un título para la denuncia");
    } else if (input.usernamefield == '') {
        alert("No se ha establecido un usuario");
	} else {
        utils.createStatusWindow()
        new Morebits.status("Paso 1", `obteniendo datos del formulario...`, "info");
        let usernames = Array.from(document.querySelectorAll('input[name=usernamefield]')).map((o) => o.value)
        let articles = Array.from(document.querySelectorAll('input[name=articlefieldbox]')).map((o) => o.value)
        new Morebits.status("Paso 2", `creando denuncia en el tablón...`, "info");
        new mw.Api().edit(
            motiveOptionsDict[input.motive].link,
            buildEditOnNoticeboard(input, usernames, articles)
        )
        .then( function() {
            new Morebits.status("Paso 3", `avisando al usuario reportado...`, "info");
            return postsMessage(input)
        })
        .then(function () {
            console.log('Refreshing...');
            new Morebits.status("Finalizado", "actualizando página...", "status");
            setTimeout(() => { location.reload() }, 1500);
        })

    }
}

function listWords(array, templateLetter) {
    let bulletedWords = ''
    for (let word of array) {
        bulletedWords += `* {{${templateLetter}|${word}}} \n`
    }
    return bulletedWords
}

function VECReportBuilder(usernames, input) {
    let finalText = ''
    for (let user of usernames) {
        let templateWord = mw.util.isIPAddress(user, true) ? 'VándaloIP' : 'Vándalo';
        finalText +=    `=== ${user} ===` + '\n' +
                        `* Posible vándalo: {{${templateWord}|${user}}}` + '\n' +
                        `* Motivo del reporte: ${input.reason}` + '\n' +
                        '* Usuario que reporta: ~~~~' + '\n' +
                        '* Acción administrativa: (a rellenar por un bibliotecario)' + '\n'
    }
    return finalText
}

function buildEditOnNoticeboard (input, usernames, articles) {
    if (input.motive == "Vandalismo en curso") {
        return (revision) => {
            return {
                text:   revision.content + '\n' + VECReportBuilder(usernames, input),
                summary: `Creando denuncia de usuario mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                minor:  false
            }
        }
    } else {
        let title = input.motive == "Otro" ? input.otherreason : input.motive ;
        let bulletedUserList = listWords(usernames, 'u') 
        let bulletedArticleList = listWords(articles, 'a')
        let reasonTitle = input.motive == "Guerra de ediciones" ? `; Comentario` : `; Motivo`;
        let articleListIfEditWar = input.motive == "Guerra de ediciones" ? `\n; Artículos en los que se lleva a cabo \n${bulletedArticleList} \n` : '\n';
        return (revision) => {
            return {
                text:   revision.content + '\n' + '\n' +
                        `== ${title} ==` + '\n' +
                        '; Usuarios implicados' + '\n' +
                        `${bulletedUserList}` +
                        articleListIfEditWar +
                        reasonTitle + '\n' +
                        `${input.reason}` + '\n' +
                        '; Usuario que lo solicita' + '\n' +
                        '~~~~' + '\n' +
                        '; Respuesta' + '\n' + 
                        '(a rellenar por un bibliotecario)',
                summary: `Creando denuncia de usuario mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                minor:  false
            }
        }
    }
}

function postsMessage(input) {
        return utils.isPageMissing(`Usuario_discusión:${input.usernamefield}`)
            .then(function (mustCreateNewTalkPage) {
                let title = input.motive == "Otro" ? input.otherreason : input.motive ;
                if (mustCreateNewTalkPage) {
                    return new mw.Api().create(
                        `Usuario_discusión:${input.usernamefield}`,
                        { summary: `Aviso al usuario de su denuncia en [[${motiveOptionsDict[input.motive].link}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`},
                        `\n== ${title} ==\n` +
                        `Hola. Te informo de que he creado una denuncia —por la razón mencionada en el título— que te concierne. Puedes consultarla en el tablón correspondiente a través de '''[[${motiveOptionsDict[input.motive].link}#${title}|este enlace]]'''. Un [[WP:B|bibliotecario]] se encargará de analizar el caso y emitirá una resolución al respecto próximamente. Un saludo. ~~~~`
                    );
                } else {
                    return new mw.Api().edit(
                        `Usuario_discusión:${input.usernamefield}`,
                        function (revision) {
                            return {
                                text: revision.content + `\n== ${title} ==\n` + `Hola. Te informo de que he creado una denuncia —por la razón mencionada en el título— que te concierne. Puedes consultarla en el tablón correspondiente a través de '''[[${motiveOptionsDict[input.motive].link}#${title}|este enlace]]'''. Un [[WP:B|bibliotecario]] se encargará de analizar el caso y emitirá una resolución al respecto próximamente. Un saludo. ~~~~`,
                                summary: `Aviso al usuario de su denuncia en [[${motiveOptionsDict[input.motive].link}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                                minor: false
                            }
                        }
                    )
                }
            })
}

export { createFormWindow };