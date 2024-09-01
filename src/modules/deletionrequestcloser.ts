import { SimpleWindowInstance } from "types/morebits-types";
import { currentPageName, today } from "utils/utils";

let Window: SimpleWindowInstance;

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

function submitMessage(e: Event) {

}

export function createDRCFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Cerrar consulta de borrado');
    Window.addFooterLink('Política de consultas de borrado', 'Wikipedia:Consultas de borrado mediante argumentación');

    const form = new Morebits.quickForm(submitMessage);

    const result = form.render();
    Window.setContent(result);
    Window.display();

}
