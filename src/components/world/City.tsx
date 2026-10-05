import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { ISLAND_R, ROUNDABOUT_R } from "@/data/cityLayout";
import { city, type Part } from "@/lib/cityGen";

const _m = new THREE.Matrix4();
const _p = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _s = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _c = new THREE.Color();

/** Renders a list of parts as one instanced draw call with per-instance colour. */
function Batch({
  items,
  geometry,
  cast = true,
  children,
}: {
  items: Part[];
  geometry: THREE.BufferGeometry;
  cast?: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((it, i) => {
      _q.setFromAxisAngle(_up, it.r ?? 0);
      _p.set(it.p[0], it.p[1], it.p[2]);
      _s.set(it.s[0], it.s[1], it.s[2]);
      mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
      mesh.setColorAt(i, _c.set(it.c));
    });
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[geometry, undefined, items.length]} castShadow={cast} receiveShadow>
      {children}
    </instancedMesh>
  );
}

/** The whole planned city: roads, blocks, buildings, street furniture. */
export function City() {
  const geo = useMemo(
    () => ({
      box: new THREE.BoxGeometry(1, 1, 1),
      roof: new THREE.ConeGeometry(Math.SQRT1_2, 1, 4),
    }),
    [],
  );
  useLayoutEffect(
    () => () => {
      geo.box.dispose();
      geo.roof.dispose();
    },
    [geo],
  );

  return (
    <group>
      <Batch items={city.flat} geometry={geo.box} cast={false}>
        <meshStandardMaterial roughness={0.92} />
      </Batch>
      <Batch items={city.paint} geometry={geo.box} cast={false}>
        <meshStandardMaterial roughness={0.6} />
      </Batch>
      <Batch items={city.solids} geometry={geo.box}>
        <meshStandardMaterial roughness={0.78} />
      </Batch>
      <Batch items={city.glass} geometry={geo.box}>
        <meshStandardMaterial roughness={0.15} metalness={0.6} />
      </Batch>
      <Batch items={city.roofs} geometry={geo.roof}>
        <meshStandardMaterial roughness={0.7} flatShading />
      </Batch>
      <Batch items={city.glow} geometry={geo.box} cast={false}>
        <meshBasicMaterial toneMapped={false} />
      </Batch>

      {/* Roundabout at the city centre */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} receiveShadow>
        <circleGeometry args={[ROUNDABOUT_R, 48]} />
        <meshStandardMaterial color="#3b3e44" roughness={0.92} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.045, 0]}>
        <ringGeometry args={[ROUNDABOUT_R - 0.6, ROUNDABOUT_R - 0.42, 64]} />
        <meshStandardMaterial color="#ecebe4" />
      </mesh>
      <mesh position={[0, 0.15, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[ISLAND_R, ISLAND_R + 0.2, 0.3, 40]} />
        <meshStandardMaterial color="#c4beb1" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.31, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[ISLAND_R - 0.6, 40]} />
        <meshStandardMaterial color="#79b85a" roughness={0.95} />
      </mesh>

      {city.ponds.map((p) => (
        <mesh key={`${p.x},${p.z}`} rotation-x={-Math.PI / 2} position={[p.x, 0.19, p.z]}>
          <circleGeometry args={[p.r, 28]} />
          <meshStandardMaterial color="#4f93b5" roughness={0.1} metalness={0.3} />
        </mesh>
      ))}
    </group>
  );
}
