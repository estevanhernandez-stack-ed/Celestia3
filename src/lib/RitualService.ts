import { technomancerModel } from "./gemini";
import { PersistenceService } from "./PersistenceService";

export interface RitualResult {
  sigil_svg: string;
  incantation: string;
  thought_signature: string;
}

export class RitualService {
  static async performRitual(userId: string, intent: string, paradigm: string): Promise<RitualResult> {
    const prompt = `
      Perform a ${paradigm} ritual for the following intent: "${intent}"
      1. Generate a procedural SVG Sigil.
      2. Compose a unique incantation in the style of the paradigm.
      3. Reveal your internal alchemical reasoning (thought signature).

      Output JSON:
      {
        "sigil_svg": "<svg>...</svg>",
        "incantation": "...",
        "thought_signature": "..."
      }
    `;

    const result = await technomancerModel.generateContent(prompt);
    const response = await result.response;
    const data = JSON.parse(response.text().replace(/```json|```/g, ''));

    // Persist to Akashic Records
    await PersistenceService.saveMessage(userId, "model", `Ritual Performed: ${data.incantation}`, data.thought_signature);

    return data;
  }
}
