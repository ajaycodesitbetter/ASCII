Upgrade my existing ASCII Art Editor UI into a production-grade desktop-first creative tool. Keep the current asc11-inspired visual language: near-black workspace, muted charcoal panels, hairline gray borders, mustard-yellow #C8B400 accent, DM Mono / monospace UI labels, compact dense layout, no rounded SaaS cards, no gradients, no oversized headings.

This is not a landing page. It is a high-performance creative editor. The design must feel like a professional graphics tool, similar in density and seriousness to a code editor + image editor.

GOAL:
Design a complete high-fidelity UI for an ASCII image, video, webcam, and 3D model renderer. The implementation already supports image/video/live camera/3D, dithering, live FX, mouse interaction, presets, and export. Improve the UI so users can control quality, performance, layers, and exports clearly.

LAYOUT:
- Fixed top header, 48px high.
- Fixed left control sidebar, 320px wide, independently scrollable.
- Main central preview workspace, fills remaining space.
- Bottom status bar, 28px high.
- Optional right inspector panel only when a layer is selected; otherwise keep preview wide.
- Desktop target: 1440px wide. Also create responsive 1280px and 375px variants.
- Use a strict 4px spacing system.
- Use 1px borders, no soft shadows, minimal border radius (0 to 4px).
- Make every clickable control visibly interactive with hover, active, focus, disabled, loading, and error states.

TOP HEADER:
- Left: custom ASCII/grid logo, app name “ASCII”.
- Center-left: workspace title, source name, unsaved-change dot, “Save draft”.
- Right: Library, Templates, Creations, Changelog, light/dark mode toggle, account avatar, Upgrade button.
- Add a compact performance chip that shows “FPS 60”, “GPU”, and current render resolution such as “480p”.
- Performance chip changes color: green >= 55 FPS, amber 30–54 FPS, red below 30 FPS.
- Include a “Reduce characters” quick action next to FPS; it should be visually secondary but easy to reach.

MAIN PREVIEW WORKSPACE:
- Large canvas area with true black background.
- Canvas frame displays source aspect ratio and safe margin.
- Overlay a small top-left preview HUD: source type, dimensions, cell grid count, active layer count, FPS.
- Overlay bottom-right controls: fit canvas, 100% zoom, zoom in/out, before/after hold button, fullscreen.
- Before/after compare mode should reveal original image when held, then return to ASCII output when released.
- Show a subtle checkerboard behind transparent output.
- Include empty state with drop-zone prompt: “Drop image/video or click to browse”.
- Include loading state with source-decoding progress and render-preparation status.
- Include a visible but non-intrusive dropped-frame warning if live FPS falls below target.
- Add fullscreen canvas viewing mode with controls hidden until mouse movement.

LEFT SIDEBAR:
Organize controls in collapsible sections with a section title, compact summary value, reset icon, and info tooltip. Keep all labels uppercase and compact.

1. SOURCE
- Tabs: Image / Video, Live Cam, 3D Model.
- Upload drop zone.
- Source file name, format, original dimensions, duration if video.
- Source Capture Quality segmented control: 320, 480, 720, Dynamic.
- Add “Adaptive preview” toggle: automatically lowers preview resolution or cell count when FPS drops, but never changes export quality.
- Display expected performance estimate: Fast / Balanced / High Detail.

2. LAYERS
- Real layer stack, not only one effect panel.
- Each layer row: visibility toggle, thumbnail/icon, layer name, blend mode, opacity, drag handle, duplicate, delete.
- Buttons: Add ASCII Layer, Add FX Layer, Add Mask Layer.
- Selected layer opens the inspector controls below.
- Support named layers such as “Base ASCII”, “Glow”, “Noise”, “CRT”.
- Include blend modes: Normal, Screen, Add, Multiply, Overlay.
- Include “Lock layer” and “solo layer”.
- Make layer reordering visually clear with drag-and-drop indicators.

3. ASCII STYLE
- Art-style grid with preview thumbnails:
  Classic ASCII, Braille, Halftone, Dot Cross, Line, Particles, Terminal, Retro Art, Code.
- Font select: Helvetica Neue, Inter, Poppins, Space Grotesk, VT323 Pixel, plus custom font upload.
- Character Set select:
  Standard, Blocks, Detailed, Minimal, Binary, Letters A-Z, letters a-z, mixed letters, Symbols, Custom.
- Custom character string input with validation: prevent empty string, show live character count.
- Add character mapping mode segmented control:
  Brightness, Edge-aware, Shape-aware.
- Add character density slider / grid-size display with low-detail to ultra-detail labels.
- Add cell aspect ratio control so text cells can be corrected for font width/height.

4. IMAGE PROCESSING
- Brightness slider: -50 to +50.
- Contrast slider: 0.5 to 2.5.
- Gamma slider: 0.4 to 2.2.
- Sharpen slider: 0 to 1.
- Edge enhancement slider: 0 to 1.
- Exposure slider: -2 to +2.
- Auto levels button.
- Preserve highlights toggle.
- Include a small histogram button; on click, show a compact luminance histogram overlay.
- Add “Process order” info tooltip: preprocess → dither → character mapping → post FX.

5. DITHERING
- Dither algorithm: None, Floyd-Steinberg, Bayer Ordered, Atkinson.
- Dither Strength: 0 to 2.
- BG Dither: 0 to 3.
- Inverse Dither: 0 to 3.
- Ordered-dither matrix size control for Bayer: 2x2, 4x4, 8x8.
- Temporal-stable toggle for video/live cam to reduce flickering between frames.
- Add a concise algorithm description panel when a dither mode is selected.
- Add “Quality recommendation” chip:
  Portraits: Floyd-Steinberg
  Animation/live video: Bayer or temporal-stable mode
  Retro print: Atkinson
  Fast preview: None

