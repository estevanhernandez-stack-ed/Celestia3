import { 
  doc, 
  getDoc, 
  setDoc,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { UserPreferences, DEFAULT_PREFERENCES } from "@/types/preferences";

interface StoredProfile {
  preferences: UserPreferences;
  lastUpdated: Timestamp;
}

export class UserProfileService {
  private static COLLECTION_NAME = "v3_users";
  private static LOCAL_STORAGE_KEY = "celestia_3_prefs";
  private static LOCAL_TIMESTAMP_KEY = "celestia_3_prefs_updated";

  /**
   * Save user preferences to Firestore and localStorage
   */
  static async saveProfile(userId: string, preferences: UserPreferences): Promise<void> {
    const now = Date.now();
    
    // Always save to localStorage (fast, offline-capable)
    localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(preferences));
    localStorage.setItem(this.LOCAL_TIMESTAMP_KEY, now.toString());

    // Skip Firestore for dev user
    if (userId === 'dev-user-local') {
      return;
    }

    try {
      const profileRef = doc(db, this.COLLECTION_NAME, userId, "profile", "preferences");
      await setDoc(profileRef, {
        preferences,
        lastUpdated: serverTimestamp()
      }, { merge: true });
      console.log("[UserProfileService] Saved to Firestore");
    } catch (error) {
      console.warn("[UserProfileService] Firestore save failed, localStorage is still valid:", error);
    }
  }

  /**
   * Load user preferences, preferring Firestore if newer than localStorage
   */
  static async loadProfile(userId: string): Promise<UserPreferences> {
    // Load from localStorage first (fast)
    const localData = this.loadFromLocalStorage();
    const localTimestamp = parseInt(localStorage.getItem(this.LOCAL_TIMESTAMP_KEY) || "0", 10);

    // Skip Firestore for dev user
    if (userId === 'dev-user-local') {
      return localData;
    }

    try {
      const profileRef = doc(db, this.COLLECTION_NAME, userId, "profile", "preferences");
      const docSnap = await getDoc(profileRef);

      if (docSnap.exists()) {
        const stored = docSnap.data() as StoredProfile;
        const firestoreTimestamp = stored.lastUpdated?.toMillis() || 0;

        // Use the most recent version
        if (firestoreTimestamp > localTimestamp) {
          console.log("[UserProfileService] Using Firestore data (newer)");
          // Update localStorage with Firestore data
          localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(stored.preferences));
          localStorage.setItem(this.LOCAL_TIMESTAMP_KEY, firestoreTimestamp.toString());
          return { ...DEFAULT_PREFERENCES, ...stored.preferences };
        } else {
          console.log("[UserProfileService] Using localStorage data (newer or same)");
          // If local is newer, sync it to Firestore
          if (localTimestamp > firestoreTimestamp && localData !== DEFAULT_PREFERENCES) {
            this.saveProfile(userId, localData).catch(console.warn);
          }
          return localData;
        }
      } else {
        console.log("[UserProfileService] No Firestore profile, migrating localStorage");
        // First time: migrate localStorage to Firestore
        if (localData !== DEFAULT_PREFERENCES) {
          this.saveProfile(userId, localData).catch(console.warn);
        }
        return localData;
      }
    } catch (error) {
      console.warn("[UserProfileService] Firestore load failed, using localStorage:", error);
      return localData;
    }
  }

  /**
   * Load preferences from localStorage only
   */
  private static loadFromLocalStorage(): UserPreferences {
    if (typeof window === 'undefined') {
      return DEFAULT_PREFERENCES;
    }
    
    const saved = localStorage.getItem(this.LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(saved) };
      } catch (e) {
        console.error("[UserProfileService] Failed to parse localStorage prefs:", e);
      }
    }
    return DEFAULT_PREFERENCES;
  }

  /**
   * Force sync local preferences to Firestore (useful for migration)
   */
  static async forceSync(userId: string): Promise<void> {
    const localData = this.loadFromLocalStorage();
    await this.saveProfile(userId, localData);
    console.log("[UserProfileService] Force sync complete");
  }

  /**
   * Clear all local preference data (for testing/logout)
   */
  static clearLocalStorage(): void {
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    localStorage.removeItem(this.LOCAL_TIMESTAMP_KEY);
  }
}
