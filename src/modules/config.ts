import { QuickForm, QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { createStatusWindow, currentUser, finishMorebitsStatus, getContent, isCurrentUserSysop, isPageMissing } from "./../utils/utils";
import { Settings } from "types/twinkle-types";

let Window: SimpleWindowInstance;
let config: Settings | null = null;

async function createConfigPage(settings: Settings) {
    await new mw.Api().create(
        `Usuario:${currentUser}/twinkle-lite-settings.json`,
        { summary: `Creando página de configuración de [[WP:TL|Twinkle Lite]]` },
        JSON.stringify(settings)
    )
}

async function editConfigPage(settings: Settings) {
    await new mw.Api().edit(
        `Usuario:${currentUser}/twinkle-lite-settings.json`,
        () => {
            return {
                text: JSON.stringify(settings),
                summary: `Editando página de configuración de [[WP:TL|Twinkle Lite]]`,
                minor: false
            }
        }
    )
}

function saveSettingsToLocalStorage(settings: Settings) {
    try {
        const serializedSettings = JSON.stringify(settings);
        localStorage.setItem("TwinkleLiteUserSettings", serializedSettings);
    } catch (error) {
        console.error("Hubo un error guardando las preferencias de configuración en el localStorage:", error)
    }
}

async function submitMessage(e: Event) {
    const form = e.target as HTMLFormElement;
    const input = Morebits.quickForm.getInputData(form);

    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350);
    createStatusWindow(statusWindow);
    new Morebits.status("⌛", "Actualizando configuración...", "info");

    try {
        const configPageMissing = await isPageMissing(`Usuario:${currentUser}/twinkle-lite-settings.json`);
        if (configPageMissing) {
            await createConfigPage(input);
        } else {
            await editConfigPage(input);
        }
        saveSettingsToLocalStorage(input);
        finishMorebitsStatus(Window, statusWindow, 'finished', true);
    } catch (error: any) {
        console.error(error)
        finishMorebitsStatus(Window, statusWindow, 'error');
    }

}

