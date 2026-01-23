export type KnowledgeLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Paradigm = 'Antiquity' | 'Picatrix' | 'Agrippa' | 'PGM' | 'Oracles' | 'Hermetica';

export interface SavedChart {
  id: string;
  name: string;
  date: string; // ISO Date string YYYY-MM-DD
  time: string; // HH:mm
  location: {
    lat: number;
    lng: number;
    city: string;
  };
  relationshipType: 'Romantic' | 'Platonic' | 'Business' | 'Family' | 'Child' | 'Other';
  analysisReport?: string;
}

export interface UserPreferences {
  name: string;
  fullName?: string; // For Numerology (Destiny)
  pronouns: string;
  bio?: string;
  intent: 'General' | 'Love' | 'Career' | 'Growth';
  knowledgeLevel: KnowledgeLevel;
  highEntropyMode: boolean;
  useSwissEph: boolean;
  activeParadigms: Paradigm[];
  isKidMode: boolean;
  hasCompletedOnboarding: boolean;
  phoneticName?: string;
  voiceId?: string;
  voiceSpeed?: number;
  voiceVolume?: number;
  voicePitch?: number;
  birthDate?: string;
  birthLocation?: {
    lat: number;
    lng: number;
    city: string;
  };
  hasSeenWelcome?: boolean;
  chartAnalysis?: {
      story: string;
      bigThree: string;
      cosmicSignature: string;
      timestamp: number;
  };
  savedCharts?: SavedChart[];
  xp: number;
  level: number;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: "Traveler",
  pronouns: "They/Them",
  intent: "General",
  knowledgeLevel: "Intermediate",
  highEntropyMode: false,
  useSwissEph: true,
  activeParadigms: ['Antiquity', 'Picatrix', 'Agrippa', 'PGM', 'Oracles', 'Hermetica'],
  isKidMode: false,
  hasCompletedOnboarding: false,
  hasSeenWelcome: false,
  phoneticName: "",
  voiceId: "en-US-Journey-F",
  voiceSpeed: 1.0,
  voiceVolume: 1.0,
  voicePitch: 0.0,
  xp: 0,
  level: 1,
};
