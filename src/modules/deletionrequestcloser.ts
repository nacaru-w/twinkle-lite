import { ListElementData, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { abbreviatedMonths, api, calculateTimeDifferenceBetweenISO, convertDateToISO, createStatusWindow, currentPageName, deletePage, finishMorebitsStatus, getContent, getPageCreationInfo, parseTimestamp, today, todayAsTimestamp } from "../utils/utils";

let Window: SimpleWindowInstance;

const closureOptions: string[] = ['Mantener', 'Borrar', 'Otro'];
let timeElapsed: { days: number, hours: number };

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
        return { type: 'option', value: e, label: e };
    })
}

function changeSubmitButtonName(checked: boolean): void {
    const button = document.querySelector('button.submitButtonProxy');
    if (button) {
        button.innerHTML = checked ? 'Prorrogar CDB' : 'Cerrar CDB';
    }
}

function changeSelectMenuStatus(checked: boolean): void {
    const selectMenu = document.getElementById('CDBResultSelectMenu') as HTMLSelectElement;
    if (selectMenu) {
        selectMenu.disabled = checked;
    }
}

function showPostponeCheckbox(): void {
    const box = document.getElementById('DRMPostponeBox');
    if (box) {
        box.style.display = 'block';
    }
}

function findLastPostponementDate(text: string): string | null {
    // Regular expression to match the "Prorrogada para generar más discusión..." and capture the date
    const prorrogarRegex = /'''Prorrogada para generar más discusión.*?(\d{1,2})\s*(\w+)\s*(\d{4}) \(UTC\)/gi;

    let match: RegExpExecArray | null;
    let lastDate: Date | null = null;

    // Search for all occurrences of the phrase in the text
    while ((match = prorrogarRegex.exec(text)) !== null) {
        const [day, monthName, year] = [match[1], match[2].toLowerCase(), match[3]];

        // Convert month name to a number
        const month = abbreviatedMonths[monthName];
        if (!month) continue;

        // Create a date object from the captured values
        const currentDate = new Date(parseInt(year), month - 1, parseInt(day));

        // Keep the latest date
        if (!lastDate || currentDate > lastDate) {
            lastDate = currentDate;
        }
    }

    // Return the latest date in ISO format, or null if no templates were found
    return lastDate ? lastDate.toISOString() : null;
}

function showCreationDateAndTimeElapsed(creationDateAsTimestamp: string, prorroga: boolean): void {
    const span = document.querySelector("div[name='timeElapsedFromDRCreation'] > span.quickformDescription");
    if (span) {
        timeElapsed = calculateTimeDifferenceBetweenISO(creationDateAsTimestamp, convertDateToISO(new Date()));
        const format = {
            emoji: timeElapsed.days >= 14 ? '✔️' : '❌',
            color: timeElapsed.days >= 14 ? 'var(--color-destructive--focus);' : 'var(--color-destructive);',
        }
        span.innerHTML = `${format.emoji} CDB ${prorroga ? 'prorrogada' : 'abierta'} el ${parseTimestamp(creationDateAsTimestamp)}: <span style="font-weight: bold; color: ${format.color};">hace ${timeElapsed.days} días y ${timeElapsed.hours} horas</span>`;
    }
    if (timeElapsed.days > 14) {
        showPostponeCheckbox();
    }
}

async function fetchCreationOrProrrogationDate(): Promise<void> {
    const pageContent = await getContent(currentPageName);
    const lastPostponement = findLastPostponementDate(pageContent);
    console.log(lastPostponement);
    debugger;
    if (lastPostponement) {
        console.log("última prórroga:", lastPostponement)
        showCreationDateAndTimeElapsed(lastPostponement, true);
    } else {
        const creationInfo = await getPageCreationInfo(currentPageName);
        if (creationInfo) {
            showCreationDateAndTimeElapsed(creationInfo?.timestamp, false);
        }
    }
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
    await api.edit(
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
            await api.edit(
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

async function addPostponeTemplate() {
    new Morebits.status("Paso 2", "añadiendo plantilla para posponer la consulta...", "info");
    await api.edit(
        currentPageName,
        (revision: any) => ({
            text: revision.content + "\n\n{{sust:prorrogar}}",
            summary: "Prorrogando CDB mediante [[WP:TL|Twinkle Lite]]",
            minor: false
        })
    )
}

async function editArticleTalkPage(decision: string) {
    // TODO
}

function confirmIfLessThan14Days(): boolean {
    if (timeElapsed.days <= 14) {
        return confirm(`Han pasado solo ${timeElapsed.days} días desde que se abrió la CDB. La política ([[WP:CDB]]) especifica que los debates de las consultas de borrado deben durar 14 días, y su cierre solo se puede producir después de pasado este tiempo. ¿Seguro que quieres cerrarla antes del tiempo establecido?`)
    }
    return true
}

async function submitMessage(e: Event) {
    if (!confirmIfLessThan14Days()) return;
    const form = e.target;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);

    const decision: string = input.result !== 'Otro' ? input.result : input.otherField;
    const comment: string | null = input.reason ? input.reason : null;

    const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350)
    createStatusWindow(statusWindow);
    new Morebits.status("Paso 1", "editando la página de la consulta", "info");

    console.log(input);
    debugger;
    if (input.postpone) {
        try {
            await addPostponeTemplate();
        } catch (error) {
            finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(`Error: ${error}`);
        }
    } else {
        try {
            await editRequestPage(decision, comment);
            await editArticle(decision);
        } catch (error) {
            finishMorebitsStatus(Window, statusWindow, 'error');
            console.error(`Error: ${error}`);
        }
    }


}

export function createDRCFormWindow() {
    Window = new Morebits.simpleWindow(620, 530);

    Window.setScriptName('Twinkle Lite');
    Window.setTitle('Cerrar consulta de borrado');
    Window.addFooterLink('Política de consultas de borrado', 'Wikipedia:Consultas de borrado mediante argumentación');

    const form = new Morebits.quickForm(submitMessage);

    const timeElapsedField = form.append({
        type: 'field',
        label: 'Estado de la consulta:'
    })

    timeElapsedField.append({
        type: 'div',
        name: 'timeElapsedFromDRCreation',
        label: '⌛️ Cargando...'
    })

    timeElapsedField.append({
        type: 'checkbox',
        id: 'DRMPostponeBox',
        list:
            [{
                name: "postpone",
                value: "postpone",
                label: "Prorrogar CDB",
                checked: false,
                tooltip: "Marca esta casilla para prorrogar la CDB durante otros 14 días",
                event: (e: any) => {
                    changeSubmitButtonName(e.target.checked);
                    changeSelectMenuStatus(e.target.checked);
                }
            }],
        style: 'display: none;'
    })

    form.append({
        type: 'select',
        id: 'CDBResultSelectMenu',
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

    const submitButton = form.append({
        type: 'submit',
        label: 'Cerrar CBD',
    });

    submitButton.append({
        type: 'button',
        label: 'Prorrogar CDB'
    })

    const result = form.render();
    Window.setContent(result);
    Window.display();

    fetchCreationOrProrrogationDate();
}

