// src/utils/CelestialLogic.ts
// Calculates the "Celestial Weather" - The Planetary Hour and Ruler

export type PlanetName = 'Saturn' | 'Jupiter' | 'Mars' | 'Sun' | 'Venus' | 'Mercury' | 'Moon';

const CHALDEAN_ORDER: PlanetName[] = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

const DAY_RULERS: PlanetName[] = [
  'Sun',    // Sunday (0)
  'Moon',   // Monday (1)
  'Mars',   // Tuesday (2)
  'Mercury',// Wednesday (3)
  'Jupiter',// Thursday (4)
  'Venus',  // Friday (5)
  'Saturn'  // Saturday (6)
];

export const getPlanetaryHour = (date: Date = new Date()) => {
  // Sunrise/Sunset (Simplified: Fixed 6am/6pm for MVP. Future: Lat/Lon support)
  const sunrise = new Date(date); sunrise.setHours(6, 0, 0, 0);
  const sunset = new Date(date); sunset.setHours(18, 0, 0, 0);
  
  const isDay = date >= sunrise && date < sunset;
  const dayIndex = date.getDay();
  const dayRuler = DAY_RULERS[dayIndex];
  
  const startOfPhase = isDay ? sunrise : sunset;
  const msPassed = date.getTime() - startOfPhase.getTime();
  const hoursPassed = Math.floor(msPassed / (1000 * 60 * 60)); 
  
  const startIndex = CHALDEAN_ORDER.indexOf(dayRuler);
  const hourRulerIndex = (startIndex + hoursPassed) % 7;
  
  return {
    isDay,
    dayRuler,
    hourRuler: CHALDEAN_ORDER[hourRulerIndex],
    hourNumber: (hoursPassed % 12) + 1
  };
};

// Kameas (Magic Squares)
const KAMEAS: Record<string, number[][]> = {
  Jupiter: [
    [4, 14, 15, 1],
    [9, 7, 6, 12],
    [5, 11, 10, 8],
    [16, 2, 3, 13]
  ],
  Saturn: [
    [4, 9, 2],
    [3, 5, 7],
    [8, 1, 6]
  ],
};

export const RitualLib = {
  castSigil: (intent: string, planet: string) => {
    return `
  ┌── [SIGIL: ${planet.toUpperCase()}] ──┐
  │  ${intent.padEnd(16)}  │
  │   ⟡  ${planet.substring(0,2)}  ⟡     │
  │  ${Math.random().toString(16).slice(2, 10)}  │
  └──────────────────────┘
    `;
  },

  castKamea: (planet: string) => {
    const grid = KAMEAS[planet] || KAMEAS['Jupiter'];
    let output = `[KAMEA OF ${planet.toUpperCase()}]\n`;
    grid.forEach(row => {
      output += `| ${row.map(n => n.toString().padStart(2, ' ')).join(' | ')} |\n`;
    });
    return output;
  },

  bindVoces: (target: string) => {
    const vowels = ['A', 'E', 'E', 'I', 'O', 'U', 'W'];
    return `"${target}... ${vowels.join('-')}... ABLANATHANALBA... Bound."`;
  }
};
