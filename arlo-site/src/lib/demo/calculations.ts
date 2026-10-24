/**
 * Derived/calculated values.
 *
 * Per ARLO_Data_Model.md section 5.5, these are NEVER stored directly on a
 * Job — they are always computed from job fees, invoices, and job costs.
 * Every module (job register, backlog, estimating, reports, Ask ARLO) must
 * call these same functions rather than keeping its own copy, so the
 * numbers shown anywhere in the demo always agree with each other.
 */

import type { ArloDataset, JobCost, JobFee, Invoice } from "@/lib/demo/types";

/** Contract value for a job = sum of its (non-change-order-aware) job fees. */
export function contractValue(fees: JobFee[], jobId: string): number {
  return sum(fees.filter((f) => f.jobId === jobId).map((f) => f.feeAmount));
}

/** Billed to date for a job = sum of its invoice amounts. */
export function billedToDate(invoices: Invoice[], jobId: string): number {
  return sum(
    invoices.filter((i) => i.jobId === jobId).map((i) => i.amount)
  );
}

/** Remaining backlog for a job = contract value - billed to date. */
export function remainingBacklog(
  fees: JobFee[],
  invoices: Invoice[],
  jobId: string
): number {
  return contractValue(fees, jobId) - billedToDate(invoices, jobId);
}

/** Total actual cost for a job, optionally restricted to one phase. */
export function actualCost(
  costs: JobCost[],
  jobId: string,
  phaseId?: string
): number {
  return sum(
    costs
      .filter((c) => c.jobId === jobId && (!phaseId || c.phaseId === phaseId))
      .map((c) => c.amount)
  );
}

/** Total actual hours for a job, optionally restricted to one phase. */
export function actualHours(
  costs: JobCost[],
  jobId: string,
  phaseId?: string
): number {
  return sum(
    costs
      .filter((c) => c.jobId === jobId && (!phaseId || c.phaseId === phaseId))
      .map((c) => c.hours ?? 0)
  );
}

/** Gross margin (%) for a job = (contract value - actual cost) / contract value. */
export function grossMarginPercent(dataset: ArloDataset, jobId: string): number {
  const fees = contractValue(dataset.jobFees, jobId);
  if (fees === 0) return 0;
  const cost = actualCost(dataset.jobCosts, jobId);
  return (fees - cost) / fees;
}

/** Current total contracted backlog across all jobs with status Active or On Hold. */
export function totalCurrentBacklog(dataset: ArloDataset): number {
  const openJobIds = new Set(
    dataset.jobs
      .filter((j) => j.status === "Active" || j.status === "On Hold")
      .map((j) => j.id)
  );
  return sum(
    [...openJobIds].map((jobId) =>
      remainingBacklog(dataset.jobFees, dataset.invoices, jobId)
    )
  );
}

/** Budget vs. actual hours and cost for a job, summed across all its phases. */
export function jobBudgetVsActual(dataset: ArloDataset, jobId: string) {
  const phases = dataset.jobPhases.filter((p) => p.jobId === jobId);
  const budgetHours = sum(phases.map((p) => p.budgetHours));
  const budgetCost = sum(phases.map((p) => p.budgetCost));
  return {
    budgetHours,
    budgetCost,
    actualHours: actualHours(dataset.jobCosts, jobId),
    actualCost: actualCost(dataset.jobCosts, jobId),
  };
}

function sum(values: number[]): number {
  return Math.round(values.reduce((a, b) => a + b, 0) * 100) / 100;
}
