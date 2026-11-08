"use client";

import { useEffect, useState } from "react";
import { getArticles, getProjects, type Article, type Project } from "@/lib/api";
import { ArticlesWindow } from "./articles-window";
import { ProjectWindow, ToolsWindow } from "./showcase";
import { Window } from "./window";

// When the server couldn't reach the API in time, the browser keeps trying for a minute
const CLIENT_BUDGET_MS = 60_000;

type State<T> = { status: "loading" } | { status: "done"; data: T } | { status: "failed" };

function useFromApi<T>(load: (budgetMs: number) => Promise<T>) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<State<T>>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    load(CLIENT_BUDGET_MS).then(
      (data) => !cancelled && setState({ status: "done", data }),
      () => !cancelled && setState({ status: "failed" }),
    );
    return () => {
      cancelled = true;
    };
  }, [load, attempt]);

  function retry() {
    setState({ status: "loading" });
    setAttempt((a) => a + 1);
  }

  return { state, retry };
}

/** A placeholder the size of the window it stands in for, so nothing jumps when data arrives. */
export function LoadingTile({ tall = false, className = "" }: { tall?: boolean; className?: string }) {
  return (
    <div className={`window ${className}`} aria-busy="true" aria-label="Loading">
      <div className={`window__frame loading-tile ${tall ? "loading-tile--tall" : ""}`} />
    </div>
  );
}

function Unavailable({ title, className, onRetry }: { title: string; className?: string; onRetry: () => void }) {
  return (
    <Window title={title} className={className} print={false}>
      <p className="term__muted">Couldn’t load this right now.</p>
      <div style={{ marginTop: 12 }}>
        <button type="button" className="term__btn" onClick={onRetry}>
          Try again
        </button>
      </div>
    </Window>
  );
}

const featured = (projects: Project[], kind: Project["kind"]) => projects.filter((p) => p.kind === kind && p.featured);

export function DeferredProjects() {
  const { state, retry } = useFromApi(getProjects);
  if (state.status === "loading") return [0, 1, 2].map((i) => <LoadingTile key={i} tall />);
  if (state.status === "failed") return <Unavailable title="Projects" onRetry={retry} />;
  return featured(state.data, "project").map((project) => <ProjectWindow key={project.slug} project={project} />);
}

export function DeferredTools() {
  const { state, retry } = useFromApi(getProjects);
  if (state.status === "loading") return <LoadingTile tall className="order-tools" />;
  const tools = state.status === "done" ? featured(state.data, "tool") : [];
  if (!tools.length) return <Unavailable title="Tools I’ve shipped" className="order-tools" onRetry={retry} />;
  return <ToolsWindow tools={tools} />;
}

export function DeferredArticles() {
  const { state, retry } = useFromApi(getArticles);
  if (state.status === "loading") return <LoadingTile tall className="order-articles" />;
  const articles: Article[] = state.status === "done" ? state.data : [];
  if (!articles.length) return <Unavailable title="Articles" className="order-articles" onRetry={retry} />;
  return <ArticlesWindow articles={articles} />;
}
