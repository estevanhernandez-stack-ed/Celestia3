import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const genAI = new GoogleGenerativeAI(apiKey);

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

export const getThinkingModel = (level: "high" | "low" | "none" = "high") => {
  return genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
    generationConfig: {},
  });
};
