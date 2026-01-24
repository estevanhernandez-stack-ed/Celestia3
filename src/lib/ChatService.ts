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
      try {
        text = response.text();
      } catch {
        // Gemini refused to generate text
      }

      // If text is effectively empty or whitespace, use fallback
      if (!text || text.trim() === "") {
         text = specificFallback || "*The frequencies shift in response to your presence.*";
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
      await PersistenceService.saveMessage(userId, "model", text, thought);

      return {
        text,
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

  static async generateNatalInterpretation(name: string, chartData: string): Promise<{ story: string, bigThree: string, cosmicSignature: string }> {
    const rawPrompt = await ConfigService.getPrompt('natal_interpretation');
    const prompt = rawPrompt
        .replace(/{{name}}/g, name)
        .replace(/{{chartData}}/g, chartData);

    try {
      const result = await technomancerModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Robust Parsing
      let jsonStr = text;
      const match = text.match(/\{[\s\S]*\}/);
      if (match) jsonStr = match[0];

      return JSON.parse(jsonStr);

    } catch (error) {
       console.error("Natal Interpretation Failed", error);
       return {
           story: "The stars align in mysterious ways, but the signal is currently faint...",
           bigThree: "* Sun: Unknown\n* Moon: Unknown\n* Rising: Unknown",
           cosmicSignature: "A mystery waiting to be unfolded."
       };
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
