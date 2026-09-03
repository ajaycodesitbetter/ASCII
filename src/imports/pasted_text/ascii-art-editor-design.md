Design a production-ready desktop UI for a professional ASCII Art Editor inspired by asc11.com, but more complete and implementation-ready.

This is not a landing page. It is a dense creative tool used to convert images, video, live webcam, and 3D models into high-quality ASCII output. The product must feel like a serious graphics editor, not a generic SaaS dashboard.

VISUAL DIRECTION
- Dark theme first.
- Background: near-black workspace.
- Panels: charcoal / soft black.
- Accent color: mustard yellow #C8B400.
- Typography: DM Mono or similar monospace UI font.
- Borders: 1px hairline only.
- Radius: 0 to 4px maximum.
- No gradients, no glassmorphism, no glows except where the tool explicitly controls glow.
- Dense, precise, sharp, technical, minimalist.
- The interface should feel like a hybrid of a code editor, motion tool, and image processing app.

PRIMARY GOAL
Create a complete high-fidelity editor design that is ready to hand off for implementation. Include all controls, states, annotations, and interaction patterns needed for a real renderer focused on quality and FPS.

APP STRUCTURE
- Top header bar, fixed.
- Left control sidebar, fixed and scrollable.
- Large central preview canvas.
- Bottom status bar with technical readouts.
- Optional right inspector panel for selected layer details.
- Design for desktop width 1440px.
- Also provide responsive layout for 1280px and mobile 390px.

TOP HEADER
Include:
- App logo and wordmark “ASCII”.
- Current project title.
- Unsaved state indicator.
- Save Draft button.
- Library, Templates, Creations, Changelog.
- Light/dark toggle.
- User avatar.
- Upgrade button.
- Performance cluster showing:
  - FPS
  - GPU/CPU mode
  - Current preview resolution like 320 / 480 / 720 / Dynamic
- Quick action button: “Reduce characters”.
- Undo and redo icons.
- Export button highlighted in yellow.

MAIN PREVIEW AREA
Design a large central canvas region with:
- Black canvas background.
- Optional transparent checkerboard background when transparency is enabled.
- Source frame showing aspect ratio.
- Top-left technical HUD overlay:
  - Source type
  - Source dimensions
  - Grid dimensions
  - Character count
  - Layer count
  - FPS
- Bottom-right compact controls:
  - fit
  - 100% zoom
  - zoom out
  - zoom in
  - hold A/B compare
  - fullscreen
- Before/after compare interaction.
- Fullscreen state with hidden controls until hover.
- Empty state:
  - “Drop image/video or click to browse”
- Loading state:
  - decoding source
  - generating render
- Low-FPS warning state:
  - “Preview quality reduced to maintain performance”
- No-WebGL fallback state.

LEFT SIDEBAR
Create collapsible control groups with uppercase section titles, value summaries, reset buttons, and compact spacing.

1. SOURCE
- Tabs: Image / Video, Live Cam, 3D Model
- Upload area
- File name, file type, dimensions, duration if video
- Source Capture Quality control:
  - 320
  - 480
  - 720
  - Dynamic
- Adaptive Preview toggle
- Performance estimate badge:
  - Fast
  - Balanced
  - High Detail

2. LAYERS
Design a true layer stack UI:
- Add Layer button
- Layer rows with:
  - visibility
  - thumbnail/icon
  - layer name
  - type
  - blend mode
  - opacity
  - drag handle
  - duplicate
  - delete
- Support layer types:
  - ASCII layer
  - FX layer
  - mask layer
- Add controls for:
  - solo layer
  - lock layer
  - rename layer
- Include example layers:
  - Base ASCII
  - Glow
  - Noise
  - CRT
- Show selected-layer inspector state.

3. ASCII STYLE
Add controls for:
- Art Style cards:
  - Classic ASCII
  - Braille
  - Halftone
  - Dot Cross
  - Line
  - Particles
  - Retro Art
  - Terminal
  - Code
- Font dropdown:
  - Helvetica Neue
  - Inter
  - Poppins
  - Space Grotesk
  - VT323 Pixel
  - Custom upload
- Character Set dropdown:
  - Standard
  - Blocks
  - Detailed
  - Minimal
  - Binary
  - Letters A-Z
  - letters a-z
  - mixed letters
  - symbols
  - Custom
- Custom charset input field with validation and live count
- Character Mapping Mode segmented control:
  - Brightness
  - Edge-aware
  - Shape-aware
- Density control
- Cell aspect ratio control
- Character spacing preview mini-demo.

4. IMAGE PROCESSING
Add a full preprocessing section before ASCII conversion:
- Brightness
- Contrast
- Gamma
- Exposure
- Sharpen
- Edge enhancement
- Preserve highlights toggle
- Auto levels button
- Histogram button and mini histogram overlay state
- Processing-order annotation:
  - preprocess → dither → character mapping → post FX

5. DITHERING
Include:
- Dither algorithm:
  - None
  - Floyd-Steinberg
  - Bayer Ordered
  - Atkinson
- Dither strength
- BG dither
- Inverse dither
- Bayer matrix size:
  - 2x2
  - 4x4
  - 8x8
- Temporal-stable toggle for video/live mode
- Short algorithm explanation panel
- Recommendation chip examples:
  - Portraits: Floyd-Steinberg
  - Live video: Bayer
  - Retro print: Atkinson
  - Fast preview: None

6. COLOR
Add:
- Color modes:
  - Grayscale
  - Full Color
  - Matrix Green
  - Amber Monitor
  - Paper Print
  - Custom
