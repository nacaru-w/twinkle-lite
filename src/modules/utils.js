export const currentPageName = mw.config.get('wgPageName');
export const currentPageNameWithoutUnderscores = currentPageName.replaceAll('_', ' ');
export const currentUser = mw.config.get('wgUserName');
export const relevantUserName = mw.config.get("wgRelevantUserName");
export const currentNamespace = mw.config.get('wgNamespaceNumber');

// Returns the name of the main page from a string including the talk page in it
export function cleansePageName(pageName) {
    if (pageName.startsWith("Discusión:")) {
        return pageName.substring("Discusión:".length);
    }
    return pageName
}

//Formats the window that holds the status messages
// It must receive a Morebit's simplewindow as object
export function createStatusWindow(window) {
    window.setTitle('Procesando acciones');
    let statusdiv = document.createElement('div');
    statusdiv.style.padding = '15px';
    window.setContent(statusdiv);
    Morebits.status.init(statusdiv);
    window.display();
}

// Returns a promise with the name of the user who created the page
export function getCreator() {
    let params = {
        action: 'query',
        prop: 'revisions',
        titles: cleansePageName(currentPageName),
        rvprop: 'user',
        rvdir: 'newer',
        format: 'json',
        rvlimit: 1,
    }
    let apiPromise = new mw.Api().get(params);
    let userPromise = apiPromise.then(function (data) {
        let pages = data.query.pages;
        for (let p in pages) {
            return pages[p].revisions[0].user;
        }
    });

    return userPromise;
}

// Returns a boolean stating whether there's a spot available to create the page (true) or whether it already exists (false)
export function isPageMissing(title) {
    let params = {
        action: 'query',
        titles: title,
        prop: 'pageprops',
        format: 'json'
    };
    let apiPromise = new mw.Api().get(params);
    return apiPromise.then(function (data) {
        let result = data.query.pages
        return result.hasOwnProperty("-1")
    });
}

// Returns the protection status of the page as a string through a query to the mw API
export function getProtectionStatus(pageName) {
    let params = {
        action: 'query',
        prop: 'info',
        inprop: 'protection',
        titles: pageName,
        format: 'json',
    }
    let apiPromise = new mw.Api().get(params);
    let protectionPromise = apiPromise.then((data) => {
        let pages = data.query.pages;
        for (let p in pages) {
            let protectionLevel = pages[p].protection[0]?.level
            switch (protectionLevel) {
                case 'sysop':
                    return 'solo bibliotecarios';
                case 'autoconfirmed':
                    return 'solo usuarios autoconfirmados';
                case 'templateeditor':
                    return 'solo editores de plantillas'
                default:
                    return 'sin protección';
            }
        }
    });

    return protectionPromise;
}

// Get the text content of a page as a string
export function getContent(pageName) {
    let params = {
        action: 'query',
        prop: 'revisions',
        titles: pageName,
        rvprop: 'content',
        rvslots: 'main',
        formatversion: '2',
        format: 'json'
    }

    let apiPromise = new mw.Api().get(params).then(
        ((data) => {
            return data.query.pages[0].revisions[0].slots?.main?.content
        })
    );

    return apiPromise

}