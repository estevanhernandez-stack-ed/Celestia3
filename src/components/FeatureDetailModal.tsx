"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, ArrowRight } from 'lucide-react';

interface FeatureData {
  title: string;
  value: string;
  sub: string;
  description?: string; // Optional expanded text
}

interface FeatureDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  feature: FeatureData | null;
  onAskOracle: (feature: FeatureData) => void;
}

const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({ isOpen, onClose, feature, onAskOracle }) => {
  if (!feature) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-lg bg-black border border-emerald-900/50 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(16,185,129,0.1)]"
          >
            {/* Header / Decorative Top */}
            <div className="h-2 w-full bg-linear-to-r from-emerald-900 via-emerald-500 to-emerald-900" />
            
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-emerald-700 hover:text-emerald-400 hover:bg-emerald-900/20 rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="p-8 space-y-8">
              {/* Title Section */}
              <div className="space-y-2 text-center">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600">
                  {feature.title}
                </span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
                  {feature.value}
                </h2>
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-800/50">
                  <span className="text-xs text-emerald-300 font-mono">
                    {feature.sub}
                  </span>
                </div>
              </div>

              {/* Description / Content */}
              <div className="space-y-4 text-emerald-100/80 text-sm leading-relaxed border-t border-b border-emerald-900/30 py-6">
                 <p>
                   The <strong>{feature.title}</strong> represents a fundamental cosmic signature in your chart. 
                   {feature.title === 'Core Archetype' && " This defines your primary drive, ego structure, and the heroic journey your soul has chosen to undertake in this lifetime."}
                   {feature.title === 'Vibrational Key' && " This frequency connects you to the planetary resonance of your ruling planet, serving as a harmonic baseline for your energy field."}
                   {feature.title === 'Destiny Thread' && " This indicates your North Node placement—the spiritual magnetic north that pulls you towards your highest evolutionary growth."}
                 </p>
                 <p className="italic opacity-70">
                   &quot;To understand this key is to unlock a deeper layer of the simulation.&quot;
                 </p>
              </div>

              {/* Actions */}
              <div className="grid gap-3">
                <button
                  onClick={() => onAskOracle(feature)}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                >
                  <MessageSquare size={18} />
                  Ask The Oracle
                  <ArrowRight size={16} className="opacity-60" />
                </button>
                
                <button 
                  onClick={onClose}
                  className="w-full py-3 text-emerald-600 font-bold uppercase tracking-widest text-xs hover:text-emerald-400 transition-colors"
                >
                  Dismiss Analysis
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FeatureDetailModal;
