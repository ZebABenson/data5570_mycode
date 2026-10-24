import { Container } from "@/components/Container";
import { Database, Share2, TrendingUp } from "lucide-react";

const steps = [
  {
    icon: Database,
    step: "01",
    title: "Capture",
    body: "Create consistent, structured project records.",
  },
  {
    icon: Share2,
    step: "02",
    title: "Connect",
    body: "Use shared information across fees, estimates, costs, and backlog.",
  },
  {
    icon: TrendingUp,
    step: "03",
    title: "Improve",
    body: "Apply historical project knowledge and AI assistance to future decisions.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-24">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            From scattered data to smarter decisions.
          </h2>
        </div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {steps.map(({ icon: Icon, step, title, body }, i) => (
            <div key={step} className="relative">
              <div className="relative z-10 flex items-center gap-4 bg-white pr-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-sm font-semibold text-steel">{step}</span>
              </div>
              <h3 className="mt-5 text-xl font-bold text-navy">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy/60">{body}</p>
              {i < steps.length - 1 && (
                <div className="absolute top-6 left-full hidden h-px w-8 bg-steel/40 lg:block" />
              )}
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
