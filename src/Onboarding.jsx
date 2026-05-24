// ═══════════════════════════════════════════════════════════
// ONBOARDING — username picker + first-time tutorial
// Shown once for brand-new players, before the game.
// ═══════════════════════════════════════════════════════════
import { useState } from "react";

const shell = {
  position:"fixed", inset:0, overflowY:"auto",
  background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)",
  fontFamily:"'DM Sans',sans-serif",
  display:"flex", flexDirection:"column", alignItems:"center",
  padding:"calc(env(safe-area-inset-top) + 40px) 24px calc(40px + env(safe-area-inset-bottom))",
};
const goldBtn = {
  width:"100%", maxWidth:380, padding:"15px", borderRadius:14, border:"none",
  background:"linear-gradient(145deg,#8A6010,#D4A843,#F0C96A,#D4A843)",
  color:"#1A0E00", fontSize:"1rem", fontWeight:700, letterSpacing:"0.04em",
  cursor:"pointer", boxShadow:"0 6px 24px rgba(212,168,67,0.3)",
};
const ghostBtn = {
  width:"100%", maxWidth:380, padding:"13px", borderRadius:14,
  background:"transparent", border:"1px solid rgba(255,255,255,0.15)",
  color:"rgba(245,237,216,0.6)", fontSize:"0.9rem", fontWeight:500, cursor:"pointer",
};

// ── Username picker ─────────────────────────────────────────
// Shown to brand-new players. They MUST choose a display name — it does not
// auto-pull their Google name. The chosen name is what shows on leaderboards.
export function UsernamePicker({ suggested, onConfirm }) {
  const [name, setName] = useState("");
  const trimmed = name.trim();
  const valid = trimmed.length >= 3 && trimmed.length <= 16;

  return (
    <div style={shell}>
      <div style={{ textAlign:"center", marginBottom:28 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"3rem", color:"#D4A843", textShadow:"0 0 40px rgba(212,168,67,0.4)", letterSpacing:"0.04em" }}>DOINK</div>
        <div style={{ fontSize:"0.78rem", color:"rgba(212,168,67,0.55)", letterSpacing:"0.18em", fontWeight:600, textTransform:"uppercase", marginTop:6 }}>Pick Your Table Name</div>
      </div>

      <div style={{ width:"100%", maxWidth:380, marginBottom:20 }}>
        <p style={{ fontSize:"0.86rem", color:"rgba(245,237,216,0.6)", lineHeight:1.6, textAlign:"center", marginBottom:18 }}>
          This is the name other players see on the leaderboard. Choose
          something you're happy to show publicly — you can change it later
          in your profile.
        </p>
        <input
          value={name}
          onChange={e => setName(e.target.value.slice(0, 16))}
          placeholder="Your table name"
          maxLength={16}
          style={{
            width:"100%", padding:"14px 16px", borderRadius:12,
            background:"rgba(0,0,0,0.4)", border:"1.5px solid rgba(212,168,67,0.35)",
            color:"#F5EDD8", fontSize:"1.05rem", fontWeight:600, textAlign:"center",
            outline:"none", boxSizing:"border-box",
          }}
        />
        <div style={{ fontSize:"0.7rem", color:"rgba(245,237,216,0.4)", textAlign:"center", marginTop:8 }}>
          3–16 characters {trimmed.length > 0 && `· ${trimmed.length}/16`}
        </div>
      </div>

      <button
        onClick={() => valid && onConfirm(trimmed)}
        disabled={!valid}
        style={{ ...goldBtn, opacity: valid ? 1 : 0.4, cursor: valid ? "pointer" : "default" }}
      >
        Continue →
      </button>
    </div>
  );
}

