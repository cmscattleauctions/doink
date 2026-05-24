// ═══════════════════════════════════════════════════════════
// FIREBASE SETUP
// ───────────────────────────────────────────────────────────
// 1. Go to https://console.firebase.google.com and create a project.
// 2. In the project, click the web icon (</>) to register a web app.
// 3. Firebase shows you a `firebaseConfig` object. Copy its values into
//    the object below, replacing every "REPLACE_ME".
// 4. In the Firebase console:
//      • Build → Authentication → Get Started → enable "Google".
//      • Build → Firestore Database → Create database → Start in
//        production mode → pick a location.
// 5. Paste the security rules from SETUP.md into Firestore → Rules.
//
// These values are NOT secret — they're safe to commit and ship in the
// client bundle. Firestore security rules are what actually protect data.
// ═══════════════════════════════════════════════════════════

import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDitdhiNXB_NyMOkknKTsgIgJ3TOnLaQKQ",
  authDomain: "doink-2c46c.firebaseapp.com",
  projectId: "doink-2c46c",
  storageBucket: "doink-2c46c.firebasestorage.app",
  messagingSenderId: "937252559926",
  appId: "1:937252559926:web:faa5501c1766acd74e8c97",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
