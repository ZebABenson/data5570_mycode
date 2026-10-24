"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowUp, Sparkles } from "lucide-react";
import { Container } from "@/components/Container";
import { Logo } from "@/components/Logo";
import { useDemo } from "@/components/demo/DemoProvider";
import { answerQuestion, SUGGESTED_QUESTIONS, type AskArloResponse } from "@/lib/demo/askArlo";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  response?: AskArloResponse;
}

export default function AskArloPage() {
  const { dataset, loading } = useDemo();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function send(question: string) {
    const text = question.trim();
    if (!text || !dataset) return;

    setMessages((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setThinking(true);

    setTimeout(() => {
      const response = answerQuestion(dataset, text);
      setMessages((prev) => [...prev, { role: "assistant", text: response.answer, response }]);
      setThinking(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }, 550);
  }

  return (
    <main className="flex min-h-screen flex-col bg-mist">
      <header className="border-b border-steel/30 bg-white px-6 py-4">
        <Container className="flex items-center justify-between">
          <Logo />
          <Link
            href="/demo/overview"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-navy/70 hover:text-navy"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Link>
        </Container>
      </header>

      <Container className="flex flex-1 flex-col py-8">
        <div className="mx-auto w-full max-w-3xl flex-1">
          <div className="mb-6 text-center">
            <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-steel/60 bg-white px-4 py-1.5 text-xs font-semibold tracking-wide text-teal uppercase">
              <Sparkles className="h-3.5 w-3.5" />
              Ask ARLO
            </p>
            <h1 className="text-2xl font-bold text-navy">Turn years of project knowledge into answers.</h1>
          </div>

          <div
            ref={scrollRef}
            className="max-h-[55vh] min-h-[200px] overflow-y-auto rounded-2xl border border-steel/30 bg-white p-5"
          >
            {messages.length === 0 ? (
              <div>
                <p className="mb-3 text-xs font-semibold tracking-wide text-navy/40 uppercase">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTED_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      disabled={loading}
                      className="rounded-full border border-steel/40 bg-mist px-3 py-1.5 text-left text-xs text-navy/70 transition-colors hover:border-teal hover:text-navy disabled:opacity-50"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((m, i) => (
                  <MessageBubble key={i} message={m} onAsk={send} />
                ))}
                {thinking && (
                  <div className="flex items-center gap-1.5 px-1 text-xs text-navy/40">
                    <span className="flex gap-1">
                      <Dot delay="0ms" />
                      <Dot delay="150ms" />
                      <Dot delay="300ms" />
                    </span>
                    ARLO is checking the data&hellip;
                  </div>
                )}
              </div>
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="mt-4 flex items-center gap-2 rounded-full border border-steel/40 bg-white p-1.5 pl-5"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={loading ? "Loading demo data..." : "Ask about backlog, fees, hours, margins..."}
              disabled={loading}
              className="flex-1 bg-transparent text-sm text-navy placeholder:text-navy/40 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white transition-colors hover:bg-navy/90 disabled:opacity-40"
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-navy/40">
            Ask ARLO answers from this fictional demo dataset using deterministic rules&mdash;not a
            live AI model. Unsupported questions will say so.
          </p>
        </div>
      </Container>
    </main>
  );
}

function MessageBubble({ message, onAsk }: { message: ChatMessage; onAsk: (q: string) => void }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-navy px-4 py-2.5 text-sm text-white">
          {message.text}
        </div>
      </div>
    );
  }

  const r = message.response;
  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] rounded-2xl rounded-bl-sm border border-steel/30 bg-mist px-4 py-3 text-sm text-navy">
        <p>{message.text}</p>

        {r && r.details.length > 0 && (
          <ul className="mt-3 space-y-1 border-t border-steel/30 pt-3 text-xs text-navy/70">
            {r.details.map((d, i) => (
              <li key={i}>&bull; {d}</li>
            ))}
          </ul>
        )}

        {r && r.records.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-steel/30 pt-3">
            {r.records.map((rec) => (
              <Link
                key={rec.jobId}
                href={`/demo/jobs/${rec.jobId}`}
                className="rounded-full border border-teal/40 bg-white px-2.5 py-1 text-[11px] font-semibold text-teal hover:bg-teal/10"
              >
                {rec.jobNumber}
              </Link>
            ))}
          </div>
        )}

        {r && r.assumptions.length > 0 && (
          <p className="mt-3 border-t border-steel/30 pt-3 text-[11px] text-navy/40">
            {r.assumptions.join(" ")}
          </p>
        )}

        {r && r.matched && r.followUps.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {r.followUps.map((f) => (
              <button
                key={f}
                onClick={() => onAsk(f)}
                className="rounded-full border border-steel/40 bg-white px-2.5 py-1 text-[11px] text-navy/60 transition-colors hover:border-teal hover:text-navy"
              >
                {f}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Dot({ delay }: { delay: string }) {
  return (
    <span
      className="h-1.5 w-1.5 animate-bounce rounded-full bg-teal"
      style={{ animationDelay: delay }}
    />
  );
}
