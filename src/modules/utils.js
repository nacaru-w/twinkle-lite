const currentPageName = mw.config.get('wgPageName');
const currentPageNameWithoutUnderscores = currentPageName.replaceAll('_', ' ');

//Creates the window that holds the status messages
function createStatusWindow() {
    let Window = new Morebits.simpleWindow(400, 350);
    Window.setTitle('Procesando acciones');
    let statusdiv = document.createElement('div');
    statusdiv.style.padding = '15px';  // just so it doesn't look broken
    Window.setContent(statusdiv);
    Morebits.status.init(statusdiv);
    Window.display();
}

export {currentPageName, currentPageNameWithoutUnderscores, createStatusWindow};