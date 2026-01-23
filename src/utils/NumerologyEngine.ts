export interface NumerologyResult {
    sum: number;       // The raw compound number (e.g., 33)
    core: number;      // The reduced digit (e.g., 6)
    isMaster: boolean; // 11, 22, 33
    archetype: string; // The "Label" for this number
    source?: string;   // The input string used for calculation
}

export interface TechnomancerProfile {
    lifePath: NumerologyResult; // Pythagorean (Date)
    destiny: NumerologyResult;  // Pythagorean (Birth Name)
    active: NumerologyResult;   // Chaldean (Chosen Name)
    soulUrge?: NumerologyResult; // Vowels (Heart)
    personality?: NumerologyResult; // Consonants (Mask)
}

export type RelationshipCategory = 'romantic' | 'platonic' | 'business' | 'family';
export type FamilyRole = 'parent' | 'child' | 'sibling' | 'extended' | 'general';

export interface RelationshipContext {
    category: RelationshipCategory;
    role?: FamilyRole;
}

export interface SynergyResult {
    overallScore: number;
    lifePathMatch: { score: number; description: string };
    destinyMatch: { score: number; description: string };
    soulUrgeMatch: { score: number; description: string };
    personalityMatch: { score: number; description: string };
    synergyNumber: number;
    context: RelationshipContext;
    typeInsight: string;
}

const MASTER_NUMBERS = [11, 22, 33];

// Pythagorean System (A=1, B=2, ... I=9)
const PYTHAGOREAN_MAP: Record<string, number> = {
    'a': 1, 'j': 1, 's': 1,
    'b': 2, 'k': 2, 't': 2,
    'c': 3, 'l': 3, 'u': 3,
    'd': 4, 'm': 4, 'v': 4,
    'e': 5, 'n': 5, 'w': 5,
    'f': 6, 'o': 6, 'x': 6,
    'g': 7, 'p': 7, 'y': 7,
    'h': 8, 'q': 8, 'z': 8,
    'i': 9, 'r': 9
};

// Chaldean System (Ancient, Vibration-based)
const CHALDEAN_MAP: Record<string, number> = {
    'a': 1, 'i': 1, 'j': 1, 'q': 1, 'y': 1,
    'b': 2, 'k': 2, 'r': 2,
    'c': 3, 'g': 3, 'l': 3, 's': 3,
    'd': 4, 'm': 4, 't': 4,
    'e': 5, 'h': 5, 'n': 5, 'x': 5,
    'u': 6, 'v': 6, 'w': 6,
    'o': 7, 'z': 7,
    'f': 8, 'p': 8
    // No 9 in Chaldean mapping (9 is sacred/hidden)
};

const ARCHETYPES: Record<number, string> = {
    1: "The Primal Initiator",
    2: "The Cosmic Diplomat",
    3: "The Radiant Creator",
    4: "The Master Builder",
    5: "The Chaos Navigator",
    6: "The Harmonics Keeper",
    7: "The Mystic Seeker",
    8: "The Abundance Engine",
    9: "The Universal Sage",
    11: "The Illumined Messenger",
    22: "The Reality Architect",
    33: "The Ascended Guide"
};

const reduceNumber = (num: number): { core: number; isMaster: boolean } => {
    if (MASTER_NUMBERS.includes(num)) return { core: num, isMaster: true };
    if (num < 10) return { core: num, isMaster: false };

    let current = num;
    while (current > 9 && !MASTER_NUMBERS.includes(current)) {
        current = current.toString().split('').reduce((a, b) => a + parseInt(b), 0);
    }
    return { core: current, isMaster: MASTER_NUMBERS.includes(current) };
};

const calculateString = (str: string, system: 'pythagorean' | 'chaldean'): number => {
    const map = system === 'pythagorean' ? PYTHAGOREAN_MAP : CHALDEAN_MAP;
    const cleanStr = str.toLowerCase().replace(/[^a-z]/g, '');
    let sum = 0;
    for (const char of cleanStr) {
        sum += map[char] || 0;
    }
    return sum;
};

