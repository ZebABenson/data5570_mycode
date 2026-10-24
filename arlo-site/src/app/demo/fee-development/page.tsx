"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useDemo } from "@/components/demo/DemoProvider";
import {
  findComparableJobs,
  recommendFee,
  type FeeQuery,
} from "@/lib/demo/comparables";
import { findClient } from "@/lib/demo/lookups";
import { fmtCurrency, fmtNumber, fmtPercent } from "@/lib/demo/format";
import type { WorkType } from "@/lib/demo/types";

const WORK_TYPES: WorkType[] = ["New Construction", "Renovation", "Addition", "Assessment"];

export default function FeeDevelopmentPage() {
  const { dataset, loading, updateDataset } = useDemo();

  const [disciplineId, setDisciplineId] = useState("disc-structural");
  const [projectTypeId, setProjectTypeId] = useState("pt-office");
  const [workType, setWorkType] = useState<WorkType>("New Construction");
  const [deliveryMethodId, setDeliveryMethodId] = useState("dm-dbb");
  const [complexity, setComplexity] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [size, setSize] = useState(45000);
  const [selectedProposalId, setSelectedProposalId] = useState("");
  const [proposedFee, setProposedFee] = useState<number | null>(null);
  const [saved, setSaved] = useState(false);

  const pendingProposals = useMemo(
    () => dataset?.proposals.filter((p) => p.status === "Pending") ?? [],
    [dataset]
  );

  function loadProposal(id: string) {
    setSelectedProposalId(id);
    setSaved(false);
    if (!dataset || !id) return;
    const proposal = dataset.proposals.find((p) => p.id === id);
    if (!proposal) return;
    setDisciplineId(proposal.disciplineId);
    setProjectTypeId(proposal.projectTypeId);
    setDeliveryMethodId(proposal.deliveryMethodId);
    if (proposal.estConstructionCost) {
      // Same $/SF baseline the seed generator uses for buildings.
      setSize(Math.round(proposal.estConstructionCost / 260));
    }
  }

  const query: FeeQuery = useMemo(
    () => ({
      disciplineId,
      projectTypeId,
      workType,
      deliveryMethodId,
      complexity,
      size,
      sizeUnit: "SF",
    }),
    [disciplineId, projectTypeId, workType, deliveryMethodId, complexity, size]
  );

  const comparables = useMemo(
    () => (dataset ? findComparableJobs(dataset, query, 8) : []),
    [dataset, query]
  );
  const recommendation = useMemo(() => recommendFee(comparables, query), [comparables, query]);

  const effectiveFee = proposedFee ?? recommendation.mid;

  const chartData = useMemo(
    () =>
      [...comparables]
        .sort((a, b) => a.contractValue - b.contractValue)
        .map((c) => ({ name: c.job.jobNumber, fee: c.contractValue })),
    [comparables]
  );

  function handleSave() {
    if (!selectedProposalId) return;
    updateDataset((d) => ({
      ...d,
      proposals: d.proposals.map((p) =>
        p.id === selectedProposalId ? { ...p, proposedFee: effectiveFee } : p
      ),
    }));
    setSaved(true);
  }

  if (loading || !dataset) {
    return (
      <main className="min-h-screen bg-mist">
        <DemoHeader />
        <Container className="py-16 text-center text-sm text-navy/50">Loading&hellip;</Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-mist">
      <DemoHeader />

      <Container className="py-10">
        <h1 className="text-2xl font-bold text-navy">What should we charge for this project?</h1>
        <p className="mt-1 text-sm text-navy/60">
          ARLO searches completed historical jobs, ranks them by similarity, and suggests a fee
          range&mdash;grounded in what comparable work actually charged and cost.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[360px_1fr]">
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
          </div>

          {/* Results */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-steel/30 bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold tracking-wide text-teal uppercase">
                    Suggested Fee Range
                  </p>
                  <p className="mt-1 text-2xl font-bold text-navy">
                    {recommendation.sampleSize > 0
                      ? `${fmtCurrency(recommendation.low)} – ${fmtCurrency(recommendation.high)}`
                      : "Not enough comparable data"}
                  </p>
                </div>
                <div className="flex items-start gap-2 rounded-lg bg-mist px-3 py-2 text-xs text-navy/60">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>
                    {recommendation.sampleSize > 0
                      ? `Based on ${recommendation.sampleSize} comparable completed job${recommendation.sampleSize === 1 ? "" : "s"}, using ${recommendation.basis === "per-size" ? "historical fee per square foot" : "historical contracted fees"}. This is an illustrative calculation from fictional demo data, not a trained model.`
                      : "No completed jobs scored highly enough against this query to form a recommendation. Try broadening the discipline or project type."}
                  </span>
                </div>
              </div>

              {chartData.length > 0 && (
                <div className="mt-6 h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#A9BBC7" opacity={0.3} />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#10263F99" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#10263F99" }} />
                      <Bar dataKey="fee" fill="#5B8090" radius={[4, 4, 0, 0]} />
                      {recommendation.sampleSize > 0 && (
                        <ReferenceLine
                          y={effectiveFee}
                          stroke="#10263F"
                          strokeDasharray="4 4"
                          label={{ value: "Proposed", fontSize: 10, fill: "#10263F" }}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-end gap-4 border-t border-steel/20 pt-6">
                <div>
                  <label className="text-xs font-semibold tracking-wide text-navy/40 uppercase">
                    Proposed Fee
                  </label>
                  <input
                    type="number"
                    value={effectiveFee}
                    onChange={(e) => {
                      setProposedFee(Number(e.target.value));
                      setSaved(false);
                    }}
                    className="mt-2 w-48 rounded-lg border border-steel/50 px-3 py-2 text-lg font-bold text-navy focus:border-teal focus:outline-none"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  disabled={!selectedProposalId}
                  variant={selectedProposalId ? "primary" : "secondary"}
                >
                  {saved ? "Saved to Proposal" : "Save Proposed Fee"}
                </Button>
                {!selectedProposalId && (
                  <p className="text-xs text-navy/40">
                    Select a pending proposal above to save a fee to it.
                  </p>
                )}
              </div>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-steel/30 bg-white">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-steel/30 text-xs font-semibold tracking-wide text-navy/50 uppercase">
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Similarity</th>
                    <th className="px-4 py-3 text-right">Size</th>
                    <th className="px-4 py-3 text-right">Contract Value</th>
                    <th className="px-4 py-3 text-right">Actual Cost</th>
                    <th className="px-4 py-3 text-right">Margin</th>
                  </tr>
                </thead>
                <tbody>
                  {comparables.map((c) => (
                    <tr key={c.job.id} className="border-b border-steel/15 last:border-0">
                      <td className="px-4 py-3">
                        <Link
                          href={`/demo/jobs/${c.job.id}`}
                          className="font-semibold text-navy hover:text-teal"
                          title={c.breakdown.map((b) => `${b.label}: ${b.points}/${b.maxPoints}`).join("\n")}
                        >
                          {c.job.jobNumber}
                        </Link>
                        <p className="text-xs text-navy/50">{c.job.jobName}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-mist">
                            <span
                              className="block h-full bg-teal"
                              style={{ width: `${Math.min(100, c.score)}%` }}
                            />
                          </span>
                          <span className="text-xs text-navy/60">{fmtNumber(c.score)}%</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-navy/60">
                        {c.job.size ? `${fmtNumber(c.job.size)} ${c.job.sizeUnit}` : "—"}
                      </td>
                      <td className="px-4 py-3 text-right text-navy/80">
                        {fmtCurrency(c.contractValue)}
                      </td>
                      <td className="px-4 py-3 text-right text-navy/60">
                        {fmtCurrency(c.actualCost)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={c.marginPercent < 0.15 ? "text-red-600" : "text-teal"}>
                          {fmtPercent(c.marginPercent)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {comparables.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-navy/40">
                        No completed jobs match this query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
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
