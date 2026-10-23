"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/Button";
import {
  ClipboardList,
  Calculator,
  LineChart,
  Ruler,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type ModuleKey = "job-setup" | "fee-development" | "backlog" | "estimating";

const modules: Record<
  ModuleKey,
  {
    label: string;
    icon: typeof ClipboardList;
    reads: string;
    writes: string;
    benefit: string;
    example: string;
  }
> = {
  "job-setup": {
    label: "Job Setup",
    icon: ClipboardList,
    reads: "Clients, owners, lookups (disciplines, delivery methods, structural systems).",
    writes: "The structured job record: attributes, phases, and fee structure.",
    benefit:
      "Every downstream module inherits accurate, structured attributes instead of re-entering them.",
    example:
      "A PM sets up a new structural job once, and fee development, estimating, and backlog all read from that same record immediately.",
  },
  "fee-development": {
    label: "Fee Development",
    icon: Calculator,
    reads: "Historical completed jobs, their contracted fees, and actual costs.",
    writes: "A proposed fee, linked to the active proposal.",
    benefit:
      "Pricing decisions are grounded in what similar jobs actually charged and cost, not memory.",
    example:
      "ARLO surfaces five comparable office buildings and their fees before a PM proposes a number.",
  },
  backlog: {
    label: "Backlog Projection",
    icon: LineChart,
    reads: "Contracted job fees, invoices, and phase schedules.",
    writes: "Monthly backlog snapshots and projected billing timing.",
    benefit:
      "Leadership sees remaining contracted work and when it will likely be billed, without manual spreadsheets.",
    example:
      "When a proposal is won, its contracted fee immediately increases current backlog.",
  },
  estimating: {
    label: "Estimating",
    icon: Ruler,
    reads: "Historical hours and costs by phase and employee role on comparable jobs.",
    writes: "A phase-level budget: hours, labor cost, subconsultant cost, and projected margin.",
    benefit:
      "Budgets are built from evidence of what similar work actually took, improving delivery accuracy.",
    example:
      "A renovation estimate pulls extra schematic-design hours because past renovations needed them.",
  },
};

export default function PlatformPage() {
  const [active, setActive] = useState<ModuleKey>("fee-development");
  const current = modules[active];

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-mist py-20">
          <Container className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              One connected platform. Every job. Every insight.
            </h1>
            <p className="mt-5 text-lg text-navy/60">
              ARLO transforms individual engineering job records into a
              connected source of intelligence for fees, estimates, backlog,
              and decision-making.
            </p>
          </Container>
        </section>

        <section className="bg-white py-20">
          <Container>
            <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
              <div className="relative mx-auto flex h-[420px] w-full max-w-md items-center justify-center">
                <div className="absolute flex h-32 w-32 flex-col items-center justify-center rounded-full border-2 border-navy bg-navy text-center text-white shadow-lg">
                  <span className="text-[10px] font-semibold tracking-wide uppercase opacity-70">
                    One
                  </span>
                  <span className="text-sm leading-tight font-bold">
                    Structured
                    <br />
                    Job Record
                  </span>
                </div>

                {(Object.keys(modules) as ModuleKey[]).map((key, i) => {
                  const m = modules[key];
                  const Icon = m.icon;
                  const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
                  const radius = 160;
                  const x = Math.cos(angle) * radius;
                  const y = Math.sin(angle) * radius;
                  const isActive = active === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setActive(key)}
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                      }}
                      className={`absolute flex h-24 w-24 flex-col items-center justify-center gap-1.5 rounded-2xl border p-2 text-center text-xs font-semibold transition-all ${
                        isActive
                          ? "border-teal bg-teal text-white shadow-lg"
                          : "border-steel/50 bg-white text-navy hover:border-teal/60"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      {m.label}
                    </button>
                  );
                })}

                <svg
                  className="pointer-events-none absolute h-full w-full"
                  viewBox="-210 -210 420 420"
                >
                  {(Object.keys(modules) as ModuleKey[]).map((key, i) => {
                    const angle = (i / 4) * 2 * Math.PI - Math.PI / 2;
                    const radius = 160;
                    const x = Math.cos(angle) * radius;
                    const y = Math.sin(angle) * radius;
                    return (
                      <line
                        key={key}
                        x1={0}
                        y1={0}
                        x2={x}
                        y2={y}
                        stroke={active === key ? "#5B8090" : "#A9BBC7"}
                        strokeWidth={active === key ? 2 : 1}
                        opacity={active === key ? 0.8 : 0.4}
                      />
                    );
                  })}
                </svg>

                <div className="absolute -bottom-10 flex items-center gap-1.5 rounded-full border border-steel/50 bg-white px-3 py-1.5 text-xs font-semibold text-teal">
                  <Sparkles className="h-3.5 w-3.5" />
                  Ask ARLO reads across all four
                </div>
              </div>

              <div className="rounded-2xl border border-steel/30 bg-mist/60 p-8">
                <p className="text-xs font-semibold tracking-wide text-teal uppercase">
                  {current.label}
                </p>
                <div className="mt-4 space-y-4 text-sm leading-relaxed text-navy/70">
                  <p>
                    <span className="font-semibold text-navy">Reads: </span>
                    {current.reads}
                  </p>
                  <p>
                    <span className="font-semibold text-navy">Writes: </span>
                    {current.writes}
                  </p>
                  <p>
                    <span className="font-semibold text-navy">
                      Why it matters:{" "}
                    </span>
                    {current.benefit}
                  </p>
                  <div className="rounded-xl border border-steel/40 bg-white p-4 text-navy/80 italic">
                    {current.example}
                  </div>
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-mist py-20">
          <Container className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Information Entered Once",
                body: "Structured job setup prevents the same project details from being re-typed into fees, estimates, and reports.",
              },
              {
                title: "Historical Intelligence",
                body: "Completed jobs become valuable references for pricing and estimating future work.",
              },
              {
                title: "Better Visibility",
                body: "Shared records make backlog reporting accurate instead of a monthly spreadsheet exercise.",
              },
              {
                title: "AI-Native by Design",
                body: "Ask ARLO reasons over the same structured information every other module uses.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-steel/30 bg-white p-6"
              >
                <h3 className="text-sm font-bold text-navy">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-navy/60">
                  {item.body}
                </p>
              </div>
            ))}
          </Container>
        </section>

        <section className="bg-navy py-20 text-center text-white">
          <Container>
            <h2 className="text-3xl font-bold">
              See the connected platform in action.
            </h2>
            <div className="mt-8">
              <ButtonLink href="/demo" variant="onDark" size="lg">
                Explore the Connected Demo
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
