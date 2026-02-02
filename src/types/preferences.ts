export type KnowledgeLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Paradigm = 'Antiquity' | 'Picatrix' | 'Agrippa' | 'PGM' | 'Oracles' | 'Hermetica';

export interface AuraCapture {
  id: string;
  imageUrl: string;
  date: string;
  analysis: string;
  colors: string[];
  city?: string;
  resonance?: string;
}

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
  allowEntropy: boolean;
  useSwissEph: boolean;
  activeParadigms: Paradigm[];
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
  arithmancyProfile?: {
      lifePath: number;
      destiny: number;
      soulUrge: number;
      personality: number;
      timestamp: number;
  };
  customCelebrities?: any[]; // Using any[] temporarily to avoid circular dependency, will refine if needed
  xp: number;
  level: number;
  dismissWelcomePermanent?: boolean;
  profilePictureUrl?: string; // URL from Aura capture or Google auth
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  name: "Traveler",
  pronouns: "They/Them",
  intent: "General",
  knowledgeLevel: "Intermediate",
  allowEntropy: false,
  useSwissEph: true,
  activeParadigms: ['Antiquity', 'Picatrix', 'Agrippa', 'PGM', 'Oracles', 'Hermetica'],
  hasCompletedOnboarding: false,
  hasSeenWelcome: false,
  phoneticName: "",
  voiceId: "en-US-Journey-F",
  voiceSpeed: 1.0,
  voiceVolume: 1.0,
  voicePitch: 0.0,
  xp: 0,
  level: 1,
  dismissWelcomePermanent: false,
  profilePictureUrl: "", // Defaults to initial-based avatar
};
