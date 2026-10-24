/**
 * Backlog projection calculations. Current backlog is always derived
 * live from jobs + fees + invoices (see calculations.ts) -- these helpers
 * add historical trend, a seed-time baseline for before/after comparison,
 * and a forward-looking monthly billing projection.
 *
 * Note: a job's remaining backlog is spread evenly across the months
 * between the anchor date and its estimated end date. This is a
 * simplifying straight-line assumption, not a committed billing
 * schedule -- real billing timing depends on phase progress.
 */

import type { ArloDataset } from "@/lib/demo/types";
import { remainingBacklog } from "@/lib/demo/calculations";

function addMonths(iso: string, months: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function monthDiff(aIso: string, bIso: string): number {
  const a = new Date(aIso + "T00:00:00Z");
  const b = new Date(bIso + "T00:00:00Z");
  return Math.max(1, (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth()));
}

/** Backlog as of the dataset's generation time, reconstructed from the latest snapshot per job. */
export function baselineBacklog(dataset: ArloDataset): number {
  const latestByJob = new Map<string, number>();
  const latestDateByJob = new Map<string, string>();
  for (const snap of dataset.backlogSnapshots) {
    const current = latestDateByJob.get(snap.jobId);
    if (!current || snap.snapshotDate > current) {
      latestDateByJob.set(snap.jobId, snap.snapshotDate);
      latestByJob.set(snap.jobId, snap.remainingValue);
    }
  }
  return Math.round([...latestByJob.values()].reduce((a, b) => a + b, 0));
}

export interface MonthlyPoint {
  month: string;
  backlog: number;
}

/** Aggregate historical backlog by calendar month, summed across every job's snapshots. */
export function monthlyBacklogTrend(dataset: ArloDataset): MonthlyPoint[] {
  const byMonth = new Map<string, number>();
  for (const snap of dataset.backlogSnapshots) {
    const month = monthKey(snap.snapshotDate);
    byMonth.set(month, (byMonth.get(month) ?? 0) + snap.remainingValue);
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, backlog]) => ({ month, backlog: Math.round(backlog) }));
}

export interface MonthlyProjectionPoint {
  month: string;
  amount: number;
}

/** Straight-line projection of each open job's remaining backlog across its remaining months. */
export function monthlyBillingProjection(
  dataset: ArloDataset,
  anchorDate: string,
  monthsAhead: number
): MonthlyProjectionPoint[] {
  const buckets = new Map<string, number>();
  for (let i = 0; i < monthsAhead; i++) {
    buckets.set(monthKey(addMonths(anchorDate, i)), 0);
  }

  const openJobs = dataset.jobs.filter((j) => j.status === "Active" || j.status === "On Hold");
  for (const job of openJobs) {
    const remaining = remainingBacklog(dataset.jobFees, dataset.invoices, job.id);
    if (remaining <= 0) continue;
    const monthsLeft = monthDiff(anchorDate, job.estEndDate);
    const monthly = remaining / monthsLeft;
    for (let i = 0; i < monthsLeft; i++) {
      const key = monthKey(addMonths(anchorDate, i));
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) ?? 0) + monthly);
      }
    }
  }

  return [...buckets.entries()].map(([month, amount]) => ({ month, amount: Math.round(amount) }));
}

export interface DisciplineBacklog {
  disciplineId: string;
  name: string;
  backlog: number;
}

export function backlogByDiscipline(dataset: ArloDataset): DisciplineBacklog[] {
  const openJobs = dataset.jobs.filter((j) => j.status === "Active" || j.status === "On Hold");
  const byDiscipline = new Map<string, number>();
  for (const job of openJobs) {
    const remaining = remainingBacklog(dataset.jobFees, dataset.invoices, job.id);
    byDiscipline.set(job.disciplineId, (byDiscipline.get(job.disciplineId) ?? 0) + remaining);
  }
  return [...byDiscipline.entries()]
    .map(([disciplineId, backlog]) => ({
      disciplineId,
      name: dataset.lookups.disciplines.find((d) => d.id === disciplineId)?.name ?? disciplineId,
      backlog: Math.round(backlog),
    }))
    .filter((d) => d.backlog > 0)
    .sort((a, b) => b.backlog - a.backlog);
}

export interface ProjectBacklog {
  jobId: string;
  jobNumber: string;
  jobName: string;
  backlog: number;
}

export function backlogByProject(dataset: ArloDataset, topN = 10): ProjectBacklog[] {
  const openJobs = dataset.jobs.filter((j) => j.status === "Active" || j.status === "On Hold");
  return openJobs
    .map((job) => ({
      jobId: job.id,
      jobNumber: job.jobNumber,
      jobName: job.jobName,
      backlog: Math.round(remainingBacklog(dataset.jobFees, dataset.invoices, job.id)),
    }))
    .filter((r) => r.backlog > 0)
    .sort((a, b) => b.backlog - a.backlog)
    .slice(0, topN);
}
