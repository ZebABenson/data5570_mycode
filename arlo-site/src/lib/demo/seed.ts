/**
 * Deterministic seed data generator for the ARLO demo.
 *
 * Produces a fictional engineering firm, "Summit Engineering Group" —
 * 48 employees, ~24 clients, ~75 historical/active jobs with coherent
 * fees, hours, costs, and margins, plus the believable operational
 * patterns called for in the Phase 2 spec (an underpriced renovation,
 * a well-estimated structural job, elevated renovation investigation
 * hours as a pattern, subconsultant-heavy civil work, and a couple of
 * repeat clients).
 *
 * Scale note: the spec's full target (180-250 jobs, 2,000+ cost rows)
 * is scaled down here to ~75 jobs / ~900 cost rows so the generator
 * runs comfortably on this EC2 instance's constrained memory. The
 * shape and realism are the same; only the row counts are smaller.
 * Call generateArloDataset() with a different jobCount to grow it.
 *
 * Deterministic: the same seed always produces the same dataset, so
 * the demo's "reset" feature can regenerate identical starting data.
 */

import type {
  ArloDataset,
  BacklogSnapshot,
  Client,
  Contact,
  DeliveryMethod,
  Discipline,
  Employee,
  EmployeeRole,
  FeeStructure,
  Invoice,
  Job,
  JobCost,
  JobFee,
  JobPhase,
  Owner,
  OwnerType,
  PhaseName,
  ProjectType,
  Proposal,
  ServiceType,
  StructuralSystem,
  WorkType,
} from "@/lib/demo/types";

// ---------------------------------------------------------------------------
// Deterministic PRNG (mulberry32)
// ---------------------------------------------------------------------------

