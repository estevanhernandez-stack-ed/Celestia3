import { 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    serverTimestamp,
    Timestamp 
} from "firebase/firestore";
import { db } from "./firebase";
import { UserPreferences, DEFAULT_PREFERENCES } from "@/types/preferences";

export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    role: 'user' | 'admin';
    preferences: UserPreferences;
    createdAt: Timestamp;
    lastActive: Timestamp;
}

export class UserService {
    private static COLLECTION_PREFIX = "v3_";
    private static USERS_COLLECTION = `${this.COLLECTION_PREFIX}users`;

    static async getProfile(uid: string): Promise<UserProfile | null> {
        try {
            const docRef = doc(db, this.USERS_COLLECTION, uid);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return docSnap.data() as UserProfile;
            }
        } catch (error) {
            console.error("Failed to fetch user profile:", error);
        }
        return null;
    }

    static async createProfile(uid: string, initialData: Partial<UserProfile>): Promise<UserProfile> {
        const docRef = doc(db, this.USERS_COLLECTION, uid);
        const profile: UserProfile = {
            uid,
            email: initialData.email || null,
            displayName: initialData.displayName || null,
            role: initialData.role || 'user',
            preferences: initialData.preferences || {} as UserPreferences,
            createdAt: serverTimestamp() as Timestamp,
            lastActive: serverTimestamp() as Timestamp,
        };

        await setDoc(docRef, profile);
        return profile;
    }

    static async updatePreferences(uid: string, preferences: Partial<UserPreferences>): Promise<void> {
        const docRef = doc(db, this.USERS_COLLECTION, uid);
        await updateDoc(docRef, {
            preferences: preferences,
            lastActive: serverTimestamp()
        });
    }

    static async updateProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
        const docRef = doc(db, this.USERS_COLLECTION, uid);
        await updateDoc(docRef, {
            ...updates,
            lastActive: serverTimestamp()
        });
    }

    /**
     * Ensures a profile exists for the user, creating it if necessary.
     */
    static async ensureProfile(uid: string, fallbackData: Partial<UserProfile>): Promise<UserProfile> {
        const existing = await this.getProfile(uid);
        if (existing) return existing;
        return await this.createProfile(uid, fallbackData);
    }

    static async deleteProfile(uid: string): Promise<void> {
        const docRef = doc(db, this.USERS_COLLECTION, uid);
        await setDoc(docRef, { deleted: true }); // Soft delete or just wipe it
        // Or actually delete:
        // await deleteDoc(docRef); 
        // Let's use update to mark as reset to avoid recreation loops
        await updateDoc(docRef, {
            preferences: DEFAULT_PREFERENCES,
            role: 'user',
            lastActive: serverTimestamp()
        });
    }
}
