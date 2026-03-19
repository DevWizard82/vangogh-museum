import { useState, Suspense, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, useTexture, SpotLight } from "@react-three/drei";
import * as THREE from "three";

import GalleryRoom, {
  ROOM_HEIGHT,
  ROOM_DEPTH,
  ROOM_WIDTH,
} from "./GalleryRoom";
import FramedArtwork from "./components/FramedArtwork";
import StarryNightMesh from "./components/StarryNightMesh";
import useWASDControls from "./hooks/useWASDControls";
import { useRaycasterHover } from "./hooks/useRaycasterHover";
import GalleryUI from "./components/GalleryUI";
import HistogramOverlay from "./components/HistogramOverlay";
import PaintingInfoPanel from "./components/PaintingInfoPanel";

// ─── 12 paintings — 3 per wall, all unique ───────────────────────────────────
const PAINTINGS = {
  back: [
    {
      file: "Wheatfield_with_crows.png",
      title: "Wheatfield with Crows",
      x: -4.5,
    },
    {
      file: "starry_night.jpg",
      title: "The Starry Night",
      x: 0,
      animated: true,
    },
    { file: "The_potato_eaters.png", title: "The Potato Eaters", x: 4.5 },
  ],
  left: [
    { file: "Irises.png", title: "Irises", z: -6 },
    { file: "Almond_blossom.png", title: "Almond Blossom", z: 0 },
    { file: "the_bedroom.png", title: "The Bedroom", z: 6 },
  ],
  right: [
    {
      file: "Cafe_Terrace_at_Night.png",
      title: "Café Terrace at Night",
      z: -6,
    },
    { file: "The_Night_Café.png", title: "The Night Café", z: 0 },
    {
      file: "Starry_Night_Over_the_Rhone.png",
      title: "Starry Night Over the Rhône",
      z: 6,
    },
  ],
  front: [
    { file: "sunflowers.png", title: "Sunflowers", x: -4 },
    { file: "self_portrait.png", title: "Self-Portrait", x: 0 },
    { file: "the_yellow_house.png", title: "The Yellow House", x: 4 },
  ],
};

// ─── Per-painting spotlight data ─────────────────────────────────────────────
const SPOT_H = ROOM_HEIGHT - 0.3;
const SPOT_PULL = 1.2;
const SPOT_Y_T = 3.0;

const BACK_SPOTS = PAINTINGS.back.map((p) => ({
  lx: p.x,
  lz: -ROOM_DEPTH / 2 + SPOT_PULL,
  tx: p.x,
  tz: -ROOM_DEPTH / 2 + 0.25,
}));
const LEFT_SPOTS = PAINTINGS.left.map((p) => ({
  lx: -ROOM_WIDTH / 2 + SPOT_PULL,
  lz: p.z,
  tx: -ROOM_WIDTH / 2 + 0.25,
  tz: p.z,
}));
const RIGHT_SPOTS = PAINTINGS.right.map((p) => ({
  lx: ROOM_WIDTH / 2 - SPOT_PULL,
  lz: p.z,
  tx: ROOM_WIDTH / 2 - 0.25,
  tz: p.z,
}));
const FRONT_SPOTS = PAINTINGS.front.map((p) => ({
  lx: p.x,
  lz: ROOM_DEPTH / 2 - SPOT_PULL,
  tx: p.x,
  tz: ROOM_DEPTH / 2 - 0.25,
}));

function PaintingSpot({ lx, lz, tx, tz }) {
  return (
    <SpotLight
      position={[lx, SPOT_H, lz]}
      target-position={[tx, SPOT_Y_T, tz]}
      angle={0.28}
      penumbra={0.55}
      intensity={65}
      color="#fff2d8"
      castShadow={false}
      distance={ROOM_HEIGHT + 4}
      attenuation={5}
      anglePower={6}
    />
  );
}

function GalleryLighting() {
  const allSpots = [
    ...BACK_SPOTS,
    ...LEFT_SPOTS,
    ...RIGHT_SPOTS,
    ...FRONT_SPOTS,
  ];
  return (
    <>
      <hemisphereLight
        skyColor="#ffe8c0"
        groundColor="#4a3520"
        intensity={1.2}
      />
      <ambientLight intensity={0.9} color="#fff0e0" />
      {allSpots.map((s, i) => (
        <PaintingSpot key={i} {...s} />
      ))}

      <pointLight
        position={[-8, 4, -10]}
        intensity={5}
        color="#c8965a"
        distance={18}
        decay={2.5}
      />
      <pointLight
        position={[8, 4, -10]}
        intensity={5}
        color="#c8965a"
        distance={18}
        decay={2.5}
      />
      <pointLight
        position={[-8, 4, 10]}
        intensity={5}
        color="#c8965a"
        distance={18}
        decay={2.5}
      />
      <pointLight
        position={[8, 4, 10]}
        intensity={5}
        color="#c8965a"
        distance={18}
        decay={2.5}
      />
    </>
  );
}

