import * as THREE from "three";
import { useTexture, MeshReflectorMaterial } from "@react-three/drei";
import { useRef } from "react";

export const ROOM_WIDTH  = 20;
export const ROOM_HEIGHT = 10;
export const ROOM_DEPTH  = 24;
const WALL_THICKNESS = 0.3;

// ─── Warm sandy wall material — no texture, pure warm beige ──────────────────
const WALL_COLOR    = "#6b5438";   // dark warm amber-brown — matches target
const CEILING_COLOR = "#4a3c2e";   // dark warm ceiling — moody gallery feel
const ALCOVE_COLOR  = "#bfaa88";   // slightly darker inside alcove

// ─── Ceiling glows ────────────────────────────────────────────────────────────
function CeilingGlows() {
  const positions = [
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
  return (
    <>
      {positions.map((p, i) => (
        <group key={i} position={[p.x, ROOM_HEIGHT - 0.02, p.z]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.65, 32]} />
            <meshStandardMaterial color="#fff8e0" emissive="#ffd060"
              emissiveIntensity={2.2} transparent opacity={0.5} depthWrite={false} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
            <circleGeometry args={[0.2, 24]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff"
              emissiveIntensity={5} transparent opacity={0.8} depthWrite={false} />
          </mesh>
        </group>
      ))}
    </>
  );
}

// ─── Floor light pool ─────────────────────────────────────────────────────────
function FloorLightPool({ x, z }) {
  return (
    <mesh position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.2, 32]} />
      <meshStandardMaterial
        color="#ffe090" emissive="#ffd060" emissiveIntensity={0.3}
        transparent opacity={0.18} depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

// ─── Chandelier ───────────────────────────────────────────────────────────────
function ChandelierArm({ angle, radius = 1.2 }) {
  const goldMat = <meshStandardMaterial color="#c8922a" roughness={0.15} metalness={0.92} />;
  const steps = 8;
  const segs = Array.from({ length: steps }, (_, i) => {
    const t = i / (steps - 1);
    return {
      x: Math.cos(angle) * t * radius,
      y: -Math.sin(t * Math.PI * 0.5) * 0.45,
      z: Math.sin(angle) * t * radius,
    };
  });
  const ex = Math.cos(angle) * radius;
  const ez = Math.sin(angle) * radius;
  const ey = -Math.sin(0.5 * Math.PI) * 0.45;

  return (
    <group>
      {segs.map((s, i) => (
        <mesh key={i} position={[s.x, s.y - 1.05, s.z]}>
          <sphereGeometry args={[i === 0 ? 0.045 : 0.026, 8, 8]} />{goldMat}
        </mesh>
      ))}
      <mesh position={[ex, ey - 1.05, ez]}><cylinderGeometry args={[0.052, 0.036, 0.09, 12]} />{goldMat}</mesh>
      <mesh position={[ex, ey - 0.92, ez]}><cylinderGeometry args={[0.022, 0.022, 0.18, 8]} /><meshStandardMaterial color="#f5f0e8" roughness={0.9} /></mesh>
      <mesh position={[ex, ey - 0.81, ez]}><sphereGeometry args={[0.03, 8, 8]} /><meshStandardMaterial color="#fff5c0" emissive="#ffcc44" emissiveIntensity={10} roughness={0} /></mesh>
      <mesh position={[ex, ey - 1.12, ez]}><sphereGeometry args={[0.068, 12, 12]} /><meshStandardMaterial color="#e8f4ff" roughness={0} metalness={0.05} transparent opacity={0.55} /></mesh>
      {[0.06, 0.14, 0.24].map((off, i) => (
        <mesh key={i} position={[ex, ey - 1.2 - off, ez]}>
          <octahedronGeometry args={[i === 2 ? 0.065 : 0.038, 0]} />
          <meshStandardMaterial color="#d4eeff" roughness={0} transparent opacity={0.78} />
        </mesh>
      ))}
    </group>
  );
}

function Chandelier({ position = [0, ROOM_HEIGHT - 1.5, 2] }) {
  const goldMat = <meshStandardMaterial color="#c8922a" roughness={0.15} metalness={0.92} />;
  const ARM_COUNT = 8, ARM_RADIUS = 1.25;
  return (
    <group position={position}>
      <mesh><cylinderGeometry args={[0.22, 0.28, 0.07, 24]} />{goldMat}</mesh>
      <mesh position={[0,-0.05,0]}><cylinderGeometry args={[0.16, 0.22, 0.05, 20]} />{goldMat}</mesh>
      {Array.from({length:10},(_,i) => (
        <mesh key={i} position={[0,-0.12-i*0.07,0]} rotation={[i%2===0?0:Math.PI/2,0,0]}>
          <torusGeometry args={[0.028,0.009,6,12]} />{goldMat}
        </mesh>
      ))}
      <mesh position={[0,-0.85,0]}><cylinderGeometry args={[0.055,0.075,0.22,16]} />{goldMat}</mesh>
      <mesh position={[0,-0.98,0]}><sphereGeometry args={[0.095,14,14]} />{goldMat}</mesh>
      <mesh position={[0,-1.11,0]}><cylinderGeometry args={[0.065,0.055,0.18,16]} />{goldMat}</mesh>
      <mesh position={[0,-1.22,0]}><cylinderGeometry args={[0.11,0.09,0.08,16]} />{goldMat}</mesh>
      <mesh position={[0,-1.05,0]}><torusGeometry args={[ARM_RADIUS,0.032,12,64]} />{goldMat}</mesh>
      <mesh position={[0,-1.05,0]}><torusGeometry args={[0.45,0.022,10,48]} />{goldMat}</mesh>
      {Array.from({length:ARM_COUNT},(_,i) => (
        <ChandelierArm key={i} angle={(i/ARM_COUNT)*Math.PI*2} radius={ARM_RADIUS} />
      ))}
      {Array.from({length:16},(_,i)=>{
        const a=(i/16)*Math.PI*2, r=ARM_RADIUS*0.88;
        return [0,0.09,0.2].map((drop,j)=>(
          <mesh key={`${i}-${j}`} position={[Math.cos(a)*r,-1.18-drop,Math.sin(a)*r]}>
            <octahedronGeometry args={[j===2?0.05:0.025,0]} />
            <meshStandardMaterial color="#e8f4ff" roughness={0} transparent opacity={0.72} />
          </mesh>
        ));
      })}
      <mesh position={[0,-1.42,0]}><octahedronGeometry args={[0.14,0]} /><meshStandardMaterial color="#d4eeff" roughness={0} transparent opacity={0.82} /></mesh>
      <mesh position={[0,-1.72,0]}><octahedronGeometry args={[0.09,0]} /><meshStandardMaterial color="#d4eeff" roughness={0} transparent opacity={0.75} /></mesh>
      <mesh position={[0,-1.94,0]}><octahedronGeometry args={[0.06,0]} /><meshStandardMaterial color="#d4eeff" roughness={0} transparent opacity={0.7}  /></mesh>
      <pointLight position={[0,-0.8,0]}  intensity={100} color="#ffd580" distance={38} decay={1.6} castShadow />
      <pointLight position={[0,-1.05,0]} intensity={35}  color="#ffca60" distance={24} decay={2.2} />
    </group>
  );
}

// ─── Floor — warm bright marble with reflections ──────────────────────────────
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
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      <MeshReflectorMaterial
        mirror={0.45}
        resolution={1024}
        mixBlur={6}
        mixStrength={1.1}
        depthScale={1.0}
        minDepthThreshold={0.4}
        maxDepthThreshold={1.4}
        map={diffuse}
        normalMap={normal}
        normalScale={new THREE.Vector2(0.06, 0.06)}
        roughnessMap={roughness}
        roughness={0.08}
        aoMap={ao}
        aoMapIntensity={0.25}
        color="#d4c8a8"   // warm cream marble — lighter like target image
      />
    </mesh>
  );
}

