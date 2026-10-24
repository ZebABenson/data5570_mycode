/**
 * ARLO demo domain types.
 *
 * Mirrors the entities, relationships, and allowed values defined in
 * ARLO_Data_Model.md (the same structure used by the customers/* Django
 * models), adapted to camelCase for the TypeScript/React demo layer.
 *
 * Categories, matching the spec:
 *   - Lookup:  OwnerType, ProjectType, Discipline, DeliveryMethod,
 *              StructuralSystem, FeeStructure, ServiceType
 *   - Core:    Client, Contact, Owner, Employee, Job
 *   - Activity: Proposal, JobPhase, JobCost, JobStructuralSystem,
 *              JobFee, Invoice, BacklogSnapshot
 *
 * Internal ids (`id`) never change. Human-facing identifiers (job numbers)
 * are a separate field and may follow a firm-specific format.
 *
 * Calculated values (contract value, billed to date, remaining backlog,
 * budget vs. actual) are NOT stored on these types — they are derived by
 * functions in calculations.ts from job fees, invoices, and job costs,
 * per ARLO_Data_Model.md section 5.5.
 */

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

export type OwnerTypeName =
  | "Public"
  | "Private"
  | "Developer"
  | "Institutional";

export interface OwnerType {
  id: string;
  name: OwnerTypeName;
  description?: string;
}

export type ProjectTypeName =
  | "Commercial Office"
  | "Retail"
  | "Warehouse / Industrial"
  | "Mixed-Use"
  | "K-12 School"
  | "University / Higher Ed"
  | "Healthcare"
  | "Public Facility"
  | "Multifamily Residential"
  | "Townhome Development"
  | "Bridge"
  | "Roadway"
  | "Water / Utilities"
  | "Site Development";

export type ProjectTypeCategory =
  | "Commercial"
  | "Institutional"
  | "Residential"
  | "Infrastructure";

export interface ProjectType {
  id: string;
  name: ProjectTypeName;
  category: ProjectTypeCategory;
  parentTypeId?: string;
  description?: string;
}

export type DisciplineName = "Structural" | "Civil" | "MEP" | "Geotechnical";

export interface Discipline {
  id: string;
  name: DisciplineName;
  description?: string;
}

export type DeliveryMethodName =
  | "Design-Bid-Build"
  | "Design-Build"
  | "CM at Risk"
  | "IPD"
  | "Unknown";

export interface DeliveryMethod {
  id: string;
  name: DeliveryMethodName;
  description?: string;
}

export type StructuralSystemCategory =
  | "Steel"
  | "Concrete"
  | "Wood"
  | "Masonry"
  | "Hybrid";

export interface StructuralSystem {
  id: string;
  name: string;
  category: StructuralSystemCategory;
}

export type FeeStructureName =
  | "Hourly"
  | "Lump Sum by Phase"
  | "Percent of Construction Cost";

export interface FeeStructure {
  id: string;
  name: FeeStructureName;
  description?: string;
}

export type ServiceTypeName =
  | "Design"
  | "Construction Administration"
  | "Inspections"
  | "Studies / Assessment"
  | "Permitting Support";

export interface ServiceType {
  id: string;
  name: ServiceTypeName;
  description?: string;
}

// ---------------------------------------------------------------------------
// Core tables
// ---------------------------------------------------------------------------

export interface Client {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
  paymentTerms?: string;
  active: boolean;
}

export interface Contact {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  phone?: string;
  isPointOfContact: boolean;
}

export interface Owner {
  id: string;
  ownerTypeId: string;
  name: string;
  notes?: string;
}

export type EmployeeRole =
  | "Principal"
  | "Project Manager"
  | "Senior Engineer"
  | "Project Engineer"
  | "Designer"
  | "Drafter";

export interface Employee {
  id: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  billRate: number;
  costRate: number;
  active: boolean;
}

export type WorkType =
  | "New Construction"
  | "Renovation"
  | "Addition"
  | "Assessment";

export type JobStatus = "Active" | "On Hold" | "Complete" | "Cancelled";

export interface Job {
  id: string;
  jobNumber: string;
  jobName: string;
  proposalId?: string;
  clientId: string;
  contactId?: string;
  ownerId: string;
  projectTypeId: string;
  disciplineId: string;
  deliveryMethodId: string;
  pmEmployeeId: string;
  workType: WorkType;
  complexity: 1 | 2 | 3 | 4 | 5;
  structuralSystemIds: string[];
  address: string;
  city: string;
  state: string;
  zip: string;
  size?: number;
  sizeUnit?: string;
  constructionCost?: number;
  status: JobStatus;
  startDate: string;
  estEndDate: string;
  actualEndDate?: string;
}

// ---------------------------------------------------------------------------
// Activity tables
// ---------------------------------------------------------------------------

export type ProposalStatus = "Pending" | "Won" | "Lost" | "Withdrawn";

export interface Proposal {
  id: string;
  clientId: string;
  ownerId?: string;
  projectTypeId: string;
  disciplineId: string;
  deliveryMethodId: string;
  proposalDate: string;
  projectName: string;
  estConstructionCost?: number;
  proposedFee: number;
  status: ProposalStatus;
  decisionDate?: string;
  lossReason?: string;
}

export type PhaseName =
  | "Schematic Design"
  | "Design Development"
  | "Construction Documents"
  | "Permitting"
  | "Construction Administration";

export interface JobPhase {
  id: string;
  jobId: string;
  phaseName: PhaseName;
  budgetHours: number;
  budgetCost: number;
  startDate?: string;
  endDate?: string;
  percentComplete: number; // 0..1
}

export type CostType = "Labor" | "Subconsultant" | "Reimbursable Expense";

export interface JobCost {
  id: string;
  jobId: string;
  phaseId?: string;
  costType: CostType;
  costDate: string;
  hours?: number;
  amount: number;
  sourceRef?: string;
  employeeId?: string;
}

export interface JobFee {
  id: string;
  jobId: string;
  feeStructureId: string;
  serviceTypeId: string;
  feeAmount: number;
  feePercent?: number;
  isChangeOrder: boolean;
  effectiveDate: string;
  notes?: string;
}

export type InvoiceStatus = "Draft" | "Sent" | "Paid" | "Void";

export interface Invoice {
  id: string;
  jobId: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: number;
  status: InvoiceStatus;
  paidDate?: string;
}

export interface BacklogSnapshot {
  id: string;
  jobId: string;
  snapshotDate: string;
  contractValue: number;
  billedToDate: number;
  remainingValue: number;
  projectedCompletion?: string;
}

// ---------------------------------------------------------------------------
// The full demo dataset, as produced by the seed generator
// ---------------------------------------------------------------------------

export interface ArloDataset {
  meta: {
    companyName: string;
    generatedAt: string;
    seed: number;
  };
  lookups: {
    ownerTypes: OwnerType[];
    projectTypes: ProjectType[];
    disciplines: Discipline[];
    deliveryMethods: DeliveryMethod[];
    structuralSystems: StructuralSystem[];
    feeStructures: FeeStructure[];
    serviceTypes: ServiceType[];
  };
  clients: Client[];
  contacts: Contact[];
  owners: Owner[];
  employees: Employee[];
  jobs: Job[];
  proposals: Proposal[];
  jobPhases: JobPhase[];
  jobCosts: JobCost[];
  jobFees: JobFee[];
  invoices: Invoice[];
  backlogSnapshots: BacklogSnapshot[];
}
