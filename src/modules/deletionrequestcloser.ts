import { ListElementData, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { createStatusWindow, currentPageName, deletePage, getContent, today } from "../utils/utils";

let Window: SimpleWindowInstance;

const closureOptions: string[] = ['Mantener', 'Borrar', 'Otro'];

const DRC = {
    closedDR: {
        top: (veredict: string, comment: string | null): string => {
            return `{{cierracdb-arr}} '''${veredict.toUpperCase}'''. ${comment ? comment + ' ' : ''}~~~~`;
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

function replaceDRTemplate(input: string, replacement: string): string {
    // The string it uses is automatically placed by template at the top of the page when opening a DR
    const templateRegex = /\{\{RETIRA ESTA PLANTILLA CUANDO CIERRES ESTA CONSULTA\|[^\}]+\}\}/;
    return input.replace(templateRegex, replacement);
}

function extractPageTitleFromWikicode(input: string): string | null {
    // Regular expression to match the pattern with variable "=" and capture the content inside the square brackets
    const match = input.match(/=+\s*\[\[(.+?)\]\]\s*=+/);

    // If there's a match, return the captured group (the content inside the brackets)
    return match ? match[1] : null;
}

async function editRequestPage(decision: string, comment: string | null) {
    new Morebits.status("Paso 1", "cerrando la página de la consulta...", "info");
    await new mw.Api().edit(
        currentPageName,
        (revision: any) => ({
            text: replaceDRTemplate(revision.content, DRC.closedDR.top(decision, comment)) + '\n' + DRC.closedDR.bottom,
            summary: `Cierro [[${currentPageName}]] con resultado ${decision.toUpperCase()} mediante [[WP:TL|Twinkle Lite]]`,
            minor: false
        })
    )
}

async function editArticle(decision: string): Promise<void> {
    const content = await getContent(currentPageName);
    const page = extractPageTitleFromWikicode(content);
    if (page) {
        if (decision == 'Borrar') {
            new Morebits.status("Paso 2", "borrando la página original...", "info");
            const reason = `Según resultado de CDB: [[${currentPageName}]]`
            await deletePage(page, true, reason)
        } else {
            new Morebits.status("Paso 2", "editando la página original...", "info");
            await new mw.Api().edit(
                page,
                (revision: any) => ({
                    text: DRC.articlePage.removeTemplate(revision.content),
                    summary: `Elimino plantilla según el resultado de [[${currentPageName}]]: ${decision.toUpperCase()} mediante [[WP:TL|Twinkle Lite]]`,
                    minor: false
                })
            );
            new Morebits.status("Paso 3", "editando la página de discusión...", "info");
            // TODO
        }
    }
}

async function editArticleTalkPage(decision: string) {

}

async function submitMessage(e: Event) {
    const form = e.target;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);

    const decision: string = input.result !== 'Otro' ? input.result : input.otherField;
    const comment: string | null = input.reason ? input.reason : null;

    createStatusWindow(new Morebits.simpleWindow(400, 350));
    new Morebits.status("Paso 1", "editando la página de la consulta", "info");

    console.log(input);

    try {
        await editRequestPage(decision, comment);
        await editArticle(decision);
    } catch (error) {
        new Morebits.status("❌ Se ha producido un error", "Comprueba las ediciones realizadas", "error");
        console.log(`Error: ${error}`);
    }

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
