// ═══════════════════════════════════════════════════════════
// ACHIEVEMENTS — definitions + progress engine
// ───────────────────────────────────────────────────────────
// Central, data-driven achievement system. Game code emits simple events
// (see EVENTS below); `applyEvent` updates a progress object and returns any
// newly-unlocked achievements. Progress lives inside the career object under
// `career.achievementProgress` and `career.achievements`, so it rides the
// existing Firestore cloud-save with no extra setup.
//
// Adding an achievement later = add one entry to ACHIEVEMENTS. Nothing else.
// ═══════════════════════════════════════════════════════════

// Event names the game emits. Kept as plain strings for simplicity.
export const EVENTS = {
  HAND_PLAYED: "HAND_PLAYED",
  HAND_WON: "HAND_WON",
  SESSION_COMPLETED: "SESSION_COMPLETED",
  BET_PLACED: "BET_PLACED",
  BET_WON: "BET_WON",
  BIG_POT_WON: "BIG_POT_WON",
  BLIND_BET_PLACED: "BLIND_BET_PLACED",
  BLIND_BET_WON: "BLIND_BET_WON",
  BLIND_BET_LOST: "BLIND_BET_LOST",
  HAND_BOUGHT: "HAND_BOUGHT",
  HAND_BOUGHT_WON: "HAND_BOUGHT_WON",
  HAND_SOLD: "HAND_SOLD",
  COUNTER_RECEIVED: "COUNTER_RECEIVED",
  COUNTER_ACCEPTED: "COUNTER_ACCEPTED",
  DOINK_TRIGGERED: "DOINK_TRIGGERED",
  DOINK_WON: "DOINK_WON",
  DOINK_LOST: "DOINK_LOST",
  MYTHICAL_SPLIT: "MYTHICAL_SPLIT",
  MYTHICAL_WON: "MYTHICAL_WON",
  POT_REPLENISHED: "POT_REPLENISHED",
  CAREER_STARTED: "CAREER_STARTED",
  CAREER_LEVEL_REACHED: "CAREER_LEVEL_REACHED",
  CAREER_HAND_PLAYED: "CAREER_HAND_PLAYED",
  UNLOCK_EARNED: "UNLOCK_EARNED",
  BOT_BEATEN: "BOT_BEATEN",
  WIN_STREAK: "WIN_STREAK",
  LEADERBOARD_POSTED: "LEADERBOARD_POSTED",
};

// Each rarity tier carries a coin reward, paid once when the achievement is
// unlocked. Values scale with difficulty but are deliberately modest — a
// nice boost, not a way to skip earning your way up the tables.
export const RARITY = {
  common:    { label: "Common",    color: "#9AA0A6", coins: 25 },
  uncommon:  { label: "Uncommon",  color: "#5FB85F", coins: 60 },
  rare:      { label: "Rare",      color: "#4A90D9", coins: 150 },
  epic:      { label: "Epic",      color: "#A86FD4", coins: 350 },
  legendary: { label: "Legendary", color: "#F0C96A", coins: 750 },
};

// Coin reward for a given achievement (by its rarity tier).
export function achievementCoinReward(ach) {
  if (!ach) return 0;
  return RARITY[ach.rarity]?.coins || 0;
}

