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

await page.goto("http://127.0.0.1:3000/demo/estimating", { waitUntil: "networkidle" });
await page.waitForTimeout(2000);

const text = await page.locator("main").first().innerText();
console.log(text);

console.log("\n=== numeric input values (hours/subconsultant/reimbursable) ===");
const inputs = page.locator('input[type="number"]');
const count = await inputs.count();
const values = [];
for (let i = 0; i < count; i++) {
  values.push(await inputs.nth(i).inputValue());
}
console.log(values.join(", "));
console.log("non-zero count:", values.filter((v) => Number(v) !== 0).length, "of", values.length);

console.log("\n=== error count:", errorCount, "===");
await browser.close();
