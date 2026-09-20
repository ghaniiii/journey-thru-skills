import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import type { Zone } from "@/data/zones";
import { useGameStore } from "@/store/useGameStore";

interface Props {
  zone: Zone;
}

/** One portfolio district: a distinct building + floating sign + interaction ring. */
export function Landmark({ zone }: Props) {
  const [x, z] = zone.position;
  const [w, h, d] = zone.size;
  const accentRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const nearby = useGameStore((s) => s.nearby === zone.id);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (accentRef.current) accentRef.current.rotation.y = t * 0.4;
    if (ringRef.current) {
      const s = 1 + Math.sin(t * 2) * 0.02;
      ringRef.current.scale.set(s, s, s);
      const mat = ringRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = nearby ? 0.75 : 0.28;
    }
  });

  return (
    <group position={[x, 0, z]}>
      {/* plinth */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <boxGeometry args={[w + 4, 0.3, d + 4]} />
        <meshStandardMaterial color="#2b3a45" roughness={0.9} />
      </mesh>

      <BuildingShape zone={zone} />

      {/* rotating accent element, distinct per zone */}
      <mesh ref={accentRef} position={[0, h + 1.6, 0]} castShadow>
        {zone.kind === "monument" ? (
          <octahedronGeometry args={[1.1, 0]} />
        ) : zone.kind === "lab" ? (
          <torusKnotGeometry args={[0.7, 0.22, 60, 8]} />
        ) : (
          <torusGeometry args={[0.9, 0.16, 8, 24]} />
        )}
        <meshStandardMaterial
          color={zone.color}
          emissive={zone.color}
          emissiveIntensity={0.7}
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* interaction radius ring on the ground */}
      <mesh ref={ringRef} rotation-x={-Math.PI / 2} position={[0, 0.06, 0]}>
        <ringGeometry args={[zone.radius - 0.5, zone.radius, 48]} />
        <meshBasicMaterial color={zone.color} transparent opacity={0.3} />
      </mesh>

      <Html
        position={[0, h + 3.4, 0]}
        center
        distanceFactor={26}
        zIndexRange={[20, 0]}
        wrapperClass="pointer-events-none"
      >
        <div className="zone-sign" style={{ borderColor: zone.color }}>
          <span className="zone-sign__label" style={{ color: zone.color }}>
            {zone.label}
          </span>
          <span className="zone-sign__hint">{zone.hint}</span>
        </div>
      </Html>
    </group>
  );
}

function BuildingShape({ zone }: { zone: Zone }) {
  const [w, h, d] = zone.size;
  const body = (
    <mesh position={[0, h / 2 + 0.3, 0]} castShadow receiveShadow>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#35505f" roughness={0.65} metalness={0.15} />
    </mesh>
  );

  const stripes = Array.from({ length: Math.max(2, Math.floor(h / 3)) }).map((_, i) => (
    <mesh key={i} position={[0, 1.6 + i * 3, d / 2 + 0.03]}>
      <planeGeometry args={[w * 0.72, 0.5]} />
      <meshStandardMaterial color={zone.color} emissive={zone.color} emissiveIntensity={0.55} />
    </mesh>
  ));

  return (
    <group>
      {body}
      {stripes}
      {zone.kind === "campus" && (
        <>
          <mesh position={[0, h + 1.1, 0]} castShadow>
            <coneGeometry args={[w * 0.62, 2.2, 4]} />
            <meshStandardMaterial color="#223543" roughness={0.7} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[(s * w) / 2 + s * 1.6, 2.3, d / 2 + 1]} castShadow>
              <cylinderGeometry args={[0.45, 0.45, 4.6, 12]} />
              <meshStandardMaterial color="#cfd9dd" roughness={0.8} />
            </mesh>
          ))}
        </>
      )}
      {zone.kind === "lab" && (
        <mesh position={[0, h + 1.2, 0]} castShadow>
          <sphereGeometry args={[w * 0.42, 20, 12]} />
          <meshStandardMaterial
            color="#cdeee0"
            metalness={0.3}
            roughness={0.2}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}
      {zone.kind === "tower" && (
        <mesh position={[0, h + 2.2, 0]} castShadow>
          <cylinderGeometry args={[0.18, 0.18, 4.4, 8]} />
          <meshStandardMaterial color="#9fb4c4" metalness={0.7} roughness={0.3} />
        </mesh>
      )}
      {zone.kind === "monument" &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * (w / 2 + 1.4), 1.6, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.8, 3.2, 12]} />
            <meshStandardMaterial color="#ffd166" metalness={0.75} roughness={0.25} />
          </mesh>
        ))}
      {zone.kind === "beacon" && (
        <mesh position={[0, h + 3.2, 0]}>
          <cylinderGeometry args={[0.05, 1.8, 6, 12, 1, true]} />
          <meshBasicMaterial
            color={zone.color}
            transparent
            opacity={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
      {zone.kind === "studio" &&
        [-1, 1].map((s) => (
          <mesh key={s} position={[s * (w / 2 - 1), h + 0.9, 0]} castShadow>
            <boxGeometry args={[1.4, 1.4, d * 0.8]} />
            <meshStandardMaterial color="#2b4250" roughness={0.6} />
          </mesh>
        ))}
      {zone.kind === "office" && (
        <mesh position={[0, h + 0.7, 0]} castShadow>
          <boxGeometry args={[w * 0.6, 1.2, d * 0.6]} />
          <meshStandardMaterial color="#223543" roughness={0.7} />
        </mesh>
      )}
    </group>
  );
}
