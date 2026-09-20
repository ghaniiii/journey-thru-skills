import { portfolio, type SectionId } from "@/data/portfolio";

function TechList({ items }: { items: string[] }) {
  return (
    <ul className="chips">
      {items.map((t) => (
        <li key={t} className="chip">
          {t}
        </li>
      ))}
    </ul>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="bullets">
      {items.map((p) => (
        <li key={p}>{p}</li>
      ))}
    </ul>
  );
}

export function Education() {
  return (
    <div className="stack">
      {portfolio.education.map((e) => (
        <article key={e.institution} className="card">
          <header className="card__head">
            <h3>{e.credential}</h3>
            <span className="card__meta">{e.period}</span>
          </header>
          <p className="card__sub">{e.institution}</p>
          {e.detail && <p className="card__badge">{e.detail}</p>}
        </article>
      ))}
    </div>
  );
}

export function Experience() {
  return (
    <div className="stack">
      {portfolio.experience.map((x) => (
        <article key={`${x.role}-${x.period}-${x.organization}`} className="card">
          <header className="card__head">
            <h3>{x.role}</h3>
            <span className="card__meta">{x.period}</span>
          </header>
          <p className="card__sub">{x.organization}</p>
          <Bullets items={x.points} />
        </article>
      ))}
    </div>
  );
}

export function Projects() {
  return (
    <div className="stack">
      {portfolio.projects.map((p) => (
        <article key={p.name} className="card">
          <header className="card__head">
            <h3>{p.name}</h3>
          </header>
          <p className="card__sub">{p.summary}</p>
          <Bullets items={p.highlights} />
          <TechList items={p.technologies} />
        </article>
      ))}
    </div>
  );
}

export function FinalYearProject() {
  const fyp = portfolio.finalYearProject;
  return (
    <div className="stack">
      <article className="card card--feature">
        <header className="card__head">
          <h3>{fyp.name}</h3>
          <span className="card__meta">Final Year Project</span>
        </header>
        <p className="card__sub">{fyp.summary}</p>
        <Bullets items={fyp.highlights} />
        <TechList items={fyp.technologies} />
      </article>
    </div>
  );
}

export function Research() {
  return (
    <div className="stack">
      {portfolio.research.map((r) => (
        <article key={r.title} className="card">
          <header className="card__head">
            <h3>{r.title}</h3>
            <span className="card__meta">{r.period}</span>
          </header>
          <p className="card__sub">{r.lab}</p>
          <p className="card__badge">Supervised by {r.supervisor}</p>
          <Bullets items={r.points} />
        </article>
      ))}
    </div>
  );
}

export function Skills() {
  return (
    <div className="stack">
      {Object.entries(portfolio.skills).map(([group, items]) => (
        <article key={group} className="card">
          <header className="card__head">
            <h3>{group}</h3>
          </header>
          <TechList items={items} />
        </article>
      ))}
    </div>
  );
}

export function Achievements() {
  return (
    <div className="stack">
      <article className="card card--feature">
        <header className="card__head">
          <h3>Awards</h3>
        </header>
        <ul className="bullets">
          {portfolio.achievements.map((a) => (
            <li key={a.title}>
              <strong>{a.title}</strong> — {a.detail}
            </li>
          ))}
        </ul>
      </article>
      <article className="card">
        <header className="card__head">
          <h3>Leadership & Activities</h3>
        </header>
        <div className="stack stack--tight">
          {portfolio.leadership.map((l) => (
            <div key={`${l.role}-${l.organization}`}>
              <p className="card__row">
                <strong>{l.role}</strong> · {l.organization}
                <span className="card__meta">{l.period}</span>
              </p>
              <p className="card__sub">{l.detail}</p>
            </div>
          ))}
        </div>
      </article>
    </div>
  );
}

export function Contact() {
  const p = portfolio.personal;
  return (
    <div className="stack">
      <article className="card">
        <header className="card__head">
          <h3>{p.name}</h3>
        </header>
        <p className="card__sub">
          {p.title} · {p.location}
        </p>
        <div className="link-row">
          <a className="btn btn--primary" href={`mailto:${p.email}`}>
            Email {p.email}
          </a>
          <a className="btn" href={p.linkedin} target="_blank" rel="noreferrer noopener">
            LinkedIn profile
          </a>
          <a className="btn" href={`tel:${p.phone.replace(/\s/g, "")}`}>
            Call {p.phone}
          </a>
          <a className="btn btn--accent" href={p.cv} download>
            Download CV (PDF)
          </a>
        </div>
      </article>
    </div>
  );
}

export function Home() {
  const p = portfolio.personal;
  return (
    <div className="stack">
      <article className="card card--feature">
        <header className="card__head">
          <h3>{p.name}</h3>
        </header>
        <p className="card__sub">{p.title}</p>
        <p className="card__body">{p.summary}</p>
        <div className="link-row">
          <a className="btn btn--accent" href={p.cv} download>
            Download CV (PDF)
          </a>
          <a className="btn" href={p.linkedin} target="_blank" rel="noreferrer noopener">
            LinkedIn
          </a>
        </div>
      </article>
    </div>
  );
}

export function SectionContent({ id }: { id: SectionId }) {
  switch (id) {
    case "education":
      return <Education />;
    case "experience":
      return <Experience />;
    case "projects":
      return <Projects />;
    case "fyp":
      return <FinalYearProject />;
    case "research":
      return <Research />;
    case "skills":
      return <Skills />;
    case "achievements":
      return <Achievements />;
    case "contact":
      return <Contact />;
    default:
      return <Home />;
  }
}
