import { useState, useEffect, useRef, useReducer, useCallback } from "react";

// ─────────────────────────────────────────────────────────
// GLOBAL CSS
// ─────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

:root {
  --gold:#D4A843;--gold-light:#F0C96A;--gold-dim:rgba(212,168,67,0.5);
  --green-felt:#1A5C30;--green-dark:#0D3A1C;--green-deep:#071C0E;
  --card-bg:#FAFAF5;--red:#C0392B;--navy:#1a1a2e;
  --win:#27AE60;--lose:#E74C3C;--panel-bg:#080F0A;
  --text-primary:#F5EDD8;--text-dim:rgba(245,237,216,0.55);--text-muted:rgba(245,237,216,0.28);
  --r-lg:20px;--r-md:14px;--r-sm:10px;
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html,body{height:100%;height:100dvh;background:#060D08}
body{font-family:'DM Sans',system-ui,sans-serif;color:var(--text-primary);touch-action:manipulation;overflow:hidden;-webkit-font-smoothing:antialiased}
#root{height:100dvh;overflow:hidden}
.ios-scroll{position:fixed;inset:0;overflow-y:auto;-webkit-overflow-scrolling:touch;height:100dvh}
::-webkit-scrollbar{display:none}

@keyframes dealIn{from{opacity:0;transform:scale(0.12) translateY(-40px) rotate(-14deg)}to{opacity:1;transform:none}}
@keyframes hitFlip{0%{opacity:0;transform:scaleX(0)}70%{opacity:1;transform:scaleX(1.05)}100%{opacity:1;transform:none}}
@keyframes bigShake{0%,100%{transform:none}12%{transform:translate(-10px,4px)rotate(-5deg)scale(1.04)}28%{transform:translate(10px,-5px)rotate(5deg)scale(1.04)}44%{transform:translate(-7px,6px)rotate(-3deg)}60%{transform:translate(7px,-5px)rotate(3deg)}76%{transform:translate(-4px,3px)rotate(-1.5deg)}}
@keyframes slideUp{from{opacity:0;transform:translateY(100%)}to{opacity:1;transform:none}}
@keyframes slideRight{from{opacity:0;transform:translateX(100%)}to{opacity:1;transform:none}}
@keyframes popIn{from{opacity:0;transform:scale(0.8)}to{opacity:1;transform:scale(1)}}
@keyframes potGain{0%{transform:scale(1)}30%{transform:scale(1.32)}65%{transform:scale(1.1)}100%{transform:scale(1)}}
@keyframes potLose{0%{transform:scale(1)}30%{transform:scale(0.75)}65%{transform:scale(0.92)}100%{transform:scale(1)}}
@keyframes winBlast{0%,100%{box-shadow:0 0 0 rgba(39,174,96,0);background:rgba(39,174,96,0)}35%{box-shadow:0 0 80px 20px rgba(39,174,96,0.65);background:rgba(39,174,96,0.1)}}
@keyframes doinkExplosion{0%,100%{box-shadow:0 0 0 rgba(231,76,60,0);background:rgba(231,76,60,0);transform:none}22%{box-shadow:0 0 90px 28px rgba(231,76,60,0.85);background:rgba(231,76,60,0.15);transform:scale(1.06)}55%{box-shadow:0 0 40px 10px rgba(231,76,60,0.4);transform:scale(0.97)}}
@keyframes missFlash{0%,100%{opacity:1}40%{opacity:0.15}70%{opacity:0.6}}
@keyframes floatUp{0%{opacity:1;transform:translateY(0)scale(1)}100%{opacity:0;transform:translateY(-52px)scale(1.2)}}
@keyframes floatDown{0%{opacity:1;transform:translateY(0)scale(1)}100%{opacity:0;transform:translateY(52px)scale(1.2)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}
@keyframes chipBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
@keyframes glowPulse{0%,100%{box-shadow:0 0 10px rgba(212,168,67,0.25)}50%{box-shadow:0 0 26px rgba(212,168,67,0.65)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes breathe{0%,100%{transform:translate(-50%,-50%) scale(1)}50%{transform:translate(-50%,-50%) scale(1.025)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes ringExpand{0%{box-shadow:0 0 0 0 currentColor}100%{box-shadow:0 0 0 24px transparent}}

.deal-anim{animation:dealIn .35s cubic-bezier(.16,1,.3,1) both}
.hit-anim{animation:hitFlip .45s cubic-bezier(.16,1,.3,1) both}
.big-shake{animation:bigShake .65s ease}
.sheet-up{animation:slideUp .3s cubic-bezier(.16,1,.3,1) both}
.sheet-right{animation:slideRight .3s cubic-bezier(.16,1,.3,1) both}
.pop{animation:popIn .22s cubic-bezier(.16,1,.3,1) both}
.fade-up{animation:fadeUp .28s ease both}
.pot-gain{animation:potGain .55s cubic-bezier(.16,1,.3,1)}
.pot-lose{animation:potLose .55s cubic-bezier(.16,1,.3,1)}
.win-blast{animation:winBlast .9s ease}
.doink-explosion{animation:doinkExplosion .85s ease,bigShake .55s ease}
.miss-flash{animation:missFlash .5s ease}
.glow-active{animation:glowPulse 2s ease-in-out infinite}
button{cursor:pointer;-webkit-tap-highlight-color:transparent;font-family:'DM Sans',sans-serif}
button:active{opacity:0.7;transform:scale(0.93)}
input{outline:none;font-family:'DM Sans',sans-serif}
`;

// ─────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────
const SUITS = ["♠", "♥", "♦", "♣"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const RV = { A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7, 8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13 };
const RED = new Set(["♥", "♦"]);

// FIX #9: Extract bot tuning constants
const BOT_CONFIG = {
  blindBetChance: 0.06,
  blindBetFraction: 0.10,
  doinkOnSameRankChance: 0.45,
  doinkOnSameRankFraction: 0.28,
  mythicalSpreadBetChance: 0.40,
  mythicalSpreadBetFraction: 0.32,
  mythicalDoinkChance: 0.15,      // relative to remaining after spread
  spreadConfidenceBase: 0.25,
  spreadConfidenceScale: 0.45,
  doinkLongShotChance: 0.12,
  doinkLongShotFraction: 0.18,
  offerAcceptThresholdGood: 0.85,
  offerAcceptThresholdPoor: 0.50,
  counterMultiplier: 1.6,
  botSellChanceTrash: 0.65,
  botSellChancePoor: 0.40,
  botSellChanceFair: 0.18,
};

const cv = c => RV[c.rank];
const between = (a, b, h) => {
  const lo = Math.min(cv(a), cv(b)), hi = Math.max(cv(a), cv(b)), v = cv(h);
  return v > lo && v < hi;
};
const isDoinkCard = (a, b, h) => cv(h) === cv(a) || cv(h) === cv(b);
const spreadOf = (a, b) => Math.abs(cv(a) - cv(b));
const isMythical = (a, b) => spreadOf(a, b) === 2;

// Each bot has a fixed personality keyed by name. Multipliers stack onto BOT_CONFIG.
// confidence: how high they bet on good hands. doink: appetite for the 7:1. sell: how often they sell weak hands.
// blind: appetite for blind bets. risk: passes vs goes for it on marginal hands.
const BOT_NAMES = ["Payne", "Jayton", "Michael", "Emmanuel", "Parker", "Landen", "Isaac", "Jake", "Will", "Dalton", "Cody", "Jerry", "Rube", "Graham", "Houston"];

const DEFAULT_PERSONALITY = { confidence: 1, doink: 1, sell: 1, blind: 1, risk: 1, label: "Steady" };
const BOT_PERSONALITIES = {
  Dalton:   { confidence: 1.35, doink: 1.35, sell: 0.85, blind: 1.30, risk: 1.55, label: "High Risk, High Reward" },
  Cody:     { confidence: 1.05, doink: 0.85, sell: 1.05, blind: 0.75, risk: 0.80, label: "The Thinker" },
  Jerry:    { confidence: 1.20, doink: 1.20, sell: 1.00, blind: 1.10, risk: 1.25, label: "Hit or Miss" },
  Michael:  { confidence: 1.15, doink: 1.10, sell: 0.90, blind: 1.00, risk: 1.20, label: "Chaos Merchant" },
  Rube:     { confidence: 0.95, doink: 1.25, sell: 1.15, blind: 0.90, risk: 1.10, label: "The Wild Card" },
  Emmanuel: { confidence: 1.05, doink: 0.75, sell: 0.90, blind: 0.65, risk: 0.75, label: "The Silent Killer" },
  Jayton:   { confidence: 1.20, doink: 1.00, sell: 0.85, blind: 0.85, risk: 1.00, label: "The Table Boss" },
  Parker:   { confidence: 1.00, doink: 0.90, sell: 1.45, blind: 0.80, risk: 0.95, label: "The Hand Flipper" },
  Landen:   { confidence: 1.05, doink: 1.55, sell: 1.00, blind: 1.15, risk: 1.25, label: "The Doink Prophet" },
  Isaac:    { confidence: 0.90, doink: 0.80, sell: 1.20, blind: 0.70, risk: 0.70, label: "The Grinder" },
  Graham:   { confidence: 1.10, doink: 1.05, sell: 1.00, blind: 0.95, risk: 1.05, label: "The Natural" },
  Houston:  { confidence: 1.25, doink: 0.95, sell: 0.75, blind: 1.05, risk: 1.30, label: "The Big Swing" },
  Payne:    { confidence: 1.10, doink: 1.15, sell: 0.95, blind: 1.05, risk: 1.15, label: "The Closer" },
};
const getPersonality = name => BOT_PERSONALITIES[name] || DEFAULT_PERSONALITY;
const shuffleBotNames = () => {
  const a = [...BOT_NAMES];
  for (let i = a.length - 1; i > 0; i--) {
    const j = 0 | Math.random() * (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// ─────────────────────────────────────────────────────────
// CAREER MODE — constants, save model, helpers
// ─────────────────────────────────────────────────────────

const CAREER_KEY = "doinkCareerV1";

const CAREER_TABLES = [
  { id: "garage",     name: "Garage Game",         subtitle: "Low stakes. Friendly chaos.",       minBankroll: 0,     buyIn: 100,  bots: 3, ante: 1,  unlockLevel: 1,
    rivals: ["Cody", "Isaac", "Graham", "Jerry"] },
  { id: "backroom",   name: "Backroom Table",      subtitle: "Bigger pots. Meaner bots.",         minBankroll: 500,   buyIn: 250,  bots: 4, ante: 2,  unlockLevel: 4,
    rivals: ["Cody", "Jerry", "Parker", "Emmanuel", "Rube"] },
  { id: "riverboat",  name: "Riverboat Room",      subtitle: "The doinks start hurting.",         minBankroll: 1500,  buyIn: 500,  bots: 5, ante: 5,  unlockLevel: 9,
    rivals: ["Michael", "Parker", "Landen", "Emmanuel", "Houston"] },
  { id: "highroller", name: "High Roller Pit",     subtitle: "One doink can ruin your week.",     minBankroll: 5000,  buyIn: 1000, bots: 6, ante: 10, unlockLevel: 16,
    rivals: ["Dalton", "Jayton", "Landen", "Houston", "Michael", "Rube"] },
  { id: "mythic",     name: "Mythic Invitational", subtitle: "Big money. Brutal bots.",           minBankroll: 15000, buyIn: 2500, bots: 7, ante: 25, unlockLevel: 25,
    rivals: ["Dalton", "Jayton", "Landen", "Houston", "Michael", "Parker", "Emmanuel"] },
];

const createDefaultCareer = (playerName = "Player") => ({
  version: 1,
  playerName: playerName || "Player",
  bankroll: 500,
  level: 1,
  xp: 0,
  totalHandsPlayed: 0,
  totalRoundsPlayed: 0,
  totalCareerProfit: 0,
  biggestPotWon: 0,
  biggestDoinkLoss: 0,
  mythicalHits: 0,
  doinkBetsHit: 0,
  handsBought: 0,
  handsSold: 0,
  sessionsPlayed: 0,
  sessionsWon: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastDailyClaim: null,
  lastDailyAmount: 0,
  dailyCap: 500,
  achievements: [],
});

// Merge any stored career object with current defaults so older saves stay
// valid as new fields are added. Used by App.jsx after a Firestore read.
const normalizeCareer = (stored, playerName) => {
  if (!stored) return null;
  return { ...createDefaultCareer(playerName), ...stored };
};

const todayKey = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const canClaimDaily = career => {
  if (!career) return false;
  if (career.bankroll >= career.dailyCap) return false;
  return career.lastDailyClaim !== todayKey();
};
const dailyAmountFor = career => Math.max(0, career.dailyCap - career.bankroll);
const claimDaily = career => {
  if (!canClaimDaily(career)) return career;
  const amount = dailyAmountFor(career);
  return {
    ...career,
    bankroll: career.bankroll + amount,
    lastDailyClaim: todayKey(),
    lastDailyAmount: amount,
  };
};

// XP curve: steep enough that levelling is a real grind, not a one-round thing.
// xpForLevel(n) = cumulative XP required to BE at level n.
// Per-level requirement: 150, 225, 300, 375, ... (first 150, step 75).
// A typical round nets ~30-90 XP, so early levels take several full sessions.
const xpForLevel = level => {
  if (level <= 1) return 0;
  const n = level - 1;
  return n * 150 + 75 * (n * (n - 1) / 2);
};
const getLevelFromXP = xp => {
  let lvl = 1;
  while (xp >= xpForLevel(lvl + 1)) lvl++;
  return lvl;
};
const xpToNextLevel = xp => {
  const lvl = getLevelFromXP(xp);
  const nextReq = xpForLevel(lvl + 1);
  const curReq = xpForLevel(lvl);
  return { level: lvl, current: xp - curReq, needed: nextReq - curReq, total: nextReq };
};

// applyCareerSession: pure function that merges a finished session into a career.
const applyCareerSession = (career, result) => {
  const oldBankroll = career.bankroll;
  const newBankroll = Math.max(0, oldBankroll + result.cashOut); // buyIn already deducted up front
  const xpEarned = result.xpEarned || 0;
  const newXP = career.xp + xpEarned;
  const newLevel = getLevelFromXP(newXP);
  const wasWin = result.net > 0;
  return {
    ...career,
    bankroll: newBankroll,
    xp: newXP,
    level: newLevel,
    totalRoundsPlayed: career.totalRoundsPlayed + (result.roundsPlayed || 0),
    totalHandsPlayed: career.totalHandsPlayed + (result.roundsPlayed || 0),
    totalCareerProfit: career.totalCareerProfit + result.net,
    biggestPotWon: Math.max(career.biggestPotWon, result.biggestPotWon || 0),
    biggestDoinkLoss: Math.max(career.biggestDoinkLoss, result.biggestDoinkLoss || 0),
    mythicalHits: career.mythicalHits + (result.mythicalHits || 0),
    doinkBetsHit: career.doinkBetsHit + (result.doinkBetsHit || 0),
    handsBought: career.handsBought + (result.handsBought || 0),
    handsSold: career.handsSold + (result.handsSold || 0),
    sessionsPlayed: career.sessionsPlayed + 1,
    sessionsWon: career.sessionsWon + (wasWin ? 1 : 0),
    currentStreak: wasWin ? career.currentStreak + 1 : 0,
    bestStreak: Math.max(career.bestStreak, wasWin ? career.currentStreak + 1 : career.currentStreak),
  };
};

// XP rules — used to compute earned XP from a session's tracked stats.
const computeSessionXP = stats => {
  let xp = 0;
  xp += (stats.roundsPlayed || 0) * 10;
  xp += (stats.spreadWins || 0) * 25;
  xp += (stats.doinkBetsHit || 0) * 40;
  xp += (stats.mythicalHits || 0) * 75;
  xp += ((stats.handsBought || 0) + (stats.handsSold || 0)) * 15;
  const net = (stats.cashOut || 0) - (stats.buyIn || 0);
  if (net > 0) xp += Math.floor(net / 25);
  return xp;
};

const tableIsPlayable = (table, career) => {
  if (!career) return false;
  if (career.level < table.unlockLevel) return false;
  if (career.bankroll < table.buyIn) return false;
  if (career.bankroll < table.minBankroll) return false;
  return true;
};

// Pick career bot names for a table: prefer rival list, fall back if too few.
const pickCareerRivals = (table) => {
  const pool = [...(table.rivals || [])];
  // shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = 0 | Math.random() * (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  if (pool.length >= table.bots) return pool.slice(0, table.bots);
  // Top up from rest of BOT_NAMES if rivals list is short
  const used = new Set(pool);
  const extra = BOT_NAMES.filter(n => !used.has(n));
  for (let i = extra.length - 1; i > 0; i--) {
    const j = 0 | Math.random() * (i + 1);
    [extra[i], extra[j]] = [extra[j], extra[i]];
  }
  return [...pool, ...extra].slice(0, table.bots);
};

// ─────────────────────────────────────────────────────────
// AVATAR MEDALLIONS — premium Greek-bust portraits in metal frames
// ─────────────────────────────────────────────────────────
// Each avatar is a circular medallion: a metallic rim, a dark inner disc, and
// a finely-shaded marble bust portrait. Bots cycle through restrained metal
// rim tones and several distinct bust styles (hair, laurel, beard) so they're
// individually identifiable. The human gets a warm gold rim + a gilded bust.

// Bot rim palettes — [light, mid, dark] for the conic metal frame.
const BOT_RIM_PALETTES = [
  ["#7E8388", "#44484C", "#1C1E20"], // gunmetal
  ["#9A8660", "#5E4C32", "#2A2014"], // bronze
  ["#6C7A82", "#3E484E", "#181D21"], // steel blue
  ["#867E8E", "#4E4856", "#1F1C24"], // pewter
  ["#8E7C58", "#564632", "#241C12"], // antique brass
  ["#6E7E74", "#3E4A43", "#181F1A"], // patina
  ["#80848A", "#4A4D52", "#1E2022"], // graphite
  ["#8C746A", "#56423A", "#261A16"], // copper
];
const HUMAN_RIM_PALETTE = ["#F6D98A", "#D4A843", "#7A580F"];

// Inner-disc backdrop tints behind the bust.
const INNER_TINTS = [
  ["#2A2E33", "#0C0E10"],
  ["#2C2824", "#100C0A"],
  ["#262A30", "#0A0C0F"],
  ["#2A2530", "#0E0A10"],
];

// Marble palettes for the bust itself — [highlight, mid, shadow].
const MARBLE_BOT = ["#E8E2D4", "#C2BAA6", "#8E8576"];
const MARBLE_HUMAN = ["#F4E4B8", "#D9C188", "#A8895A"];

const getAvatarConfig = (seed = 0, name, isHuman = false) => {
  const s = Math.abs(seed | 0);
  return {
    rim: isHuman ? HUMAN_RIM_PALETTE : BOT_RIM_PALETTES[s % BOT_RIM_PALETTES.length],
    inner: INNER_TINTS[s % INNER_TINTS.length],
    marble: isHuman ? MARBLE_HUMAN : MARBLE_BOT,
    bustStyle: s % 6,           // 0-5, picks hair/laurel/beard variant
    isHuman,
  };
};

const initialsFromName = (name) => {
  if (!name) return "•";
  const t = String(name).trim();
  const m = t.match(/^([A-Za-z])[A-Za-z]*\s*(\d+)$/);
  if (m) return (m[1] + m[2]).toUpperCase();
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return t.slice(0, 1).toUpperCase();
};

// Render a refined Greek-bust portrait as inline SVG (React elements, not
// dangerouslySetInnerHTML). viewBox is 0 0 100 100; the bust is centered.
function GreekBust({ marble, style, gilded }) {
  const [hi, mid, sh] = marble;
  // Derive extra tones for sculptural depth
  const deep = sh;                 // deepest shadow
  const id = "g" + style + (gilded ? "h" : "b");

  // ── Hair / headpiece — layered, sculptural, varies by style ──
  const hairBack = (() => {
    // Mass of hair behind the head, drawn before the face
    switch (style) {
      case 4: // long flowing hair
        return <path d="M26 38 Q22 64 30 80 Q34 66 34 52 Q33 42 38 34 Q30 32 26 38Z M74 38 Q78 64 70 80 Q66 66 66 52 Q67 42 62 34 Q70 32 74 38Z" fill={deep}/>;
      default:
        return <path d="M28 38 Q25 56 31 70 Q33 56 35 46 Q31 40 28 38Z M72 38 Q75 56 69 70 Q67 56 65 46 Q69 40 72 38Z" fill={deep} opacity="0.9"/>;
    }
  })();
  const hairFront = (() => {
    switch (style) {
      case 0: // tight classical curls
        return <g fill={`url(#${id}h)`}>
          <path d="M30 39 Q27 23 50 20 Q73 23 70 39 Q68 31 60 30 Q63 26 56 26 Q58 23 50 24 Q42 23 44 26 Q37 26 40 30 Q32 31 30 39Z"/>
          {[36,44,52,60].map((cx,i)=><circle key={i} cx={cx} cy={25+(i%2)*2} r="3.4" opacity="0.9"/>)}
          {[33,41,50,59,67].map((cx,i)=><circle key={"b"+i} cx={cx} cy={32-(i%2)*1.5} r="3" opacity="0.8"/>)}
        </g>;
      case 1: // laurel wreath
        return <g>
          <path d="M31 40 Q29 26 50 23 Q71 26 69 40 Q66 33 58 32 Q60 29 50 30 Q40 29 42 32 Q34 33 31 40Z" fill={`url(#${id}h)`}/>
          {/* wreath band */}
          <path d="M26 36 Q38 22 50 21 Q62 22 74 36" fill="none" stroke="#B8923E" strokeWidth="3" strokeLinecap="round"/>
          <path d="M26 36 Q38 24 50 23 Q62 24 74 36" fill="none" stroke="#E4C778" strokeWidth="1.4" strokeLinecap="round" opacity="0.9"/>
          {/* laurel leaves */}
          {[[28,33],[32,28],[38,24],[45,21.5],[55,21.5],[62,24],[68,28],[72,33]].map(([lx,ly],i)=>(
            <ellipse key={i} cx={lx} cy={ly} rx="3.4" ry="1.7" fill="#9FBE6A"
              transform={`rotate(${i<4?-40+i*16:40-(i-4)*16} ${lx} ${ly})`} opacity="0.95"/>
          ))}
        </g>;
      case 2: // swept-back hair
        return <path d="M30 42 Q25 25 50 21 Q75 25 70 42 Q72 33 64 31 Q68 27 58 28 Q62 24 50 25 Q38 24 42 28 Q32 27 36 31 Q28 33 30 42Z" fill={`url(#${id}h)`}/>;
      case 3: // curls + diadem
        return <g>
          <path d="M30 40 Q28 24 50 21 Q72 24 70 40 Q67 32 58 31 Q60 28 50 29 Q40 28 42 31 Q33 32 30 40Z" fill={`url(#${id}h)`}/>
          {[36,44,52,60].map((cx,i)=><circle key={i} cx={cx} cy={26+(i%2)*1.6} r="3" opacity="0.85" fill={`url(#${id}h)`}/>)}
          <path d="M31 34 Q50 28 69 34" fill="none" stroke="#E4C778" strokeWidth="2.6" strokeLinecap="round"/>
          <circle cx="50" cy="30.5" r="2.1" fill="#F0C96A"/>
        </g>;
      case 4: // long parted hair
        return <path d="M30 44 Q26 26 50 21 Q74 26 70 44 Q70 34 62 32 Q64 29 52 30 L50 27 L48 30 Q36 29 38 32 Q30 34 30 44Z" fill={`url(#${id}h)`}/>;
      default: // close-cropped
        return <path d="M33 38 Q33 25 50 23 Q67 25 67 38 Q63 32 56 31 Q58 29 50 30 Q42 29 44 31 Q37 32 33 38Z" fill={`url(#${id}h)`} opacity="0.95"/>;
    }
  })();
  const beard = style === 2 || style === 4
    ? <g>
        <path d="M36 56 Q37 74 50 79 Q63 74 64 56 Q60 68 50 70 Q40 68 36 56Z" fill={`url(#${id}bd)`}/>
        <path d="M40 58 Q44 70 50 72 Q56 70 60 58 Q55 66 50 67 Q45 66 40 58Z" fill={deep} opacity="0.5"/>
      </g>
    : null;

  return (
    <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <defs>
        {/* Face — light from upper-left, 3/4 turn */}
        <radialGradient id={id} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={hi}/>
          <stop offset="42%" stopColor={mid}/>
          <stop offset="78%" stopColor={sh}/>
          <stop offset="100%" stopColor={deep}/>
        </radialGradient>
        {/* Hair */}
        <linearGradient id={id + "h"} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stopColor={mid}/>
          <stop offset="55%" stopColor={sh}/>
          <stop offset="100%" stopColor={deep}/>
        </linearGradient>
        {/* Toga / shoulders */}
        <linearGradient id={id + "s"} x1="0.3" y1="0" x2="0.7" y2="1">
          <stop offset="0%" stopColor={mid}/>
          <stop offset="100%" stopColor={deep}/>
        </linearGradient>
        {/* Beard */}
        <linearGradient id={id + "bd"} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={mid}/>
          <stop offset="100%" stopColor={sh}/>
        </linearGradient>
      </defs>

      {/* Shoulders / draped toga */}
      <path d="M14 100 Q15 74 36 64 Q43 72 50 72 Q57 72 64 64 Q85 74 86 100Z" fill={`url(#${id}s)`}/>
      {/* Toga fold lines */}
      <path d="M30 100 Q33 82 44 70 M70 100 Q67 82 56 70 M50 73 L50 100" fill="none" stroke={deep} strokeWidth="1.4" opacity="0.45" strokeLinecap="round"/>
      <path d="M36 64 Q43 73 50 73 Q57 73 64 64 Q58 70 50 71 Q42 70 36 64Z" fill={deep} opacity="0.55"/>

      {hairBack}

      {/* Neck */}
      <path d="M42 56 Q42 67 50 70 Q58 67 58 56 Q54 61 50 61 Q46 61 42 56Z" fill={mid}/>
      <path d="M50 58 Q54 61 58 56 L58 64 Q54 66 50 65Z" fill={deep} opacity="0.4"/>
      {/* Neck-to-jaw shadow */}
      <ellipse cx="50" cy="58" rx="9" ry="4" fill={deep} opacity="0.45"/>

      {/* Head — slight 3/4 turn, egg-shaped */}
      <path d="M50 18 Q68 18 70 40 Q71 52 62 60 Q56 64 50 64 Q44 64 38 60 Q29 52 30 40 Q32 18 50 18Z" fill={`url(#${id})`}/>

      {/* Shadow side of the face (right side, away from light) */}
      <path d="M58 24 Q70 30 70 42 Q70 54 60 61 Q66 52 65 40 Q64 30 58 24Z" fill={deep} opacity="0.32"/>

      {/* Forehead + temple highlight plane */}
      <path d="M38 26 Q48 21 56 25 Q50 30 44 32 Q40 30 38 26Z" fill={hi} opacity="0.4"/>

      {/* Brow ridge — casts a soft shadow over the eyes */}
      <path d="M37 39 Q44 35 49 38 Q50 39 51 38 Q56 35 63 39 Q57 37 51 40 Q50 41 49 40 Q43 37 37 39Z" fill={deep} opacity="0.55"/>

      {/* Eye sockets — recessed, blank classical pupils */}
      <ellipse cx="43.5" cy="42.5" rx="3.8" ry="2.6" fill={deep} opacity="0.4"/>
      <ellipse cx="56.5" cy="42.5" rx="3.6" ry="2.5" fill={deep} opacity="0.45"/>
      <ellipse cx="43.5" cy="42.8" rx="2" ry="1.5" fill={deep} opacity="0.8"/>
      <ellipse cx="56.3" cy="42.8" rx="1.9" ry="1.4" fill={deep} opacity="0.85"/>
      {/* Upper lid line */}
      <path d="M40 41 Q43.5 39.4 47 41 M53 41 Q56.5 39.4 60 41" fill="none" stroke={deep} strokeWidth="1.1" strokeLinecap="round" opacity="0.6"/>

      {/* Nose — strong classical bridge, lit on the left edge */}
      <path d="M49 39 Q48 48 45.5 53 Q49 55.5 53 53 Q51 48 50.5 39Z" fill={mid}/>
      <path d="M49 39 Q48.4 48 46.5 52.5 Q48 53.5 49.2 53 Q49 47 49.4 39Z" fill={hi} opacity="0.5"/>
      <path d="M50.5 39 Q51 48 53 53 Q52 53.6 50.8 53.2 Q50.4 47 50 39Z" fill={deep} opacity="0.4"/>
      {/* Nostril hint */}
      <path d="M45.5 53 Q47 55 49 54 M54.5 53 Q53 55 51 54" fill="none" stroke={deep} strokeWidth="1" strokeLinecap="round" opacity="0.5"/>

      {/* Cheekbone highlight */}
      <ellipse cx="40" cy="46" rx="4.5" ry="6" fill={hi} opacity="0.32" transform="rotate(-18 40 46)"/>
      {/* Cheek hollow on shadow side */}
      <ellipse cx="61" cy="48" rx="3.6" ry="5.5" fill={deep} opacity="0.3" transform="rotate(16 61 48)"/>

      {/* Lips — full classical mouth */}
      <path d="M44 58 Q47 56.6 50 57.4 Q53 56.6 56 58 Q53 60.4 50 60 Q47 60.4 44 58Z" fill={mid}/>
      <path d="M44 58 Q50 57 56 58 Q50 58.6 44 58Z" fill={deep} opacity="0.6"/>
      <path d="M46 60 Q50 61.4 54 60" fill="none" stroke={deep} strokeWidth="1" strokeLinecap="round" opacity="0.4"/>

      {/* Jaw / chin definition */}
      <path d="M42 58 Q45 64 50 65 Q55 64 58 58 Q54 62 50 62.5 Q46 62 42 58Z" fill={deep} opacity="0.28"/>
      <ellipse cx="50" cy="62" rx="3" ry="2" fill={hi} opacity="0.22"/>

      {beard}
      {hairFront}

      {/* Soft rim light along the lit edge of the head */}
      <path d="M50 18 Q34 19 31 38" fill="none" stroke={hi} strokeWidth="1.6" strokeLinecap="round" opacity="0.4"/>

      {/* Gilded outline for the human player */}
      {gilded && <path d="M50 18 Q68 18 70 40 Q71 52 62 60 Q56 64 50 64 Q44 64 38 60 Q29 52 30 40 Q32 18 50 18Z"
        fill="none" stroke="#F0C96A" strokeWidth="0.9" opacity="0.5"/>}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// DECK UTILITIES
// ─────────────────────────────────────────────────────────
function newShuffledDeck() {
  const arr = [];
  for (const s of SUITS) for (const r of RANKS) arr.push({ rank: r, suit: s });
  for (let i = arr.length - 1; i > 0; i--) {
    const j = 0 | Math.random() * (i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Each hand gets fresh, independent odds: drawFresh returns a card from a brand new shuffled deck.
// Sequential draw is used for the initial dealing pass (one continuous deal from a stable shuffle).
function useDeck() {
  const s = useRef({ deck: newShuffledDeck(), idx: 0 });
  const draw = useCallback(() => {
    if (s.current.idx >= s.current.deck.length) {
      s.current.deck = newShuffledDeck();
      s.current.idx = 0;
    }
    return s.current.deck[s.current.idx++];
  }, []);
  const reshuffle = useCallback(() => {
    s.current.deck = newShuffledDeck();
    s.current.idx = 0;
  }, []);
  // drawFresh: brand-new full-deck shuffle, return top card. Use for each hit so every hand has equal odds.
  const drawFresh = useCallback(() => {
    const d = newShuffledDeck();
    return d[0];
  }, []);
  return { draw, drawFresh, reshuffle };
}

// ─────────────────────────────────────────────────────────
// SHARED STYLES — premium casino aesthetic
// ─────────────────────────────────────────────────────────
const gBtn = { padding:"14px 26px", borderRadius:14, border:"none", background:"linear-gradient(160deg,#8A6418 0%,#D4A843 38%,#F4D27A 62%,#C99536 100%)", color:"#1A0E00", fontFamily:"'DM Sans',sans-serif", fontSize:"1rem", fontWeight:700, letterSpacing:"0.05em", boxShadow:"0 6px 22px rgba(212,168,67,0.42), inset 0 1px 0 rgba(255,240,200,0.55), inset 0 -1px 0 rgba(80,40,0,0.35)", cursor:"pointer", transition:"transform 0.12s ease, box-shadow 0.12s ease" };
const sBtn = { padding:"14px 22px", borderRadius:14, background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(255,255,255,0.16)", color:"rgba(245,237,216,0.78)", fontFamily:"'DM Sans',sans-serif", fontSize:"1rem", fontWeight:500, letterSpacing:"0.03em", cursor:"pointer", backdropFilter:"blur(8px)", transition:"background 0.15s ease, border-color 0.15s ease" };
const dBtn = { ...gBtn, background:"linear-gradient(160deg,#6F0C0C 0%,#C0392B 42%,#E74C3C 70%,#A12318 100%)", color:"#FFFAF5", boxShadow:"0 6px 22px rgba(231,76,60,0.42), inset 0 1px 0 rgba(255,200,200,0.4), inset 0 -1px 0 rgba(60,8,8,0.4)" };
const pBtn = { ...gBtn, background:"linear-gradient(160deg,#3D1466 0%,#7B2FBE 42%,#9B59B6 70%,#5C2392 100%)", color:"#FFF9FF", boxShadow:"0 6px 22px rgba(155,89,182,0.42), inset 0 1px 0 rgba(220,200,255,0.4), inset 0 -1px 0 rgba(40,10,60,0.4)" };
const secLbl = { fontSize:"0.7rem", letterSpacing:"0.12em", color:"rgba(212,168,67,0.7)", textTransform:"uppercase", fontWeight:600, marginBottom:8 };
const inp = { background:"rgba(0,0,0,0.35)", border:"1.5px solid rgba(212,168,67,0.22)", borderRadius:12, padding:"14px 16px", color:"#F5EDD8", fontFamily:"'DM Sans',sans-serif", fontSize:"1rem", fontWeight:500, width:"100%" };
const lbl = { fontSize:"0.7rem", letterSpacing:"0.12em", color:"rgba(212,168,67,0.7)", textTransform:"uppercase", fontWeight:600 };

// ─────────────────────────────────────────────────────────
// PERSONALITY COMMENTS
// ─────────────────────────────────────────────────────────
const COMMENTS = {
  goodHand: ["Oh we are COOKING right now.", "Pack it up boys, I already won.", "This hand is illegal in 12 states.", "I would bet my house on this. And I like my house.", "I have never felt more alive.", "Someone call an ambulance. For the other players.", "This is the hand my mother dreamed about.", "I should be charging admission for this.", "The deck owes me money and just paid up."],
  badHand: ["What in the actual—", "I have been personally attacked by this deck.", "My ancestors are ashamed.", "Do I even play this? Do I just leave?", "The audacity of these cards.", "This is a personal foul against me.", "The dealer hates me. Specifically me.", "I'd rather draw cards from the trash.", "These cards are an insult to playing cards.", "Did someone shuffle this with a blender?"],
  doink: ["NOOOOOOO. NOOOOOOO. NOOOOOO.", "I need everyone to stop looking at me.", "I'm not crying. You're crying.", "Delete my account. Burn this table.", "I am going to walk directly into the ocean.", "This is fine. Everything is fine. It's NOT fine."],
  mythical: ["I AM A GOLDEN GOD.", "Tattoo this moment on my body.", "That just happened. THAT JUST HAPPENED.", "I would like to thank my parents for this hand.", "Mythical? More like INEVITABLE."],
  doinkBetHit: ["I called my shot. I called it!", "The doink prophet has arrived.", "I bet on chaos and chaos delivered.", "The audacity to not only doink but BET on it."],
  win: ["That's what I thought.", "Easy money. EASY money.", "Thank you, thank you very much.", "You love to see it. I love to see it."],
  miss: ["Respectable. I can live with that.", "The cards have spoken. I disagree.", "I'll take the moral victory.", "Okay. Fine. Whatever."],
};
const rando = arr => arr[0 | Math.random() * arr.length];
const getComment = type => rando(COMMENTS[type] || COMMENTS.miss);

// ─────────────────────────────────────────────────────────
// HAND VALUE HELPER
// ─────────────────────────────────────────────────────────
function handValue(a, b, pot) {
  const sp = spreadOf(a, b);
  const winProb = sp >= 2 ? (sp - 1) / 12 : 0;
  const mythBonus = isMythical(a, b) ? 0.3 : 0;
  const quality = winProb + mythBonus;
  const base = Math.max(2, Math.floor(pot * quality * 0.8));
  return { quality, base };
}

// ─────────────────────────────────────────────────────────
// FIX #10: calcOdds with comment explaining deck assumption
// FIX #13: no tiny font on inputs (font sizes kept ≥ 1rem on inputs)
// ─────────────────────────────────────────────────────────
function calcOdds(a, b) {
  const lo = Math.min(RV[a.rank], RV[b.rank]);
  const hi = Math.max(RV[a.rank], RV[b.rank]);
  const sp = hi - lo;
  // 52 cards minus your 2 = 50 remaining.
  const total = 50;
  const hits = Math.max(0, (sp - 1) * 4);
  // For doink count: there are 4 cards of each endpoint rank in a full deck,
  // BUT you already hold one of each. So doink-matching cards remaining =
  //   same-rank hand → 4 of that rank − 2 in hand = 2
  //   different ranks → (4 + 4) − 2 in hand = 6
  const sameRank = sp === 0;
  const doinks = sameRank ? 2 : 6;
  const hitPct = Math.round(hits / total * 100);
  const doinkPct = Math.round(doinks / total * 100);
  const missPct = Math.max(0, 100 - hitPct - doinkPct);
  return { hitPct, doinkPct, missPct, sp, mythical: sp === 2 };
}

// Recommend an action based on cards alone. Pure helper for the UI nudge.
function getRecommendation(a, b) {
  if (!a || !b) return null;
  const lo = Math.min(RV[a.rank], RV[b.rank]);
  const hi = Math.max(RV[a.rank], RV[b.rank]);
  const sp = hi - lo;
  // EV per $1 on spread bet ≈ hitProb − doinkProb (since miss = lose bet, doink = lose 2x)
  // Actually: EV = hitProb*1 − doinkProb*1 − missProb*0... wait, miss DOES lose the bet.
  // Re-derive: EV = hitProb*(+1) + doinkProb*(-1) + missProb*(-1) = hitProb − 1 + missProb*0... no.
  // Simplest: outcome*1 if hit, -1 if miss, -1 if doink (extra penalty already in -1).
  // EV per $1 = hitProb − (1 − hitProb) = 2*hitProb − 1.
  // sp 1 → hit 0%, EV = -1
  // sp 4 → hit 24%, EV = -0.52
  // sp 7 → hit 48%, EV = -0.04
  // sp 8 → hit 56%, EV = +0.12
  // sp 10 (A-J) → hit 72%, EV = +0.44
  if (sp === 2) return { label: "✨ Mythical available", color: "#9B59B6" };
  if (sp === 0) return { label: "Pass — same rank", color: "rgba(245,237,216,0.55)" };
  if (sp <= 2) return { label: "Pass — too narrow", color: "rgba(245,237,216,0.55)" };
  if (sp <= 4) return { label: "Risky — small bet at most", color: "#E67E22" };
  if (sp <= 6) return { label: "Borderline — small spread bet", color: "#F0C96A" };
  if (sp <= 8) return { label: "Bet Spread — good odds", color: "#F0C96A" };
  return { label: "Bet Spread — strong hand", color: "#27AE60" };
}

// ─────────────────────────────────────────────────────────
// SEAT POSITIONS
// ─────────────────────────────────────────────────────────
function getSeatPositions(players, landscape) {
  // Layout policy:
  //   The human sits at the TOP (head) of the table.
  //   Bots wrap down the left side, around the bottom, and up the right side.
  //   The table is a TALL vertical capsule, so the seat ellipse uses a small
  //   horizontal radius and a large vertical radius.
  //
  // Coordinate system: x,y in percent of the table area.
  //   deg=90 → bottom, deg=270 → top.
  const pos = {};
  const humans = players.filter(p => !p.isBot);
  const bots = players.filter(p => p.isBot);

  // The table capsule is ~86vw wide and ~116vw tall (portrait). Seats ride
  // ON the rail, so the seat ellipse must match the capsule's aspect, not the
  // container's. These radii are % of the table-area container; they're tuned
  // so seats sit on the padded rail and every seat stays fully on-screen.
  const rx = landscape ? 40 : 44;   // wide enough to reach the side rail
  const ry = landscape ? 40 : 41;   // tall, but kept off the very top/bottom edges

  // Clamp helper — keep every seat within the visible container with margin
  // for the nameplate + cards (which extend above/below the anchor point).
  const clampX = v => Math.max(12, Math.min(88, v));
  const clampY = v => Math.max(13, Math.min(90, v));

  // Human(s) along the top arc
  if (humans.length > 0) {
    const n = humans.length;
    const span = Math.min(80, (n - 1) * 50);
    humans.forEach((p, i) => {
      const deg = n === 1 ? 270 : (270 - span / 2) + (span / (n - 1)) * i;
      const rad = deg * Math.PI / 180;
      pos[p.id] = { x: clampX(50 + rx * Math.cos(rad)), y: clampY(50 + ry * Math.sin(rad)) };
    });
  }

  // Bots wrap the rest of the capsule. Arc centered on the bottom (deg=90),
  // widening with bot count so 7 bots ring the table evenly without crowding
  // the human at the top.
  if (bots.length > 0) {
    const n = bots.length;
    //  1→0°  2→100°  3→160°  4→210°  5→240°  6→262°  7→276°
    const spanByCount = [0, 0, 100, 160, 210, 240, 262, 276, 288];
    const span = spanByCount[Math.min(n, spanByCount.length - 1)];
    bots.forEach((p, i) => {
      const deg = n === 1 ? 90 : (90 - span / 2) + (span / (n - 1)) * i;
      const rad = deg * Math.PI / 180;
      const sinV = Math.sin(rad), cosV = Math.cos(rad);
      // Pull the bottom-most seats up a touch so they clear the controls.
      const bottomPull = sinV > 0 ? 1 - sinV * 0.10 : 1;
      pos[p.id] = {
        x: clampX(50 + rx * cosV),
        y: clampY(50 + ry * sinV * bottomPull),
      };
    });
  }

  return pos;
}

// ─────────────────────────────────────────────────────────
// CARD & PLACEHOLDER
// ─────────────────────────────────────────────────────────
function Card({ card, faceDown = false, small = false, animClass = "deal-anim", delay = 0, glow = false, scale = 1 }) {
  if (!card && !faceDown) return <Placeholder small={small} scale={scale} />;
  const W = (small ? 46 : 82) * scale, H = (small ? 64 : 116) * scale;
  const isRed = RED.has(card?.suit);
  const color = faceDown ? "#A07030" : isRed ? "#C0392B" : "#0D0D1A";
  // Scale typography and padding with size so the card looks proportional
  const rankSize = (small ? 0.78 : 1.25) * scale;
  const suitSize = (small ? 0.7 : 1.05) * scale;
  const bigSuitSize = (small ? 1.1 : 2) * scale;
  return (
    <div className={faceDown ? "" : animClass} style={{
      animationDelay: `${delay}s`, width: W, height: H, borderRadius: (small ? 8 : 11) * scale, flexShrink: 0,
      background: faceDown ? "linear-gradient(145deg,#1C0A02,#0F0601)" : "linear-gradient(160deg,#FFFFFF 0%,#F8F3E4 100%)",
      border: glow ? "2.5px solid #D4A843" : faceDown ? "1px solid #5A3010" : "1px solid rgba(0,0,0,0.12)",
      boxShadow: glow ? "0 0 20px rgba(212,168,67,0.65),0 6px 20px rgba(0,0,0,0.8)" : "0 4px 16px rgba(0,0,0,0.75),0 1px 3px rgba(0,0,0,0.3)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: `${(small ? 3 : 5) * scale}px ${(small ? 4 : 7) * scale}px`, userSelect: "none",
    }}>
      {faceDown
        ? <div style={{ flex:1, borderRadius: (small?5:8)*scale, background:"repeating-linear-gradient(45deg,rgba(140,100,40,0.1) 0,rgba(140,100,40,0.1) 1px,transparent 1px,transparent 9px)", border:"1px solid rgba(160,112,48,0.18)", display:"flex",alignItems:"center",justifyContent:"center" }}>
            <span style={{fontSize:`${bigSuitSize}rem`, opacity:0.2}}>◆</span>
          </div>
        : <>
          <div style={{ lineHeight:1 }}>
            <div style={{ fontSize:`${rankSize}rem`, fontWeight:800, color, lineHeight:1, fontFamily:"'DM Sans',sans-serif" }}>{card.rank}</div>
            <div style={{ fontSize:`${suitSize}rem`, color, lineHeight:1 }}>{card.suit}</div>
          </div>
          <div style={{ fontSize:`${bigSuitSize}rem`, color, textAlign:"center", lineHeight:1 }}>{card.suit}</div>
          <div style={{ lineHeight:1, textAlign:"right" }}>
            <div style={{ fontSize:`${rankSize}rem`, fontWeight:800, color, lineHeight:1, fontFamily:"'DM Sans',sans-serif" }}>{card.rank}</div>
            <div style={{ fontSize:`${suitSize}rem`, color, lineHeight:1 }}>{card.suit}</div>
          </div>
        </>
      }
    </div>
  );
}
function Placeholder({ small, scale = 1 }) {
  const W = (small ? 46 : 82) * scale, H = (small ? 64 : 116) * scale;
  return <div style={{ width:W, height:H, borderRadius: (small?8:11)*scale, background:"rgba(255,255,255,0.03)", border:"1.5px dashed rgba(255,255,255,0.1)", flexShrink:0 }} />;
}

// ─────────────────────────────────────────────────────────
// CHIP PILE
// ─────────────────────────────────────────────────────────
function ChipPile({ amount }) {
  if (!amount) return null;
  const COLORS = { 1: "#bbb", 2: "#999", 5: "#e74c3c", 10: "#2980b9", 25: "#27ae60", 50: "#8e44ad", 100: "#c9a84c", 500: "#222" };
  const DENOMS = [500, 100, 50, 25, 10, 5, 2, 1];
  const chips = []; let rem = amount;
  for (const d of DENOMS) { while (rem >= d && chips.length < 10) { chips.push(d); rem -= d; } }
  return (
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-end", maxWidth: 80 }}>
      {chips.map((d, i) => (
        <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: COLORS[d] || "#888", border: "2px dashed rgba(255,255,255,0.35)", boxShadow: "0 2px 4px rgba(0,0,0,0.5)", animation: `chipBob ${0.9 + i * 0.07}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// POT DISPLAY
// ─────────────────────────────────────────────────────────
// Tween a number between renders. Animates over `duration` ms whenever `value` changes.
function AnimatedNumber({ value, duration = 700, style }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const startRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) { setDisplay(to); return; }
    startRef.current = performance.now();
    const step = (now) => {
      const t = Math.min(1, (now - startRef.current) / duration);
      // easeOutQuart for a satisfying decel
      const eased = 1 - Math.pow(1 - t, 4);
      const cur = Math.round(from + (to - from) * eased);
      setDisplay(cur);
      if (t < 1) rafRef.current = requestAnimationFrame(step);
      else { fromRef.current = to; rafRef.current = null; }
    };
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(step);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [value, duration]);

  return <span style={style}>${display}</span>;
}

function PotDisplay({ pot, potAnim, delta, landscape }) {
  return (
    <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", zIndex:15, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
      <ChipPile amount={pot} />
      <div className={potAnim || ""} style={{
        background:"linear-gradient(180deg, rgba(8,16,10,0.96) 0%, rgba(0,0,0,0.84) 100%)",
        backdropFilter:"blur(14px)",
        border:"2px solid rgba(212,168,67,0.62)",
        borderRadius:22,
        padding:landscape?"10px 30px":"13px 34px",
        textAlign:"center",
        boxShadow:"0 14px 48px rgba(0,0,0,0.88), 0 0 36px rgba(212,168,67,0.22), inset 0 1px 0 rgba(240,201,106,0.25), inset 0 0 0 1px rgba(0,0,0,0.4)",
        position:"relative",
      }}>
        {/* Inner subtle gold ring */}
        <div aria-hidden="true" style={{ position:"absolute", inset:3, borderRadius:18, border:"1px solid rgba(212,168,67,0.18)", pointerEvents:"none" }}/>
        <div style={{ fontSize:"0.6rem", letterSpacing:"0.24em", color:"rgba(212,168,67,0.78)", textTransform:"uppercase", fontWeight:700, marginBottom:4, position:"relative" }}>The Pot</div>
        <AnimatedNumber value={pot} duration={700} style={{ fontFamily:"'Playfair Display',serif", fontSize:landscape?"1.95rem":"2.35rem", color:"#F0C96A", lineHeight:1, fontWeight:900, textShadow:"0 0 28px rgba(212,168,67,0.72), 0 2px 0 rgba(0,0,0,0.5)", display:"inline-block", position:"relative" }}/>
      </div>
      {delta !== null && delta !== 0 && (
        <div style={{ position:"absolute", top:-36, left:"50%", transform:"translateX(-50%)", fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", fontWeight:800, pointerEvents:"none", color:delta>0?"#E74C3C":"#27AE60", textShadow:delta>0?"0 0 18px rgba(231,76,60,0.95)":"0 0 18px rgba(39,174,96,0.95)", animation:delta>0?"floatDown 1s ease forwards":"floatUp 1s ease forwards", whiteSpace:"nowrap" }}>
          {delta > 0 ? `+$${delta}` : `-$${Math.abs(delta)}`}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// AVATAR — premium player medallion
// ─────────────────────────────────────────────────────────
function Avatar({ seed = 0, size = 36, active = false, name, isHuman = false }) {
  const cfg = getAvatarConfig(seed, name, isHuman);
  const [rimLight, rimMid, rimDark] = cfg.rim;
  const [innerLight, innerDark] = cfg.inner;
  // Rim thickness scales gently with size
  const rim = Math.max(2.5, size * 0.085);
  // Active state: refined gold ring + soft halo (not a loud glow)
  const ring = active
    ? `0 0 0 1.5px #F4D27A, 0 0 12px rgba(212,168,67,0.45), 0 4px 12px rgba(0,0,0,0.7)`
    : `0 3px 10px rgba(0,0,0,0.65)`;
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", flexShrink: 0,
      position: "relative",
      background: `conic-gradient(from 210deg, ${rimDark}, ${rimLight} 25%, ${rimMid} 50%, ${rimDark} 72%, ${rimLight} 100%)`,
      boxShadow: ring,
      transition: "box-shadow .3s ease",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Inner disc with the bust */}
      <div style={{
        position: "absolute", inset: rim, borderRadius: "50%",
        background: `radial-gradient(ellipse at 50% 26%, ${innerLight} 0%, ${innerDark} 80%)`,
        boxShadow: "inset 0 2px 6px rgba(0,0,0,0.75), inset 0 -1px 3px rgba(255,255,255,0.05)",
        overflow: "hidden",
        display: "flex", alignItems: "flex-end", justifyContent: "center",
      }}>
        {/* Soft top light behind the bust */}
        <div aria-hidden="true" style={{
          position: "absolute", top: "-20%", left: "50%", transform: "translateX(-50%)",
          width: "120%", height: "70%",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.12), transparent 70%)",
          pointerEvents: "none",
        }}/>
        {/* The bust fills the lower portion of the disc */}
        <div style={{ width: "128%", height: "128%", marginBottom: "-12%" }}>
          <GreekBust marble={cfg.marble} style={cfg.bustStyle} gilded={cfg.isHuman}/>
        </div>
      </div>
      {/* Top bevel highlight on the rim */}
      <div aria-hidden="true" style={{
        position: "absolute", top: rim * 0.5, left: "24%", right: "24%", height: "22%",
        borderRadius: "50%",
        background: "linear-gradient(180deg, rgba(255,255,255,0.22), transparent)",
        pointerEvents: "none",
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CHIP SELECTOR
// ─────────────────────────────────────────────────────────
function ChipSelector({ denoms, max, value, onChange }) {
  const COLORS = { 1:"#9E9E9E",2:"#757575",5:"#E74C3C",10:"#2980B9",25:"#27AE60",50:"#8E44AD",100:"#D4A843",500:"#2C2C2C" };
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, maxWidth:340, margin:"0 auto" }}>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
        {denoms.filter(d => d <= max).map(d => (
          <button key={d} onClick={() => onChange(Math.min(value + d, max))} style={{ width:52, height:52, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", background:COLORS[d]||"#555", color:"#fff", fontWeight:700, fontSize:"0.75rem", boxShadow:"0 4px 12px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.2)" }}>+{d}</button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16, background:"rgba(0,0,0,0.3)", borderRadius:16, padding:"10px 20px", border:"1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => onChange(0)} style={{ width:36, height:36, borderRadius:"50%", background:"rgba(231,76,60,0.15)", border:"1.5px solid rgba(231,76,60,0.4)", color:"#E74C3C", fontSize:"1rem", fontWeight:700, display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", color:"#F0C96A", minWidth:80, textAlign:"center", fontWeight:700 }}>${value}</div>
        <button onClick={() => onChange(max)} style={{ padding:"7px 14px", borderRadius:10, fontSize:"0.85rem", fontWeight:600, background:"rgba(212,168,67,0.15)", border:"1.5px solid rgba(212,168,67,0.4)", color:"#D4A843" }}>Max</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SHEET (bottom drawer / side panel)
// ─────────────────────────────────────────────────────────
function Sheet({ title, subtitle, children, onClose, landscape }) {
  const cls = landscape ? "sheet-right" : "sheet-up";
  const inner = (
    <>
      <div style={{ width:landscape?3:44, height:landscape?44:4, background:"rgba(255,255,255,0.14)", borderRadius:3, margin:"0 auto 22px" }} />
      {title && <div style={{ fontFamily:"'Playfair Display',serif", fontSize:landscape?"1.1rem":"1.25rem", fontWeight:700, color:"#F0C96A", textAlign:"center", marginBottom:subtitle?8:20, letterSpacing:"0.01em" }}>{title}</div>}
      {subtitle && <div style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.5)", textAlign:"center", marginBottom:20, lineHeight:1.55 }}>{subtitle}</div>}
      {children}
    </>
  );
  if (landscape) {
    return (
      <div style={{ position:"fixed", inset:0, zIndex:60 }} onClick={onClose}>
        <div className={cls} onClick={e => e.stopPropagation()} style={{ position:"fixed", right:0, top:0, bottom:0, width:"min(88vw,380px)", background:"linear-gradient(175deg,#0A1A0E,#060D08)", borderLeft:"1.5px solid rgba(212,168,67,0.2)", padding:"20px 22px 48px", overflowY:"auto", boxShadow:"-16px 0 60px rgba(0,0,0,0.95)", zIndex:60 }}>
          {inner}
        </div>
      </div>
    );
  }
  return (
    <div style={{ position:"fixed", inset:0, zIndex:60, display:"flex", flexDirection:"column", justifyContent:"flex-end" }} onClick={onClose}>
      <div className={cls} onClick={e => e.stopPropagation()} style={{ background:"linear-gradient(175deg,#0C1A10,#060D08)", borderTop:"1.5px solid rgba(212,168,67,0.2)", borderRadius:"24px 24px 0 0", padding:`20px 22px calc(52px + env(safe-area-inset-bottom))`, maxHeight:"90vh", overflowY:"auto", boxShadow:"0 -16px 60px rgba(0,0,0,0.95)" }}>
        {inner}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HINT BAR
// ─────────────────────────────────────────────────────────
function HintBar({ cards }) {
  if (!cards || cards.length < 2) return null;
  const { hitPct, doinkPct, missPct, mythical } = calcOdds(cards[0], cards[1]);
  return (
    <div style={{ marginTop:10, width:"100%" }}>
      <div style={{ display:"flex", height:8, borderRadius:4, overflow:"hidden", gap:2 }}>
        <div style={{ flex:hitPct, background:"#27AE60" }} />
        <div style={{ flex:doinkPct, background:"#E74C3C" }} />
        <div style={{ flex:missPct, background:"rgba(255,255,255,0.12)" }} />
      </div>
      <div style={{ display:"flex", gap:12, justifyContent:"center", marginTop:6, flexWrap:"wrap" }}>
        <span style={{ fontSize:"0.72rem", color:"#27AE60", fontWeight:600 }}>✓ {hitPct}%</span>
        <span style={{ fontSize:"0.72rem", color:"#E74C3C", fontWeight:600 }}>💥 {doinkPct}%</span>
        <span style={{ fontSize:"0.72rem", color:"rgba(245,237,216,0.38)", fontWeight:500 }}>● {missPct}%</span>
        {mythical && <span style={{ fontSize:"0.72rem", color:"#9B59B6", fontWeight:700 }}>✨ 12× avail!</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// OFFER BUILDER
// ─────────────────────────────────────────────────────────
function OfferBuilder({ denoms, maxChips, onConfirm, onCancel, label = "Make Offer" }) {
  const [chips, setChips] = useState(0);
  const [pct, setPct] = useState(0);
  const valid = chips > 0 || pct > 0;
  const desc = chips > 0 && pct > 0 ? `$${chips} + ${pct}% of winnings` : chips > 0 ? `$${chips} upfront` : pct > 0 ? `${pct}% of winnings` : "";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={secLbl}>Cash Upfront</div>
        <ChipSelector denoms={denoms} max={maxChips} value={chips} onChange={setChips} />
      </div>
      <div>
        <div style={secLbl}>% of Winnings</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
          {[0, 10, 15, 20, 25, 30, 50].map(p => (
            <button key={p} onClick={() => setPct(p)} style={{ padding:"8px 12px", borderRadius:10, fontSize:"0.85rem", fontWeight:600, background:pct===p?"rgba(212,168,67,0.2)":"rgba(255,255,255,0.06)", border:pct===p?"1.5px solid #D4A843":"1.5px solid rgba(255,255,255,0.1)", color:pct===p?"#D4A843":"rgba(245,237,216,0.55)" }}>
              {p === 0 ? "None" : `${p}%`}
            </button>
          ))}
        </div>
      </div>
      {valid && <div style={{ textAlign:"center", fontSize:"1rem", fontWeight:700, color:"#F0C96A", padding:"10px 14px", background:"rgba(212,168,67,0.1)", borderRadius:12, border:"1px solid rgba(212,168,67,0.25)" }}>{desc}</div>}
      <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:4 }}>
        <button onClick={() => valid && onConfirm({ chips, pct, desc, kind: chips > 0 && pct > 0 ? "hybrid" : chips > 0 ? "chips" : "equity" })} disabled={!valid} style={{ ...gBtn, opacity:valid?1:0.4 }}>{label}</button>
        <button onClick={onCancel} style={sBtn}>Cancel</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TAP TO REVEAL — bet placed, player taps deck to flip hit card
// ─────────────────────────────────────────────────────────
function TapToReveal({ slot, amount, type, onReveal }) {
  const label = type === "doink" ? "💥 Doink Bet" : type === "mythical" ? "✨ Mythical" : type === "blind" ? "🎰 Blind" : "Spread";
  const [a, b] = slot.cards || [];
  return (
    <div style={{ position:"fixed", inset:0, zIndex:240, background:"radial-gradient(ellipse at center,rgba(8,16,10,0.92),rgba(2,5,3,0.98))", backdropFilter:"blur(8px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ marginBottom:24, textAlign:"center" }}>
        <div style={{ fontSize:"0.72rem", color:"rgba(212,168,67,0.55)", letterSpacing:"0.18em", fontWeight:600, textTransform:"uppercase", marginBottom:8 }}>{label} · ${amount}</div>
        {a && b && (
          <div style={{ display:"flex", gap:14, justifyContent:"center", marginBottom:16 }}>
            <Card card={a} glow/>
            <Card card={b} glow/>
          </div>
        )}
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", color:"#F0C96A", fontWeight:700, marginBottom:6, textShadow:"0 0 20px rgba(212,168,67,0.4)" }}>Tap the deck</div>
        <div style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.55)", fontWeight:400 }}>Reveal your hit card</div>
      </div>
      {/* The deck */}
      <button onClick={onReveal} style={{ background:"transparent", border:"none", padding:0, cursor:"pointer" }}>
        <div className="glow-active" style={{ position:"relative", width:130, height:184, borderRadius:14 }}>
          {/* Stacked deck back illusion */}
          {[0,1,2].map(i => (
            <div key={i} style={{
              position:"absolute",
              inset:0,
              transform:`translate(${i*3}px,${-i*3}px)`,
              background:"linear-gradient(145deg,#1C0A02,#0F0601)",
              border:"1.5px solid #5A3010",
              borderRadius:14,
              boxShadow:"0 8px 24px rgba(0,0,0,0.85),0 2px 4px rgba(0,0,0,0.5)",
            }}>
              {i === 2 && (
                <div style={{ position:"absolute", inset:6, borderRadius:10, border:"1px solid rgba(160,112,48,0.25)", background:"repeating-linear-gradient(45deg,rgba(140,100,40,0.12) 0,rgba(140,100,40,0.12) 1px,transparent 1px,transparent 9px)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", fontWeight:900, color:"#D4A843", textShadow:"0 0 16px rgba(212,168,67,0.6)", letterSpacing:"0.05em" }}>D</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </button>
    </div>
  );
}
function ReplenishOverlay() {
  return (
    <div role="alert" aria-live="assertive"
      style={{
        position:"fixed", inset:0, zIndex:300,
        display:"flex", alignItems:"center", justifyContent:"center",
        background:"radial-gradient(ellipse at center, rgba(20,40,24,0.96) 0%, rgba(4,10,6,0.98) 60%, rgba(2,5,3,1) 100%)",
        backdropFilter:"blur(16px)",
        pointerEvents:"auto",
      }}>
      {/* Decorative ring */}
      <div aria-hidden="true" style={{
        position:"absolute", width:"min(80vw,420px)", height:"min(80vw,420px)",
        borderRadius:"50%",
        background:"radial-gradient(circle, rgba(212,168,67,0.18) 0%, transparent 65%)",
        animation:"breathe 2.4s ease-in-out infinite",
      }}/>
      <div className="pop" style={{ textAlign:"center", position:"relative", padding:"30px 40px" }}>
        <div style={{ fontSize:"5.2rem", marginBottom:14, filter:"drop-shadow(0 0 24px rgba(212,168,67,0.6))" }}>♻️</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(3.2rem,13vw,5rem)", fontWeight:900, color:"#F0C96A", textShadow:"0 0 48px rgba(212,168,67,0.9), 0 0 96px rgba(212,168,67,0.55)", letterSpacing:"0.06em", lineHeight:1 }}>REPLENISH</div>
        <div aria-hidden="true" style={{ height:1.5, width:120, margin:"18px auto 16px", background:"linear-gradient(90deg, transparent, rgba(212,168,67,0.7), transparent)" }}/>
        <div style={{ fontSize:"1.05rem", color:"rgba(245,237,216,0.82)", fontWeight:500, maxWidth:300, margin:"0 auto", lineHeight:1.55 }}>The pot is empty.<br/>Everyone pays in.</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DOINK FULL SCREEN — takes over for 1s on doink
// ─────────────────────────────────────────────────────────
function DoinkFullScreen({ name }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:285, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", background:"radial-gradient(ellipse at center,rgba(231,76,60,0.42),rgba(231,76,60,0.08) 70%)", animation:"popIn .25s cubic-bezier(.16,1,.3,1) both" }}>
      <div className="big-shake" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(4rem,18vw,8rem)", fontWeight:900, color:"#fff", textShadow:"0 0 30px rgba(231,76,60,1),0 0 80px rgba(231,76,60,0.9),0 8px 0 rgba(0,0,0,0.5)", letterSpacing:"0.04em", lineHeight:1 }}>DOINK!</div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#fff", fontWeight:700, marginTop:12, textShadow:"0 0 24px rgba(231,76,60,0.95)" }}>💥 {name} 💥</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HISTORY STRIP — recent turn results, top of screen
// ─────────────────────────────────────────────────────────
function HistoryStrip({ history, landscape }) {
  if (!history || history.length === 0) return null;
  const recent = history.slice(-6);
  return (
    <div style={{
      position:"fixed",
      bottom: `calc(env(safe-area-inset-bottom) + 4px)`,
      left:"50%", transform:"translateX(-50%)",
      zIndex:25,
      display:"flex", gap:5, padding:"6px 10px",
      background:"linear-gradient(180deg, #060D08 0%, #030806 100%)",
      border:"1px solid rgba(212,168,67,0.22)",
      borderRadius:14,
      maxWidth:"94%", overflow:"hidden",
      boxShadow:"0 -4px 18px rgba(0,0,0,0.7), inset 0 1px 0 rgba(212,168,67,0.08)",
      pointerEvents:"none",
    }}>
      {recent.map((h, i) => (
        <div key={i} className="fade-up" style={{
          display:"flex", alignItems:"center", gap:4,
          padding:"3px 8px", borderRadius:10,
          background: h.outcome==="win"  ? "#0E3A1E"
                   : h.outcome==="doink" ? "#4A130E"
                   : h.outcome==="pass"  ? "#1A201D"
                   :                       "#251610",
          border: `1px solid ${h.outcome==="win"?"rgba(39,174,96,0.5)":h.outcome==="doink"?"rgba(231,76,60,0.55)":h.outcome==="pass"?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.16)"}`,
        }}>
          <span style={{ fontSize:"0.65rem", color:h.outcome==="win"?"#27AE60":h.outcome==="doink"?"#E74C3C":"rgba(245,237,216,0.62)", fontWeight:700, whiteSpace:"nowrap" }}>{h.name}</span>
          <span style={{ fontSize:"0.65rem", color:"rgba(245,237,216,0.85)", fontWeight:600, whiteSpace:"nowrap" }}>{h.outcome==="win"?`+$${h.amount}`:h.outcome==="doink"?`💥-$${h.amount}`:h.outcome==="miss"?`-$${h.amount}`:"pass"}</span>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────
function CommentToast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, []);
  return (
    <div className="pop" style={{ position:"fixed", top:"calc(env(safe-area-inset-top) + 72px)", left:"50%", transform:"translateX(-50%)", zIndex:200, maxWidth:300, background:"rgba(8,16,10,0.96)", backdropFilter:"blur(12px)", border:"1px solid rgba(212,168,67,0.3)", borderRadius:18, padding:"14px 20px", textAlign:"center", boxShadow:"0 12px 48px rgba(0,0,0,0.85)" }}>
      <div style={{ fontSize:"0.95rem", color:"#F5EDD8", lineHeight:1.5, fontStyle:"italic", fontWeight:400 }}>{msg}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// OUTCOME MODAL
// ─────────────────────────────────────────────────────────
function OutcomeModal({ title, body, color, onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", backdropFilter:"blur(4px)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="pop" style={{ background:"linear-gradient(160deg,#0C1A10,#060D08)", border:`2px solid ${color||"rgba(212,168,67,0.4)"}`, borderRadius:22, padding:"28px 26px", maxWidth:360, width:"100%", textAlign:"center", boxShadow:`0 0 48px ${color||"rgba(212,168,67,0.25)"},0 24px 64px rgba(0,0,0,0.95)` }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:color||"#D4A843", fontWeight:700, marginBottom:14 }}>{title}</div>
        <div style={{ fontSize:"1rem", color:"rgba(245,237,216,0.75)", lineHeight:1.6, marginBottom:24 }}>{body}</div>
        <button onClick={onClose} style={gBtn}>Got it</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// LOG DRAWER
// ─────────────────────────────────────────────────────────
function LogDrawer({ log, landscape }) {
  const [open, setOpen] = useState(false);
  const last = log[log.length - 1];
  const lastColor = last?.type === "doink" ? "#E74C3C" : last?.type === "win" ? "#27AE60" : "rgba(245,237,216,0.6)";
  return (
    <>
      <div onClick={() => setOpen(o => !o)} style={{ flexShrink:0, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(8px)", borderTop:landscape?"none":"1px solid rgba(255,255,255,0.06)", padding:"8px 16px", fontSize:"0.82rem", zIndex:30, minHeight:34, color:lastColor, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", width:landscape?"auto":"100%", cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center", fontWeight:500 }}>
        <span style={{ overflow:"hidden", textOverflow:"ellipsis" }}>{last?.msg || ""}</span>
        <span style={{ flexShrink:0, marginLeft:10, fontSize:"0.65rem", color:"rgba(255,255,255,0.2)", fontWeight:600 }}>LOG ▲</span>
      </div>
      {open && (
        <div onClick={() => setOpen(false)} style={{ position:"fixed", inset:0, zIndex:50, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} className="sheet-up" style={{ position:"fixed", bottom:0, left:0, right:0, background:"linear-gradient(175deg,#0C1A10,#060D08)", borderTop:"1.5px solid rgba(212,168,67,0.2)", borderRadius:"22px 22px 0 0", padding:`16px 20px calc(28px + env(safe-area-inset-bottom))`, maxHeight:"55vh", overflowY:"auto" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.9rem", color:"#D4A843", fontWeight:700, marginBottom:14, textAlign:"center", letterSpacing:"0.02em" }}>Game Log</div>
            {[...log].reverse().slice(0, 25).map((entry, i) => (
              <div key={i} style={{ fontSize:"0.88rem", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", color:entry.type==="doink"?"#E74C3C":entry.type==="win"?"#27AE60":"rgba(245,237,216,0.65)", fontWeight:entry.type==="doink"||entry.type==="win"?600:400, lineHeight:1.4 }}>
                {entry.msg}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// RULES PAGE
// ─────────────────────────────────────────────────────────
function RulesPage({ onClose }) {
  const sec = (title, body) => (
    <div style={{ marginBottom:28 }}>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"#D4A843", fontWeight:700, marginBottom:8, borderBottom:"1px solid rgba(212,168,67,0.18)", paddingBottom:6 }}>{title}</div>
      <div style={{ fontSize:"0.95rem", lineHeight:1.75, color:"rgba(245,237,216,0.8)" }}>{body}</div>
    </div>
  );
  return (
    <div style={{ position:"fixed", inset:0, background:"linear-gradient(160deg,#0C1A10,#060D08)", zIndex:100, overflowY:"auto", padding:`calc(env(safe-area-inset-top) + 16px) 24px 80px` }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", color:"#D4A843", fontWeight:900, letterSpacing:"0.01em" }}>DOINK</div>
        <button onClick={onClose} style={{ ...sBtn, padding:"10px 18px", fontSize:"0.9rem" }}>← Back</button>
      </div>
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        {sec("The Basics","To start, everyone replenishes the pot. Each player is dealt two cards. On your turn, you bet whether a third 'hit' card will fall between your two cards in value. Aces are low (value 1). Win and the pot pays you 1:1. Miss and your bet goes to the pot.")}
        {sec("DOINK 💥","If your hit card matches the rank of either of your two cards — DOINK. You pay double your bet into the pot. Bet $10 and doink, you owe $20. This is the game.")}
        {sec("Replenish","Whenever the pot hits $0, everyone replenishes immediately and play continues. The game starts the same way.")}
        {sec("Bet Types",<><b style={{color:"#F0C96A"}}>Spread Bet</b> — Hit falls between your cards. Pays 1:1.<br/><br/><b style={{color:"#E74C3C"}}>💥 Doink Bet</b> — Hit MATCHES one of your cards. Pays 7:1.<br/><br/><b style={{color:"#9B59B6"}}>✨ Mythical Split</b> — Cards exactly 2 apart. That one middle card pays 12:1.<br/><br/><b style={{color:"#D4A843"}}>🎰 Blind Bet</b> — Bet before cards are dealt. A hit pays 2:1.</>)}
        {sec("Hand Trading","Buy or sell hands at any point. The buyer plays both their hand AND the bought hand, in original turn order. You collect payment immediately when you sell.")}
        {sec("Insurance","Pay a premium upfront. If you doink, a portion of your penalty is covered.")}
        {sec("Strategy","Wide spreads (A–K) = bet big. Narrow spreads = pass or doink bet. Selling a trash hand for chips beats passing. Position matters — going early in a fat pot differs from going late.")}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────
function Setup({ onStart, onShowTutorial, onBack }) {
  const nH = 1;
  const [nB, setNB] = useState(3);
  const [chips, setChips] = useState(100);
  const [replenish, setReplenish] = useState(1);
  const [denoms, setDenoms] = useState([1, 5, 10, 25, 50, 100]);
  const [name, setName] = useState("");
  const [orientation, setOrientation] = useState("portrait");
  const [hintsDefault, setHintsDefault] = useState(true);
  const [showAdv, setShowAdv] = useState(false);

  const toggleD = d => setDenoms(p => p.includes(d) ? (p.length > 1 ? p.filter(x => x !== d) : p) : [...p, d].sort((a, b) => a - b));
  const valid = nB >= 1 && nB <= 7 && chips >= 10;
  const pill = on => ({ padding:"10px 18px", borderRadius:22, fontSize:"0.9rem", fontWeight:600, background:on?"rgba(212,168,67,0.18)":"rgba(255,255,255,0.05)", border:on?"1.5px solid #D4A843":"1.5px solid rgba(255,255,255,0.1)", color:on?"#D4A843":"rgba(245,237,216,0.45)", transition:"all .15s" });
  const card = { background:"rgba(255,255,255,0.03)", borderRadius:16, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.07)" };

  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:`calc(env(safe-area-inset-top) + 40px) 22px calc(100px + env(safe-area-inset-bottom))` }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:36 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"clamp(3.5rem,14vw,5.5rem)", color:"#D4A843", textShadow:"0 0 50px rgba(212,168,67,0.4),0 4px 0 rgba(0,0,0,0.5)", lineHeight:1, letterSpacing:"0.04em" }}>DOINK</div>
          <div style={{ height:2, background:"linear-gradient(90deg,transparent,#D4A843,transparent)", margin:"14px auto 8px", width:160 }} />
          <div style={{ fontSize:"0.78rem", color:"rgba(212,168,67,0.5)", letterSpacing:"0.2em", fontWeight:600, textTransform:"uppercase" }}>A Card Game of Pure Chaos</div>
        </div>

        <div style={{ width:"100%", maxWidth:420, display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ fontSize:"0.62rem", letterSpacing:"0.22em", color:"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase", textAlign:"center", marginBottom:-2 }}>Quick Setup</div>
          <div style={card}>
            <div style={lbl}>Your Name</div>
            <input value={name} placeholder="Player" onChange={e => setName(e.target.value)} style={{...inp, marginTop:8}}/>
          </div>
          <div style={card}>
            <div style={lbl}>Bot Opponents</div>
            <div style={{fontSize:"0.72rem",color:"rgba(245,237,216,0.32)",marginTop:2,fontWeight:400}}>Pick how crowded the table feels</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
              {[1,2,3,4,5,6,7].map(n => (<button key={n} onClick={() => setNB(n)} style={pill(nB===n)} aria-pressed={nB===n}>{n}</button>))}
            </div>
          </div>
          <div style={card}>
            <div style={lbl}>Starting Stack</div>
            <div style={{fontSize:"0.72rem",color:"rgba(245,237,216,0.32)",marginTop:2,fontWeight:400}}>How many chips each player begins with</div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:10}}>
              {[25,50,100,200,500].map(n => (<button key={n} onClick={() => setChips(n)} style={pill(chips===n)} aria-pressed={chips===n}>${n}</button>))}
            </div>
          </div>

          {/* Advanced collapsible */}
          <button onClick={() => setShowAdv(s => !s)} style={{ background:"rgba(255,255,255,0.02)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:14, padding:"12px 18px", color:"rgba(245,237,216,0.6)", fontSize:"0.85rem", fontWeight:600, display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer" }}>
            <span>Advanced Options</span>
            <span style={{ fontSize:"0.7rem", color:"rgba(212,168,67,0.55)" }}>{showAdv ? "▲ Hide" : "▼ Show"}</span>
          </button>
          {showAdv && (
            <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div style={card}>
                <div style={lbl}>Orientation</div>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button onClick={() => setOrientation("portrait")} style={pill(orientation==="portrait")}>Portrait</button>
                  <button onClick={() => setOrientation("landscape")} style={pill(orientation==="landscape")}>Landscape</button>
                </div>
              </div>
              <div style={card}>
                <div style={lbl}>Probability Hints</div>
                <div style={{fontSize:"0.78rem",color:"rgba(245,237,216,0.3)",marginTop:3,fontWeight:400}}>Shows hit/doink/miss % during your turn</div>
                <div style={{display:"flex",gap:8,marginTop:8}}>
                  <button onClick={() => setHintsDefault(true)} style={pill(hintsDefault)}>On</button>
                  <button onClick={() => setHintsDefault(false)} style={pill(!hintsDefault)}>Off</button>
                </div>
              </div>
              <div style={card}>
                <div style={lbl}>Replenish Amount</div>
                <div style={{fontSize:"0.78rem",color:"rgba(245,237,216,0.3)",marginTop:3,fontWeight:400}}>Paid when the pot hits $0</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  {[1,2,5,10].map(n => (<button key={n} onClick={() => setReplenish(n)} style={pill(replenish===n)}>${n}</button>))}
                </div>
              </div>
              <div style={card}>
                <div style={lbl}>Chip Denominations</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
                  {[1,2,5,10,25,50,100,500].map(d => (<button key={d} onClick={() => toggleD(d)} style={pill(denoms.includes(d))}>${d}</button>))}
                </div>
              </div>
            </div>
          )}

          <button disabled={!valid} onClick={() => {
            const resolvedNames = [name || "Player"];
            const botNames = shuffleBotNames();
            onStart({nH, nB, chips, ante: replenish, denoms, names: resolvedNames, botNames, orientation, hintsDefault});
          }} style={{ padding:"18px", borderRadius:16, border:"none", background:valid?"linear-gradient(145deg,#8A6010,#D4A843,#F0C96A,#D4A843)":"rgba(255,255,255,0.07)", color:valid?"#1A0E00":"rgba(255,255,255,0.2)", fontSize:"1.1rem", fontWeight:700, letterSpacing:"0.08em", boxShadow:valid?"0 6px 28px rgba(212,168,67,0.35),inset 0 1px 0 rgba(255,255,255,0.25)":"none", textTransform:"uppercase", marginTop:6 }}>
            Deal 'Em In
          </button>
          <button onClick={onShowTutorial} style={{ ...sBtn, fontSize:"0.9rem", marginTop:-4 }}>
            📖 View Tutorial
          </button>
          {onBack && (
            <button onClick={onBack} style={{ ...sBtn, fontSize:"0.85rem", marginTop:-2, opacity:0.7 }}>
              ← Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// ROUND SUMMARY — full-screen modal recap of THIS round only
// ─────────────────────────────────────────────────────────
function RoundSummary({ players, prevChips, pot, round, history, onNext, mode, onCashOut, humanPlayerId }) {
  const turns = history || [];

  // Group turns by player name. Pass entries get no bet type. The history is
  // populated in order so this naturally lists turns chronologically.
  const turnsByName = {};
  turns.forEach(t => {
    if (!turnsByName[t.name]) turnsByName[t.name] = [];
    turnsByName[t.name].push(t);
  });

  const entries = players
    .map(p => ({ ...p, delta: p.chips - (prevChips[p.id] || 0), turns: turnsByName[p.name] || [] }))
    .sort((a, b) => b.delta - a.delta);

  // Human-friendly label per turn: "won $5 Spread", "DOINKED −$10 Mythical",
  // "missed −$3 Doink Bet", "passed".
  const labelFor = (t) => {
    const typeLabel = t.betType === "doink" ? "Doink Bet"
                    : t.betType === "mythical" ? "Mythical"
                    : t.betType === "blind" ? "Blind Bet"
                    : t.betType === "spread" ? "Spread"
                    : null;
    if (t.outcome === "pass") return { text: "passed", color: "rgba(245,237,216,0.4)", sym: "—" };
    if (t.outcome === "win")
      return { text: `won $${t.amount}${typeLabel?` on ${typeLabel}`:""}`, color: "#27AE60", sym: "✓" };
    if (t.outcome === "doink")
      return { text: `DOINKED −$${t.amount}${typeLabel?` on ${typeLabel}`:""}`, color: "#E74C3C", sym: "💥" };
    return { text: `missed −$${t.amount}${typeLabel?` on ${typeLabel}`:""}`, color: "rgba(245,237,216,0.65)", sym: "✗" };
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Round ${round} recap`}
      style={{ position:"fixed", inset:0, zIndex:260, background:"radial-gradient(ellipse at 50% 30%, rgba(8,18,12,0.97), rgba(2,5,3,0.99))", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, overflowY:"auto" }}>
      <div className="pop" style={{
        width:"100%", maxWidth:460,
        background:"linear-gradient(165deg, rgba(14,28,18,0.96) 0%, rgba(6,12,8,0.98) 100%)",
        border:"1.5px solid rgba(212,168,67,0.45)",
        borderRadius:24,
        padding:"26px 22px 24px",
        boxShadow:"0 24px 80px rgba(0,0,0,0.96), 0 0 60px rgba(212,168,67,0.15), inset 0 1px 0 rgba(240,201,106,0.22)",
        maxHeight:"calc(100vh - 40px)", overflowY:"auto"
      }}>
        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ fontSize:"0.62rem", letterSpacing:"0.28em", color:"rgba(212,168,67,0.6)", fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Round {round} Recap</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", color:"#F0C96A", fontWeight:900, lineHeight:1, textShadow:"0 0 28px rgba(212,168,67,0.55)" }}>Round Complete</div>
          <div aria-hidden="true" style={{ height:1.5, width:80, margin:"12px auto 0", background:"linear-gradient(90deg, transparent, rgba(212,168,67,0.6), transparent)" }}/>
        </div>

        {/* Per-player rows with both money and what happened */}
        <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:18 }}>
          {entries.map(p => (
            <div key={p.id} style={{
              padding:"10px 14px",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:12,
            }}>
              {/* Top row: avatar + name on left, net delta + final chips on right */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                  <Avatar seed={p.avatarSeed} size={28} name={p.name} isHuman={!p.isBot}/>
                  <div style={{ fontSize:"0.92rem", color:"#F5EDD8", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, flexShrink:0 }}>
                  <div style={{
                    fontSize:"1rem", fontWeight:800,
                    color: p.delta>0?"#27AE60":p.delta<0?"#E74C3C":"rgba(245,237,216,0.4)",
                    textShadow: p.delta>0?"0 0 12px rgba(39,174,96,0.5)":p.delta<0?"0 0 12px rgba(231,76,60,0.5)":"none",
                  }}>
                    {p.delta>0?`+$${p.delta}`:p.delta<0?`−$${Math.abs(p.delta)}`:"—"}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", color:"#F0C96A", fontWeight:700, minWidth:50, textAlign:"right" }}>${p.chips}</div>
                </div>
              </div>
              {/* Inline turn(s) — what they actually did */}
              {p.turns.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:3, marginTop:7, paddingLeft:38 }}>
                  {p.turns.map((t, i) => {
                    const L = labelFor(t);
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.78rem" }}>
                        <span style={{ color: L.color, fontWeight:800, minWidth:14, textAlign:"center" }}>{L.sym}</span>
                        <span style={{ color: L.color, fontWeight:600 }}>{L.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pot */}
        <div style={{ textAlign:"center", padding:"10px 14px", background:"rgba(212,168,67,0.06)", border:"1px solid rgba(212,168,67,0.18)", borderRadius:12, marginBottom:18 }}>
          <div style={{ fontSize:"0.58rem", letterSpacing:"0.18em", color:"rgba(212,168,67,0.5)", fontWeight:700, textTransform:"uppercase" }}>Pot Remaining</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:"#F0C96A", fontWeight:900, lineHeight:1.1 }}>${pot}</div>
        </div>

        <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
          <button onClick={onNext} style={{ ...gBtn, fontSize:"1.05rem", padding:"15px 36px" }}>Next Round →</button>
          {mode === "career" && onCashOut && (() => {
            const human = humanPlayerId != null ? players.find(p => p.id === humanPlayerId) : players.find(p => !p.isBot);
            const cash = human?.chips || 0;
            return (
              <button onClick={onCashOut} style={{ ...sBtn, fontSize:"1.05rem", padding:"15px 24px", color:"#F0C96A", border:"1.5px solid rgba(212,168,67,0.6)" }}>
                💰 Cash Out (${cash})
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SOLD HAND PLAYBACK — polished overlay shown to the seller (human)
// while the buyer plays the bought hand. Updates progressively.
// ─────────────────────────────────────────────────────────
function SoldHandPlayback({ data, onDismiss }) {
  const { seller, buyer, cards, hitCard, betType, amount, outcome, payout, sellerPayout } = data;
  const [a, b] = cards;
  const betLabel = betType==="doink"?"💥 Doink Bet":betType==="mythical"?"✨ Mythical":"Spread Bet";
  const outcomeColor = outcome==="win"?"#27AE60":outcome==="doink"?"#E74C3C":"rgba(245,237,216,0.45)";
  const outcomeLabel = outcome==="win"?"WIN 🎉":outcome==="doink"?"💥 DOINK!":outcome==="miss"?"MISS":null;
  const sellerCut = sellerPayout > 0;
  return (
    <div role="dialog" aria-modal="true" aria-label="Bought-hand playback"
      style={{ position:"fixed", inset:0, zIndex:250, background:"rgba(0,0,0,0.85)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div className="pop" style={{ background:"linear-gradient(160deg,#0C1A10,#060D08)", border:"2px solid rgba(212,168,67,0.3)", borderRadius:22, padding:"22px 22px 24px", maxWidth:360, width:"100%", textAlign:"center", boxShadow:"0 0 64px rgba(0,0,0,0.95)" }}>
        <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", color:"rgba(212,168,67,0.55)", textTransform:"uppercase", fontWeight:700, marginBottom:4 }}>Your Old Hand</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:16 }}>
          <Avatar seed={buyer.avatarSeed} size={28} active name={buyer.name} isHuman={!buyer.isBot}/>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#D4A843", fontWeight:700 }}>{buyer.name} is playing your cards</div>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:14, marginBottom:16 }}>
          <Card card={a} glow/>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:"0.7rem", color:"rgba(245,237,216,0.42)", marginBottom:4, letterSpacing:"0.1em", textTransform:"uppercase", fontWeight:600 }}>Bet</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#F0C96A", fontWeight:700, lineHeight:1 }}>${amount}</div>
            <div style={{ fontSize:"0.7rem", color:"rgba(245,237,216,0.45)", marginTop:4, fontWeight:600 }}>{betLabel}</div>
          </div>
          <Card card={b} glow/>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
          <div style={{ fontSize:"0.62rem", color:"rgba(245,237,216,0.3)", letterSpacing:"0.16em", fontWeight:700 }}>HIT CARD</div>
          <div style={{ flex:1, height:1, background:"rgba(255,255,255,0.08)" }}/>
        </div>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:18, minHeight:120 }}>
          {hitCard
            ? <Card card={hitCard} animClass="hit-anim" glow={outcome==="win"}/>
            : <div style={{ width:82, height:116, borderRadius:11, background:"rgba(255,255,255,0.04)", border:"1.5px dashed rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <div style={{ fontSize:"0.85rem", color:"rgba(255,255,255,0.2)" }}>•••</div>
              </div>
          }
        </div>
        {outcome && (
          <div className="pop" style={{ marginBottom:18 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:outcome==="doink"?"1.8rem":"1.5rem", fontWeight:900, color:outcomeColor, textShadow:`0 0 24px ${outcomeColor}`, marginBottom:10, letterSpacing:"0.04em" }}>{outcomeLabel}</div>
            {sellerCut && (
              <div style={{ background:"rgba(39,174,96,0.12)", border:"1.5px solid rgba(39,174,96,0.4)", borderRadius:14, padding:"10px 14px", marginTop:10 }}>
                <div style={{ fontSize:"0.72rem", letterSpacing:"0.12em", color:"rgba(39,174,96,0.75)", textTransform:"uppercase", fontWeight:700, marginBottom:2 }}>Your Cut</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:"#27AE60", fontWeight:900 }}>+${sellerPayout}</div>
              </div>
            )}
            {!sellerCut && outcome==="win" && (
              <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.5)", marginTop:4 }}>You already collected the sale price — no cut on this hand.</div>
            )}
            {outcome!=="win" && (
              <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.5)" }}>You collected your sale price upfront. {buyer.name} takes the loss.</div>
            )}
          </div>
        )}
        {outcome && <button onClick={onDismiss} style={{ ...gBtn, fontSize:"0.95rem" }}>Got it</button>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// BET MARKER — overlay shown on the felt when ANYONE bets
// Sits in the center-bottom of the felt, fades in/out
// ─────────────────────────────────────────────────────────
function BetMarker({ marker, playerName, landscape }) {
  if (!marker) return null;
  const { amount, type, outcome, isBought } = marker;
  const label = type === "doink" ? "DOINK BET" : type === "mythical" ? "MYTHICAL" : type === "blind" ? "BLIND BET" : "SPREAD BET";
  const color = type === "doink" ? "#E74C3C" : type === "mythical" ? "#9B59B6" : type === "blind" ? "#D4A843" : "#F0C96A";
  const bg = type === "doink" ? "rgba(231,76,60,0.18)" : type === "mythical" ? "rgba(155,89,182,0.18)" : type === "blind" ? "rgba(212,168,67,0.18)" : "rgba(240,201,106,0.14)";
  const outcomeColor = outcome === "win" ? "#27AE60" : outcome === "doink" ? "#E74C3C" : outcome === "miss" ? "rgba(245,237,216,0.6)" : null;
  const outcomeLabel = outcome === "win" ? "✓ WIN" : outcome === "doink" ? "💥 DOINK" : outcome === "miss" ? "MISS" : null;
  // Build an opaque background: dark solid base + a subtle tinted overlay
  // for the bet-type color so cards behind the marker don't bleed through.
  const opaqueBg = outcomeColor
    ? `linear-gradient(180deg, ${outcomeColor}40 0%, #060D08 100%), #060D08`
    : `linear-gradient(180deg, ${color}33 0%, #060D08 100%), #060D08`;
  return (
    <div className="pop" aria-live="polite" style={{
      position:"absolute",
      top: landscape ? "60%" : "62%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      animation: outcome ? "none" : "breathe 2.4s ease-in-out infinite",
      zIndex: 20,
      display:"flex", flexDirection:"column", alignItems:"center", gap:4,
      padding:"14px 24px",
      background: opaqueBg,
      backgroundColor: "#060D08",
      border: `2.5px solid ${outcomeColor || color}`,
      borderRadius: 18,
      boxShadow: `0 10px 36px rgba(0,0,0,0.85), 0 0 36px ${outcomeColor || color}99, inset 0 1px 0 rgba(255,255,255,0.08)`,
      pointerEvents: "none",
      minWidth: 190,
      textAlign: "center",
    }}>
      {playerName && (
        <div style={{ fontSize:"0.65rem", letterSpacing:"0.18em", color:"rgba(245,237,216,0.75)", fontWeight:700, textTransform:"uppercase" }}>
          {playerName}{isBought?" · bought":""}
        </div>
      )}
      <div style={{ display:"flex", alignItems:"baseline", gap:10 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"2.2rem", color: outcomeColor || color, fontWeight:900, lineHeight:1, textShadow:`0 0 18px ${outcomeColor || color}aa` }}>${amount}</div>
        <div style={{ fontSize:"0.78rem", letterSpacing:"0.16em", color: outcomeColor || color, fontWeight:800 }}>{label}</div>
      </div>
      {outcomeLabel && (
        <div className="pop" style={{ fontSize:"0.9rem", color: outcomeColor, fontWeight:900, letterSpacing:"0.1em", marginTop:2, textShadow:`0 0 14px ${outcomeColor}cc` }}>
          {outcomeLabel}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// GAME
// ═══════════════════════════════════════════════════════════
function Game({ cfg, onExit, onCareerComplete }) {
  const { nH, nB, chips: startChips, ante: anteAmt, denoms, names, botNames, orientation, hintsDefault = true } = cfg;
  const landscape = orientation === "landscape";
  const isCareer = cfg.mode === "career";
  const { draw, drawFresh, reshuffle } = useDeck();

  // ── CAREER SESSION TRACKING ──
  // Lightweight stats accumulated across the session; consumed when the
  // human cashes out or busts. Quick Play ignores all of this.
  const careerStatsRef = useRef({
    buyIn: cfg.careerSession?.buyIn || 0,
    startingTableChips: startChips,
    roundsPlayed: 0,
    spreadWins: 0,
    doinkBetsHit: 0,
    mythicalHits: 0,
    handsBought: 0,
    handsSold: 0,
    biggestPotWon: 0,
    biggestDoinkLoss: 0,
  });
  const careerCompletedRef = useRef(false);

  const mkPlayer = (id, name, isBot, avatarSeed) => ({
    id, name, chips: startChips, isBot, avatarSeed,
    cards: [], c1: false, c2: false,
    hitCard: null, bet: 0, betType: "none",
    passed: false, done: false,
    insurance: null, result: null, comment: null,
  });

  const resetRound = ps => ps.map(p => ({
    ...p, cards: [], c1: false, c2: false, hitCard: null,
    bet: 0, betType: "none", passed: false, done: false,
    insurance: null, result: null, comment: null,
  }));

  const [players, setPlayers] = useState(() => {
    const all = [];
    for (let i = 0; i < nH; i++) all.push(mkPlayer(i, names[i], false, i));
    for (let i = 0; i < nB; i++) all.push(mkPlayer(nH + i, botNames[i] || `Bot ${i + 1}`, true, nH + i));
    return all;
  });

  // FIX #20: track chip counts at round start for summary
  const [prevChips, setPrevChips] = useState({});

  // turnQueue: ordered list of { slotId, playerId, cards, isBought, sellerId?, skipped? }
  const [turnQueue, setTurnQueue] = useState([]);
  const [queueIdx, setQueueIdx] = useState(0);

  // Stable refs to avoid stale closures
  const queueIdxRef = useRef(0);
  const potRef = useRef(0);
  const playersRef = useRef(players);
  const queueRef = useRef(turnQueue);
  const pendingSellOfferRef = useRef(null);
  const phaseRef = useRef("ante");
  const sheetRef = useRef(null);

  useEffect(() => { queueIdxRef.current = queueIdx; }, [queueIdx]);
  useEffect(() => { playersRef.current = players; }, [players]);
  useEffect(() => { queueRef.current = turnQueue; }, [turnQueue]);

  const [pot, setPot] = useState(0);
  const [potAnim, setPotAnim] = useState(null);
  const [potDelta, setPotDelta] = useState(null);
  const [phase, setPhase] = useState("ante");
  const [firstIdx, setFirstIdx] = useState(0);
  const [seatAnims, setSeatAnims] = useState({});
  const [round, setRound] = useState(1);
  const [log, setLog] = useState([{ msg: "Welcome to DOINK! 🃏", type: "info" }]);
  const [sheet, setSheet] = useState(null);
  const [betVal, setBetVal] = useState(0);
  const [locked, setLocked] = useState(false);
  // Hints are disabled entirely in career mode — players must read the board
  // themselves. Quick Play keeps the hints toggle.
  const [hintsOn, setHintsOn] = useState(isCareer ? false : hintsDefault);
  const [showRules, setShowRules] = useState(false);
  const [waitingForRoll, setWaitingForRoll] = useState(false);
  const [pendingOffer, setPendingOffer] = useState(null);
  const [pendingSellOffer, setPendingSellOffer] = useState(null); // table-wide sell auction
  const [tradeMode, setTradeMode] = useState(null);
  const [toast, setToast] = useState(null);
  const [outcomeModal, setOutcomeModal] = useState(null);
  const [soldHandPlayback, setSoldHandPlayback] = useState(null); // real-time sold hand overlay
  const [replenishFlash, setReplenishFlash] = useState(false);
  const [doinkFlash, setDoinkFlash] = useState(null);
  const [history, setHistory] = useState([]); // recent turn summaries
  const [showSecondary, setShowSecondary] = useState(false);
  const [hitCardRevealed, setHitCardRevealed] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(null);
  // Bet marker shown on the felt during a bet/reveal: { playerId, amount, type }
  const [betMarker, setBetMarker] = useState(null);
  // Bot "thinking" indicator next to active seat
  const [botThinking, setBotThinking] = useState(null); // playerId | null

  useEffect(() => { potRef.current = pot; }, [pot]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { sheetRef.current = sheet; }, [sheet]);
  useEffect(() => { pendingSellOfferRef.current = pendingSellOffer; }, [pendingSellOffer]);

  const addLog = (msg, type = "info") => setLog(l => [...l.slice(-80), { msg, type }]);
  const showToast = msg => setToast(msg);
  // Comments now appear next to the player (bubble above seat), NOT as a toast.
  // Auto-clears after 3.2s.
  const commentTimersRef = useRef({});
  const showComment = (name, msg) => {
    const target = playersRef.current.find(pl => pl.name === name);
    if (!target) return;
    setPlayers(prev => prev.map(pl => pl.id === target.id ? { ...pl, comment: msg } : pl));
    // Clear any existing timer for this player so the new comment lasts its full duration
    if (commentTimersRef.current[target.id]) clearTimeout(commentTimersRef.current[target.id]);
    commentTimersRef.current[target.id] = setTimeout(() => {
      setPlayers(prev => prev.map(pl => pl.id === target.id ? { ...pl, comment: null } : pl));
      delete commentTimersRef.current[target.id];
    }, 3200);
  };

  // Current slot helpers
  const curSlot = turnQueue[queueIdx];
  const curPlayer = curSlot ? players.find(p => p.id === curSlot.playerId) : null;
  const isHumanSlot = curSlot && curPlayer && !curPlayer.isBot;
  // Single-human mode: always the same human across the round
  const humanPlayer = players.find(p => !p.isBot);

  const buildQueue = (ps, fi) => {
    const n = ps.length;
    const order = Array.from({ length: n }, (_, i) => (fi + i) % n);
    return order.map(i => ({ slotId: `own-${ps[i].id}`, playerId: ps[i].id, cards: ps[i].cards, isBought: false, sellerId: null }));
  };

  const flashPot = d => {
    setPotAnim(d > 0 ? "pot-gain" : "pot-lose");
    setPotDelta(d);
    setTimeout(() => setPotAnim(null), 600);
    setTimeout(() => setPotDelta(null), 1000);
  };

  const doReplenish = ps => {
    let p = 0;
    const up = (ps || playersRef.current).map(pl => { const pay = Math.min(anteAmt, pl.chips); p += pay; return { ...pl, chips: pl.chips - pay }; });
    setPlayers(up);
    setPot(p);
    potRef.current = p;
    flashPot(p);
    addLog(`💰 Pot hit $0 — everyone replenishes $${anteAmt}!`);
  };

  const applyPotChange = (d, ps) => {
    const raw = potRef.current + d;
    if (raw <= 0) {
      setPot(0);
      potRef.current = 0;
      // Overlay gets a full 3.2s on screen all to itself; chip collection
      // happens late so the user sees the announcement first.
      setReplenishFlash(true);
      setTimeout(() => doReplenish(ps || playersRef.current), 2400);
      setTimeout(() => setReplenishFlash(false), 3200);
    } else {
      setPot(raw);
      potRef.current = raw;
    }
    flashPot(d);
  };

  // ── ANTE
  useEffect(() => {
    if (phase !== "ante") return;
    // FIX #20: snapshot chips before round
    const snap = {};
    players.forEach(p => { snap[p.id] = p.chips; });
    setPrevChips(snap);

    let p = 0;
    const up = resetRound(players).map(pl => { const pay = Math.min(anteAmt, pl.chips); p += pay; return { ...pl, chips: pl.chips - pay }; });
    setPlayers(up);
    setTimeout(() => { setPot(pv => pv + p); potRef.current += p; flashPot(p); }, 50);
    addLog(`Round ${round} — replenish collected.`);
    setQueueIdx(0);
    queueIdxRef.current = 0;
    setTimeout(() => setPhase("blindBet"), 500);
  }, [phase]);

  // ── BLIND BET
  useEffect(() => {
    if (phase !== "blindBet") return;
    const bots = players.filter(p => p.isBot);
    let delay = 0;
    bots.forEach(bot => {
      setTimeout(() => {
        const pz = getPersonality(bot.name);
        if (Math.random() < BOT_CONFIG.blindBetChance * pz.blind && bot.chips > 0) {
          const bb = Math.max(1, Math.floor(Math.min(potRef.current, bot.chips) * BOT_CONFIG.blindBetFraction * pz.confidence));
          setPlayers(prev => prev.map(p => p.id === bot.id ? { ...p, chips: p.chips - bb, bet: bb, betType: "blind" } : p));
          addLog(`${bot.name} blind bets $${bb}!`);
        }
      }, delay);
      delay += 60;
    });
    setTimeout(() => startDealing(), delay + 120);
  }, [phase]);

  // ── DEAL
  const startDealing = () => {
    reshuffle();
    const ps = playersRef.current;
    const n = ps.length;
    const order = Array.from({ length: n }, (_, i) => (firstIdx + i) % n);
    const first = Array(n), second = Array(n);
    order.forEach(i => { first[i] = draw(); second[i] = draw(); });
    setPlayers(prev => prev.map((p, i) => ({ ...p, cards: [first[i], second[i]], c1: false, c2: false })));
    setPhase("dealing");
    addLog("Dealing cards…");
    let t = 100;
    order.forEach(i => { setTimeout(() => setPlayers(prev => prev.map((p, j) => j === i ? { ...p, c1: true } : p)), t); t += 180; });
    t += 150;
    order.forEach(i => { setTimeout(() => setPlayers(prev => prev.map((p, j) => j === i ? { ...p, c2: true } : p)), t); t += 180; });
    setTimeout(() => {
      const q = buildQueue(playersRef.current, firstIdx);
      setTurnQueue(q);
      queueRef.current = q;
      queueIdxRef.current = 0;
      setQueueIdx(0);
      addLog("Cards dealt — buy hands or wait for bidding.");
      setPhase("preBuy");
    }, t + 200);
  };

  // ── PREBUY: human gets to buy hands; bots may post sell offers. No auto-advance — user explicitly clicks "Skip to Bidding".
  useEffect(() => {
    if (phase !== "preBuy") return;
    tryBotPostSellOffers();
  }, [phase]);

  const botHandComment = (p, cards) => {
    const sp = spreadOf(cards[0], cards[1]);
    const type = sp >= 8 ? "goodHand" : sp <= 2 ? "badHand" : null;
    if (type) showComment(p.name, getComment(type));
  };

  // ── BETTING useEffect
  // FIX #1 (primary bug fix): watch slotId so React detects when same queueIdx
  // gets a different slot (after queue mutation), AND handle skipped slots here
  // instead of relying on timed callbacks racing with state.
  useEffect(() => {
    if (phase !== "betting") return;
    const q = queueRef.current;
    const idx = queueIdxRef.current;
    const slot = q[idx];
    if (!slot) return;

    // FIX #1: self-advancing skip — skipped slots advance without any callback race
    if (slot.skipped) {
      const t = setTimeout(() => advanceQueue(), 100);
      return () => clearTimeout(t);
    }

    const p = playersRef.current.find(x => x.id === slot.playerId);
    if (!p) return;

    if (p.isBot) {
      // Bot turn pacing (deliberately slow so player can follow every step):
      //   0ms     queue advanced; previous bet marker just cleared
      //   900ms   active glow + "thinking..." banner + hand comment
      //   2400ms  decide: bet marker replaces thinking banner
      //   ...    execBet handles its own pacing
      // The 900ms initial gap is the "between turns" pause where the previous
      // player's seat anim (win-blast / doink-explosion / miss-flash) finishes
      // and the screen is briefly calm before the next turn begins.
      const t1 = setTimeout(() => {
        setBotThinking(p.id);
        botHandComment(p, slot.cards);
        const t2 = setTimeout(() => {
          setBotThinking(null);
          runBotSlot(slot, p);
        }, 1500);
        return () => clearTimeout(t2);
      }, 900);
      return () => clearTimeout(t1);
    } else {
      const isRoundStarter = idx === 0;
      const alreadyWent = q.slice(0, idx).some(s => s.playerId === p.id && !s.isBought);
      if (!slot.isBought && !isRoundStarter && !alreadyWent) {
        setWaitingForRoll(true);
      }
    }
    // FIX #1: depend on slotId so effect re-runs when queue is mutated in place
  }, [phase, queueIdx, turnQueue[queueIdx]?.slotId]);

  const runBotSlot = (slot, p) => {
    const [a, b] = slot.cards;
    const sp = spreadOf(a, b);
    const myth = isMythical(a, b);
    const sameRank = sp === 0;
    const pz = getPersonality(p.name);

    // Win caps so a bot can never bet more than it could win:
    //   spread 1:1     → max = min(chips, pot)
    //   doink 7:1      → max = min(chips, floor(pot/7))
    //   mythical 12:1  → max = min(chips, floor(pot/12))
    const potNow = potRef.current;
    const capSpread = Math.min(p.chips, potNow);
    const capDoink  = Math.min(p.chips, Math.floor(potNow / 7));
    const capMyth   = Math.min(p.chips, Math.floor(potNow / 12));

    // Compute real win probabilities using the same 50-remaining model.
    // hitProb is for the SPREAD bet (between).
    // doinkMatchProb is the chance the hit matches one of our ranks.
    const hitCards    = Math.max(0, (sp - 1) * 4);
    const doinkCards  = sameRank ? 2 : 6; // matches calcOdds()
    const hitProb     = hitCards / 50;
    const doinkProb   = doinkCards / 50;

    // ── Mythical hands (spread 2): the 12× is too juicy to pass on ──
    if (myth) {
      // EV of mythical bet: hitProb*12 − doinkProb*1 − missProb*1
      // For myth: hitProb = 4/50 = 0.08, ev per $1 = 0.08*12 − 0.92 = 0.04 (positive)
      // Confident bots also play side-doink for entertainment.
      if (capMyth >= 1 && Math.random() < 0.85) {
        // Bet between 25% and 70% of max, scaled by confidence
        const frac = 0.25 + 0.45 * Math.min(1, pz.confidence);
        const amt = Math.max(1, Math.min(capMyth, Math.floor(capMyth * frac)));
        execBet(slot, p, amt, "mythical");
        return;
      }
      // Otherwise occasional doink long-shot
      if (capDoink >= 1 && Math.random() < 0.25 * pz.doink) {
        const amt = Math.max(1, Math.floor(capDoink * 0.4));
        execBet(slot, p, amt, "doink");
        return;
      }
      execPass(slot, p);
      return;
    }

    // ── Same rank: only doink bet has any chance of winning ──
    if (sameRank) {
      // doinkProb = 2/50 = 4%; 7× payout → EV = 0.04*7 − 0.96 = -0.68 per $1
      // Negative EV. Most bots should pass; chaotic ones occasionally swing.
      if (capDoink >= 1 && Math.random() < 0.25 * pz.doink) {
        const amt = Math.max(1, Math.floor(capDoink * 0.25));
        execBet(slot, p, amt, "doink");
        return;
      }
      execPass(slot, p);
      return;
    }

    // ── Normal spread hands ──
    // Spread EV per $1 = hitProb*1 − doinkProb*1 − missProb*0 = hitProb − doinkProb
    // hitProb hits +EV around spread 4+; bots should play moderate-to-strong hands.
    const spreadEV = hitProb - doinkProb;

    // Aggressive on strong hands. A-J = spread 10 → hitProb = 36/50 = 72%,
    // doinkProb = 12%. EV per $1 ≈ +0.60. Bot should bet.
    if (spreadEV > 0.05) {
      // Always bet positive EV (modulo a tiny variance pass)
      const passChance = Math.max(0.04, 0.18 - spreadEV * 0.4) * (1 / Math.max(0.6, pz.risk));
      if (Math.random() < passChance) {
        execPass(slot, p);
        return;
      }
      if (capSpread >= 1) {
        // Bet size grows with EV: from ~30% on borderline to ~85% on a slam dunk
        let frac = 0.3 + Math.min(0.55, spreadEV * 0.85);
        frac *= Math.min(1.1, pz.confidence);
        frac = Math.min(0.9, frac);
        const amt = Math.max(1, Math.min(capSpread, Math.floor(capSpread * frac)));
        execBet(slot, p, amt, "spread");
        return;
      }
    }

    // Borderline / weak hands: mostly pass, sometimes try a small doink long-shot.
    // Doink long-shot EV = doinkProb*7 − (1-doinkProb)*1 = 0.12*7 − 0.88 = -0.04 (slightly -EV)
    // Risk-loving bots take it occasionally.
    if (capDoink >= 1 && Math.random() < 0.10 * pz.doink) {
      const amt = Math.max(1, Math.floor(capDoink * 0.3));
      execBet(slot, p, amt, "doink");
      return;
    }

    // Marginal-EV spread sometimes worth a small bet for the chaotic ones
    if (spreadEV > -0.05 && capSpread >= 1 && Math.random() < 0.25 * pz.risk) {
      const amt = Math.max(1, Math.floor(capSpread * 0.2));
      execBet(slot, p, amt, "spread");
      return;
    }

    execPass(slot, p);
  };

  const execPass = (slot, p) => {
    addLog(`${p.name} passes.`);
    setSeatAnims(prev => ({ ...prev, [p.id]: "pass" }));
    setHistory(h => [...h.slice(-15), { name: p.name, outcome: "pass", amount: 0 }]);
    if (!slot.isBought) {
      // FIX #4: correct hasBoughtSlotAhead
      setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, passed: true, done: !hasBoughtSlotAhead(pl.id) } : pl));
    }
    // Slower so the PASS badge is readable
    setTimeout(() => advanceQueue(), 1000);
  };

  // FIX #4: check only slots AFTER current index
  const hasBoughtSlotAhead = pid => {
    const q = queueRef.current;
    return q.slice(queueIdxRef.current + 1).some(s => s.playerId === pid && s.isBought);
  };

  const execBet = (slot, p, amount, type) => {
    setLocked(true);
    const [a, b] = slot.cards;

    // Stable target for after resolution (used in calculations below)
    const chipsAfterBet = p.chips - amount;

    // IMPORTANT: do NOT decrement seat chips yet. The bet amount is shown
    // prominently in the bet marker; we hold the seat chips at the pre-bet
    // value until the resolution so the user doesn't see chips changing before
    // they see the hit card.
    setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, bet: (pl.bet || 0) + amount, betType: type } : pl));
    addLog(`${p.name} bets $${amount} [${type}]${slot.isBought ? " (bought hand)" : ""}.`);

    // Show bet marker on felt immediately
    setBetMarker({ playerId: p.id, amount, type, isBought: !!slot.isBought });

    const hitCard = drawFresh();

    // If this is a bought slot and seller is a human, show the playback overlay
    if (slot.isBought && slot.sellerId) {
      const seller = playersRef.current.find(x => x.id === slot.sellerId);
      if (seller && !seller.isBot) {
        setSoldHandPlayback({ seller, buyer: p, cards: slot.cards, hitCard: null, betType: type, amount, outcome: null });
      }
    }

    // PACING: bet marker visible for 750ms, THEN reveal hit card, THEN 700ms pause before result
    setTimeout(() => {
      if (!slot.isBought) {
        setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, hitCard } : pl));
      } else {
        addLog(`${p.name}'s bought hand hit: ${hitCard.rank}${hitCard.suit}`);
        setSoldHandPlayback(prev => prev ? { ...prev, hitCard } : prev);
      }
      setTimeout(() => {
        // chipDelta is applied on top of chipsAfterBet (bet already deducted).
        let chipDelta = 0, pd = 0, outcome = "miss";
        if (type === "doink") {
          if (isDoinkCard(a, b, hitCard)) {
            const winnings = amount * 7;
            chipDelta = amount + winnings;
            pd = -winnings;
            outcome = "win";
            addLog(`💥🎉 ${p.name} DOINK BET HITS! +$${winnings}`, "win");
            showComment(p.name, getComment("doinkBetHit"));
          } else {
            pd = amount;
            addLog(`${p.name} doink bet missed.`);
            showComment(p.name, getComment("miss"));
          }
        } else if (type === "mythical") {
          if (isMythical(a, b) && between(a, b, hitCard)) {
            const winnings = amount * 12;
            chipDelta = amount + winnings;
            pd = -winnings;
            outcome = "win";
            addLog(`✨ ${p.name} MYTHICAL! +$${winnings}`, "win");
            showComment(p.name, getComment("mythical"));
          } else if (isDoinkCard(a, b, hitCard)) {
            const cov = p.insurance?.coverage || 0;
            chipDelta = -(amount - cov);
            pd = amount * 2 - cov;
            outcome = "doink";
            addLog(`💥 ${p.name} DOINKS! -$${amount * 2}`, "doink");
            showComment(p.name, getComment("doink"));
          } else {
            pd = amount;
            addLog(`${p.name} mythical missed.`);
            showComment(p.name, getComment("miss"));
          }
        } else {
          if (between(a, b, hitCard)) {
            const winnings = amount;
            chipDelta = amount + winnings;
            pd = -winnings;
            outcome = "win";
            addLog(`${p.name} WINS $${winnings}!`, "win");
            showComment(p.name, getComment("win"));
          } else if (isDoinkCard(a, b, hitCard)) {
            const cov = p.insurance?.coverage || 0;
            chipDelta = -(amount - cov);
            pd = amount * 2 - cov;
            outcome = "doink";
            addLog(`💥 ${p.name} DOINKS! -$${amount * 2}`, "doink");
            showComment(p.name, getComment("doink"));
          } else {
            pd = amount;
            addLog(`${p.name} missed.`);
            showComment(p.name, getComment("miss"));
          }
        }

        const finalChips = Math.max(0, chipsAfterBet + chipDelta);

        // Bought-hand seller payout
        let sellerPayout = 0;
        const sellerCut = slot.sellerCut || 0;
        if (slot.isBought && outcome === "win" && sellerCut > 0) {
          const winnings = chipDelta - amount;
          sellerPayout = Math.floor(winnings * sellerCut / 100);
        }

        let updatedPlayers = playersRef.current.map(pl => {
          if (pl.id === p.id) {
            const buyerFinalChips = Math.max(0, chipsAfterBet + chipDelta - sellerPayout);
            return slot.isBought ? { ...pl, chips: buyerFinalChips } : { ...pl, chips: finalChips, result: outcome, done: true };
          }
          if (slot.isBought && pl.id === slot.sellerId && sellerPayout > 0) {
            return { ...pl, chips: pl.chips + sellerPayout };
          }
          return pl;
        });
        setPlayers(updatedPlayers);

        if (sellerPayout > 0) {
          const sellerName = playersRef.current.find(x => x.id === slot.sellerId)?.name || "Seller";
          addLog(`💰 ${sellerName} gets +$${sellerPayout} (${sellerCut}% of winnings).`, "win");
        }

        if (!slot.isBought) setSeatAnims(prev => ({ ...prev, [p.id]: outcome }));

        if (outcome === "doink") {
          setDoinkFlash(p.name);
          setTimeout(() => setDoinkFlash(null), 1100);
        }

        const histAmount = outcome === "win" ? Math.max(0, chipDelta - amount) : outcome === "doink" ? amount * 2 - (p.insurance?.coverage || 0) : amount;
        setHistory(h => [...h.slice(-15), { name: p.name, outcome, amount: histAmount, betType: type }]);

        // ── CAREER STATS — count human-only events for the active session ──
        if (isCareer && !p.isBot) {
          const st = careerStatsRef.current;
          if (outcome === "win") {
            if (type === "spread")   st.spreadWins++;
            if (type === "doink")    st.doinkBetsHit++;
            if (type === "mythical") st.mythicalHits++;
            const w = Math.max(0, chipDelta - amount);
            if (w > st.biggestPotWon) st.biggestPotWon = w;
          } else if (outcome === "doink") {
            const lossAmount = amount * 2 - (p.insurance?.coverage || 0);
            if (lossAmount > st.biggestDoinkLoss) st.biggestDoinkLoss = lossAmount;
          }
        }

        applyPotChange(pd, updatedPlayers);

        // Update bet marker with outcome so it briefly flashes the result
        setBetMarker(prev => prev ? { ...prev, outcome } : prev);

        // Playback overlay outcome update
        if (slot.isBought && slot.sellerId) {
          const seller = playersRef.current.find(x => x.id === slot.sellerId);
          if (seller && !seller.isBot) {
            setSoldHandPlayback(prev => prev ? { ...prev, outcome, finalChips, payout: chipDelta, sellerPayout } : prev);
            setTimeout(() => setSoldHandPlayback(null), 3500);
          }
        }

        // Clear bet marker and advance after a generous result-hold so the
        // outcome registers on the player's seat (win-blast / doink-explosion /
        // miss-flash animations take ~0.5-0.9s) AND there's a clear gap
        // before the next player begins thinking.
        setTimeout(() => {
          setBetMarker(null);
          setLocked(false);
          advanceQueue();
        }, 2400);
      }, 1200);  // hit-card visible for 1200ms before result stamps in
    }, 1400);    // bet marker visible for 1400ms before hit-card reveal
  };

  const advanceQueue = () => {
    const nextIdx = queueIdxRef.current + 1;
    if (nextIdx >= queueRef.current.length) {
      if (isCareer) careerStatsRef.current.roundsPlayed++;
      setTimeout(() => setPhase("roundEnd"), 250);
    } else {
      queueIdxRef.current = nextIdx;
      setQueueIdx(nextIdx);
    }
  };

  // ── NEXT ROUND
  const nextRound = () => {
    const alive = players.filter(p => p.chips > 0);
    if (alive.length < 2) { setPhase("over"); return; }
    setSeatAnims({}); setPendingOffer(null); setPendingSellOffer(null); setSheet(null); setTurnQueue([]); setQueueIdx(0);
    setHistory([]);
    queueIdxRef.current = 0;
    const newFirst = (firstIdx + 1) % alive.length;
    setFirstIdx(newFirst);
    setRound(r => r + 1);
    setPlayers(resetRound(alive));
    addLog(`Round ${round + 1} — ${alive[newFirst]?.name} goes first.`);
    if (potRef.current === 0) setPhase("ante");
    else setPhase("blindBet");
  };

  // ── CAREER: build a session result and pass it up to App ──
  // Called when the player cashes out at round summary OR when the player
  // busts (chips → 0). Idempotent via careerCompletedRef so it only fires once.
  const finishCareerSession = (reason) => {
    if (!isCareer) return;
    if (careerCompletedRef.current) return;
    careerCompletedRef.current = true;
    const human = playersRef.current.find(p => !p.isBot);
    const cashOut = Math.max(0, human?.chips || 0);
    const buyIn = cfg.careerSession?.buyIn || 0;
    const st = careerStatsRef.current;
    const net = cashOut - buyIn;
    const xpEarned = computeSessionXP({ ...st, buyIn, cashOut });
    const result = {
      tableId: cfg.tableId,
      tableName: cfg.careerSession?.tableName,
      buyIn,
      cashOut,
      net,
      roundsPlayed: st.roundsPlayed,
      spreadWins: st.spreadWins,
      doinkBetsHit: st.doinkBetsHit,
      mythicalHits: st.mythicalHits,
      handsBought: st.handsBought,
      handsSold: st.handsSold,
      biggestPotWon: st.biggestPotWon,
      biggestDoinkLoss: st.biggestDoinkLoss,
      xpEarned,
      reason,
    };
    onCareerComplete?.(result);
  };

  // Career: when the game reaches "over" phase (typically because the human
  // busted out and the round-end check found fewer than 2 alive players),
  // finalize the session via the parent. Idempotent.
  useEffect(() => {
    if (!isCareer) return;
    if (phase !== "over") return;
    if (careerCompletedRef.current) return;
    const human = playersRef.current.find(p => !p.isBot);
    const busted = (human?.chips || 0) <= 0;
    finishCareerSession(busted ? "bust" : "gameover");
  }, [phase, isCareer]);

  // ── TRADE: insert bought slot after buyer's last slot in queue
  // buyerOverride: when a table-wide sell offer is accepted, the accepter is the buyer
  const acceptOffer = (offer, buyerOverride = null) => {
    const buyerId = buyerOverride ?? offer.buyerId;
    const buyer = playersRef.current.find(p => p.id === buyerId);
    const seller = playersRef.current.find(p => p.id === offer.sellerId);
    if (!buyer || !seller) return;
    if (buyer.id === seller.id) return; // can't buy from yourself
    const chipTransfer = offer.chips || 0;
    if (buyer.chips < chipTransfer) {
      addLog(`${buyer.name} can't afford the offer.`);
      return;
    }
    const sellerCards = seller.cards;
    const pctClause = offer.pct ? ` + ${offer.pct}% of winnings` : "";
    addLog(`🤝 ${seller.name} sold hand to ${buyer.name} for $${chipTransfer}${pctClause}.`);
    showToast(`🤝 ${seller.name} → ${buyer.name}: $${chipTransfer}${pctClause}`);

    // ── CAREER STATS — record human trade involvement ──
    if (isCareer) {
      if (!buyer.isBot)  careerStatsRef.current.handsBought++;
      if (!seller.isBot) careerStatsRef.current.handsSold++;
    }

    setPlayers(prev => prev.map(p => {
      if (p.id === buyer.id) return { ...p, chips: p.chips - chipTransfer };
      if (p.id === seller.id) return { ...p, chips: p.chips + chipTransfer, passed: true, done: true };
      return p;
    }));

    // Insert bought slot for buyer immediately after their last slot.
    // Store sellerCut on the slot so the seller gets their % of winnings when the slot resolves.
    setTurnQueue(prev => {
      const q = [...prev];
      let insertAfter = -1;
      for (let i = 0; i < q.length; i++) {
        if (q[i].playerId === buyerId) insertAfter = i;
      }
      if (insertAfter === -1) insertAfter = queueIdxRef.current;
      const newSlot = { slotId: `bought-${buyerId}-${Date.now()}`, playerId: buyerId, cards: sellerCards, isBought: true, sellerId: offer.sellerId, sellerCut: offer.pct || 0 };
      q.splice(insertAfter + 1, 0, newSlot);
      // Mark seller's own slot as skipped
      const updated = q.map(s => s.playerId === seller.id && !s.isBought ? { ...s, skipped: true } : s);
      queueRef.current = updated;
      return updated;
    });

    setPendingOffer(null); setPendingSellOffer(null); setSheet(null); setTradeMode(null);

    // If seller IS the current player, nudge queue forward so skipped flag fires
    const currentSlot = queueRef.current[queueIdxRef.current];
    if (currentSlot && currentSlot.playerId === seller.id && !currentSlot.isBought) {
      setTimeout(() => advanceQueue(), 150);
    }
  };

  const declineOffer = () => {
    addLog("Offer declined.");
    setPendingOffer(null); setSheet(null);
  };

  // Withdraw an open sell auction (seller cancels)
  const withdrawSellOffer = () => {
    if (!pendingSellOffer) return;
    addLog(`${players.find(p => p.id === pendingSellOffer.sellerId)?.name || "Seller"} withdraws the sell offer.`);
    setPendingSellOffer(null);
  };

  const botRespondToOffer = offer => {
    // The bot is whichever side isn't the human initiator.
    // When human SELLS: buyerId=bot, sellerId=human → bot evaluates human's hand quality to decide purchase price.
    // When human BUYS: sellerId=bot, buyerId=human → bot evaluates its own hand to decide if the price is fair.
    const botId = offer.buyerId !== curPlayer?.id ? offer.buyerId : offer.sellerId;
    const botPlayer = playersRef.current.find(p => p.id === botId);
    if (!botPlayer || !botPlayer.isBot) return;

    const sellerPlayer = playersRef.current.find(p => p.id === offer.sellerId);
    if (!sellerPlayer || sellerPlayer.cards.length < 2) return;

    const { quality, base } = handValue(sellerPlayer.cards[0], sellerPlayer.cards[1], potRef.current);
    const offerValue = (offer.chips || 0) + (offer.pct || 0) / 100 * potRef.current * quality;
    const threshold = quality > 0.4 ? base * BOT_CONFIG.offerAcceptThresholdGood : base * BOT_CONFIG.offerAcceptThresholdPoor;

    setTimeout(() => {
      if (offerValue >= threshold || quality < 0.08) {
        acceptOffer(offer);
        addLog(`${botPlayer.name} accepts the offer.`);
      } else {
        const counter = Math.round(Math.max((offer.chips || 0) * BOT_CONFIG.counterMultiplier, base));
        addLog(`${botPlayer.name} counters: $${counter}.`);
        setSheet(null);
        setPendingOffer({ ...offer, chips: counter, pct: 0, desc: `$${counter} upfront (counter from ${botPlayer.name})`, isCounter: true });
      }
    }, 700);
  };

  // ── Table-wide sell auction: when a sell offer is broadcast, bots decide whether to buy.
  // First bot whose value-math clears the bar accepts. Iteration is staggered so it feels live.
  const evaluateBotSellResponses = sellOffer => {
    if (!sellOffer) return;
    const seller = playersRef.current.find(p => p.id === sellOffer.sellerId);
    if (!seller || seller.cards.length < 2) return;
    const { quality, base } = handValue(seller.cards[0], seller.cards[1], potRef.current);
    const candidates = playersRef.current.filter(p => p.isBot && p.id !== seller.id && !p.done && !p.passed && p.chips >= (sellOffer.chips || 0));
    // Shuffle so it's not always the same bot
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);
    let delay = 600;
    let accepted = false;
    shuffled.forEach((bot, i) => {
      setTimeout(() => {
        if (accepted) return;
        // Has someone else already accepted this offer? (state may have changed)
        if (!pendingSellOfferRef.current) return;
        // Bot's effective value of acquiring: pays chips upfront, gets winnings - pct*winnings.
        // EV of winnings ≈ quality * pot (rough). Net for bot ≈ EV * (1 - pct/100) - chipsUpfront.
        const expectedWin = quality * potRef.current; // rough EV
        const botProfit = expectedWin * (1 - (sellOffer.pct || 0) / 100) - (sellOffer.chips || 0);
        const acceptIf = botProfit > base * 0.15 && quality > 0.18;
        if (acceptIf) {
          accepted = true;
          addLog(`${bot.name} accepts the offer.`);
          acceptOffer(sellOffer, bot.id);
        }
      }, delay + i * 350);
    });
  };

  // ── Bots proactively offer to sell weak hands to the table
  const tryBotPostSellOffers = () => {
    const bots = playersRef.current.filter(p => p.isBot && p.cards.length === 2 && !p.done && !p.passed);
    const shuffled = [...bots].sort(() => Math.random() - 0.5);
    let delay = 400;
    shuffled.forEach(bot => {
      const { quality, base } = handValue(bot.cards[0], bot.cards[1], potRef.current);
      const pz = getPersonality(bot.name);
      // Personality.sell skews how aggressively this bot tries to dump hands
      const baseSell = quality < 0.08 ? BOT_CONFIG.botSellChanceTrash
                     : quality < 0.25 ? BOT_CONFIG.botSellChancePoor
                     : quality < 0.45 ? BOT_CONFIG.botSellChanceFair
                     : 0;
      const sellChance = Math.min(0.95, baseSell * pz.sell);
      if (Math.random() < sellChance) {
        // Patient/wary bots ask higher upfront; flashy bots take chips and run
        const askMult = (pz.confidence + pz.risk) / 2;
        const upfront = Math.max(1, Math.round(base * (0.55 + Math.random() * 0.5) * askMult));
        const pct = quality > 0.2 ? [0, 10, 15, 20][Math.floor(Math.random() * 4)] : 0;
        const desc = pct > 0 ? `$${upfront} + ${pct}% of winnings` : `$${upfront} upfront`;
        const offer = { sellerId: bot.id, chips: upfront, pct, desc, kind: pct > 0 ? "hybrid" : "chips" };
        setTimeout(() => {
          if (pendingSellOfferRef.current) return;
          addLog(`📢 ${bot.name} sells hand to the table: ${desc}.`);
          setPendingSellOffer(offer);
        }, delay);
        delay += 1400;
      }
    });
  };

  // Human action helpers
  const maxBet = curPlayer ? Math.min(pot, curPlayer.chips) : 0;
  const slotSpread = curSlot?.cards?.length === 2 ? { v: spreadOf(curSlot.cards[0], curSlot.cards[1]), mythical: isMythical(curSlot.cards[0], curSlot.cards[1]) } : null;

  const humanBet = type => {
    if (betVal <= 0 || locked || !curSlot || !curPlayer) return;
    const amount = betVal; setBetVal(0); setSheet(null);
    // Show tap-to-reveal first
    setPendingReveal({ slot: curSlot, p: curPlayer, amount, type });
  };
  const humanPass = () => {
    if (locked || !curSlot || !curPlayer) return;
    execPass(curSlot, curPlayer); setSheet(null);
  };
  const humanBlindBet = () => {
    if (betVal <= 0) return;
    addLog(`${curPlayer.name} blind bets $${betVal}!`);
    setPlayers(prev => prev.map(p => p.id === curPlayer.id ? { ...p, chips: p.chips - betVal } : p));
    setBetVal(0); setSheet(null);
  };
  const buyInsurance = () => {
    const premium = Math.max(1, Math.ceil(maxBet * 0.09));
    const coverage = Math.floor(maxBet * 0.4);
    if (!curPlayer || curPlayer.chips < premium) return;
    setPlayers(prev => prev.map(p => p.id === curPlayer.id ? { ...p, chips: p.chips - premium, insurance: { premium, coverage } } : p));
    addLog(`🛡️ ${curPlayer.name} insures for $${premium} (covers $${coverage}).`);
    setSheet(null);
  };

  const makeOffer = (targetId, offerData, isBuying) => {
    const offer = { buyerId: isBuying ? curPlayer.id : targetId, sellerId: isBuying ? targetId : curPlayer.id, chips: offerData.chips, pct: offerData.pct, desc: offerData.desc, kind: offerData.kind };
    setSheet(null); setTradeMode(null);
    const target = players.find(p => p.id === targetId);
    if (target.isBot) {
      botRespondToOffer(offer);
    } else {
      setPendingOffer(offer);
      addLog(`${curPlayer?.name} ${isBuying ? "wants to buy" : "offers to sell"}: ${offerData.desc}.`);
    }
  };

  // incomingOffer: human is the SELLER and a bot/human wants to buy their hand
  // incomingCounter: human is the BUYER and the bot countered their purchase offer
  // incomingSellCounter: human is the SELLER and bot countered their sell offer (bot wants less)
  const incomingOffer = pendingOffer && !pendingOffer.isCounter && pendingOffer.sellerId === curPlayer?.id && !curPlayer?.isBot ? pendingOffer : null;
  const incomingCounter = pendingOffer && pendingOffer.isCounter && (
    pendingOffer.buyerId === curPlayer?.id || pendingOffer.sellerId === curPlayer?.id
  ) && !curPlayer?.isBot ? pendingOffer : null;
  const isHumanTurn = phase === "betting" && isHumanSlot && !locked && !waitingForRoll && !curSlot?.skipped;

  if (showRules) return <RulesPage onClose={() => setShowRules(false)} />;

  if (phase === "over") {
    const w = players.reduce((a, b) => a.chips > b.chips ? a : b);
    // In career mode, kick the session-end through the effect below; render
    // nothing so we don't flash the standard Game Over screen.
    if (isCareer) return null;
    return (
      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"radial-gradient(ellipse at 50% 30%,#122A18,#060D08)", gap:20, padding:32, textAlign:"center" }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"3.5rem", color:"#D4A843", fontWeight:900, textShadow:"0 0 48px rgba(212,168,67,0.5)", letterSpacing:"0.02em" }}>Game Over</div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"1.4rem", color:"rgba(245,237,216,0.85)", fontWeight:400 }}>{w?.name} wins with ${w?.chips}!</div>
        <button onClick={onExit} style={{ ...gBtn, marginTop:12, fontSize:"1.1rem", padding:"16px 36px" }}>Play Again</button>
      </div>
    );
  }

  const seatPos = getSeatPositions(players, landscape);
  const banner =
    phase==="ante" ? "Replenishing the pot…"
    : phase==="blindBet" ? "Blind betting…"
    : phase==="dealing" ? "Dealing cards…"
    : phase==="preBuy" ? "Buy hands before bidding…"
    : phase==="betting"
      ? (waitingForRoll ? `${curPlayer?.name} — ready?`
        : curPlayer?.isBot ? `${curPlayer?.name} is thinking…`
        : curSlot?.isBought ? `${curPlayer?.name} — play the bought hand`
        : `${curPlayer?.name} — your turn`)
    : phase==="roundEnd" ? `Round ${round} complete`
    : "";

  return (
    <div style={{ position:"fixed", inset:0, display:"flex", flexDirection:landscape?"row":"column", background:"radial-gradient(ellipse at 50% 20%,#0E2A14 0%,#060D08 65%,#030806 100%)", overflow:"hidden", paddingTop:"env(safe-area-inset-top)" }}>

      {/* ── Premium Header — DOINK · Round · Pot · Status ── */}
      <div style={{
        display:"flex", justifyContent:"space-between", alignItems:"center",
        padding:landscape?"10px 14px":"12px 16px 10px",
        zIndex:30, flexShrink:0,
        background:"linear-gradient(180deg, rgba(8,16,10,0.92) 0%, rgba(3,8,5,0.78) 60%, rgba(3,8,5,0.2) 100%)",
        backdropFilter:"blur(14px)",
        flexDirection:landscape?"column":"row",
        width:landscape?"auto":"100%",
        gap:landscape?10:0,
        borderBottom:"1px solid rgba(212,168,67,0.12)",
        boxShadow:"0 4px 18px rgba(0,0,0,0.4)",
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:landscape?"1.25rem":"1.4rem", color:"#D4A843", fontWeight:900, letterSpacing:"0.06em", textShadow:"0 0 18px rgba(212,168,67,0.4)", lineHeight:1 }}>DOINK</div>
          <div style={{ width:1, height:22, background:"rgba(212,168,67,0.25)" }} aria-hidden="true"/>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.1 }}>
            <div style={{ fontSize:"0.55rem", letterSpacing:"0.16em", color:"rgba(212,168,67,0.5)", fontWeight:700, textTransform:"uppercase" }}>Round</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#F0C96A", fontWeight:700 }}>{round}</div>
          </div>
          <div style={{ width:1, height:22, background:"rgba(212,168,67,0.25)" }} aria-hidden="true"/>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1.1 }}>
            <div style={{ fontSize:"0.55rem", letterSpacing:"0.16em", color:"rgba(212,168,67,0.5)", fontWeight:700, textTransform:"uppercase" }}>Pot</div>
            <AnimatedNumber value={pot} duration={700} style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#F0C96A", fontWeight:700 }}/>
          </div>
        </div>
        {!landscape && <div role="status" aria-live="polite" style={{ flex:1, minWidth:0, fontSize:"0.78rem", color:"rgba(245,237,216,0.62)", textAlign:"center", fontWeight:500, padding:"0 8px", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{banner}</div>}
        <div style={{ display:"flex", gap:6, flexDirection:landscape?"column":"row", alignItems:"center", flexShrink:0 }}>
          {!isCareer && <button onClick={() => setHintsOn(h => !h)} aria-pressed={hintsOn} style={{ padding:"5px 10px", borderRadius:8, fontSize:"0.7rem", fontWeight:600, background:hintsOn?"rgba(212,168,67,0.18)":"rgba(255,255,255,0.05)", border:hintsOn?"1px solid rgba(212,168,67,0.4)":"1px solid rgba(255,255,255,0.1)", color:hintsOn?"#D4A843":"rgba(245,237,216,0.35)", cursor:"pointer" }}>Hints {hintsOn?"ON":"OFF"}</button>}
          <button onClick={() => setShowRules(true)} style={{ padding:"5px 10px", borderRadius:8, fontSize:"0.7rem", fontWeight:600, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(245,237,216,0.45)", cursor:"pointer" }}>Rules</button>
          <button onClick={onExit} style={{ padding:"5px 10px", borderRadius:8, fontSize:"0.7rem", fontWeight:600, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.1)", color:"rgba(245,237,216,0.45)", cursor:"pointer" }}>Exit</button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ flex:1, position:"relative", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
        {landscape && <div style={{ position:"absolute", top:8, left:"50%", transform:"translateX(-50%)", fontSize:"0.78rem", color:"rgba(245,237,216,0.45)", zIndex:20, whiteSpace:"nowrap", fontWeight:500 }}>{banner}</div>}

        {/*
          PREMIUM TABLE — built from stacked layers so it reads as a rendered
          3D asset rather than a flat vector oval:
            1. drop shadow      — soft dark ellipse beneath the table
            2. outer rail       — padded black/brown leather, capsule shape
            3. rail highlight   — subtle top sheen on the leather
            4. gold trim ring   — thin metallic band between rail and felt
            5. felt             — deep realistic green, inner vignette
          The whole thing is a tall vertical capsule in portrait.
          To later swap in an image asset: replace layers 2-4 with a single
          <div> whose background is the table PNG, keeping the felt layer.
        */}
        {(() => {
          // Tall vertical capsule. Width is the limiter on phones; height is
          // capped so it never collides with header / bottom controls.
          const railW = landscape ? "min(64vh,520px)" : "min(86vw,440px)";
          const railH = landscape ? "min(82vh,420px)" : "min(116vw,560px)";
          const radius = landscape ? "46% / 50%" : "44% / 50%";
          return (
            <>
              {/* 1. Drop shadow */}
              <div aria-hidden="true" style={{
                position:"absolute", width:railW, height:railH,
                borderRadius: radius,
                background:"#000",
                filter:"blur(38px)", opacity:0.7,
                transform:"translateY(26px) scale(0.96)",
              }}/>
              {/* 2. Outer leather rail */}
              <div aria-hidden="true" style={{
                position:"absolute", width:railW, height:railH,
                borderRadius: radius,
                background:"radial-gradient(ellipse at 50% 32%, #2A1C10 0%, #1A1009 48%, #0C0703 100%)",
                boxShadow:"0 28px 80px rgba(0,0,0,0.9), inset 0 3px 8px rgba(120,86,46,0.35), inset 0 -10px 30px rgba(0,0,0,0.85)",
              }}/>
              {/* 3. Rail top sheen — padded leather catches light up top */}
              <div aria-hidden="true" style={{
                position:"absolute", width:railW, height:railH,
                borderRadius: radius,
                background:"radial-gradient(ellipse at 50% 8%, rgba(150,108,58,0.45) 0%, rgba(150,108,58,0.12) 22%, transparent 42%)",
                pointerEvents:"none",
              }}/>
              {/* Stitch line on the rail */}
              <div aria-hidden="true" style={{
                position:"absolute",
                width:landscape?"calc(min(64vh,520px) - 30px)":"calc(min(86vw,440px) - 30px)",
                height:landscape?"calc(min(82vh,420px) - 30px)":"calc(min(116vw,560px) - 30px)",
                borderRadius: radius,
                border:"1.5px dashed rgba(180,135,75,0.28)",
                pointerEvents:"none",
              }}/>
              {/* 4. Gold trim ring */}
              <div aria-hidden="true" style={{
                position:"absolute",
                width:landscape?"calc(min(64vh,520px) - 58px)":"calc(min(86vw,440px) - 58px)",
                height:landscape?"calc(min(82vh,420px) - 58px)":"calc(min(116vw,560px) - 58px)",
                borderRadius: radius,
                background:"linear-gradient(160deg, #6E5018 0%, #D4A843 30%, #F4D27A 50%, #C99536 70%, #5C420F 100%)",
                boxShadow:"0 0 18px rgba(212,168,67,0.35), inset 0 1px 2px rgba(255,240,200,0.5)",
                padding:6,
              }}/>
              {/* 5. Felt */}
              <div style={{
                position:"absolute",
                width:landscape?"calc(min(64vh,520px) - 70px)":"calc(min(86vw,440px) - 70px)",
                height:landscape?"calc(min(82vh,420px) - 70px)":"calc(min(116vw,560px) - 70px)",
                borderRadius: radius,
                background:"radial-gradient(ellipse at 50% 38%, #2A8C46 0%, #176A30 42%, #0C4A1F 72%, #052C10 100%)",
                boxShadow:"inset 0 8px 40px rgba(0,0,0,0.62), inset 0 0 90px rgba(0,0,0,0.42), inset 0 -6px 20px rgba(0,0,0,0.5)",
                overflow:"hidden",
              }}>
                {/* Fine felt weave texture */}
                <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 4px),repeating-linear-gradient(-45deg,#fff 0,#fff 1px,transparent 1px,transparent 4px)" }}/>
                {/* Soft center light pool */}
                <div style={{ position:"absolute", top:"34%", left:"50%", transform:"translate(-50%,-50%)", width:"70%", height:"42%", background:"radial-gradient(ellipse, rgba(120,220,150,0.18) 0%, transparent 70%)", pointerEvents:"none" }}/>
                {/* DOINK watermark */}
                <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:landscape?"3.6rem":"4rem", color:"rgba(240,201,106,0.08)", letterSpacing:"0.06em", textShadow:"0 2px 0 rgba(0,0,0,0.2)", pointerEvents:"none", whiteSpace:"nowrap" }}>DOINK</div>
                {/* Payout key — curved across the upper felt */}
                <div style={{ position:"absolute", top:"11%", left:"50%", transform:"translateX(-50%)", display:"flex", gap:landscape?20:14, alignItems:"center", pointerEvents:"none", opacity:0.7 }}>
                  {[{label:"SPREAD",pay:"1:1",color:"rgba(245,237,216,0.9)"},{label:"BLIND",pay:"2:1",color:"#F0C96A"},{label:"DOINK",pay:"7:1",color:"#E74C3C"},{label:"MYTHICAL",pay:"12:1",color:"#C39BD3"}].map(({label,pay,color})=>(
                    <div key={label} style={{ textAlign:"center", lineHeight:1.2 }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:landscape?"0.95rem":"1.02rem", color, fontWeight:700, letterSpacing:"0.04em", textShadow:"0 1px 3px rgba(0,0,0,0.7)" }}>{pay}</div>
                      <div style={{ fontSize:landscape?"0.52rem":"0.55rem", color:"rgba(245,237,216,0.5)", fontWeight:600, letterSpacing:"0.16em", marginTop:1 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          );
        })()}

        <PotDisplay pot={pot} potAnim={potAnim} delta={potDelta} landscape={landscape} />

        <HistoryStrip history={history} landscape={landscape} />

        {/* Bot "thinking" banner — large, centered, unmistakable */}
        {botThinking !== null && !betMarker && (() => {
          const bp = players.find(p => p.id === botThinking);
          if (!bp) return null;
          return (
            <div className="pop" aria-live="polite" style={{
              position:"absolute",
              top: landscape ? "60%" : "62%",
              left:"50%",
              transform:"translate(-50%,-50%)",
              animation: "breathe 2.4s ease-in-out infinite",
              zIndex:19,
              display:"flex", alignItems:"center", gap:10,
              padding:"12px 22px",
              background:"linear-gradient(180deg, #0E1C12 0%, #060D08 100%)",
              border:"1.5px solid rgba(212,168,67,0.55)",
              borderRadius:18,
              boxShadow:"0 10px 36px rgba(0,0,0,0.85), 0 0 32px rgba(212,168,67,0.28), inset 0 1px 0 rgba(240,201,106,0.18)",
              pointerEvents:"none",
              minWidth:200,
              justifyContent:"center",
            }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#D4A843", fontWeight:700, letterSpacing:"0.02em" }}>{bp.name}</span>
              <span style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.6)", fontWeight:500, fontStyle:"italic" }}>is thinking</span>
              <span style={{ display:"flex", gap:4 }}>
                {[0,1,2].map(i => (
                  <span key={i} style={{ width:5, height:5, borderRadius:"50%", background:"#D4A843", animation:`pulse 1.2s ${i*0.18}s infinite` }}/>
                ))}
              </span>
            </div>
          );
        })()}

        {betMarker && (
          <BetMarker
            marker={betMarker}
            playerName={players.find(p => p.id === betMarker.playerId)?.name}
            landscape={landscape}
          />
        )}

        {/* ── Seats ── */}
        {/* Card scale shrinks with player count so cards on the sides still fit
            on-screen when the table is crowded.
              ≤4 players → 1.0  (no shrink)
               5 players → 0.86
               6 players → 0.76
               7 players → 0.68
               8 players → 0.62
        */}
        {players.map(p => {
          const isActiveSlot = curSlot && curSlot.playerId === p.id;
          const slotAnim = seatAnims[p.id] || null;
          const outerClass = slotAnim==="win"?"win-blast":slotAnim==="doink"?"doink-explosion big-shake":slotAnim==="miss"?"miss-flash":"";
          const sz = landscape ? 30 : 36;
          const isInactiveAndPlaying = !isActiveSlot && (phase === "betting" || phase === "blindBet");
          const cardScale = players.length <= 4 ? 1
                          : players.length === 5 ? 0.86
                          : players.length === 6 ? 0.76
                          : players.length === 7 ? 0.68
                          : 0.62;
          return (
            <div key={p.id} className={outerClass} style={{ position:"absolute", left:`${seatPos[p.id]?.x}%`, top:`${seatPos[p.id]?.y}%`, transform:`translate(-50%,-50%) scale(${isActiveSlot?1.08:isInactiveAndPlaying?0.92:1})`, display:"flex", flexDirection:"column", alignItems:"center", gap:4, zIndex:isActiveSlot?22:6, borderRadius:14, padding:3, opacity: isInactiveAndPlaying ? 0.55 : 1, transition:"opacity .35s ease, transform .35s ease" }}>
              <div style={{ position:"relative" }}>
                <Avatar seed={p.avatarSeed} size={sz} active={isActiveSlot} name={p.name} isHuman={!p.isBot} />
                {pendingOffer&&pendingOffer.sellerId===p.id&&<div style={{ position:"absolute", top:-3, right:-3, width:11, height:11, borderRadius:"50%", background:"#D4A843", border:"2px solid #060D08", animation:"pulse 1s infinite" }}/>}
                {botThinking === p.id && (
                  <div style={{ position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%)", display:"flex", gap:3, padding:"3px 7px", borderRadius:10, background:"rgba(212,168,67,0.95)", border:"1px solid #8A6010", boxShadow:"0 2px 8px rgba(0,0,0,0.6)" }}>
                    {[0,1,2].map(i => (
                      <div key={i} style={{ width:3, height:3, borderRadius:"50%", background:"#1A0E00", opacity:0.4, animation:`pulse 1.2s ${i*0.18}s infinite` }}/>
                    ))}
                  </div>
                )}
              </div>
              <div style={{
                background: isActiveSlot
                  ? "linear-gradient(180deg, rgba(80,55,15,0.55), rgba(20,12,4,0.85))"
                  : "linear-gradient(180deg, rgba(20,30,22,0.75), rgba(4,8,6,0.92))",
                backdropFilter:"blur(8px)",
                border: isActiveSlot ? "1.5px solid #D4A843" : "1px solid rgba(255,255,255,0.1)",
                borderRadius:13, padding:"5px 12px 4px", minWidth:64, textAlign:"center",
                boxShadow: isActiveSlot
                  ? "0 0 22px rgba(212,168,67,0.45), inset 0 1px 0 rgba(240,201,106,0.35), inset 0 -1px 0 rgba(0,0,0,0.45)"
                  : "0 3px 10px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.45)",
                transition:"all .3s",
              }}>
                <div style={{ fontSize:landscape?"0.58rem":"0.62rem", fontWeight:600, color: isActiveSlot ? "#F0C96A" : "rgba(245,237,216,0.72)", whiteSpace:"nowrap", maxWidth:80, overflow:"hidden", textOverflow:"ellipsis", letterSpacing:"0.04em", textTransform:"uppercase" }}>{p.name}</div>
                <AnimatedNumber value={p.chips} duration={650} style={{ fontFamily:"'Playfair Display',serif", fontSize:landscape?"0.95rem":"1.05rem", color:"#F0C96A", fontWeight:700, lineHeight:1.1, marginTop:1, display:"block", textShadow: isActiveSlot ? "0 0 14px rgba(212,168,67,0.55)" : "none" }}/>
              </div>
              {p.cards.length > 0 && (
                <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                  {p.c1?<Card card={p.cards[0]} small glow={isActiveSlot&&!p.isBot} animClass="deal-anim" scale={cardScale}/>:<Placeholder small scale={cardScale}/>}
                  {p.c2?<Card card={p.cards[1]} small glow={isActiveSlot&&!p.isBot} animClass="deal-anim" scale={cardScale}/>:<Placeholder small scale={cardScale}/>}
                  {p.hitCard&&<><div style={{width:3,height:26*cardScale,borderLeft:"1px solid rgba(255,255,255,0.18)",margin:"0 2px"}}/><Card card={p.hitCard} small animClass="hit-anim" glow={slotAnim==="win"} scale={cardScale}/></>}
                </div>
              )}
              {slotAnim && (
                <div style={{ fontSize:slotAnim==="doink"?"0.78rem":"0.6rem", padding:slotAnim==="doink"?"4px 12px":"2px 8px", borderRadius:10, fontWeight:700, background:slotAnim==="win"?"rgba(39,174,96,0.2)":slotAnim==="doink"?"rgba(231,76,60,0.28)":"rgba(255,255,255,0.05)", border:slotAnim==="win"?"1.5px solid rgba(39,174,96,0.55)":slotAnim==="doink"?"2px solid rgba(231,76,60,0.75)":"1px solid transparent", color:slotAnim==="win"?"#27AE60":slotAnim==="doink"?"#E74C3C":slotAnim==="miss"?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.2)", textShadow:slotAnim==="doink"?"0 0 18px rgba(231,76,60,0.9)":slotAnim==="win"?"0 0 10px rgba(39,174,96,0.7)":"none" }}>
                  {slotAnim==="win"?"WIN":slotAnim==="doink"?"💥 DOINK!":slotAnim==="miss"?"MISS":"PASS"}
                </div>
              )}
              {p.comment && (
                <div className="pop" style={{
                  position:"absolute", top:-44, left:"50%", transform:"translateX(-50%)",
                  background:"linear-gradient(180deg, rgba(14,28,18,0.97), rgba(6,12,8,0.98))",
                  backdropFilter:"blur(10px)",
                  border:"1px solid rgba(212,168,67,0.4)",
                  borderRadius:14,
                  padding:"7px 12px",
                  fontSize:"0.72rem",
                  color:"#F5EDD8",
                  fontStyle:"italic",
                  fontWeight:500,
                  lineHeight:1.3,
                  textAlign:"center",
                  maxWidth:200,
                  zIndex:50,
                  boxShadow:"0 8px 24px rgba(0,0,0,0.85), 0 0 14px rgba(212,168,67,0.18), inset 0 1px 0 rgba(212,168,67,0.18)",
                }}>
                  {p.comment}
                  <div aria-hidden="true" style={{
                    position:"absolute", bottom:-6, left:"50%", transform:"translateX(-50%) rotate(45deg)",
                    width:10, height:10,
                    background:"rgba(6,12,8,0.98)",
                    borderRight:"1px solid rgba(212,168,67,0.4)",
                    borderBottom:"1px solid rgba(212,168,67,0.4)",
                  }}/>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Log drawer ── */}
      <LogDrawer log={log} landscape={landscape} />

      {/* ── PREBUY PHASE: human can buy hands before bidding ── */}
      {phase==="preBuy" && !sheet && !pendingSellOffer && humanPlayer && (
        <div className="pop" style={{ flexShrink:0, padding:`16px 22px calc(20px + env(safe-area-inset-bottom))`, zIndex:28, background:"linear-gradient(0deg,rgba(3,6,4,0.99),rgba(3,6,4,0.85))", borderTop:"1px solid rgba(212,168,67,0.18)", textAlign:"center" }}>
          <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.55)", fontWeight:500, marginBottom:6 }}>Cards are dealt</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#D4A843", fontWeight:700, marginBottom:14 }}>Buy a hand, or wait for bidding</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => { setTradeMode("buy"); setSheet("trade"); }} style={{ ...gBtn, fontSize:"0.95rem" }}>🤝 Buy a Hand</button>
            <button onClick={() => { setPhase("betting"); addLog("Bidding begins."); }} style={{ ...sBtn, fontSize:"0.95rem" }}>Skip to Bidding →</button>
          </div>
        </div>
      )}

      {/* ── HUMAN'S OWN SELL OFFER STATUS ── */}
      {pendingSellOffer && pendingSellOffer.sellerId === humanPlayer?.id && !sheet && (
        <div className="pop" style={{ flexShrink:0, padding:`14px 18px calc(16px + env(safe-area-inset-bottom))`, zIndex:29, background:"linear-gradient(0deg,rgba(8,14,4,0.99),rgba(8,14,4,0.9))", borderTop:"2px solid rgba(212,168,67,0.3)", textAlign:"center" }}>
          <div style={{ fontSize:"0.75rem", color:"rgba(245,237,216,0.5)", fontWeight:500, marginBottom:4 }}>Your sell offer is live</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.15rem", color:"#F0C96A", fontWeight:700, marginBottom:10 }}>{pendingSellOffer.desc}</div>
          <div style={{ fontSize:"0.75rem", color:"rgba(245,237,216,0.4)", marginBottom:12 }}>Waiting for someone to accept…</div>
          <button onClick={withdrawSellOffer} style={{ ...sBtn, fontSize:"0.9rem" }}>Withdraw Offer</button>
        </div>
      )}

      {/* ── INCOMING TABLE SELL OFFER: any bot put a hand up for sale ── */}
      {pendingSellOffer && pendingSellOffer.sellerId !== humanPlayer?.id && !sheet && humanPlayer && (() => {
        const seller = players.find(p => p.id === pendingSellOffer.sellerId);
        const canAfford = (humanPlayer.chips || 0) >= (pendingSellOffer.chips || 0);
        return (
          <div className="pop" style={{ flexShrink:0, padding:`14px 18px calc(16px + env(safe-area-inset-bottom))`, zIndex:29, background:"linear-gradient(0deg,rgba(2,8,14,0.99),rgba(2,8,14,0.92))", borderTop:"2px solid rgba(212,168,67,0.3)" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
              <Avatar seed={seller?.avatarSeed||0} size={40} active name={seller?.name} isHuman={seller?seller.isBot===false:false} />
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.9rem", fontWeight:700, color:"#D4A843", marginBottom:2 }}>{seller?.name} is selling their hand</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#F0C96A", fontWeight:700, marginBottom:2 }}>{pendingSellOffer.desc}</div>
                <div style={{ fontSize:"0.75rem", color:"rgba(245,237,216,0.45)" }}>Pay them now and play their hand. Win → they get their %.</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
              <button onClick={() => acceptOffer(pendingSellOffer, humanPlayer.id)} disabled={!canAfford} style={{ ...gBtn, background: canAfford?"linear-gradient(145deg,#0E4A1E,#27AE60)":"rgba(255,255,255,0.07)", color:canAfford?"#fff":"rgba(255,255,255,0.3)", fontSize:"0.95rem" }}>
                {canAfford ? "Accept ✓" : "Can't Afford"}
              </button>
              <button onClick={() => setPendingSellOffer(null)} style={{ ...sBtn, fontSize:"0.95rem" }}>Pass</button>
            </div>
          </div>
        );
      })()}

      {/* ── LET'S ROLL ── */}
      {waitingForRoll && !sheet && phase==="betting" && (
        <div className="pop" style={{ flexShrink:0, padding:`16px 22px calc(20px + env(safe-area-inset-bottom))`, zIndex:28, background:"linear-gradient(0deg,rgba(3,6,4,0.99),rgba(3,6,4,0.85))", borderTop:"1px solid rgba(212,168,67,0.18)", textAlign:"center" }}>
          <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.5)", fontWeight:500, marginBottom:6 }}>
            {curSlot?.isBought?"Time to play your bought hand":"Cards are dealt — you're up"}
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"#D4A843", fontWeight:700, marginBottom:14 }}>{curPlayer?.name}</div>
          <button onClick={() => setWaitingForRoll(false)} style={{ ...gBtn, fontSize:"1rem", padding:"14px 36px" }}>
            {curSlot?.isBought?"Play Bought Hand 🃏":"Let's Roll 🎲"}
          </button>
        </div>
      )}

      {/* ── MAIN BET PANEL ── */}
      {isHumanTurn && !sheet && !(incomingOffer||incomingCounter) && (() => {
        const rec = curSlot?.cards?.length === 2 ? getRecommendation(curSlot.cards[0], curSlot.cards[1]) : null;
        const cantBet = (curPlayer?.chips || 0) <= 0 || pot <= 0;
        return (
        <div className="pop" style={{
          flexShrink:0,
          padding:`16px 18px calc(14px + env(safe-area-inset-bottom))`,
          zIndex:28,
          background:"linear-gradient(180deg, rgba(8,18,11,0.78) 0%, rgba(3,8,5,0.96) 28%, rgba(3,8,5,1) 100%)",
          backdropFilter:"blur(16px)",
          borderTop: curSlot?.isBought
            ? "1.5px solid rgba(212,168,67,0.5)"
            : "1px solid rgba(212,168,67,0.22)",
          boxShadow: curSlot?.isBought
            ? "0 -8px 32px rgba(212,168,67,0.18), inset 0 1px 0 rgba(212,168,67,0.18)"
            : "0 -8px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,168,67,0.08)",
        }}>
          {curSlot?.isBought ? (
            <div style={{ textAlign:"center", fontFamily:"'Playfair Display',serif", fontSize:"0.78rem", color:"#F0C96A", fontWeight:700, letterSpacing:"0.12em", marginBottom:8, textTransform:"uppercase" }}>♦ Bought Hand ♦</div>
          ) : (
            <div style={{ textAlign:"center", fontSize:"0.6rem", color:"rgba(212,168,67,0.6)", fontWeight:700, letterSpacing:"0.24em", marginBottom:8, textTransform:"uppercase" }}>Your Hand</div>
          )}
          <div style={{ display:"flex", justifyContent:"center", alignItems:"center", gap:14, marginBottom:12 }}>
            {curSlot?.cards?.[0]?<Card card={curSlot.cards[0]} glow/>:<Placeholder/>}
            <div style={{ textAlign:"center", flex:1, maxWidth:160 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:700, color:"#D4A843", marginBottom:2 }}>{curPlayer?.name}</div>
              <div style={{ fontSize:"0.74rem", color:"rgba(245,237,216,0.5)", fontWeight:500, marginBottom:8 }}>
                {slotSpread?.mythical?"✨ Mythical Spread!":slotSpread?.v===0?"⚠️ Same Rank":`Spread of ${slotSpread?.v}`}
              </div>
              {hintsOn && curSlot?.cards && <HintBar cards={curSlot.cards}/>}
              {hintsOn && rec && (
                <div style={{ fontSize:"0.7rem", color:rec.color, fontWeight:700, letterSpacing:"0.04em", marginTop:6 }}>
                  <span style={{ color:"rgba(245,237,216,0.4)", fontWeight:500 }}>Rec: </span>{rec.label}
                </div>
              )}
            </div>
            {curSlot?.cards?.[1]?<Card card={curSlot.cards[1]} glow/>:<Placeholder/>}
          </div>
          <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap", marginBottom:8 }}>
            <button onClick={()=>{setBetVal(0);setSheet("bet");}} disabled={cantBet} style={{...gBtn, opacity:cantBet?0.4:1}}>BET SPREAD</button>
            <button onClick={()=>{setBetVal(0);setSheet("doinkBet");}} disabled={cantBet} style={{...dBtn, opacity:cantBet?0.4:1}}>💥 DOINK BET</button>
            {slotSpread?.mythical&&<button onClick={()=>{setBetVal(0);setSheet("mythical");}} disabled={cantBet} style={{...pBtn, opacity:cantBet?0.4:1}}>✨ MYTHICAL</button>}
            <button onClick={humanPass} style={sBtn}>PASS</button>
          </div>
          {cantBet && (
            <div style={{ textAlign:"center", fontSize:"0.72rem", color:"rgba(231,76,60,0.7)", fontWeight:600, marginBottom:6 }}>
              {pot<=0 ? "Pot is empty — only pass available." : "Out of chips."}
            </div>
          )}
          <div style={{ display:"flex", justifyContent:"center" }}>
            <button onClick={() => setShowSecondary(s => !s)} style={{ background:"transparent", border:"none", color:"rgba(212,168,67,0.55)", fontSize:"0.78rem", fontWeight:600, padding:"6px 10px", cursor:"pointer", letterSpacing:"0.04em" }}>
              {showSecondary ? "▴ Hide options" : "▾ More options"}
            </button>
          </div>
          {showSecondary && (
            <div className="fade-up" style={{ display:"flex", gap:6, justifyContent:"center", flexWrap:"wrap", marginTop:4 }}>
              {!curSlot?.isBought&&<button onClick={()=>{setShowSecondary(false);setSheet("insurance");}} disabled={cantBet} style={{ ...sBtn, fontSize:"0.82rem", padding:"8px 14px", opacity:cantBet?0.4:1 }}>🛡️ Insurance</button>}
              <button onClick={()=>{setShowSecondary(false);setTradeMode("buy");setSheet("trade");}} style={{ ...sBtn, fontSize:"0.82rem", padding:"8px 14px" }}>🤝 Buy Hand</button>
              <button onClick={()=>{setShowSecondary(false);setTradeMode("sell");setSheet("trade");}} style={{ ...sBtn, fontSize:"0.82rem", padding:"8px 14px" }}>💰 Sell Hand</button>
            </div>
          )}
        </div>
        );
      })()}

      {/* ── INCOMING OFFER ── */}
      {(incomingOffer || incomingCounter) && !sheet && isHumanTurn && (
        <div className="pop" style={{ flexShrink:0, padding:`14px 18px calc(16px + env(safe-area-inset-bottom))`, zIndex:29, background:"linear-gradient(0deg,rgba(2,8,14,0.99),rgba(2,8,14,0.92))", borderTop:"2px solid rgba(212,168,67,0.3)" }}>
          {(() => {
            const offer = incomingOffer || incomingCounter;
            const humanIsSeller = offer.sellerId === curPlayer?.id;
            const otherPartyId = humanIsSeller ? offer.buyerId : offer.sellerId;
            const otherParty = players.find(p => p.id === otherPartyId);
            const headline = offer.isCounter
              ? humanIsSeller ? `${otherParty?.name} counters your sell offer` : `${otherParty?.name} counters your buy offer`
              : `${otherParty?.name} wants to buy your hand`;
            const subline = humanIsSeller ? "They'll play both hands. You collect now." : "They'll sell you their hand to play alongside yours.";
            return (
              <>
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                  <Avatar seed={otherParty?.avatarSeed||0} size={40} active name={otherParty?.name} isHuman={otherParty?otherParty.isBot===false:false} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:"0.9rem", fontWeight:700, color:"#D4A843", marginBottom:2 }}>{headline}</div>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#F0C96A", fontWeight:700, marginBottom:2 }}>{offer.desc}</div>
                    <div style={{ fontSize:"0.75rem", color:"rgba(245,237,216,0.45)", fontWeight:400 }}>{subline}</div>
                  </div>
                </div>
                <div style={{ display:"flex", gap:8, justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={() => acceptOffer(offer)} style={{ ...gBtn, background:"linear-gradient(145deg,#0E4A1E,#27AE60)", color:"#fff", fontSize:"0.95rem" }}>Accept ✓</button>
                  <button onClick={declineOffer} style={{ ...sBtn, fontSize:"0.95rem" }}>Decline</button>
                  <button onClick={() => setSheet("counter")} style={{ ...sBtn, fontSize:"0.95rem" }}>Counter ⚖️</button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── BLIND BET PANEL ── */}
      {phase==="blindBet" && curPlayer && !curPlayer.isBot && !sheet && (
        <div className="pop" style={{ flexShrink:0, padding:`14px 18px calc(16px + env(safe-area-inset-bottom))`, zIndex:28, background:"linear-gradient(0deg,rgba(3,6,4,0.99),rgba(3,6,4,0.88))", borderTop:"1px solid rgba(212,168,67,0.15)" }}>
          <div style={{ textAlign:"center", marginBottom:12 }}>
            <span style={{ fontSize:"1rem", fontWeight:700, color:"#D4A843" }}>{curPlayer.name}</span>
            <span style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.45)", marginLeft:8 }}>— blind bet before your cards?</span>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={() => { setBetVal(0); setSheet("blindBet"); }} style={gBtn}>🎰 Blind Bet</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Skip</button>
          </div>
        </div>
      )}

      {phase==="roundEnd" && (
        <RoundSummary
          players={players}
          prevChips={prevChips}
          pot={pot}
          round={round}
          history={history}
          onNext={nextRound}
          mode={cfg.mode}
          onCashOut={isCareer ? (() => finishCareerSession("cashout")) : undefined}
          humanPlayerId={players.find(p => !p.isBot)?.id}
        />
      )}

      {/* ═══ SHEETS ═══ */}
      {sheet==="blindBet" && (
        <Sheet title="🎰 Blind Bet" subtitle="Bet before your cards are dealt. A hit pays 2× from the pot." onClose={() => setSheet(null)} landscape={landscape}>
          <ChipSelector denoms={denoms} max={Math.min(pot, curPlayer?.chips||0)} value={betVal} onChange={setBetVal}/>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={humanBlindBet} disabled={betVal===0} style={{ ...gBtn, opacity:betVal===0?0.4:1 }}>Blind Bet ${betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
      )}
      {sheet==="bet" && (() => {
        // Spread pays 1:1, so the winnings can equal the pot — max = min(chips, pot).
        const max = Math.min(curPlayer?.chips || 0, pot);
        return (
        <Sheet title="Bet on Spread" subtitle={`If the hit card falls between yours — WIN. Pays 1:1. Max bet $${max} (can't win more than the pot).`} onClose={() => setSheet(null)} landscape={landscape}>
          <ChipSelector denoms={denoms} max={max} value={betVal} onChange={setBetVal}/>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={() => humanBet("spread")} disabled={betVal===0} style={{ ...gBtn, opacity:betVal===0?0.4:1 }}>Bet ${betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
        );
      })()}
      {sheet==="doinkBet" && (() => {
        // Doink pays 7:1; cap so winnings ≤ pot → bet ≤ floor(pot/7).
        const max = Math.min(curPlayer?.chips || 0, Math.floor(pot / 7));
        return (
        <Sheet title="💥 Doink Bet" subtitle={`Bet the hit card MATCHES one of yours. Pays 7× from the pot. Max bet $${max} (can't win more than the pot).`} onClose={() => setSheet(null)} landscape={landscape}>
          {max <= 0
            ? <div style={{ textAlign:"center", padding:"20px 16px", color:"rgba(245,237,216,0.55)", fontSize:"0.9rem" }}>Pot too small for a Doink Bet right now. You'd need at least $7 in the pot.</div>
            : <ChipSelector denoms={denoms} max={max} value={betVal} onChange={setBetVal}/>}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={() => humanBet("doink")} disabled={betVal===0||max<=0} style={{ ...dBtn, opacity:(betVal===0||max<=0)?0.4:1 }}>Doink Bet ${betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
        );
      })()}
      {sheet==="mythical" && (() => {
        // Mythical pays 12:1; cap so winnings ≤ pot → bet ≤ floor(pot/12).
        const max = Math.min(curPlayer?.chips || 0, Math.floor(pot / 12));
        return (
        <Sheet title="✨ Mythical Split" subtitle={`Your cards are exactly 2 apart. Pays 12×. Max bet $${max} (can't win more than the pot).`} onClose={() => setSheet(null)} landscape={landscape}>
          {max <= 0
            ? <div style={{ textAlign:"center", padding:"20px 16px", color:"rgba(245,237,216,0.55)", fontSize:"0.9rem" }}>Pot too small for a Mythical Bet right now. You'd need at least $12 in the pot.</div>
            : <ChipSelector denoms={denoms} max={max} value={betVal} onChange={setBetVal}/>}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={() => humanBet("mythical")} disabled={betVal===0||max<=0} style={{ ...pBtn, opacity:(betVal===0||max<=0)?0.4:1 }}>Mythical ${betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
        );
      })()}
      {sheet==="insurance" && (
        <Sheet title="🛡️ Doink Insurance" subtitle="Pay a premium upfront. If you doink, a portion of your penalty is covered." onClose={() => setSheet(null)} landscape={landscape}>
          <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:14, padding:18, textAlign:"center", marginBottom:18, border:"1px solid rgba(255,255,255,0.08)" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"#D4A843", fontWeight:700, marginBottom:6 }}>Pay ${Math.max(1,Math.ceil(maxBet*0.09))} premium</div>
            <div style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.6)" }}>Covers ${Math.floor(maxBet*0.4)} of your doink penalty</div>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={buyInsurance} style={{ ...gBtn, background:"linear-gradient(145deg,#0E4A1E,#27AE60)", color:"#fff" }}>Buy Insurance</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Decline</button>
          </div>
        </Sheet>
      )}
      {sheet==="trade" && tradeMode==="sell" && (
        <Sheet title="💰 Sell Your Hand" subtitle="Broadcast your terms to the table. The first player to accept buys your hand. They pay you upfront and play your cards. If they win, you get your % of their winnings." onClose={() => setSheet(null)} landscape={landscape}>
          {curPlayer?.cards?.length === 2 && (() => {
            const { quality, base } = handValue(curPlayer.cards[0], curPlayer.cards[1], pot);
            const ql = quality<0.08?"Trash":quality<0.25?"Poor":quality<0.5?"Fair":"Good";
            const qlColor = quality<0.08?"#E74C3C":quality<0.25?"#E67E22":quality<0.5?"#F0C96A":"#27AE60";
            return (
              <div style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:14, border:"1px solid rgba(255,255,255,0.09)", marginBottom:14, textAlign:"center" }}>
                <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.5)", fontWeight:500, marginBottom:4 }}>Your hand quality</div>
                <div style={{ fontSize:"1.1rem", fontWeight:700, color:qlColor }}>{ql}</div>
                <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.55)", marginTop:2 }}>Suggested upfront: ${base}</div>
              </div>
            );
          })()}
          <OfferBuilder denoms={denoms} maxChips={curPlayer?.chips || 0} label="Broadcast Sell Offer" onCancel={() => setSheet(null)}
            onConfirm={offerData => {
              const sellOffer = {
                sellerId: curPlayer.id,
                chips: offerData.chips,
                pct: offerData.pct,
                desc: offerData.desc,
                kind: offerData.kind,
              };
              setPendingSellOffer(sellOffer);
              setSheet(null); setTradeMode(null);
              addLog(`📢 ${curPlayer.name} sells hand to the table: ${offerData.desc}.`);
              // Trigger bot evaluations
              setTimeout(() => evaluateBotSellResponses(sellOffer), 600);
            }}
          />
        </Sheet>
      )}
      {sheet==="trade" && tradeMode==="buy" && (
        <Sheet title="🤝 Buy a Hand" subtitle="Offer chips (plus optional % of winnings) for a specific player's hand. You play both yours and theirs, in order." onClose={() => setSheet(null)} landscape={landscape}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {players.filter(p => p.id !== curPlayer?.id && p.cards.length >= 2 && !p.done && !p.passed).map(target => {
              const { quality, base } = handValue(target.cards[0], target.cards[1], pot);
              const ql=quality<0.08?"Trash":quality<0.25?"Poor":quality<0.5?"Fair":"Good";
              const qlColor=quality<0.08?"#E74C3C":quality<0.25?"#E67E22":quality<0.5?"#F0C96A":"#27AE60";
              return (
                <div key={target.id} style={{ background:"rgba(255,255,255,0.04)", borderRadius:14, padding:14, border:"1px solid rgba(255,255,255,0.09)" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                    <Avatar seed={target.avatarSeed} size={36} name={target.name} isHuman={!target.isBot}/>
                    <div>
                      <div style={{ fontSize:"0.95rem", fontWeight:700, color:"#F5EDD8" }}>{target.name}</div>
                      <div style={{ fontSize:"0.78rem", fontWeight:600, color:qlColor }}>{ql} hand · suggest ${base}</div>
                    </div>
                  </div>
                  <OfferBuilder denoms={denoms} maxChips={curPlayer?.chips||0} label="Offer to Buy" onCancel={() => setSheet(null)} onConfirm={offerData => makeOffer(target.id, offerData, true)}/>
                </div>
              );
            })}
            {players.filter(p => p.id !== curPlayer?.id && p.cards.length >= 2 && !p.done && !p.passed).length === 0 && (
              <div style={{ textAlign:"center", color:"rgba(245,237,216,0.38)", fontSize:"0.9rem", padding:24 }}>No hands available to buy right now.</div>
            )}
          </div>
        </Sheet>
      )}
      {sheet==="counter"&&(incomingOffer||incomingCounter)&&(
        <Sheet title="⚖️ Counter Offer" subtitle={`Countering ${players.find(p=>p.id===(incomingOffer||incomingCounter).buyerId)?.name}'s offer`} onClose={() => setSheet(null)} landscape={landscape}>
          <OfferBuilder denoms={denoms} maxChips={curPlayer?.chips||0} label="Send Counter" onCancel={() => setSheet(null)}
            onConfirm={offerData => {
              const orig=incomingOffer||incomingCounter;
              const counter={...orig,chips:offerData.chips,pct:offerData.pct,desc:offerData.desc,kind:offerData.kind,isCounter:true};
              addLog(`${curPlayer?.name} counters: ${offerData.desc}.`);
              setSheet(null);
              const otherPartyId=orig.buyerId===curPlayer?.id?orig.sellerId:orig.buyerId;
              const otherParty=players.find(p=>p.id===otherPartyId);
              if(otherParty?.isBot){
                const sellerForVal=players.find(p=>p.id===orig.sellerId);
                const{base}=sellerForVal?.cards?.length===2?handValue(sellerForVal.cards[0],sellerForVal.cards[1],pot):{base:1};
                const val=(offerData.chips||0)+(offerData.pct||0)/100*pot*0.3;
                setTimeout(()=>{if(val>=base*0.65)acceptOffer(counter);else declineOffer();},700);
              } else setPendingOffer(counter);
            }}
          />
        </Sheet>
      )}

      {toast && <CommentToast msg={toast} onDone={() => setToast(null)} />}
      {outcomeModal && <OutcomeModal {...outcomeModal} onClose={() => setOutcomeModal(null)} />}
      {soldHandPlayback && <SoldHandPlayback data={soldHandPlayback} onDismiss={() => setSoldHandPlayback(null)} />}
      {pendingReveal && (
        <TapToReveal
          slot={pendingReveal.slot}
          amount={pendingReveal.amount}
          type={pendingReveal.type}
          onReveal={() => {
            const { slot, p, amount, type } = pendingReveal;
            setPendingReveal(null);
            execBet(slot, p, amount, type);
          }}
        />
      )}
      {replenishFlash && <ReplenishOverlay />}
      {doinkFlash && <DoinkFullScreen name={doinkFlash} />}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// TUTORIAL — paginated walkthrough
// ═══════════════════════════════════════════════════════════
function Tutorial({ onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      icon: "🃏",
      title: "Welcome to DOINK",
      body: "DOINK is a card-betting game of pure chaos. The pot is everyone's money. You bet against it on every hand. Win and you take a piece. Doink, and you pay the pot DOUBLE.",
    },
    {
      icon: "🎴",
      title: "Your Hand",
      body: "You get dealt two cards. You bet whether a third card — the 'hit' — falls between them in rank value. Aces are low.\n\nA hand of (3, J) is great — most cards fall between. A hand of (6, 7) is brutal — almost nothing fits.",
    },
    {
      icon: "💥",
      title: "The DOINK",
      body: "If the hit card matches one of YOUR card ranks, you DOINK. You pay the pot 2× your bet.\n\nThis is the game's signature pain. The narrower your spread, the higher the risk.",
    },
    {
      icon: "🎰",
      title: "Bet Types",
      body: "Spread Bet — bet between. Pays 1:1.\n💥 Doink Bet — bet on a MATCH. Pays 7:1.\n✨ Mythical Split — cards exactly 2 apart. The middle card pays 12:1.\n🎰 Blind Bet — before cards dealt. Pays 2:1.",
    },
    {
      icon: "🤝",
      title: "Trade Hands",
      body: "Before bidding, you can buy hands from other players. During the round, you can sell yours to the table — broadcast your terms and the first to accept takes over.\n\nIf they win, they pay you your agreed % of winnings.",
    },
    {
      icon: "♻️",
      title: "Replenish",
      body: "When the pot hits $0, everyone replenishes — pays back in — and play continues. The game keeps going until someone busts.\n\nReady?",
    },
  ];
  const s = steps[step];
  const isLast = step === steps.length - 1;
  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 10%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh", padding:`calc(env(safe-area-inset-top) + 16px) 24px calc(40px + env(safe-area-inset-bottom))` }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"#D4A843", fontWeight:700 }}>Tutorial</div>
          <button onClick={onClose} style={{ ...sBtn, padding:"8px 14px", fontSize:"0.85rem" }}>Skip ✕</button>
        </div>

        {/* Progress dots */}
        <div style={{ display:"flex", gap:6, justifyContent:"center", marginBottom:32 }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? 24 : 8, height:8, borderRadius:4, background: i === step ? "#D4A843" : i < step ? "rgba(212,168,67,0.45)" : "rgba(255,255,255,0.12)", transition:"all .2s" }}/>
          ))}
        </div>

        <div className="pop" key={step} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", maxWidth:480, margin:"0 auto", width:"100%", padding:"20px 16px" }}>
          <div style={{ fontSize:"4rem", marginBottom:24 }}>{s.icon}</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", color:"#D4A843", fontWeight:700, marginBottom:18, letterSpacing:"0.01em" }}>{s.title}</div>
          <div style={{ fontSize:"1rem", color:"rgba(245,237,216,0.78)", lineHeight:1.65, whiteSpace:"pre-line" }}>{s.body}</div>
        </div>

        <div style={{ display:"flex", gap:10, marginTop:24, justifyContent:"center" }}>
          {step > 0 && <button onClick={() => setStep(s => s - 1)} style={{ ...sBtn, fontSize:"0.95rem", padding:"14px 24px" }}>← Back</button>}
          <button onClick={() => isLast ? onClose() : setStep(s => s + 1)} style={{ ...gBtn, fontSize:"1rem", padding:"14px 32px" }}>
            {isLast ? "Let's Play" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HOME SCREEN — chooses between Career, Quick Play, Tutorial
// ─────────────────────────────────────────────────────────
function HomeScreen({ onCareer, onQuickPlay, onTutorial, hasCareer, onSignOut, onLeaderboard }) {
  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:`calc(env(safe-area-inset-top) + 40px) 22px calc(40px + env(safe-area-inset-bottom))` }}>
        <div style={{ textAlign:"center", marginBottom:52 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"clamp(4rem,16vw,6.5rem)", color:"#D4A843", textShadow:"0 0 50px rgba(212,168,67,0.45),0 4px 0 rgba(0,0,0,0.5)", lineHeight:1, letterSpacing:"0.05em" }}>DOINK</div>
          <div style={{ height:2, background:"linear-gradient(90deg,transparent,#D4A843,transparent)", margin:"16px auto 10px", width:180 }} />
          <div style={{ fontSize:"0.8rem", color:"rgba(212,168,67,0.55)", letterSpacing:"0.22em", fontWeight:600, textTransform:"uppercase" }}>A Card Game of Pure Chaos</div>
        </div>
        <div style={{ width:"100%", maxWidth:340, display:"flex", flexDirection:"column", gap:14 }}>
          <button onClick={onCareer} style={{
            padding:"20px 24px", borderRadius:18, border:"none",
            background:"linear-gradient(160deg,#8A6418 0%,#D4A843 38%,#F4D27A 62%,#C99536 100%)",
            color:"#1A0E00", fontFamily:"'DM Sans',sans-serif", fontSize:"1.1rem", fontWeight:700,
            letterSpacing:"0.06em", textTransform:"uppercase",
            boxShadow:"0 8px 28px rgba(212,168,67,0.42), inset 0 1px 0 rgba(255,240,200,0.55), inset 0 -1px 0 rgba(80,40,0,0.35)",
            cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span>♠ Career Mode</span>
            {hasCareer && <span style={{ fontSize:"0.7rem", opacity:0.7, fontWeight:600 }}>Continue</span>}
          </button>
          <button onClick={onQuickPlay} style={{
            padding:"18px 24px", borderRadius:18,
            background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(212,168,67,0.4)",
            color:"#F0C96A", fontSize:"1.05rem", fontWeight:600, letterSpacing:"0.04em",
            cursor:"pointer", backdropFilter:"blur(8px)",
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span>♣ Quick Play</span>
            <span style={{ fontSize:"0.7rem", opacity:0.55, fontWeight:500 }}>Custom one-off</span>
          </button>
          {onLeaderboard && (
            <button onClick={onLeaderboard} style={{
              padding:"16px 24px", borderRadius:16,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,168,67,0.3)",
              color:"#F0C96A", fontSize:"0.98rem", fontWeight:600, cursor:"pointer",
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <span>🏆 Leaderboard</span>
              <span style={{ fontSize:"0.7rem", opacity:0.55, fontWeight:500 }}>See the standings</span>
            </button>
          )}
          <button onClick={onTutorial} style={{
            padding:"14px 22px", borderRadius:14,
            background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.12)",
            color:"rgba(245,237,216,0.7)", fontSize:"0.9rem", fontWeight:500, cursor:"pointer",
          }}>
            📖 Tutorial
          </button>
          {onSignOut && (
            <button onClick={onSignOut} style={{
              padding:"10px 22px", borderRadius:12, marginTop:4,
              background:"transparent", border:"none",
              color:"rgba(245,237,216,0.4)", fontSize:"0.82rem", fontWeight:500, cursor:"pointer",
            }}>
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CAREER HOME — bankroll, level, daily stake, stats, play
// ─────────────────────────────────────────────────────────
function CareerHome({ career, onPlay, onClaimDaily, onResetCareer, onBack, onLeaderboard, onProfile }) {
  const lvlInfo = xpToNextLevel(career.xp);
  const dailyEligible = canClaimDaily(career);
  const dailyAmount = dailyAmountFor(career);
  const card = { background:"rgba(255,255,255,0.03)", borderRadius:16, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.08)" };
  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:`calc(env(safe-area-inset-top) + 18px) 22px calc(40px + env(safe-area-inset-bottom))` }}>
        <div style={{ width:"100%", maxWidth:420, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <button onClick={onBack} style={{ ...sBtn, padding:"8px 14px", fontSize:"0.85rem" }}>← Back</button>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#D4A843", fontWeight:700, letterSpacing:"0.04em" }}>Career</div>
          <button onClick={onResetCareer} style={{ ...sBtn, padding:"8px 14px", fontSize:"0.75rem", opacity:0.7 }}>Reset</button>
        </div>

        {/* Bankroll hero card */}
        <div style={{
          width:"100%", maxWidth:420,
          background:"linear-gradient(160deg,rgba(60,42,12,0.6),rgba(20,12,4,0.85))",
          border:"1.5px solid rgba(212,168,67,0.5)",
          borderRadius:22, padding:"22px 24px",
          textAlign:"center",
          boxShadow:"0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(240,201,106,0.35), 0 0 30px rgba(212,168,67,0.18)",
          marginBottom:16,
        }}>
          <div style={{ fontSize:"0.62rem", letterSpacing:"0.24em", color:"rgba(212,168,67,0.7)", fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Bankroll</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"3rem", color:"#F0C96A", fontWeight:900, lineHeight:1, textShadow:"0 0 32px rgba(212,168,67,0.6)" }}>${career.bankroll.toLocaleString()}</div>
          <div style={{ marginTop:14, display:"flex", justifyContent:"center", gap:14, fontSize:"0.78rem", color:"rgba(245,237,216,0.6)" }}>
            <span><span style={{ color:"#D4A843", fontWeight:700 }}>Lvl {career.level}</span></span>
            <span style={{ color:"rgba(255,255,255,0.2)" }}>·</span>
            <span>{career.sessionsPlayed} session{career.sessionsPlayed===1?"":"s"}</span>
          </div>
          {/* XP bar */}
          <div style={{ marginTop:12 }}>
            <div style={{ height:8, background:"rgba(0,0,0,0.5)", borderRadius:6, overflow:"hidden", border:"1px solid rgba(212,168,67,0.18)" }}>
              <div style={{ height:"100%", width:`${Math.min(100, (lvlInfo.current/lvlInfo.needed)*100)}%`, background:"linear-gradient(90deg, #8A6418, #F4D27A)" }}/>
            </div>
            <div style={{ marginTop:4, fontSize:"0.66rem", color:"rgba(245,237,216,0.45)", fontWeight:500 }}>{lvlInfo.current} / {lvlInfo.needed} XP to Lvl {career.level + 1}</div>
          </div>
        </div>

        {/* Daily Stake */}
        <div style={{
          width:"100%", maxWidth:420,
          ...card,
          marginBottom:14,
          background: dailyEligible ? "linear-gradient(160deg,rgba(14,58,30,0.45),rgba(8,18,12,0.6))" : "rgba(255,255,255,0.03)",
          border: dailyEligible ? "1.5px solid rgba(39,174,96,0.5)" : "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:14 }}>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", color: dailyEligible?"rgba(39,174,96,0.85)":"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase" }}>Daily Stake</div>
              <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.7)", marginTop:4, lineHeight:1.45 }}>
                {dailyEligible
                  ? `You can claim $${dailyAmount} to top up to $${career.dailyCap}.`
                  : career.bankroll >= career.dailyCap
                    ? `Bankroll's above $${career.dailyCap}. Come back if you bust.`
                    : `Already claimed today. Resets tomorrow.`}
              </div>
            </div>
            {dailyEligible && (
              <button onClick={onClaimDaily} style={{ ...gBtn, padding:"12px 18px", fontSize:"0.85rem", flexShrink:0, background:"linear-gradient(160deg,#0E4A1E 0%,#27AE60 60%,#1A8A3A 100%)", color:"#FFF", boxShadow:"0 6px 22px rgba(39,174,96,0.42), inset 0 1px 0 rgba(180,255,200,0.4)" }}>Claim +${dailyAmount}</button>
            )}
          </div>
        </div>

        {/* Stats card */}
        <div style={{ ...card, width:"100%", maxWidth:420, marginBottom:14 }}>
          <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", color:"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Career Stats</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <StatCell label="Sessions" value={career.sessionsPlayed}/>
            <StatCell label="Sessions Won" value={career.sessionsWon}/>
            <StatCell label="Total Profit" value={`${career.totalCareerProfit>=0?"+":"−"}$${Math.abs(career.totalCareerProfit).toLocaleString()}`} color={career.totalCareerProfit>=0?"#27AE60":"#E74C3C"}/>
            <StatCell label="Best Streak" value={career.bestStreak}/>
            <StatCell label="Doink Bets Hit" value={career.doinkBetsHit}/>
            <StatCell label="Mythicals" value={career.mythicalHits}/>
            <StatCell label="Biggest Win" value={`$${career.biggestPotWon.toLocaleString()}`}/>
            <StatCell label="Worst Doink" value={`$${career.biggestDoinkLoss.toLocaleString()}`} color="#E74C3C"/>
          </div>
        </div>

        <button onClick={onPlay} style={{
          width:"100%", maxWidth:420,
          padding:"18px 24px", borderRadius:18, border:"none",
          background:"linear-gradient(160deg,#8A6418 0%,#D4A843 38%,#F4D27A 62%,#C99536 100%)",
          color:"#1A0E00", fontFamily:"'DM Sans',sans-serif", fontSize:"1.1rem", fontWeight:700,
          letterSpacing:"0.06em", textTransform:"uppercase",
          boxShadow:"0 8px 28px rgba(212,168,67,0.42), inset 0 1px 0 rgba(255,240,200,0.55)",
          cursor:"pointer", marginTop:4,
        }}>Play a Table →</button>
        {onLeaderboard && (
          <button onClick={onLeaderboard} style={{
            width:"100%", maxWidth:420, marginTop:10,
            padding:"14px 24px", borderRadius:14,
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,168,67,0.3)",
            color:"#F0C96A", fontSize:"0.95rem", fontWeight:600, cursor:"pointer",
          }}>🏆 Leaderboard</button>
        )}
        {onProfile && (
          <button onClick={onProfile} style={{
            width:"100%", maxWidth:420, marginTop:10,
            padding:"14px 24px", borderRadius:14,
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,168,67,0.3)",
            color:"#F0C96A", fontSize:"0.95rem", fontWeight:600, cursor:"pointer",
          }}>👤 Profile & Stats</button>
        )}
      </div>
    </div>
  );
}

function StatCell({ label, value, color }) {
  return (
    <div style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:"8px 10px", border:"1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ fontSize:"0.6rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase", marginBottom:2 }}>{label}</div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color: color || "#F0C96A", fontWeight:700, lineHeight:1 }}>{value}</div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CAREER TABLE SELECT — list of tables with locks
// ─────────────────────────────────────────────────────────
function CareerTableSelect({ career, onSelect, onBack }) {
  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:`calc(env(safe-area-inset-top) + 18px) 22px calc(40px + env(safe-area-inset-bottom))` }}>
        <div style={{ width:"100%", maxWidth:480, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <button onClick={onBack} style={{ ...sBtn, padding:"8px 14px", fontSize:"0.85rem" }}>← Back</button>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"#D4A843", fontWeight:700 }}>Choose a Table</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", color:"#F0C96A", fontWeight:700 }}>${career.bankroll}</div>
        </div>
        <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", gap:12 }}>
          {CAREER_TABLES.map(t => {
            const playable = tableIsPlayable(t, career);
            const reason = career.level < t.unlockLevel
              ? `Reach level ${t.unlockLevel}`
              : career.bankroll < Math.max(t.buyIn, t.minBankroll)
                ? `Need $${Math.max(t.buyIn, t.minBankroll)} bankroll`
                : null;
            return (
              <div key={t.id} style={{
                background: playable
                  ? "linear-gradient(165deg,rgba(40,28,8,0.55),rgba(8,16,10,0.85))"
                  : "rgba(255,255,255,0.025)",
                border: playable ? "1.5px solid rgba(212,168,67,0.45)" : "1px solid rgba(255,255,255,0.06)",
                borderRadius:16, padding:"16px 18px",
                opacity: playable ? 1 : 0.55,
                boxShadow: playable ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14, marginBottom:8 }}>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color: playable?"#F0C96A":"rgba(245,237,216,0.55)", fontWeight:700 }}>{t.name}</div>
                    <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.5)", marginTop:2, lineHeight:1.4 }}>{t.subtitle}</div>
                  </div>
                  <div style={{ fontSize:"0.6rem", letterSpacing:"0.12em", color: playable?"rgba(212,168,67,0.6)":"rgba(245,237,216,0.3)", textTransform:"uppercase", fontWeight:700, flexShrink:0, textAlign:"right" }}>
                    Lvl {t.unlockLevel}+
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
                  <Pillstat label="Buy-in" value={`$${t.buyIn}`}/>
                  <Pillstat label="Ante" value={`$${t.ante}`}/>
                  <Pillstat label="Bots" value={t.bots}/>
                </div>
                {playable
                  ? <button onClick={() => onSelect(t)} style={{ ...gBtn, width:"100%", padding:"12px", fontSize:"0.95rem" }}>{`Start — Buy in $${t.buyIn}`}</button>
                  : <div style={{ padding:"10px 14px", background:"rgba(0,0,0,0.3)", borderRadius:10, color:"rgba(231,76,60,0.75)", fontSize:"0.78rem", fontWeight:600, textAlign:"center" }}>🔒 {reason}</div>
                }
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
function Pillstat({ label, value }) {
  return (
    <div style={{ padding:"4px 10px", background:"rgba(0,0,0,0.4)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:10 }}>
      <span style={{ fontSize:"0.6rem", letterSpacing:"0.1em", color:"rgba(245,237,216,0.4)", fontWeight:600, textTransform:"uppercase" }}>{label} </span>
      <span style={{ fontSize:"0.78rem", color:"#F0C96A", fontWeight:700 }}>{value}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CAREER SESSION SUMMARY — shown after cash out / bust
// ─────────────────────────────────────────────────────────
function CareerSessionSummary({ result, oldBankroll, newBankroll, onContinue }) {
  const net = result.net;
  const won = net > 0;
  const busted = result.reason === "bust" || result.cashOut === 0;
  const card = { background:"rgba(0,0,0,0.3)", borderRadius:12, padding:"10px 14px", border:"1px solid rgba(255,255,255,0.05)" };
  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 30%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:`calc(env(safe-area-inset-top) + 20px) 22px calc(40px + env(safe-area-inset-bottom))` }}>
        <div style={{
          width:"100%", maxWidth:440,
          background:"linear-gradient(165deg, rgba(14,28,18,0.96) 0%, rgba(6,12,8,0.98) 100%)",
          border:`1.5px solid ${busted?"rgba(231,76,60,0.5)":won?"rgba(39,174,96,0.5)":"rgba(212,168,67,0.45)"}`,
          borderRadius:24, padding:"28px 24px",
          boxShadow:`0 24px 80px rgba(0,0,0,0.96), 0 0 60px ${busted?"rgba(231,76,60,0.2)":won?"rgba(39,174,96,0.22)":"rgba(212,168,67,0.18)"}`,
        }}>
          <div style={{ textAlign:"center", marginBottom:22 }}>
            <div style={{ fontSize:"0.62rem", letterSpacing:"0.28em", color:"rgba(212,168,67,0.6)", fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>{result.tableName}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", color: busted?"#E74C3C":won?"#27AE60":"#F0C96A", fontWeight:900, lineHeight:1, textShadow:`0 0 28px ${busted?"rgba(231,76,60,0.55)":won?"rgba(39,174,96,0.55)":"rgba(212,168,67,0.55)"}` }}>
              {busted ? "Busted Out" : won ? `Up $${net}` : net < 0 ? `Down $${Math.abs(net)}` : "Broke Even"}
            </div>
          </div>

          {/* Net / chips */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
            <div style={card}>
              <div style={{ fontSize:"0.58rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase" }}>Buy-in</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#F0C96A", fontWeight:700, marginTop:2 }}>${result.buyIn}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize:"0.58rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase" }}>Cashed Out</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#F0C96A", fontWeight:700, marginTop:2 }}>${result.cashOut}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize:"0.58rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase" }}>Net</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color: net>0?"#27AE60":net<0?"#E74C3C":"#F0C96A", fontWeight:700, marginTop:2 }}>{net>=0?`+$${net}`:`−$${Math.abs(net)}`}</div>
            </div>
          </div>

          {/* Rounds + XP */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginBottom:14 }}>
            <div style={card}>
              <div style={{ fontSize:"0.58rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase" }}>Rounds Played</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#F0C96A", fontWeight:700, marginTop:2 }}>{result.roundsPlayed}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize:"0.58rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase" }}>XP Earned</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#D4A843", fontWeight:700, marginTop:2 }}>+{result.xpEarned}</div>
            </div>
          </div>

          {/* Bankroll change */}
          <div style={{
            background:"linear-gradient(160deg,rgba(40,28,8,0.55),rgba(8,16,10,0.85))",
            border:"1.5px solid rgba(212,168,67,0.4)",
            borderRadius:14, padding:"12px 16px", marginBottom:18, textAlign:"center",
          }}>
            <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:"rgba(212,168,67,0.6)", fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Bankroll</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"rgba(245,237,216,0.55)", fontWeight:600 }}>${oldBankroll.toLocaleString()}</span>
              <span style={{ fontSize:"0.9rem", color:"rgba(212,168,67,0.6)" }}>→</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", color:"#F0C96A", fontWeight:900, textShadow:"0 0 18px rgba(212,168,67,0.5)" }}>${newBankroll.toLocaleString()}</span>
            </div>
          </div>

          <button onClick={onContinue} style={{ ...gBtn, width:"100%", padding:"14px", fontSize:"1rem" }}>Continue →</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// PROFILE / STATS — change display name + full career stats
// ─────────────────────────────────────────────────────────
function ProfileScreen({ career, onRename, onBack }) {
  const [name, setName] = useState(career.playerName || "Player");
  const [saved, setSaved] = useState(false);
  const lvlInfo = xpToNextLevel(career.xp);
  const winRate = career.sessionsPlayed > 0
    ? Math.round((career.sessionsWon / career.sessionsPlayed) * 100)
    : 0;
  const card = { background:"rgba(255,255,255,0.03)", borderRadius:16, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.08)" };

  const commitName = () => {
    const clean = name.trim().slice(0, 20) || "Player";
    setName(clean);
    onRename(clean);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const stats = [
    { label: "Level",          value: career.level },
    { label: "Total XP",       value: career.xp },
    { label: "Sessions",       value: career.sessionsPlayed },
    { label: "Sessions Won",   value: career.sessionsWon },
    { label: "Win Rate",       value: `${winRate}%` },
    { label: "Best Streak",    value: career.bestStreak },
    { label: "Current Streak", value: career.currentStreak },
    { label: "Rounds Played",  value: career.totalRoundsPlayed },
    { label: "Total Profit",   value: `${career.totalCareerProfit>=0?"+":"−"}$${Math.abs(career.totalCareerProfit).toLocaleString()}`, color: career.totalCareerProfit>=0?"#27AE60":"#E74C3C" },
    { label: "Biggest Win",    value: `$${career.biggestPotWon.toLocaleString()}` },
    { label: "Worst Doink",    value: `$${career.biggestDoinkLoss.toLocaleString()}`, color:"#E74C3C" },
    { label: "Doink Bets Hit", value: career.doinkBetsHit },
    { label: "Mythicals Hit",  value: career.mythicalHits },
    { label: "Hands Bought",   value: career.handsBought },
    { label: "Hands Sold",     value: career.handsSold },
  ];

  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:`calc(env(safe-area-inset-top) + 18px) 22px calc(40px + env(safe-area-inset-bottom))` }}>
        {/* Header */}
        <div style={{ width:"100%", maxWidth:440, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <button onClick={onBack} style={{ ...sBtn, padding:"8px 14px", fontSize:"0.85rem" }}>← Back</button>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#D4A843", fontWeight:700, letterSpacing:"0.04em" }}>Profile</div>
          <div style={{ width:60 }}/>
        </div>

        {/* Name editor */}
        <div style={{ ...card, width:"100%", maxWidth:440, marginBottom:14 }}>
          <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", color:"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Display Name</div>
          <div style={{ display:"flex", gap:8 }}>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              placeholder="Player"
              style={{
                flex:1, padding:"12px 14px", borderRadius:12,
                background:"rgba(0,0,0,0.4)", border:"1.5px solid rgba(212,168,67,0.3)",
                color:"#F5EDD8", fontSize:"1rem", fontFamily:"'DM Sans',sans-serif", outline:"none",
              }}
            />
            <button onClick={commitName} style={{ ...gBtn, padding:"12px 18px", fontSize:"0.9rem" }}>
              {saved ? "Saved ✓" : "Save"}
            </button>
          </div>
          <div style={{ fontSize:"0.72rem", color:"rgba(245,237,216,0.4)", marginTop:8 }}>
            This is the name shown on the leaderboard.
          </div>
        </div>

        {/* XP card */}
        <div style={{ ...card, width:"100%", maxWidth:440, marginBottom:14 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"#F0C96A", fontWeight:700 }}>Level {career.level}</span>
            <span style={{ fontSize:"0.72rem", color:"rgba(245,237,216,0.45)" }}>{lvlInfo.current} / {lvlInfo.needed} XP</span>
          </div>
          <div style={{ height:8, background:"rgba(0,0,0,0.5)", borderRadius:6, overflow:"hidden", border:"1px solid rgba(212,168,67,0.18)" }}>
            <div style={{ height:"100%", width:`${Math.min(100,(lvlInfo.current/lvlInfo.needed)*100)}%`, background:"linear-gradient(90deg, #8A6418, #F4D27A)" }}/>
          </div>
        </div>

        {/* Full stats grid */}
        <div style={{ ...card, width:"100%", maxWidth:440 }}>
          <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", color:"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Career Stats</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            {stats.map(s => (
              <div key={s.label} style={{ background:"rgba(0,0,0,0.3)", borderRadius:10, padding:"9px 11px", border:"1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontSize:"0.6rem", letterSpacing:"0.12em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase", marginBottom:3 }}>{s.label}</div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:s.color||"#F0C96A", fontWeight:700, lineHeight:1 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// APP — routes between Home, Career screens, Tutorial, Setup, Game
// ═══════════════════════════════════════════════════════════
// Exports for App.jsx — career helpers it needs to sync with the cloud.
export { createDefaultCareer, normalizeCareer, CAREER_KEY };

// ═══════════════════════════════════════════════════════════
// GameRoot — the full game UI. Career state is owned by the parent (App.jsx)
// so it can be synced to the cloud. This component is otherwise the original
// game in its entirety.
//   props:
//     career         — the current career object (or null)
//     setCareer      — updater; parent persists to Firestore on change
//     onSignOut      — sign the user out
//     onShowLeaderboard — open the leaderboard screen
//     displayName    — the signed-in user's display name
export function GameRoot({ career, setCareer, onSignOut, onShowLeaderboard, displayName }) {
  // Route state: "home" | "tutorial" | "quickSetup" | "careerHome" | "careerTables" | "quickGame" | "careerGame" | "careerSummary"
  const [route, setRoute] = useState("home");
  const [cfg, setCfg] = useState(null);                    // Game cfg for either mode
  const [pendingSummary, setPendingSummary] = useState(null); // { result, oldBankroll, newBankroll }

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // ── Career flow ─────────────────────────────────────────
  const enterCareer = () => {
    if (!career) setCareer(createDefaultCareer(displayName));
    setRoute("careerHome");
  };
  const handleClaimDaily = () => setCareer(c => claimDaily(c));
  const handleResetCareer = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset your career? Bankroll and stats will be wiped.")) return;
    setCareer(createDefaultCareer(displayName));
  };
  const startCareerTable = (table) => {
    // Deduct buy-in immediately so it's tracked even if app reloads mid-session.
    setCareer(c => ({ ...c, bankroll: c.bankroll - table.buyIn }));
    const botNames = pickCareerRivals(table);
    setCfg({
      mode: "career",
      tableId: table.id,
      careerSession: { tableName: table.name, buyIn: table.buyIn },
      nH: 1,
      nB: table.bots,
      chips: table.buyIn,
      ante: table.ante,
      denoms: [1, 5, 10, 25, 50, 100, 500].filter(d => d <= table.buyIn),
      names: [career?.playerName || displayName || "Player"],
      botNames,
      orientation: "portrait",
      hintsDefault: true,
    });
    setRoute("careerGame");
  };
  const onCareerComplete = (result) => {
    setCareer(prev => {
      const old = prev.bankroll;
      const merged = applyCareerSession(prev, result);
      setPendingSummary({ result, oldBankroll: old, newBankroll: merged.bankroll });
      return merged;
    });
    setRoute("careerSummary");
    setCfg(null);
  };

  // ── Quick play flow ─────────────────────────────────────
  const startQuick = (config) => {
    setCfg({ ...config, mode: "quick" });
    setRoute("quickGame");
  };
  const exitQuickGame = () => { setCfg(null); setRoute("home"); };

  // ── Router ──────────────────────────────────────────────
  if (route === "tutorial") return <Tutorial onClose={() => setRoute("home")} />;

  if (route === "quickSetup") return (
    <Setup
      onStart={startQuick}
      onShowTutorial={() => setRoute("tutorial")}
      onBack={() => setRoute("home")}
    />
  );

  if (route === "quickGame" && cfg) return (
    <Game key={cfg ? JSON.stringify(cfg) : "g"} cfg={cfg} onExit={exitQuickGame} />
  );

  if (route === "careerHome" && career) return (
    <CareerHome
      career={career}
      onPlay={() => setRoute("careerTables")}
      onClaimDaily={handleClaimDaily}
      onResetCareer={handleResetCareer}
      onBack={() => setRoute("home")}
      onLeaderboard={onShowLeaderboard}
      onProfile={() => setRoute("profile")}
    />
  );

  if (route === "profile" && career) return (
    <ProfileScreen
      career={career}
      onRename={(newName) => setCareer(c => ({ ...c, playerName: newName }))}
      onBack={() => setRoute("careerHome")}
    />
  );

  if (route === "careerTables" && career) return (
    <CareerTableSelect
      career={career}
      onSelect={startCareerTable}
      onBack={() => setRoute("careerHome")}
    />
  );

  if (route === "careerGame" && cfg) return (
    <Game
      key={cfg ? JSON.stringify(cfg) : "g"}
      cfg={cfg}
      onExit={() => { setCfg(null); setRoute("careerHome"); }}
      onCareerComplete={onCareerComplete}
    />
  );

  if (route === "careerSummary" && pendingSummary) return (
    <CareerSessionSummary
      result={pendingSummary.result}
      oldBankroll={pendingSummary.oldBankroll}
      newBankroll={pendingSummary.newBankroll}
      onContinue={() => { setPendingSummary(null); setRoute("careerHome"); }}
    />
  );

  // Default: home
  return (
    <HomeScreen
      hasCareer={!!career}
      onCareer={enterCareer}
      onQuickPlay={() => setRoute("quickSetup")}
      onTutorial={() => setRoute("tutorial")}
      onSignOut={onSignOut}
      onLeaderboard={onShowLeaderboard}
    />
  );
}