const RICH_ARCHETYPES: Record<number, { title: string, shadow: string, gift: string, challenge: string }> = {
    1: { 
        title: "The Primal Initiator", 
        gift: "Unstoppable willpower, innovation, and leadership.", 
        shadow: "Domineering, aggressive, or egotistical behavior.", 
        challenge: "To lead without tyranny and innovate without isolation."
    },
    2: { 
        title: "The Cosmic Diplomat", 
        gift: "Intuition, empathy, and harmonization of opposites.", 
        shadow: "Over-sensitivity, codependency, or indecision.", 
        challenge: "To seek peace without sacrificing your own boundaries."
    },
    3: { 
        title: "The Radiant Creator", 
        gift: "Expression, optimism, and artistic brilliance.", 
        shadow: "Superficiality, scattered energy, or moodiness.", 
        challenge: "To find depth in expression and focus your scattered light."
    },
    4: { 
        title: "The Master Builder", 
        gift: "Stability, pragmatism, and foundational strength.", 
        shadow: "Rigidity, stubbornness, or narrow-mindedness.", 
        challenge: "To build structures that can flex and evolve."
    },
    5: { 
        title: "The Chaos Navigator", 
        gift: "Freedom, adaptability, and magnetic charisma.", 
        shadow: "Restlessness, irresponsibility, or addiction to stimulation.", 
        challenge: "To find freedom within discipline."
    },
    6: { 
        title: "The Harmonics Keeper", 
        gift: "Nurturing, responsibility, and service to others.", 
        shadow: "Martyrdom, perfectionism, or interference.", 
        challenge: "To care for others without neglecting the self."
    },
    7: { 
        title: "The Mystic Seeker", 
        gift: "Analysis, spiritual depth, and truth-seeking.", 
        shadow: "Isolation, cynicism, or emotional detachment.", 
        challenge: "To trust intuition as much as logic."
    },
    8: { 
        title: "The Abundance Engine", 
        gift: "Power, authority, and material mastery.", 
        shadow: "Greed, manipulation, or abuse of power.", 
        challenge: "To balance material success with spiritual integrity."
    },
    9: { 
        title: "The Universal Sage", 
        gift: "Compassion, wisdom, and global consciousness.", 
        shadow: "Fanaticism, resentment, or loss of self.", 
        challenge: "To let go of the past and embrace universal love."
    },
    11: { 
        title: "The Illumined Messenger", 
        gift: "High intuition, inspiration, and electric energy.", 
        shadow: "Nervous tension, impracticality, or ego inflation.", 
        challenge: "To channel high-voltage inspiration into practical reality."
    },
    22: { 
        title: "The Reality Architect", 
        gift: "Manifesting large-scale dreams into matter.", 
        shadow: "Overwhelming pressure, destructive capability.", 
        challenge: "To build a better world, not just a rigid empire."
    },
    33: { 
        title: "The Ascended Guide", 
        gift: "Master teacher, unconditional love, and healing.", 
        shadow: "Overextending, emotional burnout.", 
        challenge: "To heal the world by first healing yourself."
    }
};

const DAILY_PULSE_MAP: Record<number, { message: string, focus: string, color: string, hex: string, context: string }> = {
    1: { 
        message: "New beginnings are surging. Plant seeds now for the cycle ahead. Your energy is electric.", 
        focus: "Action", 
        color: "Red",
        hex: "text-red-400",
        context: "Personal Day 1 is the seed-point. Red aligns with the Root Chakra and vitality needed for new starts."
    },
    2: { 
        message: "Patience is your power. Connect, cooperate, and listen to the subtle frequencies.", 
        focus: "Balance", 
        color: "Orange",
        hex: "text-orange-400",
        context: "Personal Day 2 follows the spark with incubation. Orange reflects the Sacral Chakra's connection and emotional balance."
    },
    3: { 
        message: "Express yourself freely. Creative sparks will fly if you lower your shield.", 
        focus: "Joy", 
        color: "Yellow",
        hex: "text-yellow-400",
        context: "Personal Day 3 is about expression. Yellow mirrors the Solar Plexus, radiating confidence and joy."
    },
    4: { 
        message: "Ground your energy. Attend to details and build a foundation for your wilder dreams.", 
        focus: "Order", 
        color: "Green",
        hex: "text-green-400",
        context: "Personal Day 4 demands structure. Green connects to the Heart, grounding you in stabilizing earth energy."
    },
    5: { 
        message: "Expect the unexpected. Break free. Sudden insights or disruptions are shaking up your routine.", 
        focus: "Freedom", 
        color: "Blue",
        hex: "text-blue-400",
        context: "Personal Day 5 brings change. Blue aligns with the Throat Chakra, encouraging freedom of truth and adaptability."
    },
    6: { 
        message: "Tend to your tribe. Healing, harmony, and responsibility are calling for your heart.", 
        focus: "Love", 
        color: "Indigo",
        hex: "text-indigo-400",
        context: "Personal Day 6 focuses on harmony. Indigo represents the Third Eye's insight into responsibility and care."
    },
    7: { 
        message: "Inward reflection reveals universal truths. Step back from the noise and listen.", 
        focus: "Spirit", 
        color: "Violet",
        hex: "text-violet-400",
        context: "Personal Day 7 is the pause. Violet connects to the Crown, inviting spiritual reflection and solitude."
    },
    8: { 
        message: "Manifestation power is high. Claim your authority and execute your will.", 
        focus: "Power", 
        color: "Gold",
        hex: "text-amber-400",
        context: "Personal Day 8 is the harvest. Gold symbolizes value, power, and the high-frequency manifestation of the Aura."
    },
    9: { 
        message: "Release what no longer serves. Clear the deck for the new wave incoming.", 
        focus: "Release", 
        color: "White",
        hex: "text-white",
        context: "Personal Day 9 is the completion. White contains all colors, representing clarity, release, and purification before the next cycle."
    }
};

