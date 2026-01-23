
export interface GeoLocation {
    name: string;
    lat: number;
    lng: number;
    country: string;
    admin1?: string; // State/Province
}

interface GeocodingResult {
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
}

export class GeocodingService {
    private static BASE_URL = 'https://geocoding-api.open-meteo.com/v1/search';

    /**
     * Searches for a location and returns top matches.
     * Uses Open-Meteo Geocoding API (Free, no key required).
     */
    static async searchCity(query: string): Promise<GeoLocation[]> {
        if (!query || query.length < 3) return [];

        // 1. First attempt: Search for the part before the comma (if any)
        // If user types "Bedford, Texas", search "Bedford".
        // If "Bedford Texas", search "Bedford Texas".
        let cleanQuery = query.split(',')[0].trim();

        const fetchResults = async (q: string) => {
             try {
                const url = `${this.BASE_URL}?name=${encodeURIComponent(q)}&count=10&language=en&format=json`;
                const response = await fetch(url);
                const data = await response.json();
                return data.results || [];
            } catch (error) {
                console.error("Geocoding failed:", error);
                return [];
            }
        };

        let results = await fetchResults(cleanQuery);

        // 2. Fallback: If no results and query has spaces (e.g. "Bedford Texas"), try first word
        if (results.length === 0 && cleanQuery.includes(' ')) {
            const firstWord = cleanQuery.split(' ')[0];
            if (firstWord.length >= 3) {
                 // console.log("Retrying with:", firstWord);
                 results = await fetchResults(firstWord);
            }
        }

        return results.map((item: GeocodingResult) => ({
            name: item.name,
            lat: item.latitude,
            lng: item.longitude,
            country: item.country,
            admin1: item.admin1
        }));
    }
}
