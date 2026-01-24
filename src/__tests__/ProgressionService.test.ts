import { ProgressionService } from '../lib/ProgressionService';
import { UserPreferences } from '../types/preferences';

describe('ProgressionService', () => {
  describe('getXPForNextLevel', () => {
    it('should return 100 for level 1', () => {
      expect(ProgressionService.getXPForNextLevel(1)).toBe(100);
    });

    it('should return 250 for level 2', () => {
      expect(ProgressionService.getXPForNextLevel(2)).toBe(250);
    });

    it('should return 400 for level 3', () => {
      expect(ProgressionService.getXPForNextLevel(3)).toBe(400);
    });
  });

  describe('getLevelTitle', () => {
    it('should return "Nebula Seeker" for level 1', () => {
      expect(ProgressionService.getLevelTitle(1)).toBe('Nebula Seeker');
    });

    it('should return the last title for level 10+', () => {
      expect(ProgressionService.getLevelTitle(10)).toBe('Avatar of the Stars');
      expect(ProgressionService.getLevelTitle(15)).toBe('Avatar of the Stars');
    });
  });

  describe('calculateGainedXP', () => {
    it('should return correct values for all actions', () => {
      expect(ProgressionService.calculateGainedXP('ritual')).toBe(50);
      expect(ProgressionService.calculateGainedXP('tarot')).toBe(30);
      expect(ProgressionService.calculateGainedXP('journal')).toBe(20);
      expect(ProgressionService.calculateGainedXP('compass')).toBe(10);
      expect(ProgressionService.calculateGainedXP('meditation')).toBe(10);
      expect(ProgressionService.calculateGainedXP('calibration')).toBe(5);
    });
  });

  describe('addXP', () => {
    const mockPrefs: UserPreferences = {
      name: 'Traveler',
      pronouns: 'They/Them',
      intent: 'General',
      knowledgeLevel: 'Intermediate',
      allowEntropy: false,
      useSwissEph: true,
      activeParadigms: [],
      hasCompletedOnboarding: true,
      xp: 0,
      level: 1,
      birthDate: '1990-01-01',
      birthLocation: { lat: 0, lng: 0, city: 'Test' }
    };

    it('should add XP correctly without leveling up', () => {
      const result = ProgressionService.addXP(mockPrefs, 'compass');
      expect(result.xp).toBe(10);
      expect(result.level).toBe(1);
      expect(result.leveledUp).toBe(false);
    });

    it('should level up when reaching threshold', () => {
      const advancedPrefs = { ...mockPrefs, xp: 95 };
      const result = ProgressionService.addXP(advancedPrefs, 'compass');
      expect(result.xp).toBe(5); // 95 + 10 = 105. 105 - 100 = 5.
      expect(result.level).toBe(2);
      expect(result.leveledUp).toBe(true);
    });

    it('should handle multi-level jumps if massive XP is gained', () => {
      // Level 1: 100 XP
      // Level 2: 250 XP
      // Total needed for Lvl 3: 350
      
      // We manually override calculateGainedXP mock if needed, but here we just test cumulative logic
      // Since calculateGainedXP is static and internal, we can simulate it with multiple calls or a loop
      let state = { ...mockPrefs };
      for (let i = 0; i < 8; i++) {
        const res = ProgressionService.addXP(state, 'ritual');
        state = { ...state, xp: res.xp, level: res.level };
      }
      
      // 8 rituals * 50 = 400 XP
      // Lvl 1 -> Lvl 2: 100 XP (300 left)
      // Lvl 2 -> Lvl 3: 250 XP (50 left)
      expect(state.level).toBe(3);
      expect(state.xp).toBe(50);
    });

    it('should cap leveling strictly if necessary (level < 99 check)', () => {
        const maxPrefs = { ...mockPrefs, level: 99, xp: 10000 };
        const result = ProgressionService.addXP(maxPrefs, 'ritual');
        expect(result.level).toBe(99); // loop check newLevel < 99
    });
  });
});
