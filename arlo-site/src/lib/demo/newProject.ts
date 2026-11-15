/**
 * Turns a submitted "New Project" form into a Proposal record (plus, when
 * the user entered a brand-new client, a Client/Contact pair) and appends
 * them to the in-browser ArloDataset -- the same append-and-persist shape
 * jobConversion.ts uses for Opportunity -> Job. A proposal is the closest
 * existing entity to an intake-stage project, so the form extends it
 * (see the optional fields on Proposal in types.ts) rather than inventing
 * a parallel type.
 */

import type { ArloDataset, Client, Contact, Proposal } from "@/lib/demo/types";

export interface NewClientInput {
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  email?: string;
}

export interface NewProjectInput {
  projectName: string;
  projectNumber: string;
  projectTypeId: string;
  disciplineId: string;
  deliveryMethodId: string;
  workType: Proposal["workType"];
  complexity?: 1 | 2 | 3 | 4 | 5;
  address: string;
  city: string;
  state: string;
  zip: string;
  size?: number;
  sizeUnit?: string;
  estConstructionCost?: number;
  startDate: string;
  estEndDate?: string;

  // Either an existing client id, or details for a brand-new client.
  clientId?: string;
  newClient?: NewClientInput;
  contactFirstName?: string;
  contactLastName?: string;
  contactTitle?: string;
  contactEmail?: string;
  contactPhone?: string;
  ownerId?: string;
  contractorName?: string;

  principalEmployeeId?: string;
  pmEmployeeId?: string;
  probability?: number;

  feeStructureId: string;
  serviceTypeId?: string;
  proposedFee: number;
  billingTerms?: string;

  comments?: string;
}

function nextClientId(dataset: ArloDataset): string {
  const nums = dataset.clients
    .map((c) => parseInt(c.id.replace("client-", ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `client-${String(max + 1).padStart(3, "0")}`;
}

function nextProposalId(dataset: ArloDataset): string {
  const existing = dataset.proposals
    .map((p) => p.id)
    .filter((id) => id.startsWith("proposal-new-"))
    .map((id) => parseInt(id.replace("proposal-new-", ""), 10))
    .filter((n) => !Number.isNaN(n));
  const max = existing.length > 0 ? Math.max(...existing) : 0;
  return `proposal-new-${max + 1}`;
}

/** Appends the new proposal (and new client/contact, if any) to the dataset. */
export function addProjectToDataset(
  dataset: ArloDataset,
  input: NewProjectInput
): { dataset: ArloDataset; proposalId: string } {
  let clients: Client[] = dataset.clients;
  let contacts: Contact[] = dataset.contacts;
  let clientId = input.clientId;

  if (!clientId && input.newClient) {
    const newId = nextClientId(dataset);
    const client: Client = {
      id: newId,
      name: input.newClient.name,
      address: input.newClient.address,
      city: input.newClient.city,
      state: input.newClient.state,
      zip: input.newClient.zip,
      phone: input.newClient.phone,
      email: input.newClient.email,
      active: true,
    };
    clients = [...clients, client];
    clientId = newId;
  }

  if (!clientId) {
    throw new Error("A client must be selected or a new client provided.");
  }

  let contactId: string | undefined;
  if (input.contactFirstName && input.contactLastName) {
    const newContactId = `contact-${clientId}-${contacts.filter((c) => c.clientId === clientId).length + 1}`;
    const contact: Contact = {
      id: newContactId,
      clientId,
      firstName: input.contactFirstName,
      lastName: input.contactLastName,
      title: input.contactTitle,
      email: input.contactEmail,
      phone: input.contactPhone,
      isPointOfContact: true,
    };
    contacts = [...contacts, contact];
    contactId = newContactId;
  }

  const proposalId = nextProposalId(dataset);
  const proposal: Proposal = {
    id: proposalId,
    clientId,
    contactId,
    ownerId: input.ownerId,
    projectTypeId: input.projectTypeId,
    disciplineId: input.disciplineId,
    deliveryMethodId: input.deliveryMethodId,
    proposalDate: input.startDate,
    projectName: input.projectName,
    estConstructionCost: input.estConstructionCost,
    proposedFee: input.proposedFee,
    status: "Pending",
    projectNumber: input.projectNumber,
    contractorName: input.contractorName,
    principalEmployeeId: input.principalEmployeeId,
    pmEmployeeId: input.pmEmployeeId,
    workType: input.workType,
    complexity: input.complexity,
    address: input.address,
    city: input.city,
    state: input.state,
    zip: input.zip,
    size: input.size,
    sizeUnit: input.sizeUnit,
    startDate: input.startDate,
    estEndDate: input.estEndDate,
    probability: input.probability,
    feeStructureId: input.feeStructureId,
    serviceTypeId: input.serviceTypeId,
    billingTerms: input.billingTerms,
    comments: input.comments,
  };

  return {
    dataset: {
      ...dataset,
      clients,
      contacts,
      proposals: [...dataset.proposals, proposal],
    },
    proposalId,
  };
}
