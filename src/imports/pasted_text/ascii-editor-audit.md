
You are an expert UI/UX and interaction auditor.
Your task: verify that this ASCII editor Figma project is a faithful functional clone of asc11.com (editor + export + Dither2 quality).

Assume the target implementation is in React/TypeScript.
Do an in‑depth parity check and highlight any mismatch or missing behavior.

Work through this checklist step‑by‑step:

1. Layout & Navigation
Compare our layout to asc11.com:

Header: big “ASCII” wordmark, tagline, TERMS/PRIVACY links, CHANGELOG/UPGRADE buttons, avatar.

Model strip: profile/logo/computer/plant/shiba/crystal buttons.

Main area: left sidebar (all controls scrollable), right ASCII canvas, bottom status bar.

Flag any visual or layout differences (spacing, alignment, typography sizes, border colors) that would break a 1:1 look.

2. Controls Inventory (No Missing Controls)
Verify that every control present on asc11.com exists in our file:

SOURCE: IMAGE/VIDEO, LIVE CAM, QUALITY dropdown, upload dropzone.

LAYER: ASCII tab, + ADD LAYER.

ART STYLE: Classic ASCII, Braille, Halftone, Dot Cross, Line, Particles, Claude Code, Retro Art, Terminal.

FONT dropdown: Helvetica Neue, Inter, Poppins, Space Grotesk, VT323.

CHARACTER SET dropdown: Standard, Blocks, Detailed, Minimal, Binary, Custom, Letter variants.

DITHER ALGORITHM dropdown: None, Floyd‑Steinberg, Bayer, Atkinson.

All sliders (Brightness, BG Dither, Inverse Dither, Character Spacing, Vignette, Contrast, Dither Strength, Font Size, Opacity, Border Glow, Noise Scale, Noise Speed, Hover Strength, Area Size, Spread).

COLOR MODE with pills and Invert Color checkbox.

FX preset buttons and Direction grid.

Mouse Interaction toggles.

Status bar tokens + PRESETS / RANDOM / EXPORT buttons.

For every control, add a dev note explaining what state field it should map to in React and what visual feedback should occur.

3. Default “Dither2” Quality Settings
Confirm that the default state of our editor matches the Dither2 ASCII Render configuration on asc11.com:

QUALITY = 320, AR = 16:9, RES = DYNAMIC.

ART STYLE = Classic ASCII.

DITHER ALGORITHM = Floyd‑Steinberg.

BRIGHTNESS = 25 (on −50 → 50), CONTRAST = 0.6 (0.5 → 2.5).

DITHER STRENGTH = 0.8, BG DITHER = 3, INVERSE DITHER = 0.

FONT = Helvetica Neue, FONT SIZE = 7px.

CHARACTER SPACING = 0.7x, CHARACTER SET = Standard.

COLOR MODE = Grayscale, OPACITY = 1, BORDER GLOW = 0, BG ≈ #050505.

Annotate the Figma file with these exact numeric defaults so developers can wire them into initial React state.

4. ASCII Quality & Pipeline Order
Add a dev annotation describing the required render pipeline to match asc11.com quality:

Capture source frame at selected QUALITY (320/480/720).

Convert to grayscale.

Apply BRIGHTNESS and CONTRAST.

Apply DITHER ALGORITHM with DITHER STRENGTH, BG DITHER, INVERSE DITHER.

Map to characters using the selected CHARACTER SET, respecting character order.

Render with FONT, FONT SIZE, CHARACTER SPACING on the canvas.

Call out that small font size + tight spacing + Floyd‑Steinberg are required to reach Dither2‑level crispness.

5. Behavior Parity – Interaction & FX
For each of these, add a note specifying the expected effect and test scenario:

Mouse Interaction:

ATTRACT / PUSH must influence ASCII positions based on HOVER STRENGTH, AREA SIZE, SPREAD.

FX presets:

NONE, Noise Field, Intervals, Beam Sweep, Glitch, CRT Monitor, Matrix Rain.

Each preset should define a combination of FX STRENGTH, DIRECTION, NOISE SCALE, NOISE SPEED.

Status bar:

FMT, STYLE, FONT, FX, BG, RES, CHARS must always reflect live state (no hardcoded text).

Mark any control in the Figma file that lacks a clear mapping to renderer behavior.

6. Export Panel & Options
Verify that the export panel matches the asc11 creation export UI:

Export format selector: HTML + JS BG, React Component, Image, MP4 Video, GIF.

Behaviour toggles: Transparent background, Enable hover + click interaction effects, Alpha mask gradient, Fade in, Pause when off‑screen, Adaptive performance.

Pro‑only “Split into HTML + external JavaScript file” toggle and Pro messaging.

Target FPS dropdown with options 12 / 20 / 30 / 60 (default 30).

UPGRADE TO PRO + DOWNLOAD buttons with correct states for free vs Pro.

Add dev notes describing:

Which options control embed code vs rendering pipeline.

What is allowed for free users vs Pro (copy / download behavior).

7. End‑to‑End Test Script (for devs)
Add a final frame with a written test script that devs must run before we export to Antigravity:

Load an image → confirm ASCII appears, status bar updates RES/AR/STYLE/CHARS correctly.

Switch QUALITY (320 → 480 → 720) → grid density changes accordingly.

Change Art Style → visible pattern change.

Change FONT and FONT SIZE → text appearance changes, spacing remains aligned.

Toggle COLOR MODE & INVERT → grayscale/full‑color/matrix/amber behave as expected.

Adjust BRIGHTNESS / CONTRAST / DITHER sliders → subtle but visible changes in the ASCII.

Choose the “Dither2” preset → confirm values match defaults from asc11 and visual detail is high.

Toggle Mouse Interaction / Hover sliders → interactive response when moving the cursor over the canvas.

Open EXPORT → check options and ensure they align with asc11 export panel wording.

Trigger DOWNLOAD (or mock) → exported canvas or embed matches the current on‑screen state.

8. Final Checklist Before Download
Mark any mismatches vs asc11.com with red annotations.

Only when all sections are annotated as “MATCHED” (layout, controls, defaults, ASCII quality, interactions, export) mark the file as “Ready for Antigravity download”.