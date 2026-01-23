import { PlanetPosition, Aspect } from '@/types/astrology';

// Standard Orbs for Aspects
const ORBS = {
  Conjunction: 8, // Intense focus
  Opposition: 8,  // Awareness, polarity
  Trine: 8,       // Flow, harmony
  Square: 8,      // Tension, action
  Sextile: 6      // Opportunity
};

const getAngularDistance = (deg1: number, deg2: number): number => {
  const diff = Math.abs(deg1 - deg2);
  return Math.min(diff, 360 - diff);
};

export class AspectEngine {
    
  /**
   * Calculates all aspects between a set of planets.
   */
  static calculateAspects(planets1: PlanetPosition[], planets2: PlanetPosition[] = planets1, isSynastry = false): Aspect[] {
    const aspects: Aspect[] = [];
    
    for (let i = 0; i < planets1.length; i++) {
        const startJ = isSynastry ? 0 : i + 1;

        for (let j = startJ; j < planets2.length; j++) {
            const p1 = planets1[i];
            const p2 = planets2[j];

            if (!isSynastry && p1.name === p2.name) continue;

            const angle = getAngularDistance(p1.absoluteDegree, p2.absoluteDegree);
            let type: Aspect['type'] | null = null;

            // Check Aspect Types
            if (angle <= ORBS.Conjunction) {
                type = 'Conjunction';
            } else if (Math.abs(angle - 180) <= ORBS.Opposition) {
                type = 'Opposition';
            } else if (Math.abs(angle - 120) <= ORBS.Trine) {
                type = 'Trine';
            } else if (Math.abs(angle - 90) <= ORBS.Square) {
                type = 'Square';
            } else if (Math.abs(angle - 60) <= ORBS.Sextile) {
                type = 'Sextile';
            }

            if (type) {
                let currentOrb = 0;
                switch (type) {
                    case 'Conjunction': currentOrb = angle; break;
                    case 'Opposition': currentOrb = Math.abs(angle - 180); break;
                    case 'Trine': currentOrb = Math.abs(angle - 120); break;
                    case 'Square': currentOrb = Math.abs(angle - 90); break;
                    case 'Sextile': currentOrb = Math.abs(angle - 60); break;
                }

                aspects.push({
                    planet1: p1,
                    planet2: p2,
                    type,
                    angle,
                    orb: currentOrb,
                    isSynastry
                });
            }
        }
    }
    
    return aspects.sort((a, b) => a.orb - b.orb);
  }

  /**
   * Detects if a planet has changed signs between two timeframes.
   * Useful for "Ingress" events.
   */
  static detectIngresses(prevPlanets: PlanetPosition[], currentPlanets: PlanetPosition[]): string[] {
      const ingresses: string[] = [];
      
      currentPlanets.forEach(curr => {
          const prev = prevPlanets.find(p => p.name === curr.name);
          if (prev && prev.sign !== curr.sign) {
              ingresses.push(`${curr.name} Entered ${curr.sign}`);
          }
      });

      return ingresses;
  }
}
