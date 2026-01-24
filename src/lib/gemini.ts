import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";
import { ConfigService } from "./ConfigService";
import { KnowledgeService } from "./KnowledgeService";

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
  const call = httpsCallable(functions, 'geminiProxy');
  const result = await call(data);
  return result.data as ProxyResult;
};

export const technomancerModel = {
  generateContent: async (args: string | GeminiPart[] | GenerateContentArgs) => {
    // Normalize arguments (can be string, array of parts, or object)
    let contents: GeminiContent[] = [];
    let generationConfig: Record<string, unknown> = {};
    let systemInstruction: string | undefined = undefined;

    if (typeof args === 'string') {
      contents = [{ role: 'user', parts: [{ text: args }] }];
    } else if (Array.isArray(args)) {
      contents = [{ role: 'user', parts: args }];
    } else {
      contents = args.contents || [];
      generationConfig = args.generationConfig || {};
      systemInstruction = args.systemInstruction;
    }

    const directive = await ConfigService.getGlobalDirective();
    let masterSystemInstruction = `${directive.persona}\n\n[MASTER DIRECTIVE]\n${directive.masterDirective}\n\n[DEFAULT FORMAT]\n${directive.defaultFormat}`;

    if (directive.isKnowledgeSyncEnabled) {
      const knowledge = KnowledgeService.getGlobalKnowledgeContext(directive.knowledgeFocus);
      masterSystemInstruction += `\n\n[GLOBAL KNOWLEDGE BASE]\n${knowledge}`;
    }

    if (systemInstruction) {
      masterSystemInstruction += `\n\n[TASK SPECIFIC INSTRUCTIONS]\n${systemInstruction}`;
    }

    const result = await proxyCall({
      model: "gemini-3-pro-preview",
      contents,
      generationConfig,
      systemInstruction: masterSystemInstruction
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

export const getThinkingModel = (_level: "high" | "low" | "none" = "high") => {
  return technomancerModel;
};

// Re-export SchemaType if needed, but we might not need the actual SDK on the client anymore
export { SchemaType } from "@google/generative-ai";
