import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/preferences';
import { technomancerModel } from "@/lib/gemini";
import { getPlanetaryHour } from "@/utils/CelestialLogic";
import { SwissEphemerisService } from "@/lib/SwissEphemerisService";
import { ChatMessage as ProtocolChatMessage } from "@/types/chat";
import { PersistenceService } from "@/lib/PersistenceService";
import { ConfigService } from "@/lib/ConfigService";
import { ResonanceService } from "@/lib/ResonanceService";
import { SpotifyService } from "@/lib/SpotifyService";
import { SearchService } from "@/lib/SearchService";

interface NumerologyPoint {
    core: string | number;
    archetype: string;
}

interface NumerologyProfile {
    lifePath: NumerologyPoint;
    destiny: NumerologyPoint;
    soulUrge?: NumerologyPoint;
    personality?: NumerologyPoint;
}

import { 
  AGRIPPA_LORE, 
  PGM_LORE, 
  PICATRIX_LORE, 
  ANTIQUITY_LORE, 
  ORACLES_LORE, 
  HERMETICA_LORE 
} from './MagicalTexts';

export type { ProtocolChatMessage as ChatMessage };


// Helper to retrieve active paradigm content
const getParadigmContent = (paradigm: string): string => {
    switch(paradigm) {
        case 'Agrippa': return AGRIPPA_LORE.map(e => `> [${e.source}] ${e.id}: ${e.content}`).join('\n');
        case 'PGM': return PGM_LORE.map(e => `> [${e.source}] ${e.id}: ${e.content}`).join('\n');
        case 'Picatrix': return PICATRIX_LORE.map(e => `> [${e.source}] ${e.id}: ${e.content}`).join('\n');
        case 'Antiquity': return ANTIQUITY_LORE.map(e => `> [${e.source}] ${e.id}: ${e.content}`).join('\n');
        case 'Oracles': return ORACLES_LORE.map(e => `> [${e.source}] ${e.id}: ${e.content}`).join('\n');
        case 'Hermetica': return HERMETICA_LORE.map(e => `> [${e.source}] ${e.id}: ${e.content}`).join('\n');
        default: return "";
    }
};

