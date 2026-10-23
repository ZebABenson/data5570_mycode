"use client";

import { useMemo, useState } from "react";
import { SliderField } from "@/components/calculators/SliderField";

export function PricingScenarioCalculator() {
  const [proposalsWon, setProposalsWon] = useState(60);
  const [avgFee, setAvgFee] = useState(75000);
  const [shareAffected, setShareAffected] = useState(20);
  const [improvementPct, setImprovementPct] = useState(5);

  const incrementalFees = useMemo(() => {
    return (
      proposalsWon *
      avgFee *
      (shareAffected / 100) *
      (improvementPct / 100)
    );
  }, [proposalsWon, avgFee, shareAffected, improvementPct]);

  const fmtCurrency = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-7 rounded-2xl border border-steel/30 bg-white p-8">
        <SliderField
          label="Annual proposals won"
          value={proposalsWon}
          min={5}
          max={400}
          onChange={setProposalsWon}
        />
        <SliderField
          label="Average contracted fee"
          value={avgFee}
          min={5000}
          max={500000}
          step={1000}
          prefix="$"
          onChange={setAvgFee}
        />
        <SliderField
          label="Share of contracts affected by a pricing improvement"
          value={shareAffected}
          min={0}
          max={100}
          suffix="%"
          onChange={setShareAffected}
        />
        <SliderField
          label="Illustrative pricing improvement"
          value={improvementPct}
          min={0}
          max={20}
          suffix="%"
          onChange={setImprovementPct}
        />
      </div>

      <div className="flex flex-col justify-center space-y-6">
        <div className="rounded-2xl border border-steel/30 bg-mist p-8 text-center">
          <p className="text-xs font-medium text-navy/50">
            Hypothetical Incremental Contracted Fees
          </p>
          <p className="mt-2 text-4xl font-bold text-navy">
            {fmtCurrency(incrementalFees)}
          </p>
          <p className="mt-4 text-sm text-navy/60">
            {proposalsWon} proposals &times; {fmtCurrency(avgFee)} average fee
            &times; {shareAffected}% of contracts &times; {improvementPct}%
            pricing improvement
          </p>
        </div>

        <div className="rounded-2xl border border-steel/30 bg-white p-6 text-sm text-navy/60">
          This is a scenario model, not a validated prediction of ARLO&apos;s
          performance. Incremental contracted fees are not the same as
          profit, and this estimate is not automatically combined with the
          operational time-savings calculator because the effects may
          overlap.
        </div>
      </div>
    </div>
  );
}
