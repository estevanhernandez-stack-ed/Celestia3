/**
 * Spotify Resonance Service
 * Handles searching for curated auditory grounding on Spotify.
 */
export class SpotifyService {
  /**
   * Constructs a search URL for Spotify based on high-resonance intent.
   * This is used as a fallback or a way for the AI to proactively guide the user.
   */
  static getSearchUrl(query: string): string {
    const encoded = encodeURIComponent(query);
    return `https://open.spotify.com/search/${encoded}`;
  }

  /**
   * Proactively triggers a Spotify search action (client-side).
   */
  static triggerSearch(query: string) {
    const url = this.getSearchUrl(query);
    window.open(url, '_blank');
  }

  /**
   * Constructs a YouTube Music search URL (as requested by the Technomancer).
   */
  static getYouTubeMusicSearchUrl(query: string): string {
    const encoded = encodeURIComponent(query);
    return `https://music.youtube.com/search?q=${encoded}`;
  }

  static triggerYouTubeSearch(query: string) {
    const url = this.getYouTubeMusicSearchUrl(query);
    window.open(url, '_blank');
  }
}
