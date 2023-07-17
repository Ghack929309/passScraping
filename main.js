const { Cluster } = require("puppeteer-cluster");

(async () => {
	const cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_CONTEXT,
		maxConcurrency: 50,
		monitor: true,
		puppeteerOptions: {
			headless: false,
			defaultViewport: false,
		},
	});
	const passport = [
		{
			nom: "ceasar",
			prenom: "beaudelaire",
			numero: "PV5606377",
			emai: "jcalixte024@gmail.com",
		},
		{
			nom: "Pierre",
			prenom: "Jasmine",
			numero: "R10055707",
			emai: "jcalixte024@gmail.com",
		},
		{
			nom: "ceasar",
			prenom: "brithny",
			numero: "R11015111",
			emai: "jcalixte024@gmail.com",
		},
		{
			nom: "ovardy",
			prenom: "mathieu",
			numero: "RM5110481",
			emai: "jcalixte024@gmail.com",
		},
	];
	// Event handler to be called in case of problems
	cluster.on("taskerror", (err, data) => {
		console.log(`Error crawling ${data}: ${err.message}`);
	});
	await cluster.task(async ({ page, data }) => {
		await page.goto("https://site3.consuladodominicano-pp.com/Services/Index", {
			waitUntil: "domcontentloaded",
		});
		// const body = await page.$("body");
		await page.waitForSelector(".card");
		page.click("#TicketTypeId");
		await page.waitForSelector('#TicketTypeId option[value="1"]');
		await page.select("#TicketTypeId", "1");
		// to be remove after ****************
		// const modal = await page.$(".swal-modal");
		// if (modal) {
		// 	await page.$eval(".swal-modal button", (el) => el?.click());
		// }

		console.log("modal close");
		//*********************************** */

		await page.$eval(".card-header.Agendaa h4", (el) => el.click());
		await page.waitForSelector("#collapagenda");
		// await page.$eval("button[aria-label='next'] span", (el) => el.click());

		//find date in table
		//loop 5 times if the eventContainer is not found

		let n = 0;
		while (true) {
			const tdElements = await page.$$eval("td", (tds) => {
				return tds.find((td) => {
					const eventContainer =
						td.classList.contains("fc-event-container") || null;
					if (eventContainer) {
						const linkToClick = td.querySelector("a");
						if (linkToClick.style.color === "green") {
							linkToClick.click();
							// fill the form
							page.waitForSelector("#myModalSave");
							console.log("ready to fill the form");
							page.type("#Nombre", data.prenom);
							page.type("#Apellido", data.nom);
							page.type("#NoPasaporte", data.numero);
							page.type("#NoPasaporte2", data.numero);
							page.type("#Correo", data.email);
							return true;
						} else {
							console.log("no available date for appointment found");
							return false;
						}
					} else {
						console.log(`no event found in page `);
						return false;
					}
				});
			});
			if (!tdElements) {
				await page.$eval("button[aria-label='next'] span", (el) => el.click());
				n++;
			} else {
				break;
			}
			if (n >= 5) {
				break;
			}
			console.log(tdElements);
		}

		//timeout
		// await page.waitForTimeout(10000);
	});

	for (const data of passport) {
		cluster.queue(data);
	}

	// many more pages

	// await cluster.idle();
	// await cluster.close();
})();
