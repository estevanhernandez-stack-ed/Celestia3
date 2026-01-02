"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RefreshCw, Book } from 'lucide-react';

// --- RWS Image Helper (Ported from Old App) ---
const BASE_URL = "https://www.sacred-texts.com/tarot/pkt/img/";

const SUIT_PREFIX: Record<string, string> = {
    'Wands': 'wa',
    'Cups': 'cu',
    'Swords': 'sw',
    'Pentacles': 'pe'
};

const RANK_MAP: Record<string, string> = {
    'ace': 'ac',
    '1': 'ac',
    'page': 'pa',
    'knight': 'kn',
    'queen': 'qu',
    'king': 'ki'
};

export const getRWSImageUrl = (cardId: string): string => {
    if (!cardId) return '';
    const parts = cardId.split('-');
    
    // Major Arcana
    if (parts[0] === 'major') {
        const num = parseInt(parts[1], 10);
        const padded = num.toString().padStart(2, '0');
        return `${BASE_URL}ar${padded}.jpg`;
    }

    // Minor Arcana
    if (parts.length === 2) {
        const suit = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const rankRaw = parts[1];
        const prefix = SUIT_PREFIX[suit];
        if (!prefix) return '';

        let suffix = '';
        if (RANK_MAP[rankRaw]) {
            suffix = RANK_MAP[rankRaw];
        } else if (!isNaN(Number(rankRaw))) {
            suffix = Number(rankRaw).toString().padStart(2, '0');
        }

        if (suffix) return `${BASE_URL}${prefix}${suffix}.jpg`;
    }
    return '';
};

export interface TarotCard {
    id: string;
    name: string;
    arcana: 'Major' | 'Minor';
    suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
    keywords: string[];
    meaningUpright: string;
    meaningReversed: string;
    element?: string;
}

// --- Simplified Deck Definition (Full deck would be imported to save space, but defining core set for now) ---
// Ideally, we'd import the full massive JSON from a separate file, but for this component I'll include a subset 
// or I can try to copy the full deck if possible. Given the context limit, I will include a helper to fetch it 
// or just define a few for testing, BUT the user wants the FULL experience.
// Strategy: I will keep the component generic and assume the 'deck' is passed or I can paste the full constants in a lib file.
// For now, let's create a separate lib file for the constants to keep this component clean.

interface SpreadType {
    id: string;
    label: string;
    description: string;
    count: number;
}

const SPREADS: SpreadType[] = [
    { id: 'single', label: 'Daily Insight', description: 'A single card for daily guidance.', count: 1 },
    { id: 'three_time', label: 'Time Stream', description: 'Past, Present, and Future influences.', count: 3 },
    { id: 'three_self', label: 'Trinity of Self', description: 'Mind, Body, and Spirit alignment.', count: 3 },
    { id: 'horseshoe', label: 'The Horseshoe', description: 'Deep insight: Past, Present, Obstacle, Advice, Outcome.', count: 5 },
];


interface TarotDeckProps {
    onDraw: (cards: TarotCard[], spreadId: string, intent: string) => void;
    onExplore: () => void;
    isDrawing: boolean;
}

import { FULL_DECK } from '@/lib/TarotConstants';
import { Info, X, MessageSquare } from 'lucide-react';

