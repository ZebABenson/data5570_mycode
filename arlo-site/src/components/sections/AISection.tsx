"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/Container";
import { Sparkles } from "lucide-react";

const prompts = [
  "What should we charge for this project?",
  "Show similar structural engineering jobs.",
  "What does next quarter's backlog look like?",
  "Which past projects exceeded their budgets?",
  "How many hours did comparable renovation projects require?",
];

export function AISection() {
  return (
    <section className="bg-navy py-24 text-white">
      <Container className="grid gap-14 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            AI-native
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Your firm&apos;s experience. Now working for you.
          </h2>
          <p className="mt-5 max-w-lg text-white/70">
            ARLO&apos;s AI agents operate across your firm&apos;s shared project
            information&mdash;fees, estimates, costs, and backlog&mdash;so
            intelligence is built into the workflow, not bolted on as a
            separate chatbot.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
        >
          <p className="mb-4 text-xs font-semibold tracking-wide text-white/40 uppercase">
            Ask ARLO
          </p>
          <div className="space-y-3">
            {prompts.map((prompt) => (
              <div
                key={prompt}
                className="rounded-xl border border-white/10 bg-navy/60 px-4 py-3 text-sm text-white/90"
              >
                {prompt}
              </div>
            ))}
          </div>
        </motion.div>
      </Container>
    </section>
  );
}
