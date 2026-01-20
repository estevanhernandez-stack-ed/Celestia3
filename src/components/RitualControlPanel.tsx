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

const PARADIGM_INFO = {
  "Techno-Shamanism": "Invokes the spirits of the machine. Uses algorithmic rhythm to reach altered states of consciousness.",
  "Chaos Magick": "Utilizes raw belief as a tool. Discards dogma in favor of results-driven fluid reality hacking.",
  "Hermetic Cybernetics": "Applies ancient hermetic laws ('As above, so below') to modern digital systems.",
  "Quantum Mysticism": "Leverages the observer effect to collapse probability waves into desired outcomes.",
  "Eldritch Code": "Taps into the unknowable, non-euclidean deep web energies. High risk, high reward."
};

import { calculateMoonPhase } from '@/utils/astrologyUtils';

const RitualControlPanel: React.FC<RitualControlPanelProps> = ({ onPerformRitual, isPerforming }) => {
  const [intent, setIntent] = useState('');
  const [paradigm, setParadigm] = useState(PARADIGMS[0]);

  // Cosmic Suggestion Logic
  const moon = calculateMoonPhase();
  const getSuggestion = (phase: string) => {
      if (phase.includes('New')) return { type: 'Chaos Magick', intent: 'Initiate a new timeline. Plant seeds of radical change.' };
      if (phase.includes('Full')) return { type: 'Techno-Shamanism', intent: 'Illuminate hidden truths. Release outdated subroutines.' };
      if (phase.includes('Waxing')) return { type: 'Quantum Mysticism', intent: 'Amplify the signal. Increase manifestation velocity.' };
      if (phase.includes('Waning')) return { type: 'Eldritch Code', intent: 'Banish the glitches. Purge system errors.' };
      return { type: 'Hermetic Cybernetics', intent: 'Balance the equation. As above, so below.' };
  };
  const suggestion = getSuggestion(moon.phase);

  const applySuggestion = () => {
      setIntent(suggestion.intent);
      setParadigm(suggestion.type);
  };

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
      className="w-full max-w-2xl mx-auto p-8 rounded-3xl bg-slate-900/40 border border-white/10 relative overflow-hidden backdrop-blur-md shadow-2xl"
    >
       {/* Decorative Elements */}
       <div className="absolute top-0 right-0 p-4 opacity-20 pointer-events-none">
         <Hexagon size={120} className="text-fuchsia-500 animate-pulse opacity-20" />
       </div>

      <div className="relative z-10 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-serif font-black tracking-tight text-white flex items-center gap-3">
                <Zap className="text-amber-400" fill="currentColor" />
                Ritual Chamber
            </h2>
            <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-[10px] uppercase tracking-widest text-indigo-300">
                System: Online
            </div>
          </div>
          <p className="text-slate-400 text-xs tracking-wider font-medium">
            Align your will with the cosmic current.
          </p>
        </header>

        {/* Suggestion Card */}
        {!isPerforming && (
            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between gap-4 group hover:border-indigo-500/40 transition-colors">
                <div className="flex items-start gap-3">
                    <div className="mt-1 p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                        <Sparkles size={16} />
                    </div>
                    <div>
                        <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">
                            Cosmic Resonance: {moon.phase}
                        </div>
                        <p className="text-sm text-slate-300 leading-snug">
                            {suggestion.intent}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={applySuggestion}
                    className="shrink-0 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                    Apply
                </button>
            </div>
        )}

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
                        <div className="absolute inset-0 bg-fuchsia-500/20 blur-[60px] animate-pulse rounded-full" />
                        <Hexagon size={120} className="text-fuchsia-400 animate-[spin_4s_linear_infinite]" />
                        <Hexagon size={120} className="text-indigo-400 absolute inset-0 animate-[spin_5s_linear_infinite_reverse] opacity-50" />
                        <Sparkles size={48} className="text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    
                    <div className="text-center space-y-2">
                        <h3 className="text-2xl font-black uppercase text-white tracking-widest animate-pulse font-serif">
                            Weaving Reality
                        </h3>
                        <p className="text-indigo-300 font-mono text-xs tracking-widest">
                             &gt;&gt; SYNCING WITH AETHER &lt;&lt;
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
                    <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      Statement of Intent
                    </label>
                    <textarea
                      value={intent}
                      onChange={(e) => setIntent(e.target.value)}
                      placeholder="What do you wish to manifest?"
                      className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-colors h-32 resize-none font-sans text-sm leading-relaxed"
                      disabled={isPerforming}
                    />
                  </div>

                  <div className="space-y-2">
                     <label className="block text-[10px] uppercase tracking-widest text-slate-400 font-bold">
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
                              ? 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.1)]' 
                              : 'bg-black/20 border-transparent text-slate-500 hover:bg-white/5 hover:text-slate-300'
                          }`}
                          disabled={isPerforming}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${paradigm === p ? 'bg-fuchsia-500 shadow-[0_0_8px_currentColor]' : 'bg-slate-700'}`} />
                          {p}
                        </button>
                      ))}
                    </div>

                    {/* Paradigm Description */}
                    <div className="bg-fuchsia-500/5 border border-fuchsia-500/10 rounded-lg p-4 mt-2">
                        <h4 className="text-[10px] text-fuchsia-400 font-bold uppercase tracking-widest mb-1">
                             System Logic: {paradigm}
                        </h4>
                        <p className="text-xs text-slate-300 leading-relaxed font-serif">
                            {PARADIGM_INFO[paradigm as keyof typeof PARADIGM_INFO]}
                        </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={!intent.trim() || isPerforming}
                    className={`w-full py-6 rounded-2xl font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                      !intent.trim() || isPerforming
                        ? 'bg-slate-800/50 text-slate-600 cursor-not-allowed border border-white/5'
                        : 'bg-gradient-to-r from-indigo-600 to-fuchsia-600 hover:from-indigo-500 hover:to-fuchsia-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40'
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
