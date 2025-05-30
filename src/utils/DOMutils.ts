import { createBlockAppealsWindow } from "./../modules/blockappeals";
import { createDRCFormWindow } from "./../modules/deletionrequestcloser";
import { currentPageName, diffNewId } from "./../utils/utils";

export function createHideButton(callbackFn: (arg: string) => void) {
    if (!document.querySelector('.TL-hide-button')) {
        const parentElement = document.querySelector('.mw-diff-undo')?.parentElement;
        if (parentElement) {
            const hideButton = document.createElement('span');
            const tooltip: string = "Solicita que esta edición se oculte en el TAB";
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

export function oouiButton(label: string, onclickFn: any) {
    const button = new OO.ui.ButtonWidget({
        label: label,
        flags: [
            'primary',
            'progressive'
        ]
    });
    button.on('click', onclickFn)
    return button
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