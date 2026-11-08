import { KENE_URL } from "@/content/profile";
import { ContactActions } from "./contact";
import { Socials } from "./socials";
import { TimeMachine } from "./time-machine";

export function Footer() {
  return (
    <>
      <footer className="footer">
        <p className="footer__credit">
          © 2026 Sarah Temitope Adewale · Built by me and{" "}
          <a href={KENE_URL} target="_blank" rel="noopener noreferrer">
            Kene
          </a>
        </p>
        <Socials />
        <ContactActions />
      </footer>
      <section className="garage" aria-label="Time machine">
        {/* Plain <a>: v1 is static HTML outside the Next.js router */}
        <a
          className="garage__link"
          href="/v1"
          target="_blank"
          rel="noopener"
          aria-label="Travel back to my old portfolio (opens in a new tab)"
          title="Travel back to my old portfolio"
        >
          <TimeMachine />
        </a>
      </section>
    </>
  );
}
