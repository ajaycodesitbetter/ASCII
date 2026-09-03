import type { EditorState } from "./Sidebar";

// ─── Export presets ───────────────────────────────────────────────────────────
export const EXPORT_PRESETS: Record<string, Partial<EditorState>> = {
  "Classic": {
    artStyle: "Classic ASCII",
    characters: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    colorMode: "Grayscale", fgColor: "#ffffff", bgColor: "#000000",
    ditherAlgorithm: "None", fxPreset: "None", contrast: 1.1, brightness: 0,
  },
  "Matrix": {
    artStyle: "Classic ASCII",
    characters: " 01",
    colorMode: "Matrix Green", fgColor: "#00ff41", bgColor: "#000000",
    ditherAlgorithm: "Floyd-Steinberg", ditherStrength: 0.8,
    fxPreset: "Matrix Rain", fxStrength: 0.8, contrast: 1.3, brightness: 5,
  },
  "Braille": {
    artStyle: "Braille",
    characters: " ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⣿",
    colorMode: "Grayscale", fgColor: "#ffffff", bgColor: "#000000",
    ditherAlgorithm: "Floyd-Steinberg", ditherStrength: 1.0,
    fxPreset: "None", contrast: 1.2, brightness: 0,
  },
  "Glitch": {
    artStyle: "Classic ASCII",
    characters: " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
    colorMode: "Full Color", fgColor: "#ffffff", bgColor: "#050505",
    ditherAlgorithm: "Atkinson", ditherStrength: 0.7,
    fxPreset: "Glitch", fxStrength: 0.8, contrast: 1.4, brightness: 10,
  },
};

const RANDOM_FX     = ["None","Noise Field","Intervals","Beam Sweep","CRT Monitor","Matrix Rain"];
const RANDOM_DITHER = ["None","Floyd-Steinberg","Bayer (Ordered)","Atkinson"];
const RANDOM_COLORS = ["Grayscale","Full Color","Matrix Green","Amber Monitor","Paper Print"];

const COLOR_PALETTES: Record<string, { fg: string; bg: string }> = {
  "Grayscale":     { fg: "#ffffff", bg: "#000000" },
  "Full Color":    { fg: "#ffffff", bg: "#000000" },
  "Matrix Green":  { fg: "#00ff41", bg: "#000000" },
  "Amber Monitor": { fg: "#ffbf00", bg: "#000000" },
  "Paper Print":   { fg: "#0d0d0d", bg: "#fafaf7" },
};

export function buildRandomPatch(): Partial<EditorState> {
  const colorMode = RANDOM_COLORS[Math.floor(Math.random() * RANDOM_COLORS.length)];
  const { fg, bg } = COLOR_PALETTES[colorMode] ?? { fg: "#ffffff", bg: "#000000" };
  return {
    fxPreset:        RANDOM_FX[Math.floor(Math.random() * RANDOM_FX.length)],
    fxStrength:      0.4 + Math.random() * 0.5,
    colorMode,       fgColor: fg, bgColor: bg,
    ditherAlgorithm: RANDOM_DITHER[Math.floor(Math.random() * RANDOM_DITHER.length)],
    ditherStrength:  0.3 + Math.random() * 0.9,
    contrast:        0.8 + Math.random() * 0.8,
    brightness:      Math.round((Math.random() - 0.5) * 30),
  };
}

// ─── Props ────────────────────────────────────────────────────────────────────
interface ExportPanelProps {
  open:            boolean;
  onClose:         () => void;
  editor:          EditorState;
  onApplyPreset:   (patch: Partial<EditorState>) => void;
  onRandom:        () => void;
  onDownloadImage: (format: string, scaleFactor: number, transparent: boolean) => void;
}

const mono: React.CSSProperties = {
  fontFamily: "DM Mono, monospace",
  letterSpacing: "0.08em",
};
const labelStyle: React.CSSProperties = {
  ...mono, fontSize: 9, textTransform: "uppercase" as const, color: "#555",
};
const valueStyle: React.CSSProperties = {
  ...mono, fontSize: 10, color: "#c8b400",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #0f0f0f" }}>
      <span style={labelStyle}>{label}</span>
      <span style={{ ...valueStyle, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
        {value}
      </span>
    </div>
  );
}

export function ExportPanel({ open, onClose, editor, onApplyPreset, onRandom, onDownloadImage }: ExportPanelProps) {
  if (!open) return null;

  const presetKeys = Object.keys(EXPORT_PRESETS);

  const rows = [
    { label: "FMT",   value: "ASCII Canvas" },
    { label: "STYLE", value: editor.artStyle || "Classic ASCII" },
    { label: "FONT",  value: editor.fontFamily },
    { label: "AR",    value: "Auto" },
    { label: "FX",    value: editor.fxPreset },
    { label: "BG",    value: (editor.bgColor || "#000000").toUpperCase() },
    { label: "RES",   value: `${editor.quality}P` },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "fixed", inset: 0, zIndex: 99, background: "rgba(0,0,0,0.6)" }}
      />

      {/* Panel */}
      <div role="dialog" aria-modal="true" aria-label="Export" style={{
        position: "fixed", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        zIndex: 100, width: 380,
        background: "#0a0a0a", border: "1px solid #2a2a2a",
        padding: "22px 24px 20px",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <span style={{ ...mono, fontSize: 12, letterSpacing: "0.2em", textTransform: "uppercase" as const, color: "#c8b400" }}>
            EXPORT
          </span>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 16, lineHeight: 1, padding: "2px 6px" }}
          >✕</button>
        </div>

        {/* Info grid */}
        <div style={{ marginBottom: 20 }}>
          {rows.map(r => <InfoRow key={r.label} label={r.label} value={r.value} />)}
        </div>

        {/* Presets */}
        <div style={{ marginBottom: 16 }}>
          <span style={{ ...labelStyle, display: "block", marginBottom: 8 }}>PRESETS</span>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
            {presetKeys.map(key => (
              <button
                key={key}
                onClick={() => onApplyPreset(EXPORT_PRESETS[key])}
                style={{
                  ...mono, fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase" as const,
                  color: "#888", background: "transparent",
                  border: "1px solid #2a2a2a", padding: "6px 14px",
                  cursor: "pointer", outline: "none", borderRadius: 0,
                  transition: "border-color 0.12s, color 0.12s",
                }}
                onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = "#c8b400"; b.style.color = "#c8b400"; }}
                onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = "#2a2a2a"; b.style.color = "#888"; }}
              >
                {key}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onRandom}
            style={{
              ...mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" as const,
              color: "#888", background: "transparent",
              border: "1px solid #2a2a2a", padding: "10px 0",
              cursor: "pointer", outline: "none", borderRadius: 0, flex: 1,
              transition: "border-color 0.12s, color 0.12s",
            }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = "#555"; b.style.color = "#ccc"; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = "#2a2a2a"; b.style.color = "#888"; }}
          >
            ⟳ RANDOM
          </button>
          <button
            onClick={() => { onDownloadImage("png", 1, false); onClose(); }}
            style={{
              ...mono, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase" as const,
              color: "#000", background: "#c8b400",
              border: "1px solid #c8b400", padding: "10px 0",
              cursor: "pointer", outline: "none", borderRadius: 0, flex: 2,
              fontWeight: 700, transition: "background 0.12s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#e0c800"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#c8b400"; }}
          >
            EXPORT PNG
          </button>
        </div>
      </div>
    </>
  );
}
