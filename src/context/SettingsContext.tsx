"use client";

import React, { createContext, useContext, useState } from 'react';
import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/preferences';

interface SettingsContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [preferences, setPreferences] = useState<UserPreferences>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('celestia_3_prefs');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to load prefs", e);
        }
      }
    }
    return DEFAULT_PREFERENCES;
  });

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem('celestia_3_prefs', JSON.stringify(next));
      return next;
    });
  };

  return (
    <SettingsContext.Provider value={{ preferences, updatePreferences }}>
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
