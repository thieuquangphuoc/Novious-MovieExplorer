// SOUND FOR THE ONE MOVIE CHALLENGE

// VOLUME — change this one number
export const MASTER_VOLUME = 1;

const level = (value) => Math.max(0.0001, value * MASTER_VOLUME);

let context = null;

const getContext = () => {
  if (typeof window === "undefined") return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return null;          // very old browser; stay silent

  if (!context) context = new AudioContextClass();
  // Safari in particular parks the context until a gesture resumes it
  if (context.state === "suspended") context.resume();

  return context;
};

const tone = ({ ac, type = "sine", freq, start, duration, peak, glideTo }) => {
  const osc = ac.createOscillator();
  const gain = ac.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, start + duration);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(level(peak), start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  osc.connect(gain).connect(ac.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
};

export const startSearchHum = (seconds) => {
  const ac = getContext();
  if (!ac) return () => {};

  const now = ac.currentTime;

  const low = ac.createOscillator();
  const high = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();

  low.type = "sawtooth";
  high.type = "sawtooth";
  low.frequency.setValueAtTime(55, now);
  high.frequency.setValueAtTime(110.6, now);     // slightly off the octave, so it beats

  filter.type = "lowpass";
  filter.Q.value = 6;
  filter.frequency.setValueAtTime(220, now);
  filter.frequency.exponentialRampToValueAtTime(1100, now + seconds);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(level(0.045), now + 0.6);

  low.connect(filter);
  high.connect(filter);
  filter.connect(gain).connect(ac.destination);

  low.start(now);
  high.start(now);

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    const end = ac.currentTime;
    gain.gain.cancelScheduledValues(end);
    gain.gain.setValueAtTime(Math.max(gain.gain.value, 0.0001), end);
    gain.gain.exponentialRampToValueAtTime(0.0001, end + 0.25);
    low.stop(end + 0.3);
    high.stop(end + 0.3);
  };
};

// A short tick as the search moves on; each stage is a step higher.
export const playStageBlip = (stageIndex) => {
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  const freq = [660, 880, 1320][stageIndex] || 660;

  tone({ ac, type: "triangle", freq, start: now, duration: 0.18, peak: 0.07 });
};

export const playReveal = () => {
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  const chord = [523.25, 659.25, 783.99, 1046.5];   // C5 E5 G5 C6

  chord.forEach((freq, i) => {
    tone({
      ac,
      type: "sine",
      freq,
      start: now + i * 0.06,
      duration: 1.5 - i * 0.12,
      peak: 0.06,
    });
  });

  tone({ ac, type: "sine", freq: 130.81, start: now, duration: 1.6, peak: 0.05 });
};

// Two falling notes, for a search that found nothing or broke.
export const playMiss = () => {
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  tone({ ac, type: "triangle", freq: 330, start: now, duration: 0.25, peak: 0.06 });
  tone({ ac, type: "triangle", freq: 220, start: now + 0.16, duration: 0.5, peak: 0.06 });
};

// FRAME BY FRAME

const noiseBuffer = (ac, seconds) => {
  const frames = Math.floor(ac.sampleRate * seconds);
  const buffer = ac.createBuffer(1, frames, ac.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < frames; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
};

// A soft click for buttons. Short enough to feel like a response, not a note.
export const playClick = () => {
  const ac = getContext();
  if (!ac) return;
  tone({ ac, type: "sine", freq: 880, start: ac.currentTime, duration: 0.06, peak: 0.05 });
};

// Reveal Hint: air moving as a panel slides away.
export const playWhoosh = () => {
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  const source = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();

  source.buffer = noiseBuffer(ac, 0.7);

  filter.type = "bandpass";
  filter.Q.value = 1.1;
  filter.frequency.setValueAtTime(380, now);
  filter.frequency.exponentialRampToValueAtTime(2600, now + 0.34);
  filter.frequency.exponentialRampToValueAtTime(420, now + 0.68);

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(level(0.09), now + 0.1);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.68);

  source.connect(filter).connect(gain).connect(ac.destination);
  source.start(now);
  source.stop(now + 0.72);
};

export const playWrong = () => {
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  tone({ ac, type: "sine", freq: 150, glideTo: 55, start: now, duration: 0.55, peak: 0.14 });
  tone({ ac, type: "triangle", freq: 98, glideTo: 62, start: now, duration: 0.35, peak: 0.06 });
};

// Correct answer: a bright rising third, over quickly.
export const playCorrect = () => {
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;
  [784, 988, 1319].forEach((freq, i) => {
    tone({ ac, type: "sine", freq, start: now + i * 0.07, duration: 0.6, peak: 0.07 });
  });
};

export const playImpact = () => {
  const ac = getContext();
  if (!ac) return;

  const now = ac.currentTime;

  tone({ ac, type: "sine", freq: 110, glideTo: 36, start: now, duration: 1.8, peak: 0.16 });
  tone({ ac, type: "sawtooth", freq: 220, glideTo: 110, start: now, duration: 1.1, peak: 0.05 });

  const source = ac.createBufferSource();
  const filter = ac.createBiquadFilter();
  const gain = ac.createGain();

  source.buffer = noiseBuffer(ac, 1.2);
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(5200, now);
  filter.frequency.exponentialRampToValueAtTime(380, now + 1.0);

  gain.gain.setValueAtTime(level(0.08), now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1);

  source.connect(filter).connect(gain).connect(ac.destination);
  source.start(now);
  source.stop(now + 1.2);
};

export const startHeartbeat = () => {
  const ac = getContext();
  if (!ac) return () => {};

  const thump = (at, peak) =>
    tone({ ac, type: "sine", freq: 62, glideTo: 40, start: at, duration: 0.3, peak });

  const beat = () => {
    const now = ac.currentTime;
    thump(now, 0.1);
    thump(now + 0.26, 0.06);
  };

  beat();
  const timer = setInterval(beat, 1150);

  let stopped = false;
  return () => {
    if (stopped) return;
    stopped = true;
    clearInterval(timer);
  };
};
