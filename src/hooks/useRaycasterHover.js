import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * useRaycasterHover
 *
 * Fires a ray from the camera through the screen centre (crosshair) every
 * frame and returns the nearest intersected mesh that belongs to any of the
 * registered painting groups.
 *
 * Usage:
 *   const { registerMesh, unregisterMesh } = useRaycasterHover(onHit);
 *
 *   onHit(meshUserData | null)
 *     called whenever the "aimed at" painting changes (or clears)
 *     meshUserData contains { imageUrl, title } set when the mesh registered
 */
export function useRaycasterHover(onHit) {
  const { camera } = useThree();
  const meshes = useRef([]); // all registered canvas meshes
  const lastHit = useRef(null); // uuid of previously hit mesh
  const raycaster = useRef(new THREE.Raycaster());
  const centre = useRef(new THREE.Vector2(0, 0)); // NDC centre = crosshair

  const registerMesh = (mesh) => {
    if (mesh && !meshes.current.includes(mesh)) {
      meshes.current.push(mesh);
    }
  };

  const unregisterMesh = (mesh) => {
    meshes.current = meshes.current.filter((m) => m !== mesh);
  };

  useFrame(() => {
    raycaster.current.setFromCamera(centre.current, camera);
    const hits = raycaster.current.intersectObjects(meshes.current, false);

    const hit = hits.length > 0 ? hits[0].object : null;
    const hitId = hit ? hit.uuid : null;

    if (hitId !== lastHit.current) {
      lastHit.current = hitId;
      onHit(hit ? hit.userData : null);
    }
  });

  return { registerMesh, unregisterMesh };
}
