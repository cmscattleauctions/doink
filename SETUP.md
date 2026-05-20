# DOINK — Setup & Deployment Guide

This is the cloud version of DOINK: Google sign-in, career progress saved to
the cloud, and a four-tab leaderboard shared across all your friends.

The whole thing is a static site + Firebase. No server to run. Free at your
scale (15–20 players is far inside Firebase's free tier).

There are three one-time jobs:
  A. Set up Firebase (the backend)
  B. Push the code to GitHub
  C. Connect Netlify (the hosting)

Total time: about 20–30 minutes, mostly clicking through consoles.

---

## A. Firebase setup (~10 min)

### A1. Create the project
1. Go to <https://console.firebase.google.com>.
2. Click **Add project**. Name it `doink` (or anything). You can disable
   Google Analytics — not needed.

### A2. Register a web app
1. On the project overview page, click the **web icon** `</>`.
2. Give it a nickname (`doink-web`). You do NOT need Firebase Hosting here —
   Netlify handles hosting.
3. Firebase shows a `firebaseConfig` object that looks like:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "doink-xxxx.firebaseapp.com",
     projectId: "doink-xxxx",
     storageBucket: "doink-xxxx.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234:web:abcd",
   };
   ```
4. Open **`src/firebase.js`** in this project and paste those six values in,
   replacing every `REPLACE_ME`.
   (These values are not secret — they're meant to ship in the browser.
   Firestore security rules are what actually protect your data.)

### A3. Enable Google sign-in
1. In the Firebase console: **Build → Authentication → Get started**.
2. On the **Sign-in method** tab, click **Google**, toggle **Enable**,
   pick a support email, and **Save**.

### A4. Create the Firestore database
1. **Build → Firestore Database → Create database**.
2. Choose **Start in production mode**, pick a location near your friends,
   and create it.
3. Go to the **Rules** tab, replace everything with the rules below, and
   click **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {

       // Each player owns their career document.
       match /careers/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }

       // Leaderboard rows: anyone signed in can read; you may only
       // write your own row.
       match /leaderboard/{uid} {
         allow read: if request.auth != null;
         allow write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```

### A5. Authorize your live domain (do this AFTER step C)
Once Netlify gives you a URL (e.g. `doink-yourname.netlify.app`):
1. Firebase console → **Authentication → Settings → Authorized domains**.
2. Click **Add domain** and paste your Netlify domain.
   (Google sign-in is blocked on domains not in this list. `localhost` is
   already authorized for local development.)

---

## B. Push to GitHub (~5 min)

1. Create a new repository on <https://github.com> (e.g. `doink`).
   It can be private — that's fine.
2. In a terminal, from this project folder:
   ```bash
   git init
   git add .
   git commit -m "DOINK cloud version"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/doink.git
   git push -u origin main
   ```

---

## C. Connect Netlify (~5 min)

1. Go to <https://app.netlify.com> and sign in (you can use your GitHub
   account).
2. **Add new site → Import an existing project → GitHub**, and pick your
   `doink` repo.
3. Netlify reads `netlify.toml` automatically, so the build settings are
   already correct:
     - Build command: `npm run build`
     - Publish directory: `dist`
   Just click **Deploy**.
4. After ~1 minute you get a live URL like `random-name-12345.netlify.app`.
   You can rename it under **Site settings → Change site name**.
5. **Go back and do step A5** with this URL, or Google sign-in will fail.

From now on, every `git push` to `main` auto-deploys.

---

## Running locally

```bash
npm install
npm run dev
```

Opens at <http://localhost:5173>. `localhost` is pre-authorized in Firebase,
so sign-in works locally without any extra steps.

---

## How it all fits together

| File                | Role                                                            |
|---------------------|-----------------------------------------------------------------|
| `src/Game.jsx`      | The entire game — gameplay, bots, career mode. Logic unchanged. |
| `src/App.jsx`       | Auth gate, loads/saves career to the cloud, routing.            |
| `src/firebase.js`   | Your Firebase keys (you fill these in).                         |
| `src/cloud.js`      | Reads/writes career + leaderboard rows in Firestore.            |
| `src/LoginScreen.jsx` | Google sign-in screen.                                        |
| `src/Leaderboard.jsx` | Four-tab leaderboard.                                         |

**Career saving:** every change to a player's career is debounced (0.6s) and
written to `careers/{uid}` in Firestore. The same write refreshes their public
`leaderboard/{uid}` row, so standings are always current.

**Leaderboard tabs:** Bankroll · Total Profit · Biggest Win · Biggest Doink.
All four read from the same leaderboard rows; the screen just re-sorts.

**Fresh start:** there is no migration from the old localStorage version —
every player begins with a fresh $500 career the first time they sign in.

---

## Costs

Firebase's free "Spark" plan covers this easily for 15–20 players:
50K Firestore reads/day and 20K writes/day. A heavy career session is a
handful of writes. Netlify's free tier covers the hosting. You should not
see a bill.
