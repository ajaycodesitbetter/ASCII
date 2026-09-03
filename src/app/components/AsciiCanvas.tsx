import { useEffect, useRef, useCallback } from "react";
import type { EditorState } from "./Sidebar";

// ─── Constants ────────────────────────────────────────────────────────────────
const BAYER_4x4 = [[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];
const TAU = Math.PI * 2;

// Braille: sub-pixel [row 0-3][col 0-1] → bit value in U+28xx codepoint
const BRAILLE_BITS = [[1,8],[2,16],[4,32],[64,128]] as const;

// Sobel directional character lookup (8 gradient-angle sectors → edge-line char)
// sector 0 = gradient pointing right → vertical edge
const LINE_CHARS = ['│','╱','─','╲','│','╱','─','╲'] as const;

// Dot-cross 5-level chars (empty → small → medium → large → solid)
const DOT_CROSS_CHARS = [' ','·','+','⊕','●'] as const;

const GRID_COLS: Record<string, number> = { "320": 110, "480": 140, "720": 170 };

const FONT_DENSITY: Record<string, number> = {
  "DM Mono":        1.0,
  "Courier New":    0.95,
  "VT323 (Pixel)":  0.84,
  "Helvetica Neue": 1.0,
  "Arial":          1.0,
  "Inter":          1.0,
  "Poppins":        1.0,
  "Space Grotesk":  1.0,
};

// Per-font aspect correction for charH (row height multiplier).
// VT323 glyphs are narrower/taller than standard monospace → rows need to be
// shorter to avoid vertical stretch.  1.0 = no correction.
const FONT_ASPECT: Record<string, number> = {
  "VT323 (Pixel)": 0.82,
};

const FONT_MAP: Record<string, string> = {
  "Helvetica Neue": '"Helvetica Neue", Helvetica, Arial, sans-serif',
  "Inter":          "Inter, sans-serif",
  "Poppins":        "Poppins, sans-serif",
  "Space Grotesk":  '"Space Grotesk", sans-serif',
  "VT323 (Pixel)":  '"VT323", "Courier New", monospace',
  "DM Mono":        '"DM Mono", "Courier New", monospace',
  "Courier New":    '"Courier New", Courier, monospace',
};

const DIR_VEC: Record<string, [number, number]> = {
  up:[0,-1], down:[0,1], left:[-1,0], right:[1,0],
  tl:[-1,-1], tr:[1,-1], bl:[-1,1], br:[1,1], center:[0,0],
};

export type AsciiSource = HTMLImageElement | HTMLVideoElement | null;

// ─── Art modes ────────────────────────────────────────────────────────────────
// density  — character ramp mapped by luminance (Classic ASCII, Terminal, Retro Art, …)
// halftone — filled circle per cell, radius ∝ luminance
// braille  — 2×4 sub-pixel dot packing into U+28xx braille codepoints
// particles— sparse dots only at bright cells
// line     — Sobel edge direction → directional line characters
// dot-cross— 5-level threshold symbols ·+⊕●
type ArtMode = "density" | "halftone" | "braille" | "particles" | "line" | "dot-cross";

function getArtMode(artStyle: string): ArtMode {
  if (artStyle === "Halftone")   return "halftone";
  if (artStyle === "Braille")    return "braille";
  if (artStyle === "Particles")  return "particles";
  if (artStyle === "Line")       return "line";
  if (artStyle === "Dot Cross")  return "dot-cross";
  return "density";
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  source:  AsciiSource;
  editor:  EditorState;
  onFps?:  (fps: number) => void;
}

// ─── Offscreen refs (two canvases: normal resolution + braille hi-res) ────────
interface OffscreenRefs {
  main:    HTMLCanvasElement | null;
  braille: HTMLCanvasElement | null;
  histLo:  number;  // EMA-smoothed low percentile for webcam tonal remap
  histHi:  number;  // EMA-smoothed high percentile for webcam tonal remap
}

// ─── Braille render path ──────────────────────────────────────────────────────
// Samples at cols×2, rows×4 so each braille character covers a 2×4 pixel block.
function renderBraille(
  ctx:       CanvasRenderingContext2D,
  source:    AsciiSource,
  editor:    EditorState,
  cols:      number,
  rows:      number,
  colStride: number,
  rowStride: number,
  W: number, H: number,
  offRefs:   OffscreenRefs,
  mouse:     { x: number; y: number } | null,
  dpr:       number,
  fontStr:   string,
  fontSize:  number,
  t:         number,
) {
  const sCols = cols * 2;
  const sRows = rows * 4;

  if (!offRefs.braille) offRefs.braille = document.createElement("canvas");
  const off = offRefs.braille;
  if (off.width !== sCols || off.height !== sRows) { off.width = sCols; off.height = sRows; }
  const offCtx = off.getContext("2d")!;
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = "high";
  offCtx.drawImage(source as CanvasImageSource, 0, 0, sCols, sRows);

  let imgData: ImageData;
  try { imgData = offCtx.getImageData(0, 0, sCols, sRows); } catch { return; }
  const data = imgData.data;

  // Per sub-pixel luminance with B/C applied (spec formulas)
  const subLum = new Float32Array(sCols * sRows);
  for (let i = 0; i < sCols * sRows; i++) {
    const L = 0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2];
    const Lp = Math.max(0, Math.min(255, ((L - 128) * editor.contrast) + 128 + editor.brightness));
    subLum[i] = Lp / 255;
  }

  // Vignette on sub-pixel grid
  if (editor.vignette > 0) {
    for (let sr = 0; sr < sRows; sr++) {
      for (let sc = 0; sc < sCols; sc++) {
        const nx = (sc / sCols) * 2 - 1;
        const ny = (sr / sRows) * 2 - 1;
        const d  = Math.min(1, Math.sqrt(nx*nx + ny*ny) / Math.SQRT2);
        subLum[sr * sCols + sc] *= Math.max(0, 1 - editor.vignette * d * d * 2.5);
      }
    }
  }

  // ── Histogram-aware tonal remap (mirrors renderFrame) ─────────────────────
  {
    const hist = new Uint32Array(256);
    for (let i = 0; i < subLum.length; i++) hist[Math.min(255, Math.round(subLum[i] * 255))]++;
    const total = subLum.length;
    let lo = 0, hi = 255, cumLo = 0, cumHi = 0;
    for (let b = 0; b < 256; b++) { cumLo += hist[b]; if (cumLo / total < 0.008) lo = b; }
    for (let b = 255; b >= 0; b--) { cumHi += hist[b]; if (cumHi / total < 0.008) hi = b; }
    let loN = lo / 255, hiN = hi / 255;
    if (editor.sourceTab === "LIVE CAM") {
      offRefs.histLo = 0.9 * offRefs.histLo + 0.1 * loN;
      offRefs.histHi = 0.9 * offRefs.histHi + 0.1 * hiN;
      loN = offRefs.histLo;
      hiN = offRefs.histHi;
    }
    const range = Math.max(hiN - loN, 0.01);
    for (let i = 0; i < subLum.length; i++) {
      subLum[i] = Math.max(0, Math.min(1, (subLum[i] - loN) / range));
    }
  }

  // Dot threshold — inverted mode flips which dots light up
  const threshold = 0.5;

  const fxActive  = editor.fxPreset !== "None" && editor.fxStrength > 0;
  const fx        = editor.fxStrength;
  const nsp       = editor.noiseSpeed;
  const [dvx] = DIR_VEC[editor.direction] ?? [0, -1];

  ctx.fillStyle = editor.bgColor || "#000000";
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = editor.opacity;
  ctx.font = `${fontSize}px ${fontStr}`;
  ctx.textBaseline = "top";

  const fullColor = editor.colorMode === "Full Color";
  if (!fullColor) ctx.fillStyle = editor.fgColor || "#ffffff";

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Per-cell FX luminance additive modifier
      let fxLumAdd = 0;
      if (fxActive) {
        switch (editor.fxPreset) {
          case "Beam Sweep": {
            const bPos   = (Math.sin(t * nsp * 0.8) * 0.5 + 0.5) * (dvx !== 0 ? cols : rows);
            const bCoord = dvx !== 0 ? col : row;
            const bDist  = Math.abs(bCoord - bPos);
            if (bDist < 8) fxLumAdd = (1 - bDist / 8) * 0.7 * fx;
            break;
          }
          case "Intervals": {
            const period = Math.max(2, Math.ceil(12 / fx));
            if ((col + row + Math.floor(t * nsp * 4)) % period === 0) fxLumAdd = 0.45 * fx;
            break;
          }
          case "CRT Monitor":
            if (row % 2 === 0) fxLumAdd = -0.3 * fx;
            break;
          case "Matrix Rain":
            // handled per sub-pixel in the inner loop
            break;
          case "Glitch":
            if (row % 9 === Math.floor(t * nsp * 3) % 9) fxLumAdd = 0.4 * fx;
            break;
        }
      }

      let code = 0x2800;
      for (let sr = 0; sr < 4; sr++) {
        for (let sc = 0; sc < 2; sc++) {
          const si = (row * 4 + sr) * sCols + (col * 2 + sc);
          let l = subLum[si];
          // Apply FX (Matrix Rain has special override logic)
          if (editor.fxPreset === "Matrix Rain" && fxActive) {
            const speed   = nsp * fx * 10;
            const colSeed = (col * 2971) % rows;
            const rainRow = (colSeed + Math.floor(t * speed)) % rows;
            const trail   = (rainRow - row + rows) % rows;
            l = trail === 0 ? 1 : trail < 6 ? 0.7 * (1 - trail / 6) : l * 0.15;
          } else {
            l = Math.max(0, Math.min(1, l + fxLumAdd));
          }
          l = editor.invert ? (1 - l) : l;
          if (l > threshold) code |= BRAILLE_BITS[sr][sc];
        }
      }
      // U+2800 is blank braille — skip
      if (code === 0x2800) continue;

      let px = col * colStride;
      let py = row * rowStride;

      if (mouse) {
        const cx = px + colStride * 0.5, cy = py + rowStride * 0.5;
        const dx = cx - mouse.x, dy = cy - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < editor.areaSize * dpr && dist > 0.1) {
          const force = (1 - dist / (editor.areaSize * dpr)) * editor.hoverStrength * 0.4 * editor.spread;
          const sign  = editor.mouseMode === "Attract" ? -1 : 1;
          px += sign * (dx / dist) * force;
          py += sign * (dy / dist) * force;
        }
      }

      if (fullColor) {
        // Average a 2×2 sub-pixel block for stable color in Full Color braille
        let sr_r = 0, sg_r = 0, sb_r = 0;
        for (let dr = 1; dr <= 2; dr++) {
          for (let dc = 0; dc <= 1; dc++) {
            const ci = ((row * 4 + dr) * sCols + col * 2 + dc) * 4;
            sr_r += data[ci]; sg_r += data[ci+1]; sb_r += data[ci+2];
          }
        }
        ctx.fillStyle = `rgb(${Math.round(sr_r/4)},${Math.round(sg_r/4)},${Math.round(sb_r/4)})`;
      }

      ctx.fillText(String.fromCodePoint(code), px, py);
    }
  }

  ctx.globalAlpha = 1;
  if (editor.borderGlow > 0) {
    ctx.save();
    ctx.shadowColor = editor.fgColor || "#ffffff";
    ctx.shadowBlur  = editor.borderGlow * 24 * dpr;
    ctx.strokeStyle = editor.fgColor || "#ffffff";
    ctx.lineWidth   = 1.5 * dpr;
    ctx.globalAlpha = editor.borderGlow * 0.6;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.restore();
  }
}

