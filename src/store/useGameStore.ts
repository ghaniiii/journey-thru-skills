import { create } from "zustand";
import type { SectionId } from "@/data/portfolio";

export interface TouchInput {
  forward: number;
  steer: number;
  jump: boolean;
  nitro: boolean;
}

interface GameState {
  entered: boolean;
  nearby: SectionId | null;
  openSection: SectionId | null;
  visited: SectionId[];
  muted: boolean;
  eggFound: boolean;
  touch: TouchInput;
  enterWorld: () => void;
  setNearby: (id: SectionId | null) => void;
  openPanel: (id: SectionId) => void;
  closePanel: () => void;
  toggleMute: () => void;
  findEgg: () => void;
  setTouch: (input: Partial<TouchInput>) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  entered: false,
  nearby: null,
  openSection: null,
  visited: [],
  muted: true,
  eggFound: false,
  touch: { forward: 0, steer: 0, jump: false, nitro: false },
  enterWorld: () => set({ entered: true }),
  setNearby: (id) => {
    if (get().nearby !== id) set({ nearby: id });
  },
  openPanel: (id) =>
    set((s) => ({
      openSection: id,
      visited: s.visited.includes(id) ? s.visited : [...s.visited, id],
    })),
  closePanel: () => set({ openSection: null }),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  findEgg: () => {
    if (!get().eggFound) set({ eggFound: true });
  },
  setTouch: (input) => set((s) => ({ touch: { ...s.touch, ...input } })),
}));
