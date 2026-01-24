import { technomancerModel } from "./gemini";
import { PersistenceService } from "./PersistenceService";
import { ConfigService } from "./ConfigService";
import { UserPreferences, DEFAULT_PREFERENCES } from "@/types/preferences";
import { getPlanetaryHour } from "@/utils/CelestialLogic";
import { calculateMoonPhase } from "@/utils/astrologyUtils";

export interface RitualResult {
  sigil: string;
  vision: {
    incantation: string;
    thought: string;
    voice_transcript?: string;
  };
  talisman_visual?: string;
  context: {
    intent: string;
    paradigm: string;
  };
}

export class RitualService {
  static async performRitual(userId: string, intent: string, paradigm: string, allowEntropy: boolean = false, prefs: UserPreferences = DEFAULT_PREFERENCES): Promise<RitualResult> {
    const weather = getPlanetaryHour();
    const moon = calculateMoonPhase();
    
    let chartContext = "";
    if (prefs.birthDate && prefs.birthLocation) {
        chartContext = `[USER_NATAL_DATA]\nBorn: ${prefs.birthDate} at ${prefs.birthLocation.city}\nUse this to calculate Almuten Figuris resonance.`;
    }

    const cosmicContext = `
[CELESTIAL_WEATHER]
- Planetary Hour: ${weather.hourNumber} (Ruler: ${weather.hourRuler})
- Moon Phase: ${moon.phase} (${moon.emoji})
- Current Time: ${new Date().toISOString()}

[USER_PREFERENCES]
- Identity: ${prefs.name}
- Knowledge: ${prefs.knowledgeLevel}
${chartContext}
`;

    const rawPrompt = await ConfigService.getPrompt('ritual_generation');
    const prompt = (rawPrompt + "\n\n" + cosmicContext)
      .replace(/{{paradigm}}/g, paradigm)
      .replace(/{{intent}}/g, intent);

    const result = await technomancerModel.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      allowEntropy
    });
    // In gemini.ts, generateContent handles normalizing string inputs to parts. 
    // Here we pass an object to specify allowEntropy.
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw Ritual Response:", text);

    try {
      const data = this.extractJson(text);
      
      // Validate structure
      if (!data.sigil || !data.vision?.incantation) {
          throw new Error("Incomplete ritual geometry");
      }

      // Persist to Akashic Records
      if (data.vision?.thought) {
          await PersistenceService.saveMessage(userId, "model", `Ritual Performed: ${data.vision.incantation}`, data.vision.thought, data.voice_transcript);
      }

      return data as unknown as RitualResult;
    } catch (error) {
      console.error("Ritual Parsing Failed:", error);
      
      // Return a "fizzled" ritual result instead of throwing, so the UI can handle it poignantly
      return {
        sigil: '<svg viewBox="0 0 100 100"><path d="M20,50 L80,50 M50,20 L50,80" stroke="red" stroke-width="0.5" opacity="0.3" /></svg>',
        vision: {
            incantation: "The Void remains silent...",
            thought: "The ritual fizzled. The data stream was intercepted or corrupted by ethereal interference."
        },
        context: { intent, paradigm }
      };
    }
  }

  private static extractJson(text: string): any {
    if (!text) throw new Error("Empty response");

    // Strategy 1: Look for markdown code blocks
    const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch (e) {
        console.warn("Found code block but failed to parse:", e);
      }
    }

    // Strategy 2: Final fallback
    return JSON.parse(text);
  }
}
