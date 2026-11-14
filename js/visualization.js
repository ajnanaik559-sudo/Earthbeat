/* ============================================================
   EARTHBEAT — Visualization Module
   Interactive Starfield, Canvas Chart & Dynamic Earth Globe
   Team: Stellar Mind X | NASA Space Apps Challenge 2026
============================================================ */

const VisualizationModule = (() => {
  let chartCanvas = null;
  let chartCtx = null;
  let currentDataset = [];
  let currentIndex = 0;
  let eraFilter = "all";

  // ============================================================
  // 1. STARFIELD BACKGROUND ANIMATION
  // ============================================================
  function initStarfield() {
    const canvas = document.getElementById("starfield");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const stars = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createStars(n) {
      stars.length = 0;
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 1.2 + 0.3,
          a: Math.random(),
          speed: Math.random() * 0.35 + 0.1,
          phase: Math.random() * Math.PI * 2
        });
      }
    }

    function drawStars(t) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = t * 0.001;
      stars.forEach(s => {
        const alpha = s.a * (0.4 + 0.6 * Math.sin(time * s.speed + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, alpha)})`;
        ctx.fill();
      });
      requestAnimationFrame(drawStars);
    }

    resize();
    createStars(160);
    window.addEventListener("resize", resize);
    requestAnimationFrame(drawStars);
  }

  // ============================================================
  // 2. DYNAMIC EARTH GLOBE UPDATE
  // ============================================================
  function updateEarthGlobe(item, prevItem) {
    if (!item) return;

    const sphere = document.getElementById("earth-sphere");
    const atmosphere = document.getElementById("earth-atmosphere");
    const overlay = document.getElementById("earth-temp-overlay");
    const yearEl = document.getElementById("globe-year");
    const valEl = document.getElementById("globe-value");
    const badgeEl = document.getElementById("globe-change-badge");

    if (!sphere || !atmosphere) return;

    const val = item.value;
    const isAnomaly = item.isAnomaly;

    // Normalize t from 0 (coldest) to 1 (warmest)
    let t = 0.5;
    if (isAnomaly) {
      // Range: -0.80°C to +1.55°C
      t = Math.max(0, Math.min(1, (val - (-0.8)) / (1.55 - (-0.8))));
    } else {
      // Range: 16°C to 34°C
      t = Math.max(0, Math.min(1, (val - 16) / (34 - 16)));
    }

    // Dynamic glow and coloring based on temperature
    // Cool (deep ocean cyan) -> Mild (temperate blue-green) -> Warm (amber) -> Hot (burning orange/red)
    let r, g, b;
    if (t < 0.5) {
      const subT = t / 0.5;
      r = Math.round(15 + subT * (0 - 15));
      g = Math.round(140 + subT * (200 - 140));
      b = Math.round(255 + subT * (200 - 255));
    } else {
      const subT = (t - 0.5) / 0.5;
      r = Math.round(0 + subT * 255);
      g = Math.round(200 + subT * (90 - 200));
      b = Math.round(200 + subT * (40 - 200));
    }

    sphere.style.boxShadow = `
      0 0 ${30 + t * 45}px rgba(${r}, ${g}, ${b}, ${0.3 + t * 0.4}),
      inset -20px -20px 45px rgba(0, 0, 0, 0.75)
    `;

    atmosphere.style.borderColor = `rgba(${r}, ${g}, ${b}, ${0.3 + t * 0.35})`;
    atmosphere.style.boxShadow = `
      0 0 ${20 + t * 35}px rgba(${r}, ${g}, ${b}, ${0.25 + t * 0.35}),
      inset 0 0 15px rgba(${r}, ${g}, ${b}, 0.2)
    `;

    if (overlay) {
      overlay.style.background = `
        radial-gradient(circle at 40% 40%, 
          rgba(${r}, ${g}, ${b}, ${0.1 + t * 0.35}) 0%, 
          transparent 75%
        )
      `;
    }

    // Update text displays on globe
    if (yearEl) yearEl.textContent = item.label || item.date;
    if (valEl) {
      const sign = isAnomaly && val > 0 ? "+" : "";
      valEl.textContent = `${sign}${val.toFixed(2)} ${item.unit}`;
    }

    // Rate of change indicator
    if (badgeEl && prevItem) {
      const change = val - prevItem.value;
      if (Math.abs(change) < 0.02) {
        badgeEl.className = "change-badge steady";
        badgeEl.textContent = "→ Steady (±0.0°C)";
      } else if (change > 0) {
        badgeEl.className = "change-badge warmer";
        badgeEl.textContent = `↑ +${change.toFixed(2)}°C Warmer`;
      } else {
        badgeEl.className = "change-badge cooler";
        badgeEl.textContent = `↓ ${change.toFixed(2)}°C Cooler`;
      }
    }
  }

  // ============================================================
  // 3. CANVAS LINE CHART
  // ============================================================
  function initChart() {
    chartCanvas = document.getElementById("chartCanvas");
    if (!chartCanvas) return;
    chartCtx = chartCanvas.getContext("2d");

    // Click/Drag on canvas to jump timeline
    function handleCanvasJump(e) {
      if (!currentDataset || currentDataset.length === 0) return;
      const rect = chartCanvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const PAD = { left: 45, right: 25 };
      const plotW = rect.width - PAD.left - PAD.right;
      const pct = Math.max(0, Math.min(1, (clickX - PAD.left) / plotW));
      const targetIndex = Math.round(pct * (currentDataset.length - 1));

      if (window.EarthBeatApp && typeof window.EarthBeatApp.goToIndex === "function") {
        window.EarthBeatApp.goToIndex(targetIndex, true);
      }
    }

    chartCanvas.addEventListener("click", handleCanvasJump);

    // Responsive redraw
    window.addEventListener("resize", () => {
      drawChart(currentDataset, currentIndex);
    });
  }

  function drawChart(dataset, activeIdx) {
    if (!chartCanvas || !chartCtx || !dataset || dataset.length === 0) return;

    currentDataset = dataset;
    currentIndex = activeIdx;

    const dpr = window.devicePixelRatio || 1;
    const rect = chartCanvas.getBoundingClientRect();
    chartCanvas.width = rect.width * dpr;
    chartCanvas.height = rect.height * dpr;

    chartCtx.save();
    chartCtx.scale(dpr, dpr);

    const W = rect.width;
    const H = rect.height;
    const PAD = { top: 25, right: 25, bottom: 35, left: 50 };
    const plotW = W - PAD.left - PAD.right;
    const plotH = H - PAD.top - PAD.bottom;

    // Bounds
    const values = dataset.map(d => d.value);
    const minVal = Math.min(0, Math.min(...values) - 0.2);
    const maxVal = Math.max(...values) + 0.2;
    const n = dataset.length;

    const getX = i => PAD.left + (i / Math.max(1, n - 1)) * plotW;
    const getY = v => PAD.top + (1 - (v - minVal) / (maxVal - minVal || 1)) * plotH;

    // Clear background
    chartCtx.clearRect(0, 0, W, H);

    // Horizontal Grid Lines & Y-Axis Labels
    const gridSteps = 4;
    chartCtx.lineWidth = 1;
    for (let i = 0; i <= gridSteps; i++) {
      const gVal = minVal + (i / gridSteps) * (maxVal - minVal);
      const y = getY(gVal);

      chartCtx.strokeStyle = "rgba(85, 199, 255, 0.08)";
      chartCtx.beginPath();
      chartCtx.moveTo(PAD.left, y);
      chartCtx.lineTo(W - PAD.right, y);
      chartCtx.stroke();

      chartCtx.fillStyle = "rgba(138, 191, 217, 0.7)";
      chartCtx.font = "10px 'Space Mono', monospace";
      chartCtx.textAlign = "right";
      const sign = dataset[0].isAnomaly && gVal > 0 ? "+" : "";
      chartCtx.fillText(`${sign}${gVal.toFixed(1)}°`, PAD.left - 8, y + 4);
    }

    // Zero-Anomaly Baseline Dotted Line
    if (minVal <= 0 && maxVal >= 0) {
      const zeroY = getY(0);
      chartCtx.save();
      chartCtx.setLineDash([4, 4]);
      chartCtx.strokeStyle = "rgba(100, 255, 218, 0.55)";
      chartCtx.lineWidth = 1.5;
      chartCtx.beginPath();
      chartCtx.moveTo(PAD.left, zeroY);
      chartCtx.lineTo(W - PAD.right, zeroY);
      chartCtx.stroke();

      chartCtx.fillStyle = "#64ffda";
      chartCtx.font = "9px 'Space Mono', monospace";
      chartCtx.textAlign = "left";
      chartCtx.fillText("Baseline 0.0°C", W - PAD.right - 80, zeroY - 5);
      chartCtx.restore();
    }

    // Gradient Fill Under Curve
    const areaGrad = chartCtx.createLinearGradient(0, PAD.top, 0, H - PAD.bottom);
    areaGrad.addColorStop(0, "rgba(255, 124, 59, 0.28)");
    areaGrad.addColorStop(0.5, "rgba(85, 199, 255, 0.12)");
    areaGrad.addColorStop(1, "rgba(3, 11, 22, 0)");

    chartCtx.beginPath();
    chartCtx.moveTo(getX(0), getY(dataset[0].value));
    for (let i = 1; i < n; i++) {
      chartCtx.lineTo(getX(i), getY(dataset[i].value));
    }
    chartCtx.lineTo(getX(n - 1), H - PAD.bottom);
    chartCtx.lineTo(getX(0), H - PAD.bottom);
    chartCtx.closePath();
    chartCtx.fillStyle = areaGrad;
    chartCtx.fill();

    // Main Trend Line
    chartCtx.beginPath();
    chartCtx.moveTo(getX(0), getY(dataset[0].value));
    for (let i = 1; i < n; i++) {
      chartCtx.lineTo(getX(i), getY(dataset[i].value));
    }
    chartCtx.strokeStyle = "#55c7ff";
    chartCtx.lineWidth = 2;
    chartCtx.lineJoin = "round";
    chartCtx.stroke();

    // X-Axis Date Ticks
    chartCtx.fillStyle = "rgba(138, 191, 217, 0.7)";
    chartCtx.font = "10px 'Space Mono', monospace";
    chartCtx.textAlign = "center";

    const tickInterval = Math.max(1, Math.floor(n / 6));
    for (let i = 0; i < n; i += tickInterval) {
      const year = dataset[i].year || dataset[i].date.slice(0, 4);
      chartCtx.fillText(year, getX(i), H - PAD.bottom + 16);
    }
    // Also guarantee last year is printed
    const lastYear = dataset[n - 1].year || dataset[n - 1].date.slice(0, 4);
    chartCtx.fillText(lastYear, getX(n - 1), H - PAD.bottom + 16);

    // Active Scrubber Dot & Glowing Target
    if (activeIdx >= 0 && activeIdx < n) {
      const cx = getX(activeIdx);
      const cy = getY(dataset[activeIdx].value);

      // Vertical guide line
      chartCtx.save();
      chartCtx.strokeStyle = "rgba(0, 229, 255, 0.45)";
      chartCtx.lineWidth = 1;
      chartCtx.setLineDash([2, 3]);
      chartCtx.beginPath();
      chartCtx.moveTo(cx, PAD.top);
      chartCtx.lineTo(cx, H - PAD.bottom);
      chartCtx.stroke();
      chartCtx.restore();

      // Outer glow pulse
      const glow = chartCtx.createRadialGradient(cx, cy, 0, cx, cy, 16);
      glow.addColorStop(0, "rgba(0, 229, 255, 0.7)");
      glow.addColorStop(1, "rgba(0, 229, 255, 0)");
      chartCtx.beginPath();
      chartCtx.arc(cx, cy, 16, 0, Math.PI * 2);
      chartCtx.fillStyle = glow;
      chartCtx.fill();

      // Solid center dot
      chartCtx.beginPath();
      chartCtx.arc(cx, cy, 5.5, 0, Math.PI * 2);
      chartCtx.fillStyle = "#ffffff";
      chartCtx.fill();

      // Tooltip Box
      const activeItem = dataset[activeIdx];
      const sign = activeItem.isAnomaly && activeItem.value > 0 ? "+" : "";
      const text = `${activeItem.label}: ${sign}${activeItem.value.toFixed(2)}${activeItem.unit}`;

      chartCtx.font = "bold 11px 'Space Mono', monospace";
      const textW = chartCtx.measureText(text).width + 16;
      let boxX = cx - textW / 2;
      boxX = Math.max(PAD.left, Math.min(W - PAD.right - textW, boxX));
      const boxY = Math.max(5, cy - 36);

      chartCtx.fillStyle = "rgba(10, 22, 40, 0.95)";
      chartCtx.strokeStyle = "rgba(0, 229, 255, 0.6)";
      chartCtx.lineWidth = 1;

      chartCtx.beginPath();
      chartCtx.roundRect(boxX, boxY, textW, 24, 4);
      chartCtx.fill();
      chartCtx.stroke();

      chartCtx.fillStyle = "#00e5ff";
      chartCtx.textAlign = "left";
      chartCtx.fillText(text, boxX + 8, boxY + 16);
    }

    chartCtx.restore();
  }

  return {
    initStarfield,
    initChart,
    drawChart,
    updateEarthGlobe
  };
})();
