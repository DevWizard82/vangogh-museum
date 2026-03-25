import { useRef, useState, useEffect, useCallback } from "react";

import gymnopedie from "../assets/gymnopedie.mp3";
import daylight from "../assets/on_the_nature_of_daylight.mp3";
import experience from "../assets/experience.mp3";
import calmMusic from "../assets/calm_music.mp3";
import clairLune from "../assets/clair_lune.mp3";
import Comptine from "../assets/Comptine_d'un_autre_ete.mp3";
import Spiegel from "../assets/Spiegel.mp3";
import RiverFlowsInYou from "../assets/River_Flows_in_You.mp3";
import NuvoleBianche from "../assets/nuvole_bianche.mp3";
import MetamorphosisTwo from "../assets/metamorphosis_two.mp3";

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

const PLAYLIST = [
  {
    title: "Ambient Piano ~ Gallery No.8",
    artist: "pianocafe_Kumi",
    src: calmMusic,
  },
  { title: "Gymnopédie No.1", artist: "Erik Satie", src: gymnopedie },
  { title: "On the Nature of Daylight", artist: "Max Richter", src: daylight },
  { title: "Experience", artist: "Ludovico Einaudi", src: experience },
  {
    title: "Clair de lune",
    artist: "Debussy",
    src: clairLune,
  },
  {
    title: "Comptine d'un autre été",
    artist: "Yann Tiersen",
    src: Comptine,
  },
  {
    title: "Spiegel im Spiegel",
    artist: "Arvo Pärt",
    src: Spiegel,
  },
  {
    title: "River Flows in You",
    artist: "Yiruma",
    src: RiverFlowsInYou,
  },
  {
    title: "Nuvole Bianche",
    artist: "Ludovico Einaudi",
    src: NuvoleBianche,
  },
  {
    title: "Metamorphosis Two",
    artist: "Philip Glass",
    src: MetamorphosisTwo,
  },
];

// ─── Vinyl SVG ────────────────────────────────────────────────────────────────
function VinylIcon({ spinning }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={44}
      height={44}
      style={{
        animation: spinning ? "spin 3s linear infinite" : "none",
        display: "block",
        flexShrink: 0,
      }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle
        cx="32"
        cy="32"
        r="30"
        fill="#111"
        stroke="#333"
        strokeWidth="1.5"
      />
      {[24, 19, 14, 9].map((r) => (
        <circle
          key={r}
          cx="32"
          cy="32"
          r={r}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="1.2"
        />
      ))}
      <circle cx="32" cy="32" r="8" fill="#1a0a00" />
      <circle cx="32" cy="32" r="2.5" fill="#c8a96e" />
      <ellipse
        cx="22"
        cy="18"
        rx="5"
        ry="3"
        fill="rgba(255,255,255,0.06)"
        transform="rotate(-30 22 18)"
      />
    </svg>
  );
}

// ─── Icon buttons ─────────────────────────────────────────────────────────────
function IconBtn({ onClick, children, title }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        all: "unset",
        cursor: "pointer",
        width: 28,
        height: 28,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.12)",
        color: "rgba(255,255,255,0.65)",
        fontSize: 13,
        transition: "background 0.2s, color 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(200,162,84,0.18)";
        e.currentTarget.style.color = "#c8a254";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
        e.currentTarget.style.color = "rgba(255,255,255,0.65)";
      }}
    >
      {children}
    </button>
  );
}

// ─── DS feature badges ────────────────────────────────────────────────────────
const BADGES = [
  { icon: "◑", label: "Colour Density Analysis" },
  { icon: "⬡", label: "Live GLSL Shader FX" },
  { icon: "⌖", label: "First-Person Navigation" },
];

