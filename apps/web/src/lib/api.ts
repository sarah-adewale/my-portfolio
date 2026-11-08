import { cache } from "react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Mirrors the API's Project type in apps/api/src/projects/project.ts
export interface Project {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  kind: "project" | "tool";
  featured?: boolean;
  url?: string;
  repoUrl?: string;
  comingSoon?: boolean;
  logo?: string;
  preview?: string;
}

// Mirrors apps/api/src/articles/article.ts
export interface Article {
  title: string;
  url: string;
  coverImage: string | null;
  readingMinutes: number;
  publishedAt: string;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retries connection failures and 5xx until `budgetMs` runs out, e.g. while the API is
 * still compiling next to `next dev`, or cold-starting in production. Other errors throw.
 */
async function get<T>(path: string, budgetMs = 8000): Promise<T> {
  // performance.now(), not Date.now(): Cache Components rejects the clock during prerender
  const deadline = performance.now() + budgetMs;
  for (let delay = 250; ; delay = Math.min(delay * 1.6, 2000)) {
    try {
      // A fresh signal per attempt also opts out of fetch memoization, which would
      // otherwise hand every retry in the same render the first attempt's failure
      const res = await fetch(`${API_URL}${path}`, { signal: AbortSignal.timeout(5000) });
      if (res.ok) return res.json();
      if (res.status < 500 || performance.now() + delay > deadline) throw new Error(`GET ${path} failed with ${res.status}`);
    } catch (error) {
      const retryable = error instanceof TypeError || (error as Error).name === "TimeoutError";
      if (!retryable || performance.now() + delay > deadline) throw error;
    }
    await sleep(delay);
  }
}

// cache() dedupes the call between the projects column and the tools window
export const getProjects = cache((budgetMs?: number) => get<Project[]>("/projects", budgetMs));

export const getArticles = (budgetMs?: number) => get<Article[]>("/articles", budgetMs);

export interface ContactMessage {
  name: string;
  email: string;
  message: string;
  website?: string;
}

export async function sendContactMessage(body: ContactMessage): Promise<void> {
  const res = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(res.status === 429 ? "Too many messages, try again in a minute." : "Something went wrong.");
}
