"use client";

// Public support screen, reachable from the auth footer without a session —
// deliberately, since the people most likely to need it are the ones who
// cannot get in. Contact channels and FAQ copy live in
// lib/content/support.ts.
//
// The message form is a MOCK: it validates and shows a confirmation, but
// nothing is sent. Real implementation posts to the support desk
// (Zendesk/Freshdesk intake or POST /public/support-messages), the same
// unauthenticated, rate-limited shape as /public/access-requests
// (BACKEND_SPEC §6.10) — a public form needs anti-abuse before it is wired
// to anything that emails a human.

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Mail,
  Phone,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/onboarding/form-field";
import { SUPPORT_CHANNELS, SUPPORT_FAQ } from "@/lib/content/support";
import { cn } from "@/lib/utils";

const CHANNEL_ICON = {
  email: Mail,
  phone: Phone,
  urgent: ShieldAlert,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SupportPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const set = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(form.email.trim())) {
      setError("Enter a valid email address so we can reply.");
      return;
    }
    if (form.message.trim().length < 10) {
      setError("Tell us a little more about the problem.");
      return;
    }
    setSubmitting(true);
    // Mock: nothing leaves the browser — see the note at the top.
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitting(false);
    setSent(true);
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <Link
        href="/login"
        className="flex w-fit items-center gap-2 text-body-sm text-fg-muted transition-colors hover:text-fg-secondary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to sign in
      </Link>

      <div className="mt-10">
        <h2 className="text-h1 text-fg">How can we help?</h2>
        <p className="mt-3 text-body text-fg-muted">
          Reach the Pulse Health support desk, or check the answers below —
          most sign-in problems are covered there.
        </p>
      </div>

      {/* Contact channels */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {SUPPORT_CHANNELS.map((channel) => {
          const Icon =
            CHANNEL_ICON[channel.id as keyof typeof CHANNEL_ICON] ?? Mail;
          return (
            <div
              key={channel.id}
              className="rounded-lg border border-border p-4"
            >
              <div className="flex items-center gap-2 text-fg-muted">
                <Icon className="size-4" />
                <span className="text-label text-fg-secondary">
                  {channel.label}
                </span>
              </div>
              {channel.href ? (
                <a
                  href={channel.href}
                  className="mt-2 block text-body font-medium text-brand hover:underline"
                >
                  {channel.value}
                </a>
              ) : (
                <p className="mt-2 text-body font-medium text-fg">
                  {channel.value}
                </p>
              )}
              <p className="mt-1 text-caption text-fg-muted">
                {channel.detail}
              </p>
            </div>
          );
        })}

        <div className="rounded-lg border border-dashed border-border p-4">
          <span className="text-label text-fg-secondary">Service health</span>
          <p className="mt-2 text-body-sm text-fg-muted">
            Check whether an outage is affecting your facility before getting
            in touch.
          </p>
          <Link
            href="/status"
            className="mt-2 inline-block text-body-sm text-brand hover:underline"
          >
            View system status
          </Link>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-12">
        <h3 className="text-h2 text-fg">Common questions</h3>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {SUPPORT_FAQ.map((entry, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={entry.question}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 py-4 text-left transition-colors hover:text-brand"
                >
                  <span className="text-body font-medium text-fg-secondary">
                    {entry.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-fg-muted transition-transform",
                      isOpen && "rotate-180",
                    )}
                  />
                </button>
                {isOpen && (
                  <p className="pb-4 pr-8 text-body text-fg-muted">
                    {entry.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Message form */}
      <div className="mt-12 pb-4">
        <h3 className="text-h2 text-fg">Send us a message</h3>

        {sent ? (
          <div className="mt-4 rounded-lg border border-border bg-surface-subtle p-6">
            <div className="flex size-12 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="size-6 text-success" />
            </div>
            <p className="mt-4 text-body-lg font-medium text-fg">
              Message received
            </p>
            <p className="mt-2 text-body text-fg-muted">
              We will reply to{" "}
              <span className="font-medium text-fg-secondary">
                {form.email}
              </span>{" "}
              within one business day.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setForm({ name: "", email: "", message: "" });
                setSent(false);
              }}
            >
              Send another
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField label="Your name" htmlFor="name">
                <Input
                  id="name"
                  required
                  placeholder="e.g. Dr. Sarah Jenkins"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                />
              </FormField>

              <FormField label="Email" htmlFor="email">
                <Input
                  id="email"
                  type="email"
                  required
                  placeholder="you@facility.com"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="How can we help?" htmlFor="message" error={error}>
              <Textarea
                id="message"
                required
                rows={5}
                placeholder="Tell us what happened, and the name of your facility."
                value={form.message}
                onChange={(e) => set("message", e.target.value)}
              />
            </FormField>

            <Button
              type="submit"
              disabled={!form.name || !form.email || !form.message || submitting}
              className="h-12 w-full shadow-brand sm:w-auto sm:px-8"
            >
              {submitting ? "Sending…" : "Send message"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
