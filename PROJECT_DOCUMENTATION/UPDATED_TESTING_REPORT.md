# EARTHBEAT — Updated Verified Testing Report

**Project:** EARTHBEAT – Hear Our Planet  
**Team:** Stellar Mind X  
**Challenge:** The Earth Information Jukebox  
**Testing Date:** 14 November 2026  
**Build Target:** 07_FINAL_WEBSITE  

---

## 1. Automated & Browser Functionality Test Matrix

| Test ID | Test Item | Expected Result | Actual Result | Verification Status |
|---|---|---|---|---|
| **T-01** | Open Website via Local Server (`run_website.bat`) | Opens `http://localhost:8000` in browser | HTTP 200 OK, full layout renders | **PASSED** |
| **T-02** | Direct File Opening (`file:///` protocol) | Opens directly, loads data without CORS failure | Loaded via embedded data fallback | **PASSED** |
| **T-03** | NASA GISTEMP Data Loading | 1,762 monthly records loaded (1880–2026) | All 1,762 records parsed with correct dates & values | **PASSED** |
| **T-04** | NASA POWER Weather Data Loading | 2,161 daily records loaded for Bengaluru | All 2,161 daily records parsed | **PASSED** |
| **T-05** | Dataset Switcher Toggle | Reconfigures slider, chart, globe, and stats | Switched seamlessly between GISTEMP & POWER | **PASSED** |
| **T-06** | Canvas Line Chart Rendering | Plots complete timeline with gradient fill & baseline | Chart renders with 0.0°C baseline & gridlines | **PASSED** |
| **T-07** | Interactive Timeline Scrubber | Dragging updates current date, value, and globe | Slider updates all components simultaneously | **PASSED** |
| **T-08** | Earth Globe Visual Reaction | Globe shifts color from cool blue to warm amber/red | Confirmed dynamic CSS gradient & box-shadow | **PASSED** |
| **T-09** | Sonification Engine Tone Generation | Generates clean triangle wave pitch via Web Audio API | Pitch calculates accurately (180 Hz to 760 Hz) | **PASSED** |
| **T-10** | Playback Controls (Play / Pause / Resume) | Plays sequentially, pauses without sound bleed | State toggles cleanly between Play and Pause | **PASSED** |
| **T-11** | Stop Button | Halts all sound oscillators and resets to beginning | AudioContext active oscillators stopped, slider resets | **PASSED** |
| **T-12** | Step Controls (Prev / Next) | Advances or reverses by single observation | Advances 1 month/day and sounds individual note | **PASSED** |
| **T-13** | Playback Speed Selector | Adjusts step speed (0.5x, 1x, 2x, 4x) | Step delay adjusts from 240ms down to 30ms | **PASSED** |
| **T-14** | Master Volume & Mute Controls | Modulates gain and mutes audio | Volume ramps smoothly; mute silences master gain | **PASSED** |
| **T-15** | Audio Legend Test Tone Buttons | Plays isolated 240 Hz, 400 Hz, 700 Hz sample tones | Each button triggers correct test frequency | **PASSED** |
| **T-16** | "What Am I Hearing?" Narration | Dynamic text updates describing current climate era | Text updates on every step with scientific explanation | **PASSED** |
| **T-17** | Keyboard Shortcuts | Space (Play), Arrows (Step), Shift+Arrows (Year), Home/End, M (Mute) | Keydown handler triggers all respective controls | **PASSED** |
| **T-18** | Keyboard Focus Styling | Visible high-contrast focus rings on all buttons | `:focus-visible` styles with 3px cyan outline verified | **PASSED** |

---

## 2. Audio Mapping Verification

- **Baseline 0.00°C Anomaly:** Tested at **400 Hz** (Steady middle reference pitch).
- **Historic Cold Anomalies (e.g., Dec 1893: -0.81°C):**
  - Calculated: `400 + (-0.81 * 190) = 246 Hz`.
  - Auditory feedback: Low, resonant, cool pitch. Verified.
- **Historic Baseline Period (e.g., Jun 1960: -0.01°C):**
  - Calculated: `400 + (-0.01 * 190) = 398 Hz`.
  - Auditory feedback: Near 400 Hz reference baseline. Verified.
- **Recent Record Warming (e.g., Oct 2024: +1.55°C):**
  - Calculated: `400 + (1.55 * 190) = 694.5 Hz`.
  - Auditory feedback: Urgent, high, piercing warming pitch. Verified.

---

## 3. Accessibility & Usability Observations

1. **Hearing-Visual Association:** The simultaneous rise in pitch and transformation of the Earth globe from ocean blue to ember red creates an intuitive understanding of global warming even for non-technical visitors.
2. **Interactive Sound Test Bench:** Having dedicated buttons for judges to click and hear 240 Hz, 400 Hz, and 700 Hz removes any ambiguity about what the sounds mean.
3. **Ear Comfort:** Exponential gain ramps (attack: 20 ms, decay: 80–120 ms) prevent audio pops or ear fatigue during extended playback.

---

**Report Prepared By:** Stellar Mind X Integration Team  
**Final Verdict:** Fully Verified and Ready for Space Apps Demonstration.
