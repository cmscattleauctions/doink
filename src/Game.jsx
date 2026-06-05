import { useState, useEffect, useRef, useReducer, useCallback } from "react";
import { PrivacyPolicy, TermsOfUse, AccountDeletion, SupportPage } from "./LegalPages.jsx";
import { EVENTS, applyAchievementEvent, achievementCoinReward } from "./achievements.js";
import { playSound, primeSounds } from "./sound.js";
import { haptic } from "./haptics.js";
import { AchievementToasts, AchievementsScreen } from "./AchievementUI.jsx";

// Developer name shown in the in-app About section.
const DEV_NAME = "High Plains Games";

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
@keyframes achToastIn{from{opacity:0;transform:translateY(-20px) scale(0.94)}to{opacity:1;transform:translateY(0) scale(1)}}
@keyframes doinkRing{0%{width:60px;height:60px;opacity:0.95}100%{width:560px;height:560px;opacity:0}}
@keyframes doinkStamp{0%{opacity:0;transform:scale(2.4) rotate(-7deg)}60%{opacity:1}100%{opacity:1;transform:scale(1) rotate(-3deg)}}
@keyframes mythRise{0%{opacity:0;transform:translateY(20px) scale(0.85)}100%{opacity:1;transform:translateY(0) scale(1)}}
@keyframes mythSplit{0%{transform:translateX(0)}100%{transform:translateX(var(--shift,0))}}
@keyframes mythShimmer{0%{opacity:0}40%{opacity:1}100%{opacity:0}}
@keyframes chipFly{0%{left:var(--fromX);top:var(--fromY);transform:scale(0.7);opacity:0}15%{opacity:1;transform:scale(1)}85%{opacity:1;transform:scale(1)}100%{left:var(--toX);top:var(--toY);transform:scale(0.82);opacity:0}}
@keyframes potBump{0%{transform:translate(-50%,-50%) scale(1)}45%{transform:translate(-50%,-50%) scale(1.12)}100%{transform:translate(-50%,-50%) scale(1)}}
@keyframes deckRiffleA{0%,100%{transform:translate(0,0) rotate(0deg)}30%{transform:translate(-9px,-3px) rotate(-7deg)}60%{transform:translate(5px,-1px) rotate(4deg)}}
@keyframes deckRiffleB{0%,100%{transform:translate(0,0) rotate(0deg)}30%{transform:translate(9px,-3px) rotate(7deg)}60%{transform:translate(-5px,-1px) rotate(-4deg)}}
@keyframes deckDeal{0%{transform:translate(0,0) scale(1);opacity:1}100%{transform:translate(var(--deal-dx),var(--deal-dy)) scale(0.9);opacity:0}}
@keyframes seatTagIn{from{opacity:0;transform:translateY(4px) scale(0.85)}to{opacity:1;transform:translateY(0) scale(1)}}

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

// Ante is computed as 0.5% of the table's buy-in, rounded to a whole number,
// minimum 1. Centralizing it here means any room (current or future) gets a
// correct ante automatically from its buy-in — no hand-set ante values.
const computeAnte = buyIn => Math.max(1, Math.round((buyIn || 0) * 0.005));

const CAREER_TABLES = [
  { id: "garage",     name: "Garage Game",         subtitle: "Low stakes. Friendly chaos.",       minBankroll: 0,     buyIn: 100,  bots: 3, unlockLevel: 1,
    themeId: "garage-green",      cardBackId: "classic-doink",   chipSetId: "house-chips",
    rivals: ["Cody", "Isaac", "Graham", "Jerry"] },
  { id: "backroom",   name: "Backroom Table",      subtitle: "Bigger pots. Meaner bots.",         minBankroll: 500,   buyIn: 250,  bots: 4, unlockLevel: 4,
    themeId: "backroom-blue",     cardBackId: "black-label",     chipSetId: "backroom-matte",
    rivals: ["Cody", "Jerry", "Parker", "Emmanuel", "Rube"] },
  { id: "riverboat",  name: "Riverboat Room",      subtitle: "The doinks start hurting.",         minBankroll: 1500,  buyIn: 500,  bots: 5, unlockLevel: 9,
    themeId: "riverboat-red",     cardBackId: "riverboat-crest", chipSetId: "riverboat-brass",
    rivals: ["Michael", "Parker", "Landen", "Emmanuel", "Houston"] },
  { id: "highroller", name: "High Stakes Room",     subtitle: "Big chip stakes. Brutal bots.",     minBankroll: 5000,  buyIn: 1000, bots: 6, unlockLevel: 16,
    themeId: "high-roller-black", cardBackId: "high-roller-gold",chipSetId: "high-roller-premium",
    rivals: ["Dalton", "Jayton", "Landen", "Houston", "Michael", "Rube"] },
  { id: "mythic",     name: "Mythic Invitational", subtitle: "The biggest chip table. Elite bots.",           minBankroll: 15000, buyIn: 2500, bots: 6, unlockLevel: 25,
    themeId: "mythic-purple",     cardBackId: "mythic-crown",    chipSetId: "mythic-gold",
    rivals: ["Dalton", "Jayton", "Landen", "Houston", "Michael", "Parker", "Emmanuel"] },
  { id: "vault",      name: "The Vault",           subtitle: "The pinnacle. Only icons sit here.",           minBankroll: 40000, buyIn: 5000, bots: 6, unlockLevel: 35,
    themeId: "vault-gold",        cardBackId: "vault-noir",      chipSetId: "vault-bullion",
    rivals: ["Sterling", "Augustus", "Vance", "Crews", "Maximilian", "Dalton"] },
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
  // Achievement progress counters, keyed by achievement id. Rides the
  // existing Firestore career save — no separate cloud setup needed.
  achievementProgress: {},
  // Onboarding flags: whether the player has chosen a username and seen the
  // first-time tutorial. New players go through both before the game.
  usernameSet: false,
  tutorialSeen: false,
  // Quick Play unlock milestones (4/9/16/25) the player has already been
  // shown the reward popup for. Prevents the popup repeating.
  shownUnlocks: [],
});

