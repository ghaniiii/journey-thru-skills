import { useState } from "react";
import { portfolio, sectionLabels, type SectionId } from "@/data/portfolio";
import { zones } from "@/data/zones";
import { useGameStore } from "@/store/useGameStore";
import { startEngine, stopEngine } from "@/lib/audio";

const menuSections: SectionId[] = [
  "home",
  "education",
  "experience",
  "projects",
  "fyp",
  "research",
  "skills",
  "achievements",
  "contact",
];

export function Hud() {
  const [menuOpen, setMenuOpen] = useState(false);
  const nearby = useGameStore((s) => s.nearby);
  const openSection = useGameStore((s) => s.openSection);
  const openPanel = useGameStore((s) => s.openPanel);
  const muted = useGameStore((s) => s.muted);
  const toggleMute = useGameStore((s) => s.toggleMute);
  const visited = useGameStore((s) => s.visited);

  const nearGarage = useGameStore((s) => s.nearGarage);
  const garageOpen = useGameStore((s) => s.garageOpen);
  const openGarage = useGameStore((s) => s.openGarage);
  const zone = zones.find((z) => z.id === nearby);

  return (
    <div className="hud">
      <div className="hud__topbar">
        <div className="hud__brand">
          <span className="hud__name">{portfolio.personal.name}</span>
          <span className="hud__role">{portfolio.personal.title}</span>
        </div>
        <div className="hud__actions">
          <span className="hud__progress">
            {visited.length}/{zones.length} districts
          </span>
          <button
            type="button"
            className="btn btn--ghost"
            aria-pressed={!muted}
            onClick={() => {
              if (muted) startEngine();
              else stopEngine();
              toggleMute();
            }}
          >
            {muted ? "Sound off" : "Sound on"}
          </button>
          <button type="button" className="btn btn--ghost" onClick={openGarage}>
            Garage
          </button>
          <a className="btn btn--ghost" href={portfolio.personal.cv} download>
            CV
          </a>
          <button
            type="button"
            className="btn btn--primary"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? "Close menu" : "Menu"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="hud__menu" aria-label="Portfolio sections">
          {menuSections.map((id) => (
            <button
              key={id}
              type="button"
              className="hud__menu-item"
              onClick={() => {
                openPanel(id);
                setMenuOpen(false);
              }}
            >
              {sectionLabels[id]}
            </button>
          ))}
        </nav>
      )}

      {!openSection && !garageOpen && nearGarage && (
        <div className="prompt" role="status">
          <span className="prompt__label">GARAGE</span>
          <span className="prompt__key">
            Press <kbd>E</kbd> to change your car
          </span>
        </div>
      )}

      {!openSection && !garageOpen && !nearGarage && zone && (
        <div className="prompt" role="status">
          <span className="prompt__label">{zone.label}</span>
          <span className="prompt__key">
            Press <kbd>E</kbd> to explore
          </span>
        </div>
      )}

      {!openSection && !garageOpen && !nearGarage && !zone && (
        <div className="hud__hint">
          <kbd>W</kbd>
          <kbd>A</kbd>
          <kbd>S</kbd>
          <kbd>D</kbd> drive · <kbd>Shift</kbd> nitro · <kbd>Space</kbd> jump · <kbd>E</kbd>{" "}
          interact
        </div>
      )}
    </div>
  );
}
