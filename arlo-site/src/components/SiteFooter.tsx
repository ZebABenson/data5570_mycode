import { Logo } from "@/components/Logo";
import { Container } from "@/components/Container";

export function SiteFooter() {
  return (
    <footer className="border-t border-steel/30 bg-white py-10">
      <Container className="flex flex-col items-center justify-between gap-4 text-sm text-navy/50 sm:flex-row">
        <Logo className="h-6 w-auto opacity-80" />
        <p>&copy; 2026 ARLO. All demo data is fictional.</p>
      </Container>
    </footer>
  );
}
