import { SimpleWindowInstance } from './../types/morebits-types';
import { APIPageResponse, BlockInfoObject, MovePageOptions, PageCreationBasicInfo, ProtectionStatus, Settings } from '../types/twinkle-types'
import { ApiQueryBlocksParams, ApiQueryInfoParams, ApiQueryParams, ApiQueryRevisionsParams } from 'types-mediawiki/api_params'
import { ApiResponse } from 'types-mediawiki/mw/Api';
import { QueryParams } from 'types-mediawiki/mw/Uri';

export const api = new mw.Api()
let cachedSettings: Settings | null = null;

export const currentPageName = mw.config.get('wgPageName');
export const currentPageNameNoUnderscores = currentPageName.replace(/_/g, ' ');
export const currentUser = mw.config.get('wgUserName');
export const relevantUserName = mw.config.get("wgRelevantUserName");
export const currentNamespace: string | number = mw.config.get('wgNamespaceNumber');
export const currentAction = mw.config.get('wgAction');
export const currentSkin = mw.config.get('skin');
export const diffNewId = mw.config.get('wgDiffNewId');
export const userFlags: string[] = mw.config.get('wgUserGroups');
export const isCurrentUserSysop: boolean = userFlags.includes('sysop');
export const isUserInMobileSkin = mw.config.get('skin') == 'minerva';
export const isMainPage: boolean = mw.config.get('wgIsArticle');

export const abbreviatedMonths: { [abbreviation: string]: number } = {
    ene: 1,
    feb: 2,
    mar: 3,
    abr: 4,
    may: 5,
    jun: 6,
    jul: 7,
    ago: 8,
    sep: 9,
    oct: 10,
    nov: 11,
    dic: 12
};

/**
 *  Gets the name of a talk page based on the name of the main page
 * @param mainPageName - The name of the page
 * @returns the name of the talk page associated to the page that was passed
 * as argument
 */
export function getTalkPage(mainPageName: string): string {
    // Define the namespace mappings
    const namespaces: { [key: string]: string } = {
        "Plantilla:": "Plantilla_discusión:",
        "Anexo:": "Anexo_discusión:",
        "Wikipedia:": "Wikipedia_discusión:",
        "Ayuda:": "Ayuda_discusión:",
        "Wikiproyecto:": "Wikiproyecto_discusión:"
    };

    // Check if the page is in the non-main namespaces
    for (const namespace in namespaces) {
        if (mainPageName.startsWith(namespace)) {
            return mainPageName.replace(namespace, namespaces[namespace]);
        }
    }

    // Default case for normal pages (namespace 0)
    return "Discusión:" + mainPageName;
}

/**
 * Queries the mw API to obtain the namespace of a page given its name
 * 
 * @param pageName 
 * @returns the namespace that corresponds to the given page or null if it can't be found
 */
export async function getPageNamespace(pageName: string): Promise<number | null> {
    const params: ApiQueryInfoParams = {
        action: 'query',
        format: 'json',
        titles: pageName,
        prop: 'info',
    }

    const data = await api.get(params);
    const pages = data.query.pages;
    for (let p in pages) {
        const namespace: number = pages[p].ns;
        return namespace
    }

    return null
}

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
    const response = await api.get(params);
    const pages = response.query.pages;
    for (let p in pages) {
        return pages[p].revisions[0].user;
    }

    return null;
}

export async function getPageCreationInfo(pagename: string): Promise<PageCreationBasicInfo | null> {
    const firstEditInfo = await getFirstPageEdit(pagename);
    if (firstEditInfo) {
        const obj = {
            author: firstEditInfo.revisions[0].user,
            timestamp: firstEditInfo.revisions[0].timestamp
        }
        return obj
    } else {
        return null
    }
}

/**
 * Returns an object with info of the first edit made to a page
 * 
 * @param pageName - the name of the page to query
 * @returns An object with page info with the following structure:
 * { pageid: number, ns: number, revisions: any[], title: string }
 */
