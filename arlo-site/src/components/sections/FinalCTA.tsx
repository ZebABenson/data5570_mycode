"use client";

import { useState, type FormEvent } from "react";
import { Container } from "@/components/Container";
import { ButtonLink, Button } from "@/components/Button";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <section id="book-a-demo" className="bg-navy py-24 text-white">
      <Container className="grid gap-16 lg:grid-cols-2 lg:items-start">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            See what ARLO could do for your firm.
          </h2>
          <p className="mt-4 max-w-md text-white/70">
            Step inside a fully functioning fictional engineering firm and
            experience how ARLO turns historical project information into
            smarter decisions.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href="/demo" variant="onDark" size="lg">
              Test Demo
              <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-lg font-semibold">Book a Demo</h3>
          <p className="mt-1 text-sm text-white/50">
            This is a local preview form. No message is actually sent&mdash;there
            is no backend connected yet.
          </p>

          {submitted ? (
            <div className="mt-6 rounded-xl border border-teal/30 bg-teal/10 p-4 text-sm text-white">
              Thanks! This is a local-only preview, so nothing was actually
              submitted or delivered.
            </div>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="Name"
                  className="rounded-lg border border-white/15 bg-navy/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-teal focus:outline-none"
                />
                <input
                  required
                  type="email"
                  placeholder="Work email"
                  className="rounded-lg border border-white/15 bg-navy/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-teal focus:outline-none"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <input
                  required
                  placeholder="Company"
                  className="rounded-lg border border-white/15 bg-navy/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-teal focus:outline-none"
                />
                <select
                  required
                  defaultValue=""
                  className="rounded-lg border border-white/15 bg-navy/40 px-4 py-2.5 text-sm text-white focus:border-teal focus:outline-none"
                >
                  <option value="" disabled>
                    Engineering discipline
                  </option>
                  <option>Structural</option>
                  <option>Civil</option>
                  <option>MEP</option>
                  <option>Geotechnical</option>
                  <option>Other</option>
                </select>
              </div>
              <select
                required
                defaultValue=""
                className="w-full rounded-lg border border-white/15 bg-navy/40 px-4 py-2.5 text-sm text-white focus:border-teal focus:outline-none"
              >
                <option value="" disabled>
                  Firm size
                </option>
                <option>1&ndash;10 employees</option>
                <option>11&ndash;50 employees</option>
                <option>51&ndash;150 employees</option>
                <option>150+ employees</option>
              </select>
              <textarea
                placeholder="Message (optional)"
                rows={3}
                className="w-full rounded-lg border border-white/15 bg-navy/40 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-teal focus:outline-none"
              />
              <Button type="submit" variant="onDark" className="w-full">
                Submit
              </Button>
            </form>
          )}
        </div>
      </Container>
    </section>
  );
}
