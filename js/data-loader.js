/* ============================================================
   EARTHBEAT — NASA Data Loader
   Loads real NASA CSV datasets with graceful offline fallback
   Team: Stellar Mind X | NASA Space Apps Challenge 2026
============================================================ */

const DataLoader = (() => {
  // Parse standard CSV text into array of objects
  function parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headers = lines[0].replace(/^\uFEFF/, "").split(",").map(h => h.trim());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = line.split(",").map(v => v.trim());
      const row = {};
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j] !== undefined ? values[j] : "";
      }
      records.push(row);
    }
    return records;
  }

  // 1. Load GISTEMP Monthly Data (1880 - 2026)
  async function loadGISTEMP() {
    let rawRecords = null;

    // Try live fetch first (works seamlessly on http://localhost)
    try {
      const response = await fetch("data/GLB_cleaned_monthly.csv");
      if (response.ok) {
        const text = await response.text();
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          rawRecords = parsed.map(r => ({
            date: r.Date,
            year: parseInt(r.Year, 10),
            monthNum: parseInt(r.Month_Num, 10),
            month: r.Month,
            value: parseFloat(r.Anomaly)
          })).filter(r => !isNaN(r.value));
          console.log(`[DataLoader] Loaded ${rawRecords.length} GISTEMP records from local CSV.`);
        }
      }
    } catch (err) {
      console.warn("[DataLoader] Fetch CSV blocked or unavailable (likely file:// protocol), using embedded data cache.");
    }

    // Graceful fallback to embedded_data.js (avoids CORS issues on direct file double-click)
    if (!rawRecords && window.EARTHBEAT_DATA && window.EARTHBEAT_DATA.gistemp) {
      rawRecords = window.EARTHBEAT_DATA.gistemp;
      console.log(`[DataLoader] Loaded ${rawRecords.length} GISTEMP records from embedded cache.`);
    }

    if (!rawRecords || rawRecords.length === 0) {
      throw new Error("Unable to load NASA GISTEMP dataset. Check data folder or embedded data.");
    }

    // Formatted standardized dataset
    return rawRecords.map((item, index) => {
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthName = item.month || monthNames[(item.monthNum || 1) - 1] || "";
      return {
        index,
        date: item.date,
        year: item.year,
        month: monthName,
        value: item.value, // Temperature anomaly in °C
        unit: "°C anomaly",
        label: `${monthName} ${item.year}`,
        isAnomaly: true,
        baseline: "1951–1980 mean climate"
      };
    });
  }

  // 2. Load NASA POWER Daily Meteorology (2020 - 2025)
  async function loadPOWER() {
    let rawRecords = null;

    try {
      const response = await fetch("data/POWER_Point_Daily_cleaned.csv");
      if (response.ok) {
        const text = await response.text();
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          rawRecords = parsed.map(r => ({
            date: r.Date,
            year: parseInt(r.Year, 10),
            month: parseInt(r.Month, 10),
            day: parseInt(r.Day, 10),
            tempAvg: parseFloat(r.Temp_2M_Avg_C),
            tempMax: parseFloat(r.Temp_2M_Max_C),
            tempMin: parseFloat(r.Temp_2M_Min_C),
            precip: parseFloat(r.Precipitation_mm_day),
            humidity: parseFloat(r.Relative_Humidity_pct)
          })).filter(r => !isNaN(r.tempAvg));
          console.log(`[DataLoader] Loaded ${rawRecords.length} POWER records from local CSV.`);
        }
      }
    } catch (err) {
      console.warn("[DataLoader] Fetch POWER CSV blocked, using embedded cache.");
    }

    if (!rawRecords && window.EARTHBEAT_DATA && window.EARTHBEAT_DATA.power) {
      rawRecords = window.EARTHBEAT_DATA.power;
      console.log(`[DataLoader] Loaded ${rawRecords.length} POWER records from embedded cache.`);
    }

    if (!rawRecords || rawRecords.length === 0) {
      throw new Error("Unable to load NASA POWER daily dataset.");
    }

    return rawRecords.map((item, index) => ({
      index,
      date: item.date,
      year: item.year,
      month: item.month,
      day: item.day,
      value: item.tempAvg, // Daily mean temperature
      tempMax: item.tempMax,
      tempMin: item.tempMin,
      precip: item.precip,
      humidity: item.humidity,
      unit: "°C (Daily Mean)",
      label: item.date,
      isAnomaly: false,
      baseline: "NASA POWER Daily Station Meteorology (Bengaluru: 12.97°N, 77.59°E)"
    }));
  }

  return {
    loadGISTEMP,
    loadPOWER
  };
})();
