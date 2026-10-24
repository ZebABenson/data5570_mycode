import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

let errorCount = 0;
page.on("pageerror", (err) => { errorCount++; console.log("[pageerror]", err.message); });
page.on("console", (msg) => { if (msg.type() === "error") { errorCount++; console.log("[console.error]", msg.text()); } });

await page.goto("http://127.0.0.1:3000/demo/ai", { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const chipTexts = await page.locator("button").allTextContents();
console.log("chips visible before first question:", chipTexts.filter((t) => t.length > 10).slice(0, 4));

const input = page.locator("input").first();
const sendButton = page.getByRole("button", { name: "Send" });

async function ask(question) {
  await input.fill(question);
  await sendButton.click();
  await page.waitForTimeout(1300);
  const text = await page.locator("main").first().innerText();
  console.log(`\n--- Q: ${question} ---`);
  console.log(text.slice(text.length - 650));
}

await ask("What is our current backlog?");
await ask("Which jobs had the highest gross margins?");
await ask("Which past projects exceeded their budgets?");
await ask("What did we typically charge for structural engineering?");
await ask("Which phase typically requires the most hours?");
await ask("Which clients generate the most contracted fees?");
await ask("what is the meaning of life");

console.log("\n=== error count:", errorCount, "===");
await browser.close();