// ─── Main render function ─────────────────────────────────────────────────────
function renderFrame(
  canvas:   HTMLCanvasElement,
  source:   AsciiSource,
  editor:   EditorState,
  mouse:    { x: number; y: number } | null,
  t:        number,
  offRefs:  OffscreenRefs,
  dpr:      number,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const W = canvas.width;
  const H = canvas.height;

  // Placeholder when no source is ready
  if (!source || (source instanceof HTMLVideoElement && source.readyState < 2)) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#333";
    ctx.font = `${11 * dpr}px 'DM Mono', monospace`;
    ctx.textAlign = "center";
    ctx.fillText("Upload an image or enable webcam", W / 2, H / 2);
    ctx.textAlign = "left";
    return;
  }

  const artMode = getArtMode(editor.artStyle);

  // ── Grid geometry ──────────────────────────────────────────────────────────
  const fontSize  = Math.max(4, editor.fontSize) * dpr;
  const fontStr   = FONT_MAP[editor.fontFamily] ?? '"DM Mono", monospace';
  ctx.font = `${fontSize}px ${fontStr}`;

  // Accurate charW via measured glyph width
  const rawCharW = ctx.measureText("M").width;
  const charW    = Math.max(1, rawCharW * editor.charSpacing);

  // Accurate charH via actual font ascent + descent (falls back to 1.2× fontSize)
  const metrics   = ctx.measureText("Mg");
  const ascent    = (metrics as TextMetrics & { actualBoundingBoxAscent?: number }).actualBoundingBoxAscent ?? fontSize * 0.8;
  const descent   = (metrics as TextMetrics & { actualBoundingBoxDescent?: number }).actualBoundingBoxDescent ?? fontSize * 0.2;
  const fontAspect = FONT_ASPECT[editor.fontFamily] ?? 1.0;  // Fix #1: VT323 aspect correction
  const charH     = Math.max(6, Math.ceil((ascent + descent) * 1.05 * fontAspect));

  // Quality maps to a target column count; decoupled from source resolution
  const maxCols = GRID_COLS[String(editor.quality)] ?? 140;
  const cols = Math.min(Math.max(1, Math.ceil(W / charW)), maxCols);
  const rows = Math.min(Math.max(1, Math.ceil(H / charH)), Math.round(maxCols * (H / W)));

  // Physical stride per character cell in canvas pixels
  const colStride = W / cols;
  const rowStride = H / rows;

  // ── Braille is handled by a dedicated path ─────────────────────────────────
  if (artMode === "braille") {
    renderBraille(ctx, source, editor, cols, rows, colStride, rowStride, W, H, offRefs, mouse, dpr, fontStr, fontSize, t);
    return;
  }

  // ── Sample source into character-grid resolution (per-cell block average) ──
  // drawImage with imageSmoothingQuality="high" performs box-filter downsampling,
  // giving a true per-cell average colour rather than a single-pixel point sample.
  if (!offRefs.main) offRefs.main = document.createElement("canvas");
  const off = offRefs.main;
  if (off.width !== cols || off.height !== rows) { off.width = cols; off.height = rows; }
  const offCtx = off.getContext("2d")!;
  offCtx.imageSmoothingEnabled = true;
  offCtx.imageSmoothingQuality = "high";
  offCtx.drawImage(source as CanvasImageSource, 0, 0, cols, rows);
  let imgData: ImageData;
  try { imgData = offCtx.getImageData(0, 0, cols, rows); } catch { return; }
  const data = imgData.data;

  // ── Step 2: Luminance — spec formula L = 0.299R + 0.587G + 0.114B ─────────
  const lum255 = new Float32Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    lum255[i] = 0.299 * data[i*4] + 0.587 * data[i*4+1] + 0.114 * data[i*4+2];
  }

  // ── Step 3: Brightness / Contrast — spec formula (0–255 space) ────────────
  // L' = clamp(((L − 128) × contrast) + 128 + brightness, 0, 255)
  const lum = new Float32Array(cols * rows);
  for (let i = 0; i < cols * rows; i++) {
    const Lp = Math.max(0, Math.min(255,
      ((lum255[i] - 128) * editor.contrast) + 128 + editor.brightness
    ));
    lum[i] = Lp / 255;
  }

  // ── Style-specific pre-processing ─────────────────────────────────────────
  if (editor.artStyle === "Retro Art") {
    // Posterise to 6 discrete levels for a retro look
    for (let i = 0; i < lum.length; i++) lum[i] = Math.round(lum[i] * 5) / 5;
  }

  // ── Vignette ──────────────────────────────────────────────────────────────
  if (editor.vignette > 0) {
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const nx = (col / cols) * 2 - 1;
        const ny = (row / rows) * 2 - 1;
        const d  = Math.min(1, Math.sqrt(nx*nx + ny*ny) / Math.SQRT2);
        lum[row * cols + col] *= Math.max(0, 1 - editor.vignette * d * d * 2.5);
      }
    }
  }

  // ── Histogram-aware tonal remap (1.5th–98.5th percentile stretch) ────────
  {
    const hist = new Uint32Array(256);
    for (let i = 0; i < lum.length; i++) hist[Math.min(255, Math.round(lum[i] * 255))]++;
    const total = lum.length;
    let lo = 0, hi = 255, cumLo = 0, cumHi = 0;
    for (let b = 0; b < 256; b++) { cumLo += hist[b]; if (cumLo / total < 0.008) lo = b; }
    for (let b = 255; b >= 0; b--) { cumHi += hist[b]; if (cumHi / total < 0.008) hi = b; }
    let loN = lo / 255, hiN = hi / 255;
    // EMA smoothing for webcam to suppress per-frame flicker
    if (editor.sourceTab === "LIVE CAM") {
      offRefs.histLo = 0.9 * offRefs.histLo + 0.1 * loN;
      offRefs.histHi = 0.9 * offRefs.histHi + 0.1 * hiN;
      loN = offRefs.histLo;
      hiN = offRefs.histHi;
    }
    const range = Math.max(hiN - loN, 0.01);
    for (let i = 0; i < lum.length; i++) {
      lum[i] = Math.max(0, Math.min(1, (lum[i] - loN) / range));
    }
  }

  // ── Per-font density calibration (gamma correction) ───────────────────────
  {
    const density = FONT_DENSITY[editor.fontFamily] ?? 1.0;
    if (density !== 1.0) {
      const gamma = 1 / density;
      for (let i = 0; i < lum.length; i++) lum[i] = Math.pow(lum[i], gamma);
    }
  }

  // ── Fix #2: Shadow gamma — smooth the space→first-glyph transition ───────
  // Apply a gentle power curve to low luminance (<0.25) so the jump from
  // empty space to '.' / '·' is gradual instead of abrupt.
  for (let i = 0; i < lum.length; i++) {
    if (lum[i] < 0.25) lum[i] = Math.pow(lum[i] / 0.25, 1.5) * 0.25;
  }

  // ── Fix #3: Snapshot pre-dither luminance for Sobel (Line mode) ──────────
  // Also needed for Fix #3b: Bayer + Full Color luminance ratio correction.
  // Dither noise creates false gradient spikes; Sobel needs clean data.
  const needPreDither = artMode === "line"
    || (editor.colorMode === "Full Color" && editor.ditherAlgorithm === "Bayer (Ordered)" && editor.ditherStrength > 0);
  const preDitherLum = needPreDither ? new Float32Array(lum) : null;

  // ── Dithering ─────────────────────────────────────────────────────────────
  const chars = editor.characters || " .:-=+*#%@";
  const nC    = Math.max(2, chars.length);
  const dStr  = editor.ditherStrength;

  if (editor.ditherAlgorithm !== "None" && dStr > 0) {
    if (editor.ditherAlgorithm === "Bayer (Ordered)") {
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          lum[idx] = Math.max(0, Math.min(1,
            lum[idx] + (BAYER_4x4[row & 3][col & 3] / 16 - 0.5) * dStr * 0.5
          ));
        }
    } else if (editor.ditherAlgorithm === "Floyd-Steinberg") {
      const copy = new Float32Array(lum);
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const old = copy[idx];
          const q   = Math.round(old * (nC - 1)) / (nC - 1);
          const err = (old - q) * dStr;
          copy[idx] = q;
          if (col + 1 < cols)             copy[idx + 1]        += err * 7 / 16;
          if (row + 1 < rows) {
            if (col > 0)                  copy[idx + cols - 1] += err * 3 / 16;
                                          copy[idx + cols]     += err * 5 / 16;
            if (col + 1 < cols)           copy[idx + cols + 1] += err / 16;
          }
        }
      lum.set(copy);
    } else if (editor.ditherAlgorithm === "Atkinson") {
      const copy = new Float32Array(lum);
      for (let row = 0; row < rows; row++)
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const old = copy[idx];
          const q   = Math.round(old * (nC - 1)) / (nC - 1);
          const s   = (old - q) * dStr / 8;
          copy[idx] = q;
          if (col + 1 < cols)             copy[idx + 1]        += s;
          if (col + 2 < cols)             copy[idx + 2]        += s;
          if (row + 1 < rows) {
            if (col > 0)                  copy[idx + cols - 1] += s;
                                          copy[idx + cols]     += s;
            if (col + 1 < cols)           copy[idx + cols + 1] += s;
          }
          if (row + 2 < rows)             copy[idx + 2 * cols] += s;
        }
      lum.set(copy);
    }
  }

  // BG / inverse dither noise
  if (editor.bgDither > 0)
    for (let i = 0; i < lum.length; i++)
      if (lum[i] < 0.35) lum[i] = Math.max(0, Math.min(1, lum[i] + (Math.random() - 0.5) * editor.bgDither * 0.18));
  if (editor.invDither > 0)
    for (let i = 0; i < lum.length; i++)
      if (lum[i] > 0.65) lum[i] = Math.max(0, Math.min(1, lum[i] + (Math.random() - 0.5) * editor.invDither * 0.18));

  // ── Sobel edge detection for Line mode ────────────────────────────────────
  // Fix #4: Compute on pre-dither luminance so dither noise doesn't create
  // false edge characters across smooth surfaces.
  let sobelGx: Float32Array | null = null;
  let sobelGy: Float32Array | null = null;
  if (artMode === "line" && preDitherLum) {
    const sL = preDitherLum;  // clean luminance without dither artifacts
    sobelGx = new Float32Array(cols * rows);
    sobelGy = new Float32Array(cols * rows);
    for (let row = 1; row < rows - 1; row++) {
      for (let col = 1; col < cols - 1; col++) {
        const idx = row * cols + col;
        sobelGx[idx] =
          -sL[(row-1)*cols+(col-1)] + sL[(row-1)*cols+(col+1)]
          - 2*sL[row*cols+(col-1)] + 2*sL[row*cols+(col+1)]
          - sL[(row+1)*cols+(col-1)] + sL[(row+1)*cols+(col+1)];
        sobelGy[idx] =
          sL[(row-1)*cols+(col-1)] + 2*sL[(row-1)*cols+col] + sL[(row-1)*cols+(col+1)]
          - sL[(row+1)*cols+(col-1)] - 2*sL[(row+1)*cols+col] - sL[(row+1)*cols+(col+1)];
      }
    }
  }

  // ── Clear canvas ──────────────────────────────────────────────────────────
  ctx.fillStyle    = editor.bgColor || "#000000";
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha  = editor.opacity;
  ctx.font         = `${fontSize}px ${fontStr}`;
  ctx.textBaseline = "top";

  // Set uniform fill colour once when not per-cell (avoids repeated style changes)
  const fullColor = editor.colorMode === "Full Color";
  if (!fullColor) ctx.fillStyle = editor.fgColor || "#ffffff";

  const [dvx, dvy] = DIR_VEC[editor.direction] ?? [0, -1];
  const fxActive   = editor.fxPreset !== "None" && editor.fxStrength > 0;
  const ns  = editor.noiseScale;
  const nsp = editor.noiseSpeed;
  const fx  = editor.fxStrength;
  const maxR = Math.min(colStride, rowStride) * 0.5;  // max halftone radius

  for (let row = 0; row < rows; row++) {
    // Terminal: dim alternate rows to simulate phosphor scanlines
    const scanline = editor.artStyle === "Terminal" && row % 2 === 0 ? 0.82 : 1.0;

    for (let col = 0; col < cols; col++) {
      const lumIdx = row * cols + col;
      let l = lum[lumIdx] * scanline;
      if (editor.invert) l = 1 - l;

      // ── FX presets modify l and/or drawing offset ──────────────────────
      let fxOffX = 0, fxOffY = 0;
      if (fxActive) {
        switch (editor.fxPreset) {
          case "Noise Field": {
            const n = Math.sin(col * ns / 200 + t * nsp + dvx * col * 0.05) *
                      Math.cos(row * ns / 200 + t * nsp * 0.7 + dvy * row * 0.05);
            fxOffX = n * 5 * fx * dpr;
            fxOffY = n * 3 * fx * dpr;
            break;
          }
          case "Glitch":
            if (Math.random() < 0.012 * fx) fxOffX = (Math.random() - 0.5) * 30 * fx * dpr;
            if (row % 9 === Math.floor(t * nsp * 3) % 9) { l = Math.min(1, l * 1.4); fxOffX += 6 * fx * dpr; }
            break;
          case "Beam Sweep": {
            const bPos   = (Math.sin(t * nsp * 0.8) * 0.5 + 0.5) * (dvx !== 0 ? cols : rows);
            const bCoord = dvx !== 0 ? col : row;
            const bDist  = Math.abs(bCoord - bPos);
            if (bDist < 8) l = Math.min(1, l + (1 - bDist / 8) * 0.7 * fx);
            break;
          }
          case "Intervals": {
            const period = Math.max(2, Math.ceil(12 / fx));
            if ((col + row + Math.floor(t * nsp * 4)) % period === 0) l = Math.min(1, l + 0.45 * fx);
            break;
          }
          case "CRT Monitor":
            if (row % 2 === 0) l = Math.max(0, l * (1 - 0.3 * fx));
            fxOffX = Math.sin(row * 0.4 + t * 0.2) * fx * 0.8 * dpr;
            break;
          case "Matrix Rain": {
            const speed   = nsp * fx * 10;
            const colSeed = (col * 2971) % rows;
            const rainRow = (colSeed + Math.floor(t * speed)) % rows;
            const trail   = (rainRow - row + rows) % rows;
            l = trail === 0 ? 1 : trail < 6 ? 0.7 * (1 - trail / 6) : l * 0.15;
            break;
          }
        }
      }

      // ── Base draw position ─────────────────────────────────────────────
      let px = col * colStride + fxOffX;
      let py = row * rowStride + fxOffY;

      // ── Mouse interaction (physical pixels) ────────────────────────────
      if (mouse) {
        const cx = px + colStride * 0.5, cy = py + rowStride * 0.5;
        const dx = cx - mouse.x,         dy = cy - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if (dist < editor.areaSize * dpr && dist > 0.1) {
          const force = (1 - dist / (editor.areaSize * dpr)) * editor.hoverStrength * 0.4 * editor.spread;
          const sign  = editor.mouseMode === "Attract" ? -1 : 1;
          px += sign * (dx / dist) * force;
          py += sign * (dy / dist) * force;
        }
      }

      // ── Per-cell colour for Full Color mode ────────────────────────────
      if (fullColor) {
        const di = lumIdx * 4;
        // Fix #3b: When Bayer dithering is active, the character density has been
        // shifted by the Bayer offset. Scale the RGB fill proportionally so
        // perceived color brightness matches character weight — prevents
        // magenta/green checkerboard fringing in flat mid-tone areas.
        if (editor.ditherAlgorithm === "Bayer (Ordered)" && dStr > 0 && preDitherLum) {
          const origL = preDitherLum[lumIdx];
          const ratio = origL > 0.01 ? Math.min(1.5, l / origL) : 1;
          ctx.fillStyle = `rgb(${Math.min(255, Math.round(data[di] * ratio))},${Math.min(255, Math.round(data[di+1] * ratio))},${Math.min(255, Math.round(data[di+2] * ratio))})`;
        } else {
          ctx.fillStyle = `rgb(${data[di]},${data[di+1]},${data[di+2]})`;
        }
      }

      // ── Art mode rendering ─────────────────────────────────────────────

      if (artMode === "halftone") {
        // Halftone: draw filled circle whose radius encodes luminance.
        // sqrt(l) applies perceptual area scaling so mid-tones read correctly.
        const r = Math.sqrt(Math.max(0, l)) * maxR;
        if (r < 0.3) continue;
        ctx.beginPath();
        ctx.arc(px + colStride * 0.5, py + rowStride * 0.5, r, 0, TAU);
        ctx.fill();

      } else if (artMode === "dot-cross") {
        // 5 symbol levels — wider low band keeps shadow cells as spaces
        const level = Math.min(4, Math.floor(l * 4.5));
        const ch = DOT_CROSS_CHARS[level];
        if (!ch || ch === " ") continue;
        ctx.fillText(ch, px, py);

      } else if (artMode === "particles") {
        // Only bright cells → single small dot. Denser at higher luminance.
        if (l < 0.45) continue;
        const ch = l > 0.75 ? "•" : l > 0.55 ? "·" : ".";
        ctx.fillText(ch, px, py);

      } else if (artMode === "line" && sobelGx && sobelGy) {
        // Edge direction → directional line characters; non-edge → sparse density.
        const gx = sobelGx[lumIdx];
        const gy = sobelGy[lumIdx];
        const mag = gx * gx + gy * gy;  // compare squared to avoid sqrt in hot loop
        let ch: string;
        if (mag > 0.018) {  // threshold² for visible edge (0.134 in linear mag) — raised to reduce flat-texture noise
          const angle  = Math.atan2(gy, gx);                                // −π … π
          const sector = Math.floor(((angle + Math.PI) / TAU * 8 + 0.5)) % 8;
          ch = LINE_CHARS[sector];
        } else {
          if (l < 0.12) continue;
          // Sparse fill for flat regions — lighter char at higher luminance
          const sparseChars = "·:.";
          ch = sparseChars[2 - Math.min(2, Math.floor(l * 3))];
        }
        ctx.fillText(ch, px, py);

      } else {
        // density (Classic ASCII, Terminal, Claude Code, Retro Art, Space Grotesk…)
        // Step 5: charIdx = floor(l × (charset.length − 1)) — guaranteed in-bounds
        const charIdx = Math.floor(l * (chars.length - 1));
        const ch = chars[charIdx];
        if (!ch || ch === " ") continue;
        ctx.fillText(ch, px, py);
      }
    }
  }

  ctx.globalAlpha = 1;

  // Border glow
  if (editor.borderGlow > 0) {
    ctx.save();
    ctx.shadowColor = editor.fgColor || "#ffffff";
    ctx.shadowBlur  = editor.borderGlow * 24 * dpr;
    ctx.strokeStyle = editor.fgColor || "#ffffff";
    ctx.lineWidth   = 1.5 * dpr;
    ctx.globalAlpha = editor.borderGlow * 0.6;
    ctx.strokeRect(1, 1, W - 2, H - 2);
    ctx.restore();
  }
}

