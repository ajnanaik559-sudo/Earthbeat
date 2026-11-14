// NASA POWER API - Bengaluru
const apiURL =
"https://power.larc.nasa.gov/api/temporal/daily/point?parameters=T2M&community=RE&longitude=77.5946&latitude=12.9716&start=20250101&end=20250110&format=JSON";

let temperatures = [];
let audioContext = null;
let timers = [];
let oscillators = new Set();

// Convert temperature into pitch
function temperatureToPitch(temp) {
  return Math.max(180, Math.min(700,
    180 + ((temp - 15) / 25) * 520
  ));
}

// Convert temperature change into rhythm
function changeToRhythm(change) {
  return 1000 - Math.min(change * 100, 800);
}

// Stop music
function stopMusic() {
  timers.forEach(timer => clearTimeout(timer));
  timers = [];

  oscillators.forEach(oscillator => {
    try {
      oscillator.stop();
    } catch (error) {}
  });

  oscillators.clear();

  if (audioContext) {
    audioContext.close();
    audioContext = null;
  }

  document.getElementById("status").innerText =
    "Music stopped.";
}

// Load NASA data
document.getElementById("load").onclick = async function() {

  const status = document.getElementById("status");
  const dataDiv = document.getElementById("data");

  status.innerText = "Loading NASA data...";
  dataDiv.innerHTML = "";

  try {
    const response = await fetch(apiURL);

    if (!response.ok) {
      throw new Error("NASA API request failed");
    }

    const data = await response.json();

    const rawData = data.properties.parameter.T2M;

    const entries = Object.entries(rawData)
      .filter(([date, temp]) =>
        temp !== -999 && Number.isFinite(temp)
      );

    temperatures = entries.map(([date, temp]) => ({
      date,
      temp
    }));

    if (temperatures.length === 0) {
      throw new Error("No valid temperatures found");
    }

    temperatures.forEach(item => {
      const day = document.createElement("div");

      day.className = "day";

      day.innerText =
        item.date + " : " + item.temp + " °C";

      dataDiv.appendChild(day);
    });

    document.getElementById("play").disabled = false;

    status.innerText =
      "NASA data loaded successfully!";

  } catch (error) {
    status.innerText =
      "Could not load NASA data. Please try again.";

    console.log(error);
  }
};

// Generate music
document.getElementById("play").onclick = async function() {

  if (temperatures.length === 0) return;

  stopMusic();

  audioContext = new AudioContext();

  await audioContext.resume();

  const result = document.getElementById("details");
  const status = document.getElementById("status");

  status.innerText = "Playing NASA Earth music...";

  let index = 0;

  function playNextNote() {

    if (index >= temperatures.length) {
      status.innerText = "Earth music completed!";
      audioContext.close();
      audioContext = null;
      return;
    }

    const temp = temperatures[index].temp;

    const change = index === 0
      ? 0
      : Math.abs(
          temp - temperatures[index - 1].temp
        );

    const pitch = temperatureToPitch(temp);
    const rhythm = changeToRhythm(change);

    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.value = pitch;

    volume.gain.setValueAtTime(
      0.1, audioContext.currentTime
    );

    volume.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.3
    );

    oscillator.connect(volume);
    volume.connect(audioContext.destination);

    oscillators.add(oscillator);

    oscillator.onended = () => {
      oscillators.delete(oscillator);
    };

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.3);

    result.innerText =
      "Date: " + temperatures[index].date +
      " | Temperature: " + temp + "°C" +
      " | Pitch: " + Math.round(pitch) + " Hz" +
      " | Change: " + change + "°C" +
      " | Rhythm: " + rhythm + " ms";

    index++;

    const timer = setTimeout(playNextNote, rhythm);

    timers.push(timer);
  }

  playNextNote();
};

document.getElementById("stop").onclick = stopMusic;