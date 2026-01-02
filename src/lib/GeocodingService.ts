
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

        // Open-Meteo works best with just the city name. 
        // If user enters "Paris, France", we should search for "Paris".
        const cleanQuery = query.split(',')[0].trim();

        try {
            const url = `${this.BASE_URL}?name=${encodeURIComponent(cleanQuery)}&count=5&language=en&format=json`;
            const response = await fetch(url);
            const data = await response.json();

            if (!data.results) return [];

            return data.results.map((item: GeocodingResult) => ({
                name: item.name,
                lat: item.latitude,
                lng: item.longitude,
                country: item.country,
                admin1: item.admin1
            }));
        } catch (error) {
            console.error("Geocoding failed:", error);
            return [];
        }
    }
}
