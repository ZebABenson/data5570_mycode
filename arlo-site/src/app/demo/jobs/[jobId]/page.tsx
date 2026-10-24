"use client";

import { Suspense, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { useDemo } from "@/components/demo/DemoProvider";
import {
  actualCost,
  actualHours,
  billedToDate,
  contractValue,
  jobBudgetVsActual,
  remainingBacklog,
} from "@/lib/demo/calculations";
import {
  findClient,
  findContact,
  findDeliveryMethod,
  findDiscipline,
  findEmployee,
  findFeeStructure,
  findOwner,
  findProjectType,
  findServiceType,
  findStructuralSystems,
} from "@/lib/demo/lookups";
import { fmtCurrency, fmtDate, fmtNumber, fmtPercent } from "@/lib/demo/format";

type TabKey = "overview" | "fees" | "phases" | "costs" | "invoices";

const TABS: { key: TabKey; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "fees", label: "Fees" },
  { key: "phases", label: "Phases" },
  { key: "costs", label: "Costs" },
  { key: "invoices", label: "Invoices" },
];

export default function JobDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-mist">
          <DemoHeader />
          <Container className="py-16 text-center text-sm text-navy/50">
            Loading&hellip;
          </Container>
        </main>
      }
    >
      <JobDetailContent />
    </Suspense>
  );
}

