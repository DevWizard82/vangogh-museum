import * as THREE from "three";
import { useTexture, MeshReflectorMaterial, SpotLight } from "@react-three/drei";

export const ROOM_WIDTH = 20;
export const ROOM_HEIGHT = 10;
export const ROOM_DEPTH = 24;
const WALL_THICKNESS = 0.3;

// ─── Spotlight with visible cone ─────────────────────────────────────────────
function PaintingSpotlight({ position, targetPos, intensity = 120 }) {
  return (
    <SpotLight
      position={position}
      target-position={targetPos}
      intensity={intensity}
      angle={0.28}
      penumbra={0.65}
      color="#ffe8b0"
      distance={14}
      decay={1.6}
      castShadow
      shadow-mapSize={[512, 512]}
      shadow-bias={-0.001}
      // volumetric cone effect
      volumetric={false}
      attenuation={4.5}
      anglePower={4}
    />
  );
}

// ─── Ceiling glow discs ────────────────────────────────────────────────────
function CeilingGlows() {
  const glowPositions = [
    { x: -4.5, z: -ROOM_DEPTH / 2 + 1.8 },
    { x: 0,    z: -ROOM_DEPTH / 2 + 1.8 },
    { x: 4.5,  z: -ROOM_DEPTH / 2 + 1.8 },
    { x: -ROOM_WIDTH / 2 + 1.4, z: -6 },
    { x: -ROOM_WIDTH / 2 + 1.4, z: 0  },
    { x: -ROOM_WIDTH / 2 + 1.4, z: 6  },
    { x:  ROOM_WIDTH / 2 - 1.4, z: -6 },
    { x:  ROOM_WIDTH / 2 - 1.4, z: 0  },
    { x:  ROOM_WIDTH / 2 - 1.4, z: 6  },
    { x: -4, z: ROOM_DEPTH / 2 - 1.8 },
    { x:  0, z: ROOM_DEPTH / 2 - 1.8 },
    { x:  4, z: ROOM_DEPTH / 2 - 1.8 },
  ];

  return (
    <>
      {glowPositions.map((p, i) => (
        <group key={i} position={[p.x, ROOM_HEIGHT - 0.02, p.z]}>
          {/* outer halo */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.7, 32]} />
            <meshStandardMaterial
              color="#fff8e0"
              emissive="#ffd97a"
              emissiveIntensity={2.5}
              transparent opacity={0.55}
              depthWrite={false}
            />
          </mesh>
          {/* bright core */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <circleGeometry args={[0.22, 24]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={6}
              transparent opacity={0.85}
              depthWrite={false}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ─── Light pool on floor under each spotlight ──────────────────────────────
function FloorLightPool({ x, z }) {
  return (
    <mesh
      position={[x, 0.01, z]}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <circleGeometry args={[1.1, 32]} />
      <meshStandardMaterial
        color="#ffe8a0"
        emissive="#ffe090"
        emissiveIntensity={0.35}
        transparent
        opacity={0.22}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Chandelier (unchanged but brighter) ──────────────────────────────────
function ChandelierArm({ angle, radius = 1.2 }) {
  const goldMat = (
    <meshStandardMaterial color="#c8922a" roughness={0.15} metalness={0.92} />
  );
  const steps = 8;
  const armSegments = Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    const r = t * radius;
    const y = -Math.sin(t * Math.PI * 0.5) * 0.45;
    return { x: Math.cos(angle) * r, y, z: Math.sin(angle) * r };
  });

  return (
    <group>
      {armSegments.map((seg, i) => (
        <mesh key={i} position={[seg.x, seg.y - 1.05, seg.z]}>
          <sphereGeometry args={[0.022, 7, 7]} />
          {goldMat}
        </mesh>
      ))}
      {armSegments.map((seg, i) =>
        i < steps - 1 ? (
          <mesh key={`blob-${i}`} position={[seg.x, seg.y - 1.05, seg.z]}>
            <sphereGeometry args={[i === 0 ? 0.045 : 0.028, 8, 8]} />
            {goldMat}
          </mesh>
        ) : null
      )}
      <mesh position={[Math.cos(angle)*radius, -Math.sin(0.5*Math.PI)*0.45-1.05, Math.sin(angle)*radius]}>
        <cylinderGeometry args={[0.052, 0.036, 0.09, 12]} />
        {goldMat}
      </mesh>
      <mesh position={[Math.cos(angle)*radius, -Math.sin(0.5*Math.PI)*0.45-0.92, Math.sin(angle)*radius]}>
        <cylinderGeometry args={[0.022, 0.022, 0.18, 8]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.9} />
      </mesh>
      <mesh position={[Math.cos(angle)*radius, -Math.sin(0.5*Math.PI)*0.45-0.81, Math.sin(angle)*radius]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#fff5c0" emissive="#ffcc44" emissiveIntensity={10} roughness={0} />
      </mesh>
      <mesh position={[Math.cos(angle)*radius, -Math.sin(0.5*Math.PI)*0.45-1.12, Math.sin(angle)*radius]}>
        <sphereGeometry args={[0.068, 12, 12]} />
        <meshStandardMaterial color="#e8f4ff" roughness={0} metalness={0.05} transparent opacity={0.55} />
      </mesh>
      {[0.06, 0.14, 0.24].map((offset, i) => (
        <mesh key={`drop-${i}`} position={[Math.cos(angle)*radius, -Math.sin(0.5*Math.PI)*0.45-1.2-offset, Math.sin(angle)*radius]}>
          <octahedronGeometry args={[i === 2 ? 0.065 : 0.038, 0]} />
          <meshStandardMaterial color="#d4eeff" roughness={0} metalness={0.05} transparent opacity={0.78} />
        </mesh>
      ))}
    </group>
  );
}

function Chandelier({ position = [0, ROOM_HEIGHT - 2.0, 2] }) {
  const goldMat = <meshStandardMaterial color="#c8922a" roughness={0.15} metalness={0.92} />;
  const ARM_COUNT = 8;
  const ARM_RADIUS = 1.25;
  const arms = Array.from({ length: ARM_COUNT }, (_, i) => ({ angle: (i / ARM_COUNT) * Math.PI * 2 }));
  const chains = Array.from({ length: 16 }, (_, i) => ({ angle: (i / 16) * Math.PI * 2, radius: ARM_RADIUS * 0.88 }));

  return (
    <group position={position}>
      <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.22, 0.28, 0.07, 24]} />{goldMat}</mesh>
      <mesh position={[0, -0.05, 0]}><cylinderGeometry args={[0.16, 0.22, 0.05, 20]} />{goldMat}</mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`chain-${i}`} position={[0, -0.12 - i * 0.07, 0]} rotation={[i % 2 === 0 ? 0 : Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.028, 0.009, 6, 12]} />{goldMat}
        </mesh>
      ))}
      <mesh position={[0, -0.85, 0]}><cylinderGeometry args={[0.055, 0.075, 0.22, 16]} />{goldMat}</mesh>
      <mesh position={[0, -0.98, 0]}><sphereGeometry args={[0.095, 14, 14]} />{goldMat}</mesh>
      <mesh position={[0, -1.11, 0]}><cylinderGeometry args={[0.065, 0.055, 0.18, 16]} />{goldMat}</mesh>
      <mesh position={[0, -1.22, 0]}><cylinderGeometry args={[0.11, 0.09, 0.08, 16]} />{goldMat}</mesh>
      <mesh position={[0, -1.05, 0]}><torusGeometry args={[ARM_RADIUS, 0.032, 12, 64]} />{goldMat}</mesh>
      <mesh position={[0, -1.05, 0]}><torusGeometry args={[0.45, 0.022, 10, 48]} />{goldMat}</mesh>
      {arms.map((arm, i) => <ChandelierArm key={i} angle={arm.angle} radius={ARM_RADIUS} />)}
      {chains.map((c, i) => (
        <group key={`curtain-${i}`}>
          {[0, 0.09, 0.2].map((drop, j) => (
            <mesh key={j} position={[Math.cos(c.angle)*c.radius, -1.18-drop, Math.sin(c.angle)*c.radius]}>
              <octahedronGeometry args={[j === 2 ? 0.05 : 0.025, 0]} />
              <meshStandardMaterial color="#e8f4ff" roughness={0} transparent opacity={0.72} />
            </mesh>
          ))}
        </group>
      ))}
      <mesh position={[0, -1.42, 0]}><octahedronGeometry args={[0.14, 0]} /><meshStandardMaterial color="#d4eeff" roughness={0} transparent opacity={0.82} /></mesh>
      <mesh position={[0, -1.72, 0]}><octahedronGeometry args={[0.09, 0]} /><meshStandardMaterial color="#d4eeff" roughness={0} transparent opacity={0.75} /></mesh>
      <mesh position={[0, -1.94, 0]}><octahedronGeometry args={[0.06, 0]} /><meshStandardMaterial color="#d4eeff" roughness={0} transparent opacity={0.7} /></mesh>

      {/* ── Chandelier lights — much brighter ── */}
      <pointLight position={[0, -0.8,  0]} intensity={120} color="#ffd580" distance={40} decay={1.6} castShadow />
      <pointLight position={[0, -1.05, 0]} intensity={40}  color="#ffca60" distance={28} decay={2.2} />
    </group>
  );
}

// ─── Floor — bright marble with strong reflections ────────────────────────
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
        mirror={0.55}               // stronger mirror
        resolution={1024}           // higher res reflections
        mixBlur={6}                 // less blur = clearer reflections
        mixStrength={1.2}           // stronger mix
        depthScale={1.2}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        map={diffuse}
        normalMap={normal}
        normalScale={new THREE.Vector2(0.08, 0.08)}   // subtler bumps
        roughnessMap={roughness}
        roughness={0.08}            // much more polished
        aoMap={ao}
        aoMapIntensity={0.3}
        color="#e8ddc8"             // warm cream tint
      />
    </mesh>
  );
}

