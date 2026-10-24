"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { useDemo } from "@/components/demo/DemoProvider";

export default function DemoWelcome() {
  const { meta, loading, renameCompany } = useDemo();
  const [companyName, setCompanyName] = useState("");
  const [entering, setEntering] = useState(false);
  const router = useRouter();

  const placeholder = meta?.companyName ?? "Summit Engineering Group";

  async function handleEnter() {
    setEntering(true);
    const trimmed = companyName.trim();
    if (trimmed && meta && trimmed !== meta.companyName) {
      await renameCompany(trimmed);
    }
    router.push("/demo/overview");
  }

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
              placeholder={loading ? "Loading..." : placeholder}
              className="mt-2 w-full rounded-lg border border-steel/50 px-4 py-2.5 text-sm text-navy placeholder:text-navy/40 focus:border-teal focus:outline-none"
            />
          </div>

          <Button
            size="lg"
            className="mt-8 w-full justify-center"
            onClick={handleEnter}
            disabled={loading || entering}
          >
            {entering ? "Opening workspace..." : "Enter Demo Workspace"}
            <ArrowRight className="h-4 w-4" />
          </Button>

          <p className="mt-4 text-xs text-navy/40">
            No account needed. All data is simulated, saved only in this
            browser, and resets automatically after seven days.
          </p>
        </div>
      </div>
    </main>
  );
}
