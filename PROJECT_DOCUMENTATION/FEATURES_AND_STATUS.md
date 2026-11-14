# EARTHBEAT — Features and System Status

**Project:** EARTHBEAT – Hear Our Planet  
**Team:** Stellar Mind X  
**Challenge:** The Earth Information Jukebox  
**Event:** NASA Space Apps Challenge 2026 – Harohalli, Karnataka, India  
**Status Date:** 14 November 2026  

---

## 1. Verified Working Features

### 1.1 Authentic NASA Data Integration
- [x] **Primary Dataset: NASA GISTEMP Global Surface Temperature Anomalies (1880–2026)**
  - 1,762 consecutive monthly records loaded and verified.
  - Values represent global temperature deviation in °C relative to the 1951–1980 baseline.
  - Range: -0.81°C (Dec 1893) to +1.55°C (record warm anomalies in recent years).
- [x] **Secondary Dataset: NASA POWER Daily Meteorology (2020–2025)**
  - 2,161 daily weather observations for Bengaluru (12.9716°N, 77.5946°E).
  - Temperature, precipitation, and relative humidity.
- [x] **Offline & Online Resilience:**
  - Works with standard local web servers via HTTP `fetch()`.
  - Seamlessly falls back to `embedded_data.js` if opened offline or via `file:///` protocol without server.

### 1.2 Data-Driven Sonification (Web Audio API)
- [x] **Mathematically Mapped Frequency:**
  - Base zero-anomaly reference tone = **400 Hz** (Earth's 1951–1980 mean climate).
  - Sensitivity: 190 Hz per °C anomaly (`frequency = 400 + (anomaly * 190)`).
  - Dynamic range: 180 Hz (deep historical chill) to 760 Hz (urgent modern warming).
  - Anti-click envelope shaping (exponential ramp attack/decay).
- [x] **Playback Controls:**
  - Sequential playback through all 1,762 observations.
  - Play, Pause, Resume, and Stop controls.
  - Previous and Next single-step buttons.
  - Multi-speed playback selector (0.5x, 1x, 2x, 4x).
  - Master volume slider and instant mute toggle.
- [x] **Audio Legend Test Bench:**
  - Dedicated interactive buttons to sample individual reference frequencies:
    - Cool historical tone (240 Hz / -0.80°C)
    - Baseline zero reference (400 Hz / 0.00°C)
    - Modern warming tone (700 Hz / +1.55°C)

### 1.3 Scientific Visualization & User Experience
- [x] **Animated 3D-Styled Earth Globe:**
  - Dynamic color transitions based on temperature anomaly:
    - Ocean cyan for cool historical periods (< 0.0°C).
    - Temperate blue-green near baseline (0.0°C).
    - Amber for moderate warming (> +0.5°C).
    - Radiant burning orange/red for extreme warming (> +1.0°C).
  - Atmospheric pulsing glow and animated cloud rotation.
- [x] **Interactive Canvas Line Chart:**
  - 2D canvas chart with smooth gradient area fill.
  - Dashed zero-anomaly baseline.
  - Active scrubber line and glowing dot locked to current observation.
  - Dynamic tooltip showing date and numerical value.
  - Click-and-drag scrubbing directly on the canvas.
  - Era quick-jump buttons (Full 1880–2026, 1900–1970, 1970–2026, 2015–2026).
- [x] **Live KPI Cards:**
  - Instant digital display of Observation Date, Temperature/Anomaly, Sonification Pitch (Hz), and Total Records.

### 1.4 Accessibility & Educational Narration
- [x] **"What Am I Hearing?" Dynamic Narration:**
  - Continuous plain-language text updates explaining the physical and climatic significance of the currently playing note.
- [x] **Comprehensive Audio Legend:**
  - Clear explanations of pitch, frequency mapping, baseline reference, and rhythm.
- [x] **Full Keyboard Navigation:**
  - `Space`: Play / Pause
  - `ArrowLeft` / `ArrowRight`: Step backward / forward 1 month
  - `Shift + ArrowLeft` / `Shift + ArrowRight`: Jump 1 year backward / forward
  - `Home` / `End`: Jump to beginning (1880) / end (2026)
  - `S` or `Escape`: Stop and reset
  - `M`: Toggle mute
- [x] **High-Contrast Keyboard Focus Indicators:**
  - Custom `:focus-visible` styles with cyan outline and glow for accessible navigation.
- [x] **Screen Reader Support:**
  - ARIA live region (`#srAnnouncements`) that announces date, value, and pitch changes to assistive technology.

---

## 2. Technical Limitations & Untested Environments

- **Browser Web Audio Auto-play Restrictions:**
  - All modern browsers require a user interaction (such as clicking Play or any button) before audio playback is permitted by the browser security sandbox. The website gracefully waits for user interaction.
- **Screen Reader Software Tested:**
  - Semantic HTML tags, ARIA labels, and ARIA live regions were implemented according to WCAG 2.1 AA standards; testing with specific screen readers (NVDA, JAWS, VoiceOver) should be performed on target judge hardware.
