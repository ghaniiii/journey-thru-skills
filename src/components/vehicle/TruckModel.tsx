import { useGLTF } from "@react-three/drei";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import truckAsset from "@/assets/offroad-4x4.glb.asset.json";

export function TruckModel() {
  const { scene } = useGLTF(truckAsset.url);
  const truck = useMemo(() => scene.clone(true), [scene]);

  useEffect(() => {
    truck.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) {
          if (material instanceof THREE.MeshStandardMaterial) {
            material.roughness = Math.max(material.roughness, 0.32);
            material.metalness = Math.min(material.metalness, 0.62);
          }
        }
      }
    });
  }, [truck]);

  return (
    <group rotation-y={Math.PI} scale={1.62}>
      <primitive object={truck} />
    </group>
  );
}

useGLTF.preload(truckAsset.url);