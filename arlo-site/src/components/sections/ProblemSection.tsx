import { Container } from "@/components/Container";
import { FileWarning, Brain, FolderKanban, TrendingDown, Search } from "lucide-react";

const problems = [
  {
    icon: FileWarning,
    title: "Inconsistent Job Setup",
    body: "Different people record information differently, making historical comparison difficult.",
  },
  {
    icon: Brain,
    title: "Pricing from Memory",
    body: "Project managers rely on experience and incomplete historical information when developing fees.",
  },
  {
    icon: FolderKanban,
    title: "Scattered Project Data",
    body: "Information exists across spreadsheets, accounting systems, emails, and individual employees.",
  },
  {
    icon: TrendingDown,
    title: "Unclear Backlog",
    body: "Leadership struggles to understand remaining contracted work and when it will be billed.",
  },
  {
    icon: Search,
    title: "Limited Historical Insight",
    body: "Firms cannot easily compare the actual engineering effort required by similar past jobs.",
  },
];

export function ProblemSection() {
  return (
    <section className="bg-white py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Your firm&apos;s most valuable project data shouldn&apos;t live in
            scattered spreadsheets.
          </h2>
          <p className="mt-4 text-lg text-navy/60">
            Most engineering firms have years of valuable historical project
            knowledge&mdash;but no consistent way to put it to work.
          </p>
        </div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {problems.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-2xl border border-steel/30 bg-mist/60 p-6 transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-navy/5 text-navy">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/60">{body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
