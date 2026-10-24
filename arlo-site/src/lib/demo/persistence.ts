/**
 * Browser-local persistence for the ARLO demo (Stage C).
 *
 * Stores the generated dataset, a small metadata record (company name,
 * creation time, seed), and guided-tour progress in IndexedDB, keyed in
 * a single "state" object store. No account, no server, no cross-device
 * sync — persistence is scoped to this browser/device only, per the
 * spec's seven-day demo requirement.
 *
 * The dataset expires seven days after creation; loading an expired demo
 * transparently regenerates a fresh one rather than erroring.
 */

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import type { ArloDataset } from "@/lib/demo/types";
import { generateArloDataset } from "@/lib/demo/seed";

const DB_NAME = "arlo-demo-db";
const DB_VERSION = 1;
const STORE_NAME = "state";
const DEMO_SEED = 42;
const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export interface DemoMeta {
  createdAt: string;
  companyName: string;
  seed: number;
}

export interface TourProgress {
  completedSteps: string[];
}

export interface DemoState {
  dataset: ArloDataset;
  meta: DemoMeta;
  tourProgress: TourProgress;
  expired: boolean;
  isNew: boolean;
}

interface ArloDemoDB extends DBSchema {
  state: {
    key: string;
    value: unknown;
  };
}

let dbPromise: Promise<IDBPDatabase<ArloDemoDB>> | null = null;

function getDb() {
  if (typeof window === "undefined" || typeof indexedDB === "undefined") {
    throw new Error("IndexedDB is only available in the browser.");
  }
  if (!dbPromise) {
    dbPromise = openDB<ArloDemoDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      },
    });
    // Surface a genuine open failure loudly (e.g. private-browsing storage
    // restrictions) instead of leaving callers hanging on an unsettled promise.
    dbPromise.catch((err) => {
      console.error("ARLO demo: failed to open IndexedDB", err);
    });
  }
  return dbPromise;
}

async function getValue<T>(key: string): Promise<T | undefined> {
  const db = await getDb();
  return (await db.get(STORE_NAME, key)) as T | undefined;
}

async function setValue<T>(key: string, value: T): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, value, key);
}

export function daysRemaining(meta: DemoMeta): number {
  const createdAtMs = new Date(meta.createdAt).getTime();
  const remainingMs = SEVEN_DAYS_MS - (Date.now() - createdAtMs);
  return Math.max(0, Math.ceil(remainingMs / (24 * 60 * 60 * 1000)));
}

export async function initDemoState(
  companyName = "Summit Engineering Group"
): Promise<DemoState> {
  const dataset = generateArloDataset({ seed: DEMO_SEED });
  const meta: DemoMeta = {
    createdAt: new Date().toISOString(),
    companyName,
    seed: DEMO_SEED,
  };
  const tourProgress: TourProgress = { completedSteps: [] };

  await setValue("dataset", dataset);
  await setValue("demoMeta", meta);
  await setValue("tourProgress", tourProgress);

  return { dataset, meta, tourProgress, expired: false, isNew: true };
}

export async function loadDemoState(): Promise<DemoState> {
  const meta = await getValue<DemoMeta>("demoMeta");
  if (!meta) {
    return initDemoState();
  }

  const expired = Date.now() - new Date(meta.createdAt).getTime() > SEVEN_DAYS_MS;
  if (expired) {
    return initDemoState(meta.companyName);
  }

  const dataset = await getValue<ArloDataset>("dataset");
  if (!dataset) {
    return initDemoState(meta.companyName);
  }

  const tourProgress =
    (await getValue<TourProgress>("tourProgress")) ?? { completedSteps: [] };

  return { dataset, meta, tourProgress, expired: false, isNew: false };
}

export async function saveDataset(dataset: ArloDataset): Promise<void> {
  await setValue("dataset", dataset);
}

export async function saveTourProgress(progress: TourProgress): Promise<void> {
  await setValue("tourProgress", progress);
}

export async function renameCompany(
  companyName: string,
  meta: DemoMeta
): Promise<DemoMeta> {
  const updated: DemoMeta = { ...meta, companyName };
  await setValue("demoMeta", updated);
  return updated;
}

export async function resetDemoState(companyName?: string): Promise<DemoState> {
  const existingMeta = await getValue<DemoMeta>("demoMeta");
  return initDemoState(companyName ?? existingMeta?.companyName ?? "Summit Engineering Group");
}
