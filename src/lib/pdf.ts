import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

export async function generateStoryPdf(printUrl: string) {
  const browser = await puppeteer.launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: true
  });

  try {
    const page = await browser.newPage();
    await page.goto(printUrl, { waitUntil: "networkidle0" });

    return await page.pdf({ format: "A4", printBackground: true });
  } finally {
    await browser.close();
  }
}
