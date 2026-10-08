import {
  BLOCK_TOP,
  BOULEVARD_EXTENT,
  GRID_EXTENT,
  ISLAND_R,
  LINES,
  ROUNDABOUT_R,
  SIDEWALK,
  cellBounds,
  cellInner,
  roadWidth,
} from "@/data/cityLayout";
import { eggPosition, zones } from "@/data/zones";
import type { Obstacle } from "@/lib/vehiclePhysics";

export type V3 = [number, number, number];
/** One instanced piece: position, scale, colour and optional yaw. */
export interface Part {
  p: V3;
  s: V3;
  c: string;
  r?: number;
}

export interface StreetTree {
  x: number;
  z: number;
  y: number;
  kind: "oak" | "detailed" | "fat" | "bush";
  scale: number;
  rot: number;
}

export interface CityData {
  solids: Part[];
  glass: Part[];
  roofs: Part[];
  glow: Part[];
  flat: Part[];
  paint: Part[];
  obstacles: Obstacle[];
  ponds: { x: number; z: number; r: number }[];
  streetTrees: StreetTree[];
}

export function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ASPHALT = "#3b3e44";
const SIDEWALK_C = "#c4beb1";
const GRASS = "#8cc46a";
const WHITE = "#ecebe4";
const YELLOW = "#f0c24b";

type BlockType = "zone" | "downtown" | "commercial" | "residential" | "park";

/** District plan per block (column i along x, row j along z). */
function blockType(i: number, j: number): BlockType {
  const key = `${i},${j}`;
  const plan: Record<string, BlockType> = {
    "1,1": "downtown",
    "2,1": "downtown",
    "1,2": "downtown",
    "2,2": "downtown",
    "0,0": "park",
    "1,0": "residential",
    "3,0": "commercial",
    "0,3": "residential",
  };
  return plan[key] ?? "zone";
}

function build(): CityData {
  const rand = mulberry32(2024);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]!;
  const d: CityData = {
    solids: [],
    glass: [],
    roofs: [],
    glow: [],
    flat: [],
    paint: [],
    obstacles: [],
    ponds: [],
    streetTrees: [],
  };
  const B = BLOCK_TOP;

  // ---- Roads -------------------------------------------------------------
  for (const v of LINES) {
    const w = roadWidth(v);
    const ext = v === 0 ? BOULEVARD_EXTENT : GRID_EXTENT;
    d.flat.push({ p: [v, 0.02, 0], s: [w, 0.02, ext * 2], c: ASPHALT });
    d.flat.push({ p: [0, 0.021, v], s: [ext * 2, 0.02, w], c: ASPHALT });
    roadMarkings(d, "z", v);
    roadMarkings(d, "x", v);
  }

  // ---- Blocks ------------------------------------------------------------
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      const bx = cellBounds(i);
      const bz = cellBounds(j);
      const cx = (bx.min + bx.max) / 2;
      const cz = (bz.min + bz.max) / 2;
      const w = bx.max - bx.min;
      const dd = bz.max - bz.min;
      d.solids.push({ p: [cx, B / 2, cz], s: [w, B, dd], c: SIDEWALK_C });
      // Curb edge and furniture/landscaping strip; the inner band stays the walking zone.
      const FS = "#a39d90";
      const CURB = "#e2ddd2";
      for (const [px, pz, sx, sz] of [
        [cx, bz.min + 0.75, w, 0.9],
        [cx, bz.max - 0.75, w, 0.9],
        [bx.min + 0.75, cz, 0.9, dd],
        [bx.max - 0.75, cz, 0.9, dd],
      ] as const) d.flat.push({ p: [px, B + 0.012, pz], s: [sx, 0.02, sz], c: FS });
      for (const [px, pz, sx, sz] of [
        [cx, bz.min + 0.1, w, 0.2],
        [cx, bz.max - 0.1, w, 0.2],
        [bx.min + 0.1, cz, 0.2, dd],
        [bx.max - 0.1, cz, 0.2, dd],
      ] as const) d.paint.push({ p: [px, B + 0.014, pz], s: [sx, 0.02, sz], c: CURB });
      // Paving joints across the walking zone.
      for (let t = bx.min + 3; t < bx.max - 2; t += 3)
        for (const zz of [bz.min + 1.95, bz.max - 1.95])
          d.paint.push({ p: [t, B + 0.013, zz], s: [0.05, 0.02, 1.1], c: "#b3ad9f" });
      d.flat.push({
        p: [cx, B + 0.01, cz],
        s: [w - SIDEWALK * 2, 0.02, dd - SIDEWALK * 2],
        c: GRASS,
      });
      const ix = cellInner(i);
      const iz = cellInner(j);
      const type = blockType(i, j);
      if (type === "downtown") downtown(d, ix, iz, rand, pick);
      else if (type === "commercial") commercial(d, ix, iz, rand, pick);
      else if (type === "residential") residential(d, ix, iz, rand, pick);
      else if (type === "park") park(d, ix, iz);
    }
  }

  streetLights(d);
  trafficSignals(d);
  busStops(d);
  roundabout(d, rand);
  d.obstacles.push({ x: 0, z: 0, hx: ISLAND_R, hz: ISLAND_R, r: ISLAND_R });
  streetscape(d, rand);
  return d;
}

