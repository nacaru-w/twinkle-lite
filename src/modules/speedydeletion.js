import * as utils from "./utils";

let Window, deletionTemplateExists;

let criteriaLists = {
    general: [
        { code: "g1", name: "G1. Vandalismo" },
        { code: "g2", name: "G2. Faltas de etiqueta" },
        { code: "g3", name: "G3. Páginas promocionales" },
        { code: "g4", name: "G4. Páginas de pruebas de edición" },
        { code: "g5", name: "G5. Bulos, fraudes" },
        { code: "g6", name: "G6. Violaciones de derechos de autor" },
        { code: "g7", name: "G7. Páginas de discusión huérfanas" },
        { code: "g8", name: "G8. Borrado de una página para dejar sitio" },
        { code: "g9", name: "G9. Recreación de material borrado" },
        { code: "g10", name: "G10. Para mantenimiento elemental" },
        { code: "g11", name: "G11. A petición del único autor" }
    ], articles: [
        {
            code: "a1", name: "A1. Viola «lo que Wikipedia no es»", subgroup: {
                type: 'checkbox',
                name: 'subA',
                list: [
                    { value: "a1.1", label: "A1.1 Artículos que solo incluyen enlaces" },
                    { value: "a1.2", label: "A1.2 Definiciones de diccionario o recetas" },
                    { value: "a1.3", label: "A1.3 Fuente primaria" },
                    { value: "a1.4", label: "A1.4 Ensayos de opinión" }
                ]
            },
        },
        { code: "a2", name: "A2. Infraesbozo" },
        { code: "a3", name: "A3. Páginas sin traducir o traducciones automáticas" },
        { code: "a4", name: "A4. Contenido no enciclopédico o sin relevancia" },
        {
            code: "a5", name: "A5. Artículo duplicado", subgroup: {
                type: "input",
                name: "originalArticleName",
                label: "Nombre del artículo original: ",
                tooltip: "Escribe el nombre del artículo sin utilizar wikicódigo. Ej.: «Granada (fruta)», «Ensalada» o «Plantilla:Atajos»",
                required: true
            }
        }
    ], redirects: [
        { code: "r1", name: "R1. Redirecciones a páginas inexistentes" },
        { code: "r2", name: "R2. Redirecciones de un espacio de nombres a otro" },
        { code: "r3", name: "R3. Redirecciones automáticas innecesarias" },
        { code: "r4", name: "R4. Redirecciones incorrectas o innecesarias" },
    ], categories: [
        { code: "c1", name: "C1. Categorías vacías" },
        { code: "c2", name: "C2. Categorías trasladadas o renombradas" },
        { code: "c3", name: "C3. Categorías que violan la política de categorías" }
    ], userpages: [
        { code: "u1", name: "U1. A petición del propio usuario" },
        { code: "u2", name: "U2. Usuario inexistente" },
        { code: "u3", name: "U3. Violación de la política de páginas de usuario" }
    ], templates: [
        { code: "p1", name: "P1. Violación de la política de plantillas de navegación" },
        { code: "p2", name: "P2. Subpágina de documentación huérfana" },
        { code: "p3", name: "P3. Plantillas de un solo uso" }
    ], other: [
        {
            code: "other", name: "Otra razón", subgroup: {
                type: "input",
                name: "otherreason",
                label: "Establece la razón: ",
                tooltip: "Puedes utilizar wikicódigo en tu respuesta",
                required: true
            }
        }
    ]
}

function getOptions(criteriaType) {
    let options = [];
    for (let chosenType of criteriaLists[criteriaType]) {
        let option = { value: chosenType.code, label: chosenType.name, checked: chosenType.default, subgroup: chosenType.subgroup };
        options.push(option);
    }
    return options;
}

