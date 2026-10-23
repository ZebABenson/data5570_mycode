"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/Button";

export default function DemoWelcome() {
  const [companyName, setCompanyName] = useState("Summit Engineering Group");

  return (
    <main className="flex min-h-screen flex-col bg-mist">
      <header className="border-b border-steel/30 bg-white px-6 py-4">
        <Container className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/70 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to arlo.com
          </Link>
        </Container>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-20">
        <div className="w-full max-w-lg rounded-2xl border border-steel/30 bg-white p-10 text-center shadow-[0_30px_60px_-20px_rgba(16,38,63,0.15)]">
          <p className="mb-3 inline-flex rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold tracking-wide text-teal uppercase">
            Demo Workspace
          </p>
          <h1 className="text-2xl font-bold text-navy">
            Welcome to your engineering firm.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-navy/60">
            We&apos;ve prepared a fictional engineering firm for you to
            explore. Develop fees, create projects, build estimates, analyze
            backlog, and experience ARLO using realistic sample data.
          </p>

          <div className="mt-8 text-left">
            <label className="text-xs font-semibold tracking-wide text-navy/40 uppercase">
              Fictional company name
            </label>
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-steel/50 px-4 py-2.5 text-sm text-navy focus:border-teal focus:outline-none"
            />
          </div>

          <ButtonLink
            href="/demo/overview"
            size="lg"
            className="mt-8 w-full justify-center"
          >
            Enter Demo Workspace
            <ArrowRight className="h-4 w-4" />
          </ButtonLink>

          <p className="mt-4 text-xs text-navy/40">
            No account needed. All data is simulated and resets on request.
          </p>
        </div>
      </div>
    </main>
  );
}