const TREE_KINDS: StreetTree["kind"][] = ["oak", "detailed", "fat", "oak", "detailed"];

/** Street trees, benches, bins and planters in the furniture strip of every road. */
function streetscape(d: CityData, rand: Rand) {
  const B = BLOCK_TOP;
  for (const v of LINES) {
    const off = roadWidth(v) / 2 + 0.75;
    const cr = crossings(v);
    let slot = 0;
    for (let t = -GRID_EXTENT + 4; t < GRID_EXTENT - 2; t += 8) {
      const tt = t + (rand() - 0.5) * 1.6;
      if (cr.some(({ c, h }) => Math.abs(tt - c) < h + 1.5)) continue;
      for (const side of [-1, 1]) {
        if (Math.abs(v) === 60 && side * Math.sign(v) > 0) continue;
        for (const axis of ["z", "x"] as const) {
          const x = axis === "z" ? v + side * off : tt;
          const z = axis === "z" ? tt : v + side * off;
          if (!freeAt(d, x, z)) continue;
          slot++;
          if (slot % 4 === 0) {
            // bench + bin facing the walking zone
            const r = axis === "z" ? Math.PI / 2 : 0;
            d.solids.push({ p: [x, B + 0.45, z], s: [1.5, 0.1, 0.45], c: "#7a5236", r });
            d.solids.push({ p: [x, B + 0.22, z], s: [1.3, 0.4, 0.12], c: "#3a3d42", r });
            const bo = 1.3;
            d.solids.push({
              p: [x + (axis === "x" ? bo : 0), B + 0.4, z + (axis === "z" ? bo : 0)],
              s: [0.45, 0.8, 0.45],
              c: "#2f5d50",
            });
          } else if (slot % 7 === 0) {
            d.solids.push({ p: [x, B + 0.3, z], s: [1.1, 0.6, 1.1], c: "#9c8f7c" });
            d.streetTrees.push({ x, z, y: B + 0.6, kind: "bush", scale: 0.7 + rand() * 0.3, rot: rand() * 6.28 });
          } else if (rand() > 0.12) {
            d.solids.push({ p: [x, B + 0.02, z], s: [1.1, 0.04, 1.1], c: "#5b4a3a" });
            d.streetTrees.push({
              x: x + (rand() - 0.5) * 0.2,
              z: z + (rand() - 0.5) * 0.2,
              y: B,
              kind: TREE_KINDS[Math.floor(rand() * TREE_KINDS.length)]!,
              scale: 0.55 + rand() * 0.35,
              rot: rand() * 6.28,
            });
            d.obstacles.push({ x, z, hx: 0.3, hz: 0.3 });
          }
        }
      }
    }
  }
}

function freeAt(d: CityData, x: number, z: number) {
  if (Math.hypot(x, z) < ROUNDABOUT_R + 3) return false;
  for (const o of d.obstacles) if (Math.abs(x - o.x) < o.hx + 0.8 && Math.abs(z - o.z) < o.hz + 0.8) return false;
  for (const zn of zones)
    if (Math.abs(x - zn.position[0]) < zn.size[0] / 2 + 2.5 && Math.abs(z - zn.position[1]) < zn.size[2] / 2 + 2.5) return false;
  return true;
}

