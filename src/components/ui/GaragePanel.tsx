import { useEffect, useRef } from "react";
import { cars } from "@/data/cars";
import { useGameStore } from "@/store/useGameStore";

export function GaragePanel() {
  const open = useGameStore((s) => s.garageOpen);
  const carId = useGameStore((s) => s.carId);
  const setCar = useGameStore((s) => s.setCar);
  const close = useGameStore((s) => s.closeGarage);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  if (!open) return null;

  return (
    <div className="panel-backdrop" role="presentation" onClick={close}>
      <section
        className="panel"
        role="dialog"
        aria-modal="true"
        aria-label="Garage"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="panel__head">
          <div>
            <p className="panel__eyebrow">Garage</p>
            <h2 className="panel__title">Choose your car</h2>
          </div>
          <button ref={closeRef} type="button" className="btn btn--ghost" onClick={close}>
            Close (Esc)
          </button>
        </header>
        <div className="panel__body">
          <div className="garage-grid">
            {cars.map((c) => (
              <button
                key={c.id}
                type="button"
                className="garage-card"
                aria-pressed={c.id === carId}
                onClick={() => setCar(c.id)}
              >
                <span className="garage-card__name">{c.label}</span>
                <span className="garage-card__desc">{c.description}</span>
                <span className="garage-card__tag">{c.id === carId ? "Selected" : "Select"}</span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
