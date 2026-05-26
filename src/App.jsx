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
import { GameRoot, normalizeCareer, createDefaultCareer } from "./Game.jsx";
import LoginScreen from "./LoginScreen.jsx";
import Leaderboard from "./Leaderboard.jsx";
import { PrivacyPolicy, TermsOfUse, AccountDeletion, SupportPage } from "./LegalPages.jsx";
import { UsernamePicker, FirstTimeTutorial } from "./Onboarding.jsx";

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

// localStorage key recording that the first-time tutorial has been shown.
// Used so guests (who have no career doc) still only see it once.
const TUTORIAL_FLAG = "doinkTutorialSeenV1";

export default function App() {
  const [user, setUser] = useState(undefined);   // undefined = checking, null = signed out
  const [career, setCareerState] = useState(null);
  const [careerLoaded, setCareerLoaded] = useState(false);
  const [route, setRoute] = useState("game");     // "game" | "leaderboard" | "signin"
  // hashRoute tracks the URL hash so legal pages are deep-linkable and work
  // without sign-in (for app-store reviewers).
  const [hashRoute, setHashRoute] = useState(
    typeof window !== "undefined" ? window.location.hash.replace("#", "") : ""
  );
  // Whether the first-time tutorial is currently being shown.
  const [showTutorial, setShowTutorial] = useState(false);
  // Which GameRoot screen to return to after a leaderboard visit.
  const [gameReturnRoute, setGameReturnRoute] = useState("home");
  const saveTimer = useRef(null);

  // Trigger the first-time tutorial if it hasn't been seen yet. Called on a
  // guest's first Quick Play, and on first entry to Career Mode.
  const maybeShowTutorial = () => {
    let seen = false;
    try { seen = localStorage.getItem(TUTORIAL_FLAG) === "1"; } catch {}
    // A signed-in player whose career already records the tutorial counts too.
    if (career && career.tutorialSeen) seen = true;
    if (!seen) setShowTutorial(true);
  };

  // Keep hashRoute in sync if the URL hash changes (back button, direct link).
  useEffect(() => {
    const onHash = () => setHashRoute(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

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

  // Legal pages are reachable directly by URL hash — e.g.
  //   yoursite.netlify.app/#privacy
  // — so they work for app-store reviewers WITHOUT signing in. These are the
  // URLs to put in your store listings and Firebase/Play console.
  const backToApp = () => { window.location.hash = ""; setHashRoute(""); };
  if (hashRoute === "privacy")          return <PrivacyPolicy   onBack={backToApp} />;
  if (hashRoute === "terms")            return <TermsOfUse      onBack={backToApp} />;
  if (hashRoute === "account-deletion") return <AccountDeletion onBack={backToApp} />;
  if (hashRoute === "support")          return <SupportPage     onBack={backToApp} />;

  if (user === undefined) return <Splash text="Loading…" />;
  // NOTE: a signed-OUT user is NOT blocked. Quick Play works as a guest with
  // no account (App Store guideline 5.1.1 — don't force sign-in for features
  // that don't need it). Sign-in is only required for Career and Leaderboard,
  // and is requested at the point the player taps into those.
  if (user && !careerLoaded) return <Splash text="Loading your career…" />;

  // ── Onboarding: username picker ───────────────────────────
  // Only signed-in players with no completed onboarding see the username
  // picker (a guest has no account, so there's nothing to name yet).
  if (user && (!career || !career.usernameSet)) {
    return (
      <UsernamePicker
        suggested={user.displayName || ""}
        onConfirm={(name) => {
          const base = career || createDefaultCareer(name);
          setCareer({ ...base, playerName: name, usernameSet: true });
        }}
      />
    );
  }

  // ── First-time tutorial ───────────────────────────────────
  // Shows once, on whichever comes first: a guest's first Quick Play, or a
  // sign-in to Career. Tracked in localStorage so it persists for guests
  // (who have no career doc to hold the flag).
  if (showTutorial) {
    return (
      <FirstTimeTutorial
        onFinish={() => {
          try { localStorage.setItem(TUTORIAL_FLAG, "1"); } catch {}
          setShowTutorial(false);
          if (user) setCareer(c => ({ ...(c || {}), tutorialSeen: true }));
        }}
      />
    );
  }

  if (route === "leaderboard") {
    // Leaderboard requires an account — guests are sent to sign-in instead.
    if (!user) return <LoginScreen reason="Sign in to view the leaderboard and post your scores." onBack={() => setRoute("game")} />;
    return <Leaderboard onBack={() => setRoute("game")} myUid={user.uid} />;
  }

  // Guest tapped something that needs an account (Career mode).
  if (route === "signin") {
    return <LoginScreen reason="Sign in to start Career Mode — your progress, chips, and unlocks save to the cloud." onBack={() => setRoute("game")} />;
  }

  return (
    <GameRoot
      career={career}
      setCareer={setCareer}
      isGuest={!user}
      initialRoute={gameReturnRoute}
      onSignOut={user ? handleSignOut : undefined}
      onRequireSignIn={() => setRoute("signin")}
      onShowLeaderboard={(fromRoute) => { setGameReturnRoute(fromRoute || "home"); setRoute("leaderboard"); }}
      onTutorialTrigger={maybeShowTutorial}
      displayName={career?.playerName || (user && user.displayName) || "Guest"}
    />
  );
}
