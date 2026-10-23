import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/Button";
import {
  FileX,
  Brain,
  Search,
  Ruler,
  LineChart,
  Sparkles,
  ArrowRight,
  Mail,
  Calculator,
  ClipboardList,
  TrendingUp,
  MessageSquare,
} from "lucide-react";

const solutions = [
  {
    icon: FileX,
    problem: "Inconsistent Job Setup",
    problemBody:
      "Project information is entered inconsistently across systems and employees.",
    solutionBody:
      "Structured job setup with controlled fields, reliable job numbering, and centralized records.",
  },
  {
    icon: Brain,
    problem: "Pricing from Memory",
    problemBody:
      "Project managers rely on personal experience and incomplete historical information to set fees.",
    solutionBody:
      "ARLO retrieves comparable completed projects and displays historical fees, costs, and margins.",
  },
  {
    icon: Ruler,
    problem: "Uncertain Project Estimates",
    problemBody:
      "Engineering budgets are often based on rough assumptions rather than historical hours by phase and role.",
    solutionBody:
      "ARLO lets users compare historical engineering effort and build more informed budgets.",
  },
  {
    icon: LineChart,
    problem: "Limited Backlog Visibility",
    problemBody:
      "Leadership struggles to determine remaining contracted work and when future billings may occur.",
    solutionBody:
      "ARLO calculates backlog from contracted fees and billings, with projected future allocation.",
  },
  {
    icon: Search,
    problem: "Underused Historical Knowledge",
    problemBody:
      "Firms accumulate years of valuable engineering project information but struggle to extract useful insights.",
    solutionBody:
      "Ask ARLO makes the structured information accessible through natural-language questions.",
  },
];

const storySteps = [
  { icon: Mail, label: "Receive Opportunity" },
  { icon: Search, label: "Review Historical Projects" },
  { icon: Calculator, label: "Develop Fee" },
  { icon: Ruler, label: "Build Estimate" },
  { icon: ClipboardList, label: "Set Up Job" },
  { icon: TrendingUp, label: "Forecast Backlog" },
  { icon: MessageSquare, label: "Ask ARLO" },
];

export default function SolutionsPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-mist py-20">
          <Container className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Engineering firms deserve better than disconnected spreadsheets.
            </h1>
            <p className="mt-5 text-lg text-navy/60">
              ARLO helps engineering firms turn fragmented project information
              into structured knowledge they can actually use.
            </p>
          </Container>
        </section>

        <section className="bg-white py-20">
          <Container className="space-y-16">
            {solutions.map(({ icon: Icon, problem, problemBody, solutionBody }, i) => (
              <div
                key={problem}
                className="grid items-center gap-10 lg:grid-cols-2"
              >
                <div className={i % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-semibold tracking-wide text-teal uppercase">
                    The Problem
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-navy">
                    {problem}
                  </h2>
                  <p className="mt-3 text-navy/60">{problemBody}</p>

                  <p className="mt-6 text-xs font-semibold tracking-wide text-teal uppercase">
                    How ARLO Helps
                  </p>
                  <p className="mt-2 text-navy/70">{solutionBody}</p>
                </div>

                <div
                  className={`flex items-center justify-center gap-4 rounded-2xl border border-steel/30 bg-mist/60 p-10 ${
                    i % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <div className="rounded-xl border border-steel/40 bg-white px-5 py-6 text-center opacity-60 shadow-sm">
                    <p className="text-[10px] font-semibold tracking-wide text-navy/40 uppercase">
                      Before
                    </p>
                    <p className="mt-2 text-xs text-navy/50">
                      Scattered spreadsheets,
                      <br />
                      inconsistent records
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-steel" />
                  <div className="rounded-xl border border-teal/40 bg-white px-5 py-6 text-center shadow-md">
                    <p className="text-[10px] font-semibold tracking-wide text-teal uppercase">
                      After
                    </p>
                    <p className="mt-2 text-xs font-medium text-navy">
                      One structured
                      <br />
                      ARLO record
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </Container>
        </section>

        <section className="bg-navy py-20 text-white">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold tracking-wide text-teal uppercase">
                <Sparkles className="h-3.5 w-3.5" />
                Example Walkthrough
              </p>
              <h2 className="text-3xl font-bold">
                Riverside Professional Office Building
              </h2>
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              {storySteps.map(({ icon: Icon, label }, i) => (
                <div key={label} className="flex items-center gap-4">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/5">
                      <Icon className="h-5 w-5 text-teal" />
                    </div>
                    <span className="max-w-20 text-xs text-white/70">
                      {label}
                    </span>
                  </div>
                  {i < storySteps.length - 1 && (
                    <ArrowRight className="hidden h-4 w-4 text-white/20 sm:block" />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-14 text-center">
              <ButtonLink href="/demo" variant="onDark" size="lg">
                See These Solutions in Action
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
