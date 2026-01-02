import { technomancerModel } from "./gemini";
import { PersistenceService } from "./PersistenceService";

export interface RitualResult {
  sigil: string;
  vision: {
    incantation: string;
    thought: string;
  };
  context: {
    intent: string;
    paradigm: string;
  };
}

export class RitualService {
  static async performRitual(userId: string, intent: string, paradigm: string): Promise<RitualResult> {
    const prompt = `
      Perform a ${paradigm} ritual for the following intent: "${intent}"
      1. Generate a procedural SVG Sigil code (valid SVG string).
      2. Compose a unique incantation.
      3. Reveal your internal alchemical reasoning.

      CRITICAL: Output STRICT JSON ONLY. No markdown, no code blocks.
      Refrain from adding code block wrappers. Just the raw JSON object.

      Structure:
      {
        "sigil": "<svg>...</svg>",
        "vision": {
            "incantation": "...",
            "thought": "..."
        },
        "context": {
            "intent": "${intent}",
            "paradigm": "${paradigm}"
        }
      }
    `;

    const result = await technomancerModel.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log("Raw Ritual Response:", text); // Debugging

    try {
      // Robust JSON extraction
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      const data = JSON.parse(jsonMatch[0]);
      
      // Persist to Akashic Records
      await PersistenceService.saveMessage(userId, "model", `Ritual Performed: ${data.incantation}`, data.thought_signature);

      return data;
    } catch (error) {
      console.error("Ritual Parsing Failed:", error);
      // Fallback or re-throw
      throw new Error("The ritual fizzled. The void returned unintelligible static.");
    }
  }
}
