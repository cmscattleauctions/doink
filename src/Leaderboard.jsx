// ═══════════════════════════════════════════════════════════
// LEADERBOARD — four ranked tabs across all players
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { loadLeaderboard } from "./cloud.js";

const TABS = [
  { id: "bankroll",          label: "Chip Stack",    key: "bankroll",          fmt: v => `◆${(v||0).toLocaleString()}`,                     desc: "Biggest chip stack" },
  { id: "totalCareerProfit", label: "Total Profit",  key: "totalCareerProfit", fmt: v => `${v>=0?"+":"−"}◆${Math.abs(v||0).toLocaleString()}`, desc: "Lifetime net profit" },
  { id: "biggestPotWon",     label: "Biggest Win",   key: "biggestPotWon",     fmt: v => `◆${(v||0).toLocaleString()}`,                     desc: "Largest single win" },
  { id: "biggestDoinkLoss",  label: "Biggest Doink", key: "biggestDoinkLoss",  fmt: v => `◆${(v||0).toLocaleString()}`,                     desc: "Worst doink — hall of shame" },
];

export default function Leaderboard({ onBack, myUid }) {
  const [rows, setRows] = useState(null);  // null = loading
  const [tab, setTab] = useState(TABS[0]);

  useEffect(() => {
    let alive = true;
    loadLeaderboard().then(r => { if (alive) setRows(r); });
    return () => { alive = false; };
  }, []);

  const sorted = rows
    ? [...rows].sort((a, b) => (b[tab.key] || 0) - (a[tab.key] || 0))
    : [];

  const card = {
    background: "rgba(255,255,255,0.03)",
    borderRadius: 16, padding: "16px 18px",
    border: "1px solid rgba(255,255,255,0.08)",
  };

  return (
    <div className="ios-scroll" style={{ background: "radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "calc(env(safe-area-inset-top) + 18px) 22px calc(40px + env(safe-area-inset-bottom))" }}>
        {/* Header — sticky so it stays visible while the list scrolls */}
        <div style={{
          position: "sticky", top: "env(safe-area-inset-top)", zIndex: 20,
          width: "100%", maxWidth: 460,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          marginBottom: 18, padding: "10px 0",
          background: "linear-gradient(180deg, #0C1A10 0%, #0C1A10 75%, transparent 100%)",
        }}>
          <button onClick={onBack} style={backBtn}>← Back</button>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", color: "#D4A843", fontWeight: 700, letterSpacing: "0.04em" }}>Leaderboard</div>
          <div style={{ width: 60 }} />
        </div>

        {/* Tabs */}
        <div style={{ width: "100%", maxWidth: 460, display: "flex", gap: 6, marginBottom: 6 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t)} style={{
              flex: 1, padding: "9px 4px", borderRadius: 10, cursor: "pointer",
              fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.02em",
              background: tab.id === t.id ? "rgba(212,168,67,0.2)" : "rgba(255,255,255,0.04)",
              border: tab.id === t.id ? "1.5px solid rgba(212,168,67,0.55)" : "1px solid rgba(255,255,255,0.1)",
              color: tab.id === t.id ? "#F0C96A" : "rgba(245,237,216,0.45)",
            }}>{t.label}</button>
          ))}
        </div>
        <div style={{ width: "100%", maxWidth: 460, fontSize: "0.72rem", color: "rgba(245,237,216,0.4)", textAlign: "center", marginBottom: 14 }}>
          {tab.desc}
        </div>

        {/* Rows */}
        <div style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 8 }}>
          {rows === null && (
            <div style={{ ...card, textAlign: "center", color: "rgba(245,237,216,0.5)" }}>Loading standings…</div>
          )}
          {rows !== null && sorted.length === 0 && (
            <div style={{ ...card, textAlign: "center", color: "rgba(245,237,216,0.5)" }}>
              No players ranked yet. Play a career session to get on the board.
            </div>
          )}
          {sorted.map((row, i) => {
            const isMe = row.uid === myUid;
            const medalColor = i === 0 ? "#F0C96A" : i === 1 ? "#C8CDD2" : i === 2 ? "#C97F4A" : null;
            return (
              <div key={row.uid || i} style={{
                ...card,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                background: isMe ? "linear-gradient(160deg,rgba(60,42,12,0.5),rgba(20,12,4,0.8))" : card.background,
                border: isMe ? "1.5px solid rgba(212,168,67,0.5)" : card.border,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{
                    width: 30, textAlign: "center", fontFamily: "'Playfair Display', serif",
                    fontWeight: 800, fontSize: medalColor ? "1.1rem" : "0.95rem",
                    color: medalColor || "rgba(245,237,216,0.45)",
                  }}>{i + 1}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: "0.95rem", color: "#F5EDD8", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.name || "Player"}{isMe && <span style={{ color: "#D4A843", fontWeight: 500 }}> · you</span>}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "rgba(245,237,216,0.4)" }}>Level {row.level || 1}</div>
                  </div>
                </div>
                <div style={{
                  fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: "1.05rem",
                  color: tab.id === "totalCareerProfit" && (row[tab.key] || 0) < 0 ? "#E74C3C" : "#F0C96A",
                  flexShrink: 0, paddingLeft: 10,
                }}>{tab.fmt(row[tab.key])}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const backBtn = {
  padding: "8px 14px", borderRadius: 10,
  background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.16)",
  color: "rgba(245,237,216,0.78)", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
};
