export type KnowledgeLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type Paradigm = 'Antiquity' | 'Picatrix' | 'Agrippa' | 'PGM' | 'Oracles' | 'Hermetica';

export interface UserPreferences {
  name: string;
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
  voicePitch?: number;
  birthDate?: string;
  birthLocation?: {
    lat: number;
    lng: number;
    city: string;
  };
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
  phoneticName: "",
  voiceId: "en-US-Journey-F",
  voiceSpeed: 1.0,
  voicePitch: 0.0,
};
