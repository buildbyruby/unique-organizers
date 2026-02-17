import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// --- CLIENT CONFIGURATION ---
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// --- SAFETY INITIALIZATION ---
// We define these variables outside the try-catch block
let app;
let db;
let auth;

try {
  // Check if API Key exists before trying to initialize
  // This prevents the "auth/invalid-api-key" crash if keys are missing
  if (firebaseConfig.apiKey) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    // If no keys, we leave them undefined so the app doesn't crash on load
    console.warn("⚠️ Firebase Client Keys missing. Skipping initialization to prevent crash.");
  }
} catch (error) {
  console.warn("⚠️ Firebase Initialization paused:", error);
}

// Exporting them (they might be undefined, but the app won't crash on startup)
export { app, db, auth };