import { Suspense } from "react";
import { CareerWindow } from "@/components/career-window";
import { ContactDialog } from "@/components/contact";
import { DeferredArticles, DeferredProjects, DeferredTools, LoadingTile } from "@/components/deferred";
import { ArticlesWindow } from "@/components/articles-window";
import { Flashlight } from "@/components/flashlight";
import { Footer } from "@/components/footer";
import { Intro } from "@/components/intro";
import { JwtWindow } from "@/components/jwt-window";
import { ProjectWindow, ToolsWindow } from "@/components/showcase";
import { StackWindow } from "@/components/stack-window";
import { getArticles, getProjects } from "@/lib/api";

// Each section renders on the server when the API answers in time; otherwise the browser
// picks it up (components/deferred.tsx), so the page never needs a reload.

async function Projects() {
  const projects = await getProjects().catch(() => null);
  if (!projects) return <DeferredProjects />;
  return projects
    .filter((p) => p.kind === "project" && p.featured)
    .map((project) => <ProjectWindow key={project.slug} project={project} />);
}

async function Tools() {
  const projects = await getProjects().catch(() => null);
  const tools = projects?.filter((p) => p.kind === "tool" && p.featured);
  if (!tools?.length) return <DeferredTools />;
  return <ToolsWindow tools={tools} />;
}

async function Articles() {
  const articles = await getArticles().catch(() => null);
  if (!articles?.length) return <DeferredArticles />;
  return <ArticlesWindow articles={articles} />;
}

export default function Home() {
  return (
    <div className="shell">
      <Flashlight />
      <div className="stage">
        <div className="scenery" aria-hidden />
        <main className="page">
          <div className="page__col">
            <Intro />
            <CareerWindow />
            <StackWindow />
          </div>
          <div className="page__col">
            <div className="page__projects order-projects">
              <Suspense fallback={[0, 1, 2].map((i) => <LoadingTile key={i} tall />)}>
                <Projects />
              </Suspense>
            </div>
          </div>
          <div className="page__col">
            <JwtWindow className="order-jwt" />
            <Suspense fallback={<LoadingTile tall className="order-tools" />}>
              <Tools />
            </Suspense>
            <Suspense fallback={<LoadingTile tall className="order-articles" />}>
              <Articles />
            </Suspense>
          </div>
        </main>
      </div>
      <Footer />
      <ContactDialog />
    </div>
  );
}
