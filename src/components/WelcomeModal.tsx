"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Compass, Flame, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
}

export default function WelcomeModal({ isOpen, onClose, userName }: WelcomeModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="w-full max-w-2xl bg-black/90 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)]"
        >
          {/* Hero Section */}
          <div className="relative h-48 overflow-hidden">
            <div className="absolute inset-0 bg-linear-to-b from-indigo-950/60 to-black z-10" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2094&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-luminosity" />
            <div className="absolute top-0 right-0 p-32 bg-indigo-500/20 blur-[100px] rounded-full mix-blend-screen" />
            
            <div className="relative z-20 h-full flex flex-col justify-end p-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2 font-serif">
                  Welcome, {userName}
                </h2>
                <p className="text-indigo-200/80 text-sm font-light tracking-wide max-w-md">
                  Your astral uplink is established. The dashboard is your command center for spiritual technology.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Pillars */}
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 text-indigo-400">
                <Compass size={20} />
              </div>
              <h3 className="text-indigo-100 font-bold uppercase tracking-wider text-xs">Natal Compass</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Your cosmic blueprint. Analyze your core archetype, vibrational frequency, and destiny path using NASA-grade ephemeris data.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-fuchsia-500/10 flex items-center justify-center border border-fuchsia-500/20 text-fuchsia-400">
                <Sparkles size={20} />
              </div>
              <h3 className="text-fuchsia-100 font-bold uppercase tracking-wider text-xs">The Oracle</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Consult the Tarot or Arithmancy engines. Receive AI-synthesized interpretations grounded in ancient wisdom traditions.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="space-y-3"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-400">
                <Flame size={20} />
              </div>
              <h3 className="text-amber-100 font-bold uppercase tracking-wider text-xs">Rituals</h3>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Operationalize your intent. Cast digital sigils and perform technomancy rites to shift your reality tunnels.
              </p>
            </motion.div>
          </div>

          {/* Footer */}
          <div className="p-8 pt-0 flex justify-end">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="group flex items-center gap-3 px-6 py-3 bg-indigo-600 text-white font-bold uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-all border border-indigo-400/20"
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
