import { useFrame } from "@react-three/fiber";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useGameStore } from "@/store/useGameStore";
import { createVehicleState, updateVehicle, type Obstacle } from "@/lib/vehiclePhysics";
import { playHydraulicJump, playNitroIgnition, updateEngine } from "@/lib/audio";
import { WORLD_BOUND, eggPosition, zones } from "@/data/zones";
import { city } from "@/lib/cityGen";
import type { SectionId } from "@/data/portfolio";
import { TruckModel } from "./TruckModel";
import { GARAGE_POS, GARAGE_RADIUS, findCar } from "@/data/cars";

const idealOffset = new THREE.Vector3(0, 6.2, -13);
const idealLookAt = new THREE.Vector3(0, 1.8, 10);
const _offset = new THREE.Vector3();
const _look = new THREE.Vector3();
const _lookSmooth = new THREE.Vector3();
const _exhaust = new THREE.Vector3();
const _matrix = new THREE.Matrix4();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();
const _pos = new THREE.Vector3();

const PARTICLES = 90;
const PARTICLE_LIFE = 0.55;
const EXHAUSTS: [number, number, number][] = [
  [-0.55, 0.45, -2.3],
  [0.55, 0.45, -2.3],
];

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  age: number;
}

export function Vehicle() {
  const car = findCar(useGameStore((st) => st.carId));
  const bodyRef = useRef<THREE.Group>(null);
  const leanRef = useRef<THREE.Group>(null);
  const trailRef = useRef<THREE.InstancedMesh>(null);
  const keys = useKeyboard();
  const state = useRef(createVehicleState());
  const nitroWas = useRef(false);
  const particles = useRef<Particle[]>(
    Array.from({ length: PARTICLES }, () => ({ x: 0, y: -99, z: 0, vx: 0, vy: 0, vz: 0, age: 99 })),
  );
  const nextParticle = useRef(0);
  const spawnAcc = useRef(0);

  const obstacles = useMemo<Obstacle[]>(
    () => [
      ...zones.map((z) => ({
        x: z.position[0],
        z: z.position[1],
        hx: z.size[0] / 2 + 0.1,
        hz: z.size[2] / 2 + 0.1,
      })),
      ...city.obstacles,
    ],
    [],
  );

  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const s = state.current;
    const store = useGameStore.getState();
    const k = keys.current;
    const locked = store.openSection !== null || !store.entered;
    const touch = store.touch;
    const clamp = (v: number) => Math.max(-1, Math.min(1, v));

    const forward = locked
      ? 0
      : clamp(
          (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) -
            (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0) +
            touch.forward,
        );
    const steer = locked
      ? 0
      : clamp(
          (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0) -
            (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) +
            touch.steer,
        );
    const nitro = !locked && (k.has("ShiftLeft") || k.has("ShiftRight") || touch.nitro);
    const jump = !locked && (k.has("Space") || touch.jump);

    const wasGrounded = s.grounded;
    updateVehicle(s, { forward, steer, jump, nitro }, dt, obstacles, WORLD_BOUND);
    if (!store.muted) {
      if (wasGrounded && !s.grounded) playHydraulicJump();
      const boosting = nitro && forward > 0;
      if (boosting && !nitroWas.current) playNitroIgnition();
    }
    const boosting = nitro && forward > 0;
    nitroWas.current = boosting;

    const body = bodyRef.current;
    if (!body) return;
    body.position.set(s.px, s.py, s.pz);
    body.rotation.y = s.yaw;

    if (leanRef.current) {
      const lean = leanRef.current;
      const targetRoll = -s.slip * 0.18;
      lean.rotation.z += (targetRoll - lean.rotation.z) * (1 - Math.exp(-6 * dt));
      // hydraulic pitch: nose up on the way up, level out on landing
      const targetPitch = s.grounded ? (boosting ? -0.05 : 0) : -s.vy * 0.02;
      lean.rotation.x += (targetPitch - lean.rotation.x) * (1 - Math.exp(-8 * dt));
    }

    // Nitro exhaust trail
    const pool = particles.current;
    if (boosting) {
      spawnAcc.current += dt * 70;
      while (spawnAcc.current >= 1) {
        spawnAcc.current -= 1;
        for (const e of EXHAUSTS) {
          const p = pool[nextParticle.current]!;
          nextParticle.current = (nextParticle.current + 1) % PARTICLES;
          _exhaust.set(e[0], e[1], e[2]).applyMatrix4(body.matrixWorld);
          p.x = _exhaust.x;
          p.y = _exhaust.y;
          p.z = _exhaust.z;
          p.vx = -Math.sin(s.yaw) * 6 + (Math.random() - 0.5);
          p.vz = -Math.cos(s.yaw) * 6 + (Math.random() - 0.5);
          p.vy = 0.6 + Math.random() * 0.6;
          p.age = 0;
        }
      }
    }
    const trail = trailRef.current;
    if (trail) {
      for (let i = 0; i < PARTICLES; i++) {
        const p = pool[i]!;
        p.age += dt;
        const life = p.age / PARTICLE_LIFE;
        if (life >= 1) {
          _scale.setScalar(0);
        } else {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.z += p.vz * dt;
          _scale.setScalar(0.25 + life * 0.55);
        }
        _pos.set(p.x, p.y, p.z);
        _matrix.compose(_pos, _quat, _scale);
        trail.setMatrixAt(i, _matrix);
      }
      trail.instanceMatrix.needsUpdate = true;
    }

    // Chase camera
    const t = 1 - Math.exp(-4 * dt);
    _offset.copy(idealOffset);
    if (boosting) _offset.z -= 2;
    _offset.applyQuaternion(body.quaternion).add(body.position);
    _offset.y = Math.max(3.2, _offset.y);
    camera.position.lerp(_offset, t);
    _look.copy(idealLookAt).applyQuaternion(body.quaternion).add(body.position);
    _lookSmooth.lerp(_look, t);
    camera.lookAt(_lookSmooth);

    let nearest: SectionId | null = null;
    let nearestDist = Infinity;
    for (const z of zones) {
      const d = Math.hypot(s.px - z.position[0], s.pz - z.position[1]);
      if (d < z.radius && d < nearestDist) {
        nearest = z.id;
        nearestDist = d;
      }
    }
    store.setNearby(nearest);
    store.setNearGarage(Math.hypot(s.px - GARAGE_POS[0], s.pz - GARAGE_POS[1]) < GARAGE_RADIUS);

    if (!store.eggFound && Math.hypot(s.px - eggPosition[0], s.pz - eggPosition[1]) < 7) {
      store.findEgg();
    }

    if (!store.muted) updateEngine(Math.min(s.speed / 30, 1));
  });

  return (
    <>
      <group ref={bodyRef}>
        <group ref={leanRef}>
          <Suspense
            fallback={
              <mesh position={[0, 0.8, 0]}>
                <boxGeometry args={[2, 1.2, 4]} />
                <meshStandardMaterial color="#3a4a55" />
              </mesh>
            }
          >
            <TruckModel key={car.id} url={car.url} scale={car.scale} />
          </Suspense>
          {[-0.7, 0.7].map((x) => (
            <mesh key={x} position={[x, 0.85, 2.25]}>
              <boxGeometry args={[0.4, 0.14, 0.05]} />
              <meshStandardMaterial color="#fff3d0" emissive="#ffd88a" emissiveIntensity={1.6} />
            </mesh>
          ))}
        </group>
      </group>
      <instancedMesh ref={trailRef} args={[undefined, undefined, PARTICLES]} frustumCulled={false}>
        <sphereGeometry args={[0.5, 8, 6]} />
        <meshBasicMaterial
          color="#4fb8ff"
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </instancedMesh>
    </>
  );
}
