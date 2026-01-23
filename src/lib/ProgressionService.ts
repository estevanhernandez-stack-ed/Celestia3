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

export const VIEW_LEVEL_REQUIREMENTS: Record<string, number> = {
  compass: 1,
  numerology: 2,
  tarot: 3,
  chronos: 4,
  rituals: 5,
  celebrities: 6,
  grimoire: 7,
  cosmic: 7,
  athanor: 8
};

export class ProgressionService {
  static getXPForNextLevel(level: number): number {
    // Basic curve: 100, 250, 450, 700, 1000...
    return level * 100 + (level - 1) * 50;
  }

  static getLevelTitle(level: number): string {
    return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  }

  static calculateGainedXP(action: 'ritual' | 'tarot' | 'journal' | 'compass' | 'meditation' | 'calibration'): number {
    const xpMap = {
      ritual: 50,
      tarot: 30,
      journal: 20,
      compass: 10,
      meditation: 10,
      calibration: 5
    };
    return xpMap[action];
  }

  /**
   * Processes XP gain and returns the new state
   */
  static addXP(currentPrefs: UserPreferences, action: 'ritual' | 'tarot' | 'journal' | 'compass' | 'meditation' | 'calibration'): { 
    xp: number; 
    level: number; 
    leveledUp: boolean 
  } {
    let newXP = (currentPrefs.xp || 0) + this.calculateGainedXP(action);
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
