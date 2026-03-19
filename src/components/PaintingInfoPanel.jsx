// ─── Van Gogh painting database ───────────────────────────────────────────────
const PAINTING_DATA = {
  "starry_night.jpg": {
    title: "The Starry Night",
    year: "1889",
    medium: "Oil on canvas · 73.7 × 92.1 cm",
    location: "MoMA, New York",
    backstory:
      "Painted from memory in June 1889 while Van Gogh was voluntarily committed at Saint-Paul-de-Mausole asylum in Saint-Rémy-de-Provence. The swirling sky is believed to reflect his turbulent mental state. The cypress tree — symbol of death in Mediterranean culture — bridges earth and heaven. Van Gogh himself considered it a failure.",
    palette: ["#1a3a6e", "#4a7fb5", "#f0c040", "#f5e87a", "#2d2d1e"],
  },
  "Wheatfield_with_crows.png": {
    title: "Wheatfield with Crows",
    year: "1890",
    medium: "Oil on canvas · 50.5 × 103 cm",
    location: "Van Gogh Museum, Amsterdam",
    backstory:
      "Painted in July 1890, just weeks before Van Gogh's death. The turbulent sky, diverging paths, and ominous crows have long been read as a premonition of his suicide, though scholars debate this. Van Gogh wrote it expressed 'sadness and extreme loneliness'. It is one of his last known works.",
    palette: ["#2a4a0a", "#7aaa20", "#1a2a70", "#c8a020", "#4a3010"],
  },
  "The_potato_eaters.png": {
    title: "The Potato Eaters",
    year: "1885",
    medium: "Oil on canvas · 82 × 114 cm",
    location: "Van Gogh Museum, Amsterdam",
    backstory:
      "Van Gogh's first major work, painted in Nuenen. He deliberately used the dark, earthy palette to honour peasant labourers — 'the colour of a good dusty potato, unpeeled.' He made over 50 studies of hands alone. It marks his shift from dark realism toward the bold style that would define him.",
    palette: ["#2a1a08", "#5a3a18", "#8a6030", "#c0a060", "#3a2810"],
  },
  "Irises.png": {
    title: "Irises",
    year: "1889",
    medium: "Oil on canvas · 71 × 93 cm",
    location: "Getty Museum, Los Angeles",
    backstory:
      "Painted in the garden of Saint-Paul-de-Mausole asylum, one month after Van Gogh's arrival. He called it 'the lightning conductor for my illness' — painting kept him sane. The single white iris among the blue was added for contrast. It sold in 1987 for a then-record $53.9 million.",
    palette: ["#2a4080", "#5060c0", "#806020", "#408020", "#c0a030"],
  },
  "Almond_blossom.png": {
    title: "Almond Blossom",
    year: "1890",
    medium: "Oil on canvas · 73.3 × 92.4 cm",
    location: "Van Gogh Museum, Amsterdam",
    backstory:
      "Painted to celebrate the birth of his nephew — named Vincent Willem after him. Van Gogh wrote it was 'the most patient and most careful picture I have ever done.' The Japanese ukiyo-e influence is unmistakable in the flat composition and bold outlines. It hung above his brother Theo's bed.",
    palette: ["#a8d4f0", "#d0e8f8", "#f0f8ff", "#604820", "#c8e0a0"],
  },
  "the_bedroom.png": {
    title: "The Bedroom",
    year: "1888",
    medium: "Oil on canvas · 72 × 90 cm",
    location: "Van Gogh Museum, Amsterdam",
    backstory:
      "Painted in Arles to show his friend Paul Gauguin that the Yellow House was a worthy artistic refuge. The deliberately flat perspective and vivid colours were meant to convey 'absolute rest'. Van Gogh made three versions — the original developed cracks because the paint was too wet when he rolled the canvas.",
    palette: ["#a06820", "#c89040", "#4068c0", "#60a060", "#d0b060"],
  },
  "Cafe_Terrace_at_Night.png": {
    title: "Café Terrace at Night",
    year: "1888",
    medium: "Oil on canvas · 81 × 65.5 cm",
    location: "Kröller-Müller Museum, Otterlo",
    backstory:
      "The first painting Van Gogh made using only artificial light at night, set at Place du Forum in Arles. He wrote: 'The night is more alive and more richly coloured than the day.' Some scholars see a Last Supper composition in the arrangement of figures. The café still exists today.",
    palette: ["#0a0a30", "#f0c020", "#204080", "#c0a030", "#102050"],
  },
  "The_Night_Café.png": {
    title: "The Night Café",
    year: "1888",
    medium: "Oil on canvas · 72.4 × 92.1 cm",
    location: "Yale University Art Gallery",
    backstory:
      "Van Gogh painted this in the café where he slept for three nights when he couldn't afford a room. He used clashing red and green to express 'the terrible passions of humanity.' He wrote: 'I have tried to express the idea that the café is a place where one can ruin oneself, go mad or commit a crime.'",
    palette: ["#c01010", "#204020", "#f0c020", "#803010", "#102040"],
  },
  "Starry_Night_Over_the_Rhone.png": {
    title: "Starry Night Over the Rhône",
    year: "1888",
    medium: "Oil on canvas · 72.5 × 92 cm",
    location: "Musée d'Orsay, Paris",
    backstory:
      "Painted at night on the banks of the Rhône in Arles. Van Gogh set up his easel in the dark, attaching candles to his hat and easel. The reflections of the gas lamps in the water were a technical challenge he was proud of. The two figures in the foreground are believed to be himself and Gauguin.",
    palette: ["#0a1040", "#102080", "#c0a020", "#f0e060", "#203060"],
  },
  "sunflowers.png": {
    title: "Sunflowers",
    year: "1888",
    medium: "Oil on canvas · 92.1 × 73 cm",
    location: "National Gallery, London",
    backstory:
      "Part of a series Van Gogh created to decorate Gauguin's room in the Yellow House. He painted seven versions, considering sunflowers his personal symbol — 'gratitude'. The London version was nearly destroyed in WWII. In 2022, climate activists threw tomato soup on the glass-protected work.",
    palette: ["#e0a010", "#f0c020", "#c07010", "#f5d840", "#a06010"],
  },
  "self_portrait.png": {
    title: "Self-Portrait",
    year: "1889",
    medium: "Oil on canvas · 65 × 54 cm",
    location: "Musée d'Orsay, Paris",
    backstory:
      "One of over 35 self-portraits Van Gogh made — more than almost any artist before photography. He used himself as a model because he couldn't afford to pay others. This version, with swirling blue background, was painted after his release from the asylum and is considered his psychological finest.",
    palette: ["#1a3060", "#4060a0", "#c08030", "#e0a050", "#203050"],
  },
  "the_yellow_house.png": {
    title: "The Yellow House",
    year: "1888",
    medium: "Oil on canvas · 72 × 91.5 cm",
    location: "Van Gogh Museum, Amsterdam",
    backstory:
      "Depicts the house at 2 Place Lamartine in Arles where Van Gogh lived and where he hoped to establish an artists' colony. He painted it to show Gauguin what awaited him. The Yellow House was destroyed in a WWII bombing raid in 1944. Gauguin arrived two months after this painting was completed.",
    palette: ["#e0c010", "#f0d020", "#4080c0", "#204080", "#c0a010"],
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function PaintingInfoPanel({ imageUrl, visible, artTitle }) {
  const filename = imageUrl ? imageUrl.split("/").pop() : null;
  const data = filename ? PAINTING_DATA[filename] : null;

  return (
    <div
      style={{
        position: "absolute",
        bottom: 90,
        left: 28,
        width: 300,
        pointerEvents: "none",
        transition: "opacity 0.35s ease, transform 0.35s ease",
        opacity: visible && data ? 1 : 0,
        transform: visible && data ? "translateY(0)" : "translateY(16px)",
        zIndex: 30,
      }}
    >
      {data && (
        <div
          style={{
            background: "rgba(8,6,4,0.72)",
            backdropFilter: "blur(22px) saturate(1.6)",
            WebkitBackdropFilter: "blur(22px) saturate(1.6)",
            border: "1px solid rgba(200,162,84,0.18)",
            borderRadius: 14,
            padding: "18px 20px 16px",
            boxShadow:
              "0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          {/* Title + year */}
          <div style={{ marginBottom: 10 }}>
            <p
              style={{
                margin: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic",
                fontSize: 20,
                fontWeight: 600,
                color: "#f5ead8",
                lineHeight: 1.1,
              }}
            >
              {data.title}
            </p>
            <p
              style={{
                margin: "4px 0 0",
                fontFamily: "monospace",
                fontSize: 10,
                color: "#c8a254",
                letterSpacing: "0.12em",
              }}
            >
              {data.year} · {data.medium}
            </p>
            <p
              style={{
                margin: "2px 0 0",
                fontFamily: "monospace",
                fontSize: 9,
                color: "rgba(255,255,255,0.35)",
                letterSpacing: "0.10em",
              }}
            >
              📍 {data.location}
            </p>
          </div>

          {/* Gold divider */}
          <div
            style={{
              width: "100%",
              height: 1,
              background: "linear-gradient(90deg, #c8a254, transparent)",
              marginBottom: 10,
            }}
          />

          {/* Backstory */}
          <p
            style={{
              margin: 0,
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 12.5,
              lineHeight: 1.65,
              color: "rgba(245,234,216,0.78)",
              fontStyle: "normal",
            }}
          >
            {data.backstory}
          </p>

          {/* Colour palette swatches */}
          <div
            style={{
              display: "flex",
              gap: 5,
              marginTop: 12,
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontFamily: "monospace",
                fontSize: 8,
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginRight: 4,
              }}
            >
              Palette
            </span>
            {data.palette.map((col) => (
              <div
                key={col}
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 3,
                  background: col,
                  border: "1px solid rgba(255,255,255,0.12)",
                  boxShadow: `0 0 6px ${col}55`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
