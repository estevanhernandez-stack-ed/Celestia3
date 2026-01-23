"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, onSnapshot, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import { UserService, UserProfile } from '@/lib/UserService';
import { DEFAULT_PREFERENCES } from '@/types/preferences';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loginAttempted = React.useRef(false);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (!currentUser) {
        if (!loginAttempted.current) {
          loginAttempted.current = true;
          try {
            await signInAnonymously(auth);
          } catch (err) {
            console.warn("Auth failed. Falling back to Dev Mode.", err);
            const mockUser = {
              uid: 'dev-user-local',
              isAnonymous: true,
              email: null,
              displayName: 'Technomancer Guest',
            } as User;
            setUser(mockUser);
            setProfile({
                uid: 'dev-user-local',
                displayName: 'Technomancer Guest',
                email: null,
                role: 'user',
                preferences: DEFAULT_PREFERENCES,
                createdAt: Timestamp.now(),
                lastActive: Timestamp.now()
            });
            setLoading(false);
          }
        }
      } else {
        setUser(currentUser);
        
        // Load preferences from localStorage to migrate if new account
        const localData = typeof window !== 'undefined' ? localStorage.getItem('celestia_3_prefs') : null;
        const localPrefs = localData ? JSON.parse(localData) : DEFAULT_PREFERENCES;

        // Ensure Firestore profile exists
        const existingProfile = await UserService.getProfile(currentUser.uid);
        
        if (!existingProfile) {
            // First time sign-in: Use local guest prefs
            await UserService.createProfile(currentUser.uid, {
                email: currentUser.email,
                displayName: currentUser.displayName,
                preferences: localPrefs
            });
        } else {
            // Returning user: Check if we should merge guest birth data
            // If the existing profile has no birth date, but guest does, migrate it!
            const profilePrefs = existingProfile.preferences || {};
            if (!profilePrefs.birthDate && localPrefs.birthDate) {
                console.log("🔄 [Auth] Merging Guest Birth Data into existing profile...");
                await UserService.updatePreferences(currentUser.uid, {
                    ...profilePrefs,
                    ...localPrefs // Guest data wins for empty profile fields
                });
            } else {
                // Just sync last active
                await UserService.updateProfile(currentUser.uid, {
                    lastActive: Timestamp.now()
                });
            }
        }

        // Set up real-time listener for the profile
        unsubscribeProfile = onSnapshot(doc(db, "v3_users", currentUser.uid), (docSnap) => {
            if (docSnap.exists()) {
                setProfile(docSnap.data() as UserProfile);
                setLoading(false);
            }
        });
      }
    });

    return () => {
        unsubscribeAuth();
        if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
        console.log("🌟 [Auth] Initiating Google Sign-In Popup...");
        await signInWithPopup(auth, provider);
        console.log("✅ [Auth] Sign-In Success");
    } catch (error: unknown) {
        const firebaseError = error as { code?: string; message?: string };
        console.error("❌ [Auth] Google Sign-In failed:", firebaseError.code, firebaseError.message);
        if (firebaseError.code === 'auth/popup-blocked') {
            alert("The Sign-In popup was blocked by your browser. Please allow popups for this site.");
        } else if (firebaseError.code === 'auth/unauthorized-domain') {
            alert("This domain is not authorized for Firebase Authentication. Please add it in the Firebase Console.");
        } else {
            alert(`Sign-In Error: ${firebaseError.message}`);
        }
    }
  };

  const logout = async () => {
    try {
        await signOut(auth);
        setProfile(null);
    } catch (error) {
        console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signInWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
