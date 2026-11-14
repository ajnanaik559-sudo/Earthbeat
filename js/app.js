/* ============================================================
   EARTHBEAT — Main Application Controller
   Orchestrates data, visualization, sonification, and accessibility
   Team: Stellar Mind X | NASA Space Apps Challenge 2026
============================================================ */

window.EarthBeatApp = (() => {
  let dataset = [];
  let currentIndex = 0;
  let isPlaying = false;
  let playbackTimer = null;
  let currentDatasetType = "gistemp"; // "gistemp" or "power"
  let stepDelayMs = 120; // 1x normal speed

  // DOM Elements
  let slider, btnPlay, btnStop, btnPrev, btnNext;
  let kpiDate, kpiValue, kpiPitch, kpiTotal;
  let hearText, hearPitchSub;
  let statusDot, statusText;
  let srAnnounce;

  // 1. Initialize Application
  async function init() {
    console.log("[EarthBeatApp] Initializing EARTHBEAT...");

    // Cache elements
    slider = document.getElementById("timelineSlider");
    btnPlay = document.getElementById("btnPlay");
    btnStop = document.getElementById("btnStop");
    btnPrev = document.getElementById("btnPrev");
    btnNext = document.getElementById("btnNext");

    kpiDate = document.getElementById("kpiDate");
    kpiValue = document.getElementById("kpiValue");
    kpiPitch = document.getElementById("kpiPitch");
    kpiTotal = document.getElementById("kpiTotal");

    hearText = document.getElementById("hearExplanation");
    hearPitchSub = document.getElementById("hearAudioSub");
    statusDot = document.getElementById("statusDot");
    statusText = document.getElementById("statusText");
    srAnnounce = document.getElementById("srAnnouncements");

    // Initialize Canvas & Visuals
    VisualizationModule.initStarfield();
    VisualizationModule.initChart();

    // Setup Event Listeners
    setupEvents();

    // Load Default Dataset (GISTEMP Global Climate)
    await switchDataset("gistemp");
  }

  // 2. Setup Events
  function setupEvents() {
    // Play / Pause Button
    btnPlay.addEventListener("click", () => {
      if (isPlaying) {
        pausePlayback();
      } else {
        startPlayback();
      }
    });

    // Stop Button
    btnStop.addEventListener("click", () => {
      stopPlayback(true);
    });

    // Step Previous / Next Buttons
    btnPrev.addEventListener("click", () => {
      if (isPlaying) pausePlayback();
      goToIndex(currentIndex - 1, true);
    });

    btnNext.addEventListener("click", () => {
      if (isPlaying) pausePlayback();
      goToIndex(currentIndex + 1, true);
    });

    // Timeline Slider Drag
    slider.addEventListener("input", (e) => {
      const idx = parseInt(e.target.value, 10);
      if (isPlaying) pausePlayback();
      goToIndex(idx, true);
    });

    // Dataset Switcher Buttons
    const btnGistemp = document.getElementById("btnDatasetGistemp");
    const btnPower = document.getElementById("btnDatasetPower");

    if (btnGistemp) {
      btnGistemp.addEventListener("click", () => switchDataset("gistemp"));
    }
    if (btnPower) {
      btnPower.addEventListener("click", () => switchDataset("power"));
    }

    // Playback Speed Selector
    const speedSelect = document.getElementById("speedSelect");
    if (speedSelect) {
      speedSelect.addEventListener("change", (e) => {
        const val = parseFloat(e.target.value);
        stepDelayMs = Math.round(120 / val);
        console.log(`[EarthBeatApp] Playback speed updated: ${val}x (${stepDelayMs} ms/step)`);
      });
    }

    // Volume Slider
    const volSlider = document.getElementById("volumeSlider");
    if (volSlider) {
      volSlider.addEventListener("input", (e) => {
        const vol = parseFloat(e.target.value);
        SonificationEngine.setVolume(vol);
      });
    }

    // Mute Button
    const btnMute = document.getElementById("btnMute");
    if (btnMute) {
      btnMute.addEventListener("click", () => {
        const muted = SonificationEngine.toggleMute();
        btnMute.textContent = muted ? "🔇 Unmute" : "🔊 Mute";
        btnMute.setAttribute("aria-pressed", muted ? "true" : "false");
      });
    }

    // Era Shortcut Buttons
    document.querySelectorAll(".btn-era").forEach(btn => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".btn-era").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const era = btn.getAttribute("data-era");
        jumpToEra(era);
      });
    });

    // Audio Legend Tone Test Buttons
    const btnToneCool = document.getElementById("btnToneCool");
    const btnToneBase = document.getElementById("btnToneBase");
    const btnToneWarm = document.getElementById("btnToneWarm");

    if (btnToneCool) {
      btnToneCool.addEventListener("click", () => SonificationEngine.playTestTone(240, 0.6));
    }
    if (btnToneBase) {
      btnToneBase.addEventListener("click", () => SonificationEngine.playTestTone(400, 0.6));
    }
    if (btnToneWarm) {
      btnToneWarm.addEventListener("click", () => SonificationEngine.playTestTone(700, 0.6));
    }

    // Keyboard Accessibility Shortcuts
    document.addEventListener("keydown", handleKeydown);
  }

  // 3. Switch Dataset
  async function switchDataset(type) {
    stopPlayback(true);
    currentDatasetType = type;

    const btnGistemp = document.getElementById("btnDatasetGistemp");
    const btnPower = document.getElementById("btnDatasetPower");
    const banner = document.getElementById("baselineBannerText");

    if (statusDot) statusDot.className = "status-dot";
    if (statusText) statusText.textContent = "Loading NASA dataset...";

    try {
      if (type === "gistemp") {
        if (btnGistemp) btnGistemp.classList.add("active");
        if (btnPower) btnPower.classList.remove("active");
        if (banner) {
          banner.innerHTML = "<strong>Reference Baseline:</strong> 1951–1980 global mean (0.00°C). Tones above 400 Hz signify warming anomalies; tones below 400 Hz signify cooler periods.";
        }
        dataset = await DataLoader.loadGISTEMP();
      } else {
        if (btnGistemp) btnGistemp.classList.remove("active");
        if (btnPower) btnPower.classList.add("active");
        if (banner) {
          banner.innerHTML = "<strong>Local Weather Data:</strong> NASA POWER daily meteorology for Bengaluru (12.97°N, 77.59°E). Tones represent daily mean air temperatures (16°C to 34°C).";
        }
        dataset = await DataLoader.loadPOWER();
      }

      // Configure Slider
      slider.min = 0;
      slider.max = dataset.length - 1;
      currentIndex = 0;
      slider.value = 0;

      // Update UI bounds
      document.getElementById("sliderStart").textContent = dataset[0].label || dataset[0].date;
      document.getElementById("sliderEnd").textContent = dataset[dataset.length - 1].label || dataset[dataset.length - 1].date;
      kpiTotal.textContent = `${dataset.length.toLocaleString()} records`;

      if (statusText) {
        statusText.textContent = `✓ Loaded ${dataset.length.toLocaleString()} records from ${type === "gistemp" ? "NASA GISTEMP" : "NASA POWER"}`;
      }

      // Update View
      updateView({ playSound: false });

    } catch (err) {
      console.error("[EarthBeatApp] Dataset load error:", err);
      if (statusText) statusText.textContent = `⚠️ Error loading dataset: ${err.message}`;
    }
  }

  // 4. Update Central View
  function updateView(options = {}) {
    if (!dataset || dataset.length === 0) return;
    const { playSound = false } = options;

    const currentItem = dataset[currentIndex];
    const prevItem = currentIndex > 0 ? dataset[currentIndex - 1] : null;

    // Update Globe
    VisualizationModule.updateEarthGlobe(currentItem, prevItem);

    // Update Chart
    VisualizationModule.drawChart(dataset, currentIndex);

    // Calculate Pitch
    const pitch = SonificationEngine.calculatePitch(currentItem.value, currentItem.isAnomaly);

    // Update KPI Displays
    if (kpiDate) kpiDate.textContent = currentItem.label || currentItem.date;
    if (kpiValue) {
      const sign = currentItem.isAnomaly && currentItem.value > 0 ? "+" : "";
      kpiValue.textContent = `${sign}${currentItem.value.toFixed(2)}${currentItem.unit}`;
      kpiValue.style.color = currentItem.value > 0.5 ? "var(--accent-orange)" : currentItem.value < -0.2 ? "var(--accent-cool)" : "var(--accent-green)";
    }
    if (kpiPitch) {
      kpiPitch.textContent = `${Math.round(pitch)} Hz`;
    }

    // Update Timeline Slider
    slider.value = currentIndex;
    const curDateDisplay = document.getElementById("currentTimelineDate");
    if (curDateDisplay) {
      curDateDisplay.textContent = currentItem.label || currentItem.date;
    }

    // Update "What Am I Hearing?" Narration
    updateNarration(currentItem, pitch, prevItem);

    // Play Sound if requested
    if (playSound) {
      SonificationEngine.playNote(currentItem.value, currentItem.isAnomaly, Math.max(0.12, stepDelayMs / 1000));
    }

    // Screen Reader Announcement (Throttled when playing)
    if (!isPlaying && srAnnounce) {
      const sign = currentItem.isAnomaly && currentItem.value > 0 ? "positive " : "";
      srAnnounce.textContent = `${currentItem.label}: ${sign}${currentItem.value.toFixed(2)} degrees Celsius, tone pitch ${Math.round(pitch)} Hertz.`;
    }
  }

  // 5. Update Plain-Language Narration
  function updateNarration(item, pitch, prevItem) {
    if (!hearText) return;

    let narrative = "";
    const isAnomaly = item.isAnomaly;
    const val = item.value;

    if (isAnomaly) {
      if (val > 1.2) {
        narrative = `<strong>${item.label}:</strong> Global temperature anomaly is at an extraordinary <strong>+${val.toFixed(2)}°C</strong> above the 20th-century baseline. The pitch is high (<strong>${Math.round(pitch)} Hz</strong>), representing unprecedented modern planetary warming.`;
      } else if (val > 0.6) {
        narrative = `<strong>${item.label}:</strong> Noticeable warming anomaly of <strong>+${val.toFixed(2)}°C</strong>. Tone pitch has climbed to <strong>${Math.round(pitch)} Hz</strong>, well above the 400 Hz historical baseline.`;
      } else if (val >= -0.1 && val <= 0.3) {
        narrative = `<strong>${item.label}:</strong> Climate anomaly is close to the 1951–1980 baseline reference (<strong>${val > 0 ? "+" : ""}${val.toFixed(2)}°C</strong>). Pitch sounds near the <strong>400 Hz</strong> baseline tuning frequency.`;
      } else {
        narrative = `<strong>${item.label}:</strong> Cooler historical era with an anomaly of <strong>${val.toFixed(2)}°C</strong>. You hear a deeper, cool tone at <strong>${Math.round(pitch)} Hz</strong>, reflecting Earth's pre-industrial climate.`;
      }
    } else {
      narrative = `<strong>Bengaluru (${item.date}):</strong> Daily mean temperature is <strong>${val.toFixed(2)}°C</strong> (Max: ${item.tempMax}°C, Min: ${item.tempMin}°C, Precipitation: ${item.precip} mm, Humidity: ${item.humidity}%). Sound frequency is <strong>${Math.round(pitch)} Hz</strong>.`;
    }

    hearText.innerHTML = narrative;

    if (hearPitchSub) {
      const toneDescriptor = pitch > 550 ? "high urgent" : pitch > 380 ? "balanced mid" : "deep resonant";
      hearPitchSub.textContent = `🔊 Acoustic signature: ${Math.round(pitch)} Hz (${toneDescriptor} frequency).`;
    }
  }

  // 6. Playback Engine (Sequential Play, Pause, Resume, Stop)
  function startPlayback() {
    if (isPlaying || !dataset.length) return;

    isPlaying = true;
    btnPlay.classList.add("playing");
    btnPlay.innerHTML = "<span>⏸</span> Pause";
    btnPlay.setAttribute("aria-label", "Pause audio playback");

    if (statusDot) statusDot.className = "status-dot playing";
    if (statusText) statusText.textContent = `▶ Playing ${currentDatasetType === "gistemp" ? "Global Climate Heartbeat" : "Weather Timeline"}...`;

    function step() {
      if (!isPlaying) return;

      updateView({ playSound: true });

      if (currentIndex < dataset.length - 1) {
        currentIndex++;
        playbackTimer = setTimeout(step, stepDelayMs);
      } else {
        // Reached end of dataset
        stopPlayback(false);
        if (statusText) statusText.textContent = "✓ Reached end of dataset timeline.";
      }
    }

    step();
  }

  function pausePlayback() {
    isPlaying = false;
    if (playbackTimer) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }
    SonificationEngine.stopAll();

    btnPlay.classList.remove("playing");
    btnPlay.innerHTML = "<span>▶</span> Resume";
    btnPlay.setAttribute("aria-label", "Resume audio playback");

    if (statusDot) statusDot.className = "status-dot";
    if (statusText) statusText.textContent = "⏸ Playback paused.";
  }

  function stopPlayback(resetToStart = false) {
    isPlaying = false;
    if (playbackTimer) {
      clearTimeout(playbackTimer);
      playbackTimer = null;
    }
    SonificationEngine.stopAll();

    btnPlay.classList.remove("playing");
    btnPlay.innerHTML = "<span>▶</span> Play";
    btnPlay.setAttribute("aria-label", "Start audio playback");

    if (statusDot) statusDot.className = "status-dot";

    if (resetToStart) {
      currentIndex = 0;
      updateView({ playSound: false });
      if (statusText) statusText.textContent = "■ Stopped and reset to beginning.";
    } else {
      if (statusText) statusText.textContent = "■ Playback stopped.";
    }
  }

  // 7. Navigation Helpers
  function goToIndex(newIndex, playSound = false) {
    if (!dataset.length) return;
    newIndex = Math.max(0, Math.min(dataset.length - 1, newIndex));
    currentIndex = newIndex;
    updateView({ playSound });
  }

  function jumpToEra(era) {
    if (!dataset.length || currentDatasetType !== "gistemp") return;

    let targetYear = 1880;
    if (era === "1900-1970") targetYear = 1900;
    else if (era === "1970-2026") targetYear = 1970;
    else if (era === "recent") targetYear = 2015;

    const foundIdx = dataset.findIndex(d => d.year >= targetYear);
    if (foundIdx !== -1) {
      if (isPlaying) pausePlayback();
      goToIndex(foundIdx, true);
    }
  }

  // 8. Keyboard Accessibility Handler
  function handleKeydown(e) {
    // Avoid interfering with inputs
    if (e.target.tagName === "INPUT" && e.target.type !== "range") return;

    switch (e.key) {
      case " ":
        e.preventDefault();
        if (isPlaying) pausePlayback();
        else startPlayback();
        break;

      case "ArrowLeft":
        e.preventDefault();
        if (isPlaying) pausePlayback();
        goToIndex(currentIndex - (e.shiftKey ? 12 : 1), true);
        break;

      case "ArrowRight":
        e.preventDefault();
        if (isPlaying) pausePlayback();
        goToIndex(currentIndex + (e.shiftKey ? 12 : 1), true);
        break;

      case "Home":
        e.preventDefault();
        if (isPlaying) pausePlayback();
        goToIndex(0, true);
        break;

      case "End":
        e.preventDefault();
        if (isPlaying) pausePlayback();
        goToIndex(dataset.length - 1, true);
        break;

      case "Escape":
      case "s":
      case "S":
        e.preventDefault();
        stopPlayback(true);
        break;

      case "m":
      case "M":
        e.preventDefault();
        const btnMute = document.getElementById("btnMute");
        if (btnMute) btnMute.click();
        break;
    }
  }

  // Public API
  return {
    init,
    goToIndex,
    startPlayback,
    pausePlayback,
    stopPlayback,
    switchDataset
  };
})();

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  window.EarthBeatApp.init();
});
