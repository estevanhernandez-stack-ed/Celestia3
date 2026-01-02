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
    'h': 8, 'q': 8, 'z': 8
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

const DAILY_PULSE_MAP: Record<number, { message: string, focus: string, color: string, hex: string }> = {
    1: { 
        message: "New beginnings are surging. Plant seeds now for the cycle ahead. Your energy is electric.", 
        focus: "Action", 
        color: "Red",
        hex: "text-red-400"
    },
    2: { 
        message: "Patience is your power. Connect, cooperate, and listen to the subtle frequencies.", 
        focus: "Balance", 
        color: "Orange",
        hex: "text-orange-400"
    },
    3: { 
        message: "Express yourself freely. Creative sparks will fly if you lower your shield.", 
        focus: "Joy", 
        color: "Yellow",
        hex: "text-yellow-400"
    },
    4: { 
        message: "Ground your energy. Attend to details and build a foundation for your wilder dreams.", 
        focus: "Order", 
        color: "Green",
        hex: "text-green-400"
    },
    5: { 
        message: "Expect the unexpected. Break free. Sudden insights or disruptions are shaking up your routine.", 
        focus: "Freedom", 
        color: "Blue",
        hex: "text-blue-400"
    },
    6: { 
        message: "Tend to your tribe. Healing, harmony, and responsibility are calling for your heart.", 
        focus: "Love", 
        color: "Indigo",
        hex: "text-indigo-400"
    },
    7: { 
        message: "Inward reflection reveals universal truths. Step back from the noise and listen.", 
        focus: "Spirit", 
        color: "Violet",
        hex: "text-violet-400"
    },
    8: { 
        message: "Manifestation power is high. Claim your authority and execute your will.", 
        focus: "Power", 
        color: "Gold",
        hex: "text-amber-400"
    },
    9: { 
        message: "Release what no longer serves. Clear the deck for the new wave incoming.", 
        focus: "Release", 
        color: "White",
        hex: "text-white"
    }
};

export const NumerologyEngine = {
    calculateLifePath: (date: Date | string): NumerologyResult => {
        const d = new Date(date);
        // Reduce Year
        const yearSum = d.getFullYear().toString().split('').reduce((a, b) => a + parseInt(b), 0);
        const monthSum = (d.getMonth() + 1).toString().split('').reduce((a, b) => a + parseInt(b), 0);
        const daySum = d.getDate().toString().split('').reduce((a, b) => a + parseInt(b), 0);
        
        // Master number check needs to happen at each stage ideally, but standard life path adds reduced components
        // Or adds straight across. Let's stick to the "reduce components then sum" method which is common.
        
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
        const t = targetDate || new Date(); // Use target or current
        const currentYear = t.getFullYear();
        const month = d.getMonth() + 1;
        const day = d.getDate();
        
        const daySum = reduceNumber(day).core;
        const monthSum = reduceNumber(month).core;
        const yearSum = reduceNumber(currentYear).core;
        
        return reduceNumber(daySum + monthSum + yearSum).core;
    },
    
    // Personal Month = Personal Year + Calendar Month
    calculatePersonalMonth: (personalYear: number, targetDate?: Date): number => {
        const t = targetDate || new Date();
        const currentMonth = t.getMonth() + 1;
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
        const currentMonth = t.getMonth() + 1;
        const currentDay = t.getDate();
        
        return reduceNumber(personalYear + currentMonth + currentDay).core;
    },

    getDailyPulse: (birthDate: Date | string) => {
        const dayNum = NumerologyEngine.calculatePersonalDay(birthDate);
        return DAILY_PULSE_MAP[dayNum] || DAILY_PULSE_MAP[1];
    }
};
