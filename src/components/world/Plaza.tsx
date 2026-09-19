import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";
import { portfolio } from "@/data/portfolio";
import { eggPosition } from "@/data/zones";
import { useGameStore } from "@/store/useGameStore";

/** Spawn area: welcome sign, hovering marker, and the hidden easter egg. */
export function Plaza() {
  const markerRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (markerRef.current) {
      markerRef.current.rotation.y = clock.elapsedTime * 0.6;
      markerRef.current.position.y = 7 + Math.sin(clock.elapsedTime) * 0.3;
    }
  });

  return (
    <group>
      <mesh ref={markerRef} position={[0, 7, 0]} castShadow>
        <icosahedronGeometry args={[1.4, 0]} />
        <meshStandardMaterial
          color="#4fd6e0"
          emissive="#2fb6c4"
          emissiveIntensity={0.8}
          roughness={0.25}
          metalness={0.5}
        />
      </mesh>

      <mesh position={[0, 3.2, 0]} castShadow>
        <cylinderGeometry args={[0.35, 0.55, 6.4, 10]} />
        <meshStandardMaterial color="#25333c" roughness={0.7} />
      </mesh>

      <Html position={[0, 10.2, 0]} center distanceFactor={30} wrapperClass="pointer-events-none">
        <div className="plaza-sign">
          <span className="plaza-sign__name">{portfolio.personal.name}</span>
          <span className="plaza-sign__title">{portfolio.personal.title}</span>
          <span className="plaza-sign__hint">
            Drive out along any road to explore · Press E at a landmark
          </span>
        </div>
      </Html>

      <EasterEgg />
    </group>
  );
}

function EasterEgg() {
  const ref = useRef<THREE.Mesh>(null);
  const found = useGameStore((s) => s.eggFound);

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = clock.elapsedTime * 1.2;
  });

  return (
    <group position={[eggPosition[0], 0, eggPosition[1]]}>
      <mesh ref={ref} position={[0, 1.6, 0]} castShadow>
        <dodecahedronGeometry args={[1.2, 0]} />
        <meshStandardMaterial
          color="#ffd166"
          emissive="#ff9f43"
          emissiveIntensity={found ? 1.4 : 0.4}
          metalness={0.6}
          roughness={0.25}
        />
      </mesh>
      {found && (
        <Html position={[0, 4, 0]} center distanceFactor={24} wrapperClass="pointer-events-none">
          <div className="zone-sign" style={{ borderColor: "#ffd166" }}>
            <span className="zone-sign__label" style={{ color: "#ffd166" }}>
              // TODO: sleep
            </span>
            <span className="zone-sign__hint">You found the hidden commit.</span>
          </div>
        </Html>
      )}
    </group>
  );
}
