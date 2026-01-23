
import { GoogleGenAI, Type } from "@google/genai";
import { BirthInfo, NatalChartData } from "../types";

export const generateNatalChart = async (info: BirthInfo): Promise<NatalChartData> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Generate an astrological natal chart for the following birth details:
    Date: ${info.date}
    Time: ${info.time}
    Location: ${info.location} (Lat: ${info.lat ?? 'unknown'}, Lng: ${info.lng ?? 'unknown'})

    Calculate the zodiac sign, degree (0-30), and house for the Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, and Pluto.
    Provide a concise (2-sentence) spiritual interpretation for each placement.
    Also provide a short overall summary of the chart.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          planets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                sign: { type: Type.STRING },
                degree: { type: Type.NUMBER },
                house: { type: Type.INTEGER },
                interpretation: { type: Type.STRING }
              },
              required: ["name", "sign", "degree", "house", "interpretation"]
            }
          },
          ascendant: { type: Type.STRING },
          summary: { type: Type.STRING }
        },
        required: ["planets", "ascendant", "summary"]
      },
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  const rawData = JSON.parse(response.text);
  
  // Add styling/visual properties to the response
  const planetConfigs: Record<string, { color: string; size: number; baseDistance: number }> = {
    "Sun": { color: "#FFD700", size: 2.2, baseDistance: 0 },
    "Moon": { color: "#F5F5F5", size: 0.6, baseDistance: 12 },
    "Mercury": { color: "#A9A9A9", size: 0.4, baseDistance: 18 },
    "Venus": { color: "#E9967A", size: 0.7, baseDistance: 25 },
    "Mars": { color: "#FF4500", size: 0.6, baseDistance: 32 },
    "Jupiter": { color: "#DAA520", size: 1.4, baseDistance: 45 },
    "Saturn": { color: "#F4A460", size: 1.2, baseDistance: 58 },
    "Uranus": { color: "#AFEEEE", size: 1.0, baseDistance: 70 },
    "Neptune": { color: "#4169E1", size: 1.0, baseDistance: 82 },
    "Pluto": { color: "#DCDCDC", size: 0.3, baseDistance: 95 },
  };

  const processedPlanets = rawData.planets.map((p: any) => ({
    ...p,
    color: planetConfigs[p.name]?.color ?? "#FFFFFF",
    size: planetConfigs[p.name]?.size ?? 0.5,
    distance: planetConfigs[p.name]?.baseDistance ?? 0
  }));

  return {
    ...rawData,
    planets: processedPlanets
  };
};
