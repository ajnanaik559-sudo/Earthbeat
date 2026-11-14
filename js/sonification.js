/* ============================================================
   EARTHBEAT — Sonification Engine
   Translates real NASA climate and temperature data into sound
   Team: Stellar Mind X | NASA Space Apps Challenge 2026
============================================================ */

const SonificationEngine = (() => {
  let audioCtx = null;
  let masterGain = null;
  let activeOscillators = new Set();
  let volume = 0.5;
  let isMuted = false;

  // Initialize AudioContext safely on user interaction
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContextClass();

      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(volume, audioCtx.currentTime);
      masterGain.connect(audioCtx.destination);
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // 1. Calculate frequency from numerical value
  function calculatePitch(value, isAnomaly = true) {
    if (isAnomaly) {
      // Global Temperature Anomaly mapping:
      // Baseline 0.00°C = 400 Hz (Earth's 1951-1980 mean climate reference tone)
      // Range: -0.81°C (~246 Hz, deep/cool) to +1.55°C (~694 Hz, urgent/warm)
      const baseFreq = 400;
      const sensitivity = 190; // Hz per °C anomaly
      const pitch = baseFreq + (value * sensitivity);
      return Math.max(180, Math.min(760, pitch));
    } else {
      // NASA POWER Daily Temperature (16°C to 34°C)
      const minTemp = 16;
      const maxTemp = 34;
      const normalized = Math.max(0, Math.min(1, (value - minTemp) / (maxTemp - minTemp)));
      const pitch = 200 + (normalized * 500);
      return Math.max(180, Math.min(720, pitch));
    }
  }

  // 2. Play a single data-driven note
  function playNote(value, isAnomaly = true, noteDuration = 0.18) {
    try {
      const ctx = getAudioContext();
      if (!ctx || isMuted) return null;

      const pitch = calculatePitch(value, isAnomaly);

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      // Triangle oscillator gives a warm, audible, non-harsh tone
      osc.type = "triangle";
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);

      // Smooth attack and decay envelope to prevent audio pops/clicks
      const now = ctx.currentTime;
      const attackTime = 0.02;
      const decayTime = Math.max(0.08, noteDuration - 0.03);

      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.35 * volume, now + attackTime);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + attackTime + decayTime);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      activeOscillators.add(osc);
      osc.onended = () => {
        activeOscillators.delete(osc);
      };

      osc.start(now);
      osc.stop(now + attackTime + decayTime + 0.02);

      return {
        frequency: Math.round(pitch),
        value
      };
    } catch (e) {
      console.error("[SonificationEngine] playNote error:", e);
      return null;
    }
  }

  // 3. Play an isolated test tone for the Audio Legend
  function playTestTone(frequency, duration = 0.6) {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);

      const now = ctx.currentTime;
      noteGain.gain.setValueAtTime(0.0001, now);
      noteGain.gain.exponentialRampToValueAtTime(0.4 * volume, now + 0.05);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(noteGain);
      noteGain.connect(masterGain);

      activeOscillators.add(osc);
      osc.onended = () => activeOscillators.delete(osc);

      osc.start(now);
      osc.stop(now + duration + 0.05);
    } catch (e) {
      console.error("[SonificationEngine] playTestTone error:", e);
    }
  }

  // 4. Stop all running sounds
  function stopAll() {
    activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (err) {}
    });
    activeOscillators.clear();
  }

  // 5. Volume control
  function setVolume(newVol) {
    volume = Math.max(0, Math.min(1, newVol));
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, audioCtx.currentTime);
    }
  }

  // 6. Mute toggle
  function toggleMute() {
    isMuted = !isMuted;
    if (masterGain && audioCtx) {
      masterGain.gain.setValueAtTime(isMuted ? 0 : volume, audioCtx.currentTime);
    }
    return isMuted;
  }

  return {
    getAudioContext,
    calculatePitch,
    playNote,
    playTestTone,
    stopAll,
    setVolume,
    toggleMute,
    isMuted: () => isMuted
  };
})();
