import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { WORLD_BOUND, zones } from "@/data/zones";
import oak from "@/assets/nature/tree_oak.glb.asset.json";
import pine from "@/assets/nature/tree_pineRoundA.glb.asset.json";
import detailed from "@/assets/nature/tree_detailed.glb.asset.json";
import fat from "@/assets/nature/tree_fat.glb.asset.json";
import bush from "@/assets/nature/plant_bushLarge.glb.asset.json";
import rock from "@/assets/nature/rock_largeA.glb.asset.json";
import flower from "@/assets/nature/flower_redA.glb.asset.json";
import grass from "@/assets/nature/grass_large.glb.asset.json";

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
  x: number;
  z: number;
  scale: number;
  rotation: number;
}

function scatter(count: number, seed: number, minRadius: number, clearance = 3): Placed[] {
  const rand = mulberry32(seed);
  const out: Placed[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 15) {
    guard++;
    const x = (rand() * 2 - 1) * WORLD_BOUND;
    const z = (rand() * 2 - 1) * WORLD_BOUND;
    if (Math.hypot(x, z) < minRadius) continue;
    if (zones.some((zn) => Math.hypot(x - zn.position[0], z - zn.position[1]) < zn.radius + clearance))
      continue;
    // Keep clear of spoke roads (distance from point to each road segment).
    const onRoad = zones.some((zn) => {
      const [ax, az] = zn.position;
      const len2 = ax * ax + az * az;
      const t = Math.max(0, Math.min(1, (x * ax + z * az) / len2));
      return Math.hypot(x - ax * t, z - az * t) < 7 + clearance;
    });
    if (onRoad) continue;
    out.push({ x, z, scale: 0.75 + rand() * 0.6, rotation: rand() * Math.PI * 2 });
  }
  return out;
}

/** Instances every mesh of a small GLB at the given placements. */
function InstancedModel({
  url,
  items,
  baseScale,
  shadows,
}: {
  url: string;
  items: Placed[];
  baseScale: number;
  shadows: boolean;
}) {
  const { scene } = useGLTF(url);
  const parts = useMemo(() => {
    scene.updateMatrixWorld(true);
    const list: { geometry: THREE.BufferGeometry; material: THREE.Material }[] = [];
    scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        const g = (o.geometry as THREE.BufferGeometry).clone();
        g.applyMatrix4(o.matrixWorld);
        list.push({ geometry: g, material: o.material as THREE.Material });
      }
    });
    return list;
  }, [scene]);

  return (
    <>
      {parts.map((p, i) => (
        <Batch key={i} part={p} items={items} baseScale={baseScale} shadows={shadows} />
      ))}
    </>
  );
}

const _m = new THREE.Matrix4();
const _q = new THREE.Quaternion();
const _p = new THREE.Vector3();
const _s = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);

function Batch({
  part,
  items,
  baseScale,
  shadows,
}: {
  part: { geometry: THREE.BufferGeometry; material: THREE.Material };
  items: Placed[];
  baseScale: number;
  shadows: boolean;
}) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const mesh = ref.current;
    if (!mesh) return;
    items.forEach((it, i) => {
      _q.setFromAxisAngle(_up, it.rotation);
      _p.set(it.x, 0, it.z);
      _s.setScalar(it.scale * baseScale);
      mesh.setMatrixAt(i, _m.compose(_p, _q, _s));
    });
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [items, baseScale]);
  useLayoutEffect(() => () => part.geometry.dispose(), [part]);

  return (
    <instancedMesh
      ref={ref}
      args={[part.geometry, part.material, items.length]}
      castShadow={shadows}
      receiveShadow
    />
  );
}

/** CC0 Kenney Nature Kit scenery, fully instanced (one draw call per model part). */
export function Decor() {
  const sets = useMemo(
    () => [
      { url: oak.url, items: scatter(30, 7, 20), scale: 5, shadows: true },
      { url: pine.url, items: scatter(34, 11, 20), scale: 5.5, shadows: true },
      { url: detailed.url, items: scatter(22, 23, 20), scale: 5, shadows: true },
      { url: fat.url, items: scatter(18, 31, 20), scale: 5, shadows: true },
      { url: bush.url, items: scatter(50, 41, 16, 1), scale: 3.2, shadows: false },
      { url: rock.url, items: scatter(22, 53, 18, 1.5), scale: 3.5, shadows: true },
      { url: flower.url, items: scatter(80, 61, 15, 0.5), scale: 3, shadows: false },
      { url: grass.url, items: scatter(140, 71, 15, 0.3), scale: 3.5, shadows: false },
    ],
    [],
  );

  return (
    <group>
      {sets.map((s) => (
        <InstancedModel key={s.url} url={s.url} items={s.items} baseScale={s.scale} shadows={s.shadows} />
      ))}
    </group>
  );
}