6. COLOR
- Modes: Grayscale, Full Color, Matrix Green, Amber Monitor, Paper Print, Custom.
- Foreground color picker and background color picker.
- Invert color toggle.
- Transparent background toggle.
- Palette quantization control: Full, 16 colors, 8 colors, 4 colors, 2 colors.
- Color bleed / chromatic aberration slider for CRT styling.
- Make color settings layer-specific when multiple layers exist.

7. TYPOGRAPHY AND COMPOSITION
- Font Size: 6 to 20px.
- Character Spacing: 0.7x to 2x.
- Line Height: 0.7x to 2x.
- Horizontal stretch: 0.5x to 2x.
- Alignment: left, center, right.
- Crop / fit / fill source modes.
- Aspect ratio presets: Original, 1:1, 4:3, 16:9, 9:16, Custom.
- Add a “pixel snap” toggle for sharp output.
- Add a “high-DPI preview” toggle with performance warning.

8. POST FX
- FX preset cards: None, Noise Field, Intervals, Beam Sweep, Glitch, CRT Monitor, Matrix Rain.
- FX Strength: 0.05 to 1.
- Direction selector: up/down/left/right/top-left/top-right/bottom-left/bottom-right.
- Noise scale: 4 to 96.
- Noise speed: 0 to 3.
- Scanline density, scanline intensity, flicker, distortion, chromatic aberration.
- Vignette: 0 to 1.
- Border Glow: 0 to 1.
- Opacity: 0 to 1.
- Add an “animate FX” toggle and a “freeze frame” button.

9. INTERACTION
- Toggle: disabled / attract / push.
- Hover Strength: 4 to 64.
- Area Size: 40 to 640px.
- Spread: 0.25x to 3x.
- Add interaction falloff selector: linear, smooth, radial.
- Add a “show interaction radius” preview toggle.
- Add touch-friendly toggle for mobile behavior.

10. PRESETS
- Keep built-in presets:
  Matrix, Amber CRT, Glitch Art, Braille, Beam, Noise, Dither2, Portrait HD.
- Each preset should have a visual thumbnail, name, small description, and performance label.
- Buttons: Apply, Duplicate, Save as new preset, Randomize.
- Add randomization scope checkboxes: style, colors, dither, FX, interaction.
- Add “A/B compare” slot A and slot B to compare two configurations without losing work.

BOTTOM STATUS BAR:
- Show: source dimensions, preview resolution, grid dimensions / character count, active font, dither algorithm, active FX, active layer count, FPS, frame time in ms, GPU/CPU mode.
- Example:
  SOURCE 1920x1080 | PREVIEW 480p | GRID 160x90 | 14,400 CHARS | FLOYD-STEINBERG | CRT | 58 FPS | 16.7 ms
- Clicking a status token opens the relevant sidebar section.

EXPORT MODAL:
- Tabs: Image, Video, GIF, HTML + JS, React Component.
- Export resolution must be separate from preview resolution:
  Preview: Adaptive / 320 / 480 / 720
  Export: Original / 1080p / 1440p / 4K / Custom
- Display a render-cost estimate before export: estimated size, expected render time, frame count, final grid count.
- Image formats: PNG, JPEG, WebP, SVG where supported.
- Video: WebM / MP4, FPS selector 24 / 30 / 60, duration, loop toggle.
- GIF: width, FPS, duration, color count.
- HTML/React exports: include/exclude interaction, include/exclude effects, transparent background, minified output toggle.
- Add export quality options:
  Fast, Balanced, Maximum.
- Maximum mode includes high-DPI rendering, full-quality source sampling, no adaptive downscaling, all selected layers.
- Export queue with progress and cancel action.
- Successful export state should show filename, filesize, Copy path, Download again, Open output folder.
- Include a warning when export settings are expensive: “4K + Floyd-Steinberg + 60 FPS may take significant time.”

DESIGN DETAILS:
- Use compact sliders with tick marks and an editable numeric input at the right.
- Add reset buttons beside every advanced control group.
- Tooltips should explain terminology in plain language.
- Add keyboard shortcut badges where helpful:
  Space: hold original
  R: randomize
  F: fullscreen
  Cmd/Ctrl+E: export
  Cmd/Ctrl+Z: undo
- Design undo/redo buttons and history state in header.
- Add unsaved-state and autosave indicators.
- Create all important states: empty, loading, permission denied for webcam, missing camera, camera busy, unsupported browser, export error, export success, low FPS, and no GPU/WebGL fallback.
- Do not fake 3D or shader visuals in Figma; represent those as clearly labeled UI controls and canvas states.

PROTOTYPE FLOWS:
1. Upload portrait → choose Portrait HD → open before/after → raise density → export PNG at 4K.
2. Live camera → adaptive preview on → FPS drops → app automatically reduces cell count → user sees explanation.
3. Add base ASCII layer + CRT FX layer + noise layer → reorder layers → change blend mode.
4. Switch source from 2D image to 3D model → orbit/auto-rotate → export 3-second WebM.
5. Select a preset → duplicate it → modify dither and colors → save as custom preset.

DELIVERABLE:
Create one desktop editor screen, one exported modal state, one live-camera error state, one low-FPS adaptive-quality state, one layer-stack state, and mobile layouts. Use component variants and auto-layout so this can be exported cleanly for implementation in React + Tailwind.