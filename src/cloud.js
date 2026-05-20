// ═══════════════════════════════════════════════════════════
// CLOUD STORAGE — career persistence + leaderboard via Firestore
// ───────────────────────────────────────────────────────────
// Data model (two collections):
//
//   careers/{uid}      — one document per player, holds their career object.
//                        Only that player can read/write their own doc.
//
//   leaderboard/{uid}  — one public document per player with just the
//                        ranking-relevant numbers. Everyone can read it;
//                        only the owner can write their own row.
//
// The leaderboard row is written every time the career is saved, so the
// standings stay current without any extra bookkeeping.
// ═══════════════════════════════════════════════════════════

import { doc, getDoc, setDoc, collection, getDocs } from "firebase/firestore";
import { db } from "./firebase.js";

// ── Career: load ────────────────────────────────────────────
// Returns the stored career object, or null if the player has none yet.
export async function loadCareerCloud(uid) {
  try {
    const snap = await getDoc(doc(db, "careers", uid));
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.error("loadCareerCloud failed:", e);
    return null;
  }
}

// ── Career: save ────────────────────────────────────────────
// Writes the full career doc AND refreshes the player's leaderboard row.
export async function saveCareerCloud(uid, career) {
  if (!uid || !career) return;
  try {
    await setDoc(doc(db, "careers", uid), career);
    // Public leaderboard row — only the four ranked numbers + a name.
    await setDoc(doc(db, "leaderboard", uid), {
      uid,
      name: career.playerName || "Player",
      bankroll: career.bankroll || 0,
      totalCareerProfit: career.totalCareerProfit || 0,
      biggestPotWon: career.biggestPotWon || 0,
      biggestDoinkLoss: career.biggestDoinkLoss || 0,
      level: career.level || 1,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.error("saveCareerCloud failed:", e);
  }
}

// ── Leaderboard: load all rows ──────────────────────────────
// Returns an array of leaderboard rows. The UI sorts them per tab.
export async function loadLeaderboard() {
  try {
    const snap = await getDocs(collection(db, "leaderboard"));
    const rows = [];
    snap.forEach(d => rows.push(d.data()));
    return rows;
  } catch (e) {
    console.error("loadLeaderboard failed:", e);
    return [];
  }
}
