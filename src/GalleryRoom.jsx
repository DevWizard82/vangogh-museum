import * as THREE from "three";
import { useTexture, MeshReflectorMaterial } from "@react-three/drei";
import { useEffect } from "react";

export const ROOM_WIDTH = 20;
export const ROOM_HEIGHT = 10;
export const ROOM_DEPTH = 24;
const WALL_THICKNESS = 0.3;

function CeilingGlows() {
  const glowPositions = [
    // back wall fixtures
    { x: -4.5, z: -ROOM_DEPTH / 2 + 1.2 },
    { x: 0, z: -ROOM_DEPTH / 2 + 1.2 },
    { x: 4.5, z: -ROOM_DEPTH / 2 + 1.2 },
    // left wall fixtures
    { x: -ROOM_WIDTH / 2 + 1.2, z: -6 },
    { x: -ROOM_WIDTH / 2 + 1.2, z: 0 },
    { x: -ROOM_WIDTH / 2 + 1.2, z: 6 },
    // right wall fixtures
    { x: ROOM_WIDTH / 2 - 1.2, z: -6 },
    { x: ROOM_WIDTH / 2 - 1.2, z: 0 },
    { x: ROOM_WIDTH / 2 - 1.2, z: 6 },
    // front wall fixtures
    { x: -4, z: ROOM_DEPTH / 2 - 1.2 },
    { x: 0, z: ROOM_DEPTH / 2 - 1.2 },
    { x: 4, z: ROOM_DEPTH / 2 - 1.2 },
  ];

  return (
    <>
      {glowPositions.map((p, i) => (
        <mesh
          key={i}
          position={[p.x, ROOM_HEIGHT - 0.02, p.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {/* outer soft halo */}
          <circleGeometry args={[0.55, 32]} />
          <meshStandardMaterial
            color="#fff4c2"
            emissive="#ffd97a"
            emissiveIntensity={1.4}
            transparent
            opacity={0.38}
            depthWrite={false}
          />
        </mesh>
      ))}
      {glowPositions.map((p, i) => (
        <mesh
          key={`inner-${i}`}
          position={[p.x, ROOM_HEIGHT - 0.015, p.z]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          {/* inner bright core */}
          <circleGeometry args={[0.18, 24]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#ffffff"
            emissiveIntensity={3.5}
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </mesh>
      ))}
    </>
  );
}

function ChandelierArm({ angle, radius = 1.2 }) {
  const goldMat = (
    <meshStandardMaterial color="#c8922a" roughness={0.15} metalness={0.92} />
  );
  const steps = 8;

  const armSegments = Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const r = t * radius;
    const y = -Math.sin(t * Math.PI * 0.5) * 0.45;
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    return { x, y, z, t };
  });

  return (
    <group>
      {/* Curved arm segments */}
      {armSegments.map((seg, i) => (
        <mesh key={i} position={[seg.x, seg.y - 1.05, seg.z]}>
          <sphereGeometry args={[0.022, 7, 7]} />
          {goldMat}
        </mesh>
      ))}

      {/* Thicker connector blobs at each segment for volume */}
      {armSegments.map((seg, i) =>
        i < steps - 1 ? (
          <mesh key={`blob-${i}`} position={[seg.x, seg.y - 1.05, seg.z]}>
            <sphereGeometry args={[i === 0 ? 0.045 : 0.028, 8, 8]} />
            {goldMat}
          </mesh>
        ) : null,
      )}

      <mesh
        position={[
          Math.cos(angle) * radius * 0.5,
          -Math.sin(0.25 * Math.PI) * 0.45 - 1.05,
          Math.sin(angle) * radius * 0.5,
        ]}
      >
        <torusGeometry args={[0.055, 0.022, 8, 16]} />
        {goldMat}
      </mesh>

      <mesh
        position={[
          Math.cos(angle) * radius,
          -Math.sin(0.5 * Math.PI) * 0.45 - 1.05,
          Math.sin(angle) * radius,
        ]}
      >
        <cylinderGeometry args={[0.052, 0.036, 0.09, 12]} />
        {goldMat}
      </mesh>

      <mesh
        position={[
          Math.cos(angle) * radius,
          -Math.sin(0.5 * Math.PI) * 0.45 - 0.92,
          Math.sin(angle) * radius,
        ]}
      >
        <cylinderGeometry args={[0.022, 0.022, 0.18, 8]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
      </mesh>

      <mesh
        position={[
          Math.cos(angle) * radius,
          -Math.sin(0.5 * Math.PI) * 0.45 - 0.81,
          Math.sin(angle) * radius,
        ]}
      >
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#fff5c0"
          emissive="#ffcc44"
          emissiveIntensity={8}
          roughness={0}
        />
      </mesh>

      <mesh
        position={[
          Math.cos(angle) * radius,
          -Math.sin(0.5 * Math.PI) * 0.45 - 1.12,
          Math.sin(angle) * radius,
        ]}
      >
        <sphereGeometry args={[0.068, 12, 12]} />
        <meshStandardMaterial
          color="#e8f4ff"
          roughness={0}
          metalness={0.05}
          transparent
          opacity={0.55}
        />
      </mesh>

      {[0.06, 0.14, 0.24].map((offset, i) => (
        <mesh
          key={`drop-${i}`}
          position={[
            Math.cos(angle) * radius,
            -Math.sin(0.5 * Math.PI) * 0.45 - 1.2 - offset,
            Math.sin(angle) * radius,
          ]}
        >
          <octahedronGeometry args={[i === 2 ? 0.065 : 0.038, 0]} />
          <meshStandardMaterial
            color="#d4eeff"
            roughness={0}
            metalness={0.05}
            transparent
            opacity={0.78}
          />
        </mesh>
      ))}
    </group>
  );
}

function Chandelier({ position = [0, ROOM_HEIGHT - 2.0, 2] }) {
  const goldMat = (
    <meshStandardMaterial color="#c8922a" roughness={0.15} metalness={0.92} />
  );
  const ARM_COUNT = 8;
  const ARM_RADIUS = 1.25;

  const arms = Array.from({ length: ARM_COUNT }, (_, i) => ({
    angle: (i / ARM_COUNT) * Math.PI * 2,
  }));

  const CHAIN_COUNT = 16;
  const chains = Array.from({ length: CHAIN_COUNT }, (_, i) => ({
    angle: (i / CHAIN_COUNT) * Math.PI * 2,
    radius: ARM_RADIUS * 0.88,
  }));

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.07, 24]} />
        {goldMat}
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.16, 0.22, 0.05, 20]} />
        {goldMat}
      </mesh>

      {Array.from({ length: 10 }, (_, i) => (
        <mesh
          key={`chain-${i}`}
          position={[0, -0.12 - i * 0.07, 0]}
          rotation={[i % 2 === 0 ? 0 : Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[0.028, 0.009, 6, 12]} />
          {goldMat}
        </mesh>
      ))}

      <mesh position={[0, -0.85, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 0.22, 16]} />
        {goldMat}
      </mesh>
      <mesh position={[0, -0.98, 0]}>
        <sphereGeometry args={[0.095, 14, 14]} />
        {goldMat}
      </mesh>
      <mesh position={[0, -1.11, 0]}>
        <cylinderGeometry args={[0.065, 0.055, 0.18, 16]} />
        {goldMat}
      </mesh>
      <mesh position={[0, -1.22, 0]}>
        <cylinderGeometry args={[0.11, 0.09, 0.08, 16]} />
        {goldMat}
      </mesh>

      <mesh position={[0, -1.05, 0]}>
        <torusGeometry args={[ARM_RADIUS, 0.032, 12, 64]} />
        {goldMat}
      </mesh>

      <mesh position={[0, -1.05, 0]}>
        <torusGeometry args={[0.45, 0.022, 10, 48]} />
        {goldMat}
      </mesh>

      {arms.map((arm, i) => (
        <ChandelierArm key={i} angle={arm.angle} radius={ARM_RADIUS} />
      ))}

      {chains.map((c, i) => (
        <group key={`curtain-${i}`}>
          {[0, 0.09, 0.2].map((drop, j) => (
            <mesh
              key={j}
              position={[
                Math.cos(c.angle) * c.radius,
                -1.18 - drop,
                Math.sin(c.angle) * c.radius,
              ]}
            >
              <octahedronGeometry args={[j === 2 ? 0.05 : 0.025, 0]} />
              <meshStandardMaterial
                color="#e8f4ff"
                roughness={0}
                transparent
                opacity={0.72}
              />
            </mesh>
          ))}
        </group>
      ))}

      {/* ── Center pendant drops ── */}
      <mesh position={[0, -1.42, 0]}>
        <octahedronGeometry args={[0.14, 0]} />
        <meshStandardMaterial
          color="#d4eeff"
          roughness={0}
          transparent
          opacity={0.82}
        />
      </mesh>
      <mesh position={[0, -1.72, 0]}>
        <octahedronGeometry args={[0.09, 0]} />
        <meshStandardMaterial
          color="#d4eeff"
          roughness={0}
          transparent
          opacity={0.75}
        />
      </mesh>
      <mesh position={[0, -1.94, 0]}>
        <octahedronGeometry args={[0.06, 0]} />
        <meshStandardMaterial
          color="#d4eeff"
          roughness={0}
          transparent
          opacity={0.7}
        />
      </mesh>

      {/* ── Lights ── */}
      <pointLight
        position={[0, -0.8, 0]}
        intensity={55}
        color="#ffd580"
        distance={32}
        decay={1.8}
      />
      <pointLight
        position={[0, -1.05, 0]}
        intensity={12}
        color="#ffca60"
        distance={20}
        decay={2.5}
      />
    </group>
  );
}

