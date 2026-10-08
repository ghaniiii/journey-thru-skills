import { Environment, Lightformer } from "@react-three/drei";
import { Decor } from "@/components/world/Decor";
import { City } from "@/components/world/City";
import { Ground } from "@/components/world/Ground";
import { Landmark } from "@/components/world/Landmark";
import { Plaza } from "@/components/world/Plaza";
import { Garage } from "@/components/world/Garage";
import { Vehicle } from "@/components/vehicle/Vehicle";
import { zones } from "@/data/zones";

export function World({ lowQuality }: { lowQuality: boolean }) {
  return (
    <>
      <color attach="background" args={["#b9d6e3"]} />
      <fog attach="fog" args={["#b9d6e3", 70, 260]} />

      <hemisphereLight args={["#dff1ff", "#5c7a45", 0.9]} />
      <directionalLight
        position={[28, 42, 18]}
        intensity={2.2}
        color="#fff1d6"
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
      <City />
      <Plaza />
      <Garage />
      {!lowQuality && <Decor />}
      {zones.map((zone) => (
        <Landmark key={zone.id} zone={zone} />
      ))}
      <Vehicle />
    </>
  );
}
