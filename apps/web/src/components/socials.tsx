import { socials } from "@/content/profile";
import { GitHubIcon } from "./icons";

export function Socials({ className = "" }: { className?: string }) {
  return (
    <ul className={`socials ${className}`}>
      <li>
        <a className="social" href={socials.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
          in
        </a>
      </li>
      <li>
        <a className="social" href={socials.devto} target="_blank" rel="noopener noreferrer" aria-label="dev.to">
          dev
        </a>
      </li>
      <li>
        <a className="social" href={socials.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
          <GitHubIcon />
        </a>
      </li>
    </ul>
  );
}
