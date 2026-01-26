export type GrimoireEntryType = 'tarot' | 'ritual' | 'insight' | 'aura' | 'deep-dive';

export interface GrimoireEntry {
  id: string;
  userId: string;
  type: GrimoireEntryType;
  title: string;
  date: number; // Timestamp
  content: TarotEntryContent | RitualEntryContent | AuraEntryContent | InsightEntryContent | DeepDiveEntryContent; 
  tags?: string[];
}

export interface TarotEntryContent {
  question: string;
  spreadType: string;
  cards: {
    name: string;
    position: string;
    orientation: 'upright' | 'reversed';
  }[];
  interpretation?: string;
}

export interface RitualEntryContent {
    intent: string;
    paradigm: string;
    result: string;
}

export interface AuraEntryContent {
    imageUrl: string;
    analysis: string;
    colors: string[];
    city?: string;
    resonance?: string;
}

export interface InsightEntryContent {
    analysis: string;
    profile: {
        lifePath: number;
        destiny: number;
        soulUrge: number;
    };
}

export interface DeepDiveEntryContent {
    intent: string;
    sections: { heading: string, content: string }[];
    summary: string;
}
