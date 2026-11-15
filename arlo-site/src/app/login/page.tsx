"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Lock, UserPlus } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/Button";
import { loginAction, type LoginFormState } from "@/app/login/actions";

const initialState: LoginFormState = {};

export default function LoginPage() {
  const [mode, setMode] = useState<"existing" | "new">("existing");
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <main className="min-h-screen bg-mist">
      <header className="border-b border-steel/30 bg-white px-6 py-4">
        <Container className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/70 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ARLO
          </Link>
        </Container>
      </header>

      <Container className="flex justify-center py-16">
        <div className="w-full max-w-md">
          <div className="overflow-hidden rounded-2xl border border-steel/30 bg-white shadow-sm">
            <div className="flex border-b border-steel/30">
              <button
                type="button"
                onClick={() => setMode("existing")}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                  mode === "existing"
                    ? "border-b-2 border-navy text-navy"
                    : "text-navy/50 hover:text-navy/70"
                }`}
              >
                <Lock className="h-4 w-4" />
                Existing User
              </button>
              <button
                type="button"
                onClick={() => setMode("new")}
                className={`flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors ${
                  mode === "new"
                    ? "border-b-2 border-navy text-navy"
                    : "text-navy/50 hover:text-navy/70"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                New User
              </button>
            </div>

            <div className="p-8">
              {mode === "existing" ? (
                <>
                  <h1 className="text-xl font-bold text-navy">Log in to ARLO</h1>
                  <p className="mt-1.5 text-sm text-navy/60">
                    Enter the email and password for your ARLO account.
                  </p>

                  <form action={formAction} className="mt-6 space-y-4">
                    <div>
                      <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-navy">
                        Email
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        autoComplete="username"
                        className="w-full rounded-lg border border-steel/50 bg-white px-3.5 py-2.5 text-sm text-navy focus:border-teal focus:outline-none"
                        placeholder="you@company.com"
                      />
                    </div>
                    <div>
                      <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-navy">
                        Password
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        autoComplete="current-password"
                        className="w-full rounded-lg border border-steel/50 bg-white px-3.5 py-2.5 text-sm text-navy focus:border-teal focus:outline-none"
                        placeholder="••••••••"
                      />
                    </div>

                    {state.error && (
                      <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
                        {state.error}
                      </p>
                    )}

                    <Button type="submit" disabled={pending} className="w-full">
                      {pending ? "Logging in..." : "Log In"}
                    </Button>
                  </form>
                </>
              ) : (
                <>
                  <h1 className="text-xl font-bold text-navy">New to ARLO?</h1>
                  <p className="mt-1.5 text-sm text-navy/60">
                    ARLO is currently invite-only while in testing. There&rsquo;s no
                    self-serve sign-up yet &mdash; contact your ARLO administrator
                    and they&rsquo;ll set up a login for you.
                  </p>
                  <div className="mt-6 rounded-lg border border-steel/30 bg-mist/60 px-4 py-3 text-sm text-navy/70">
                    Once you have a login, switch to the{" "}
                    <button
                      type="button"
                      onClick={() => setMode("existing")}
                      className="font-semibold text-navy underline underline-offset-2"
                    >
                      Existing User
                    </button>{" "}
                    tab to sign in.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
