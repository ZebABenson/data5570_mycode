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

function extract(text, label) {
  const idx = text.indexOf(label);
  if (idx === -1) return null;
  return text.slice(idx, idx + 120).split("\n").slice(0, 4).join(" | ");
}

console.log("=== Step 1: baseline on /demo/overview ===");
await page.goto("http://127.0.0.1:3000/demo/overview", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const before = await page.locator("main").first().innerText();
console.log(extract(before, "Active Jobs"));
console.log(extract(before, "Current Backlog"));

console.log("\n=== Step 2: open Estimating, select first pending proposal ===");
await page.goto("http://127.0.0.1:3000/demo/estimating", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);

const select = page.locator("select").first();
const options = await select.locator("option").allTextContents();
const targetLabel = options.find((o) => o.includes("—"));
console.log("selecting proposal:", targetLabel);
await select.selectOption({ label: targetLabel });
await page.waitForTimeout(1500);

console.log("\n=== Step 3: check pre-seeded fields ===");
const ownerSelect = page.locator("select").nth(5); // discipline,type,worktype,delivery,proposal-select... check by label instead
// More robust: find by surrounding label text using getByLabel is unreliable with this markup, use nearby selects by DOM order after the proposal selector.
const allSelects = page.locator("select");
const selectCount = await allSelects.count();
console.log("total <select> elements:", selectCount);

const addressInput = page.getByPlaceholder("Street address");
await addressInput.fill("123 Test Ave");

// City/Zip inputs: find via label text walking the DOM
async function getInputNearLabel(labelText) {
  const label = page.locator("label", { hasText: labelText }).first();
  const input = label.locator("xpath=following-sibling::*//input | following-sibling::input").first();
  return input;
}

const cityInput = await getInputNearLabel("City");
const cityVal = await cityInput.inputValue();
console.log("City pre-filled:", cityVal);
if (!cityVal) await cityInput.fill("Testville");

const zipInput = await getInputNearLabel("Zip");
const zipVal = await zipInput.inputValue();
console.log("Zip pre-filled:", zipVal);
if (!zipVal) await zipInput.fill("84000");

const startDateInput = await getInputNearLabel("Start Date");
console.log("Start date value:", await startDateInput.inputValue());

console.log("\n=== Step 4: click Mark Proposal as Won ===");
const winButton = page.getByRole("button", { name: /Mark Proposal as Won/i });
console.log("win button enabled:", await winButton.isEnabled());
await winButton.click();
await page.waitForTimeout(2500);

const url = page.url();
console.log("URL after click:", url);

console.log("\n=== Step 5: job detail page content ===");
const jobDetailText = await page.locator("main").first().innerText();
console.log(jobDetailText.slice(0, 900));

console.log("\n=== Step 6: confirm job appears in register ===");
await page.goto("http://127.0.0.1:3000/demo/jobs", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const jobsText = await page.locator("main").first().innerText();
const newJobId = url.split("/").pop();
console.log("looking for new job on register page, URL was:", newJobId);
console.log(extract(jobsText, "of 75") ?? extract(jobsText, "jobs"));

console.log("\n=== Step 7: confirm overview counts updated ===");
await page.goto("http://127.0.0.1:3000/demo/overview", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);
const after = await page.locator("main").first().innerText();
console.log(extract(after, "Active Jobs"));
console.log(extract(after, "Current Backlog"));

console.log("\n=== error count:", errorCount, "===");
await browser.close();
