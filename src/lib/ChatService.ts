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
Birth Date: ${prefs.birthDate}
Location: ${prefs.birthLocation.city}
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
      
      // Handle Tool Calls (Function Calling)
      const toolCalls = candidate?.content?.parts?.filter(p => (p as any).functionCall);
      if (toolCalls && toolCalls.length > 0) {
        for (const call of toolCalls as any[]) {
          const { name, args } = call.functionCall;
          
          if (name === "trigger_resonance") {
            ResonanceService.playTone(args.planet, args.duration || 3000);
          } else if (name === "search_spotify_resonance") {
            SpotifyService.triggerSearch(args.query);
          } else if (name === "search_ethereal_knowledge") {
            SearchService.triggerSearch(args.query);
          }
          
          // Note: In a production scenario, we would send the tool result back to Gemini
          // and continue the conversation loop. For real-time ritual audio, 
          // we execute and continue.
        }
      }

      const text = response.text();
      
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
}
