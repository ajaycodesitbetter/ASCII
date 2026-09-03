import { useRef } from "react";
import { SliderRow } from "./SliderRow";
import { Checkbox } from "./ui/checkbox";

// ─── Character sets ───────────────────────────────────────────────────────────
export const CHAR_SETS: Record<string, string> = {
  "Standard":    " .:-=+*#%@",
  "Blocks":      " ░▒▓█",
  "Detailed":    " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  "Minimal":     " .:-=+*#%@",
  "Binary":      " 01",
  "Letters A-Z": " ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  "Letters a-z": " abcdefghijklmnopqrstuvwxyz",
  "Letters Aa":  " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  "Symbols":     " !@#$%^&*()_+-=[]{}|;':\",./<>?",
  "Custom":      "",
};

// ─── Color modes ──────────────────────────────────────────────────────────────
export const COLOR_MODES: Record<string, { fg: string; bg: string }> = {
  "Grayscale":     { fg: "#ffffff", bg: "#000000" },
  "Full Color":    { fg: "#ffffff", bg: "#000000" },
  "Matrix Green":  { fg: "#00ff41", bg: "#000000" },
  "Amber Monitor": { fg: "#ffbf00", bg: "#000000" },
  "Paper Print":   { fg: "#0d0d0d", bg: "#fafaf7" },
  "Custom":        { fg: "#ffffff", bg: "#000000" },
};

// ─── Art style → visually distinct character sets ─────────────────────────────
export const ART_STYLE_CHARS: Record<string, string> = {
  "Classic ASCII": " .,:;i1tfLC08@",
  "Braille":       " ⠁⠂⠃⠄⠅⠆⠇⠈⠉⠊⠋⠌⠍⠎⠏⠐⠑⠒⠓⠔⠕⠖⠗⠘⠙⠚⠛⠜⠝⠞⠟⠠⠡⠢⠣⠤⠥⠦⠧⠨⠩⠪⠫⠬⠭⠮⠯⠰⠱⠲⠳⠴⠵⠶⠷⠸⠹⠺⠻⠼⠽⠾⠿⣿",
  "Halftone":      " ·∘○◎●",
  "Dot Cross":     " ·+×⊕●",
  "Line":          " ─│╱╲╳═║╬",
  "Particles":     " .·∙•",
  "Claude Code":   " 01",
  "Retro Art":     " .oO0@",
  "Terminal":      " .:-=+|*#%@",
};

// ─── FX preset → param patches ────────────────────────────────────────────────
export const FX_PRESET_PARAMS: Record<string, Partial<EditorState>> = {
  "None":         { fxStrength: 0.45, noiseScale: 24, noiseSpeed: 1 },
  "Noise Field":  { fxStrength: 0.7,  noiseScale: 24, noiseSpeed: 1 },
  "Intervals":    { fxStrength: 0.5,  noiseScale: 24, noiseSpeed: 1 },
  "Beam Sweep":   { fxStrength: 0.5,  noiseScale: 24, noiseSpeed: 0.5 },
  "Glitch":       { fxStrength: 0.8,  noiseScale: 24, noiseSpeed: 2 },
  "CRT Monitor":  { fxStrength: 0.7,  noiseScale: 24, noiseSpeed: 0.5 },
  "Matrix Rain":  { fxStrength: 0.8,  noiseScale: 24, noiseSpeed: 2, colorMode: "Matrix Green", fgColor: "#00ff41", bgColor: "#000000" },
};