const TarotDeck: React.FC<TarotDeckProps> = ({ onDraw, isDrawing, onExplore }) => {
  const [deck, setDeck] = useState<TarotCard[]>(FULL_DECK);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedSpread, setSelectedSpread] = useState<SpreadType>(SPREADS[1]); // Default to 3-card Time
  const [showNotice, setShowNotice] = useState(true);
  const [intent, setIntent] = useState("");

  const handleShuffle = () => {
    setIsShuffling(true);
    setTimeout(() => {
      const shuffled = [...FULL_DECK].sort(() => Math.random() - 0.5);
      setDeck(shuffled);
      setIsShuffling(false);
    }, 1500); // Dramatic shuffle time
  };

  const handleDraw = () => {
    if (isShuffling) return;
    const draw = deck.slice(0, selectedSpread.count);
    onDraw(draw, selectedSpread.id, intent);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8 w-full max-w-4xl">
      
      {/* Physical Deck Notice */}
      <AnimatePresence>
        {showNotice && (
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="w-full bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-4 flex items-start gap-4 mb-4 relative"
            >
                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <Info size={20} />
                </div>
                <div className="flex-1">
                    <h4 className="text-indigo-300 font-bold text-sm uppercase tracking-wide mb-1">Analog Resonance Recommended</h4>
                    <p className="text-indigo-200/60 text-xs leading-relaxed">
                        For the most potent energetic connection, we recommend using a <strong>physical Tarot deck</strong>. 
                        Digital randomization mimics chaos, but cannot replicate the tactile intuition of your own hands.
                    </p>
                </div>
                <button 
                    onClick={() => setShowNotice(false)}
                    className="text-indigo-400/50 hover:text-indigo-400 transition-colors"
                >
                    <X size={16} />
                </button>
            </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row items-center gap-12 w-full">
          
          {/* Deck Visual */}
          <div className="relative w-48 h-80 group cursor-pointer perspective-1000 shrink-0" onClick={handleShuffle}>
            {/* Deck Visual Stack */}
            {[0, 1, 2, 3].map((i) => (
            <motion.div
                key={i}
                className="absolute inset-0 rounded-xl shadow-xl flex items-center justify-center backface-hidden overflow-hidden bg-black border border-indigo-900/50"
                style={{ 
                zIndex: 10 - i,
                top: -i * 2,
                left: -i * 2
                }}
                animate={isShuffling ? {
                    x: [0, 20, -20, 0],
                    y: [0, -10, 10, 0],
                    rotate: [0, 5, -5, 0],
                    transition: { repeat: Infinity, duration: 0.3 }
                } : {}}
            >
                <img 
                    src="/assets/tarot_back.png" 
                    alt="Card Back" 
                    className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-indigo-500/10 mix-blend-overlay"></div>
            </motion.div>
            ))}
            
            {/* Top Card Overlay */}
            <div className="absolute inset-0 rounded-xl flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)] group-hover:shadow-[0_0_50px_rgba(99,102,241,0.4)] transition-all z-20 hover:bg-black/10">
                <div className="text-center p-4 bg-black/60 backdrop-blur-sm rounded-xl border border-indigo-500/30">
                    <RefreshCw className={`mx-auto mb-2 text-indigo-400 ${isShuffling ? 'animate-spin' : ''}`} />
                    <span className="text-xs font-bold uppercase tracking-widest text-indigo-300">
                    {isShuffling ? "Shuffling..." : "Click to Shuffle"}
                    </span>
                </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex-1 w-full space-y-6">
              
              {/* Intent Input */}
              <div className="space-y-2">
                  <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-sm border-b border-indigo-500/20 pb-2 flex items-center gap-2">
                      <MessageSquare size={14} /> Ritual Intent
                  </h3>
                  <div className="bg-indigo-950/20 border border-indigo-500/20 rounded-xl p-1 focus-within:border-indigo-500/50 transition-colors">
                      <textarea 
                          value={intent}
                          onChange={(e) => setIntent(e.target.value)}
                          placeholder="Focus your energy: What specifically do you seek guidance on today? (Optional)"
                          className="w-full bg-transparent border-none outline-none text-indigo-100 placeholder:text-indigo-400/30 text-sm p-3 h-20 resize-none font-sans"
                      />
                  </div>
              </div>

              <div className="space-y-4">
                  <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-sm border-b border-indigo-500/20 pb-2">Select Spread</h3>
                  <div className="grid grid-cols-1 gap-3">
                      {SPREADS.map((spread) => (
                          <button
                            key={spread.id}
                            onClick={() => setSelectedSpread(spread)}
                            className={`text-left p-4 rounded-xl border transition-all ${
                                selectedSpread.id === spread.id 
                                ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                                : 'bg-indigo-950/10 border-indigo-500/10 text-indigo-400/60 hover:bg-indigo-900/20 hover:border-indigo-500/30'
                            }`}
                          >
                              <div className="flex justify-between items-center mb-1">
                                  <span className="font-bold uppercase tracking-tight text-sm">{spread.label}</span>
                                  <span className="text-[10px] bg-black/30 px-2 py-0.5 rounded text-indigo-300">{spread.count} Cards</span>
                              </div>
                              <p className="text-xs opacity-70">{spread.description}</p>
                          </button>
                      ))}
                  </div>
              </div>

            <div className="flex gap-4">
                <button
                    onClick={onExplore}
                    className="flex-1 px-4 py-4 bg-indigo-950/40 border border-indigo-500/20 text-indigo-400 font-bold uppercase tracking-widest rounded-lg hover:bg-indigo-900/40 hover:text-white transition-all flex items-center justify-center gap-2"
                >
                    <Book size={16} />
                    <span>Explore Codex</span>
                </button>
                
                <button
                    onClick={handleDraw}
                    disabled={isShuffling || isDrawing}
                    className="flex-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center justify-center gap-2"
                >
                    <Sparkles size={16} />
                    <span>Draw Cards</span>
                </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default TarotDeck;