export async function getFirstPageEdit(pageName: string): Promise<APIPageResponse | null> {
    const params: ApiQueryRevisionsParams = {
        action: 'query',
        prop: 'revisions',
        titles: pageName,
        rvdir: 'newer',
        format: 'json',
        rvlimit: 1
    }

    const response = await api.get(params);
    const pages = response.query.pages;
    for (let p in pages) {
        return pages[p];
    }

    return null

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
    const apiPromise = api.get(params);
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
    const apiPromise = api.get(params);
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
 * Fetches the text content of a page or a specific section using the MediaWiki API.
 * 
 * @param pageName - The name of the page to fetch content for.
 * @param sectionNumber - (Optional) The section number or "new" to fetch.
 * @returns A promise that resolves to the section or page content as a string, or null if not found.
 * @throws An error if the API request fails.
 */
export async function getContent(pageName: string, sectionNumber?: string): Promise<string | null> {
    const params: ApiQueryRevisionsParams = {
        action: 'query',
        prop: 'revisions',
        titles: pageName,
        rvprop: 'content',
        rvslots: 'main',
        formatversion: '2',
        format: 'json',
        ...(sectionNumber !== undefined ? { rvsection: sectionNumber } : {}) // 👈 only include if provided
    };

    try {
        const data = await api.get(params);

        const page = data.query?.pages?.[0];
        if (!page || page.missing) return null;

        return page.revisions?.[0]?.slots?.main?.content ?? null;
    } catch (error) {
        console.error('Error fetching page content:', error);
        throw error;
    }
}

/**
 * Edits a page using the MediaWiki API. Optionally, a specific section can be edited.
 * 
 * @param pageName - The name of the page to edit.
 * @param summary - The edit summary.
 * @param newtext - The new text content for the page or section.
 * @param section - (Optional) The section number to edit.
 * @returns A promise that resolves to the API response.
 * @throws An error if the API request fails.
 */
export async function editPage(pageName: string, summary: string, newtext: string, section?: string) {
    const params: QueryParams = {
        action: 'edit',
        title: pageName,
        format: 'json',
        summary: summary,
        text: newtext,
        ...(section !== undefined ? { section: section } : {})
    }

    try {
        const res = await api.postWithToken('csrf', params);
        return res
    } catch (error) {
        console.error('Error editing the page:', error);
        throw error;
    }

}


/**
 * Deletes a page (and, optionally, its associated talk page) given its Wikipedia name
 * 
 * @param pageName - The name of the page to be deleted
 * @param deleteTalk - A boolean indicating if the associated talk page must be deleted too
 */
export async function deletePage(pageName: string, deleteTalk: boolean, reason?: string): Promise<void> {
    let params: any = {
        action: 'delete',
        title: pageName,
        format: 'json',
        deletetalk: deleteTalk
    }

    if (reason !== undefined) {
        params.reason = reason
    }

    try {
        const responseData = await api.postWithToken('csrf', params)
    } catch (error) {
        console.error('Error deleting the page:', error);
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
export function parseTimestamp(timeStamp: string): string {
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }
    const date = new Date(timeStamp);
    return date.toLocaleDateString('es-ES', options)
}

export const today: string = parseTimestamp(todayAsTimestamp());

/**
 * Converts a Date object to ISO timestamp format
 * 
 * @param date - A date object
 * @returns The date object converted to ISO timestamp format (string)
 */
export function convertDateToISO(date: Date): string {
    return date.toISOString();
}

/**
 * Takes two ISO timestamps and returns the time difference between them in days and hours
 * 
 * @param olderTimestamp - The timestamp corresponding to the oldest time
 * @param newerTimestamp - The timestamp corresponding to the newest time
 * @returns The time difference between timestamps as an object
 */
export function calculateTimeDifferenceBetweenISO(olderISO: string, newerISO: string): { days: number, hours: number } {
    const olderTimestamp = new Date(olderISO).getTime();
    const newerTimestamp = new Date(newerISO).getTime();

    const differenceInMilliseconds = newerTimestamp - olderTimestamp;

    // Convert milliseconds to days and hours
    const millisecondsInADay = 24 * 60 * 60 * 1000;
    const millisecondsInAnHour = 60 * 60 * 1000;

    const days = Math.floor(differenceInMilliseconds / millisecondsInADay);
    const remainingMillisecondsAfterDays = differenceInMilliseconds % millisecondsInADay;
    const hours = Math.floor(remainingMillisecondsAfterDays / millisecondsInAnHour);

    return { days, hours };
}

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

export async function checkIfOpenDR(pagename: string): Promise<boolean | void> {
    const content = await getContent(pagename);
    if (content) {
        return !content.includes('{{cierracdb-arr}}')
    }
}

export async function getBlockInfo(username: string): Promise<BlockInfoObject | null> {
    // TODO: implement IP range with bkip, see https://www.mediawiki.org/wiki/API:Blocks
    const params: ApiQueryBlocksParams = {
        action: "query",
        list: "blocks",
        bkusers: username,
        bklimit: 1,
        bkprop: ["timestamp", "expiry", "reason", "range", "flags"].join('|') as any,
        format: "json"
    }
    const response = await api.get(params);
    const blocks = response?.query?.blocks;
    if (blocks.length) {
        return {
            blockStart: blocks[0].timestamp,
            blockEnd: blocks[0].expiry,
            reason: blocks[0].reason,
        }
    } else {
        return null
    }
}

/**
 * Fetches the user settings from local storage or the user's wiki configuration subpage.
 * 
 * @returns the object containing the user settings
 */
export async function getConfigPage(): Promise<Settings | null> {
    if (cachedSettings) {
        return cachedSettings;
    }

    const localStorageSettings: string | null = localStorage.getItem("TwinkleLiteUserSettings");
    if (localStorageSettings) {
        cachedSettings = JSON.parse(localStorageSettings);
        return cachedSettings;
    } else {
        try {
            const onWikiSettings = await getContent(`Usuario:${currentUser}/twinkle-lite-settings.json`);
            if (onWikiSettings) {
                cachedSettings = JSON.parse(onWikiSettings);
                return cachedSettings;
            }
        } catch (error) {
            console.error("Hubo un error cargando las preferencias", error);
            return null;
        }
    }
    return null;
}

export async function movePage(original: string, options: MovePageOptions) {

    const params: any = {
        action: 'move',
        from: original,
        to: options.destination,
        reason: options.reason || 'Traslado realizado con [[WP:Twinkle Lite|Twinkle Lite]]',
        movetalk: options.moveTalk || true,
        noredirect: options.removeRedirect,
        watchlist: options.watch ? 'watch' : undefined,
        format: 'json'
    }

    try {
        const response = await api.postWithToken('csrf', params);
        return response;
    } catch (error) {
        console.error('Error moving the page:', error);
        return null
    }
}

export async function createPage(page: string, content: string, summary: string): Promise<ApiResponse> {
    const response = await api.create(
        page,
        { summary: summary },
        content
    )
    return response
}

/**
 * Shows a confirmation dialog with a custom message if the user has enabled
 * the corresponding setting in the configuration page.
 * 
 * @param message - The message to be shown in the confirmation dialog.
 * @returns a boolean indicating if the user confirmed or not
 */
export function showConfirmationDialog(message: string): boolean {
    if (cachedSettings?.askConfirmationCheckbox) {
        return confirm(message);
    }
    return true
}

/**
 * Replaces all underscores in a given text with spaces
 * @param text - The text in which underscores will be replaced by spaces
 * @returns 
 */
export function removeUnderscores(text: string): string {
    return text.replace(/_/g, ' ');
}

/** Extracts the title of a noticeboard from its site link.
 * 
 * @param noticeboardSiteLink - The site link of the noticeboard (e.g., "/Archivo/Nombre_del_tablón/Actual").
 * @returns The title of the noticeboard with underscores replaced by spaces, or `null` if not found.
 */
export function extractNoticeboardTitle(noticeboardSiteLink: string): string | null {
    const match = noticeboardSiteLink.match(/\/Archivo\/(.*?)\/Actual/);
    return match ? removeUnderscores(match[1]) : null;
}