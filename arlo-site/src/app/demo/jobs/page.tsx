"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUpDown, Search } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { useDemo } from "@/components/demo/DemoProvider";
import {
  contractValue,
  billedToDate,
  remainingBacklog,
  jobBudgetVsActual,
} from "@/lib/demo/calculations";
import { findClient, findDiscipline, findProjectType } from "@/lib/demo/lookups";
import { fmtCurrency, fmtPercent } from "@/lib/demo/format";
import type { Job, JobStatus } from "@/lib/demo/types";

type SortKey = "jobNumber" | "projectName" | "contractValue" | "remainingBacklog" | "status";
type SortDir = "asc" | "desc";

export default function JobRegisterPage() {
  const { dataset, loading } = useDemo();
  const [search, setSearch] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("jobNumber");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const rows = useMemo(() => {
    if (!dataset) return [];

    const q = search.trim().toLowerCase();

    const jobs = dataset.jobs.filter((job) => {
      if (disciplineFilter !== "all" && job.disciplineId !== disciplineFilter) return false;
      if (statusFilter !== "all" && job.status !== statusFilter) return false;
      if (!q) return true;
      const client = findClient(dataset, job.clientId);
      return (
        job.jobNumber.toLowerCase().includes(q) ||
        job.jobName.toLowerCase().includes(q) ||
        (client?.name.toLowerCase().includes(q) ?? false)
      );
    });

    const withMetrics = jobs.map((job) => {
      const cv = contractValue(dataset.jobFees, job.id);
      return {
        job,
        client: findClient(dataset, job.clientId),
        discipline: findDiscipline(dataset, job.disciplineId),
        projectType: findProjectType(dataset, job.projectTypeId),
        contractValue: cv,
        billedToDate: billedToDate(dataset.invoices, job.id),
        remainingBacklog: remainingBacklog(dataset.jobFees, dataset.invoices, job.id),
        budgetVsActual: jobBudgetVsActual(dataset, job.id),
      };
    });

    withMetrics.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "jobNumber":
          cmp = a.job.jobNumber.localeCompare(b.job.jobNumber);
          break;
        case "projectName":
          cmp = a.job.jobName.localeCompare(b.job.jobName);
          break;
        case "contractValue":
          cmp = a.contractValue - b.contractValue;
          break;
        case "remainingBacklog":
          cmp = a.remainingBacklog - b.remainingBacklog;
          break;
        case "status":
          cmp = a.job.status.localeCompare(b.job.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return withMetrics;
  }, [dataset, search, disciplineFilter, statusFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <main className="min-h-screen bg-mist">
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

      <Container className="py-10">
        <h1 className="text-2xl font-bold text-navy">Job Register</h1>
        <p className="mt-1 text-sm text-navy/60">
          {loading ? "Loading..." : `${rows.length} of ${dataset?.jobs.length ?? 0} jobs`}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-navy/40" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search job number, project, or client..."
              className="w-full rounded-lg border border-steel/50 bg-white py-2.5 pr-4 pl-9 text-sm text-navy focus:border-teal focus:outline-none"
            />
          </div>

          <select
            value={disciplineFilter}
            onChange={(e) => setDisciplineFilter(e.target.value)}
            className="rounded-lg border border-steel/50 bg-white px-3 py-2.5 text-sm text-navy focus:border-teal focus:outline-none"
          >
            <option value="all">All disciplines</option>
            {dataset?.lookups.disciplines.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-steel/50 bg-white px-3 py-2.5 text-sm text-navy focus:border-teal focus:outline-none"
          >
            <option value="all">All statuses</option>
            {(["Active", "On Hold", "Complete", "Cancelled"] as JobStatus[]).map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 overflow-x-auto rounded-2xl border border-steel/30 bg-white">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead>
              <tr className="border-b border-steel/30 text-xs font-semibold tracking-wide text-navy/50 uppercase">
                <Th label="Job #" sortKey="jobNumber" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <Th label="Project" sortKey="projectName" current={sortKey} dir={sortDir} onClick={toggleSort} />
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Discipline</th>
                <th className="px-4 py-3">Type</th>
                <Th label="Contract Value" sortKey="contractValue" current={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
                <th className="px-4 py-3 text-right">Billed</th>
                <Th label="Remaining Backlog" sortKey="remainingBacklog" current={sortKey} dir={sortDir} onClick={toggleSort} align="right" />
                <th className="px-4 py-3 text-right">Budget vs. Actual</th>
                <Th label="Status" sortKey="status" current={sortKey} dir={sortDir} onClick={toggleSort} />
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const bva = r.budgetVsActual;
                const ratio = bva.budgetCost > 0 ? bva.actualCost / bva.budgetCost : 0;
                return (
                  <tr
                    key={r.job.id}
                    className="cursor-pointer border-b border-steel/15 last:border-0 hover:bg-mist/60"
                  >
                    <td className="p-0">
                      <Link href={`/demo/jobs/${r.job.id}`} className="block px-4 py-3 font-semibold text-navy">
                        {r.job.jobNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-navy/80">{r.job.jobName}</td>
                    <td className="px-4 py-3 text-navy/60">{r.client?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-navy/60">{r.discipline?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-navy/60">{r.projectType?.name ?? "—"}</td>
                    <td className="px-4 py-3 text-right text-navy/80">{fmtCurrency(r.contractValue)}</td>
                    <td className="px-4 py-3 text-right text-navy/60">{fmtCurrency(r.billedToDate)}</td>
                    <td className="px-4 py-3 text-right font-medium text-navy">
                      {fmtCurrency(r.remainingBacklog)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {bva.budgetCost > 0 ? (
                        <span
                          className={
                            ratio > 1.05
                              ? "font-medium text-red-600"
                              : ratio < 0.95 && r.job.status === "Complete"
                                ? "font-medium text-teal"
                                : "text-navy/60"
                          }
                        >
                          {fmtPercent(ratio)}
                        </span>
                      ) : (
                        <span className="text-navy/30">&mdash;</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.job.status} />
                    </td>
                  </tr>
                );
              })}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-navy/40">
                    No jobs match these filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Container>
    </main>
  );
}

function Th({
  label,
  sortKey,
  current,
  dir,
  onClick,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  current: SortKey;
  dir: SortDir;
  onClick: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = current === sortKey;
  return (
    <th className={`px-4 py-3 ${align === "right" ? "text-right" : "text-left"}`}>
      <button
        onClick={() => onClick(sortKey)}
        className={`inline-flex items-center gap-1 ${align === "right" ? "flex-row-reverse" : ""} ${active ? "text-navy" : ""}`}
      >
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? "opacity-100" : "opacity-30"}`} />
        {active && <span className="sr-only">{dir}</span>}
      </button>
    </th>
  );
}

function StatusBadge({ status }: { status: Job["status"] }) {
  const styles: Record<Job["status"], string> = {
    Active: "bg-teal/10 text-teal",
    "On Hold": "bg-amber-100 text-amber-700",
    Complete: "bg-navy/10 text-navy",
    Cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles[status]}`}>
      {status}
    </span>
  );
}
