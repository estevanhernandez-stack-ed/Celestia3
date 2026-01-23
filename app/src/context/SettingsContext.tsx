"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/preferences';
import { useAuth } from './AuthContext';
import { UserService } from '@/lib/UserService';

interface SettingsContextType {
  preferences: UserPreferences;
  isHydrated: boolean; // Add this
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  hardReset: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { profile, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with profile when it changes
  useEffect(() => {
    let active = true;
    
    const hydrate = async () => {
        if (profile?.preferences) {
            if (active) {
                setPreferences(profile.preferences);
                setIsHydrated(true);
            }
        } else if (!authLoading && !profile) {
            // Only use localStorage if NOT logged in (guest mode) and auth check is done
            const saved = localStorage.getItem('celestia_3_prefs');
            if (saved && active) {
                try {
                    const parsed = JSON.parse(saved);
                    setPreferences(parsed);
                } catch (e) {
                    console.error("Failed to load local prefs", e);
                }
            }
            if (active) setIsHydrated(true);
        }
    };

    hydrate();

    return () => { active = false; };
  }, [profile, authLoading]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    const next = { ...preferences, ...updates };
    setPreferences(next);
    
    // Save locally
    localStorage.setItem('celestia_3_prefs', JSON.stringify(next));

    // Save to Firestore if logged in
    if (profile?.uid) {
        await UserService.updatePreferences(profile.uid, next);
    }
  };

  const hardReset = async () => {
    if (typeof window !== 'undefined') {
        localStorage.clear();
        if (profile?.uid) {
            await UserService.updateProfile(profile.uid, {
                preferences: DEFAULT_PREFERENCES,
                role: 'user'
            });
        }
        window.location.reload();
    }
  };

  return (
    <SettingsContext.Provider value={{ preferences, isHydrated, updatePreferences, hardReset }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
