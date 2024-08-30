import { SimpleWindowInstance } from './../types/morebits-types';
import { ProtectionStatus } from '../types/twinkle-types'
import { ApiQueryInfoParams, ApiQueryParams, ApiQueryRevisionsParams } from 'types-mediawiki/api_params'

export const currentPageName = mw.config.get('wgPageName');
export const currentPageNameNoUnderscores = currentPageName.replace(/_/g, ' ');
export const currentUser = mw.config.get('wgUserName');
export const relevantUserName = mw.config.get("wgRelevantUserName");
export const currentNamespace: string | number = mw.config.get('wgNamespaceNumber');
export const currentAction = mw.config.get('wgAction');
export const currentSkin = mw.config.get('skin');
export const diffNewId = mw.config.get('wgDiffNewId');

/**
 * Extracts the main page name from a string that may include a talk page prefix.
 * 
 * @param pageName - The full page name, which may start with a talk page prefix like "Discusión:".
 * @returns The main page name, excluding the talk page prefix if present.
 */
export function stripTalkPagePrefix(pageName: string): string {
    if (pageName.startsWith("Discusión:")) {
        return pageName.substring("Discusión:".length);
    }
    return pageName;
}

/**
 * Configures and displays a status window using a Morebits' simplewindow object.
 * 
 * @param window - A Morebits' simplewindow object that will be configured and displayed.
 */
export function createStatusWindow(window: any): void {
    window.setTitle('Procesando acciones');
    let statusdiv: HTMLDivElement = document.createElement('div');
    statusdiv.style.padding = '15px';
    window.setContent(statusdiv);
    Morebits.status.init(statusdiv);
    window.display();
}

/**
 * Retrieves the username of the creator of the current page using the MediaWiki API.
 * 
 * @returns A promise that resolves to the username of the creator of the page, or `null` if the creator cannot be determined.
 */
export async function getCreator(): Promise<string | null> {
    const params: ApiQueryRevisionsParams = {
        action: 'query',
        prop: 'revisions',
        titles: currentPageName,
        rvprop: 'user',
        rvdir: 'newer',
        format: 'json',
        rvlimit: 1,
    }
    const apiPromise = new mw.Api().get(params);
    const data = await apiPromise
    const pages = data.query.pages;
    for (let p in pages) {
        return pages[p].revisions[0].user;
    }

    return null;
}

/**
 * Checks if a specified page is missing or does not exist using the MediaWiki API.
 * 
 * @param title - The title of the page to check.
 * @returns A promise that resolves to `true` if the page is missing, or `false` if it exists.
 */
export async function isPageMissing(title: string): Promise<boolean> {
    const params: ApiQueryParams = {
        action: 'query',
        titles: title,
        prop: 'pageprops',
        format: 'json'
    };
    const apiPromise = new mw.Api().get(params);
    const data = await apiPromise;
    const result = data.query.pages;
    return Object.prototype.hasOwnProperty.call(result, "-1");
}

/**
 * Fetches the protection status of a specified page using the MediaWiki API.
 * 
 * @param pageName - The name of the page to fetch protection status for.
 * @returns A promise that resolves to an object containing the protection level and expiry date.
 */
export async function getProtectionStatus(pageName: string): Promise<ProtectionStatus> {
    const interfaceExtensions = ['.js', '.css', '.json'];
    if (currentNamespace == 8 || interfaceExtensions.some(ext => pageName.endsWith(ext))) {
        return {
            level: 'solo administradores de interfaz',
            expiry: ''
        }
    }

    const params: ApiQueryInfoParams = {
        action: 'query',
        prop: 'info',
        inprop: 'protection',
        titles: pageName,
        format: 'json',
    }
    const apiPromise = new mw.Api().get(params);
    const data = await apiPromise;
    const pages = data.query.pages;
    let object: ProtectionStatus = {
        level: 'sin protección',
        expiry: ''
    };
    for (let p in pages) {
        for (let info of pages[p].protection) {
            if (info?.type == 'move') {
                continue;
            } else {
                const protectionLevel = info?.level;
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
                if (info?.expiry) {
                    const expiryTimeStamp = pages[p].protection[0]?.expiry;
                    object.expiry = expiryTimeStamp;
                }
            }
        }
    }
    return object;
}

/**
 * Fetches the text content of a specified page using the MediaWiki API.
 * 
 * @param pageName - The name of the page to fetch content for.
 * @returns A promise that resolves to the page content as a string, or undefined if not found.
 * @throws An error if the API request fails.
 */
export async function getContent(pageName: string): Promise<string> {
    const params: ApiQueryRevisionsParams = {
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
        const data = await apiPromise;
        return data.query.pages[0].revisions[0].slots?.main?.content;
    } catch (error) {
        console.error('Error fetching page content:', error);
        throw error;
    }
}

/**
 * Finds today's date and returns it as a timestamp
 * @returns today's date as timestamp
 */
export function todayAsTimestamp(): string {
    const today = new Date();
    const timestamp = today.getTime().toString();

    return timestamp
}

/**
 * Parses a timestamp string and returns it formatted as a localized date string in Spanish.
 * 
 * @param timeStamp - The timestamp string to be parsed.
 * @returns A formatted date string in the format "day month year" in Spanish locale.
 */
export function parseTimeStamp(timeStamp: string): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const date = new Date(timeStamp);
    return date.toLocaleDateString('es-ES', options)
}

export const today: string = parseTimeStamp(todayAsTimestamp());

export function finishMorebitsStatus(window: SimpleWindowInstance, statusWindow: SimpleWindowInstance, status: 'finished' | 'error', refresh?: boolean): void {
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
    } else if (!refresh && status !== 'error') {
        setTimeout(() => {
            statusWindow.close();
            window.close();
        }, 2500);
    }

}