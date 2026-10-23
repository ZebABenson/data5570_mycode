"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { ArrowRight, PlayCircle, Sparkles } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";
import { BlueprintBackground } from "@/components/BlueprintBackground";

const backlogTrend = [
  { month: "Apr", value: 3.1 },
  { month: "May", value: 3.4 },
  { month: "Jun", value: 3.3 },
  { month: "Jul", value: 3.8 },
  { month: "Aug", value: 4.1 },
  { month: "Sep", value: 4.4 },
  { month: "Oct", value: 4.7 },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-mist">
      <BlueprintBackground />
      <Container className="relative grid gap-16 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-steel/60 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-teal uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            AI-native for engineering firms
          </p>

          <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-navy sm:text-5xl lg:text-[3.25rem]">
            Better project data. Smarter fees. Stronger firms.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-navy/70">
            ARLO brings your engineering firm&apos;s projects, fees, estimates,
            and backlog together in one AI-native platform&mdash;helping your
            team reduce administrative work, make better decisions, and operate
            more profitably.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <ButtonLink href="/demo" size="lg">
              Test Demo
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
            <ButtonLink href="#how-it-works" variant="ghost" size="lg">
              <PlayCircle className="h-4 w-4" />
              See How ARLO Works
            </ButtonLink>
          </div>

          <p className="mt-5 text-sm text-navy/50">
            No credit card required. No real company data needed. Explore with
            a fictional engineering firm.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.15 }}
          className="relative"
        >
          <div className="rounded-2xl border border-steel/40 bg-white p-6 shadow-[0_30px_60px_-20px_rgba(16,38,63,0.25)]">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium tracking-wide text-navy/40 uppercase">
                  Contracted Backlog
                </p>
                <p className="text-2xl font-bold text-navy">$4.7M</p>
              </div>
              <span className="rounded-full bg-teal/10 px-3 py-1 text-xs font-semibold text-teal">
                +12% this quarter
              </span>
            </div>

            <div className="h-28 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={backlogTrend}
                  margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
                >
                  <defs>
                    <linearGradient id="backlogFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#5B8090" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#5B8090" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#10263F"
                    strokeWidth={2}
                    fill="url(#backlogFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-mist p-4">
                <p className="text-xs font-medium text-navy/50">Active Jobs</p>
                <p className="mt-1 text-lg font-bold text-navy">17</p>
              </div>
              <div className="rounded-xl bg-mist p-4">
                <p className="text-xs font-medium text-navy/50">Avg. Margin</p>
                <p className="mt-1 text-lg font-bold text-navy">31%</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-steel/40 bg-navy p-4">
              <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-teal uppercase">
                Ask ARLO
              </p>
              <p className="text-sm text-white/90">
                &ldquo;What should we charge for a 45,000 SF structural
                project?&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
