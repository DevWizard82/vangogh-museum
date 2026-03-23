import { useRef, useEffect } from "react";
import { useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function FramedArtwork({
  position = [0, 2, -5],
  rotation = [0, 0, 0],
  imageUrl = "/textures/starry_night.jpg",
  width = 2.8,
  height = 2.0,
  frameDepth = 0.12,
  frameColor = "#3d1f07",
  title = "",
  isHovered = false,
  registerMesh,
  unregisterMesh,
}) {
  const frameRef = useRef();
  const canvasRef = useRef();
  const texture = useTexture(imageUrl);
  texture.colorSpace = THREE.SRGBColorSpace;

  const BORDER = 0.14;
  const fw = width + BORDER * 2;
  const fh = height + BORDER * 2;

  // ── Register canvas mesh with the global raycaster ──────────────────────
  useEffect(() => {
    const mesh = canvasRef.current;
    if (!mesh) return;

    // Store lookup data directly on the mesh so the raycaster can read it
    mesh.userData = { imageUrl, title };

    registerMesh?.(mesh);
    return () => unregisterMesh?.(mesh);
  }, [imageUrl, title, registerMesh, unregisterMesh]);

  // ── Frame emissive glow when aimed at ───────────────────────────────────
  useFrame(({ clock }) => {
    if (!frameRef.current) return;
    const t = clock.getElapsedTime();
    frameRef.current.children.forEach((child) => {
      if (child.material?.emissive) {
        child.material.emissiveIntensity = isHovered
          ? 0.1 + Math.sin(t * 4) * 0.05
          : 0;
      }
    });
  });

  return (
    <group position={position} rotation={rotation}>
      {/* ── Wooden frame (4 bars) ─────────────────────────────────── */}
      <group ref={frameRef}>
        {/* Top */}
        <mesh position={[0, height / 2 + BORDER / 2, 0]} castShadow>
          <boxGeometry args={[fw, BORDER, frameDepth]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={0.45}
            metalness={0.05}
            emissive={frameColor}
            emissiveIntensity={0}
          />
        </mesh>
        {/* Bottom */}
        <mesh position={[0, -(height / 2 + BORDER / 2), 0]} castShadow>
          <boxGeometry args={[fw, BORDER, frameDepth]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={0.45}
            metalness={0.05}
            emissive={frameColor}
            emissiveIntensity={0}
          />
        </mesh>
        {/* Left */}
        <mesh position={[-(width / 2 + BORDER / 2), 0, 0]} castShadow>
          <boxGeometry args={[BORDER, fh, frameDepth]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={0.45}
            metalness={0.05}
            emissive={frameColor}
            emissiveIntensity={0}
          />
        </mesh>
        {/* Right */}
        <mesh position={[width / 2 + BORDER / 2, 0, 0]} castShadow>
          <boxGeometry args={[BORDER, fh, frameDepth]} />
          <meshStandardMaterial
            color={frameColor}
            roughness={0.45}
            metalness={0.05}
            emissive={frameColor}
            emissiveIntensity={0}
          />
        </mesh>
      </group>

      {/* ── Painting canvas — registered with raycaster ───────────── */}
      <mesh
        ref={canvasRef}
        position={[0, 0, frameDepth / 2 + 0.002]}
        receiveShadow
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.75}
          metalness={0.0}
          envMapIntensity={0.3}
        />
      </mesh>
    </group>
  );
}
