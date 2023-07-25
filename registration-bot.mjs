import { chromium } from "playwright";
import Captcha from "2captcha";

const CAPTCHA_API_KEY = "f9bab67a758631391bb34f39e934445c";
const solver = new Captcha.Solver(CAPTCHA_API_KEY);
const GOOGLE_KEY = "6LfEpCgTAAAAAJaFet4Pz6WEEXShY2vYZKmraKCF";
const url = "https://site3.consuladodominicano-pp.com/Services/Index";

const selectors = {
  name: "#Nombre",
  lastName: "#Apellido",
  passportNumber: "#NoPasaporte",
  passportNumberConfirm: "#NoPasaporte2",
  email: "#Correo",
  recaptcha: "#recaptcha-anchor",
  agenda: "h4:has-text('Chwazi yon jou ki disponib pou randevou a')",
  submitButton: "#btnSave",
  captchaResponse: "#g-recaptcha-response",
  modal: "#myModalSave",
};

async function register(page, data, availableDates) {
  if (!availableDates.length) return;

  // select a random date between available dates
  console.info("Selecting an available date...");
  const randomIndex = Math.floor(Math.random() * availableDates.length);
  await availableDates[randomIndex].click();

  console.info("Registering for appointment. Filling form...");
  await page.waitForSelector(selectors.name);
  await page.fill(selectors.name, data.name);
  await page.fill(selectors.lastName, data.lastName);
  await page.fill(selectors.passportNumber, data.passportNumber);
  await page.fill(selectors.passportNumberConfirm, data.passportNumberConfirm);
  await page.fill(selectors.email, data.email);

  await page.waitForSelector('iframe[src*="recaptcha/api2"]');
  const captchaFrame = await page.$('iframe[src*="recaptcha/api2"]');
  const captchaFrameContent1 = await captchaFrame.contentFrame();
  const captchaCheckbox = await captchaFrameContent1.waitForSelector("#recaptcha-anchor");
  console.info("Trying to solve captcha...");
  console.time("Time spent on solving captcha... " + data.name);
  const captchaResponse = await solver.recaptcha(GOOGLE_KEY, url);
  console.timeEnd("Time spent on solving captcha... " + data.name);
  await page.$eval(
    selectors.captchaResponse,
    (textarea, response) => {
      textarea.value = response.data;
    },
    captchaResponse
  );
  await captchaCheckbox.click();

  await page.click(selectors.submitButton);
  await page.waitForLoadState("networkidle");
  await page.screenshot({ path: `./screenshots/${data.name + new Date().getMilliseconds()}.png` });
  await browser.close();
}

export async function checkAppointmentAvailability(data) {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  let datesNotFound = true;
  let availableDates = [];

  // use while loop instead of recursion to avoid stack overflow
  while (datesNotFound) {
    let error500 = await page.$("p:has-text('Error 503')");
    while (error500) {
      console.info("Error 503 found, reloading page...");
      await page.reload();
      await page.waitForLoadState("networkidle");
      error500 = await page.$("p:has-text('Error 503')");
    }

    console.info("Checking for appointments date availability...");
    await page.selectOption("#TicketTypeId", data.visaType);
    await page.waitForLoadState("networkidle");

    // check for button 'OK', if it exists, click it
    // await page.waitForTimeout(500);
    try {
      await page.$eval("button:has-text('OK')", (element) => {
        if (element) element.click();
      });
    } catch (error) {}

    for (let i = 0; i < 5; i++) {
      availableDates = await page.$$eval(
        'td[class*="fc-event-container"] > a[style*="background-color:green"]',
        (elements) => elements
      );

      if (availableDates.length) {
        console.info("Dates found, trying to select it...");
        await page.$eval(selectors.agenda, (element) => element.click());
        datesNotFound = false;
        break;
      } else {
        console.info("No Date found, trying next month...");
        await page.$eval('button[aria-label="next"]', (element) => element.click());
      }
    }

    if (datesNotFound) {
      console.info("No Dates found, reload and continue checking...");
      await page.reload();
      await page.waitForLoadState("networkidle");
    }
  }

  // dates found, call register
  register(page, data, availableDates);
}
