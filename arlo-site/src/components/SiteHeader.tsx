"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ButtonLink } from "@/components/Button";
import { Container } from "@/components/Container";

const navLinks = [
  { label: "Platform", href: "/platform" },
  { label: "Solutions", href: "/#solutions" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Benefits", href: "/#benefits" },
  { label: "About", href: "/#about" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-steel/30 bg-white/80 backdrop-blur-md">
      <Container className="flex items-center justify-between py-3.5">
        <Logo />

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-navy/80 transition-colors hover:text-navy"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href="/demo" size="sm">
            Test Demo
          </ButtonLink>
          <ButtonLink href="/#book-a-demo" variant="secondary" size="sm">
            Book a Demo
          </ButtonLink>
        </div>

        <button
          className="flex items-center justify-center rounded-md p-2 text-navy lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle navigation menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </Container>

      {open && (
        <div className="border-t border-steel/30 bg-white px-6 py-4 lg:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-navy"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-3">
              <ButtonLink href="/demo">Test Demo</ButtonLink>
              <ButtonLink href="/#book-a-demo" variant="secondary">
                Book a Demo
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
