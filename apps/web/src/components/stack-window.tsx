import { readFileSync } from "node:fs";
import { join } from "node:path";
import { stack } from "@/content/profile";
import { GitHubIcon } from "./icons";
import { Window } from "./window";

const ICON_DIR = join(process.cwd(), "public", "icons", "stack");

// Inlined so white parts can follow the theme (white → currentColor). IDs are prefixed
// because several Figma exports reuse the same clip-path and gradient IDs.
function readIcon(name: string): string | null {
  try {
    const prefix = name.replace(/\W/g, "");
    return readFileSync(join(ICON_DIR, `${name}.svg`), "utf8")
      .replace(/(fill|stroke)="white"/gi, '$1="currentColor"')
      .replace(/id="([^"]+)"/g, `id="${prefix}-$1"`)
      .replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`)
      .replace(/href="#([^"]+)"/g, `href="#${prefix}-$1"`);
  } catch {
    return null;
  }
}

function StackIcon({ name }: { name?: string }) {
  if (name === "GitHub") {
    return (
      <span className="stack__icon">
        <GitHubIcon />
      </span>
    );
  }
  const svg = name ? readIcon(name) : null;
  if (!svg) return null;
  return <span className="stack__icon" aria-hidden dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function StackWindow() {
  return (
    <Window title="Tech stack" className="order-stack">
      <p>
        <span className="term__prompt">$</span> stack --list
      </p>
      {stack.map((group) => (
        <div key={group.dir}>
          <p className="stack__dir">{group.dir}/</p>
          <ul className="stack__items">
            {group.items.map((item) => (
              <li key={item.name} className="stack__item">
                <StackIcon name={item.icon} />
                {item.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Window>
  );
}