// ─── Scene: paintings + raycaster wired together ──────────────────────────────
function GalleryScene({ onHoverChange }) {
  // hoveredFile tracks which painting file is currently aimed at
  const [hoveredFile, setHoveredFile] = useState(null);

  const handleRayHit = useCallback(
    (userData) => {
      if (userData) {
        setHoveredFile(userData.imageUrl);
        onHoverChange({
          visible: true,
          imageUrl: userData.imageUrl,
          title: userData.title,
        });
        document.body.style.cursor = "crosshair";
      } else {
        setHoveredFile(null);
        onHoverChange({ visible: false, imageUrl: "", title: "" });
        document.body.style.cursor = "default";
      }
    },
    [onHoverChange],
  );

  const { registerMesh, unregisterMesh } = useRaycasterHover(handleRayHit);

  const starryTexture = useTexture("/textures/starry_night.jpg");
  const W = 2.8,
    H = 2.0,
    Y = 3.0;

  return (
    <>
      <GalleryLighting />

      {/* ══ BACK WALL ══════════════════════════════════════════════════════ */}
      {PAINTINGS.back.map((p) => (
        <group key={p.file}>
          <FramedArtwork
            position={[p.x, Y, -ROOM_DEPTH / 2 + 0.25]}
            rotation={[0, 0, 0]}
            imageUrl={`/textures/${p.file}`}
            title={p.title}
            width={p.animated ? 3.8 : W}
            height={p.animated ? 2.6 : H}
            isHovered={hoveredFile === `/textures/${p.file}`}
            registerMesh={registerMesh}
            unregisterMesh={unregisterMesh}
          />
          {p.animated && (
            <StarryNightMesh
              texture={starryTexture}
              width={3.8}
              height={2.6}
              position={[p.x, Y, -ROOM_DEPTH / 2 + 0.27]}
              strength={1.2}
            />
          )}
        </group>
      ))}

      {/* ══ LEFT WALL ══════════════════════════════════════════════════════ */}
      {PAINTINGS.left.map((p) => (
        <FramedArtwork
          key={p.file}
          position={[-ROOM_WIDTH / 2 + 0.25, Y, p.z]}
          rotation={[0, Math.PI / 2, 0]}
          imageUrl={`/textures/${p.file}`}
          title={p.title}
          width={W}
          height={H}
          isHovered={hoveredFile === `/textures/${p.file}`}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
        />
      ))}

      {/* ══ RIGHT WALL ═════════════════════════════════════════════════════ */}
      {PAINTINGS.right.map((p) => (
        <FramedArtwork
          key={p.file}
          position={[ROOM_WIDTH / 2 - 0.25, Y, p.z]}
          rotation={[0, -Math.PI / 2, 0]}
          imageUrl={`/textures/${p.file}`}
          title={p.title}
          width={W}
          height={H}
          isHovered={hoveredFile === `/textures/${p.file}`}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
        />
      ))}

      {/* ══ FRONT WALL ═════════════════════════════════════════════════════ */}
      {PAINTINGS.front.map((p) => (
        <FramedArtwork
          key={p.file}
          position={[p.x, Y, ROOM_DEPTH / 2 - 0.25]}
          rotation={[0, Math.PI, 0]}
          imageUrl={`/textures/${p.file}`}
          title={p.title}
          width={W}
          height={H}
          isHovered={hoveredFile === `/textures/${p.file}`}
          registerMesh={registerMesh}
          unregisterMesh={unregisterMesh}
        />
      ))}
    </>
  );
}

// ─── WASD ─────────────────────────────────────────────────────────────────────
function FPSController() {
  useWASDControls({
    speed: 5,
    floorY: 1.7,
    bounds: {
      minX: -(ROOM_WIDTH / 2 - 1),
      maxX: ROOM_WIDTH / 2 - 1,
      minZ: -(ROOM_DEPTH / 2 - 1),
      maxZ: ROOM_DEPTH / 2 - 1,
    },
  });
  return null;
}

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [hovered, setHovered] = useState({
    visible: false,
    imageUrl: "",
    title: "",
  });
  const [activeSection, setActiveSection] = useState("gallery");

  // useCallback so GalleryScene doesn't re-render on every parent render
  const handleHoverChange = useCallback((state) => setHovered(state), []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "#111",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Canvas
        shadows={false}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.6,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ fov: 72, near: 0.05, far: 200, position: [0, 1.7, 10] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#0a0a0a"]} />
        <fog attach="fog" args={["#0a0a0a", 25, 55]} />

        <Suspense fallback={null}>
          <GalleryRoom />
          <GalleryScene onHoverChange={handleHoverChange} />
        </Suspense>

        <FPSController />
      </Canvas>

      <GalleryUI
        activeSection={activeSection}
        onNav={setActiveSection}
        musicSrc="/audio/background.mp3"
      />

      <HistogramOverlay
        imageUrl={hovered.imageUrl}
        visible={hovered.visible}
        artTitle={hovered.title}
      />

      <PaintingInfoPanel
        imageUrl={hovered.imageUrl}
        visible={hovered.visible}
        artTitle={hovered.title}
      />
    </div>
  );
}
