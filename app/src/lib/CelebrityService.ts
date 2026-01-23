import { NatalChartData } from "@/types/astrology";

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
  },
  {
    id: 'buzz-aldrin',
    name: 'Buzz Aldrin',
    birthDate: '1930-01-20T19:03:00Z',
    location: 'Glen Ridge, NJ',
    lat: 40.80,
    lng: -74.20,
    description: 'Lunar Pioneer. The second human to walk on the Moon.',
    category: 'Science'
  },
  {
    id: 'federico-fellini',
    name: 'Federico Fellini',
    birthDate: '1920-01-20T20:00:00Z',
    location: 'Rimini, Italy',
    lat: 44.06,
    lng: 12.56,
    description: 'The Maestro of Dreams. A surrealist visionary of cinema.',
    category: 'Art'
  },
  {
    id: 'david-lynch',
    name: 'David Lynch',
    birthDate: '1946-01-20T10:00:00Z',
    location: 'Missoula, MT',
    lat: 46.87,
    lng: -113.99,
    description: 'The Weaver of the Subconscious. Master of surrealist atmosphere.',
    category: 'Art'
  },
  {
    id: 'christian-dior',
    name: 'Christian Dior',
    birthDate: '1905-01-21T01:30:00Z',
    location: 'Granville, France',
    lat: 48.83,
    lng: -1.59,
    description: 'The Architect of Style. Founder of one of the world\'s top fashion houses.',
    category: 'Art'
  },
  {
    id: 'telly-savalas',
    name: 'Telly Savalas',
    birthDate: '1922-01-21T10:00:00Z',
    location: 'Garden City, NY',
    lat: 40.72,
    lng: -73.63,
    description: 'Kojak. An iconic figure of screen presence and charisma.',
    category: 'Art'
  }
];

export class CelebrityService {
  static getCelebrities() {
    return CELEBRITIES;
  }

  static getChecklistForToday() {
    const today = new Date();
    return CELEBRITIES.filter(c => {
      const bDay = new Date(c.birthDate);
      return bDay.getUTCMonth() === today.getUTCMonth() && bDay.getUTCDate() === today.getUTCDate();
    });
  }

  static getCelebrityById(id: string) {
    return CELEBRITIES.find(c => c.id === id);
  }

  /**
   * Dynamically calculates the chart for a celebrity using the Swiss Ephemeris.
   */
  static async getCelebrityChart(id: string): Promise<NatalChartData> {
    const celeb = this.getCelebrityById(id);
    if (!celeb) throw new Error("Celebrity not found");

    const { SwissEphemerisService } = await import("./SwissEphemerisService");
    const birthDate = new Date(celeb.birthDate);
    return await SwissEphemerisService.calculateChart(birthDate, celeb.lat, celeb.lng);
  }
}
