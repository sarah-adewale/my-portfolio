"use client";

import { useEffect, useRef, useState } from "react";
import { sendContactMessage } from "@/lib/api";
import { CALENDLY_URL } from "@/content/profile";

const OPEN_EVENT = "open-contact";

type Status = { state: "idle" | "sending" | "sent" } | { state: "error"; message: string };

/** "Send a message" + "Book a call", used in the intro and the footer. */
export function ContactActions({ className = "" }: { className?: string }) {
  return (
    <div className={`actions ${className}`}>
      <button type="button" className="btn btn--primary" onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}>
        Send a message
      </button>
      <a className="btn btn--secondary" href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
        Book a call
      </a>
    </div>
  );
}

// One dialog for the whole page. The native <dialog> handles Esc, focus trapping and focus return.
export function ContactDialog() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [status, setStatus] = useState<Status>({ state: "idle" });

  useEffect(() => {
    function open() {
      setStatus({ state: "idle" });
      dialogRef.current?.showModal();
    }
    window.addEventListener(OPEN_EVENT, open);
    return () => window.removeEventListener(OPEN_EVENT, open);
  }, []);

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
    <dialog
      ref={dialogRef}
      className="contact"
      aria-labelledby="contact-title"
      // A click on the backdrop lands on the dialog element itself
      onClick={(event) => event.target === event.currentTarget && event.currentTarget.close()}
    >
      <header className="window__bar">
        <div className="window__dots">
          <button type="button" className="window__dot window__dot--yellow" aria-label="Close" onClick={() => dialogRef.current?.close()} />
          <button type="button" className="window__dot window__dot--green" aria-label="Full view (unavailable)" disabled />
        </div>
        <h2 id="contact-title" className="term__title">
          Send a message
        </h2>
      </header>
      <div className="term__body">
        <p>
          <span className="term__prompt">$</span> mail sarah --compose
        </p>
        {status.state === "sent" ? (
          <p className="jwt__status jwt__status--ok">✓ Sent. I’ll get back to you soon.</p>
        ) : (
          <form onSubmit={onSubmit} className="contact__form" style={{ marginTop: 12 }}>
            <label className="contact__field">
              name
              <input name="name" required maxLength={100} autoComplete="name" />
            </label>
            <label className="contact__field">
              email
              <input name="email" type="email" required autoComplete="email" />
            </label>
            <label className="contact__field">
              message
              <textarea name="message" required minLength={10} maxLength={5000} rows={5} />
            </label>
            {/* Honeypot: hidden from people, filled in by bots */}
            <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="contact__honeypot" />
            <div>
              <button className="term__btn" disabled={status.state === "sending"}>
                {status.state === "sending" ? "Sending…" : "Send ↵"}
              </button>
            </div>
            {status.state === "error" && <p className="jwt__status jwt__status--error">✗ {status.message}</p>}
          </form>
        )}
      </div>
    </dialog>
  );
}
