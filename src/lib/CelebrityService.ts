import { NatalChartData } from "@/types/astrology";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { SwissEphemerisService } from "@/lib/SwissEphemerisService";

export interface Celebrity {
  id: string;
  name: string;
  birthDate: string; // ISO
  location: string;
  lat: number;
  lng: number;
  description: string;
  category: 'Music' | 'Science' | 'Art' | 'Philosophy' | 'Tech' | 'History';
}

export interface CelebrityChartDocument {
  id: string;
  name: string;
  chartData: NatalChartData;
  generatedAt: Timestamp;
}

export const CELEBRITIES: Celebrity[] = [
  {
    id: 'david-bowie',
    name: 'David Bowie',
    birthDate: '1947-01-08T09:00:00Z',
    location: 'Brixton, London',
    lat: 51.46,
    lng: -0.11,
    description: 'The Starman. A master of reinvention and cosmic expression.',
    category: 'Music'
  },
  {
    id: 'alan-turing',
    name: 'Alan Turing',
    birthDate: '1912-06-23T02:15:00Z',
    location: 'Maida Vale, London',
    lat: 51.52,
    lng: -0.18,
    description: 'Father of theoretical computer science and artificial intelligence.',
    category: 'Science'
  },
  {
    id: 'prince',
    name: 'Prince',
    birthDate: '1958-06-07T18:17:00Z',
    location: 'Minneapolis, MN',
    lat: 44.97,
    lng: -93.26,
    description: 'The Purple One. A musical genius who blended the sacred and profane.',
    category: 'Music'
  },
  {
    id: 'ada-lovelace',
    name: 'Ada Lovelace',
    birthDate: '1815-12-10T13:00:00Z',
    location: 'London, UK',
    lat: 51.50,
    lng: -0.12,
    description: 'The world\'s first computer programmer.',
    category: 'Science'
  },
  {
    id: 'steve-jobs',
    name: 'Steve Jobs',
    birthDate: '1955-02-24T19:15:00Z',
    location: 'San Francisco, CA',
    lat: 37.77,
    lng: -122.41,
    description: 'Visionary who revolutionized technology and design.',
    category: 'Tech'
  },
  {
    id: 'marilyn-monroe',
    name: 'Marilyn Monroe',
    birthDate: '1926-06-01T09:30:00Z',
    location: 'Los Angeles, CA',
    lat: 34.05,
    lng: -118.24,
    description: 'The ultimate Hollywood icon and symbol of vulnerable glamour.',
    category: 'Art'
  }
];

export class CelebrityService {
  static getCelebrities(customCelebs?: Celebrity[]) {
    if (customCelebs && customCelebs.length > 0) {
      return [...CELEBRITIES, ...customCelebs];
    }
    return CELEBRITIES;
  }

  /**
   * Fetches a precomputed natal chart for a celebrity from Firestore.
   * If not found, attempts to calculate it on-the-fly if full celebrity data is provided.
   */
  static async getCelebrityChart(celebrityId: string, fallbackCeleb?: Celebrity): Promise<NatalChartData | null> {
    try {
      console.log(`[CelebrityService] Fetching chart for ${celebrityId}...`);
      
      // 1. Try Firestore first
      const docRef = doc(db, 'celebrity_charts', celebrityId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as CelebrityChartDocument;
        console.log(`[CelebrityService] Chart found in Firestore for ${celebrityId}`);
        return data.chartData;
      }

      // 2. If not in firestore, but we have the data, calculate now
      const celeb = fallbackCeleb || this.getCelebrityById(celebrityId);
      if (celeb) {
        console.log(`[CelebrityService] Calculating on-the-fly for ${celeb.name} (${celeb.birthDate})...`);
        // Ensure date is valid for Swiss Ephemeris
        const date = new Date(celeb.birthDate);
        if (isNaN(date.getTime())) {
            throw new Error(`Invalid birth date: ${celeb.birthDate}`);
        }

        return await SwissEphemerisService.calculateChart(
          date,
          celeb.lat,
          celeb.lng
        );
      }

      console.warn(`[CelebrityService] No celebrity data found to calculate chart for ${celebrityId}`);
      return null;
    } catch (e) {
      console.error(`[CelebrityService] Failed to fetch/calculate chart for ${celebrityId}`, e);
      return null;
    }
  }

  /**
   * Seeds all celebrity charts to Firestore. Called from Admin Panel.
   */
  static async seedAllCelebrityCharts(): Promise<{ success: number; failed: string[] }> {
    const failed: string[] = [];
    let success = 0;

    for (const celeb of CELEBRITIES) {
      try {
        console.log(`[CelebrityService] Calculating chart for ${celeb.name}...`);
        const chartData = await SwissEphemerisService.calculateChart(
          new Date(celeb.birthDate),
          celeb.lat,
          celeb.lng
        );

        const docRef = doc(db, 'celebrity_charts', celeb.id);
        await setDoc(docRef, {
          id: celeb.id,
          name: celeb.name,
          chartData,
          generatedAt: Timestamp.now()
        });
        success++;
        console.log(`[CelebrityService] ✅ Seeded chart for ${celeb.name}`);
      } catch (e) {
        console.error(`[CelebrityService] ❌ Failed to seed ${celeb.name}`, e);
        failed.push(celeb.name);
      }
    }

    return { success, failed };
  }

  static async scryCelebrity(query: string): Promise<Celebrity | null> {
    const { technomancerModel } = await import("./gemini");
    
    const prompt = `Research the astrological birth data for: ${query}.
    You MUST return a JSON object matching this structure:
    {
      "id": "slug-name",
      "name": "Full Name",
      "birthDate": "YYYY-MM-DDTHH:MM:SSZ",
      "location": "City, Country",
      "lat": 0.0,
      "lng": 0.0,
      "description": "Short poetic description",
      "category": "Music" | "Science" | "Art" | "Philosophy" | "Tech" | "History"
    }
    Be accurate with coordinates. Return ONLY the JSON object.`;

    try {
      const result = await technomancerModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: "You are the Chronos Scryer. You find accurate birth data for historical and modern icons. You respond ONLY with a single JSON object."
      });
      
      let text = result.response.text();
      // Clean markdown wrappers if present
      text = text.replace(/```json\n?/, '').replace(/\n?```/, '').trim();
      
      const parsed = JSON.parse(text);
      if (!parsed.id || !parsed.birthDate) throw new Error("Incomplete celebrity data");
      
      return parsed as Celebrity;
    } catch (e) {
      console.error("Scrying failed", e);
      return null;
    }
  }

  static getChecklistForToday() {
    const today = new Date();
    return CELEBRITIES.filter(c => {
      const bDay = new Date(c.birthDate);
      return bDay.getMonth() === today.getMonth() && bDay.getDate() === today.getDate();
    });
  }

  static getCelebrityById(id: string) {
    // Check local constants
    const local = CELEBRITIES.find(c => c.id === id);
    if (local) return local;

    // We can't easily check customCelebrities here without preferences, 
    // but getCelebrityChart handles the fallbackCeleb being passed in.
    return null;
  }
}