export function createConfigWindow(settings: Settings | null) {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Configuración de Twinkle Lite');
    Window.addFooterLink('Documentación de Twinkle Lite', 'WP:TL')

    const form = new Morebits.quickForm(submitMessage);

    const tagsField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de plantillado de artículos',
        id: 'tags-box'
    });

    tagsField.append({
        type: 'checkbox',
        name: 'tagsMenu',
        list: [{
            value: 'tags',
            label: 'Activa la opción «Añadir plantilla» en el menú de acciones',
            name: 'tagsActionsMenuCheckbox',
            checked: settings?.tagsActionsMenuCheckbox ?? true
        }]
    })

    const DRMField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de apertura de consultas de borrado',
        id: 'drm-box'
    });

    DRMField.append({
        type: 'checkbox',
        name: 'drmMenu',
        list: [{
            value: 'DRM',
            label: 'Activa la opción «Abrir CDB» en el menú de acciones',
            name: 'DRMActionsMenuCheckbox',
            checked: settings?.DRMActionsMenuCheckbox ?? true
        }]
    })

    const hideField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de ocultado de ediciones'
    });

    hideField.append({
        type: 'checkbox',
        name: 'hideMenu',
        list: [{
            value: 'hide',
            label: 'Activa la opción de ocultar ediciones en páginas de diffs',
            name: 'HideDiffPageCheckbox',
            checked: settings?.HideDiffPageCheckbox ?? true
        }]
    })

    const pageProtectionField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de solicitud de protección de páginas',
    });

    pageProtectionField.append({
        type: 'checkbox',
        name: 'PPMenu',
        list: [{
            value: 'PP',
            label: 'Activa la opción «Pedir protección» en el menú de acciones',
            name: 'PPActionMenuCheckbox',
            checked: settings?.PPActionMenuCheckbox ?? true
        }]
    })


    const speedyDeletionField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de solicitud de borrado rápido'
    });

    speedyDeletionField.append({
        type: 'checkbox',
        name: 'speedyDeletionMenu',
        list: [{
            value: 'speedy-actions',
            label: 'Activa la opción «Borrado rápido» en el menú de acciones',
            name: 'SDActionsMenuCheckbox',
            checked: settings?.SDActionsMenuCheckbox ?? true
        }]
    })


    const reportsField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de denuncias'
    });

    reportsField.append({
        type: 'checkbox',
        name: 'reportsMenu',
        list: [
            {
                value: 'reports-actions',
                label: 'Activa la opción «Denunciar usuario» en el menú de acciones en páginas de usuario',
                name: 'ReportsActionsMenuCheckbox',
                checked: settings?.ReportsActionsMenuCheckbox ?? true
            },
            {
                value: 'reports-usertoollinks',
                label: 'Activa la opción «denunciar» en la lista de diffs en páginas de historial, cambios recientes y similares',
                name: 'ReportsUserToolLinksMenuCheckbox',
                checked: settings?.ReportsUserToolLinksMenuCheckbox ?? true
            }
        ]
    })

    const warningsModuleField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de advertencias'
    });

    warningsModuleField.append({
        type: 'checkbox',
        name: 'warningsMenu',
        list: [
            {
                value: 'warnings-actions',
                label: 'Activa la opción «Avisar usuario» en el menú de acciones',
                name: 'WarningsActionsMenuCheckbox',
                checked: settings?.WarningsActionsMenuCheckbox ?? true
            },
            {
                value: 'warnings-usertoollinks',
                label: 'Activa la opción «denunciar» en en la lista de diffs en páginas de historial, cambios recientes y similares',
                name: 'WarningsUserToolLinksMenuCheckbox',
                checked: settings?.WarningsUserToolLinksMenuCheckbox ?? true
            }
        ]
    })

    const mtsModuleField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de traslado al taller del usuario'
    })

    mtsModuleField.append({
        type: 'checkbox',
        name: 'mtsMenu',
        list: [
            {
                value: 'mts-actions',
                label: 'Activa la opción «Trasladar al taller del usuario» en el menú de acciones',
                name: 'MTSActionsMenuCheckbox',
                checked: settings?.MTSActionsMenuCheckbox ?? true
            }
        ]
    })

    const fastBlockerField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de bloqueado rápido (solo bibliotecarios)'
    });

    fastBlockerField.append({
        type: 'checkbox',
        name: 'fbMenu',
        list: [{
            value: 'fast-blocker',
            label: 'Activa el botón «bloqueo rápido» en historiales y la lista de seguimiento',
            name: 'FBButtonMenuCheckbox',
            disabled: !isCurrentUserSysop,
            checked: settings?.FBButtonMenuCheckbox ?? true
        }]
    })

    const DRCField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de cerrado de consultas de borrado (solo bibliotecarios)',
        id: 'drc-box'
    });

    DRCField.append({
        type: 'checkbox',
        name: 'drcMenu',
        list: [
            {
                value: 'tags-option',
                label: 'Muestra un botón «Cerrar CDB» en páginas en las de consultas de borrado',
                name: 'DRCPageMenuCheckbox',
                disabled: !isCurrentUserSysop,
                checked: settings?.DRCPageMenuCheckbox ?? true
            },
            {
                value: 'tags-actions',
                label: 'Muestra la opción «Cerrar CDB» en el menú de acciones en las de consultas de borrado',
                name: 'DRCActionsMenuCheckbox',
                disabled: !isCurrentUserSysop,
                checked: settings?.DRCActionsMenuCheckbox ?? true
            },
        ]
    })

    const blockAppealsField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de resolución de peticiones de desbloqueo (solo bibliotecarios)'
    });

    blockAppealsField.append({
        type: 'checkbox',
        name: 'baMenu',
        list: [{
            value: 'block-appeals',
            label: 'Muestra un botón en las páginas de usuario en las que se encuentra una solicitud de desbloqueo',
            name: 'BAButtonMenuCheckbox',
            disabled: !isCurrentUserSysop,
            checked: settings?.BAButtonMenuCheckbox ?? true
        }]
    })

    form.append({
        type: 'submit',
        label: 'Aplicar configuración',
    });

    const result = form.render();
    Window.setContent(result);
    Window.display();

}