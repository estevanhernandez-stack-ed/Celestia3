"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { NumerologyEngine } from '@/utils/NumerologyEngine';
import { Brain, Zap, Fingerprint, Clock } from 'lucide-react';

interface NumerologyViewProps {
    birthDate: string; // ISO string
    fullName: string;
    commonName?: string;
}

const NumerologyView: React.FC<NumerologyViewProps> = ({ birthDate, fullName, commonName }) => {
    const [activeInput, setActiveInput] = useState(commonName || fullName);
    const [selectedNumber, setSelectedNumber] = useState<{ number: number, label: string } | null>(null); // For modal
    const [forecastDate, setForecastDate] = useState(new Date()); // For Time Machine

    // Memoize the core profile based on immutable props
    const profile = React.useMemo(() => {
        if (!birthDate || !fullName) return null;
        return {
            lifePath: NumerologyEngine.calculateLifePath(birthDate),
            destiny: NumerologyEngine.calculateName(fullName, 'pythagorean'),
            active: NumerologyEngine.calculateName(activeInput, 'chaldean')
        };
    }, [birthDate, fullName, activeInput]);

    // Recalculate personal cycles when birthDate or forecastDate changes
    const { personalYear, personalMonth } = React.useMemo(() => {
        if (!birthDate) return { personalYear: 0, personalMonth: 0 };
        const pYear = NumerologyEngine.calculatePersonalYear(birthDate, forecastDate);
        const pMonth = NumerologyEngine.calculatePersonalMonth(pYear, forecastDate);
        return { personalYear: pYear, personalMonth: pMonth };
    }, [birthDate, forecastDate]);

    // Update active vibration when typing
    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newName = e.target.value;
        setActiveInput(newName);
    };

    const shiftMonth = (delta: number) => {
        const newDate = new Date(forecastDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setForecastDate(newDate);
    };

    const resetTime = () => setForecastDate(new Date());

    if (!profile) return <div className="text-center text-emerald-500 animate-pulse mt-20">Calculating Soul Algorithms...</div>;

    const cards = [
        {
            title: "Life Path",
            subtitle: "The Blueprint",
            icon: Fingerprint,
            data: profile.lifePath,
            desc: "Your immutable purpose. The road you must travel.",
            color: "text-indigo-400",
            border: "border-indigo-500/30",
            bg: "bg-indigo-950/20"
        },
        {
            title: "Destiny",
            subtitle: "The Contract",
            icon: Brain,
            data: profile.destiny,
            desc: "The opportunities you attract based on your birth name.",
            color: "text-purple-400",
            border: "border-purple-500/30",
            bg: "bg-purple-950/20"
        },
        {
            title: "Active Vibration",
            subtitle: "The Frequency",
            icon: Zap,
            data: profile.active,
            desc: "Your shifting energy. Changed by nicknames & branding.",
            color: "text-emerald-400",
            border: "border-emerald-500/50",
            bg: "bg-emerald-950/30",
            interactive: true
        }
    ];

    const renderModal = () => {
        if (!selectedNumber) return null;
        const details = NumerologyEngine.getRichDetails(selectedNumber.number);

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedNumber(null)}>
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl max-w-lg w-full shadow-2xl relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button onClick={() => setSelectedNumber(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
                        X
                    </button>
                    <div className="text-center mb-8">
                        <h3 className="text-sm text-emerald-500 uppercase tracking-widest mb-2">{selectedNumber.label}</h3>
                        <div className="text-6xl font-black text-white mb-2">{selectedNumber.number}</div>
                        <h2 className="text-2xl font-bold text-white font-serif italic">&quot;{details.title}&quot;</h2>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/10">
                            <h4 className="text-xs text-emerald-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Zap size={12} /> Gift
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{details.gift}</p>
                        </div>
                        <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/10">
                            <h4 className="text-xs text-rose-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Fingerprint size={12} /> Shadow
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{details.shadow}</p>
                        </div>
                        <div className="bg-indigo-950/20 p-4 rounded-xl border border-indigo-500/10">
                            <h4 className="text-xs text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-2">
                                <Brain size={12} /> Challenge
                            </h4>
                            <p className="text-sm text-slate-300 leading-relaxed">{details.challenge}</p>
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <div className="w-full h-full p-8 flex flex-col items-center overflow-y-auto custom-scrollbar relative">
            {renderModal()}
            <header className="mb-12 text-center space-y-2">
                <h2 className="text-4xl font-black text-white uppercase tracking-tighter">The Arithmancer</h2>
                <p className="text-emerald-500/60 font-mono text-xs uppercase tracking-widest">Decoding the Geometry of Soul</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative rounded-2xl p-8 border ${card.border} ${card.bg} flex flex-col items-center text-center group overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform`}
                        onClick={() => !card.interactive && setSelectedNumber({ number: card.data.core, label: card.title })}
                    >
                        <div className={`absolute top-4 right-4 ${card.color} opacity-20`}>
                            <card.icon size={24} />
                        </div>
                        
                        <h3 className={`text-xl font-bold ${card.color} uppercase tracking-widest mb-1`}>{card.title}</h3>
                        <p className="text-[10px] text-white/40 uppercase tracking-widest mb-6">{card.subtitle}</p>

                        <div className="relative mb-6">
                            <div className="text-7xl font-black text-white relative z-10">
                                {card.data.core}
                            </div>
                            {card.data.isMaster && (
                                <span className="absolute -top-3 -right-6 text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold tracking-widest animate-pulse">
                                    MASTER
                                </span>
                            )}
                            <div className={`absolute inset-0 blur-2xl opacity-20 ${card.color.replace('text', 'bg')}`}></div>
                        </div>

                        <div className="h-8 flex items-center justify-center mb-6">
                             <span className="text-sm font-medium text-white/80 font-serif italic">
                                &quot;{card.data.archetype}&quot;
                             </span>
                        </div>

                        {card.interactive ? (
                             <div className="w-full relative group/input" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="text"
                                    value={activeInput}
                                    onChange={handleNameChange}
                                    className="w-full bg-black/40 border border-emerald-500/30 rounded-lg py-2 px-3 text-center text-sm text-emerald-300 focus:outline-none focus:border-emerald-500 transition-colors placeholder-emerald-900"
                                    placeholder="Type a name..."
                                />
                                <button 
                                    onClick={() => setSelectedNumber({ number: card.data.core, label: card.title })}
                                    className="absolute right-3 top-2.5 opacity-50 hover:opacity-100 hover:text-emerald-400 transition-opacity"
                                >
                                    <Fingerprint size={14} />
                                </button>
                             </div>
                        ) : (
                            <div className="w-full pt-4 border-t border-white/5">
                                <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">{card.desc}</p>
                                <div className="mt-2 text-[10px] font-mono text-slate-600 truncate">
                                    Source: {card.data.source}
                                </div>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>

            {/* Cosmic Cycles */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-8 rounded-2xl border border-indigo-900/30 bg-slate-900/40 max-w-4xl w-full flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
            >
                {/* Time Machine Background Effect */}
                {forecastDate.getFullYear() !== new Date().getFullYear() && (
                     <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-pulse"></div>
                )}

                <div className="flex-1 z-10">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Clock size={18} className="text-yellow-500" />
                            Cosmic Cycles
                        </h3>
                        {forecastDate.toDateString() !== new Date().toDateString() && (
                            <button onClick={resetTime} className="text-[10px] text-emerald-500 border border-emerald-500/30 px-2 py-1 rounded hover:bg-emerald-500/10 transition-colors">
                                Reset to Now
                            </button>
                        )}
                    </div>
                    
                    <p className="text-sm text-slate-400 leading-relaxed">
                        Forecasting for <strong>{forecastDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</strong>.<br/>
                        You are moving through a <strong>{personalYear}-Year</strong>. This is a time for 
                        <span className="text-white italic"> {NumerologyEngine.getArchetype(personalYear)}</span> energy. 
                        This month adds the vibration of <strong>{personalMonth}</strong>.
                    </p>
                </div>
                
                <div className="flex gap-4 text-center z-10">
                    <div className="flex flex-col gap-1 items-center">
                         <button onClick={() => shiftMonth(-12)} className="text-slate-600 hover:text-white transition-colors"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-8 border-b-current"></div></button>
                        <div className="p-4 bg-black/40 rounded-xl border border-yellow-500/20 min-w-[100px] flex flex-col justify-center h-[90px]">
                            <div className="text-xs text-yellow-500/60 uppercase tracking-widest mb-1">Year</div>
                            <div className="text-3xl font-black text-yellow-500">{personalYear}</div>
                        </div>
                         <button onClick={() => shiftMonth(12)} className="text-slate-600 hover:text-white transition-colors"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-current"></div></button>
                    </div>

                    <div className="flex flex-col gap-1 items-center">
                        <button onClick={() => shiftMonth(-1)} className="text-slate-600 hover:text-white transition-colors"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-8 border-b-current"></div></button>
                        <div className="p-4 bg-black/40 rounded-xl border border-blue-500/20 min-w-[100px] flex flex-col justify-center h-[90px]">
                            <div className="text-xs text-blue-500/60 uppercase tracking-widest mb-1">Month</div>
                            <div className="text-3xl font-black text-blue-500">{personalMonth}</div>
                        </div>
                        <button onClick={() => shiftMonth(1)} className="text-slate-600 hover:text-white transition-colors"><div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-8 border-t-current"></div></button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NumerologyView;
