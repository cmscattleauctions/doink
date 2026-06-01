// ─────────────────────────────────────────────────────────
// HAPTICS — native vibration feedback via @capacitor/haptics.
//
// Usage:
//   import { haptic, setHapticsEnabled, isHapticsEnabled } from "./haptics.js";
//   haptic("win");
//
// Design notes:
//   • Only does anything in the native iOS/Android app. In a normal web
//     browser the Capacitor plugin isn't present, so every call is a no-op
//     (it tries the web Vibration API as a courtesy, then silently does
//     nothing). Safe to call from anywhere — it never throws into gameplay.
//   • Honors a persisted on/off preference (localStorage "gapperHaptics"),
//     so the Settings "Sound & Haptics" toggle (J15) can control it.
//   • The plugin is imported lazily so the web build doesn't depend on it.
// ─────────────────────────────────────────────────────────

const HAPTIC_KEY = "gapperHaptics";

let enabled = (() => {
  try { return localStorage.getItem(HAPTIC_KEY) !== "0"; } catch { return true; }
})();

// Cache the dynamically-imported plugin so we only load it once.
let pluginPromise = null;
function getPlugin() {
  if (pluginPromise) return pluginPromise;
  // Only attempt the import inside the native app. On web the package may not
  // be installed; the /* @vite-ignore */ hint keeps the web bundler from
  // trying to resolve it at build time.
  pluginPromise = (async () => {
    try {
      const mod = await import(/* @vite-ignore */ "@capacitor/haptics");
      return mod;
    } catch {
      return null;
    }
  })();
  return pluginPromise;
}

// Is this running inside the native Capacitor app?
function isNative() {
  try {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  } catch {
    return false;
  }
}

// Map game events to a haptic pattern.
//   light/medium/heavy  → ImpactStyle
//   success/warning/error → NotificationType
const PATTERN = {
  button:      { kind: "impact", style: "Light" },
  chip:        { kind: "impact", style: "Light" },
  flip:        { kind: "impact", style: "Light" },
  win:         { kind: "notify", type: "Success" },
  bigwin:      { kind: "notify", type: "Success" },
  doink:       { kind: "notify", type: "Error" },
  lose:        { kind: "notify", type: "Warning" },
  achievement: { kind: "notify", type: "Success" },
  levelup:     { kind: "notify", type: "Success" },
};

export function haptic(event) {
  if (!enabled) return;
  const pat = PATTERN[event] || { kind: "impact", style: "Light" };

  // Native path — use the Capacitor Haptics plugin.
  if (isNative()) {
    getPlugin().then(mod => {
      if (!mod) return;
      try {
        const { Haptics, ImpactStyle, NotificationType } = mod;
        if (pat.kind === "impact") {
          Haptics.impact({ style: ImpactStyle[pat.style] || ImpactStyle.Light }).catch(() => {});
        } else {
          Haptics.notification({ type: NotificationType[pat.type] || NotificationType.Success }).catch(() => {});
        }
      } catch { /* ignore */ }
    });
    return;
  }

  // Web courtesy fallback — most desktop browsers ignore this; some phones
  // on the web honor navigator.vibrate. Harmless if unsupported.
  try {
    if (navigator && typeof navigator.vibrate === "function") {
      const ms = pat.kind === "notify"
        ? (pat.type === "Error" ? [40, 40, 40] : pat.type === "Warning" ? [30, 30] : 25)
        : 12;
      navigator.vibrate(ms);
    }
  } catch { /* ignore */ }
}

export function setHapticsEnabled(on) {
  enabled = !!on;
  try { localStorage.setItem(HAPTIC_KEY, on ? "1" : "0"); } catch {}
}

export function isHapticsEnabled() {
  return enabled;
}
