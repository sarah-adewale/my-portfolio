"use client";

import { useEffect, useRef } from "react";

const RADIUS = 120;
const MIN_SPEED = 10; // px/s
const MAX_SPEED = 36;
// Every 9th column spells this in 8-bit ASCII, top to bottom
const PHRASE = "YOU FOUND IT. NOW SAY HI TO SARAH. ";

const phraseBits = [...PHRASE].flatMap((char) =>
  char.charCodeAt(0).toString(2).padStart(8, "0").split("").map(Number),
);

interface Column {
  speed: number;
  offset: number;
  bits: number[];
}

// Handles #rgb too: the CSS minifier shortens colours like #ffffff to #fff
function hexToRgba(hex: string, alpha: number) {
  let digits = hex.replace("#", "");
  if (digits.length === 3) digits = [...digits].map((d) => d + d).join("");
  const n = parseInt(digits, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

function makeColumns(count: number): Column[] {
  return Array.from({ length: count }, (_, i) => ({
    speed: MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED),
    offset: Math.random() * 1000,
    bits: i % 9 === 4 ? phraseBits : Array.from({ length: 48 }, () => (Math.random() < 0.5 ? 0 : 1)),
  }));
}

export function Flashlight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = matchMedia("(pointer: coarse)").matches;

    let width = 0;
    let height = 0;
    let columns: Column[] = [];
    let digitColour = "";
    let glowColour = "";
    let font = "";
    let glowAlpha = 0.3;
    let peakOpacity = 0.75;
    let colWidth = 22;
    let rowHeight = 24;

    function readTheme() {
      const styles = getComputedStyle(document.documentElement);
      digitColour = styles.getPropertyValue("--flashlight-digit").trim();
      glowColour = styles.getPropertyValue("--flashlight-glow-color").trim();
      glowAlpha = Number(styles.getPropertyValue("--flashlight-glow")) || 0.3;
      peakOpacity = Number(styles.getPropertyValue("--flashlight-peak")) || 0.75;
      colWidth = Number(styles.getPropertyValue("--flashlight-col")) || 22;
      rowHeight = Number(styles.getPropertyValue("--flashlight-row")) || 24;
      ensureColumns();
      font = `13px ${styles.getPropertyValue("--font-mono")}`;
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ensureColumns();
    }

    // A denser grid (light mode) needs more columns
    function ensureColumns() {
      const needed = Math.ceil(width / colWidth) + 1;
      if (columns.length < needed) columns = columns.concat(makeColumns(needed - columns.length));
    }


    function onPointerMove(event: PointerEvent) {
      if (event.pointerType === "touch") return;
      pointerSeen = true;
      target.x = event.clientX;
      target.y = event.clientY;
    }

    readTheme();
    resize();

    // The light rests by the intro's buttons until the pointer moves
    const anchor = document.querySelector(".intro__actions")?.getBoundingClientRect();
    const light = { x: anchor ? anchor.right + 40 : width * 0.25, y: anchor ? anchor.top + 10 : 420 };
    const target = { ...light };
    let pointerSeen = false;
    const themeObserver = new MutationObserver(readTheme);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onPointerMove);

    let frame = 0;
    let last = performance.now();
    const start = last;

    function draw(now: number) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      const t = (now - start) / 1000;

      // On touch the light drifts on its own
      if (coarse && !pointerSeen) {
        target.x = width * (0.5 + 0.35 * Math.sin(t * 0.21));
        target.y = height * (0.5 + 0.3 * Math.sin(t * 0.13 + 1));
      }
      if (reducedMotion) {
        light.x = target.x;
        light.y = target.y;
      } else {
        const ease = 1 - Math.exp(-dt * 6);
        light.x += (target.x - light.x) * ease;
        light.y += (target.y - light.y) * ease;
      }

      ctx.clearRect(0, 0, width, height);

      const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, RADIUS);
      gradient.addColorStop(0, hexToRgba(glowColour, glowAlpha));
      gradient.addColorStop(1, hexToRgba(glowColour, 0));
      ctx.fillStyle = gradient;
      ctx.fillRect(light.x - RADIUS, light.y - RADIUS, RADIUS * 2, RADIUS * 2);

      ctx.font = font;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = digitColour;

      // Only glyphs inside the light are drawn
      const firstCol = Math.max(0, Math.floor((light.x - RADIUS) / colWidth));
      const lastCol = Math.min(columns.length - 1, Math.ceil((light.x + RADIUS) / colWidth));
      for (let c = firstCol; c <= lastCol; c++) {
        const column = columns[c];
        const fall = column.offset + (reducedMotion ? 0 : column.speed * t);
        const shift = fall % rowHeight;
        const startRow = Math.floor(fall / rowHeight);
        const x = c * colWidth + colWidth / 2;
        const firstRow = Math.floor((light.y - RADIUS - shift) / rowHeight);
        const lastRow = Math.ceil((light.y + RADIUS - shift) / rowHeight);

        for (let r = firstRow; r <= lastRow; r++) {
          const y = r * rowHeight + shift;
          const distance = Math.hypot(x - light.x, y - light.y);
          if (distance >= RADIUS) continue;
          // Steep falloff from the centre
          ctx.globalAlpha = peakOpacity * (1 - distance / RADIUS) ** 2;
          const bits = column.bits;
          const bit = bits[(((r - startRow) % bits.length) + bits.length) % bits.length];
          ctx.fillText(String(bit), x, y);
        }
      }
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    }

    frame = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(frame);
      themeObserver.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onPointerMove);
    };
  }, []);

  return <canvas ref={canvasRef} className="flashlight" aria-hidden />;
}
