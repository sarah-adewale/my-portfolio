"use client";

import { useState } from "react";
import type { Project } from "@/lib/api";
import { ArrowUpRightIcon } from "./icons";
import { Pager, Window } from "./window";

// Two letters: "Text FX Plugin" → TF, "CineVerse" → CV, "Venddir" → V
function monogram(title: string) {
  const words = title.split(/\s+/).filter((w) => /^[A-Za-z]/.test(w));
  if (words.length === 1) return (words[0].match(/[A-Z]/g) ?? [words[0][0]]).join("").slice(0, 2);
  return words.map((w) => w[0].toUpperCase()).join("").slice(0, 2);
}

function Logo({ project, className = "" }: { project: Project; className?: string }) {
  if (!project.logo) {
    return (
      <div className={`logo-fallback ${className}`} aria-hidden>
        {monogram(project.title)}
      </div>
    );
  }
  return <div className={`logo-mask ${className}`} style={{ "--src": `url(${project.logo})` } as React.CSSProperties} aria-hidden />;
}

function Cover({ project }: { project: Project }) {
  return (
    <>
      <Logo project={project} className="showcase__logo" />
      <p className="showcase__name">{project.title}</p>
      <p className="showcase__summary">{project.summary}</p>
    </>
  );
}

function Details({ project, command }: { project: Project; command: string }) {
  const verb = project.kind === "tool" ? "Try" : "Visit";
  return (
    <>
      <p>
        <span className="term__prompt">$</span> {command}
      </p>
      {project.preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- animated GIF previews
        <img className="showcase__media" src={project.preview} alt={`${project.title} preview`} loading="lazy" />
      ) : (
        <div className="showcase__media showcase__media--logo">
          <Logo project={project} />
        </div>
      )}
      <p className="showcase__name">{project.title}</p>
      <p className="showcase__summary">{project.summary}</p>
      <p className="showcase__stack">
        <span>Stack: </span>
        <span>{project.stack.join(", ")}</span>
      </p>
      {project.comingSoon ? (
        <span className="term__btn term__btn--soon" aria-disabled="true">
          Coming soon
        </span>
      ) : (
        project.url && (
          <a className="term__btn" href={project.url} target="_blank" rel="noopener noreferrer">
            {verb} {project.title} <ArrowUpRightIcon />
          </a>
        )
      )}
    </>
  );
}

export function ProjectWindow({ project }: { project: Project }) {
  return (
    <Window title={project.title} cover={<Cover project={project} />} print={false}>
      <Details project={project} command={`open ${project.slug}`} />
    </Window>
  );
}

export function ToolsWindow({ tools }: { tools: Project[] }) {
  const [index, setIndex] = useState(0);
  const tool = tools[index];
  return (
    <Window
      title="Tools I’ve shipped"
      className="order-tools"
      cover={<Cover project={tool} />}
      print={false}
      pager={<Pager index={index} count={tools.length} label="tool" onChange={setIndex} />}
    >
      <Details project={tool} command="tools --shipped" />
    </Window>
  );
}