- Foreground color picker
- Background color picker
- Invert color toggle
- Transparent background toggle
- Palette quantization:
  - Full
  - 16 colors
  - 8 colors
  - 4 colors
  - 2 colors
- Chromatic aberration / color bleed slider
- Layer-specific color state.

7. TYPOGRAPHY AND COMPOSITION
Include:
- Font size
- Character spacing
- Line height
- Horizontal stretch
- Pixel snap toggle
- High-DPI preview toggle
- Alignment controls
- Crop / Fit / Fill
- Aspect ratio presets:
  - Original
  - 1:1
  - 4:3
  - 16:9
  - 9:16
  - Custom

8. POST FX
Add:
- FX preset cards:
  - None
  - Noise Field
  - Intervals
  - Beam Sweep
  - Glitch
  - CRT Monitor
  - Matrix Rain
- FX strength
- Direction selector
- Noise scale
- Noise speed
- Scanline density
- Scanline intensity
- Flicker
- Distortion
- Vignette
- Border glow
- Opacity
- Animate FX toggle
- Freeze frame button

9. INTERACTION
Add:
- Interaction mode:
  - Off
  - Attract
  - Push
- Hover strength
- Area size
- Spread
- Falloff mode:
  - linear
  - smooth
  - radial
- Show interaction radius toggle
- Mobile/touch-friendly mode

10. PRESETS
Design a preset library with thumbnail cards and metadata.
Include presets:
- Matrix
- Amber CRT
- Glitch Art
- Braille
- Beam
- Noise
- Dither2
- Portrait HD
Each preset card should show:
- thumbnail
- name
- short description
- performance label
Controls:
- Apply
- Duplicate
- Save as new preset
- Randomize
- Randomization scope:
  - style
  - color
  - dither
  - FX
  - interaction
- A/B compare slots A and B

BOTTOM STATUS BAR
Design a compact technical status strip with clickable tokens:
- Source dimensions
- Preview resolution
- Grid dimensions
- Character count
- Active font
- Dither algorithm
- Active FX
- Active layers
- FPS
- Frame time in ms
- GPU/CPU mode
Example:
SOURCE 1920x1080 | PREVIEW 480p | GRID 160x90 | 14,400 CHARS | FLOYD-STEINBERG | CRT | 58 FPS | 16.7 ms

EXPORT MODAL
Create a complete export flow modal with tabs:
- Image
- Video
- GIF
- HTML + JS
- React Component

Export controls must include:
- Preview resolution separate from export resolution
- Export resolution:
  - Original
  - 1080p
  - 1440p
  - 4K
  - Custom
- Render cost estimate:
  - file size
  - render time
  - frame count
  - final grid count
- Image format:
  - PNG
  - JPEG
  - WebP
  - SVG where supported
- Video format:
  - WebM
  - MP4
  - 24 / 30 / 60 FPS
  - loop toggle
- GIF:
  - width
  - fps
  - duration
  - color count
- HTML / React export toggles:
  - include interaction
  - include effects
  - transparent background
  - minified output
- Export quality modes:
  - Fast
  - Balanced
  - Maximum
- Warning banner for expensive exports:
  - “4K + Floyd-Steinberg + 60 FPS may take significant time”
- Export queue state
- Export success state
- Export error state

QUALITY-FOCUSED UI ADDITIONS
This part is critical. Add explicit UI for quality diagnostics so the implementation can solve the bad rendering quality:
- Cell aspect ratio control
- Shape-aware mapping mode
- Edge-aware mapping mode
- High-DPI preview toggle
- Pixel snap toggle
- Sharpen and edge enhancement controls
- Histogram / auto-levels
- Diagnostic warning chip:
  - “Low grid density for portrait detail”
- Suggestion chips:
  - Increase density
  - Fix cell ratio
  - Reduce color noise
  - Switch to grayscale for structure check
- Live quality meter with labels:
  - Fast
  - Balanced
  - Detail
- Show why quality is low when FPS is high but detail is bad

STATES TO DESIGN
Create all of these as separate frames or variants:
- Default editor
- Portrait HD preset active
- Low quality / low density warning
- Adaptive preview active
- Live camera permission denied
- Camera missing
- Camera busy
- No WebGL fallback
- Export modal open
- Export success
- Export error
- Layer stack expanded
- Selected layer inspector open
- Before/after compare active
- Fullscreen canvas mode
- Empty state
- Loading state

ANNOTATIONS FOR HANDOFF
Add implementation notes inside the Figma file:
- Preview resolution is separate from export resolution
- Quality controls affect real rendering, not just UI state
- Cell aspect ratio and glyph spacing are critical for visual quality
- Adaptive preview must reduce preview cost without changing export output
- Shape-aware mapping should be available for still-image quality presets
- Temporal-stable dithering is recommended for video/live sources
- Layers must be composited in render pipeline, not just visually stacked in UI

COMPONENT REQUIREMENTS
Use auto-layout, variants, reusable components, consistent spacing tokens, and named components for:
- buttons
- tabs
- sliders
- segmented controls
- dropdowns
- layer rows
- preset cards
- HUD chips
- status tokens
- export rows
- warning banners
- tooltips
- empty states
- error states

FINAL DELIVERABLE
Produce:
- one complete desktop editor screen
- one editor screen with low-quality warning
- one layer-stack screen
- one export modal screen
- one live-camera error screen
- one fullscreen preview screen
- one responsive mobile adaptation

The output should be implementation-ready for a React + Tailwind app and should prioritize rendering quality diagnostics and professional editor usability.