export class ChatService {
  static async sendMessage(userId: string, message: string, prefs: UserPreferences = DEFAULT_PREFERENCES, history: ProtocolChatMessage[] = []) {
    const weather = getPlanetaryHour();
    const paradigms = prefs.activeParadigms.join(', ');
    
    let chartContext = "";
    
    // NASA Level Accuracy Injection
    if (prefs.birthDate && prefs.birthLocation && prefs.useSwissEph) {
      try {
        const chart = await SwissEphemerisService.calculateChart(
          new Date(prefs.birthDate),
          prefs.birthLocation.lat,
          prefs.birthLocation.lng
        );
        
        const planetPositions = chart.planets.map(p => 
          `${p.name}: ${p.sign} ${p.degree.toFixed(2)}°${p.retrograde ? ' (Retrograde)' : ''}`
        ).join('\n');

        chartContext = `
[PRECISION_NATAL_CHART] (NASA-LEVEL ACCURACY)
Native: ${prefs.name}
Full Legal Name: ${prefs.fullName || "Not Provided"}
Birth Date: ${prefs.birthDate}
Location: ${prefs.birthLocation.city}
Coordinates: ${prefs.birthLocation.lat.toFixed(4)}, ${prefs.birthLocation.lng.toFixed(4)}
Positions:
${planetPositions}
Ascendant: ${chart.ascendant?.sign} ${chart.ascendant?.degree.toFixed(2)}°
[END_CHART]
`;
      } catch (e) {
        console.error("SwissEph failed during chat context generation:", e);
      }
    }

    const context = `
CURRENT CELESTIAL WEATHER:
- Day Ruler: ${weather.dayRuler}
- Hour Ruler: ${weather.hourRuler}
- Phase: ${weather.isDay ? 'Day' : 'Night'}
- Hour Number: ${weather.hourNumber}
- Current Earth Date: ${new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
- Current Earth Time: ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
${chartContext}
[USER_PREFERENCES]
Identity: ${prefs.name} (${prefs.pronouns})
Knowledge Level: ${prefs.knowledgeLevel}
Active Paradigms: ${paradigms}
Entropy Mode: ${prefs.allowEntropy ? 'PROTOCOL_CHAOS' : 'STABLE'}
Intent: ${prefs.intent}
[END_PREFERENCES]

[ACTIVE_MAGICAL_PARADIGMS]
The User has UNLOCKED the following archival texts. You MUST integrate these specific concepts, vocal styles, and ritual technologies into your response where relevant.
${prefs.activeParadigms.map(p => {
    const content = getParadigmContent(p);
    return content ? `\n=== SOURCE TEXT: ${p.toUpperCase()} ===\n${content}` : '';
}).join('\n')}
[END_PARADIGMS]
`;

    const systemPrompt = await ConfigService.getPrompt('technomancer_grimoire');
    
    try {
      // Map history to Gemini format
      const geminiHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }));

      const result = await technomancerModel.generateContent({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          { role: "user", parts: [{ text: context }] },
          ...geminiHistory,
          { role: "user", parts: [{ text: message }] }
        ],
        allowEntropy: prefs.allowEntropy
      });

      const response = await result.response;
      const candidate = response.candidates?.[0];
      
      let specificFallback = "";

      // Handle Tool Calls (Function Calling)
      interface GeminiToolCall {
          functionCall: {
              name: string;
              args: Record<string, string | number | boolean>;
          };
      }

      const toolCalls = candidate?.content?.parts?.filter((p: { functionCall?: unknown }) => p.functionCall) as unknown as GeminiToolCall[] | undefined;
      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls) {
          const { name, args } = call.functionCall;
          
          if (name === "trigger_resonance") {
            ResonanceService.playTone(String(args.planet), Number(args.duration) || 3000);
            specificFallback = `*I am aligning our frequency with the sphere of ${args.planet}. Let the resonance clear your mind.*`;
          } else if (name === "search_spotify_resonance") {
            SpotifyService.triggerSearch(String(args.query));
            specificFallback = `*Searching the aether for a sonic tapestry matching "${args.query}"...*`;
          } else if (name === "search_ethereal_knowledge") {
            SearchService.triggerSearch(String(args.query));
            specificFallback = `*Consulting the external archives for knowledge regarding "${args.query}"...*`;
          }
          
          // Note: In a production scenario, we would send the tool result back to Gemini
          // and continue the conversation loop. For real-time ritual audio, 
          // we execute and continue.
        }
      }

      let text = "";
      let voiceText = "";
      try {
        const rawText = response.text();
        
        // Attempt to parse as Hypophetes JSON if suspicious
        if (rawText.trim().startsWith('{')) {
          try {
            const data = JSON.parse(rawText);
            text = data.talisman_visual || data.text || rawText;
            voiceText = data.voice_transcript || data.audio || text;
          } catch {
            text = rawText;
            voiceText = rawText;
          }
        } else {
          text = rawText;
          voiceText = rawText;
        }
      } catch {
        // Gemini refused to generate text
      }

      // If text is effectively empty or whitespace, use fallback
      if (!text || text.trim() === "") {
         text = specificFallback || "*The frequencies shift in response to your presence.*";
         voiceText = text;
      }
      
      // Interface for Gemini response parts to avoid 'any'
      interface GeminiPart {
          text?: string;
          thought?: boolean | string;
      }

      // Extract thought if available in the parts
      const parts = candidate?.content?.parts as unknown as GeminiPart[] | undefined;
      const thoughtPart = parts?.find(p => p.thought === true || (typeof p.text === 'string' && p.text.startsWith('<thought>')));
      
      let thought: string | undefined;
      if (thoughtPart) {
          if (typeof thoughtPart.thought === 'string') {
              thought = thoughtPart.thought;
          } else if (thoughtPart.text) {
              thought = thoughtPart.text;
          }
      }
      
      // Persist to Akashic Records
      await PersistenceService.saveMessage(userId, "user", message);
      await PersistenceService.saveMessage(userId, "model", text, thought, voiceText);

      return {
        text,
        voiceText,
        thought_signature: thought,
      };
    } catch (error) {
      console.error("Theurgic connection failed:", error);
      throw error;
    }
  }

  // ... (generateNatalInterpretation method remains unchanged) ...

  static async generateArithmancyInterpretation(prefs: UserPreferences, numerologyData: NumerologyProfile): Promise<string> {
    const rawPrompt = await ConfigService.getPrompt('arithmancy_natal_integration');
    
    let chartData = "Natal chart data is unavailable. Focus on the mathematical vibrations.";
    if (prefs.birthDate && prefs.birthLocation) {
        try {
            const chart = await SwissEphemerisService.calculateChart(
                new Date(prefs.birthDate),
                prefs.birthLocation.lat,
                prefs.birthLocation.lng
            );
            chartData = chart.planets.map(p => 
                `${p.name}: ${p.sign} ${p.degree.toFixed(2)}°${p.retrograde ? ' (Retrograde)' : ''}`
            ).join('\n') + `\nAscendant: ${chart.ascendant?.sign} ${chart.ascendant?.degree.toFixed(2)}°`;
        } catch (e) {
            console.error("SwissEph failed during Arithmancy interpretation:", e);
        }
    }

    const prompt = rawPrompt
        .replace(/{{name}}/g, prefs.name)
        .replace(/{{lifePath}}/g, String(numerologyData.lifePath.core))
        .replace(/{{lifePathArchetype}}/g, numerologyData.lifePath.archetype)
        .replace(/{{destiny}}/g, String(numerologyData.destiny.core))
        .replace(/{{destinyArchetype}}/g, numerologyData.destiny.archetype)
        .replace(/{{soulUrge}}/g, String(numerologyData.soulUrge?.core || "Unknown"))
        .replace(/{{soulUrgeArchetype}}/g, numerologyData.soulUrge?.archetype || "Unknown")
        .replace(/{{personality}}/g, String(numerologyData.personality?.core || "Unknown"))
        .replace(/{{personalityArchetype}}/g, numerologyData.personality?.archetype || "Unknown")
        .replace(/{{chartData}}/g, chartData);

    try {
      const result = await technomancerModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
       console.error("Arithmancy Interpretation Failed", error);
       return "The frequencies are currently mismatched. The Technomancer is unable to synthesize the digital and celestial signals at this moment.";
    }
  }

  static async generateNatalInterpretation(name: string, chartData: string, useSafeMode = false): Promise<{ story: string, bigThree: string, cosmicSignature: string }> {
    console.log('[ChatService] 🚀 generateNatalInterpretation called. useSafeMode:', useSafeMode);
    
    const rawPrompt = await ConfigService.getPrompt('natal_interpretation');
    let prompt = rawPrompt
        .replace(/{{name}}/g, name)
        .replace(/{{chartData}}/g, chartData);

    if (useSafeMode) {
      prompt += "\n\n[SAFE_MODE: ACTIVE]\nBE EXTREMELY CONCISE. Skip complex lore. Provide a clear, structural reading. Use standard JSON.";
      // Remove long knowledge context if it was injected
      prompt = prompt.split('[GLOBAL MAGICAL ARCHIVE]')[0];
    }

    prompt += "\n\n[MODE: JSON]";

    console.log('[ChatService] 📝 Prompt length:', prompt.length, 'chars');

    try {
      console.log('[ChatService] 📡 Calling technomancerModel.generateContent...');
      const result = await technomancerModel.generateContent(prompt);
      console.log('[ChatService] 📥 Got result from technomancerModel');
      const response = await result.response;
      const text = response.text();
      console.log('[ChatService] 📜 Raw response text length:', text.length);
      console.log('[ChatService] 📜 Raw response text:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
      
      // 1. Repair Truncated JSON
      let jsonStr = text.trim();
      
      // Remove markdown code blocks if present
      jsonStr = jsonStr.replace(/^```json?\s*/i, '').replace(/```\s*$/i, '');
      
      const openBrackets = (jsonStr.match(/\{/g) || []).length;
      const closeBrackets = (jsonStr.match(/\}/g) || []).length;
      if (openBrackets > closeBrackets) {
        jsonStr += '}'.repeat(openBrackets - closeBrackets);
      }

      // 2. Extract JSON Block
      const match = jsonStr.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON structure found in response");
      
      let parsed: Record<string, unknown>;
      const jsonToParse = match[0];
      
      try {
        parsed = JSON.parse(jsonToParse);
      } catch (e1) {
        console.warn('[ChatService] ⚠️ First JSON.parse failed, attempting repairs...', e1);
        
        // Repair attempt 1: Fix unescaped quotes within strings
        let repaired = jsonToParse.replace(/"([^"]*)":\s*"([^"]*)"/g, (match, key, value) => {
          // Escape any unescaped quotes within the value
          const fixedValue = value.replace(/(?<!\\)"/g, '\\"');
          return `"${key}": "${fixedValue}"`;
        });
        
        try {
          parsed = JSON.parse(repaired);
        } catch {
          console.warn('[ChatService] ⚠️ Second repair failed, trying aggressive cleanup...');
          
          // Repair attempt 2: Remove problematic trailing content
          repaired = jsonToParse.replace(/,\s*"\w+"\s*:\s*"[^"]*$/g, '}');
          
          try {
            parsed = JSON.parse(repaired);
          } catch (e3) {
            console.error('[ChatService] ❌ All JSON repair attempts failed. Raw text:', jsonToParse);
            throw new Error(`JSON parsing failed after all repair attempts: ${e3}`);
          }
        }
      }

      // 3. Normalize Schema - Handle Technomancer's nested structures
      console.log('[ChatService] 🔍 Normalizing schema from parsed:', Object.keys(parsed));
      
      // Helper to extract text from nested Technomancer output
      const extractTechnomancerContent = (obj: Record<string, unknown>): { story: string, bigThree: string, cosmicSignature: string } | null => {
        // Broaden the search for root data - handle creative Technomancer naming
        const root = (obj.output || obj.analysis || obj.interpretation || obj.report || obj.output_log || obj.outputLog || obj) as Record<string, unknown>;
        if (root && typeof root === 'object') {
          const storyParts: string[] = [];
          let bigThreeContent = '';
          let signatureContent = '';
          
          // Helper to process a value that might be a string, object, or array
          const processValue = (key: string, value: unknown) => {
            if (!value) return;

            // Handle arrays (e.g., descent_of_the_soul: [...])
            if (Array.isArray(value)) {
              value.forEach(item => processValue(key, item));
              return;
            }

            // Handle objects (recursive)
            if (typeof value === 'object' && value !== null) {
              const objValue = value as Record<string, unknown>;
              // Priority: extract specific interpretation/description fields
              const text = (objValue.hermetic_interpretation || objValue.description || objValue.content || objValue.analysis || objValue.meaning || '') as string;
              if (typeof text === 'string' && text.length > 20) {
                if (key.includes('sphere') || key.includes('garment') || key.includes('descent') || key.includes('story') || key.includes('analysis') || 
                    key.includes('sun') || key.includes('spirit') || key.includes('intellect')) {
                  storyParts.push(text);
                }
              }
              // recurse to find deeper content
              Object.entries(value).forEach(([k, v]) => processValue(k, v));
              return;
            }

            // Handle strings
            if (typeof value === 'string' && value.length > 20) {
              const klow = key.toLowerCase();
              if (klow.includes('story') || klow.includes('narrative') || klow.includes('descent') || klow.includes('interpretation') || 
                  klow.includes('sun') || klow.includes('spirit') || klow.includes('intellect')) {
                storyParts.push(value);
              }
              if (klow.includes('three') || klow.includes('alignment')) {
                bigThreeContent = value;
              }
              if (klow.includes('signature') || klow.includes('essence')) {
                signatureContent = value;
              }
            }
          };

          Object.entries(root).forEach(([k, v]) => processValue(k, v));
          
          // --- SECONDARY HARVESTING (for missing fields) ---
          if (!bigThreeContent) {
            // Scan everything for Sun, Moon, Rising keywords
            const textToScan = storyParts.join(' ').toLowerCase();
            const planets = ['sun', 'moon', 'rising', 'ascendant'];
            const foundPlanets = planets.filter(p => textToScan.includes(p));
            if (foundPlanets.length > 0) {
              // Greedily grab lines that mention these planets
              bigThreeContent = storyParts.map(p => {
                const lines = p.split(/[.!?]/);
                const matchingLines = lines.filter(l => 
                  planets.some(planet => l.toLowerCase().includes(planet))
                );
                return matchingLines.join('. ');
              }).filter(Boolean).slice(0, 3).join('\n\n');
            }
          }
          
          if (!signatureContent && storyParts.length > 0) {
            // The last sentence often contains the distillation
            const lastPart = storyParts[storyParts.length - 1];
            const sentences = lastPart.split(/[.!?]/).filter(s => s.trim().length > 10);
            if (sentences.length > 0) {
              signatureContent = sentences[sentences.length - 1].trim();
            }
          }

          if (storyParts.length > 0) {
            // Deduplicate to avoid repeating content accidentally
            const uniqueParts = Array.from(new Set(storyParts));
            return {
              story: uniqueParts.join('\n\n'),
              bigThree: bigThreeContent || 'Celestial alignment revealed.',
              cosmicSignature: signatureContent || 'A soul in cosmic resonance.'
            };
          }
        }
        return null;
      };
      
      // Try Technomancer extraction first
      const technomancerExtract = extractTechnomancerContent(parsed);
      
      // Fallback chain for flat structures
      const story = technomancerExtract?.story || parsed.story || parsed.soul_descent || parsed.narrative || parsed.interpretation || "The soul's journey remains veiled...";
      const bigThree = technomancerExtract?.bigThree || parsed.bigThree || parsed.big_three || parsed.alignment || "Celestial alignment pending.";
      const cosmicSignature = technomancerExtract?.cosmicSignature || parsed.cosmicSignature || parsed.cosmic_signature || parsed.essence || "Mysterious Resonance.";

      console.log('[ChatService] ✅ Extracted story length:', typeof story === 'string' ? story.length : 0);

      // Ensure 'story' is actually a string (handles nested objects from AI)
      const storyText = typeof story === 'string' ? story : JSON.stringify(story);
      const bigThreeText = typeof bigThree === 'string' ? bigThree : JSON.stringify(bigThree);

      return {
        story: storyText,
        bigThree: bigThreeText,
        cosmicSignature: String(cosmicSignature)
      };

    } catch (error) {
       // DO NOT swallow the error here. Bubble it up so the UI can offer Safe Mode.
       console.error("Natal Interpretation Logic Failure:", error);
       throw error;
    }
  }

  static async generateSynastryReport(
    p1Name: string, p1Chart: string, p1Date: string,
    p2Name: string, p2Chart: string, p2Date: string,
    relationshipType: string,
    aspects: string
  ): Promise<string> {
    const rawPrompt = await ConfigService.getPrompt('synastry_report');
    const prompt = rawPrompt
        .replace(/{{p1Name}}/g, p1Name)
        .replace(/{{p1Date}}/g, p1Date)
        .replace(/{{p1Chart}}/g, p1Chart)
        .replace(/{{p2Name}}/g, p2Name)
        .replace(/{{p2Date}}/g, p2Date)
        .replace(/{{p2Chart}}/g, p2Chart)
        .replace(/{{relationshipType}}/g, relationshipType)
        .replace(/{{aspects}}/g, aspects);

    try {
      const result = await technomancerModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error("Received empty response from AI");
      }
      
      return text;
    } catch (error) {
      console.error("Synastry Analysis Failed", error);
      return `### Connection Obscured\n\nThe stars are silent at this moment. The celestial resonance between **${p1Name}** and **${p2Name}** is too complex for the current signal.\n\n*Please ensure both charts are valid and try establishing the link again.*`;
    }
  }
}
