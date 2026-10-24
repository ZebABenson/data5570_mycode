/**
 * Historical reference data for the Estimating builder: average hours by
 * phase and role, and average subconsultant cost by phase, computed from
 * a set of comparable completed jobs (the same comparables Fee
 * Development ranks). These are seed values for the editable estimate,
 * not stored budgets -- the source job_costs records are never modified.
 */

import type { ArloDataset, EmployeeRole, PhaseName } from "@/lib/demo/types";

export const ROLES: EmployeeRole[] = [
  "Principal",
  "Project Manager",
  "Senior Engineer",
  "Project Engineer",
  "Designer",
];

export function avgHoursByPhaseAndRole(
  dataset: ArloDataset,
  comparableJobIds: string[],
  phases: PhaseName[]
): Record<string, number> {
  const avg: Record<string, number> = {};

  for (const phase of phases) {
    for (const role of ROLES) {
      let totalHours = 0;
      let jobCount = 0;

      for (const jobId of comparableJobIds) {
        const jobPhase = dataset.jobPhases.find(
          (p) => p.jobId === jobId && p.phaseName === phase
        );
        if (!jobPhase) continue;

        const hours = dataset.jobCosts
          .filter(
            (c) => c.jobId === jobId && c.phaseId === jobPhase.id && c.costType === "Labor"
          )
          .filter((c) => {
            const emp = dataset.employees.find((e) => e.id === c.employeeId);
            return emp?.role === role;
          })
          .reduce((s, c) => s + (c.hours ?? 0), 0);

        if (hours > 0) {
          totalHours += hours;
          jobCount += 1;
        }
      }

      avg[`${phase}|${role}`] = jobCount > 0 ? Math.round(totalHours / jobCount) : 0;
    }
  }

  return avg;
}

export function avgSubconsultantCostByPhase(
  dataset: ArloDataset,
  comparableJobIds: string[],
  phases: PhaseName[]
): Record<string, number> {
  const avg: Record<string, number> = {};

  for (const phase of phases) {
    let sum = 0;
    let count = 0;
    for (const jobId of comparableJobIds) {
      const jobPhase = dataset.jobPhases.find(
        (p) => p.jobId === jobId && p.phaseName === phase
      );
      if (!jobPhase) continue;
      count += 1;
      sum += dataset.jobCosts
        .filter(
          (c) => c.jobId === jobId && c.phaseId === jobPhase.id && c.costType === "Subconsultant"
        )
        .reduce((s, c) => s + c.amount, 0);
    }
    avg[phase] = count > 0 ? Math.round(sum / count) : 0;
  }

  return avg;
}

export function avgCostRateByRole(dataset: ArloDataset): Record<EmployeeRole, number> {
  const totals: Record<string, { sum: number; count: number }> = {};
  for (const role of ROLES) totals[role] = { sum: 0, count: 0 };

  for (const e of dataset.employees) {
    if (!totals[e.role]) continue;
    totals[e.role].sum += e.costRate;
    totals[e.role].count += 1;
  }

  const result = {} as Record<EmployeeRole, number>;
  for (const role of ROLES) {
    result[role] = totals[role].count > 0 ? Math.round(totals[role].sum / totals[role].count) : 0;
  }
  return result;
}
