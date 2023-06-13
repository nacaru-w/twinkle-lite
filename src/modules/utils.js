const currentPageName = mw.config.get('wgPageName');
const currentPageNameWithoutUnderscores = currentPageName.replaceAll('_', ' ');
const currentUser = mw.config.get('wgUserName');

//Creates the window that holds the status messages
function createStatusWindow() {
    let Window = new Morebits.simpleWindow(400, 350);
    Window.setTitle('Procesando acciones');
    let statusdiv = document.createElement('div');
    statusdiv.style.padding = '15px';
    Window.setContent(statusdiv);
    Morebits.status.init(statusdiv);
    Window.display();
}

// Returns a promise with the name of the user who created the page
function getCreator() {
    let params = {
        action: 'query',
        prop: 'revisions',
        titles: currentPageName,
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
function isPageMissing(title) {
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

export { currentPageName, currentPageNameWithoutUnderscores, createStatusWindow, getCreator, isPageMissing, currentUser };