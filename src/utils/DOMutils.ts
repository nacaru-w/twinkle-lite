import { createNoticeboardResolutionWindow } from "./../modules/noticeboardresolution";
import { createBlockAppealsWindow } from "./../modules/blockappeals";
import { createDRCFormWindow } from "./../modules/deletionrequestcloser";
import { currentPageName, diffNewId } from "./../utils/utils";

export function createHideButton(callbackFn: (arg: string) => void) {
    if (!document.querySelector('.TL-hide-button')) {
        const parentElement = document.querySelector('.mw-diff-undo')?.parentElement;
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
    const usersNodeList = document.querySelectorAll('a.mw-usertoollinks-talk');
    if (usersNodeList) {
        usersNodeList.forEach((element) => {
            if (element) {
                const firstParentElement = element.parentElement;
                if (firstParentElement) {
                    if (firstParentElement.querySelector('a.extiw')) {
                        return;
                    }
                    const newElement = document.createElement('span');
                    newElement.textContent = ' · ';
                    const elementChild = document.createElement('a');
                    elementChild.id = buttonId;
                    elementChild.textContent = buttonText;
                    elementChild.style.color = buttonColor;
                    elementChild.addEventListener('click', () => {
                        let username;
                        // Always using the special page name logic
                        if (currentPageName === "Especial:PáginasNuevas") {
                            username = element.closest('.mw-usertoollinks')!.parentElement?.querySelector('.mw-userlink, .history-user .mw-userlink')
                                ?.textContent
                                ?.trim();
                        } else {
                            username = element.closest('.mw-usertoollinks')!.parentElement?.parentElement?.querySelector('.mw-userlink, .history-user .mw-userlink')
                                ?.textContent
                                ?.trim();
                        }
                        if (username) {
                            callbackFn(username);
                        }
                    });
                    newElement.append(elementChild);
                    const firstParentNode = element.parentNode;
                    if (firstParentNode) {
                        firstParentNode.insertBefore(newElement, element.nextSibling);
                    }
                }
            }
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

function getIdFromFirstChild(element: HTMLElement): string | null {
    if (element.firstElementChild && element.firstElementChild.id) {
        return element.firstElementChild.id;
    }
    return null;
}

function createNoticeboardResolutionButton(element: HTMLElement) {
    const closestHeadingEl = findClosestPreviousHeading(element);
    const id = closestHeadingEl ? getIdFromFirstChild(closestHeadingEl) : null;
    if (id) {
        const button = oouiButton(
            'Resolver petición',
            () => createNoticeboardResolutionWindow(id),
        );
        element.appendChild(button.$element[0]);
    }
}

export function createNoticeboardResolutionButtons() {
    mw.loader.using(['oojs-ui-core', 'oojs-ui-widgets']).done(() => {
        const elements: HTMLParagraphElement[] = Array.from(
            document.querySelectorAll("p")
        ).filter(
            (el): el is HTMLParagraphElement =>
                el.textContent?.trim() === "(a rellenar por un bibliotecario)"
        );

        elements.forEach(el => {
            el.textContent = ""; // Clear the text content
            createNoticeboardResolutionButton(el);
        });
    });
}
