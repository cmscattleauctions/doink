// ═══════════════════════════════════════════════════════════
// APP ROOT — auth gate + cloud career sync + top-level routing
// ───────────────────────────────────────────────────────────
// Flow:
//   • Not signed in            → LoginScreen
//   • Signed in, loading save  → loading splash
//   • Signed in, ready         → GameRoot (the full game)
//   • Leaderboard requested    → Leaderboard
//
// Career state lives HERE. GameRoot mutates it through setCareer; every
// change is debounced and pushed to Firestore, which also refreshes the
// player's leaderboard row.
// ═══════════════════════════════════════════════════════════
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase.js";
import { loadCareerCloud, saveCareerCloud } from "./cloud.js";
import { GameRoot, normalizeCareer } from "./Game.jsx";
import LoginScreen from "./LoginScreen.jsx";
import Leaderboard from "./Leaderboard.jsx";

function Splash({ text }) {
  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: "3.5rem",
          color: "#D4A843", textShadow: "0 0 40px rgba(212,168,67,0.4)", letterSpacing: "0.05em",
        }}>DOINK</div>
        <div style={{ color: "rgba(245,237,216,0.5)", fontSize: "0.9rem", marginTop: 10 }}>{text}</div>
      </div>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(undefined);   // undefined = checking, null = signed out
  const [career, setCareerState] = useState(null);
  const [careerLoaded, setCareerLoaded] = useState(false);
  const [route, setRoute] = useState("game");     // "game" | "leaderboard"
  const saveTimer = useRef(null);

  // ── Watch auth state ──────────────────────────────────────
  useEffect(() => {
    return onAuthStateChanged(auth, u => {
      setUser(u || null);
      if (!u) { setCareer(null); setCareerLoaded(false); }
    });
  }, []);

  // ── Load this user's career once they're signed in ───────
  useEffect(() => {
    if (!user) return;
    let alive = true;
    setCareerLoaded(false);
    loadCareerCloud(user.uid).then(stored => {
      if (!alive) return;
      // stored may be null (new player) — GameRoot handles a null career
      // and creates a default the first time they enter Career Mode.
      setCareerState(stored ? normalizeCareer(stored, user.displayName) : null);
      setCareerLoaded(true);
    });
    return () => { alive = false; };
  }, [user]);

  // ── setCareer: update local state + debounce a cloud save ─
  const setCareer = (updater) => {
    setCareerState(prev => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (user && next) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        // Debounce so rapid in-game updates collapse into one write.
        saveTimer.current = setTimeout(() => {
          saveCareerCloud(user.uid, next);
        }, 600);
      }
      return next;
    });
  };

  // Flush any pending save if the page is closed mid-debounce.
  useEffect(() => {
    const flush = () => {
      if (saveTimer.current && user && career) {
        clearTimeout(saveTimer.current);
        saveCareerCloud(user.uid, career);
      }
    };
    window.addEventListener("beforeunload", flush);
    return () => window.removeEventListener("beforeunload", flush);
  }, [user, career]);

  const handleSignOut = () => {
    if (saveTimer.current && user && career) {
      clearTimeout(saveTimer.current);
      saveCareerCloud(user.uid, career);
    }
    signOut(auth);
  };

  // ── Render ────────────────────────────────────────────────
  if (user === undefined) return <Splash text="Loading…" />;
  if (user === null) return <LoginScreen />;
  if (!careerLoaded) return <Splash text="Loading your career…" />;

  if (route === "leaderboard") {
    return <Leaderboard onBack={() => setRoute("game")} myUid={user.uid} />;
  }

  return (
    <GameRoot
      career={career}
      setCareer={setCareer}
      onSignOut={handleSignOut}
      onShowLeaderboard={() => setRoute("leaderboard")}
      displayName={user.displayName || "Player"}
    />
  );
}