function JobDetailContent() {
  const params = useParams<{ jobId: string }>();
  const { dataset, loading } = useDemo();
  const [tab, setTab] = useState<TabKey>("overview");

  const job = useMemo(
    () => dataset?.jobs.find((j) => j.id === params.jobId),
    [dataset, params.jobId]
  );

  if (loading || !dataset) {
    return (
      <main className="min-h-screen bg-mist">
        <DemoHeader />
        <Container className="py-16 text-center text-sm text-navy/50">
          Loading&hellip;
        </Container>
      </main>
    );
  }

  if (!job) {
    return (
      <main className="min-h-screen bg-mist">
        <DemoHeader />
        <Container className="py-16 text-center">
          <p className="text-navy/60">No job found with that id.</p>
          <Link href="/demo/jobs" className="mt-4 inline-block text-sm font-semibold text-teal">
            Back to Job Register
          </Link>
        </Container>
      </main>
    );
  }

  const client = findClient(dataset, job.clientId);
  const contact = findContact(dataset, job.contactId);
  const owner = findOwner(dataset, job.ownerId);
  const discipline = findDiscipline(dataset, job.disciplineId);
  const projectType = findProjectType(dataset, job.projectTypeId);
  const deliveryMethod = findDeliveryMethod(dataset, job.deliveryMethodId);
  const structuralSystems = findStructuralSystems(dataset, job.structuralSystemIds);
  const pm = findEmployee(dataset, job.pmEmployeeId);

  const cv = contractValue(dataset.jobFees, job.id);
  const billed = billedToDate(dataset.invoices, job.id);
  const remaining = remainingBacklog(dataset.jobFees, dataset.invoices, job.id);
  const bva = jobBudgetVsActual(dataset, job.id);

  const fees = dataset.jobFees.filter((f) => f.jobId === job.id);
  const phases = dataset.jobPhases.filter((p) => p.jobId === job.id);
  const costs = dataset.jobCosts
    .filter((c) => c.jobId === job.id)
    .sort((a, b) => a.costDate.localeCompare(b.costDate));
  const invoices = dataset.invoices
    .filter((i) => i.jobId === job.id)
    .sort((a, b) => a.invoiceDate.localeCompare(b.invoiceDate));

  return (
    <main className="min-h-screen bg-mist">
      <DemoHeader />

      <Container className="py-10">
        <Link
          href="/demo/jobs"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-navy/50 hover:text-navy"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Job Register
        </Link>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wide text-teal uppercase">
              {job.jobNumber}
            </p>
            <h1 className="text-2xl font-bold text-navy">{job.jobName}</h1>
            <p className="mt-1 text-sm text-navy/60">
              {client?.name} &middot; {discipline?.name} &middot; {projectType?.name}
            </p>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <StatCard label="Contract Value" value={fmtCurrency(cv)} />
          <StatCard label="Billed to Date" value={fmtCurrency(billed)} />
          <StatCard label="Remaining Backlog" value={fmtCurrency(remaining)} />
        </div>

        <div className="mt-8 flex gap-1 overflow-x-auto border-b border-steel/30">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
                tab === t.key
                  ? "border-teal text-navy"
                  : "border-transparent text-navy/50 hover:text-navy"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === "overview" && (
            <div className="grid gap-6 rounded-2xl border border-steel/30 bg-white p-6 sm:grid-cols-2">
              <DetailRow label="Client" value={client?.name} />
              <DetailRow
                label="Contact"
                value={contact ? `${contact.firstName} ${contact.lastName}` : undefined}
              />
              <DetailRow label="Owner" value={owner?.name} />
              <DetailRow label="Project Manager" value={pm ? `${pm.firstName} ${pm.lastName}` : undefined} />
              <DetailRow label="Discipline" value={discipline?.name} />
              <DetailRow label="Project Type" value={projectType?.name} />
              <DetailRow label="Work Type" value={job.workType} />
              <DetailRow label="Delivery Method" value={deliveryMethod?.name} />
              <DetailRow label="Complexity" value={`${job.complexity} of 5`} />
              <DetailRow
                label="Structural System"
                value={structuralSystems.length ? structuralSystems.map((s) => s.name).join(", ") : "—"}
              />
              <DetailRow
                label="Size"
                value={job.size ? `${fmtNumber(job.size)} ${job.sizeUnit ?? ""}` : undefined}
              />
              <DetailRow
                label="Construction Cost"
                value={job.constructionCost ? fmtCurrency(job.constructionCost) : undefined}
              />
              <DetailRow label="Address" value={`${job.address}, ${job.city}, ${job.state} ${job.zip}`} />
              <DetailRow label="Start Date" value={fmtDate(job.startDate)} />
              <DetailRow label="Est. End Date" value={fmtDate(job.estEndDate)} />
              <DetailRow label="Actual End Date" value={fmtDate(job.actualEndDate)} />
              <DetailRow
                label="Budget vs. Actual"
                value={
                  bva.budgetCost > 0
                    ? `${fmtCurrency(bva.actualCost)} of ${fmtCurrency(bva.budgetCost)} (${fmtPercent(bva.actualCost / bva.budgetCost)}) — ${fmtNumber(bva.actualHours)} of ${fmtNumber(bva.budgetHours)} hrs`
                    : "—"
                }
              />
            </div>
          )}

          {tab === "fees" && (
            <SimpleTable
              headers={["Service", "Structure", "Amount", "Change Order", "Effective Date"]}
              rows={fees.map((f) => [
                findServiceType(dataset, f.serviceTypeId)?.name ?? "—",
                findFeeStructure(dataset, f.feeStructureId)?.name ?? "—",
                fmtCurrency(f.feeAmount),
                f.isChangeOrder ? "Yes" : "No",
                fmtDate(f.effectiveDate),
              ])}
              emptyMessage="No fees recorded."
            />
          )}

          {tab === "phases" && (
            <SimpleTable
              headers={["Phase", "Budget Hours", "Budget Cost", "Actual Hours", "Actual Cost", "% Complete"]}
              rows={phases.map((p) => [
                p.phaseName,
                fmtNumber(p.budgetHours),
                fmtCurrency(p.budgetCost),
                fmtNumber(actualHours(dataset.jobCosts, job.id, p.id)),
                fmtCurrency(actualCost(dataset.jobCosts, job.id, p.id)),
                fmtPercent(p.percentComplete),
              ])}
              emptyMessage="No phases recorded."
            />
          )}

          {tab === "costs" && (
            <SimpleTable
              headers={["Date", "Type", "Phase", "Employee", "Hours", "Amount"]}
              rows={costs.map((c) => {
                const phase = phases.find((p) => p.id === c.phaseId);
                const employee = findEmployee(dataset, c.employeeId);
                return [
                  fmtDate(c.costDate),
                  c.costType,
                  phase?.phaseName ?? "—",
                  employee ? `${employee.firstName} ${employee.lastName} (${employee.role})` : "—",
                  c.hours ? fmtNumber(c.hours) : "—",
                  fmtCurrency(c.amount),
                ];
              })}
              emptyMessage="No cost records."
            />
          )}

          {tab === "invoices" && (
            <SimpleTable
              headers={["Invoice #", "Date", "Amount", "Status", "Paid Date"]}
              rows={invoices.map((i) => [
                i.invoiceNumber,
                fmtDate(i.invoiceDate),
                fmtCurrency(i.amount),
                i.status,
                fmtDate(i.paidDate),
              ])}
              emptyMessage="No invoices recorded."
            />
          )}
        </div>
      </Container>
    </main>
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

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-steel/30 bg-white p-5">
      <p className="text-xs font-medium text-navy/50">{label}</p>
      <p className="mt-1 text-xl font-bold text-navy">{value}</p>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-wide text-navy/40 uppercase">{label}</p>
      <p className="mt-1 text-sm text-navy">{value ?? "—"}</p>
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
  emptyMessage,
}: {
  headers: string[];
  rows: string[][];
  emptyMessage: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-steel/30 bg-white">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-steel/30 text-xs font-semibold tracking-wide text-navy/50 uppercase">
            {headers.map((h) => (
              <th key={h} className="px-4 py-3">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-steel/15 last:border-0">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 text-navy/80">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={headers.length} className="px-4 py-8 text-center text-navy/40">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Active: "bg-teal/10 text-teal",
    "On Hold": "bg-amber-100 text-amber-700",
    Complete: "bg-navy/10 text-navy",
    Cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${styles[status] ?? ""}`}>
      {status}
    </span>
  );
}