// ─── EditorState ──────────────────────────────────────────────────────────────
export interface EditorState {
  // Source
  sourceTab:    string;  // "IMAGE/VIDEO" | "LIVE CAM"
  quality:      string;  // "320" | "480" | "720"
  // Characters
  characters:       string;
  charSetKey:       string;
  customCharacters: string;
  artStyle:         string;
  // Font
  fontFamily:  string;
  fontSize:    number;  // 6–20
  charSpacing: number;  // 0.7–2
  // Luminance (spec formulas operate in 0-255 space)
  brightness:  number;  // -50 to 50
  contrast:    number;  // 0.5 to 2.5
  // Dither
  ditherAlgorithm: string;
  ditherStrength:  number;  // 0–2
  bgDither:        number;  // 0–3
  invDither:       number;  // 0–3
  // Color
  colorMode:    string;
  fgColor:      string;
  bgColor:      string;
  invert:       boolean;
  customFgColor: string;
  customBgColor: string;
  // Post-process
  vignette:   number;  // 0–1
  borderGlow: number;  // 0–1
  opacity:    number;  // 0–1
  // FX
  fxPreset:  string;
  fxStrength: number;  // 0.05–1
  direction:  string;
  noiseScale: number;  // 4–96
  noiseSpeed: number;  // 0–3
  // Mouse interaction
  mouseMode:     string;
  hoverStrength: number;  // 4–64
  areaSize:      number;  // 40–640
  spread:        number;  // 0.25–3
}

// ─── Shared styles ────────────────────────────────────────────────────────────
const sLabel: React.CSSProperties = {
  fontFamily: "DM Mono, monospace",
  fontSize: 9, letterSpacing: "0.15em",
  textTransform: "uppercase", color: "#555555",
  marginBottom: 10, display: "block",
};
const divider: React.CSSProperties = { borderBottom: "1px solid #1f1f1f", padding: "12px 14px" };
const selectStyle: React.CSSProperties = {
  width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a",
  color: "#ffffff", fontFamily: "DM Mono, monospace", fontSize: 10,
  letterSpacing: "0.08em", padding: "6px 8px", outline: "none",
  cursor: "pointer", appearance: "none", borderRadius: 0,
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontFamily:"DM Mono, monospace", fontSize:10, letterSpacing:"0.1em",
      textTransform:"uppercase", color:active?"#C8B400":"#666",
      background:"transparent", border:`1px solid ${active?"#C8B400":"#2a2a2a"}`,
      padding:"5px 10px", cursor:"pointer", outline:"none",
      whiteSpace:"nowrap", borderRadius:0, transition:"border-color 0.12s, color 0.12s",
    }}
      onMouseEnter={e=>{if(!active){const b=e.currentTarget as HTMLButtonElement;b.style.borderColor="#444";b.style.color="#aaa";}}}
      onMouseLeave={e=>{if(!active){const b=e.currentTarget as HTMLButtonElement;b.style.borderColor="#2a2a2a";b.style.color="#666";}}}
    >{label}</button>
  );
}

function GridBtn({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      fontFamily:"DM Mono, monospace", fontSize:9, letterSpacing:"0.05em",
      textTransform:"uppercase", color:active?"#C8B400":"#555",
      background:active?"#0d0d0d":"transparent",
      border:`1px solid ${active?"#C8B400":"#1f1f1f"}`,
      padding:"7px 4px", cursor:"pointer", outline:"none",
      textAlign:"center", borderRadius:0, transition:"border-color 0.12s, color 0.12s",
    }}
      onMouseEnter={e=>{if(!active){const b=e.currentTarget as HTMLButtonElement;b.style.borderColor="#333";b.style.color="#888";}}}
      onMouseLeave={e=>{if(!active){const b=e.currentTarget as HTMLButtonElement;b.style.borderColor="#1f1f1f";b.style.color="#555";}}}
    >{label}</button>
  );
}

function SourceTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{
      flex:1, fontFamily:"DM Mono, monospace", fontSize:11,
      letterSpacing:"0.12em", fontWeight:active?700:400,
      textTransform:"uppercase", color:active?"#C8B400":"#555",
      background:active?"#0d0d0d":"transparent",
      border:`1px solid ${active?"#C8B400":"#2a2a2a"}`,
      padding:"10px 0", cursor:"pointer", outline:"none",
      borderRadius:0, transition:"all 0.12s",
    }}>{label}</button>
  );
}

// ─── Sidebar props ────────────────────────────────────────────────────────────
interface SidebarProps {
  editor:         EditorState;
  setEditor:      React.Dispatch<React.SetStateAction<EditorState>>;
  onFileUpload:   (url: string, filename: string) => void;
  onWebcamToggle: () => void;
  onAddLayer:     () => void;
  uploadedFilename: string | null;
  uploadError:      string | null;
  webcamActive:     boolean;
  webcamPending:    boolean;
  webcamError:      string | null;
}

