mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.js&action=raw&ctype=text/javascript');
mw.loader.load('https://en.wikipedia.org/w/index.php?title=MediaWiki:Gadget-morebits.css&action=raw&ctype=text/css', 'text/css');

console.log("Loading test file...");

function createWindow() {
    let Window = new Morebits.simpleWindow(300, 200);
    Window.setTitle('Mensaje');
    element = Morebits.htmlNode("div", "Prueba")
    var statusdiv = document.createElement('div');
    statusdiv.style.padding = '15px';  // just so it doesn't look broken
    Window.setContent(statusdiv);
    Morebits.status.init(statusdiv);
    new Morebits.status("Ojito", "Información", "status");
    new Morebits.status("Ojito", "Información", "error");
    Window.display();
}

if (mw.config.get('wgNamespaceNumber') < 0 || !mw.config.get('wgArticleId')) {
    console.log("Special or non-existent page: DRM will therefore not be loaded.");
} else {
    let portletLink = mw.util.addPortletLink('p-cactions', '#', 'Test', 'example-button', 'Test');
    portletLink.onclick = createWindow;
}
