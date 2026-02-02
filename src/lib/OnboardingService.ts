import { OnboardingBirthInfo, OnboardingChartData } from '@/types/onboarding';
import { SwissEphemerisService } from './SwissEphemerisService';
import { technomancerModel } from './gemini';
import { PLANET_CONFIGS } from '@/components/onboarding/constants';

export class OnboardingService {
  static async generateChart(info: OnboardingBirthInfo): Promise<OnboardingChartData> {
    const CACHE_VERSION = 'v2_hermetic';
    const cacheKey = `celestia_flyby_cache_${CACHE_VERSION}_${info.date}_${info.time}_${info.lat?.toFixed(4) || '0'}_${info.lng?.toFixed(4) || '0'}`;
    
    // Check Cache
    if (typeof window !== 'undefined') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
            try {
                const data = JSON.parse(cached);
                if (data && Array.isArray(data.planets) && data.planets.length > 0) {
                    console.log("Loading Chart from Cache");
                    return data;
                }
                localStorage.removeItem(cacheKey);
            } catch {
                localStorage.removeItem(cacheKey);
            }
        }
    }

    // 1. Get Precision Astronomical Data
    const birthDate = new Date(`${info.date}T${info.time}:00Z`); // Assuming UTC or local handled in UI
    const precisionChart = await SwissEphemerisService.calculateChart(
      birthDate,
      info.lat || 0,
      info.lng || 0
    );

    // 2. Prepare prompt for Spiritual Interpretation
    const planetList = precisionChart.planets.map(p => 
      `${p.name} at ${p.degree.toFixed(2)}° in ${p.sign}`
    ).join(', ');

    const prompt = `
      You are the **Athanor AI**, a Master Arithmetician and Hermetic Guide. 
      Interpret these planetary placements for an initiate's first celestial flyby:
      ${planetList}
      Ascendant: ${precisionChart.ascendant?.sign} ${precisionChart.ascendant?.degree.toFixed(2)}°

      For each planet, provide a warm, poetic, and profoundly intelligent interpretation (1-2 sentences). 
      Avoid all technical computer jargon (e.g., no mention of 'kernels', 'buffers', 'processors', 'data', or 'logic gates').
      Instead, use imagery of light, soul tapestry, ancient echoes, and the harmony of the spheres.
      
      Also provide a general 1-sentence summary of the soul's intent.

      Output JSON format:
      {
        "interpretations": {
          "Sun": "...",
          "Moon": "...",
          ...
        },
        "summary": "..."
      }
    `;

    // 3. Get Esoteric Layer from Gemini
    const result = await technomancerModel.generateContent(prompt);
    const response = await result.response;
    const esotericData = JSON.parse(response.text().replace(/```json|```/g, ''));

    // 4. Merge into Onboarding format
    const planets = precisionChart.planets.map(p => ({
      name: p.name,
      sign: p.sign,
      degree: p.degree,
      house: p.house || 1,
      interpretation: esotericData.interpretations[p.name] || "The celestial gears turn in silence, yet their influence is felt across the ages. This body's song is faint but profound.",
      color: PLANET_CONFIGS[p.name]?.color || "#FFFFFF",
      size: PLANET_CONFIGS[p.name]?.size || 0.5,
      distance: PLANET_CONFIGS[p.name]?.baseDistance || 0,
      retrograde: p.retrograde
    }));

    const finalData = {
      planets,
      ascendant: `${precisionChart.ascendant?.sign} ${precisionChart.ascendant?.degree.toFixed(2)}°`,
      summary: esotericData.summary
    };

    // Save to Cache
    if (typeof window !== 'undefined') {
        localStorage.setItem(cacheKey, JSON.stringify(finalData));
    }

    return finalData;
  }
}
