import { useGLTF, useTexture } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import truckAsset from "@/assets/offroad-4x4.glb.asset.json";
import colormapAsset from "@/assets/truck-colormap.png.asset.json";

/** CC0 Kenney 4x4 (logo-free). Its colour atlas ships separately, so we apply it here. */
export function TruckModel() {
  const { scene } = useGLTF(truckAsset.url);
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
    <group scale={1.62}>
      <primitive object={truck} />
    </group>
  );
}

useGLTF.preload(truckAsset.url);
