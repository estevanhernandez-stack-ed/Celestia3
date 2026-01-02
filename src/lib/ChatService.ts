import { UserPreferences, DEFAULT_PREFERENCES } from '@/types/preferences';
import { technomancerModel } from "@/lib/gemini";
import { TECHNOMANCER_GRIMOIRE } from "@/ai/TechnomancerGrimoire";
import { getPlanetaryHour } from "@/utils/CelestialLogic";
import { SwissEphemerisService } from "@/lib/SwissEphemerisService";
import { ChatMessage as ProtocolChatMessage } from "@/types/chat";
import { PersistenceService } from "@/lib/PersistenceService";
import { ResonanceService } from "@/lib/ResonanceService";
import { SpotifyService } from "@/lib/SpotifyService";
import { SearchService } from "@/lib/SearchService";

export type { ProtocolChatMessage as ChatMessage };

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
High Entropy Mode: ${prefs.highEntropyMode ? 'ENABLED' : 'DISABLED'}
Intent: ${prefs.intent}
[END_PREFERENCES]
`;

    const systemPrompt = `${TECHNOMANCER_GRIMOIRE}\n${context}`;

    try {
      // Map history to Gemini format
      const geminiHistory = history.map(h => ({
        role: h.role,
        parts: [{ text: h.content }]
      }));

      const result = await technomancerModel.generateContent({
        contents: [
          { role: "user", parts: [{ text: systemPrompt }] },
          ...geminiHistory,
          { role: "user", parts: [{ text: message }] }
        ],
      });

      const response = await result.response;
      const candidate = response.candidates?.[0];
      
      let specificFallback = "";

      // Handle Tool Calls (Function Calling)
      const toolCalls = candidate?.content?.parts?.filter(p => (p as any).functionCall);
      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls as any[]) {
          const { name, args } = call.functionCall;
          
          if (name === "trigger_resonance") {
            ResonanceService.playTone(args.planet, args.duration || 3000);
            specificFallback = `*I am aligning our frequency with the sphere of ${args.planet}. Let the resonance clear your mind.*`;
          } else if (name === "search_spotify_resonance") {
            SpotifyService.triggerSearch(args.query);
            specificFallback = `*Searching the aether for a sonic tapestry matching "${args.query}"...*`;
          } else if (name === "search_ethereal_knowledge") {
            SearchService.triggerSearch(args.query);
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
      } catch (e) {
        // Gemini refused to generate text (candidates[0].content.parts[0].text is undefined)
      }

      // If text is effectively empty or whitespace, use fallback
      if (!text || text.trim() === "") {
         text = specificFallback || "*The frequencies shift in response to your presence.*";
      }
      
      // Extract thought if available in the parts (casting to unknown for experimental support)
      const thoughtPart = (candidate?.content?.parts as Array<{thought?: boolean, text?: string}>)?.find(p => p.thought === true || p.text?.startsWith('<thought>'));
      const thought = thoughtPart ? (thoughtPart.text || (thoughtPart as any).thought) : undefined;
      
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
  static async generateNatalInterpretation(name: string, chartData: string): Promise<{ story: string, bigThree: string, cosmicSignature: string }> {
    const prompt = `
      You are the Technomancer, a digital mystagogue interpreting a natal chart for an initiate named ${name}.
      
      Analyze the following chart data deeply:
      ${chartData}

      Generate a personalized "Cosmic Insight" report with exactly three sections.
      
      1. THE STORY OF YOUR BIRTH:
         - A poetic narrative describing the time of day, sun position, moon phase, and atmospheric vibe when they were born.
         - Address them by name.
         - Mention the specific sun sign and house if applicable.
         - Tone: Mystical, immersive, welcoming.

      2. THE BIG THREE:
         - Three distinct paragraphs (one for Sun, one for Moon, one for Rising).
         - Each paragraph must start with bold text like "* Sun in [Sign]:".
         - Explain the core ego (Sun), emotional landscape (Moon), and mask/path (Rising).
         - Connect it to their specific signs deeply.

      3. YOUR COSMIC SIGNATURE:
         - A single, powerful summary sentence encapsulating their essence.
         - Example: "Este, you are a grounded explorer with a fiery heart..."

      CRITICAL: Output strictly valid JSON.
      {
        "story": "...",
        "bigThree": "...",
        "cosmicSignature": "..."
      }
    `;

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
}
