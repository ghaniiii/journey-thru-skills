export interface VehicleState {
  px: number;
  pz: number;
  vx: number;
  vz: number;
  yaw: number;
  slip: number;
  speed: number;
}

export interface VehicleInput {
  forward: number;
  steer: number;
  brake: boolean;
}

export interface Obstacle {
  x: number;
  z: number;
  hx: number;
  hz: number;
}

const ACCEL = 26;
const REVERSE = 14;
const BRAKE = 26;
const DRAG = 1.15;
const ROLL_RESIST = 0.9;
const TURN = 2.3;
const GRIP = 7.5;
const MAX_SPEED = 34;

export function createVehicleState(): VehicleState {
  return { px: 0, pz: 6, vx: 0, vz: 0, yaw: Math.PI, slip: 0, speed: 0 };
}

/** Axis-aligned overlap test for the car's footprint against static boxes. */
function hits(x: number, z: number, obstacles: Obstacle[], halfW = 1.3, halfL = 2.2) {
  const r = Math.max(halfW, halfL);
  for (const o of obstacles) {
    if (Math.abs(x - o.x) < o.hx + r && Math.abs(z - o.z) < o.hz + r) return true;
  }
  return false;
}

export function updateVehicle(
  s: VehicleState,
  input: VehicleInput,
  dt: number,
  obstacles: Obstacle[],
  bound: number,
) {
  const fdx = Math.sin(s.yaw);
  const fdz = Math.cos(s.yaw);
  const rdx = Math.cos(s.yaw);
  const rdz = -Math.sin(s.yaw);

  let vLong = s.vx * fdx + s.vz * fdz;
  let vLat = s.vx * rdx + s.vz * rdz;

  if (input.forward > 0) vLong += input.forward * ACCEL * dt;
  else if (input.forward < 0) vLong += input.forward * REVERSE * dt;
  else vLong -= Math.sign(vLong) * ROLL_RESIST * dt;

  if (input.brake && Math.abs(vLong) > 0.05) {
    vLong -= Math.sign(vLong) * BRAKE * dt;
  }

  vLong -= vLong * DRAG * dt;
  vLong = Math.max(-MAX_SPEED * 0.45, Math.min(MAX_SPEED, vLong));
  if (Math.abs(vLong) < 0.03) vLong = 0;

  const speedFactor = Math.min(Math.abs(vLong) / 8, 1);
  const dir = vLong >= 0 ? 1 : -1;
  s.yaw += input.steer * TURN * speedFactor * dir * dt;

  vLat *= Math.exp(-GRIP * dt);

  s.vx = fdx * vLong + rdx * vLat;
  s.vz = fdz * vLong + rdz * vLat;

  // Per-axis integration so the car slides along walls instead of sticking.
  const nx = s.px + s.vx * dt;
  if (!hits(nx, s.pz, obstacles)) s.px = nx;
  else s.vx *= -0.2;

  const nz = s.pz + s.vz * dt;
  if (!hits(s.px, nz, obstacles)) s.pz = nz;
  else s.vz *= -0.2;

  s.px = Math.max(-bound, Math.min(bound, s.px));
  s.pz = Math.max(-bound, Math.min(bound, s.pz));

  s.speed = Math.hypot(s.vx, s.vz);
  const va = Math.atan2(s.vx, s.vz);
  s.slip = s.speed > 0.4 && vLong > 0 ? Math.atan2(Math.sin(va - s.yaw), Math.cos(va - s.yaw)) : 0;
}
