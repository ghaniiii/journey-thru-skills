import { create } from "zustand";
import type { SectionId } from "@/data/portfolio";
import type { CarId } from "@/data/cars";

const CAR_KEY = "agk-portfolio-car";
function savedCar(): CarId {
  if (typeof window === "undefined") return "offroad";
  return (window.localStorage.getItem(CAR_KEY) as CarId | null) ?? "offroad";
}

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
  carId: CarId;
  garageOpen: boolean;
  nearGarage: boolean;
  setCar: (id: CarId) => void;
  openGarage: () => void;
  closeGarage: () => void;
  setNearGarage: (v: boolean) => void;
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
  carId: savedCar(),
  garageOpen: false,
  nearGarage: false,
  setCar: (id) => {
    window.localStorage.setItem(CAR_KEY, id);
    set({ carId: id });
  },
  openGarage: () => set({ garageOpen: true, openSection: null }),
  closeGarage: () => set({ garageOpen: false }),
  setNearGarage: (v) => {
    if (get().nearGarage !== v) set({ nearGarage: v });
  },
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
