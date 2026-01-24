import { functions } from "./firebase";
import { httpsCallable } from "firebase/functions";

// Mock implementation of the Gemini model that routes through our Firebase Proxy
// This resolves the 403 "unregistered caller" error by providing identity via Firebase Auth
const proxyCall = async (data: any) => {
  if (!functions) throw new Error("Firebase Functions not initialized");
  const call = httpsCallable(functions, 'geminiProxy');
  const result = await call(data);
  return result.data as any;
};

export const technomancerModel = {
  generateContent: async (args: any) => {
    // Normalize arguments (can be string, array of parts, or object)
    let contents = [];
    if (typeof args === 'string') {
      contents = [{ role: 'user', parts: [{ text: args }] }];
    } else if (Array.isArray(args)) {
      contents = [{ role: 'user', parts: args }];
    } else if (args.contents) {
      contents = args.contents;
    }

    const result = await proxyCall({
      model: "gemini-3-pro-preview",
      contents,
      generationConfig: args.generationConfig || {},
      systemInstruction: args.systemInstruction || undefined
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

export const getThinkingModel = (level: "high" | "low" | "none" = "high") => {
  return technomancerModel;
};

// Re-export SchemaType if needed, but we might not need the actual SDK on the client anymore
export { SchemaType } from "@google/generative-ai";