/** Landscaped central island: hedge ring, flower beds, small trees and a monument. */
function roundabout(d: CityData, rand: Rand) {
  const top = 0.31;
  for (let k = 0; k < 20; k++) {
    const a = (k / 20) * Math.PI * 2;
    const rr = ISLAND_R - 0.55;
    d.solids.push({
      p: [Math.cos(a) * rr, top + 0.3, Math.sin(a) * rr],
      s: [1.75, 0.6, 0.6],
      c: k % 2 ? "#4f7d3a" : "#56873f",
      r: -a + Math.PI / 2,
    });
  }
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    const rr = ISLAND_R - 2.2;
    d.flat.push({ p: [Math.cos(a) * rr, top + 0.02, Math.sin(a) * rr], s: [1.2, 0.02, 1.2], c: k % 2 ? "#e0607a" : "#f1c24b", r: a });
    if (k % 2 === 0)
      d.streetTrees.push({ x: Math.cos(a + 0.5) * rr, z: Math.sin(a + 0.5) * rr, y: top, kind: "detailed", scale: 0.45 + rand() * 0.15, rot: a });
  }
  d.solids.push({ p: [0, top + 0.4, 0], s: [2, 0.8, 2], c: "#b9b2a3", r: Math.PI / 4 });
  d.solids.push({ p: [0, top + 2.2, 0], s: [0.6, 3, 0.6], c: "#d9d2c2", r: Math.PI / 4 });
  d.glow.push({ p: [0, top + 3.9, 0], s: [0.5, 0.4, 0.5], c: "#ffd27a", r: Math.PI / 4 });
}

type Range = { min: number; max: number };

function strip(d: CityData, axis: "x" | "z", at: number, a: number, b: number, o: number, ww: number, c: string) {
  const y = 0.04;
  if (axis === "z") d.paint.push({ p: [at + o, y, (a + b) / 2], s: [ww, 0.02, b - a], c });
  else d.paint.push({ p: [(a + b) / 2, y, at + o], s: [b - a, 0.02, ww], c });
}

/** Lane markings, crosswalks and stop lines for one road, split at every intersection. */
function roadMarkings(d: CityData, axis: "x" | "z", at: number) {
  const w = roadWidth(at);
  const half = (c: number) => (at === 0 && c === 0 ? ROUNDABOUT_R : roadWidth(c) / 2);
  const segs: { a: number; b: number; walkA: boolean; walkB: boolean }[] = [];
  for (let k = 0; k < LINES.length - 1; k++) {
    segs.push({
      a: LINES[k]! + half(LINES[k]!),
      b: LINES[k + 1]! - half(LINES[k + 1]!),
      walkA: true,
      walkB: true,
    });
  }
  if (at === 0) {
    segs.push({ a: -BOULEVARD_EXTENT, b: -GRID_EXTENT, walkA: false, walkB: true });
    segs.push({ a: GRID_EXTENT, b: BOULEVARD_EXTENT, walkA: true, walkB: false });
  }
  for (const { a, b, walkA, walkB } of segs) {
    const la = a + (walkA ? 4.6 : 0);
    const lb = b - (walkB ? 4.6 : 0);
    const dashes = (o: number, c: string) => {
      for (let t = la + 0.8; t + 3 < lb; t += 6.5) strip(d, axis, at, t, t + 3, o, 0.18, c);
    };
    if (w >= 14) {
      strip(d, axis, at, la, lb, -0.22, 0.14, YELLOW);
      strip(d, axis, at, la, lb, 0.22, 0.14, YELLOW);
      dashes(-3.5, WHITE);
      dashes(3.5, WHITE);
    } else if (w >= 9) {
      dashes(0, YELLOW);
    } else {
      dashes(0, WHITE);
    }
    if (w >= 9) {
      strip(d, axis, at, a, b, -(w / 2 - 0.45), 0.16, WHITE);
      strip(d, axis, at, a, b, w / 2 - 0.45, 0.16, WHITE);
    }
    const zebra = (from: number, to: number) => {
      for (let o = -w / 2 + 0.9; o <= w / 2 - 0.9; o += 1.3) strip(d, axis, at, from, to, o, 0.65, WHITE);
    };
    if (walkA) {
      zebra(a + 0.6, a + 3.4);
      strip(d, axis, at, a + 4.0, a + 4.4, -w / 4, w / 2 - 0.4, WHITE);
    }
    if (walkB) {
      zebra(b - 3.4, b - 0.6);
      strip(d, axis, at, b - 4.4, b - 4.0, w / 4, w / 2 - 0.4, WHITE);
    }
  }
}

