"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, RotateCcw } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { Button, ButtonLink } from "@/components/Button";
import { useDemo } from "@/components/demo/DemoProvider";
import { totalCurrentBacklog } from "@/lib/demo/calculations";

export default function DemoOverview() {
  const { dataset, meta, loading, expired, daysRemaining, resetDemo } = useDemo();
  const [resetting, setResetting] = useState(false);

  async function handleReset() {
    setResetting(true);
    await resetDemo();
    setResetting(false);
  }

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-steel/30 bg-white px-6 py-4">
        <Container className="flex items-center justify-between">
          <Logo />
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/70 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Container>
      </header>

      <Container className="py-16">
        {loading || !dataset || !meta ? (
          <p className="text-center text-sm text-navy/50">
            Loading demo workspace&hellip;
          </p>
        ) : (
          <>
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold tracking-wide text-teal uppercase">
                Demo Workspace &mdash; Simulated Data
              </p>
              <h1 className="text-2xl font-bold text-navy">
                {meta.companyName}
              </h1>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-navy/50">
                <Clock className="h-4 w-4" />
                {expired
                  ? "Your previous demo expired after 7 days, so this is a fresh workspace."
                  : `${daysRemaining} day${daysRemaining === 1 ? "" : "s"} left in this demo window`}
              </p>
            </div>

            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              <StatCard
                label="Active Jobs"
                value={dataset.jobs.filter((j) => j.status === "Active").length}
              />
              <StatCard
                label="Historical Jobs"
                value={dataset.jobs.filter((j) => j.status === "Complete").length}
              />
              <StatCard
                label="Current Backlog"
                value={totalCurrentBacklog(dataset).toLocaleString(undefined, {
                  style: "currency",
                  currency: "USD",
                  maximumFractionDigits: 0,
                })}
              />
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/demo/jobs" variant="secondary" size="sm">
                View Job Register
              </ButtonLink>
              <ButtonLink href="/demo/fee-development" variant="secondary" size="sm">
                Fee Development
              </ButtonLink>
              <ButtonLink href="/demo/estimating" variant="secondary" size="sm">
                Estimating
              </ButtonLink>
            </div>

            <div className="mx-auto mt-10 max-w-2xl rounded-2xl border border-steel/30 bg-white p-8 text-center">
              <p className="text-sm leading-relaxed text-navy/60">
                Your changes in this workspace save automatically to this
                browser and will still be here the next time you visit&mdash;
                even after closing the tab. The full interactive workflow
                (opportunities, fee development, estimating, job setup,
                backlog, and Ask ARLO) connects to this same persisted
                dataset in the next build stage.
              </p>
              <Button
                variant="secondary"
                size="sm"
                className="mt-6"
                onClick={handleReset}
                disabled={resetting}
              >
                <RotateCcw className="h-4 w-4" />
                {resetting ? "Resetting..." : "Reset Demo Data"}
              </Button>
            </div>
          </>
        )}
      </Container>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-steel/30 bg-white p-6 text-center">
      <p className="text-xs font-medium text-navy/50">{label}</p>
      <p className="mt-1 text-2xl font-bold text-navy">{value}</p>
    </div>
  );
}