// ── First-time tutorial ─────────────────────────────────────
// A short scripted walkthrough using fixed example hands. Static — it does
// not run the live game engine; it shows worked examples so a new player
// understands the bet types before sitting at a real table.
const TUTORIAL_STEPS = [
  {
    title: "Welcome to DOINK",
    cards: null,
    body: "DOINK is a fictional play-chip card game of nerve and timing. Every player antes into the pot, gets two cards, and bets on what the hit card will be. Let's walk through it.",
  },
  {
    title: "Your Two Cards",
    cards: ["5", "J"],
    body: "Each round you're dealt two cards. Here you hold a 5 and a Jack. The 'spread' between them is how many ranks sit in between — that's what most bets ride on.",
  },
  {
    title: "The Spread Bet",
    cards: ["5", "J"],
    body: "Bet the hit card lands BETWEEN your two cards. A 6, 7, 8, 9 or 10 here would win. Wider gaps are safer. A spread bet pays 1:1.",
  },
  {
    title: "Watch Out — the DOINK",
    cards: ["5", "J"],
    body: "If the hit card MATCHES one of your cards — another 5 or Jack — that's a DOINK. On a spread bet, a doink costs you double your bet. It's the risk that makes the game.",
  },
  {
    title: "The Doink Bet",
    cards: ["8", "8"],
    body: "You can bet ON a match instead. A Doink Bet wins if the hit matches one of your cards, and pays 7:1. And when you hold a PAIR like these two 8s, you can make a DOUBLE DOINK bet — that a third 8 lands — paying 18:1.",
  },
  {
    title: "Mythical Split",
    cards: ["7", "9"],
    body: "When your cards are exactly two apart, only ONE rank can fall between them. Land it and the Mythical Split pays 12:1.",
  },
  {
    title: "Buying & Selling Hands",
    cards: null,
    body: "Don't like your hand? Offer to sell it. Like someone else's? Offer to buy. It's a table of friends — read them, deal, and bluff.",
  },
  {
    title: "You're Ready",
    cards: null,
    body: "Chips are fictional and just for fun — there's no real money in DOINK. Start with Quick Play to find your feet, or jump into Career Mode. Good luck at the table.",
  },
];

function MiniCard({ rank }) {
  return (
    <div style={{
      width:54, height:76, borderRadius:8,
      background:"linear-gradient(160deg,#FFFFFF,#F8F3E4)",
      border:"1px solid rgba(0,0,0,0.15)", boxShadow:"0 4px 12px rgba(0,0,0,0.6)",
      display:"flex", alignItems:"center", justifyContent:"center",
      fontFamily:"'Playfair Display',serif", fontSize:"1.7rem", fontWeight:900, color:"#0D0D1A",
    }}>{rank}</div>
  );
}

export function FirstTimeTutorial({ onFinish }) {
  const [step, setStep] = useState(0);
  const s = TUTORIAL_STEPS[step];
  const last = step === TUTORIAL_STEPS.length - 1;

  return (
    <div style={shell}>
      {/* progress dots */}
      <div style={{ display:"flex", gap:6, marginBottom:28 }}>
        {TUTORIAL_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 22 : 7, height:7, borderRadius:4,
            background: i === step ? "#D4A843" : i < step ? "rgba(212,168,67,0.5)" : "rgba(255,255,255,0.15)",
            transition:"all .25s",
          }}/>
        ))}
      </div>

      <div style={{
        width:"100%", maxWidth:380, flex:"0 0 auto",
        background:"rgba(255,255,255,0.03)", borderRadius:18,
        border:"1px solid rgba(212,168,67,0.18)", padding:"26px 22px",
        textAlign:"center", marginBottom:24,
      }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#F0C96A", fontWeight:700, marginBottom:16 }}>
          {s.title}
        </div>
        {s.cards && (
          <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:18 }}>
            {s.cards.map((r, i) => <MiniCard key={i} rank={r}/>)}
          </div>
        )}
        <p style={{ fontSize:"0.92rem", color:"rgba(245,237,216,0.78)", lineHeight:1.65, margin:0 }}>
          {s.body}
        </p>
      </div>

      <button onClick={() => last ? onFinish() : setStep(step + 1)} style={{ ...goldBtn, marginBottom:10 }}>
        {last ? "Start Playing →" : "Next →"}
      </button>
      {!last && (
        <button onClick={onFinish} style={ghostBtn}>Skip tutorial</button>
      )}
    </div>
  );
}
