import { useEffect, useRef } from "react";
import { sectionLabels, type SectionId } from "@/data/portfolio";
import { SectionContent } from "./SectionContent";

interface Props {
  id: SectionId;
  onClose: () => void;
}

export function PortfolioPanel({ id, onClose }: Props) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, [id]);

  return (
    <div className="panel-backdrop" role="presentation" onClick={onClose}>
      <section
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label={sectionLabels[id]}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="panel__head">
          <div>
            <p className="panel__eyebrow">Portfolio</p>
            <h2 className="panel__title">{sectionLabels[id]}</h2>
          </div>
          <button ref={closeRef} type="button" className="btn btn--ghost" onClick={onClose}>
            Close (Esc)
          </button>
        </header>
        <div className="panel__body">
          <SectionContent id={id} />
        </div>
      </section>
    </div>
  );
}
