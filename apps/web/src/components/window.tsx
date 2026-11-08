"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface WindowProps {
  title: string;
  /** Right side of the title bar, e.g. a pager */
  pager?: React.ReactNode;
  /** Hover=Off face of a showcase window (projects, tools) */
  cover?: React.ReactNode;
  /** Fade the body's lines in the first time the window scrolls into view */
  print?: boolean;
  className?: string;
  children: React.ReactNode;
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

export function Window({ title, pager, cover, print = true, className = "", children }: WindowProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [full, setFull] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const greenRef = useRef<HTMLButtonElement>(null);

  const closeFull = useCallback(() => {
    setFull(false);
    greenRef.current?.focus();
  }, []);

  function toggleFull() {
    if (full) return closeFull();
    setPlaceholderHeight(frameRef.current?.offsetHeight ?? 0);
    setCollapsed(false);
    setFull(true);
  }

  // Full view: focus moves in, Esc closes, Tab stays inside, the page behind doesn't scroll
  useEffect(() => {
    if (!full) return;
    const frame = frameRef.current!;
    frame.focus();
    document.body.style.overflow = "hidden";

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") return closeFull();
      if (event.key !== "Tab") return;
      const focusable = [...frame.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (focusable.length === 0) return event.preventDefault();
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [full, closeFull]);

  // Number the body's lines, for the print and hover-reveal staggers
  useEffect(() => {
    const body = bodyRef.current;
    if (!body) return;
    [...body.children].forEach((child, i) => (child as HTMLElement).style.setProperty("--i", String(i)));
  }, [collapsed, children]);

  // Terminal print, once per load
  useEffect(() => {
    const body = bodyRef.current;
    if (!print || !body || body.dataset.print !== "pending") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        body.dataset.print = "run";
        observer.disconnect();
      },
      { threshold: 0.2 },
    );
    observer.observe(body);
    return () => observer.disconnect();
  }, [print, collapsed]);

  return (
    <section
      className={`window ${cover ? "window--showcase" : ""} ${className}`}
      aria-label={title}
      data-collapsed={collapsed || undefined}
      data-full={full || undefined}
      // Collapsed or full showcase windows stay in their Hover=On state
      data-on={cover && (collapsed || full) ? true : undefined}
    >
      {full && <div style={{ height: placeholderHeight }} aria-hidden />}
      <div
        ref={frameRef}
        className="window__frame"
        tabIndex={full ? -1 : undefined}
        role={full ? "dialog" : undefined}
        aria-modal={full || undefined}
        aria-label={full ? title : undefined}
      >
        {cover && !collapsed && (
          <div className="showcase__cover" aria-hidden>
            {cover}
          </div>
        )}
        <div className={cover ? "showcase__face" : undefined}>
          <header className="window__bar">
            <div className="window__dots">
              <button
                type="button"
                className="window__dot window__dot--yellow"
                aria-label={collapsed ? `Expand ${title}` : `Collapse ${title}`}
                aria-expanded={!collapsed}
                onClick={() => setCollapsed((c) => !c)}
                disabled={full}
              />
              <button
                ref={greenRef}
                type="button"
                className="window__dot window__dot--green"
                aria-label={full ? `Close full view of ${title}` : `Open ${title} in full view`}
                onClick={toggleFull}
              />
            </div>
            <h2 className="term__title">{title}</h2>
            {pager}
          </header>
          {!collapsed && (
            <div ref={bodyRef} className="window__body term__body" data-print={print ? "pending" : undefined}>
              {children}
            </div>
          )}
        </div>
      </div>
      {full && <div className="window__backdrop" onClick={closeFull} aria-hidden />}
    </section>
  );
}

interface PagerProps {
  index: number;
  count: number;
  label: string;
  onChange: (index: number) => void;
}

export function Pager({ index, count, label, onChange }: PagerProps) {
  return (
    <div className="window__pager">
      <button type="button" aria-label={`Previous ${label}`} disabled={index === 0} onClick={() => onChange(index - 1)}>
        ‹
      </button>
      <span aria-live="polite">
        {index + 1}/{count}
      </span>
      <button
        type="button"
        aria-label={`Next ${label}`}
        disabled={index >= count - 1}
        onClick={() => onChange(index + 1)}
      >
        ›
      </button>
    </div>
  );
}
