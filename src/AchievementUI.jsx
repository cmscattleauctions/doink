// ═══════════════════════════════════════════════════════════
// ACHIEVEMENT UI — custom SVG badges, unlock popup, screen
// All icons are inline SVG (no emoji), consistent across platforms.
// ═══════════════════════════════════════════════════════════
import { useState, useEffect } from "react";
import { ACHIEVEMENTS, CATEGORIES, RARITY, achievementSummary } from "./achievements.js";

// ── Badge icon ──────────────────────────────────────────────
// A medallion: rarity-colored ring + a glyph chosen by iconType.
export function AchievementBadge({ iconType = "trophy", rarity = "common", size = 56, locked = false }) {
  const rc = RARITY[rarity]?.color || "#9AA0A6";
  const ring = locked ? "#3A3E42" : rc;
  const glyphColor = locked ? "#55595E" : "#1A1206";
  const discTop = locked ? "#2A2E33" : "#F4D27A";
  const discBot = locked ? "#1A1D20" : "#C99536";

  const glyph = (() => {
    const c = glyphColor;
    switch (iconType) {
      case "card":      return <g><rect x="20" y="16" width="20" height="28" rx="3" fill={c}/><rect x="24" y="20" width="20" height="28" rx="3" fill={ring} stroke={c} strokeWidth="2"/></g>;
      case "trophy":    return <path d="M22 18h20v6a10 10 0 01-20 0zM30 34h4v8h-4zM26 42h12v3H26z" fill={c}/>;
      case "flag":      return <g><rect x="24" y="16" width="3" height="30" fill={c}/><path d="M27 18h16l-4 6 4 6H27z" fill={c}/></g>;
      case "chip":      return <g><circle cx="32" cy="32" r="14" fill={c}/><circle cx="32" cy="32" r="8" fill="none" stroke={ring} strokeWidth="2.4" strokeDasharray="3 3"/></g>;
      case "star":      return <path d="M32 16l5 11 12 1-9 8 3 12-11-6-11 6 3-12-9-8 12-1z" fill={c}/>;
      case "eye":       return <g><path d="M16 32c6-10 26-10 32 0-6 10-26 10-32 0z" fill={c}/><circle cx="32" cy="32" r="5" fill={ring}/></g>;
      case "handshake": return <path d="M16 30l8-6 8 4 8-4 8 6-6 10-6-4-4 4-4-4-6 4z" fill={c}/>;
      case "tag":       return <g><path d="M20 20h14l12 12-14 14-12-12z" fill={c}/><circle cx="27" cy="27" r="3.4" fill={ring}/></g>;
      case "scale":     return <g><rect x="31" y="16" width="2.4" height="28" fill={c}/><path d="M20 22h24M20 22l-5 9h10zM44 22l-5 9h10z" stroke={c} strokeWidth="2.4" fill="none"/></g>;
      case "doink":     return <g><circle cx="32" cy="32" r="13" fill="none" stroke={c} strokeWidth="3"/><path d="M32 22v20M22 32h20" stroke={c} strokeWidth="3"/></g>;
      case "split":     return <g><path d="M26 16l-4 16 4 16M38 16l4 16-4 16" stroke={c} strokeWidth="3" fill="none"/><path d="M32 14v36" stroke={ring} strokeWidth="2" strokeDasharray="2 3"/></g>;
      case "replenish": return <g><path d="M32 18a14 14 0 11-13 9" stroke={c} strokeWidth="3" fill="none"/><path d="M32 14l5 7-9 1z" fill={c}/></g>;
      case "chevron":   return <path d="M20 36l12-12 12 12M20 44l12-12 12 12" stroke={c} strokeWidth="3.4" fill="none"/>;
      case "key":       return <g><circle cx="26" cy="32" r="8" fill="none" stroke={c} strokeWidth="3.4"/><path d="M33 32h13v6M40 32v5" stroke={c} strokeWidth="3.4" fill="none"/></g>;
      case "flame":     return <path d="M32 14c6 8 10 11 10 18a10 10 0 01-20 0c0-4 2-7 5-10 1 3 3 4 5 4-2-4-2-8 0-12z" fill={c}/>;
      case "medal":     return <g><circle cx="32" cy="36" r="11" fill={c}/><path d="M26 16l6 12 6-12" stroke={c} strokeWidth="3" fill="none"/><circle cx="32" cy="36" r="5" fill={ring}/></g>;
      default:          return <circle cx="32" cy="32" r="12" fill={c}/>;
    }
  })();

  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      {/* outer rarity ring */}
      <circle cx="32" cy="32" r="30" fill="none" stroke={ring} strokeWidth="3.5"
        opacity={locked ? 0.6 : 1}/>
      {/* disc */}
      <defs>
        <linearGradient id={`disc-${iconType}-${rarity}-${locked}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={discTop}/>
          <stop offset="100%" stopColor={discBot}/>
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="25" fill={`url(#disc-${iconType}-${rarity}-${locked})`}/>
      {glyph}
    </svg>
  );
}

// ── Unlock popup queue ──────────────────────────────────────
// Renders one toast at a time; pass an array of newly-unlocked achievements
// and it plays through them. onAllDone fires when the queue empties.
export function AchievementToasts({ queue, onDismiss }) {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (current || queue.length === 0) return;
    const next = queue[0];
    setCurrent(next);
    const t = setTimeout(() => {
      setCurrent(null);
      onDismiss(next.id);
    }, 3200);
    return () => clearTimeout(t);
  }, [queue, current, onDismiss]);

  if (!current) return null;
  const rc = RARITY[current.rarity];
  return (
    <div style={{
      position:"fixed", top:"calc(env(safe-area-inset-top) + 14px)", left:"50%",
      transform:"translateX(-50%)", zIndex:400, width:"min(92vw,400px)",
      pointerEvents:"none",
    }}>
      <div style={{
        display:"flex", alignItems:"center", gap:12,
        background:"linear-gradient(160deg, rgba(28,22,8,0.98), rgba(10,8,4,0.99))",
        border:`1.5px solid ${rc.color}`,
        borderRadius:16, padding:"12px 14px",
        boxShadow:`0 12px 40px rgba(0,0,0,0.85), 0 0 28px ${rc.color}44`,
        animation:"achToast 0.4s cubic-bezier(.16,1,.3,1) both",
      }}>
        <AchievementBadge iconType={current.iconType} rarity={current.rarity} size={48}/>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:"0.62rem", letterSpacing:"0.16em", color:rc.color, fontWeight:700, textTransform:"uppercase" }}>
            Achievement Unlocked · {rc.label}
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.02rem", color:"#F0C96A", fontWeight:700, lineHeight:1.2, marginTop:1 }}>
            {current.title}
          </div>
          <div style={{ fontSize:"0.76rem", color:"rgba(245,237,216,0.6)", marginTop:1, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {current.desc}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Achievements screen ─────────────────────────────────────
export function AchievementsScreen({ career, onBack }) {
  const [cat, setCat] = useState("All");
  const { unlocked, total } = achievementSummary(career);
  const unlockedIds = new Set((career?.achievements || []).map(a => a.id));
  const progress = career?.achievementProgress || {};

  const cats = ["All", ...CATEGORIES];
  const shown = ACHIEVEMENTS.filter(a => cat === "All" || a.category === cat);

  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"calc(env(safe-area-inset-top) + 18px) 16px calc(44px + env(safe-area-inset-bottom))" }}>
        {/* Header */}
        <div style={{ width:"100%", maxWidth:520, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <button onClick={onBack} style={{ padding:"8px 14px", borderRadius:10, background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.16)", color:"rgba(245,237,216,0.78)", fontSize:"0.85rem", fontWeight:500, cursor:"pointer" }}>← Back</button>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"#D4A843", fontWeight:700, letterSpacing:"0.04em" }}>Achievements</div>
          <div style={{ fontSize:"0.8rem", color:"#F0C96A", fontWeight:700, width:60, textAlign:"right" }}>{unlocked}/{total}</div>
        </div>

        {/* Progress bar */}
        <div style={{ width:"100%", maxWidth:520, marginBottom:14 }}>
          <div style={{ height:8, background:"rgba(0,0,0,0.5)", borderRadius:6, overflow:"hidden", border:"1px solid rgba(212,168,67,0.18)" }}>
            <div style={{ height:"100%", width:`${total?(unlocked/total)*100:0}%`, background:"linear-gradient(90deg,#8A6418,#F4D27A)" }}/>
          </div>
        </div>

        {/* Category filter */}
        <div style={{ width:"100%", maxWidth:520, display:"flex", gap:6, overflowX:"auto", paddingBottom:6, marginBottom:10, WebkitOverflowScrolling:"touch" }}>
          {cats.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              flexShrink:0, padding:"7px 12px", borderRadius:9, cursor:"pointer",
              fontSize:"0.74rem", fontWeight:700, whiteSpace:"nowrap",
              background: cat===c ? "rgba(212,168,67,0.2)" : "rgba(255,255,255,0.04)",
              border: cat===c ? "1.5px solid rgba(212,168,67,0.55)" : "1px solid rgba(255,255,255,0.1)",
              color: cat===c ? "#F0C96A" : "rgba(245,237,216,0.5)",
            }}>{c}</button>
          ))}
        </div>

        {/* List */}
        <div style={{ width:"100%", maxWidth:520, display:"flex", flexDirection:"column", gap:8 }}>
          {shown.map(a => {
            const isUnlocked = unlockedIds.has(a.id);
            const cur = Math.min(progress[a.id] || 0, a.target);
            const rc = RARITY[a.rarity];
            // Hidden + still locked → show as secret
            const secret = a.hidden && !isUnlocked;
            return (
              <div key={a.id} style={{
                display:"flex", alignItems:"center", gap:13,
                background: isUnlocked ? "linear-gradient(160deg,rgba(40,28,8,0.5),rgba(12,9,5,0.8))" : "rgba(255,255,255,0.03)",
                border: isUnlocked ? `1.5px solid ${rc.color}66` : "1px solid rgba(255,255,255,0.07)",
                borderRadius:14, padding:"12px 13px",
                opacity: isUnlocked ? 1 : 0.85,
              }}>
                <AchievementBadge
                  iconType={secret ? "star" : a.iconType}
                  rarity={a.rarity}
                  size={50}
                  locked={!isUnlocked}
                />
                <div style={{ minWidth:0, flex:1 }}>
                  <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.98rem", fontWeight:700, color: isUnlocked ? "#F0C96A" : "rgba(245,237,216,0.7)" }}>
                      {secret ? "Secret Achievement" : a.title}
                    </span>
                    <span style={{ fontSize:"0.6rem", fontWeight:700, color:rc.color, letterSpacing:"0.08em", textTransform:"uppercase" }}>{rc.label}</span>
                  </div>
                  <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.55)", marginTop:1 }}>
                    {secret ? "Keep playing to discover this one." : a.desc}
                  </div>
                  {/* progress bar for multi-step, still-locked */}
                  {!isUnlocked && !secret && a.target > 1 && (
                    <div style={{ marginTop:6 }}>
                      <div style={{ height:5, background:"rgba(0,0,0,0.5)", borderRadius:4, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${(cur/a.target)*100}%`, background:rc.color, opacity:0.8 }}/>
                      </div>
                      <div style={{ fontSize:"0.64rem", color:"rgba(245,237,216,0.4)", marginTop:2 }}>{cur} / {a.target}</div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
