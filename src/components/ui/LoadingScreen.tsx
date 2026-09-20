import { useEffect, useState } from "react";
import { portfolio } from "@/data/portfolio";

interface Props {
  onEnter: () => void;
}

export function LoadingScreen({ onEnter }: Props) {
  const [progress, setProgress] = useState(6);

  useEffect(() => {
    // Time-based so a busy first frame can never stall the progress bar.
    const start = performance.now();
    const duration = 2200;
    const id = window.setInterval(() => {
      const pct = Math.min(100, 6 + ((performance.now() - start) / duration) * 94);
      setProgress(pct);
      if (pct >= 100) window.clearInterval(id);
    }, 80);
    return () => window.clearInterval(id);
  }, []);

  const ready = progress >= 100;

  return (
    <div className="loading">
      <div className="loading__inner">
        <p className="loading__eyebrow">Interactive Portfolio</p>
        <h1 className="loading__name">{portfolio.personal.name}</h1>
        <p className="loading__title">{portfolio.personal.title}</p>

        <div className="loading__bar" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <p className="loading__status" role="status">
          {ready ? "World ready" : `Loading world… ${Math.floor(progress)}%`}
        </p>

        <dl className="loading__keys">
          <div>
            <dt>WASD / Arrows</dt>
            <dd>Drive</dd>
          </div>
          <div>
            <dt>E</dt>
            <dd>Interact</dd>
          </div>
          <div>
            <dt>Space</dt>
            <dd>Brake</dd>
          </div>
          <div>
            <dt>Esc</dt>
            <dd>Close</dd>
          </div>
        </dl>

        <button
          type="button"
          className="btn btn--primary loading__enter"
          onClick={onEnter}
          disabled={!ready}
        >
          {ready ? "Enter the world" : "Preparing…"}
        </button>
        <p className="loading__note">
          Prefer to read? Open the menu once inside for direct access to every
          section.
        </p>
      </div>
    </div>
  );
}
