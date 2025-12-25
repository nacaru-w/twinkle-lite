import { ListElementData, QuickFormInputObject, SimpleWindowInstance } from "types/morebits-types";
import { api, calculateTimeDifferenceBetweenISO, createStatusWindow, currentPageName, currentPageNameNoUnderscores, deletePage, finishMorebitsStatus, getContent, getTalkPage, isPageMissing, showConfirmationDialog } from "../utils/utils";
import { spanishMonths } from "./../utils/maps";
import { convertDateToISO, parseTimestamp } from "./../utils/dateUtils";
import { DeletionRequestData } from "types/twinkle-types";

let Window: SimpleWindowInstance;
let nominatedPage: string;
let requestData: DeletionRequestData | null;

const closureOptions: string[] = ['Mantener', 'Borrar', 'Borrar con excepciones', 'Neutralizar', 'Fusionar', 'Trasladar', 'Suspendida', 'Cancelada', 'Archivada', 'Otro'];

const DRC = {
    closedDR: {
        top: (veredict: string, comment: string | null): string => {
            return `${veredict.toUpperCase()}${comment ? `|cc=${comment} ~~~~` : ''}`;
        },
        bottom: '{{cierreCdb|{{safesubst:TESParam}}}}'
    },
    talkPage: async (veredict: string, requestData: DeletionRequestData) => {
        return `{{cdbpasada|página=${currentPageName}|fecha=${parseTimestamp(requestData.dateOpened)}}|resultado='''${veredict}'''}}`
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

export function extractDeletionRequestData(text: string): DeletionRequestData | null {
    const regex =
        /\{\{actualCdb\|[^|]*\|(\d{4})\|(\w+)\|(\d{1,2})\|\-\|(\d{4})\|(\w+)\|(\d{1,2})\|/i;

    const match = text.match(regex);
    if (!match) return null;

    const [, openYear, openMonthName, openDay, lastYear, lastMonthName, lastDay,] = match;

    const openMonth = spanishMonths[openMonthName.toLowerCase()];
    const lastMonth = spanishMonths[lastMonthName.toLowerCase()];

    if (!openMonth || !lastMonth) return null;

    const openedDate = new Date(Date.UTC(
        Number(openYear),
        openMonth - 1,
        Number(openDay)
    ));

    const lastPostponedDate = new Date(Date.UTC(
        Number(lastYear),
        lastMonth - 1,
        Number(lastDay)
    ));

    // Days since opening (now - opened)
    const nowUtc = new Date();
    const diffOpenedMs = nowUtc.getTime() - openedDate.getTime();
    const daysElapsedSinceOpened = Math.floor(
        diffOpenedMs / (1000 * 60 * 60 * 24)
    );

    // Postponements
    const diffPostponedMs =
        lastPostponedDate.getTime() - openedDate.getTime();
    const diffPostponedDays = Math.floor(
        diffPostponedMs / (1000 * 60 * 60 * 24)
    );

    const timesPostponed =
        diffPostponedDays > 0 ? Math.floor(diffPostponedDays / 14) : 0;

    return {
        dateOpened: openedDate.toISOString(),
        timesPostponed,
        daysElapsedSinceOpened,
        lastPostponed:
            timesPostponed === 0 ? null : lastPostponedDate.toISOString(),
    };
}



function showCreationDateAndTimeElapsed(): void {
    if (!requestData) return;

    const span = document.querySelector(
        "div[name='timeElapsedFromDRCreation'] > span.quickformDescription"
    );
    if (!span) return;

    const timeElapsed = calculateTimeDifferenceBetweenISO(
        requestData.lastPostponed || requestData.dateOpened,
        convertDateToISO(new Date())
    );

    const isPostponable = timeElapsed.days >= 14;

    const format = {
        emoji: isPostponable ? '✔️' : '❌',
        color: isPostponable
            ? 'var(--color-destructive--focus);'
            : 'var(--color-destructive);',
    };

    const statusText =
        requestData.timesPostponed > 0
            ? `prorrogada por última vez`
            : 'abierta';

    span.innerHTML = `
        ${format.emoji} CDB ${statusText} el ${parseTimestamp(requestData.lastPostponed || requestData.dateOpened)}:
        <span style="font-weight: bold; color: ${format.color};">
            hace ${timeElapsed.days} días y ${timeElapsed.hours} horas
        </span>
    `;

    if (isPostponable) {
        showPostponeCheckbox();
    }
}


async function fetchCreationOrProrrogationDate(): Promise<void> {
    const pageContent = await getContent(currentPageName);
    if (!pageContent) return;

    requestData = extractDeletionRequestData(pageContent);
    if (!requestData) return;

    showCreationDateAndTimeElapsed();
}


function manageOtherInputField(selectedOption: string): void {
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

export function replaceDRTemplate(pageContent: string, replacement: string): string {
    // The string it uses is automatically placed by template at the top of the page when opening a DR
    return pageContent.replace(
        /\|(\s*ABIERTA\s*)/,
        `|${replacement}`
    );
}

function extractNominatedPage(pageTitle: string): string {
    return pageTitle
        // remove the CDB prefix
        .replace(/^Wikipedia:Consultas_de_borrado\//, '')
        // remove trailing _(n.ª consulta)
        .replace(/_\(\d+\.ª consulta\)$/, '');
}

async function editRequestPage(decision: string, comment: string | null) {
    new Morebits.status("Paso 1", "cerrando la página de la consulta...", "info");
    await api.edit(
        currentPageName,
        (revision: any) => ({
            text: replaceDRTemplate(revision.content, DRC.closedDR.top(decision, comment)) + '\n' + DRC.closedDR.bottom,
            summary: `Cierro [[${currentPageName}|consulta de borrado]] con resultado ${decision.toUpperCase()}, mediante [[WP:TL|Twinkle Lite]]`,
            minor: false
        })
    )
}

async function editArticle(decision: string): Promise<void> {
    const page = extractNominatedPage(currentPageName);
    if (page) {
        nominatedPage = page;
        if (decision == 'Borrar') {
            new Morebits.status("Paso 2", "borrando la página original...", "info");
            const reason = `Según resultado de CDB: [[${currentPageNameNoUnderscores}]]`
            await deletePage(page, true, reason)
        } else {
            new Morebits.status("Paso 2", "editando la página original...", "info");
            await api.edit(
                page,
                (revision: any) => ({
                    text: DRC.articlePage.removeTemplate(revision.content),
                    summary: `Elimino plantilla según el resultado de [[${currentPageName}|la consulta de borrado]]: ${decision.toUpperCase()}; mediante [[WP:TL|Twinkle Lite]]`,
                    minor: false
                })
            );
        }
    }
}

async function addPostponeTemplate() {
    new Morebits.status("Paso 1", "añadiendo plantilla para posponer la consulta...", "info");
    await api.edit(
        currentPageName,
        (revision: any) => ({
            text: revision.content + "\n\n{{sust:prorrogar}}",
            summary: "Prorrogando CDB mediante [[WP:TL|Twinkle Lite]]",
            minor: false
        })
    )
}

async function editArticleTalkPage(decision: string): Promise<void> {
    if (decision == 'Borrar') return;
    const talkPage = getTalkPage(nominatedPage);
    new Morebits.status("Paso 3", 'editando la página de discusión...', "info");
    const template = await DRC.talkPage(decision, requestData!);
    if (await isPageMissing(talkPage)) {
        await api.create(
            talkPage,
            { summary: `Creando página de discusión tras cierre de [[${currentPageName}|consulta de borrado]] mediante [[WP:TL|Twinkle Lite]]` },
            template
        )
    } else {
        await api.edit(
            talkPage,
            (revision: any) => ({
                text: template + '\n' + revision.content,
                summary: `Editando página de discusión tras cierre de [[${currentPageName}|consulta de borrado]] mediante [[WP:TL|Twinkle Lite]]`,
                minor: false
            })
        )
    }
}

function confirmIfLessThan14Days(): boolean {
    if (requestData && requestData?.daysElapsedSinceOpened <= 14) {
        return confirm(`Han pasado solo ${requestData?.daysElapsedSinceOpened} días desde que se abrió la CDB. La política ([[WP:CDB]]) especifica que los debates de las consultas de borrado deben durar 14 días, y su cierre solo se puede producir después de pasado este tiempo. ¿Seguro que quieres cerrarla antes del tiempo establecido?`)
    }
    return true
}

async function submitMessage(e: Event) {
    if (!confirmIfLessThan14Days()) return;
    const form = e.target;
    const input: QuickFormInputObject = Morebits.quickForm.getInputData(form);

    if (showConfirmationDialog(`¿Seguro que quieres ${input.postpone ? 'prorrogar' : 'cerrar'} esta consulta de borrado?`)) {
        const decision: string = input.result !== 'Otro' ? input.result : input.otherField;
        const comment: string | null = input.reason ? input.reason : null;

        const statusWindow: SimpleWindowInstance = new Morebits.simpleWindow(400, 350)
        createStatusWindow(statusWindow);

        if (input.postpone) {
            try {
                await addPostponeTemplate();
                finishMorebitsStatus(Window, statusWindow, 'finished', true);
            } catch (error) {
                finishMorebitsStatus(Window, statusWindow, 'error');
                console.error(`Error: ${error}`);
            }
        } else {
            try {
                await editRequestPage(decision, comment);
                await editArticle(decision);
                await editArticleTalkPage(decision);
                finishMorebitsStatus(Window, statusWindow, 'finished', true);
            } catch (error) {
                finishMorebitsStatus(Window, statusWindow, 'error');
                console.error(`Error: ${error}`);
            }
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

    form.append({
        type: 'submit',
        label: 'Cerrar CBD',
    });

    const result = form.render();
    Window.setContent(result);
    Window.display();

    fetchCreationOrProrrogationDate();
}

