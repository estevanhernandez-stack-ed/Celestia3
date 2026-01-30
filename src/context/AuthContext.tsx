"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  signInAnonymously, 
  User, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut as firebaseSignOut,
  linkWithPopup
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { UserProfileService } from '@/lib/UserProfileService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticating: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const loginAttempted = React.useRef(false);

  useEffect(() => {
    // Handle redirect results (useful for mobile)
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          console.log("[AuthContext] Redirect result processed:", result.user.uid);
          await initializeUserDocument(result.user);
        }
      })
      .catch((error) => {
        console.error("[AuthContext] Redirect error:", error);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth State Changed:", currentUser?.uid, currentUser?.isAnonymous);
      if (!currentUser) {
        if (!loginAttempted.current) {
          loginAttempted.current = true;
          // Automatically sign in anonymously if not logged in
          try {
            await signInAnonymously(auth);
          } catch {
            console.warn("Auth failed or project not configured. Falling back to Dev Mode.");
            // PROVIDE MOCK USER FOR LOCAL DEV
            setUser({
              uid: 'dev-user-local',
              isAnonymous: true,
              email: null,
              displayName: 'Technomancer Guest',
            } as User);
            setLoading(false);
          }
        }
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const initializeUserDocument = async (user: User) => {
    try {
      const userRef = doc(db, "v3_users", user.uid);
      const docSnap = await getDoc(userRef);
      
      if (!docSnap.exists()) {
        // Create root user document
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
          createdAt: serverTimestamp(),
          lastLogin: serverTimestamp(),
          provider: user.providerData[0]?.providerId || 'unknown'
        });
        console.log("[AuthContext] Created new root user document for:", user.uid);
      } else {
        // Update last login
        await setDoc(userRef, { 
          lastLogin: serverTimestamp(),
          displayName: user.displayName, // Keep display name fresh
          photoURL: user.photoURL
        }, { merge: true });
        console.log("[AuthContext] Updated existing user document for:", user.uid);
      }
      
      // Critical: Push localStorage data to Firestore for this new UID
      // This bridges the "guest" data to the Google account
      await UserProfileService.forceSync(user.uid);
      console.log("[AuthContext] Successfully initialized and synced user:", user.uid);
    } catch (error) {
      console.error("[AuthContext] Failed to initialize user document:", error);
    }
  };

  const signInWithGoogle = async () => {
    if (isAuthenticating) {
      console.warn("[AuthContext] Auth already in progress, skipping.");
      return;
    }

    console.log("[AuthContext] Triggering Google Sign-In...");
    setIsAuthenticating(true);
    const provider = new GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (user?.isAnonymous) {
        try {
          // Try to link the anonymous account to Google
          if (isMobile) {
            await signInWithRedirect(auth, provider);
            return; // getRedirectResult will handle initialization
          }
          const credential = await linkWithPopup(user, provider);
          if (credential.user) {
            await initializeUserDocument(credential.user);
          }
        } catch (linkError) {
          const error = linkError as { code?: string };
          // If the Google account is already linked to another user,
          // just sign in normally to that existing account.
          if (error.code === 'auth/credential-already-in-use') {
            console.log("[AuthContext] Credential already in use, signing in instead of linking.");
            let result;
            if (isMobile) {
              await signInWithRedirect(auth, provider);
              return; 
            } else {
              result = await signInWithPopup(auth, provider);
            }

            if (result?.user) {
              await initializeUserDocument(result.user);
            }
          } else {
            throw linkError;
          }
        }
      } else {
        let result;
        if (isMobile) {
          await signInWithRedirect(auth, provider);
          return;
        } else {
          result = await signInWithPopup(auth, provider);
        }

        if (result?.user) {
          await initializeUserDocument(result.user);
        }
      }
    } catch (err) {
      const error = err as { code?: string };
      if (error.code === 'auth/popup-closed-by-user') {
        console.warn("[AuthContext] Google popup closed by user.");
      } else if (error.code === 'auth/cancelled-by-user') {
        console.warn("[AuthContext] Sign-in cancelled by user.");
      } else {
        console.error("Google Sign-In Error:", error);
      }
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  };

  const logout = async () => {
    if (isAuthenticating) return;
    
    console.log("[AuthContext] Manual Sign-Out Triggered");
    setIsAuthenticating(true);
    try {
      // 1. Clear local preference cache to prevent data overlap for next user
      UserProfileService.clearLocalStorage();
      
      // 2. Sign out from Firebase Auth
      await firebaseSignOut(auth);
      
      // 3. Reset local app state
      setUser(null);
      loginAttempted.current = false;
      
      console.log("[AuthContext] User successfully signed out");
    } catch (error) {
      console.error("[AuthContext] Sign-Out Error:", error);
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticating, signInWithGoogle, logout }}>
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
