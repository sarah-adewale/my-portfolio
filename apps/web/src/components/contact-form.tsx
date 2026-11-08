"use client";

import { useState } from "react";
import { sendContactMessage } from "@/lib/api";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ state: "idle" });

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form)) as Record<string, string>;
    setStatus({ state: "sending" });
    try {
      await sendContactMessage({ name: data.name, email: data.email, message: data.message, website: data.website });
      form.reset();
      setStatus({ state: "sent" });
    } catch (error) {
      setStatus({ state: "error", message: (error as Error).message });
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <input name="name" required maxLength={100} placeholder="Name" className="rounded border px-3 py-2" />
      <input name="email" type="email" required placeholder="Email" className="rounded border px-3 py-2" />
      <textarea name="message" required minLength={10} maxLength={5000} rows={5} placeholder="Message" className="rounded border px-3 py-2" />
      {/* Honeypot: hidden from people, filled in by bots */}
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <button disabled={status.state === "sending"} className="rounded bg-foreground px-4 py-2 text-background disabled:opacity-50">
        {status.state === "sending" ? "Sending…" : "Send"}
      </button>
      {status.state === "sent" && <p>Thanks! I’ll get back to you soon.</p>}
      {status.state === "error" && <p className="text-red-600">{status.message}</p>}
    </form>
  );
}
