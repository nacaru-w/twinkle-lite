import { createNoticeboardResolutionWindow } from "./../modules/noticeboardresolution";
import { createBlockAppealsWindow } from "./../modules/blockappeals";
import { createDRCFormWindow } from "./../modules/deletionrequestcloser";
import { currentPageName, currentSkin, diffNewId } from "./../utils/utils";
import { NoticeboardRequestInfo, Settings } from "types/twinkle-types";

export function createHideButton(callbackFn: (arg: string) => void) {
    if (!document.querySelector('.TL-hide-button')) {
        const parentElement = document.querySelector('strong>.mw-diff-undo')?.parentElement;
        if (!parentElement) return;

        const tooltip = "Solicita que esta edición se oculte en el TAB";
        const isUserInMobileSkin = mw.config.get('skin') === 'minerva';

        if (isUserInMobileSkin) {
            const oouiBtn = oouiButton('ocultar', () => callbackFn(diffNewId), {
                flags: [], // no OOUI flags
                style: {
                    marginLeft: '5px',
                }
            });

            oouiBtn.$element
                .addClass('TL-hide-button')
                .attr('title', tooltip);

            const container = document.createElement('span');
            container.appendChild(oouiBtn.$element[0]);
            parentElement.appendChild(container);
        } else {
            const hideButton = document.createElement('span');
            hideButton.innerHTML = ` (<a class="TL-hide-button" title="${tooltip}">ocultar</a>)`;
            parentElement.appendChild(hideButton);

            const hideLink = document.querySelector('.TL-hide-button');
            hideLink?.addEventListener('click', () => {
                callbackFn(diffNewId);
            });
        }
    }
}

export function createButton(
    buttonId: string,
    buttonText: string,
    buttonColor: string,
    callbackFn: (arg: string | null) => void
): void {
    function createButtonElement(prefix: string, onClick: () => void): HTMLSpanElement {
        const anchor = document.createElement('a');
        anchor.id = buttonId;
        anchor.textContent = buttonText;
        anchor.style.color = buttonColor;
        anchor.addEventListener('click', onClick);

        const span = document.createElement('span');
        span.textContent = prefix;
        span.append(anchor);
        return span;
    }

    // Minerva skin diff pages
    if (diffNewId && currentSkin === 'minerva') {
        const userNameInAccordion = document.querySelector('.cdx-accordion__header__title>a.mw-userlink>bdi');
        const username = userNameInAccordion?.textContent?.trim() || null;
        if (username) {
            const newElement = createButtonElement('· ', () => callbackFn(username));
            userNameInAccordion!.parentElement?.parentElement?.append(newElement);
        }
        // other skins
    } else {
        document.querySelectorAll('a.mw-usertoollinks-talk').forEach((element) => {
            const firstParentElement = element.parentElement;
            if (!firstParentElement || firstParentElement.querySelector('a.extiw')) return;

            const newElement = createButtonElement(' · ', () => {
                const toollinksParent = element.closest('.mw-usertoollinks')!.parentElement;
                const container = currentPageName === 'Especial:PáginasNuevas'
                    ? toollinksParent
                    : toollinksParent?.parentElement;
                const username = container?.querySelector('.mw-userlink, .history-user .mw-userlink')?.textContent?.trim();
                if (username) callbackFn(username);
            });

            element.parentNode?.insertBefore(newElement, element.nextSibling);
        });
    }
}


export function oouiButton(
    label: string,
    onclickFn: any,
    options?: {
        flags?: string[],
        style?: Partial<CSSStyleDeclaration>  // generic CSS properties
    }
) {
    const button = new OO.ui.ButtonWidget({
        label: label,
        flags: options?.flags ?? ['primary', 'progressive']
    });

    button.on('click', onclickFn);

    if (options?.style) {
        // Apply all style properties from the object to the button's root element
        Object.entries(options.style).forEach(([key, value]) => {
            // key is camelCase like 'marginInline', 'backgroundColor', etc.
            if (value) {
                // @ts-ignore to bypass TypeScript strictness on CSSStyleDeclaration
                button.$element.css(key, value);
            }
        });
    }

    return button;
}

export function createBlockAppealsButton(appealBox: Element) {
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    mw.loader.using(['oojs-ui-core', 'oojs-ui-widgets']).done(() => {
        const button = oouiButton('Resolver apelación de bloqueo', createBlockAppealsWindow)
        container.append(button.$element[0])
        appealBox.prepend(container)
    });

}

export function createDRCButton(textBox: Element) {
    const container = document.createElement('div');
    container.style.textAlign = 'center';
    container.style.marginBlock = '0.5em';
    mw.loader.using(['oojs-ui-core', 'oojs-ui-widgets']).done(() => {
        // Create the button using OOUI
        const button = oouiButton('Cerrar consulta de borrado', createDRCFormWindow)
        container.append(button.$element[0])
        textBox.prepend(container)
    });
}

function findClosestPreviousHeading(element: HTMLElement): HTMLElement | null {
    let sibling = element.previousElementSibling;

    while (sibling) {
        if (sibling.matches('div.mw-heading')) {
            return sibling as HTMLElement;
        }
        sibling = sibling.previousElementSibling;
    }

    return null;
}

function extractNoticeboardSectionInfo(element: HTMLElement): NoticeboardRequestInfo | null {

    // We extract the anchor first
    const anchor = extractAnchorFromSection(element)!;

    // Find the link inside the edit section span
    const link = element.querySelector<HTMLAnchorElement>('.mw-editsection a');
    if (!link) return null;

    // Parse the URL to extract ?section=...
    const url = new URL(link.href, window.location.origin);
    const section = url.searchParams.get('section');
    if (!section) return null;

    // Extract the section title text (the <h2> heading text)
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    const title = heading ? heading.textContent?.trim() ?? '' : '';

    // Return both title and section number (converted to number if numeric)
    const sectionNumber = /^\d+$/.test(section) ? Number(section) : section;

    return { title, sectionNumber, anchor };
}


function getIdFromFirstChild(element: HTMLElement): string | null {
    if (element.firstElementChild && element.firstElementChild.id) {
        return element.firstElementChild.id;
    }
    return null;
}

function createNoticeboardResolutionButton(element: HTMLElement, useAdminTabTemplate: boolean) {
    const closestHeadingEl = findClosestPreviousHeading(element);
    const sectionInfo = closestHeadingEl ? extractNoticeboardSectionInfo(closestHeadingEl) : null;
    if (sectionInfo) {
        const button = oouiButton(
            'Resolver petición',
            () => createNoticeboardResolutionWindow(sectionInfo, useAdminTabTemplate),
        );
        element.appendChild(button.$element[0]);
    }
}

export function createNoticeboardResolutionButtons(settings: Settings | null) {
    const useAdminTabTemplate = settings?.useAdmintabTemplateCheckbox ?? true;
    mw.loader.using(['oojs-ui-core', 'oojs-ui-widgets']).done(() => {
        const elements: HTMLParagraphElement[] = Array.from(
            document.querySelectorAll("p")
        ).filter(
            (el): el is HTMLParagraphElement =>
                el.textContent?.trim() === "(a rellenar por un bibliotecario)"
        );

        elements.forEach(el => {
            el.textContent = ""; // Clear the text content
            createNoticeboardResolutionButton(el, useAdminTabTemplate);
        });
    });
}

export function extractAnchorFromSection(sectionElement: HTMLElement): string | null {
    const anchorTag = sectionElement?.querySelector('h2')?.id
    return anchorTag || null
}