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

    const DRCField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de cerrado de consultas de borrado',
        id: 'drc-box'
    });

    DRCField.append({
        type: 'checkbox',
        name: 'drcMenu',
        list: [{
            value: 'tags',
            label: 'Activa la opción «Cerrar CDB» en el menú de acciones al estar en la página de una consulta de borrado (solo bibliotecarios)',
            name: 'DRCActionsMenuCheckbox',
            disabled: !isCurrentUserSysop
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
            value: 'tags',
            label: 'Activa la opción «Abrir CDB» en el menú de acciones',
            name: 'DRMActionsMenuCheckbox'
        }]
    })

    const fastBlockerField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de bloqueado rápido'
    });

    const blockAppealsField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de resolución de peticiones de desbloqueo'
    });

    const hideField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de ocultado de ediciones'
    });

    const pageProtectionField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de solicitud de protección de páginas'
    });

    const reportsField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de denuncias'
    });

    const speedyDeletionField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de solicitud de borrado rápido'
    });

    const warningsModule: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de advertencias'
    });

    const result = form.render();
    Window.setContent(result);
    Window.display();

}