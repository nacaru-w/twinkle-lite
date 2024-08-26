var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
System.register("types/morebits-types", [], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("types/twinkle-types", [], function (exports_2, context_2) {
    "use strict";
    var __moduleName = context_2 && context_2.id;
    return {
        setters: [],
        execute: function () {
        }
    };
});
System.register("modules/utils", [], function (exports_3, context_3) {
    "use strict";
    var currentPageName, currentPageNameNoUnderscores, currentUser, relevantUserName, currentNamespace, currentAction, currentSkin, diffNewId;
    var __moduleName = context_3 && context_3.id;
    /**
     * Extracts the main page name from a string that may include a talk page prefix.
     *
     * @param pageName - The full page name, which may start with a talk page prefix like "Discusión:".
     * @returns The main page name, excluding the talk page prefix if present.
     */
    function stripTalkPagePrefix(pageName) {
        if (pageName.startsWith("Discusión:")) {
            return pageName.substring("Discusión:".length);
        }
        return pageName;
    }
    exports_3("stripTalkPagePrefix", stripTalkPagePrefix);
    /**
     * Configures and displays a status window using a Morebits' simplewindow object.
     *
     * @param window - A Morebits' simplewindow object that will be configured and displayed.
     */
    function createStatusWindow(window) {
        window.setTitle('Procesando acciones');
        let statusdiv = document.createElement('div');
        statusdiv.style.padding = '15px';
        window.setContent(statusdiv);
        Morebits.status.init(statusdiv);
        window.display();
    }
    exports_3("createStatusWindow", createStatusWindow);
    /**
     * Retrieves the username of the creator of the current page using the MediaWiki API.
     *
     * @returns A promise that resolves to the username of the creator of the page, or `null` if the creator cannot be determined.
     */
    function getCreator() {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                action: 'query',
                prop: 'revisions',
                titles: currentPageName,
                rvprop: 'user',
                rvdir: 'newer',
                format: 'json',
                rvlimit: 1,
            };
            const apiPromise = new mw.Api().get(params);
            const data = yield apiPromise;
            const pages = data.query.pages;
            for (let p in pages) {
                return pages[p].revisions[0].user;
            }
            return null;
        });
    }
    exports_3("getCreator", getCreator);
    /**
     * Checks if a specified page is missing or does not exist using the MediaWiki API.
     *
     * @param title - The title of the page to check.
     * @returns A promise that resolves to `true` if the page is missing, or `false` if it exists.
     */
    function isPageMissing(title) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                action: 'query',
                titles: title,
                prop: 'pageprops',
                format: 'json'
            };
            const apiPromise = new mw.Api().get(params);
            const data = yield apiPromise;
            const result = data.query.pages;
            return Object.prototype.hasOwnProperty.call(result, "-1");
        });
    }
    exports_3("isPageMissing", isPageMissing);
    /**
     * Fetches the protection status of a specified page using the MediaWiki API.
     *
     * @param pageName - The name of the page to fetch protection status for.
     * @returns A promise that resolves to an object containing the protection level and expiry date.
     */
    function getProtectionStatus(pageName) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                action: 'query',
                prop: 'info',
                inprop: 'protection',
                titles: pageName,
                format: 'json',
            };
            const apiPromise = new mw.Api().get(params);
            const data = yield apiPromise;
            const pages = data.query.pages;
            let object = {
                level: 'sin protección',
                expiry: ''
            };
            for (let p in pages) {
                for (let info of pages[p].protection) {
                    console.log(info.type);
                    if ((info === null || info === void 0 ? void 0 : info.type) == 'move') {
                        continue;
                    }
                    else {
                        const protectionLevel = info === null || info === void 0 ? void 0 : info.level;
                        switch (protectionLevel) {
                            case 'sysop':
                                object.level = 'solo bibliotecarios';
                                break;
                            case 'autoconfirmed':
                                object.level = 'solo usuarios autoconfirmados';
                                break;
                            case 'templateeditor':
                                object.level = 'solo editores de plantillas';
                                break;
                        }
                        if (info === null || info === void 0 ? void 0 : info.expiry) {
                            const expiryTimeStamp = (_a = pages[p].protection[0]) === null || _a === void 0 ? void 0 : _a.expiry;
                            object.expiry = expiryTimeStamp;
                        }
                    }
                }
            }
            return object;
        });
    }
    exports_3("getProtectionStatus", getProtectionStatus);
    /**
     * Fetches the text content of a specified page using the MediaWiki API.
     *
     * @param pageName - The name of the page to fetch content for.
     * @returns A promise that resolves to the page content as a string, or undefined if not found.
     * @throws An error if the API request fails.
     */
    function getContent(pageName) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const params = {
                action: 'query',
                prop: 'revisions',
                titles: pageName,
                rvprop: 'content',
                rvslots: 'main',
                formatversion: '2',
                format: 'json'
            };
            const apiPromise = new mw.Api().get(params);
            try {
                const data = yield apiPromise;
                return (_b = (_a = data.query.pages[0].revisions[0].slots) === null || _a === void 0 ? void 0 : _a.main) === null || _b === void 0 ? void 0 : _b.content;
            }
            catch (error) {
                console.error('Error fetching page content:', error);
                throw error;
            }
        });
    }
    exports_3("getContent", getContent);
    /**
     * Parses a timestamp string and returns it formatted as a localized date string in Spanish.
     *
     * @param timeStamp - The timestamp string to be parsed.
     * @returns A formatted date string in the format "day month year" in Spanish locale.
     */
    function parseTimeStamp(timeStamp) {
        const options = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        };
        const date = new Date(timeStamp);
        return date.toLocaleDateString('es-ES', options);
    }
    exports_3("parseTimeStamp", parseTimeStamp);
    function finishMorebitsStatus(window, statusWindow, status, refresh) {
        let statusState, statusMessage, statusType;
        switch (status) {
            case 'finished':
                statusState = '✔️ Finalizado';
                statusMessage = refresh ? 'actualizando página...' : 'cerrando ventana...';
                statusType = 'status';
                break;
            case 'error':
                statusState = '❌ Se ha producido un error';
                statusMessage = 'Comprueba las ediciones realizadas';
                statusType = 'error';
                break;
        }
        new Morebits.status(statusState, statusMessage, statusType);
        if (refresh) {
            setTimeout(() => {
                location.reload();
            }, 2500);
        }
        else if (!refresh && status !== 'error') {
            setTimeout(() => {
                statusWindow.close();
                window.close();
            }, 2500);
        }
    }
    exports_3("finishMorebitsStatus", finishMorebitsStatus);
    return {
        setters: [],
        execute: function () {
            exports_3("currentPageName", currentPageName = mw.config.get('wgPageName'));
            exports_3("currentPageNameNoUnderscores", currentPageNameNoUnderscores = currentPageName.replace(/_/g, ' '));
            exports_3("currentUser", currentUser = mw.config.get('wgUserName'));
            exports_3("relevantUserName", relevantUserName = mw.config.get("wgRelevantUserName"));
            exports_3("currentNamespace", currentNamespace = mw.config.get('wgNamespaceNumber'));
            exports_3("currentAction", currentAction = mw.config.get('wgAction'));
            exports_3("currentSkin", currentSkin = mw.config.get('skin'));
            exports_3("diffNewId", diffNewId = mw.config.get('wgDiffNewId'));
        }
    };
});
System.register("modules/deletionrequestmaker", ["modules/utils"], function (exports_4, context_4) {
    "use strict";
    var utils_1, Window, deletionRequestCategoryOptions;
    var __moduleName = context_4 && context_4.id;
    /**
     * Converts the deletion request categories into a format recognized by Morebits.
     * @returns A list of category options formatted for use in a dropdown menu.
     */
    function getCategoryOptions() {
        let categoryOptions = [];
        for (let category of deletionRequestCategoryOptions) {
            let option = { type: 'option', value: category.code, label: category.name };
            categoryOptions.push(option);
        }
        return categoryOptions;
    }
    /**
     * Constructs the deletion template to be used on the deletion discussion page.
     * @param category - The category code for the deletion request.
     * @param reason - The reason provided for the deletion request.
     * @returns A Wikicode string representing the deletion template.
     */
    function buildDeletionTemplate(category, reason) {
        return `{{sust:cdb2|pg={{sust:SUBPAGENAME}}|cat=${category}|texto=${reason}|{{sust:CURRENTDAY}}|{{sust:CURRENTMONTHNAME}}}} ~~~~`;
    }
    /**
     * Creates a deletion request page if it doesn't already exist. If the page exists and has been closed,
     * it prompts the user to start a second deletion discussion.
     * @param category - The category code for the deletion request.
     * @param reason - The reason provided for the deletion request.
     * @returns A promise that resolves when the deletion request page is created or the process is interrupted.
     */
    function createDeletionRequestPage(category, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            const missingPage = yield utils_1.isPageMissing(`Wikipedia:Consultas de borrado/${utils_1.currentPageName}`);
            if (missingPage) {
                return new mw.Api().create(`Wikipedia:Consultas de borrado/${utils_1.currentPageName}`, { summary: `Creando página de discusión para el borrado de [[${utils_1.currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` }, buildDeletionTemplate(category, reason));
            }
            else {
                const content = yield utils_1.getContent(`Wikipedia:Consultas de borrado/${utils_1.currentPageName}`);
                if (content.includes('{{archivo borrar cabecera') || content.includes('{{cierracdb-arr}}')) {
                    const confirmMessage = `Parece que ya se había creado una consulta de borrado para ${utils_1.currentPageNameNoUnderscores} cuyo resultado fue MANTENER. ¿Quieres abrir una segunda consulta?`;
                    if (confirm(confirmMessage)) {
                        return new mw.Api().create(`Wikipedia:Consultas de borrado/${utils_1.currentPageName}_(segunda_consulta)`, { summary: `Creando página de discusión para el borrado de [[${utils_1.currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` }, buildDeletionTemplate(category, reason));
                    }
                    else {
                        new Morebits.status("Proceso interrumpido", "acción abortada por el usuario... actualizando página", "error");
                        setTimeout(() => { location.reload(); }, 4000);
                    }
                }
                else {
                    alert('Parece que ya existe una consulta en curso');
                    new Morebits.status("Proceso interrumpido", "ya existe una consulta en curso", "error");
                    setTimeout(() => { location.reload(); }, 4000);
                }
            }
        });
    }
    /**
     * Builds the edit parameters required to place the deletion template on the nominated page.
     * @param revision - The current revision of the page to be edited.
     * @returns An object containing the parameters necessary to make the edit.
     */
    function buildEditOnNominatedPage(revision) {
        return {
            text: '{{sust:cdb}}\n' + revision.content,
            summary: `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${utils_1.currentPageName}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
            minor: false
        };
    }
    /**
     * Edits additional pages that have been nominated for deletion in the same discussion,
     * adding a cross-reference to the main nominated page.
     * @param article - The title of the article to be edited.
     * @returns A promise that resolves when the edit is complete.
     */
    function makeEditOnOtherNominatedPages(article) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new mw.Api().edit(article, (revision) => {
                return {
                    text: `{{sust:cdb|${utils_1.currentPageName}}}\n` + revision.content,
                    summary: `Nominada para su borrado, véase [[Wikipedia:Consultas de borrado/${utils_1.currentPageName}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                    minor: false
                };
            });
        });
    }
    /**
     * Posts a notification message on the talk page of the creator of the article,
     * informing them of the deletion discussion.
     * @param creator - The username of the article's creator.
     * @returns A promise that resolves when the message is posted or the process is interrupted.
     */
    function postsMessage(creator) {
        return __awaiter(this, void 0, void 0, function* () {
            if (creator) {
                const mustCreateNewTalkPage = yield utils_1.isPageMissing(`Usuario_discusión:${creator}`);
                if (mustCreateNewTalkPage) {
                    return new mw.Api().create(`Usuario_discusión:${creator}`, { summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Twinkle Lite|Twinkle Lite]]' }, `{{sust:Aviso cdb|${utils_1.currentPageNameNoUnderscores}}} ~~~~`);
                }
                else {
                    return new mw.Api().edit(`Usuario_discusión:${creator}`, (revision) => {
                        return {
                            text: revision.content + `\n{{sust:Aviso cdb|${utils_1.currentPageNameNoUnderscores}}} ~~~~`,
                            summary: 'Aviso al usuario de la apertura de una CDB mediante [[WP:Twinkle Lite|Twinkle Lite]]',
                            minor: false
                        };
                    });
                }
            }
        });
    }
    /**
     * Handles the form submission event, orchestrating the creation of the deletion discussion page,
     * editing the nominated page(s), and notifying the article's creator.
     * @param e - The form submission event.
     */
    function submitMessage(e) {
        let form = e.target;
        let input = Morebits.quickForm.getInputData(form);
        if (input.reason === ``) {
            alert("No se ha establecido un motivo.");
        }
        else {
            if (window.confirm(`Esto creará una consulta de borrado para el artículo ${utils_1.currentPageNameNoUnderscores}, ¿estás seguro?`)) {
                const statusWindow = new Morebits.simpleWindow(400, 350);
                utils_1.createStatusWindow(statusWindow);
                new Morebits.status("Paso 1", "comprobando disponibilidad y creando la página de discusión de la consulta de borrado...", "info");
                createDeletionRequestPage(input.category, input.reason)
                    .then(function () {
                    new Morebits.status("Paso 2", "colocando plantilla en la(s) página(s) nominada(s)...", "info");
                    return new mw.Api().edit(utils_1.currentPageName, buildEditOnNominatedPage);
                })
                    .then(function () {
                    if (input.otherArticleFieldBox) {
                        const otherArticleArray = Array.from(document.querySelectorAll('input[name="otherArticleFieldBox"]'));
                        const mappedArray = otherArticleArray.map((o) => o.value);
                        for (let article of mappedArray) {
                            makeEditOnOtherNominatedPages(article);
                        }
                    }
                })
                    .then(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (!input.notify)
                            return;
                        new Morebits.status("Paso 3", "publicando un mensaje en la página de discusión del creador...", "info");
                        const creator = yield utils_1.getCreator();
                        return postsMessage(creator);
                    });
                })
                    .then(function () {
                    new Morebits.status("✔️ Finalizado", "actualizando página...", "status");
                    setTimeout(() => { location.reload(); }, 2000);
                })
                    .catch(function (error) {
                    new Morebits.status("❌ Se ha producido un error", "Comprueba las ediciones realizadas", "error");
                    console.log(`Error: ${error}`);
                });
            }
        }
    }
    /**
     * Creates the form window where the user will input the deletion request details.
     */
    function createFormWindow() {
        Window = new Morebits.simpleWindow(620, 530);
        Window.setScriptName('Twinkle Lite');
        Window.setTitle('Consulta de borrado');
        Window.addFooterLink('Política de consultas de borrado', 'Wikipedia:Consultas de borrado mediante argumentación');
        const form = new Morebits.quickForm(submitMessage);
        form.append({
            type: 'textarea',
            name: 'reason',
            label: 'Describe el motivo:',
            tooltip: 'Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente.'
        });
        form.append({
            type: 'submit',
            label: 'Aceptar'
        });
        const categoryField = form.append({
            type: 'field',
            label: 'Categorías:',
        });
        categoryField.append({
            type: 'select',
            name: 'category',
            label: 'Selecciona la categoría de la página:',
            list: getCategoryOptions()
        });
        form.append({
            type: 'checkbox',
            list: [{
                    name: "notify",
                    value: "notify",
                    label: "Notificar al creador de la página",
                    checked: true,
                    tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador advirtiéndole del posible borrado de su artículo"
                }],
            style: "padding-left: 1em;"
        });
        form.append({
            type: 'checkbox',
            list: [{
                    name: "otherArticles",
                    value: "otherArticles",
                    label: "Aplicar la CDB a más artículos",
                    checked: false,
                }],
            style: "padding-left: 1em; padding-bottom:0.5em;",
            event: (e) => {
                // Morebits' buttons value is in English by default and there is no other way to translate the text that doesn't involve DOM manipulation
                // This fuction will find those values and translate them into Spanish
                const checked = e.target.checked;
                const box = document.getElementById('otherArticleFieldBox');
                if (box) {
                    if (checked) {
                        box.style.display = '';
                        const boxAddButton = document.querySelector('input[value="more"]');
                        if (boxAddButton) {
                            boxAddButton.value = "añadir";
                            boxAddButton.style.marginTop = '0.3em';
                            boxAddButton.addEventListener('click', () => {
                                const boxRemoveButton = document.querySelector('input[value="remove"]');
                                if (boxRemoveButton) {
                                    boxRemoveButton.value = "eliminar";
                                    boxRemoveButton.style.marginLeft = '0.3em';
                                }
                            });
                        }
                    }
                    else {
                        box.style.display = 'none';
                    }
                }
            }
        });
        form.append({
            type: 'dyninput',
            label: 'Otros artículos a los que aplicar la consulta:',
            sublabel: 'Artículo:',
            name: 'otherArticleFieldBox',
            style: "display: none;",
            id: 'otherArticleFieldBox',
            tooltip: 'Escribe el nombre del artículo sin ningún tipo de wikicódigo'
        });
        const result = form.render();
        Window.setContent(result);
        Window.display();
    }
    exports_4("createFormWindow", createFormWindow);
    return {
        setters: [
            function (utils_1_1) {
                utils_1 = utils_1_1;
            }
        ],
        execute: function () {
            // This is the dictionary holding the options for the categories deletion requests can be classified as
            deletionRequestCategoryOptions = [
                { code: 'B', name: 'Biografías' },
                { code: 'CAT', name: 'Categorías' },
                { code: 'D', name: 'Deportes y juegos' },
                { code: 'F', name: 'Ficción y artes' },
                { code: 'I', name: 'Inclasificables' },
                { code: 'L', name: 'Lugares y transportes' },
                { code: 'M', name: 'Música y medios de comunicación' },
                { code: 'N', name: 'Consultas sin clasificar todavía' },
                { code: 'O', name: 'Organizaciones, empresas y productos' },
                { code: 'P', name: 'Plantillas y userboxes' },
                { code: 'S', name: 'Sociedad' },
                { code: 'T', name: 'Ciencia y tecnología' },
                { code: 'W', name: 'Web e internet' }
            ];
        }
    };
});
System.register("modules/pageprotection", ["modules/utils"], function (exports_5, context_5) {
    "use strict";
    var utils_2, Window, radioProtectionOptions, listMotiveOptions;
    var __moduleName = context_5 && context_5.id;
    /**
     * Converts the listMotiveOptions to ListElementData type for use in the Morebits select element.
     * @returns The Morebits-adapted list of motive options.
     */
    function adaptMotiveOptions() {
        let dropDownOptions = [];
        for (let motive of listMotiveOptions) {
            let option = { type: 'option', value: motive.name, label: motive.name };
            dropDownOptions.push(option);
        }
        return dropDownOptions;
    }
    /**
     * Constructs a string indicating the protection expiry time.
     * @param protectionExpiry - The expiry date of the protection.
     * @returns The formatted expiry string.
     */
    function protectionTextBuilder(protectionExpiry) {
        switch (protectionExpiry) {
            case undefined:
                return '';
            case 'infinity':
                return '(protegido para siempre)';
            default:
                return `(hasta el ${utils_2.parseTimeStamp(protectionExpiry)})`;
        }
    }
    /**
     * Builds the edit parameters for a noticeboard edit MW API request.
     * @param input - The user input from the form.
     * @returns A function that takes a revision and returns the edit parameters.
     */
    function buildEditOnNoticeboard(input) {
        let title = `== ${input.protection == "desprotección" ? 'Solicitud de desprotección de ' : ''}[[${utils_2.currentPageNameNoUnderscores}]] ==`;
        return (revision) => {
            const editParams = {
                text: revision.content + `\n
    ${title} 
    ;Artículo(s) 
    * {{a|${utils_2.currentPageNameNoUnderscores}}}
    ;Causa 
    ${input.reason ? input.reason : input.motive}
    ; Usuario que lo solicita
    * ~~~~ 
    ;Respuesta
    (a rellenar por un bibliotecario)`,
                summary: `Solicitando ${input.protection} de [[${utils_2.currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                minor: false
            };
            return editParams;
        };
    }
    /**
     * Creates the Morebits' form window for requesting page protection.
     */
    function createFormWindow() {
        Window = new Morebits.simpleWindow(620, 530);
        Window.setScriptName('Twinkle Lite');
        Window.setTitle('Solicitar protección de la página');
        Window.addFooterLink('Política de protección', 'Wikipedia:Política de protección');
        const form = new Morebits.quickForm(submitMessage);
        const radioField = form.append({
            type: 'field',
            label: 'Tipo:',
        });
        radioField.append({
            type: 'radio',
            name: 'protection',
            id: 'protect',
            event: function (e) {
                let nameToModify = document.querySelector("select[name='motive']");
                if (nameToModify) {
                    if (e.target.value !== "protección") {
                        nameToModify.setAttribute('disabled', "");
                    }
                    else {
                        nameToModify.removeAttribute('disabled');
                    }
                }
            },
            list: radioProtectionOptions
        });
        form.append({
            type: 'div',
            name: 'currentProtection',
            label: `Nivel actual de protección: `,
        });
        let textAreaAndReasonField = form.append({
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
        // Fetches the current protection status of the article and updates the form accordingly
        utils_2.getProtectionStatus(utils_2.currentPageName).then(function (protection) {
            var _a;
            // Displays protection level on page
            const showProtection = document.querySelector("div[name='currentProtection'] > span.quickformDescription");
            if (showProtection) {
                showProtection.innerHTML = `Nivel actual de protección:<span style="color:royalblue; font-weight: bold;"> ${protection.level} <span style="font-weight: normal;">${protectionTextBuilder(protection.expiry)}</span>`;
                // Disables "unprotect" option if not applicable
                if (protection.level == 'sin protección') {
                    let unprotectDiv = (_a = document.getElementById('protect')) === null || _a === void 0 ? void 0 : _a.children[1];
                    if (unprotectDiv && unprotectDiv.firstChild instanceof HTMLElement) {
                        unprotectDiv.firstChild.setAttribute('disabled', '');
                    }
                }
            }
        });
    }
    exports_5("createFormWindow", createFormWindow);
    /**
     * Handles the form submission process.
     * @param e - The event object from the form submission.
     */
    function submitMessage(e) {
        const form = e.target;
        const input = Morebits.quickForm.getInputData(form);
        if (input.motive == 'Otro' && !input.reason) {
            alert("Se ha seleccionado «Otro» como motivo pero no se ha establecido un motivo.");
        }
        else {
            const statusWindow = new Morebits.simpleWindow(400, 350);
            utils_2.createStatusWindow(statusWindow);
            new Morebits.status("Paso 1", `solicitando la ${input.protection} de la página...`, "info");
            new mw.Api().edit("Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Protección_de_artículos/Actual", buildEditOnNoticeboard(input))
                .then(function () {
                utils_2.finishMorebitsStatus(Window, statusWindow, 'finished', false);
            })
                .catch(function (error) {
                utils_2.finishMorebitsStatus(Window, statusWindow, 'error');
                console.error(`Error: ${error}`);
            });
        }
    }
    return {
        setters: [
            function (utils_2_1) {
                utils_2 = utils_2_1;
            }
        ],
        execute: function () {
            // Options for the radio button menu
            radioProtectionOptions = [
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
            listMotiveOptions = [
                { name: "Vandalismo" },
                { name: "SPAM" },
                { name: "Información falsa o especulativa" },
                { name: "Guerra de ediciones" },
                { name: "Otro" }
            ];
        }
    };
});
System.register("modules/speedydeletion", ["modules/utils"], function (exports_6, context_6) {
    "use strict";
    var utils_3, Window, deletionTemplateExists, criteriaLists;
    var __moduleName = context_6 && context_6.id;
    /**
     * Retrieves the list of criteria options for the specified type of speedy deletion.
     * @param {SpeedyDeletionCriteriaType} criteriaType - The type of criteria to retrieve.
     * @returns {Array} An array of criteria options.
     */
    function getOptions(criteriaType) {
        let options = [];
        for (let chosenType of criteriaLists[criteriaType]) {
            let option = { value: chosenType.code, label: chosenType.name, checked: chosenType.default, subgroup: chosenType.subgroup };
            options.push(option);
        }
        return options;
    }
    /**
     * Creates and displays the Morebits form window.
     */
    function createFormWindow() {
        return __awaiter(this, void 0, void 0, function* () {
            Window = new Morebits.simpleWindow(620, 530);
            Window.setScriptName('Twinkle Lite');
            Window.setTitle('Solicitar borrado rápido');
            Window.addFooterLink('Criterios para el borrado rápido', 'Wikipedia:Criterios para el borrado rápido');
            const form = new Morebits.quickForm(submitMessage);
            form.append({
                type: 'checkbox',
                list: [{
                        name: "notify",
                        value: "notify",
                        label: "Notificar al creador de la página",
                        checked: true,
                        tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador advirtiéndole del posible borrado de su artículo"
                    }],
                style: "padding-left: 1em; padding-top:0.5em;"
            });
            let gField = form.append({
                type: 'field',
                label: 'Criterios generales:',
            });
            gField.append({
                type: 'checkbox',
                name: 'general',
                list: getOptions("general")
            });
            if (utils_3.currentNamespace == 0 || utils_3.currentNamespace == 104 && !mw.config.get('wgIsRedirect')) {
                const aField = form.append({
                    type: 'field',
                    label: 'Criterios para artículos y anexos:',
                });
                aField.append({
                    type: 'checkbox',
                    name: 'article',
                    list: getOptions("articles")
                });
            }
            if (mw.config.get('wgIsRedirect')) {
                const rField = form.append({
                    type: 'field',
                    label: 'Criterios para páginas de redirección:',
                });
                rField.append({
                    type: 'checkbox',
                    name: 'redirect',
                    list: getOptions("redirects")
                });
            }
            if (utils_3.currentNamespace == 14) {
                const cField = form.append({
                    type: 'field',
                    label: 'Criterios para categorías:',
                });
                cField.append({
                    type: 'checkbox',
                    name: 'categories',
                    list: getOptions("categories")
                });
            }
            if (utils_3.currentNamespace == 2) {
                const uField = form.append({
                    type: 'field',
                    label: 'Criterios para páginas de usuario:',
                });
                uField.append({
                    type: 'checkbox',
                    name: 'userpages',
                    list: getOptions("userpages")
                });
            }
            if (utils_3.currentNamespace == 10) {
                const tField = form.append({
                    type: 'field',
                    label: 'Criterios para plantillas:',
                });
                tField.append({
                    type: 'checkbox',
                    name: 'templates',
                    list: getOptions("templates")
                });
            }
            form.append({
                type: 'checkbox',
                name: 'other',
                list: getOptions("other"),
                style: "padding-left: 1em; padding-bottom: 0.5em"
            });
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
            deletionTemplateExists = yield checkExistingDeletionTemplate();
        });
    }
    exports_6("createFormWindow", createFormWindow);
    /**
     * Submits the speedy deletion request and handles user notification if necessary.
     * @param {Event} e - The form submission event.
     */
    function submitMessage(e) {
        let form = e.target;
        let input = Morebits.quickForm.getInputData(form);
        //This little condition removes the A1 criterion if any of its subcriteria are included
        if (input === null || input === void 0 ? void 0 : input.subA) {
            if (Array.isArray(input.subA) && input.subA.length > 0) {
                if (Array.isArray(input.article)) {
                    input.article.shift();
                }
            }
        }
        // This will ask the user to confirm the action if there's a deletion template
        // in the article already, which is info we've previously stored as a global variable 
        if (deletionTemplateExists) {
            if (!confirm('Parece que ya existe una plantilla de borrado en el artículo, ¿deseas colocar la plantilla igualmente?')) {
                return;
            }
        }
        const statusWindow = new Morebits.simpleWindow(400, 350);
        utils_3.createStatusWindow(statusWindow);
        new Morebits.status("Paso 1", `generando plantilla de borrado...`, "info");
        new mw.Api().edit(utils_3.currentPageName, editBuilder(input))
            .then(function () {
            return utils_3.getCreator().then(postsMessage(input));
        })
            .then(function () {
            utils_3.finishMorebitsStatus(Window, statusWindow, 'finished', true);
        })
            .catch(function (error) {
            utils_3.finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(`Error: ${error}`);
        });
    }
    /**
     * Checks if a deletion template already exists on the current page.
     * @returns A promise that resolves to true if a deletion template exists, otherwise false.
     */
    function checkExistingDeletionTemplate() {
        return __awaiter(this, void 0, void 0, function* () {
            const regex = /{{(?:sust:)?(?:destruir|d|db-ul|db-user|speedy|borrar|db|delete|eliminar|aviso\sborrar)\|.+?}}/i;
            const content = yield utils_3.getContent(utils_3.currentPageName);
            if (content.match(regex)) {
                return true;
            }
            return false;
        });
    }
    /**
     * Builds the edit request payload for adding a speedy deletion template to a page.
     * @param {QuickFormInputObject} data - The input data from the form.
     * @returns A function that takes a revision and returns an edit request payload.
     */
    function editBuilder(data) {
        return (revision) => {
            return {
                text: `{{destruir|${allCriteria(data)}}} \n` + revision.content,
                summary: `Añadiendo plantilla de borrado mediante [[WP:Twinkle Lite|Twinkle Lite]]${(data === null || data === void 0 ? void 0 : data.originalArticleName) ? `. Artículo existente de mayor calidad: [[${data.originalArticleName}]]` : ''}`,
                minor: false
            };
        };
    }
    /**
     * Concatenates all selected criteria into a single string for use in the deletion template.
     * @param {QuickFormInputObject} data - The input data from the form.
     * @returns A string of concatenated criteria.
     */
    function allCriteria(data) {
        var _a;
        let fields = [];
        for (let criteriaType in data) {
            if (criteriaType !== "other" && Array.isArray(data[criteriaType])) {
                fields.push(...data[criteriaType]);
            }
        }
        const reasonString = (_a = data === null || data === void 0 ? void 0 : data.otherreason) !== null && _a !== void 0 ? _a : '';
        if (reasonString != '') {
            fields.push(reasonString);
        }
        return fields.join('|');
    }
    /**
     * Posts a notification message to the creator's talk page if the notify option is selected.
     * @param input - The input data from the form.
     * @returns A promise that resolves when the message is posted.
     */
    function postsMessage(input) {
        if (!input.notify)
            return;
        return (creator) => {
            if (creator == utils_3.currentUser) {
                return;
            }
            else {
                new Morebits.status("Paso 2", "publicando un mensaje en la página de discusión del creador...", "info");
                return utils_3.isPageMissing(`Usuario_discusión:${creator}`)
                    .then(function (mustCreateNewTalkPage) {
                    if (mustCreateNewTalkPage) {
                        return new mw.Api().create(`Usuario_discusión:${creator}`, { summary: `Aviso al usuario del posible borrado de [[${utils_3.currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` }, `{{subst:Aviso destruir|${utils_3.currentPageNameNoUnderscores}|${allCriteria(input)}}} ~~~~`);
                    }
                    else {
                        return new mw.Api().edit(`Usuario_discusión:${creator}`, function (revision) {
                            return {
                                text: revision.content + `\n{{subst:Aviso destruir|${utils_3.currentPageNameNoUnderscores}|${allCriteria(input)}}} ~~~~`,
                                summary: `Aviso al usuario del posible borrado de [[${utils_3.currentPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                                minor: false
                            };
                        });
                    }
                });
            }
        };
    }
    return {
        setters: [
            function (utils_3_1) {
                utils_3 = utils_3_1;
            }
        ],
        execute: function () {
            criteriaLists = {
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
            };
        }
    };
});
System.register("modules/reports", ["modules/utils"], function (exports_7, context_7) {
    "use strict";
    var utils_4, reportedUser, Window, reportMotiveDict;
    var __moduleName = context_7 && context_7.id;
    function getMotiveOptions() {
        let dropdownOptions = [];
        for (let motive in reportMotiveDict) {
            let option = {
                value: motive,
                label: motive,
            };
            dropdownOptions.push(option);
        }
        return dropdownOptions;
    }
    function changeButtonNames() {
        const moreBox = document.querySelector('input[value="more"]');
        if (moreBox) {
            moreBox.value = "añadir";
            moreBox.style.marginTop = '0.3em'; // To separate it slightly from the rest of the elements
            moreBox.addEventListener("click", () => {
                const removeBox = document.querySelector('input[value="remove"]');
                removeBox.value = "eliminar";
                removeBox.style.marginLeft = '0.3em'; // Idem as four code lines above
            });
        }
    }
    function adjustMotiveOptions(selectedOption) {
        const reasonTextAreaNode = document.querySelector("label[for='reasontextareanode']");
        const articleFieldNode = document.getElementById('articlefieldnode');
        const otherReasonNode = document.getElementById('otherreasonnode');
        if (reasonTextAreaNode && articleFieldNode && otherReasonNode) {
            reasonTextAreaNode.textContent = `Desarrolla la razón${reportMotiveDict[selectedOption].optionalReason ? ' (opcional)' : ''}:`;
            articleFieldNode.setAttribute('style', 'display:none');
            otherReasonNode.setAttribute('style', 'display:none');
            switch (selectedOption) {
                case 'Guerra de ediciones':
                    articleFieldNode.removeAttribute('style');
                    changeButtonNames();
                    break;
                case 'Violación de etiqueta':
                    reasonTextAreaNode.textContent = 'Ediciones que constituyen una violación de etiqueta:';
                    break;
                case 'Otro':
                    otherReasonNode.removeAttribute('style');
                    break;
            }
        }
    }
    function setReportedUserName() {
        const usernameField = document.querySelector('input[name="usernamefield"]');
        usernameField.value = reportedUser;
    }
    function listWords(wordArray, templateLetter) {
        let bulletedWords = '';
        for (let word of wordArray) {
            bulletedWords += `* {{${templateLetter}|${word}}} \n`;
        }
        return bulletedWords;
    }
    function VECReportBuilder(usernames, input) {
        let finalText = '';
        for (let user of usernames) {
            const templateWord = mw.util.isIPAddress(user, true) ? 'VándaloIP' : 'Vándalo';
            finalText += `=== ${user} ===` + '\n' + '\n' +
                `* Posible vándalo: {{${templateWord}|${user}}}` + '\n' +
                `* Motivo del reporte: ${input.reason}` + '\n' +
                '* Usuario que reporta: ~~~~' + '\n' +
                '* Acción administrativa: (a rellenar por un bibliotecario)' + '\n';
        }
        return finalText;
    }
    // Builds a regex to be used in the createHash function using the title of the report
    function buildRegex(reportTitle) {
        const regExpString = String.raw `==\s*${reportTitle}\s*==`;
        return new RegExp(regExpString, 'g');
    }
    // Creates the hash to be used in the link to the appropriate board on the notified user's talk page
    // Does so by examining the content of the board and counting the amount of similar titles
    // It then returns the appropriate hash number corresponding to the id of the report's title
    function createHash(board, reportTitle) {
        return __awaiter(this, void 0, void 0, function* () {
            const boardContent = yield utils_4.getContent(board);
            const regex = buildRegex(reportTitle);
            const otherOccurrences = boardContent.match(regex);
            if (otherOccurrences && otherOccurrences.length > 1) {
                return `${reportTitle}_${otherOccurrences.length}`;
            }
            return reportTitle;
        });
    }
    function buildEditOnNoticeboard(input, usernames, articles) {
        const motive = input.motive;
        if (motive == "Vandalismo en curso") {
            return (revision) => {
                const summaryUser = usernames.length > 1 ? 'usuarios' : `[[Especial:Contribuciones/${usernames[0]}|usuario]]`;
                return {
                    text: revision.content + '\n' + '\n' + VECReportBuilder(usernames, input),
                    summary: `Creando denuncia de ${summaryUser} mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                    minor: false
                };
            };
        }
        else {
            let title = motive == "Otro" ? input.otherreason : motive;
            let bulletedUserList = listWords(usernames, 'u');
            let bulletedArticleList = listWords(articles, 'a');
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
                };
            };
        }
    }
    function postsMessage(input) {
        if (!input.notify)
            return;
        new Morebits.status("Paso 3", `avisando al usuario reportado...`, "info");
        return utils_4.isPageMissing(`Usuario_discusión:${input.usernamefield}`)
            .then(function (mustCreateNewTalkPage) {
            return __awaiter(this, void 0, void 0, function* () {
                const title = (input.motive == "Otro" ? input.otherreason : input.motive);
                const motive = input.motive;
                const hash = yield createHash(reportMotiveDict[motive].link, title);
                const notificationString = `Hola. Te informo de que he creado una denuncia —por la razón mencionada en el título— que te concierne. Puedes consultarla en el tablón correspondiente a través de '''[[${reportMotiveDict[motive].link}#${motive == "Vandalismo en curso" ? reportedUser : hash}|este enlace]]'''. Un [[WP:B|bibliotecario]] se encargará de analizar el caso y emitirá una resolución al respecto próximamente. Un saludo. ~~~~`;
                if (mustCreateNewTalkPage) {
                    return new mw.Api().create(`Usuario_discusión:${input.usernamefield}`, { summary: `Aviso al usuario de su denuncia por [[${reportMotiveDict[motive].link}|${title.toLowerCase()}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` }, `\n== ${title} ==\n` +
                        notificationString);
                }
                else {
                    return new mw.Api().edit(`Usuario_discusión:${input.usernamefield}`, function (revision) {
                        return {
                            text: revision.content + `\n== ${title} ==\n` + notificationString,
                            summary: `Aviso al usuario de su denuncia por [[${reportMotiveDict[motive].link}|${title.toLowerCase()}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                            minor: false
                        };
                    });
                }
            });
        });
    }
    function submitMessage(e) {
        const form = e.target;
        const input = Morebits.quickForm.getInputData(form);
        const chosenMotive = input.motive;
        if (!input.reason && !reportMotiveDict[chosenMotive].optionalReason) {
            alert("No se ha establecido un motivo.");
        }
        else if (input.motive == 'Otro' && input.otherreason == '') {
            alert("No se ha establecido un título para la denuncia");
        }
        else if (input.usernamefield == '') {
            alert("No se ha establecido un usuario");
        }
        else {
            const statusWindow = new Morebits.simpleWindow(400, 350);
            utils_4.createStatusWindow(statusWindow);
            new Morebits.status("Paso 1", `obteniendo datos del formulario...`, "info");
            const usernameElements = Array.from(document.querySelectorAll('input[name=usernamefield]'));
            const usernames = usernameElements.map((o) => o.value);
            const articleElements = Array.from(document.querySelectorAll('input[name=articlefieldbox]'));
            const articles = articleElements.map((o) => o.value);
            new Morebits.status("Paso 2", "creando denuncia en el tablón...", "info");
            new mw.Api().edit(reportMotiveDict[chosenMotive].link, buildEditOnNoticeboard(input, usernames, articles))
                .then(() => {
                return postsMessage(input);
            })
                .then(() => {
                if (utils_4.currentPageName.includes(`_discusión:${reportedUser}`)) {
                    utils_4.finishMorebitsStatus(Window, statusWindow, 'finished', true);
                }
                else {
                    utils_4.finishMorebitsStatus(Window, statusWindow, 'finished', false);
                }
            })
                .catch((error) => {
                utils_4.finishMorebitsStatus(Window, statusWindow, 'error');
                console.error(`Error: ${error}`);
            });
        }
    }
    function createFormWindow(reportedUserFromDOM) {
        // Something about the addPortletLink feature doesn't work well so this condition is unfortunately needed
        if (typeof reportedUserFromDOM == 'string') {
            reportedUser = reportedUserFromDOM;
        }
        else {
            reportedUser = utils_4.relevantUserName;
        }
        Window = new Morebits.simpleWindow(620, 530);
        Window.setScriptName('Twinkle Lite');
        Window.setTitle('Denunciar usuario');
        Window.addFooterLink('Tablón de anuncios de los bibliotecarios', 'Wikipedia:Tablón de anuncios de los bibliotecarios');
        const form = new Morebits.quickForm(submitMessage);
        const reportTypeField = form.append({
            type: 'field',
            label: 'Opciones:',
        });
        reportTypeField.append({
            type: 'select',
            label: 'Selecciona el motivo:',
            name: 'motive',
            list: getMotiveOptions(),
            event: function (e) {
                var _a;
                if ((_a = e === null || e === void 0 ? void 0 : e.target) === null || _a === void 0 ? void 0 : _a.value) {
                    const selectedOption = e.target.value;
                    adjustMotiveOptions(selectedOption);
                }
            }
        });
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
        });
        const reportInfoField = form.append({
            type: 'field',
            label: 'Información:'
        });
        reportInfoField.append({
            type: 'dyninput',
            label: 'Usuarios denunciados:',
            sublabel: 'Usuario:',
            name: 'usernamefield',
            value: "",
            tooltip: 'Escribe el nombre del usuario denunciado sin ningún tipo de wikicódigo'
        });
        reportInfoField.append({
            type: 'dyninput',
            label: 'Artículos involucrados:',
            sublabel: 'Artículo:',
            name: 'articlefieldbox',
            style: "display: none;",
            id: 'articlefieldnode',
            tooltip: 'Escribe el nombre del artículo sin ningún tipo de wikicódigo'
        });
        reportInfoField.append({
            type: "input",
            name: "otherreason",
            id: "otherreasonnode",
            style: "display: none;",
            placeholder: "Título de la denuncia",
        });
        reportInfoField.append({
            type: 'textarea',
            label: 'Desarrolla la razón:',
            name: 'reason',
            tooltip: 'Incluye diffs si es necesario. Puedes usar wikicódigo. La firma se añadirá de forma automática.',
            id: 'reasontextareanode'
        });
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
    exports_7("createFormWindow", createFormWindow);
    return {
        setters: [
            function (utils_4_1) {
                utils_4 = utils_4_1;
            }
        ],
        execute: function () {
            reportMotiveDict = {
                "CPP": {
                    "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
                    "usersSubtitle": 'Lista de usuarios',
                    "optionalReason": false
                },
                "Cuenta creada para vandalizar": {
                    "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
                    "usersSubtitle": 'Lista de usuarios',
                    "optionalReason": true
                },
                "Evasión de bloqueo": {
                    "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
                    "usersSubtitle": 'Lista de usuarios',
                    "optionalReason": false
                },
                "Guerra de ediciones": {
                    "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/3RR/Actual",
                    "usersSubtitle": 'Usuarios implicados',
                    "optionalReason": false
                },
                "Nombre inapropiado": {
                    "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
                    "usersSubtitle": 'Lista de usuarios',
                    "optionalReason": true
                },
                "Violación de etiqueta": {
                    "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Violaciones_de_etiqueta/Actual",
                    "usersSubtitle": 'Usuarios implicados',
                    "optionalReason": false
                },
                "Vandalismo en curso": {
                    "link": "Wikipedia:Vandalismo_en_curso",
                    "optionalReason": false
                },
                "Vandalismo persistente": {
                    "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Nombres_inapropiados_y_vandalismo_persistente/Actual",
                    "usersSubtitle": 'Lista de usuarios',
                    "optionalReason": true
                },
                "Otro": {
                    "link": "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Miscelánea/Actual",
                    "usersSubtitle": 'Usuarios implicados',
                    "optionalReason": false
                }
            };
        }
    };
});
// ** Tags module **
// Allows users to add a tag in articles. The tag can be selected as part of a series of options of a checkbox list
System.register("modules/tags", ["modules/utils"], function (exports_8, context_8) {
    "use strict";
    var utils_5, Window, relevantPageName, relevantPageNameNoUnderscores, tagTemplateDict;
    var __moduleName = context_8 && context_8.id;
    /**
     * Builds the hyperlink for each tag template that links to its Wikipedia page.
     * @param link - The name of the tag template.
     * @returns A string containing the HTML anchor tag for the link.
     */
    function linkBuilder(link) {
        let fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`;
        return `<a href="${fullLink}" target="_blank">(+)</a>`;
    }
    /**
     * Builds the list of template options to be displayed in the checkbox list.
     * @returns An array of objects representing each template option.
     */
    function listBuilder() {
        var _a, _b;
        let finalList = [];
        for (let item in tagTemplateDict) {
            let template = {
                name: item,
                value: item,
                label: `{{${item}}} · ${tagTemplateDict[item].description} ${linkBuilder(item)}`,
                subgroup: (_b = (_a = tagTemplateDict[item]) === null || _a === void 0 ? void 0 : _a.subgroup) !== null && _b !== void 0 ? _b : ''
            };
            finalList.push(template);
        }
        return finalList;
    }
    /**
     * Groups multiple templates into a single "problemas artículo" template if possible.
     * @param templateList - Array of selected template names.
     * @returns An array with the grouped templates if applicable, or the original list.
     */
    function groupTemplates(templateList) {
        var _a;
        if (templateList.length > 1) { //Avoids grouping only one template
            let newList = [];
            let groupedTemplates = 'problemas artículo'; // Name of the template that can be used to group up other templates
            let groupedTemplatesNumber = 0;
            for (let template of templateList) {
                // For each template on the list, it attaches it to the problemas artículo template
                // or it pushed it to the list of ungroupable templates
                if ((_a = tagTemplateDict[template]) === null || _a === void 0 ? void 0 : _a.groupable) {
                    groupedTemplatesNumber++;
                    groupedTemplates += `|${template}`;
                }
                else {
                    newList.push(template);
                }
            }
            if (groupedTemplatesNumber > 1) {
                // At the end, the grouped templates are added to the normal list
                // as in reality it acts as one more template. This only happens
                // if more than one groupable template is found, otherwise there's no
                // point in using the problemas artículo template
                newList.push(groupedTemplates);
                return newList;
            }
            else {
                return templateList;
            }
        }
        return templateList;
    }
    /**
     * Creates a grouped warning template string for the talk page if grouped templates are found.
     * @param templateList - Array of selected template names.
     * @returns The grouped warning template string, or false if no grouped template exists.
     */
    function createGroupedWarning(templateList /* TODO */) {
        const groupedTemplate = templateList.find(element => element.includes("problemas artículo|"));
        if (groupedTemplate) {
            const groupedWwarning = groupedTemplate.replace("problemas artículo", `aviso PA|${relevantPageNameNoUnderscores}`);
            return groupedWwarning;
        }
        return false;
    }
    /**
     * Builds the final template string that will be added to the page based on the selected templates and parameters.
     * @param templateObj - Object containing selected templates and their parameters.
     * @returns The final template string to be added to the page.
     */
    function templateBuilder(templateObj) {
        var _a, _b, _c;
        let finalString = '';
        for (const element in templateObj) {
            let needsSust = ((_a = tagTemplateDict[element]) === null || _a === void 0 ? void 0 : _a.sust) ? true : false; // Check whether the template uses sust or not (TP templates don't)
            if (element.includes('problemas artículo|')) {
                needsSust = true;
            }
            const parameter = ((_b = templateObj[element]) === null || _b === void 0 ? void 0 : _b.param) ? `|${templateObj[element].param}=` : '';
            const parameterValue = ((_c = templateObj[element]) === null || _c === void 0 ? void 0 : _c.paramValue) || '';
            finalString += `{{${needsSust ? 'sust:' : ''}${element}${parameter}${parameterValue}}}\n`;
        }
        return finalString;
    }
    /**
     * Performs an edit on the specified Wikipedia page by adding the constructed templates to it.
     * @param templates - Object containing selected templates and their parameters.
     * @param input - Object containing form input values.
     * @param pagename - Name of the page to edit.
     * @returns A promise that resolves when the edit is complete.
     */
    function makeEdit(templates, input, pagename) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new mw.Api().edit(pagename, (revision) => {
                return {
                    text: templateBuilder(templates) + revision.content,
                    summary: `Añadiendo plantilla mediante [[WP:TL|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}`,
                    minor: false
                };
            });
        });
    }
    /**
     * Assigns parameters to the selected templates based on user input from Morebits form.
     * @param paramList - List of templates that may require parameters.
     * @param input - Object containing form input values.
     * @returns An object mapping templates to their assigned parameters.
     */
    function paramAssigner(paramList, input) {
        const templatesWithParams = {};
        for (const element of paramList) {
            for (const [key, value] of Object.entries(input)) {
                if (key.includes('_param') && key.includes(element)) {
                    templatesWithParams[element] = {
                        "param": key.split('-').pop(),
                        "paramValue": value
                    };
                }
            }
        }
        return templatesWithParams;
    }
    /**
     * Makes all necessary edits to both the main page and its talk page based on the selected templates.
     * @param templateList - List of selected templates for the main page.
     * @param templateTalkPageList - List of selected templates for the talk page.
     * @param input - Object containing form input values.
     * @returns A promise that resolves when all edits are complete.
     */
    function makeAllEdits(templateList, templateTalkPageList, input) {
        return __awaiter(this, void 0, void 0, function* () {
            if (templateList.length > 0) {
                const templateObj = paramAssigner(templateList, input);
                yield makeEdit(templateObj, input, relevantPageName);
            }
            if (templateTalkPageList.length > 0) {
                // First step is to fix the talk page when in anexos' namespaces
                const talkPage = utils_5.currentNamespace == 104 || utils_5.currentNamespace == 105 ? `Anexo_discusión:${relevantPageName.substring(6)}` : `Discusión:${relevantPageName}`;
                const templateTalkPageObj = paramAssigner(templateTalkPageList, input);
                return utils_5.isPageMissing(talkPage)
                    .then(function (mustCreateNewTalkPage) {
                    if (mustCreateNewTalkPage) {
                        return new mw.Api().create(talkPage, { summary: `Añadiendo plantilla mediante [[WP:TL|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}` }, templateBuilder(templateTalkPageObj));
                    }
                    else {
                        return makeEdit(templateTalkPageObj, input, talkPage);
                    }
                });
            }
        });
    }
    /**
     * Creates the Morebits form window where users can select and configure tags to be added to the page.
     */
    function createFormWindow() {
        Window = new Morebits.simpleWindow(620, 530);
        Window.setScriptName('Twinkle Lite');
        Window.setTitle('Añadir plantilla');
        Window.addFooterLink('Portal de mantenimiento', 'Portal:Mantenimiento');
        const form = new Morebits.quickForm(submitMessage);
        form.append({
            type: 'input',
            value: '',
            name: 'search',
            label: 'Búsqueda:',
            id: 'search',
            size: '30',
            event: function quickFilter() {
                const searchInput = document.getElementById("search");
                const allCheckboxDivs = document.querySelectorAll("#checkboxContainer > div");
                if (this.value) {
                    // Flushes the list before calling the search query function, then does it as a callback so that it happens in the right order
                    function flushList(callback) {
                        for (let i = 0; i < allCheckboxDivs.length; i++) {
                            const div = allCheckboxDivs[i];
                            div.style.display = 'none';
                        }
                        callback();
                    }
                    // Finds matches for the search query within the checkbox list
                    function updateList(searchString) {
                        for (let i = 0; i < allCheckboxDivs.length; i++) {
                            let checkboxText = allCheckboxDivs[i].childNodes[1].textContent;
                            if (checkboxText.includes(searchString.toLowerCase()) || checkboxText.includes(searchString.toUpperCase())) {
                                const div = allCheckboxDivs[i];
                                div.style.display = '';
                            }
                        }
                    }
                    flushList(() => updateList(searchInput.value));
                }
                // Retrieves the full list if nothing is on the search input box
                if (!this.value) {
                    for (let i = 0; i < allCheckboxDivs.length; i++) {
                        const div = allCheckboxDivs[i];
                        div.style.display = '';
                    }
                }
            }
        });
        const optionBox = form.append({
            type: 'div',
            id: 'tagWorkArea',
            className: 'morebits-scrollbox',
            style: 'max-height: 28em; min-height: 0.5em'
        });
        optionBox.append({
            type: 'checkbox',
            id: 'checkboxContainer',
            list: listBuilder(),
            label: 'checkOption'
        });
        const optionsField = form.append({
            type: 'field',
            label: 'Opciones:'
        });
        optionsField.append({
            type: 'checkbox',
            list: [{
                    name: "notify",
                    value: "notify",
                    label: "Notificar al creador de la página si es posible",
                    checked: false,
                    tooltip: "Marca esta casilla para que Twinkle Lite deje un mensaje automático en la página de discusión del creador del artículo advertiéndole de la colocación de la plantilla"
                }],
        });
        optionsField.append({
            type: 'input',
            name: 'reason',
            label: 'Razón:',
            tooltip: '(Opcional) Escribe aquí el resumen de edición explicando la razón por la que se ha añadido la plantilla',
            style: 'width: 80%; margin-top: 0.5em;'
        });
        form.append({
            type: 'submit',
            label: 'Aceptar'
        });
        const result = form.render();
        Window.setContent(result);
        Window.display();
    }
    exports_8("createFormWindow", createFormWindow);
    /**
     * Extracts the selected templates from the form input and categorizes them into article templates and talk page templates.
     * @param input - The input data from the QuickForm.
     * @returns An object containing two arrays: one for the article templates (`templatelist`) and another for the talk page templates (`templateTalkPageList`).
     */
    function extractParamsFromInput(input) {
        var _a;
        let temporaryTemplateList = [];
        let temporaryTemplateTalkPageList = [];
        for (const [key, value] of Object.entries(input)) {
            if (value && !key.includes('_param') && key != 'notify' && key != 'reason' && key != 'search') {
                if ((_a = tagTemplateDict[key]) === null || _a === void 0 ? void 0 : _a.talkPage) {
                    temporaryTemplateTalkPageList.push(key);
                }
                else {
                    temporaryTemplateList.push(key);
                }
            }
        }
        return {
            templatelist: temporaryTemplateList,
            templateTalkPageList: temporaryTemplateTalkPageList
        };
    }
    /**
     * Joins all warning templates into a single string to be added to the user's talk page.
     * @param list - A list of templates to be joined.
     * @param groupedWarning - A grouped warning template name, if applicable.
     * @returns A string that contains all the warning templates formatted for the user's talk page.
     */
    function joinAllWarnings(list, groupedWarning) {
        var _a;
        let finalString = groupedWarning ? `{{sust:${groupedWarning}}} ~~~~\n` : '';
        for (let template of list) {
            if ((_a = tagTemplateDict[template]) === null || _a === void 0 ? void 0 : _a.warning) {
                finalString += `{{sust:${tagTemplateDict[template].warning}|${relevantPageNameNoUnderscores}}} ~~~~\n`;
            }
        }
        return finalString;
    }
    /**
     * Posts a warning message to the creator's talk page, if applicable.
     * @param templateList - The list of templates used.
     * @param groupedWarning - The grouped warning template name, if applicable.
     * @param creator - The username of the page creator.
     * @returns A promise that resolves when the warning message has been posted to the creator's talk page.
     */
    function postsMessage(templateList, groupedWarning, creator) {
        return __awaiter(this, void 0, void 0, function* () {
            if (creator && creator == utils_5.currentUser) {
                return;
            }
            else {
                new Morebits.status("Paso 2", "publicando un mensaje de aviso en la página de discusión del creador (si es posible)...", "info");
                const mustCreateNewTalkPage = yield utils_5.isPageMissing(`Usuario_discusión:${creator}`);
                const warningTemplates = joinAllWarnings(templateList, groupedWarning);
                if (!warningTemplates) {
                    return;
                }
                if (mustCreateNewTalkPage) {
                    return new mw.Api().create(`Usuario_discusión:${creator}`, { summary: `Aviso al usuario de la colocación de una plantilla en [[${relevantPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]` }, `${warningTemplates}`);
                }
                else {
                    return new mw.Api().edit(`Usuario_discusión:${creator}`, function (revision) {
                        return {
                            text: revision.content + `\n${warningTemplates}`,
                            summary: `Aviso al usuario de la colocación de una plantilla en [[${relevantPageNameNoUnderscores}]] mediante [[WP:Twinkle Lite|Twinkle Lite]]`,
                            minor: false
                        };
                    });
                }
            }
        });
    }
    /**
     * Handles the submission of the form, triggering the process of generating and posting templates.
     * @param e - The event object from the form submission.
     */
    function submitMessage(e) {
        const form = e.target;
        const input = Morebits.quickForm.getInputData(form);
        let templates = extractParamsFromInput(input);
        if (templates.templatelist.length < 1 && templates.templateTalkPageList.length < 1) {
            return alert('No se ha seleccionado ninguna plantilla');
        }
        templates.templatelist = groupTemplates(templates.templatelist);
        const groupedTemplateWarning = createGroupedWarning(templates.templatelist);
        const statusWindow = new Morebits.simpleWindow(400, 350);
        utils_5.createStatusWindow(statusWindow);
        new Morebits.status("Paso 1", `generando plantilla(s)...`, "info");
        makeAllEdits(templates.templatelist, templates.templateTalkPageList, input)
            .then(() => __awaiter(this, void 0, void 0, function* () {
            if (!input.notify)
                return;
            const pageCreator = yield utils_5.getCreator();
            postsMessage(templates.templatelist, groupedTemplateWarning, pageCreator);
        }))
            .then(() => {
            utils_5.finishMorebitsStatus(Window, statusWindow, "finished", true);
        })
            .catch((error) => {
            utils_5.finishMorebitsStatus(Window, statusWindow, "error");
            console.error(`Error: ${error}`);
        });
    }
    return {
        setters: [
            function (utils_5_1) {
                utils_5 = utils_5_1;
            }
        ],
        execute: function () {
            // Dictionary that stores the templates, the description, as well as the parameter and the name of the warning template if any of them is applicable
            // Template parameters are set in the subgroup, specifically in the 'name' key, their syntax is as follows:
            // `_param-parent template name-parameter identifier`
            // If the parameter doesn't have an identifier, then just type a «1»
            relevantPageName = utils_5.stripTalkPagePrefix(utils_5.currentPageName);
            relevantPageNameNoUnderscores = relevantPageName.replace(/_/g, ' ');
            // Dictionary of tag templates containing descriptions, warnings, and parameters.
            // Templates are categorized with optional parameters and additional properties like 'groupable' and 'sust'.
            tagTemplateDict = {
                "artículo bueno": {
                    description: "para etiquetar artículos que han obtenido la calificación de AB",
                },
                "autotrad": {
                    warning: "aviso autotrad",
                    description: "uso de automatismo en traducciones de nula calidad",
                    sust: true
                },
                "bulo": {
                    warning: "aviso destruir|2=bulo",
                    description: "páginas falsas que constituyen bulos o hoax"
                },
                "categorizar": {
                    warning: "aviso categorizar",
                    description: "artículos sin categorías"
                },
                "CDI": {
                    warning: "aviso conflicto de interés",
                    description: "escrita bajo conflicto de interés"
                },
                "contextualizar": {
                    warning: "aviso contextualizar",
                    description: "el tema o ámbito no está claramente redactado. Plantilla de 30 días.",
                    sust: true
                },
                "complejo": {
                    description: "textos difíciles de entender",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-complejo-1',
                            label: 'Explica por qué es complejo',
                            tooltip: 'Desarrolla brevemente por qué consideras que el artículo posee una elevada complejidad'
                        }
                    ],
                    groupable: true,
                    sust: true
                },
                "copyedit": {
                    warning: "aviso copyedit",
                    description: "necesita una revisión de ortografía y gramática",
                    groupable: true
                },
                "curiosidades": {
                    description: "textos con sección de curiosidades"
                },
                "desactualizado": {
                    description: "página con información obsoleta",
                    groupable: true,
                    sust: true
                },
                "en desarrollo": {
                    description: "páginas en construcción o siendo editadas activamente",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-en desarrollo-1',
                            label: 'Nombre del editor',
                            tooltip: 'Escribe el nombre del usuario que está desarrollando el artículo, no utilices ningún tipo de Wikicódigo'
                        }
                    ],
                    sust: true
                },
                "evento actual": {
                    description: "artículos de actualidad cuya información es susceptible a cambiar"
                },
                "excesivamente detallado": {
                    description: "demasiada información sobre temas triviales",
                    sust: true
                },
                "experto": {
                    description: "artículos muy técnicos con deficiencias de contenido solo corregibles por un experto",
                    groupable: true,
                },
                "ficticio": {
                    description: "sin enfoque desde un punto de vista real",
                    groupable: true,
                    sust: true
                },
                "formato de referencias": {
                    warning: "aviso formato de referencias",
                    description: "referencias incorrectas o mal construidas",
                    groupable: true,
                    sust: true
                },
                "fuente primaria": {
                    warning: "aviso fuente primaria",
                    description: "información no verificable. Plantilla de 30 días.",
                    sust: true
                },
                "fuentes no fiables": {
                    description: "referencias que no siguen la política de fuentes fiables",
                    warning: "aviso fuentes no fiables",
                    sust: true
                },
                "fusionar": {
                    description: "sugerir una fusión",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-fusionar-1',
                            label: 'Artículo objetivo',
                            tooltip: 'Escribe el nombre del artículo con el que quieres fusionar esta página. No uses Wikicódigo.'
                        }
                    ],
                    sust: true
                },
                "globalizar": {
                    warning: "aviso globalizar",
                    description: "existe sesgo territorial",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-globalizar-1',
                            label: 'Cultura o territorio del sesgo'
                        }
                    ],
                    groupable: true,
                    sust: true
                },
                "infraesbozo": {
                    warning: "aviso infraesbozo",
                    description: "contenido insuficiente como para constituir un esbozo de artículo o anexo válido. Plantilla de 30 días",
                    sust: true
                },
                "largo": {
                    description: "artículos excesivamente largos que deberían subdividirse en varios",
                    groupable: true
                },
                "mal traducido": {
                    warning: "aviso mal traducido",
                    description: "escasa calidad de una traducción de otro idioma",
                    groupable: true
                },
                "mejorar redacción": {
                    description: "redacciones que no siguen el manual de estilo",
                    groupable: true,
                    sust: true
                },
                "no es un foro": {
                    description: "páginas de discusión que han recibido grandes cantidades de conversación irrelevante",
                    talkPage: true
                },
                "no neutralidad": {
                    warning: "aviso no neutralidad",
                    description: "artículos sesgados o claramente decantados en una dirección",
                    subgroup: [
                        {
                            type: 'input',
                            name: `_param-no neutralidad-motivo`,
                            label: 'Razón del sesgo',
                            tooltip: 'Describe brevemente la razón del sesgo. Es importante, también, desarrollarla más exhaustivamente en la PD',
                            required: true
                        }
                    ],
                    groupable: true
                },
                "plagio": {
                    warning: "aviso destruir|2=plagio",
                    description: "artículos copiados, que violan derechos de autor",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-plagio-1',
                            label: 'URL origen del plagio',
                            tooltip: 'Copia y pega aquí la URL de la página externa en la que se halla el texto original',
                            required: true
                        }
                    ],
                    sust: true
                },
                "polémico": {
                    description: "temas susceptibles a guerras de edición o vandalismo",
                    talkPage: true
                },
                "pr": {
                    description: "para atribuir el artículo a un wikiproyecto",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-pr-1',
                            label: 'Nombre del wikiproyecto',
                            tooltip: 'Escribe aquí el nombre del Wikiproyecto (esta plantilla se coloca en la PD automáticamente)',
                            required: true
                        }
                    ],
                    talkPage: true
                },
                "promocional": {
                    warning: "aviso promocional",
                    description: "texto con marcado carácter publicitario, no neutral. Plantilla de 30 días",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-promocional-motivo',
                            label: 'Motivo (opcional)',
                            tooltip: 'Rellena este campo para especificar el motivo por el que se ha colocado la plantilla',
                            required: false
                        }
                    ],
                    sust: true
                },
                "publicidad": {
                    description: "contenido comercial que defiende proselitismos o propaganda",
                    groupable: true,
                    sust: true
                },
                "pvfan": {
                    warning: "aviso no neutralidad|2=PVfan",
                    description: "escritos poco neutrales, con punto de vista fanático",
                    groupable: true,
                    sust: true
                },
                "referencias": {
                    warning: "aviso referencias",
                    description: "artículos sin una sola referencia",
                    groupable: true,
                    sust: true
                },
                "referencias adicionales": {
                    warning: "aviso referencias",
                    description: "artículos con falta de referencias",
                    groupable: true,
                    sust: true
                },
                "renombrar": {
                    description: "para proponer un renombrado de una página",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-renombrar-1',
                            label: 'Nuevo nombre sugerido',
                            required: true
                        }
                    ],
                    sust: true
                },
                "revisar traducción": {
                    description: "texto traducido legible pero necesita un repaso lingüístico"
                },
                "sin relevancia": {
                    warning: "aviso sin relevancia",
                    description: "artículos que no superan umbral de relevancia. Plantilla de 30 días",
                    sust: true
                },
                "traducción": {
                    description: "artículos que se están traduciendo desde otro idioma",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-traducción-ci',
                            label: 'Código ISO del idioma (opcional)',
                            tooltip: 'Añade el código ISO del idioma del que procede la traducción. Ejemplo: «en» para artículos que proceden de la Wikipedia en inglés o «fr» si vienen de frwiki',
                            required: false
                        }
                    ]
                },
                "traducción incompleta": {
                    warning: "aviso traducción incompleta",
                    description: "artículos que han sido traducidos solo parcialmente",
                    groupable: true,
                    sust: true
                },
                "wikificar": {
                    warning: "aviso wikificar",
                    description: "textos con mal formato o que no cumplen el manual de estilo",
                    groupable: true,
                    sust: true
                }
            };
        }
    };
});
// ** Warn module **
// Posts a warning message on a user discussion page that can be selected as part of a series of options of a checkbox list
System.register("modules/warnings", ["modules/utils"], function (exports_9, context_9) {
    "use strict";
    var utils_6, Window, warnedUser, templateDict;
    var __moduleName = context_9 && context_9.id;
    /**
     * Builds a description link for a given template link.
     * @param link - The link to the template.
     * @returns A formatted anchor tag with the full link to the template.
     */
    function descriptionLinkBuilder(link) {
        const fullLink = `https://es.wikipedia.org/wiki/Plantilla:${link}`;
        return `<a href="${fullLink}" target="_blank">(+)</a>`;
    }
    /**
     * Builds a list of template data for use in the checkbox list.
     * @param list - The dictionary of templates.
     * @returns An array of processed list items.
     */
    function listBuilder(list) {
        var _a;
        let finalList = [];
        for (let item in list) {
            const template = {
                name: item,
                value: item,
                label: `{{${item}}} · ${list[item].description} ${descriptionLinkBuilder(item)}`,
                subgroup: ((_a = list[item]) === null || _a === void 0 ? void 0 : _a.subgroup) ? list[item].subgroup : null
            };
            finalList.push(template);
        }
        return finalList;
    }
    /**
     * Builds the posted template string based on the provided parameters.
     * @param paramObj - The template dictionary with the assigned parameters.
     * @returns A formatted string with the template and its parameters.
     */
    function templateBuilder(paramObj) {
        var _a, _b;
        let finalString = '';
        for (const element in paramObj) {
            const parameter = ((_a = paramObj[element]) === null || _a === void 0 ? void 0 : _a.param) ? `|${paramObj[element].param}=` : '';
            const parameterValue = ((_b = paramObj[element]) === null || _b === void 0 ? void 0 : _b.paramValue) || '';
            finalString += `{{sust:${element}${parameter}${parameterValue}}}\n`;
        }
        return finalString;
    }
    function extractParamsFromInput(input) {
        let temporaryTemplateList = [];
        // First let's tidy up Morebit's array
        for (const [key, value] of Object.entries(input)) {
            if (value && !key.includes('_param') && key != 'notify' && key != 'reason' && key != 'search') {
                temporaryTemplateList.push(key);
            }
        }
        return temporaryTemplateList;
    }
    function paramAssigner(paramList, input) {
        let finalObj = {};
        for (const element of paramList) {
            for (const [key, value] of Object.entries(input)) {
                if (key.includes('_param') && key.includes(element)) {
                    finalObj[element] = {
                        "param": key.split('-').pop(),
                        "paramValue": value
                    };
                }
            }
        }
        return finalObj;
    }
    /**
     * Creates the Morebits window holding the form.
     * @param warnedUserFromDOM - The username of the warned user fetched from the DOM.
     */
    function createFormWindow(warnedUserFromDOM) {
        // Something about the addPortletLink feature doesn't work well so this condition is unfortunately needed
        // Set the warned user from the DOM or fallback to the relevant username
        if (typeof warnedUserFromDOM == 'string') {
            warnedUser = warnedUserFromDOM;
        }
        else {
            warnedUser = utils_6.relevantUserName;
        }
        // Initialize the Morebits window
        Window = new Morebits.simpleWindow(620, 530);
        Window.setScriptName('Twinkle Lite');
        Window.setTitle('Avisar al usuario');
        Window.addFooterLink('Plantillas de aviso a usuario', 'Wikipedia:Plantillas de aviso a usuario');
        const form = new Morebits.quickForm(submitMessage);
        form.append({
            type: 'input',
            value: '',
            name: 'search',
            label: 'Búsqueda:',
            id: 'search',
            size: 30,
            event: function quickFilter() {
                const searchInput = document.getElementById("search");
                if (searchInput) {
                    const allCheckboxDivs = document.querySelectorAll("#checkboxContainer > div");
                    if (this.value) {
                        // Flushes the list before calling the search query function, then does it as a callback so that it happens in the right order
                        function flushList(callback) {
                            for (let i = 0; i < allCheckboxDivs.length; i++) {
                                const div = allCheckboxDivs[i];
                                div.style.display = 'none';
                            }
                            callback();
                        }
                        // Finds matches for the search query within the checkbox list
                        function updateList(searchString) {
                            for (let i = 0; i < allCheckboxDivs.length; i++) {
                                const checkboxText = allCheckboxDivs[i].childNodes[1].textContent;
                                if (checkboxText) {
                                    if (checkboxText.includes(searchString.toLowerCase()) || checkboxText.includes(searchString.toUpperCase())) {
                                        const div = allCheckboxDivs[i];
                                        div.style.display = '';
                                    }
                                }
                            }
                        }
                        flushList(() => updateList(searchInput.value));
                    }
                    // Retrieves the full list if nothing is on the search input box
                    if (this.value && this.value.length == 0) {
                        for (let i = 0; i < allCheckboxDivs.length; i++) {
                            const div = allCheckboxDivs[i];
                            div.style.display = '';
                        }
                    }
                }
            }
        });
        const optionBox = form.append({
            type: 'div',
            id: 'tagWorkArea',
            className: 'morebits-scrollbox',
            style: 'max-height: 28em; min-height: 0.5em;'
        });
        optionBox.append({
            type: 'checkbox',
            id: 'checkboxContainer',
            list: listBuilder(templateDict)
        });
        const optionsField = form.append({
            type: 'field',
            label: 'Opciones:'
        });
        optionsField.append({
            type: 'input',
            name: 'reason',
            label: 'Razón:',
            tooltip: '(Opcional) Escribe aquí el resumen de edición explicando la razón por la que se ha añadido la plantilla',
            style: 'width: 80%; margin-top: 0.5em;'
        });
        form.append({
            type: 'submit',
            label: 'Aceptar'
        });
        const result = form.render();
        Window.setContent(result);
        Window.display();
    }
    exports_9("createFormWindow", createFormWindow);
    /**
     * Handles the submission of the warning message form.
     * @param e - The event triggered on form submission.
     */
    function submitMessage(e) {
        const form = e.target;
        const input = Morebits.quickForm.getInputData(form);
        let templateList = extractParamsFromInput(input);
        let templateParams = paramAssigner(templateList, input);
        // Prevent the user from warning themselves
        if (warnedUser == utils_6.currentUser) {
            alert("No puedes dejarte un aviso a ti mismo");
            return;
        }
        else {
            // Create a status window to display progress
            const statusWindow = new Morebits.simpleWindow(400, 350);
            utils_6.createStatusWindow(statusWindow);
            new Morebits.status("Paso 1", 'generando plantilla...', 'info');
            // Post the message to the user's discussion page
            postsMessage(templateParams, input)
                .then(function () {
                if (utils_6.currentPageName.includes(`_discusión:${warnedUser}`)) {
                    utils_6.finishMorebitsStatus(Window, statusWindow, 'finished', true);
                }
                else {
                    utils_6.finishMorebitsStatus(Window, statusWindow, 'finished', false);
                }
            })
                .catch(function (error) {
                utils_6.finishMorebitsStatus(Window, statusWindow, 'error');
                console.error(`Error: ${error}`);
            });
        }
    }
    /**
     * Posts the message to the user's discussion page.
     * @param templateParams - The parameters for the template.
     * @param input - The form input data.
     * @returns A promise that resolves when the message is posted.
     */
    function postsMessage(templateParams, input) {
        new Morebits.status("Paso 2", "publicando aviso en la página de discusión del usuario", "info");
        return utils_6.isPageMissing(`Usuario_discusión:${warnedUser}`)
            .then(function (mustCreateNewTalkPage) {
            if (mustCreateNewTalkPage) {
                return new mw.Api().create(`Usuario_discusión:${warnedUser}`, { summary: `Añadiendo aviso de usuario mediante [[WP:Twinkle Lite|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}` }, `${templateBuilder(templateParams)}~~~~`);
            }
            else {
                return new mw.Api().edit(`Usuario_discusión:${warnedUser}`, function (revision) {
                    return {
                        text: revision.content + `\n${templateBuilder(templateParams)}~~~~`,
                        summary: `Añadiendo aviso de usuario mediante [[WP:Twinkle Lite|Twinkle Lite]]` + `${input.reason ? `. ${input.reason}` : ''}`,
                        minor: false
                    };
                });
            }
        });
    }
    return {
        setters: [
            function (utils_6_1) {
                utils_6 = utils_6_1;
            }
        ],
        execute: function () {
            // Dictionary holding the different template definitions with descriptions and 
            // optional subgroups for specific parameters
            templateDict = {
                "aviso autopromoción": {
                    description: "usuarios creadores de páginas promocionales o de publicidad",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso autopromoción-1',
                            label: 'Artículo promocional en cuestión',
                            tooltip: 'Escribe el nombre del artículo considerado promocional o publicitario. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso blanqueo": {
                    description: "usuarios que han blanqueado total o parcialmente páginas en general o de discusión asociada",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso blanqueo-1',
                            label: 'Artículo en el que se realizó el blanqueo',
                            tooltip: 'Escribe el nombre del artículo en el que se realizó el blanqueo parcial o total. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso blanqueo discusión": {
                    description: "usuarios que han blanqueado total o parcialmente su página de discusión o la de otros usuarios",
                },
                "aviso categorizar": {
                    description: "usuarios que han olvidado categorizar artículos",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso categorizar-1',
                            label: 'Artículo en cuestión',
                            tooltip: 'Escribe el nombre del artículo que no ha sido categorizado por el usuario. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso conflicto de interés": {
                    description: "usuarios que editan bajo conflicto de interés o que constituyen CPP y no respetan PVN"
                },
                "aviso copyvio": {
                    description: "usuarios que han creado artículos que vulneran derechos de autor",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso copyvio-1',
                            label: 'Artículo en el que hay copyvio',
                            tooltip: 'Escribe el nombre del artículo en el que se han vulnerado derechos de autor. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso etiqueta": {
                    description: "usuarios que han faltado a la etiqueta, realizando ediciones o creando comentarios o páginas que pueden resultar ofensivas",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso etiqueta-1',
                            label: 'Nombre del artículo donde se ha producido la falta de etiqueta',
                            tooltip: 'Escribe el nombre de la página donde se ha producido la falta de etiqueta. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso firma": {
                    description: "usuarios que han firmado artículos",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso firma-1',
                            label: 'Nombre del artículo donde se ha firmado erróneamente',
                            tooltip: 'Escribe el nombre del artículo donde se ha añadido una firma. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso guerra de ediciones": {
                    description: "usuario que puede desconocer R3R y se encuentre en guerra o conflicto de ediciones",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso guerra de ediciones-1',
                            label: 'Nombre de la página en la que se ha dado la guerra de ediciones',
                            tooltip: 'Escribe el nombre de la página en la que el usuario avisado ha participado en una guerra de ediciones. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso imagen": {
                    description: "autores que han subido imágenes que no deberían estar en Commons",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso imagen-1',
                            label: 'Nombre del archivo en Commons',
                            tooltip: 'Escribe el nombre del archivo en Commons, incluyendo su extensión. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso noesunforo2": {
                    description: "usuarios que forean en páginas de discusión",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso noesunforo2-1',
                            label: 'Artículo en el que se realizó la edición',
                            tooltip: 'Escribe el nombre del artículo en el que se cometió la prueba de edición. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso nombre inapropiado": {
                    description: "nombres de usuario que van contra la política de nombres de usuario"
                },
                "aviso prueba1": {
                    description: "usuarios que han realizado ediciones no apropiadas",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso prueba1-1',
                            label: 'Artículo en el que se realizó la edición',
                            tooltip: 'Escribe el nombre del artículo en el que se cometió la prueba de edición. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso prueba2": {
                    description: "usuarios que han realizado ediciones vandálicas",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso prueba2-1',
                            label: 'Artículo en el que se realizó el vandalismo',
                            tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso prueba3": {
                    description: "usuarios que han realizado más de una edición vandálica",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso prueba3-1',
                            label: 'Artículo en el que se llevó a cabo el vandalismo',
                            tooltip: 'Escribe el nombre del artículo en elviso noesunforo1 que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso prueba4": {
                    description: "ultimo aviso a usuarios vandálicos antes de denunciarlo en TAB",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso prueba4-1',
                            label: 'Artículo en el que se llevó a cabo el vandalismo',
                            tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "aviso sin sentido": {
                    description: "usuarios que crean páginas sin sentido o bulos",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso sin sentido-1',
                            label: 'Artículo en el que se llevó a cabo la edición',
                            tooltip: 'Escribe el nombre del artículo en el que se llevó a cabo la edición sin sentido o bulo. No uses corchetes, el enlace se añadirá automáticamente',
                            required: true
                        }
                    ]
                },
                "aviso topónimos de España": {
                    description: "usuarios que no han tenido en cuenta WP:TOES",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso topónimos de España-1',
                            label: 'Artículo en cuestión',
                            tooltip: 'Escribe el nombre de la página en la que se ha violado la política de WP:TOES. No uses corchetes, el enlace se añadirá automáticamente',
                        }
                    ]
                },
                "aviso tradref": {
                    description: "usuarios que han traducido un artículo pero no han agregado la atribución o referencias a copyright correspondientes",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso tradref-1',
                            label: 'Nombre del artículo',
                            tooltip: 'Escribe el nombre del artículo en el que no se ha añadido la atribución correcta, sin usar corchetes',
                        }
                    ]
                },
                "aviso traslado al taller": {
                    description: "usuarios que han creado una página no apta para el espacio principal",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-aviso traslado al taller-1',
                            label: 'Página (del taller) en la que se encuentra el artículo trasladado',
                            tooltip: 'Escribe el nombre de la página en la que se encuentra ahora el artículo (Ej.: si pones «EjemploDePágina», el enlace llevará a «Usuario:Ejemplo/Taller/EjemploDePágina»). No uses corchetes, el enlace se añadirá automáticamente',
                        }
                    ]
                },
                "aviso votonulo": {
                    description: "usuarios que han intentado votar sin cumplir los requisitos"
                },
                "no amenaces con acciones legales": {
                    description: "usuarios que han amenazado con denunciar o llevar a juicio a Wikipedia/otros usuarios",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-no amenaces con acciones legales-1',
                            label: 'Página en la que se llevó a cabo la amenaza',
                            tooltip: '(Opcional) Escribe el nombre de la página en la que se llevó a cabo la amenaza. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "no retires plantillas de mantenimiento crítico": {
                    description: "usuarios que han retirado plantillas de mantenimiento crítico sin consenso en PD",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-no retires plantillas de mantenimiento crítico-1',
                            label: 'Artículo en el que se retiró la plantilla',
                            tooltip: 'Escribe el nombre del artículo en el que se encontraba la plantilla retirada. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "planvand": {
                    description: "usuarios que han realizado ediciones perjudiciales o que van más allá del vandalismo",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-planvand-1',
                            label: 'Artículo en el que se llevó a cabo el vandalismo',
                            tooltip: 'Escribe el nombre del artículo en el que se cometió el vandalismo. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                },
                "ten precaución en la retirada de plantillas de mantenimiento no crítico": {
                    description: "usuarios que han retirado plantillas de mantenimiento no crítico sin explicaciones",
                    subgroup: [
                        {
                            type: 'input',
                            name: '_param-ten precaución en la retirada de plantillas de mantenimiento no crítico-1',
                            label: 'Artículo del que se retiró la plantilla',
                            tooltip: 'Escribe el nombre del artículo en el que se produjo la retirada indebida de la plantilla de mantenimiento no crítico. No uses corchetes, el enlace se añadirá automáticamente'
                        }
                    ]
                }
            };
        }
    };
});
System.register("modules/hide", ["modules/utils"], function (exports_10, context_10) {
    "use strict";
    var utils_7, diffID, Window;
    var __moduleName = context_10 && context_10.id;
    /**
     * Updates the display status of the label for the additional diffs input field.
     * @param checkstatus - Determines whether the label should be displayed or hidden based on checkbox status.
     */
    function updateLabel(checkstatus = false) {
        const label = document.querySelector('label[for=moreDiffsInputField]');
        if (label) {
            if (checkstatus) {
                label.style.display = '';
            }
            else {
                label.style.display = 'none';
            }
        }
    }
    /**
     * Creates and displays the Morebits form window.
     * @param diff - The initial diff ID to be included in the request, fetched from UI.
     */
    function createFormWindow(diff) {
        diffID = diff;
        Window = new Morebits.simpleWindow(620, 530);
        Window.setScriptName('Twinkle Lite');
        Window.setTitle('Solicitar ocultado de edición');
        Window.addFooterLink('Política de supresores', 'Wikipedia:Supresores');
        const form = new Morebits.quickForm(submitMessage);
        form.append({
            type: 'textarea',
            name: 'reason',
            label: 'Describe el motivo (opcional)',
            tooltip: 'Puedes usar wikicódigo en tu descripción, tu firma se añadirá automáticamente'
        });
        const optionsField = form.append({
            type: 'field',
            label: 'Opciones: ',
        });
        optionsField.append({
            type: 'checkbox',
            list: [{
                    name: 'moreDIffs',
                    label: 'Incluir más diffs en la solicitud',
                    checked: false,
                }],
            name: 'moreDiffsCheckbox',
            event: (e) => {
                const checked = e.target.checked;
                const inputField = document.getElementById('moreDiffsInputField');
                if (checked) {
                    inputField.style.display = '';
                }
                else {
                    inputField.style.display = 'none';
                }
                updateLabel(checked);
            }
        });
        optionsField.append({
            type: 'input',
            label: 'Escribe el ID de otros diffs que quieras incluir, separados por comas:<br> <i>Ejemplo: «159710180, 159635315»</i><br>',
            tooltip: 'El ID es el número de nueve cifras que aparece al final de la URL en una página de diff después de «oldid=»',
            name: 'moreDiffsString',
            style: "display: none;",
            id: 'moreDiffsInputField',
        });
        form.append({
            type: 'submit',
            label: 'Aceptar'
        });
        const result = form.render();
        Window.setContent(result);
        Window.display();
        updateLabel();
    }
    exports_10("createFormWindow", createFormWindow);
    /**
     * Processes the additional diffs input field string and returns an array of valid diff IDs.
     * @param input - The input string containing additional diff IDs separated by commas.
     * @returns An array of valid diff IDs.
     */
    function makeDiffList(diffIDs) {
        // This first step makes sure no characters that are either
        // numbers or commas are processed
        let processedDiffList = diffIDs.replace(/[^0-9,]+/g, "");
        let processedDiffListArray = processedDiffList.split(',');
        processedDiffListArray.unshift(diffID);
        return processedDiffListArray;
    }
    /**
     * Creates a formatted message listing the diffs to include in the board bullet list.
     * @param inputList - An array of diff IDs to be included in the message.
     * @returns A formatted string listing the diffs as bullet points with internal links.
     */
    function makeDiffMessage(inputList) {
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
    function buildMessage(moreDiffs, reason) {
        let diffList = [];
        if (moreDiffs) {
            diffList = makeDiffList(moreDiffs);
            console.log(diffList);
        }
        else {
            diffList.push(diffID);
        }
        const boardMessage = `\n== Ocultar ${moreDiffs ? "ediciones" : "edición"} ==
; Asunto
${makeDiffMessage(diffList)}
${reason ? `; Motivo\n${reason}` : ''}
; Usuario que lo solicita
* ~~~~
; Respuesta
(a rellenar por un bibliotecario)
`;
        return boardMessage;
    }
    /**
     * Submits the message to the board by MW API interaction, requesting edit suppression.
     * @param e - The event triggered by the form submission.
     */
    function submitMessage(e) {
        const board = "Wikipedia:Tablón_de_anuncios_de_los_bibliotecarios/Portal/Archivo/Miscelánea/Actual";
        const form = e.target;
        const input = Morebits.quickForm.getInputData(form);
        const statusWindow = new Morebits.simpleWindow(400, 350);
        utils_7.createStatusWindow(statusWindow);
        new Morebits.status("Paso 1", `Solicitando el ocultado de ${input.moreDiffs ? 'las ediciones' : 'la edición'}...`, "info");
        new mw.Api().edit(board, (revision) => {
            const editParams = {
                text: revision.content + buildMessage(input.moreDiffsString, input.reason),
                summary: `Solicitando ocultado de ${input.moreDiffs ? 'ediciones' : 'una edición'} mediante [[WP:TL|Twinkle Lite]]`,
                minor: false
            };
            return editParams;
        }).then(() => {
            utils_7.finishMorebitsStatus(Window, statusWindow, 'finished', false);
        })
            .catch(function (error) {
            utils_7.finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(`Error: ${error}`);
        });
    }
    return {
        setters: [
            function (utils_7_1) {
                utils_7 = utils_7_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("DOMutils/DOMutils", ["modules/utils"], function (exports_11, context_11) {
    "use strict";
    var utils_8;
    var __moduleName = context_11 && context_11.id;
    function createHideButton(callbackFn) {
        var _a;
        const parentElement = (_a = document.querySelector('.mw-diff-uno')) === null || _a === void 0 ? void 0 : _a.parentElement;
        if (parentElement) {
            const hideButton = document.createElement('span');
            const tooltip = "Solicita que esta edición se oculte en el TAB";
            hideButton.innerHTML = ` (<a class="TL-hide-button" title="${tooltip}">ocultar</a>)`;
            parentElement.appendChild(hideButton);
            const hideLink = document.querySelector('.TL-hide-button');
            hideLink === null || hideLink === void 0 ? void 0 : hideLink.addEventListener('click', () => {
                callbackFn(utils_8.diffNewId);
            });
        }
    }
    exports_11("createHideButton", createHideButton);
    function createButton(buttonId, buttonText, buttonColor, callbackFn) {
        const usersNodeList = document.querySelectorAll('a.mw-usertoollinks-talk');
        if (usersNodeList) {
            usersNodeList.forEach((element) => {
                if (element) {
                    const firstParentElement = element.parentElement;
                    if (firstParentElement) {
                        if (firstParentElement.querySelector('a.extiw')) {
                            return;
                        }
                        const newElement = document.createElement('span');
                        newElement.textContent = ' · ';
                        const elementChild = document.createElement('a');
                        elementChild.id = buttonId;
                        elementChild.textContent = buttonText;
                        elementChild.style.color = buttonColor;
                        elementChild.addEventListener('click', () => {
                            let username;
                            // Always using the special page name logic
                            if (utils_8.currentPageName === "Especial:PáginasNuevas") {
                                username = firstParentElement.parentElement.querySelector('bdi').innerText;
                            }
                            else {
                                username = firstParentElement.parentElement.parentElement.querySelector('bdi').innerText;
                            }
                            callbackFn(username);
                        });
                        newElement.append(elementChild);
                        const firstParentNode = element.parentNode;
                        if (firstParentNode) {
                            firstParentNode.insertBefore(newElement, element.nextSibling);
                        }
                    }
                }
            });
        }
    }
    exports_11("createButton", createButton);
    return {
        setters: [
            function (utils_8_1) {
                utils_8 = utils_8_1;
            }
        ],
        execute: function () {
        }
    };
});
System.register("index", ["modules/deletionrequestmaker", "modules/pageprotection", "modules/speedydeletion", "modules/reports", "modules/tags", "modules/warnings", "modules/hide", "DOMutils/DOMutils", "modules/utils"], function (exports_12, context_12) {
    "use strict";
    var DeletionRequestMaker, PageProtection, SpeedyDeletion, Reports, Tags, Warnings, Hide, DOMutils_1, utils_9;
    var __moduleName = context_12 && context_12.id;
    return {
        setters: [
            function (DeletionRequestMaker_1) {
                DeletionRequestMaker = DeletionRequestMaker_1;
            },
            function (PageProtection_1) {
                PageProtection = PageProtection_1;
            },
            function (SpeedyDeletion_1) {
                SpeedyDeletion = SpeedyDeletion_1;
            },
            function (Reports_1) {
                Reports = Reports_1;
            },
            function (Tags_1) {
                Tags = Tags_1;
            },
            function (Warnings_1) {
                Warnings = Warnings_1;
            },
            function (Hide_1) {
                Hide = Hide_1;
            },
            function (DOMutils_1_1) {
                DOMutils_1 = DOMutils_1_1;
            },
            function (utils_9_1) {
                utils_9 = utils_9_1;
            }
        ],
        execute: function () {
            // Let's check first whether the script has been already loaded through global variable
            if (!window.IS_TWINKLE_LITE_LOADED) {
                window.IS_TWINKLE_LITE_LOADED = true;
                const loadDependencies = (callback) => {
                    mw.loader.using(['mediawiki.user', 'mediawiki.util', 'mediawiki.Title', 'jquery.ui', 'mediawiki.api', 'mediawiki.ForeignApi']);
                    callback();
                };
                const loadMorebits = (callback) => {
                    mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript', 'text/javascript');
                    mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');
                    callback();
                };
                const initializeTwinkleLite = () => {
                    if (+utils_9.currentNamespace >= 0 || mw.config.get('wgArticleId')) {
                        const DRMportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Abrir CDB', 'TL-button', 'Abre una consulta de borrado para esta página');
                        if (DRMportletLink) {
                            DRMportletLink.onclick = DeletionRequestMaker.createFormWindow;
                        }
                        const SDportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Borrado rápido', 'TL-button', 'Solicita el borrado rápido de la página');
                        if (SDportletLink) {
                            SDportletLink.onclick = SpeedyDeletion.createFormWindow;
                        }
                        const PPportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Pedir protección', 'TL-button', 'Solicita que esta página sea protegida');
                        if (PPportletLink) {
                            PPportletLink.onclick = PageProtection.createFormWindow;
                        }
                    }
                    if (utils_9.currentNamespace === 0 || utils_9.currentNamespace === 1 || utils_9.currentNamespace === 104 || utils_9.currentNamespace === 105) {
                        const TportleltLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Añadir plantilla', 'TL-button', 'Añade una plantilla a la página');
                        if (TportleltLink) {
                            TportleltLink.onclick = Tags.createFormWindow;
                        }
                    }
                    if (utils_9.currentNamespace === 2 || utils_9.currentNamespace === 3 || (mw.config.get('wgPageName').indexOf("Especial:Contribuciones") > -1)) {
                        const RportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Denunciar usuario', 'TL-button', 'Informa de un problema en relación con el usuario');
                        if (RportletLink) {
                            RportletLink.onclick = Reports.createFormWindow;
                        }
                        const WportletLink = mw.util.addPortletLink('p-cactions', 'javascript:void(0)', 'Avisar al usuario', 'TL-button', 'Deja una plantilla de aviso al usuario en su página de discusión');
                        if (WportletLink) {
                            WportletLink.onclick = Warnings.createFormWindow;
                        }
                    }
                    if (utils_9.currentAction == 'history' ||
                        utils_9.currentPageName == "Especial:Seguimiento" ||
                        utils_9.currentPageName == "Especial:CambiosRecientes" ||
                        utils_9.currentPageName == "Especial:PáginasNuevas" ||
                        utils_9.diffNewId) {
                        mw.hook('wikipage.content').add(() => {
                            if (document.querySelectorAll('a.mw-userlink').length > 0 && !document.getElementById('report-button')) {
                                DOMutils_1.createButton('report-button', 'denunciar', '#924141', Reports.createFormWindow);
                                DOMutils_1.createButton('warning-button', 'aviso', 'teal', Warnings.createFormWindow);
                            }
                        });
                    }
                    if (utils_9.diffNewId && !document.querySelector('.TL-hide-button')) {
                        mw.hook('wikipage.content').add(() => {
                            DOMutils_1.createHideButton(Hide.createFormWindow);
                        });
                    }
                    const loadTwinkleLite = () => {
                        loadDependencies(() => {
                            loadMorebits(() => {
                                initializeTwinkleLite();
                                console.log("Twinkle Lite cargado");
                            });
                        });
                    };
                    console.log("test");
                    loadTwinkleLite();
                };
            }
            else {
                console.warn('Parece que Twinkle Lite se ha intentado cargar dos veces. Comprueba la configuración para evitar la doble importación del script.');
            }
        }
    };
});
