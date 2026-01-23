export type GrimoireEntryType = 'tarot' | 'ritual' | 'insight';

export interface GrimoireEntry {
  id: string;
  userId: string;
  type: GrimoireEntryType;
  title: string;
  date: number; // Timestamp
  content: any; // Flexible content structure
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
