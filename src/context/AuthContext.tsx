"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loginAttempted = React.useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (!loginAttempted.current) {
          loginAttempted.current = true;
          // Automatically sign in anonymously if not logged in
          try {
            await signInAnonymously(auth);
          } catch (error) {
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

  return (
    <AuthContext.Provider value={{ user, loading }}>
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
