/**
 * Voice Service - Celestia 3
 * High-fidelity Speech Synthesis with Phonetic Precision.
 * Supports Google Cloud TTS (Journey) and Browser Fallback.
 */

export interface VoiceOptions {
  voiceId?: string;
  pitch?: number;
  rate?: number;
  volume?: number;
}

export interface VoiceProvider {
  speak(text: string, options?: VoiceOptions): Promise<void>;
  stop(): void;
  setPronunciations(map: Record<string, string>): void;
}

let pronunciationMap: Record<string, string> = {};

const cleanText = (text: string): string => {
  let appText = text
    .replace(/[*#`_~]/g, '')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2700}-\u{27BF}\u{2600}-\u{26FF}\u{2B50}]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();

  Object.entries(pronunciationMap).forEach(([word, phonetic]) => {
    if (!word || !phonetic) return;
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    appText = appText.replace(regex, phonetic);
  });

  return appText;
};

// --- Browser Speech Provider ---
class WebSpeechProvider implements VoiceProvider {
  private synthesis: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  
  async speak(text: string, options?: VoiceOptions): Promise<void> {
    if (!this.synthesis) return;
    this.stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(cleanText(text));
      utterance.rate = options?.rate || 1.0;
      utterance.pitch = options?.pitch || 1.0;
      utterance.volume = options?.volume || 1.0;
      
      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synthesis!.speak(utterance);
    });
  }

  stop() {
    this.synthesis?.cancel();
  }

  setPronunciations(map: Record<string, string>) {
    pronunciationMap = map;
  }
}

// --- Google Cloud TTS Provider ---
class GoogleTTSProvider implements VoiceProvider {
  private apiKey: string;
  private ctx: AudioContext | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private isStopping = false;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      this.ctx = new AudioContextClass();
    }
  }

  async speak(text: string, options?: VoiceOptions): Promise<void> {
    const cleaned = cleanText(text);
    if (!cleaned) return;

    this.initCtx();
    this.stop();
    this.isStopping = false;

    // Split into sentences for pseudo-streaming (low latency)
    // Matches sentences ending in . ! or ?
    const chunks = cleaned.match(/[^.!?]+[.!?]*/g) || [cleaned];
    const trimmedChunks = chunks.map(c => c.trim()).filter(c => c.length > 0);

    for (const chunk of trimmedChunks) {
      if (this.isStopping) break;
      await this.speakChunk(chunk, options);
    }
  }

  private async speakChunk(text: string, options?: VoiceOptions): Promise<void> {
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: { text },
          voice: { languageCode: "en-US", name: options?.voiceId || "en-US-Journey-F" },
          audioConfig: { 
            audioEncoding: "MP3",
            pitch: options?.pitch !== undefined ? options.pitch : 0,
            speakingRate: options?.rate !== undefined ? options.rate : 1.0
          }
        })
      });

      if (!response.ok) throw new Error("TTS Failed");
      const data = await response.json();
      
      const audioData = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
      const buffer = await this.ctx!.decodeAudioData(audioData.buffer);

      if (this.isStopping) return;

      const source = this.ctx!.createBufferSource();
      source.buffer = buffer;
      source.connect(this.ctx!.destination);
      this.currentSource = source;
      source.start();

      return new Promise(r => {
        source.onended = () => {
          if (this.currentSource === source) this.currentSource = null;
          r();
        };
      });
    } catch (error) {
      console.warn("Chunk TTS failed:", error);
    }
  }

  stop() {
    this.isStopping = true;
    if (this.currentSource) {
      try {
        this.currentSource.stop();
      } catch (error) {
        // Already stopped
      }
      this.currentSource = null;
    }
  }

  setPronunciations(map: Record<string, string>) {
    pronunciationMap = map;
  }
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

export const voiceService: VoiceProvider = API_KEY 
  ? new GoogleTTSProvider(API_KEY) 
  : new WebSpeechProvider();
