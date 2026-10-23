"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { SliderField } from "@/components/calculators/SliderField";

const FTE_HOURS_PER_YEAR = 2080;

export function OperationalCalculator() {
  const [annualProjects, setAnnualProjects] = useState(100);
  const [employees, setEmployees] = useState(40);
  const [jobSetupHours, setJobSetupHours] = useState(3);
  const [feeDevHours, setFeeDevHours] = useState(8);
  const [hourlyCost, setHourlyCost] = useState(90);
  const [annualProposals, setAnnualProposals] = useState(150);
  const [jobSetupReduction, setJobSetupReduction] = useState(40);
  const [feeDevReduction, setFeeDevReduction] = useState(35);

  const results = useMemo(() => {
    const annualJobSetupHours = annualProjects * jobSetupHours;
    const annualFeeDevHours = annualProposals * feeDevHours;

    const jobSetupHoursSaved = annualJobSetupHours * (jobSetupReduction / 100);
    const feeDevHoursSaved = annualFeeDevHours * (feeDevReduction / 100);

    const totalHoursSaved = jobSetupHoursSaved + feeDevHoursSaved;
    const laborCapacityValue = totalHoursSaved * hourlyCost;
    const hoursPerMonth = totalHoursSaved / 12;
    const fteEquivalent = totalHoursSaved / FTE_HOURS_PER_YEAR;

    return {
      annualJobSetupHours,
      annualFeeDevHours,
      totalHoursSaved,
      laborCapacityValue,
      hoursPerMonth,
      fteEquivalent,
      remainingJobSetupHours: annualJobSetupHours - jobSetupHoursSaved,
      remainingFeeDevHours: annualFeeDevHours - feeDevHoursSaved,
    };
  }, [
    annualProjects,
    jobSetupHours,
    feeDevHours,
    hourlyCost,
    annualProposals,
    jobSetupReduction,
    feeDevReduction,
  ]);

  const chartData = [
    {
      name: "Today",
      hours: Math.round(results.annualJobSetupHours + results.annualFeeDevHours),
    },
    {
      name: "With ARLO",
      hours: Math.round(results.remainingJobSetupHours + results.remainingFeeDevHours),
    },
  ];

  const fmt = (n: number) => Math.round(n).toLocaleString();
  const fmtCurrency = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-7 rounded-2xl border border-steel/30 bg-white p-8">
        <SliderField
          label="Projects per year"
          value={annualProjects}
          min={10}
          max={500}
          onChange={setAnnualProjects}
        />
        <SliderField
          label="Employees"
          value={employees}
          min={5}
          max={250}
          onChange={setEmployees}
        />
        <SliderField
          label="Hours to set up each job"
          value={jobSetupHours}
          min={0.5}
          max={12}
          step={0.5}
          suffix="hrs"
          onChange={setJobSetupHours}
        />
        <SliderField
          label="Fee proposals per year"
          value={annualProposals}
          min={10}
          max={1000}
          onChange={setAnnualProposals}
        />
        <SliderField
          label="Hours to develop a fee proposal"
          value={feeDevHours}
          min={1}
          max={30}
          suffix="hrs"
          onChange={setFeeDevHours}
        />
        <SliderField
          label="Fully loaded hourly cost"
          value={hourlyCost}
          min={30}
          max={250}
          prefix="$"
          onChange={setHourlyCost}
        />
        <SliderField
          label="Assumed job setup time reduction"
          value={jobSetupReduction}
          min={0}
          max={80}
          suffix="%"
          onChange={setJobSetupReduction}
        />
        <SliderField
          label="Assumed fee development time reduction"
          value={feeDevReduction}
          min={0}
          max={80}
          suffix="%"
          onChange={setFeeDevReduction}
        />
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-steel/30 bg-mist p-6">
            <p className="text-xs font-medium text-navy/50">
              Potential Annual Hours Saved
            </p>
            <p className="mt-1 text-3xl font-bold text-navy">
              {fmt(results.totalHoursSaved)}
            </p>
          </div>
          <div className="rounded-2xl border border-steel/30 bg-mist p-6">
            <p className="text-xs font-medium text-navy/50">
              Estimated Labor Capacity Value
            </p>
            <p className="mt-1 text-3xl font-bold text-navy">
              {fmtCurrency(results.laborCapacityValue)}
            </p>
          </div>
          <div className="rounded-2xl border border-steel/30 bg-mist p-6">
            <p className="text-xs font-medium text-navy/50">
              Hours Freed per Month
            </p>
            <p className="mt-1 text-3xl font-bold text-navy">
              {fmt(results.hoursPerMonth)}
            </p>
          </div>
          <div className="rounded-2xl border border-steel/30 bg-mist p-6">
            <p className="text-xs font-medium text-navy/50">
              Equivalent Full-Time Capacity
            </p>
            <p className="mt-1 text-3xl font-bold text-navy">
              {results.fteEquivalent.toFixed(1)} FTE
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-steel/30 bg-white p-6">
          <p className="mb-4 text-sm font-semibold text-navy">
            Current vs. Illustrative Annual Administrative Hours
          </p>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#A9BBC7" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 12, fill: "#10263F99" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={80}
                  tick={{ fontSize: 12, fill: "#10263F" }}
                />
                <Bar dataKey="hours" fill="#10263F" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-steel/30 bg-mist p-6">
          <p className="text-sm font-semibold text-navy">
            Where could your recovered capacity go?
          </p>
          <ul className="mt-3 space-y-1.5 text-sm text-navy/70">
            <li>&bull; More engineering design work</li>
            <li>&bull; Faster proposal turnaround</li>
            <li>&bull; Better project review</li>
            <li>&bull; Improved client service</li>
            <li>&bull; Additional billable capacity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
