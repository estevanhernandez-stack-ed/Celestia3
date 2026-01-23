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
  synastry: 2,
  numerology: 3,
  tarot: 4,
  chronos: 5,
  rituals: 6,
  celebrities: 7,
  grimoire: 8,
  codex: 8,
  cosmic: 8,
  athanor: 9
};

export type XPAction = 'ritual' | 'tarot' | 'journal' | 'compass' | 'meditation' | 'calibration' | 'arithmancy' | 'synastry' | 'synastry_match' | 'codex' | 'exploration';

export class ProgressionService {
  static getXPForNextLevel(level: number): number {
    // Basic curve: 100, 250, 450, 700, 1000...
    return level * 100 + (level - 1) * 50;
  }

  static getLevelTitle(level: number): string {
    return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
  }

  static getUnlockHint(level: number): string {
    const hints: Record<number, string> = {
      1: "Explore your Natal Compass and meditate on any planet for 3 seconds.",
      2: "Enter the Synastry chamber and calculate a compatibility match.",
      3: "Consult the Arithmancy engine and decode your core numbers.",
      4: "Approach the Tarot Deck and draw a divine spread.",
      5: "Observe the shifting celestial currents in the Chronos Feed.",
      6: "Enter the Ritual Chamber and manifest your intent.",
      7: "Resonate with the Astral Icons of historical figures.",
      8: "Search the Akashic archives within the Cosmic Codex.",
    };
    return hints[level] || "Continue your exploration of the celestial arts.";
  }

  static calculateGainedXP(action: XPAction): number {
    const xpMap: Record<XPAction, number> = {
      ritual: 50,
      tarot: 30,
      journal: 20,
      compass: 10,
      meditation: 10,
      calibration: 5,
      arithmancy: 15,
      synastry: 40,
      synastry_match: 15,
      codex: 5,
      exploration: 2
    };
    return xpMap[action];
  }

  /**
   * Processes XP gain and returns the new state
   */
  static addXP(currentPrefs: UserPreferences, action: XPAction, forceLevelUp: boolean = false): { 
    xp: number; 
    level: number; 
    leveledUp: boolean 
  } {
    const currentXP = currentPrefs.xp || 0;
    let newLevel = currentPrefs.level || 1;
    let leveledUp = false;

    if (forceLevelUp) {
      // Award exactly enough XP to hit the next level
      return { xp: 0, level: newLevel + 1, leveledUp: true };
    }

    const gainedXP = this.calculateGainedXP(action);
    let newXP = currentXP + gainedXP;

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
