"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { ArloDataset } from "@/lib/demo/types";
import {
  daysRemaining as computeDaysRemaining,
  loadDemoState,
  renameCompany as renameCompanyPersist,
  resetDemoState,
  saveDataset,
  saveTourProgress,
  type DemoMeta,
  type TourProgress,
} from "@/lib/demo/persistence";

type DemoContextValue = {
  dataset: ArloDataset | null;
  meta: DemoMeta | null;
  tourProgress: TourProgress;
  loading: boolean;
  expired: boolean;
  daysRemaining: number;
  updateDataset: (updater: (dataset: ArloDataset) => ArloDataset) => void;
  completeTourStep: (step: string) => void;
  renameCompany: (name: string) => Promise<void>;
  resetDemo: () => Promise<void>;
};

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [dataset, setDataset] = useState<ArloDataset | null>(null);
  const [meta, setMeta] = useState<DemoMeta | null>(null);
  const [tourProgress, setTourProgress] = useState<TourProgress>({ completedSteps: [] });
  const [loading, setLoading] = useState(true);
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadDemoState()
      .then((state) => {
        if (cancelled) return;
        setDataset(state.dataset);
        setMeta(state.meta);
        setTourProgress(state.tourProgress);
        setExpired(state.expired);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const updateDataset = useCallback((updater: (d: ArloDataset) => ArloDataset) => {
    setDataset((prev) => {
      if (!prev) return prev;
      const next = updater(prev);
      void saveDataset(next);
      return next;
    });
  }, []);

  const completeTourStep = useCallback((step: string) => {
    setTourProgress((prev) => {
      if (prev.completedSteps.includes(step)) return prev;
      const next = { completedSteps: [...prev.completedSteps, step] };
      void saveTourProgress(next);
      return next;
    });
  }, []);

  const renameCompany = useCallback(
    async (name: string) => {
      if (!meta) return;
      const updated = await renameCompanyPersist(name, meta);
      setMeta(updated);
    },
    [meta]
  );

  const resetDemo = useCallback(async () => {
    setLoading(true);
    const state = await resetDemoState(meta?.companyName);
    setDataset(state.dataset);
    setMeta(state.meta);
    setTourProgress(state.tourProgress);
    setExpired(false);
    setLoading(false);
  }, [meta]);

  return (
    <DemoContext.Provider
      value={{
        dataset,
        meta,
        tourProgress,
        loading,
        expired,
        daysRemaining: meta ? computeDaysRemaining(meta) : 7,
        updateDataset,
        completeTourStep,
        renameCompany,
        resetDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return ctx;
}
