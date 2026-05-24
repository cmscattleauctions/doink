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
  apiKey: "REPLACE_ME",
  authDomain: "REPLACE_ME.firebaseapp.com",
  projectId: "REPLACE_ME",
  storageBucket: "REPLACE_ME.appspot.com",
  messagingSenderId: "REPLACE_ME",
  appId: "REPLACE_ME",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
