import { register } from "./registration-bot.mjs";

async function registrationSimulator() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(url);

  console.log("clicking agenda accordion...");
  await page.$eval(selectors.agenda, (element) => {
    element.click();
  });
  await page.$eval(selectors.modal, (element) => {
    element.style.display = "block";
  });

  register(
    page,
    {
      name: "Jhon",
      lastName: "Doe",
      passportNumber: "123456789",
      passportNumberConfirm: "123456789",
      email: "test@email.com",
      visaType: "1",
    },
    []
  );
}

registrationSimulator();
