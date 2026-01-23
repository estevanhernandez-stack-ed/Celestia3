/**
 * Gemini AI Service - Celestia 3
 * 
 * NOTE: This module uses the direct Gemini SDK for features requiring function calling (tools).
 * For simple text generation, prefer GeminiProxyService which is rate-limited and secure.
 * 
 * The API key is still client-side for legacy function calling support.
 * TODO: Migrate to server-side proxy with full tool support when available.
 */
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { auth } from "./firebase";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

// Warn if no API key configured
if (!apiKey && typeof window !== 'undefined') {
  console.warn("⚠️ [Gemini] No API key configured. AI features will not work.");
}

export const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Check if the current user is authenticated before making AI calls.
 * Throws an error if user is not signed in.
 */
export function requireAuth(): void {
  if (!auth.currentUser) {
    throw new Error("You must be signed in to use AI features.");
  }
}

/**
 * The Technomancer model with function calling capabilities.
 * Use this for chat interactions that need tool execution (resonance, search, etc.)
 */
export const technomancerModel = genAI.getGenerativeModel({
  model: "gemini-3-pro-preview",
  generationConfig: {},
  tools: [
    {
      functionDeclarations: [
        {
          name: "trigger_resonance",
          description: "Generates a procedural planetary frequency (Hertz) to ground a ritual based on the Cosmic Octave.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              planet: {
                type: SchemaType.STRING,
                description: "The planet (Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Earth).",
              },
              duration: {
                type: SchemaType.NUMBER,
                description: "Duration in milliseconds.",
              }
            },
            required: ["planet"]
          }
        },
        {
          name: "search_spotify_resonance",
          description: "Searches for Spotify playlists or tracks that match a specific magical intent or planetary vibe.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              query: {
                type: SchemaType.STRING,
                description: "The magical intent or vibe to search for (e.g. 'Venusian Love').",
              }
            },
            required: ["query"]
          }
        },
        {
          name: "search_ethereal_knowledge",
          description: "Searches for external knowledge, current events, or esoteric references.",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              query: {
                type: SchemaType.STRING,
                description: "The search query.",
              }
            },
            required: ["query"]
          }
        }
      ]
    }
  ]
});

/**
 * Get a thinking model for complex reasoning tasks.
 * @deprecated Use GeminiProxyService.generateContent for simple text generation.
 */
export const getThinkingModel = (_level: "high" | "low" | "none" = "high") => {
  return genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    generationConfig: {},
  });
};
