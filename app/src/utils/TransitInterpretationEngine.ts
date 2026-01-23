import { PlanetPosition } from '@/types/astrology';

export interface Interpretation {
    title: string;
    advice: string;
    vibration: 'High' | 'Low' | 'Neutral';
}

const PLANET_KEYWORDS: Record<string, string> = {
    'Sun': 'Core Identity',
    'Moon': 'Emotional Flux',
    'Mercury': 'Information Flow',
    'Venus': 'Relational Value',
    'Mars': 'Drive & Action',
    'Jupiter': 'Expansion & Luck',
    'Saturn': 'Structure & Discipline',
    'Uranus': 'Sudden Insight',
    'Neptune': 'Spiritual Vision',
    'Pluto': 'Power & Rebirth'
};

const ASPECT_INTERPRETATIONS: Record<string, string> = {
    'Conjunction': 'merges these energies into a singular, intense focus.',
    'Opposition': 'creates a polarity that requires balance and conscious awareness.',
    'Trine': 'allows these forces to flow effortlessly, manifesting as natural talent.',
    'Square': 'creates dynamic tension that demands action and triggers growth.',
    'Sextile': 'opens a productive window of opportunity if you choose to act.'
};

export class TransitInterpretationEngine {
    
    /**
     * Generates a brief interpretation for a planet in a sign.
     */
    static getPlanetInSign(planet: string, sign: string): string {
        const p = PLANET_KEYWORDS[planet] || planet;
        return `${p} is being processed through the lens of ${sign}.`;
    }

    /**
     * Generates a synthesis for an aspect between two planets.
     */
    static getAspectMeaning(p1: string, type: string, p2: string, isSynastry: boolean): string {
        const noun1 = PLANET_KEYWORDS[p1] || p1;
        const noun2 = PLANET_KEYWORDS[p2] || p2;
        const bridge = ASPECT_INTERPRETATIONS[type] || 'interacts with';

        if (isSynastry) {
            return `Current ${noun1} ${bridge} your natal ${noun2}, triggering a personal evolution.`;
        }
        return `Collective ${noun1} ${bridge} ${noun2}, shaping the global atmosphere.`;
    }

    /**
     * Detailed advice based on aspect type.
     */
    static getAdvice(type: string): string {
        switch(type) {
            case 'Conjunction': return "Focus your energy on a single objective today.";
            case 'Opposition': return "Look for the middle ground in your interactions.";
            case 'Trine': return "This is a good time to launch or share your work.";
            case 'Square': return "Dont't avoid the friction; use it to iterate.";
            case 'Sextile': return "Keep an eye out for unexpected invitations.";
            default: return "Observe the subtle shifts in your environment.";
        }
    }
}
