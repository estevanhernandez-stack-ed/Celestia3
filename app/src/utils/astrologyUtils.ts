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

// --- MOON PHASE LOGIC ---
// Calculates the current moon phase using a standard astronomical approximation algorithm.
// Source: Based on Julian Day calculation relative to a known New Moon (1/6/2000).
// This is a local calculation, not an external API call, ensuring offline availability.
export const calculateMoonPhase = (date: Date = new Date()): { phase: string, emoji: string } => {
    // Known New Moon: January 6, 2000 at 18:14 UTC
    const knownNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
    const cycleLength = 29.53058867; // Synodic month length in days

    // Calculate time difference in days
    const diffTime = date.getTime() - knownNewMoon.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);

    // Calculate current position in cycle (0 to 1)
    const currentCycle = (diffDays % cycleLength) / cycleLength;
    
    // Map 0-1 to 0-7 (8 phases)
    // 0: New, 0.125: Waxing Crescent, 0.25: First Quarter, 0.375: Waxing Gibbous, 0.5: Full, etc.
    // We add 0.5/8 to center the phases (so New Moon isn't just a single instant at 0.0)
    // Actually, simple mapping:
    const phaseIndex = Math.floor(currentCycle * 8);

    // Handle standard mapping
    switch(phaseIndex) {
        case 0: return { phase: "New Moon", emoji: "🌑" };
        case 1: return { phase: "Waxing Crescent", emoji: "🌒" };
        case 2: return { phase: "First Quarter", emoji: "🌓" };
        case 3: return { phase: "Waxing Gibbous", emoji: "🌔" };
        case 4: return { phase: "Full Moon", emoji: "🌕" };
        case 5: return { phase: "Waning Gibbous", emoji: "🌖" };
        case 6: return { phase: "Last Quarter", emoji: "🌗" };
        case 7: return { phase: "Waning Crescent", emoji: "🌘" };
        default: return { phase: "New Moon", emoji: "🌑" };
    }
};

export const getNextMoonPhaseDate = (currentDate: Date = new Date()): { phase: string, date: Date, timeRemaining: string } => {
    const currentPhase = calculateMoonPhase(currentDate).phase;
    let nextDate = new Date(currentDate.getTime());
    let iterCount = 0;
    
    // Look ahead up to 8 days with hourly precision
    // 8 days * 24 hours = 192 iterations
    while(iterCount < 192) { 
        nextDate.setHours(nextDate.getHours() + 1); 
        const nextInfo = calculateMoonPhase(nextDate);
        if (nextInfo.phase !== currentPhase) {
            const diffTime = nextDate.getTime() - currentDate.getTime();
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffDays = Math.ceil(diffHours / 24);
            
            let timeRemaining = `${diffDays}d`;
            
            if (diffHours < 48) {
                timeRemaining = `${diffHours}h`;
            }
            
            if (diffHours < 1) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60));
                timeRemaining = `${diffMinutes}m`;
            }

            return {
                phase: nextInfo.phase,
                date: nextDate,
                timeRemaining: timeRemaining
            };
        }
        iterCount++;
    }
    
    return { phase: "Unknown", date: nextDate, timeRemaining: "?" };
};