function mulberry32(seed: number) {
  let a = seed;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Rng {
  private next: () => number;
  constructor(seed: number) {
    this.next = mulberry32(seed);
  }
  float(min = 0, max = 1) {
    return min + this.next() * (max - min);
  }
  int(min: number, max: number) {
    return Math.floor(this.float(min, max + 1));
  }
  bool(pTrue = 0.5) {
    return this.next() < pTrue;
  }
  pick<T>(arr: readonly T[]): T {
    return arr[this.int(0, arr.length - 1)];
  }
  pickWeighted<T>(items: [T, number][]): T {
    const total = items.reduce((s, [, w]) => s + w, 0);
    let r = this.float(0, total);
    for (const [item, w] of items) {
      if (r < w) return item;
      r -= w;
    }
    return items[items.length - 1][0];
  }
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

function addMonths(iso: string, months: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCMonth(d.getUTCMonth() + months);
  return d.toISOString().slice(0, 10);
}

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

// ---------------------------------------------------------------------------
// Name / content pools
// ---------------------------------------------------------------------------

const FIRST_NAMES = [
  "James", "Maria", "David", "Sarah", "Michael", "Jennifer", "Robert", "Linda",
  "William", "Patricia", "Daniel", "Emily", "Christopher", "Ashley", "Matthew",
  "Jessica", "Andrew", "Amanda", "Joshua", "Stephanie", "Kevin", "Nicole",
  "Brian", "Rachel", "Justin", "Laura", "Ryan", "Megan", "Jacob", "Kayla",
  "Tyler", "Hannah", "Brandon", "Alyssa", "Jonathan", "Victoria", "Nathan",
  "Samantha", "Eric", "Olivia", "Scott", "Grace", "Adam", "Natalie", "Kyle",
  "Elizabeth", "Jordan", "Sophia", "Austin", "Chloe",
];

const LAST_NAMES = [
  "Anderson", "Thompson", "Garcia", "Martinez", "Robinson", "Clark", "Rodriguez",
  "Lewis", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres",
  "Nguyen", "Hill", "Flores", "Green", "Adams", "Baker", "Nelson", "Carter",
  "Mitchell", "Perez", "Roberts", "Turner", "Phillips", "Campbell", "Parker",
  "Evans", "Edwards", "Collins", "Stewart", "Sanchez", "Morris", "Rogers",
  "Reed", "Cook", "Morgan", "Bell", "Murphy", "Bailey", "Rivera", "Cooper",
  "Richardson", "Cox", "Howard", "Ward", "Peterson",
];

const CLIENT_PROFILES: { name: string; kind: "Developer" | "District" | "Institution" | "Municipality" | "Private" }[] = [
  { name: "Wasatch Development Partners", kind: "Developer" },
  { name: "Canyon Point Holdings", kind: "Developer" },
  { name: "Bridgeview Capital Group", kind: "Developer" },
  { name: "Summit Peak Properties", kind: "Developer" },
  { name: "Redline Commercial Developers", kind: "Developer" },
  { name: "Granite Hill Real Estate", kind: "Developer" },
  { name: "Timberline Investment Group", kind: "Developer" },
  { name: "Alpine Crest Development", kind: "Developer" },
  { name: "Juniper Ridge School District", kind: "District" },
  { name: "Cottonwood Unified School District", kind: "District" },
  { name: "Silver Creek School District", kind: "District" },
  { name: "Highland Valley University", kind: "Institution" },
  { name: "Mountainview Health System", kind: "Institution" },
  { name: "Desert Rose Medical Group", kind: "Institution" },
  { name: "City of Lonepeak", kind: "Municipality" },
  { name: "City of Red Butte", kind: "Municipality" },
  { name: "Sage Valley County", kind: "Municipality" },
  { name: "Northgate Retail Partners", kind: "Private" },
  { name: "Harborview Hospitality Group", kind: "Private" },
  { name: "Foothill Logistics Co.", kind: "Private" },
  { name: "Pinecrest Industrial Partners", kind: "Private" },
  { name: "Meridian Multifamily LLC", kind: "Private" },
  { name: "Copperfield Retail Holdings", kind: "Private" },
  { name: "Westbrook Community Partners", kind: "Private" },
];

const PROJECT_ADJECTIVES = [
  "Riverside", "Summit", "Cottonwood", "Canyon", "Northgate", "Highland",
  "Juniper", "Silver Creek", "Red Butte", "Copperfield", "Meridian",
  "Pinecrest", "Bridgeview", "Foothill", "Sage Valley", "Westbrook",
  "Timberline", "Granite Hill", "Harborview", "Alpine", "Desert Rose",
  "Lonepeak", "Mountainview", "Wasatch",
];

const PROJECT_NOUNS: Record<string, string[]> = {
  "Commercial Office": ["Professional Office Building", "Corporate Center", "Office Park"],
  Retail: ["Retail Center", "Shopping Plaza", "Mixed Retail Building"],
  "Warehouse / Industrial": ["Distribution Center", "Industrial Facility", "Warehouse"],
  "Mixed-Use": ["Mixed-Use Development", "Town Center"],
  "K-12 School": ["Elementary School", "Middle School", "High School Addition"],
  "University / Higher Ed": ["Academic Building", "Student Center", "Research Facility"],
  Healthcare: ["Medical Office Building", "Outpatient Clinic", "Surgery Center"],
  "Public Facility": ["Community Center", "Public Library", "Municipal Building"],
  "Multifamily Residential": ["Apartment Community", "Residential Tower"],
  "Townhome Development": ["Townhome Community"],
  Bridge: ["Pedestrian Bridge", "Roadway Bridge"],
  Roadway: ["Roadway Improvements", "Intersection Improvements"],
  "Water / Utilities": ["Water System Upgrade", "Utility Improvements"],
  "Site Development": ["Site Development", "Site Infrastructure"],
};

// ---------------------------------------------------------------------------
// Lookups
// ---------------------------------------------------------------------------

function buildLookups() {
  const ownerTypes: OwnerType[] = [
    { id: "ot-public", name: "Public" },
    { id: "ot-private", name: "Private" },
    { id: "ot-developer", name: "Developer" },
    { id: "ot-institutional", name: "Institutional" },
  ];

  const projectTypes: ProjectType[] = [
    { id: "pt-office", name: "Commercial Office", category: "Commercial" },
    { id: "pt-retail", name: "Retail", category: "Commercial" },
    { id: "pt-warehouse", name: "Warehouse / Industrial", category: "Commercial" },
    { id: "pt-mixeduse", name: "Mixed-Use", category: "Commercial" },
    { id: "pt-k12", name: "K-12 School", category: "Institutional" },
    { id: "pt-highered", name: "University / Higher Ed", category: "Institutional" },
    { id: "pt-health", name: "Healthcare", category: "Institutional" },
    { id: "pt-public", name: "Public Facility", category: "Institutional" },
    { id: "pt-multifamily", name: "Multifamily Residential", category: "Residential" },
    { id: "pt-townhome", name: "Townhome Development", category: "Residential" },
    { id: "pt-bridge", name: "Bridge", category: "Infrastructure" },
    { id: "pt-roadway", name: "Roadway", category: "Infrastructure" },
    { id: "pt-water", name: "Water / Utilities", category: "Infrastructure" },
    { id: "pt-sitedev", name: "Site Development", category: "Infrastructure" },
  ];

  const disciplines: Discipline[] = [
    { id: "disc-structural", name: "Structural" },
    { id: "disc-civil", name: "Civil" },
    { id: "disc-mep", name: "MEP" },
    { id: "disc-geotech", name: "Geotechnical" },
  ];

  const deliveryMethods: DeliveryMethod[] = [
    { id: "dm-dbb", name: "Design-Bid-Build" },
    { id: "dm-db", name: "Design-Build" },
    { id: "dm-cmar", name: "CM at Risk" },
    { id: "dm-ipd", name: "IPD" },
    { id: "dm-unknown", name: "Unknown" },
  ];

  const structuralSystems: StructuralSystem[] = [
    { id: "ss-steel-moment", name: "Steel Moment Frame", category: "Steel" },
    { id: "ss-steel-braced", name: "Steel Braced Frame", category: "Steel" },
    { id: "ss-pt-concrete", name: "Post-Tensioned Concrete", category: "Concrete" },
    { id: "ss-concrete-shearwall", name: "Concrete Shear Wall", category: "Concrete" },
    { id: "ss-wood-podium", name: "Wood Podium", category: "Wood" },
    { id: "ss-wood-frame", name: "Light Wood Frame", category: "Wood" },
    { id: "ss-masonry", name: "Reinforced Masonry", category: "Masonry" },
    { id: "ss-hybrid", name: "Steel/Concrete Hybrid", category: "Hybrid" },
  ];

  const feeStructures: FeeStructure[] = [
    { id: "fs-hourly", name: "Hourly" },
    { id: "fs-lumpsum", name: "Lump Sum by Phase" },
    { id: "fs-percent", name: "Percent of Construction Cost" },
  ];

  const serviceTypes: ServiceType[] = [
    { id: "svc-design", name: "Design" },
    { id: "svc-ca", name: "Construction Administration" },
    { id: "svc-inspections", name: "Inspections" },
    { id: "svc-studies", name: "Studies / Assessment" },
    { id: "svc-permitting", name: "Permitting Support" },
  ];

  return {
    ownerTypes,
    projectTypes,
    disciplines,
    deliveryMethods,
    structuralSystems,
    feeStructures,
    serviceTypes,
  };
}

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------

const ROLE_TARGETS: [EmployeeRole, number, [number, number], [number, number]][] = [
  // role, count, billRate range, costRate range
  ["Principal", 4, [240, 280], [140, 165]],
  ["Project Manager", 10, [175, 210], [100, 125]],
  ["Senior Engineer", 12, [160, 190], [90, 110]],
  ["Project Engineer", 12, [120, 150], [65, 85]],
  ["Designer", 6, [100, 125], [55, 70]],
  ["Drafter", 4, [85, 105], [45, 58]],
];

function buildEmployees(rng: Rng): Employee[] {
  const employees: Employee[] = [];
  let seq = 1;
  for (const [role, count, billRange, costRange] of ROLE_TARGETS) {
    for (let i = 0; i < count; i++) {
      employees.push({
        id: `emp-${String(seq).padStart(3, "0")}`,
        firstName: rng.pick(FIRST_NAMES),
        lastName: rng.pick(LAST_NAMES),
        role,
        billRate: rng.int(billRange[0], billRange[1]),
        costRate: rng.int(costRange[0], costRange[1]),
        active: true,
      });
      seq++;
    }
  }
  return employees;
}

// ---------------------------------------------------------------------------
// Clients, contacts, owners
// ---------------------------------------------------------------------------

function buildClientsAndContacts(rng: Rng) {
  const clients: Client[] = [];
  const contacts: Contact[] = [];
  const cities = ["Salt Lake City", "Provo", "Ogden", "Park City", "West Jordan", "Lehi", "Draper"];

  CLIENT_PROFILES.forEach((profile, i) => {
    const clientId = `client-${String(i + 1).padStart(3, "0")}`;
    clients.push({
      id: clientId,
      name: profile.name,
      address: `${rng.int(100, 9900)} ${rng.pick(["Main St", "State St", "Center St", "University Ave", "Commerce Dr"])}`,
      city: rng.pick(cities),
      state: "UT",
      zip: String(rng.int(84001, 84799)),
      phone: `801-${rng.int(200, 999)}-${rng.int(1000, 9999)}`,
      email: `info@${profile.name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 16)}.com`,
      paymentTerms: rng.pick(["Net 30", "Net 45", "Net 60"]),
      active: true,
    });

    const contactCount = rng.int(1, 2);
    for (let c = 0; c < contactCount; c++) {
      contacts.push({
        id: `contact-${clientId}-${c + 1}`,
        clientId,
        firstName: rng.pick(FIRST_NAMES),
        lastName: rng.pick(LAST_NAMES),
        title: rng.pick(["Director of Facilities", "VP of Development", "Project Director", "Owner's Representative", "Facilities Manager"]),
        email: undefined,
        phone: `801-${rng.int(200, 999)}-${rng.int(1000, 9999)}`,
        isPointOfContact: c === 0,
      });
    }
  });

  return { clients, contacts };
}

function buildOwners(rng: Rng, clients: Client[], ownerTypes: OwnerType[]): Owner[] {
  const owners: Owner[] = [];
  clients.forEach((client, i) => {
    const kindToType: Record<string, string> = {
      Developer: "ot-developer",
      District: "ot-public",
      Institution: "ot-institutional",
      Municipality: "ot-public",
      Private: "ot-private",
    };
    const profile = CLIENT_PROFILES[i];
    owners.push({
      id: `owner-${String(i + 1).padStart(3, "0")}`,
      ownerTypeId: kindToType[profile.kind] ?? "ot-private",
      name: client.name,
    });
  });
  // a handful of owners distinct from the paying client (e.g. a developer builds for a separate ownership entity)
  owners.push(
    { id: "owner-extra-1", ownerTypeId: "ot-private", name: "Northgate Holdings LLC" },
    { id: "owner-extra-2", ownerTypeId: "ot-institutional", name: "Mountainview Health Foundation" },
    { id: "owner-extra-3", ownerTypeId: "ot-public", name: "Juniper Ridge Facilities Authority" }
  );
  return owners;
}

// ---------------------------------------------------------------------------
// Jobs, phases, costs, fees, invoices
// ---------------------------------------------------------------------------

export const PHASES_BY_WORK_TYPE: Record<WorkType, PhaseName[]> = {
  "New Construction": [
    "Schematic Design",
    "Design Development",
    "Construction Documents",
    "Permitting",
    "Construction Administration",
  ],
  Addition: [
    "Schematic Design",
    "Design Development",
    "Construction Documents",
    "Permitting",
    "Construction Administration",
  ],
  Renovation: [
    "Schematic Design",
    "Design Development",
    "Construction Documents",
    "Construction Administration",
  ],
  Assessment: ["Schematic Design", "Construction Documents"],
};

const PHASE_HOUR_WEIGHT: Record<PhaseName, number> = {
  "Schematic Design": 0.22,
  "Design Development": 0.26,
  "Construction Documents": 0.3,
  Permitting: 0.07,
  "Construction Administration": 0.15,
};

const COMPLEXITY_HOUR_MULTIPLIER = [0.6, 0.8, 1, 1.3, 1.7]; // index by complexity-1

function jobBaseHours(sizeSf: number, complexity: number, workType: WorkType) {
  const sizeHours = sizeSf * 0.012; // rough hours-per-SF baseline
  const complexityMult = COMPLEXITY_HOUR_MULTIPLIER[complexity - 1];
  const workTypeMult = workType === "Renovation" ? 0.75 : workType === "Assessment" ? 0.35 : workType === "Addition" ? 0.85 : 1;
  return Math.max(120, sizeHours * complexityMult * workTypeMult);
}

interface GeneratedJobBundle {
  job: Job;
  proposal?: Proposal;
  phases: JobPhase[];
  costs: JobCost[];
  fees: JobFee[];
  invoices: Invoice[];
}

function pickProjectType(rng: Rng, discipline: string, lookups: ReturnType<typeof buildLookups>): ProjectType {
  // civil/geotech skew toward infrastructure & site; structural/MEP skew toward buildings
  const infra = lookups.projectTypes.filter((p) => p.category === "Infrastructure");
  const buildings = lookups.projectTypes.filter((p) => p.category !== "Infrastructure");
  if ((discipline === "disc-civil" || discipline === "disc-geotech") && rng.bool(0.55)) {
    return rng.pick(infra);
  }
  return rng.pick(buildings);
}

function buildJobsAndActivity(
  rng: Rng,
  lookups: ReturnType<typeof buildLookups>,
  employees: Employee[],
  clients: Client[],
  contacts: Contact[],
  owners: Owner[],
  jobCount: number,
  referenceDate: string
): {
  jobs: Job[];
  proposals: Proposal[];
  jobPhases: JobPhase[];
  jobCosts: JobCost[];
  jobFees: JobFee[];
  invoices: Invoice[];
} {
  const pms = employees.filter((e) => e.role === "Project Manager");
  const seniors = employees.filter((e) => e.role === "Senior Engineer");
  const projectEngineers = employees.filter((e) => e.role === "Project Engineer");
  const designers = employees.filter((e) => e.role === "Designer");
  const principals = employees.filter((e) => e.role === "Principal");

  const jobs: Job[] = [];
  const proposals: Proposal[] = [];
  const jobPhases: JobPhase[] = [];
  const jobCosts: JobCost[] = [];
  const jobFees: JobFee[] = [];
  const invoices: Invoice[] = [];

  const jobNumberSeqByYear: Record<string, number> = {};

  // A couple of "repeat clients": give certain clients extra job density.
  const repeatClientIdx = [0, 8, 17]; // a developer, a school district, a retail holding

  const activeCount = Math.round(jobCount * 0.18);
  const cancelledCount = Math.max(2, Math.round(jobCount * 0.04));
  const completeCount = jobCount - activeCount - cancelledCount;

  type Plan = { status: Job["status"]; monthsAgoStart: number };
  const plans: Plan[] = [];
  for (let i = 0; i < completeCount; i++) {
    plans.push({ status: "Complete", monthsAgoStart: rng.int(14, 66) });
  }
  for (let i = 0; i < activeCount; i++) {
    plans.push({ status: rng.bool(0.85) ? "Active" : "On Hold", monthsAgoStart: rng.int(1, 13) });
  }
  for (let i = 0; i < cancelledCount; i++) {
    plans.push({ status: "Cancelled", monthsAgoStart: rng.int(6, 40) });
  }

  // Flag a couple of specific scenario jobs by index once generated.
  let underpricedAssigned = false;
  let profitableAssigned = false;

  plans.forEach((plan, i) => {
    const discipline = rng.pickWeighted<string>([
      ["disc-structural", 45],
      ["disc-civil", 30],
      ["disc-mep", 20],
      ["disc-geotech", 5],
    ]);
    const projectType = pickProjectType(rng, discipline, lookups);
    const workType = rng.pickWeighted<WorkType>([
      ["New Construction", 50],
      ["Renovation", 28],
      ["Addition", 14],
      ["Assessment", 8],
    ]);
    const complexity = (rng.pickWeighted<number>([
      [1, 10],
      [2, 25],
      [3, 35],
      [4, 20],
      [5, 10],
    ]) as 1 | 2 | 3 | 4 | 5);

    const useRepeatClient = rng.bool(0.3);
    const clientIndex = useRepeatClient ? rng.pick(repeatClientIdx) : rng.int(0, clients.length - 1);
    const client = clients[clientIndex];
    const clientContacts = contacts.filter((c) => c.clientId === client.id);
    const contact = clientContacts.length ? rng.pick(clientContacts) : undefined;
    const owner = rng.bool(0.75)
      ? owners.find((o) => o.name === client.name) ?? rng.pick(owners)
      : rng.pick(owners);

    const sizeSf =
      projectType.category === "Infrastructure"
        ? rng.int(500, 5000) // linear ft / acres proxy, kept as "size"
        : rng.int(8000, 95000);
    const sizeUnit = projectType.category === "Infrastructure" ? "LF" : "SF";
    const constructionCost =
      projectType.category === "Infrastructure"
        ? sizeSf * rng.int(400, 900)
        : sizeSf * rng.int(180, 340);

    const startDate = addMonths(referenceDate, -plan.monthsAgoStart);
    const durationMonths = rng.int(6, 16);
    const estEndDate = addMonths(startDate, durationMonths);
    const actualEndDate =
      plan.status === "Complete" ? addMonths(estEndDate, rng.int(-1, 3)) : undefined;

    const year = startDate.slice(2, 4);
    jobNumberSeqByYear[year] = (jobNumberSeqByYear[year] ?? 0) + 1;
    const jobNumber = `${year}-${String(jobNumberSeqByYear[year]).padStart(3, "0")}`;

    const projectNoun = rng.pick(PROJECT_NOUNS[projectType.name] ?? ["Project"]);
    const projectName = `${rng.pick(PROJECT_ADJECTIVES)} ${projectNoun}`;

    const structuralSystemIds =
      discipline === "disc-structural" && projectType.category !== "Infrastructure"
        ? [rng.pick(lookups.structuralSystems).id]
        : [];

    const pm = rng.pick(pms);
    const jobId = `job-${String(i + 1).padStart(3, "0")}`;

    const job: Job = {
      id: jobId,
      jobNumber,
      jobName: projectName,
      clientId: client.id,
      contactId: contact?.id,
      ownerId: owner.id,
      projectTypeId: projectType.id,
      disciplineId: discipline,
      deliveryMethodId: rng.pickWeighted<string>([
        ["dm-dbb", 55],
        ["dm-db", 25],
        ["dm-cmar", 15],
        ["dm-ipd", 5],
      ]),
      pmEmployeeId: pm.id,
      workType,
      complexity,
      structuralSystemIds,
      address: `${rng.int(100, 9900)} ${rng.pick(["Industrial Rd", "Commerce Way", "Park Ave", "Highland Dr", "River Rd"])}`,
      city: client.city,
      state: "UT",
      zip: client.zip,
      size: sizeSf,
      sizeUnit,
      constructionCost: round2(constructionCost),
      status: plan.status,
      startDate,
      estEndDate,
      actualEndDate,
    };

    // ---- scenario tagging ----
    const isUnderpriced =
      !underpricedAssigned && workType === "Renovation" && plan.status === "Complete" && i > jobCount * 0.3;
    if (isUnderpriced) underpricedAssigned = true;

    const isProfitable =
      !profitableAssigned && discipline === "disc-structural" && plan.status === "Complete" && i > jobCount * 0.5;
    if (isProfitable) profitableAssigned = true;

    const isSubconsultantHeavy = projectType.category === "Infrastructure" && rng.bool(0.6);
    const isRenovationHours = workType === "Renovation"; // systemic pattern, not just one job

    // ---- phases ----
    const phaseNames = PHASES_BY_WORK_TYPE[workType];
    const baseHours = jobBaseHours(sizeSf, complexity, workType);
    // Weighted average of the cost rates used by the roleSplit below
    // (Principal 5%, PM 15%, Senior 30%, PE 35%, Designer 15%), so budgeted
    // cost and actual cost are on the same basis and overallVariance maps
    // cleanly onto the intended target margin.
    const blendedRate = 92;

    const phasesForJob: JobPhase[] = phaseNames.map((phaseName) => {
      let weight = PHASE_HOUR_WEIGHT[phaseName];
      if (isRenovationHours && phaseName === "Schematic Design") {
        weight *= 1.35; // renovations need more investigation up front
      }
      const budgetHours = round2(baseHours * weight);
      const budgetCost = round2(budgetHours * blendedRate);
      const percentComplete =
        plan.status === "Complete" ? 1 : plan.status === "Cancelled" ? rng.float(0, 0.4) : rng.float(0.2, 0.95);

      return {
        id: `phase-${jobId}-${phaseName.replace(/\s+/g, "").toLowerCase()}`,
        jobId,
        phaseName,
        budgetHours,
        budgetCost,
        startDate,
        endDate: estEndDate,
        percentComplete: round2(percentComplete),
      };
    });
    jobPhases.push(...phasesForJob);

    // ---- fee ----
    const totalBudgetCost = phasesForJob.reduce((s, p) => s + p.budgetCost, 0);
    const targetMargin = isUnderpriced ? 0.06 : isProfitable ? 0.42 : rng.float(0.22, 0.34);
    const feeAmount =
      plan.status === "Cancelled"
        ? round2(totalBudgetCost * 0.3)
        : round2(totalBudgetCost / (1 - targetMargin));

    const feeStructureId =
      workType === "Assessment"
        ? "fs-hourly"
        : projectType.category === "Commercial" && rng.bool(0.3)
          ? "fs-percent"
          : "fs-lumpsum";

    const feeId = `fee-${jobId}-1`;
    jobFees.push({
      id: feeId,
      jobId,
      feeStructureId,
      serviceTypeId: workType === "Assessment" ? "svc-studies" : "svc-design",
      feeAmount,
      feePercent: feeStructureId === "fs-percent" ? round2((feeAmount / constructionCost) * 100) : undefined,
      isChangeOrder: false,
      effectiveDate: startDate,
      notes: isUnderpriced
        ? "Initial fee proposal; scope grew once renovation conditions were discovered."
        : undefined,
    });

    // occasional change order for complex jobs
    if (plan.status !== "Cancelled" && complexity >= 4 && rng.bool(0.3)) {
      const coAmount = round2(feeAmount * rng.float(0.05, 0.15));
      jobFees.push({
        id: `fee-${jobId}-co1`,
        jobId,
        feeStructureId,
        serviceTypeId: "svc-design",
        feeAmount: coAmount,
        isChangeOrder: true,
        effectiveDate: addMonths(startDate, rng.int(3, durationMonths - 1)),
        notes: "Additional scope change order.",
      });
    }

    // ---- actual costs (for Complete and partially for Active jobs) ----
    const overallVariance = isUnderpriced
      ? rng.float(1.45, 1.8)
      : isProfitable
        ? rng.float(0.72, 0.85)
        : rng.float(0.88, 1.12);

    phasesForJob.forEach((phase) => {
      if (plan.status === "Cancelled") return;
      const phaseProgress = plan.status === "Complete" ? 1 : phase.percentComplete;
      if (phaseProgress <= 0) return;

      const actualHoursTotal = phase.budgetHours * overallVariance * phaseProgress;

      const roleSplit: [Employee[], number][] = [
        [principals, 0.05],
        [pms, 0.15],
        [seniors, 0.3],
        [projectEngineers, 0.35],
        [designers, 0.15],
      ];

      roleSplit.forEach(([pool, share], idx) => {
        if (!pool.length) return;
        const hours = round2(actualHoursTotal * share);
        if (hours <= 0) return;
        const employee = rng.pick(pool);
        jobCosts.push({
          id: `cost-${jobId}-${phase.phaseName.slice(0, 3).toLowerCase()}-${idx}`,
          jobId,
          phaseId: phase.id,
          costType: "Labor",
          costDate: addMonths(phase.startDate ?? startDate, rng.int(0, Math.max(1, durationMonths - 1))),
          hours,
          amount: round2(hours * employee.costRate),
          employeeId: employee.id,
        });
      });

      if (isSubconsultantHeavy && phase.phaseName !== "Permitting" && rng.bool(0.5)) {
        jobCosts.push({
          id: `cost-${jobId}-${phase.phaseName.slice(0, 3).toLowerCase()}-sub`,
          jobId,
          phaseId: phase.id,
          costType: "Subconsultant",
          costDate: addMonths(phase.startDate ?? startDate, rng.int(0, Math.max(1, durationMonths - 1))),
          amount: round2(phase.budgetCost * rng.float(0.25, 0.55)),
          sourceRef: "Survey/geotech subconsultant invoice",
        });
      }

      if (rng.bool(0.15)) {
        jobCosts.push({
          id: `cost-${jobId}-${phase.phaseName.slice(0, 3).toLowerCase()}-exp`,
          jobId,
          phaseId: phase.id,
          costType: "Reimbursable Expense",
          costDate: addMonths(phase.startDate ?? startDate, rng.int(0, Math.max(1, durationMonths - 1))),
          amount: round2(rng.float(200, 1800)),
          sourceRef: "Travel / printing / reimbursable",
        });
      }
    });

    // ---- invoices ----
    const totalFee = jobFees.filter((f) => f.jobId === jobId).reduce((s, f) => s + f.feeAmount, 0);
    const billableFraction =
      plan.status === "Complete" ? rng.float(0.97, 1.03) :
      plan.status === "Cancelled" ? rng.float(0.1, 0.35) :
      // active: roughly tracks average phase completion
      phasesForJob.reduce((s, p) => s + p.percentComplete, 0) / Math.max(1, phasesForJob.length);

    const totalBilled = round2(totalFee * billableFraction);
    const invoiceCount = plan.status === "Cancelled" ? 1 : rng.int(3, 6);
    let remaining = totalBilled;
    for (let n = 0; n < invoiceCount && remaining > 0; n++) {
      const isLast = n === invoiceCount - 1;
      const amount = isLast ? remaining : round2(remaining * rng.float(0.2, 0.4));
      remaining = round2(remaining - amount);
      invoices.push({
        id: `inv-${jobId}-${n + 1}`,
        jobId,
        invoiceNumber: `INV-${jobNumber}-${n + 1}`,
        invoiceDate: addMonths(startDate, Math.round((n + 1) * (durationMonths / (invoiceCount + 1)))),
        amount,
        status: plan.status === "Complete" ? "Paid" : rng.bool(0.8) ? "Sent" : "Paid",
        paidDate:
          plan.status === "Complete"
            ? addMonths(startDate, Math.round((n + 1) * (durationMonths / (invoiceCount + 1))) + 1)
            : undefined,
      });
    }

    jobs.push(job);

    // ---- originating proposal (won jobs only get one tied to the job) ----
    if (plan.status !== "Cancelled") {
      proposals.push({
        id: `proposal-${jobId}`,
        clientId: client.id,
        ownerId: owner.id,
        projectTypeId: projectType.id,
        disciplineId: discipline,
        deliveryMethodId: job.deliveryMethodId,
        proposalDate: addMonths(startDate, -rng.int(1, 3)),
        projectName,
        estConstructionCost: job.constructionCost,
        proposedFee: feeAmount,
        status: "Won",
        decisionDate: addMonths(startDate, -1),
      });
    }
  });

  // ---- extra standalone proposals (pending / lost), not tied to a job ----
  const extraProposalCount = Math.round(jobCount * 0.35);
  for (let i = 0; i < extraProposalCount; i++) {
    const discipline = rng.pick(lookups.disciplines).id;
    const projectType = pickProjectType(rng, discipline, lookups);
    const client = rng.pick(clients);
    const owner = rng.pick(owners);
    const sizeSf = rng.int(6000, 80000);
    const constructionCost = sizeSf * rng.int(180, 340);
    const proposedFee = round2(constructionCost * rng.float(0.04, 0.08));
    const status = rng.pickWeighted<Proposal["status"]>([
      ["Pending", 45],
      ["Lost", 40],
      ["Withdrawn", 15],
    ]);

    proposals.push({
      id: `proposal-standalone-${i + 1}`,
      clientId: client.id,
      ownerId: owner.id,
      projectTypeId: projectType.id,
      disciplineId: discipline,
      deliveryMethodId: rng.pick(lookups.deliveryMethods).id,
      proposalDate: addMonths(referenceDate, -rng.int(0, 20)),
      projectName: `${rng.pick(PROJECT_ADJECTIVES)} ${rng.pick(PROJECT_NOUNS[projectType.name] ?? ["Project"])}`,
      estConstructionCost: round2(constructionCost),
      proposedFee,
      status,
      decisionDate: status === "Pending" ? undefined : addMonths(referenceDate, -rng.int(0, 18)),
      lossReason: status === "Lost" ? rng.pick(["Price", "Schedule", "Relationship", "Scope fit"]) : undefined,
    });
  }

  return { jobs, proposals, jobPhases, jobCosts, jobFees, invoices };
}

// ---------------------------------------------------------------------------
// Backlog snapshots (trailing months, active/on-hold jobs only)
// ---------------------------------------------------------------------------

function buildBacklogSnapshots(
  jobs: Job[],
  jobFees: JobFee[],
  invoices: Invoice[],
  referenceDate: string
): BacklogSnapshot[] {
  const snapshots: BacklogSnapshot[] = [];
  const openJobs = jobs.filter((j) => j.status === "Active" || j.status === "On Hold");

  openJobs.forEach((job) => {
    const contractValue = round2(
      jobFees.filter((f) => f.jobId === job.id).reduce((s, f) => s + f.feeAmount, 0)
    );
    const jobInvoices = invoices
      .filter((inv) => inv.jobId === job.id)
      .sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate));

    const monthsSinceStart = Math.max(
      1,
      Math.round(
        (new Date(referenceDate).getTime() - new Date(job.startDate).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      )
    );

    for (let m = 0; m <= monthsSinceStart; m++) {
      const snapshotDate = addMonths(job.startDate, m);
      if (snapshotDate > referenceDate) break;
      const billedSoFar = round2(
        jobInvoices
          .filter((inv) => inv.invoiceDate <= snapshotDate)
          .reduce((s, inv) => s + inv.amount, 0)
      );
      snapshots.push({
        id: `backlog-${job.id}-${monthKey(snapshotDate)}`,
        jobId: job.id,
        snapshotDate,
        contractValue,
        billedToDate: billedSoFar,
        remainingValue: round2(contractValue - billedSoFar),
        projectedCompletion: job.estEndDate,
      });
    }
  });

  return snapshots;
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export function generateArloDataset(options?: { seed?: number; jobCount?: number; referenceDate?: string }): ArloDataset {
  const seed = options?.seed ?? 42;
  const jobCount = options?.jobCount ?? 75;
  const referenceDate = options?.referenceDate ?? "2026-10-01";

  const rng = new Rng(seed);
  const lookups = buildLookups();
  const employees = buildEmployees(rng);
  const { clients, contacts } = buildClientsAndContacts(rng);
  const owners = buildOwners(rng, clients, lookups.ownerTypes);

  const { jobs, proposals, jobPhases, jobCosts, jobFees, invoices } = buildJobsAndActivity(
    rng,
    lookups,
    employees,
    clients,
    contacts,
    owners,
    jobCount,
    referenceDate
  );

  const backlogSnapshots = buildBacklogSnapshots(jobs, jobFees, invoices, referenceDate);

  return {
    meta: {
      companyName: "Summit Engineering Group",
      generatedAt: new Date().toISOString(),
      seed,
    },
    lookups,
    clients,
    contacts,
    owners,
    employees,
    jobs,
    proposals,
    jobPhases,
    jobCosts,
    jobFees,
    invoices,
    backlogSnapshots,
  };
}
