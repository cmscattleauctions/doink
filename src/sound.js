// ─────────────────────────────────────────────────────────
// SOUND MANAGER — small, self-contained audio system.
//
// Usage:
//   import { playSound, setSoundEnabled, isSoundEnabled, primeSounds } from "./sound.js";
//   playSound("win");
//
// Design notes:
//   • All clips live in /public/sounds/ and are referenced by a short key
//     (see SOUND_FILES). The key is what gameplay code uses; the filename is
//     defined once here so the code and the actual files can never drift.
//   • Honors a persisted on/off preference (localStorage "gapperSound"), so
//     the Settings "Sound & Haptics" toggle (J15) can control it.
//   • Never throws into gameplay: a missing file or a browser autoplay block
//     fails silently. Sound is an enhancement, never a dependency.
//   • Mobile browsers block audio until the first user interaction. Call
//     primeSounds() once on the first tap to unlock playback.
// ─────────────────────────────────────────────────────────

const SOUND_KEY = "gapperSound";

// key  ->  filename in /public/sounds/
// IMPORTANT: these filenames must match the audio files exactly.
export const SOUND_FILES = {
  deal:        "deal.mp3",        // cards being dealt
  chip:        "chip.mp3",        // placing a bet / chips moving
  flip:        "flip.mp3",        // the hit card flips over
  win:         "win.mp3",         // you win a bet
  doink:       "doink.mp3",       // you doink (lose to a match)
  bigwin:      "bigwin.mp3",      // mythical / double doink / large win
  button:      "button.mp3",      // generic UI button tap
  achievement: "achievement.mp3", // achievement unlocked
  levelup:     "levelup.mp3",     // level up
  shuffle:     "shuffle.mp3",     // deck shuffle at round start
  lose:        "lose.mp3",        // session bust / lost the table
};

// Volume per key (0–1). A few cues should sit lower so they don't overpower.
const VOLUME = {
  deal: 0.5, chip: 0.6, flip: 0.5, win: 0.8, doink: 0.85,
  bigwin: 0.9, button: 0.35, achievement: 0.8, levelup: 0.85,
  shuffle: 0.5, lose: 0.7,
};

let enabled = (() => {
  try { return localStorage.getItem(SOUND_KEY) !== "0"; } catch { return true; }
})();

let primed = false;
const cache = {}; // key -> HTMLAudioElement

function load(key) {
  if (cache[key]) return cache[key];
  const file = SOUND_FILES[key];
  if (!file) return null;
  try {
    const a = new Audio(`/sounds/${file}`);
    a.preload = "auto";
    a.volume = VOLUME[key] ?? 0.7;
    cache[key] = a;
    return a;
  } catch {
    return null;
  }
}

// Call once on the first user interaction to satisfy mobile autoplay policies.
export function primeSounds() {
  if (primed) return;
  primed = true;
  // Touch each clip so the browser allows later programmatic playback.
  Object.keys(SOUND_FILES).forEach(key => {
    const a = load(key);
    if (!a) return;
    try {
      a.muted = true;
      const p = a.play();
      if (p && p.then) p.then(() => { a.pause(); a.currentTime = 0; a.muted = false; }).catch(() => { a.muted = false; });
      else { a.pause(); a.currentTime = 0; a.muted = false; }
    } catch { /* ignore */ }
  });
}

export function playSound(key) {
  if (!enabled) return;
  const a = load(key);
  if (!a) return;
  try {
    // Clone so rapid repeats (e.g. multiple chips) can overlap.
    const node = a.cloneNode();
    node.volume = a.volume;
    const p = node.play();
    if (p && p.catch) p.catch(() => { /* autoplay blocked / missing file — ignore */ });
  } catch { /* ignore */ }
}

export function setSoundEnabled(on) {
  enabled = !!on;
  try { localStorage.setItem(SOUND_KEY, on ? "1" : "0"); } catch {}
}

export function isSoundEnabled() {
  return enabled;
}
