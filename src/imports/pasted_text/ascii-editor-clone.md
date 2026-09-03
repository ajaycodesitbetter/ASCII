Turn this UI into a fully functional clone of asc11.com’s ASCII editor.
The goal is that every visible control in the sidebar, header, canvas, and status bar has a real effect on the ASCII preview, with no dead UI and no console errors.

Use this behavior checklist and wire everything accordingly:

SOURCE

[IMAGE / VIDEO] tab:

Clicking opens file picker and pipes JPG/PNG/GIF/MP4/WebM into the renderer.

Enforce 1 MB limit (show inline error if exceeded) and show file name in the source section.

[LIVE CAM] tab:

Request webcam via getUserMedia, show live camera feed converted to ASCII in the canvas.

QUALITY dropdown (320/480/720) changes the internal render resolution and updates the status bar RES token.

LAYER

ASCII tab remains always present as base layer.

[+ ADD LAYER] creates additional ASCII layers stacked over each other, each with its own style and opacity.

Ensure adding/removing layers never crashes state (use unique IDs, no index-as-key bugs).

ART STYLE

Classic ASCII, Braille, Halftone, Dot Cross, Line, Particles, Claude Code, Retro Art, Terminal:

Each button switches to a distinct shader or sampling pattern.

STYLE token in the status bar must update to the current art style.

FONT

Dropdown must change the actual font used for the ASCII rendering (canvas text, not just UI font).

FONT token in the status bar reflects the active font name in uppercase.

CHARACTER SET

Each option (Standard / Blocks / Detailed / Minimal / Binary / Letters variants) changes the characters used to render brightness.

When CUSTOM is selected, show a text field where the user can type their own character sequence, and use it immediately in the renderer.

CHARS token in the status bar shows the active set (“STANDARD DENSE”, “BINARY”, etc.).

DITHER ALGORITHM

None, Floyd‑Steinberg, Bayer, Atkinson:

Implement real dithering at the luminance stage.

Make sure changing algorithm shows a visible difference on the same frame.

SLIDERS (ALL MUST BE LIVE‑WIRED)

BRIGHTNESS (−50 → 50): offset luminance before mapping to chars.

BG DITHER (0 → 3): controls background noise intensity.

INVERSE DITHER (0 → 3): controls inverse dither strength for dark regions.

CHARACTER SPACING (0.7 → 2): scales horizontal spacing between characters.

VIGNETTE (0 → 1): darkens corners based on value.

CONTRAST (0.5 → 2.5): multiplies contrast before mapping to chars.

DITHER STRENGTH (0 → 2): global multiplier applied to selected dithering algorithm.

FONT SIZE (6 → 20 px): directly updates canvas font size and reflows layout.

OPACITY (0 → 1): controls ASCII layer alpha blending over background.

BORDER GLOW (0 → 1): adds outer glow around canvas, implemented with CSS or an additional compositing pass.

All sliders should update in real time while dragging, with their numeric labels (including units) staying in sync.

COLOR MODE

INVERT COLOR checkbox:

Swaps fg/bg colors on the ASCII output only, not on the UI.

Color pills:

GRAYSCALE: FG white on black BG.

FULL COLOR: use sampled source color per character.

MATRIX GREEN: FG #00ff41 on black BG.

AMBER MONITOR: FG #ffbf00 on very dark brown/black BG.

CUSTOM: show FG and BG color pickers; changes apply instantly to the canvas.

BG token in the status bar must show the current BG hex.

FX PRESET AND FX CONTROLS

Preset buttons: None, Noise Field, Intervals, Beam Sweep, Glitch, CRT Monitor, Matrix Rain.

Each preset maps to a combination of FX parameters (direction, noise scale, noise speed, strength).

Switching presets updates those controls visually.

FX STRENGTH slider (0.05 → 1): global multiplier for the current effect.

DIRECTION 3×3 grid: maps to a vector used by the FX system.

NOISE SCALE (4 → 96): sets spatial scale of noise.

NOISE SPEED (0 → 3): controls animation speed; 0 must freeze the effect.

FX token in the status bar shows the active FX preset.

MOUSE INTERACTION & HOVER

MOUSE INTERACTION toggles:

ATTRACT: characters move toward the cursor within AREA SIZE radius using HOVER STRENGTH as force.

PUSH: characters are repelled from the cursor instead.

HOVER STRENGTH (4 → 64): magnitude of the attract/push effect.

AREA SIZE (40 → 640 px): radius around cursor in which characters respond.

SPREAD (0.25 → 3): how far characters can deviate from their base position.

Implement raycasting / coordinate mapping so these effects are visible when moving the mouse over the canvas.

STATUS BAR

FMT, STYLE, FONT, FX, BG, RES, CHARS must all be driven from real state, not hardcoded strings.

Use safe fallbacks, but never show “undefined”; use “—” when a value is missing.

ACTION BUTTONS

PRESETS: opens or cycles through a set of saved parameter combinations (art style, font, colors, FX, sliders).

RANDOM: randomizes model, character set, art style, color mode, and FX preset in a controlled way (no invalid combos).

EXPORT: downloads a PNG export of the current ASCII canvas. Use the actual WebGL / canvas element, not a dummy node.

ERROR‑FREE CROSS‑CHECK

For each control, create a Figma annotation or dev note: “When this changes, what do we expect in the canvas and in the status bar?”

Run through an end‑to‑end checklist:

Upload image → see ASCII.

Switch art styles → visible change.

Change font and font size → visible change.

Toggle invert and color modes → color changes.

Adjust all sliders once → each produces a visible effect.

Apply FX presets and directions → motion/FX change.

Use LIVE CAM → live ASCII video works.

EXPORT → downloads a non‑empty PNG file.

Fix any control that has no effect, any console error, or any type mismatch until the behavior matches asc11.com.

The final result should behave like asc11.com: no control is decorative, all ranges match the spec, and changing any control immediately affects the ASCII preview and is reflected in the status bar.