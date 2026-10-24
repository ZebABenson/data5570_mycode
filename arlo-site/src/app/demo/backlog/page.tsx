"use client";

import { useMemo } from "react";
import Link from "next/link";
import { ArrowLeft, Info } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { useDemo } from "@/components/demo/DemoProvider";
import { totalCurrentBacklog } from "@/lib/demo/calculations";
import {
  backlogByDiscipline,
  backlogByProject,
  baselineBacklog,
  monthlyBacklogTrend,
  monthlyBillingProjection,
} from "@/lib/demo/backlog";
import { fmtCurrency } from "@/lib/demo/format";

function currencyTooltip(value: unknown) {
  return fmtCurrency(Number(value));
}

export default function BacklogPage() {
  const { dataset, loading } = useDemo();

  const currentBacklog = useMemo(() => (dataset ? totalCurrentBacklog(dataset) : 0), [dataset]);
  const baseline = useMemo(() => (dataset ? baselineBacklog(dataset) : 0), [dataset]);
  const trend = useMemo(() => (dataset ? monthlyBacklogTrend(dataset) : []), [dataset]);
  const projection = useMemo(
    () => (dataset ? monthlyBillingProjection(dataset, dataset.meta.generatedAt.slice(0, 10), 6) : []),
    [dataset]
  );
  const byDiscipline = useMemo(() => (dataset ? backlogByDiscipline(dataset) : []), [dataset]);
  const byProject = useMemo(() => (dataset ? backlogByProject(dataset, 10) : []), [dataset]);

  if (loading || !dataset) {
    return (
      <main className="min-h-screen bg-mist">
        <DemoHeader />
        <Container className="py-16 text-center text-sm text-navy/50">Loading&hellip;</Container>
      </main>
    );
  }

  const difference = currentBacklog - baseline;

  return (
    <main className="min-h-screen bg-mist">
      <DemoHeader />
      <Container className="py-10">
        <h1 className="text-2xl font-bold text-navy">Backlog Projection</h1>
        <p className="mt-1 text-sm text-navy/60">
          Remaining contracted work across every active job, computed live from contracted fees
          and billed invoices&mdash;never a separately stored number.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Backlog at Session Start" value={fmtCurrency(baseline)} />
          <StatCard label="Current Backlog" value={fmtCurrency(currentBacklog)} emphasize />
          <StatCard
            label="Change This Session"
            value={`${difference >= 0 ? "+" : ""}${fmtCurrency(difference)}`}
            tone={difference > 0 ? "positive" : difference < 0 ? "negative" : undefined}
          />
        </div>
        {difference !== 0 && (
          <p className="mt-3 flex items-start gap-2 rounded-lg bg-mist px-4 py-3 text-xs text-navy/60">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {difference > 0
              ? "Backlog has grown since this demo session started—likely from winning a proposal in Estimating."
              : "Backlog has decreased since this demo session started."}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-steel/30 bg-white p-6">
          <p className="text-sm font-semibold text-navy">Historical Backlog Trend</p>
          <p className="text-xs text-navy/40">
            Aggregate remaining backlog by month, from recorded snapshots. Historical months are
            fixed and do not change as current backlog moves.
          </p>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="backlogTrendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5B8090" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#5B8090" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#A9BBC7" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#10263F99" }} />
                <YAxis tick={{ fontSize: 10, fill: "#10263F99" }} />
                <Tooltip formatter={currencyTooltip} />
                <Area
                  type="monotone"
                  dataKey="backlog"
                  stroke="#10263F"
                  strokeWidth={2}
                  fill="url(#backlogTrendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-steel/30 bg-white p-6">
          <p className="text-sm font-semibold text-navy">Projected Monthly Billing</p>
          <p className="text-xs text-navy/40">
            Illustrative: each job&apos;s remaining backlog is spread evenly across its remaining
            months. Not a committed billing schedule&mdash;actual timing depends on phase progress.
          </p>
          <div className="mt-4 h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projection} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#A9BBC7" opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#10263F99" }} />
                <YAxis tick={{ fontSize: 10, fill: "#10263F99" }} />
                <Tooltip formatter={currencyTooltip} />
                <Bar dataKey="amount" fill="#5B8090" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl border border-steel/30 bg-white p-6">
            <p className="text-sm font-semibold text-navy">Backlog by Discipline</p>
            <div className="mt-4 space-y-3">
              {byDiscipline.map((d) => (
                <div key={d.disciplineId}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-navy/70">{d.name}</span>
                    <span className="font-semibold text-navy">{fmtCurrency(d.backlog)}</span>
                  </div>
                  <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-mist">
                    <div
                      className="h-full bg-teal"
                      style={{
                        width: `${byDiscipline[0] ? (d.backlog / byDiscipline[0].backlog) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
              {byDiscipline.length === 0 && <p className="text-sm text-navy/40">No active backlog.</p>}
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-steel/30 bg-white">
            <p className="px-6 pt-6 text-sm font-semibold text-navy">
              Largest Contracted Backlog by Project
            </p>
            <table className="mt-4 w-full text-left text-sm">
              <tbody>
                {byProject.map((p) => (
                  <tr key={p.jobId} className="border-t border-steel/10">
                    <td className="px-6 py-2.5">
                      <Link
                        href={`/demo/jobs/${p.jobId}`}
                        className="font-semibold text-navy hover:text-teal"
                      >
                        {p.jobNumber}
                      </Link>
                      <p className="text-xs text-navy/50">{p.jobName}</p>
                    </td>
                    <td className="px-6 py-2.5 text-right font-medium text-navy">
                      {fmtCurrency(p.backlog)}
                    </td>
                  </tr>
                ))}
                {byProject.length === 0 && (
                  <tr>
                    <td className="px-6 py-6 text-center text-navy/40">No active backlog.</td>
                  </tr>
                )}
              </tbody>
            </table>
            <div className="h-6" />
          </div>
        </div>
      </Container>
    </main>
  );
}

function StatCard({
  label,
  value,
  tone,
  emphasize,
}: {
  label: string;
  value: string;
  tone?: "positive" | "negative";
  emphasize?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 ${
        emphasize ? "border-teal/40 bg-navy text-white" : "border-steel/30 bg-white"
      }`}
    >
      <p className={`text-xs font-medium ${emphasize ? "text-white/60" : "text-navy/50"}`}>{label}</p>
      <p
        className={`mt-1 text-2xl font-bold ${
          emphasize
            ? "text-white"
            : tone === "positive"
              ? "text-teal"
              : tone === "negative"
                ? "text-red-600"
                : "text-navy"
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
