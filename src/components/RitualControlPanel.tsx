"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, Scroll, Hexagon } from 'lucide-react';

interface RitualControlPanelProps {
  onPerformRitual: (intent: string, paradigm: string) => Promise<void>;
  isPerforming: boolean;
}

const PARADIGMS = [
  "Techno-Shamanism",
  "Chaos Magick",
  "Hermetic Cybernetics",
  "Quantum Mysticism",
  "Eldritch Code"
];

const RitualControlPanel: React.FC<RitualControlPanelProps> = ({ onPerformRitual, isPerforming }) => {
  const [intent, setIntent] = useState('');
  const [paradigm, setParadigm] = useState(PARADIGMS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (intent.trim()) {
      onPerformRitual(intent, paradigm);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-emerald-950/20 border border-emerald-900/30 relative overflow-hidden backdrop-blur-sm"
    >
       {/* Decorative Elements */}
       <div className="absolute top-0 right-0 p-4 opacity-20">
         <Hexagon size={64} className="text-amber-500 animate-pulse" />
       </div>

      <div className="relative z-10 space-y-8">
        <header className="space-y-2">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-white flex items-center gap-3">
            <Zap className="text-amber-500" />
            Ritual Array
          </h2>
          <p className="text-emerald-600 text-[10px] uppercase tracking-[0.4em] font-bold">
            Initialize Reality Override Sequence
          </p>
        </header>

        <AnimatePresence mode="wait">
            {isPerforming ? (
                <motion.div
                    key="channeling"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="h-[400px] flex flex-col items-center justify-center space-y-8"
                >
                    <div className="relative">
                        <div className="absolute inset-0 bg-amber-500/20 blur-[50px] animate-pulse rounded-full" />
                        <Hexagon size={120} className="text-amber-500 animate-[spin_3s_linear_infinite]" />
                        <Hexagon size={120} className="text-amber-200 absolute inset-0 animate-[spin_3s_linear_infinite_reverse] opacity-50" />
                        <Sparkles size={48} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black uppercase text-amber-500 tracking-widest animate-pulse">
                            Channeling Intent
                        </h3>
                        <p className="text-emerald-400/60 font-mono text-xs">
                             &gt;&gt; WEAVING AETHERIC THREADS... &lt;&lt;
                        </p>
                    </div>
                </motion.div>
            ) : (
                <motion.form 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit} 
                    className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="block text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
                      Statement of Intent
                    </label>
                    <textarea
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      placeholder="E.g., Manifest clarity in the codebase..."
                      className="w-full bg-black/40 border border-emerald-900/50 rounded-xl p-4 text-emerald-100 placeholder:text-emerald-900 focus:outline-none focus:border-amber-500/50 transition-colors h-32 resize-none font-mono text-sm"
                      disabled={isPerforming}
                    />
                  </div>

                  <div className="space-y-2">
                     <label className="block text-[10px] uppercase tracking-widest text-emerald-500 font-bold">
                      Operating Paradigm
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {PARADIGMS.map((p) => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setParadigm(p)}
                          className={`p-3 text-xs uppercase tracking-wider font-bold rounded-lg border transition-all text-left flex items-center gap-2 ${
                            paradigm === p 
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                              : 'bg-black/20 border-transparent text-emerald-900 hover:bg-emerald-900/10'
                          }`}
                          disabled={isPerforming}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${paradigm === p ? 'bg-amber-500' : 'bg-emerald-900'}`} />
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!intent.trim() || isPerforming}
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                      !intent.trim() || isPerforming
                        ? 'bg-emerald-900/20 text-emerald-900 cursor-not-allowed'
                        : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_30px_rgba(245,158,11,0.2)] hover:shadow-[0_0_50px_rgba(245,158,11,0.4)]'
                    }`}
                  >
                        <Scroll size={18} />
                        Cast Ritual
                  </button>
                </motion.form>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default RitualControlPanel;
