import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("pageerror", (err) => console.log("[pageerror]", err.message));
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("[console.error]", msg.text());
});

await page.goto("http://127.0.0.1:3000/demo/fee-development", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

console.log("=== Selecting a pending proposal ===");
const select = page.locator("select").first();
const options = await select.locator("option").allTextContents();
const targetLabel = options.find((o) => o.includes("—"));
await select.selectOption({ label: targetLabel });
await page.waitForTimeout(1000);

const saveButton = page.getByRole("button", { name: /Save Proposed Fee/i });
console.log("save button enabled:", await saveButton.isEnabled());

await saveButton.click();
await page.waitForTimeout(500);
console.log("button text after click:", await saveButton.innerText());

console.log("=== Reloading to confirm the save persisted ===");
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const text = await page.locator("main").first().innerText();
console.log(text.includes("Not enough comparable data") ? "WARNING: no data after reload" : "data present after reload: OK");

await browser.close();
