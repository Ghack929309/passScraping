const { Cluster } = require("puppeteer-cluster");
const puppeteer = require("puppeteer-extra");
const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");

puppeteer.use(
	StealthPlugin(),
	RecaptchaPlugin({
		provider: {
			id: "2captcha",
			token: "f9bab67a758631391bb34f39e934445c", // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
		},
		visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
	})
);

async function solveCaptcha(page) {
	// Wait for the reCAPTCHA element to load

	await page.waitForSelector("iframe");

	// That's it, a single line of code to solve reCAPTCHAs 🎉
	const { solved } = await page.solveRecaptchas();
	console.log(solved);

	await page.screenshot({ path: "captcha.png", fullPage: true });
}

async function main() {
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_BROWSER,
		monitor: true,
		maxConcurrency: 2, // Number of browser instances to run in parallel
		puppeteerOptions: {
			headless: false,
			defaultViewport: false,
			args: [
				"--disable-features=IsolateOrigins,site-per-process,SitePerProcess",
				"--flag-switches-begin --disable-site-isolation-trials --flag-switches-end",
			],
		},
	});
	cluster.on("taskerror", (err, data) => {
		console.log(`Error crawling ${data}: ${err.message}`);
	});
	await cluster.task(async ({ page, data: url }) => {
		await page.goto(url);

		// Call the function to solve the captcha
		await solveCaptcha(page);

		// Perform other actions on the page
		// ...
		await page.waitForTimeout(10000);
	});

	// Add URLs to be processed
	cluster.queue("https://recaptcha-demo.appspot.com/recaptcha-v2-checkbox.php");
	cluster.queue("https://recaptcha-demo.appspot.com/recaptcha-v2-checkbox.php");
	// ...

	await cluster.idle();
	await cluster.close();
}
main();

// 8*********************************

// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality

// add recaptcha plugin and provide it your 2captcha token (= their apiKey)
// 2captcha is the builtin solution provider but others would work as well.
// Please note: You need to add funds to your 2captcha account for this to work
// const RecaptchaPlugin = require("puppeteer-extra-plugin-recaptcha");
// puppeteer.use(
// 	RecaptchaPlugin({
// 		provider: {
// 			id: "2captcha",
// 			token: "f9bab67a758631391bb34f39e934445c", // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
// 		},
// 		visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
// 	})
// );

// // puppeteer usage as normal
// puppeteer.launch({ headless: false }).then(async (browser) => {
// 	const page = await browser.newPage();
// 	await page.goto("https://www.google.com/recaptcha/api2/demo");
// 	// await page.waitForSelector("#recaptcha-accessible-status");
// 	await page.waitForSelector("iframe");

// 	// That's it, a single line of code to solve reCAPTCHAs 🎉
// 	const { solved } = await page.solveRecaptchas();
// 	console.log(solved);

// 	await page.screenshot({ path: "response.png", fullPage: true });
// 	await browser.close();
// });
