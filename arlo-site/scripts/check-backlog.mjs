import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

let errorCount = 0;
page.on("pageerror", (err) => {
  errorCount++;
  console.log("[pageerror]", err.message);
});
page.on("console", (msg) => {
  if (msg.type() === "error") {
    errorCount++;
    console.log("[console.error]", msg.text());
  }
});

await page.goto("http://127.0.0.1:3000/demo/backlog", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const text = await page.locator("main").first().innerText();
console.log(text);

console.log("\n=== error count:", errorCount, "===");
await browser.close();
