import { Container } from "@/components/Container";
import { Check } from "lucide-react";

const outcomes = [
  "Faster job setup",
  "More consistent project information",
  "More informed fee proposals",
  "Better project cost estimates",
  "Improved backlog visibility",
  "Easier access to historical job intelligence",
  "Reduced repetitive administrative work",
];

export function BusinessValue() {
  return (
    <section id="benefits" className="bg-mist py-24">
      <Container className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-navy sm:text-4xl">
            Spend less time managing information. More time engineering.
          </h2>
          <p className="mt-4 text-navy/60">
            ARLO is designed to give time back to the people running and
            delivering your projects.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2">
          {outcomes.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal/15 text-teal">
                <Check className="h-3.5 w-3.5" />
              </span>
              <span className="text-sm text-navy/80">{item}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
