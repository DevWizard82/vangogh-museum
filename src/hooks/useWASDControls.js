import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * useWASDControls
 *
 * Attaches keyboard listeners and moves the R3F camera every frame.
 * Call this hook inside a component that lives inside <Canvas>.
 *
 * Options:
 *  speed       – movement speed (units/sec)  default 5
 *  floorY      – minimum camera Y             default 1.7  (eye height)
 *  ceilY       – maximum camera Y             default 1.7  (lock to floor)
 *  bounds      – { minX, maxX, minZ, maxZ }   room limits
 */
export default function useWASDControls({
  speed  = 5,
  floorY = 1.7,
  bounds = { minX: -9, maxX: 9, minZ: -11, maxZ: 11 },
} = {}) {
  const { camera, gl } = useThree();
  const keys   = useRef({});
  const yaw    = useRef(0);   // horizontal look (mouse X)
  const pitch  = useRef(0);   // vertical look   (mouse Y)
  const locked = useRef(false);

  // ── Keyboard ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e) => { keys.current[e.code] = true; };
    const up   = (e) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup",   up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup",   up);
    };
  }, []);

  // ── Pointer Lock (click canvas to capture mouse) ──────────────────────────
  useEffect(() => {
    const canvas = gl.domElement;
    const onClick = () => canvas.requestPointerLock();
    const onChange = () => { locked.current = !!document.pointerLockElement; };
    canvas.addEventListener("click", onClick);
    document.addEventListener("pointerlockchange", onChange);
    return () => {
      canvas.removeEventListener("click", onClick);
      document.removeEventListener("pointerlockchange", onChange);
    };
  }, [gl]);

  // ── Mouse look ────────────────────────────────────────────────────────────
  useEffect(() => {
    const onMove = (e) => {
      if (!locked.current) return;
      yaw.current   -= e.movementX * 0.002;
      pitch.current -= e.movementY * 0.002;
      pitch.current  = Math.max(-Math.PI / 3, Math.min(Math.PI / 3, pitch.current));
    };
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  // ── Per-frame movement ────────────────────────────────────────────────────
  useFrame((_, delta) => {
    const k = keys.current;
    const move = new THREE.Vector3();

    if (k["KeyW"] || k["ArrowUp"])    move.z -= 1;
    if (k["KeyS"] || k["ArrowDown"])  move.z += 1;
    if (k["KeyA"] || k["ArrowLeft"])  move.x -= 1;
    if (k["KeyD"] || k["ArrowRight"]) move.x += 1;

    if (move.lengthSq() > 0) {
      move.normalize().multiplyScalar(speed * delta);
      // Rotate movement vector by the current yaw so it's camera-relative
      move.applyEuler(new THREE.Euler(0, yaw.current, 0));
      camera.position.add(move);
    }

    // Apply look rotation
    camera.quaternion.setFromEuler(
      new THREE.Euler(pitch.current, yaw.current, 0, "YXZ")
    );

    // Clamp to room bounds & fix eye height
    camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
    camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    camera.position.y = floorY;
  });
}
