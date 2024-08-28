import { currentPageName, diffNewId } from "./../utils/utils";

export function createHideButton(callbackFn: (arg: string) => void) {
    const parentElement = document.querySelector('.mw-diff-uno')?.parentElement;
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
                            username = firstParentElement.parentElement!.querySelector('bdi')!.innerText;
                        } else {
                            username = firstParentElement.parentElement!.parentElement!.querySelector('bdi')!.innerText;
                        }
                        callbackFn(username);
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
