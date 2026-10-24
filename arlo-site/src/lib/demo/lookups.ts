/**
 * Small id -> record lookup helpers, so every screen resolves foreign
 * keys the same way instead of re-writing `.find()` everywhere.
 */

import type { ArloDataset } from "@/lib/demo/types";

export function findClient(dataset: ArloDataset, id: string) {
  return dataset.clients.find((c) => c.id === id);
}

export function findContact(dataset: ArloDataset, id?: string) {
  return id ? dataset.contacts.find((c) => c.id === id) : undefined;
}

export function findOwner(dataset: ArloDataset, id: string) {
  return dataset.owners.find((o) => o.id === id);
}

export function findEmployee(dataset: ArloDataset, id?: string) {
  return id ? dataset.employees.find((e) => e.id === id) : undefined;
}

export function findProjectType(dataset: ArloDataset, id: string) {
  return dataset.lookups.projectTypes.find((p) => p.id === id);
}

export function findDiscipline(dataset: ArloDataset, id: string) {
  return dataset.lookups.disciplines.find((d) => d.id === id);
}

export function findDeliveryMethod(dataset: ArloDataset, id: string) {
  return dataset.lookups.deliveryMethods.find((d) => d.id === id);
}

export function findStructuralSystems(dataset: ArloDataset, ids: string[]) {
  return dataset.lookups.structuralSystems.filter((s) => ids.includes(s.id));
}

export function findFeeStructure(dataset: ArloDataset, id: string) {
  return dataset.lookups.feeStructures.find((f) => f.id === id);
}

export function findServiceType(dataset: ArloDataset, id: string) {
  return dataset.lookups.serviceTypes.find((s) => s.id === id);
}