const artStyles  = ["Classic ASCII","Braille","Halftone","Dot Cross","Line","Particles","Claude Code","Retro Art","Terminal"];
const fxPresets  = ["None","Noise Field","Intervals","Beam Sweep","Glitch","CRT Monitor","Matrix Rain"];
const dirGrid    = ["↖","↑","↗","←","","→","↙","↓","↘"];
const dirKeys    = ["tl","up","tr","left","","right","bl","down","br"];
const fonts      = ["Helvetica Neue","Inter","Poppins","Space Grotesk","VT323 (Pixel)"];
const ditherAlgs = ["None","Floyd-Steinberg","Bayer (Ordered)","Atkinson"];
const charSetKeys   = Object.keys(CHAR_SETS);
const colorModeKeys = Object.keys(COLOR_MODES);

function upd<K extends keyof EditorState>(set: React.Dispatch<React.SetStateAction<EditorState>>, key: K, val: EditorState[K]) {
  set(prev => ({ ...prev, [key]: val }));
}

export function Sidebar({
  editor, setEditor,
  onFileUpload, onWebcamToggle, onAddLayer,
  uploadedFilename, uploadError,
  webcamActive, webcamPending, webcamError,
}: SidebarProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file.size > 1_048_576) {
      onFileUpload("", "__ERROR__1MB limit exceeded");
      return;
    }
    const url = URL.createObjectURL(file);
    onFileUpload(url, file.name);
    setEditor(prev => ({ ...prev, sourceTab: "IMAGE/VIDEO" }));
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleColorMode = (mode: string) => {
    const safeMode = COLOR_MODES[mode] ? mode : "Grayscale";
    const palette  = COLOR_MODES[safeMode] ?? { fg: "#ffffff", bg: "#000000" };
    const fg = safeMode === "Custom" ? editor.customFgColor || palette.fg : palette.fg;
    const bg = safeMode === "Custom" ? editor.customBgColor || palette.bg : palette.bg;
    setEditor(prev => ({ ...prev, colorMode: safeMode, fgColor: fg, bgColor: bg }));
  };

  const handleCharSet = (key: string) => {
    const chars = key === "Custom" ? editor.customCharacters : (CHAR_SETS[key] ?? "");
    setEditor(prev => ({ ...prev, charSetKey: key, characters: chars }));
  };

  const handleArtStyle = (style: string) => {
    const chars = ART_STYLE_CHARS[style] ?? editor.characters;
    setEditor(prev => ({ ...prev, artStyle: style, characters: chars, charSetKey: "Custom", customCharacters: chars }));
  };

  const handleFxPreset = (fx: string) => {
    const patch = FX_PRESET_PARAMS[fx] ?? {};
    setEditor(prev => ({ ...prev, fxPreset: fx, ...patch }));
  };

  const handleSourceTab = (tab: string) => {
    if (tab === "LIVE CAM" && !webcamActive && !webcamPending) onWebcamToggle();
    if (tab !== "LIVE CAM" && (webcamActive || webcamPending)) onWebcamToggle();
    setEditor(prev => ({ ...prev, sourceTab: tab }));
  };

  return (
    <aside style={{
      width:300, flexShrink:0, height:"100%",
      overflowY:"auto", overflowX:"hidden",
      background:"#000000", borderRight:"1px solid #1f1f1f",
      scrollbarWidth:"thin", scrollbarColor:"#1f1f1f #000",
    }}>

      {/* [1] SOURCE ──────────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Source</span>
        <div style={{ display:"flex", gap:0, marginBottom:10, alignItems:"stretch" }}>
          <SourceTab label="IMAGE / VIDEO" active={editor.sourceTab==="IMAGE/VIDEO"} onClick={() => handleSourceTab("IMAGE/VIDEO")} />
          <div style={{ width:1, background:"#1f1f1f", flexShrink:0 }} />
          <SourceTab label="LIVE CAM" active={editor.sourceTab==="LIVE CAM"} onClick={() => handleSourceTab("LIVE CAM")} />
        </div>
        <div style={{ marginBottom:10 }}>
          <span style={{ ...sLabel, marginBottom:4, fontSize:8 }}>QUALITY</span>
          <div style={{ position:"relative" }}>
            <select value={editor.quality} onChange={e => upd(setEditor,"quality",e.target.value)}
              style={{ ...selectStyle, padding:"5px 22px 5px 8px" }}>
              {["320","480","720"].map(q => <option key={q} value={q} style={{ background:"#0d0d0d" }}>{q}P</option>)}
            </select>
            <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#555", fontSize:8, pointerEvents:"none" }}>▾</span>
          </div>
        </div>

        {editor.sourceTab === "LIVE CAM" && (
          <div style={{ marginBottom:8, fontFamily:"DM Mono, monospace", fontSize:9, color: webcamActive?"#C8B400":"#555", letterSpacing:"0.1em", textTransform:"uppercase" }}>
            {webcamActive ? "● WEBCAM ACTIVE" : webcamError ? `○ ${webcamError}` : "○ WAITING FOR PERMISSION…"}
          </div>
        )}

        {editor.sourceTab === "IMAGE/VIDEO" && (
          <>
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLDivElement).style.borderColor="#666"; }}
              onDragLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="#2a2a2a"; }}
              style={{
                width:"100%", height:80, background:"#0d0d0d",
                border:"1px dashed #2a2a2a", display:"flex",
                flexDirection:"column", alignItems:"center",
                justifyContent:"center", cursor:"pointer", gap:4,
                transition:"border-color 0.12s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor="#444"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor="#2a2a2a"; }}
            >
              <span style={{ fontFamily:"DM Mono, monospace", fontSize:11, color:"#aaa", letterSpacing:"0.04em" }}>
                {uploadedFilename ?? "Drop image/video or click to browse"}
              </span>
              <span style={{ fontFamily:"DM Mono, monospace", fontSize:9, color:uploadError?"#ff4444":"#444", letterSpacing:"0.04em" }}>
                {uploadError ?? "JPG, PNG, GIF, MP4, WebM · Max 1 MB"}
              </span>
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display:"none" }} onChange={handleFileInput} />
          </>
        )}
      </div>

      {/* [2] LAYER ───────────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Layer</span>
        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
          <div style={{ border:"1px solid #C8B400", padding:"5px 14px", fontFamily:"DM Mono, monospace", fontSize:10, letterSpacing:"0.1em", color:"#C8B400", textTransform:"uppercase", userSelect:"none" }}>
            ASCII
          </div>
          <button onClick={onAddLayer} style={{ border:"1px solid #2a2a2a", padding:"5px 14px", fontFamily:"DM Mono, monospace", fontSize:10, letterSpacing:"0.1em", color:"#555", textTransform:"uppercase", background:"transparent", cursor:"pointer", outline:"none", borderRadius:0 }}>
            + ADD LAYER
          </button>
        </div>
      </div>

      {/* [3] ART STYLE ───────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Art Style</span>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4 }}>
          {artStyles.map(s => (
            <GridBtn key={s} label={s} active={editor.artStyle===s} onClick={() => handleArtStyle(s)} />
          ))}
        </div>
      </div>

      {/* [4] FONT ────────────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Font</span>
        <div style={{ position:"relative" }}>
          <select value={editor.fontFamily} onChange={e => upd(setEditor,"fontFamily",e.target.value)} style={selectStyle}>
            {fonts.map(f => <option key={f} value={f} style={{ background:"#0d0d0d" }}>{f}</option>)}
          </select>
          <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#555", fontSize:10, pointerEvents:"none" }}>▾</span>
        </div>
      </div>

      {/* [5] CHARACTER SET ───────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Character Set</span>
        <div style={{ position:"relative", marginBottom:editor.charSetKey==="Custom"?8:0 }}>
          <select value={editor.charSetKey} onChange={e => handleCharSet(e.target.value)} style={selectStyle}>
            {charSetKeys.map(k => <option key={k} value={k} style={{ background:"#0d0d0d" }}>{k}</option>)}
          </select>
          <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#555", fontSize:10, pointerEvents:"none" }}>▾</span>
        </div>
        {editor.charSetKey==="Custom" && (
          <input
            type="text" value={editor.customCharacters}
            onChange={e => { const v=e.target.value; setEditor(prev=>({...prev,customCharacters:v,characters:v})); }}
            placeholder="Type custom characters…"
            style={{ width:"100%", background:"#0d0d0d", border:"1px solid #2a2a2a", color:"#fff", fontFamily:"DM Mono, monospace", fontSize:11, padding:"6px 8px", outline:"none", borderRadius:0, letterSpacing:"0.05em" }}
          />
        )}
      </div>

      {/* [6] DITHER ALGORITHM ────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Dither Algorithm</span>
        <div style={{ position:"relative" }}>
          <select value={editor.ditherAlgorithm} onChange={e => upd(setEditor,"ditherAlgorithm",e.target.value)} style={selectStyle}>
            {ditherAlgs.map(d => <option key={d} value={d} style={{ background:"#0d0d0d" }}>{d}</option>)}
          </select>
          <span style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#555", fontSize:10, pointerEvents:"none" }}>▾</span>
        </div>
      </div>

      {/* [7] ADJUSTMENTS ─────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Adjustments</span>
        <SliderRow label="Brightness"        value={editor.brightness}     min={-50} max={50}  step={1}    onChange={v=>upd(setEditor,"brightness",v)}     format={v=>(v>0?"+":"")+v} />
        <SliderRow label="Contrast"          value={editor.contrast}       min={0.5} max={2.5} step={0.01} onChange={v=>upd(setEditor,"contrast",v)} />
        <SliderRow label="Dither Strength"   value={editor.ditherStrength} min={0}   max={2}   step={0.01} onChange={v=>upd(setEditor,"ditherStrength",v)} />
        <SliderRow label="BG Dither"         value={editor.bgDither}       min={0}   max={3}   step={0.01} onChange={v=>upd(setEditor,"bgDither",v)} />
        <SliderRow label="Inverse Dither"    value={editor.invDither}      min={0}   max={3}   step={0.01} onChange={v=>upd(setEditor,"invDither",v)} />
        <SliderRow label="Vignette"          value={editor.vignette}       min={0}   max={1}   step={0.01} onChange={v=>upd(setEditor,"vignette",v)} />
        <SliderRow label="Border Glow"       value={editor.borderGlow}     min={0}   max={1}   step={0.01} onChange={v=>upd(setEditor,"borderGlow",v)} />
        <SliderRow label="Opacity"           value={editor.opacity}        min={0}   max={1}   step={0.01} onChange={v=>upd(setEditor,"opacity",v)} />
        <SliderRow label="Font Size"         value={editor.fontSize}       min={6}   max={20}  step={1}    onChange={v=>upd(setEditor,"fontSize",v)}       format={v=>v+"px"} />
        <SliderRow label="Character Spacing" value={editor.charSpacing}    min={0.7} max={2}   step={0.01} onChange={v=>upd(setEditor,"charSpacing",v)}    format={v=>v.toFixed(2)+"x"} />
      </div>

      {/* [8] COLOR MODE ──────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Color Mode</span>
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
          <Checkbox id="invert-color" checked={editor.invert} onCheckedChange={c=>upd(setEditor,"invert",c as boolean)} />
          <label htmlFor="invert-color" style={{ fontFamily:"DM Mono, monospace", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:"#888", cursor:"pointer" }}>
            Invert Color
          </label>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:4, marginBottom:editor.colorMode==="Custom"?10:0 }}>
          {colorModeKeys.map(mode => (
            <Pill key={mode} label={mode} active={editor.colorMode===mode} onClick={() => handleColorMode(mode)} />
          ))}
        </div>
        {editor.colorMode==="Custom" && (
          <div style={{ display:"flex", gap:8, marginTop:8 }}>
            {[
              { key:"customFgColor" as const, liveKey:"fgColor" as const, label:"FG", val:editor.customFgColor },
              { key:"customBgColor" as const, liveKey:"bgColor" as const, label:"BG", val:editor.customBgColor },
            ].map(({ key, liveKey, label, val }) => (
              <div key={label} style={{ flex:1 }}>
                <span style={{ ...sLabel, marginBottom:4 }}>{label}</span>
                <div style={{ display:"flex", alignItems:"center", gap:6, border:"1px solid #2a2a2a", padding:"4px 6px", background:"#0d0d0d" }}>
                  <input type="color" value={val}
                    onChange={e => { const c=e.target.value; setEditor(prev=>({...prev,[key]:c,[liveKey]:c})); }}
                    style={{ width:20, height:20, border:"none", background:"none", cursor:"pointer", padding:0 }}
                  />
                  <span style={{ fontFamily:"DM Mono, monospace", fontSize:9, color:"#888", letterSpacing:"0.08em" }}>{val.toUpperCase()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* [9] FX PRESET ───────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>FX Preset</span>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:4, marginBottom:12 }}>
          {fxPresets.map(fx => (
            <GridBtn key={fx} label={fx} active={editor.fxPreset===fx} onClick={() => handleFxPreset(fx)} />
          ))}
        </div>
        <SliderRow label="FX Strength" value={editor.fxStrength} min={0.05} max={1} step={0.01} onChange={v=>upd(setEditor,"fxStrength",v)} />
      </div>

      {/* [10] DIRECTION ──────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Direction</span>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 36px)", gap:3 }}>
          {dirGrid.map((arrow, i) => {
            const key    = dirKeys[i];
            const isEmpty = arrow === "";
            return (
              <button key={i} disabled={isEmpty}
                onClick={() => !isEmpty && upd(setEditor,"direction",key)}
                style={{
                  width:36, height:28, fontFamily:"DM Mono, monospace", fontSize:14,
                  color:isEmpty?"transparent":editor.direction===key?"#C8B400":"#444",
                  background:isEmpty?"#050505":"transparent",
                  border:`1px solid ${isEmpty?"#111":editor.direction===key?"#C8B400":"#1f1f1f"}`,
                  cursor:isEmpty?"default":"pointer", outline:"none",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"border-color 0.12s, color 0.12s", borderRadius:0,
                }}
                onMouseEnter={e=>{if(!isEmpty&&editor.direction!==key){const b=e.currentTarget as HTMLButtonElement;b.style.borderColor="#333";b.style.color="#888";}}}
                onMouseLeave={e=>{if(!isEmpty&&editor.direction!==key){const b=e.currentTarget as HTMLButtonElement;b.style.borderColor="#1f1f1f";b.style.color="#444";}}}
              >{arrow}</button>
            );
          })}
        </div>
      </div>

      {/* [11] NOISE ──────────────────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Noise</span>
        <SliderRow label="Noise Scale" value={editor.noiseScale} min={4}  max={96} step={1}    onChange={v=>upd(setEditor,"noiseScale",v)} format={v=>String(Math.round(v))} />
        <SliderRow label="Noise Speed" value={editor.noiseSpeed} min={0}  max={3}  step={0.01} onChange={v=>upd(setEditor,"noiseSpeed",v)} />
      </div>

      {/* [12] MOUSE INTERACTION ──────────────────────────────────────────────── */}
      <div style={divider}>
        <span style={sLabel}>Mouse Interaction</span>
        <div style={{ display:"flex", gap:4, marginBottom:12 }}>
          {["Attract","Push"].map(mode => (
            <Pill key={mode} label={mode} active={editor.mouseMode===mode} onClick={() => upd(setEditor,"mouseMode",mode)} />
          ))}
        </div>
        <SliderRow label="Hover Strength" value={editor.hoverStrength} min={4}    max={64}  step={1}    onChange={v=>upd(setEditor,"hoverStrength",v)} format={v=>String(Math.round(v))} />
        <SliderRow label="Area Size"      value={editor.areaSize}      min={40}   max={640} step={10}   onChange={v=>upd(setEditor,"areaSize",v)}     format={v=>Math.round(v)+"px"} />
        <SliderRow label="Spread"         value={editor.spread}        min={0.25} max={3}   step={0.01} onChange={v=>upd(setEditor,"spread",v)}       format={v=>v.toFixed(2)+"x"} />
      </div>

      <div style={{ height:24 }} />
    </aside>
  );
}
