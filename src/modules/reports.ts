import { QuickFormElementInstance, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { ReportMotive } from "types/twinkle-types";
import { api, createStatusWindow, currentPageName, finishMorebitsStatus, getContent, isPageMissing, relevantUserName, showConfirmationDialog } from "./../utils/utils";
import { ApiEditPageParams } from "types-mediawiki/api_params";

let reportedUser: string;
let Window: SimpleWindowInstance;

let reportMotiveDict: ReportMotive = {
    "CPP":
    {
        "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
        "usersSubtitle": 'Lista de usuarios',
        "optionalReason": false
    },
    "Cuenta creada para vandalizar":
    {
        "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
        "usersSubtitle": 'Lista de usuarios',
        "optionalReason": true
    },
    "Evasión de bloqueo":
    {
        "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
        "usersSubtitle": 'Lista de usuarios',
        "optionalReason": false
    },
    "Guerra de ediciones":
    {
        "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/3RR/Actual",
        "usersSubtitle": 'Usuarios implicados',
        "optionalReason": false
    },
    "Nombre inapropiado":
    {
        "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
        "usersSubtitle": 'Lista de usuarios',
        "optionalReason": true
    },
    "Violación de etiqueta":
    {
        "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Violaciones_de_etiqueta/Actual",
        "usersSubtitle": 'Usuarios implicados',
        "optionalReason": false
    },
    "Vandalismo en curso":
    {
        "link": "Wikipedia:Vandalismo_en_curso",
        "optionalReason": false
    },
    "Vandalismo persistente":
    {
        "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
        "usersSubtitle": 'Lista de usuarios',
        "optionalReason": true
    },
    "Otro":
    {
        "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Miscelánea/Actual",
        "usersSubtitle": 'Usuarios implicados',
        "optionalReason": false
    }
}

function getMotiveOptions() {
    let dropdownOptions: { value: string, label: string }[] = [];
    for (let motive in reportMotiveDict) {
        let option = {
            value: motive,
            label: motive,
        }
        dropdownOptions.push(option)
    }
    return dropdownOptions
}

function changeButtonNames() {
    const moreBox = document.querySelector('input[value="more"]') as HTMLInputElement;
    if (moreBox) {
        moreBox.value = "añadir"
        moreBox.style.marginTop = '0.3em' // To separate it slightly from the rest of the elements
        moreBox.addEventListener("click", () => {
            const removeBox = document.querySelector('input[value="remove"]') as HTMLInputElement;
            removeBox.value = "eliminar"
            removeBox.style.marginLeft = '0.3em' // Idem as four code lines above
        })
    }
}

function adjustMotiveOptions(selectedOption: string) {
    const reasonTextAreaNode = document.querySelector("label[for='reasontextareanode']");
    const articleFieldNode = document.getElementById('articlefieldnode');
    const otherReasonNode = document.getElementById('otherreasonnode');
    const hideNameNode = document.getElementById('hideNameNode');

    if (reasonTextAreaNode && articleFieldNode && otherReasonNode) {
        reasonTextAreaNode.textContent = `Desarrolla la razón${reportMotiveDict[selectedOption].optionalReason ? ' (opcional)' : ''}:`
        articleFieldNode.setAttribute('style', 'display:none');
        otherReasonNode.setAttribute('style', 'display:none');
        hideNameNode?.setAttribute('style', 'display:none');

        switch (selectedOption) {
            case 'Guerra de ediciones':
                articleFieldNode.removeAttribute('style');
                changeButtonNames();
                break;
            case 'Violación de etiqueta':
                reasonTextAreaNode.textContent = 'Ediciones que constituyen una violación de etiqueta:'
                break;
            case 'Nombre inapropiado':
                if (hideNameNode) {
                    hideNameNode.style.display = '';
                    hideNameNode.style.paddingTop = '0.5em'
                }
                break;
            case 'Otro':
                otherReasonNode.removeAttribute('style')
                break;
        }
    }

}

function setReportedUserName() {
    const usernameField = document.querySelector('input[name="usernamefield"]') as HTMLInputElement
    usernameField.value = reportedUser
}

function listWords(wordArray: string[], templateLetter: 'u' | 'a', motive: string, addHideTemplate?: boolean): string {
    let bulletedWords = '';
    for (let word of wordArray) {
        if (motive == 'Nombre inapropiado' && addHideTemplate) {
            bulletedWords += `* {{bloqueo oculto|${word}|ocultar=sí}} \n`
        } else {
            bulletedWords += `* {{${templateLetter}|${word}}} \n`
        }
    }
    return bulletedWords;
}

function VECReportBuilder(usernames: string[], input: QuickFormInputObject): string {
    let finalText: string = '';
    for (let user of usernames) {
        const templateWord = mw.util.isIPAddress(user, true) ? 'VándaloIP' : 'Vándalo';
        finalText += `=== ${user} ===` + '\n' + '\n' +
            `* Posible vándalo: {{${templateWord}|${user}}}` + '\n' +
            `* Motivo del reporte: ${input.reason}` + '\n' +
            '* Usuario que reporta: ~~~~' + '\n' +
            '* Acción administrativa: (a rellenar por un bibliotecario)' + '\n'
    }
    return finalText
}

// Builds a regex to be used in the createHash function using the title of the report
function buildRegex(reportTitle: string): RegExp {
    const regExpString = String.raw`==\s*${reportTitle}\s*==`;
    return new RegExp(regExpString, 'g');
}

// Creates the hash to be used in the link to the appropriate board on the notified user's talk page
// Does so by examining the content of the board and counting the amount of similar titles
// It then returns the appropriate hash number corresponding to the id of the report's title
async function createHash(board: string, reportTitle: string): Promise<string | void> {
    const boardContent = await getContent(board);
    if (boardContent) {
        const regex = buildRegex(reportTitle);
        const otherOccurrences = boardContent.match(regex);
        if (otherOccurrences && otherOccurrences.length > 1) {
            return `${reportTitle}_${otherOccurrences.length}`;
        }
        return reportTitle;
    }
    return alert("Ha habido un error, inténtalo de nuevo maś tarde");
}


function buildEditOnNoticeboard(input: QuickFormInputObject, usernames: string[], articles: string[]): (revision: any) => ApiEditPageParams {
    const motive: string = input.motive as string
    if (motive == "Vandalismo en curso") {
        return (revision) => {
            const summaryUser = usernames.length > 1 ? 'usuarios' : `[[Especial:Contribuciones/${usernames[0]}|usuario]]`;
            return {
                text: revision.content + '\n' + '\n' + VECReportBuilder(usernames, input),
                summary: `Creando denuncia de ${summaryUser} mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                minor: false
            }
        }
    } else {
        let title = motive == "Otro" ? input.otherreason : motive;
        let bulletedUserList = listWords(usernames, 'u', motive, input.hide)
        let bulletedArticleList = listWords(articles, 'a', motive)
        let reasonTitle = motive == "Guerra de ediciones" ? `; Comentario` : `; Motivo`;
        let articleListIfEditWar = motive == "Guerra de ediciones" ? `\n; Artículos en los que se lleva a cabo \n${bulletedArticleList} \n` : '\n';
        return (revision) => {
            return {
                text: revision.content + '\n' + '\n' +
                    `== ${title} ==` + '\n' +
                    `; ${reportMotiveDict[motive].usersSubtitle}` + '\n' +
                    `${bulletedUserList}` +
                    articleListIfEditWar +
                    (reportMotiveDict[motive].optionalReason && !input.reason ? '' : `${reasonTitle}\n${input.reason}\n`) +
                    '; Usuario que lo solicita' + '\n' +
                    '* ~~~~' + '\n' +
                    '; Respuesta' + '\n' +
                    '(a rellenar por un bibliotecario)',
                summary: `Creando denuncia de usuario mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                minor: false
            }
        }
    }
}

function postsMessage(input: QuickFormInputObject, usernames: string[]): Promise<ApiEditPageParams> | undefined {
    if (!input.notify) return;
    new Morebits.status("Paso 3", `avisando al usuario reportado...`, "info");
    return isPageMissing(`Usuario_discusión:${usernames[0]}`)
        .then(async function (mustCreateNewTalkPage) {
            const title: string = (input.motive == "Otro" ? input.otherreason : input.motive) as string;
            const motive: string = input.motive as string;
            const hash = await createHash(reportMotiveDict[motive].link, title);
            const notificationString = `Hola. Te informo de que he creado una denuncia —por la razón mencionada en el título— que te concierne. Puedes consultarla en el tablón correspondiente a través de '''[[${reportMotiveDict[motive].link}#${motive == "Vandalismo en curso" ? reportedUser : hash}|este enlace]]'''. Un [[WP:B|bibliotecario]] se encargará de analizar el caso y emitirá una resolución al respecto próximamente. Un saludo. ~~~~`;
            if (mustCreateNewTalkPage) {
                return api.create(
                    `Usuario_discusión:${usernames[0]}`,
                    { summary: `Aviso al usuario de su denuncia por [[${reportMotiveDict[motive].link}|${title.toLowerCase()}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
                    `\n== ${title} ==\n` +
                    notificationString
                );
            } else {
                return api.edit(
                    `Usuario_discusión:${usernames[0]}`,
                    function (revision) {
                        return {
                            text: revision.content + `\n== ${title} ==\n` + notificationString,
                            summary: `Aviso al usuario de su denuncia por [[${reportMotiveDict[motive].link}|${title.toLowerCase()}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                            minor: false
                        }
                    }
                )
            }
        })
}

function submitMessage(e: Event) {
    const form = e.target;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);
    const chosenMotive = input.motive as string;
    const usernameElements: HTMLInputElement[] = Array.from(document.querySelectorAll('input[name=usernamefield]')) as HTMLInputElement[]
    const usernames = usernameElements.map((o) => o.value)
    const articleElements: HTMLInputElement[] = Array.from(document.querySelectorAll('input[name=articlefieldbox]')) as HTMLInputElement[]
    const articles = articleElements.map((o) => o.value)

    if (!input.reason && !reportMotiveDict[chosenMotive].optionalReason) {
        alert("No se ha establecido un motivo.");
    } else if (input.motive == 'Otro' && input.otherreason == '') {
        alert("No se ha establecido un título para la denuncia");
    } else if (input.usernamefield == '') {
        alert("No se ha establecido un usuario");
    } else if (input.motive == 'Guerra de ediciones' && !articles[0]) {
        alert('Debe incluirse al menos un artículo en la denuncia')
    } else {
        if (showConfirmationDialog('¿Estás seguro de que quieres enviar la denuncia?')) {
            const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
            createStatusWindow(statusWindow);
            new Morebits.status("Paso 1", `obteniendo datos del formulario...`, "info");

            new Morebits.status("Paso 2", "creando denuncia en el tablón...", "info");
            api.edit(
                reportMotiveDict[chosenMotive].link,
                buildEditOnNoticeboard(input, usernames, articles)
            )
                .then(() => {
                    return postsMessage(input, usernames);
                })
                .then(() => {
                    if (currentPageName.includes(`_discusión:${reportedUser}`)) {
                        finishMorebitsStatus(Window, statusWindow, 'finished', true);
                    } else {
                        finishMorebitsStatus(Window, statusWindow, 'finished', false);
                    }
                })
                .catch((error) => {
                    finishMorebitsStatus(Window, statusWindow, 'error');
                    console.error(`Error: ${error}`);
                })
        }
    }
}

export function createReportsFormWindow(reportedUserFromDOM: string | null): void {
    // Something about the addPortletLink feature doesn't work well so this condition is unfortunately needed
    if (typeof reportedUserFromDOM == 'string') {
        reportedUser = reportedUserFromDOM;
    } else {
        reportedUser = relevantUserName;
    }

    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Denunciar usuario');
    Window.addFooterLink('Tablón de anuncios de los bibliotecarios', 'Wikipedia:Tablón de anuncios de los bibliotecarios');
    const form: QuickFormElementInstance = new Morebits.quickForm(submitMessage);

    const reportTypeField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Opciones:',
    })

    reportTypeField.append({
        type: 'select',
        label: 'Selecciona el motivo:',
        name: 'motive',
        list: getMotiveOptions(),
        event:
            function (e: any) {
                if (e?.target?.value) {
                    const selectedOption = e.target.value
                    adjustMotiveOptions(selectedOption);
                }
            }
    })

    form.append({
        type: 'checkbox',
        list: [{
            name: "notify",
            value: "notify",
            label: "Notificar al usuario denunciado",
            checked: false,
            tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del usuario reportado avisándole de la denuncia"
        }],
        style: "padding-left: 1em;"
    })

    const reportInfoField: QuickFormElementInstance = form.append({
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
        type: 'checkbox',
        list: [{
            name: "hide",
            value: "hide",
            label: 'Ocultar nombre(s) de usuario en la denuncia',
            checked: false,
            tooltip: "Marca esta casilla para que el nombre de usuario de las personas que forman parte de la denuncia aparezca oculto"
        }],
        style: "padding-top: 0.5em; display: none;",
        id: "hideNameNode"
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

    const result = form.render();
    Window.setContent(result);
    Window.display();

    setReportedUserName();
    changeButtonNames();

}