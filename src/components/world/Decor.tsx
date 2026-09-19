import { Instance, Instances } from "@react-three/drei";
import { useMemo } from "react";
import { WORLD_BOUND, zones } from "@/data/zones";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Placed {
  position: [number, number, number];
  scale: number;
  rotation: number;
}

function scatter(count: number, seed: number, minRadius: number): Placed[] {
  const rand = mulberry32(seed);
  const out: Placed[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 12) {
    guard++;
    const x = (rand() * 2 - 1) * WORLD_BOUND;
    const z = (rand() * 2 - 1) * WORLD_BOUND;
    if (Math.hypot(x, z) < minRadius) continue;
    // Keep clear of district footprints and their roads.
    if (
      zones.some(
        (zone) =>
          Math.hypot(x - zone.position[0], z - zone.position[1]) <
          zone.radius + 3,
      )
    )
      continue;
    const angle = Math.abs(Math.atan2(x, z));
    const onSpoke = zones.some((zone) => {
      const zoneAngle = Math.atan2(zone.position[0], zone.position[1]);
      return Math.abs(Math.atan2(Math.sin(angle - Math.abs(zoneAngle)), Math.cos(angle - Math.abs(zoneAngle)))) < 0.09;
    });
    if (onSpoke) continue;
    out.push({
      position: [x, 0, z],
      scale: 0.7 + rand() * 0.9,
      rotation: rand() * Math.PI * 2,
    });
  }
  return out;
}

/** Instanced low-poly scenery: conifer-style trees and data pylons. */
export function Decor() {
  const trees = useMemo(() => scatter(90, 7, 18), []);
  const pylons = useMemo(() => scatter(26, 99, 24), []);

  return (
    <group>
      <Instances limit={120} castShadow>
        <coneGeometry args={[1.5, 4.5, 7]} />
        <meshStandardMaterial color="#2f6f5c" roughness={0.9} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.position[0], 2.4 * t.scale, t.position[2]]}
            scale={t.scale}
            rotation={[0, t.rotation, 0]}
          />
        ))}
      </Instances>

      <Instances limit={120}>
        <cylinderGeometry args={[0.35, 0.5, 1.4, 6]} />
        <meshStandardMaterial color="#3b2f2a" roughness={1} />
        {trees.map((t, i) => (
          <Instance
            key={i}
            position={[t.position[0], 0.7 * t.scale, t.position[2]]}
            scale={t.scale}
          />
        ))}
      </Instances>

      <Instances limit={40} castShadow>
        <boxGeometry args={[0.7, 6, 0.7]} />
        <meshStandardMaterial
          color="#22333d"
          emissive="#2fb6c4"
          emissiveIntensity={0.25}
          roughness={0.5}
        />
        {pylons.map((p, i) => (
          <Instance
            key={i}
            position={[p.position[0], 3 * p.scale, p.position[2]]}
            scale={[1, p.scale, 1]}
            rotation={[0, p.rotation, 0]}
          />
        ))}
      </Instances>
    </group>
  );
}
