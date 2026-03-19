import { useEffect, useState, useRef } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a colour-channel histogram from an img element already in the DOM.
 * Returns array of 256 objects: { bin, r, g, b }
 */
function buildHistogram(imageUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const MAX = 256;
      canvas.width = Math.min(img.width, 512);
      canvas.height = Math.min(img.height, 512);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const rBins = new Uint32Array(MAX);
      const gBins = new Uint32Array(MAX);
      const bBins = new Uint32Array(MAX);

      for (let i = 0; i < data.length; i += 4) {
        rBins[data[i]]++;
        gBins[data[i + 1]]++;
        bBins[data[i + 2]]++;
      }

      // Downsample to 64 bins for a cleaner chart
      const BINS = 64;
      const step = Math.floor(MAX / BINS);
      const hist = [];
      let maxVal = 0;
      for (let b = 0; b < BINS; b++) {
        let r = 0, g = 0, bl = 0;
        for (let s = 0; s < step; s++) {
          r  += rBins[b * step + s];
          g  += gBins[b * step + s];
          bl += bBins[b * step + s];
        }
        maxVal = Math.max(maxVal, r, g, bl);
        hist.push({ bin: b * step, r, g, b: bl });
      }
      // Normalize 0-100 for the chart
      resolve(hist.map((h) => ({
        bin: h.bin,
        r:   Math.round((h.r  / maxVal) * 100),
        g:   Math.round((h.g  / maxVal) * 100),
        b:   Math.round((h.b  / maxVal) * 100),
      })));
    };
    img.src = imageUrl;
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(5,5,15,0.85)",
      border: "1px solid rgba(255,255,255,0.12)",
      borderRadius: 8,
      padding: "6px 12px",
      fontSize: 11,
      color: "#e0e0e0",
      backdropFilter: "blur(8px)",
    }}>
      <div style={{ marginBottom: 2, color: "#aaa" }}>Bin {label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ color: p.color }}>
          {p.dataKey.toUpperCase()}: {p.value}
        </div>
      ))}
    </div>
  );
}

// ─── Main overlay component ───────────────────────────────────────────────────
/**
 * HistogramOverlay
 * Props:
 *  - imageUrl   : string   path to the painting texture
 *  - visible    : boolean  toggled by the parent on mesh hover
 *  - artTitle   : string
 */
export default function HistogramOverlay({ imageUrl, visible, artTitle = "Artwork" }) {
  const [histData, setHistData] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const cacheRef = useRef({});

  useEffect(() => {
    if (!imageUrl) return;
    if (cacheRef.current[imageUrl]) {
      setHistData(cacheRef.current[imageUrl]);
      setLoaded(true);
      return;
    }
    setLoaded(false);
    buildHistogram(imageUrl).then((data) => {
      cacheRef.current[imageUrl] = data;
      setHistData(data);
      setLoaded(true);
    });
  }, [imageUrl]);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        right: 28,
        width: 340,
        pointerEvents: "auto",        // interactive despite parent overlay
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        zIndex: 30,
      }}
    >
      {/* Glassmorphism card */}
      <div style={{
        background: "rgba(8, 8, 20, 0.55)",
        backdropFilter: "blur(20px) saturate(1.8)",
        WebkitBackdropFilter: "blur(20px) saturate(1.8)",
        border: "1px solid rgba(255,255,255,0.10)",
        borderRadius: 16,
        padding: "16px 18px 14px",
        boxShadow: "0 8px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
      }}>
        {/* Header */}
        <div style={{ marginBottom: 10 }}>
          <p style={{
            margin: 0,
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 17,
            fontWeight: 600,
            color: "#f0e6d0",
            letterSpacing: "0.02em",
          }}>{artTitle}</p>
          <p style={{
            margin: "2px 0 0",
            fontFamily: "monospace",
            fontSize: 10,
            color: "rgba(255,255,255,0.38)",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>Colour Density Histogram</p>
        </div>

        {/* Chart */}
        {loaded ? (
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={histData} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="gradR" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ff4d6d" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#ff4d6d" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#4ade80" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradB" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#60a5fa" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="bin" tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 8, fill: "rgba(255,255,255,0.3)" }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="r" stroke="#ff4d6d" strokeWidth={1.5} fill="url(#gradR)" fillOpacity={1} />
              <Area type="monotone" dataKey="g" stroke="#4ade80" strokeWidth={1.5} fill="url(#gradG)" fillOpacity={1} />
              <Area type="monotone" dataKey="b" stroke="#60a5fa" strokeWidth={1.5} fill="url(#gradB)" fillOpacity={1} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div style={{
            height: 120,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "rgba(255,255,255,0.3)",
            fontFamily: "monospace",
            fontSize: 11,
          }}>
            Analysing pixels…
          </div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
          {[["#ff4d6d", "Red"], ["#4ade80", "Green"], ["#60a5fa", "Blue"]].map(([col, label]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: col }} />
              <span style={{ fontFamily: "monospace", fontSize: 9, color: "rgba(255,255,255,0.45)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