// Merge any stored career object with current defaults so older saves stay
// valid as new fields are added. Used by App.jsx after a Firestore read.
const normalizeCareer = (stored, playerName) => {
  if (!stored) return null;
  const merged = { ...createDefaultCareer(playerName), ...stored };
  // If an existing save predates the unlock-popup feature, treat every
  // milestone they've already passed as "already seen" so they aren't
  // spammed with popups for unlocks they earned before the feature existed.
  if (!Array.isArray(stored.shownUnlocks)) {
    merged.shownUnlocks = [4, 9, 16, 25].filter(m => (merged.level || 1) >= m);
  }
  // An existing career means the player is already past onboarding — don't
  // send returning players back through the username picker / tutorial.
  if (stored.usernameSet === undefined) merged.usernameSet = true;
  if (stored.tutorialSeen === undefined) merged.tutorialSeen = true;
  return merged;
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
// Levels 1-10 keep the original ramp (first 150, step 75). After level 10 the
// per-level cost is cut substantially and its growth flattened, so dedicated
// players stop stalling in the teens. (L3 — the old curve kept charging
// 900/975/1050... per level past 10, which was ~6 sessions each.)
const xpForLevel = level => {
  if (level <= 1) return 0;
  if (level <= 10) {
    const n = level - 1;
    return n * 150 + 75 * (n * (n - 1) / 2);
  }
  // Base = cumulative XP to reach level 10, then a cheaper flat-ish ramp.
  const base = 9 * 150 + 75 * (9 * 8 / 2); // cumulative to reach level 10
  // Per-level cost after 10: 500, 540, 580, 620 ... (start 500, step 40).
  let total = base;
  for (let lv = 10; lv < level; lv++) {
    total += 500 + 40 * (lv - 10);
  }
  return total;
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

// Rank title derived from career level. No separate stored "rank" field —
// the tier name is purely a function of level, so it can never drift out of
// sync with the player's actual progress.
const rankForLevel = lvl => {
  if (lvl >= 35) return "Icon";
  if (lvl >= 25) return "Legend";
  if (lvl >= 16) return "High Roller";
  if (lvl >= 9)  return "Sharp";
  if (lvl >= 4)  return "Regular";
  return "Rookie";
};

// ─────────────────────────────────────────────────────────
// K4 — CRASH / LEAVE SAFETY (localStorage live-session record)
//
// While a career session is in progress we save a small record of the seat
// chips at stable moments (round start/end). If the app closes without a
// clean ending (crash, tab close, force-quit), the record survives. On next
// launch we credit those chips back to the bankroll exactly once, then delete
// the record. Every NORMAL ending clears the record, so a completed session
// never triggers recovery (no double-credit).
//
// Safety rules:
//   • Record stores SEAT CHIPS at the last stable point — never mid-bet.
//   • Recovery deletes the record BEFORE/at crediting, and the credit path is
//     guarded so it can only ever run once.
//   • Stats/XP/streak are NOT recorded for a recovered crash.
// ─────────────────────────────────────────────────────────
const LIVE_SESSION_KEY = "gapperLiveSession";

function writeLiveSession(rec) {
  try { localStorage.setItem(LIVE_SESSION_KEY, JSON.stringify(rec)); } catch {}
}
function clearLiveSession() {
  try { localStorage.removeItem(LIVE_SESSION_KEY); } catch {}
}
function readLiveSession() {
  try {
    const raw = localStorage.getItem(LIVE_SESSION_KEY);
    if (!raw) return null;
    const rec = JSON.parse(raw);
    if (!rec || rec.inProgress !== true) return null;
    return rec;
  } catch { return null; }
}

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
// (L3 — bumped up so each session is meaningful progress, not a crawl.)
const computeSessionXP = stats => {
  let xp = 0;
  xp += (stats.roundsPlayed || 0) * 16;
  xp += (stats.spreadWins || 0) * 40;
  xp += (stats.doinkBetsHit || 0) * 60;
  xp += (stats.mythicalHits || 0) * 110;
  xp += ((stats.handsBought || 0) + (stats.handsSold || 0)) * 15;
  const net = (stats.cashOut || 0) - (stats.buyIn || 0);
  if (net > 0) xp += Math.floor(net / 20);
  return xp;
};

// A table is UNLOCKED purely by career level — this is permanent. Once you
// reach the level, the table stays unlocked forever, regardless of how your
// chip stack rises or falls. (Previously `minBankroll` re-locked tables when
// a player's bankroll dropped, which was a bug.)
const tableIsUnlocked = (table, career) => {
  if (!career) return false;
  return (career.level || 1) >= table.unlockLevel;
};

// A table is PLAYABLE if it's unlocked AND you can afford the buy-in. The
// only bankroll requirement to sit down is covering that table's buy-in.
const tableIsPlayable = (table, career) => {
  if (!tableIsUnlocked(table, career)) return false;
  if ((career.bankroll || 0) < table.buyIn) return false;
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

// ═══════════════════════════════════════════════════════════
// QUICK PLAY CUSTOMIZATION — unlockable cosmetics & settings
// ───────────────────────────────────────────────────────────
// Career level is the single gate. Every unlockable item carries an
// `unlockLevel`; helpers below filter by the player's current level.
// Career tables themselves are UNCHANGED — this only feeds Quick Play.
// ═══════════════════════════════════════════════════════════

const UNLOCK_LEVELS = { garage: 1, backroom: 4, riverboat: 9, highRoller: 16, mythic: 25 };

// ── Table themes ────────────────────────────────────────────
const TABLE_THEMES = [
  { id: "garage-green",      name: "Garage Green",      unlockLevel: 1,  felt: "#14532d", feltDark: "#062015", rail: "#3b2a18", accent: "#d4a843" },
  { id: "backroom-blue",     name: "Backroom Blue",     unlockLevel: 4,  felt: "#12304a", feltDark: "#071827", rail: "#111827", accent: "#d4a843" },
  { id: "riverboat-red",     name: "Riverboat Red",     unlockLevel: 9,  felt: "#5b1118", feltDark: "#25060a", rail: "#3b2414", accent: "#f0c96a" },
  { id: "high-roller-black", name: "Elite Black", unlockLevel: 16, felt: "#080808", feltDark: "#020202", rail: "#1f1f1f", accent: "#f0c96a" },
  { id: "mythic-purple",     name: "Mythic Purple",     unlockLevel: 25, felt: "#2d124a", feltDark: "#100719", rail: "#1a1028", accent: "#f0c96a" },
  { id: "vault-gold",        name: "The Vault",         unlockLevel: 35, felt: "#181410", feltDark: "#0a0805", rail: "#2a2012", accent: "#f5d27a" },
];

// ── Card backs ──────────────────────────────────────────────
// `back` is a CSS background string; `border` the rim color.
const CARD_BACKS = [
  { id: "classic-doink",  name: "Classic Doink",  unlockLevel: 1,
    back: "linear-gradient(145deg,#0E4A1E,#0A3315)", border: "#C9B58A", motif: "#F4E4B8" },
  { id: "black-label",    name: "Black Label",    unlockLevel: 4,
    back: "linear-gradient(145deg,#1A1A1A,#080808)", border: "#D4A843", motif: "#F0C96A" },
  { id: "riverboat-crest",name: "Riverboat Crest",unlockLevel: 9,
    back: "linear-gradient(145deg,#5B1118,#2A070B)", border: "#F0C96A", motif: "#F4D27A" },
  { id: "high-roller-gold",name:"Elite Gold",unlockLevel: 16,
    back: "linear-gradient(145deg,#1C1407,#070502)", border: "#F4D27A", motif: "#F0C96A" },
  { id: "mythic-crown",   name: "Mythic Crown",   unlockLevel: 25,
    back: "linear-gradient(145deg,#2D124A,#100719)", border: "#F4D27A", motif: "#C9A8E8" },
  { id: "vault-noir",     name: "Vault Noir",     unlockLevel: 35,
    back: "linear-gradient(145deg,#1C1710,#070502)", border: "#F5D27A", motif: "#F5D27A" },
];

// ── Chip sets ───────────────────────────────────────────────
// `colors` maps denomination → hex. Falls back per-set if a denom is absent.
const CHIP_SETS = [
  { id: "house-chips",        name: "House Chips",        unlockLevel: 1,
    swatch: ["#C0392B", "#2980B9", "#ECF0F1"],
    colors: { 1:"#ECF0F1", 2:"#95A5A6", 5:"#C0392B", 10:"#2980B9", 25:"#27AE60", 50:"#8E44AD", 100:"#2C3E50", 500:"#1A1A1A" } },
  { id: "backroom-matte",     name: "Backroom Matte",     unlockLevel: 4,
    swatch: ["#1A1A1A", "#3A3A3A", "#D4A843"],
    colors: { 1:"#5A5A5A", 2:"#3A3A3A", 5:"#7A2A2A", 10:"#2A3A4A", 25:"#2A4A2A", 50:"#3A2A4A", 100:"#1A1A1A", 500:"#D4A843" } },
  { id: "riverboat-brass",    name: "Riverboat Brass",    unlockLevel: 9,
    swatch: ["#8C1A1A", "#B8923E", "#E8DCC0"],
    colors: { 1:"#E8DCC0", 2:"#C9B58A", 5:"#8C1A1A", 10:"#6E4A1A", 25:"#4A6E2A", 50:"#6E2A4A", 100:"#B8923E", 500:"#3A2A14" } },
  { id: "high-roller-premium",name: "Elite Premium",unlockLevel: 16,
    swatch: ["#0A0A0A", "#F0C96A", "#FFFFFF"],
    colors: { 1:"#FFFFFF", 2:"#C8C8C8", 5:"#8A1A1A", 10:"#1A3A6A", 25:"#1A5A2A", 50:"#4A1A6A", 100:"#0A0A0A", 500:"#F0C96A" } },
  { id: "mythic-gold",        name: "Mythic Gold",        unlockLevel: 25,
    swatch: ["#F0C96A", "#5B2A8C", "#1A1028"],
    colors: { 1:"#E8DCC0", 2:"#C9A8E8", 5:"#8C2A2A", 10:"#3A2A6A", 25:"#2A5A3A", 50:"#5B2A8C", 100:"#1A1028", 500:"#F0C96A" } },
  { id: "vault-bullion",      name: "Vault Bullion",      unlockLevel: 35,
    swatch: ["#F5D27A", "#1C1710", "#FFFFFF"],
    colors: { 1:"#F5ECD2", 2:"#C9B58A", 5:"#8C6A1A", 10:"#2A2418", 25:"#4A3A1A", 50:"#6A4A14", 100:"#1C1710", 500:"#F5D27A" } },
];

// ── Avatars ─────────────────────────────────────────────────
// Each avatar maps to a seed (drives the existing Greek-bust medallion)
// plus an `accent` for tile styling.
const QP_AVATARS = [
  { id: "rookie",            name: "Rookie",            unlockLevel: 1,  seed: 0, accent: "#7E8388" },
  { id: "cowboy",            name: "Cowboy",            unlockLevel: 1,  seed: 1, accent: "#9A8660" },
  { id: "hoodie",            name: "Hoodie",            unlockLevel: 1,  seed: 2, accent: "#6C7A82" },
  { id: "backroom-regular",  name: "Backroom Regular",  unlockLevel: 4,  seed: 3, accent: "#867E8E" },
  { id: "sunglasses",        name: "Sunglasses",        unlockLevel: 4,  seed: 4, accent: "#8E7C58" },
  { id: "riverboat-gambler", name: "Riverboat Captain", unlockLevel: 9,  seed: 5, accent: "#6E7E74" },
  { id: "mustache",          name: "Mustache",          unlockLevel: 9,  seed: 6, accent: "#80848A" },
  { id: "high-roller",       name: "The Regular",      unlockLevel: 16, seed: 7, accent: "#8C746A" },
  { id: "black-hat",         name: "Black Hat",         unlockLevel: 16, seed: 2, accent: "#1F1F1F" },
  { id: "mythic-shark",      name: "Mythic Shark",      unlockLevel: 25, seed: 5, accent: "#5B2A8C" },
  { id: "gold-suit",         name: "Gold Suit",         unlockLevel: 25, seed: 7, accent: "#F0C96A" },
  { id: "final-boss",        name: "Final Boss",        unlockLevel: 25, seed: 0, accent: "#D4A843" },
];

// ── Numeric game settings (each value gated by level) ───────
const BOT_COUNT_OPTIONS  = [{ value:3, unlockLevel:1 }, { value:4, unlockLevel:4 }, { value:5, unlockLevel:9 }, { value:6, unlockLevel:16 }];
const BUYIN_OPTIONS      = [{ value:100, unlockLevel:1 }, { value:250, unlockLevel:4 }, { value:500, unlockLevel:9 }, { value:1000, unlockLevel:16 }, { value:2500, unlockLevel:25 }];
const ANTE_OPTIONS       = [{ value:1, unlockLevel:1 }, { value:2, unlockLevel:4 }, { value:5, unlockLevel:9 }, { value:10, unlockLevel:16 }, { value:25, unlockLevel:25 }];
const REPLENISH_OPTIONS  = [{ value:35, unlockLevel:1 }, { value:85, unlockLevel:4 }, { value:175, unlockLevel:9 }, { value:350, unlockLevel:16 }, { value:850, unlockLevel:25 }];

// ── Presets ─────────────────────────────────────────────────
const QP_PRESETS = [
  { id:"casual",     name:"Casual",      unlockLevel:1,  themeId:"garage-green",      chipId:"house-chips",         cardId:"classic-doink",   bots:3, buyIn:100,  ante:2,   replenish:35  },
  { id:"backroom",   name:"Backroom",    unlockLevel:4,  themeId:"backroom-blue",     chipId:"backroom-matte",      cardId:"black-label",     bots:4, buyIn:250,  ante:4,   replenish:85  },
  { id:"riverboat",  name:"Riverboat",   unlockLevel:9,  themeId:"riverboat-red",     chipId:"riverboat-brass",     cardId:"riverboat-crest", bots:5, buyIn:500,  ante:10,  replenish:175  },
  { id:"highroller", name:"Elite", unlockLevel:16, themeId:"high-roller-black", chipId:"high-roller-premium", cardId:"high-roller-gold",bots:6, buyIn:1000, ante:20,  replenish:350 },
  { id:"mythic",     name:"Mythic",      unlockLevel:25, themeId:"mythic-purple",     chipId:"mythic-gold",         cardId:"mythic-crown",    bots:7, buyIn:2500, ante:50,  replenish:850 },
  { id:"vault",      name:"The Vault",   unlockLevel:35, themeId:"vault-gold",        chipId:"vault-bullion",       cardId:"vault-noir",      bots:6, buyIn:5000, ante:100, replenish:1750 },
];

// ── Unlock helpers — single source of truth ─────────────────
const isUnlocked = (item, careerLevel) => (careerLevel || 1) >= (item.unlockLevel || 1);
const getUnlockedOptions = (options, careerLevel) => options.filter(o => isUnlocked(o, careerLevel));

// Pick a safe option from a list given a desired value. Falls back to the
// highest unlocked option, then the first option.
//   options     — array of {unlockLevel, ...}
//   careerLevel — player's level
//   wantedVal   — the value we'd like (matched against option[key])
//   key         — which field to match on ("id" or "value")
const resolveUnlocked = (options, careerLevel, wantedVal, key = "id") => {
  const unlocked = getUnlockedOptions(options, careerLevel);
  if (unlocked.length === 0) return options[0];
  const match = unlocked.find(o => o[key] === wantedVal);
  if (match) return match;
  // highest unlocked = last in the (level-ascending) list
  return unlocked[unlocked.length - 1];
};

// Quick Play settings persistence (separate from career; localStorage).
const QP_SETTINGS_KEY = "doinkQuickPlayV1";
const loadQuickPlaySettings = () => {
  try {
    const raw = localStorage.getItem(QP_SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const saveQuickPlaySettings = (s) => {
  try { localStorage.setItem(QP_SETTINGS_KEY, JSON.stringify(s)); } catch {}
};

// Given saved settings + career level, produce a fully valid settings object
// (every selection guaranteed unlocked).
const sanitizeQuickPlaySettings = (saved, careerLevel) => {
  const s = saved || {};
  const theme = resolveUnlocked(TABLE_THEMES, careerLevel, s.tableThemeId, "id");
  const chip  = resolveUnlocked(CHIP_SETS,    careerLevel, s.chipSetId, "id");
  const card  = resolveUnlocked(CARD_BACKS,   careerLevel, s.cardBackId, "id");
  const avi   = resolveUnlocked(QP_AVATARS,   careerLevel, s.avatarId, "id");
  const bots  = resolveUnlocked(BOT_COUNT_OPTIONS, careerLevel, s.botCount, "value");
  const buyIn = resolveUnlocked(BUYIN_OPTIONS,     careerLevel, s.buyIn, "value");
  const ante  = resolveUnlocked(ANTE_OPTIONS,      careerLevel, s.ante, "value");
  const repl  = resolveUnlocked(REPLENISH_OPTIONS, careerLevel, s.replenishAmount, "value");
  return {
    tableThemeId: theme.id,
    chipSetId: chip.id,
    cardBackId: card.id,
    avatarId: avi.id,
    botCount: bots.value,
    buyIn: buyIn.value,
    ante: ante.value,
    replenishAmount: repl.value,
  };
};

// Lookups by id
const themeById = id => TABLE_THEMES.find(t => t.id === id) || TABLE_THEMES[0];
const chipSetById = id => CHIP_SETS.find(c => c.id === id) || CHIP_SETS[0];
const cardBackById = id => CARD_BACKS.find(c => c.id === id) || CARD_BACKS[0];
const avatarById = id => QP_AVATARS.find(a => a.id === id) || QP_AVATARS[0];

// Which unlock milestones a level has passed (for the reward popup).
const milestonesForLevel = lvl => [4, 9, 16, 25].filter(m => lvl >= m);

// ── Active cosmetics (Quick Play) ───────────────────────────
// Only one Game renders at a time, so a module-level holder is a safe,
// low-touch way to feed the selected card back / chip set into the many
// Card and chip components without threading props through every callsite.
// Game sets this on mount; it's null for Career mode (default look).
let ACTIVE_COSMETICS = { cardBack: null, chipSet: null };
const setActiveCosmetics = (cardBack, chipSet) => { ACTIVE_COSMETICS = { cardBack, chipSet }; };
// Resolve a chip color for a denomination from the active chip set, with a
// sensible default palette when no Quick Play set is active.
const DEFAULT_CHIP_COLORS = { 1:"#9E9E9E",2:"#757575",5:"#E74C3C",10:"#2980B9",25:"#27AE60",50:"#8E44AD",100:"#D4A843",500:"#2C2C2C" };
const chipColorFor = d => {
  const set = ACTIVE_COSMETICS.chipSet;
  if (set && set.colors && set.colors[d] != null) return set.colors[d];
  return DEFAULT_CHIP_COLORS[d] || "#888";
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
  ["#9E8A4E", "#6A5A2A", "#2E2610"], // old gold
  ["#7A6E86", "#463E52", "#1C1822"], // amethyst steel
  ["#5E7E7A", "#364A47", "#141F1D"], // verdigris
  ["#A07866", "#64463A", "#2C1C16"], // rose copper
  ["#888C92", "#50545A", "#202226"], // silver ash
  ["#94824E", "#5C4E2A", "#281F10"], // dark brass
];
const HUMAN_RIM_PALETTE = ["#F6D98A", "#D4A843", "#7A580F"];

// Inner-disc backdrop tints behind the bust.
const INNER_TINTS = [
  ["#2A2E33", "#0C0E10"],
  ["#2C2824", "#100C0A"],
  ["#262A30", "#0A0C0F"],
  ["#2A2530", "#0E0A10"],
  ["#23302A", "#0A100C"],
  ["#302A23", "#100C08"],
  ["#2A2326", "#0E0A0B"],
];

// Marble palettes for the bust itself — [highlight, mid, shadow].
// Several stone tones so busts differ in material, not just hairstyle.
const MARBLE_BOTS = [
  ["#E8E2D4", "#C2BAA6", "#8E8576"], // classic ivory
  ["#E4DAC8", "#BCAE92", "#86775C"], // warm sandstone
  ["#DEE0DE", "#B4B8B6", "#7E8482"], // cool grey marble
  ["#E6DEDA", "#BEB0AA", "#8A7A72"], // rose alabaster
  ["#DCE2DC", "#AEB8AC", "#788278"], // green-grey stone
  ["#EAE4D0", "#C6BC9E", "#928670"], // aged limestone
];
const MARBLE_HUMAN = ["#F4E4B8", "#D9C188", "#A8895A"];

// Stable hash from a string (character name) → non-negative int. Ensures a
// given character always renders the same avatar, instead of a positional seed.
const hashString = str => {
  let h = 2166136261;
  const s = String(str || "");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h | 0);
};

const getAvatarConfig = (seed = 0, name, isHuman = false) => {
  // Prefer a stable hash of the NAME so each character keeps a consistent look
  // across seats and sessions; fall back to the numeric seed if no name.
  const h = name ? hashString(name) : Math.abs(seed | 0);
  return {
    rim: isHuman ? HUMAN_RIM_PALETTE : BOT_RIM_PALETTES[h % BOT_RIM_PALETTES.length],
    inner: INNER_TINTS[(h >> 3) % INNER_TINTS.length],
    marble: isHuman ? MARBLE_HUMAN : MARBLE_BOTS[(h >> 5) % MARBLE_BOTS.length],
    bustStyle: h % 6,                       // hair/laurel/beard variant
    accessory: isHuman ? 0 : (h >> 7) % 5,  // 0 none, 1 monocle, 2 earring, 3 circlet, 4 face scar
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
function GreekBust({ marble, style, gilded, accessory = 0 }) {
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

      {/* Accessories — small per-character details that add personality.
          Drawn after the face so they sit on top. */}
      {accessory === 1 && (  /* monocle over the shadow-side eye */
        <g>
          <circle cx="56.5" cy="42.5" r="5" fill="none" stroke="#E4C778" strokeWidth="1.4" opacity="0.95"/>
          <line x1="56.5" y1="47.5" x2="58" y2="60" stroke="#E4C778" strokeWidth="0.8" opacity="0.7"/>
        </g>
      )}
      {accessory === 2 && (  /* gold earring */
        <circle cx="36" cy="55" r="2.1" fill="none" stroke="#F0C96A" strokeWidth="1.3"/>
      )}
      {accessory === 3 && (  /* slim circlet across the brow */
        <g>
          <path d="M32 33 Q50 27 68 33" fill="none" stroke="#E4C778" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="50" cy="29.5" r="1.8" fill="#F0C96A"/>
        </g>
      )}
      {accessory === 4 && (  /* faint cheek scar */
        <line x1="60" y1="40" x2="63" y2="50" stroke={deep} strokeWidth="1.1" opacity="0.5" strokeLinecap="round"/>
      )}

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

// ── DECK ────────────────────────────────────────────────────
// One shuffled 52-card deck per round. Every card — the two cards in each
// hand AND the hit card — is drawn from this same deck without replacement,
// so no card can ever appear twice in a round. `reshuffle()` starts a fresh
// round with a brand-new shuffle.
function useDeck() {
  const s = useRef({ deck: newShuffledDeck(), idx: 0 });
  // Draw the next card from the current round's deck (no replacement).
  const draw = useCallback(() => {
    if (s.current.idx >= s.current.deck.length) {
      // Safety: a 52-card deck can't normally be exhausted in one round,
      // but if it ever is, reshuffle rather than crash.
      s.current.deck = newShuffledDeck();
      s.current.idx = 0;
    }
    return s.current.deck[s.current.idx++];
  }, []);
  // Start a new round: fresh shuffled deck, index reset.
  const reshuffle = useCallback(() => {
    s.current.deck = newShuffledDeck();
    s.current.idx = 0;
  }, []);
  // The hit card is just the next card off the SAME deck — drawn without
  // replacement so it can never duplicate a card already dealt this round.
  const drawFresh = useCallback(() => draw(), [draw]);
  // How many cards remain undealt in the current round's deck. Used so odds
  // can reflect the real shrinking deck instead of a static 50-card model.
  const cardsRemaining = useCallback(() => s.current.deck.length - s.current.idx, []);
  return { draw, drawFresh, reshuffle, cardsRemaining };
}

// ─────────────────────────────────────────────────────────
// SHARED STYLES — premium card-table aesthetic
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
  goodHand: ["Oh we are COOKING right now.", "Pack it up boys, I already won.", "This hand is illegal in 12 states.", "I would bet my house on this. And I like my house.", "I have never felt more alive.", "Someone call an ambulance. For the other players.", "This is the hand my mother dreamed about.", "I should be charging admission for this.", "The deck owes me money and just paid up.", "I didn't choose the hand life. The hand life chose me.", "Gentlemen, it's been an honor. I'm about to ruin you.", "This is the one. I can feel it in my bones.", "Somebody is about to learn a very expensive lesson.", "I'd frame these cards if I weren't about to spend them.", "The math is mathing in my favor for once.", "Two cards, infinite confidence.", "I came here to make friends. That plan is canceled.", "This is borderline unfair to everyone else.", "Sweet, sweet cards. Come to papa.", "I'm not saying I'm blessed, but the deck clearly loves me.", "Lock the doors. Nobody leaves until I collect.", "These cards just paid off my imaginary mortgage.", "I'd like to thank the deck, my hands, and destiny.", "This is the kind of hand they write songs about.", "Hope everyone brought spare chips. You'll need them.", "I'm so calm right now it should scare you.", "The universe finally remembered I exist.", "Chef's kiss. Absolute chef's kiss."],
  badHand: ["What in the actual—", "I have been personally attacked by this deck.", "My ancestors are ashamed.", "Do I even play this? Do I just leave?", "The audacity of these cards.", "This is a personal foul against me.", "The dealer hates me. Specifically me.", "I'd rather draw cards from the trash.", "These cards are an insult to playing cards.", "Did someone shuffle this with a blender?", "I've seen better hands on a clock.", "Is it too late to fold my entire existence?", "The deck and I are no longer on speaking terms.", "Whoever printed these cards owes me an apology.", "I would describe this hand as 'a cry for help.'", "Two cards. Both betrayals.", "This is what rock bottom looks like, apparently.", "I didn't know cards could be this disrespectful.", "Cool, cool. Love losing before I even bet.", "My horoscope warned me about today.", "I'm keeping these only to remember the pain.", "If garbage had a hand, this would be it.", "The deck is bullying me and I can't prove it.", "I've made peace with this catastrophe.", "Somewhere a math teacher is laughing at me.", "I'd complain to management but I am management.", "This hand has the energy of a flat tire.", "Truly, magnificently, historically bad."],
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
// Probability the hit card lands between / matches the player's two cards.
// Model: from this player's view, 50 cards are unseen (the full deck minus
// their own 2). The hit card is drawn from the real round deck without
// replacement, so among the cards this player can't see it's uniformly
// random — making this 50-card model the correct per-player estimate.
function calcOdds(a, b) {
  const lo = Math.min(RV[a.rank], RV[b.rank]);
  const hi = Math.max(RV[a.rank], RV[b.rank]);
  const sp = hi - lo;
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
  // EV per ◆1 on spread bet ≈ hitProb − doinkProb (since miss = lose bet, doink = lose 2x)
  // Actually: EV = hitProb*1 − doinkProb*1 − missProb*0... wait, miss DOES lose the bet.
  // Re-derive: EV = hitProb*(+1) + doinkProb*(-1) + missProb*(-1) = hitProb − 1 + missProb*0... no.
  // Simplest: outcome*1 if hit, -1 if miss, -1 if doink (extra penalty already in -1).
  // EV per ◆1 = hitProb − (1 − hitProb) = 2*hitProb − 1.
  // sp 1 → hit 0%, EV = -1
  // sp 4 → hit 24%, EV = -0.52
  // sp 7 → hit 48%, EV = -0.04
  // sp 8 → hit 56%, EV = +0.12
  // sp 10 (A-J) → hit 72%, EV = +0.44
  if (sp === 2) return { label: " Mythical available", color: "#9B59B6" };
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
  //   The human sits at the BOTTOM of the table (the natural mobile position
  //   — your hand and controls are under your thumb).
  //   Bots wrap up the left side, across the top, and down the right side.
  //   The table is a TALL vertical capsule, so the seat ellipse uses a small
  //   horizontal radius and a large vertical radius.
  //
  // Coordinate system: x,y in percent of the table area.
  //   deg=90 → bottom, deg=270 → top.
  const pos = {};
  const humans = players.filter(p => !p.isBot);
  const bots = players.filter(p => p.isBot);

  // The table capsule is a tall portrait capsule. Seats ride ON the rail, so
  // the seat ellipse matches the capsule's aspect. These radii are % of the
  // table-area container, tuned so seats sit on the padded rail and stay
  // fully on-screen.
  const rx = landscape ? 40 : 44;
  const ry = landscape ? 40 : 41;

  // Clamp helper — keep every seat within the visible container with margin
  // for the nameplate + cards (which extend above/below the anchor point).
  const clampX = v => Math.max(12, Math.min(88, v));
  // Top seats need a little more headroom (avatar sits above the cards), and
  // the bottom human seat is pulled up so it clears the controls.
  const clampY = v => Math.max(15, Math.min(86, v));

  // Human(s) along the BOTTOM arc, centered on deg=90 (bottom). Pulled up
  // slightly (ry * 0.86) so the larger human hand + 3-card zone clears the
  // bottom controls.
  if (humans.length > 0) {
    const n = humans.length;
    const span = Math.min(80, (n - 1) * 50);
    humans.forEach((p, i) => {
      const deg = n === 1 ? 90 : (90 - span / 2) + (span / (n - 1)) * i;
      const rad = deg * Math.PI / 180;
      pos[p.id] = {
        x: clampX(50 + rx * Math.cos(rad)),
        y: clampY(50 + ry * 0.86 * Math.sin(rad)),
      };
    });
  }

  // Bots wrap the rest of the capsule. Arc centered on the TOP (deg=270),
  // widening with bot count so up to 6 bots ring the table evenly without
  // crowding the human at the bottom.
  if (bots.length > 0) {
    const n = bots.length;
    //  1→0°  2→100°  3→160°  4→210°  5→240°  6→262°
    const spanByCount = [0, 0, 100, 160, 210, 240, 262, 276, 288];
    const span = spanByCount[Math.min(n, spanByCount.length - 1)];
    bots.forEach((p, i) => {
      const deg = n === 1 ? 270 : (270 - span / 2) + (span / (n - 1)) * i;
      const rad = deg * Math.PI / 180;
      const sinV = Math.sin(rad), cosV = Math.cos(rad);
      // Pull the top-most seats down a touch so the avatar+cards tuck tight
      // into the top rail rather than drifting toward the center.
      const topPull = sinV < 0 ? 1 + sinV * 0.06 : 1;
      pos[p.id] = {
        x: clampX(50 + rx * cosV),
        y: clampY(50 + ry * sinV * topPull),
      };
    });
  }

  return pos;
}

// ─────────────────────────────────────────────────────────
// CARD & PLACEHOLDER
// ─────────────────────────────────────────────────────────
// A very compact card chip (rank + suit) for dense lists like the round
// recap, where the full Card component would be far too large.
function MiniCard({ card }) {
  if (!card) return null;
  const isRed = RED.has(card.suit);
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", justifyContent:"center", gap:1,
      minWidth:26, height:30, padding:"0 5px", borderRadius:5,
      background:"linear-gradient(160deg,#FFFFFF,#F4EFE0)",
      border:"1px solid rgba(0,0,0,0.18)", boxShadow:"0 1px 3px rgba(0,0,0,0.5)",
      fontFamily:"'DM Sans',sans-serif", fontWeight:800, fontSize:"0.8rem",
      color: isRed ? "#C0392B" : "#0D0D1A", lineHeight:1,
    }}>
      {card.rank}<span style={{ fontSize:"0.72rem" }}>{card.suit}</span>
    </span>
  );
}

function Card({ card, faceDown = false, small = false, animClass = "deal-anim", delay = 0, glow = false, scale = 1 }) {
  if (!card && !faceDown) return <Placeholder small={small} scale={scale} />;
  const W = (small ? 46 : 82) * scale, H = (small ? 64 : 116) * scale;
  const isRed = RED.has(card?.suit);
  const color = faceDown ? "#A07030" : isRed ? "#C0392B" : "#0D0D1A";
  // Active Quick Play card back (null in Career → default brown back).
  const cb = ACTIVE_COSMETICS.cardBack;
  const backBg = cb ? cb.back : "linear-gradient(145deg,#1C0A02,#0F0601)";
  const backBorder = cb ? cb.border : "#5A3010";
  const backMotif = cb ? cb.motif : "#A07030";
  // Scale typography and padding with size so the card looks proportional
  const rankSize = (small ? 0.78 : 1.25) * scale;
  const suitSize = (small ? 0.7 : 1.05) * scale;
  const bigSuitSize = (small ? 1.1 : 2) * scale;
  return (
    <div className={faceDown ? "" : animClass} style={{
      animationDelay: `${delay}s`, width: W, height: H, borderRadius: (small ? 8 : 11) * scale, flexShrink: 0,
      background: faceDown ? backBg : "linear-gradient(160deg,#FFFFFF 0%,#F8F3E4 100%)",
      border: glow ? "2.5px solid #D4A843" : faceDown ? `1px solid ${backBorder}` : "1px solid rgba(0,0,0,0.12)",
      boxShadow: glow ? "0 0 20px rgba(212,168,67,0.65),0 6px 20px rgba(0,0,0,0.8)" : "0 4px 16px rgba(0,0,0,0.75),0 1px 3px rgba(0,0,0,0.3)",
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: `${(small ? 3 : 5) * scale}px ${(small ? 4 : 7) * scale}px`, userSelect: "none",
    }}>
      {faceDown
        ? <div style={{ flex:1, borderRadius: (small?5:8)*scale, border:`1px solid ${backMotif}`, display:"flex",alignItems:"center",justifyContent:"center", opacity:0.85 }}>
            <span style={{fontSize:`${bigSuitSize}rem`, color:backMotif, opacity:0.55}}>◆</span>
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
function Placeholder({ small, scale = 1, doinkSlot = false }) {
  const W = (small ? 46 : 82) * scale, H = (small ? 64 : 116) * scale;
  // The doink-card slot reserves the third card position before reveal — it
  // reads as a faint "?" so the player knows a card lands there.
  if (doinkSlot) {
    return (
      <div style={{
        width:W, height:H, borderRadius:(small?8:11)*scale,
        background:"rgba(212,168,67,0.05)",
        border:"1.5px dashed rgba(212,168,67,0.28)",
        flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <span style={{ color:"rgba(212,168,67,0.4)", fontSize:(small?0.8:1.2)*scale+"rem", fontWeight:800, fontFamily:"'Playfair Display',serif" }}>?</span>
      </div>
    );
  }
  return <div style={{ width:W, height:H, borderRadius: (small?8:11)*scale, background:"rgba(255,255,255,0.03)", border:"1.5px dashed rgba(255,255,255,0.1)", flexShrink:0 }} />;
}

// ─────────────────────────────────────────────────────────
// CHIP PILE
// ─────────────────────────────────────────────────────────
function ChipPile({ amount }) {
  if (!amount) return null;
  const DENOMS = [500, 100, 50, 25, 10, 5, 2, 1];
  const chips = []; let rem = amount;
  for (const d of DENOMS) { while (rem >= d && chips.length < 10) { chips.push(d); rem -= d; } }
  return (
    <div style={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center", alignItems: "flex-end", maxWidth: 80 }}>
      {chips.map((d, i) => (
        <div key={i} style={{ width: 13, height: 13, borderRadius: "50%", background: chipColorFor(d), border: "2px dashed rgba(255,255,255,0.35)", boxShadow: "0 2px 4px rgba(0,0,0,0.5)", animation: `chipBob ${0.9 + i * 0.07}s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }} />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DECK STACK — a visible face-down deck on the felt. Cards appear
// to deal from here; it riffles during the shuffle phase. Purely
// visual — the real deck logic lives in useDeck().
// ─────────────────────────────────────────────────────────
function DeckStack({ shuffling, landscape }) {
  const cb = ACTIVE_COSMETICS.cardBack;
  const backBg = cb ? cb.back : "linear-gradient(145deg,#1C0A02,#0F0601)";
  const backBorder = cb ? cb.border : "#5A3010";
  const backMotif = cb ? cb.motif : "#A07030";
  const W = landscape ? 30 : 34, H = landscape ? 42 : 48;
  const layers = [0, 1, 2, 3, 4];
  return (
    <div aria-hidden="true" style={{ position:"relative", width:W + 8, height:H + 8 }}>
      {layers.map(i => {
        const isTop = i === layers.length - 1;
        return (
          <div key={i} style={{
            position:"absolute", left:i * 1.4, top:i * -1.4,
            width:W, height:H, borderRadius:6,
            background:backBg, border:`1px solid ${backBorder}`,
            boxShadow:"0 2px 6px rgba(0,0,0,0.6)",
            display:"flex", alignItems:"center", justifyContent:"center",
            animation: shuffling
              ? `${i % 2 ? "deckRiffleB" : "deckRiffleA"} 0.5s ${i * 0.04}s ease-in-out`
              : "none",
          }}>
            {isTop && (
              <div style={{ width:"56%", height:"62%", borderRadius:3, border:`1.5px solid ${backMotif}`, opacity:0.7, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <span style={{ color:backMotif, fontSize:"0.7rem", fontWeight:800 }}>◆</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// FLYING CHIPS — a pure visual layer that animates a small cluster
// of chips from a source point to a destination point. Coordinates
// are in PERCENT of the table-area container, matching getSeatPositions.
// This NEVER touches bet/pot state — it is decoration only, driven by
// a list of flight descriptors the game pushes and clears.
// ─────────────────────────────────────────────────────────
function FlyingChips({ flights }) {
  if (!flights || flights.length === 0) return null;
  return (
    <div aria-hidden="true" style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:18, overflow:"hidden" }}>
      {flights.map(f => {
        // 3–5 chips per flight, staggered, each easing along the path.
        const n = Math.min(5, Math.max(3, Math.round((f.amount || 1) / 10) + 2));
        return Array.from({ length: n }).map((_, i) => (
          <div key={`${f.id}-${i}`} style={{
            position:"absolute",
            width:14, height:14, marginLeft:-7, marginTop:-7,
            borderRadius:"50%",
            background: chipColorFor([100,25,5][i % 3]),
            border:"2px dashed rgba(255,255,255,0.5)",
            boxShadow:"0 3px 7px rgba(0,0,0,0.65)",
            // start/end positions fed to the chipFly keyframe (percent of
            // the table-area container).
            ["--fromX"]: `${f.fromX}%`, ["--fromY"]: `${f.fromY}%`,
            ["--toX"]: `${f.toX}%`,     ["--toY"]: `${f.toY}%`,
            left:`${f.toX}%`, top:`${f.toY}%`,
            animation:`chipFly ${f.dur || 520}ms cubic-bezier(.4,.05,.35,1) ${i * 55}ms both`,
          }}/>
        ));
      })}
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

  return <span style={style}>◆{display}</span>;
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
          {delta > 0 ? `+◆${delta}` : `-◆${Math.abs(delta)}`}
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
          <GreekBust marble={cfg.marble} style={cfg.bustStyle} gilded={cfg.isHuman} accessory={cfg.accessory}/>
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
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:14, maxWidth:340, margin:"0 auto" }}>
      <div style={{ display:"flex", gap:10, flexWrap:"wrap", justifyContent:"center" }}>
        {denoms.filter(d => d <= max).map(d => (
          <button key={d} onClick={() => onChange(Math.min(value + d, max))} style={{ width:52, height:52, borderRadius:"50%", border:"2.5px solid rgba(255,255,255,0.3)", background:chipColorFor(d), color:"#fff", fontWeight:700, fontSize:"0.75rem", boxShadow:"0 4px 12px rgba(0,0,0,0.6),inset 0 1px 0 rgba(255,255,255,0.2)" }}>+{d}</button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:16, background:"rgba(0,0,0,0.3)", borderRadius:16, padding:"10px 20px", border:"1px solid rgba(255,255,255,0.08)" }}>
        <button onClick={() => onChange(0)} style={{ width:36, height:36, borderRadius:"50%", background:"rgba(231,76,60,0.15)", border:"1.5px solid rgba(231,76,60,0.4)", color:"#E74C3C", fontSize:"1rem", fontWeight:700, display:"flex",alignItems:"center",justifyContent:"center" }}>✕</button>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", color:"#F0C96A", minWidth:80, textAlign:"center", fontWeight:700 }}>◆{value}</div>
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
        <span style={{ fontSize:"0.72rem", color:"#E74C3C", fontWeight:600 }}> {doinkPct}%</span>
        <span style={{ fontSize:"0.72rem", color:"rgba(245,237,216,0.38)", fontWeight:500 }}>● {missPct}%</span>
        {mythical && <span style={{ fontSize:"0.72rem", color:"#9B59B6", fontWeight:700 }}> 12× avail!</span>}
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
  const desc = chips > 0 && pct > 0 ? `◆${chips} + ${pct}% of winnings` : chips > 0 ? `◆${chips} upfront` : pct > 0 ? `${pct}% of winnings` : "";
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
  const label = type === "doink" ? "Doink Bet" : type === "doubledoink" ? "Double Doink" : type === "mythical" ? "Mythical" : type === "blind" ? "Blind" : "Spread";
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

// ═══════════════════════════════════════════════════════════
// GAME ICONS — custom inline-SVG glyphs replacing emoji in major
// gameplay effects. Renders identically on iOS / Android / web.
// Usage: <GameIcon name="doink" size={32} color="#E74C3C" />
// ═══════════════════════════════════════════════════════════
function GameIcon({ name, size = 24, color = "#F0C96A" }) {
  const common = { width: size, height: size, viewBox: "0 0 32 32", "aria-hidden": true, fill: "none" };
  switch (name) {
    case "doink": // impact burst — concentric ring + radiating shards
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="7" fill="none" stroke={color} strokeWidth="2.6"/>
          {[0,45,90,135,180,225,270,315].map(d => (
            <line key={d} x1="16" y1="16" x2="16" y2="3"
              stroke={color} strokeWidth="2.2" strokeLinecap="round"
              transform={`rotate(${d} 16 16)`} opacity="0.92"/>
          ))}
          <circle cx="16" cy="16" r="2.6" fill={color}/>
        </svg>
      );
    case "mythical": // split rift — a card divided by a shimmer line
      return (
        <svg {...common}>
          <path d="M9 5 L7 16 L9 27" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none"/>
          <path d="M23 5 L25 16 L23 27" stroke={color} strokeWidth="2.4" strokeLinecap="round" fill="none"/>
          <line x1="16" y1="3" x2="16" y2="29" stroke={color} strokeWidth="1.8" strokeDasharray="2 2.6"/>
          <path d="M16 9 l3 7 -3 7 -3 -7 z" fill={color} opacity="0.55"/>
        </svg>
      );
    case "chip": // poker chip with dashed rim
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="12" fill={color}/>
          <circle cx="16" cy="16" r="7" fill="none" stroke="#0C0703" strokeWidth="2" strokeDasharray="3 3" opacity="0.55"/>
        </svg>
      );
    case "card": // playing card
      return (
        <svg {...common}>
          <rect x="8" y="5" width="16" height="22" rx="2.6" fill={color}/>
          <path d="M16 11 l3.4 5 -3.4 5 -3.4 -5 z" fill="#0C0703" opacity="0.55"/>
        </svg>
      );
    case "blind": // eye closed — a lid over an iris
      return (
        <svg {...common}>
          <path d="M5 16 q11 -11 22 0" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round"/>
          <path d="M5 16 q11 11 22 0" stroke={color} strokeWidth="2.4" fill="none" strokeLinecap="round"/>
          <circle cx="16" cy="16" r="3.4" fill={color}/>
        </svg>
      );
    case "win": // laurel/star
      return (
        <svg {...common}>
          <path d="M16 4 l3.2 7 7.6 .6 -5.8 5 1.8 7.4 -6.8 -4 -6.8 4 1.8 -7.4 -5.8 -5 7.6 -.6 z" fill={color}/>
        </svg>
      );
    case "pot": // stacked chips
      return (
        <svg {...common}>
          <ellipse cx="16" cy="22" rx="11" ry="4" fill={color} opacity="0.5"/>
          <ellipse cx="16" cy="18" rx="11" ry="4" fill={color} opacity="0.75"/>
          <ellipse cx="16" cy="14" rx="11" ry="4" fill={color}/>
        </svg>
      );
    case "trophy":
      return (
        <svg {...common}>
          <path d="M11 6h10v5a5 5 0 01-10 0z" fill={color}/>
          <path d="M11 7H7v2a4 4 0 004 4M21 7h4v2a4 4 0 01-4 4" stroke={color} strokeWidth="2" fill="none"/>
          <rect x="14" y="16" width="4" height="6" fill={color}/>
          <rect x="10" y="22" width="12" height="3" rx="1" fill={color}/>
        </svg>
      );
    case "medal":
      return (
        <svg {...common}>
          <path d="M11 4l5 9 5-9" stroke={color} strokeWidth="2.4" fill="none"/>
          <circle cx="16" cy="20" r="8" fill={color}/>
          <circle cx="16" cy="20" r="3.6" fill="#0C1A10"/>
        </svg>
      );
    case "lock":
      return (
        <svg {...common}>
          <rect x="8" y="14" width="16" height="13" rx="2.5" fill={color}/>
          <path d="M11 14v-3a5 5 0 0110 0v3" stroke={color} strokeWidth="2.6" fill="none"/>
        </svg>
      );
    case "unlock":
      return (
        <svg {...common}>
          <rect x="8" y="14" width="16" height="13" rx="2.5" fill={color}/>
          <path d="M11 14v-3a5 5 0 019.6-2" stroke={color} strokeWidth="2.6" fill="none"/>
        </svg>
      );
    case "handshake":
      return (
        <svg {...common}>
          <path d="M5 13l6-4 5 3 5-3 6 4-5 9-4-3-3 3-3-3-4 3z" fill={color}/>
        </svg>
      );
    case "coins": // chip stack used for "money" contexts
      return (
        <svg {...common}>
          <ellipse cx="16" cy="11" rx="9" ry="3.4" fill={color}/>
          <path d="M7 11v6c0 1.9 4 3.4 9 3.4s9-1.5 9-3.4v-6" stroke={color} strokeWidth="2" fill="none"/>
          <path d="M7 17v4c0 1.9 4 3.4 9 3.4s9-1.5 9-3.4v-4" stroke={color} strokeWidth="2" fill="none"/>
        </svg>
      );
    case "megaphone":
      return (
        <svg {...common}>
          <path d="M6 13l14-6v18l-14-6z" fill={color}/>
          <rect x="4" y="13" width="4" height="6" rx="1" fill={color}/>
          <path d="M10 20v5h3v-4" stroke={color} strokeWidth="2" fill="none"/>
        </svg>
      );
    case "dice":
      return (
        <svg {...common}>
          <rect x="6" y="6" width="20" height="20" rx="4" fill={color}/>
          <circle cx="12" cy="12" r="2" fill="#0C1A10"/>
          <circle cx="20" cy="12" r="2" fill="#0C1A10"/>
          <circle cx="16" cy="16" r="2" fill="#0C1A10"/>
          <circle cx="12" cy="20" r="2" fill="#0C1A10"/>
          <circle cx="20" cy="20" r="2" fill="#0C1A10"/>
        </svg>
      );
    case "book":
      return (
        <svg {...common}>
          <path d="M6 7c4-2 8-2 10 0v19c-2-2-6-2-10 0z" fill={color}/>
          <path d="M26 7c-4-2-8-2-10 0v19c2-2 6-2 10 0z" fill={color} opacity="0.7"/>
        </svg>
      );
    case "scale":
      return (
        <svg {...common}>
          <rect x="15" y="6" width="2" height="20" fill={color}/>
          <path d="M8 10h16" stroke={color} strokeWidth="2"/>
          <path d="M8 10l-4 7h8zM24 10l-4 7h8z" stroke={color} strokeWidth="2" fill="none"/>
          <rect x="11" y="25" width="10" height="2.5" rx="1" fill={color}/>
        </svg>
      );
    case "person":
      return (
        <svg {...common}>
          <circle cx="16" cy="11" r="6" fill={color}/>
          <path d="M5 27c0-6 5-9 11-9s11 3 11 9z" fill={color}/>
        </svg>
      );
    case "cards": // two overlapping cards
      return (
        <svg {...common}>
          <rect x="6" y="9" width="13" height="17" rx="2.5" fill={color} opacity="0.6" transform="rotate(-12 12 17)"/>
          <rect x="13" y="7" width="13" height="17" rx="2.5" fill={color}/>
        </svg>
      );
    default:
      return <svg {...common}><circle cx="16" cy="16" r="10" fill={color}/></svg>;
  }
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
        {/* Custom chip-stack icon — chips converging toward a center pot.
            No emoji; pure SVG so it renders identically on every platform. */}
        <div aria-hidden="true" style={{ display:"flex", justifyContent:"center", marginBottom:16 }}>
          <svg width="92" height="92" viewBox="0 0 92 92" style={{ filter:"drop-shadow(0 0 18px rgba(212,168,67,0.6))" }}>
            {/* arrows from four sides pointing inward */}
            {[0,90,180,270].map(deg => (
              <g key={deg} transform={`rotate(${deg} 46 46)`}>
                <path d="M46 8 L52 20 L40 20 Z" fill="#D4A843" opacity="0.9"/>
              </g>
            ))}
            {/* center pot — stacked chips */}
            <ellipse cx="46" cy="58" rx="20" ry="7" fill="#0C0703"/>
            <ellipse cx="46" cy="54" rx="20" ry="7" fill="#5C420F"/>
            <ellipse cx="46" cy="50" rx="20" ry="7" fill="#8A6418"/>
            <ellipse cx="46" cy="46" rx="20" ry="7" fill="#D4A843"/>
            <ellipse cx="46" cy="46" rx="13" ry="4.4" fill="none" stroke="#F4D27A" strokeWidth="1.6"/>
          </svg>
        </div>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(3rem,12vw,4.6rem)", fontWeight:900, color:"#F0C96A", textShadow:"0 0 48px rgba(212,168,67,0.9), 0 0 96px rgba(212,168,67,0.55)", letterSpacing:"0.05em", lineHeight:1 }}>TABLE REPLENISH</div>
        <div aria-hidden="true" style={{ height:1.5, width:120, margin:"18px auto 16px", background:"linear-gradient(90deg, transparent, rgba(212,168,67,0.7), transparent)" }}/>
        <div style={{ fontSize:"1.05rem", color:"rgba(245,237,216,0.82)", fontWeight:500, maxWidth:300, margin:"0 auto", lineHeight:1.55 }}>The pot is empty.<br/>Everyone pays back in.</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// DOINK ANIMATION — signature branded moment. The word stamps
// onto the table with an expanding impact ring. No emoji.
// ─────────────────────────────────────────────────────────
function DoinkFullScreen({ name }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:285, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", background:"radial-gradient(ellipse at center,rgba(231,76,60,0.4),rgba(231,76,60,0.06) 70%)", animation:"popIn .2s cubic-bezier(.16,1,.3,1) both" }}>
      {/* expanding impact ring */}
      <div aria-hidden="true" style={{
        position:"absolute", width:60, height:60, borderRadius:"50%",
        border:"4px solid rgba(231,76,60,0.9)",
        animation:"doinkRing .6s cubic-bezier(.2,.7,.3,1) forwards",
      }}/>
      {/* second, slower ring */}
      <div aria-hidden="true" style={{
        position:"absolute", width:60, height:60, borderRadius:"50%",
        border:"2px solid rgba(240,201,106,0.7)",
        animation:"doinkRing .85s .08s cubic-bezier(.2,.7,.3,1) forwards",
      }}/>
      {/* the stamp */}
      <div style={{
        fontFamily:"'Playfair Display',serif", fontSize:"clamp(4rem,18vw,8rem)", fontWeight:900,
        color:"#fff", letterSpacing:"0.04em", lineHeight:1,
        textShadow:"0 0 30px rgba(231,76,60,1),0 0 80px rgba(231,76,60,0.9),0 8px 0 rgba(0,0,0,0.55)",
        animation:"doinkStamp .42s cubic-bezier(.34,1.56,.5,1) both",
      }}>DOINK</div>
      <div style={{
        display:"flex", alignItems:"center", gap:8, marginTop:14,
        animation:"fadeUp .3s .18s both",
      }}>
        <GameIcon name="doink" size={22} color="#fff"/>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.35rem", color:"#fff", fontWeight:700, textShadow:"0 0 24px rgba(231,76,60,0.95)" }}>{name}</span>
        <GameIcon name="doink" size={22} color="#fff"/>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// MYTHICAL SPLIT ANIMATION — a card rises, a rift splits it
// into two mirrored halves with a shimmer. Distinct from DOINK.
// ─────────────────────────────────────────────────────────
function MythicalFullScreen({ name }) {
  const half = (side) => (
    <div style={{
      width:54, height:78, overflow:"hidden", position:"relative",
      animation:`mythSplit .5s .25s cubic-bezier(.3,.8,.4,1) both`,
      ["--shift"]: side === "L" ? "-20px" : "20px",
    }}>
      <div style={{
        width:108, height:78,
        position:"absolute", left: side === "L" ? 0 : -54, top:0,
        borderRadius:9,
        background:"linear-gradient(160deg,#FFFFFF,#E8DEF6)",
        border:"2px solid #9B59B6",
        display:"flex", alignItems:"center", justifyContent:"center",
      }}>
        <div style={{ width:96, height:66, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <GameIcon name="mythical" size={40} color="#9B59B6"/>
        </div>
      </div>
    </div>
  );
  return (
    <div style={{ position:"fixed", inset:0, zIndex:286, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", pointerEvents:"none", background:"radial-gradient(ellipse at center,rgba(155,89,182,0.42),rgba(155,89,182,0.06) 70%)", animation:"popIn .22s cubic-bezier(.16,1,.3,1) both" }}>
      <div style={{ display:"flex", animation:"mythRise .4s cubic-bezier(.34,1.4,.5,1) both", position:"relative" }}>
        {half("L")}
        {/* rift shimmer line down the middle */}
        <div aria-hidden="true" style={{
          position:"absolute", left:"50%", top:-8, bottom:-8, width:3,
          transform:"translateX(-50%)",
          background:"linear-gradient(180deg,transparent,#F0C96A,#fff,#F0C96A,transparent)",
          boxShadow:"0 0 16px rgba(240,201,106,0.95)",
          animation:"mythShimmer 1.1s ease-in-out both",
        }}/>
        {half("R")}
      </div>
      <div style={{
        fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.2rem,9vw,3.6rem)", fontWeight:900,
        color:"#fff", letterSpacing:"0.05em", lineHeight:1, marginTop:22,
        textShadow:"0 0 30px rgba(155,89,182,1),0 0 70px rgba(155,89,182,0.85)",
        animation:"fadeUp .35s .3s both",
      }}>MYTHICAL SPLIT</div>
      <div style={{
        display:"flex", alignItems:"center", gap:8, marginTop:10,
        animation:"fadeUp .35s .42s both",
      }}>
        <GameIcon name="mythical" size={20} color="#fff"/>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#fff", fontWeight:700, textShadow:"0 0 22px rgba(155,89,182,0.95)" }}>{name}</span>
        <GameIcon name="mythical" size={20} color="#fff"/>
      </div>
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
          <span style={{ fontSize:"0.65rem", color:"rgba(245,237,216,0.85)", fontWeight:600, whiteSpace:"nowrap" }}>{h.outcome==="win"?`+◆${h.amount}`:h.outcome==="doink"?`-◆${h.amount}`:h.outcome==="miss"?`-◆${h.amount}`:"pass"}</span>
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
// ─────────────────────────────────────────────────────────
// SLIDE-UP SHEET — shared shell for the Log and Market drawers.
// Dims the table behind, closes on X / outside tap / swipe down.
// ─────────────────────────────────────────────────────────
function SlideSheet({ title, onClose, children }) {
  const startY = useRef(null);
  const [drag, setDrag] = useState(0);
  const onTouchStart = e => { startY.current = e.touches[0].clientY; };
  const onTouchMove = e => {
    if (startY.current == null) return;
    const dy = e.touches[0].clientY - startY.current;
    if (dy > 0) setDrag(dy);            // only track downward drag
  };
  const onTouchEnd = () => {
    if (drag > 90) onClose();           // dragged far enough → close
    setDrag(0);
    startY.current = null;
  };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, zIndex:60, background:"rgba(0,0,0,0.62)", backdropFilter:"blur(4px)" }}>
      <div
        onClick={e => e.stopPropagation()}
        onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        className="sheet-up"
        style={{
          position:"fixed", bottom:0, left:0, right:0,
          transform: drag ? `translateY(${drag}px)` : undefined,
          transition: drag ? "none" : undefined,
          background:"linear-gradient(175deg,#0C1A10,#060D08)",
          borderTop:"1.5px solid rgba(212,168,67,0.22)",
          borderRadius:"22px 22px 0 0",
          padding:`10px 20px calc(26px + env(safe-area-inset-bottom))`,
          maxHeight:"66vh", overflowY:"auto", zIndex:61,
        }}>
        {/* grab handle */}
        <div aria-hidden="true" style={{ width:38, height:4, borderRadius:3, background:"rgba(245,237,216,0.25)", margin:"4px auto 12px" }}/>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#D4A843", fontWeight:700, letterSpacing:"0.02em" }}>{title}</div>
          <button onClick={onClose} aria-label="Close" style={{ width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.08)", border:"none", color:"rgba(245,237,216,0.7)", fontSize:"0.95rem", fontWeight:700, cursor:"pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Lower-rail buttons + the Log / Market drawers. `openDrawer` is owned by the
// parent so the two drawers are mutually exclusive.
function TableDrawers({ openDrawer, setOpenDrawer, log, marketContent }) {
  return (
    <>
      {/* Lower rail: LOG only. The MARKET button is hidden (J10) — hand
          trading is temporarily disabled. The market drawer code below is
          left dormant (openDrawer can no longer become "market") so the
          feature can be restored later without a rebuild. */}
      <div style={{ flexShrink:0, display:"flex", justifyContent:"center", alignItems:"center", padding:"6px 14px 8px", zIndex:30 }}>
        <button onClick={() => setOpenDrawer("log")} style={drawerTabStyle}>
          <span style={{ fontSize:"0.62rem", letterSpacing:"0.12em" }}>▤ LOG</span>
        </button>
      </div>

      {openDrawer === "log" && (
        <SlideSheet title="Game Log" onClose={() => setOpenDrawer(null)}>
          {[...log].reverse().slice(0, 30).map((entry, i) => (
            <div key={i} style={{ fontSize:"0.86rem", padding:"8px 0", borderBottom:"1px solid rgba(255,255,255,0.05)", color:entry.type==="doink"?"#E74C3C":entry.type==="win"?"#27AE60":"rgba(245,237,216,0.65)", fontWeight:entry.type==="doink"||entry.type==="win"?600:400, lineHeight:1.4 }}>
              {entry.msg}
            </div>
          ))}
          {log.length === 0 && <div style={{ color:"rgba(245,237,216,0.4)", fontSize:"0.85rem", textAlign:"center", padding:"16px 0" }}>No events yet.</div>}
        </SlideSheet>
      )}

      {openDrawer === "market" && (
        <SlideSheet title="Marketplace" onClose={() => setOpenDrawer(null)}>
          <div style={{ fontSize:"0.74rem", color:"rgba(212,168,67,0.7)", textAlign:"center", marginBottom:12, fontWeight:600 }}>
            Gameplay is paused while the Marketplace is open.
          </div>
          {marketContent}
        </SlideSheet>
      )}
    </>
  );
}

const drawerTabStyle = {
  padding:"7px 14px", borderRadius:10,
  background:"rgba(0,0,0,0.55)", backdropFilter:"blur(8px)",
  border:"1px solid rgba(212,168,67,0.25)",
  color:"rgba(245,237,216,0.7)", fontWeight:800, cursor:"pointer",
};

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
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", color:"#D4A843", fontWeight:900, letterSpacing:"0.01em" }}>GAPPER</div>
        <button onClick={onClose} style={{ ...sBtn, padding:"10px 18px", fontSize:"0.9rem" }}>← Back</button>
      </div>
      <div style={{ maxWidth:480, margin:"0 auto" }}>
        {sec("The Basics","To start, everyone replenishes the pot. Each player is dealt two cards. On your turn, you bet whether a third 'hit' card will fall between your two cards in value. Aces are low (value 1). Win and the pot pays you 1:1. Miss and your bet goes to the pot.")}
        {sec("DOINK ","If your hit card matches the rank of either of your two cards — DOINK. You pay double your bet into the pot. Bet ◆10 and doink, you owe ◆20. This is the game.")}
        {sec("Replenish","Whenever the pot hits ◆0, everyone replenishes immediately and play continues. The game starts the same way.")}
        {sec("Bet Types",<><b style={{color:"#F0C96A"}}>Spread Bet</b> — Hit falls between your cards. Pays 1:1.<br/><br/><b style={{color:"#E74C3C"}}> Doink Bet</b> — Hit MATCHES one of your cards. Pays 7:1.<br/><br/><b style={{color:"#C0392B"}}> Double Doink</b> — When you hold a pair, bet that a third card of that rank is the hit. Pays 18:1.<br/><br/><b style={{color:"#9B59B6"}}> Mythical Split</b> — Cards exactly 2 apart. That one middle card pays 12:1.<br/><br/><b style={{color:"#D4A843"}}> Blind Bet</b> — Bet before cards are dealt. A hit pays 2:1.</>)}
        {sec("Hand Trading","Buy or sell hands at any point. The buyer plays both their hand AND the bought hand, in original turn order. You collect payment immediately when you sell.")}
        {sec("Insurance","Pay a premium upfront. If you doink, a portion of your penalty is covered.")}
        {sec("Strategy","Wide spreads (A–K) = play big. Narrow spreads = pass or doink bet. Selling a trash hand for chips beats passing. Position matters — going early in a fat pot differs from going late.")}
        {sec("Fictional Play Only","Gapper uses fictional play chips. No real money is wagered, won, lost, or redeemable. Chips, levels, and rankings are for entertainment only.")}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// SETUP
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// QUICK PLAY SETUP — customization screen (themes, chips, cards,
// avatar, settings). Everything gated by career level.
// ─────────────────────────────────────────────────────────
function Setup({ onStart, onShowTutorial, onBack, careerLevel = 1, displayName = "Player" }) {
  const lvl = careerLevel || 1;

  // Initialize from saved settings, sanitized against the current level.
  const [sel, setSel] = useState(() => sanitizeQuickPlaySettings(loadQuickPlaySettings(), lvl));

  // Persist on every change.
  useEffect(() => { saveQuickPlaySettings(sel); }, [sel]);

  const set = (patch) => setSel(s => ({ ...s, ...patch }));

  // Apply a preset (only if unlocked).
  const applyPreset = (preset) => {
    if (!isUnlocked(preset, lvl)) return;
    set({
      tableThemeId: preset.themeId,
      chipSetId: preset.chipId,
      cardBackId: preset.cardId,
      botCount: preset.bots,
      buyIn: preset.buyIn,
      ante: preset.ante,
      replenishAmount: preset.replenish,
    });
  };

  // Randomize across unlocked options only.
  const randomize = () => {
    const pick = (opts, key = "id") => {
      const u = getUnlockedOptions(opts, lvl);
      return u[0 | Math.random() * u.length][key];
    };
    set({
      tableThemeId: pick(TABLE_THEMES),
      chipSetId: pick(CHIP_SETS),
      cardBackId: pick(CARD_BACKS),
      avatarId: pick(QP_AVATARS),
      botCount: pick(BOT_COUNT_OPTIONS, "value"),
      buyIn: pick(BUYIN_OPTIONS, "value"),
      ante: pick(ANTE_OPTIONS, "value"),
      replenishAmount: pick(REPLENISH_OPTIONS, "value"),
    });
  };

  const theme = themeById(sel.tableThemeId);
  const chipSet = chipSetById(sel.chipSetId);
  const cardBack = cardBackById(sel.cardBackId);

  const card = { background:"rgba(255,255,255,0.03)", borderRadius:16, padding:"16px 16px", border:"1px solid rgba(255,255,255,0.07)" };
  const sectionLabel = { fontSize:"0.66rem", letterSpacing:"0.18em", color:"rgba(212,168,67,0.65)", textTransform:"uppercase", fontWeight:700, marginBottom:10 };
  const lockBadge = { fontSize:"0.62rem", color:"rgba(231,76,60,0.85)", fontWeight:700, marginTop:4 };

  // Horizontal scroll strip wrapper
  const strip = { display:"flex", gap:10, overflowX:"auto", paddingBottom:4, WebkitOverflowScrolling:"touch" };

  const startGame = () => {
    // Build the cfg the game expects. Cosmetic ids ride along under `qp`.
    const denoms = [1,5,10,25,50,100,500].filter(d => d <= sel.buyIn);
    onStart({
      nH: 1,
      nB: sel.botCount,
      chips: sel.buyIn,
      ante: sel.ante,
      replenishAmount: sel.replenishAmount,
      denoms,
      names: [displayName || "Player"],
      botNames: shuffleBotNames(),
      orientation: "portrait",
      hintsDefault: true,
      qp: {
        tableThemeId: sel.tableThemeId,
        chipSetId: sel.chipSetId,
        cardBackId: sel.cardBackId,
        avatarId: sel.avatarId,
      },
    });
  };

  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:`calc(env(safe-area-inset-top) + 18px) 16px calc(150px + env(safe-area-inset-bottom))` }}>
        <div style={{ width:"100%", maxWidth:440 }}>

          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            {onBack ? <button onClick={onBack} style={{ ...sBtn, padding:"8px 14px", fontSize:"0.85rem" }}>← Back</button> : <div style={{width:60}}/>}
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"#D4A843", fontWeight:700, letterSpacing:"0.04em" }}>Quick Play</div>
            <div style={{ fontSize:"0.7rem", color:"rgba(212,168,67,0.6)", fontWeight:700, width:60, textAlign:"right" }}>Lvl {lvl}</div>
          </div>

          {/* Presets */}
          <div style={{ ...sectionLabel }}>Presets</div>
          <div style={{ ...strip, marginBottom:18 }}>
            {QP_PRESETS.map(p => {
              const unlocked = isUnlocked(p, lvl);
              return (
                <button key={p.id} onClick={() => applyPreset(p)} disabled={!unlocked} style={{
                  flexShrink:0, minWidth:104, padding:"12px 14px", borderRadius:14, cursor:unlocked?"pointer":"default",
                  background: unlocked ? "rgba(212,168,67,0.1)" : "rgba(255,255,255,0.025)",
                  border: unlocked ? "1.5px solid rgba(212,168,67,0.4)" : "1px solid rgba(255,255,255,0.07)",
                  opacity: unlocked ? 1 : 0.55, textAlign:"center",
                }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.92rem", color:unlocked?"#F0C96A":"rgba(245,237,216,0.5)", fontWeight:700 }}>{p.name}</div>
                  {unlocked
                    ? <div style={{ fontSize:"0.62rem", color:"rgba(245,237,216,0.45)", marginTop:3 }}>{p.bots} bots · ${p.buyIn}</div>
                    : <div style={lockBadge}> Level {p.unlockLevel}</div>}
                </button>
              );
            })}
          </div>

          {/* Randomize */}
          <button onClick={randomize} style={{ ...sBtn, width:"100%", marginBottom:18, fontSize:"0.9rem", padding:"12px" }}>
             Randomize Unlocked Setup
          </button>

          {/* Table Theme */}
          <div style={sectionLabel}>Table Theme</div>
          <div style={{ ...strip, marginBottom:18 }}>
            {TABLE_THEMES.map(t => {
              const unlocked = isUnlocked(t, lvl);
              const on = sel.tableThemeId === t.id;
              return (
                <button key={t.id} onClick={() => unlocked && set({ tableThemeId: t.id })} disabled={!unlocked} style={{
                  flexShrink:0, width:120, padding:8, borderRadius:14, cursor:unlocked?"pointer":"default",
                  background:"rgba(0,0,0,0.3)",
                  border: on ? "2px solid #F0C96A" : "1.5px solid rgba(255,255,255,0.1)",
                  opacity: unlocked ? 1 : 0.5,
                }}>
                  {/* mini felt preview */}
                  <div style={{ height:54, borderRadius:9, background:`radial-gradient(ellipse at 50% 35%, ${t.felt}, ${t.feltDark})`, border:`2px solid ${t.rail}`, marginBottom:6 }}/>
                  <div style={{ fontSize:"0.72rem", color:unlocked?"#F5EDD8":"rgba(245,237,216,0.5)", fontWeight:600 }}>{t.name}</div>
                  {!unlocked && <div style={lockBadge}> Level {t.unlockLevel}</div>}
                </button>
              );
            })}
          </div>

          {/* Card Back */}
          <div style={sectionLabel}>Card Back</div>
          <div style={{ ...strip, marginBottom:18 }}>
            {CARD_BACKS.map(cb => {
              const unlocked = isUnlocked(cb, lvl);
              const on = sel.cardBackId === cb.id;
              return (
                <button key={cb.id} onClick={() => unlocked && set({ cardBackId: cb.id })} disabled={!unlocked} style={{
                  flexShrink:0, width:104, padding:8, borderRadius:14, cursor:unlocked?"pointer":"default",
                  background:"rgba(0,0,0,0.3)",
                  border: on ? "2px solid #F0C96A" : "1.5px solid rgba(255,255,255,0.1)",
                  opacity: unlocked ? 1 : 0.5,
                }}>
                  <div style={{ height:64, borderRadius:8, background:cb.back, border:`2px solid ${cb.border}`, marginBottom:6, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:"54%", height:"66%", borderRadius:4, border:`1.5px solid ${cb.motif}`, opacity:0.7, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ color:cb.motif, fontSize:"0.85rem", fontWeight:800 }}>◆</span>
                    </div>
                  </div>
                  <div style={{ fontSize:"0.7rem", color:unlocked?"#F5EDD8":"rgba(245,237,216,0.5)", fontWeight:600 }}>{cb.name}</div>
                  {!unlocked && <div style={lockBadge}> Level {cb.unlockLevel}</div>}
                </button>
              );
            })}
          </div>

          {/* Chip Set */}
          <div style={sectionLabel}>Chip Set</div>
          <div style={{ ...strip, marginBottom:18 }}>
            {CHIP_SETS.map(cs => {
              const unlocked = isUnlocked(cs, lvl);
              const on = sel.chipSetId === cs.id;
              return (
                <button key={cs.id} onClick={() => unlocked && set({ chipSetId: cs.id })} disabled={!unlocked} style={{
                  flexShrink:0, width:108, padding:8, borderRadius:14, cursor:unlocked?"pointer":"default",
                  background:"rgba(0,0,0,0.3)",
                  border: on ? "2px solid #F0C96A" : "1.5px solid rgba(255,255,255,0.1)",
                  opacity: unlocked ? 1 : 0.5,
                }}>
                  <div style={{ height:54, display:"flex", alignItems:"center", justifyContent:"center", gap:-6, marginBottom:6 }}>
                    {cs.swatch.map((c, i) => (
                      <div key={i} style={{ width:30, height:30, borderRadius:"50%", background:c,
                        border:"2px dashed rgba(255,255,255,0.55)", marginLeft:i?-8:0,
                        boxShadow:"0 2px 6px rgba(0,0,0,0.6)" }}/>
                    ))}
                  </div>
                  <div style={{ fontSize:"0.7rem", color:unlocked?"#F5EDD8":"rgba(245,237,216,0.5)", fontWeight:600 }}>{cs.name}</div>
                  {!unlocked && <div style={lockBadge}> Level {cs.unlockLevel}</div>}
                </button>
              );
            })}
          </div>

          {/* Avatar */}
          <div style={sectionLabel}>Avatar</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:18 }}>
            {QP_AVATARS.map(av => {
              const unlocked = isUnlocked(av, lvl);
              const on = sel.avatarId === av.id;
              return (
                <button key={av.id} onClick={() => unlocked && set({ avatarId: av.id })} disabled={!unlocked} style={{
                  padding:"10px 6px", borderRadius:14, cursor:unlocked?"pointer":"default",
                  background:"rgba(0,0,0,0.3)",
                  border: on ? "2px solid #F0C96A" : "1.5px solid rgba(255,255,255,0.1)",
                  opacity: unlocked ? 1 : 0.5,
                  display:"flex", flexDirection:"column", alignItems:"center", gap:5,
                }}>
                  <Avatar seed={av.seed} size={46} active={on} name={av.name} isHuman={on}/>
                  <div style={{ fontSize:"0.64rem", color:unlocked?"#F5EDD8":"rgba(245,237,216,0.5)", fontWeight:600, textAlign:"center", lineHeight:1.2 }}>{av.name}</div>
                  {!unlocked && <div style={{ ...lockBadge, marginTop:0 }}> Lvl {av.unlockLevel}</div>}
                </button>
              );
            })}
          </div>

          {/* Game Settings */}
          <div style={sectionLabel}>Game Settings</div>
          <div style={{ ...card, marginBottom:14, display:"flex", flexDirection:"column", gap:14 }}>
            <SettingRow label="Bots" options={BOT_COUNT_OPTIONS} value={sel.botCount} lvl={lvl} fmt={v=>v} onPick={v=>set({botCount:v})}/>
            <SettingRow label="Starting Chips" options={BUYIN_OPTIONS} value={sel.buyIn} lvl={lvl} fmt={v=>`◆${v}`} onPick={v=>set({buyIn:v})}/>
            <SettingRow label="Ante" options={ANTE_OPTIONS} value={sel.ante} lvl={lvl} fmt={v=>`◆${v}`} onPick={v=>set({ante:v})}/>
            <SettingRow label="Replenish" options={REPLENISH_OPTIONS} value={sel.replenishAmount} lvl={lvl} fmt={v=>`◆${v}`} onPick={v=>set({replenishAmount:v})}/>
          </div>

          <button onClick={onShowTutorial} style={{ ...sBtn, width:"100%", fontSize:"0.86rem", padding:"11px" }}>
             View Tutorial
          </button>
        </div>
      </div>

      {/* Fixed bottom bar — summary + Start */}
      <div style={{
        position:"fixed", left:0, right:0, bottom:0, zIndex:40,
        padding:`12px 16px calc(14px + env(safe-area-inset-bottom))`,
        background:"linear-gradient(180deg, rgba(8,15,10,0.6), rgba(8,15,10,0.98) 40%)",
        backdropFilter:"blur(12px)", borderTop:"1px solid rgba(212,168,67,0.2)",
      }}>
        <div style={{ maxWidth:440, margin:"0 auto" }}>
          <div style={{ fontSize:"0.66rem", color:"rgba(245,237,216,0.5)", textAlign:"center", marginBottom:8, lineHeight:1.5 }}>
            {theme.name} · {cardBack.name} · {chipSet.name}<br/>
            {sel.botCount} Bots · ${sel.buyIn} Starting · ${sel.ante} Ante · ${sel.replenishAmount} Replenish
          </div>
          <button onClick={startGame} style={{ ...gBtn, width:"100%", padding:"16px", fontSize:"1.02rem", textTransform:"uppercase", letterSpacing:"0.06em" }}>
            Start — ${sel.buyIn} Starting · {sel.botCount} Bots
          </button>
        </div>
      </div>
    </div>
  );
}

// A single settings row — label + horizontally-scrolling value pills.
function SettingRow({ label, options, value, lvl, fmt, onPick }) {
  return (
    <div>
      <div style={{ fontSize:"0.74rem", color:"rgba(212,168,67,0.75)", fontWeight:600, marginBottom:7 }}>{label}</div>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
        {options.map(opt => {
          const unlocked = isUnlocked(opt, lvl);
          const on = value === opt.value;
          return (
            <button key={opt.value} onClick={() => unlocked && onPick(opt.value)} disabled={!unlocked} style={{
              padding:"9px 14px", borderRadius:11, cursor:unlocked?"pointer":"default",
              fontSize:"0.82rem", fontWeight:700,
              background: on ? "rgba(212,168,67,0.2)" : "rgba(255,255,255,0.04)",
              border: on ? "1.5px solid #F0C96A" : "1px solid rgba(255,255,255,0.1)",
              color: !unlocked ? "rgba(245,237,216,0.3)" : on ? "#F0C96A" : "rgba(245,237,216,0.6)",
              opacity: unlocked ? 1 : 0.6,
              display:"flex", flexDirection:"column", alignItems:"center", gap:2,
            }}>
              <span>{fmt(opt.value)}</span>
              {!unlocked && <span style={{ fontSize:"0.56rem", color:"rgba(231,76,60,0.8)", fontWeight:700 }}> Lvl {opt.unlockLevel}</span>}
            </button>
          );
        })}
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

  // Human-friendly label per turn: "won ◆5 Spread", "DOINKED −◆10 Mythical",
  // "missed −◆3 Doink Bet", "passed".
  const labelFor = (t) => {
    const typeLabel = t.betType === "doink" ? "Doink Bet"
                    : t.betType === "doubledoink" ? "Double Doink"
                    : t.betType === "mythical" ? "Mythical"
                    : t.betType === "blind" ? "Blind Bet"
                    : t.betType === "spread" ? "Spread"
                    : null;
    if (t.outcome === "pass") return { text: "passed", color: "rgba(245,237,216,0.4)", sym: "—" };
    if (t.outcome === "win")
      return { text: `won ◆${t.amount}${typeLabel?` on ${typeLabel}`:""}`, color: "#27AE60", sym: "✓" };
    if (t.outcome === "doink")
      return { text: `DOINKED −◆${t.amount}${typeLabel?` on ${typeLabel}`:""}`, color: "#E74C3C", sym: "" };
    return { text: `missed −◆${t.amount}${typeLabel?` on ${typeLabel}`:""}`, color: "rgba(245,237,216,0.65)", sym: "✗" };
  };

  // Force the scrollable player-list to open scrolled to the top every time
  // the recap appears, rather than wherever the browser left it.
  const listRef = useRef(null);
  useEffect(() => { if (listRef.current) listRef.current.scrollTop = 0; }, []);
  // L1 #6 — confirm before leaving the table.
  const [confirmLeave, setConfirmLeave] = useState(false);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Round ${round} recap`}
      style={{ position:"fixed", inset:0, zIndex:260, background:"radial-gradient(ellipse at 50% 30%, rgba(8,18,12,0.97), rgba(2,5,3,0.99))", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"calc(env(safe-area-inset-top) + 16px) 18px calc(env(safe-area-inset-bottom) + 16px)" }}>
      {/* The card is a flex column: fixed header, ONE scrollable middle (the
          player rows), fixed footer. Only the middle scrolls — no nested
          scroll containers — and the action buttons are always reachable. */}
      <div className="pop" style={{
        width:"100%", maxWidth:460,
        display:"flex", flexDirection:"column",
        maxHeight:"100%",
        background:"linear-gradient(165deg, rgba(14,28,18,0.96) 0%, rgba(6,12,8,0.98) 100%)",
        border:"1.5px solid rgba(212,168,67,0.45)",
        borderRadius:24,
        boxShadow:"0 24px 80px rgba(0,0,0,0.96), 0 0 60px rgba(212,168,67,0.15), inset 0 1px 0 rgba(240,201,106,0.22)",
        overflow:"hidden",
      }}>
        {/* Fixed header */}
        <div style={{ textAlign:"center", padding:"22px 22px 12px", flexShrink:0 }}>
          <div style={{ fontSize:"0.62rem", letterSpacing:"0.28em", color:"rgba(212,168,67,0.6)", fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Round {round} Recap</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", color:"#F0C96A", fontWeight:900, lineHeight:1, textShadow:"0 0 28px rgba(212,168,67,0.55)" }}>Round Complete</div>
          <div aria-hidden="true" style={{ height:1.5, width:80, margin:"10px auto 0", background:"linear-gradient(90deg, transparent, rgba(212,168,67,0.6), transparent)" }}/>
        </div>

        {/* Scrollable middle — player rows. Opens at the top (listRef). */}
        <div ref={listRef} style={{ overflowY:"auto", padding:"0 22px", display:"flex", flexDirection:"column", gap:7 }}>
          {entries.map(p => (
            <div key={p.id} style={{
              padding:"9px 13px",
              background:"rgba(255,255,255,0.03)",
              border:"1px solid rgba(255,255,255,0.07)",
              borderRadius:12,
            }}>
              {/* Top row: avatar + name on left, net delta + final chips on right */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                  <Avatar seed={p.avatarSeed} size={26} name={p.name} isHuman={!p.isBot}/>
                  <div style={{ fontSize:"0.9rem", color:"#F5EDD8", fontWeight:600, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.name}</div>
                </div>
                <div style={{ display:"flex", alignItems:"baseline", gap:10, flexShrink:0 }}>
                  <div style={{
                    fontSize:"1rem", fontWeight:800,
                    color: p.delta>0?"#27AE60":p.delta<0?"#E74C3C":"rgba(245,237,216,0.4)",
                    textShadow: p.delta>0?"0 0 12px rgba(39,174,96,0.5)":p.delta<0?"0 0 12px rgba(231,76,60,0.5)":"none",
                  }}>
                    {p.delta>0?`+◆${p.delta}`:p.delta<0?`−◆${Math.abs(p.delta)}`:"—"}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", color:"#F0C96A", fontWeight:700, minWidth:50, textAlign:"right" }}>◆{p.chips}</div>
                </div>
              </div>
              {/* Inline turn(s) — what they actually did */}
              {p.turns.length > 0 && (
                <div style={{ display:"flex", flexDirection:"column", gap:3, marginTop:6, paddingLeft:36 }}>
                  {p.turns.map((t, i) => {
                    const L = labelFor(t);
                    return (
                      <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:"0.76rem" }}>
                        <span style={{ color: L.color, fontWeight:800, minWidth:14, textAlign:"center" }}>{L.sym}</span>
                        <span style={{ color: L.color, fontWeight:600 }}>{L.text}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {/* The cards this player held this round + the hit card. */}
              {p.cards && p.cards.length > 0 && (
                <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:7, paddingLeft:36 }}>
                  <MiniCard card={p.cards[0]} />
                  <MiniCard card={p.cards[1]} />
                  {p.hitCard && (
                    <>
                      <span style={{ color:"rgba(245,237,216,0.3)", fontSize:"0.7rem", margin:"0 2px" }}>hit</span>
                      <MiniCard card={p.hitCard} />
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Fixed footer — pot + actions, always reachable */}
        <div style={{ flexShrink:0, padding:"12px 22px 20px" }}>
          <div style={{ textAlign:"center", padding:"8px 14px", background:"rgba(212,168,67,0.06)", border:"1px solid rgba(212,168,67,0.18)", borderRadius:12, marginBottom:14 }}>
            <div style={{ fontSize:"0.58rem", letterSpacing:"0.18em", color:"rgba(212,168,67,0.5)", fontWeight:700, textTransform:"uppercase" }}>Pot Remaining</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.35rem", color:"#F0C96A", fontWeight:900, lineHeight:1.1 }}>◆{pot}</div>
          </div>
          <div style={{ display:"flex", justifyContent:"center", gap:10, flexWrap:"wrap" }}>
            {(() => {
              const human = humanPlayerId != null ? players.find(p => p.id === humanPlayerId) : players.find(p => !p.isBot);
              const cash = human?.chips || 0;
              if (mode === "career" && cash <= 0) {
                return (
                  <button onClick={onCashOut || onNext} style={{ ...gBtn, fontSize:"1.05rem", padding:"15px 36px" }}>
                    End Session →
                  </button>
                );
              }
              return (
                <>
                  <button onClick={onNext} style={{ ...gBtn, fontSize:"1.05rem", padding:"15px 36px" }}>Next Round →</button>
                  {mode === "career" && onCashOut && (
                    <button onClick={() => setConfirmLeave(true)} style={{ ...sBtn, fontSize:"1.05rem", padding:"15px 24px", color:"#F0C96A", border:"1.5px solid rgba(212,168,67,0.6)" }}>
                      Leave Table (◆{cash})
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      </div>

      {/* L1 #6 — Leave Table confirmation */}
      {confirmLeave && (
        <div onClick={() => setConfirmLeave(false)} style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.78)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:340, background:"linear-gradient(170deg,#0E1C12,#070D09)", border:"1.5px solid rgba(212,168,67,0.4)", borderRadius:18, padding:"22px 20px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"#F0C96A", fontWeight:700, textAlign:"center", marginBottom:8 }}>Leave Table?</div>
            <p style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.7)", lineHeight:1.55, textAlign:"center", margin:"0 0 18px" }}>
              Are you sure you want to leave this table?
            </p>
            <button onClick={() => { setConfirmLeave(false); onCashOut(); }} style={{ ...gBtn, width:"100%", fontSize:"0.95rem", marginBottom:8 }}>Leave Table</button>
            <button onClick={() => setConfirmLeave(false)} style={{ ...sBtn, width:"100%", fontSize:"0.9rem" }}>Cancel</button>
          </div>
        </div>
      )}
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
  const betLabel = betType==="doink"?"Doink Bet":betType==="doubledoink"?"Double Doink":betType==="mythical"?"Mythical":"Spread Bet";
  const outcomeColor = outcome==="win"?"#27AE60":outcome==="doink"?"#E74C3C":"rgba(245,237,216,0.45)";
  const outcomeLabel = outcome==="win"?"WIN":outcome==="doink"?"DOINK!":outcome==="miss"?"MISS":null;
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
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#F0C96A", fontWeight:700, lineHeight:1 }}>◆{amount}</div>
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
  const label = type === "doink" ? "DOINK BET" : type === "doubledoink" ? "DOUBLE DOINK" : type === "mythical" ? "MYTHICAL" : type === "blind" ? "BLIND BET" : "SPREAD BET";
  const color = type === "doink" ? "#E74C3C" : type === "doubledoink" ? "#C0392B" : type === "mythical" ? "#9B59B6" : type === "blind" ? "#D4A843" : "#F0C96A";
  const bg = type === "doink" ? "rgba(231,76,60,0.18)" : type === "mythical" ? "rgba(155,89,182,0.18)" : type === "blind" ? "rgba(212,168,67,0.18)" : "rgba(240,201,106,0.14)";
  const outcomeColor = outcome === "win" ? "#27AE60" : outcome === "doink" ? "#E74C3C" : outcome === "miss" ? "rgba(245,237,216,0.6)" : null;
  const outcomeLabel = outcome === "win" ? "✓ WIN" : outcome === "doink" ? "DOINK" : outcome === "miss" ? "MISS" : null;
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
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"2.2rem", color: outcomeColor || color, fontWeight:900, lineHeight:1, textShadow:`0 0 18px ${outcomeColor || color}aa` }}>◆{amount}</div>
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
function Game({ cfg, onExit, onCareerComplete, onAchievement }) {
  // Safe achievement emitter — no-op if not provided.
  const emitAch = onAchievement || (() => {});
  const { nH, nB, chips: startChips, ante: anteAmt, denoms, names, botNames, orientation, hintsDefault = true } = cfg;
  // The app is portrait-only. `landscape` is forced false so every
  // `landscape ? ... : ...` branch resolves to the portrait layout. The
  // landscape code paths remain but are inert. Device-level orientation
  // lock is set via the viewport/orientation meta in index.html.
  const landscape = false;
  const isCareer = cfg.mode === "career";
  // Quick Play replenish amount (separate from ante). Career & legacy configs
  // fall back to the ante, preserving prior behavior exactly.
  const replenishAmt = cfg.replenishAmount || anteAmt;
  // Quick Play cosmetics — undefined for career; the table reads theme from here.
  const qpTheme = cfg.qp ? themeById(cfg.qp.tableThemeId) : null;
  // Quick Play card back / chip set / avatar — null/default for Career.
  const qpCardBack = cfg.qp ? cardBackById(cfg.qp.cardBackId) : null;
  const qpChipSet = cfg.qp ? chipSetById(cfg.qp.chipSetId) : null;
  const qpAvatarSeed = cfg.qp && cfg.qp.avatarId ? avatarById(cfg.qp.avatarId).seed : null;
  // Publish the active cosmetics so Card / chip components read the right
  // styling. Set synchronously here (module variable, not state) so it's in
  // place before any child renders this pass; cleared on unmount.
  setActiveCosmetics(qpCardBack, qpChipSet);
  useEffect(() => () => setActiveCosmetics(null, null), []);
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
    // Human(s): in Quick Play use the chosen avatar's seed; Career uses index.
    for (let i = 0; i < nH; i++) all.push(mkPlayer(i, names[i], false, qpAvatarSeed != null ? qpAvatarSeed : i));
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
  // True briefly while the deck riffle/shuffle animation plays.
  const [shuffling, setShuffling] = useState(false);
  const [round, setRound] = useState(1);
  const [log, setLog] = useState([{ msg: "Welcome to Gapper! ", type: "info" }]);
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
  const [mythicalFlash, setMythicalFlash] = useState(null);
  // Flying-chip animations. Each flight is a pure-visual descriptor; the list
  // is rendered by <FlyingChips> and entries are auto-cleared after they play.
  const [chipFlights, setChipFlights] = useState([]);
  const flightIdRef = useRef(0);
  // Seat positions mirrored from render so non-render code can read them.
  const seatPosRef = useRef({});
  // Launch a chip flight from one table-percent point to another. Visual only
  // — never changes bet/pot state. `kind` just tweaks duration.
  const launchChipFlight = (fromX, fromY, toX, toY, amount, kind = "bet") => {
    if (fromX == null || toX == null) return;
    const id = ++flightIdRef.current;
    const dur = kind === "payout" ? 760 : 520;
    setChipFlights(f => [...f, { id, fromX, fromY, toX, toY, amount, dur }]);
    // Auto-clear once the animation (plus chip stagger) has finished.
    setTimeout(() => {
      setChipFlights(f => f.filter(x => x.id !== id));
    }, dur + 400);
  };
  const [history, setHistory] = useState([]); // recent turn summaries
  const [showSecondary, setShowSecondary] = useState(false);
  const [hitCardRevealed, setHitCardRevealed] = useState(false);
  const [pendingReveal, setPendingReveal] = useState(null);
  // Bet marker shown on the felt during a bet/reveal: { playerId, amount, type }
  const [betMarker, setBetMarker] = useState(null);
  // Bot "thinking" indicator next to active seat
  const [botThinking, setBotThinking] = useState(null); // playerId | null
  // Which lower-rail drawer is open: "log" | "market" | null. Only one at a
  // time. When "market" is open, gameplay pauses (see the bot-turn effect).
  const [openDrawer, setOpenDrawer] = useState(null);
  const marketOpen = openDrawer === "market";

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
    // A player who placed a blind bet pre-deal has already committed their
    // bet. Their slot is flagged `blindCommitted` so the betting phase
    // resolves the blind bet automatically WITHOUT prompting them for a
    // second, regular bet. (Not `skipped` — a skipped slot never resolves,
    // which would mean the blind bet never pays out.)
    return order.map(i => ({
      slotId: `own-${ps[i].id}`,
      playerId: ps[i].id,
      cards: ps[i].cards,
      isBought: false,
      sellerId: null,
      blindCommitted: ps[i].betType === "blind",
      blindAmount: ps[i].betType === "blind" ? (ps[i].bet || 0) : 0,
    }));
  };

  const flashPot = d => {
    setPotAnim(d > 0 ? "pot-gain" : "pot-lose");
    setPotDelta(d);
    setTimeout(() => setPotAnim(null), 600);
    setTimeout(() => setPotDelta(null), 1000);
  };

  const doReplenish = ps => {
    let p = 0;
    const up = (ps || playersRef.current).map(pl => { const pay = Math.min(replenishAmt, pl.chips); p += pay; return { ...pl, chips: pl.chips - pay }; });
    setPlayers(up);
    setPot(p);
    potRef.current = p;
    flashPot(p);
    addLog(` Pot hit ◆0 — everyone replenishes ◆${replenishAmt}!`);
    emitAch(EVENTS.POT_REPLENISHED, {});
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
    addLog(`Round ${round} — antes collected (◆${anteAmt} each).`);
    setQueueIdx(0);
    queueIdxRef.current = 0;
    setTimeout(() => setPhase("blindBet"), 500);
  }, [phase]);

  // ── BLIND BET
  // Bots decide their blind bets, then: if there's a human at the table we
  // STOP and let the human's blind-bet panel drive the transition to dealing
  // (Blind Bet or Skip). With no human, we auto-advance after the bots act.
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
          addLog(`${bot.name} blind bets ◆${bb}!`);
        }
      }, delay);
      delay += 60;
    });
    // Only auto-advance if no human can act (no human, or human is broke —
    // the human panel is gated on chips > 0, so without this it would hang).
    const humanCanAct = players.some(p => !p.isBot && p.chips > 0);
    if (!humanCanAct) {
      setTimeout(() => startDealing(), delay + 120);
    }
  }, [phase]);

  // ── DEAL
  const startDealing = () => {
    reshuffle();
    // Brief deck-shuffle animation as the fresh deck is shuffled.
    setShuffling(true);
    setTimeout(() => setShuffling(false), 600);
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
      addLog("Cards dealt — bidding begins.");
      // Hand trading is hidden (J10): skip the preBuy phase entirely and go
      // straight to betting. The preBuy phase and its bot-sell-offer logic
      // remain in the code, just unreachable, so trading can be restored.
      setPhase("betting");
    }, t + 200);
  };

  // ── PREBUY (dormant — J10 hand trading hidden): when active, the human
  // could buy hands and bots posted sell offers. Phase is currently skipped.
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
    // Gameplay pauses while the Market drawer is open — bot turns are held.
    // This effect re-runs when `marketOpen` flips back to false, resuming.
    if (marketOpen) return;
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

    // Blind-committed slot: the player (bot or human) placed a blind bet
    // pre-deal. Resolve it automatically — do NOT prompt for a regular bet.
    // execBet's blind path knows the chips/bet were already committed.
    if (slot.blindCommitted) {
      const t = setTimeout(() => {
        execBet(slot, p, slot.blindAmount || p.bet || 0, "blind");
      }, p.isBot ? 900 : 700);
      return () => clearTimeout(t);
    }

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
        }, 1100);   // K2: trimmed from 1500 — bots act a touch faster
        return () => clearTimeout(t2);
      }, 750);      // K2: pre-turn settle trimmed from 900
      return () => clearTimeout(t1);
    } else {
      const isRoundStarter = idx === 0;
      const alreadyWent = q.slice(0, idx).some(s => s.playerId === p.id && !s.isBought);
      if (!slot.isBought && !isRoundStarter && !alreadyWent) {
        setWaitingForRoll(true);
      }
    }
    // FIX #1: depend on slotId so effect re-runs when queue is mutated in place
    // marketOpen: re-run when the Market drawer closes so play resumes.
  }, [phase, queueIdx, turnQueue[queueIdx]?.slotId, marketOpen]);

  const runBotSlot = (slot, p) => {
    const [a, b] = slot.cards;
    const sp = spreadOf(a, b);
    const myth = isMythical(a, b);
    const sameRank = sp === 0;
    const pz = getPersonality(p.name);

    // Bot win caps — bots bet conservatively within full-odds range so their
    // EV math holds. (The human may bet wider; any payout is capped to the
    // pot at resolution, so an oversized bet just wins the whole pot.)
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
      // For myth: hitProb = 4/50 = 0.08, ev per ◆1 = 0.08*12 − 0.92 = 0.04 (positive)
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

    // ── Same rank (a pair): the Double Doink bet is the play here ──
    if (sameRank) {
      // Double Doink: hit a third of the rank. doubleProb = 2/50 = 4%; 18×
      // payout → EV per ◆1 = 0.04*18 − 0.96 = -0.24. Still -EV (it's a
      // long-shot), so most bots pass; bolder bots take the swing.
      const capDouble = Math.min(p.chips, potNow);
      if (capDouble >= 1 && Math.random() < 0.28 * pz.doink) {
        const amt = Math.max(1, Math.floor(capDouble * 0.3));
        execBet(slot, p, amt, "doubledoink");
        return;
      }
      execPass(slot, p);
      return;
    }

    // ── Normal spread hands ──
    // Spread EV per ◆1 = hitProb*1 − doinkProb*1 − missProb*0 = hitProb − doinkProb
    // hitProb hits +EV around spread 4+; bots should play moderate-to-strong hands.
    const spreadEV = hitProb - doinkProb;

    // ── Pot-size risk policy (J13) ──
    //   Small pot  → low risk to chase, so bots lean INTO it (handled below
    //                via the existing smallPot all-in rounding).
    //   Big pot    → only commit big with a genuinely strong hand. With a
    //                weak/mediocre hand, sit out or bet small — don't dump a
    //                large bet into a big pot on a so-so hand.
    const bigPot     = potNow > replenishAmt * 3;
    const strongHand = spreadEV > 0.30;          // wide spread, comfortably +EV
    const bigPotWeak = bigPot && !strongHand;    // the case to be cautious in

    // Aggressive on strong hands. A-J = spread 10 → hitProb = 36/50 = 72%,
    // doinkProb = 12%. EV per ◆1 ≈ +0.60. Bot should bet.
    if (spreadEV > 0.05) {
      // Always bet positive EV (modulo a tiny variance pass). In a big pot
      // with a non-strong hand, the pass chance is raised sharply — the bot
      // would rather sit out than risk a large pot on a mediocre hand.
      let passChance = Math.max(0.04, 0.18 - spreadEV * 0.4) * (1 / Math.max(0.6, pz.risk));
      if (bigPotWeak) passChance = Math.min(0.85, 0.45 + (0.30 - spreadEV));
      if (Math.random() < passChance) {
        execPass(slot, p);
        return;
      }
      if (capSpread >= 1) {
        // Bet size grows with EV: from ~30% on borderline to ~85% on a slam dunk
        let frac = 0.3 + Math.min(0.55, spreadEV * 0.85);
        frac *= Math.min(1.1, pz.confidence);
        frac = Math.min(0.9, frac);
        // Big pot + weak hand: if the bot does still bet, keep it small —
        // a modest probe, not a major commitment.
        if (bigPotWeak) frac = Math.min(frac, 0.15);
        let amt = Math.max(1, Math.min(capSpread, Math.floor(capSpread * frac)));

        // ── Full-pot tuning ──
        // (1) Small pot: if the pot is at or below the table's replenish
        //     amount, leaving ◆1–3 behind looks timid. Bots round up and
        //     take the whole pot (when they can afford it).
        const smallPot = potNow <= replenishAmt;
        // (2) Premium hand: a wide spread (≈ A-K territory) is a near lock —
        //     bet the entire pot if the bot can cover it.
        const premiumHand = sp >= 10;
        if ((smallPot || premiumHand) && p.chips >= potNow && potNow > 0) {
          // Most of the time go all-in on the pot; occasionally a cautious
          // bot still sizes down, so it isn't 100% predictable.
          if (Math.random() < (premiumHand ? 0.9 : 0.8)) {
            amt = Math.min(capSpread, potNow);
          }
        }
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

    // Marginal-EV spread sometimes worth a small bet for the chaotic ones —
    // but in a big pot this stays a tiny probe, never a real commitment.
    if (spreadEV > -0.05 && capSpread >= 1 && Math.random() < 0.25 * pz.risk) {
      const probeFrac = bigPot ? 0.08 : 0.2;
      const amt = Math.max(1, Math.floor(capSpread * probeFrac));
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

    // A blind bet was committed pre-deal: the chips were already deducted and
    // p.bet was already set when the blind bet was placed. For blind, we must
    // NOT deduct again or double the bet — chipsAfterBet is simply p.chips.
    const isBlind = type === "blind";
    const chipsAfterBet = isBlind ? p.chips : p.chips - amount;

    // IMPORTANT: do NOT decrement seat chips yet. The bet amount is shown
    // prominently in the bet marker; we hold the seat chips at the pre-bet
    // value until the resolution so the user doesn't see chips changing before
    // they see the hit card. (Blind: bet already set, so don't add it again.)
    if (!isBlind) {
      setPlayers(prev => prev.map(pl => pl.id === p.id ? { ...pl, bet: (pl.bet || 0) + amount, betType: type } : pl));
    }
    addLog(`${p.name} bets ◆${amount} [${type}]${slot.isBought ? " (bought hand)" : ""}.`);

    // Visual: fly chips from the bettor's seat to the pot (center of table).
    // Pure decoration — pot/chip math is unchanged.
    const sp = seatPosRef.current[p.id];
    if (sp) launchChipFlight(sp.x, sp.y, 50, 50, amount, "bet");

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
      playSound("flip");
      haptic("flip");
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
            // Doink pays 7×, but never more than the pot can cover. If the
            // pot is short, the player simply takes the whole pot.
            const winnings = Math.min(amount * 7, Math.max(0, potRef.current));
            chipDelta = amount + winnings;
            pd = -winnings;
            outcome = "win";
            addLog(` ${p.name} DOINK BET HITS! +◆${winnings}`, "win");
            showComment(p.name, getComment("doinkBetHit"));
          } else {
            pd = amount;
            addLog(`${p.name} doink bet missed.`);
            showComment(p.name, getComment("miss"));
          }
        } else if (type === "doubledoink") {
          // ── DOUBLE DOINK ──
          // Only offered when the player holds a pair (two same-rank cards).
          // Bet that the hit card matches that rank — a third of the rank.
          // Two such cards remain among 50 unseen → 4% (1-in-25). Pays 18×,
          // capped to the pot like the other long-shot bets. A miss simply
          // loses the bet (1×) — no extra doink penalty, since the player is
          // already betting ON the match.
          if (cv(hitCard) === cv(a)) {  // a and b share a rank here
            const winnings = Math.min(amount * 18, Math.max(0, potRef.current));
            chipDelta = amount + winnings;
            pd = -winnings;
            outcome = "win";
            addLog(` ${p.name} DOUBLE DOINK HITS! +◆${winnings}`, "win");
            showComment(p.name, getComment("doinkBetHit"));
          } else {
            pd = amount;
            addLog(`${p.name} double doink missed.`);
            showComment(p.name, getComment("miss"));
          }
        } else if (type === "mythical") {
          if (isMythical(a, b) && between(a, b, hitCard)) {
            // Mythical pays 12×, capped to the pot.
            const winnings = Math.min(amount * 12, Math.max(0, potRef.current));
            chipDelta = amount + winnings;
            pd = -winnings;
            outcome = "win";
            addLog(` ${p.name} MYTHICAL! +◆${winnings}`, "win");
            showComment(p.name, getComment("mythical"));
          } else if (isDoinkCard(a, b, hitCard)) {
            const cov = p.insurance?.coverage || 0;
            chipDelta = -(amount - cov);
            pd = amount * 2 - cov;
            outcome = "doink";
            addLog(` ${p.name} DOINKS! -◆${amount * 2}`, "doink");
            showComment(p.name, getComment("doink"));
          } else {
            pd = amount;
            addLog(`${p.name} mythical missed.`);
            showComment(p.name, getComment("miss"));
          }
        } else if (type === "blind") {
          // Blind bet: committed before cards were dealt. Wins if the hit
          // falls between the two cards — pays 2:1. A doink still doinks.
          if (between(a, b, hitCard)) {
            const winnings = amount * 2;
            chipDelta = amount + winnings;
            pd = -winnings;
            outcome = "win";
            addLog(`${p.name} BLIND BET HITS! +◆${winnings}`, "win");
            showComment(p.name, getComment("win"));
          } else if (isDoinkCard(a, b, hitCard)) {
            const cov = p.insurance?.coverage || 0;
            chipDelta = -(amount - cov);
            pd = amount * 2 - cov;
            outcome = "doink";
            addLog(` ${p.name} DOINKS! -◆${amount * 2}`, "doink");
            showComment(p.name, getComment("doink"));
          } else {
            pd = amount;
            addLog(`${p.name} blind bet missed.`);
            showComment(p.name, getComment("miss"));
          }
        } else {
          // Spread bet — hit falls between the two cards, pays 1:1.
          if (between(a, b, hitCard)) {
            const winnings = amount;
            chipDelta = amount + winnings;
            pd = -winnings;
            outcome = "win";
            addLog(`${p.name} WINS ◆${winnings}!`, "win");
            showComment(p.name, getComment("win"));
          } else if (isDoinkCard(a, b, hitCard)) {
            const cov = p.insurance?.coverage || 0;
            chipDelta = -(amount - cov);
            pd = amount * 2 - cov;
            outcome = "doink";
            addLog(` ${p.name} DOINKS! -◆${amount * 2}`, "doink");
            showComment(p.name, getComment("doink"));
          } else {
            pd = amount;
            addLog(`${p.name} missed.`);
            showComment(p.name, getComment("miss"));
          }
        }

        const finalChips = Math.max(0, chipsAfterBet + chipDelta);

        // ── Sound cues for the human's own result ──
        // Big win for the high-payout bet types; standard win/doink otherwise.
        if (!p.isBot) {
          if (outcome === "win") {
            playSound((type === "mythical" || type === "doubledoink") ? "bigwin" : "win");
            haptic((type === "mythical" || type === "doubledoink") ? "bigwin" : "win");
          } else if (outcome === "doink") {
            playSound("doink");
            haptic("doink");
          }
        }

        // ── Achievement events ──
        // These fire for the human's own actions (achievements are personal).
        // `slot.isBought` means the human is playing a hand they bought.
        const humanActed = !p.isBot;
        if (humanActed) {
          emitAch(EVENTS.BET_PLACED, {});
          if (isCareer) emitAch(EVENTS.CAREER_HAND_PLAYED, {});
          if (type === "blind" || slot.betType === "blind") {
            emitAch(EVENTS.BLIND_BET_PLACED, {});
          }
          // HAND_PLAYED / HAND_WON count the human's OWN hand (not bought
          // hands — those are tracked via HAND_BOUGHT events).
          if (!slot.isBought) {
            emitAch(EVENTS.HAND_PLAYED, {});
            if (outcome === "win") emitAch(EVENTS.HAND_WON, {});
          }
          if (outcome === "win") {
            emitAch(EVENTS.BET_WON, {});
            if (type === "doink")    emitAch(EVENTS.DOINK_WON, {});
            if (type === "mythical") emitAch(EVENTS.MYTHICAL_WON, {});
            if (potRef.current >= 200) emitAch(EVENTS.BIG_POT_WON, {});
            if (slot.isBought) emitAch(EVENTS.HAND_BOUGHT_WON, {});
            // Blind-bet outcome events.
            if (type === "blind" || slot.betType === "blind") emitAch(EVENTS.BLIND_BET_WON, {});
          } else {
            if (type === "blind" || slot.betType === "blind") emitAch(EVENTS.BLIND_BET_LOST, {});
          }
          if (outcome === "doink") emitAch(EVENTS.DOINK_LOST, {});
        }
        // DOINK / Mythical events fire for ANY player at the table (the human
        // witnesses them). Triggered whenever a doink/mythical occurs.
        if (outcome === "doink") emitAch(EVENTS.DOINK_TRIGGERED, {});
        if (type === "mythical" && outcome === "win") emitAch(EVENTS.MYTHICAL_SPLIT, {});

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
          addLog(` ${sellerName} gets +◆${sellerPayout} (${sellerCut}% of winnings).`, "win");
        }

        if (!slot.isBought) setSeatAnims(prev => ({ ...prev, [p.id]: outcome }));

        // Visual: on a win, chips fly from the pot back to the winner's seat.
        if (outcome === "win") {
          const wsp = seatPosRef.current[p.id];
          if (wsp) launchChipFlight(50, 50, wsp.x, wsp.y, Math.max(amount, 20), "payout");
        }

        if (outcome === "doink") {
          setDoinkFlash(p.name);
          setTimeout(() => setDoinkFlash(null), 1100);
        }
        // Mythical Split — its own signature animation, distinct from DOINK.
        if (type === "mythical" && outcome === "win") {
          setMythicalFlash(p.name);
          setTimeout(() => setMythicalFlash(null), 1500);
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
    const human = players.find(p => !p.isBot);
    const humanBroke = (human?.chips || 0) <= 0;

    // K3 — OUTLAST BONUS: in career mode, if the human is the only player
    // left with chips (every bot is broke) and the pot still holds money,
    // the player has "cleaned out the table." Auto-end the session and pay a
    // bonus: stack + min(1.5 × buyIn, pot). The stack is cashed out normally;
    // the bonus is the capped pot collection on top.
    if (isCareer && !humanBroke) {
      const botsAlive = players.some(p => p.isBot && p.chips > 0);
      const potLeft = potRef.current || 0;
      if (!botsAlive && potLeft > 0) {
        const buyIn = cfg.careerSession?.buyIn || 0;
        const bonus = Math.min(Math.round(buyIn * 1.5), potLeft);
        finishCareerSession("outlast", bonus);
        return;
      }
    }

    // End conditions:
    //  • Fewer than 2 players with chips → game over.
    //  • CAREER MODE: the human is broke. The session must end with a summary
    //    — otherwise the table would try to start a round with no human seat
    //    and freeze.
    if (alive.length < 2 || (isCareer && humanBroke)) {
      setPhase("over");
      return;
    }
    setSeatAnims({}); setPendingOffer(null); setPendingSellOffer(null); setSheet(null); setTurnQueue([]); setQueueIdx(0);
    setHistory([]);
    queueIdxRef.current = 0;
    // K4: stable moment — record the human's seat chips for crash recovery.
    if (isCareer && human) {
      writeLiveSession({
        inProgress: true,
        tableId: cfg.tableId,
        tableName: cfg.careerSession?.tableName,
        buyIn: cfg.careerSession?.buyIn || 0,
        seatChips: Math.max(0, human.chips || 0),
      });
    }
    const newFirst = (firstIdx + 1) % alive.length;
    setFirstIdx(newFirst);
    setRound(r => r + 1);
    setPlayers(resetRound(alive));
    addLog(`Round ${round + 1} — ${alive[newFirst]?.name} goes first.`);
    // L2: mandatory ante every hand. The ante phase always runs now (it used
    // to be skipped when the pot already had chips). When the pot is empty it
    // also serves as the reseed; either way every player antes before cards.
    setPhase("ante");
  };

  // ── CAREER: build a session result and pass it up to App ──
  // Called when the player cashes out at round summary OR when the player
  // busts (chips → 0). Idempotent via careerCompletedRef so it only fires once.
  const finishCareerSession = (reason, outlastBonus = 0) => {
    if (!isCareer) return;
    if (careerCompletedRef.current) return;
    careerCompletedRef.current = true;
    // K4: a normal ending handles chips via the session result, so the
    // live-session record must be cleared — otherwise launch recovery would
    // double-credit.
    clearLiveSession();
    const human = playersRef.current.find(p => !p.isBot);
    const stack = Math.max(0, human?.chips || 0);
    // The outlast bonus (K3) is added on top of the player's stack cash-out.
    const bonus = Math.max(0, outlastBonus || 0);
    const cashOut = stack + bonus;
    const buyIn = cfg.careerSession?.buyIn || 0;
    const st = careerStatsRef.current;
    const net = cashOut - buyIn;
    const xpEarned = computeSessionXP({ ...st, buyIn, cashOut });
    const result = {
      tableId: cfg.tableId,
      tableName: cfg.careerSession?.tableName,
      buyIn,
      cashOut,
      stack,
      outlastBonus: bonus,
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
    addLog(` ${seller.name} sold hand to ${buyer.name} for ◆${chipTransfer}${pctClause}.`);
    showToast(` ${seller.name} → ${buyer.name}: ◆${chipTransfer}${pctClause}`);

    // ── CAREER STATS — record human trade involvement ──
    if (isCareer) {
      if (!buyer.isBot)  careerStatsRef.current.handsBought++;
      if (!seller.isBot) careerStatsRef.current.handsSold++;
    }

    // ── Achievement events ──
    // Fire when the HUMAN is the buyer or seller of the traded hand.
    if (!buyer.isBot) {
      emitAch(EVENTS.HAND_BOUGHT, { seller: seller.name });
    }
    if (!seller.isBot) {
      emitAch(EVENTS.HAND_SOLD, {});
    }
    // Accepting a counter — `offer.isCounter` marks this as a countered deal.
    if (offer.isCounter && (!buyer.isBot || !seller.isBot)) {
      emitAch(EVENTS.COUNTER_ACCEPTED, {});
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
  // Withdraw the human's open sell offer. Ref-based so it works correctly
  // even when called from inside another handler's closure. Bots checking
  // `pendingSellOfferRef.current` will see null and not accept a dead offer.
  const withdrawSellOffer = () => {
    const offer = pendingSellOfferRef.current;
    if (!offer) return;
    const human = playersRef.current.find(p => !p.isBot);
    // Only auto-withdraw the human's own broadcast offer.
    if (human && offer.sellerId !== human.id) return;
    addLog(`${playersRef.current.find(p => p.id === offer.sellerId)?.name || "Seller"} withdraws the sell offer.`);
    pendingSellOfferRef.current = null;
    setPendingSellOffer(null);
  };

  const botRespondToOffer = offer => {
    // The bot is whichever side of the offer is a bot. The human initiated
    // this offer, so exactly one side is the human and the other is the bot.
    const buyerP = playersRef.current.find(p => p.id === offer.buyerId);
    const sellerP = playersRef.current.find(p => p.id === offer.sellerId);
    const botPlayer = buyerP?.isBot ? buyerP : sellerP?.isBot ? sellerP : null;
    if (!botPlayer) return;

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
        addLog(`${botPlayer.name} counters: ◆${counter}.`);
        setSheet(null);
        setPendingOffer({ ...offer, chips: counter, pct: 0, desc: `◆${counter} upfront (counter from ${botPlayer.name})`, isCounter: true });
        // The human received a counteroffer.
        emitAch(EVENTS.COUNTER_RECEIVED, {});
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
        const desc = pct > 0 ? `◆${upfront} + ${pct}% of winnings` : `◆${upfront} upfront`;
        const offer = { sellerId: bot.id, chips: upfront, pct, desc, kind: pct > 0 ? "hybrid" : "chips" };
        setTimeout(() => {
          if (pendingSellOfferRef.current) return;
          addLog(` ${bot.name} sells hand to the table: ${desc}.`);
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
    primeSounds();        // unlock audio on first interaction
    playSound("chip");
    haptic("chip");
    // Acting in the round withdraws any open sell offer (the hand is now
    // committed to a bet, so it can't also be sold).
    withdrawSellOffer();
    const amount = betVal; setBetVal(0); setSheet(null);
    // Show tap-to-reveal first
    setPendingReveal({ slot: curSlot, p: curPlayer, amount, type });
  };
  const humanPass = () => {
    if (locked || !curSlot || !curPlayer) return;
    // Passing also withdraws any open sell offer.
    withdrawSellOffer();
    execPass(curSlot, curPlayer); setSheet(null);
  };
  const humanBlindBet = () => {
    if (betVal <= 0) return;
    primeSounds();
    playSound("chip");
    haptic("chip");
    const h = playersRef.current.find(p => !p.isBot);
    if (!h) return;
    addLog(`${h.name} blind bets ◆${betVal}!`);
    setPlayers(prev => prev.map(p => p.id === h.id ? { ...p, chips: p.chips - betVal, bet: betVal, betType: "blind" } : p));
    setBetVal(0); setSheet(null);
    // The human has acted — proceed to dealing.
    setTimeout(() => startDealing(), 150);
  };
  const buyInsurance = () => {
    const premium = Math.max(1, Math.ceil(maxBet * 0.09));
    const coverage = Math.floor(maxBet * 0.4);
    if (!curPlayer || curPlayer.chips < premium) return;
    setPlayers(prev => prev.map(p => p.id === curPlayer.id ? { ...p, chips: p.chips - premium, insurance: { premium, coverage } } : p));
    addLog(`${curPlayer.name} insures for ◆${premium} (covers ◆${coverage}).`);
    setSheet(null);
  };

  // ── Hand trading: explicit buyer/seller, never inferred from turn order ──
  // The HUMAN is always the acting player here (these are only called from the
  // human's trade sheets). buyerId/sellerId are passed explicitly so a bought
  // hand can never land on the wrong player.
  const makeBuyOffer = (targetId, offerData) => {
    const human = playersRef.current.find(p => !p.isBot);
    if (!human || targetId === human.id) return; // can't buy your own hand
    const offer = { buyerId: human.id, sellerId: targetId, chips: offerData.chips, pct: offerData.pct, desc: offerData.desc, kind: offerData.kind };
    setSheet(null); setTradeMode(null);
    const target = playersRef.current.find(p => p.id === targetId);
    if (!target) return;
    if (target.isBot) {
      botRespondToOffer(offer);
    } else {
      setPendingOffer(offer);
      addLog(`${human.name} wants to buy: ${offerData.desc}.`);
    }
  };
  const makeSellOffer = (targetId, offerData) => {
    const human = playersRef.current.find(p => !p.isBot);
    if (!human || targetId === human.id) return;
    const offer = { buyerId: targetId, sellerId: human.id, chips: offerData.chips, pct: offerData.pct, desc: offerData.desc, kind: offerData.kind };
    setSheet(null); setTradeMode(null);
    const target = playersRef.current.find(p => p.id === targetId);
    if (!target) return;
    if (target.isBot) {
      botRespondToOffer(offer);
    } else {
      setPendingOffer(offer);
      addLog(`${human.name} offers to sell: ${offerData.desc}.`);
    }
  };

  // incomingOffer: human is the SELLER and someone wants to buy their hand.
  // incomingCounter: human is involved and the other side countered.
  // Keyed to the HUMAN's id (not curPlayer) so offers reach the human no
  // matter whose turn it currently is.
  const incomingOffer = pendingOffer && !pendingOffer.isCounter && humanPlayer && pendingOffer.sellerId === humanPlayer.id ? pendingOffer : null;
  const incomingCounter = pendingOffer && pendingOffer.isCounter && humanPlayer && (
    pendingOffer.buyerId === humanPlayer.id || pendingOffer.sellerId === humanPlayer.id
  ) ? pendingOffer : null;
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
  // Mirror seat positions into a ref so non-render code (execBet, etc.) can
  // launch chip flights from the correct seat coordinates.
  seatPosRef.current = seatPos;
  const banner =
    phase==="ante" ? "Collecting antes…"
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
    <div style={{ position:"fixed", inset:0, display:"flex", flexDirection:landscape?"row":"column", background:"radial-gradient(ellipse at 50% 20%,#0E2A14 0%,#060D08 65%,#030806 100%)", overflow:"hidden" }}>

      {/* ── Compact Casino HUD — logo · round/pot · rules/exit ──
          A clean 3-column grid: logo left, Round + Pot centered, controls
          right. The header itself owns the safe-area inset (the outer
          container must NOT also add it, or the header is pushed down by a
          full notch-height of dead space). */}
      <div style={{
        display:landscape?"flex":"grid",
        gridTemplateColumns: landscape ? undefined : "1fr auto 1fr",
        alignItems:"center",
        padding:landscape?"10px 14px":"calc(env(safe-area-inset-top) + 4px) 14px 8px",
        zIndex:30, flexShrink:0,
        background:"linear-gradient(180deg, rgba(8,16,10,0.95) 0%, rgba(3,8,5,0.82) 70%, rgba(3,8,5,0.25) 100%)",
        backdropFilter:"blur(14px)",
        flexDirection:landscape?"column":undefined,
        width:landscape?"auto":"100%",
        gap:landscape?10:0,
        borderBottom:"1px solid rgba(212,168,67,0.12)",
        boxShadow:"0 4px 18px rgba(0,0,0,0.4)",
      }}>
        {/* Left — logo */}
        <div style={{ display:"flex", alignItems:"center", justifySelf:"start" }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:landscape?"1.2rem":"1.3rem", color:"#D4A843", fontWeight:900, letterSpacing:"0.06em", textShadow:"0 0 18px rgba(212,168,67,0.4)", lineHeight:1 }}>GAPPER</div>
        </div>

        {/* Center — Round + Pot, the two live stats */}
        <div style={{ display:"flex", alignItems:"center", gap:14, justifySelf:"center" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", lineHeight:1.05 }}>
            <div style={{ fontSize:"0.5rem", letterSpacing:"0.18em", color:"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase" }}>Round</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#F0C96A", fontWeight:700 }}>{round}</div>
          </div>
          <div style={{ width:1, height:24, background:"rgba(212,168,67,0.22)" }} aria-hidden="true"/>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", lineHeight:1.05 }}>
            <div style={{ fontSize:"0.5rem", letterSpacing:"0.18em", color:"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase" }}>Pot</div>
            <AnimatedNumber value={pot} duration={700} style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#F0C96A", fontWeight:700 }}/>
          </div>
        </div>

        {/* Right — Rules + Exit (and Hints in Quick Play) */}
        <div style={{ display:"flex", gap:6, flexDirection:landscape?"column":"row", alignItems:"center", justifySelf:"end" }}>
          {!isCareer && !landscape && <button onClick={() => setHintsOn(h => !h)} aria-pressed={hintsOn} style={{ padding:"6px 9px", borderRadius:8, fontSize:"0.66rem", fontWeight:700, background:hintsOn?"rgba(212,168,67,0.18)":"rgba(255,255,255,0.05)", border:hintsOn?"1px solid rgba(212,168,67,0.4)":"1px solid rgba(255,255,255,0.1)", color:hintsOn?"#D4A843":"rgba(245,237,216,0.4)", cursor:"pointer" }}>Hints</button>}
          <button onClick={() => setShowRules(true)} style={{ padding:"6px 11px", borderRadius:8, fontSize:"0.7rem", fontWeight:700, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", color:"rgba(245,237,216,0.6)", cursor:"pointer" }}>Rules</button>
          <button onClick={() => {
            // In career mode, exiting mid-round would forfeit chips on the
            // table. Only allow exit at a safe point (round summary / game
            // over); otherwise tell the player to finish the round.
            if (isCareer && phase !== "roundEnd" && phase !== "over") {
              showToast("Finish the round first — then Leave Table to keep your chips.");
              return;
            }
            onExit();
          }} style={{ padding:"6px 11px", borderRadius:8, fontSize:"0.7rem", fontWeight:700, background:"rgba(231,76,60,0.12)", border:"1px solid rgba(231,76,60,0.3)", color:"rgba(231,140,130,0.95)", cursor:"pointer" }}>Exit</button>
        </div>
      </div>

      {/* Status banner — sits just under the HUD in portrait so the header
          itself stays a clean 3-column grid. */}
      {!landscape && (
        <div role="status" aria-live="polite" style={{
          flexShrink:0, padding:"5px 14px 7px", textAlign:"center",
          fontSize:"0.76rem", color:"rgba(245,237,216,0.6)", fontWeight:500,
          whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          background:"linear-gradient(180deg, rgba(3,8,5,0.55), transparent)",
        }}>{banner}</div>
      )}

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
              {/* 2. Outer leather rail — tinted by the theme when set */}
              <div aria-hidden="true" style={{
                position:"absolute", width:railW, height:railH,
                borderRadius: radius,
                background: qpTheme
                  ? `radial-gradient(ellipse at 50% 32%, ${qpTheme.rail} 0%, ${qpTheme.rail} 48%, #0C0703 100%)`
                  : "radial-gradient(ellipse at 50% 32%, #2A1C10 0%, #1A1009 48%, #0C0703 100%)",
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
              {/* 5. Felt — colored by the selected Quick Play theme (if any) */}
              <div style={{
                position:"absolute",
                width:landscape?"calc(min(64vh,520px) - 70px)":"calc(min(86vw,440px) - 70px)",
                height:landscape?"calc(min(82vh,420px) - 70px)":"calc(min(116vw,560px) - 70px)",
                borderRadius: radius,
                background: qpTheme
                  ? `radial-gradient(ellipse at 50% 38%, ${qpTheme.felt} 0%, ${qpTheme.felt} 30%, ${qpTheme.feltDark} 78%, ${qpTheme.feltDark} 100%)`
                  : "radial-gradient(ellipse at 50% 38%, #2A8C46 0%, #176A30 42%, #0C4A1F 72%, #052C10 100%)",
                boxShadow:"inset 0 8px 40px rgba(0,0,0,0.62), inset 0 0 90px rgba(0,0,0,0.42), inset 0 -6px 20px rgba(0,0,0,0.5)",
                overflow:"hidden",
              }}>
                {/* Fine felt weave texture */}
                <div style={{ position:"absolute", inset:0, opacity:0.04, backgroundImage:"repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 1px,transparent 4px),repeating-linear-gradient(-45deg,#fff 0,#fff 1px,transparent 1px,transparent 4px)" }}/>
                {/* Soft center light pool — neutral warm when a theme is set */}
                <div style={{ position:"absolute", top:"34%", left:"50%", transform:"translate(-50%,-50%)", width:"70%", height:"42%", background: qpTheme ? "radial-gradient(ellipse, rgba(255,240,210,0.10) 0%, transparent 70%)" : "radial-gradient(ellipse, rgba(120,220,150,0.18) 0%, transparent 70%)", pointerEvents:"none" }}/>
                {/* DOINK watermark — sits above the pot so it stays visible */}
                <div style={{ position:"absolute", top:"26%", left:"50%", transform:"translate(-50%,-50%)", fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:landscape?"2.6rem":"3rem", color:"rgba(240,201,106,0.34)", letterSpacing:"0.08em", textShadow:"0 2px 6px rgba(0,0,0,0.5), 0 0 20px rgba(212,168,67,0.25)", pointerEvents:"none", whiteSpace:"nowrap" }}>GAPPER</div>
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

        {/* Flying-chip animation layer — visual only, percent-positioned to
            match the seat coordinate system. */}
        <FlyingChips flights={chipFlights} />

        {/* Visible deck on the felt — cards appear to deal from here. It
            riffles during the shuffle at the start of each round. */}
        <div style={{ position:"absolute", left:"68%", top:"42%", transform:"translate(-50%,-50%)", zIndex:14, pointerEvents:"none" }}>
          <DeckStack shuffling={shuffling} landscape={landscape} />
        </div>

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
          const botCardScale = players.length <= 4 ? 0.92
                          : players.length === 5 ? 0.82
                          : players.length === 6 ? 0.74
                          : 0.66;
          // The human's hand is the one you act on — render it larger than
          // the opponents' hands for clear readability at the bottom seat.
          const cardScale = p.isBot ? botCardScale : 1.18;
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
                {/* Seat-state tag — a small label showing what this seat is
                    doing. Only one shows at a time; priority top→bottom. */}
                {(() => {
                  // selling: this player has an open broadcast sell offer
                  const isSelling = pendingSellOffer && pendingSellOffer.sellerId === p.id;
                  // countered: a counter offer involves this player
                  const isCountered = pendingOffer && pendingOffer.isCounter &&
                    (pendingOffer.buyerId === p.id || pendingOffer.sellerId === p.id);
                  // passed: folded for the round (and not the active seat)
                  const isPassed = p.passed && p.done && !isActiveSlot && phase === "betting";
                  const tag = isSelling ? { t:"FOR SALE", c:"#D4A843" }
                            : isCountered ? { t:"COUNTER", c:"#C39BD3" }
                            : isPassed ? { t:"PASSED", c:"rgba(245,237,216,0.55)" }
                            : null;
                  if (!tag || botThinking === p.id) return null;
                  return (
                    <div style={{
                      position:"absolute", top:-9, left:"50%", transform:"translateX(-50%)",
                      padding:"2px 7px", borderRadius:7, whiteSpace:"nowrap",
                      background:"rgba(6,13,8,0.96)", border:`1px solid ${tag.c}`,
                      fontSize:"0.54rem", fontWeight:800, letterSpacing:"0.1em",
                      color:tag.c, boxShadow:"0 2px 6px rgba(0,0,0,0.7)",
                      animation:"seatTagIn 0.25s ease both",
                    }}>{tag.t}</div>
                  );
                })()}
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
              {/* Permanent 3-card zone: two dealt cards + a reserved Doink
                  card slot. The third slot holds a placeholder until the hit
                  card is revealed, so the layout never shifts on reveal. */}
              <div style={{ display:"flex", gap:3, alignItems:"center" }}>
                {p.c1 && p.cards[0] ? <Card card={p.cards[0]} small glow={isActiveSlot&&!p.isBot} animClass="deal-anim" scale={cardScale}/> : <Placeholder small scale={cardScale}/>}
                {p.c2 && p.cards[1] ? <Card card={p.cards[1]} small glow={isActiveSlot&&!p.isBot} animClass="deal-anim" scale={cardScale}/> : <Placeholder small scale={cardScale}/>}
                {/* Doink-card slot — divider + third card position, always present */}
                <div style={{ width:3, height:26*cardScale, borderLeft:"1px solid rgba(255,255,255,0.18)", margin:"0 1px" }}/>
                {p.hitCard
                  ? <Card card={p.hitCard} small animClass="hit-anim" glow={slotAnim==="win"} scale={cardScale}/>
                  : <Placeholder small scale={cardScale} doinkSlot/>}
              </div>
              {slotAnim && (
                <div style={{ fontSize:slotAnim==="doink"?"0.78rem":"0.6rem", padding:slotAnim==="doink"?"4px 12px":"2px 8px", borderRadius:10, fontWeight:700, background:slotAnim==="win"?"rgba(39,174,96,0.2)":slotAnim==="doink"?"rgba(231,76,60,0.28)":"rgba(255,255,255,0.05)", border:slotAnim==="win"?"1.5px solid rgba(39,174,96,0.55)":slotAnim==="doink"?"2px solid rgba(231,76,60,0.75)":"1px solid transparent", color:slotAnim==="win"?"#27AE60":slotAnim==="doink"?"#E74C3C":slotAnim==="miss"?"rgba(255,255,255,0.35)":"rgba(255,255,255,0.2)", textShadow:slotAnim==="doink"?"0 0 18px rgba(231,76,60,0.9)":slotAnim==="win"?"0 0 10px rgba(39,174,96,0.7)":"none" }}>
                  {slotAnim==="win"?"WIN":slotAnim==="doink"?"DOINK!":slotAnim==="miss"?"MISS":"PASS"}
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

      {/* ── Lower-rail drawers: Log + Marketplace ── */}
      <TableDrawers
        openDrawer={openDrawer}
        setOpenDrawer={setOpenDrawer}
        log={log}
        marketContent={
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {/* Active table sell offer, if any */}
            {pendingSellOffer ? (() => {
              const seller = players.find(p => p.id === pendingSellOffer.sellerId);
              const isMine = pendingSellOffer.sellerId === humanPlayer?.id;
              const canAfford = (humanPlayer?.chips || 0) >= (pendingSellOffer.chips || 0);
              return (
                <div style={{ background:"rgba(212,168,67,0.07)", border:"1px solid rgba(212,168,67,0.25)", borderRadius:12, padding:"12px 14px" }}>
                  <div style={{ fontSize:"0.8rem", color:"#D4A843", fontWeight:700, marginBottom:3 }}>
                    {isMine ? "Your hand is listed" : `${seller?.name || "A player"} is selling`}
                  </div>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#F0C96A", fontWeight:700, marginBottom:8 }}>{pendingSellOffer.desc}</div>
                  {isMine ? (
                    <button onClick={() => { withdrawSellOffer(); setOpenDrawer(null); }} style={{ ...sBtn, width:"100%", fontSize:"0.85rem" }}>Withdraw Listing</button>
                  ) : (
                    <button onClick={() => { acceptOffer(pendingSellOffer, humanPlayer.id); setOpenDrawer(null); }} disabled={!canAfford}
                      style={{ ...gBtn, width:"100%", fontSize:"0.85rem", opacity:canAfford?1:0.4 }}>
                      {canAfford ? `Buy for ◆${pendingSellOffer.chips}` : "Can't Afford"}
                    </button>
                  )}
                </div>
              );
            })() : (
              <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.5)", textAlign:"center", padding:"6px 0" }}>
                No active listings right now.
              </div>
            )}

            {/* Player actions — available during the buy phase */}
            {phase === "preBuy" && humanPlayer && (
              <>
                <button onClick={() => { setOpenDrawer(null); setTradeMode("buy"); setSheet("trade"); }} style={{ ...gBtn, width:"100%", fontSize:"0.9rem" }}> Buy a Hand</button>
                {!pendingSellOffer && (
                  <button onClick={() => { setOpenDrawer(null); setTradeMode("sell"); setSheet("trade"); }} style={{ ...sBtn, width:"100%", fontSize:"0.9rem" }}> Sell My Hand</button>
                )}
              </>
            )}
            {phase !== "preBuy" && (
              <div style={{ fontSize:"0.74rem", color:"rgba(245,237,216,0.4)", textAlign:"center", marginTop:4 }}>
                Buying and selling happen right after cards are dealt.
              </div>
            )}
          </div>
        }
      />

      {/* Active turn drives gameplay below. */}

      {/* ── PREBUY PHASE: human can buy hands before bidding ── */}
      {phase==="preBuy" && !sheet && !pendingSellOffer && humanPlayer && (
        <div className="pop" style={{ position:"absolute", left:0, right:0, bottom:0, padding:`16px 22px calc(20px + env(safe-area-inset-bottom))`, zIndex:28, background:"linear-gradient(0deg,rgba(3,6,4,0.99),rgba(3,6,4,0.85))", borderTop:"1px solid rgba(212,168,67,0.18)", textAlign:"center" }}>
          <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.55)", fontWeight:500, marginBottom:6 }}>Cards are dealt</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#D4A843", fontWeight:700, marginBottom:14 }}>Buy a hand, or wait for bidding</div>
          <div style={{ display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <button onClick={() => { setTradeMode("buy"); setSheet("trade"); }} style={{ ...gBtn, fontSize:"0.95rem" }}> Buy a Hand</button>
            <button onClick={() => { setPhase("betting"); addLog("Bidding begins."); }} style={{ ...sBtn, fontSize:"0.95rem" }}>Skip to Bidding →</button>
          </div>
        </div>
      )}

      {/* ── HUMAN'S OWN SELL OFFER STATUS ── */}
      {pendingSellOffer && pendingSellOffer.sellerId === humanPlayer?.id && !sheet && (
        <div className="pop" style={{ position:"absolute", left:0, right:0, bottom:0, padding:`14px 18px calc(16px + env(safe-area-inset-bottom))`, zIndex:29, background:"linear-gradient(0deg,rgba(8,14,4,0.99),rgba(8,14,4,0.9))", borderTop:"2px solid rgba(212,168,67,0.3)", textAlign:"center" }}>
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
          <div className="pop" style={{ position:"absolute", left:0, right:0, bottom:0, padding:`14px 18px calc(16px + env(safe-area-inset-bottom))`, zIndex:29, background:"linear-gradient(0deg,rgba(2,8,14,0.99),rgba(2,8,14,0.92))", borderTop:"2px solid rgba(212,168,67,0.3)" }}>
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
        <div className="pop" style={{ position:"absolute", left:0, right:0, bottom:0, padding:`16px 22px calc(20px + env(safe-area-inset-bottom))`, zIndex:28, background:"linear-gradient(0deg,rgba(3,6,4,0.99),rgba(3,6,4,0.85))", borderTop:"1px solid rgba(212,168,67,0.18)", textAlign:"center" }}>
          <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.5)", fontWeight:500, marginBottom:6 }}>
            {curSlot?.isBought?"Time to play your bought hand":"Cards are dealt — you're up"}
          </div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"#D4A843", fontWeight:700, marginBottom:14 }}>{curPlayer?.name}</div>
          <button onClick={() => setWaitingForRoll(false)} style={{ ...gBtn, fontSize:"1rem", padding:"14px 36px" }}>
            {curSlot?.isBought?"Play Bought Hand ":"Let's Roll "}
          </button>
        </div>
      )}

      {/* ── MAIN BET PANEL ── */}
      {isHumanTurn && !sheet && !(incomingOffer||incomingCounter) && (() => {
        const rec = curSlot?.cards?.length === 2 ? getRecommendation(curSlot.cards[0], curSlot.cards[1]) : null;
        const cantBet = (curPlayer?.chips || 0) <= 0 || pot <= 0;
        return (
        <div className="pop" style={{
          position:"absolute", left:0, right:0, bottom:0,
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
          {/* Pinned to the bottom (position:absolute) so opening the action
              panel overlays the empty felt below the human seat — the table
              and seats no longer shift up when controls appear. */}
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
                {slotSpread?.mythical?" Mythical Spread!":slotSpread?.v===0?"⚠️ Same Rank":`Spread of ${slotSpread?.v}`}
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
            {/* Spread bet needs a card to fall BETWEEN your two. A pair
                (spread 0) or adjacent cards like Q-K (spread 1) have no
                between — hide the spread button in those cases.
                Each button shows its label plus the payout odds. */}
            {slotSpread && slotSpread.v >= 2 &&
              <button onClick={()=>{setBetVal(0);setSheet("bet");}} disabled={cantBet} style={{...gBtn, opacity:cantBet?0.4:1, display:"flex", flexDirection:"column", lineHeight:1.15, padding:"9px 16px"}}>
                <span>BET SPREAD</span>
                <span style={{ fontSize:"0.62rem", fontWeight:600, opacity:0.8 }}>Spread {slotSpread.v} · pays 1:1</span>
              </button>}
            <button onClick={()=>{setBetVal(0);setSheet("doinkBet");}} disabled={cantBet} style={{...dBtn, opacity:cantBet?0.4:1, display:"flex", flexDirection:"column", lineHeight:1.15, padding:"9px 16px"}}>
              <span> DOINK BET</span>
              <span style={{ fontSize:"0.62rem", fontWeight:600, opacity:0.85 }}>pays 7:1</span>
            </button>
            {slotSpread?.mythical&&<button onClick={()=>{setBetVal(0);setSheet("mythical");}} disabled={cantBet} style={{...pBtn, opacity:cantBet?0.4:1, display:"flex", flexDirection:"column", lineHeight:1.15, padding:"9px 16px"}}>
              <span> MYTHICAL</span>
              <span style={{ fontSize:"0.62rem", fontWeight:600, opacity:0.85 }}>pays 12:1</span>
            </button>}
            {/* Double Doink — only when the player holds a pair (spread 0). */}
            {slotSpread?.v===0&&<button onClick={()=>{setBetVal(0);setSheet("doubledoink");}} disabled={cantBet} style={{...dBtn, background:"linear-gradient(145deg,#7A1212,#C0392B)", opacity:cantBet?0.4:1, display:"flex", flexDirection:"column", lineHeight:1.15, padding:"9px 16px"}}>
              <span> DOUBLE DOINK</span>
              <span style={{ fontSize:"0.62rem", fontWeight:600, opacity:0.85 }}>pays 18:1</span>
            </button>}
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
              {!curSlot?.isBought&&<button onClick={()=>{setShowSecondary(false);setSheet("insurance");}} disabled={cantBet} style={{ ...sBtn, fontSize:"0.82rem", padding:"8px 14px", opacity:cantBet?0.4:1 }}> Insurance</button>}
              <button onClick={()=>{setShowSecondary(false);setTradeMode("buy");setSheet("trade");}} style={{ ...sBtn, fontSize:"0.82rem", padding:"8px 14px" }}> Buy Hand</button>
              <button onClick={()=>{setShowSecondary(false);setTradeMode("sell");setSheet("trade");}} style={{ ...sBtn, fontSize:"0.82rem", padding:"8px 14px" }}> Sell Hand</button>
            </div>
          )}
        </div>
        );
      })()}

      {/* ── INCOMING OFFER ── */}
      {(incomingOffer || incomingCounter) && !sheet && isHumanTurn && (
        <div className="pop" style={{ position:"absolute", left:0, right:0, bottom:0, padding:`14px 18px calc(16px + env(safe-area-inset-bottom))`, zIndex:29, background:"linear-gradient(0deg,rgba(2,8,14,0.99),rgba(2,8,14,0.92))", borderTop:"2px solid rgba(212,168,67,0.3)" }}>
          {(() => {
            const offer = incomingOffer || incomingCounter;
            const humanIsSeller = offer.sellerId === humanPlayer?.id;
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
                  <button onClick={() => setSheet("counter")} style={{ ...sBtn, fontSize:"0.95rem" }}>Counter ️</button>
                </div>
              </>
            );
          })()}
        </div>
      )}

      {/* ── BLIND BET PANEL ── */}
      {phase==="blindBet" && humanPlayer && humanPlayer.chips > 0 && !sheet && (
        <div className="pop" style={{ position:"absolute", left:0, right:0, bottom:0, padding:`14px 18px calc(16px + env(safe-area-inset-bottom))`, zIndex:28, background:"linear-gradient(0deg,rgba(3,6,4,0.99),rgba(3,6,4,0.88))", borderTop:"1px solid rgba(212,168,67,0.15)" }}>
          <div style={{ textAlign:"center", marginBottom:12 }}>
            <span style={{ fontSize:"1rem", fontWeight:700, color:"#D4A843" }}>{humanPlayer.name}</span>
            <span style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.45)", marginLeft:8 }}>— blind bet before your cards?</span>
          </div>
          <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
            <button onClick={() => { setBetVal(0); setSheet("blindBet"); }} style={gBtn}> Blind Bet</button>
            <button onClick={() => { setSheet(null); startDealing(); }} style={sBtn}>Skip</button>
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
        <Sheet title="Blind Bet" subtitle="Bet before your cards are dealt. A hit pays 2× from the pot." onClose={() => setSheet(null)} landscape={landscape}>
          <ChipSelector denoms={denoms} max={Math.min(pot, humanPlayer?.chips||0)} value={betVal} onChange={setBetVal}/>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={humanBlindBet} disabled={betVal===0} style={{ ...gBtn, opacity:betVal===0?0.4:1 }}>Blind Bet ◆{betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
      )}
      {sheet==="bet" && (() => {
        // Spread pays 1:1, so the winnings can equal the pot — max = min(chips, pot).
        const max = Math.min(curPlayer?.chips || 0, pot);
        return (
        <Sheet title="Bet on Spread" subtitle={`If the hit card falls between yours — WIN. Pays 1:1. Max bet ◆${max} (can't win more than the pot).`} onClose={() => setSheet(null)} landscape={landscape}>
          <ChipSelector denoms={denoms} max={max} value={betVal} onChange={setBetVal}/>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={() => humanBet("spread")} disabled={betVal===0} style={{ ...gBtn, opacity:betVal===0?0.4:1 }}>Bet ${betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
        );
      })()}
      {sheet==="doinkBet" && (() => {
        // Doink pays 7×, but winnings are capped to the pot at resolution.
        // The bet itself is limited only by chips and pot (like a spread bet),
        // so you can always take a swing even if the pot is small.
        const max = Math.min(curPlayer?.chips || 0, pot);
        return (
        <Sheet title="Doink Bet" subtitle={`Bet the hit card MATCHES one of yours. Pays 7× — but never more than the pot. Max bet ◆${max}.`} onClose={() => setSheet(null)} landscape={landscape}>
          {max <= 0
            ? <div style={{ textAlign:"center", padding:"20px 16px", color:"rgba(245,237,216,0.55)", fontSize:"0.9rem" }}>The pot is empty — nothing to win right now.</div>
            : <ChipSelector denoms={denoms} max={max} value={betVal} onChange={setBetVal}/>}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={() => humanBet("doink")} disabled={betVal===0||max<=0} style={{ ...dBtn, opacity:(betVal===0||max<=0)?0.4:1 }}>Doink Bet ◆{betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
        );
      })()}
      {sheet==="doubledoink" && (() => {
        // DOUBLE DOINK — only reachable when the player holds a pair. Bet that
        // a third card of that rank lands. ~4% chance (2 of 50 unseen) → pays
        // 18×, capped to the pot. Bet limited by chips and pot.
        const max = Math.min(curPlayer?.chips || 0, pot);
        return (
        <Sheet title="Double Doink" subtitle={`You hold a pair. Bet that a third card of that rank is the hit. Pays 18× — capped to the pot. Max bet ◆${max}.`} onClose={() => setSheet(null)} landscape={landscape}>
          {max <= 0
            ? <div style={{ textAlign:"center", padding:"20px 16px", color:"rgba(245,237,216,0.55)", fontSize:"0.9rem" }}>The pot is empty — nothing to win right now.</div>
            : <ChipSelector denoms={denoms} max={max} value={betVal} onChange={setBetVal}/>}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={() => humanBet("doubledoink")} disabled={betVal===0||max<=0} style={{ ...dBtn, background:"linear-gradient(145deg,#7A1212,#C0392B)", opacity:(betVal===0||max<=0)?0.4:1 }}>Double Doink ◆{betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
        );
      })()}
      {sheet==="mythical" && (() => {
        // Mythical pays 12×, capped to the pot at resolution. Bet limited only
        // by chips and pot.
        const max = Math.min(curPlayer?.chips || 0, pot);
        return (
        <Sheet title="Mythical Split" subtitle={`Your cards are exactly 2 apart. Pays 12× — but never more than the pot. Max bet ◆${max}.`} onClose={() => setSheet(null)} landscape={landscape}>
          {max <= 0
            ? <div style={{ textAlign:"center", padding:"20px 16px", color:"rgba(245,237,216,0.55)", fontSize:"0.9rem" }}>The pot is empty — nothing to win right now.</div>
            : <ChipSelector denoms={denoms} max={max} value={betVal} onChange={setBetVal}/>}
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginTop:18 }}>
            <button onClick={() => humanBet("mythical")} disabled={betVal===0||max<=0} style={{ ...pBtn, opacity:(betVal===0||max<=0)?0.4:1 }}>Mythical ◆{betVal||""}</button>
            <button onClick={() => setSheet(null)} style={sBtn}>Cancel</button>
          </div>
        </Sheet>
        );
      })()}
      {sheet==="insurance" && (
        <Sheet title=" Doink Insurance" subtitle="Pay a premium upfront. If you doink, a portion of your penalty is covered." onClose={() => setSheet(null)} landscape={landscape}>
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
        <Sheet title="Sell Your Hand" subtitle="Broadcast your terms to the table. The first player to accept buys your hand. They pay you upfront and play your cards. If they win, you get your % of their winnings." onClose={() => setSheet(null)} landscape={landscape}>
          {/* The seller is always the HUMAN — use humanPlayer, not curPlayer
              (the current turn slot), so selling works regardless of whose
              turn it is. */}
          {humanPlayer?.cards?.length === 2 && (() => {
            const { quality, base } = handValue(humanPlayer.cards[0], humanPlayer.cards[1], pot);
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
          <OfferBuilder denoms={denoms} maxChips={humanPlayer?.chips || 0} label="Broadcast Sell Offer" onCancel={() => setSheet(null)}
            onConfirm={offerData => {
              const human = playersRef.current.find(p => !p.isBot);
              if (!human) return;
              const sellOffer = {
                sellerId: human.id,
                chips: offerData.chips,
                pct: offerData.pct,
                desc: offerData.desc,
                kind: offerData.kind,
              };
              setPendingSellOffer(sellOffer);
              setSheet(null); setTradeMode(null);
              addLog(` ${human.name} sells hand to the table: ${offerData.desc}.`);
              // Trigger bot evaluations
              setTimeout(() => evaluateBotSellResponses(sellOffer), 600);
            }}
          />
        </Sheet>
      )}
      {sheet==="trade" && tradeMode==="buy" && (
        <Sheet title=" Buy a Hand" subtitle="Offer chips (plus optional % of winnings) for a specific player's hand. You play both yours and theirs, in order." onClose={() => setSheet(null)} landscape={landscape}>
          <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
            {/* The buyer is always the HUMAN — never `curPlayer` (the current
                turn slot), which may be a bot or null and caused bought hands
                to land on the wrong player. Exclude only the human's own hand. */}
            {players.filter(p => p.id !== humanPlayer?.id && p.cards.length >= 2 && !p.done && !p.passed).map(target => {
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
                  <OfferBuilder denoms={denoms} maxChips={humanPlayer?.chips||0} label="Offer to Buy" onCancel={() => setSheet(null)} onConfirm={offerData => makeBuyOffer(target.id, offerData)}/>
                </div>
              );
            })}
            {players.filter(p => p.id !== humanPlayer?.id && p.cards.length >= 2 && !p.done && !p.passed).length === 0 && (
              <div style={{ textAlign:"center", color:"rgba(245,237,216,0.38)", fontSize:"0.9rem", padding:24 }}>No hands available to buy right now.</div>
            )}
          </div>
        </Sheet>
      )}
      {sheet==="counter"&&(incomingOffer||incomingCounter)&&(
        <Sheet title="️ Counter Offer" subtitle={`Countering ${players.find(p=>p.id===(incomingOffer||incomingCounter).buyerId)?.name}'s offer`} onClose={() => setSheet(null)} landscape={landscape}>
          <OfferBuilder denoms={denoms} maxChips={humanPlayer?.chips||0} label="Send Counter" onCancel={() => setSheet(null)}
            onConfirm={offerData => {
              const orig=incomingOffer||incomingCounter;
              const counter={...orig,chips:offerData.chips,pct:offerData.pct,desc:offerData.desc,kind:offerData.kind,isCounter:true};
              addLog(`${humanPlayer?.name} counters: ${offerData.desc}.`);
              setSheet(null);
              const otherPartyId=orig.buyerId===humanPlayer?.id?orig.sellerId:orig.buyerId;
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
      {mythicalFlash && <MythicalFullScreen name={mythicalFlash} />}
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
      icon: "",
      title: "Welcome to Gapper",
      body: "Gapper is a card-betting game of pure chaos. The pot is everyone's money. You bet against it on every hand. Win and you take a piece. Doink, and you pay the pot DOUBLE.",
    },
    {
      icon: "",
      title: "Your Hand",
      body: "You get dealt two cards. You bet whether a third card — the 'hit' — falls between them in rank value. Aces are low.\n\nA hand of (3, J) is great — most cards fall between. A hand of (6, 7) is brutal — almost nothing fits.",
    },
    {
      icon: "",
      title: "The DOINK",
      body: "If the hit card matches one of YOUR card ranks, you DOINK. You pay the pot 2× your bet.\n\nThis is the game's signature pain. The narrower your spread, the higher the risk.",
    },
    {
      icon: "",
      title: "Bet Types",
      body: "Spread Bet — bet between. Pays 1:1.\n Doink Bet — bet on a MATCH. Pays 7:1.\n Double Doink — hold a pair, bet a third of that rank. Pays 18:1.\n Mythical Split — cards exactly 2 apart. The middle card pays 12:1.\n Blind Bet — before cards dealt. Pays 2:1.",
    },
    {
      icon: "",
      title: "Trade Hands",
      body: "Before bidding, you can buy hands from other players. During the round, you can sell yours to the table — broadcast your terms and the first to accept takes over.\n\nIf they win, they pay you your agreed % of winnings.",
    },
    {
      icon: "️",
      title: "Replenish",
      body: "When the pot hits ◆0, everyone replenishes — pays back in — and play continues. The game keeps going until someone busts.\n\nReady?",
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
// UNLOCK REWARD POPUP — shown once when a career milestone is hit
// ─────────────────────────────────────────────────────────
const UNLOCK_REWARDS = {
  4:  { title: "Backroom Table Unlocked",  themeName: "Backroom Blue Felt",
        rewards: ["Backroom Blue felt", "Backroom Matte chips", "Black Label card back", "4-bot games", "◆250 starting chips & replenish", "New avatars: Backroom Regular, Sunglasses"] },
  9:  { title: "Riverboat Room Unlocked",  themeName: "Riverboat Red Felt",
        rewards: ["Riverboat Red felt", "Riverboat Brass chips", "Riverboat Crest card back", "5-bot games", "◆500 starting chips & replenish", "New avatars: Riverboat Captain, Mustache"] },
  16: { title: "High Stakes Room Unlocked", themeName: "Elite Black Felt",
        rewards: ["Elite Black felt", "Elite Premium chips", "Elite Gold card back", "6-bot games", "◆1,000 starting chips & replenish", "New avatars: The Regular, Black Hat"] },
  25: { title: "Mythic Invitational Unlocked", themeName: "Mythic Purple Felt",
        rewards: ["Mythic Purple felt", "Mythic Gold chips", "Mythic Crown card back", "7-bot games", "◆2,500 starting chips & replenish", "New avatars: Mythic Shark, Gold Suit, Final Boss"] },
};

function UnlockRewardPopup({ milestone, onClose }) {
  const data = UNLOCK_REWARDS[milestone];
  if (!data) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:320, background:"radial-gradient(ellipse at center, rgba(8,16,10,0.92), rgba(2,5,3,0.98))", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{
        width:"100%", maxWidth:380,
        background:"linear-gradient(165deg, rgba(40,28,8,0.96), rgba(8,12,8,0.98))",
        border:"1.5px solid rgba(212,168,67,0.55)", borderRadius:24, padding:"28px 24px",
        boxShadow:"0 24px 80px rgba(0,0,0,0.95), 0 0 60px rgba(212,168,67,0.2)",
        animation:"popIn .3s cubic-bezier(.16,1,.3,1) both",
      }}>
        <div style={{ textAlign:"center", marginBottom:18 }}>
          <div style={{ fontSize:"2.4rem", marginBottom:6 }}></div>
          <div style={{ fontSize:"0.6rem", letterSpacing:"0.24em", color:"rgba(212,168,67,0.7)", fontWeight:700, textTransform:"uppercase" }}>Level {milestone} Reached</div>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:"#F0C96A", fontWeight:900, marginTop:4, textShadow:"0 0 24px rgba(212,168,67,0.5)" }}>{data.title}</div>
        </div>
        <div style={{ fontSize:"0.66rem", letterSpacing:"0.16em", color:"rgba(212,168,67,0.6)", fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>New Quick Play Options</div>
        <div style={{ display:"flex", flexDirection:"column", gap:7, marginBottom:22 }}>
          {data.rewards.map((r, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:9, fontSize:"0.86rem", color:"rgba(245,237,216,0.85)" }}>
              <span style={{ color:"#D4A843", fontWeight:700 }}>✦</span>{r}
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ ...gBtn, width:"100%", padding:"14px", fontSize:"1rem" }}>Claim Rewards →</button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// HOME SCREEN — chooses between Career, Quick Play, Tutorial
// ─────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────
// SETTINGS — Account, Notifications, Sound & Haptics, Help,
// About Gapper, Legal, Danger Zone. (Sound & Haptics is a
// placeholder filled in by J15.)
// ─────────────────────────────────────────────────────────
function SettingsScreen({ career, isGuest, onBack, onResetCareer, onOpenLegal, onSignOut, onRequireSignIn }) {
  // Notifications toggle — placeholder. Persisted to localStorage so the
  // choice sticks; no notification system is wired to it yet.
  const [notif, setNotif] = useState(() => {
    try { return localStorage.getItem("doinkNotif") !== "0"; } catch { return true; }
  });
  const toggleNotif = () => {
    setNotif(v => {
      const next = !v;
      try { localStorage.setItem("doinkNotif", next ? "1" : "0"); } catch {}
      return next;
    });
  };
  // Reset-career confirmation modal state.
  const [confirmReset, setConfirmReset] = useState(false);

  const card = { width:"100%", maxWidth:460, background:"rgba(255,255,255,0.03)", borderRadius:16, padding:"14px 16px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:14 };
  const sectionLabel = { fontSize:"0.64rem", letterSpacing:"0.2em", color:"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase", marginBottom:10 };
  const rowBtn = { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 13px", background:"rgba(0,0,0,0.3)", border:"none", cursor:"pointer", width:"100%", textAlign:"left" };

  // Simple gold/grey toggle switch.
  const Toggle = ({ on, onClick }) => (
    <button onClick={onClick} role="switch" aria-checked={on} style={{
      width:46, height:26, borderRadius:14, border:"none", cursor:"pointer", padding:0,
      background: on ? "#D4A843" : "rgba(255,255,255,0.15)", position:"relative", transition:"background .2s",
    }}>
      <span style={{ position:"absolute", top:3, left: on ? 23 : 3, width:20, height:20, borderRadius:"50%", background:"#fff", transition:"left .2s" }}/>
    </button>
  );

  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)", fontFamily:"'DM Sans',sans-serif" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:`0 22px calc(40px + env(safe-area-inset-bottom))` }}>
        {/* Sticky header — sticks to the true top edge and carries the safe-area
            inset itself, with its background filling that inset so there is no
            gap above it on notched screens. */}
        <div style={{
          position:"sticky", top:0, zIndex:20,
          width:"100%", maxWidth:460, display:"flex", justifyContent:"space-between",
          alignItems:"center", marginBottom:18,
          padding:"calc(env(safe-area-inset-top) + 12px) 0 12px",
          background:"linear-gradient(180deg,#0C1A10 0%,#0C1A10 80%,transparent 100%)",
        }}>
          <button onClick={onBack} style={{ ...sBtn, padding:"8px 14px", fontSize:"0.85rem" }}>← Back</button>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#D4A843", fontWeight:700, letterSpacing:"0.04em" }}>Settings</div>
          <div style={{ width:60 }} />
        </div>

        {/* Account */}
        <div style={card}>
          <div style={sectionLabel}>Account</div>
          {isGuest ? (
            <>
              <p style={{ fontSize:"0.84rem", color:"rgba(245,237,216,0.65)", lineHeight:1.55, margin:"0 0 10px" }}>
                You're playing as a guest. Sign in to save your career and compete on the leaderboard.
              </p>
              <button onClick={onRequireSignIn} style={{ ...gBtn, width:"100%", fontSize:"0.9rem" }}>Sign In</button>
            </>
          ) : (
            <>
              <div style={{ fontSize:"0.86rem", color:"rgba(245,237,216,0.8)", marginBottom:10 }}>
                Signed in{career?.playerName ? ` as ${career.playerName}` : ""}.
              </div>
              {onSignOut && <button onClick={onSignOut} style={{ ...sBtn, width:"100%", fontSize:"0.88rem" }}>Sign Out</button>}
            </>
          )}
        </div>

        {/* Notifications */}
        <div style={card}>
          <div style={sectionLabel}>Notifications</div>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ minWidth:0, flex:1 }}>
              <div style={{ fontSize:"0.9rem", color:"rgba(245,237,216,0.85)", fontWeight:500 }}>In-app notifications</div>
              <div style={{ fontSize:"0.72rem", color:"rgba(245,237,216,0.45)", marginTop:2 }}>Achievement and level-up alerts.</div>
            </div>
            <Toggle on={notif} onClick={toggleNotif}/>
          </div>
        </div>

        {/* Sound & Haptics — placeholder for J15 */}
        <div style={card}>
          <div style={sectionLabel}>Sound &amp; Haptics</div>
          <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.45)", lineHeight:1.55 }}>
            Sound effects and haptic feedback controls are coming soon.
          </div>
        </div>

        {/* Help */}
        <div style={card}>
          <div style={sectionLabel}>Help</div>
          <div style={{ borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => onOpenLegal("support")} style={rowBtn}>
              <span style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.85)", fontWeight:500 }}>Support</span>
              <span style={{ fontSize:"0.9rem", color:"rgba(212,168,67,0.6)" }}>›</span>
            </button>
          </div>
        </div>

        {/* About Gapper — moved here from Profile */}
        <div style={card}>
          <div style={sectionLabel}>About Gapper</div>
          <p style={{ fontSize:"0.82rem", lineHeight:1.6, color:"rgba(245,237,216,0.7)", margin:0 }}>
            Gapper is a fictional play-chip card strategy game. No real money is wagered,
            won, lost, deposited, withdrawn, or redeemed. Chips, scores, levels, unlocks,
            and leaderboard rankings are fictional and for entertainment only.
          </p>
          <p style={{ fontSize:"0.68rem", color:"rgba(245,237,216,0.35)", margin:"10px 0 0" }}>
            {DEV_NAME} · v1.0
          </p>
        </div>

        {/* Legal */}
        <div style={card}>
          <div style={sectionLabel}>Legal</div>
          <div style={{ display:"flex", flexDirection:"column", gap:1, borderRadius:10, overflow:"hidden", border:"1px solid rgba(255,255,255,0.06)" }}>
            {[
              { label:"Privacy Policy",   page:"privacy" },
              { label:"Terms of Use",     page:"terms" },
              { label:"Account Deletion", page:"accountDeletion" },
            ].map(row => (
              <button key={row.label} onClick={() => onOpenLegal(row.page)} style={rowBtn}>
                <span style={{ fontSize:"0.88rem", color:"rgba(245,237,216,0.85)", fontWeight:500 }}>{row.label}</span>
                <span style={{ fontSize:"0.9rem", color:"rgba(212,168,67,0.6)" }}>›</span>
              </button>
            ))}
          </div>
        </div>

        {/* Danger Zone — Reset Career, signed-in only */}
        {!isGuest && (
          <div style={{ ...card, border:"1px solid rgba(231,76,60,0.3)" }}>
            <div style={{ ...sectionLabel, color:"rgba(231,76,60,0.7)" }}>Danger Zone</div>
            <p style={{ fontSize:"0.8rem", color:"rgba(245,237,216,0.6)", lineHeight:1.55, margin:"0 0 10px" }}>
              Resetting wipes your level, chip stack, stats, achievements, and unlocks. This cannot be undone.
            </p>
            <button onClick={() => setConfirmReset(true)} style={{
              width:"100%", padding:"12px", borderRadius:12, cursor:"pointer",
              background:"rgba(231,76,60,0.12)", border:"1px solid rgba(231,76,60,0.4)",
              color:"rgba(231,140,130,0.95)", fontSize:"0.9rem", fontWeight:700,
            }}>Reset Career</button>
          </div>
        )}
      </div>

      {/* Strong reset confirmation modal */}
      {confirmReset && (
        <div onClick={() => setConfirmReset(false)} style={{ position:"fixed", inset:0, zIndex:80, background:"rgba(0,0,0,0.78)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
          <div onClick={e => e.stopPropagation()} style={{ width:"100%", maxWidth:340, background:"linear-gradient(170deg,#1A0E0C,#0C0807)", border:"1.5px solid rgba(231,76,60,0.45)", borderRadius:18, padding:"22px 20px" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#E74C3C", fontWeight:700, textAlign:"center", marginBottom:8 }}>Reset your career?</div>
            <p style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.7)", lineHeight:1.6, textAlign:"center", margin:"0 0 18px" }}>
              This permanently wipes your level, chip stack, stats, achievements, and unlocks.
              There is no way to undo this.
            </p>
            <button onClick={() => { setConfirmReset(false); onResetCareer(); }} style={{
              width:"100%", padding:"13px", borderRadius:12, cursor:"pointer", marginBottom:8,
              background:"linear-gradient(160deg,#C0392B,#7A1212)", border:"none",
              color:"#fff", fontSize:"0.95rem", fontWeight:700,
            }}>Yes, Reset Everything</button>
            <button onClick={() => setConfirmReset(false)} style={{ ...sBtn, width:"100%", fontSize:"0.9rem" }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

function HomeScreen({ onCareer, onQuickPlay, onTutorial, onSettings, hasCareer, isGuest, career, onSignOut, onSignIn, onLeaderboard }) {
  // Small round icon button used in the top-right header cluster.
  const IconBtn = ({ onClick, label, icon }) => (
    <button onClick={onClick} aria-label={label} style={{
      width:42, height:42, borderRadius:"50%",
      background:"rgba(255,255,255,0.06)", border:"1px solid rgba(212,168,67,0.3)",
      display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
    }}>
      <GameIcon name={icon} size={20} color="#D4A843"/>
    </button>
  );

  const lvl = career ? getLevelFromXP(career.xp) : 1;

  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)" }}>
      {/* Top-right icon header — Tutorial + Settings */}
      <div style={{
        position:"absolute", top:"calc(env(safe-area-inset-top) + 12px)", right:16,
        display:"flex", gap:10, zIndex:5,
      }}>
        <IconBtn onClick={onTutorial} label="Tutorial" icon="book"/>
        <IconBtn onClick={onSettings} label="Settings" icon="dice"/>
      </div>

      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", padding:`calc(env(safe-area-inset-top) + 64px) 22px calc(40px + env(safe-area-inset-bottom))` }}>
        {/* Wordmark */}
        <div style={{ textAlign:"center", marginBottom:30 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontWeight:900, fontSize:"clamp(3.4rem,14vw,5.4rem)", color:"#D4A843", textShadow:"0 0 50px rgba(212,168,67,0.45),0 4px 0 rgba(0,0,0,0.5)", lineHeight:1, letterSpacing:"0.05em" }}>GAPPER</div>
          <div style={{ height:2, background:"linear-gradient(90deg,transparent,#D4A843,transparent)", margin:"14px auto 8px", width:160 }} />
          <div style={{ fontSize:"0.74rem", color:"rgba(212,168,67,0.55)", letterSpacing:"0.22em", fontWeight:600, textTransform:"uppercase" }}>A Card Game of Pure Chaos</div>
        </div>

        {/* Career status panel — signed-in players only */}
        {!isGuest && career && (
          <div style={{
            width:"100%", maxWidth:340, marginBottom:18,
            background:"linear-gradient(160deg,rgba(40,28,8,0.55),rgba(8,16,10,0.85))",
            border:"1px solid rgba(212,168,67,0.3)", borderRadius:16, padding:"14px 16px",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
              <span style={{ fontSize:"0.66rem", letterSpacing:"0.16em", color:"rgba(212,168,67,0.6)", fontWeight:700, textTransform:"uppercase" }}>Your Career</span>
              <span style={{ fontSize:"0.78rem", color:"#F0C96A", fontWeight:700 }}>{rankForLevel(lvl)}</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", gap:8 }}>
              {[
                { label:"Level", value:lvl },
                { label:"Chips", value:`◆${(career.bankroll||0).toLocaleString()}` },
                { label:"Streak", value:career.currentStreak||0 },
              ].map(s => (
                <div key={s.label} style={{ flex:1, textAlign:"center" }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#F0C96A", fontWeight:700 }}>{s.value}</div>
                  <div style={{ fontSize:"0.6rem", letterSpacing:"0.1em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase", marginTop:1 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* Guest nudge in place of the career panel */}
        {isGuest && (
          <div style={{ width:"100%", maxWidth:340, marginBottom:18, textAlign:"center", padding:"12px 14px", background:"rgba(212,168,67,0.06)", border:"1px solid rgba(212,168,67,0.22)", borderRadius:14 }}>
            <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.7)", lineHeight:1.5 }}>
              Sign in to start a Career — track your level, chips, and streak.
            </div>
          </div>
        )}

        <div style={{ width:"100%", maxWidth:340, display:"flex", flexDirection:"column", gap:12 }}>
          {/* Career — the dominant gold CTA */}
          <button onClick={onCareer} style={{
            padding:"20px 24px", borderRadius:18, border:"none",
            background:"linear-gradient(160deg,#8A6418 0%,#D4A843 38%,#F4D27A 62%,#C99536 100%)",
            color:"#1A0E00", fontFamily:"'DM Sans',sans-serif", fontSize:"1.1rem", fontWeight:700,
            letterSpacing:"0.06em", textTransform:"uppercase",
            boxShadow:"0 8px 28px rgba(212,168,67,0.42), inset 0 1px 0 rgba(255,240,200,0.55), inset 0 -1px 0 rgba(80,40,0,0.35)",
            cursor:"pointer", display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span>Career Mode</span>
            {hasCareer && !isGuest && <span style={{ fontSize:"0.7rem", opacity:0.7, fontWeight:600 }}>Continue</span>}
            {isGuest && <span style={{ fontSize:"0.7rem", opacity:0.7, fontWeight:600 }}>Sign in</span>}
          </button>

          {/* Quick Play — secondary */}
          <button onClick={onQuickPlay} style={{
            padding:"15px 24px", borderRadius:16,
            background:"rgba(255,255,255,0.06)", border:"1.5px solid rgba(212,168,67,0.4)",
            color:"#F0C96A", fontSize:"1rem", fontWeight:600, letterSpacing:"0.04em",
            cursor:"pointer", backdropFilter:"blur(8px)",
            display:"flex", justifyContent:"space-between", alignItems:"center",
          }}>
            <span>Quick Play</span>
            <span style={{ fontSize:"0.7rem", opacity:0.55, fontWeight:500 }}>Custom one-off</span>
          </button>

          {/* Leaderboard — secondary */}
          {onLeaderboard && (
            <button onClick={onLeaderboard} style={{
              padding:"15px 24px", borderRadius:16,
              background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,168,67,0.3)",
              color:"#F0C96A", fontSize:"0.98rem", fontWeight:600, cursor:"pointer",
              display:"flex", justifyContent:"space-between", alignItems:"center",
            }}>
              <span>Leaderboard</span>
              <span style={{ fontSize:"0.7rem", opacity:0.55, fontWeight:500 }}>See the standings</span>
            </button>
          )}

          {isGuest && onSignIn && (
            <button onClick={onSignIn} style={{
              padding:"12px 22px", borderRadius:12, marginTop:2,
              background:"rgba(212,168,67,0.1)", border:"1px solid rgba(212,168,67,0.35)",
              color:"#F0C96A", fontSize:"0.9rem", fontWeight:600, cursor:"pointer",
            }}>
              Sign In to Save Progress
            </button>
          )}
          {!isGuest && onSignOut && (
            <button onClick={onSignOut} style={{
              padding:"8px 22px", borderRadius:12,
              background:"transparent", border:"none",
              color:"rgba(245,237,216,0.4)", fontSize:"0.8rem", fontWeight:500, cursor:"pointer",
            }}>
              Sign Out
            </button>
          )}

          {/* App-store readiness: fictional-chips disclaimer in the footer. */}
          <p style={{ fontSize:"0.68rem", color:"rgba(245,237,216,0.32)", textAlign:"center", lineHeight:1.6, marginTop:10, padding:"0 8px" }}>
            Gapper uses fictional play chips only. No real money, prizes,
            cash-out, or redeemable value.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// CAREER HOME — bankroll, level, daily stake, stats, play
// ─────────────────────────────────────────────────────────
function CareerHome({ career, onPlay, onClaimDaily, onBack, onLeaderboard, onSettings, onProfile }) {
  const lvlInfo = xpToNextLevel(career.xp);
  const lvl = getLevelFromXP(career.xp);
  const dailyEligible = canClaimDaily(career);
  const dailyAmount = dailyAmountFor(career);
  const card = { width:"100%", maxWidth:420, background:"rgba(255,255,255,0.03)", borderRadius:16, padding:"16px 18px", border:"1px solid rgba(255,255,255,0.08)", marginBottom:14 };

  // Next unlock — the next career table the player hasn't reached yet.
  const nextTable = CAREER_TABLES.find(t => t.unlockLevel > lvl);

  // Compressed stats — the four the spec asks for.
  const sessions = career.sessionsPlayed || 0;
  const winRate = sessions > 0 ? Math.round((career.sessionsWon / sessions) * 100) : 0;

  // Small round icon button for the header.
  const IconBtn = ({ onClick, label, icon }) => (
    <button onClick={onClick} aria-label={label} style={{
      width:38, height:38, borderRadius:"50%",
      background:"rgba(255,255,255,0.06)", border:"1px solid rgba(212,168,67,0.3)",
      display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer",
    }}>
      <GameIcon name={icon} size={18} color="#D4A843"/>
    </button>
  );

  return (
    <div className="ios-scroll" style={{ background:"radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)" }}>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:`calc(env(safe-area-inset-top) + 14px) 22px calc(40px + env(safe-area-inset-bottom))` }}>

        {/* Header — Back left, Career center, Leaderboard + Settings right */}
        <div style={{ width:"100%", maxWidth:420, display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <button onClick={onBack} style={{ ...sBtn, padding:"8px 14px", fontSize:"0.85rem" }}>← Back</button>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"#D4A843", fontWeight:700, letterSpacing:"0.04em" }}>Career</div>
          <div style={{ display:"flex", gap:8 }}>
            {onLeaderboard && <IconBtn onClick={onLeaderboard} label="Leaderboard" icon="trophy"/>}
            {onSettings && <IconBtn onClick={onSettings} label="Settings" icon="dice"/>}
          </div>
        </div>

        {/* Career Snapshot — chips, level/rank, XP, next unlock */}
        <div style={{
          width:"100%", maxWidth:420,
          background:"linear-gradient(160deg,rgba(60,42,12,0.6),rgba(20,12,4,0.85))",
          border:"1.5px solid rgba(212,168,67,0.5)", borderRadius:22, padding:"20px 22px",
          boxShadow:"0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(240,201,106,0.35)",
          marginBottom:14,
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:"0.62rem", letterSpacing:"0.22em", color:"rgba(212,168,67,0.7)", fontWeight:700, textTransform:"uppercase" }}>Chip Stack</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"2.6rem", color:"#F0C96A", fontWeight:900, lineHeight:1.05, textShadow:"0 0 32px rgba(212,168,67,0.55)" }}>◆{career.bankroll.toLocaleString()}</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:"0.62rem", letterSpacing:"0.16em", color:"rgba(212,168,67,0.7)", fontWeight:700, textTransform:"uppercase" }}>Rank</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#F0C96A", fontWeight:700 }}>{rankForLevel(lvl)}</div>
              <div style={{ fontSize:"0.74rem", color:"rgba(245,237,216,0.55)", marginTop:1 }}>Level {lvl}</div>
            </div>
          </div>
          {/* XP bar */}
          <div style={{ marginTop:12 }}>
            <div style={{ height:8, background:"rgba(0,0,0,0.5)", borderRadius:6, overflow:"hidden", border:"1px solid rgba(212,168,67,0.18)" }}>
              <div style={{ height:"100%", width:`${Math.min(100,(lvlInfo.current/lvlInfo.needed)*100)}%`, background:"linear-gradient(90deg,#8A6418,#F4D27A)" }}/>
            </div>
            <div style={{ marginTop:4, fontSize:"0.66rem", color:"rgba(245,237,216,0.45)", fontWeight:500 }}>{lvlInfo.current} / {lvlInfo.needed} XP to Level {lvl + 1}</div>
          </div>
          {/* Next unlock */}
          <div style={{ marginTop:10, paddingTop:10, borderTop:"1px solid rgba(212,168,67,0.16)", fontSize:"0.76rem", color:"rgba(245,237,216,0.6)" }}>
            {nextTable
              ? <>Next unlock: <span style={{ color:"#F0C96A", fontWeight:700 }}>{nextTable.name}</span> at Level {nextTable.unlockLevel}</>
              : <>You've unlocked every table. You're at the top.</>}
          </div>
        </div>

        {/* Today's Action — the daily stake */}
        <div style={{
          ...card,
          background: dailyEligible ? "linear-gradient(160deg,rgba(14,58,30,0.45),rgba(8,18,12,0.6))" : "rgba(255,255,255,0.03)",
          border: dailyEligible ? "1.5px solid rgba(39,174,96,0.5)" : "1px solid rgba(255,255,255,0.08)",
        }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:14 }}>
            <div style={{ minWidth:0 }}>
              <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", color: dailyEligible?"rgba(39,174,96,0.85)":"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase" }}>Today's Action</div>
              <div style={{ fontSize:"0.85rem", color:"rgba(245,237,216,0.7)", marginTop:4, lineHeight:1.45 }}>
                {dailyEligible
                  ? `Claim ◆${dailyAmount} to top up your stack to ◆${career.dailyCap}.`
                  : career.bankroll >= career.dailyCap
                    ? `Your stack is above ◆${career.dailyCap}. Come back if you run low.`
                    : `Already claimed today. Resets tomorrow.`}
              </div>
            </div>
            {dailyEligible && (
              <button onClick={onClaimDaily} style={{ ...gBtn, padding:"12px 18px", fontSize:"0.85rem", flexShrink:0, background:"linear-gradient(160deg,#0E4A1E 0%,#27AE60 60%,#1A8A3A 100%)", color:"#FFF", boxShadow:"0 6px 22px rgba(39,174,96,0.42)" }}>Claim ◆{dailyAmount}</button>
            )}
          </div>
        </div>

        {/* Play a Table — primary CTA */}
        <button onClick={onPlay} style={{
          width:"100%", maxWidth:420,
          padding:"18px 24px", borderRadius:18, border:"none",
          background:"linear-gradient(160deg,#8A6418 0%,#D4A843 38%,#F4D27A 62%,#C99536 100%)",
          color:"#1A0E00", fontFamily:"'DM Sans',sans-serif", fontSize:"1.1rem", fontWeight:700,
          letterSpacing:"0.06em", textTransform:"uppercase",
          boxShadow:"0 8px 28px rgba(212,168,67,0.42), inset 0 1px 0 rgba(255,240,200,0.55)",
          cursor:"pointer", marginBottom:14,
        }}>Play a Table →</button>

        {/* Compressed stats — Win Rate, Sessions, Total Profit, Best Streak */}
        <div style={card}>
          <div style={{ fontSize:"0.66rem", letterSpacing:"0.2em", color:"rgba(212,168,67,0.55)", fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Career Stats</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <StatCell label="Win Rate" value={`${winRate}%`}/>
            <StatCell label="Sessions" value={sessions}/>
            <StatCell label="Total Profit" value={`${career.totalCareerProfit>=0?"+":"−"}◆${Math.abs(career.totalCareerProfit).toLocaleString()}`} color={career.totalCareerProfit>=0?"#27AE60":"#E74C3C"}/>
            <StatCell label="Best Streak" value={career.bestStreak}/>
          </div>
        </div>

        {/* Profile & Stats — secondary */}
        {onProfile && (
          <button onClick={onProfile} style={{
            width:"100%", maxWidth:420,
            padding:"14px 24px", borderRadius:14,
            background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,168,67,0.3)",
            color:"#F0C96A", fontSize:"0.95rem", fontWeight:600, cursor:"pointer",
          }}>Profile &amp; Full Stats</button>
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
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", color:"#F0C96A", fontWeight:700 }}>◆{career.bankroll}</div>
        </div>
        <div style={{ width:"100%", maxWidth:480, display:"flex", flexDirection:"column", gap:12 }}>
          {CAREER_TABLES.map(t => {
            const unlocked = tableIsUnlocked(t, career);
            const playable = tableIsPlayable(t, career);
            // Three states: locked (level too low), unlocked-but-can't-afford
            // (need chips for the buy-in), and playable.
            const reason = !unlocked
              ? `Reach level ${t.unlockLevel} to unlock`
              : !playable
                ? `Need ◆${t.buyIn} to buy in`
                : null;
            return (
              <div key={t.id} style={{
                background: playable
                  ? "linear-gradient(165deg,rgba(40,28,8,0.55),rgba(8,16,10,0.85))"
                  : "rgba(255,255,255,0.025)",
                border: playable ? "1.5px solid rgba(212,168,67,0.45)"
                  : unlocked ? "1px solid rgba(212,168,67,0.2)"
                  : "1px solid rgba(255,255,255,0.06)",
                borderRadius:16, padding:"16px 18px",
                opacity: playable ? 1 : unlocked ? 0.8 : 0.55,
                boxShadow: playable ? "0 8px 24px rgba(0,0,0,0.5)" : "none",
              }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:14, marginBottom:8 }}>
                  <div style={{ minWidth:0, flex:1 }}>
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color: playable?"#F0C96A":unlocked?"rgba(240,201,106,0.7)":"rgba(245,237,216,0.55)", fontWeight:700 }}>{t.name}</div>
                    <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.5)", marginTop:2, lineHeight:1.4 }}>{t.subtitle}</div>
                  </div>
                  <div style={{ fontSize:"0.6rem", letterSpacing:"0.12em", color: unlocked?"rgba(212,168,67,0.6)":"rgba(245,237,216,0.3)", textTransform:"uppercase", fontWeight:700, flexShrink:0, textAlign:"right" }}>
                    {unlocked ? "Unlocked" : `Lvl ${t.unlockLevel}+`}
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap", marginBottom:10 }}>
                  <Pillstat label="Starting" value={`◆${t.buyIn}`}/>
                  <Pillstat label="Ante" value={`◆${computeAnte(t.buyIn)}`}/>
                  <Pillstat label="Bots" value={t.bots}/>
                </div>
                {playable
                  ? <button onClick={() => onSelect(t)} style={{ ...gBtn, width:"100%", padding:"12px", fontSize:"0.95rem" }}>{`Start — Buy in ◆${t.buyIn}`}</button>
                  : <div style={{ padding:"10px 14px", background:"rgba(0,0,0,0.3)", borderRadius:10, color: unlocked?"rgba(245,237,216,0.6)":"rgba(231,76,60,0.75)", fontSize:"0.78rem", fontWeight:600, textAlign:"center" }}>{unlocked ? " " : " "}{reason}</div>
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
function CareerSessionSummary({ result, oldBankroll, newBankroll, oldLevel, newLevel, onContinue }) {
  const net = result.net;
  const won = net > 0;
  const busted = result.reason === "bust" || result.cashOut === 0;
  const outlasted = result.reason === "outlast";
  const card = { background:"rgba(0,0,0,0.3)", borderRadius:12, padding:"10px 14px", border:"1px solid rgba(255,255,255,0.05)" };
  // Did this session push the player up one or more levels?
  const leveledUp = newLevel != null && oldLevel != null && newLevel > oldLevel;
  // Which career tables (if any) the new level unlocked.
  const newlyUnlockedTables = leveledUp
    ? CAREER_TABLES.filter(t => t.unlockLevel > oldLevel && t.unlockLevel <= newLevel)
    : [];
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
            <div style={{ fontSize:"0.62rem", letterSpacing:"0.28em", color:"rgba(212,168,67,0.6)", fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>{outlasted ? "You Outlasted Everyone" : result.tableName}</div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", color: busted?"#E74C3C":won?"#27AE60":"#F0C96A", fontWeight:900, lineHeight:1, textShadow:`0 0 28px ${busted?"rgba(231,76,60,0.55)":won?"rgba(39,174,96,0.55)":"rgba(212,168,67,0.55)"}` }}>
              {outlasted ? "Table Cleared!" : busted ? "Busted Out" : won ? `Up ◆${net}` : net < 0 ? `Down ◆${Math.abs(net)}` : "Broke Even"}
            </div>
            {outlasted && (
              <div style={{ fontSize:"0.82rem", color:"rgba(245,237,216,0.7)", marginTop:8, lineHeight:1.5 }}>
                Every opponent is broke. You took the table and collected an outlast bonus from the pot.
              </div>
            )}
          </div>

          {/* Net / chips */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:14 }}>
            <div style={card}>
              <div style={{ fontSize:"0.58rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase" }}>Starting</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#F0C96A", fontWeight:700, marginTop:2 }}>◆{result.buyIn}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize:"0.58rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase" }}>Final Chips</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#F0C96A", fontWeight:700, marginTop:2 }}>◆{result.cashOut}</div>
            </div>
            <div style={card}>
              <div style={{ fontSize:"0.58rem", letterSpacing:"0.14em", color:"rgba(245,237,216,0.45)", fontWeight:600, textTransform:"uppercase" }}>Net</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color: net>0?"#27AE60":net<0?"#E74C3C":"#F0C96A", fontWeight:700, marginTop:2 }}>{net>=0?`+◆${net}`:`−◆${Math.abs(net)}`}</div>
            </div>
          </div>

          {/* Outlast bonus breakdown (K3) */}
          {outlasted && result.outlastBonus > 0 && (
            <div style={{ ...card, marginBottom:14, border:"1px solid rgba(212,168,67,0.4)", background:"rgba(212,168,67,0.08)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"0.8rem", color:"rgba(245,237,216,0.75)", fontWeight:600 }}>Your stack</span>
                <span style={{ fontSize:"0.85rem", color:"#F0C96A", fontWeight:700 }}>◆{result.stack}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginTop:5 }}>
                <span style={{ fontSize:"0.8rem", color:"rgba(212,168,67,0.9)", fontWeight:700 }}>+ Outlast bonus</span>
                <span style={{ fontSize:"0.85rem", color:"#27AE60", fontWeight:800 }}>+◆{result.outlastBonus}</span>
              </div>
            </div>
          )}

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

          {/* Level-up notification — shown when the session raised the
              player's level. Calls out the new level and any tables it
              unlocked. */}
          {leveledUp && (
            <div style={{
              background:"linear-gradient(160deg,rgba(60,42,12,0.7),rgba(20,12,4,0.9))",
              border:"1.5px solid rgba(212,168,67,0.6)", borderRadius:14,
              padding:"14px 16px", marginBottom:14, textAlign:"center",
              boxShadow:"0 0 28px rgba(212,168,67,0.25)",
            }}>
              <div style={{ fontSize:"0.62rem", letterSpacing:"0.24em", color:"rgba(212,168,67,0.8)", fontWeight:700, textTransform:"uppercase" }}>Level Up</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", color:"#F0C96A", fontWeight:900, lineHeight:1.15, marginTop:3, textShadow:"0 0 24px rgba(212,168,67,0.5)" }}>
                Level {oldLevel} → {newLevel}
              </div>
              <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.65)", marginTop:3 }}>
                You're now ranked <span style={{ color:"#F0C96A", fontWeight:700 }}>{rankForLevel(newLevel)}</span>.
              </div>
              {newlyUnlockedTables.length > 0 && (
                <div style={{ marginTop:8, paddingTop:8, borderTop:"1px solid rgba(212,168,67,0.2)" }}>
                  <div style={{ fontSize:"0.66rem", color:"rgba(212,168,67,0.7)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.12em", marginBottom:3 }}>Unlocked</div>
                  {newlyUnlockedTables.map(t => (
                    <div key={t.id} style={{ fontSize:"0.86rem", color:"#F0C96A", fontWeight:600 }}>{t.name}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Bankroll change */}
          <div style={{
            background:"linear-gradient(160deg,rgba(40,28,8,0.55),rgba(8,16,10,0.85))",
            border:"1.5px solid rgba(212,168,67,0.4)",
            borderRadius:14, padding:"12px 16px", marginBottom:18, textAlign:"center",
          }}>
            <div style={{ fontSize:"0.6rem", letterSpacing:"0.2em", color:"rgba(212,168,67,0.6)", fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Chip Stack</div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"rgba(245,237,216,0.55)", fontWeight:600 }}>◆{oldBankroll.toLocaleString()}</span>
              <span style={{ fontSize:"0.9rem", color:"rgba(212,168,67,0.6)" }}>→</span>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", color:"#F0C96A", fontWeight:900, textShadow:"0 0 18px rgba(212,168,67,0.5)" }}>◆{newBankroll.toLocaleString()}</span>
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
function ProfileScreen({ career, onRename, onBack, onOpenLegal, onOpenAchievements }) {
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
    { label: "Total Profit",   value: `${career.totalCareerProfit>=0?"+":"−"}◆${Math.abs(career.totalCareerProfit).toLocaleString()}`, color: career.totalCareerProfit>=0?"#27AE60":"#E74C3C" },
    { label: "Biggest Win",    value: `◆${career.biggestPotWon.toLocaleString()}` },
    { label: "Worst Doink",    value: `◆${career.biggestDoinkLoss.toLocaleString()}`, color:"#E74C3C" },
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

        {/* Achievements entry */}
        <button onClick={() => onOpenAchievements && onOpenAchievements()} style={{
          ...card, width:"100%", maxWidth:440, marginTop:14, cursor:"pointer",
          display:"flex", justifyContent:"space-between", alignItems:"center",
          border:"1px solid rgba(212,168,67,0.3)", textAlign:"left",
        }}>
          <div>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", color:"#F0C96A", fontWeight:700 }}>Achievements</div>
            <div style={{ fontSize:"0.78rem", color:"rgba(245,237,216,0.5)", marginTop:2 }}>
              {(career?.achievements || []).length} unlocked
            </div>
          </div>
          <span style={{ fontSize:"1.3rem", color:"rgba(212,168,67,0.6)" }}>›</span>
        </button>
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
export function GameRoot({ career, setCareer, isGuest, initialRoute, onSignOut, onRequireSignIn, onShowLeaderboard, onTutorialTrigger, displayName }) {
  // Route state: "home" | "tutorial" | "quickSetup" | "careerHome" | "careerTables" | "quickGame" | "careerGame" | "careerSummary"
  // Start at initialRoute so returning from the leaderboard (which remounts
  // GameRoot) lands the player back where they were — Home or Career.
  const [route, setRoute] = useState(initialRoute || "home");
  // Records which screen opened a legal/support page, so Back returns there.
  const [legalReturn, setLegalReturn] = useState("profile");
  const openLegal = (page, from) => { setLegalReturn(from); setRoute(page); };
  // Records which screen opened Settings so Back returns there (Home or Career).
  const [settingsReturn, setSettingsReturn] = useState("home");
  const openSettings = (from) => { setSettingsReturn(from); setRoute("settings"); };
  const [cfg, setCfg] = useState(null);                    // Game cfg for either mode
  const [pendingSummary, setPendingSummary] = useState(null); // { result, oldBankroll, newBankroll }
  // Queue of achievements unlocked but not yet shown as a toast.
  const [achQueue, setAchQueue] = useState([]);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // K4 — CRASH/LEAVE RECOVERY (runs once on launch).
  // If a live-session record survived (app closed without a clean ending),
  // credit those seat chips back to the bankroll exactly once, then clear the
  // record. Guarded by a ref so React strict-mode double-invoke can't double
  // credit, and we clear the record BEFORE crediting so a reload mid-credit
  // can't replay it. No stats/XP are recorded for a recovered crash.
  const recoveryDoneRef = useRef(false);
  useEffect(() => {
    if (recoveryDoneRef.current) return;
    recoveryDoneRef.current = true;
    if (isGuest) { clearLiveSession(); return; }   // guests have no bankroll to credit
    const rec = readLiveSession();
    if (!rec) return;
    const chips = Math.max(0, Math.floor(rec.seatChips || 0));
    clearLiveSession();                            // delete FIRST — can't replay
    if (chips > 0) {
      setCareer(c => c ? { ...c, bankroll: (c.bankroll || 0) + chips } : c);
    }
  }, [isGuest, setCareer]);

  // ── Achievement event handler ────────────────────────────
  // Central entry point: gameplay and career flow call emitAchievement(event,
  // payload). It runs the progress engine, persists progress + unlocks into
  // the career (which auto-syncs to Firestore), and queues popups.
  const emitAchievement = useCallback((eventName, payload) => {
    setCareer(c => {
      if (!c) return c;
      const { progress, unlocked, newlyUnlocked } = applyAchievementEvent(c, eventName, payload || {});
      let bankroll = c.bankroll;
      if (newlyUnlocked.length) {
        // Attach each achievement's coin reward, queue the toasts, and add
        // the total to the bankroll. Only just-unlocked achievements appear
        // here, so rewards are paid exactly once (going-forward only —
        // previously-earned achievements never re-trigger).
        const withRewards = newlyUnlocked.map(a => ({ ...a, coinReward: achievementCoinReward(a) }));
        const totalCoins = withRewards.reduce((s, a) => s + (a.coinReward || 0), 0);
        bankroll = (c.bankroll || 0) + totalCoins;
        setAchQueue(q => [...q, ...withRewards]);
        playSound("achievement");
        haptic("achievement");
      }
      return { ...c, bankroll, achievementProgress: progress, achievements: unlocked };
    });
  }, [setCareer]);
  const dismissAchToast = useCallback((id) => {
    setAchQueue(q => q.filter(a => a.id !== id));
  }, []);

  // ── Unlock reward popup ──────────────────────────────────
  // When the career level has crossed a milestone (4/9/16/25) that hasn't
  // been acknowledged, surface the reward popup. `shownUnlocks` on the career
  // records which have been seen so it only ever shows once.
  const pendingUnlock = (() => {
    if (!career) return null;
    const shown = career.shownUnlocks || [];
    const due = milestonesForLevel(career.level).filter(m => !shown.includes(m));
    return due.length ? due[0] : null;
  })();
  const dismissUnlock = (milestone) => {
    setCareer(c => ({ ...c, shownUnlocks: [...(c.shownUnlocks || []), milestone] }));
  };

  // ── Career flow ─────────────────────────────────────────
  const enterCareer = () => {
    // Career Mode needs an account (cloud save + leaderboard). A guest is
    // routed to the sign-in prompt instead.
    if (isGuest) { onRequireSignIn?.(); return; }
    // First entry to Career also triggers the one-time tutorial.
    onTutorialTrigger?.();
    if (!career) setCareer(createDefaultCareer(displayName));
    setRoute("careerHome");
    emitAchievement(EVENTS.CAREER_STARTED, {});
  };
  const handleClaimDaily = () => setCareer(c => claimDaily(c));
  const handleResetCareer = () => {
    if (typeof window !== "undefined" && !window.confirm("Reset your career? Your chip stack and stats will be wiped.")) return;
    setCareer(createDefaultCareer(displayName));
  };
  const startCareerTable = (table) => {
    // Deduct buy-in immediately so it's tracked even if app reloads mid-session.
    setCareer(c => ({ ...c, bankroll: c.bankroll - table.buyIn }));
    // K4: open a live-session record. Seat chips start at the buy-in; this is
    // updated at stable moments and cleared on any normal ending. If the app
    // dies before that, launch recovery credits these chips back.
    writeLiveSession({ inProgress: true, tableId: table.id, tableName: table.name, buyIn: table.buyIn, seatChips: table.buyIn });
    const botNames = pickCareerRivals(table);
    setCfg({
      mode: "career",
      tableId: table.id,
      careerSession: { tableName: table.name, buyIn: table.buyIn },
      nH: 1,
      nB: table.bots,
      chips: table.buyIn,
      ante: computeAnte(table.buyIn),
      // Replenish tops up an emptied pot. Kept well under the buy-in (~35%) so
      // a replenish never busts everyone (the old bug: replenish > stack).
      replenishAmount: Math.max(1, Math.round(table.buyIn * 0.35)),
      denoms: [1, 5, 10, 25, 50, 100, 500].filter(d => d <= table.buyIn),
      names: [career?.playerName || displayName || "Player"],
      botNames,
      orientation: "portrait",
      hintsDefault: true,
      // Each career table has its own look — felt, card back and chips get
      // richer as the tables climb. Reuses the Quick Play cosmetic machinery.
      qp: {
        tableThemeId: table.themeId,
        cardBackId: table.cardBackId,
        chipSetId: table.chipSetId,
        avatarId: null,
      },
    });
    setRoute("careerGame");
  };
  const onCareerComplete = (result) => {
    setCareer(prev => {
      const old = prev.bankroll;
      const oldLevel = getLevelFromXP(prev.xp);
      const merged = applyCareerSession(prev, result);
      const newLevel = getLevelFromXP(merged.xp);
      setPendingSummary({ result, oldBankroll: old, newBankroll: merged.bankroll, oldLevel, newLevel });
      return merged;
    });
    setRoute("careerSummary");
    setCfg(null);
    // Achievement events from a finished career session.
    emitAchievement(EVENTS.SESSION_COMPLETED, {});
    emitAchievement(EVENTS.LEADERBOARD_POSTED, {}); // career sessions post to the leaderboard
    // Level milestones — emit the post-session level (progressKind:"max").
    setCareer(c => {
      if (c) {
        emitAchievement(EVENTS.CAREER_LEVEL_REACHED, { value: c.level });
        emitAchievement(EVENTS.WIN_STREAK, { value: c.bestStreak || 0 });
      }
      return c;
    });
  };

  // ── Quick play flow ─────────────────────────────────────
  const startQuick = (config) => {
    setCfg({ ...config, mode: "quick" });
    setRoute("quickGame");
  };
  const exitQuickGame = () => { setCfg(null); setRoute("home"); };

  // ── Router ──────────────────────────────────────────────
  // Wrapped in an IIFE so the achievement toast overlay (below) can render
  // on top of whatever screen is active, without touching every route.
  const screen = (() => {
  if (route === "tutorial") return <Tutorial onClose={() => setRoute("home")} />;

  if (route === "quickSetup") return (
    <Setup
      onStart={startQuick}
      onShowTutorial={() => setRoute("tutorial")}
      onBack={() => setRoute("home")}
      careerLevel={career?.level || 1}
      displayName={displayName}
    />
  );

  if (route === "quickGame" && cfg) return (
    <Game key={cfg ? JSON.stringify(cfg) : "g"} cfg={cfg} onExit={exitQuickGame} onAchievement={emitAchievement} />
  );

  if (route === "careerHome" && career) return (
    <>
      <CareerHome
        career={career}
        onPlay={() => setRoute("careerTables")}
        onClaimDaily={handleClaimDaily}
        onBack={() => setRoute("home")}
        onLeaderboard={() => onShowLeaderboard("careerHome")}
        onSettings={() => openSettings("careerHome")}
        onProfile={() => setRoute("profile")}
      />
      {pendingUnlock && (
        <UnlockRewardPopup milestone={pendingUnlock} onClose={() => dismissUnlock(pendingUnlock)} />
      )}
    </>
  );

  if (route === "profile" && career) return (
    <ProfileScreen
      career={career}
      onRename={(newName) => setCareer(c => ({ ...c, playerName: newName }))}
      onBack={() => setRoute("careerHome")}
      onOpenLegal={(page) => openLegal(page, "profile")}
      onOpenAchievements={() => setRoute("achievements")}
    />
  );

  // Legal / about screens — `legalReturn` records which screen opened them
  // so Back goes to the right place (Profile or Settings).
  if (route === "privacy")          return <PrivacyPolicy   onBack={() => setRoute(legalReturn)} />;
  if (route === "terms")            return <TermsOfUse      onBack={() => setRoute(legalReturn)} />;
  if (route === "accountDeletion")  return <AccountDeletion onBack={() => setRoute(legalReturn)} />;
  if (route === "support")          return <SupportPage     onBack={() => setRoute(legalReturn)} />;
  if (route === "achievements" && career) return <AchievementsScreen career={career} onBack={() => setRoute("profile")} />;
  if (route === "settings") return (
    <SettingsScreen
      career={career}
      isGuest={isGuest}
      onBack={() => setRoute(settingsReturn)}
      onResetCareer={handleResetCareer}
      onOpenLegal={(page) => openLegal(page, "settings")}
      onSignOut={onSignOut}
      onRequireSignIn={onRequireSignIn}
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
      onAchievement={emitAchievement}
    />
  );

  if (route === "careerSummary" && pendingSummary) return (
    <CareerSessionSummary
      result={pendingSummary.result}
      oldBankroll={pendingSummary.oldBankroll}
      newBankroll={pendingSummary.newBankroll}
      oldLevel={pendingSummary.oldLevel}
      newLevel={pendingSummary.newLevel}
      onContinue={() => { setPendingSummary(null); setRoute("careerHome"); }}
    />
  );

  // Default: home
  return (
    <HomeScreen
      hasCareer={!!career}
      isGuest={isGuest}
      career={career}
      onCareer={enterCareer}
      onQuickPlay={() => { onTutorialTrigger?.(); setRoute("quickSetup"); }}
      onTutorial={() => setRoute("tutorial")}
      onSettings={() => openSettings("home")}
      onSignOut={onSignOut}
      onSignIn={onRequireSignIn}
      onLeaderboard={() => onShowLeaderboard("home")}
    />
  );
  })();

  // Active screen + the global achievement toast overlay.
  return (
    <>
      {screen}
      <AchievementToasts queue={achQueue} onDismiss={dismissAchToast} />
    </>
  );
}
