import { career, RESUME_URL } from "@/content/profile";
import { ArrowUpRightIcon } from "./icons";
import { Window } from "./window";

export function CareerWindow() {
  return (
    <Window title="Career" className="order-career">
      <p>
        <span className="term__prompt">$</span> career --log
      </p>
      {career.map((entry) => (
        <div key={`${entry.company}-${entry.role}`} className="career__entry">
          <p className="career__date">{entry.dates}</p>
          <p>
            <span className="term__job-title">{entry.role}</span> <span className="career__company">@ {entry.company}</span>
          </p>
          <p className="career__desc">{entry.summary}</p>
        </div>
      ))}
      <div className="career__resume">
        <a className="term__btn" href={RESUME_URL} target="_blank" rel="noopener noreferrer">
          View resume <ArrowUpRightIcon />
        </a>
      </div>
    </Window>
  );
}
