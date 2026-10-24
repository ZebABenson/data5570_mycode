"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useDemo } from "@/components/demo/DemoProvider";
import { findComparableJobs, recommendFee, type FeeQuery } from "@/lib/demo/comparables";
import {
  ROLES,
  avgCostRateByRole,
  avgHoursByPhaseAndRole,
  avgSubconsultantCostByPhase,
} from "@/lib/demo/estimating";
import { PHASES_BY_WORK_TYPE } from "@/lib/demo/seed";
import { findClient } from "@/lib/demo/lookups";
import { fmtCurrency, fmtNumber, fmtPercent } from "@/lib/demo/format";
import type { WorkType } from "@/lib/demo/types";

const WORK_TYPES: WorkType[] = ["New Construction", "Renovation", "Addition", "Assessment"];

export default function EstimatingPage() {
  const { dataset, loading, updateDataset } = useDemo();

  const [disciplineId, setDisciplineId] = useState("disc-structural");
  const [projectTypeId, setProjectTypeId] = useState("pt-office");
  const [workType, setWorkType] = useState<WorkType>("New Construction");
  const [deliveryMethodId, setDeliveryMethodId] = useState("dm-dbb");
  const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [size, setSize] = useState(45000);
  const [selectedProposalId, setSelectedProposalId] = useState("");

  const [hours, setHours] = useState<Record<string, number>>({});
  const [subconsultant, setSubconsultant] = useState<Record<string, number>>({});
  const [reimbursable, setReimbursable] = useState<Record<string, number>>({});
  const [proposedFee, setProposedFee] = useState(0);
  const [saved, setSaved] = useState(false);

  const pendingProposals = useMemo(
    () => dataset?.proposals.filter((p) => p.status === "Pending") ?? [],
    [dataset]
  );

  function loadProposal(id: string) {
    setSelectedProposalId(id);
    if (!dataset || !id) return;
    const proposal = dataset.proposals.find((p) => p.id === id);
    if (!proposal) return;
    setDisciplineId(proposal.disciplineId);
    setProjectTypeId(proposal.projectTypeId);
    setDeliveryMethodId(proposal.deliveryMethodId);
    if (proposal.estConstructionCost) {
      setSize(Math.round(proposal.estConstructionCost / 260));
    }
  }

  const query: FeeQuery = useMemo(
    () => ({ disciplineId, projectTypeId, workType, deliveryMethodId, complexity, size, sizeUnit: "SF" }),
    [disciplineId, projectTypeId, workType, deliveryMethodId, complexity, size]
  );

  const phases = PHASES_BY_WORK_TYPE[workType];

  const comparables = useMemo(
    () => (dataset ? findComparableJobs(dataset, query, 8) : []),
    [dataset, query]
  );
  const comparableJobIds = useMemo(() => comparables.map((c) => c.job.id), [comparables]);

  const historicalHours = useMemo(
    () => (dataset ? avgHoursByPhaseAndRole(dataset, comparableJobIds, phases) : {}),
    [dataset, comparableJobIds, phases]
  );
  const historicalSub = useMemo(
    () => (dataset ? avgSubconsultantCostByPhase(dataset, comparableJobIds, phases) : {}),
    [dataset, comparableJobIds, phases]
  );
  const costRates = useMemo(() => (dataset ? avgCostRateByRole(dataset) : ({} as Record<string, number>)), [dataset]);
  const recommendation = useMemo(() => recommendFee(comparables, query), [comparables, query]);

  const datasetReady = !!dataset;
  const resetSignature = `${disciplineId}|${projectTypeId}|${workType}|${deliveryMethodId}|${complexity}|${size}|${selectedProposalId}`;

  useEffect(() => {
    if (!datasetReady) return;
    setHours({ ...historicalHours });
    setSubconsultant({ ...historicalSub });
    setReimbursable(Object.fromEntries(phases.map((p) => [p, 0])));
    const proposal = dataset?.proposals.find((p) => p.id === selectedProposalId);
    setProposedFee(proposal?.proposedFee ?? recommendation.mid);
    setSaved(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetSignature, datasetReady]);

  if (loading || !dataset) {
    return (
      <main className="min-h-screen bg-mist">
        <DemoHeader />
        <Container className="py-16 text-center text-sm text-navy/50">Loading&hellip;</Container>
      </main>
    );
  }

  function phaseLaborCost(phase: string) {
    return ROLES.reduce((sum, role) => sum + (hours[`${phase}|${role}`] ?? 0) * (costRates[role] ?? 0), 0);
  }

  function phaseTotal(phase: string) {
    return phaseLaborCost(phase) + (subconsultant[phase] ?? 0) + (reimbursable[phase] ?? 0);
  }

  const estimatedCost = phases.reduce((sum, p) => sum + phaseTotal(p), 0);
  const grossProfit = proposedFee - estimatedCost;
  const grossMargin = proposedFee > 0 ? grossProfit / proposedFee : 0;

  function handleReset() {
    setHours({ ...historicalHours });
    setSubconsultant({ ...historicalSub });
    setReimbursable(Object.fromEntries(phases.map((p) => [p, 0])));
  }

  function handleSaveFee() {
    if (!selectedProposalId) return;
    updateDataset((d) => ({
      ...d,
      proposals: d.proposals.map((p) => (p.id === selectedProposalId ? { ...p, proposedFee } : p)),
    }));
    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-mist">
      <DemoHeader />

      <Container className="py-10">
        <h1 className="text-2xl font-bold text-navy">
          Build a better estimate using projects you&apos;ve already completed.
        </h1>
        <p className="mt-1 text-sm text-navy/60">
          Hours are seeded from comparable completed jobs&apos; actual hours by phase and role.
          Edit anything&mdash;the numbers below update live, and the historical source records
          never change.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[320px_1fr]">
          {/* Query form */}
          <div className="space-y-5 rounded-2xl border border-steel/30 bg-white p-6">
            <div>
              <label className="text-xs font-semibold tracking-wide text-navy/40 uppercase">
                Load from a pending proposal
              </label>
              <select
                value={selectedProposalId}
                onChange={(e) => loadProposal(e.target.value)}
                className="mt-2 w-full rounded-lg border border-steel/50 px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              >
                <option value="">Manual query (no proposal selected)</option>
                {pendingProposals.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.projectName} &mdash; {findClient(dataset, p.clientId)?.name}
                  </option>
                ))}
              </select>
            </div>

            <Field label="Discipline">
              <select
                value={disciplineId}
                onChange={(e) => setDisciplineId(e.target.value)}
                className="w-full rounded-lg border border-steel/50 px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              >
                {dataset.lookups.disciplines.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Project Type">
              <select
                value={projectTypeId}
                onChange={(e) => setProjectTypeId(e.target.value)}
                className="w-full rounded-lg border border-steel/50 px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              >
                {dataset.lookups.projectTypes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Work Type">
              <select
                value={workType}
                onChange={(e) => setWorkType(e.target.value as WorkType)}
                className="w-full rounded-lg border border-steel/50 px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              >
                {WORK_TYPES.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Delivery Method">
              <select
                value={deliveryMethodId}
                onChange={(e) => setDeliveryMethodId(e.target.value)}
                className="w-full rounded-lg border border-steel/50 px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              >
                {dataset.lookups.deliveryMethods.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label={`Complexity: ${complexity} of 5`}>
              <input
                type="range"
                min={1}
                max={5}
                value={complexity}
                onChange={(e) => setComplexity(Number(e.target.value) as 1 | 2 | 3 | 4 | 5)}
                className="w-full accent-teal"
              />
            </Field>

            <Field label="Size (SF)">
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full rounded-lg border border-steel/50 px-3 py-2 text-sm text-navy focus:border-teal focus:outline-none"
              />
            </Field>

            <p className="text-xs text-navy/40">
              Based on {comparables.length} comparable completed job{comparables.length === 1 ? "" : "s"} for
              this profile.
            </p>
          </div>

          {/* Estimate builder */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-navy">Phase &amp; Role Estimate</h2>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RotateCcw className="h-3.5 w-3.5" />
                Reset to Historical Averages
              </Button>
            </div>

            {phases.map((phase) => (
              <div key={phase} className="overflow-hidden rounded-2xl border border-steel/30 bg-white">
                <div className="flex items-center justify-between border-b border-steel/20 bg-mist/60 px-5 py-3">
                  <p className="text-sm font-semibold text-navy">{phase}</p>
                  <p className="text-sm font-semibold text-navy">{fmtCurrency(phaseTotal(phase))}</p>
                </div>
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs font-semibold tracking-wide text-navy/40 uppercase">
                      <th className="px-5 py-2">Role</th>
                      <th className="px-5 py-2 text-right">Hours</th>
                      <th className="px-5 py-2 text-right">Rate</th>
                      <th className="px-5 py-2 text-right">Labor Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROLES.map((role) => {
                      const key = `${phase}|${role}`;
                      const h = hours[key] ?? 0;
                      const rate = costRates[role] ?? 0;
                      return (
                        <tr key={role} className="border-t border-steel/10">
                          <td className="px-5 py-2 text-navy/70">{role}</td>
                          <td className="px-5 py-2 text-right">
                            <input
                              type="number"
                              value={h}
                              onChange={(e) =>
                                setHours((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                              }
                              className="w-20 rounded-md border border-steel/40 px-2 py-1 text-right text-sm focus:border-teal focus:outline-none"
                            />
                          </td>
                          <td className="px-5 py-2 text-right text-navy/50">{fmtCurrency(rate)}/hr</td>
                          <td className="px-5 py-2 text-right text-navy/80">{fmtCurrency(h * rate)}</td>
                        </tr>
                      );
                    })}
                    <tr className="border-t border-steel/20">
                      <td className="px-5 py-2 text-navy/70">Subconsultant</td>
                      <td className="px-5 py-2"></td>
                      <td className="px-5 py-2"></td>
                      <td className="px-5 py-2 text-right">
                        <input
                          type="number"
                          value={subconsultant[phase] ?? 0}
                          onChange={(e) =>
                            setSubconsultant((prev) => ({ ...prev, [phase]: Number(e.target.value) }))
                          }
                          className="w-24 rounded-md border border-steel/40 px-2 py-1 text-right text-sm focus:border-teal focus:outline-none"
                        />
                      </td>
                    </tr>
                    <tr className="border-t border-steel/10">
                      <td className="px-5 py-2 text-navy/70">Reimbursable Expense</td>
                      <td className="px-5 py-2"></td>
                      <td className="px-5 py-2"></td>
                      <td className="px-5 py-2 text-right">
                        <input
                          type="number"
                          value={reimbursable[phase] ?? 0}
                          onChange={(e) =>
                            setReimbursable((prev) => ({ ...prev, [phase]: Number(e.target.value) }))
                          }
                          className="w-24 rounded-md border border-steel/40 px-2 py-1 text-right text-sm focus:border-teal focus:outline-none"
                        />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))}

            {/* Summary */}
            <div className="rounded-2xl border border-steel/30 bg-navy p-6 text-white">
              <div className="grid gap-4 sm:grid-cols-4">
                <div>
                  <label className="text-xs font-medium text-white/50">Proposed Fee</label>
                  <input
                    type="number"
                    value={proposedFee}
                    onChange={(e) => {
                      setProposedFee(Number(e.target.value));
                      setSaved(false);
                    }}
                    className="mt-1 w-full rounded-lg border border-white/20 bg-navy/60 px-3 py-2 text-lg font-bold text-white focus:border-teal focus:outline-none"
                  />
                </div>
                <SummaryStat label="Estimated Delivery Cost" value={fmtCurrency(estimatedCost)} />
                <SummaryStat
                  label="Projected Gross Profit"
                  value={fmtCurrency(grossProfit)}
                  tone={grossProfit < 0 ? "negative" : "positive"}
                />
                <SummaryStat
                  label="Projected Gross Margin"
                  value={fmtPercent(grossMargin, 1)}
                  tone={grossMargin < 0.15 ? "negative" : "positive"}
                />
              </div>

              <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
                <Button variant="onDark" size="sm" onClick={handleSaveFee} disabled={!selectedProposalId}>
                  {saved ? "Saved to Proposal" : "Save Proposed Fee to Proposal"}
                </Button>
                {!selectedProposalId && (
                  <p className="text-xs text-white/40">Select a pending proposal to save.</p>
                )}
              </div>
            </div>

            <p className="text-xs text-navy/40">
              {fmtNumber(comparables.length)} comparable jobs informed the historical hour defaults
              above. Source job cost records are never modified&mdash;this is a separate, editable
              draft estimate.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold tracking-wide text-navy/40 uppercase">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SummaryStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
}) {
  return (
    <div>
      <p className="text-xs font-medium text-white/50">{label}</p>
      <p
        className={`mt-1 text-lg font-bold ${
          tone === "negative" ? "text-red-300" : tone === "positive" ? "text-teal" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function DemoHeader() {
  return (
    <header className="border-b border-steel/30 bg-white px-6 py-4">
      <Container className="flex items-center justify-between">
        <Logo />
        <Link
          href="/demo/overview"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/70 hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Overview
        </Link>
      </Container>
    </header>
  );
}
