import Link from "next/link";
import { ArrowLeft, Construction } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";

export default function DemoOverview() {
  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-steel/30 bg-white px-6 py-4">
        <Container className="flex items-center justify-between">
          <Logo />
          <Link
            href="/demo"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/70 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </Container>
      </header>

      <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-navy/5 text-navy">
          <Construction className="h-6 w-6" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-navy">
          The full interactive workspace is being built next.
        </h1>
        <p className="mt-3 max-w-md text-sm text-navy/60">
          This marketing site and demo entry point are the first phase of the
          ARLO build. Opportunity intake, fee development, estimating,
          backlog, the job register, and Ask ARLO will connect to a shared
          fictional dataset in the next phase.
        </p>
      </Container>
    </main>
  );
}
