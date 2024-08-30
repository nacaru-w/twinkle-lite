/* eslint-env node */

const fs = require('fs');
const mwn = require('mwn');
const { exec } = require('child_process');

// JSON file with your username and bot password. Set up a bot password from [[Special:BotPasswords]]
const credentials = require('./credentials.json');

// name of the on-wiki script page name
const SCRIPT_PAGE = '';
const SCRIPT_SANDBOX_PAGE = '';

const sandboxOnly = process.argv[2] === '--sandbox';

const site = new mwn({
	apiUrl: 'https://es.wikipedia.org/w/api.php',
	username: credentials.username,
	password: credentials.password
});

const version = require('../package.json').version;

exec('git log -1 --pretty=%B', (err, stdout) => {
	let editSummary;
	if (err) {
		editSummary = `v${version}: updating`;
	} else {
		let last_commit_summary = stdout.trim();
		editSummary = `v${version}: ${last_commit_summary}`;
	}

	site.loginGetToken().then(() => {
		let outjs = fs.readFileSync(__dirname + '/dist/out.js').toString();
		site.save(SCRIPT_SANDBOX_PAGE, outjs, editSummary).then(() => {
			console.log(`Successfully saved dist/out.js to ${SCRIPT_SANDBOX_PAGE}`);
			if (!sandboxOnly) {
				let outminjs = fs.readFileSync(__dirname + '/dist/out.min.js').toString();
				site.save(SCRIPT_PAGE, outminjs, editSummary).then(() => {
					console.log(`Successfully saved dist/out.min.js to ${SCRIPT_PAGE}`);
				}, () => {
					console.log(`Failed to edit ${SCRIPT_PAGE} :(`);
				});
			}
		}, () => {
			console.log(`Failed to edit ${SCRIPT_SANDBOX_PAGE} :(`);
		});
	});
});
