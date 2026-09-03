# ASC11 — ASCII Art Editor

ASC11-inspired real-time ASCII art editor for image, video, and live webcam feeds, built with React, TypeScript, Vite, and HTML5 Canvas.

Inspired by [asc11.com](https://asc11.com), this application transforms static images, videos, and live webcam feeds into stylized text, braille, halftone, and vector line art in real time.

---

## Features

### Input Sources
- **Image & Video**: Upload and preview local images and videos.
- **Live Webcam**: Real-time camera feed with Exponential Moving Average (EMA) histogram smoothing to eliminate frame flicker.

### 9 Art Modes
- **Classic ASCII**: Luminance-mapped character density ramp (` .,:;i1tfLC08@`).
- **Braille**: High-resolution 2×4 sub-pixel dot packing into Unicode Braille patterns (U+2800–U+28FF) with 2×2 sub-pixel color averaging.
- **Halftone**: Dynamic circles scaled proportionally to perceived brightness (`r ∝ √L`).
- **Dot-Cross**: 5-level symbolic quantization (`[' ', '·', '+', '⊕', '●']`).
- **Line**: Sobel filter direction analysis mapped to directional stroke glyphs (`│`, `╱`, `─`, `╲`) with sparse non-edge fill.
- **Particles**: Sparse thresholded stippling for high-luminance highlights.
- **Claude Code**: Stylized binary/terminal matrix.
- **Retro Art**: 6-level posterized retro pixel ramp.
- **Terminal**: High-contrast console character ramp.

### Dithering & Tone Mapping
- **Algorithms**: Floyd-Steinberg, Bayer (4×4 Ordered), Atkinson, and None.
- **Dynamic Range Optimization**: 0.8% / 99.2% percentile histogram stretch for crisp contrast.
- **Shadow Gamma Shaping**: Low-luminance power curve prevents abrupt contour banding between dark cells and spaces.
- **Chroma Correction**: Mid-tone luminance scaling for Bayer dithering in Full Color mode eliminates chromatic aberration and checkerboard fringing.
- **Font Calibration**: Calibrated density and aspect metrics for monospace and pixel fonts (such as VT323).

### FX Presets & Interactivity
- **Procedural FX**: CRT Monitor scanlines, Matrix Rain, Beam Sweep, Glitch, and Intervals.
- **Interactive Physics**: Mouse Attract and Repel forces with configurable radius and strength.
- **Color Palettes**: Full Color, Grayscale, Matrix Green, Amber Monitor, and Custom foreground/background with color inversion.

### Export
- **PNG Export**: High-resolution PNG snapshot download directly from the render canvas, with preset configurations and randomized styles.

---

## Tech Stack

- **Framework**: React 18, TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS, Radix UI primitives
- **Rendering**: HTML5 Canvas 2D

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm

### Installation
```bash
# Using pnpm
pnpm install

# Using npm
npm install
```

### Development
Start the local Vite development server:
```bash
npm run dev
```

### Production Build
Compile the optimized production bundle to the `dist/` directory:
```bash
npm run build
```

### Local Preview
Preview the production build locally:
```bash
npm run preview
```

---

## Architecture

```
src/
├── app/
│   ├── components/
│   │   ├── AsciiCanvas.tsx   # Core 2D render loop, dithering, Braille, and FX
│   │   ├── PreviewCanvas.tsx # Canvas wrapper and container sizing
│   │   ├── Sidebar.tsx       # Controls, sliders, styles, and color modes
│   │   ├── ExportPanel.tsx   # PNG export and preset configuration
│   │   └── SliderRow.tsx     # Reusable parameter slider controls
│   ├── App.tsx               # State coordinator and source handlers
│   └── styles/               # CSS themes, font definitions, Tailwind setup
├── imports/                  # Bundled sample assets and reference data
└── main.tsx                  # Application mount point
```

---

## Attributions

See [ATTRIBUTIONS.md](ATTRIBUTIONS.md) for third-party component and photography licenses.