// ── Achievement definitions ─────────────────────────────────
// Each: id, title, description, category, rarity, target (progress needed),
// event (which event increments it), and optional `hidden`, `meta` (a custom
// matcher), `iconType` (drives the badge glyph).
export const ACHIEVEMENTS = [
  // Getting Started
  { id:"first_hand",     title:"First Hand",        desc:"Play your first hand.",            category:"Getting Started", rarity:"common", target:1,   event:EVENTS.HAND_PLAYED,   iconType:"card" },
  { id:"first_win",      title:"First Win",         desc:"Win your first hand.",             category:"Getting Started", rarity:"common", target:1,   event:EVENTS.HAND_WON,      iconType:"trophy" },
  { id:"first_session",  title:"First Session",     desc:"Complete your first full session.",category:"Getting Started", rarity:"common", target:1,   event:EVENTS.SESSION_COMPLETED, iconType:"flag" },
  { id:"learning_table", title:"Learning the Table",desc:"Play 10 hands.",                   category:"Getting Started", rarity:"common", target:10,  event:EVENTS.HAND_PLAYED,   iconType:"card" },

  // Betting
  { id:"put_on_table",   title:"Put It on the Table",desc:"Place your first bet.",           category:"Betting", rarity:"common",   target:1,   event:EVENTS.BET_PLACED, iconType:"chip" },
  { id:"pressure_play",  title:"Pressure Play",      desc:"Win a hand after betting.",       category:"Betting", rarity:"common",   target:1,   event:EVENTS.BET_WON,    iconType:"chip" },
  { id:"table_regular",  title:"Table Regular",      desc:"Place 100 total bets.",           category:"Betting", rarity:"rare",     target:100, event:EVENTS.BET_PLACED, iconType:"chip" },
  { id:"big_swing",      title:"Big Swing",          desc:"Win a pot of 200 or more chips.",                category:"Betting", rarity:"epic",     target:1,   event:EVENTS.BIG_POT_WON,iconType:"star" },

  // Blind Bets
  { id:"blind_faith",    title:"Blind Faith",        desc:"Win a hand after a blind bet.",   category:"Blind Bets", rarity:"uncommon", target:1,  event:EVENTS.BLIND_BET_WON,    iconType:"eye" },
  { id:"blind_pain",     title:"Blind Pain",         desc:"Lose after placing a blind bet.", category:"Blind Bets", rarity:"common",   target:1,  event:EVENTS.BLIND_BET_LOST,   iconType:"eye" },
  { id:"blind_regular",  title:"Blind Regular",      desc:"Place 25 blind bets.",            category:"Blind Bets", rarity:"rare",     target:25, event:EVENTS.BLIND_BET_PLACED, iconType:"eye" },
  { id:"didnt_look",     title:"Didn't Need to Look",desc:"Win 5 blind-bet hands.",          category:"Blind Bets", rarity:"rare",     target:5,  event:EVENTS.BLIND_BET_WON,    iconType:"eye" },

  // Hand Buying
  { id:"first_purchase", disabled:true, title:"First Purchase",     desc:"Buy another player's hand.",      category:"Hand Buying", rarity:"common",   target:1,  event:EVENTS.HAND_BOUGHT,     iconType:"handshake" },
  { id:"bought_right", disabled:true,   title:"Bought Right",       desc:"Buy a hand and win the round.",   category:"Hand Buying", rarity:"uncommon", target:1,  event:EVENTS.HAND_BOUGHT_WON, iconType:"handshake" },
  { id:"market_maker", disabled:true,   title:"Market Maker",       desc:"Buy 25 hands.",                   category:"Hand Buying", rarity:"epic",     target:25, event:EVENTS.HAND_BOUGHT,     iconType:"handshake" },

  // Hand Selling
  { id:"first_sale", disabled:true,     title:"First Sale",         desc:"Sell your hand.",                 category:"Hand Selling", rarity:"common",   target:1,  event:EVENTS.HAND_SOLD, iconType:"tag" },
  { id:"dealers_choice", disabled:true, title:"Dealer's Choice",    desc:"Sell 25 hands.",                  category:"Hand Selling", rarity:"epic",     target:25, event:EVENTS.HAND_SOLD, iconType:"tag" },

  // Counters
  { id:"countered", disabled:true,      title:"Countered",          desc:"Receive your first counteroffer.",category:"Counters", rarity:"common",   target:1,  event:EVENTS.COUNTER_RECEIVED, iconType:"scale" },
  { id:"deal_maker", disabled:true,     title:"Deal Maker",         desc:"Accept a counteroffer.",          category:"Counters", rarity:"uncommon", target:1,  event:EVENTS.COUNTER_ACCEPTED, iconType:"scale" },
  { id:"negotiator", disabled:true,     title:"Negotiator",         desc:"Complete 25 counteroffer interactions.",category:"Counters", rarity:"epic", target:25, event:EVENTS.COUNTER_RECEIVED, iconType:"scale" },

  // DOINK
  { id:"first_doink",    title:"First DOINK",        desc:"Trigger your first DOINK moment.",category:"DOINK Moments", rarity:"uncommon", target:1,  event:EVENTS.DOINK_TRIGGERED, iconType:"doink" },
  { id:"got_doinked",    title:"Got DOINKED",        desc:"Lose from a DOINK event.",        category:"DOINK Moments", rarity:"common",   target:1,  event:EVENTS.DOINK_LOST,      iconType:"doink" },
  { id:"doinked_them",   title:"DOINKed Them",       desc:"Win from a DOINK event.",         category:"DOINK Moments", rarity:"rare",     target:1,  event:EVENTS.DOINK_WON,       iconType:"doink" },
  { id:"doink_veteran",  title:"DOINK Veteran",      desc:"See 25 DOINK events.",            category:"DOINK Moments", rarity:"epic",     target:25, event:EVENTS.DOINK_TRIGGERED, iconType:"doink" },

  // Mythical Split
  { id:"mythical_moment",title:"Mythical Moment",    desc:"Trigger your first Mythical Split.",category:"Mythical Split", rarity:"rare",   target:1,  event:EVENTS.MYTHICAL_SPLIT, iconType:"split" },
  { id:"split_decision", title:"Split Decision",     desc:"Win after a Mythical Split.",     category:"Mythical Split", rarity:"epic",   target:1,  event:EVENTS.MYTHICAL_WON,   iconType:"split" },
  { id:"no_way",         title:"No Way That Happened",desc:"Witness 5 Mythical Splits.",     category:"Mythical Split", rarity:"legendary", target:5, event:EVENTS.MYTHICAL_SPLIT, iconType:"split" },

  // Replenishment
  { id:"table_refill",   title:"Table Refill",       desc:"Experience your first pot replenish.",category:"Replenishment", rarity:"common", target:1,  event:EVENTS.POT_REPLENISHED, iconType:"replenish" },
  { id:"replenish_reg",  title:"Replenish Regular",  desc:"See 25 pot replenishes.",         category:"Replenishment", rarity:"rare",   target:25, event:EVENTS.POT_REPLENISHED, iconType:"replenish" },

  // Career Mode
  { id:"career_started", title:"Career Started",     desc:"Start career mode.",              category:"Career Mode", rarity:"common",   target:1,   event:EVENTS.CAREER_STARTED, iconType:"flag" },
  { id:"moving_up",      title:"Moving Up",          desc:"Reach level 2.",                  category:"Career Mode", rarity:"common",   target:2,   event:EVENTS.CAREER_LEVEL_REACHED, iconType:"chevron", progressKind:"max" },
  { id:"table_climber",  title:"Table Climber",      desc:"Reach level 5.",                  category:"Career Mode", rarity:"uncommon", target:5,   event:EVENTS.CAREER_LEVEL_REACHED, iconType:"chevron", progressKind:"max" },
  { id:"main_room",      title:"Main Room",          desc:"Reach level 10.",                 category:"Career Mode", rarity:"rare",     target:10,  event:EVENTS.CAREER_LEVEL_REACHED, iconType:"chevron", progressKind:"max" },
  { id:"career_grinder", title:"Career Grinder",     desc:"Play 100 career hands.",          category:"Career Mode", rarity:"epic",     target:100, event:EVENTS.CAREER_HAND_PLAYED, iconType:"card" },
  { id:"unlock_collect", title:"Unlock Collector",   desc:"Unlock 10 career items.",         category:"Career Mode", rarity:"rare",     target:10,  event:EVENTS.UNLOCK_EARNED, iconType:"key", progressKind:"max" },

  // Streaks & Comebacks
  { id:"hot_seat",       title:"Hot Seat",           desc:"Win 3 hands in a row.",           category:"Streaks", rarity:"uncommon", target:3,  event:EVENTS.WIN_STREAK, iconType:"flame", progressKind:"max" },
  { id:"ice_cold",       title:"Ice Cold",           desc:"Win 5 hands in a row.",           category:"Streaks", rarity:"rare",     target:5,  event:EVENTS.WIN_STREAK, iconType:"flame", progressKind:"max" },

  // Leaderboard
  { id:"on_the_board",   title:"On the Board",       desc:"Post your first leaderboard score.",category:"Leaderboard", rarity:"common", target:1, event:EVENTS.LEADERBOARD_POSTED, iconType:"trophy" },

  // Bot Rivals — secret/hidden until earned
  { id:"beat_dalton",   title:"Beat Dalton",   desc:"Beat Dalton in a session.",   category:"Bot Rivals", rarity:"uncommon", target:1, event:EVENTS.BOT_BEATEN, meta:{ bot:"Dalton" },   hidden:true, iconType:"medal" },
  { id:"beat_cody",     title:"Beat Cody",     desc:"Beat Cody in a session.",     category:"Bot Rivals", rarity:"uncommon", target:1, event:EVENTS.BOT_BEATEN, meta:{ bot:"Cody" },     hidden:true, iconType:"medal" },
  { id:"beat_jerry",    title:"Beat Jerry",    desc:"Beat Jerry in a session.",    category:"Bot Rivals", rarity:"uncommon", target:1, event:EVENTS.BOT_BEATEN, meta:{ bot:"Jerry" },    hidden:true, iconType:"medal" },
  { id:"beat_parker",   title:"Beat Parker",   desc:"Beat Parker in a session.",   category:"Bot Rivals", rarity:"uncommon", target:1, event:EVENTS.BOT_BEATEN, meta:{ bot:"Parker" },   hidden:true, iconType:"medal" },
  { id:"beat_emmanuel", title:"Beat Emmanuel", desc:"Beat Emmanuel in a session.", category:"Bot Rivals", rarity:"uncommon", target:1, event:EVENTS.BOT_BEATEN, meta:{ bot:"Emmanuel" }, hidden:true, iconType:"medal" },
];

