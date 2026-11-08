"use client";

import { useEffect, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

type Theme = "dark" | "light";

// The inline script in layout.tsx applies the theme before first paint. This reads it
// from <html data-theme> and changes it.
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getTheme = () => document.documentElement.dataset.theme as Theme;

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function readStored() {
  try {
    return localStorage.getItem("theme");
  } catch {
    return null;
  }
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => null);

  // Follow the system setting until the visitor picks one
  useEffect(() => {
    const media = matchMedia("(prefers-color-scheme: dark)");
    function onChange(event: MediaQueryListEvent) {
      if (!readStored()) applyTheme(event.matches ? "dark" : "light");
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  function choose(next: Theme) {
    applyTheme(next);
    try {
      localStorage.setItem("theme", next);
    } catch {}
  }

  return (
    <div className="prefs" role="group" aria-label="Theme">
      <button type="button" className="prefs__opt prefs__opt--dark" aria-pressed={theme === "dark"} onClick={() => choose("dark")}>
        <MoonIcon /> dark
      </button>
      <button type="button" className="prefs__opt prefs__opt--light" aria-pressed={theme === "light"} onClick={() => choose("light")}>
        <SunIcon /> light
      </button>
    </div>
  );
}
