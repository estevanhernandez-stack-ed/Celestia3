export enum ZodiacSign {
  Aries = 'Aries',
  Taurus = 'Taurus',
  Gemini = 'Gemini',
  Cancer = 'Cancer',
  Leo = 'Leo',
  Virgo = 'Virgo',
  Libra = 'Libra',
  Scorpio = 'Scorpio',
  Sagittarius = 'Sagittarius',
  Capricorn = 'Capricorn',
  Aquarius = 'Aquarius',
  Pisces = 'Pisces'
}

export interface PlanetPosition {
  name: string;
  sign: ZodiacSign;
  degree: number; // 0-29.99
  retrograde?: boolean;
  absoluteDegree: number; // 0-360
  house?: number;
}

export interface HouseCusp {
  house: number;
  sign: ZodiacSign;
  degree: number;
  absoluteDegree: number;
}

export interface NatalChartData {
  id?: string;
  ownerName?: string;
  date?: string; // ISO Birth Date
  planets: PlanetPosition[];
  houses?: HouseCusp[];
  ascendant?: {
    sign: ZodiacSign;
    degree: number;
    absoluteDegree: number;
  };
}

export interface Aspect {
  planet1: PlanetPosition;
  planet2: PlanetPosition;
  type: 'Conjunction' | 'Opposition' | 'Trine' | 'Square' | 'Sextile';
  angle: number;
  orb: number;
  isSynastry: boolean;
}