// Active achievements = everything not `disabled`. Disabled achievements
// (e.g. hand-trading ones while that feature is hidden — J10/J12) are kept
// in ACHIEVEMENTS so they can be restored, but excluded from the list the
// player sees, the total count, and the unlock engine.
export const ACTIVE_ACHIEVEMENTS = ACHIEVEMENTS.filter(a => !a.disabled);

export const CATEGORIES = [...new Set(ACTIVE_ACHIEVEMENTS.map(a => a.category))];

// Look up by id
const BY_ID = Object.fromEntries(ACHIEVEMENTS.map(a => [a.id, a]));
export const achievementById = id => BY_ID[id];

// ── Progress engine ─────────────────────────────────────────
// State shape stored on the career:
//   achievementProgress: { [id]: number }   — current count
//   achievements:        [{ id, unlockedAt }]  — unlocked records
//
// applyEvent(state, event, payload) returns:
//   { progress, unlocked, newlyUnlocked }
// newlyUnlocked is the list of achievements that just crossed their target —
// the caller queues popups for these.

export function applyAchievementEvent(career, eventName, payload = {}) {
  const progress = { ...(career.achievementProgress || {}) };
  const unlockedList = [...(career.achievements || [])];
  const unlockedIds = new Set(unlockedList.map(a => a.id));
  const newlyUnlocked = [];

  for (const ach of ACTIVE_ACHIEVEMENTS) {
    if (ach.event !== eventName) continue;
    if (unlockedIds.has(ach.id)) continue;
    // meta matcher (e.g. specific bot name)
    if (ach.meta) {
      if (ach.meta.bot && payload.bot !== ach.meta.bot) continue;
    }
    const cur = progress[ach.id] || 0;
    let next;
    if (ach.progressKind === "max") {
      // payload.value is an absolute level/count; track the highest seen.
      next = Math.max(cur, payload.value || 0);
    } else {
      // counting events: increment by payload.amount (default 1)
      next = cur + (payload.amount || 1);
    }
    progress[ach.id] = next;
    if (next >= ach.target) {
      const record = { id: ach.id, unlockedAt: Date.now() };
      unlockedList.push(record);
      unlockedIds.add(ach.id);
      newlyUnlocked.push(ach);
    }
  }

  return { progress, unlocked: unlockedList, newlyUnlocked };
}

// Convenience: unlocked-count / total for the screen header.
export function achievementSummary(career) {
  const total = ACTIVE_ACHIEVEMENTS.length;
  const activeIds = new Set(ACTIVE_ACHIEVEMENTS.map(a => a.id));
  const unlocked = (career?.achievements || []).filter(a => activeIds.has(a.id)).length;
  return { unlocked, total };
}
