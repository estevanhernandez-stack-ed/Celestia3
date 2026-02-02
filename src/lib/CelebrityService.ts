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
   */
  static async getCelebrityChart(celebrityId: string): Promise<NatalChartData | null> {
    try {
      const docRef = doc(db, 'celebrity_charts', celebrityId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data() as CelebrityChartDocument;
        return data.chartData;
      }
      return null;
    } catch (e) {
      console.error(`[CelebrityService] Failed to fetch chart for ${celebrityId}`, e);
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
      "birthDate": "ISO-8601-TIMESTAMP",
      "location": "City, Country",
      "lat": 0.0,
      "lng": 0.0,
      "description": "Short poetic description",
      "category": "Music" | "Science" | "Art" | "Philosophy" | "Tech" | "History"
    }
    If data is unknown, provide your best historical estimate. Be accurate with coordinates.`;

    try {
      const result = await technomancerModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: "You are the Chronos Scryer. You find accurate birth data for historical and modern icons. Always return valid JSON."
      });
      
      const text = result.response.text();
      return JSON.parse(text) as Celebrity;
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
    return CELEBRITIES.find(c => c.id === id);
  }
}