const TOWER_C = ["#d9d4c7", "#b8c2c8", "#c9b8a3", "#9aa7b0", "#e4ddd0", "#a9b5a6"];
const GLASS_C = ["#4d6b7d", "#5a7d8f", "#3f5e70", "#567080"];
const SHOP_C = ["#e8c9a0", "#d98e73", "#c7d3b5", "#f0e2c4", "#b5c7d3"];
const AWNING_C = ["#c0392b", "#2e7d6b", "#d9a33c", "#3b6ea5"];
const HOUSE_C = ["#f1e6d2", "#e6cfae", "#d7e0d0", "#f0d6cf", "#cfd9e3"];
const ROOF_C = ["#8c4a3a", "#5a5f66", "#7a5236", "#a0533e"];

type Rand = () => number;
type Pick = <T>(arr: T[]) => T;

function tower(d: CityData, x: number, z: number, w: number, dd: number, h: number, col: string, glass: string, rand: Rand) {
  const B = BLOCK_TOP;
  const style = Math.floor(rand() * 3);
  // Podium + shaft, with an optional setback upper tier.
  const lower = style === 0 ? h * 0.62 : h;
  d.solids.push({ p: [x, B + lower / 2, z], s: [w, lower, dd], c: col });
  d.glass.push({ p: [x, B + 1.2, z], s: [w + 0.12, 2.4, dd + 0.12], c: "#2f4756" });
  const band = style === 1 ? 2.4 : 3.1;
  const glassH = style === 2 ? band * 0.8 : 1.3;
  const draw = (y0: number, y1: number, ww: number, wd: number) => {
    for (let y = y0; y < y1 - 1; y += band) d.glass.push({ p: [x, B + y, z], s: [ww + 0.1, glassH, wd + 0.1], c: glass });
  };
  draw(3.6, lower, w, dd);
  let top = lower;
  if (style === 0) {
    const uw = w * 0.7;
    const ud = dd * 0.7;
    d.solids.push({ p: [x, B + lower + (h - lower) / 2, z], s: [uw, h - lower, ud], c: col });
    d.solids.push({ p: [x, B + lower + 0.15, z], s: [w + 0.2, 0.3, dd + 0.2], c: "#7d8389" });
    draw(lower + 1.2, h, uw, ud);
    top = h;
  }
  if (style === 2) {
    // vertical fins for a different facade rhythm
    for (let k = -2; k <= 2; k++) d.solids.push({ p: [x + (k * w) / 5, B + top / 2, z + dd / 2 + 0.08], s: [0.18, top, 0.18], c: "#e9e5dc" });
  }
  d.solids.push({ p: [x, B + top + 0.25, z], s: [w * (style === 0 ? 0.72 : 1) + 0.3, 0.5, dd * (style === 0 ? 0.72 : 1) + 0.3], c: "#6f757b" });
  d.solids.push({ p: [x + w * 0.12, B + top + 0.95, z - dd * 0.1], s: [w * 0.3, 0.9, dd * 0.28], c: "#8a9096" });
  if (h > 26) {
    d.solids.push({ p: [x, B + top + 3, z], s: [0.15, 4, 0.15], c: "#9aa0a6" });
    d.glow.push({ p: [x, B + top + 5.1, z], s: [0.25, 0.25, 0.25], c: "#ff5a4d" });
  }
  // Entrance canopy
  d.solids.push({ p: [x, B + 2.7, z + dd / 2 + 0.8], s: [w * 0.4, 0.15, 1.6], c: "#3c4148" });
  d.glow.push({ p: [x, B + 2.6, z + dd / 2 + 0.8], s: [w * 0.3, 0.04, 1.2], c: "#fff0c8" });
  d.obstacles.push({ x, z, hx: w / 2, hz: dd / 2 });
}

