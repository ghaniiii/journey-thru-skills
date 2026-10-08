import { Html } from "@react-three/drei";
import { GARAGE_POS, GARAGE_RADIUS } from "@/data/cars";

/** Drive-on garage pad: a painted bay with a floating sign. No colliders. */
export function Garage() {
  return (
    <group position={[GARAGE_POS[0], 0, GARAGE_POS[1]]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0]} receiveShadow>
        <ringGeometry args={[GARAGE_RADIUS - 0.5, GARAGE_RADIUS - 0.2, 48]} />
        <meshBasicMaterial color="#f2a33c" toneMapped={false} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.045, 0]}>
        <circleGeometry args={[GARAGE_RADIUS - 0.5, 48]} />
        <meshStandardMaterial color="#2c2f34" roughness={0.6} transparent opacity={0.7} />
      </mesh>
      <Html position={[0, 4.5, 0]} center distanceFactor={24} wrapperClass="pointer-events-none">
        <div className="zone-sign" style={{ borderColor: "#f2a33c" }}>
          <span className="zone-sign__label" style={{ color: "#f2a33c" }}>
            GARAGE
          </span>
          <span className="zone-sign__hint">Park here to change your car</span>
        </div>
      </Html>
    </group>
  );
}
