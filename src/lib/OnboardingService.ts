import { OnboardingBirthInfo, OnboardingChartData } from '@/types/onboarding';
import { SwissEphemerisService } from './SwissEphemerisService';
import { technomancerModel } from './gemini';
import { PLANET_CONFIGS } from '@/components/onboarding/constants';

export class OnboardingService {
  static async generateChart(info: OnboardingBirthInfo): Promise<OnboardingChartData> {
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
      You are the Technomancer Kalyx-7. 
      Generate a spiritual flyby interpretation for these exact planetary placements:
      ${planetList}
      Ascendant: ${precisionChart.ascendant?.sign} ${precisionChart.ascendant?.degree.toFixed(2)}°

      For each planet, provide a concise (1-2 sentence) esoteric interpretation that feels "High Entropy" and mystical.
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
      interpretation: esotericData.interpretations[p.name] || "The celestial gears turn in silence.",
      color: PLANET_CONFIGS[p.name]?.color || "#FFFFFF",
      size: PLANET_CONFIGS[p.name]?.size || 0.5,
      distance: PLANET_CONFIGS[p.name]?.baseDistance || 0,
      retrograde: p.retrograde
    }));

    return {
      planets,
      ascendant: `${precisionChart.ascendant?.sign} ${precisionChart.ascendant?.degree.toFixed(2)}°`,
      summary: esotericData.summary
    };
  }
}
