import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { createGroundTexture } from "@/lib/textures";
import { WORLD_BOUND, zones } from "@/data/zones";

const SIZE = (WORLD_BOUND + 12) * 2;

export function Ground() {
  const texture = useMemo(() => createGroundTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  const roads = useMemo(
    () =>
      zones.map((z) => {
        const [x, zPos] = z.position;
        const length = Math.hypot(x, zPos);
        return {
          id: z.id,
          position: [x / 2, 0.02, zPos / 2] as [number, number, number],
          rotation: Math.atan2(x, zPos),
          length,
        };
      }),
    [],
  );

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[SIZE, SIZE]} />
        <meshStandardMaterial map={texture} color="#5f7f86" roughness={0.95} />
      </mesh>

      {/* Central plaza */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color="#2c3c47" roughness={0.8} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.04, 0]}>
        <ringGeometry args={[13, 13.6, 48]} />
        <meshStandardMaterial color="#4fd6e0" emissive="#2fb6c4" emissiveIntensity={0.6} />
      </mesh>

      {/* Spoke roads to each district */}
      {roads.map((r) => (
        <mesh
          key={r.id}
          rotation={new THREE.Euler(-Math.PI / 2, 0, -r.rotation)}
          position={r.position}
          receiveShadow
        >
          <planeGeometry args={[9, r.length]} />
          <meshStandardMaterial color="#2a3944" roughness={0.9} />
        </mesh>
      ))}

      {/* World edge barrier */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <ringGeometry args={[0, 0, 4]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}
