# Twinkle Lite
Twinkle Lite is a script written in Javascript that allows for the automatisation or semi-automatisation of different tasks for users on the Spanish wikipedia. Most of them are maintenance-related.

It mainly uses the [Morebits](https://en.wikipedia.org/wiki/MediaWiki:Gadget-morebits.js) library and [Mediawiki API](https://www.mediawiki.org/wiki/API:Main_page) functionalities. The code is organised in modules and then compiled into one file through [Webpack](https://webpack.js.org/), which is then copied onto a js page on the Spanish Wikipedia [here](https://es.wikipedia.org/wiki/Usuario:Nacaru/twinkle-lite.js).

As of now, the available modules are:
* Page protection: it automatises the task of requesting page protection through eswiki noticeboards.
* Deletion request: it facilitates the creation of deletion requests for articles.

It's inspired by [Twinkle](https://github.com/wikimedia-gadgets/twinkle/) a tool developed by English Wikipedia user [AzaToth](https://en.wikipedia.org/wiki/User:AzaToth) (and many others, at this point!).
