import { chromium } from "playwright";

const BASE = process.argv[2] || "https://data5570-mycode.vercel.app";
const OUT = process.argv[3] || "/tmp/shots";

const pages = ["/", "/platform", "/solutions", "/benefits", "/about"];

const browser = await chromium.launch();

for (const width of [1440, 390]) {
  const context = await browser.newContext({ viewport: { width, height: 1000 } });
  const page = await context.newPage();
  for (const path of pages) {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(800);
    const name = path === "/" ? "home" : path.slice(1);
    await page.screenshot({ path: `${OUT}/${name}-${width}.png`, fullPage: true });
    console.log(`saved ${name}-${width}.png`);
  }
  await context.close();
}

await browser.close();