// ─── React component ──────────────────────────────────────────────────────────
export function AsciiCanvas({ source, editor, onFps }: Props) {
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef     = useRef<{ x: number; y: number } | null>(null);
  const rafRef       = useRef<number>(0);
  const timeRef      = useRef<number>(0);
  const editorRef    = useRef<EditorState>(editor);
  const sourceRef    = useRef<AsciiSource>(source);
  const onFpsRef     = useRef<typeof onFps>(onFps);
  const dprRef       = useRef<number>(window.devicePixelRatio || 1);

  // Two offscreen canvases: standard-res and braille hi-res; plus histogram EMA state
  const offRefs = useRef<OffscreenRefs>({ main: null, braille: null, histLo: 0, histHi: 1 });

  // Rolling FPS: 30-frame window
  const fpsBuffer  = useRef<number[]>([]);
  const lastTs     = useRef<number>(0);
  const lastFps    = useRef<number>(0);

  editorRef.current  = editor;
  sourceRef.current  = source;
  onFpsRef.current   = onFps;

  // ── DPR-aware canvas sizing ────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;
      canvas.width   = Math.round(container.clientWidth  * dpr);
      canvas.height  = Math.round(container.clientHeight * dpr);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    return () => ro.disconnect();
  }, []);

  // ── RAF loop ───────────────────────────────────────────────────────────────
  useEffect(() => {
    let alive = true;
    const loop = (ts: number) => {
      if (!alive) return;
      timeRef.current = ts / 1000;

      // Rolling FPS measurement
      const delta = ts - lastTs.current;
      if (lastTs.current > 0 && delta > 0) {
        const buf = fpsBuffer.current;
        buf.push(1000 / delta);
        if (buf.length > 30) buf.shift();
        const avg = Math.round(buf.reduce((a, b) => a + b, 0) / buf.length);
        if (avg !== lastFps.current) {
          lastFps.current = avg;
          onFpsRef.current?.(avg);
        }
      }
      lastTs.current = ts;

      if (canvasRef.current)
        renderFrame(
          canvasRef.current, sourceRef.current,
          editorRef.current,
          mouseRef.current, timeRef.current,
          offRefs.current, dprRef.current,
        );
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { alive = false; cancelAnimationFrame(rafRef.current); };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    const dpr  = dprRef.current;
    if (rect) mouseRef.current = {
      x: (e.clientX - rect.left) * dpr,
      y: (e.clientY - rect.top)  * dpr,
    };
  }, []);

  const onMouseLeave = useCallback(() => { mouseRef.current = null; }, []);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden" }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <canvas
        ref={canvasRef}
        style={{ display: "block", position: "absolute", inset: 0, width: "100%", height: "100%" }}
      />
    </div>
  );
}
