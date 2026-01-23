import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, Flame, ArrowRight, Camera, Zap, Check } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: (dontShowAgain: boolean) => void;
  userName: string;
}

export default function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95"
      >
        <motion.div
          initial={{ scale: 0.98, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.98, opacity: 0, y: 10 }}
          transition={{ type: "spring", stiffness: 200, damping: 25 }}
          className="w-full max-w-2xl bg-slate-950 border border-white/5 rounded-[40px] overflow-hidden shadow-[0_0_80px_rgba(99,102,241,0.15)]"
        >
          {/* Hero Section */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-indigo-950/80 via-indigo-950/40 to-slate-950 z-10" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/10 blur-[60px] rounded-full mix-blend-screen" />
            
            <div className="relative z-20 h-full flex flex-col justify-end p-8">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                    <Zap size={14} className="text-indigo-400 animate-pulse" />
                    <span className="text-[10px] font-black tracking-[0.4em] text-indigo-400 uppercase">Uplink Established</span>
                </div>
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 font-serif">
                  Welcome, <span className="text-transparent bg-clip-text bg-linear-to-r from-indigo-300 to-white">{userName}</span>
                </h2>
                <p className="text-slate-400 text-xs font-medium tracking-wide max-w-md leading-relaxed">
                  The dashboard is your <span className="text-indigo-300">Command Center</span>. Align your digital self with the cosmos through vibrational progression.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Pillars Grid */}
          <div className="p-8 grid grid-cols-2 gap-6 bg-slate-950/50 border-b border-white/5">
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="space-y-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-500/5 flex items-center justify-center border border-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/10 transition-colors">
                <Compass size={16} />
              </div>
              <h3 className="text-indigo-100 font-black uppercase tracking-widest text-[9px]">Natal Compass</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Analysis of your core archetype using <span className="text-slate-400">Swiss Ephemeris</span> precision.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="space-y-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-purple-500/5 flex items-center justify-center border border-purple-500/10 text-purple-400 group-hover:bg-purple-500/10 transition-colors">
                <Sparkles size={16} />
              </div>
              <h3 className="text-purple-100 font-black uppercase tracking-widest text-[9px]">Athanor & Tarot</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                AI-synthesized <span className="text-slate-400">Tarot & Arithmancy</span> for temporal navigation.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="space-y-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/10 transition-colors">
                <Camera size={16} />
              </div>
              <h3 className="text-emerald-100 font-black uppercase tracking-widest text-[9px]">Aura Link</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Sync bio-rhythms via <span className="text-slate-400">Visual Resonance</span> to manifest your aura.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="space-y-2 group"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/5 flex items-center justify-center border border-amber-500/10 text-amber-400 group-hover:bg-amber-500/10 transition-colors">
                <Flame size={16} />
              </div>
              <h3 className="text-amber-100 font-black uppercase tracking-widest text-[9px]">Ritual Engine</h3>
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Cast <span className="text-slate-400">Digital Sigils</span> and perform rituals to shift your reality.
              </p>
            </motion.div>
          </div>

          {/* Progression Intel */}
          <div className="px-8 py-5 bg-indigo-500/5 border-b border-indigo-500/10">
            <div className="flex items-start gap-3">
                <Zap size={14} className="text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-[10px] text-indigo-300 font-medium leading-relaxed italic">
                    &quot;You level up as you explore and open new modes. Don&apos;t worry—easy exploration tasks are noted on the next modes&apos; talisman locked gate.&quot;
                </p>
            </div>
          </div>


          {/* Activation Protocol */}
          <div className="px-8 py-6 bg-black/60">
            <h4 className="text-[8px] font-black tracking-[0.4em] text-indigo-500 uppercase mb-3">Activation Protocol</h4>
            <div className="flex gap-8">
                {[
                    { step: "01", title: "Calibrate", desc: "Set your birth coordinates." },
                    { step: "02", title: "Synthesize", desc: "Seed the Codex via Athanor." },
                    { step: "03", title: "Transmute", desc: "Perform rites to lock intent." }
                ].map((p, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 + (i * 0.1) }}
                        className="flex gap-2 flex-1 items-start"
                    >
                        <span className="text-indigo-500/30 font-mono text-[8px] mt-0.5">{p.step}</span>
                        <div>
                            <span className="block text-[9px] font-bold text-slate-400 uppercase leading-none mb-1">{p.title}</span>
                            <span className="text-[8px] text-slate-600 leading-tight block">{p.desc}</span>
                        </div>
                    </motion.div>
                ))}
            </div>
          </div>

          {/* Action Area */}
          <div className="p-8 pt-6 flex items-center justify-between border-t border-white/5 bg-slate-950/80">
            <button 
                onClick={() => setDontShowAgain(!dontShowAgain)}
                className="flex items-center gap-2 group cursor-pointer"
            >
                <div className={`w-4 h-4 rounded border transition-all flex items-center justify-center ${dontShowAgain ? 'bg-indigo-600 border-indigo-500' : 'bg-white/5 border-white/10 group-hover:border-white/20'}`}>
                    {dontShowAgain && <Check size={10} className="text-white" />}
                </div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest group-hover:text-slate-400 transition-colors">Don&apos;t show again</span>
            </button>

            <motion.button
              whileHover={{ scale: 1.02, x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onClose(dontShowAgain)}
              className="group flex items-center gap-4 px-8 py-4 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-xl shadow-indigo-500/20 hover:bg-indigo-500 transition-all"
            >
              <span>Begin Operations</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
