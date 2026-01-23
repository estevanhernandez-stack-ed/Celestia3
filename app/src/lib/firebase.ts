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
};

// Initialize Firebase
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize App Check
if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY && process.env.NEXT_PUBLIC_DISABLE_APP_CHECK !== 'true') {
    try {
        const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
        console.log(`🛡️ [AppCheck] Detected Key: ${siteKey.slice(0, 6)}...${siteKey.slice(-4)}`);
        
        initializeAppCheck(app, {
            provider: new ReCaptchaEnterpriseProvider(siteKey),
            isTokenAutoRefreshEnabled: true
        });
        console.log("🛡️ [AppCheck] Initialization Successful");
    } catch (err: unknown) {
        const appCheckError = err as { code?: string; message?: string };
        if (appCheckError.code === 'appCheck/already-initialized') {
            console.log("🛡️ [AppCheck] Already initialized, skipping.");
        } else {
            console.error("❌ [AppCheck] Initialization Failed:", appCheckError.code, appCheckError.message);
        }
    }
} else {
    console.warn("🛡️ [AppCheck] App Check is disabled or missing Site Key.");
}