// ─── Ceiling — plain warm ivory, NO fabric texture ───────────────────────────
function Ceiling() {
  return (
    <mesh position={[0, ROOM_HEIGHT, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      <meshStandardMaterial
        color={CEILING_COLOR}
        roughness={0.9}
        metalness={0.0}
        side={THREE.FrontSide}
      />
    </mesh>
  );
}

// ─── Walls — plain warm sandy beige, NO fabric texture ───────────────────────
function Walls() {
  // Only side walls + front wall. Back wall done by BackWallAlcove.
  const wallDefs = [
    { pos: [0, ROOM_HEIGHT/2, ROOM_DEPTH/2],       args: [ROOM_WIDTH, ROOM_HEIGHT, WALL_THICKNESS] },
    { pos: [-ROOM_WIDTH/2, ROOM_HEIGHT/2, 0],       args: [WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH] },
    { pos: [ ROOM_WIDTH/2, ROOM_HEIGHT/2, 0],       args: [WALL_THICKNESS, ROOM_HEIGHT, ROOM_DEPTH] },
  ];
  return (
    <>
      {wallDefs.map((w, i) => (
        <mesh key={i} position={w.pos} castShadow receiveShadow>
          <boxGeometry args={w.args} />
          <meshStandardMaterial color={WALL_COLOR} roughness={0.85} metalness={0.0} />
        </mesh>
      ))}
    </>
  );
}

// ─── Back wall with alcove niche ──────────────────────────────────────────────
function BackWallAlcove() {
  const wallZ   = -ROOM_DEPTH / 2;
  const aW      = 5.8;    // alcove opening width
  const aH      = 7.0;    // alcove opening height
  const aD      = 0.7;    // depth of recess
  const sideW   = (ROOM_WIDTH - aW) / 2;

  return (
    <group>
      {/* ── Left panel ── */}
      <mesh position={[-(aW/2 + sideW/2), ROOM_HEIGHT/2, wallZ + WALL_THICKNESS/2]} castShadow receiveShadow>
        <boxGeometry args={[sideW, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} metalness={0} />
      </mesh>

      {/* ── Right panel ── */}
      <mesh position={[(aW/2 + sideW/2), ROOM_HEIGHT/2, wallZ + WALL_THICKNESS/2]} castShadow receiveShadow>
        <boxGeometry args={[sideW, ROOM_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} metalness={0} />
      </mesh>

      {/* ── Top strip above alcove ── */}
      <mesh position={[0, aH + (ROOM_HEIGHT - aH)/2, wallZ + WALL_THICKNESS/2]} castShadow receiveShadow>
        <boxGeometry args={[aW, ROOM_HEIGHT - aH, WALL_THICKNESS]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} metalness={0} />
      </mesh>

      {/* ── Alcove back wall (recessed) ── */}
      <mesh position={[0, aH/2, wallZ - aD]} castShadow receiveShadow>
        <boxGeometry args={[aW, aH, WALL_THICKNESS]} />
        <meshStandardMaterial color={ALCOVE_COLOR} roughness={0.82} metalness={0} />
      </mesh>

      {/* ── Alcove left cheek ── */}
      <mesh position={[-aW/2, aH/2, wallZ - aD/2]}>
        <boxGeometry args={[WALL_THICKNESS, aH, aD + WALL_THICKNESS]} />
        <meshStandardMaterial color="#6b5438" roughness={0.85} metalness={0} />
      </mesh>

      {/* ── Alcove right cheek ── */}
      <mesh position={[aW/2, aH/2, wallZ - aD/2]}>
        <boxGeometry args={[WALL_THICKNESS, aH, aD + WALL_THICKNESS]} />
        <meshStandardMaterial color="#6b5438" roughness={0.85} metalness={0} />
      </mesh>

      {/* ── Alcove ceiling ── */}
      <mesh position={[0, aH, wallZ - aD/2]} rotation={[Math.PI/2, 0, 0]}>
        <planeGeometry args={[aW, aD + WALL_THICKNESS]} />
        <meshStandardMaterial color="#5a4832" roughness={0.85} side={THREE.FrontSide} />
      </mesh>

      {/* ── Gold frame around alcove opening ── */}
      {/* top */}
      <mesh position={[0, aH + 0.07, wallZ + 0.08]}>
        <boxGeometry args={[aW + 0.2, 0.14, 0.1]} />
        <meshStandardMaterial color="#b8913e" roughness={0.18} metalness={0.72} />
      </mesh>
      {/* left */}
      <mesh position={[-aW/2 - 0.07, aH/2, wallZ + 0.08]}>
        <boxGeometry args={[0.14, aH + 0.14, 0.1]} />
        <meshStandardMaterial color="#b8913e" roughness={0.18} metalness={0.72} />
      </mesh>
      {/* right */}
      <mesh position={[aW/2 + 0.07, aH/2, wallZ + 0.08]}>
        <boxGeometry args={[0.14, aH + 0.14, 0.1]} />
        <meshStandardMaterial color="#b8913e" roughness={0.18} metalness={0.72} />
      </mesh>

      {/* ── Alcove accent light ── */}
      <pointLight position={[0, aH - 0.8, wallZ - aD + 1.2]}
        intensity={25} color="#ffe4a0" distance={7} decay={2} />
    </group>
  );
}

// ─── Skirting boards ──────────────────────────────────────────────────────────
function SkirtingBoards() {
  const H = 0.14, D = 0.07;
  const boards = [
    { pos: [0, H/2,  ROOM_DEPTH/2 - D/2], args: [ROOM_WIDTH, H, D] },
    { pos: [-ROOM_WIDTH/2 + D/2, H/2, 0], args: [D, H, ROOM_DEPTH] },
    { pos: [ ROOM_WIDTH/2 - D/2, H/2, 0], args: [D, H, ROOM_DEPTH] },
    { pos: [0, H/2, -ROOM_DEPTH/2 + D/2], args: [ROOM_WIDTH, H, D] },
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

// ─── Crown moulding ───────────────────────────────────────────────────────────
function CrownMoulding() {
  const H = 0.1, D = 0.09, Y = ROOM_HEIGHT - H/2;
  const boards = [
    { pos: [0, Y, -ROOM_DEPTH/2 + D/2], args: [ROOM_WIDTH, H, D] },
    { pos: [0, Y,  ROOM_DEPTH/2 - D/2], args: [ROOM_WIDTH, H, D] },
    { pos: [-ROOM_WIDTH/2 + D/2, Y, 0], args: [D, H, ROOM_DEPTH] },
    { pos: [ ROOM_WIDTH/2 - D/2, Y, 0], args: [D, H, ROOM_DEPTH] },
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

// ─── Track fixture ────────────────────────────────────────────────────────────
function TrackFixture({ x, z }) {
  return (
    <group position={[x, ROOM_HEIGHT - 0.01, z]}>
      <mesh><boxGeometry args={[0.06, 0.05, 0.22]} /><meshStandardMaterial color="#222" roughness={0.4} metalness={0.8} /></mesh>
      <mesh position={[0, -0.12, 0]} rotation={[0.28, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.09, 0.18, 12]} /><meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, -0.22, 0.04]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#fff8e0" emissive="#fff8e0" emissiveIntensity={5} roughness={0} />
      </mesh>
    </group>
  );
}

// ─── Track rail ───────────────────────────────────────────────────────────────
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
    { x: -4.5, z: -ROOM_DEPTH/2 + 1.8 },
    { x:  0,   z: -ROOM_DEPTH/2 + 1.8 },
    { x:  4.5, z: -ROOM_DEPTH/2 + 1.8 },
    { x: -ROOM_WIDTH/2 + 1.4, z: -6 },
    { x: -ROOM_WIDTH/2 + 1.4, z:  0 },
    { x: -ROOM_WIDTH/2 + 1.4, z:  6 },
    { x:  ROOM_WIDTH/2 - 1.4, z: -6 },
    { x:  ROOM_WIDTH/2 - 1.4, z:  0 },
    { x:  ROOM_WIDTH/2 - 1.4, z:  6 },
    { x: -4, z: ROOM_DEPTH/2 - 1.8 },
    { x:  0, z: ROOM_DEPTH/2 - 1.8 },
    { x:  4, z: ROOM_DEPTH/2 - 1.8 },
  ];

  const floorPools = [
    { x: -4.5, z: -ROOM_DEPTH/2 + 2.8 },
    { x:  0,   z: -ROOM_DEPTH/2 + 2.8 },
    { x:  4.5, z: -ROOM_DEPTH/2 + 2.8 },
    { x: -ROOM_WIDTH/2 + 2.8, z: -6 },
    { x: -ROOM_WIDTH/2 + 2.8, z:  0 },
    { x: -ROOM_WIDTH/2 + 2.8, z:  6 },
    { x:  ROOM_WIDTH/2 - 2.8, z: -6 },
    { x:  ROOM_WIDTH/2 - 2.8, z:  0 },
    { x:  ROOM_WIDTH/2 - 2.8, z:  6 },
    { x: -4, z: ROOM_DEPTH/2 - 2.8 },
    { x:  0, z: ROOM_DEPTH/2 - 2.8 },
    { x:  4, z: ROOM_DEPTH/2 - 2.8 },
  ];

  // Spotlights aimed at painting wall positions
  const spots = [
    { from: [-4.5, ROOM_HEIGHT-0.1, -ROOM_DEPTH/2+1.8], to: [-4.5, 4.2, -ROOM_DEPTH/2+0.2] },
    { from: [0,    ROOM_HEIGHT-0.1, -ROOM_DEPTH/2+1.8], to: [0,    4.2, -ROOM_DEPTH/2+0.2] },
    { from: [4.5,  ROOM_HEIGHT-0.1, -ROOM_DEPTH/2+1.8], to: [4.5,  4.2, -ROOM_DEPTH/2+0.2] },
    { from: [-ROOM_WIDTH/2+1.4, ROOM_HEIGHT-0.1, -6], to: [-ROOM_WIDTH/2+0.2, 4.2, -6] },
    { from: [-ROOM_WIDTH/2+1.4, ROOM_HEIGHT-0.1,  0], to: [-ROOM_WIDTH/2+0.2, 4.2,  0] },
    { from: [-ROOM_WIDTH/2+1.4, ROOM_HEIGHT-0.1,  6], to: [-ROOM_WIDTH/2+0.2, 4.2,  6] },
    { from: [ROOM_WIDTH/2-1.4,  ROOM_HEIGHT-0.1, -6], to: [ROOM_WIDTH/2-0.2,  4.2, -6] },
    { from: [ROOM_WIDTH/2-1.4,  ROOM_HEIGHT-0.1,  0], to: [ROOM_WIDTH/2-0.2,  4.2,  0] },
    { from: [ROOM_WIDTH/2-1.4,  ROOM_HEIGHT-0.1,  6], to: [ROOM_WIDTH/2-0.2,  4.2,  6] },
    { from: [-4, ROOM_HEIGHT-0.1, ROOM_DEPTH/2-1.8], to: [-4, 4.2, ROOM_DEPTH/2-0.2] },
    { from: [ 0, ROOM_HEIGHT-0.1, ROOM_DEPTH/2-1.8], to: [ 0, 4.2, ROOM_DEPTH/2-0.2] },
    { from: [ 4, ROOM_HEIGHT-0.1, ROOM_DEPTH/2-1.8], to: [ 4, 4.2, ROOM_DEPTH/2-0.2] },
  ];

  return (
    <group>
      {/* ══ LIGHTING ═══════════════════════════════════════════════════════════ */}

      {/* LOW ambient — room should feel moody, NOT flooded */}
      <ambientLight intensity={0.18} color="#c8956a" />

      {/* Very subtle hemisphere — warm tint only, not bright */}
      <hemisphereLight skyColor="#b87840" groundColor="#6b4020" intensity={0.12} />

      {/* Central ceiling — soft warm glow from chandelier area only */}
      <pointLight position={[0, ROOM_HEIGHT-1.5, 2]}
        intensity={18} color="#ffd080" distance={18} decay={2.2} />

      {/* Very dim corner fills — just enough to see walls, not flood them */}
      <pointLight position={[-7, 3, -8]} intensity={4} color="#c8803a" distance={14} decay={2.5} />
      <pointLight position={[ 7, 3, -8]} intensity={4} color="#c8803a" distance={14} decay={2.5} />
      <pointLight position={[-7, 3,  8]} intensity={4} color="#c8803a" distance={14} decay={2.5} />
      <pointLight position={[ 7, 3,  8]} intensity={4} color="#c8803a" distance={14} decay={2.5} />

      {/* Painting spotlights — these ARE the main light source, bright & focused */}
      {spots.map((s, i) => (
        <spotLight
          key={i}
          position={s.from}
          target-position={s.to}
          intensity={i < 3 ? 220 : 180}
          angle={0.22}
          penumbra={0.55}
          color="#ffe8b0"
          distance={14}
          decay={1.8}
          castShadow={false}
        />
      ))}

      {/* Floor light pools */}
      {floorPools.map((p, i) => <FloorLightPool key={i} x={p.x} z={p.z} />)}

      {/* ══ GEOMETRY ═══════════════════════════════════════════════════════════ */}
      <Floor />
      <Ceiling />
      <Walls />
      <BackWallAlcove />
      <SkirtingBoards />
      <CrownMoulding />
      {[-4.5, 0, 4.5].map(x => <TrackRail key={x} x={x} />)}
      {fixturePositions.map((p, i) => <TrackFixture key={i} x={p.x} z={p.z} />)}
      <CeilingGlows />
      <Chandelier position={[0, ROOM_HEIGHT - 1.5, 2]} />
    </group>
  );
}
