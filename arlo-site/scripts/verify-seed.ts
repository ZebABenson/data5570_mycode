import { generateArloDataset } from "../src/lib/demo/seed";
import {
  contractValue,
  billedToDate,
  remainingBacklog,
  actualCost,
  totalCurrentBacklog,
} from "../src/lib/demo/calculations";

const d = generateArloDataset();

console.log("=== Counts ===");
console.log("employees:", d.employees.length);
console.log("clients:", d.clients.length);
console.log("contacts:", d.contacts.length);
console.log("owners:", d.owners.length);
console.log("jobs:", d.jobs.length);
console.log("  active:", d.jobs.filter((j) => j.status === "Active").length);
console.log("  on hold:", d.jobs.filter((j) => j.status === "On Hold").length);
console.log("  complete:", d.jobs.filter((j) => j.status === "Complete").length);
console.log("  cancelled:", d.jobs.filter((j) => j.status === "Cancelled").length);
console.log("proposals:", d.proposals.length);
console.log("jobPhases:", d.jobPhases.length);
console.log("jobCosts:", d.jobCosts.length);
console.log("jobFees:", d.jobFees.length);
console.log("invoices:", d.invoices.length);
console.log("backlogSnapshots:", d.backlogSnapshots.length);

console.log("\n=== Referential integrity ===");
const clientIds = new Set(d.clients.map((c) => c.id));
const jobIds = new Set(d.jobs.map((j) => j.id));
const employeeIds = new Set(d.employees.map((e) => e.id));

const badJobClients = d.jobs.filter((j) => !clientIds.has(j.clientId));
const badFeeJobs = d.jobFees.filter((f) => !jobIds.has(f.jobId));
const badCostJobs = d.jobCosts.filter((c) => !jobIds.has(c.jobId));
const badInvoiceJobs = d.invoices.filter((i) => !jobIds.has(i.jobId));
const badCostEmployees = d.jobCosts.filter((c) => c.employeeId && !employeeIds.has(c.employeeId));

console.log("jobs with invalid clientId:", badJobClients.length);
console.log("fees with invalid jobId:", badFeeJobs.length);
console.log("costs with invalid jobId:", badCostJobs.length);
console.log("invoices with invalid jobId:", badInvoiceJobs.length);
console.log("costs with invalid employeeId:", badCostEmployees.length);

console.log("\n=== Financial sanity ===");
let negativeMargin = 0;
let highMargin = 0;
let nanCount = 0;
const completeJobs = d.jobs.filter((j) => j.status === "Complete");
for (const j of completeJobs) {
  const cv = contractValue(d.jobFees, j.id);
  const cost = actualCost(d.jobCosts, j.id);
  const margin = cv === 0 ? 0 : (cv - cost) / cv;
  if (Number.isNaN(margin)) nanCount++;
  if (margin < 0) negativeMargin++;
  if (margin > 0.6) highMargin++;
}
console.log("complete jobs:", completeJobs.length);
console.log("NaN margins:", nanCount);
console.log("jobs with negative margin:", negativeMargin);
console.log("jobs with margin > 60%:", highMargin);

const sampleActive = d.jobs.find((j) => j.status === "Active");
if (sampleActive) {
  console.log("\n=== Sample active job ===");
  console.log("job:", sampleActive.jobNumber, sampleActive.jobName);
  console.log("contractValue:", contractValue(d.jobFees, sampleActive.id));
  console.log("billedToDate:", billedToDate(d.invoices, sampleActive.id));
  console.log("remainingBacklog:", remainingBacklog(d.jobFees, d.invoices, sampleActive.id));
}

console.log("\n=== Total current backlog ===");
console.log(totalCurrentBacklog(d).toLocaleString(undefined, { style: "currency", currency: "USD" }));

console.log("\n=== Scenario check: underpriced renovation present? ===");
const underpriced = completeJobs.find((j) => {
  const cv = contractValue(d.jobFees, j.id);
  const cost = actualCost(d.jobCosts, j.id);
  return j.workType === "Renovation" && cv > 0 && (cv - cost) / cv < 0.1;
});
console.log(underpriced ? `found: ${underpriced.jobNumber} ${underpriced.jobName}` : "NOT FOUND");

console.log("\nOK");
