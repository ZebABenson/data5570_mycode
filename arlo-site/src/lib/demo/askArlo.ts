/**
 * Ask ARLO: a deterministic, data-grounded query engine for the demo.
 *
 * This is explicitly Mode A from the spec -- no API key, no trained
 * model. It recognizes a fixed set of question patterns, retrieves the
 * matching records from the live dataset, computes an answer with the
 * same functions every other screen uses (calculations.ts, backlog.ts),
 * and never invents a figure. Unsupported questions say so and suggest
 * alternatives rather than guessing.
 */

import type { ArloDataset, Discipline, Job, ProjectType } from "@/lib/demo/types";
import {
  actualCost,
  actualHours,
  contractValue,
  grossMarginPercent,
  jobBudgetVsActual,
  totalCurrentBacklog,
} from "@/lib/demo/calculations";
import { backlogByDiscipline, baselineBacklog } from "@/lib/demo/backlog";
import { fmtCurrency, fmtNumber, fmtPercent } from "@/lib/demo/format";
import { findClient } from "@/lib/demo/lookups";

export interface AskArloRecord {
  jobId: string;
  jobNumber: string;
  jobName: string;
}

export interface AskArloResponse {
  answer: string;
  details: string[];
  records: AskArloRecord[];
  assumptions: string[];
  followUps: string[];
  matched: boolean;
}

export const SUGGESTED_QUESTIONS = [
  "What is our current backlog?",
  "How much backlog do we have in Structural?",
  "Which jobs had the highest gross margins?",
  "Which past projects exceeded their budgets?",
  "What did we typically charge for structural engineering?",
  "Which phase typically requires the most hours?",
  "How many hours did our last 5 civil projects require?",
  "Did renovation projects need more hours than new construction?",
  "Which clients generate the most contracted fees?",
  "How has backlog changed this session?",
];

const DEFAULT_FOLLOWUPS = [
  "What is our current backlog?",
  "Which past jobs exceeded their budgets?",
  "What did we typically charge for structural engineering?",
  "Which phase typically requires the most hours?",
];

function toRecord(job: Job): AskArloRecord {
  return { jobId: job.id, jobNumber: job.jobNumber, jobName: job.jobName };
}

function findDisciplineInQuestion(dataset: ArloDataset, q: string): Discipline | undefined {
  return dataset.lookups.disciplines.find((d) => q.includes(d.name.toLowerCase()));
}

const PROJECT_TYPE_SYNONYMS: Record<string, string> = {
  office: "Commercial Office",
  school: "K-12 School",
  "k-12": "K-12 School",
  retail: "Retail",
  hospital: "Healthcare",
  medical: "Healthcare",
  healthcare: "Healthcare",
  warehouse: "Warehouse / Industrial",
  industrial: "Warehouse / Industrial",
  apartment: "Multifamily Residential",
  multifamily: "Multifamily Residential",
  townhome: "Townhome Development",
  bridge: "Bridge",
  road: "Roadway",
  roadway: "Roadway",
  water: "Water / Utilities",
  university: "University / Higher Ed",
  college: "University / Higher Ed",
};

function findProjectTypeInQuestion(dataset: ArloDataset, q: string): ProjectType | undefined {
  for (const [keyword, typeName] of Object.entries(PROJECT_TYPE_SYNONYMS)) {
    if (q.includes(keyword)) {
      const match = dataset.lookups.projectTypes.find((p) => p.name === typeName);
      if (match) return match;
    }
  }
  return dataset.lookups.projectTypes.find((p) => q.includes(p.name.toLowerCase()));
}

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

function unsupported(): AskArloResponse {
  return {
    answer:
      "I don't have a reliable way to answer that from the current demo data yet. I can answer questions about backlog, historical fees, engineering hours by phase, project margins, budget overruns, and which clients generate the most work.",
    details: [],
    records: [],
    assumptions: [],
    followUps: DEFAULT_FOLLOWUPS,
    matched: false,
  };
}

type Handler = (dataset: ArloDataset, q: string) => AskArloResponse | null;

