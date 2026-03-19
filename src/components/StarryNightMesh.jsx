import { useRef, useMemo } from "react";
import { shaderMaterial } from "@react-three/drei";
import { extend, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── GLSL: Simplex Noise (2D) ─────────────────────────────────────────────────
// Classic Stefan Gustavson simplex noise — public domain
const SIMPLEX_GLSL = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0/289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,
                      0.366025403784439,
                     -0.577350269189626,
                      0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1  = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                 + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
                           dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x  = 2.0 * fract(p * C.www) - 1.0;
  vec3 h  = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x   + h.x  * x0.y;
  g.yz = a0.yz * x12.xz  + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

// ─── Vertex Shader ────────────────────────────────────────────────────────────
const vertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  // Standard 2-D passthrough — no 3-D distortion so the plane stays flat
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// ─── Fragment Shader ──────────────────────────────────────────────────────────
const fragmentShader = /* glsl */ `
${SIMPLEX_GLSL}

uniform sampler2D uTexture;   // the Starry Night image
uniform float     uTime;      // elapsed seconds from useFrame
uniform float     uStrength;  // distortion strength (0–1)

varying vec2 vUv;

// Fractional Brownian Motion — stacks octaves of simplex noise
float fbm(vec2 p) {
  float v = 0.0;
  float amp = 0.5;
  float freq = 1.0;
  for (int i = 0; i < 5; i++) {
    v   += amp * snoise(p * freq + uTime * 0.18 * float(i + 1));
    amp  *= 0.5;
    freq *= 2.1;
  }
  return v;
}

void main() {
  // Build two independent noise fields and rotate them against each other
  // to produce a "swirling" / Van Gogh brushstroke illusion
  float angle = fbm(vUv * 3.0 + uTime * 0.07) * 6.2831853;
  vec2 swirl = vec2(cos(angle), sin(angle));

  // Secondary curl driven by a second fbm layer
  float curl = fbm(vUv * 2.5 - uTime * 0.05 + 7.3);
  swirl += vec2(-sin(angle), cos(angle)) * curl * 0.6;

  // Scale displacement by uStrength and keep it subtle (max ~0.025 UV units)
  vec2 distortedUV = vUv + swirl * uStrength * 0.025;

  // Clamp to avoid wrapping artifacts at edges
  distortedUV = clamp(distortedUV, 0.001, 0.999);

  vec4 texColor = texture2D(uTexture, distortedUV);

  // Slight luminance boost to make the night sky glow
  float luma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  vec3 glowColor = mix(texColor.rgb, vec3(0.12, 0.18, 0.55), 0.15);
  texColor.rgb = mix(glowColor, texColor.rgb + vec3(0.0, 0.0, luma * 0.12), 0.7);

  gl_FragColor = texColor;
}
`;

// ─── Extend Three.js with our custom material ──────────────────────────────
const StarryNightMaterial = shaderMaterial(
  // Uniform defaults
  {
    uTexture: null,
    uTime: 0,
    uStrength: 1.0,
  },
  vertexShader,
  fragmentShader
);

extend({ StarryNightMaterial });

// ─── Component ─────────────────────────────────────────────────────────────
/**
 * StarryNightMesh
 * Props:
 *  - texture   : THREE.Texture   the Starry Night texture
 *  - width     : number
 *  - height    : number
 *  - strength  : number          0 = static, 1 = full swirl (default 1)
 *  - ...meshProps                forwarded to <mesh>
 */
export default function StarryNightMesh({
  texture,
  width = 3,
  height = 2,
  strength = 1.0,
  ...meshProps
}) {
  const matRef = useRef();

  // Tick the uTime uniform every frame
  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uTime = clock.getElapsedTime();
    }
  });

  const uniforms = useMemo(
    () => ({ uTexture: texture, uTime: 0, uStrength: strength }),
    [texture, strength]
  );

  return (
    <mesh {...meshProps}>
      <planeGeometry args={[width, height]} />
      {/* JSX tag name must match the extend() key (camelCase) */}
      <starryNightMaterial
        ref={matRef}
        key={StarryNightMaterial.key}
        uTexture={uniforms.uTexture}
        uTime={uniforms.uTime}
        uStrength={uniforms.uStrength}
        transparent={false}
      />
    </mesh>
  );
}
