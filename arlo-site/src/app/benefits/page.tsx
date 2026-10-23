"use client";

import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/Button";
import { cn } from "@/lib/utils";
import { OperationalCalculator } from "@/components/calculators/OperationalCalculator";
import { PricingScenarioCalculator } from "@/components/calculators/PricingScenarioCalculator";
import { ArrowRight } from "lucide-react";

type Mode = "operational" | "pricing";

export default function BenefitsPage() {
  const [mode, setMode] = useState<Mode>("operational");

  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-mist py-20">
          <Container className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              What could your engineering firm save with ARLO?
            </h1>
            <p className="mt-5 text-lg text-navy/60">
              Adjust the assumptions below to explore how streamlining job
              setup, fee development, and project analysis could free up
              valuable time and reduce operating costs.
            </p>
          </Container>
        </section>

        <section className="bg-white py-16">
          <Container>
            <div className="mb-10 flex justify-center">
              <div className="inline-flex rounded-full border border-steel/40 bg-mist p-1">
                <button
                  onClick={() => setMode("operational")}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                    mode === "operational"
                      ? "bg-navy text-white"
                      : "text-navy/60 hover:text-navy"
                  )}
                >
                  Operational Time Savings
                </button>
                <button
                  onClick={() => setMode("pricing")}
                  className={cn(
                    "rounded-full px-5 py-2 text-sm font-semibold transition-colors",
                    mode === "pricing"
                      ? "bg-navy text-white"
                      : "text-navy/60 hover:text-navy"
                  )}
                >
                  Pricing Scenario
                </button>
              </div>
            </div>

            {mode === "operational" ? (
              <OperationalCalculator />
            ) : (
              <PricingScenarioCalculator />
            )}

            <div className="mx-auto mt-12 max-w-3xl rounded-xl border border-steel/30 bg-mist/60 p-5 text-center text-xs text-navy/50">
              Results are illustrative estimates based on user-selected
              assumptions. Actual outcomes will depend on workflows,
              adoption, staffing, and implementation. Freed labor capacity
              does not automatically equal cash savings.
            </div>
          </Container>
        </section>

        <section className="bg-navy py-20 text-center text-white">
          <Container>
            <h2 className="text-3xl font-bold">
              Want to experience these workflows?
            </h2>
            <div className="mt-8">
              <ButtonLink href="/demo" variant="onDark" size="lg">
                Test Demo
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
