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
        <meshStandardMaterial map={texture} color="#b8f08a" roughness={0.95} />
      </mesh>

      {/* Central plaza */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[14, 48]} />
        <meshStandardMaterial color="#8d8a84" roughness={0.8} />
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
          <meshStandardMaterial color="#3a3d42" roughness={0.9} />
        </mesh>
      ))}
      {roads.map((r) => (
        <group key={`m-${r.id}`} position={[r.position[0], 0.035, r.position[2]]} rotation-y={r.rotation}>
          {[-4.2, 4.2].map((x) => (
            <mesh key={x} position={[x, 0, 0]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[0.25, r.length]} />
              <meshStandardMaterial color="#e8e6de" roughness={0.7} />
            </mesh>
          ))}
          {[-4.8, 4.8].map((x) => (
            <mesh key={`c${x}`} position={[x, 0.12, 0]}>
              <boxGeometry args={[0.6, 0.28, r.length]} />
              <meshStandardMaterial color="#b9b4a8" roughness={0.9} />
            </mesh>
          ))}
          {Array.from({ length: Math.floor((r.length - 16) / 5) }, (_, i) => (
            <mesh
              key={`d${i}`}
              position={[0, 0, -r.length / 2 + 15 + i * 5]}
              rotation-x={-Math.PI / 2}
            >
              <planeGeometry args={[0.28, 2.4]} />
              <meshStandardMaterial color="#f2c14e" roughness={0.6} />
            </mesh>
          ))}
        </group>
      ))}

      {/* World edge barrier */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]}>
        <ringGeometry args={[0, 0, 4]} />
        <meshBasicMaterial visible={false} />
      </mesh>
    </group>
  );
}
