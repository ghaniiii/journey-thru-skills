import { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { mulberry32 } from "@/lib/cityGen";
import { createGroundTexture } from "@/lib/textures";

interface Hill {
  x: number;
  z: number;
  r: number;
  h: number;
  c: string;
}

/** Continuous grass terrain with rolling hills and far mountains on the horizon. */
export function Ground() {
  const texture = useMemo(() => createGroundTexture(), []);
  useLayoutEffect(() => () => texture.dispose(), [texture]);

  const hills = useMemo<Hill[]>(() => {
    const rand = mulberry32(99);
    const out: Hill[] = [];
    const greens = ["#7fb35e", "#6fa552", "#88ba66", "#5f944a"];
    for (let i = 0; i < 34; i++) {
      const a = (i / 34) * Math.PI * 2 + rand() * 0.15;
      const d = 120 + rand() * 70;
      out.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, r: 22 + rand() * 26, h: 8 + rand() * 14, c: greens[i % 4] });
    }
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2 + rand() * 0.3;
      const d = 280 + rand() * 60;
      out.push({ x: Math.cos(a) * d, z: Math.sin(a) * d, r: 60 + rand() * 40, h: 40 + rand() * 45, c: "#7f9bab" });
    }
    return out;
  }, []);

  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[900, 900]} />
        <meshStandardMaterial map={texture} roughness={0.96} />
      </mesh>
      {hills.map((h, i) => (
        <mesh key={i} position={[h.x, 0, h.z]} scale={[h.r, h.h, h.r]} receiveShadow>
          <sphereGeometry args={[1, 9, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={h.c} roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
}
