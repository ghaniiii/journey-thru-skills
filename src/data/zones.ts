import type { SectionId } from "./portfolio";

export type ZoneKind = "campus" | "office" | "lab" | "studio" | "tower" | "monument" | "beacon";

export interface Zone {
  id: SectionId;
  label: string;
  hint: string;
  kind: ZoneKind;
  /** World position of the landmark centre (x, z). */
  position: [number, number];
  /** Footprint half-extents used for both geometry and collision. */
  size: [number, number, number];
  radius: number;
  color: string;
}

/**
 * World map — a central plaza (spawn) with radiating districts.
 *
 *                 RESEARCH
 *        CONTACT      |      ACHIEVEMENTS
 *          PROJECTS  SPAWN  SKILLS
 *              FYP LAB |  EXPERIENCE
 *                 EDUCATION
 */
export const zones: Zone[] = [
  {
    id: "education",
    label: "EDUCATION",
    hint: "Degrees, CGPA and schooling",
    kind: "campus",
    position: [0, -46],
    size: [9, 11, 7],
    radius: 13,
    color: "#3fb6c9",
  },
  {
    id: "experience",
    label: "EXPERIENCE",
    hint: "Internships and teaching",
    kind: "office",
    position: [40, -22],
    size: [8, 15, 8],
    radius: 13,
    color: "#5b8cf5",
  },
  {
    id: "projects",
    label: "PROJECTS",
    hint: "Things I have shipped",
    kind: "studio",
    position: [-42, -16],
    size: [10, 9, 9],
    radius: 14,
    color: "#f2a33c",
  },
  {
    id: "fyp",
    label: "PROJECT LAB",
    hint: "Final Year Project",
    kind: "tower",
    position: [-44, 26],
    size: [8, 20, 8],
    radius: 15,
    color: "#ff7a59",
  },
  {
    id: "research",
    label: "QUANTUM LAB",
    hint: "Undergraduate research",
    kind: "lab",
    position: [0, 54],
    size: [11, 10, 11],
    radius: 15,
    color: "#8fe3b0",
  },
  {
    id: "skills",
    label: "SKILLS",
    hint: "Languages and stacks",
    kind: "tower",
    position: [44, 22],
    size: [7, 16, 7],
    radius: 13,
    color: "#7fd1f5",
  },
  {
    id: "achievements",
    label: "ACHIEVEMENTS",
    hint: "Medals and honours",
    kind: "monument",
    position: [22, 46],
    size: [6, 8, 6],
    radius: 12,
    color: "#ffd166",
  },
  {
    id: "contact",
    label: "CONTACT",
    hint: "Links and CV download",
    kind: "beacon",
    position: [-24, 48],
    size: [7, 9, 7],
    radius: 13,
    color: "#ff9fb2",
  },
];

/** Hidden developer easter egg tucked into a far corner of the map. */
export const eggPosition: [number, number] = [-70, -62];

export const WORLD_BOUND = 86;
