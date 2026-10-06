import { useGLTF } from "@react-three/drei";
import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { cellCenter } from "@/data/cityLayout";
import { city, isFree, mulberry32 } from "@/lib/cityGen";
import oak from "@/assets/nature/tree_oak.glb.asset.json";
import pine from "@/assets/nature/tree_pineRoundA.glb.asset.json";
import detailed from "@/assets/nature/tree_detailed.glb.asset.json";
import fat from "@/assets/nature/tree_fat.glb.asset.json";
import bush from "@/assets/nature/plant_bushLarge.glb.asset.json";
import rock from "@/assets/nature/rock_largeA.glb.asset.json";
import flower from "@/assets/nature/flower_redA.glb.asset.json";
import grass from "@/assets/nature/grass_large.glb.asset.json";

interface Placed {
  x: number;
  z: number;
  scale: number;
  rotation: number;
  y?: number;
}

/** Natural cluster centres: the park, residential gardens, and countryside groves. */
const CLUSTERS: { x: number; z: number; spread: number }[] = (() => {
  const rand = mulberry32(5);
  const park = { x: cellCenter(0), z: cellCenter(0), spread: 7 };
  const list = [park, park, park, { x: cellCenter(1), z: cellCenter(0), spread: 6 }, { x: cellCenter(0), z: cellCenter(3), spread: 7 }];
  for (let i = 0; i < 28; i++) {
    const a = rand() * Math.PI * 2;
    const d = 74 + rand() * 50;
    list.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, spread: 10 + rand() * 8 });
  }
  return list;
})();

function scatter(count: number, seed: number, clearance: number): Placed[] {
  const rand = mulberry32(seed);
  const out: Placed[] = [];
  let guard = 0;
  while (out.length < count && guard < count * 20) {
    guard++;
    const c = CLUSTERS[Math.floor(rand() * CLUSTERS.length)]!;
    const x = c.x + (rand() + rand() - 1) * c.spread * 1.4;
    const z = c.z + (rand() + rand() - 1) * c.spread * 1.4;
    if (Math.hypot(x, z) > 150 || !isFree(x, z, clearance)) continue;
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
      _p.set(it.x, it.y ?? 0, it.z);
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
      { url: oak.url, items: scatter(60, 7, 1.5), scale: 5, shadows: true },
      { url: pine.url, items: scatter(80, 11, 1.5), scale: 5.5, shadows: true },
      { url: detailed.url, items: scatter(40, 23, 1.5), scale: 5, shadows: true },
      { url: fat.url, items: scatter(30, 31, 1.5), scale: 5, shadows: true },
      { url: bush.url, items: scatter(70, 41, 0.6), scale: 3.2, shadows: false },
      { url: rock.url, items: scatter(25, 53, 1), scale: 3.5, shadows: true },
      { url: flower.url, items: scatter(90, 61, 0.3), scale: 3, shadows: false },
      { url: grass.url, items: scatter(160, 71, 0.2), scale: 3.5, shadows: false },
    ],
    [],
  );

  const street = useMemo(() => {
    const urls = { oak: oak.url, detailed: detailed.url, fat: fat.url, bush: bush.url } as const;
    const base = { oak: 5, detailed: 5, fat: 5, bush: 3.2 } as const;
    return (Object.keys(urls) as (keyof typeof urls)[]).map((k) => ({
      key: `street-${k}`,
      url: urls[k],
      scale: base[k],
      items: city.streetTrees
        .filter((t) => t.kind === k)
        .map((t) => ({ x: t.x, z: t.z, y: t.y, scale: t.scale, rotation: t.rot })),
    }));
  }, []);

  return (
    <group>
      {street.map((s) => (
        <InstancedModel key={s.key} url={s.url} items={s.items} baseScale={s.scale} shadows />
      ))}
      {sets.map((s) => (
        <InstancedModel key={s.url} url={s.url} items={s.items} baseScale={s.scale} shadows={s.shadows} />
      ))}
    </group>
  );
}
