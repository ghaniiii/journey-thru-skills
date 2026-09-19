import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useKeyboard } from "@/hooks/useKeyboard";
import { useGameStore } from "@/store/useGameStore";
import {
  createVehicleState,
  updateVehicle,
  type Obstacle,
} from "@/lib/vehiclePhysics";
import { updateEngine } from "@/lib/audio";
import { WORLD_BOUND, eggPosition, zones } from "@/data/zones";
import type { SectionId } from "@/data/portfolio";

const idealOffset = new THREE.Vector3(0, 6.2, -13);
const idealLookAt = new THREE.Vector3(0, 1.8, 10);
const _offset = new THREE.Vector3();
const _look = new THREE.Vector3();
const _lookSmooth = new THREE.Vector3();

const BODY_COLOR = "#f2a33c";
const CABIN_COLOR = "#16222f";

export function Vehicle() {
  const bodyRef = useRef<THREE.Group>(null);
  const leanRef = useRef<THREE.Group>(null);
  const wheelsRef = useRef<THREE.Group[]>([]);
  const keys = useKeyboard();
  const state = useRef(createVehicleState());

  const obstacles = useMemo<Obstacle[]>(
    () =>
      zones.map((z) => ({
        x: z.position[0],
        z: z.position[1],
        hx: z.size[0] / 2 + 0.6,
        hz: z.size[2] / 2 + 0.6,
      })),
    [],
  );

  useFrame(({ camera }, rawDelta) => {
    const dt = Math.min(rawDelta, 0.05);
    const s = state.current;
    const store = useGameStore.getState();
    const k = keys.current;
    const panelOpen = store.openSection !== null;
    const touch = store.touch;

    const forward = panelOpen
      ? 0
      : Math.max(
          -1,
          Math.min(
            1,
            (k.has("KeyW") || k.has("ArrowUp") ? 1 : 0) -
              (k.has("KeyS") || k.has("ArrowDown") ? 1 : 0) +
              touch.forward,
          ),
        );
    const steer = panelOpen
      ? 0
      : Math.max(
          -1,
          Math.min(
            1,
            (k.has("KeyA") || k.has("ArrowLeft") ? 1 : 0) -
              (k.has("KeyD") || k.has("ArrowRight") ? 1 : 0) +
              touch.steer,
          ),
        );

    updateVehicle(
      s,
      { forward, steer, brake: (!panelOpen && k.has("Space")) || touch.brake },
      dt,
      obstacles,
      WORLD_BOUND,
    );

    const body = bodyRef.current;
    if (!body) return;
    body.position.set(s.px, 0.45, s.pz);
    body.rotation.y = s.yaw;

    if (leanRef.current) {
      const targetRoll = -s.slip * 0.18;
      leanRef.current.rotation.z +=
        (targetRoll - leanRef.current.rotation.z) * 6 * dt;
    }

    const spin = s.speed * dt * 2.2;
    for (const wheel of wheelsRef.current) {
      if (wheel) wheel.rotation.x -= spin;
    }

    // Chase camera
    const t = 1 - Math.exp(-4 * dt);
    _offset.copy(idealOffset).applyQuaternion(body.quaternion).add(body.position);
    _offset.y = Math.max(3.2, _offset.y);
    camera.position.lerp(_offset, t);
    _look.copy(idealLookAt).applyQuaternion(body.quaternion).add(body.position);
    _lookSmooth.lerp(_look, t);
    camera.lookAt(_lookSmooth);

    // Proximity detection for the interaction system
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

    if (
      !store.eggFound &&
      Math.hypot(s.px - eggPosition[0], s.pz - eggPosition[1]) < 7
    ) {
      store.findEgg();
    }

    if (!store.muted) updateEngine(Math.min(s.speed / 30, 1));
  });

  return (
    <group ref={bodyRef}>
      <group ref={leanRef}>
        {/* chassis */}
        <mesh castShadow position={[0, 0.35, 0]}>
          <boxGeometry args={[2.1, 0.65, 4]} />
          <meshStandardMaterial color={BODY_COLOR} metalness={0.35} roughness={0.35} />
        </mesh>
        {/* cabin */}
        <mesh castShadow position={[0, 0.95, -0.15]}>
          <boxGeometry args={[1.65, 0.7, 1.9]} />
          <meshStandardMaterial
            color={CABIN_COLOR}
            metalness={0.6}
            roughness={0.15}
          />
        </mesh>
        {/* nose spoiler */}
        <mesh castShadow position={[0, 0.2, 2.05]}>
          <boxGeometry args={[2.2, 0.22, 0.5]} />
          <meshStandardMaterial color="#12202c" roughness={0.6} />
        </mesh>
        {/* headlights */}
        {[-0.65, 0.65].map((x) => (
          <mesh key={x} position={[x, 0.45, 2.02]}>
            <boxGeometry args={[0.45, 0.18, 0.12]} />
            <meshStandardMaterial
              color="#fff3d0"
              emissive="#ffd88a"
              emissiveIntensity={1.4}
            />
          </mesh>
        ))}
        {/* tail lights */}
        {[-0.7, 0.7].map((x) => (
          <mesh key={x} position={[x, 0.5, -2.02]}>
            <boxGeometry args={[0.4, 0.16, 0.1]} />
            <meshStandardMaterial
              color="#ff6b6b"
              emissive="#ff3b3b"
              emissiveIntensity={1.1}
            />
          </mesh>
        ))}
        {[
          [-1.05, 1.3],
          [1.05, 1.3],
          [-1.05, -1.3],
          [1.05, -1.3],
        ].map(([x, z], i) => (
          <group
            key={`${x}-${z}`}
            position={[x, 0.05, z]}
            rotation={[0, 0, Math.PI / 2]}
          >
            <group
              ref={(el) => {
                if (el) wheelsRef.current[i] = el;
              }}
            >
              <mesh castShadow>
                <cylinderGeometry args={[0.52, 0.52, 0.38, 14]} />
                <meshStandardMaterial color="#121820" roughness={0.85} />
              </mesh>
              <mesh position={[0, 0.2, 0]}>
                <cylinderGeometry args={[0.24, 0.24, 0.04, 10]} />
                <meshStandardMaterial
                  color="#9fb4c4"
                  metalness={0.7}
                  roughness={0.3}
                />
              </mesh>
            </group>
          </group>
        ))}
      </group>
    </group>
  );
}
