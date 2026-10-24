import { chromium } from "playwright";
import fs from "fs";

const BASE = "https://data5570-mycode.vercel.app";
const VIDEO_DIR = "/tmp/arlo-demo-video";
fs.rmSync(VIDEO_DIR, { recursive: true, force: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

const SIZE = { width: 1280, height: 720 };

const CURSOR_INIT = `
(() => {
  const cursor = document.createElement("div");
  cursor.id = "__demo_cursor__";
  cursor.style.cssText = \`
    position: fixed; top: 0; left: 0; width: 22px; height: 22px;
    border-radius: 50%; background: rgba(16,38,63,0.85);
    border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.35);
    pointer-events: none; z-index: 2147483647;
    transform: translate(-50%, -50%);
    transition: left 0.5s cubic-bezier(.2,.7,.3,1), top 0.5s cubic-bezier(.2,.7,.3,1);
  \`;
  document.documentElement.appendChild(cursor);
})();
`;

function moveCursorScript(x, y) {
  return `
(() => {
  let c = document.getElementById("__demo_cursor__");
  if (!c) return;
  c.style.left = "${x}px";
  c.style.top = "${y}px";
})();
`;
}

function pulseCursorScript() {
  return `
(() => {
  let c = document.getElementById("__demo_cursor__");
  if (!c) return;
  c.animate(
    [{ transform: "translate(-50%, -50%) scale(1)" }, { transform: "translate(-50%, -50%) scale(0.6)" }, { transform: "translate(-50%, -50%) scale(1)" }],
    { duration: 260 }
  );
})();
`;
}

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: SIZE,
  recordVideo: { dir: VIDEO_DIR, size: SIZE },
});
const page = await context.newPage();
await page.addInitScript(CURSOR_INIT);

async function wait(ms) {
  await page.waitForTimeout(ms);
}

async function moveTo(locatorOrBox, opts = {}) {
  const box = typeof locatorOrBox.boundingBox === "function" ? await locatorOrBox.boundingBox() : locatorOrBox;
  if (!box) return null;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2 + (opts.yOffset ?? 0);
  await page.evaluate(moveCursorScript(x, y));
  await page.mouse.move(x, y, { steps: 20 });
  await wait(520);
  return { x, y };
}

async function clickWithCursor(locator, opts = {}) {
  await locator.scrollIntoViewIfNeeded();
  await wait(200);
  const pt = await moveTo(locator, opts);
  await page.evaluate(pulseCursorScript());
  await wait(120);
  if (pt) await page.mouse.click(pt.x, pt.y);
  else await locator.click();
  await wait(opts.after ?? 900);
}

async function typeInto(locator, text, opts = {}) {
  await locator.scrollIntoViewIfNeeded();
  await moveTo(locator);
  if (opts.clear) {
    await locator.click({ clickCount: 3 }); // select-all existing text
  } else {
    await locator.click();
  }
  await locator.pressSequentially(text, { delay: opts.delay ?? 55 });
  await wait(opts.after ?? 500);
}

console.log("=== 1. Landing page ===");
await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
await wait(1600);
await page.mouse.wheel(0, 500);
await wait(1400);
await page.mouse.wheel(0, 600);
await wait(1400);
await page.mouse.wheel(0, -1100);
await wait(800);

console.log("=== 2. Click Test Demo ===");
const testDemoNav = page.getByRole("link", { name: "Test Demo" }).first();
await clickWithCursor(testDemoNav, { after: 1400 });

console.log("=== 3. Enter company name ===");
const companyInput = page.locator('input[type="text"], input:not([type])').first();
await typeInto(companyInput, "Summit Engineering Group", { clear: true, after: 700 });

console.log("=== 4. Enter Demo Workspace ===");
const enterBtn = page.getByRole("button", { name: /Enter Demo Workspace/i });
await clickWithCursor(enterBtn, { after: 1800 });

console.log("=== 5. Overview stats, go to Job Register ===");
await wait(1200);
const jobRegisterBtn = page.getByRole("link", { name: "View Job Register" });
await clickWithCursor(jobRegisterBtn, { after: 1400 });

