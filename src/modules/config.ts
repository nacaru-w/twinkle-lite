import { QuickForm, QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";
import { isCurrentUserSysop } from "./../utils/utils";

let Window: SimpleWindowInstance;

function submitMessage(e: Event) {

}

export function createConfigWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Preferencias de Twinkle Lite');
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
            name: 'tagsActionsMenuCheckbox'
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
            name: 'DRMActionsMenuCheckbox'
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
            name: 'HideDiffPageCheckbox'
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
            name: 'PPActionMenuCheckbox'
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
            name: 'SDActionsMenuCheckbox'
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
                name: 'ReportsActionsMenuCheckbox'
            },
            {
                value: 'reports-usertoollinks',
                label: 'Activa la opción «denunciar» en la lista de diffs en páginas de historial, cambios recientes y similares',
                name: 'ReportsUserToolLinksMenuCheckbox'
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
                name: 'WarningsActionsMenuCheckbox'
            },
            {
                value: 'warnings-usertoollinks',
                label: 'Activa la opción «denunciar» en en la lista de diffs en páginas de historial, cambios recientes y similares',
                name: 'WarningsUserToolLinksMenuCheckbox'
            }
        ]
    })

    const fastBlockerField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de bloqueado rápido'
    });

    fastBlockerField.append({
        type: 'checkbox',
        name: 'fbMenu',
        list: [{
            value: 'fast-blocker',
            label: 'Activa el botón «bloqueo rápido» en historiales y la lista de seguimiento (solo bibliotecarios)',
            name: 'FBButtonMenuCheckbox',
            disabled: !isCurrentUserSysop
        }]
    })

    const DRCField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de cerrado de consultas de borrado',
        id: 'drc-box'
    });

    DRCField.append({
        type: 'checkbox',
        name: 'drcMenu',
        list: [
            {
                value: 'tags-option',
                label: 'Muestra un botón «Cerrar CDB» en páginas en las de consultas de borrado (solo bibliotecarios)',
                name: 'DRCActionsMenuCheckbox',
                disabled: !isCurrentUserSysop
            },
        ]
    })

    const blockAppealsField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de resolución de peticiones de desbloqueo'
    });

    blockAppealsField.append({
        type: 'checkbox',
        name: 'baMenu',
        list: [{
            value: 'block-appeals',
            label: 'Muestra un botón en las páginas de usuario en las que se encuentra una solicitud de desbloqueo (solo bibliotecarios)',
            name: 'BAButtonMenuCheckbox',
            disabled: !isCurrentUserSysop
        }]
    })

    const result = form.render();
    Window.setContent(result);
    Window.display();

}