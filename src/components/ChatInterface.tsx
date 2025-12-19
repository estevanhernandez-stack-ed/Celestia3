"use client";

import { useState, useRef, useEffect } from "react";
import { ChatService, ChatMessage } from "@/lib/ChatService";
import { RitualLib } from "@/utils/CelestialLogic";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Zap, Settings2, Brain, Sparkles, Volume2, VolumeX } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { PersistenceService } from "@/lib/PersistenceService";
import CosmicCalibration from "./CosmicCalibration";
import RitualVision from "./RitualVision";
import { voiceService } from "@/lib/VoiceService";

export default function ChatInterface() {
  const { user } = useAuth();
  const { preferences, updatePreferences } = useSettings();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [activeThought, setActiveThought] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load History from Akashic Records
  useEffect(() => {
    if (user) {
      PersistenceService.getHistory(user.uid).then(history => {
        if (history.length > 0) setMessages(history);
      });
    }
  }, [user]);

  // Sync Pronunciations
  useEffect(() => {
    const map: Record<string, string> = {};
    if (preferences.name && preferences.phoneticName) {
      map[preferences.name] = preferences.phoneticName;
    }
    voiceService.setPronunciations(map);
  }, [preferences.name, preferences.phoneticName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading || !user) return;

    const userMsg: ChatMessage = { 
      id: Date.now().toString(), 
      role: "user", 
      content: input,
      timestamp: Date.now() 
    };
    
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await ChatService.sendMessage(user.uid, input, preferences, messages);
      
      // Basic Protocol Parsing
      let content = result.text;
      const commandRegex = /\[INVOKE:\s*([A-Z_]+)\]/g;
      const match = commandRegex.exec(content);

      if (match) {
        const command = match[1];
        content = content.replace(commandRegex, "").trim();
        
        // Execute local rituals if applicable
        if (command === "CAST_SIGIL") {
           content += "\n\n" + RitualLib.castSigil("INTENT-MANIFEST", "Venus");
        } else if (command === "CAST_KAMEA") {
           content += "\n\n" + RitualLib.castKamea("Jupiter");
        }
      }

      const aiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: "model", 
        content,
        timestamp: Date.now(),
        thought_signature: result.thought_signature 
      };
      
      setMessages((prev) => [...prev, aiMsg]);
      
      // Speak the response
      voiceService.speak(content, {
        voiceId: preferences.voiceId,
        rate: preferences.voiceSpeed,
        pitch: preferences.voicePitch
      });

      if (result.thought_signature) {
        setActiveThought(result.thought_signature);
      }
    } catch (error) {
      const errorMsg: ChatMessage = { 
        id: "err-" + Date.now(),
        role: "system", 
        content: "The connection to the Aether was severed.",
        timestamp: Date.now()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-black text-emerald-400 font-mono p-4 overflow-hidden">
      {/* Modals */}
      <CosmicCalibration isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <RitualVision 
        isOpen={isVisionOpen} 
        thought={activeThought} 
        onClose={() => setIsVisionOpen(false)} 
      />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-900 pb-2 mb-4 shrink-0 px-2">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-emerald-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-[0.2em] text-emerald-500">KALYX-7</h1>
        </div>
        <div className="flex items-center gap-4">
          {activeThought && (
            <button
              onClick={() => setIsVisionOpen(true)}
              className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-[10px] text-emerald-400 font-bold hover:bg-emerald-500/20 transition-all animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              <Brain size={12} />
              ALCHEMY READY
            </button>
          )}
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 hover:bg-emerald-900/30 rounded-xl text-emerald-600 transition-colors"
            title="Cosmic Calibration"
          >
            <Settings2 size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-hide px-2"
      >
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] p-4 rounded-2xl border transition-all ${
                  m.role === 'user' 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-100 rounded-tr-none shadow-[0_0_20px_rgba(16,185,129,0.05)]' 
                    : m.role === 'system'
                    ? 'bg-red-950/20 border-red-900/40 text-red-500 text-xs text-center w-full'
                    : 'bg-black/40 border-emerald-900 text-emerald-400 rounded-tl-none shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]'
              }`}
                onClick={() => m.thought_signature && (setActiveThought(m.thought_signature), setIsVisionOpen(true))}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-sm">
                  {m.content}
                </div>
                {m.role === 'model' && (
                  <div className="mt-3 pt-3 border-t border-emerald-900/30 flex items-center justify-between">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        voiceService.speak(m.content, {
                          voiceId: preferences.voiceId,
                          rate: preferences.voiceSpeed,
                          pitch: preferences.voicePitch
                        });
                      }}
                      className="flex items-center gap-2 group/voice"
                    >
                      <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg group-hover/voice:bg-emerald-500/20 transition-all">
                        <Volume2 size={12} className="text-emerald-500" />
                      </div>
                      <span className="text-[8px] text-emerald-800 uppercase tracking-widest font-bold group-hover/voice:text-emerald-500 transition-colors">Replay Resonance</span>
                    </button>
                    {m.thought_signature && (
                      <Brain size={10} className="text-emerald-800" />
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="p-4 rounded-2xl border border-emerald-900/50 bg-emerald-900/5 text-emerald-600 italic text-xs flex items-center gap-3">
                <Sparkles size={14} className="animate-spin" />
                Channeling from the Aether...
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input */}
      <div className="border-t border-emerald-900/30 pt-4 shrink-0 bg-black/50 backdrop-blur-sm -mx-4 px-8 pb-4">
        <div className="max-w-4xl mx-auto relative flex items-center gap-3">
          <div className="relative flex-1 group">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="CAST YOUR INTENT..."
              className="w-full bg-emerald-950/10 border border-emerald-900/50 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all text-emerald-100 placeholder:text-emerald-900/60 shadow-inner group-hover:border-emerald-700/50"
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-emerald-600 text-black hover:bg-emerald-500 transition-all disabled:opacity-30 disabled:hover:bg-emerald-600 shadow-lg shadow-emerald-900/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