// ─── Floor ────────────────────────────────────────────────────────────────────
function Floor() {
  const [diffuse, normal, roughness, ao] = useTexture([
    "/textures/marble_diffuse.png",
    "/textures/marble_normal.png",
    "/textures/marble_specular.png",
    "/textures/marble_ao.png",
  ]);
  [diffuse, normal, roughness, ao].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(5, 7);
  });
  diffuse.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH, 1, 1]} />
      <MeshReflectorMaterial
        mirror={0.25}
        resolution={512}
        mixBlur={12}
        mixStrength={0.5}
        depthScale={0.8}
        minDepthThreshold={0.6}
        maxDepthThreshold={1.2}
        map={diffuse}
        normalMap={normal}
        normalScale={new THREE.Vector2(0.12, 0.12)}
        roughnessMap={roughness}
        roughness={0.18}
        aoMap={ao}
        aoMapIntensity={0.5}
        color="#ffffff"
      />
    </mesh>
  );
}

// ─── Ceiling — linen fabric, tinted warm ivory (not black) ───────────────────
function Ceiling() {
  const [col, norm, rou] = useTexture([
    "/textures/Fabric022_1K-JPG_Color.jpg",
    "/textures/Fabric022_1K-JPG_NormalGL.jpg",
    "/textures/Fabric022_1K-JPG_Roughness.jpg",
  ]);
  [col, norm, rou].forEach((t) => {
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(6, 9);
  });
  col.colorSpace = THREE.SRGBColorSpace;

  return (
    <mesh
      position={[0, ROOM_HEIGHT, 0]}
      rotation={[Math.PI / 2, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      <meshStandardMaterial
        map={col}
        normalMap={norm}
        normalScale={new THREE.Vector2(0.25, 0.25)}
        roughnessMap={rou}
        color="#8a7560" // warm ivory-taupe tint — visible under ceiling lights
        roughness={0.9}
        metalness={0.0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ─── Walls — warm sand/stone linen (not blue-grey) ───────────────────────────
function Walls() {
  const [fabricColor, fabricNormal, fabricRoughness] = useTexture([
    "/textures/Fabric022_1K-JPG_Color.jpg",
    "/textures/Fabric022_1K-JPG_NormalGL.jpg",
    "/textures/Fabric022_1K-JPG_Roughness.jpg",
  ]);
  fabricColor.colorSpace = THREE.SRGBColorSpace;

  const wallDefs = [
    {
      position: [0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2],
      args: [ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS],
      rep: [6, 3],
    },
    {
      position: [0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2],
      args: [ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS],
      rep: [6, 3],
    },
    {
      position: [-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0],
      args: [WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH],
      rep: [8, 3],
    },
    {
      position: [ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0],
      args: [WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH],
      rep: [8, 3],
    },
  ];

  return (
    <>
      {wallDefs.map((w, i) => {
        const col = fabricColor.clone();
        const norm = fabricNormal.clone();
        const rou = fabricRoughness.clone();
        [col, norm, rou].forEach((t) => {
          t.wrapS = t.wrapT = THREE.RepeatWrapping;
          t.repeat.set(...w.rep);
          t.needsUpdate = true;
        });
        col.colorSpace = THREE.SRGBColorSpace;
        return (
          <mesh key={i} position={w.position} castShadow receiveShadow>
            <boxGeometry args={w.args} />
            <meshStandardMaterial
              map={col}
              normalMap={norm}
              normalScale={new THREE.Vector2(0.5, 0.5)}
              roughnessMap={rou}
              color="#6b5c48" // warm dark taupe — harmonises with gold & marble
              roughness={0.9}
              metalness={0.0}
              envMapIntensity={0.4}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Track light fixture (the visible cylinder on the ceiling) ────────────────
function TrackFixture({ x, z }) {
  return (
    <group position={[x, ROOM_HEIGHT - 0.01, z]}>
      {/* Rail bar segment */}
      <mesh>
        <boxGeometry args={[0.06, 0.05, 0.22]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.8} />
      </mesh>
      {/* Lamp head — angled cone */}
      <mesh position={[0, -0.12, 0]} rotation={[0.28, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.09, 0.18, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.9} />
      </mesh>
      {/* Bulb glow */}
      <mesh position={[0, -0.22, 0.04]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#fff8e0"
          emissive="#fff8e0"
          emissiveIntensity={3}
          roughness={0}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

// ─── Skirting boards ─────────────────────────────────────────────────────────
function SkirtingBoards() {
  const H = 0.14,
    D = 0.07;
  const boards = [
    { pos: [0, H / 2, -ROOM_DEPTH / 2 + D / 2], args: [ROOM_WIDTH, H, D] },
    { pos: [0, H / 2, ROOM_DEPTH / 2 - D / 2], args: [ROOM_WIDTH, H, D] },
    { pos: [-ROOM_WIDTH / 2 + D / 2, H / 2, 0], args: [D, H, ROOM_DEPTH] },
    { pos: [ROOM_WIDTH / 2 - D / 2, H / 2, 0], args: [D, H, ROOM_DEPTH] },
  ];
  return (
    <>
      {boards.map((b, i) => (
        <mesh key={i} position={b.pos} receiveShadow>
          <boxGeometry args={b.args} />
          <meshStandardMaterial
            color="#c8a254"
            roughness={0.22}
            metalness={0.65}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Crown moulding ──────────────────────────────────────────────────────────
function CrownMoulding() {
  const H = 0.1,
    D = 0.09,
    Y = ROOM_HEIGHT - H / 2;
  const boards = [
    { pos: [0, Y, -ROOM_DEPTH / 2 + D / 2], args: [ROOM_WIDTH, H, D] },
    { pos: [0, Y, ROOM_DEPTH / 2 - D / 2], args: [ROOM_WIDTH, H, D] },
    { pos: [-ROOM_WIDTH / 2 + D / 2, Y, 0], args: [D, H, ROOM_DEPTH] },
    { pos: [ROOM_WIDTH / 2 - D / 2, Y, 0], args: [D, H, ROOM_DEPTH] },
  ];
  return (
    <>
      {boards.map((b, i) => (
        <mesh key={i} position={b.pos} receiveShadow>
          <boxGeometry args={b.args} />
          <meshStandardMaterial
            color="#b8913e"
            roughness={0.18}
            metalness={0.72}
          />
        </mesh>
      ))}
    </>
  );
}

// ─── Track rail (long bar running along ceiling) ──────────────────────────────
function TrackRail({ x }) {
  return (
    <mesh position={[x, ROOM_HEIGHT - 0.03, 0]}>
      <boxGeometry args={[0.05, 0.04, ROOM_DEPTH - 1]} />
      <meshStandardMaterial color="#1c1c1c" roughness={0.3} metalness={0.9} />
    </mesh>
  );
}

// ─── Export ──────────────────────────────────────────────────────────────────
export default function GalleryRoom() {
  // Fixture positions matching the 12 painting spotlights
  const fixturePositions = [
    // back wall row
    { x: -4.5, z: -ROOM_DEPTH / 2 + 1.2 },
    { x: 0, z: -ROOM_DEPTH / 2 + 1.2 },
    { x: 4.5, z: -ROOM_DEPTH / 2 + 1.2 },
    // left wall row
    { x: -ROOM_WIDTH / 2 + 1.2, z: -6 },
    { x: -ROOM_WIDTH / 2 + 1.2, z: 0 },
    { x: -ROOM_WIDTH / 2 + 1.2, z: 6 },
    // right wall row
    { x: ROOM_WIDTH / 2 - 1.2, z: -6 },
    { x: ROOM_WIDTH / 2 - 1.2, z: 0 },
    { x: ROOM_WIDTH / 2 - 1.2, z: 6 },
    // front wall row
    { x: -4, z: ROOM_DEPTH / 2 - 1.2 },
    { x: 0, z: ROOM_DEPTH / 2 - 1.2 },
    { x: 4, z: ROOM_DEPTH / 2 - 1.2 },
  ];

  return (
    <group>
      <Floor />
      <Ceiling />
      <Walls />
      <SkirtingBoards />
      <CrownMoulding />
      {/* Ceiling track rails */}
      {[-4.5, 0, 4.5].map((x) => (
        <TrackRail key={x} x={x} />
      ))}
      {/* Individual lamp fixtures */}
      {fixturePositions.map((p, i) => (
        <TrackFixture key={i} x={p.x} z={p.z} />
      ))}
      <CeilingGlows />
      <Chandelier position={[0, ROOM_HEIGHT - 1.5, 2]} />
    </group>
  );
}