// ─── Ceiling — bright warm cream ──────────────────────────────────────────
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
    <mesh position={[0, ROOM_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      <meshStandardMaterial
        map={col}
        normalMap={norm}
        normalScale={new THREE.Vector2(0.15, 0.15)}
        roughnessMap={rou}
        color="#d4c8a8"   // warm bright ivory — well lit
        roughness={0.85}
        metalness={0.0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ─── Back wall alcove (the recessed niche in target image) ─────────────────
function BackWallAlcove() {
  const alcoveW  = 5.5;
  const alcoveH  = 6.5;
  const alcoveD  = 0.9;   // how deep it recesses
  const wallZ    = -ROOM_DEPTH / 2;
  const wallColor = "#c8b99a";  // slightly lighter inside alcove

  return (
    <group>
      {/* ── Left cheek of alcove ── */}
      <mesh position={[-(alcoveW / 2 + (ROOM_WIDTH - alcoveW) / 4), ROOM_HEIGHT / 2, wallZ + WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[(ROOM_WIDTH - alcoveW) / 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#c4b49a" roughness={0.88} metalness={0} />
      </mesh>
      {/* ── Right cheek of alcove ── */}
      <mesh position={[(alcoveW / 2 + (ROOM_WIDTH - alcoveW) / 4), ROOM_HEIGHT / 2, wallZ + WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[(ROOM_WIDTH - alcoveW) / 2, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color="#c4b49a" roughness={0.88} metalness={0} />
      </mesh>
      {/* ── Top strip above alcove opening ── */}
      <mesh position={[0, ROOM_HEIGHT - (ROOM_HEIGHT - alcoveH) / 2, wallZ + WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[alcoveW, ROOM_HEIGHT - alcoveH, WALL_THICKNESS]} />
        <meshStandardMaterial color="#c4b49a" roughness={0.88} metalness={0} />
      </mesh>

      {/* ── Alcove back wall (recessed) ── */}
      <mesh position={[0, alcoveH / 2, wallZ - alcoveD + WALL_THICKNESS / 2]} castShadow receiveShadow>
        <boxGeometry args={[alcoveW, alcoveH, WALL_THICKNESS]} />
        <meshStandardMaterial color={wallColor} roughness={0.85} metalness={0} />
      </mesh>
      {/* ── Alcove left side wall ── */}
      <mesh position={[-alcoveW / 2, alcoveH / 2, wallZ - alcoveD / 2]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, alcoveH, alcoveD]} />
        <meshStandardMaterial color="#bfb090" roughness={0.88} metalness={0} />
      </mesh>
      {/* ── Alcove right side wall ── */}
      <mesh position={[alcoveW / 2, alcoveH / 2, wallZ - alcoveD / 2]} castShadow receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, alcoveH, alcoveD]} />
        <meshStandardMaterial color="#bfb090" roughness={0.88} metalness={0} />
      </mesh>
      {/* ── Alcove ceiling ── */}
      <mesh position={[0, alcoveH, wallZ - alcoveD / 2]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[alcoveW, alcoveD]} />
        <meshStandardMaterial color="#c8bda0" roughness={0.85} metalness={0} side={THREE.FrontSide} />
      </mesh>

      {/* ── Alcove frame moulding (gold border around opening) ── */}
      {/* top bar */}
      <mesh position={[0, alcoveH + 0.06, wallZ + 0.06]}>
        <boxGeometry args={[alcoveW + 0.18, 0.12, 0.12]} />
        <meshStandardMaterial color="#b8913e" roughness={0.18} metalness={0.72} />
      </mesh>
      {/* left bar */}
      <mesh position={[-alcoveW / 2 - 0.06, alcoveH / 2, wallZ + 0.06]}>
        <boxGeometry args={[0.12, alcoveH, 0.12]} />
        <meshStandardMaterial color="#b8913e" roughness={0.18} metalness={0.72} />
      </mesh>
      {/* right bar */}
      <mesh position={[alcoveW / 2 + 0.06, alcoveH / 2, wallZ + 0.06]}>
        <boxGeometry args={[0.12, alcoveH, 0.12]} />
        <meshStandardMaterial color="#b8913e" roughness={0.18} metalness={0.72} />
      </mesh>

      {/* ── Extra accent light inside alcove ── */}
      <pointLight
        position={[0, alcoveH - 0.5, wallZ - alcoveD + 1.0]}
        intensity={30}
        color="#ffe4a0"
        distance={6}
        decay={2}
      />
    </group>
  );
}

// ─── Side + Front walls (warm sandy beige) ────────────────────────────────
function Walls() {
  const [fabricColor, fabricNormal, fabricRoughness] = useTexture([
    "/textures/Fabric022_1K-JPG_Color.jpg",
    "/textures/Fabric022_1K-JPG_NormalGL.jpg",
    "/textures/Fabric022_1K-JPG_Roughness.jpg",
  ]);
  fabricColor.colorSpace = THREE.SRGBColorSpace;

  // Only side walls + front wall — back wall handled by BackWallAlcove
  const wallDefs = [
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
        const col  = fabricColor.clone();
        const norm = fabricNormal.clone();
        const rou  = fabricRoughness.clone();
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
              normalScale={new THREE.Vector2(0.35, 0.35)}
              roughnessMap={rou}
              color="#c4b49a"   // warm sandy beige — matches target image
              roughness={0.88}
              metalness={0.0}
              envMapIntensity={0.6}
            />
          </mesh>
        );
      })}
    </>
  );
}

// ─── Track fixture ─────────────────────────────────────────────────────────
function TrackFixture({ x, z }) {
  return (
    <group position={[x, ROOM_HEIGHT - 0.01, z]}>
      <mesh>
        <boxGeometry args={[0.06, 0.05, 0.22]} />
        <meshStandardMaterial color="#222" roughness={0.4} metalness={0.8} />
      </mesh>
      <mesh position={[0, -0.12, 0]} rotation={[0.28, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.09, 0.18, 12]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.22, 0.04]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial
          color="#fff8e0"
          emissive="#fff8e0"
          emissiveIntensity={5}
          roughness={0}
        />
      </mesh>
    </group>
  );
}

// ─── Skirting boards ────────────────────────────────────────────────────────
function SkirtingBoards() {
  const H = 0.14, D = 0.07;
  const boards = [
    { pos: [0, H / 2, ROOM_DEPTH / 2 - D / 2],   args: [ROOM_WIDTH, H, D] },
    { pos: [-ROOM_WIDTH / 2 + D / 2, H / 2, 0],  args: [D, H, ROOM_DEPTH] },
    { pos: [ROOM_WIDTH / 2 - D / 2, H / 2, 0],   args: [D, H, ROOM_DEPTH] },
    // back skirting follows alcove width
    { pos: [0, H / 2, -ROOM_DEPTH / 2 + D / 2],  args: [ROOM_WIDTH, H, D] },
  ];
  return (
    <>
      {boards.map((b, i) => (
        <mesh key={i} position={b.pos} receiveShadow>
          <boxGeometry args={b.args} />
          <meshStandardMaterial color="#c8a254" roughness={0.22} metalness={0.65} />
        </mesh>
      ))}
    </>
  );
}

// ─── Crown moulding ─────────────────────────────────────────────────────────
function CrownMoulding() {
  const H = 0.1, D = 0.09, Y = ROOM_HEIGHT - H / 2;
  const boards = [
    { pos: [0, Y, -ROOM_DEPTH / 2 + D / 2],  args: [ROOM_WIDTH, H, D] },
    { pos: [0, Y, ROOM_DEPTH / 2 - D / 2],   args: [ROOM_WIDTH, H, D] },
    { pos: [-ROOM_WIDTH / 2 + D / 2, Y, 0],  args: [D, H, ROOM_DEPTH] },
    { pos: [ROOM_WIDTH / 2 - D / 2, Y, 0],   args: [D, H, ROOM_DEPTH] },
  ];
  return (
    <>
      {boards.map((b, i) => (
        <mesh key={i} position={b.pos} receiveShadow>
          <boxGeometry args={b.args} />
          <meshStandardMaterial color="#b8913e" roughness={0.18} metalness={0.72} />
        </mesh>
      ))}
    </>
  );
}

// ─── Track rail ──────────────────────────────────────────────────────────────
function TrackRail({ x }) {
  return (
    <mesh position={[x, ROOM_HEIGHT - 0.03, 0]}>
      <boxGeometry args={[0.05, 0.04, ROOM_DEPTH - 1]} />
      <meshStandardMaterial color="#1c1c1c" roughness={0.3} metalness={0.9} />
    </mesh>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default function GalleryRoom() {
  const fixturePositions = [
    { x: -4.5, z: -ROOM_DEPTH / 2 + 1.8 },
    { x:  0,   z: -ROOM_DEPTH / 2 + 1.8 },
    { x:  4.5, z: -ROOM_DEPTH / 2 + 1.8 },
    { x: -ROOM_WIDTH / 2 + 1.4, z: -6 },
    { x: -ROOM_WIDTH / 2 + 1.4, z:  0 },
    { x: -ROOM_WIDTH / 2 + 1.4, z:  6 },
    { x:  ROOM_WIDTH / 2 - 1.4, z: -6 },
    { x:  ROOM_WIDTH / 2 - 1.4, z:  0 },
    { x:  ROOM_WIDTH / 2 - 1.4, z:  6 },
    { x: -4, z: ROOM_DEPTH / 2 - 1.8 },
    { x:  0, z: ROOM_DEPTH / 2 - 1.8 },
    { x:  4, z: ROOM_DEPTH / 2 - 1.8 },
  ];

  // Painting wall targets for spotlights
  const spotTargets = [
    // back wall (3 paintings)
    { from: [-4.5, ROOM_HEIGHT - 0.1, -ROOM_DEPTH/2 + 1.8], to: [-4.5, 4.5, -ROOM_DEPTH/2 + 0.2] },
    { from: [   0, ROOM_HEIGHT - 0.1, -ROOM_DEPTH/2 + 1.8], to: [   0, 4.5, -ROOM_DEPTH/2 + 0.2] },
    { from: [ 4.5, ROOM_HEIGHT - 0.1, -ROOM_DEPTH/2 + 1.8], to: [ 4.5, 4.5, -ROOM_DEPTH/2 + 0.2] },
    // left wall (3)
    { from: [-ROOM_WIDTH/2+1.4, ROOM_HEIGHT-0.1, -6], to: [-ROOM_WIDTH/2+0.2, 4.5, -6] },
    { from: [-ROOM_WIDTH/2+1.4, ROOM_HEIGHT-0.1,  0], to: [-ROOM_WIDTH/2+0.2, 4.5,  0] },
    { from: [-ROOM_WIDTH/2+1.4, ROOM_HEIGHT-0.1,  6], to: [-ROOM_WIDTH/2+0.2, 4.5,  6] },
    // right wall (3)
    { from: [ROOM_WIDTH/2-1.4, ROOM_HEIGHT-0.1, -6], to: [ROOM_WIDTH/2-0.2, 4.5, -6] },
    { from: [ROOM_WIDTH/2-1.4, ROOM_HEIGHT-0.1,  0], to: [ROOM_WIDTH/2-0.2, 4.5,  0] },
    { from: [ROOM_WIDTH/2-1.4, ROOM_HEIGHT-0.1,  6], to: [ROOM_WIDTH/2-0.2, 4.5,  6] },
    // front wall (3)
    { from: [-4, ROOM_HEIGHT-0.1, ROOM_DEPTH/2-1.8], to: [-4, 4.5, ROOM_DEPTH/2-0.2] },
    { from: [ 0, ROOM_HEIGHT-0.1, ROOM_DEPTH/2-1.8], to: [ 0, 4.5, ROOM_DEPTH/2-0.2] },
    { from: [ 4, ROOM_HEIGHT-0.1, ROOM_DEPTH/2-1.8], to: [ 4, 4.5, ROOM_DEPTH/2-0.2] },
  ];

  // Floor light pool positions (under each painting)
  const floorPools = [
    { x: -4.5, z: -ROOM_DEPTH/2 + 2.5 },
    { x:    0, z: -ROOM_DEPTH/2 + 2.5 },
    { x:  4.5, z: -ROOM_DEPTH/2 + 2.5 },
    { x: -ROOM_WIDTH/2 + 2.5, z: -6 },
    { x: -ROOM_WIDTH/2 + 2.5, z:  0 },
    { x: -ROOM_WIDTH/2 + 2.5, z:  6 },
    { x:  ROOM_WIDTH/2 - 2.5, z: -6 },
    { x:  ROOM_WIDTH/2 - 2.5, z:  0 },
    { x:  ROOM_WIDTH/2 - 2.5, z:  6 },
    { x: -4, z: ROOM_DEPTH/2 - 2.5 },
    { x:  0, z: ROOM_DEPTH/2 - 2.5 },
    { x:  4, z: ROOM_DEPTH/2 - 2.5 },
  ];

  return (
    <group>
      {/* ── Global warm ambient — KEY change for brightness ── */}
      <ambientLight intensity={1.8} color="#f5e6c8" />

      {/* ── Warm hemisphere light — sky from above, bounce from floor ── */}
      <hemisphereLight
        skyColor="#ffe8c0"
        groundColor="#c8a878"
        intensity={1.2}
      />

      {/* ── Wide fill lights to eliminate dark corners ── */}
      <pointLight position={[0, ROOM_HEIGHT - 1, 0]}   intensity={60} color="#ffe4b0" distance={35} decay={1.4} />
      <pointLight position={[-6, ROOM_HEIGHT - 2, -6]} intensity={35} color="#ffd8a0" distance={20} decay={1.8} />
      <pointLight position={[ 6, ROOM_HEIGHT - 2, -6]} intensity={35} color="#ffd8a0" distance={20} decay={1.8} />
      <pointLight position={[-6, ROOM_HEIGHT - 2,  6]} intensity={35} color="#ffd8a0" distance={20} decay={1.8} />
      <pointLight position={[ 6, ROOM_HEIGHT - 2,  6]} intensity={35} color="#ffd8a0" distance={20} decay={1.8} />

      {/* ── Painting spotlights ── */}
      {spotTargets.map((s, i) => (
        <PaintingSpotlight
          key={i}
          position={s.from}
          targetPos={s.to}
          intensity={i < 3 ? 150 : 110}  // back wall brighter (center focus)
        />
      ))}

      {/* ── Floor light pools ── */}
      {floorPools.map((p, i) => (
        <FloorLightPool key={i} x={p.x} z={p.z} />
      ))}

      {/* ── Geometry ── */}
      <Floor />
      <Ceiling />
      <Walls />
      <BackWallAlcove />
      <SkirtingBoards />
      <CrownMoulding />

      {[-4.5, 0, 4.5].map((x) => (
        <TrackRail key={x} x={x} />
      ))}
      {fixturePositions.map((p, i) => (
        <TrackFixture key={i} x={p.x} z={p.z} />
      ))}
      <CeilingGlows />
      <Chandelier position={[0, ROOM_HEIGHT - 1.5, 2]} />
    </group>
  );
}
