"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain } from 'lucide-react';

interface RitualVisionProps {
  isOpen: boolean;
  thought: string | null;
  onClose: () => void;
}

const RitualVision: React.FC<RitualVisionProps> = ({ isOpen, thought, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl"
          onClick={onClose}
        >
          <div 
            className="bg-emerald-950/20 border border-emerald-500/30 p-8 rounded-[40px] max-w-2xl w-full shadow-[0_0_100px_rgba(16,185,129,0.1)] relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated Grid Background */}
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:40px_40px]"></div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-8 text-emerald-400">
                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                  <Brain size={24} className="animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-widest text-white">Internal Alchemy</h2>
                  <p className="text-[10px] text-emerald-500/50 tracking-[0.4em] uppercase">Akashic Resonance Frequency</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-black/40 border border-emerald-900/30 p-6 rounded-3xl min-h-[200px] flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-[10px] text-emerald-600 uppercase tracking-widest font-bold">
                    <Sparkles size={12} />
                    Thought Signature
                  </div>
                  <p className="text-emerald-50/80 leading-relaxed italic font-light">
                    {thought || "The void remains silent. No resonance detected."}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-2xl flex items-center gap-3">
                    <Zap size={16} className="text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-black">Entropy Stream Active</span>
                  </div>
                  <button 
                    onClick={onClose}
                    className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-2xl transition-all shadow-lg shadow-emerald-600/20 uppercase tracking-widest text-xs"
                  >
                    Close Vision
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default RitualVision;
