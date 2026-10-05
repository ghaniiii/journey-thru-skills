/**
 * Master plan of the city. Everything (roads, blocks, landmarks, vegetation)
 * derives from these grid lines so the world stays one coherent map.
 *
 * Road hierarchy: x=0 / z=0 are the 4-lane boulevards (continue to the horizon),
 * ±30 are 2-lane avenues, ±60 is the residential ring road. A roundabout sits
 * at the city centre.
 */
export const LINES = [-60, -30, 0, 30, 60] as const;
export const SIDEWALK = 2.5;
export const GRID_EXTENT = 63.5;
export const BOULEVARD_EXTENT = 320;
export const ROUNDABOUT_R = 13;
export const ISLAND_R = 5.5;
/** Top of the raised sidewalk/block slab. */
export const BLOCK_TOP = 0.15;

export function roadWidth(v: number) {
  if (v === 0) return 14;
  if (Math.abs(v) === 30) return 9;
  return 7;
}

/** Curb-to-curb extent of the block between grid line i and i+1 (sidewalk included). */
export function cellBounds(i: number) {
  const a = LINES[i]!;
  const b = LINES[i + 1]!;
  return { min: a + roadWidth(a) / 2, max: b - roadWidth(b) / 2 };
}

export function cellCenter(i: number) {
  const { min, max } = cellBounds(i);
  return (min + max) / 2;
}

/** Buildable interior of a block (inside the sidewalk). */
export function cellInner(i: number) {
  const { min, max } = cellBounds(i);
  return { min: min + SIDEWALK, max: max - SIDEWALK };
}