function shop(d: CityData, x: number, z: number, s: number, h: number, fx: number, fz: number, rand: Rand, pick: Pick) {
  const B = BLOCK_TOP;
  d.solids.push({ p: [x, B + h / 2, z], s: [s, h, s], c: pick(SHOP_C) });
  d.glass.push({ p: [x, B + 1.2, z], s: [s + 0.1, 1.7, s + 0.1], c: pick(GLASS_C) });
  if (h > 5) d.glass.push({ p: [x, B + 4.2, z], s: [s + 0.08, 1, s + 0.08], c: "#62808f" });
  const ax = x + fx * (s / 2 + 0.6);
  const az = z + fz * (s / 2 + 0.6);
  d.solids.push({ p: [ax, B + 2.5, az], s: fx ? [1.2, 0.14, s * 0.85] : [s * 0.85, 0.14, 1.2], c: pick(AWNING_C) });
  d.glow.push({
    p: [x + fx * (s / 2 + 0.06), B + 3.1, z + fz * (s / 2 + 0.06)],
    s: fx ? [0.08, 0.5, s * 0.5] : [s * 0.5, 0.5, 0.08],
    c: rand() > 0.5 ? "#ffe9a8" : "#bdf2ff",
  });
  d.solids.push({ p: [x, B + h + 0.2, z], s: [s + 0.2, 0.4, s + 0.2], c: "#7b7f84" });
  d.obstacles.push({ x, z, hx: s / 2, hz: s / 2 });
}

function parkedCarBay(d: CityData, x: number, z: number, rand: Rand) {
  const B = BLOCK_TOP;
  const col = ["#b8352b", "#2d5e8c", "#e9e6df", "#3b3f45"][Math.floor(rand() * 4)]!;
  d.solids.push({ p: [x, B + 0.45, z], s: [0.95, 0.55, 2.1], c: col });
  d.glass.push({ p: [x, B + 0.9, z], s: [0.85, 0.4, 1.2], c: "#2e3f4a" });
  d.obstacles.push({ x, z, hx: 0.5, hz: 1.1 });
}

function parkedCar(d: CityData, x: number, z: number, alongX: boolean, rand: Rand) {
  const B = BLOCK_TOP;
  const col = ["#b8352b", "#2d5e8c", "#e9e6df", "#3b3f45", "#d6a23a", "#4d7a52"][Math.floor(rand() * 6)]!;
  const r = alongX ? 0 : Math.PI / 2;
  d.solids.push({ p: [x, B + 0.55, z], s: [3.6, 0.7, 1.7], c: col, r });
  d.glass.push({ p: [x, B + 1.15, z], s: [2, 0.55, 1.5], c: "#2e3f4a", r });
  for (const a of [-1.2, 1.2])
    for (const b of [-0.8, 0.8]) {
      const wx = alongX ? x + a : x + b;
      const wz = alongX ? z + b : z + a;
      d.solids.push({ p: [wx, B + 0.3, wz], s: [0.7, 0.6, 0.3], c: "#1d1f22", r });
    }
  d.obstacles.push({ x, z, hx: alongX ? 1.8 : 0.85, hz: alongX ? 0.85 : 1.8 });
}

