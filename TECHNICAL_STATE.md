# Technical State

Snapshot of the frozen release-candidate build. This documents *what exists* in the verified codebase (`src/app/components/AsciiCanvas.tsx`, `Sidebar.tsx`, `App.tsx`).

## Render pipeline order (per frame, `renderFrame`)

1. **Grid geometry** — font metrics (`measureText`) give per-glyph width/height;
   `cols`/`rows` derived from canvas size and capped by `GRID_COLS[editor.quality]`
   (`320 -> 110`, `480 -> 140`, `720 -> 170`). Column count is decoupled from source
   resolution. Per-font aspect correction (`FONT_ASPECT["VT323 (Pixel)"] = 0.82`) is applied
   to row height to prevent vertical glyph stretching.
2. **Downsample** — source drawn into an offscreen `cols × rows` canvas with
   `imageSmoothingQuality = "high"` (box-filter average per cell), then
   `getImageData`.
3. **Luminance** — `L = 0.299R + 0.587G + 0.114B` (0–255 space).
4. **Brightness / Contrast** — `L' = clamp(((L − 128) × contrast) + 128 + brightness, 0, 255)`, then normalized to 0–1.
5. **Style pre-process** — Retro Art posterizes luminance to 6 discrete levels.
6. **Vignette** — radial luminance falloff.
7. **Histogram-aware tonal remap** — stretches the 0.8th–99.2th luminance
   percentile to full range (`cumLo / total < 0.008`, `cumHi / total < 0.008`).
   For `LIVE CAM`, the lo/hi bounds are EMA-smoothed (α = 0.1) via `offRefs.histLo/histHi`
   to suppress per-frame flicker.
8. **Per-font density calibration** — gamma correction `L^(1/density)` using
   `FONT_DENSITY[fontFamily]` (DM Mono 1.0, Courier New 0.95, VT323 0.84, proportional fonts 1.0).
9. **Shadow contour gamma** — gentle power curve on low luminance (`L < 0.25`: `pow(L / 0.25, 1.5) * 0.25`)
   to smooth the transition from empty space to the first visible glyph without contour banding.
10. **Pre-dither luminance snapshot** — preserved for Sobel edge detection (Line mode) and
    for Bayer + Full Color luminance ratio scaling.
11. **Dithering** — Bayer (Ordered) / Floyd-Steinberg / Atkinson, scaled by `ditherStrength`.
    Followed by optional BG-dither (dark cells) and inverse-dither (bright cells) noise.
12. **Sobel edge detection** — Line mode only; computed strictly on pre-dithered luminance
    to eliminate dither-induced false gradient noise. Edge threshold squared is `mag > 0.018`
    (linear magnitude ~0.134). Flat/non-edge regions use sparse directional fill (`"·:."`).
13. **Draw loop** — clear to `bgColor`, then per-cell: apply FX preset
    (luminance/offset modifiers), mouse attract/push displacement, per-cell color:
    - In Full Color mode with Bayer dithering, RGB fill is scaled by `min(1.5, L / origL)`
      using `preDitherLum` to eliminate magenta/green checkerboard fringing in mid-tones.
    - Art-mode specific glyph/shape rendered (density ramp, halftone circles, dot-cross symbols, line vectors, particles).
14. **Border glow** — optional shadow-blur stroke.

## Braille engine (`renderBraille`)

Braille uses a dedicated high-resolution path that samples at `cols×2 × rows×4` sub-pixels
and packs 2×4 dot blocks into U+28xx codepoints:
- Mirrors luminance, brightness/contrast, vignette, and the 0.8%/99.2% histogram remap (with webcam EMA smoothing).
- **Full Color Braille**: samples and averages a 2×2 sub-pixel block (`sr/4, sg/4, sb/4`) for stable, flicker-free color.
- Supports interactive mouse physics and FX presets (Beam Sweep, Intervals, CRT Monitor, Matrix Rain, Glitch).

## Active art styles (9)
Classic ASCII, Braille, Halftone, Dot Cross, Line, Particles, Claude Code, Retro Art, Terminal.

Internal art-mode mapping (`getArtMode`):
- `density` — Classic ASCII (`" .,:;i1tfLC08@"`), Claude Code (`" 01"`), Retro Art (`" .oO0@"`), Terminal (`" .:-=+|*#%@"`)
- `halftone` — filled circle per cell, radius ∝ √luminance (`r < 0.3` clipped)
- `braille` — 2×4 sub-pixel packing
- `particles` — sparse dots at bright cells (`L ≥ 0.45`, three density levels `• / · / .`)
- `line` — Sobel gradient angle → 8 directional line characters (`│ ╱ ─ ╲`); flat fill with `"·:."`
- `dot-cross` — 5-level threshold symbols (`[' ', '·', '+', '⊕', '●']`, level = `floor(L * 4.5)`)

## Active dithering modes (4)
None, Floyd-Steinberg, Bayer (Ordered 4×4), Atkinson.

## Active character sets (10)
Standard (` .:-=+*#%@`), Blocks, Detailed, Minimal, Binary, Letters A-Z, Letters a-z, Letters Aa, Symbols, Custom.
(Selecting an art style sets a style-tuned character ramp via `ART_STYLE_CHARS`.)

## Active color modes (6)
Grayscale, Full Color, Matrix Green, Amber Monitor, Paper Print, Custom.

## Active fonts (5)
Helvetica Neue, Inter, Poppins, Space Grotesk, VT323 (Pixel).
Calibrated density factors (`FONT_DENSITY`): DM Mono 1.0, Courier New 0.95, VT323 0.84, Proportional fonts 1.0.

## Active defaults (`defaultEditor` in App.tsx)
- sourceTab: `IMAGE/VIDEO`
- quality: `480` (140 columns)
- charSetKey: `Standard`, characters: ` .:-=+*#%@`
- artStyle: `Classic ASCII` (`" .,:;i1tfLC08@"`)
- fontFamily: `Helvetica Neue`, fontSize: 8, charSpacing: 1.0
- brightness: 0, contrast: 1.1
- ditherAlgorithm: `Floyd-Steinberg`, ditherStrength: 1.0
- bgDither: 0, invDither: 0
- colorMode: `Grayscale`, fgColor: `#ffffff`, bgColor: `#000000`, invert: false
- vignette: 0, borderGlow: 0, opacity: 1
- fxPreset: `None`, fxStrength: 0.45, direction: `up`
- noiseScale: 24, noiseSpeed: 1
- mouseMode: `Attract`, hoverStrength: 24, areaSize: 180, spread: 1

Default source: bundled portrait asset `IMG_20260514_210558.jpg`.

## Accepted limitations (Scope Frozen)
- Proportional font cell misalignment: non-monospace fonts have variable glyph widths; cell positioning uses monospace stride based on `"M"` glyph width.
- Cross-origin canvas export taint: external URLs without permissive CORS headers can taint the HTML5 canvas, preventing export download (standard browser security model).
- The sidebar "ADD LAYER" button is a single-layer UI placeholder.
- Grid quality has a single source of truth: `editor.quality`.
