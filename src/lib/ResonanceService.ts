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
  private activeDrone: {
    oscillators: OscillatorNode[];
    gain: GainNode;
    planet: string;
  } | null = null;

  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;

  private init() {
    if (!this.audioContext) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioContext = new AudioContextClass();
      this.masterGain = this.audioContext.createGain();
      this.masterGain.connect(this.audioContext.destination);
      this.masterGain.gain.value = 0.4; // Default volume
    }
  }

  public setVolume(val: number) {
    if (this.masterGain) {
        this.masterGain.gain.setTargetAtTime(val, this.audioContext!.currentTime, 0.1);
    }
  }

  public duck() {
      if (this.masterGain && this.audioContext) {
          const current = this.masterGain.gain.value;
          this.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
          this.masterGain.gain.linearRampToValueAtTime(current * 0.3, this.audioContext.currentTime + 0.5);
      }
  }

  public unduck(originalVolume: number = 0.4) {
      if (this.masterGain && this.audioContext) {
          this.masterGain.gain.cancelScheduledValues(this.audioContext.currentTime);
          this.masterGain.gain.linearRampToValueAtTime(originalVolume, this.audioContext.currentTime + 1);
      }
  }

  public toggleMute(mute: boolean) {
      this.isMuted = mute;
      if (this.audioContext) {
          if (mute) {
              this.audioContext.suspend();
          } else {
              this.audioContext.resume();
          }
      }
  }

  public playTone(planet: string, duration: number = 2000) {
    this.init();
    if (!this.audioContext || !this.masterGain || this.isMuted) return;

    const frequency = PLANETARY_FREQUENCIES[planet];
    if (!frequency) return;

    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + (duration / 1000));

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.audioContext.currentTime + (duration / 1000));
  }

  public startDrone(planet: string) {
    this.init();
    if (!this.audioContext || !this.masterGain) return;

    // specific check to avoid restarting same drone
    if (this.activeDrone?.planet === planet) return;

    // Crossfade: Stop existing
    this.stopDrone();

    const frequency = PLANETARY_FREQUENCIES[planet];
    if (!frequency) return;

    const now = this.audioContext.currentTime;
    const droneGain = this.audioContext.createGain();
    droneGain.gain.setValueAtTime(0, now);
    droneGain.gain.linearRampToValueAtTime(0.2, now + 2); // Slow fade in

    // Complex Drone: Root + Fifth + Octave below
    const osc1 = this.audioContext.createOscillator();
    osc1.type = 'triangle'; // Warmer than sine
    osc1.frequency.value = frequency;

    const osc2 = this.audioContext.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = frequency * 1.5; // Perfect Fifth

    const osc3 = this.audioContext.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = frequency / 2; // Sub-octave

    // Slight detune for "shimmer"
    osc1.detune.value = 2; 
    osc2.detune.value = -3;

    [osc1, osc2, osc3].forEach(osc => {
        osc.connect(droneGain);
        osc.start();
    });

    droneGain.connect(this.masterGain);

    this.activeDrone = {
        oscillators: [osc1, osc2, osc3],
        gain: droneGain,
        planet
    };
  }

  public stopDrone() {
      if (this.activeDrone && this.audioContext) {
          const { gain, oscillators } = this.activeDrone;
          const now = this.audioContext.currentTime;
          
          // Fade out
          gain.gain.cancelScheduledValues(now);
          gain.gain.setValueAtTime(gain.gain.value, now);
          gain.gain.linearRampToValueAtTime(0, now + 2);

          // Stop oscillators after fade
          oscillators.forEach(osc => osc.stop(now + 2.1));
          
          this.activeDrone = null;
      }
  }

  public playAethericChord(planets: string[]) {
    planets.forEach((p, i) => {
      setTimeout(() => this.playTone(p, 3000), i * 150);
    });
  }
}

export const ResonanceService = new ArtificiallyResonantService();
