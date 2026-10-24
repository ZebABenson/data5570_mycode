/**
 * Comparable-job search and fee recommendation for Fee Development.
 *
 * Similarity scoring is a simple, fully-documented weighted sum (not a
 * trained model): discipline and project type matter most, then work
 * type and complexity closeness, then delivery method and size closeness.
 * Every score shown to the user can be traced back to this breakdown.
 */

import type { ArloDataset, Job, WorkType } from "@/lib/demo/types";
import { actualCost, contractValue } from "@/lib/demo/calculations";

export interface FeeQuery {
  disciplineId: string;
  projectTypeId: string;
  workType: WorkType;
  deliveryMethodId: string;
  complexity: 1 | 2 | 3 | 4 | 5;
  size?: number;
  sizeUnit?: string;
}

export interface ScoreBreakdown {
  label: string;
  points: number;
  maxPoints: number;
}

export interface ComparableResult {
  job: Job;
  score: number;
  maxScore: number;
  contractValue: number;
  actualCost: number;
  marginPercent: number;
  feePerSize?: number;
  breakdown: ScoreBreakdown[];
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function scoreJob(dataset: ArloDataset, job: Job, query: FeeQuery): ComparableResult {
  const breakdown: ScoreBreakdown[] = [];

  const disciplinePts = job.disciplineId === query.disciplineId ? 30 : 0;
  breakdown.push({ label: "Discipline match", points: disciplinePts, maxPoints: 30 });

  const typePts = job.projectTypeId === query.projectTypeId ? 25 : 0;
  breakdown.push({ label: "Project type match", points: typePts, maxPoints: 25 });

  const workTypePts = job.workType === query.workType ? 15 : 0;
  breakdown.push({ label: "Work type match", points: workTypePts, maxPoints: 15 });

  const complexityDiff = Math.abs(job.complexity - query.complexity);
  const complexityPts = Math.max(0, 15 - complexityDiff * 5);
  breakdown.push({ label: "Complexity similarity", points: complexityPts, maxPoints: 15 });

  const deliveryPts = job.deliveryMethodId === query.deliveryMethodId ? 5 : 0;
  breakdown.push({ label: "Delivery method match", points: deliveryPts, maxPoints: 5 });

  let sizePts = 0;
  if (query.size && job.size) {
    const pctDiff = Math.abs(job.size - query.size) / query.size;
    sizePts = Math.max(0, 10 - pctDiff * 20);
  }
  breakdown.push({ label: "Size similarity", points: round1(sizePts), maxPoints: 10 });

  const score = round1(disciplinePts + typePts + workTypePts + complexityPts + deliveryPts + sizePts);

  const cv = contractValue(dataset.jobFees, job.id);
  const cost = actualCost(dataset.jobCosts, job.id);
  const marginPercent = cv > 0 ? (cv - cost) / cv : 0;
  const feePerSize = job.size ? cv / job.size : undefined;

  return {
    job,
    score,
    maxScore: 100,
    contractValue: cv,
    actualCost: cost,
    marginPercent,
    feePerSize,
    breakdown,
  };
}

/** Ranks every completed job against the query and returns the top N. */
export function findComparableJobs(
  dataset: ArloDataset,
  query: FeeQuery,
  topN = 8
): ComparableResult[] {
  const completed = dataset.jobs.filter((j) => j.status === "Complete");
  const results = completed.map((job) => scoreJob(dataset, job, query));
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topN);
}

export interface FeeRecommendation {
  low: number;
  mid: number;
  high: number;
  basis: "per-size" | "contract-value" | "none";
  sampleSize: number;
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = (sorted.length - 1) * p;
  const lo = Math.floor(idx);
  const hi = Math.ceil(idx);
  if (lo === hi) return sorted[lo];
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

const MIN_SCORE_TO_COUNT = 20;

/**
 * Builds an illustrative fee range from the comparable set. Prefers a
 * per-size rate (fee / size) so the recommendation scales with the
 * query's own size; falls back to raw contract values when size data
 * isn't available on enough comparables.
 */
export function recommendFee(comparables: ComparableResult[], query: FeeQuery): FeeRecommendation {
  const relevant = comparables.filter((c) => c.score >= MIN_SCORE_TO_COUNT);

  const withSize = relevant.filter((c): c is ComparableResult & { feePerSize: number } => c.feePerSize !== undefined);
  if (withSize.length >= 3 && query.size) {
    const rates = withSize.map((c) => c.feePerSize).sort((a, b) => a - b);
    return {
      low: Math.round(percentile(rates, 0.25) * query.size),
      mid: Math.round(percentile(rates, 0.5) * query.size),
      high: Math.round(percentile(rates, 0.75) * query.size),
      basis: "per-size",
      sampleSize: withSize.length,
    };
  }

  const fees = relevant.map((c) => c.contractValue).sort((a, b) => a - b);
  if (fees.length === 0) {
    return { low: 0, mid: 0, high: 0, basis: "none", sampleSize: 0 };
  }

  return {
    low: Math.round(percentile(fees, 0.25)),
    mid: Math.round(percentile(fees, 0.5)),
    high: Math.round(percentile(fees, 0.75)),
    basis: "contract-value",
    sampleSize: fees.length,
  };
}
