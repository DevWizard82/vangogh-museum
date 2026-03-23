import {
  useState,
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from "react";
import { Canvas } from "@react-three/fiber";
import { useTexture, SpotLight } from "@react-three/drei";
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

// ─── 12 paintings ─────────────────────────────────────────────────────────────
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

// ─── Spotlight geometry ───────────────────────────────────────────────────────
const SPOT_H = ROOM_HEIGHT - 0.3;
const SPOT_PULL = 3;
const TRACK_COLOR = "#141414";
const TRACK_METAL = 0.85;
const TRACK_ROUGH = 0.35;

const BACK_SPOTS = PAINTINGS.back.map((p) => ({
  lx: p.x,
  lz: -ROOM_DEPTH / 2 + SPOT_PULL,
  tx: p.x,
  tz: -ROOM_DEPTH / 2 + 0.3,
}));
const LEFT_SPOTS = PAINTINGS.left.map((p) => ({
  lx: -ROOM_WIDTH / 2 + SPOT_PULL,
  lz: p.z,
  tx: -ROOM_WIDTH / 2 + 0.3,
  tz: p.z,
}));
const RIGHT_SPOTS = PAINTINGS.right.map((p) => ({
  lx: ROOM_WIDTH / 2 - SPOT_PULL,
  lz: p.z,
  tx: ROOM_WIDTH / 2 - 0.3,
  tz: p.z,
}));
const FRONT_SPOTS = PAINTINGS.front.map((p) => ({
  lx: p.x,
  lz: ROOM_DEPTH / 2 - SPOT_PULL,
  tx: p.x,
  tz: ROOM_DEPTH / 2 - 0.3,
}));

// ─── Ceiling track rail ───────────────────────────────────────────────────────
function CeilingTrack({ x1, z1, x2, z2 }) {
  const mid = [(x1 + x2) / 2, SPOT_H + 0.07, (z1 + z2) / 2];
  const dx = x2 - x1,
    dz = z2 - z1;
  const len = Math.sqrt(dx * dx + dz * dz);
  const angle = Math.atan2(dz, dx);
  return (
    <mesh position={mid} rotation={[0, -angle, 0]} castShadow={false}>
      <boxGeometry args={[len, 0.045, 0.072]} />
      <meshStandardMaterial
        color={TRACK_COLOR}
        roughness={TRACK_ROUGH}
        metalness={TRACK_METAL}
      />
    </mesh>
  );
}

// ─── Single track light fixture ───────────────────────────────────────────────
function TrackLight({ lx, lz, tx, tz }) {
  const headGroupRef = useRef();
  const targetObj = useMemo(() => new THREE.Object3D(), []);

  useLayoutEffect(() => {
    if (headGroupRef.current) {
      headGroupRef.current.lookAt(tx, 2.0, tz);
    }
  }, [tx, tz]);

  return (
    <>
      {/* Invisible target for the SpotLight */}
      <primitive object={targetObj} position={[tx, 2.0, tz]} />

      {/* 1. Static Track Base attached to the ceiling */}
      <mesh position={[lx, SPOT_H + 0.01, lz]} castShadow={false}>
        <cylinderGeometry args={[0.072, 0.072, 0.045, 14]} />
        <meshStandardMaterial
          color="#1e1e1e"
          roughness={TRACK_ROUGH}
          metalness={TRACK_METAL}
        />
      </mesh>

      {/* 2. Articulated Head Group */}
      <group ref={headGroupRef} position={[lx, SPOT_H - 0.05, lz]}>
        {/* Arm Connector */}
        <mesh
          position={[0, 0, 0.06]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow={false}
        >
          <cylinderGeometry args={[0.022, 0.022, 0.14, 8]} />
          <meshStandardMaterial
            color="#1a1a1a"
            roughness={0.4}
            metalness={TRACK_METAL}
          />
        </mesh>

        {/* Main Head Body */}
        <mesh
          position={[0, 0, 0.18]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow={false}
        >
          <cylinderGeometry args={[0.068, 0.052, 0.26, 14]} />
          <meshStandardMaterial
            color={TRACK_COLOR}
            roughness={TRACK_ROUGH}
            metalness={TRACK_METAL}
          />
        </mesh>

        {/* Dark Bezel / Rim */}
        <mesh
          position={[0, 0, 0.31]}
          rotation={[Math.PI / 2, 0, 0]}
          castShadow={false}
        >
          <cylinderGeometry args={[0.052, 0.042, 0.01, 14]} />
          <meshStandardMaterial
            color="#2a2a2a"
            roughness={0.2}
            metalness={1.0}
          />
        </mesh>

        {/* Glowing Lens */}
        <mesh position={[0, 0, 0.315]} castShadow={false}>
          <circleGeometry args={[0.042, 14]} />
          <meshStandardMaterial
            color="#ffcc88"
            emissive="#ffaa44"
            emissiveIntensity={4}
            roughness={0.05}
            metalness={0.1}
          />
        </mesh>

        <SpotLight
          position={[0, 0, 0.315]}
          target={targetObj}
          angle={0.7}
          penumbra={0.8}
          intensity={80}
          color="#ffedd6"
          distance={40}
          shadow-bias={-0.0001}
          shadow-normalBias={0.04}
          castShadow
          attenuation={3}
          anglePower={3}
          opacity={0.15}
        />
      </group>
    </>
  );
}

// ─── Lighting ─────────────────────────────────────────────────────────────────
function GalleryLighting() {
  const allSpots = [
    ...BACK_SPOTS,
    ...LEFT_SPOTS,
    ...RIGHT_SPOTS,
    ...FRONT_SPOTS,
  ];
  const backZ = -ROOM_DEPTH / 2 + SPOT_PULL;
  const leftX = -ROOM_WIDTH / 2 + SPOT_PULL;
  const rightX = ROOM_WIDTH / 2 - SPOT_PULL;
  const frontZ = ROOM_DEPTH / 2 - SPOT_PULL;

  return (
    <>
      {/* Boosted fill so the lighter surfaces actually read as warm */}
      <hemisphereLight
        skyColor="#ffe8c0"
        groundColor="#6b4f30"
        intensity={0.5}
      />
      <ambientLight intensity={0.4} color="#fff4e6" />

      {/* Ceiling track rails */}
      <CeilingTrack x1={-6.5} z1={backZ} x2={6.5} z2={backZ} />
      <CeilingTrack x1={leftX} z1={-8} x2={leftX} z2={8} />
      <CeilingTrack x1={rightX} z1={-8} x2={rightX} z2={8} />
      <CeilingTrack x1={-5.5} z1={frontZ} x2={5.5} z2={frontZ} />

      {allSpots.map((s, i) => (
        <TrackLight key={i} {...s} />
      ))}

      <pointLight
        position={[-8, 5, -10]}
        intensity={4}
        color="#d4a870"
        distance={20}
        decay={2.0}
      />
      <pointLight
        position={[8, 5, -10]}
        intensity={4}
        color="#d4a870"
        distance={20}
        decay={2.0}
      />
      <pointLight
        position={[-8, 5, 10]}
        intensity={4}
        color="#d4a870"
        distance={20}
        decay={2.0}
      />
      <pointLight
        position={[8, 5, 10]}
        intensity={4}
        color="#d4a870"
        distance={20}
        decay={2.0}
      />

      <pointLight
        position={[0, ROOM_HEIGHT - 1, 0]}
        intensity={6}
        color="#ffe8c0"
        distance={28}
        decay={1.8}
      />
    </>
  );
}

// ─── Scene ────────────────────────────────────────────────────────────────────
function GalleryScene({ onHoverChange }) {
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
  const W = 3.8,
    H = 2.8,
    Y = 3.8;
  const WALL_OFFSET = 0.3;

  return (
    <>
      <GalleryLighting />

      {PAINTINGS.back.map((p) => (
        <group key={p.file}>
          <FramedArtwork
            position={[p.x, Y, -ROOM_DEPTH / 2 + WALL_OFFSET]}
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
              position={[p.x, Y, -ROOM_DEPTH / 2 + WALL_OFFSET + 0.02]}
              strength={1.2}
            />
          )}
        </group>
      ))}

      {PAINTINGS.left.map((p) => (
        <FramedArtwork
          key={p.file}
          position={[-ROOM_WIDTH / 2 + WALL_OFFSET, Y, p.z]}
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

      {PAINTINGS.right.map((p) => (
        <FramedArtwork
          key={p.file}
          position={[ROOM_WIDTH / 2 - WALL_OFFSET, Y, p.z]}
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

      {PAINTINGS.front.map((p) => (
        <FramedArtwork
          key={p.file}
          position={[p.x, Y, ROOM_DEPTH / 2 - WALL_OFFSET]}
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
          toneMappingExposure: 1.1,
          outputColorSpace: THREE.SRGBColorSpace,
        }}
        camera={{ fov: 72, near: 0.05, far: 200, position: [0, 1.7, 10] }}
        style={{ position: "absolute", inset: 0 }}
      >
        <color attach="background" args={["#1a1208"]} />
        <fog attach="fog" args={["#1a1208", 10, 45]} />

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
