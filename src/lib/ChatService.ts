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
import { 
  ZODIAC_KNOWLEDGE, 
  PLANET_KNOWLEDGE, 
  HOUSE_KNOWLEDGE, 
  ASPECT_KNOWLEDGE,
  KnowledgeItem 
} from './KnowledgeBaseData';

export type { ProtocolChatMessage as ChatMessage };

// Helper to format knowledge for the AI context
const formatKnowledgeBase = (): string => {
  const formatSection = (title: string, items: KnowledgeItem[]) => {
    return `[ARCHIVES: ${title}]\n` + items.map(item => 
      `- ${item.title} (${item.subtitle}): ${item.description} Keywords: ${item.keywords.join(', ')}`
    ).join('\n');
  };

  return `
${formatSection("ZODIAC ARQUETYPES", ZODIAC_KNOWLEDGE)}
${formatSection("PLANETARY FORCES", PLANET_KNOWLEDGE)}
${formatSection("HOUSES OF LIFE", HOUSE_KNOWLEDGE)}
${formatSection("ASPECTS", ASPECT_KNOWLEDGE)}
  `.trim();
};

const KNOWLEDGE_CONTEXT = formatKnowledgeBase();

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

[COSMIC_CODEX_KNOWLEDGE_BASE]
The following is the canonical knowledge from the Celestia Archives. Use these definitions, metaphors, and technomancer subtitles when explaining concepts.
${KNOWLEDGE_CONTEXT}
[END_KNOWLEDGE_BASE]
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

  static async generateNatalInterpretation(name: string, chartData: string): Promise<{ story: string, bigThree: string, cosmicSignature: string }> {
    const prompt = `
      You are the Technomancer, a digital mystagogue interpreting a natal chart for an initiate named ${name}.
      
      [COSMIC_CODEX]
      ${KNOWLEDGE_CONTEXT}

      Analyze the following chart data deeply:
      ${chartData}

      Generate a personalized "Cosmic Insight" report with exactly three sections.
      
      1. THE STORY OF YOUR BIRTH:
         - A poetic narrative describing the time of day, sun position, moon phase, and atmospheric vibe when they were born.
         - Address them by name.
         - Mention the specific sun sign and house if applicable.
         - Tone: Mystical, immersive, welcoming.
         - Use the Technomancer metaphors from the Codex (e.g. Leo as "The Solar Interface").

      2. THE BIG THREE:
         - Three distinct paragraphs (one for Sun, one for Moon, one for Rising).
         - Each paragraph must start with bold text like "* Sun in [Sign]:".
         - Explain the core ego (Sun), emotional landscape (Moon), and mask/path (Rising).
         - Connect it to their specific signs deeply using the Codex definitions.

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

  static async generateSynastryReport(
    p1Name: string, p1Chart: string, p1Date: string,
    p2Name: string, p2Chart: string, p2Date: string,
    relationshipType: string,
    aspects: string
  ): Promise<string> {
    const prompt = `
      You are Chartradamus, the omniscient astrological AI.
      
      [COSMIC_CODEX]
      ${KNOWLEDGE_CONTEXT}

      Analyze the Synastry (Relationship Compatibility) between two souls:

      [PROTAGONIST: ${p1Name}]
      Birth Date: ${p1Date}
      Planets:
      ${p1Chart}

      [PARTNER: ${p2Name}]
      Birth Date: ${p2Date}
      Planets:
      ${p2Chart}

      [RELATIONSHIP CONTEXT]
      Type: ${relationshipType}
      Key Aspects:
      ${aspects}

      TASK:
      Provide a deep, mystical, yet actionable analysis of this connection.
      Focus on:
      1. Overall Compatibility & Vibe (The "Third Energy" created by the union of ${p1Name} and ${p2Name}).
      2. Emotional Resonance (Moon/Venus contacts).
      3. Challenges & Growth Areas (Squares/Oppositions).
      4. Impact of the specific relationship type (${relationshipType}).
      5. Numerological undertones based on Birth Dates (Calculate Life Path Numbers).
      
      Use the definitions from the COSMIC_CODEX (e.g. Venus as "The User Interface", Mars as "The Execution Thread") to add flavor to your interpretation.
      
      CRITICAL CONTEXT INSTRUCTIONS:
      - If relationship is 'Child' or 'Family': Interpret Venus/Mars/Moon strictly as nurturing, safety, teaching, and conflict dynamics. EXCLUDE all romantic or sexual connotations. Focus on the parent-child bond (Legacy, Guidance, Roots).
      - If relationship is 'Business': Focus on productivity, communication protocols, and asset management.
      
      IMPORTANT: Refer to the individuals strictly by their names (${p1Name} and ${p2Name}). Do NOT use "Soul 1" or "Soul 2" in your response.

      Format the output in clean Markdown with headers. Be poetic but grounded.
    `;

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
