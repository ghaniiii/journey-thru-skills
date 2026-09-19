import { Environment, Lightformer } from "@react-three/drei";
import { Decor } from "@/components/world/Decor";
import { Ground } from "@/components/world/Ground";
import { Landmark } from "@/components/world/Landmark";
import { Plaza } from "@/components/world/Plaza";
import { Vehicle } from "@/components/vehicle/Vehicle";
import { zones } from "@/data/zones";

export function World({ lowQuality }: { lowQuality: boolean }) {
  return (
    <>
      <color attach="background" args={["#0b141b"]} />
      <fog attach="fog" args={["#0b141b", 55, 165]} />

      <hemisphereLight args={["#9fd8e6", "#1b2a33", 0.55]} />
      <directionalLight
        position={[28, 42, 18]}
        intensity={1.5}
        castShadow={!lowQuality}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-left={-70}
        shadow-camera-right={70}
        shadow-camera-top={70}
        shadow-camera-bottom={-70}
      />

      <Environment resolution={64}>
        <Lightformer intensity={1.6} position={[0, 8, 0]} scale={[14, 14, 1]} />
        <Lightformer
          intensity={0.8}
          color="#7fd1f5"
          position={[-8, 3, -6]}
          rotation-y={Math.PI / 2}
          scale={[24, 3, 1]}
        />
        <Lightformer
          intensity={0.6}
          color="#f2a33c"
          position={[8, 2, 6]}
          rotation-y={-Math.PI / 2}
          scale={[24, 2, 1]}
        />
      </Environment>

      <Ground />
      <Plaza />
      {!lowQuality && <Decor />}
      {zones.map((zone) => (
        <Landmark key={zone.id} zone={zone} />
      ))}
      <Vehicle />
    </>
  );
}
