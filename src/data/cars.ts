import offroad from "@/assets/offroad-4x4.glb.asset.json";
import luxury from "@/assets/car-suv-luxury.glb.asset.json";
import sports from "@/assets/car-sedan-sports.glb.asset.json";
import race from "@/assets/car-race.glb.asset.json";
import pickup from "@/assets/car-truck.glb.asset.json";

export type CarId = "offroad" | "luxury" | "sports" | "race" | "pickup";

export interface CarOption {
  id: CarId;
  label: string;
  description: string;
  url: string;
  scale: number;
}

/** Garage line-up (CC0 Kenney Car Kit, logo-free). */
export const cars: CarOption[] = [
  { id: "offroad", label: "Off-road 4×4", description: "The trusty default explorer.", url: offroad.url, scale: 1.62 },
  { id: "luxury", label: "Luxury SUV", description: "Smooth, tall and polished.", url: luxury.url, scale: 1.62 },
  { id: "sports", label: "Sports sedan", description: "Low, sleek city cruiser.", url: sports.url, scale: 1.62 },
  { id: "race", label: "Race car", description: "Track-day looks on city streets.", url: race.url, scale: 1.62 },
  { id: "pickup", label: "Pickup truck", description: "Big, boxy and hard-working.", url: pickup.url, scale: 1.62 },
];

/** Drive-in garage pad beside the spawn point. */
export const GARAGE_POS: [number, number] = [4, 34];
export const GARAGE_RADIUS = 5;

export const findCar = (id: CarId) => cars.find((c) => c.id === id) ?? cars[0]!;
