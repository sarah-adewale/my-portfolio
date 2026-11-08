import Link from "next/link";
import { Suspense } from "react";
import { ContactForm } from "@/components/contact-form";
import { getProjects } from "@/lib/api";

async function Projects() {
  let projects;
  try {
    projects = await getProjects();
  } catch {
    return <p>Couldn’t load projects right now.</p>;
  }

  return (
    <ul className="grid gap-6 sm:grid-cols-2">
      {projects.map((project) => (
        <li key={project.slug}>
          <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex flex-col gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element -- animated GIFs from the v1 site */}
            <img src={project.image} alt="" className="rounded" />
            <h3 className="font-semibold">{project.title}</h3>
          </a>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{project.summary}</p>
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-16 px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="font-semibold">Sarah Adewale</span>
        <nav className="flex gap-4 text-sm">
          <Link href="/tools/jwt">JWT Decoder</Link>
          {/* Plain <a>: v1 is static HTML outside the Next.js router */}
          <a href="/v1">See my old portfolio →</a>
        </nav>
      </header>

      <section>
        <h1 className="text-4xl font-semibold">Hi, I’m Sarah. Creative Software Engineer</h1>
      </section>

      <section>
        <h2 className="mb-6 text-2xl font-semibold">Projects</h2>
        <Suspense fallback={<p>Loading projects…</p>}>
          <Projects />
        </Suspense>
      </section>

      <section id="contact" className="max-w-xl">
        <h2 className="mb-6 text-2xl font-semibold">Get in touch</h2>
        <ContactForm />
      </section>
    </main>
  );
}