function house(d: CityData, x: number, z: number, w: number, dd: number, fx: number, fz: number, pick: Pick, rand: Rand) {
  const B = BLOCK_TOP;
  const twoStorey = rand() > 0.5;
  const h = twoStorey ? 5.6 : 3.2;
  const col = pick(HOUSE_C);
  d.solids.push({ p: [x, B + h / 2, z], s: [w, h, dd], c: col });
  if (rand() > 0.35) {
    d.roofs.push({ p: [x, B + h + 1, z], s: [w * 1.15, 2, dd * 1.15], c: pick(ROOF_C), r: Math.PI / 4 });
    d.solids.push({ p: [x + w * 0.25, B + h + 1.6, z], s: [0.5, 1.4, 0.5], c: "#8a6a58" });
  } else {
    d.solids.push({ p: [x, B + h + 0.2, z], s: [w + 0.2, 0.4, dd + 0.2], c: "#8f8a80" });
  }
  // Side wing for an L-shaped footprint on some houses.
  if (rand() > 0.6) d.solids.push({ p: [x - w * 0.45, B + 1.5, z], s: [w * 0.4, 3, dd * 0.7], c: col });
  for (let y = 1.9; y < h; y += 2.4) {
    for (const ox of [-w * 0.27, w * 0.27])
      d.glass.push({ p: [x + ox, B + y, z + fz * (dd / 2 + 0.03)], s: [w * 0.22, 0.9, 0.06], c: "#5d7a8a" });
  }
  if (twoStorey) {
    d.solids.push({ p: [x, B + 3.0, z + fz * (dd / 2 + 0.5)], s: [w * 0.5, 0.12, 1], c: "#e8e2d6" });
    d.solids.push({ p: [x, B + 3.4, z + fz * (dd / 2 + 0.95)], s: [w * 0.5, 0.7, 0.06], c: "#4a4d52" });
  }
  d.solids.push({
    p: [x + fx * (w / 2 + 0.03), B + 1, z + fz * (dd / 2 + 0.03)],
    s: fx ? [0.08, 2, 0.9] : [0.9, 2, 0.08],
    c: "#6b4a33",
  });
  d.solids.push({ p: [x, B + 0.08, z + fz * (dd / 2 + 0.6)], s: [1.1, 0.16, 1], c: "#cfc8ba" });
  d.obstacles.push({ x, z, hx: w / 2, hz: dd / 2 });
  // Car on the driveway beside the house.
  if (rand() > 0.45) parkedCar(d, x + w / 2 + 1.2, z + fz * (dd / 2 + 1.2), false, rand);
}

function downtown(d: CityData, ix: Range, iz: Range, rand: Rand, pick: Pick) {
  const gap = 1.6;
  const fw = (ix.max - ix.min - gap) / 2;
  const fd = (iz.max - iz.min - gap) / 2;
  for (const sx of [0, 1]) {
    for (const sz of [0, 1]) {
      const x = ix.min + fw / 2 + sx * (fw + gap);
      const z = iz.min + fd / 2 + sz * (fd + gap);
      const near = 1 - Math.min(Math.hypot(x, z) / 40, 1);
      const h = 10 + near * 16 + rand() * 8;
      tower(d, x, z, fw * (0.82 + rand() * 0.12), fd * (0.82 + rand() * 0.12), h, pick(TOWER_C), pick(GLASS_C), rand);
    }
  }
}

function commercial(d: CityData, ix: Range, iz: Range, rand: Rand, pick: Pick) {
  const cw = (ix.max - ix.min) / 3;
  const cd = (iz.max - iz.min) / 3;
  for (let a = 0; a < 3; a++) {
    for (let b = 0; b < 3; b++) {
      const x = ix.min + cw * (a + 0.5);
      const z = iz.min + cd * (b + 0.5);
      if (a === 1 && b === 1) {
        // Parking lot with bay markings.
        d.flat.push({ p: [x, BLOCK_TOP + 0.02, z], s: [cw + 0.6, 0.02, cd + 0.6], c: "#4a4d52" });
        for (let k = -2; k <= 2; k++)
          d.paint.push({ p: [x + k * 1.2, BLOCK_TOP + 0.04, z], s: [0.1, 0.02, cd * 0.7], c: WHITE });
        for (let k = -2; k < 2; k++) if (rand() > 0.4) parkedCarBay(d, x + k * 1.2 + 0.6, z, rand);
        continue;
      }
      const fx = a === 0 ? -1 : a === 2 ? 1 : 0;
      const fz = fx !== 0 ? 0 : b === 0 ? -1 : 1;
      shop(d, x, z, Math.min(cw, cd) - 1, 4 + rand() * 3.5, fx, fz, rand, pick);
    }
  }
}

function residential(d: CityData, ix: Range, iz: Range, rand: Rand, pick: Pick) {
  const n = ix.max - ix.min > 15 ? 3 : 2;
  const cw = (ix.max - ix.min) / n;
  const cd = (iz.max - iz.min) / n;
  for (let a = 0; a < n; a++) {
    for (let b = 0; b < n; b++) {
      if (n === 3 && a === 1 && b === 1) continue; // shared back garden
      const x = ix.min + cw * (a + 0.5) + (rand() - 0.5) * 0.6;
      const z = iz.min + cd * (b + 0.5) + (rand() - 0.5) * 0.6;
      const fz = b < n / 2 ? -1 : 1;
      house(d, x, z, cw * (0.5 + rand() * 0.15), cd * (0.45 + rand() * 0.12), 0, fz, pick, rand);
    }
  }
}

