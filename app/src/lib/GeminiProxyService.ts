import { getFunctions, httpsCallable, HttpsCallableResult } from "firebase/functions";
import { app } from "./firebase";

// Initialize Functions with region
const functions = getFunctions(app, "us-central1");

export interface GeminiProxyRequest {
  model?: string;
  contents: Array<{
    role: string;
    parts: Array<{ text: string }>;
  }>;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    topP?: number;
    topK?: number;
  };
  systemInstruction?: {
    parts: Array<{ text: string }>;
  };
}

export interface GeminiProxyResponse {
  candidates: Array<{
    content: {
      parts: Array<{ text: string }>;
      role: string;
    };
    finishReason: string;
  }>;
  _rateLimit?: {
    remaining: number;
  };
}

export interface RateLimitStatus {
  remaining: number;
  resetIn: number | null;
}

/**
 * Service for interacting with the rate-limited Gemini proxy.
 * Uses Firebase Cloud Functions for secure API key handling.
 */
export class GeminiProxyService {
  private static geminiProxy = httpsCallable<GeminiProxyRequest, GeminiProxyResponse>(
    functions,
    "geminiProxy"
  );

  private static getRateLimitStatus = httpsCallable<unknown, RateLimitStatus>(
    functions,
    "getRateLimitStatus"
  );

  /**
   * Send a message to the Gemini API through the rate-limited proxy.
   */
  static async generateContent(request: GeminiProxyRequest): Promise<GeminiProxyResponse> {
    try {
      const result: HttpsCallableResult<GeminiProxyResponse> = await this.geminiProxy(request);
      return result.data;
    } catch (error: unknown) {
      const funcError = error as { code?: string; message?: string; details?: unknown };
      
      if (funcError.code === "functions/resource-exhausted") {
        throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
      }
      
      if (funcError.code === "functions/unauthenticated") {
        throw new Error("You must be signed in to use AI features.");
      }
      
      console.error("GeminiProxy error:", error);
      throw new Error(funcError.message || "Failed to generate AI response.");
    }
  }

  /**
   * Check the current rate limit status for display in the UI.
   */
  static async checkRateLimit(): Promise<RateLimitStatus> {
    try {
      const result = await this.getRateLimitStatus({});
      return result.data;
    } catch (error) {
      console.error("Rate limit check failed:", error);
      return { remaining: 20, resetIn: null }; // Fallback
    }
  }

  /**
   * Helper to build a simple text generation request.
   */
  static buildRequest(
    userMessage: string,
    systemPrompt?: string,
    conversationHistory?: Array<{ role: string; content: string }>
  ): GeminiProxyRequest {
    const contents: GeminiProxyRequest["contents"] = [];

    // Add conversation history
    if (conversationHistory) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.content }],
        });
      }
    }

    // Add current user message
    contents.push({
      role: "user",
      parts: [{ text: userMessage }],
    });

    const request: GeminiProxyRequest = {
      model: "gemini-3-pro-preview",
      contents,
      generationConfig: {
        temperature: 0.8,
        maxOutputTokens: 2048,
      },
    };

    if (systemPrompt) {
      request.systemInstruction = {
        parts: [{ text: systemPrompt }],
      };
    }

    return request;
  }
}