async function createFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);
    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Solicitar borrado rápido');
    Window.addFooterLink('Criterios para el borrado rápido', 'Wikipedia:Criterios para el borrado rápido');
    let form = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'checkbox',
        list:
            [{
                name: "notify",
                value: "notify",
                label: "Notificar al creador de la página",
                checked: true,
                tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador advirtiéndole del posible borrado de su artículo"
            }],
        style: "padding-left: 1em; padding-top:0.5em;"
    })

    let gField = form.append({
        type: 'field',
        label: 'Criterios generales:',
    });
    gField.append({
        type: 'checkbox',
        name: 'general',
        list: getOptions("general")
    })

    if (utils.currentNamespace == 0 || utils.currentNamespace == 104 && !mw.config.get('wgIsRedirect')) {
        let aField = form.append({
            type: 'field',
            label: 'Criterios para artículos y anexos:',
        })

        aField.append({
            type: 'checkbox',
            name: 'article',
            list: getOptions("articles")
        })
    }

    if (mw.config.get('wgIsRedirect')) {
        let rField = form.append({
            type: 'field',
            label: 'Criterios para páginas de redirección:',
        })
        rField.append({
            type: 'checkbox',
            name: 'redirect',
            list: getOptions("redirects")
        })
    }

    if (utils.currentNamespace == 14) {
        let cField = form.append({
            type: 'field',
            label: 'Criterios para categorías:',
        })
        cField.append({
            type: 'checkbox',
            name: 'categories',
            list: getOptions("categories")
        })
    }

    if (utils.currentNamespace == 2) {
        let uField = form.append({
            type: 'field',
            label: 'Criterios para páginas de usuario:',
        })
        uField.append({
            type: 'checkbox',
            name: 'userpages',
            list: getOptions("userpages")
        })
    }

    if (utils.currentNamespace == 10) {
        let tField = form.append({
            type: 'field',
            label: 'Criterios para plantillas:',
        })
        tField.append({
            type: 'checkbox',
            name: 'templates',
            list: getOptions("templates")
        })
    }

    form.append({
        type: 'checkbox',
        name: 'other',
        list: getOptions("other"),
        style: "padding-left: 1em; padding-bottom: 0.5em"
    })

    form.append({
        type: 'submit',
        label: 'Aceptar'
    });

    let result = form.render();
    Window.setContent(result);
    Window.display();
    // After the content has been displayed, we will call the api
    // to check if a deletion template already exists and store
    // the info in a global variable
    deletionTemplateExists = await checkExistingDeletionTemplate();
}

function submitMessage(e) {
    let form = e.target;
    let input = Morebits.quickForm.getInputData(form);
    //This little condition removes the A1 criterion if any of its subcriteria are included
    if (input?.subA) {
        if (input.subA.length > 0) {
            input.article.shift();
        }
    }
    // This will ask the user to confirm the action if there's a deletion template
    // in the article already, which is info we've previously stored as a global variable 
    if (deletionTemplateExists) {
        if (!confirm('Parece que ya existe una plantilla de borrado en el artículo, ¿deseas colocar la plantilla igualmente?')) {
            return
        }
    }
    let statusWindow = new Morebits.simpleWindow(400, 350);
    utils.createStatusWindow(statusWindow);
    new Morebits.status("Paso 1", `generando plantilla de borrado...`, "info");
    new mw.Api().edit(
        utils.currentPageName,
        speedyTemplateBuilder(input)
    )
        .then(function () {
            return utils.getCreator().then(postsMessage(input));
        })
        .then(function () {
            new Morebits.status("✔️ Finalizado", "actualizando página...", "status");
            setTimeout(() => { location.reload() }, 2000);
        })
        .catch(function () {
            new Morebits.status("❌ Se ha producido un error", "Comprueba las ediciones realizadas", "error")
            setTimeout(() => { location.reload() }, 4000);
        })
}

async function checkExistingDeletionTemplate() {
    const regex = /{{(?:sust\:)?(?:destruir|d|db-ul|db-user|speedy|borrar|db|delete|eliminar|aviso\sborrar)\|.+?}}/i
    const content = await utils.getContent(utils.currentPageName);
    if (content.match(regex)) {
        return true
    }
    return false
}

function speedyTemplateBuilder(data) {
    return (revision) => {
        return {
            text: `{{destruir|${allCriteria(data)}}} \n` + revision.content,
            summary: `Añadiendo plantilla de borrado mediante [[WP:Twinkle Lite|Twinkle Lite]]${data?.originalArticleName ? `. Artículo existente de mayor calidad: [[${data.originalArticleName}]]` : ''}`,
            minor: false
        }
    }
}

function allCriteria(data) {
    let fields = [];
    for (let criteriaType in data) {
        if (criteriaType !== "other" && Array.isArray(data[criteriaType])) {
            fields.push(...data[criteriaType]);
        }
    }

    let reasonString = data?.otherreason ?? '';
    if (reasonString != '') {
        fields.push(reasonString);
    }
    return fields.join('|');
}

function postsMessage(input) {
    if (!input.notify) return;
    return (creator) => {
        if (creator == utils.currentUser) {
            return;
        } else {
            new Morebits.status("Paso 2", "publicando un mensaje en la página de discusión del creador...", "info");
            return utils.isPageMissing(`Usuario_discusión:${creator}`)
                .then(function (mustCreateNewTalkPage) {
                    if (mustCreateNewTalkPage) {
                        return new mw.Api().create(
                            `Usuario_discusión:${creator}`,
                            { summary: `Aviso al usuario del posible borrado de [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` },
                            `{{subst:Aviso destruir|${utils.currentPageNameWithoutUnderscores}|${allCriteria(input)}}} ~~~~`
                        );
                    } else {
                        return new mw.Api().edit(
                            `Usuario_discusión:${creator}`,
                            function (revision) {
                                return {
                                    text: revision.content + `\n{{subst:Aviso destruir|${utils.currentPageNameWithoutUnderscores}|${allCriteria(input)}}} ~~~~`,
                                    summary: `Aviso al usuario del posible borrado de [[${utils.currentPageNameWithoutUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                                    minor: false
                                }
                            }
                        )
                    }
                })
        }
    }
}

export { createFormWindow };