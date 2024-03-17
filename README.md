# Twinkle Lite
[Twinkle Lite](https://es.wikipedia.org/wiki/WP:TL) is a script written in Javascript that allows for the automatisation or semi-automatisation of different tasks for users on the Spanish wikipedia. Most of them are maintenance-related.

It mainly uses the [Morebits](https://github.com/wikimedia-gadgets/twinkle/wiki/morebits) library and [Mediawiki API](https://www.mediawiki.org/wiki/API:Main_page) functionalities. The code is organised in modules and then compiled into one file through [Webpack](https://webpack.js.org/), which is then copied onto a js page on the Spanish Wikipedia [here](https://es.wikipedia.org/wiki/Usuario:Nacaru/twinkle-lite.js).

As of now, the available modules are:
* Page protection: it automatises the task of requesting page protection through eswiki noticeboards.
* Deletion request: it facilitates the creation of deletion requests for articles.
* Speedy deletion: it adds a speedy deletion tag on a page and notifies its creator.
* Reports: it allows for the reporting of users based on a number of reasons.
* Tags: it grants the option to quickly add maintenance tags to articles (and notify relevant users about it).
* Warnings: it includes an option allowing the addition of warning templates in other users' talk page. 

It's inspired by [Twinkle](https://github.com/wikimedia-gadgets/twinkle/) a tool developed by English Wikipedia user [AzaToth](https://en.wikipedia.org/wiki/User:AzaToth) (and many others, at this point!); as well as [TwinkleGlobal](https://github.com/Xi-Plus/twinkle-global), by user [Xiplus](https://meta.wikimedia.org/wiki/User:Xiplus).
