import { portfolio, sectionLabels, type SectionId } from "@/data/portfolio";
import { SectionContent } from "./SectionContent";

const sections: SectionId[] = [
  "education",
  "experience",
  "fyp",
  "projects",
  "research",
  "skills",
  "achievements",
  "contact",
];

/** Plain HTML portfolio used when WebGL is unavailable. */
export function StaticPortfolio({ reason }: { reason?: string }) {
  const p = portfolio.personal;
  return (
    <main className="static-page">
      <header className="static-hero">
        <p className="loading__eyebrow">Portfolio</p>
        <h1>{p.name}</h1>
        <p className="static-hero__title">{p.title}</p>
        <p className="card__body">{p.summary}</p>
        <div className="link-row">
          <a className="btn btn--accent" href={p.cv} download>
            Download CV (PDF)
          </a>
          <a className="btn" href={`mailto:${p.email}`}>
            {p.email}
          </a>
          <a
            className="btn"
            href={p.linkedin}
            target="_blank"
            rel="noreferrer noopener"
          >
            LinkedIn
          </a>
        </div>
        {reason && <p className="static-note">{reason}</p>}
      </header>

      {sections.map((id) => (
        <section key={id} className="static-section" aria-labelledby={`h-${id}`}>
          <h2 id={`h-${id}`}>{sectionLabels[id]}</h2>
          <SectionContent id={id} />
        </section>
      ))}
    </main>
  );
}
