Full Scrape of asc11.com — All Features & Controls
Here's everything I captured from the site:

🔲 LAYOUT STRUCTURE
Header: Large bold "ASCII" logo (top-left) + tagline "ASCII EDITOR FOR ART, VIDEO, LIVE CAM, AND WEBGL EXPORTS" + nav links (Terms, Privacy, Changelog, Upgrade button, User avatar)

Main area: Left sidebar (controls panel) + Right main canvas (preview area)

Color scheme: Pure black #000000 background, white text, yellow/gold accent for active buttons (#C8B400 approx), dark gray borders on cards/sections

📦 ALL CONTROL SECTIONS (Left Sidebar)
1. SOURCE
Two tab buttons: IMAGE / VIDEO (active, yellow bordered) | LIVE CAM

QUALITY dropdown (top right of section): 320, 480, 720

Drop zone: dashed border box — "Drop image/video or click to browse" — "Supports: JPG, PNG, GIF, MP4, WebM — Max: 1MB (Free 1MB / Pro 10MB)"

2. LAYER
Button: ASCII (active, yellow border) + ADD LAYER button

3. ART STYLE (Grid of style buttons)
Col 1	Col 2
Classic ASCII (active/selected)	Braille
Halftone	Dot Cross
Line	Particles
Claude Code	Retro Art
Terminal	(empty)
4. FONT (Dropdown)
Options: Helvetica Neue, Inter, Poppins, Space Grotesk, VT323 (Pixel)

5. CHARACTER SET (Dropdown)
Options: Standard (@%#*+=-:. ), Blocks (█▓▒░ ), Detailed ($@B%8&WM...), Minimal (·░█), Binary (01), Custom, Letters (A-Z), Letters (a-z), Letters (Aa), Letters (Symbols)

6. DITHER ALGORITHM (Dropdown)
Options: None, Floyd-Steinberg (default), Bayer (Ordered), Atkinson

7. SLIDERS
Label	Min	Max	Default
BRIGHTNESS	-50	50	0
BG DITHER	0	3	0
INVERSE DITHER	0	3	0
CHARACTER SPACING	0.7	2	1x
VIGNETTE	0	1	0
CONTRAST	0.5	2.5	1
DITHER STRENGTH	0	2	0.8
FONT SIZE	6px	20px	10px
OPACITY	0	1	1
BORDER GLOW	0	1	0
8. COLOR MODE
Checkbox: INVERT COLOR

Pill/Tab buttons: Grayscale | Full Color | Matrix Green | Amber Monitor | Custom

9. FX PRESET (Buttons grid)
None | Noise Field | Intervals | Beam Sweep | Glitch | CRT Monitor | Matrix Rain

10. FX STRENGTH Slider
Range: 0.05 → 1, Default: 0.45

11. DIRECTION (8-way direction picker)
Up | Down | Left | Right | Top Left | Top Right | Bottom Left | Bottom Right

12. NOISE SCALE Slider
Range: 4 → 96, Default: 24

13. NOISE SPEED Slider
Range: 0 → 3, Default: 1

14. MOUSE INTERACTION
Toggle buttons: Attract | Push

15. HOVER STRENGTH Slider
Range: 4 → 64, Default: 24

16. AREA SIZE Slider
Range: 40px → 640px, Default: 180px

17. SPREAD Slider
Range: 0.25 → 3, Default: 1x

18. BOTTOM STATUS BAR (info strip)
FMT: ASCII CANVAS | STYLE: CLASSIC | FONT: HELVETICA NEUE | AR: SOURCE | FX: NOISE | BG: #000000 | RES: DYNAMIC

19. BOTTOM BUTTONS
PRESETS | RANDOM | EXPORT

🎨 FIGMA PROMPT — Redesign Your Current App to Match asc11.com
Copy and paste this into Figma AI / your designer:

Redesign this ASCII art generator app UI to match the professional style of asc11.com. Keep all existing functionality but apply these changes:

THEME & COLOR:

Change background from bright blue to pure black (#000000)

Change all text to white (#FFFFFF) in uppercase, small tracking

Use yellow-gold (#C8B400 or #D4AF37) ONLY for active/selected states and button borders

Remove all blue fills — replace with dark #111111 card backgrounds and #2a2a2a borders

LAYOUT:

Left sidebar: narrow scrollable panel (~320px wide) containing all controls stacked vertically with section labels in small caps

Right panel: full-height black canvas area showing the ASCII preview output

Header: top bar with large bold "ASCII" wordmark left-aligned, tagline text small beneath it, nav items right-aligned

CONTROLS PANEL — Add these missing sections:

SOURCE section: two toggle tabs (IMAGE/VIDEO | LIVE CAM) + QUALITY dropdown (320/480/720) + dashed upload dropzone

LAYER section: "ASCII" tab + "ADD LAYER" button (outlined style)

ART STYLE section: 2-column grid of 9 style buttons — Classic ASCII, Braille, Halftone, Dot Cross, Line, Particles, Claude Code, Retro Art, Terminal — outlined buttons, yellow border on selected

FONT dropdown: Helvetica Neue / Inter / Poppins / Space Grotesk / VT323

CHARACTER SET dropdown: Standard, Blocks, Detailed, Minimal, Binary, Custom, Letters variants

DITHER ALGORITHM dropdown: None / Floyd-Steinberg / Bayer / Atkinson

Sliders (label left, value right): Brightness, BG Dither, Inverse Dither, Character Spacing, Vignette, Contrast, Dither Strength, Font Size, Opacity, Border Glow

COLOR MODE: Invert checkbox + 5 pill buttons (Grayscale, Full Color, Matrix Green, Amber Monitor, Custom)

FX PRESET: 7 buttons in grid (None, Noise Field, Intervals, Beam Sweep, Glitch, CRT Monitor, Matrix Rain)

FX sub-controls: FX Strength slider, Direction 8-button grid, Noise Scale, Noise Speed sliders

MOUSE INTERACTION: Attract | Push toggle

HOVER controls: Hover Strength, Area Size, Spread sliders

TYPOGRAPHY:

All section labels: uppercase, letter-spacing 0.15em, font-size 11px, color #888888

Button text: uppercase, weight 500

Main logo: weight 900, ~64px, white

BOTTOM BAR:

Add a slim status strip at the very bottom showing: FMT | STYLE | FONT | AR | FX | BG | RES as small monospace text

Add 3 action buttons bottom-right: PRESETS | RANDOM | EXPORT

PREVIEW CANVAS (right panel):

Black background, the ASCII output renders here in the selected font/color

No placeholder text — just a dark empty canvas when no image is loaded

Show the rendered ASCII art filling the full right panel

