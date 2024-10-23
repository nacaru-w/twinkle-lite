import { QuickForm, QuickFormElementInstance, SimpleWindowInstance } from "types/morebits-types";

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
        label: 'Módulo de plantillado de artículos'
    });

    const DRCField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de cerrado de consultas de borrado'
    });

    const DRMField: QuickFormElementInstance = form.append({
        type: 'field',
        label: 'Módulo de apertura de consultas de borrado'
    });

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