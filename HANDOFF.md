# Project
ASC11-inspired ASCII art editor clone.

# Current goal
Release Freeze — all development, tuning, and verification passes are complete.

# Confirmed implemented fixes (Final State)
- Grid columns decoupled from source quality using:
  320 -> 110 cols
  480 -> 140 cols
  720 -> 170 cols
- Default charset changed to Standard (space-first)
- Classic ASCII ramp changed to a space-to-dense ramp: " .,:;i1tfLC08@"
- Dither strength default = 1.0
- Histogram-aware tonal remap: 0.8%/99.2% percentile stretch
- Webcam tonal remap uses EMA smoothing
- Font density calibration: proportional fonts set to 1.0, VT323 0.84, Courier 0.95
- VT323 Vertical Aspect Distortion fixed (row height multiplier adjusted for 0.82 aspect)
- Shadow contour banding smoothed (gamma curve on luminance < 0.25)
- Braille Full Color: 2×2 sub-pixel averaging
- Line Mode Sobel uses pre-dither luminance (clean edges, no false noise)
- Dot-cross level multiplier: 4.5
- Particles skip threshold: 0.45
- Line mode sparse fill char order corrected
- Bayer + Full Color mode mid-tone fringing fixed (RGB scaled by dithered luminance ratio)

# Files changed recently
- src/app/components/AsciiCanvas.tsx
- src/app/components/Sidebar.tsx
- src/app/App.tsx

# What still needs validation
- **None.** Regression verification passed across 320/480/720, all styles, fonts, and colors. The app builds cleanly.

# Remaining Known Limitations (Accepted)
- Proportional font cell misalignment (inherent to proportional fonts in grid renders)
- Cross-origin canvas export taint (standard browser security CORS limitation)

# Next agent instructions
The project is completely frozen and ready for release. Do not add new features, rewrite architecture, or perform further tuning. Any future work should be extremely narrow bug-fixes only, if discovered in production.
