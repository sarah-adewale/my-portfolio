"use client";

import { useEffect, useState } from "react";
import { intro } from "@/content/profile";
import { ContactActions } from "./contact";
import { Socials } from "./socials";
import { ThemeToggle } from "./theme-toggle";

// ms per character, then a pause between blocks
const BLOCKS = [
  { text: intro.name, speed: 55 },
  { text: intro.role, speed: 16 },
  ...intro.bio.map((text) => ({ text, speed: 7 })),
];
const PAUSE = 160;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function Intro() {
  // null shows everything; otherwise how far the typing has got
  const [progress, setProgress] = useState<{ block: number; chars: number } | null>(null);

  useEffect(() => {
    const html = document.documentElement;
    // Set by the inline script on the first visit per session (and never under reduced motion)
    if (!("typeIntro" in html.dataset)) return;
    let cancelled = false;

    (async () => {
      for (let block = 0; block < BLOCKS.length; block++) {
        const { text, speed } = BLOCKS[block];
        for (let chars = 0; chars <= text.length; chars++) {
          if (cancelled) return;
          setProgress({ block, chars });
          await sleep(speed);
        }
        await sleep(PAUSE);
      }
      try {
        sessionStorage.setItem("intro-typed", "1");
      } catch {}
      delete html.dataset.typeIntro;
      setProgress(null);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  function typed(block: number) {
    const { text } = BLOCKS[block];
    if (!progress || block < progress.block) return text;
    if (block > progress.block) return <span className="intro__rest">{text}</span>;
    return (
      <>
        {text.slice(0, progress.chars)}
        <span className="intro__caret" aria-hidden />
        <span className="intro__rest">{text.slice(progress.chars)}</span>
      </>
    );
  }

  return (
    <section className="intro order-intro" aria-label="About Sarah">
      <ThemeToggle />
      {/* eslint-disable-next-line @next/next/no-img-element -- a 6 KB avatar */}
      <img className="intro__avatar" src="/images/me.webp" alt="Sarah Adewale" width={64} height={64} />

      {/* Screen readers get the full text at once */}
      {progress && (
        <div className="sr-only">
          {BLOCKS.map((b) => (
            <p key={b.text}>{b.text}</p>
          ))}
        </div>
      )}
      <div className="intro__type" data-started={progress ? true : undefined} aria-hidden={progress ? true : undefined}>
        <h1 className="intro__name">{typed(0)}</h1>
        <p className="intro__role">{typed(1)}</p>
        {intro.bio.map((_, i) => (
          <p key={i} className="intro__bio">
            {typed(i + 2)}
          </p>
        ))}
      </div>

      <Socials className="intro__socials" />
      <ContactActions className="intro__actions" />
    </section>
  );
}
