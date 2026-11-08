import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sarah Adewale · Full-stack engineer & SDET",
  description:
    "I build and test software end to end: APIs, databases and deployment pipelines, React and Next.js interfaces, and the automated tests that keep both honest.",
};

// Runs before first paint: theme (saved choice, else system), and whether to type the intro
// (first visit per session, never under reduced motion).
const BOOT_SCRIPT = `(function(){var d=document.documentElement;d.setAttribute("data-js","");try{var t=localStorage.getItem("theme");if(t!=="dark"&&t!=="light")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";d.setAttribute("data-theme",t);if(!sessionStorage.getItem("intro-typed")&&!matchMedia("(prefers-reduced-motion: reduce)").matches)d.setAttribute("data-type-intro","")}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-theme="dark" className={`${geist.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT_SCRIPT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
