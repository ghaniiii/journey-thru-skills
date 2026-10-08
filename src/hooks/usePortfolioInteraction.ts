import { useEffect } from "react";
import { blip } from "@/lib/audio";
import { useGameStore } from "@/store/useGameStore";

/** Global E / ESC handling for the interaction system. */
export function usePortfolioInteraction() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const store = useGameStore.getState();
      if (!store.entered) return;

      if (e.code === "Escape" && store.garageOpen) {
        e.preventDefault();
        store.closeGarage();
        if (!store.muted) blip(420);
        return;
      }
      if (e.code === "KeyE" && !store.openSection && !store.garageOpen && store.nearGarage) {
        e.preventDefault();
        store.openGarage();
        if (!store.muted) blip(760);
        return;
      }
      if (e.code === "Escape" && store.openSection) {
        e.preventDefault();
        store.closePanel();
        if (!store.muted) blip(420);
        return;
      }
      if (e.code === "KeyE" && !store.openSection && !store.garageOpen && store.nearby) {
        e.preventDefault();
        store.openPanel(store.nearby);
        if (!store.muted) blip(760);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}
