import * as THREE from "three";

/** Procedural ground texture: subtle noise speckle + faint grid lines. */
export function createGroundTexture(): THREE.Texture {
  const size = 512;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.Texture();

  ctx.fillStyle = "#1d2a33";
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * size;
    const y = Math.random() * size;
    const a = Math.random() * 0.06;
    ctx.fillStyle = `rgba(120,180,190,${a})`;
    ctx.fillRect(x, y, 2, 2);
  }

  ctx.strokeStyle = "rgba(90,200,215,0.09)";
  ctx.lineWidth = 1;
  for (let i = 0; i <= size; i += 64) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 24);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}
