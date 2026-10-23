import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/Button";
import { ClipboardList, Calculator, LineChart, Ruler, ArrowRight } from "lucide-react";

const features = [
  {
    icon: ClipboardList,
    eyebrow: "Job Setup",
    title: "Consistent project data from day one.",
    body: "Capture the right project information once and make it available everywhere.",
    href: "/demo/job-setup",
  },
  {
    icon: Calculator,
    eyebrow: "Fee Development",
    title: "Stop guessing what to charge.",
    body: "Compare similar past projects, understand historical costs, and develop better-informed fees.",
    href: "/demo/fee-development",
  },
  {
    icon: LineChart,
    eyebrow: "Backlog Projection",
    title: "Know what's coming.",
    body: "Understand remaining contracted work and project future billing activity.",
    href: "/demo/backlog",
  },
  {
    icon: Ruler,
    eyebrow: "Estimating",
    title: "Estimate with evidence, not memory.",
    body: "Use historical hours and costs by phase and role to develop more informed project budgets.",
    href: "/demo/estimating",
  },
];

export function SolutionsSection() {
  return (
    <section id="solutions" className="bg-mist py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            One job record. Intelligence across your firm.
          </h2>
        </div>

        <div className="mt-16 grid gap-6 lg:grid-cols-2">
          {features.map(({ icon: Icon, eyebrow, title, body, href }) => (
            <div
              key={eyebrow}
              className="flex flex-col rounded-2xl border border-steel/30 bg-white p-8 shadow-sm"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-semibold tracking-wide text-teal uppercase">
                {eyebrow}
              </p>
              <h3 className="mt-2 text-xl font-bold text-navy">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-navy/60">
                {body}
              </p>
              <ButtonLink
                href={href}
                variant="ghost"
                size="sm"
                className="mt-6 w-fit px-0 hover:bg-transparent hover:underline"
              >
                Explore in the demo
                <ArrowRight className="h-4 w-4" />
              </ButtonLink>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
