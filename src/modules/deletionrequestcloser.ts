import { ListElementData, SimpleWindowInstance } from "types/morebits-types";
import { createStatusWindow, currentPageName, today } from "../utils/utils";

let Window: SimpleWindowInstance;

const closureOptions: string[] = ['Mantener', 'Borrar', 'Otro'];

const DRC = {
    closedDR: {
        top: (veredict: string, comment?: string): string => {
            return `{{cierracdb-arr}} '''${veredict.toUpperCase}'''. ${comment} ~~~~`;
        },
        bottom: '{{cierracdb-ab}}'
    },
    talkPage: (veredict: string) => {
        return `{{cdbpasada|página=${currentPageName}}|fecha=${today}}|resultado='''${veredict}'''}}`
    },
    articlePage: {
        removeTemplate: (content: string): string => {
            const pattern: RegExp = /<!-- Por favor, no retires este mensaje hasta que se resuelva el proceso -->[\s\S]*?<!-- Fin del mensaje de la consulta, puedes editar bajo esta línea -->/g;
            return content.replace(pattern, '');
        }
    }
}

function getClosureOptions(): ListElementData[] {
    return closureOptions.map((e) => {
        return { type: 'option', value: e, label: e }
    })
}

function manageOtherInputField(selectedOption: string): void {
    console.log(selectedOption)
    const field = document.getElementById('otherField');
    const fieldParent = field?.parentElement

    if (fieldParent) {
        switch (selectedOption) {
            case 'Otro':
                fieldParent.style.display = 'flex';
                fieldParent.style.marginBlock = '5px';
                field.style.display = 'block';
                if (!document.getElementById('otherFieldLabel')) {
                    const label = document.createElement('label')
                    label.id = 'otherFieldLabel';
                    label.innerText = 'Escribe el resultado de la consulta: ';
                    fieldParent.prepend(label);
                }
                break;
            default:
                fieldParent.style.display = 'none';
        }
    }
}

async function editRequestPage(decision: string, comment?: string) {

}

async function editArticle(decision: string) {

}

async function editArticleTalkPage(decision: string) {

}

function submitMessage(e: Event) {
    const form = e.target;
    const input = Morebits.quickForm.getInputData(form);

    createStatusWindow(new Morebits.simpleWindow(400, 350));
    new Morebits.status("Paso 1", "editando la página de la consulta", "info");

    console.log(input);

}

export function createDRCFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Cerrar consulta de borrado');
    Window.addFooterLink('Política de consultas de borrado', 'Wikipedia:Consultas de borrado mediante argumentación');

    const form = new Morebits.quickForm(submitMessage);

    form.append({
        type: 'select',
        name: 'result',
        label: 'Selecciona el resultado de la consulta:',
        list: getClosureOptions(),
        event: (e: any) => manageOtherInputField(e.target.value)
    })

    form.append({
        type: 'input',
        name: 'otherField',
        id: 'otherField',
        style: 'margin-left: 3px; display: none;'
    })

    form.append({
        type: 'textarea',
        name: 'reason',
        label: 'Añade un comentario (opcional)',
        tooltip: 'Añade un comentario aclaratorio que complemente a la decisión tomada. Este aparecerá anexo a la decisión. Puedes usar wikicódigo y no es necesario firmarlo.'
    })

    form.append({
        type: 'submit',
        label: 'Aceptar'
    });

    const result = form.render();
    Window.setContent(result);
    Window.display();
}
