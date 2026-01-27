"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/preferences';
import { UserProfileService } from '@/lib/UserProfileService';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  isLoading: boolean;
  isSyncing: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedRef = useRef(false);

  // Load preferences from Firestore/localStorage when user changes
  useEffect(() => {
    async function loadPreferences() {
      if (authLoading) return;
      
      // Load from localStorage immediately for fast initial render
      if (!hasLoadedRef.current && typeof window !== 'undefined') {
        const localData = localStorage.getItem('celestia_3_prefs');
        if (localData) {
          try {
            setPreferences({ ...DEFAULT_PREFERENCES, ...JSON.parse(localData) });
          } catch (e) {
            console.error("Failed to load local prefs", e);
          }
        }
      }

      if (user) {
        try {
          setIsLoading(true);
          const loadedPrefs = await UserProfileService.loadProfile(user.uid);
          setPreferences(loadedPrefs);
          hasLoadedRef.current = true;
          console.log("[SettingsContext] Preferences loaded");
        } catch (error) {
          console.error("Failed to load preferences from Firestore:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    }

    loadPreferences();
  }, [user, authLoading]);

  // Debounced save to Firestore
  const saveToFirestore = useCallback(async (prefs: UserPreferences) => {
    if (!user) return;
    
    setIsSyncing(true);
    try {
      await UserProfileService.saveProfile(user.uid, prefs);
    } catch (error) {
      console.error("Failed to save preferences:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [user]);

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...updates };
      
      // Save to localStorage immediately (sync)
      localStorage.setItem('celestia_3_prefs', JSON.stringify(next));
      localStorage.setItem('celestia_3_prefs_updated', Date.now().toString());
      
      // Debounce Firestore save (500ms) to avoid excessive writes
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        saveToFirestore(next);
      }, 500);
      
      return next;
    });
  }, [saveToFirestore]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ preferences, updatePreferences, isLoading, isSyncing }}>
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
