"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Brain, Save } from 'lucide-react';
import { GrimoireService } from '@/lib/GrimoireService';
import { useAuth } from '@/context/AuthContext';

interface RitualVisionProps {
  isOpen: boolean;
  thought: string | null;
  sigilSvg: string | null;
  incantation: string | null;
  context: { intent: string, paradigm: string } | null;
  onClose: () => void;
}

const RitualVision: React.FC<RitualVisionProps> = ({ isOpen, thought, sigilSvg, incantation, context, onClose }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = React.useState(false);

  const handleSave = async () => {
    if (!user || !context) return;
    
    await GrimoireService.saveEntry(user.uid, {
        userId: user.uid,
        type: 'ritual',
        title: `Ritual: ${context.paradigm}`,
        tags: [context.paradigm],
        content: {
            intent: context.intent,
            paradigm: context.paradigm,
            result: incantation || "No incantation recorded."
        }
    });
    setIsSaved(true);
  };

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
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-emerald-900/40 to-black"></div>
            <div className="absolute inset-0 opacity-10 pointer-events-none bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            {/* Floating Particles */}
            <ParticleField />

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

            {/* Sigil Display */}
            {sigilSvg && (
              <div className="flex justify-center mb-8 relative">
                 <div className="absolute inset-0 bg-emerald-500/20 blur-[60px] rounded-full" />
                 <div 
                   className="w-64 h-64 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-[pulse_4s_ease-in-out_infinite]"
                   dangerouslySetInnerHTML={{ __html: sigilSvg }}
                 />
              </div>
            )}

            {/* Incantation Display */}
            {incantation && (
              <div className="mb-8 text-center space-y-2">
                <span className="text-[10px] text-amber-500 uppercase tracking-[0.3em] font-bold">Resonance Key</span>
                <p className="text-xl font-serif italic text-amber-100/90 leading-relaxed font-light">
                  &quot;{incantation}&quot;
                </p>
              </div>
            )}

            <div className="space-y-6">
                <div className="bg-black/40 border border-emerald-900/30 p-6 rounded-3xl min-h-[100px] flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-[10px] text-emerald-600 uppercase tracking-widest font-bold">
                    <Sparkles size={12} />
                    Thought Signature
                  </div>
                  <p className="text-emerald-50/60 text-sm leading-relaxed italic font-light">
                    {thought || "The void remains silent. No resonance detected."}
                  </p>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1 bg-emerald-900/10 border border-emerald-900/30 p-4 rounded-2xl flex items-center gap-3">
                    <Zap size={16} className="text-emerald-500" />
                    <span className="text-[10px] text-emerald-600 uppercase tracking-widest font-black">Entropy Stream Active</span>
                  </div>
                  
                  <button 
                    onClick={handleSave}
                    disabled={isSaved || !context}
                    className={`px-6 py-4 font-black rounded-2xl transition-all shadow-lg uppercase tracking-widest text-xs flex items-center gap-2
                        ${isSaved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-900/40 hover:bg-emerald-800/40 text-emerald-100'}
                    `}
                  >
                    <Save size={16} />
                    {isSaved ? 'Recorded' : 'Record'}
                  </button>

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

interface Particle {
    id: number;
    x: number;
    y: number;
    duration: number;
    delay: number;
    yOffset: number;
}

const ParticleField = () => {
    const [particles, setParticles] = React.useState<Particle[]>([]);

    React.useEffect(() => {
        setParticles([...Array(20)].map((_, i) => ({
            id: i,
            x: Math.random() * 600,
            y: Math.random() * 600,
            duration: 2 + Math.random() * 3,
            delay: Math.random() * 2,
            yOffset: Math.random() * -100
        })));
    }, []);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    className="absolute w-1 h-1 bg-emerald-500 rounded-full"
                    initial={{ x: p.x, y: p.y, opacity: 0 }}
                    animate={{ 
                        y: [p.y, p.y + p.yOffset],
                        opacity: [0, 0.5, 0],
                    }}
                    transition={{ 
                        duration: p.duration, 
                        repeat: Infinity,
                        delay: p.delay
                    }}
                />
            ))}
        </div>
    );
};
