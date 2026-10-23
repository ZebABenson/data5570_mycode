import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Container } from "@/components/Container";
import { ButtonLink } from "@/components/Button";
import { Lightbulb, Brain, Gauge, ArrowRight } from "lucide-react";

const values = [
  {
    icon: Lightbulb,
    title: "Clarity",
    body: "Structured project information that is easy to find, trust, and act on.",
  },
  {
    icon: Brain,
    title: "Intelligence",
    body: "Historical project knowledge applied to the decisions firms make every day.",
  },
  {
    icon: Gauge,
    title: "Efficiency",
    body: "Less time managing information, more time doing engineering work.",
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="bg-mist py-20">
          <Container className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-navy sm:text-5xl">
              Built for the firms that engineer what&apos;s next.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-navy/70">
              ARLO is an AI-native software platform designed to help
              engineering firms make better use of the information they
              already generate. By connecting job setup, historical fees,
              project estimating, and backlog forecasting, ARLO helps firms
              build more consistent processes and make better-informed
              business decisions.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-navy/70">
              Engineering firms accumulate years of valuable project
              experience, but much of that knowledge remains scattered across
              spreadsheets, accounting systems, and individual employees.
              ARLO brings that information into one structured platform,
              allowing firms to learn from past work and apply those insights
              to future projects.
            </p>
          </Container>
        </section>

        <section className="bg-white py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-navy">
                Turn engineering experience into a competitive advantage.
              </h2>
              <p className="mt-4 text-navy/60">
                Our vision is to make engineering firms more efficient,
                informed, and confident in the way they operate. We believe
                better information should lead to better pricing decisions,
                more reliable estimates, clearer forecasts, and stronger
                firms.
              </p>
            </div>

            <div className="mt-14 grid gap-6 sm:grid-cols-3">
              {values.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-steel/30 bg-mist/60 p-7 text-center"
                >
                  <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-navy">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-navy/60">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="bg-mist py-20">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-navy">
                Meet the Founder
              </h2>
            </div>

            <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center gap-6 rounded-2xl border border-steel/30 bg-white p-10 text-center sm:flex-row sm:text-left">
              <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-navy text-2xl font-bold text-white">
                ZB
              </div>
              <div>
                <h3 className="text-xl font-bold text-navy">Zeb Benson</h3>
                <p className="text-sm font-semibold text-teal">
                  Founder, ARLO
                </p>
                <p className="mt-3 text-sm leading-relaxed text-navy/70">
                  Zeb Benson is a business professional with a background in
                  accounting, financial analysis, and business strategy. His
                  experience working with businesses and solving operational
                  challenges has shaped his interest in building technology
                  that helps organizations work smarter. Through ARLO, Zeb is
                  focused on helping engineering firms turn their historical
                  project information into better decisions, stronger
                  processes, and long-term value.
                </p>
              </div>
            </div>
          </Container>
        </section>

        <section className="bg-navy py-20 text-center text-white">
          <Container>
            <h2 className="text-3xl font-bold">
              Experience ARLO for yourself.
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
