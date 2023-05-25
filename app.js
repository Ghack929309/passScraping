const puppeteer = require("puppeteer");

const url = "https://site3.consuladodominicano-pp.com/Services/Index";

async function main() {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: false,
	});

	const page = await browser.newPage();
	await page.goto(url);

	const body = await page.$("body");
	await page.waitForSelector(".card");
	page.click("#TicketTypeId");
	await page.waitForSelector('#TicketTypeId option[value="1"]');
	await page.select("#TicketTypeId", "1");
	// to be remove after ****************
	await page.waitForSelector(".swal-modal");
	const modal = await page.$(".swal-modal");
	if (modal) {
		await page.evaluate((el) => el.querySelector("button")?.click(), modal);
		console.log("modal close");
	}
	//*********************************** */
	const agenda = await page.$x('//*[@id="accordion"]/div[2]/div[1]');
	if (agenda[0]) {
		await page.evaluate((el) => el.querySelector("h4").click(), agenda[0]);
		console.log("agenda clicked");
	}

	const td = await page.evaluate(() => {
		const trElements = Array.from(document.querySelectorAll("tr"));
		const tdElements = trElements.reduce((acc, tr) => {
			const tdList = Array.from(tr.querySelectorAll("td"));
			return acc.concat(tdList);
		}, []);
		let today;
		//replace the classList
		tdElements.forEach((td) =>
			td.classList.contains("fc-today") ? (today = td) : undefined
		);
		return today.getAttribute("data-date");
	});

	console.log(td);
	// form
	const formModal = await page.waitForSelector("#myModalSave");

	// if(formModal){
	//     await page.type('#Nombre', 'prenom')
	//     await page.type('#Apellido', 'nom fanmi')
	//     await page.type('#NoPasaporte', 'passport')
	//     await page.type('#NoPasaporte2', 'confirme paspo')
	//     await page.type('#Correo', 'email')
	//     await page.type('#Nombre', 'prenom')
	//     const g_recaptcha=await page.$('#g-recaptcha-response')
	//     //iframe inside div.g-recaptcha
	//     const iframeCaptcha = await page.$('.g-recaptcha')
	//     await page.click('#btnSave')
	// }

	await page.waitForTimeout(5000);

	await browser.close();
}
main();
