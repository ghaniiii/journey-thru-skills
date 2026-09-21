/**
 * Tiny Web Audio helper: a synthesised engine hum plus UI blips.
 * Nothing starts until the user unmutes, respecting autoplay policies.
 */
let ctx: AudioContext | null = null;
let engineOsc: OscillatorNode | null = null;
let engineGain: GainNode | null = null;

function context(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx ??= new Ctor();
    return ctx;
  } catch {
    return null;
  }
}

export function startEngine() {
  const ac = context();
  if (!ac || engineOsc) return;
  try {
    void ac.resume();
    engineOsc = ac.createOscillator();
    engineGain = ac.createGain();
    engineOsc.type = "sawtooth";
    engineOsc.frequency.value = 60;
    engineGain.gain.value = 0;
    engineOsc.connect(engineGain).connect(ac.destination);
    engineOsc.start();
  } catch {
    engineOsc = null;
  }
}

export function stopEngine() {
  try {
    engineOsc?.stop();
  } catch {
    /* already stopped */
  }
  engineOsc?.disconnect();
  engineGain?.disconnect();
  engineOsc = null;
  engineGain = null;
}

/** speed01: normalised 0..1 vehicle speed. */
export function updateEngine(speed01: number) {
  if (!ctx || !engineOsc || !engineGain) return;
  engineOsc.frequency.setTargetAtTime(55 + speed01 * 120, ctx.currentTime, 0.1);
  engineGain.gain.setTargetAtTime(0.015 + speed01 * 0.05, ctx.currentTime, 0.1);
}

export function blip(frequency = 660) {
  const ac = context();
  if (!ac) return;
  try {
    void ac.resume();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "triangle";
    osc.frequency.value = frequency;
    gain.gain.setValueAtTime(0.08, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.18);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + 0.2);
  } catch {
    /* audio unavailable */
  }
}

function shortEffect(
  startFrequency: number,
  endFrequency: number,
  duration: number,
  type: OscillatorType,
) {
  const ac = context();
  if (!ac) return;
  try {
    void ac.resume();
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFrequency, ac.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFrequency, ac.currentTime + duration);
    gain.gain.setValueAtTime(0.1, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);
    osc.connect(gain).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + duration);
  } catch {
    /* audio unavailable */
  }
}

export function playHydraulicJump() {
  shortEffect(105, 460, 0.22, "square");
}

export function playNitroIgnition() {
  shortEffect(90, 230, 0.35, "sawtooth");
}
