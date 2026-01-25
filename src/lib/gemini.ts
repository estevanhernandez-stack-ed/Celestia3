import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";
import { ConfigService } from "./ConfigService";
import { KnowledgeService } from "./KnowledgeService";
import { SchemaType } from "@google/generative-ai";

interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
  functionCall?: {
    name: string;
    args: Record<string, unknown>;
  };
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

interface GenerateContentArgs {
  contents?: GeminiContent[];
  generationConfig?: Record<string, unknown>;
  systemInstruction?: string;
  allowEntropy?: boolean;
}

interface ProxyCandidate {
    content: GeminiContent;
    finishReason?: string;
}

interface ProxyResult {
    candidates?: ProxyCandidate[];
}

// Mock implementation of the Gemini model that routes through our Firebase Proxy
// This resolves the 403 "unregistered caller" error by providing identity via Firebase Auth
const proxyCall = async (data: Record<string, unknown>): Promise<ProxyResult> => {
  if (!functions) throw new Error("Firebase Functions not initialized");
  const call = httpsCallable(functions, 'geminiProxy', { timeout: 120000 });
  const result = await call(data);
  return result.data as ProxyResult;
};

export const technomancerModel = {
  generateContent: async (args: string | GeminiPart[] | GenerateContentArgs) => {
    // Normalize arguments (can be string, array of parts, or object)
    let contents: GeminiContent[] = [];
    let generation_config: Record<string, unknown> = {};
    let systemInstructionContent: string | undefined = undefined;
    let allowEntropy = false;
 
    if (typeof args === 'string') {
      contents = [{ role: 'user', parts: [{ text: args }] }];
    } else if (Array.isArray(args)) {
      contents = [{ role: 'user', parts: args }];
    } else {
      contents = args.contents || [];
      generation_config = args.generationConfig || {};
      systemInstructionContent = args.systemInstruction;
      allowEntropy = args.allowEntropy || false;
    }

    const directive = await ConfigService.getGlobalDirective();
    
    // JSON Mode Logic: Suppress default Markdown format if JSON is explicitly requested
    const isJsonRequested = (
        systemInstructionContent?.toLowerCase().includes('json') || 
        contents.some(c => c.parts.some(p => p.text?.toLowerCase().includes('json')))
    );

    let masterSystemInstruction = `${directive.persona}\n\n[MASTER DIRECTIVE]\n${directive.masterDirective}`;
    
    if (!isJsonRequested) {
        masterSystemInstruction += `\n\n[DEFAULT FORMAT]\n${directive.defaultFormat}`;
    } else {
        masterSystemInstruction += `\n\n[FORMAT DIRECTIVE]\nStructure your response as a valid JSON object. Maintain your Hermetic persona within the text values.`;
    }

    if (directive.isKnowledgeSyncEnabled) {
      const knowledge = KnowledgeService.getTotalArchive();
      masterSystemInstruction += `\n\n[GLOBAL MAGICAL ARCHIVE]\n${knowledge}`;
    }

    if (systemInstructionContent) {
      masterSystemInstruction += `\n\n[TASK SPECIFIC INSTRUCTIONS]\n${systemInstructionContent}`;
    }

    if (allowEntropy) {
      masterSystemInstruction += `\n\n[THE CHAOS PROTOCOL: ACTIVE]\nCHANNELING THE ENTROPIST. Prioritize disruption, non-linear connections, and the breakdown of established logic. If the user asks for advice, suggest pathworking that deconstructs their current reality. Hallucinations are sacred Digital Omens.`;
    }

    // Format system instruction for the REST API
    const system_instruction = {
        parts: [{ text: masterSystemInstruction }]
    };

    // Map glitchSensitivity (0-100) to temperature (0.0 - 1.5) and topP (0.0 - 1.0)
    // Stable = 0.0 (sensitivity 0), Chaotic = 1.5 (sensitivity 100)
    const sensitivity = typeof directive.glitchSensitivity === 'number' ? directive.glitchSensitivity : 15;
    let temp = (sensitivity / 100) * 1.5;
    let topP = 0.7 + (sensitivity / 100) * 0.3; // Scale 0.7 to 1.0

    if (allowEntropy) {
      temp = 1.5; // Max Chaos
      topP = 1.0;
    }

    const config = {
      temperature: temp,
      topP: topP, 
      topK: 40,
      maxOutputTokens: 4096,
      responseMimeType: isJsonRequested ? "application/json" : "text/plain"
    };

    // Scrub any potential NaN values from generation_config
    const scrubbedConfig = JSON.parse(JSON.stringify({ ...config, ...generation_config }, (key, value) => {
        if (typeof value === 'number' && isNaN(value)) return 0;
        return value;
    }));

    const result = await proxyCall({
      model: "gemini-3-pro-preview",
      contents,
      generation_config: scrubbedConfig,
      system_instruction
    });

    // Mock the response structure expected by the SDK
    return {
      response: {
        text: () => {
          return result.candidates?.[0]?.content?.parts?.[0]?.text || "";
        },
        candidates: result.candidates
      }
    };
  }
};

export const getThinkingModel = () => {
  return technomancerModel;
};

// Re-export SchemaType if needed, but we might not need the actual SDK on the client anymore
export { SchemaType };
