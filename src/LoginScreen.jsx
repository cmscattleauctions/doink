// ═══════════════════════════════════════════════════════════
// LOGIN SCREEN — Google sign-in gate
// ═══════════════════════════════════════════════════════════
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "./firebase.js";

export default function LoginScreen({ error, reason, onBack }) {
  const signIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      // Popup blocked / closed — App.jsx surfaces persistent errors.
      console.error("sign-in failed:", e);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      background: "radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)",
      padding: "calc(env(safe-area-inset-top) + 40px) 24px calc(40px + env(safe-area-inset-bottom))",
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ textAlign: "center", marginBottom: 48 }}>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontWeight: 900,
          fontSize: "clamp(4rem,16vw,6.5rem)", color: "#D4A843",
          textShadow: "0 0 50px rgba(212,168,67,0.45),0 4px 0 rgba(0,0,0,0.5)",
          lineHeight: 1, letterSpacing: "0.05em",
        }}>DOINK</div>
        <div style={{ height: 2, background: "linear-gradient(90deg,transparent,#D4A843,transparent)", margin: "16px auto 10px", width: 180 }} />
        <div style={{ fontSize: "0.8rem", color: "rgba(212,168,67,0.55)", letterSpacing: "0.22em", fontWeight: 600, textTransform: "uppercase" }}>
          A Card Game of Pure Chaos
        </div>
      </div>

      <div style={{ width: "100%", maxWidth: 320, textAlign: "center" }}>
        <p style={{ color: "rgba(245,237,216,0.6)", fontSize: "0.92rem", lineHeight: 1.6, marginBottom: 24 }}>
          {reason || "Sign in to save your career and climb the leaderboard with your friends."}
        </p>
        <button onClick={signIn} style={{
          width: "100%", padding: "16px 24px", borderRadius: 16, border: "none",
          background: "linear-gradient(160deg,#8A6418 0%,#D4A843 38%,#F4D27A 62%,#C99536 100%)",
          color: "#1A0E00", fontFamily: "'DM Sans', sans-serif", fontSize: "1.05rem",
          fontWeight: 700, letterSpacing: "0.04em", cursor: "pointer",
          boxShadow: "0 8px 28px rgba(212,168,67,0.42), inset 0 1px 0 rgba(255,240,200,0.55)",
        }}>
          Sign in with Google
        </button>
        {onBack && (
          <button onClick={onBack} style={{
            width: "100%", padding: "13px 24px", borderRadius: 14, marginTop: 12,
            background: "transparent", border: "1px solid rgba(255,255,255,0.15)",
            color: "rgba(245,237,216,0.6)", fontSize: "0.9rem", fontWeight: 500, cursor: "pointer",
          }}>
            ← Back to Quick Play
          </button>
        )}
        {error && (
          <p style={{ color: "#E74C3C", fontSize: "0.82rem", marginTop: 16 }}>{error}</p>
        )}
        <p style={{ color: "rgba(245,237,216,0.4)", fontSize: "0.72rem", lineHeight: 1.6, marginTop: 28 }}>
          DOINK uses fictional play chips only. No real money, prizes,
          cash-out, or redeemable value.
        </p>
      </div>
    </div>
  );
}
