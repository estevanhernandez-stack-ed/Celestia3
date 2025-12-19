/**
 * Aetheric Resonance Generator
 * Uses Web Audio API to generate procedural planetary frequencies.
 * Based on Hans Cousto's "Cosmic Octave" transposed to audible range.
 */

export const PLANETARY_FREQUENCIES: Record<string, number> = {
  Sun: 126.22,      // B (Creativity, Vitality)
  Mercury: 141.27,  // C# (Communication, Intellect)
  Venus: 221.23,    // A (Love, Harmony)
  Earth: 194.18,    // G (Grounding, Stability)
  Moon: 210.42,     // G# (Intuition, Peace)
  Mars: 144.72,     // D (Energy, Courage)
  Jupiter: 183.58,  // F# (Growth, Abundance)
  Saturn: 147.85,   // D (Discipline, Structure)
  Uranus: 207.36,   // G# (Innovation, Change)
  Neptune: 211.44,  // G# (Spirituality, Dreams)
  Pluto: 140.64,    // C# (Transformation)
};

class ArtificiallyResonantService {
  private audioContext: AudioContext | null = null;
  private currentOscillator: OscillatorNode | null = null;
  private currentGain: GainNode | null = null;

  private init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  public playTone(planet: string, duration: number = 2000) {
    this.init();
    if (!this.audioContext) return;

    const frequency = PLANETARY_FREQUENCIES[planet];
    if (!frequency) return;

    // Stop current tone if playing
    this.stop();

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = "sine"; // Pure resonance
    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Smooth envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1); // Short fade in
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + (duration / 1000)); // Long fade out

    osc.connect(gain);
    gain.connect(this.audioContext.destination);

    osc.start();
    osc.stop(this.audioContext.currentTime + (duration / 1000));

    this.currentOscillator = osc;
    this.currentGain = gain;
  }

  public stop() {
    if (this.currentOscillator) {
      try {
        this.currentOscillator.stop();
        this.currentOscillator.disconnect();
      } catch (e) {
        // Already stopped
      }
      this.currentOscillator = null;
    }
    if (this.currentGain) {
      this.currentGain.disconnect();
      this.currentGain = null;
    }
  }

  /**
   * Generates a "Binary Star" chord (major/minor triad based on energy)
   */
  public playAethericChord(planets: string[]) {
    planets.forEach((p, i) => {
      setTimeout(() => this.playTone(p, 3000), i * 50);
    });
  }
}

export const ResonanceService = new ArtificiallyResonantService();
