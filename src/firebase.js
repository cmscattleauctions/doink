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
