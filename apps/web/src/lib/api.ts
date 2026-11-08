export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Mirrors the API's Project type in apps/api/src/projects/project.ts
export interface Project {
  slug: string;
  title: string;
  summary: string;
  stack: string[];
  url: string;
  repoUrl?: string;
  image: string;
}

export async function getProjects(): Promise<Project[]> {
  const res = await fetch(`${API_URL}/projects`);
  if (!res.ok) throw new Error(`GET /projects failed with ${res.status}`);
  return res.json();
}

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
