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
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginAttempted = React.useRef(false);

  useEffect(() => {
    // Handle redirect results (useful for mobile)
    getRedirectResult(auth)
      .then((result) => {
        if (result) {
          console.log("[AuthContext] Redirect result processed:", result.user.uid);
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

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

    try {
      if (user?.isAnonymous) {
        try {
          // Try to link the anonymous account to Google
          if (isMobile) {
            await signInWithRedirect(auth, provider);
            return;
          }
          await linkWithPopup(user, provider);
        } catch (linkError: any) {
          // If the Google account is already linked to another user,
          // just sign in normally to that existing account.
          if (linkError.code === 'auth/credential-already-in-use') {
            console.log("[AuthContext] Credential already in use, signing in instead of linking.");
            if (isMobile) {
              await signInWithRedirect(auth, provider);
            } else {
              await signInWithPopup(auth, provider);
            }
          } else {
            throw linkError;
          }
        }
      } else {
        if (isMobile) {
          await signInWithRedirect(auth, provider);
        } else {
          await signInWithPopup(auth, provider);
        }
      }
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // After sign out, we'll re-trigger the anonymous login via the useEffect
      loginAttempted.current = false;
    } catch (error) {
      console.error("Sign-Out Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout }}>
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
