/**
 * Converts a won proposal + its developed estimate into a permanent,
 * contracted job record -- the "Opportunity -> Job" connection the demo
 * is built around. The internal job id never changes once created; the
 * firm-formatted job number is assigned here, independent of the id.
 */

import type { ArloDataset, Job, JobFee, JobPhase, PhaseName, WorkType } from "@/lib/demo/types";

export interface PhaseBudgetInput {
  phaseName: PhaseName;
  budgetHours: number;
  budgetCost: number;
}

export interface ConvertProposalInput {
  proposalId: string;
  ownerId: string;
  pmEmployeeId: string;
  workType: WorkType;
  complexity: 1 | 2 | 3 | 4 | 5;
  deliveryMethodId: string;
  structuralSystemIds: string[];
  address: string;
  city: string;
  state: string;
  zip: string;
  size?: number;
  sizeUnit?: string;
  startDate: string;
  estEndDate: string;
  proposedFee: number;
  phaseBudgets: PhaseBudgetInput[];
}

/** Next sequential job number for the given 2-digit year, firm format `YY-NNN`. */
export function nextJobNumber(dataset: ArloDataset, year: string): string {
  const existing = dataset.jobs
    .filter((j) => j.jobNumber.startsWith(`${year}-`))
    .map((j) => parseInt(j.jobNumber.split("-")[1] ?? "0", 10))
    .filter((n) => !Number.isNaN(n));
  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return `${year}-${String(max + 1).padStart(3, "0")}`;
}

/** Next permanent internal job id. Prefixed separately from seed ids so it can never collide with them. */
export function nextJobId(dataset: ArloDataset): string {
  const existing = dataset.jobs
    .map((j) => j.id)
    .filter((id) => id.startsWith("job-new-"))
    .map((id) => parseInt(id.replace("job-new-", ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return `job-new-${max + 1}`;
}

export function convertProposalToJob(
  dataset: ArloDataset,
  jobId: string,
  jobNumber: string,
  input: ConvertProposalInput
): ArloDataset {
  const proposal = dataset.proposals.find((p) => p.id === input.proposalId);
  if (!proposal) return dataset;

  // A proposal can only ever become one job -- if it's already won, do nothing.
  if (proposal.status === "Won") return dataset;

  const job: Job = {
    id: jobId,
    jobNumber,
    jobName: proposal.projectName,
    proposalId: proposal.id,
    clientId: proposal.clientId,
    ownerId: input.ownerId,
    projectTypeId: proposal.projectTypeId,
    disciplineId: proposal.disciplineId,
    deliveryMethodId: input.deliveryMethodId,
    pmEmployeeId: input.pmEmployeeId,
    workType: input.workType,
    complexity: input.complexity,
    structuralSystemIds: input.structuralSystemIds,
    address: input.address,
    city: input.city,
    state: input.state,
    zip: input.zip,
    size: input.size,
    sizeUnit: input.sizeUnit,
    constructionCost: proposal.estConstructionCost,
    status: "Active",
    startDate: input.startDate,
    estEndDate: input.estEndDate,
  };

  const phases: JobPhase[] = input.phaseBudgets.map((p, i) => ({
    id: `phase-${jobId}-${i}`,
    jobId,
    phaseName: p.phaseName,
    budgetHours: p.budgetHours,
    budgetCost: p.budgetCost,
    startDate: input.startDate,
    endDate: input.estEndDate,
    percentComplete: 0,
  }));

  const fee: JobFee = {
    id: `fee-${jobId}-1`,
    jobId,
    feeStructureId: "fs-lumpsum",
    serviceTypeId: "svc-design",
    feeAmount: input.proposedFee,
    isChangeOrder: false,
    effectiveDate: input.startDate,
  };

  return {
    ...dataset,
    jobs: [...dataset.jobs, job],
    jobPhases: [...dataset.jobPhases, ...phases],
    jobFees: [...dataset.jobFees, fee],
    proposals: dataset.proposals.map((p) =>
      p.id === proposal.id
        ? { ...p, status: "Won", proposedFee: input.proposedFee, decisionDate: input.startDate }
        : p
    ),
  };
}
