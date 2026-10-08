import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { cars } from "@/data/cars";
import colormapAsset from "@/assets/truck-colormap.png.asset.json";

/** CC0 Kenney Car Kit vehicle (logo-free). Its colour atlas ships separately, so we apply it here. */
export function TruckModel({ url, scale }: { url: string; scale: number }) {
  const { scene } = useGLTF(url);
  const colormap = useTexture(colormapAsset.url);
  const truck = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    colormap.flipY = false;
    colormap.colorSpace = THREE.SRGBColorSpace;
    colormap.magFilter = THREE.NearestFilter;
    colormap.needsUpdate = true;
    truck.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.material = new THREE.MeshStandardMaterial({
          map: colormap,
          roughness: 0.45,
          metalness: 0.25,
        });
      }
    });
  }, [truck, colormap]);

  return (
    <group scale={scale}>
      <primitive object={truck} />
    </group>
  );
}

for (const c of cars) useGLTF.preload(c.url);
