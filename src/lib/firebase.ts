import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase (guard against missing config during build)
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

const app = getApps().length === 0 
    ? (isConfigValid ? initializeApp(firebaseConfig) : undefined) 
    : getApps()[0];

if (!isConfigValid && typeof window !== "undefined") {
  console.warn("⚠️ [Firebase] Configuration is missing or invalid. Check environment variables.");
}

// Initialize App Check (Client-side only)
if (typeof window !== "undefined") {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  if (siteKey) {
    try {
      initializeAppCheck(app, {
          provider: new ReCaptchaEnterpriseProvider(siteKey),
          isTokenAutoRefreshEnabled: true
      });
      console.log("🛡️ [AppCheck] Enterprise Handshake sequence started.");
    } catch (e) {
      console.error("🛡️ [AppCheck] Initialization failed:", e);
    }
  } else {
    console.warn("🛡️ [AppCheck] Site Key missing, skipping initialization.");
  }
}

import { getFunctions } from "firebase/functions";

export const db = app ? getFirestore(app) : undefined as unknown as ReturnType<typeof getFirestore>;
export const auth = app ? getAuth(app) : undefined as unknown as ReturnType<typeof getAuth>;
export const functions = app ? getFunctions(app) : undefined as unknown as ReturnType<typeof getFunctions>;
