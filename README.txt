========================================================================
EARTHBEAT -- HEAR OUR PLANET
The Earth Information Jukebox
NASA Space Apps Challenge 2026 | Harohalli, Karnataka, India
Team: Stellar Mind X
========================================================================

Welcome to EARTHBEAT! This folder contains the complete, unified, working
EARTHBEAT website built using real NASA planetary data.


------------------------------------------------------------------------
HOW TO OPEN AND RUN THE WEBSITE (2 EASY METHODS)
------------------------------------------------------------------------

METHOD 1 (RECOMMENDED -- ONE-CLICK):
Double-click "run_website.bat" in this folder.
- A small black command window will open and start a local web server.
- Your default web browser (Edge, Chrome, Firefox) will automatically open
  to: http://localhost:8000/
- When you are done exploring, simply close the black command window.

METHOD 2 (DIRECT DOUBLE-CLICK):
Double-click "index.html" directly.
- The website will open in your browser immediately.
- Thanks to the included offline data cache, the website will work
  smoothly even without running a local server.


------------------------------------------------------------------------
WHAT TO SHOW JUDGES (DEMO SCRIPT IN 4 STEPS)
------------------------------------------------------------------------

STEP 1: INTRODUCE THE PROJECT & BASELINE
- Explain that EARTHBEAT turns 140+ years of NASA GISTEMP temperature
  observations into real sound and dynamic visual feedback.
- Point out the Reference Baseline Banner (0.00°C = Earth's 1951-1980 mean climate).
- Point out the Audio Legend: 400 Hz is the baseline reference tone. Higher
  frequencies = warming anomalies; lower frequencies = cooler historical eras.

STEP 2: TEST THE AUDIO LEGEND
- Scroll down to the "Audio Legend & Sound Mapping" section.
- Click the interactive test buttons:
  * "Test Cool Tone (240 Hz / -0.80°C)" -> Deep, cool tone from the late 1800s.
  * "Test Baseline Tone (400 Hz / 0.00°C)" -> Earth's stable climate reference.
  * "Test Warm Tone (700 Hz / +1.55°C)" -> Urgent high pitch of modern warming.

STEP 3: PLAY THE CLIMATE TIMELINE
- Click "▶ Play" in the console.
- Watch and listen as the timeline moves from 1880 to 2026:
  * The sound steadily rises in pitch from cool deep frequencies to sharp,
    urgent high tones in the 2020s.
  * The Earth Globe visually transitions from cool ocean cyan to intense amber/red.
  * The Canvas Chart tracks the exact month with a glowing scrubber point.
  * The "What Am I Hearing?" panel continuously explains the scientific context.

STEP 4: INTERACTIVE CONTROLS & DATASET SWITCHING
- Drag the timeline slider to scrub backward and forward through history.
- Click "1970–2026" or "2015–2026" to jump directly to recent decades.
- Switch to "NASA POWER: Bengaluru Weather (2020–2025)" to demonstrate
  local meteorological sonification with temperature, rain, and humidity.
- Press the Spacebar to Pause and Resume.
- Use the Left and Right arrow keys on the keyboard to step month by month.


------------------------------------------------------------------------
FOLDER STRUCTURE
------------------------------------------------------------------------
07_FINAL_WEBSITE/
├── index.html                   (Main website entry point)
├── run_website.bat              (One-click server launcher)
├── README.txt                   (This instruction guide)
├── css/
│   └── style.css                (Space-themed design & accessibility styling)
├── js/
│   ├── app.js                   (Application controller & keyboard navigation)
│   ├── sonification.js          (Web Audio API sound engine & pitch mapping)
│   ├── visualization.js         (Canvas line chart, globe & starfield)
│   └── data-loader.js           (NASA CSV loader with offline fallback)
├── data/
│   ├── GLB_cleaned_monthly.csv  (1,762 monthly GISTEMP climate records, 1880-2026)
│   ├── POWER_Point_Daily_cleaned.csv (2,161 daily weather records, Bengaluru)
│   ├── GLB_comparison_all_models_monthly.csv (Multi-sensor comparison data)
│   └── embedded_data.js         (Pre-parsed offline NASA data cache)
└── PROJECT_DOCUMENTATION/
    ├── FEATURES_AND_STATUS.md   (Complete inventory of working features)
    ├── PRESENTATION_GUIDE.md    (Step-by-step judge presentation script)
    ├── UPDATED_TESTING_REPORT.md (Actual verified testing results)
    └── UPDATED_INTEGRATION_STATUS.md (Updated integration milestones)


------------------------------------------------------------------------
NASA DATA SOURCES & SCIENTIFIC CITATIONS
------------------------------------------------------------------------
1. NASA GISS GISTEMP v4 (Global Land-Ocean Temperature Index):
   Goddard Institute for Space Studies, NASA.
   URL: https://data.giss.nasa.gov/gistemp/
2. NASA POWER Daily Meteorology (Prediction of Worldwide Energy Resources):
   Langley Research Center, NASA.
   Coordinates: 12.9716°N, 77.5946°E (Bengaluru).
   URL: https://power.larc.nasa.gov/
3. NASA Aqua Satellite AIRS (Atmospheric Infrared Sounder):
   Jet Propulsion Laboratory, NASA.
   URL: https://airs.jpl.nasa.gov/
