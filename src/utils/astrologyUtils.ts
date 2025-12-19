import { NatalChartData, PlanetPosition, ZodiacSign } from '@/types/astrology';

// --- UTILITY FUNCTIONS ---
const norm360 = (x: number) => {
    let a = x % 360;
    if (a < 0) a += 360;
    return a;
};

export const getZodiacInfo = (absDeg: number): { sign: ZodiacSign, degree: number } => {
    const signs = Object.values(ZodiacSign);
    const index = Math.floor(norm360(absDeg) / 30);
    const degree = norm360(absDeg) % 30;
    return { sign: signs[index], degree };
};

export const getJulianDay = (date: Date): number => {
    let Y = date.getUTCFullYear();
    let M = date.getUTCMonth() + 1;
    const D = date.getUTCDate() + date.getUTCHours() / 24 + date.getUTCMinutes() / 1440;

    if (M <= 2) { Y -= 1; M += 12; }

    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);

    return Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + D + B - 1524.5;
};

// --- ARCHETYPES & RESONANCE ---
export const ARCHETYPES: Record<ZodiacSign, string> = {
  [ZodiacSign.Aries]: "The Pioneer",
  [ZodiacSign.Taurus]: "The Architect",
  [ZodiacSign.Gemini]: "The Messenger",
  [ZodiacSign.Cancer]: "The Guardian",
  [ZodiacSign.Leo]: "The Sovereign",
  [ZodiacSign.Virgo]: "The Alchemist",
  [ZodiacSign.Libra]: "The Diplomat",
  [ZodiacSign.Scorpio]: "The Phoenix",
  [ZodiacSign.Sagittarius]: "The Explorer",
  [ZodiacSign.Capricorn]: "The Strategist",
  [ZodiacSign.Aquarius]: "The Visionary",
  [ZodiacSign.Pisces]: "The Mystic",
};

export const DESTINY_THREADS: Record<ZodiacSign, string> = {
  [ZodiacSign.Aries]: "Self-Actualization",
  [ZodiacSign.Taurus]: "Value Embodiment",
  [ZodiacSign.Gemini]: "Dynamic Inquiry",
  [ZodiacSign.Cancer]: "Emotional Legacy",
  [ZodiacSign.Leo]: "Creative Sovereignty",
  [ZodiacSign.Virgo]: "Devoted Mastery",
  [ZodiacSign.Libra]: "Harmonic Justice",
  [ZodiacSign.Scorpio]: "Alchemical Truth",
  [ZodiacSign.Sagittarius]: "Cosmic Wisdom",
  [ZodiacSign.Capricorn]: "Disciplined Legacy",
  [ZodiacSign.Aquarius]: "Collective Shift",
  [ZodiacSign.Pisces]: "Universal Union",
};

export const SIGN_RULERS: Record<ZodiacSign, string> = {
  [ZodiacSign.Aries]: "Mars",
  [ZodiacSign.Taurus]: "Venus",
  [ZodiacSign.Gemini]: "Mercury",
  [ZodiacSign.Cancer]: "Moon",
  [ZodiacSign.Leo]: "Sun",
  [ZodiacSign.Virgo]: "Mercury",
  [ZodiacSign.Libra]: "Venus",
  [ZodiacSign.Scorpio]: "Pluto",
  [ZodiacSign.Sagittarius]: "Jupiter",
  [ZodiacSign.Capricorn]: "Saturn",
  [ZodiacSign.Aquarius]: "Uranus",
  [ZodiacSign.Pisces]: "Neptune",
};
