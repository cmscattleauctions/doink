// ═══════════════════════════════════════════════════════════
// LEGAL PAGES — Privacy Policy, Terms of Use, Account Deletion,
// Support. Rendered as in-app screens, reachable from the Profile
// screen. Reachable URLs (for store listings) once deployed:
//   /privacy   /terms   /account-deletion   /support
//
// All placeholders are filled with the current developer details.
// Update DEVELOPER / SUPPORT_EMAIL / EFFECTIVE_DATE below if they change.
// ═══════════════════════════════════════════════════════════

const DEVELOPER = "High Plains Games";
const SUPPORT_EMAIL = "jaytonhollis@gmail.com";
const EFFECTIVE_DATE = "May 21, 2026";
const DELETION_TIMEFRAME = "30 days";

// ── Shared layout ───────────────────────────────────────────
function LegalShell({ title, onBack, children }) {
  return (
    <div className="ios-scroll" style={{ background: "radial-gradient(ellipse at 50% 0%,#122A18,#080F0A 70%)", fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "calc(env(safe-area-inset-top) + 18px) 18px calc(48px + env(safe-area-inset-bottom))" }}>
        <div style={{ width: "100%", maxWidth: 560, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <button onClick={onBack} style={{
            padding: "8px 14px", borderRadius: 10,
            background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.16)",
            color: "rgba(245,237,216,0.78)", fontSize: "0.85rem", fontWeight: 500, cursor: "pointer",
          }}>← Back</button>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", color: "#D4A843", fontWeight: 700, letterSpacing: "0.03em" }}>{title}</div>
          <div style={{ width: 60 }} />
        </div>
        <div style={{
          width: "100%", maxWidth: 560,
          background: "rgba(255,255,255,0.03)", borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.08)", padding: "20px 20px",
        }}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Small typographic helpers for the legal copy
const H = ({ children }) => (
  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1rem", color: "#F0C96A", fontWeight: 700, margin: "20px 0 8px" }}>{children}</h2>
);
const P = ({ children }) => (
  <p style={{ fontSize: "0.86rem", lineHeight: 1.65, color: "rgba(245,237,216,0.78)", margin: "0 0 10px" }}>{children}</p>
);
const Meta = ({ children }) => (
  <p style={{ fontSize: "0.76rem", lineHeight: 1.6, color: "rgba(245,237,216,0.5)", margin: "0 0 4px" }}>{children}</p>
);
const LI = ({ children }) => (
  <li style={{ fontSize: "0.86rem", lineHeight: 1.6, color: "rgba(245,237,216,0.78)", marginBottom: 4 }}>{children}</li>
);
const UL = ({ children }) => (
  <ul style={{ margin: "0 0 10px", paddingLeft: 20 }}>{children}</ul>
);

// ── Privacy Policy ──────────────────────────────────────────
export function PrivacyPolicy({ onBack }) {
  return (
    <LegalShell title="Privacy Policy" onBack={onBack}>
      <Meta>Effective Date: {EFFECTIVE_DATE}</Meta>
      <Meta>Developer: {DEVELOPER}</Meta>
      <Meta>Contact: {SUPPORT_EMAIL}</Meta>

      <P>This Privacy Policy explains how Gapper collects, uses, stores, and protects information when you use the Gapper mobile app.</P>
      <P>Gapper is a fictional play-chip card strategy game. Gapper does not offer real-money gambling, cash-out, prizes, or anything with real-world monetary value.</P>
      <P>By using Gapper, you agree to the practices described in this Privacy Policy.</P>

      <H>1. Information We Collect</H>
      <P>Gapper may collect the following types of information.</P>
      <P><b>Account Information.</b> If you create an account or sign in, we may collect: email address, display name, user ID, authentication provider information (such as Google Sign-In or Sign in with Apple), and a profile image if provided by the sign-in provider.</P>
      <P><b>Game Data.</b> We may store game-related data including career mode progress, quick play settings, fictional chip balances, level progression, unlocks, table settings, leaderboard scores, game history or performance statistics, and app preferences.</P>
      <P><b>Device and Technical Information.</b> Gapper may collect basic technical information needed to operate, secure, and improve the app, such as device type, operating system, app version, error logs, crash reports, and general usage information. If analytics or crash-reporting tools are added, they may collect diagnostic information to help identify bugs and improve performance.</P>

      <H>2. How We Use Information</H>
      <P>We use information to create and manage user accounts, save game progress, sync progress across devices, display leaderboard rankings, provide app functionality, improve gameplay and performance, troubleshoot bugs, respond to support requests, protect against abuse or unauthorized access, and comply with applicable legal and platform requirements.</P>
      <P>We do not sell personal information.</P>

      <H>3. Account and Sign-In Information</H>
      <P>Gapper may use third-party authentication services such as Firebase Authentication, Google Sign-In, or Sign in with Apple. When you sign in through one of these services, Gapper may receive basic account information such as your email address, display name, and user ID. Your sign-in provider may also collect and process information according to its own privacy policy.</P>

      <H>4. Game Data and Leaderboards</H>
      <P>Gapper may store gameplay-related data so your progress can be saved and restored. If leaderboard features are enabled, your display name, score, level, fictional chip count, or other gameplay ranking information may be visible to other users.</P>
      <P>Do not use your full legal name or sensitive personal information as your display name if you do not want it shown publicly.</P>

      <H>5. Fictional Chips and No Real-Money Value</H>
      <P>Gapper uses fictional play chips only. Fictional chips, levels, unlocks, leaderboard scores, achievements, and other in-game items have no cash value, cannot be redeemed for money, cannot be exchanged for prizes, cannot be transferred outside the app, and do not represent real-money gambling activity.</P>

      <H>6. Third-Party Services</H>
      <P>Gapper may use third-party services to operate the app, including Firebase Authentication, Firebase Firestore or other Firebase database services, Google Sign-In, Sign in with Apple, and Firebase or Google diagnostic services if enabled. These services may process information according to their own privacy policies and terms.</P>

      <H>7. Data Sharing</H>
      <P>We do not sell your personal information. We may share limited information only when necessary to operate the app through service providers, provide authentication, storage, and leaderboard functionality, comply with legal obligations, protect the safety, integrity, or security of the app, and investigate abuse, fraud, cheating, or unauthorized activity.</P>

      <H>8. Data Retention</H>
      <P>We keep account and game data for as long as needed to provide Gapper's features. If you delete your account or request account deletion, we will delete or anonymize associated account data unless retention is required for legal, security, fraud-prevention, or legitimate operational reasons. Some backup copies or logs may remain for a limited time before being deleted through normal system processes.</P>

      <H>9. Account and Data Deletion</H>
      <P>You may request deletion of your Gapper account and associated data by contacting {SUPPORT_EMAIL} with the subject line "Gapper Account Deletion Request." Please include the email address associated with your Gapper account. We may ask for verification before deleting account data. Deletion requests will generally be processed within {DELETION_TIMEFRAME}.</P>

      <H>10. Children's Privacy</H>
      <P>Gapper is not intended for children. We do not knowingly collect personal information from children under the age required by applicable law. If you believe a child has provided personal information to Gapper, contact us at {SUPPORT_EMAIL} and we will take appropriate action.</P>

      <H>11. Security</H>
      <P>We use reasonable technical and organizational measures to protect user information. However, no method of transmission or storage is completely secure. You are responsible for keeping your account credentials secure and for using a safe sign-in method.</P>

      <H>12. Changes to This Privacy Policy</H>
      <P>We may update this Privacy Policy from time to time. If we make material changes, we may notify users through the app, store listing, or another appropriate method. The updated Privacy Policy will be effective when posted unless otherwise stated.</P>

      <H>13. Contact Us</H>
      <P>For privacy questions, support requests, or account deletion requests, contact {DEVELOPER} at {SUPPORT_EMAIL}.</P>
    </LegalShell>
  );
}

// ── Terms of Use ────────────────────────────────────────────
export function TermsOfUse({ onBack }) {
  return (
    <LegalShell title="Terms of Use" onBack={onBack}>
      <Meta>Effective Date: {EFFECTIVE_DATE}</Meta>
      <Meta>Developer: {DEVELOPER}</Meta>
      <Meta>Contact: {SUPPORT_EMAIL}</Meta>

      <P>These Terms of Use govern your use of the Gapper mobile app. By downloading, accessing, or using Gapper, you agree to these Terms. If you do not agree, do not use the app.</P>

      <H>1. About Gapper</H>
      <P>Gapper is a fictional play-chip card strategy game. The app may include Quick Play mode, Career mode, computer-controlled opponents, fictional chip balances, levels and progression, unlockable options, leaderboards, cloud saves, and customization features. Gapper is designed for entertainment only.</P>

      <H>2. Fictional Play-Chip Gameplay Only</H>
      <P>Gapper uses fictional play chips. Fictional chips, points, scores, levels, unlocks, achievements, rankings, and other in-game items have no real-world monetary value, cannot be redeemed for money, cannot be exchanged for prizes, cannot be sold, cannot be transferred outside the app, and do not represent ownership of any financial asset.</P>

      <H>3. No Real-Money Gambling</H>
      <P>Gapper is not a real-money gambling app. The app does not allow users to deposit real money for wagering, win real money, cash out fictional chips, redeem chips for prizes, participate in real-money contests, or exchange in-game items for anything of real-world value.</P>
      <P>Any words such as chips, bet, table, hand, stake, pot, or similar game terminology refer only to fictional gameplay mechanics.</P>

      <H>4. Accounts</H>
      <P>Some features may require an account. You may be able to sign in using services such as Google Sign-In, Firebase Authentication, or Sign in with Apple. You are responsible for keeping your account secure, using accurate information, not sharing account access with unauthorized users, and all activity that occurs under your account.</P>
      <P>We may suspend, restrict, or delete accounts that violate these Terms or harm the app experience for others.</P>

      <H>5. Game Progress, Chips, Unlocks, and Leaderboards</H>
      <P>Gapper may save your progress, fictional chip balance, unlocks, settings, and leaderboard information. We may modify, reset, remove, or adjust game data if needed to fix bugs, prevent cheating, correct technical errors, maintain game balance, protect app integrity, or comply with platform or legal requirements. Leaderboard rankings are for entertainment only and have no cash value.</P>

      <H>6. Computer-Controlled Opponents</H>
      <P>Gapper may include bots or computer-controlled players. Bots are part of the game experience and are not real users. Their behavior may be adjusted over time to improve balance, challenge, and gameplay quality.</P>

      <H>7. Prohibited Conduct</H>
      <P>You agree not to cheat, exploit bugs, or manipulate gameplay; attempt to alter fictional chip balances or leaderboard scores; use bots, scripts, automation, or unauthorized tools; reverse engineer, copy, modify, or tamper with the app; abuse, harass, or impersonate others; interfere with app servers, databases, authentication systems, or security systems; use the app for unlawful activity; or attempt to access another user's account or data.</P>
      <P>Violation of these rules may result in suspension, deletion of game data, removal from leaderboards, or account termination.</P>

      <H>8. App Updates and Availability</H>
      <P>We may update, modify, suspend, or discontinue any part of Gapper at any time. We do not guarantee that all features will always be available, error-free, or compatible with every device. Some features may require internet access.</P>

      <H>9. Intellectual Property</H>
      <P>Gapper, including its name, design, gameplay elements, artwork, text, graphics, code, branding, and other content, is owned by or licensed to the developer. You may not copy, distribute, modify, sell, or use Gapper content except as allowed by these Terms or applicable law.</P>

      <H>10. User Feedback</H>
      <P>If you provide ideas, suggestions, bug reports, or feedback, you allow us to use that feedback without restriction or compensation.</P>

      <H>11. Disclaimer</H>
      <P>Gapper is provided "as is" and "as available." We do not guarantee that the app will be uninterrupted, secure, bug-free, or free from data loss. To the maximum extent allowed by law, we disclaim warranties of merchantability, fitness for a particular purpose, and non-infringement.</P>

      <H>12. Limitation of Liability</H>
      <P>To the maximum extent allowed by law, the developer will not be liable for indirect, incidental, special, consequential, or punitive damages arising from your use of Gapper. Because Gapper does not offer real-money gambling, prizes, or cash-out, no user is entitled to payment, compensation, or redemption based on fictional chips, scores, or game progress.</P>

      <H>13. Account Deletion</H>
      <P>You may request deletion of your account and associated data by contacting {SUPPORT_EMAIL} with the subject line "Gapper Account Deletion Request." We may ask you to verify the account before deletion.</P>

      <H>14. Changes to These Terms</H>
      <P>We may update these Terms from time to time. If changes are material, we may notify users through the app, store listing, or another appropriate method. Continued use of Gapper after updated Terms are posted means you accept the updated Terms.</P>

      <H>15. Contact</H>
      <P>For questions about these Terms, contact {DEVELOPER} at {SUPPORT_EMAIL}.</P>
    </LegalShell>
  );
}

// ── Account Deletion ────────────────────────────────────────
export function AccountDeletion({ onBack }) {
  return (
    <LegalShell title="Account Deletion" onBack={onBack}>
      <P>You may request deletion of your Gapper account and associated data at any time.</P>
      <P>Gapper may use account sign-in through Firebase Authentication, Google Sign-In, or Sign in with Apple. Your account may be connected to saved game progress, fictional chip balances, leaderboard information, settings, and unlocks.</P>

      <H>What Will Be Deleted</H>
      <P>When your account deletion request is completed, we will delete or anonymize account-related data associated with your Gapper account, which may include:</P>
      <UL>
        <LI>Email address</LI>
        <LI>Display name</LI>
        <LI>User ID</LI>
        <LI>Saved game progress and career mode progress</LI>
        <LI>Fictional chip balance and unlocks</LI>
        <LI>App preferences</LI>
        <LI>Leaderboard entries, where technically possible</LI>
        <LI>Other stored account-related gameplay data</LI>
      </UL>

      <H>What May Be Retained</H>
      <P>Some information may be retained for a limited time if necessary for security, fraud prevention, abuse investigation, legal compliance, backup or system recovery processes, or aggregated/anonymized analytics. Any retained information will be handled according to the Gapper Privacy Policy.</P>

      <H>How to Request Account Deletion</H>
      <P>To request account deletion, email {SUPPORT_EMAIL} with the subject line "Gapper Account Deletion Request." Please include the email address used for your Gapper account, your display name if applicable, and a short statement that you want your Gapper account deleted.</P>
      <P>Example message: "I would like to delete my Gapper account and associated data. Account email: [your account email]. Display name: [your display name]."</P>

      <H>Verification</H>
      <P>To protect user accounts, we may ask you to verify that you own the account before deleting it. This may include confirming the email address associated with the account or responding from the account email address.</P>

      <H>Deletion Timeframe</H>
      <P>We will process verified deletion requests within {DELETION_TIMEFRAME}. Some backup copies may remain for a limited time before being removed through normal system processes.</P>

      <H>Contact</H>
      <P>For account deletion or privacy questions, contact {SUPPORT_EMAIL}.</P>
    </LegalShell>
  );
}

// ── Support ─────────────────────────────────────────────────
export function SupportPage({ onBack }) {
  return (
    <LegalShell title="Support" onBack={onBack}>
      <P>Need help with Gapper? Contact support at {SUPPORT_EMAIL}.</P>

      <H>Common Support Topics</H>
      <P>You can contact us for help with account access, sign-in issues, lost progress, leaderboard issues, bug reports, gameplay problems, account deletion requests, privacy questions, and general feedback.</P>

      <H>Account Deletion Requests</H>
      <P>To request account deletion, email {SUPPORT_EMAIL} with the subject line "Gapper Account Deletion Request." Include the email address connected to your Gapper account.</P>

      <H>Important Gameplay Notice</H>
      <P>Gapper is a fictional play-chip card strategy game. Gapper does not offer real-money gambling, cash-out, prizes, redeemable chips, or anything with real-world monetary value. All chips, scores, unlocks, and rankings are fictional and for entertainment only.</P>

      <H>Contact</H>
      <P>{DEVELOPER} — {SUPPORT_EMAIL}</P>
    </LegalShell>
  );
}
