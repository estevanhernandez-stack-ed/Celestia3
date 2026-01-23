import { NumerologyEngine, TechnomancerProfile } from '../utils/NumerologyEngine';

describe('NumerologyEngine', () => {
  describe('calculateLifePath', () => {
    it('should correctly calculate and reduce Life Path for a standard date', () => {
      // 1990-01-01
      // Year: 1+9+9+0 = 19 -> 1+9 = 10 -> 1+0 = 1 (Standard reduction)
      // Month: 1
      // Day: 1
      // Total: 1+1+1 = 3
      const result = NumerologyEngine.calculateLifePath('1990-01-01');
      expect(result.core).toBe(3);
      expect(result.archetype).toBe('The Radiant Creator');
    });

    it('should identify Master Numbers in Life Path', () => {
      // 1990-01-09
      // Year: 1
      // Month: 1
      // Day: 9
      // Total: 1+1+9 = 11
      const result = NumerologyEngine.calculateLifePath('1990-01-09');
      expect(result.core).toBe(11);
      expect(result.isMaster).toBe(true);
      expect(result.archetype).toBe('The Illumined Messenger');
    });
  });

  describe('calculateName (Pythagorean)', () => {
    it('should correctly calculate name "A" -> 1', () => {
      const result = NumerologyEngine.calculateName('A', 'pythagorean');
      expect(result.core).toBe(1);
    });

    it('should correctly calculate "Traveler" (T=2, R=9, A=1, V=4, E=5, L=3, E=5, R=9)', () => {
      // 2+9+1+4+5+3+5+9 = 38
      // 3+8 = 11 (Master)
      const result = NumerologyEngine.calculateName('Traveler', 'pythagorean');
      expect(result.core).toBe(11);
      expect(result.isMaster).toBe(true);
    });
  });

  describe('calculateName (Chaldean)', () => {
    it('should correctly calculate "Traveler" using Chaldean map', () => {
      // T=4, R=2, A=1, V=6, E=5, L=3, E=5, R=2
      // 4+2+1+6+5+3+5+2 = 28
      // 2+8 = 10 -> 1
      const result = NumerologyEngine.calculateName('Traveler', 'chaldean');
      expect(result.core).toBe(1);
      expect(result.isMaster).toBe(false);
    });
  });

  describe('calculateSoulUrge and Personality', () => {
    it('should calculate Soul Urge (Vowels) for "Traveler"', () => {
      // Traveler -> a, e, e
      // Pythagorean: 1, 5, 5 -> 11 (Master)
      const result = NumerologyEngine.calculateSoulUrge('Traveler', 'pythagorean');
      expect(result.core).toBe(11);
      expect(result.isMaster).toBe(true);
    });

    it('should calculate Personality (Consonants) for "Traveler"', () => {
      // Traveler -> t, r, v, l, r
      // Pythagorean: 2, 9, 4, 3, 9 -> 27 -> 9
      const result = NumerologyEngine.calculatePersonality('Traveler', 'pythagorean');
      expect(result.core).toBe(9);
    });
  });

  describe('calculatePersonalYear/Month/Day', () => {
    const birthDate = '1990-01-01';
    const targetDate = new Date('2024-05-15');

    it('should calculate Personal Year correctly', () => {
        // Birth Day: 1
        // Birth Month: 1
        // Current Year: 2024 -> 2+0+2+4 = 8
        // 1 + 1 + 8 = 10 -> 1
        const personalYear = NumerologyEngine.calculatePersonalYear(birthDate, targetDate);
        expect(personalYear).toBe(1);
    });

    it('should calculate Personal Month correctly', () => {
        // Personal Year (1) + Calendar Month (5) = 6
        const personalYear = 1;
        const personalMonth = NumerologyEngine.calculatePersonalMonth(personalYear, targetDate);
        expect(personalMonth).toBe(6);
    });

    it('should calculate Personal Day correctly', () => {
        // Personal Year (1) + Calendar Month (5) + Current Day (15 -> 6) 
        // 1 + 5 + 15 = 21 -> 3
        const personalDay = NumerologyEngine.calculatePersonalDay(birthDate, targetDate);
        expect(personalDay).toBe(3);
    });
  });

  describe('calculateCompatibility', () => {
    const defaultResult = { core: 1, sum: 1, isMaster: false, archetype: '', source: '' };
    const profile1: TechnomancerProfile = {
        lifePath: { ...defaultResult },
        destiny: { ...defaultResult },
        active: { ...defaultResult }
    };
    const profile2: TechnomancerProfile = {
        lifePath: { ...defaultResult },
        destiny: { ...defaultResult },
        active: { ...defaultResult }
    };

    it('should return high score for identical life paths', () => {
        const result = NumerologyEngine.calculateCompatibility(profile1, profile2, { category: 'romantic' });
        expect(result.overallScore).toBeGreaterThan(80);
        expect(result.typeInsight).toContain('resonant');
    });

    it('should return low score for opposites in romantic context', () => {
        const p1Complex: TechnomancerProfile = {
            ...profile1,
            soulUrge: { ...defaultResult, core: 8 },
            personality: { ...defaultResult, core: 9 }
        }
        const p2Opposite: TechnomancerProfile = { 
            lifePath: { ...defaultResult, core: 2 },
            destiny: { ...defaultResult, core: 7 }, // Friction with 1
            active: { ...defaultResult, core: 1 },
            soulUrge: { ...defaultResult, core: 1 },
            personality: { ...defaultResult, core: 2 }
        };
        const result = NumerologyEngine.calculateCompatibility(p1Complex, p2Opposite, { category: 'romantic' });
        expect(result.overallScore).toBeLessThan(60);
        expect(result.typeInsight).toContain('friction');
    });
  });
});