// ─── Main UI ──────────────────────────────────────────────────────────────────
export default function GalleryUI() {
  const audioRef = useRef(null);
  const [hoverPct, setHoverPct] = useState(null);
  const [hoverTime, setHoverTime] = useState(null);
  const [playing, setPlaying] = useState(true);
  const [current, setCurrent] = useState(0); // index in PLAYLIST
  const [progress, setProgress] = useState(0); // 0–100

  const track = PLAYLIST[current];

  // ── Load track whenever current changes ──────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const wasPlaying = playing;
    a.pause();
    a.src = PLAYLIST[current].src;
    a.load();
    if (wasPlaying) {
      a.play().catch(() => {});
    }
  }, [current]); // eslint-disable-line

  // ── Progress bar tick ────────────────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => {
      if (a.duration) setProgress((a.currentTime / a.duration) * 100);
    };
    a.addEventListener("timeupdate", onTime);
    return () => a.removeEventListener("timeupdate", onTime);
  }, []);

  // ── Auto-advance to next track ───────────────────────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnd = () => {
      setCurrent((i) => (i + 1) % PLAYLIST.length);
    };
    a.addEventListener("ended", onEnd);
    return () => a.removeEventListener("ended", onEnd);
  }, []);

  // ── Handle Autoplay on First Interaction ─────────────────────────
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    const handleFirstInteraction = () => {
      if (playing && a.paused) {
        a.volume = 0.45;
        a.play().catch(() => {});
      }
      ["click", "keydown", "touchstart"].forEach((event) =>
        window.removeEventListener(event, handleFirstInteraction),
      );
    };

    ["click", "keydown", "touchstart"].forEach((event) =>
      window.addEventListener(event, handleFirstInteraction, { once: true }),
    );

    // Initial attempt for browsers that allow autoplay without interaction
    if (playing && a.paused) {
      a.volume = 0.45;
      a.play().catch(() => {});
    }

    return () => {
      ["click", "keydown", "touchstart"].forEach((event) =>
        window.removeEventListener(event, handleFirstInteraction),
      );
    };
  }, [playing, current]);

  const togglePlay = useCallback(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) {
      a.pause();
      setPlaying(false);
    } else {
      a.volume = 0.45;
      a.play()
        .then(() => setPlaying(true))
        .catch((err) => console.warn("Audio blocked:", err));
    }
  }, [playing]);

  const prev = useCallback(() => {
    setCurrent((i) => (i - 1 + PLAYLIST.length) % PLAYLIST.length);
  }, []);

  const next = useCallback(() => {
    setCurrent((i) => (i + 1) % PLAYLIST.length);
  }, []);

  const seek = useCallback((e) => {
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    a.currentTime = pct * a.duration;
  }, []);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link
        href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=DM+Mono:wght@300;400&display=swap"
        rel="stylesheet"
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 20,
          fontFamily: "'DM Mono', monospace",
        }}
      >
        {/* ── Top-left title ──────────────────────────────────────────── */}
        <div style={{ position: "absolute", top: 28, left: 32 }}>
          <p
            style={{
              margin: "0 0 5px",
              fontSize: 8.5,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "rgba(200,162,84,0.65)",
            }}
          >
            Data-Driven · Interactive
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: "italic",
              fontSize: 34,
              fontWeight: 700,
              color: "#f5ead8",
              letterSpacing: "0.01em",
              lineHeight: 1.0,
              textShadow: "0 2px 28px rgba(0,0,0,0.95)",
            }}
          >
            Van Gogh
          </h1>
          <h2
            style={{
              margin: "3px 0 0",
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 13,
              fontWeight: 400,
              color: "rgba(245,234,216,0.55)",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
            }}
          >
            Visual Intelligence Museum
          </h2>
          <div
            style={{
              margin: "10px 0 11px",
              width: 52,
              height: 1,
              background: "linear-gradient(90deg,#c8a254,transparent)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {BADGES.map((b) => (
              <div
                key={b.label}
                style={{ display: "flex", alignItems: "center", gap: 8 }}
              >
                <span style={{ fontSize: 10, color: "#c8a254" }}>{b.icon}</span>
                <span
                  style={{
                    fontSize: 8,
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(255,255,255,0.28)",
                  }}
                >
                  {b.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Crosshair ───────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            width: 18,
            height: 18,
            pointerEvents: "none",
            opacity: 0.35,
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: 0,
              right: 0,
              height: 1,
              background: "#fff",
              transform: "translateY(-50%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 0,
              bottom: 0,
              width: 1,
              background: "#fff",
              transform: "translateX(-50%)",
            }}
          />
        </div>

        {/* ── WASD hint ───────────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 5,
            pointerEvents: "none",
            opacity: 0.35,
          }}
        >
          <div style={{ display: "flex", gap: 4 }}>
            <Key label="W" />
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["A", "S", "D"].map((k) => (
              <Key key={k} label={k} />
            ))}
          </div>
          <span
            style={{
              fontSize: 8.5,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.4)",
              marginTop: 3,
            }}
          >
            CLICK TO CAPTURE MOUSE · ESC TO RELEASE
          </span>
        </div>

        {/* ── Bottom-right: music player ───────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            bottom: 24,
            right: 28,
            pointerEvents: "auto",
            width: 230,
          }}
        >
          <div
            style={{
              background: "rgba(6,4,2,0.72)",
              backdropFilter: "blur(20px) saturate(1.8)",
              WebkitBackdropFilter: "blur(20px) saturate(1.8)",
              border: "1px solid rgba(200,162,84,0.15)",
              borderRadius: 14,
              padding: "12px 14px 10px",
              boxShadow: playing
                ? "0 0 28px rgba(200,162,84,0.12), 0 8px 32px rgba(0,0,0,0.6)"
                : "0 8px 32px rgba(0,0,0,0.5)",
              transition: "box-shadow 0.4s",
            }}
          >
            {/* Top row: vinyl + track info */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 10,
              }}
            >
              <VinylIcon spinning={playing} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: "italic",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#f5ead8",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {track.title}
                </p>
                <p
                  style={{
                    margin: "2px 0 0",
                    fontSize: 8.5,
                    letterSpacing: "0.10em",
                    color: "rgba(200,162,84,0.70)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {track.artist}
                </p>
                {/* Track indicator dots */}
                <div style={{ display: "flex", gap: 4, marginTop: 5 }}>
                  {PLAYLIST.map((_, i) => (
                    <div
                      key={i}
                      style={{
                        width: i === current ? 14 : 5,
                        height: 5,
                        borderRadius: 3,
                        background:
                          i === current ? "#c8a254" : "rgba(255,255,255,0.18)",
                        transition: "width 0.3s, background 0.3s",
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div
              onClick={seek}
              onMouseMove={(e) => {
                const a = audioRef.current;
                if (!a || !a.duration) return;
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = (e.clientX - rect.left) / rect.width;
                setHoverPct(pct * 100);
                setHoverTime(pct * a.duration);
              }}
              onMouseLeave={() => {
                setHoverPct(null);
                setHoverTime(null);
              }}
              style={{
                width: "100%",
                height: 6, // slightly taller = easier to hit
                borderRadius: 3,
                background: "rgba(255,255,255,0.10)",
                cursor: "pointer",
                marginBottom: 10,
                position: "relative",
              }}
            >
              {/* Filled progress */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: `${progress}%`,
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #c8a254, #f0d080)",
                  transition: "width 0.5s linear",
                }}
              />

              {/* Hover ghost fill */}
              {hoverPct !== null && (
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${hoverPct}%`,
                    borderRadius: 3,
                    background: "rgba(200,162,84,0.25)",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Scrubber thumb */}
              {hoverPct !== null && (
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: `${hoverPct}%`,
                    transform: "translate(-50%, -50%)",
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "#f0d080",
                    boxShadow: "0 0 6px rgba(200,162,84,0.8)",
                    pointerEvents: "none",
                  }}
                />
              )}

              {/* Timestamp tooltip */}
              {hoverTime !== null && (
                <div
                  style={{
                    position: "absolute",
                    bottom: 14,
                    left: `${hoverPct}%`,
                    transform: "translateX(-50%)",
                    background: "rgba(6,4,2,0.85)",
                    border: "1px solid rgba(200,162,84,0.3)",
                    borderRadius: 5,
                    padding: "2px 6px",
                    fontSize: 9,
                    letterSpacing: "0.08em",
                    color: "#f0d080",
                    whiteSpace: "nowrap",
                    pointerEvents: "none",
                  }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>
            {/* Controls row */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
              }}
            >
              <IconBtn onClick={prev} title="Previous">
                ⏮
              </IconBtn>
              <button
                onClick={togglePlay}
                style={{
                  all: "unset",
                  cursor: "pointer",
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: playing ? "#c8a254" : "rgba(200,162,84,0.15)",
                  border: "1px solid rgba(200,162,84,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 14,
                  color: playing ? "#1a0e00" : "#c8a254",
                  transition: "all 0.2s",
                  boxShadow: playing ? "0 0 16px rgba(200,162,84,0.4)" : "none",
                }}
              >
                {playing ? "⏸" : "▶"}
              </button>
              <IconBtn onClick={next} title="Next">
                ⏭
              </IconBtn>
            </div>
          </div>
        </div>

        {/* Hidden audio */}
        <audio ref={audioRef} style={{ display: "none" }}>
          <source src={track.src} type="audio/mpeg" />
        </audio>
      </div>
    </>
  );
}

function Key({ label }) {
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 5,
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.16)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 11,
        fontWeight: 600,
        color: "rgba(255,255,255,0.50)",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      {label}
    </div>
  );
}
