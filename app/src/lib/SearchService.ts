/**
 * Celestial Search Service
 * Handles external knowledge lookups for the Technomancer.
 * Uses a relay pattern to open search results for the user.
 */
export class SearchService {
  /**
   * Constructs a Google Search URL for esoteric or current event lookups.
   */
  static getSearchUrl(query: string): string {
    const encoded = encodeURIComponent(query);
    return `https://www.google.com/search?q=${encoded}`;
  }

  /**
   * Proactively triggers a knowledge search (client-side).
   */
  static triggerSearch(query: string) {
    const url = this.getSearchUrl(query);
    window.open(url, '_blank');
  }
}
