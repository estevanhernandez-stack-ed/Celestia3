import { UserPreferences } from "@/types/preferences";

export const LEVEL_TITLES = [
  "Nebula Seeker",     // Lvl 1
  "Star Wanderer",     // Lvl 2
  "Lunar Witness",     // Lvl 3
  "Solar Disciple",    // Lvl 4
  "Cosmic Voyager",    // Lvl 5
  "Galactic Guardian", // Lvl 6
  "Celestial Sage",    // Lvl 7
  "Void Walker",       // Lvl 8
  "Stellar Architect", // Lvl 9
  "Avatar of the Stars" // Lvl 10+
];

export interface CelestialQuest {
  level: number;
  title: string;
  description: string;
  action: string;
  targetCount: number;
  xpReward: number;
}

export const CELESTIAL_QUESTS: CelestialQuest[] = [
  {
    level: 1,
    title: "The First Glimpse",
    description: "Calibrate your Natal Compass to ground your wandering soul.",
    action: 'calibration',
    targetCount: 1,
    xpReward: 100
  },
  {
    level: 2,
    title: "Aura Cam Activation",
    description: "Capture your Aura to stabilize ethereal resonance.",
    action: 'aura-scan',
    targetCount: 1,
    xpReward: 210 // Increased from 200 so 1 Aura Scan (40 + 210 = 250) promotion from Level 2 -> 3 is guaranteed.
  },
  {
    level: 3,
    title: "Arithmancy Decode",
    description: "Analyze your Soul's Geometry in the Arithmancy chamber.",
    action: 'numerology-check',
    targetCount: 1,
    xpReward: 300
  },
  {
    level: 4,
    title: "The Tarot Vision",
    description: "Draw a Tarot spread to glimpse the threads of fate.",
    action: 'tarot',
    targetCount: 1,
    xpReward: 400
  }
];

export const VIEW_LEVEL_REQUIREMENTS: Record<string, number> = {
  compass: 1,      // The Foundation
  aura: 2,         // Aura Cam
  numerology: 3,   // Arithmancy
  tarot: 4,        // Tarot Deck
  grimoire: 5,     // The Master's Archive (Repository)
  rituals: 6,      // Sigil Manifestation
  chronos: 7,      // Temporal Feed
  celebrities: 8,  // Sync Resonance
  synastry: 9,     // Compatibility
  athanor: 10      // Ethereal Intelligence
};

export class ProgressionService {
  static getXPForNextLevel(level: number): number {
    // Basic curve: 100, 250, 450, 700, 1000...
    return level * 100 + (level - 1) * 50;
  }

  static getLevelTitle(level: number): string {
    return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  }

  static calculateGainedXP(action: 'ritual' | 'tarot' | 'journal' | 'compass' | 'meditation' | 'calibration' | 'aura-scan' | 'numerology-check' | 'insight', currentLevel: number = 1): number {
    const baseXP = {
      ritual: 50,
      tarot: 30,
      journal: 20,
      compass: 10,
      meditation: 10, // Supercharged for faster progression
      calibration: 5,
      'aura-scan': currentLevel > 3 ? 5 : 40, 
      'numerology-check': 30,
      'insight': 150 // The ultimate revelation XP
    };
    return baseXP[action];
  }

  /**
   * Processes XP gain and returns the new state
   */
  static addXP(currentPrefs: UserPreferences, action: 'ritual' | 'tarot' | 'journal' | 'compass' | 'meditation' | 'calibration' | 'aura-scan' | 'numerology-check' | 'insight'): { 
    xp: number; 
    level: number; 
    leveledUp: boolean 
  } {
    let newXP = (currentPrefs.xp || 0) + this.calculateGainedXP(action, currentPrefs.level);
    let newLevel = currentPrefs.level || 1;
    let leveledUp = false;

    let xpToNext = this.getXPForNextLevel(newLevel);
    while (newXP >= xpToNext && newLevel < 99) {
      newXP -= xpToNext;
      newLevel++;
      leveledUp = true;
      xpToNext = this.getXPForNextLevel(newLevel);
    }

    return { xp: newXP, level: newLevel, leveledUp };
  }
}
