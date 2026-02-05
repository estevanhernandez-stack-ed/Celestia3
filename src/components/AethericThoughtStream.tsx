import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const THOUGHTS = [
  "Harmonizing orbital resonance...",
  "Querying the Akashic Records...",
  "Decoding planetary geometry...",
  "Calculating synastry vortices...",
  "Aligning with celestial intent...",
  "Scanning the astral plane...",
  "Interpreting cosmic vibrations...",
  "Mapping karmic convergence...",
  "Translating star-light data...",
  "Weaving astral threads...",
  "Synchronizing with the Great Work...",
  "Observation: The stars are restless today.",
  "Analyzing house placements...",
  "Synthesizing aspect patterns...",
  "Sensing a significant soul-link..."
];

export const AethericThoughtStream: React.FC = () => {
  const [currentThought, setCurrentThought] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentThought(prev => (prev + 1) % THOUGHTS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
          opacity: [0.5, 1, 0.5]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="relative"
      >
        <div className="absolute inset-0 bg-pink-500/20 blur-2xl rounded-full" />
        <Sparkles className="w-12 h-12 text-pink-500 relative z-10" />
      </motion.div>

      <div className="h-12 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentThought}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-lg font-light tracking-[0.2em] text-pink-300/80 uppercase italic"
          >
            {THOUGHTS[currentThought]}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ 
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              delay: i * 0.4,
              ease: "easeInOut" 
            }}
            className="w-1.5 h-1.5 rounded-full bg-pink-500"
          />
        ))}
      </div>
    </div>
  );
};

export default AethericThoughtStream;
