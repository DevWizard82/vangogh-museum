import { useEffect, useRef, useState, useCallback } from "react";
import * as tf from "@tensorflow/tfjs";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ─── Model URL ────────────────────────────────────────────────────────────────
// TF Hub Arbitrary Image Stylization (fast)
const MODEL_URL =
  "https://tfhub.dev/google/tfjs-model/arbitrary-image-stylization-v1-256/2/default/1";

// ─── Hook: useStyleTransfer ───────────────────────────────────────────────────
/**
 * Loads the TF.js style-transfer model and provides a `stylize` function.
 * stylize(contentCanvas, styleImageEl) → HTMLCanvasElement with styled output
 */
export function useStyleTransfer() {
  const modelRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [status, setStatus] = useState("Loading model…");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setStatus("Loading TF backend…");
        await tf.ready();
        setStatus("Downloading style model…");
        // Use the GraphModel loader for TF Hub SavedModel format
        const model = await tf.loadGraphModel(MODEL_URL, { fromTFHub: true });
        if (!cancelled) {
          modelRef.current = model;
          setReady(true);
          setStatus("Model ready");
        }
      } catch (err) {
        console.error("Style transfer model load failed:", err);
        setStatus(`Error: ${err.message}`);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  /**
   * stylize
   * @param {HTMLVideoElement|HTMLCanvasElement} contentEl
   * @param {HTMLImageElement} styleEl
   * @returns {HTMLCanvasElement} output canvas (256×256 or original aspect)
   */
  const stylize = useCallback(async (contentEl, styleEl) => {
    if (!modelRef.current) return null;
    return tf.tidy(() => {
      // 1. Convert inputs to normalised [0,1] float32 tensors with batch dim
      const contentTensor = tf.browser
        .fromPixels(contentEl)
        .toFloat()
        .div(255)
        .expandDims(0);                        // [1, H, W, 3]

      const styleTensor = tf.browser
        .fromPixels(styleEl)
        .toFloat()
        .div(255)
        .expandDims(0)
        .resizeBilinear([256, 256]);           // model expects 256×256 style

      // 2. Run inference — model returns [1, H, W, 3]
      const styled = modelRef.current.execute({
        placeholder: contentTensor,
        placeholder_1: styleTensor,
      });

      // 3. Clamp & denormalise to uint8
      const outputTensor = styled
        .squeeze()                             // [H, W, 3]
        .clipByValue(0, 1)
        .mul(255)
        .cast("int32");

      // 4. Draw to an offscreen canvas — this becomes the Three.js source
      const [h, w] = outputTensor.shape;
      const outCanvas = document.createElement("canvas");
      outCanvas.width  = w;
      outCanvas.height = h;
      tf.browser.toPixels(outputTensor, outCanvas);

      return outCanvas;
    });
  }, []);

  return { ready, status, stylize };
}

// ─── WebcamStyleMesh ──────────────────────────────────────────────────────────
/**
 * A Three.js plane that shows a live webcam feed styled as Van Gogh.
 *
 * Props:
 *  - styleImageUrl  : string   path to the Van Gogh / style reference image
 *  - width          : number   plane width  (default 3)
 *  - height         : number   plane height (default 2)
 *  - fps            : number   style transfer frames per second (default 1)
 *  - ...meshProps              forwarded to <mesh>
 *
 * The component internally:
 *  1. Opens the webcam
 *  2. On each `fps` tick: grabs a frame → runs style transfer → writes to a
 *     THREE.CanvasTexture so it updates on the GPU
 */
export default function WebcamStyleMesh({
  styleImageUrl = "/textures/starry_night.jpg",
  width = 3,
  height = 2,
  fps = 1,
  ...meshProps
}) {
  const { ready, status, stylize } = useStyleTransfer();

  const videoRef    = useRef(null);   // hidden <video> element
  const styleImgRef = useRef(null);   // hidden <img> element
  const canvasRef   = useRef(null);   // offscreen source canvas for texture
  const textureRef  = useRef(null);   // THREE.CanvasTexture
  const meshRef     = useRef(null);
  const lastRun     = useRef(0);
  const running     = useRef(false);

  // ── Start webcam ────────────────────────────────────────────────────────────
  useEffect(() => {
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;
    videoRef.current = video;

    navigator.mediaDevices
      .getUserMedia({ video: { width: 256, height: 256 } })
      .then((stream) => { video.srcObject = stream; })
      .catch((err) => console.error("Webcam access denied:", err));

    // Load style reference image
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = styleImageUrl;
    styleImgRef.current = img;

    // Create source canvas and Three.js CanvasTexture
    const src = document.createElement("canvas");
    src.width  = 256;
    src.height = 256;
    canvasRef.current = src;

    const tex = new THREE.CanvasTexture(src);
    tex.colorSpace = THREE.SRGBColorSpace;
    textureRef.current = tex;

    return () => {
      video.srcObject?.getTracks().forEach((t) => t.stop());
    };
  }, [styleImageUrl]);

  // ── Per-frame: throttled style transfer ─────────────────────────────────────
  useFrame(({ clock }) => {
    if (!ready || running.current) return;
    const now = clock.getElapsedTime();
    if (now - lastRun.current < 1 / fps) return;
    lastRun.current = now;

    const video = videoRef.current;
    const styleImg = styleImgRef.current;
    if (!video || !styleImg?.complete || video.readyState < 2) return;

    running.current = true;
    stylize(video, styleImg).then((outCanvas) => {
      if (!outCanvas) { running.current = false; return; }
      // Blit stylized result onto the source canvas
      const ctx = canvasRef.current.getContext("2d");
      ctx.drawImage(outCanvas, 0, 0, 256, 256);
      // Tell Three.js the texture source has changed
      if (textureRef.current) textureRef.current.needsUpdate = true;
      running.current = false;
    });
  });

  return (
    <mesh ref={meshRef} {...meshProps}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={textureRef.current}
        roughness={0.7}
        metalness={0}
      />
      {/* Status label (rendered as part of the mesh for now) */}
      {!ready && (
        <meshStandardMaterial color="#111" />
      )}
    </mesh>
  );
}