export const NumerologyEngine = {
    calculateLifePath: (date: Date | string): NumerologyResult => {
        const d = new Date(date);
        
        // Use UTC methods for nominal date values (Birth dates) to ensure consistency across timezones
        const yearSum = d.getUTCFullYear().toString().split('').reduce((a, b) => a + parseInt(b), 0);
        const monthSum = (d.getUTCMonth() + 1).toString().split('').reduce((a, b) => a + parseInt(b), 0);
        const daySum = d.getUTCDate().toString().split('').reduce((a, b) => a + parseInt(b), 0);
        
        const reducedYear = reduceNumber(yearSum).core;
        const reducedMonth = reduceNumber(monthSum).core;
        const reducedDay = reduceNumber(daySum).core;
        
        const total = reducedYear + reducedMonth + reducedDay;
        const final = reduceNumber(total);
        
        return {
            sum: total,
            core: final.core,
            isMaster: final.isMaster,
            archetype: ARCHETYPES[final.core] || "The Unknown",
            source: d.toLocaleDateString()
        };
    },

    calculateName: (name: string, system: 'pythagorean' | 'chaldean'): NumerologyResult => {
        const sum = calculateString(name, system);
        const final = reduceNumber(sum);
        return {
            sum,
            core: final.core,
            isMaster: final.isMaster,
            archetype: ARCHETYPES[final.core] || "The Unknown",
            source: name
        };
    },

    calculatePersonalYear: (birthDate: Date | string, targetDate?: Date): number => { // Updated signature
        const d = new Date(birthDate);
        const t = targetDate || new Date();
        const currentYear = t.getUTCFullYear();
        const month = d.getUTCMonth() + 1;
        const day = d.getUTCDate();
        
        const daySum = reduceNumber(day).core;
        const monthSum = reduceNumber(month).core;
        const yearSum = reduceNumber(currentYear).core;
        
        return reduceNumber(daySum + monthSum + yearSum).core;
    },
    
    // Personal Month = Personal Year + Calendar Month
    calculatePersonalMonth: (personalYear: number, targetDate?: Date): number => {
        const t = targetDate || new Date();
        const currentMonth = t.getUTCMonth() + 1;
        return reduceNumber(personalYear + currentMonth).core;
    },

    getArchetype: (num: number) => ARCHETYPES[num] || "Unknown",
    
    getRichDetails: (num: number) => RICH_ARCHETYPES[num] || {
        title: "The Unknown",
        gift: "Mystery",
        shadow: "Uncertainty",
        challenge: "To discover the self."
    },

    // Personal Day = Personal Month + Current Day
    calculatePersonalDay: (birthDate: Date | string, targetDate?: Date): number => {
        const t = targetDate || new Date();
        const personalYear = NumerologyEngine.calculatePersonalYear(birthDate, t);
        const currentMonth = t.getUTCMonth() + 1;
        const currentDay = t.getUTCDate();
        
        return reduceNumber(personalYear + currentMonth + currentDay).core;
    },

    // Soul Urge: Sum of Vowels (Heart's Desire)
    calculateSoulUrge: (name: string, system: 'pythagorean' | 'chaldean'): NumerologyResult => {
        const vowels = name.toLowerCase().replace(/[^aeiou]/g, '');
        const sum = calculateString(vowels, system); // Calculate using only the vowels
        const final = reduceNumber(sum);
        return {
            sum,
            core: final.core,
            isMaster: final.isMaster,
            archetype: ARCHETYPES[final.core] || "The Unknown",
            source: "Soul Urge"
        };
    },

    // Personality: Sum of Consonants (Outer Mask)
    calculatePersonality: (name: string, system: 'pythagorean' | 'chaldean'): NumerologyResult => {
        const consonants = name.toLowerCase().replace(/[aeiou\W\d]/g, ''); // Remove vowels and non-letters
        const sum = calculateString(consonants, system);
        const final = reduceNumber(sum);
        return {
            sum,
            core: final.core,
            isMaster: final.isMaster,
            archetype: ARCHETYPES[final.core] || "The Unknown",
            source: "Personality"
        };
    },



    getDailyPulse: (birthDate: Date | string) => {
        const t = new Date();
        const personalYear = NumerologyEngine.calculatePersonalYear(birthDate, t);
        const currentMonth = t.getMonth() + 1;
        const currentDay = t.getDate();
        
        const dayNum = NumerologyEngine.calculatePersonalDay(birthDate);
        const pulse = DAILY_PULSE_MAP[dayNum] || DAILY_PULSE_MAP[1];
        
        const dynamicContext = `Derived from your Personal Year (${personalYear}) + Month (${currentMonth}) + Day (${currentDay}). ${pulse.context}`;
        
        return {
            ...pulse,
            context: dynamicContext
        };
    },

    calculateCompatibility: (profile1: TechnomancerProfile, profile2: TechnomancerProfile, context: RelationshipContext): SynergyResult => {
        const lp1 = profile1.lifePath.core;
        const lp2 = profile2.lifePath.core;
        
        const d1 = profile1.destiny.core;
        const d2 = profile2.destiny.core;

        const su1 = profile1.soulUrge?.core || 0;
        const su2 = profile2.soulUrge?.core || 0;

        const p1 = profile1.personality?.core || 0;
        const p2 = profile2.personality?.core || 0;

        const lpMatch = NumerologyEngine.calculateMatchScore(lp1, lp2);
        const dMatch = NumerologyEngine.calculateMatchScore(d1, d2);
        const suMatch = NumerologyEngine.calculateMatchScore(su1, su2);
        const pMatch = NumerologyEngine.calculateMatchScore(p1, p2);
        
        const synergyNumber = reduceNumber(lp1 + lp2).core;
        
        // Context-aware insight generation
        let typeInsight = "Your vibrations create a unique resonance.";
        const isHighMatch = lpMatch.score > 80;

        if (context.category === 'romantic') {
            if (isHighMatch) typeInsight = "A deeply resonant romantic alignment with high soulful compatibility.";
            else typeInsight = "A relationship of growth. Dynamic friction sparks passion and evolution.";
        } else if (context.category === 'business') {
            typeInsight = lpMatch.score > 70 ? "Strong professional synergy. Efficient execution of shared goals." : "Requires clear role definition to avoid vibrational overlap.";
        } else if (context.category === 'family') {
            const roleStr = context.role ? `${context.role.charAt(0).toUpperCase() + context.role.slice(1)}` : 'Familial';
            if (context.role === 'parent' || context.role === 'child') {
                typeInsight = `Ancient karmic bond. This ${roleStr} connection focuses on ancestral learning and patterns.`;
            } else if (context.role === 'sibling') {
                typeInsight = "Parallel soul journeys. Shared roots with individual vibrational expressions.";
            } else {
                typeInsight = "A foundational familial tie rooted in shared energetic heritage.";
            }
        } else {
            typeInsight = "A meeting of minds and spirits. Mutual support on external journeys.";
        }

        // Weighted overall score
        const overallScore = Math.round((lpMatch.score * 0.4) + (dMatch.score * 0.3) + (suMatch.score * 0.2) + (pMatch.score * 0.1));

        return {
            overallScore,
            lifePathMatch: lpMatch,
            destinyMatch: dMatch,
            soulUrgeMatch: suMatch,
            personalityMatch: pMatch,
            synergyNumber,
            context,
            typeInsight
        };
    },

    calculateMatchScore: (n1: number, n2: number) => {
        // Basic vibrational logic (simplified for Technomancer)
        const naturalMatches: Record<number, number[]> = {
            1: [1, 3, 5, 7, 9],
            2: [2, 4, 6, 8],
            3: [1, 3, 5, 6, 9],
            4: [2, 4, 6, 7, 8],
            5: [1, 3, 5, 7, 9],
            6: [2, 3, 4, 6, 8, 9],
            7: [1, 4, 5, 7],
            8: [2, 4, 6, 8],
            9: [1, 3, 5, 6, 9],
            11: [2, 6, 8, 11, 22],
            22: [4, 6, 8, 22, 11]
        };
  
        // Determine match level
        const primaryMatches = naturalMatches[n1] || [];
        const secondaryMatches = naturalMatches[n2] || [];
        
        let score = 50; // Neutral baseline
        let description = "A complex vibration requiring adjustment.";
  
        if (n1 === n2) {
            score = 90;
            description = "Resonant frequencies. You vibrate in unison.";
        } else if (primaryMatches.includes(n2) || secondaryMatches.includes(n1)) {
            score = 85;
            description = "Harmonic convergence. Your numbers naturally support each other.";
        } else {
            const isN1Odd = n1 % 2 !== 0;
            const isN2Odd = n2 % 2 !== 0;
            if (isN1Odd === isN2Odd) {
               score = 70;
               description = "Compatible polarity. You share a similar rhythm.";
            } else {
               score = 40;
               description = "Dynamic friction. A relationship of growth through challenge.";
            }
        }
  
        return { score, description };
    }
};

export const numerologyEngine = NumerologyEngine;
