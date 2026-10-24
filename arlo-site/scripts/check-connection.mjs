import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

let errorCount = 0;
page.on("pageerror", (err) => { errorCount++; console.log("[pageerror]", err.message); });
page.on("console", (msg) => { if (msg.type() === "error") { errorCount++; console.log("[console.error]", msg.text()); } });

function grab(text, label) {
  const idx = text.indexOf(label);
  return idx === -1 ? null : text.slice(idx, idx + 60).split("\n").slice(0, 3).join(" | ");
}

console.log("=== Backlog page BEFORE winning a proposal ===");
await page.goto("http://127.0.0.1:3000/demo/backlog", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const before = await page.locator("main").first().innerText();
console.log(grab(before, "Current Backlog"));
console.log(grab(before, "Change This Session"));

console.log("\n=== Win a proposal via Estimating ===");
await page.goto("http://127.0.0.1:3000/demo/estimating", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const select = page.locator("select").first();
const options = await select.locator("option").allTextContents();
const targetLabel = options.find((o) => o.includes("—"));
await select.selectOption({ label: targetLabel });
await page.waitForTimeout(1500);
await page.getByPlaceholder("Street address").fill("456 Connection Test Blvd");
const label = page.locator("label", { hasText: "City" }).first();
const cityInput = label.locator("xpath=following-sibling::*//input | following-sibling::input").first();
if (!(await cityInput.inputValue())) await cityInput.fill("Testville");
const zipLabel = page.locator("label", { hasText: "Zip" }).first();
const zipInput = zipLabel.locator("xpath=following-sibling::*//input | following-sibling::input").first();
if (!(await zipInput.inputValue())) await zipInput.fill("84000");
await page.getByRole("button", { name: /Mark Proposal as Won/i }).click();
await page.waitForTimeout(2000);
console.log("landed on:", page.url());

console.log("\n=== Backlog page AFTER winning a proposal ===");
await page.goto("http://127.0.0.1:3000/demo/backlog", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const after = await page.locator("main").first().innerText();
console.log(grab(after, "Current Backlog"));
console.log(grab(after, "Change This Session"));
console.log(grab(after, "grown since this demo session"));

console.log("\n=== error count:", errorCount, "===");
await browser.close();
