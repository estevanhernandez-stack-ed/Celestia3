export interface ChatMessage {
  id: string;
  role: "user" | "model" | "system";
  content: string;
  timestamp: number;
  thought_signature?: string;
  voice_transcript?: string;
  ritual_data?: Record<string, unknown>;
}

export interface RitualState {
  id: string;
  type: 'sigil' | 'invocation' | 'warding';
  status: 'active' | 'completed';
  thought_signature: string;
  result?: string;
}