console.log("=== 6. Search job register ===");
const searchInput = page.getByPlaceholder("Search job number, project, or client...");
await typeInto(searchInput, "Northgate", { after: 1400 });
await wait(900);
await searchInput.fill("");
await wait(600);

console.log("=== 7. Back to Overview, go to Fee Development ===");
await clickWithCursor(page.getByRole("link", { name: "Back to Overview" }), { after: 900 });
await clickWithCursor(page.getByRole("link", { name: "Fee Development" }), { after: 1400 });

console.log("=== 8. Select a pending proposal ===");
const feeProposalSelect = page.locator("select").first();
const feeOptions = await feeProposalSelect.locator("option").allTextContents();
const feeTarget = feeOptions.find((o) => o.includes("—"));
await moveTo(feeProposalSelect);
await feeProposalSelect.selectOption({ label: feeTarget });
await wait(1600);

console.log("=== 9. Adjust proposed fee and save it ===");
const feeInput = page.locator('input[type="number"]').last();
await typeInto(feeInput, "95000", { clear: true, after: 700 });
const saveFeeBtn = page.getByRole("button", { name: /Save Proposed Fee/i });
await clickWithCursor(saveFeeBtn, { after: 1200 });

console.log("=== 10. Back to Overview, go to Estimating ===");
await clickWithCursor(page.getByRole("link", { name: "Back to Overview" }), { after: 900 });
await clickWithCursor(page.getByRole("link", { name: "Estimating" }), { after: 1400 });

console.log("=== 11. Select same proposal, adjust hours ===");
const estProposalSelect = page.locator("select").first();
await moveTo(estProposalSelect);
await estProposalSelect.selectOption({ label: feeTarget });
await wait(1400);

const hourInputs = page.locator('input[type="number"]');
const hourCount = await hourInputs.count();
for (const idx of [1, 3, 5]) {
  if (idx < hourCount) {
    const el = hourInputs.nth(idx);
    const current = await el.inputValue();
    const bumped = String(Math.round(Number(current || 0) * 1.15) + 5);
    await typeInto(el, bumped, { clear: true, after: 450, delay: 40 });
  }
}
await wait(900);

console.log("=== 12. Fill win panel and win the proposal ===");
const addressInput = page.getByPlaceholder("Street address");
await typeInto(addressInput, "456 Innovation Drive", { after: 500 });

const winButton = page.getByRole("button", { name: /Mark Proposal as Won/i });
const enabled = await winButton.isEnabled().catch(() => false);
if (enabled) {
  await clickWithCursor(winButton, { after: 2200 });

  console.log("=== 13. Browse the new job's tabs ===");
  for (const tabName of ["Fees", "Phases", "Costs", "Invoices"]) {
    const tab = page.getByRole("button", { name: tabName });
    if (await tab.count()) {
      await clickWithCursor(tab, { after: 1000 });
    }
  }

  console.log("=== 14. Back to Overview, show updated backlog ===");
  await clickWithCursor(page.getByRole("link", { name: "Back to Overview" }), { after: 1200 });
  await clickWithCursor(page.getByRole("link", { name: "Backlog" }), { after: 1800 });
  await page.mouse.wheel(0, 500);
  await wait(1600);
  await page.mouse.wheel(0, 500);
  await wait(1600);
} else {
  console.log("win button not enabled, skipping win flow");
  await page.goto(`${BASE}/demo/backlog`, { waitUntil: "networkidle" });
  await wait(1600);
}

console.log("=== 15. Ask ARLO ===");
await page.goto(`${BASE}/demo/ai`, { waitUntil: "networkidle" });
await wait(1200);

const chatInput = page.locator("input").first();
const sendBtn = page.getByRole("button", { name: "Send" });

await typeInto(chatInput, "What is our current backlog?", { after: 300, delay: 45 });
await clickWithCursor(sendBtn, { after: 1800 });

await typeInto(chatInput, "Which jobs had the highest gross margins?", { clear: true, after: 300, delay: 45 });
await clickWithCursor(sendBtn, { after: 2200 });

await wait(1200);

console.log("=== Done, closing ===");
await context.close();
await browser.close();

const files = fs.readdirSync(VIDEO_DIR);
console.log("video files:", files);
