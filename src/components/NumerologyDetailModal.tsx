import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Shield, Target } from 'lucide-react';
import { NumerologyEngine } from '@/utils/NumerologyEngine';

interface NumerologyDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    number: number | null;
    type: 'Life Path' | 'Destiny' | 'Active' | 'Personal Day' | null;
}

const NumerologyDetailModal: React.FC<NumerologyDetailModalProps> = ({ isOpen, onClose, number, type }) => {
    if (!isOpen || number === null || !type) return null;

    const details = NumerologyEngine.getRichDetails(number);
    const archetype = NumerologyEngine.getArchetype(number);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="w-full max-w-md bg-zinc-950 border border-indigo-900/50 rounded-2xl overflow-hidden shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="relative p-8 pb-6 border-b border-indigo-900/30 overflow-hidden">
                        <div className="absolute inset-0 bg-indigo-500/5" />
                        <div className="absolute top-0 right-0 p-4">
                            <button
                                onClick={onClose}
                                className="p-2 text-indigo-400 hover:text-white hover:bg-indigo-900/30 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        
                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4 shadow-[0_0_30px_-5px_rgba(99,102,241,0.3)]">
                                <span className="text-3xl font-bold text-indigo-400 font-mono">{number}</span>
                            </div>
                            <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1">{type} Number</h2>
                            <h1 className="text-2xl font-bold text-white mb-1">{details.title}</h1>
                            <p className="text-indigo-400/60 text-xs uppercase tracking-widest">{archetype}</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Gift */}
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Sparkles size={20} className="text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-emerald-400 font-bold uppercase tracking-widest text-xs mb-1">The Gift</h3>
                                <p className="text-emerald-100/80 text-sm leading-relaxed">{details.gift}</p>
                            </div>
                        </div>

                        {/* Shadow */}
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <Shield size={20} className="text-red-400" />
                            </div>
                            <div>
                                <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs mb-1">The Shadow</h3>
                                <p className="text-red-100/80 text-sm leading-relaxed">{details.shadow}</p>
                            </div>
                        </div>

                        {/* Challenge */}
                        <div className="flex gap-4">
                            <div className="shrink-0 w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                <Target size={20} className="text-amber-400" />
                            </div>
                            <div>
                                <h3 className="text-amber-400 font-bold uppercase tracking-widest text-xs mb-1">The Challenge</h3>
                                <p className="text-amber-100/80 text-sm leading-relaxed">{details.challenge}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-black/40 border-t border-indigo-900/30 text-center">
                        <p className="text-[10px] text-indigo-500/40 uppercase tracking-widest">
                            Calculated from {type === 'Personal Day' ? 'Current Date & Birth Date' : 'Natal Data'}
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NumerologyDetailModal;
