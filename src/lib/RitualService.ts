import { technomancerModel } from "./gemini";
import { PersistenceService } from "./PersistenceService";
import { ConfigService } from "./ConfigService";

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
    const rawPrompt = await ConfigService.getPrompt('ritual_generation');
    const prompt = rawPrompt
      .replace(/{{paradigm}}/g, paradigm)
      .replace(/{{intent}}/g, intent);

    const result = await technomancerModel.generateContent(prompt);
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
          await PersistenceService.saveMessage(userId, "model", `Ritual Performed: ${data.vision.incantation}`, data.vision.thought);
      }

      return data;
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

    // Strategy 2: Improved balanced brace matching
    // Finds all top-level balanced blocks and tries to parse them
    const potentialObjects: any[] = [];
    let stack = 0;
    let startIdx = -1;

    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
            if (stack === 0) startIdx = i;
            stack++;
        } else if (text[i] === '}') {
            stack--;
            if (stack === 0 && startIdx !== -1) {
                const potential = text.substring(startIdx, i + 1);
                try {
                    potentialObjects.push(JSON.parse(potential));
                } catch (err) {
                    // Partial parse failure, keep looking
                }
            }
            if (stack < 0) stack = 0; // Reset on extra closing braces
        }
    }

    // Return the last found object (usually the most complete one in LLM outputs)
    if (potentialObjects.length > 0) {
        return potentialObjects[potentialObjects.length - 1];
    }

    // Strategy 3: Final fallback - try parsing the whole thing if it's small/simple
    return JSON.parse(text);
  }
}