const handlers: Handler[] = [
  // How has backlog changed this session?
  (dataset, q) => {
    if (!/backlog/.test(q)) return null;
    if (!/(chang|affect|session|grown|grow|increas|decreas)/.test(q)) return null;
    const current = totalCurrentBacklog(dataset);
    const baseline = baselineBacklog(dataset);
    const diff = current - baseline;
    return {
      answer: `Current backlog is ${fmtCurrency(current)}, compared with ${fmtCurrency(baseline)} at the start of this demo session—a change of ${diff >= 0 ? "+" : ""}${fmtCurrency(diff)}.`,
      details: [
        diff > 0
          ? "Backlog grew, most likely because a proposal was won and converted into a job on the Estimating page."
          : diff < 0
            ? "Backlog is lower than the session-start baseline."
            : "Backlog hasn't changed since the session started.",
      ],
      records: [],
      assumptions: [
        "The session-start baseline is reconstructed from each job's most recent recorded snapshot, not a live figure.",
      ],
      followUps: ["What is our current backlog?", "How much backlog do we have in Structural?"],
      matched: true,
    };
  },

  // Backlog by discipline
  (dataset, q) => {
    if (!/backlog/.test(q)) return null;
    const discipline = findDisciplineInQuestion(dataset, q);
    if (!discipline) return null;
    const byDiscipline = backlogByDiscipline(dataset);
    const row = byDiscipline.find((d) => d.disciplineId === discipline.id);
    return {
      answer: row
        ? `Current backlog in ${discipline.name} is ${fmtCurrency(row.backlog)}.`
        : `There's no active contracted backlog in ${discipline.name} right now.`,
      details: byDiscipline.map((d) => `${d.name}: ${fmtCurrency(d.backlog)}`),
      records: [],
      assumptions: [],
      followUps: ["What is our current backlog?", "How has backlog changed this session?"],
      matched: true,
    };
  },

  // Total current backlog
  (dataset, q) => {
    if (!/backlog/.test(q)) return null;
    if (!/(current|total|now|today|right now)/.test(q)) return null;
    const current = totalCurrentBacklog(dataset);
    const byDiscipline = backlogByDiscipline(dataset);
    return {
      answer: `Current contracted backlog is ${fmtCurrency(current)} across every active job.`,
      details: byDiscipline.map((d) => `${d.name}: ${fmtCurrency(d.backlog)}`),
      records: [],
      assumptions: [],
      followUps: ["How much backlog do we have in Structural?", "How has backlog changed this session?"],
      matched: true,
    };
  },

  // Highest margin / most profitable
  (dataset, q) => {
    if (!/(highest.*margins?|most profitable|best margins?|highest profit)/.test(q)) return null;
    const completed = dataset.jobs.filter((j) => j.status === "Complete");
    const ranked = completed
      .map((job) => ({ job, margin: grossMarginPercent(dataset, job.id) }))
      .sort((a, b) => b.margin - a.margin)
      .slice(0, 5);
    return {
      answer: `The most profitable completed jobs by gross margin: ${ranked
        .map((r) => `${r.job.jobNumber} (${fmtPercent(r.margin, 1)})`)
        .join(", ")}.`,
      details: ranked.map(
        (r) => `${r.job.jobNumber} ${r.job.jobName}: ${fmtPercent(r.margin, 1)} margin on ${fmtCurrency(contractValue(dataset.jobFees, r.job.id))} contracted`
      ),
      records: ranked.map((r) => toRecord(r.job)),
      assumptions: ["Margin = (contract value − actual cost) / contract value, from completed jobs only."],
      followUps: ["Which past projects exceeded their budgets?", "What did we typically charge for structural engineering?"],
      matched: true,
    };
  },

  // Exceeded budget
  (dataset, q) => {
    if (!/(exceeded.*budgets?|over budget|budget overrun|cost overrun|ran over)/.test(q)) return null;
    const completed = dataset.jobs.filter((j) => j.status === "Complete");
    const ranked = completed
      .map((job) => ({ job, bva: jobBudgetVsActual(dataset, job.id) }))
      .filter((r) => r.bva.budgetCost > 0 && r.bva.actualCost / r.bva.budgetCost > 1.05)
      .sort((a, b) => b.bva.actualCost / b.bva.budgetCost - a.bva.actualCost / a.bva.budgetCost)
      .slice(0, 5);
    if (ranked.length === 0) {
      return {
        answer: "No completed jobs show a meaningful cost overrun (more than 5% over budget) in the current data.",
        details: [],
        records: [],
        assumptions: [],
        followUps: DEFAULT_FOLLOWUPS,
        matched: true,
      };
    }
    return {
      answer: `${ranked.length} completed job${ranked.length === 1 ? "" : "s"} ran meaningfully over budget: ${ranked
        .map((r) => r.job.jobNumber)
        .join(", ")}.`,
      details: ranked.map(
        (r) =>
          `${r.job.jobNumber} ${r.job.jobName}: ${fmtCurrency(r.bva.actualCost)} actual vs. ${fmtCurrency(r.bva.budgetCost)} budgeted (${fmtPercent(r.bva.actualCost / r.bva.budgetCost, 0)} of budget)`
      ),
      records: ranked.map((r) => toRecord(r.job)),
      assumptions: ["Compares total actual phase cost against total budgeted phase cost across completed jobs."],
      followUps: ["Which jobs had the highest gross margins?", "Did renovation projects need more hours than new construction?"],
      matched: true,
    };
  },

  // Renovation vs new construction hours pattern
  (dataset, q) => {
    if (!/renovation/.test(q)) return null;
    if (!/(hour|compare|more|pattern)/.test(q)) return null;
    const schematicHours = (workType: string) => {
      const jobs = dataset.jobs.filter((j) => j.status === "Complete" && j.workType === workType);
      const values = jobs
        .map((j) => {
          const phase = dataset.jobPhases.find((p) => p.jobId === j.id && p.phaseName === "Schematic Design");
          return phase ? actualHours(dataset.jobCosts, j.id, phase.id) : null;
        })
        .filter((v): v is number => v !== null && v > 0);
      return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    };
    const renoHours = schematicHours("Renovation");
    const newHours = schematicHours("New Construction");
    const pctMore = newHours > 0 ? ((renoHours - newHours) / newHours) * 100 : 0;
    return {
      answer:
        renoHours > newHours
          ? `Yes—renovation projects averaged ${fmtNumber(renoHours, 0)} Schematic Design hours, about ${fmtNumber(pctMore, 0)}% more than new construction's ${fmtNumber(newHours, 0)} hours, likely from additional existing-conditions investigation.`
          : `Renovation projects averaged ${fmtNumber(renoHours, 0)} Schematic Design hours, compared with ${fmtNumber(newHours, 0)} for new construction—not a significant difference in this dataset.`,
      details: [],
      records: [],
      assumptions: ["Averages Schematic Design phase hours across completed jobs with recorded costs in that phase."],
      followUps: ["Which past projects exceeded their budgets?", "Which phase typically requires the most hours?"],
      matched: true,
    };
  },

  // Which phase requires the most hours
  (dataset, q) => {
    if (!/phase/.test(q)) return null;
    if (!/(most hours|most engineering hours|which phase)/.test(q)) return null;
    const totals = new Map<string, number>();
    for (const cost of dataset.jobCosts) {
      if (cost.costType !== "Labor" || !cost.phaseId || !cost.hours) continue;
      const phase = dataset.jobPhases.find((p) => p.id === cost.phaseId);
      if (!phase) continue;
      totals.set(phase.phaseName, (totals.get(phase.phaseName) ?? 0) + cost.hours);
    }
    const ranked = [...totals.entries()].sort((a, b) => b[1] - a[1]);
    const top = ranked[0];
    return {
      answer: top
        ? `${top[0]} typically requires the most engineering hours (${fmtNumber(top[1])} total hours recorded across all jobs).`
        : "Not enough phase-level hour data to answer that.",
      details: ranked.map(([name, hours]) => `${name}: ${fmtNumber(hours)} hours`),
      records: [],
      assumptions: ["Sums recorded labor hours by phase across every job in the dataset."],
      followUps: ["Did renovation projects need more hours than new construction?", "What did we typically charge for structural engineering?"],
      matched: true,
    };
  },

  // Recent N jobs by discipline, hours required
  (dataset, q) => {
    const discipline = findDisciplineInQuestion(dataset, q);
    if (!discipline) return null;
    if (!/(hour|require|take)/.test(q)) return null;
    if (!/(last|recent|past)/.test(q)) return null;
    const countMatch = q.match(/(\d+)/);
    const n = countMatch ? parseInt(countMatch[1], 10) : 5;
    const jobs = dataset.jobs
      .filter((j) => j.status === "Complete" && j.disciplineId === discipline.id)
      .sort((a, b) => (b.actualEndDate ?? b.estEndDate).localeCompare(a.actualEndDate ?? a.estEndDate))
      .slice(0, n);
    const withHours = jobs.map((j) => ({ job: j, hours: actualHours(dataset.jobCosts, j.id) }));
    const total = withHours.reduce((s, r) => s + r.hours, 0);
    return {
      answer: `Our last ${withHours.length} completed ${discipline.name} projects required ${fmtNumber(total)} total hours, averaging ${fmtNumber(withHours.length ? total / withHours.length : 0)} hours each.`,
      details: withHours.map((r) => `${r.job.jobNumber} ${r.job.jobName}: ${fmtNumber(r.hours)} hours`),
      records: withHours.map((r) => toRecord(r.job)),
      assumptions: [],
      followUps: ["Which jobs had the highest gross margins?", "What did we typically charge for structural engineering?"],
      matched: true,
    };
  },

  // Typical/average fee for discipline and/or project type
  (dataset, q) => {
    if (!/(charge|fee|price|cost us)/.test(q)) return null;
    const discipline = findDisciplineInQuestion(dataset, q);
    const projectType = findProjectTypeInQuestion(dataset, q);
    if (!discipline && !projectType) return null;

    const jobs = dataset.jobs.filter(
      (j) =>
        j.status === "Complete" &&
        (!discipline || j.disciplineId === discipline.id) &&
        (!projectType || j.projectTypeId === projectType.id)
    );
    if (jobs.length === 0) {
      return {
        answer: `No completed jobs match ${[discipline?.name, projectType?.name].filter(Boolean).join(" / ")} to calculate a typical fee from.`,
        details: [],
        records: [],
        assumptions: [],
        followUps: DEFAULT_FOLLOWUPS,
        matched: true,
      };
    }
    const fees = jobs.map((j) => contractValue(dataset.jobFees, j.id));
    const label = [discipline?.name, projectType?.name].filter(Boolean).join(" ");
    return {
      answer: `Across ${jobs.length} completed ${label} job${jobs.length === 1 ? "" : "s"}, the median fee was ${fmtCurrency(median(fees))} (range ${fmtCurrency(Math.min(...fees))}–${fmtCurrency(Math.max(...fees))}).`,
      details: jobs.slice(0, 8).map((j) => `${j.jobNumber} ${j.jobName}: ${fmtCurrency(contractValue(dataset.jobFees, j.id))}`),
      records: jobs.slice(0, 8).map(toRecord),
      assumptions: ["Based on contracted fees on completed jobs matching this discipline/project type in the fictional dataset."],
      followUps: ["Which jobs had the highest gross margins?", "Which past projects exceeded their budgets?"],
      matched: true,
    };
  },

  // Which clients generate the most fees
  (dataset, q) => {
    if (!/client/.test(q)) return null;
    if (!/(most|highest|generate|biggest)/.test(q)) return null;
    const byClient = new Map<string, number>();
    for (const job of dataset.jobs) {
      byClient.set(job.clientId, (byClient.get(job.clientId) ?? 0) + contractValue(dataset.jobFees, job.id));
    }
    const ranked = [...byClient.entries()]
      .map(([clientId, total]) => ({ client: findClient(dataset, clientId), total }))
      .filter((r) => r.client && r.total > 0)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    return {
      answer: `The top clients by total contracted fees: ${ranked.map((r) => r.client!.name).join(", ")}.`,
      details: ranked.map((r) => `${r.client!.name}: ${fmtCurrency(r.total)}`),
      records: [],
      assumptions: ["Sums contracted fees across all jobs (active and complete) for each client."],
      followUps: ["What is our current backlog?", "Which jobs had the highest gross margins?"],
      matched: true,
    };
  },
];

export function answerQuestion(dataset: ArloDataset, question: string): AskArloResponse {
  const q = question.trim().toLowerCase();
  if (!q) return unsupported();
  for (const handler of handlers) {
    const result = handler(dataset, q);
    if (result) return result;
  }
  return unsupported();
}
