# Twinkle Lite

**Twinkle Lite** is a TypeScript-based lightweight version of the popular Twinkle tool, designed for automating and semi-automating maintenance tasks on Spanish Wikipedia. The tool consists of multiple modules written in JavaScript and is compiled using [Webpack](https://webpack.js.org/). The tool leverages the [Morebits library](https://github.com/wikimedia-gadgets/twinkle/wiki/morebits) and the [Mediawiki API](https://www.mediawiki.org/wiki/API:Main_page) for its functionality.

## Overview

TL simplifies the process of handling routine Wikipedia maintenance tasks by automating actions such as tagging articles for deletion, reporting users, and adding protection requests; and is optimized to be more maintainable and tailored to the needs of the Spanish Wikipedia than its English-Wiki counterpart.

### Available Modules

This section includes a description of all the currently available modules that are included in Twinkle Lite as well as their purpose.

User modules:

* **Page protection**: Automates the task of requesting page protection through eswiki noticeboards.
* **Deletion request**: Facilitates the creation of deletion requests for articles.
* **Speedy deletion**: Adds a speedy deletion tag on a page and notifies its creator.
* **Reports**: Allows for the reporting of users based on a number of reasons.
* **Tags**: Grants the option to quickly add maintenance tags to articles (and notify relevant users about it).
* **Warnings**: Includes an option allowing the addition of warning templates in other users' talk pages.
* **Hide**: Allows users to request an edit to be hidden.

Sysop modules:

* **Deletion-request-closer**: Identifies deletion request pages and provides an option to close them through a form. Upon submission, the script performs the necessary administrative actions, modifying the deletion request page, the article's talk page, and the nominated page's main page.
* **Block-appeals**: Handles the resolution of block appeals. This module uses the information provided by admins through a form to modify the appealing user's talk page.
* **Fast-blocker**: Developed by user -sasha- in JavaScript, this module enables quick blocking of users. It has been integrated into Twinkle Lite as part of the sysop modules and ported to TypeScript.

Twinkle Lite is inspired by the original [Twinkle](https://github.com/wikimedia-gadgets/twinkle) developed by [AzaToth](https://en.wikipedia.org/wiki/User:AzaToth) on English Wikipedia, and [TwinkleGlobal](https://github.com/Xi-Plus/twinkle-global) by [Xiplus](https://meta.wikimedia.org/wiki/User:Xiplus).

## Installation

### User installation

To use Twinkle Lite on the Spanish Wikipedia as a user, the script can be installed by navigating to your personal preferences and enabling the accessory. More detailed instructions for the installation process can be found on the [Wikipedia page](https://es.wikipedia.org/wiki/WP:TL).

### Dev installation

You can install all dependencies through:

```bash
npm i
```

### Build and deployment

After building the project with:

```bash
npm run build
```

The deployment is done by copying the contents of the `dist` folder to the following page on Spanish Wikipedia:

[https://es.wikipedia.org/wiki/Usuario:Nacaru/twinkle-lite.js](https://es.wikipedia.org/wiki/Usuario:Nacaru/twinkle-lite.js)

This process updates the live version of Twinkle Lite. Although this action is expected to be performed by a bot in the future, this has not been implemented yet.

To be able to run a fork of or test the script as a Spanish Wikipedia user, you will have to create a `.js` file on Wikipedia on your user namespace with the built code. Then you will have to import the script on [your `common.js`](https://es.wikipedia.org/wiki/Especial:MiP%C3%A1gina/common.js) file by adding the following line:

```js
importScript('<PATH TO YOUR TWINKLE LITE FORK FILE>');
```

For example, if the script is located in the following URL:

```
https://es.wikipedia.org/wiki/Usuario:Nacaru/example.js
```

It will have to be imported as such:

```js
importScript('Usuario:Nacaru/example.js');
```

### Dependencies

The project relies on the following key development dependencies:

- **Babel**: Used for JavaScript transpilation, configured with `@babel/core` and `@babel/preset-env`.
- **TypeScript**: Ensures type safety for the project, along with `ts-loader` for integrating TypeScript into the Webpack build process.
- **Webpack**: Bundles the modules into a single JavaScript file, with `webpack-cli` for CLI interactions and `webpack-bundle-analyzer` to visualize the output.
- **Globals and types-mediawiki**: These are useful for handling global variables and MediaWiki types in the development environment.

A full list of dependencies can be found in the `package.json` file.

## License

Twinkle Lite is licensed under both the [GPL 3.0](https://www.gnu.org/licenses/gpl-3.0.en.html) and [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/) licenses. You are free to use, modify, and share the code under the terms of these licenses.

## Contributing

If you'd like to contribute to Twinkle Lite, feel free to open an issue or submit a pull request via the [GitHub repository](https://github.com/nacaru-w/twinkle-lite). Feedback and collaboration are always welcome!
