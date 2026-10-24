import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

page.on("console", (msg) => {
  console.log(`[console.${msg.type()}]`, msg.text());
});
page.on("pageerror", (err) => {
  console.log("[pageerror]", err.message);
  console.log(err.stack);
});
page.on("requestfailed", (req) => {
  console.log("[requestfailed]", req.url(), req.failure()?.errorText);
});

console.log("=== Navigating to /demo ===");
await page.goto("http://127.0.0.1:3000/demo", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);

console.log("=== Body text after 3s on /demo ===");
console.log((await page.locator("main").first().innerText()).slice(0, 500));

console.log("=== Clicking Enter Demo Workspace ===");
try {
  await page.getByText("Enter Demo Workspace").click({ timeout: 5000 });
} catch (e) {
  console.log("[click error]", e.message);
}
await page.waitForTimeout(3000);

console.log("=== URL after click ===", page.url());
console.log("=== Body text after click+3s ===");
console.log((await page.locator("main").first().innerText()).slice(0, 800));

console.log("=== Navigating directly to /demo/jobs ===");
await page.goto("http://127.0.0.1:3000/demo/jobs", { waitUntil: "networkidle" });
await page.waitForTimeout(3000);
console.log("=== Body text on /demo/jobs after 3s ===");
console.log((await page.locator("main").first().innerText()).slice(0, 800));

await browser.close();
console.log("=== DONE ===");