function park(d: CityData, ix: Range, iz: Range) {
  const cx = (ix.min + ix.max) / 2;
  const cz = (iz.min + iz.max) / 2;
  const path = "#d8c9a4";
  d.flat.push({ p: [cx, BLOCK_TOP + 0.03, cz], s: [ix.max - ix.min, 0.02, 1.6], c: path });
  d.flat.push({ p: [cx, BLOCK_TOP + 0.03, cz], s: [1.6, 0.02, iz.max - iz.min], c: path });
  d.ponds.push({ x: cx + 4, z: cz + 4, r: 2.8 });
  for (const [bx, bz, r] of [
    [cx - 2, cz + 1.6, 0],
    [cx + 2, cz - 1.6, 0],
    [cx - 1.6, cz - 3, Math.PI / 2],
  ] as const) {
    d.solids.push({ p: [bx, BLOCK_TOP + 0.45, bz], s: [1.6, 0.12, 0.5], c: "#8b5e3c", r });
    d.solids.push({ p: [bx, BLOCK_TOP + 0.2, bz], s: [1.4, 0.4, 0.15], c: "#3a3d42", r });
  }
}

function crossings(v: number) {
  return LINES.map((c) => ({ c, h: v === 0 && c === 0 ? ROUNDABOUT_R + 2 : roadWidth(c) / 2 + 3 }));
}

function streetLights(d: CityData) {
  const B = BLOCK_TOP;
  for (const v of LINES) {
    const off = roadWidth(v) / 2 + 0.7;
    const cr = crossings(v);
    for (let t = -GRID_EXTENT + 8; t < GRID_EXTENT - 4; t += 16) {
      if (cr.some(({ c, h }) => Math.abs(t - c) < h)) continue;
      for (const side of [-1, 1]) {
        if (Math.abs(v) === 60 && side * Math.sign(v) > 0) continue; // ring road: inner side only
        for (const axis of ["z", "x"] as const) {
          const px = axis === "z" ? v + side * off : t;
          const pz = axis === "z" ? t : v + side * off;
          const ax = axis === "z" ? -side * 0.7 : 0;
          const az = axis === "x" ? -side * 0.7 : 0;
          d.solids.push({ p: [px, B + 2.6, pz], s: [0.16, 5.2, 0.16], c: "#3c4148" });
          d.solids.push({ p: [px + ax / 2, B + 5.15, pz + az / 2], s: [ax ? 0.8 : 0.1, 0.1, az ? 0.8 : 0.1], c: "#3c4148" });
          d.glow.push({ p: [px + ax, B + 5.05, pz + az], s: [0.5, 0.12, 0.5], c: "#fff3c4" });
        }
      }
    }
  }
}

