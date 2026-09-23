/**
 * @file audio-chime.ts
 * @description Provides synthesized audio chimes for medication reminders
 * and user action confirmations using the browser Web Audio API.
 * Requires zero external audio files and works offline.
 */

let audioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];
let repeatInterval: NodeJS.Timeout | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Primes the audio context on first user touch/click to comply with browser autoplay policies.
 */
export function unlockAudioContext(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === "suspended") {
    ctx.resume().catch(() => {});
  }
}

/**
 * Plays a single soothing 3-tone harmonic chime (C5 -> E5 -> G5)
 * with a soft attack and natural bell decay.
 */
export function playChimeBurst(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  // Notes: C5 (523.25Hz), E5 (659.25Hz), G5 (783.99Hz)
  const notes = [
    { freq: 523.25, timeOffset: 0.0, duration: 1.2 },
    { freq: 659.25, timeOffset: 0.18, duration: 1.2 },
    { freq: 783.99, timeOffset: 0.36, duration: 1.4 },
  ];

  notes.forEach(({ freq, timeOffset, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // Use sine wave for mellow, relaxing chime sound
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now + timeOffset);

    // Envelope: quick attack to prevent clicks, smooth decay
    gain.gain.setValueAtTime(0.0001, now + timeOffset);
    gain.gain.linearRampToValueAtTime(0.2, now + timeOffset + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + duration);

    activeOscillators.push(osc);
    osc.onended = () => {
      activeOscillators = activeOscillators.filter((o) => o !== osc);
    };
  });
}

/**
 * Starts a repeating pleasant medicine reminder chime.
 * Repeats every 4 seconds until stopMedicineChime() is called.
 */
export function playMedicineChime(): void {
  stopMedicineChime();
  playChimeBurst();
  repeatInterval = setInterval(() => {
    playChimeBurst();
  }, 4500);
}

/**
 * Stops any active repeating medicine reminder chime.
 */
export function stopMedicineChime(): void {
  if (repeatInterval) {
    clearInterval(repeatInterval);
    repeatInterval = null;
  }
  activeOscillators.forEach((osc) => {
    try {
      osc.stop();
    } catch {
      // already stopped
    }
  });
  activeOscillators = [];
}

/**
 * Plays an uplifting, affirmative 2-tone chime when a medicine is marked as taken.
 */
export function playSuccessChime(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const notes = [
    { freq: 587.33, timeOffset: 0.0, duration: 0.35 }, // D5
    { freq: 880.0, timeOffset: 0.12, duration: 0.6 },  // A5
  ];

  notes.forEach(({ freq, timeOffset, duration }) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, now + timeOffset);

    gain.gain.setValueAtTime(0.0001, now + timeOffset);
    gain.gain.linearRampToValueAtTime(0.25, now + timeOffset + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + timeOffset + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + timeOffset);
    osc.stop(now + timeOffset + duration);
  });
}