function trafficSignals(d: CityData) {
  for (const x of LINES) {
    for (const z of LINES) {
      if (x === 0 && z === 0) continue;
      if (Math.abs(x) === 60 && Math.abs(z) === 60) continue;
      const ox = roadWidth(x) / 2 + 0.8;
      const oz = roadWidth(z) / 2 + 0.8;
      let k = 0;
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          const px = x + sx * ox;
          const pz = z + sz * oz;
          if (Math.abs(px) > GRID_EXTENT || Math.abs(pz) > GRID_EXTENT) continue;
          const POLE = "#2c3036";
          const HOUSING = "#1f2328";
          d.solids.push({ p: [px, 2.9, pz], s: [0.2, 5.8, 0.2], c: POLE });
          // Mast arm reaching over the approaching lanes (alternating axis per corner).
          const alongX = k % 2 === 0;
          const len = (alongX ? ox : oz) * 0.85;
          const ax = alongX ? -sx : 0;
          const az = alongX ? 0 : -sz;
          d.solids.push({ p: [px + (ax * len) / 2, 5.6, pz + (az * len) / 2], s: alongX ? [len, 0.14, 0.14] : [0.14, 0.14, len], c: POLE });
          const hx = px + ax * len * 0.8;
          const hz = pz + az * len * 0.8;
          // Facing direction: traffic approaching along the perpendicular road.
          const fx = alongX ? 0 : 0;
          const fz = alongX ? sz : 0;
          const fx2 = alongX ? 0 : sx;
          const dx = fx + fx2;
          const dz = fz;
          d.solids.push({ p: [hx, 4.85, hz], s: [0.5, 1.45, 0.5], c: HOUSING });
          d.solids.push({ p: [hx, 4.85, hz], s: [0.62, 1.55, 0.06].map((v, n) => (n === 0 && dx ? 0.06 : n === 2 && dx ? 0.62 : v)) as V3, c: "#14171a" });
          const lit = k % 3;
          ["#ff5a4d", "#ffb547", "#46e08a"].forEach((col, n) => {
            const y = 5.3 - n * 0.45;
            const lx = hx + dx * 0.27;
            const lz = hz + dz * 0.27;
            if (n === lit) d.glow.push({ p: [lx, y, lz], s: [0.28, 0.28, 0.28], c: col });
            else d.solids.push({ p: [lx, y, lz], s: [0.26, 0.26, 0.26], c: "#3a3e44" });
            // visor
            d.solids.push({ p: [lx + dx * 0.12, y + 0.17, lz + dz * 0.12], s: dx ? [0.25, 0.04, 0.34] : [0.34, 0.04, 0.25], c: HOUSING });
          });
          // Pedestrian crossing signal on the pole.
          d.solids.push({ p: [px, 2.7, pz], s: [0.36, 0.5, 0.36], c: HOUSING });
          d.glow.push({ p: [px - sx * 0.19, 2.7, pz], s: [0.04, 0.3, 0.26], c: lit === 2 ? "#f4f4f4" : "#ff8a3d" });
          d.solids.push({ p: [px, 1.1, pz], s: [0.22, 0.28, 0.16], c: "#d9b23a" });
          k++;
        }
      }
    }
  }
}

function busStops(d: CityData) {
  const B = BLOCK_TOP;
  for (const [x, z] of [
    [8.6, 44],
    [-8.6, -44],
    [44, 8.6],
    [-44, -8.6],
  ] as const) {
    const alongZ = Math.abs(x) < Math.abs(z);
    const out = alongZ ? Math.sign(x) : Math.sign(z);
    const bx = alongZ ? x + out * 0.6 : x;
    const bz = alongZ ? z : z + out * 0.6;
    d.solids.push({ p: [x, B + 2.5, z], s: alongZ ? [1.8, 0.12, 4] : [4, 0.12, 1.8], c: "#2f6f8f" });
    d.glass.push({ p: [bx, B + 1.3, bz], s: alongZ ? [0.08, 2.2, 3.8] : [3.8, 2.2, 0.08], c: "#7fb0c8" });
    d.solids.push({ p: [bx - (alongZ ? out * 0.4 : 0), B + 0.5, bz - (alongZ ? 0 : out * 0.4)], s: alongZ ? [0.5, 0.1, 3] : [3, 0.1, 0.5], c: "#8b5e3c" });
  }
}

export const city: CityData = build();

/** True when (x, z) is free of roads, buildings, landmarks and the easter egg. */
export function isFree(x: number, z: number, clear = 1) {
  if (Math.hypot(x, z) < ROUNDABOUT_R + clear + 2) return false;
  for (const v of LINES) {
    const h = roadWidth(v) / 2 + clear;
    const ext = v === 0 ? Infinity : GRID_EXTENT + clear;
    if (Math.abs(x - v) < h && Math.abs(z) < ext) return false;
    if (Math.abs(z - v) < h && Math.abs(x) < ext) return false;
  }
  for (const o of city.obstacles) {
    if (Math.abs(x - o.x) < o.hx + clear && Math.abs(z - o.z) < o.hz + clear) return false;
  }
  for (const zn of zones) {
    if (
      Math.abs(x - zn.position[0]) < zn.size[0] / 2 + 2 + clear &&
      Math.abs(z - zn.position[1]) < zn.size[2] / 2 + 2 + clear
    )
      return false;
  }
  for (const p of city.ponds) if (Math.hypot(x - p.x, z - p.z) < p.r + clear) return false;
  if (Math.hypot(x - eggPosition[0], z - eggPosition[1]) < 4) return false;
  return true;
}
