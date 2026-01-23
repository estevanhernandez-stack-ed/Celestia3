"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RelationshipCategory, FamilyRole, NumerologyEngine } from '@/utils/NumerologyEngine';
import { Brain, Zap, Fingerprint, Clock, Layers, Heart, User, Search, RefreshCw, Users, Shield, Briefcase, Smile } from 'lucide-react';
import { numerologyEngine } from '@/utils/NumerologyEngine';
import { useSettings } from '@/context/SettingsContext';
import { ProgressionService } from '@/lib/ProgressionService';

interface NumerologyViewProps {
    birthDate: string; // ISO string
    fullName: string;
    commonName?: string;
}

const NumerologyView: React.FC<NumerologyViewProps> = ({ birthDate, fullName, commonName }) => {
    const [selectedNumber, setSelectedNumber] = useState<{ number: number, label: string } | null>(null); // For modal
    const [forecastDate, setForecastDate] = useState(new Date()); // For Time Machine
    const [showLayers, setShowLayers] = useState(false); // Toggle Soul/Persona
    const { preferences, updatePreferences } = useSettings();

    const handleSelectNumber = (num: number, label: string) => {
        setSelectedNumber({ number: num, label });
        // Milestone: First decode triggers Level 4
        const isMilestone = preferences.level === 3;
        const progression = ProgressionService.addXP(preferences, 'arithmancy', isMilestone);
        updatePreferences({ xp: progression.xp, level: progression.level });
    };
    
    // Partner / Synergy State
    const [showPartner, setShowPartner] = useState(false);
    const [partnerName, setPartnerName] = useState('');
    const [partnerDate, setPartnerDate] = useState('');
    const [relCategory, setRelCategory] = useState<RelationshipCategory>('romantic');
    const [familyRole, setFamilyRole] = useState<FamilyRole>('general');

    // Sandbox State
    const [sandboxInput, setSandboxInput] = useState("");
    const [sandboxSystem, setSandboxSystem] = useState<'chaldean' | 'pythagorean'>('chaldean');

    // Sandbox Calculation
    const sandboxResults = React.useMemo(() => {
        if (!sandboxInput) return null;
        return {
            main: NumerologyEngine.calculateName(sandboxInput, sandboxSystem),
            soul: NumerologyEngine.calculateSoulUrge(sandboxInput, sandboxSystem),
            persona: NumerologyEngine.calculatePersonality(sandboxInput, sandboxSystem)
        };
    }, [sandboxInput, sandboxSystem]);

    // Memoize the core profile based on immutable props
    const profile = React.useMemo(() => {
        if (!birthDate || !fullName) return null;
        return {
            lifePath: NumerologyEngine.calculateLifePath(birthDate),
            destiny: NumerologyEngine.calculateName(fullName, 'pythagorean'),
            active: NumerologyEngine.calculateName(commonName || "Initiate", 'chaldean'),
            soulUrge: NumerologyEngine.calculateSoulUrge(fullName, 'pythagorean'),
            personality: NumerologyEngine.calculatePersonality(fullName, 'pythagorean')
        };
    }, [birthDate, fullName, commonName]);

    const synergyData = React.useMemo(() => {
        if (showPartner && partnerName && partnerDate && profile) {
            // Construct Partner Profile
            const p2 = {
                lifePath: NumerologyEngine.calculateLifePath(partnerDate),
                destiny: NumerologyEngine.calculateName(partnerName, 'pythagorean'),
                active: NumerologyEngine.calculateName(partnerName, 'chaldean'),
                soulUrge: NumerologyEngine.calculateSoulUrge(partnerName, 'pythagorean'),
                personality: NumerologyEngine.calculatePersonality(partnerName, 'pythagorean')
            };
            
            const context = { category: relCategory, role: relCategory === 'family' ? familyRole : undefined };
            return numerologyEngine.calculateCompatibility(profile, p2, context);
        }
        return null;
    }, [showPartner, partnerName, partnerDate, profile, relCategory, familyRole]);

    // Award XP for Synergy Calculation
    React.useEffect(() => {
        if (synergyData) {
            // Debounce or check if already recently awarded to avoid spam if typing?
            // Actually, typing triggers re-calc. We should only award on 'completion' or roughly once.
            // Since this is a simple implementation, let's just assume eager users won't exploit 15xp spam too much,
            // or better, standard 'arithmancy' xp is high (15). Maybe use a smaller amount or throttle.
            // For now, let's rely on the assumption that valid synergy is a distinct "discovery".
            // To prevent spam on every character type, we can check if partnerName length > 3 and date is valid.
            // But useMemo fires on every change. 
            
            const timer = setTimeout(() => {
                 // Milestone: First synergy triggers Level 4
                 const isMilestone = preferences.level === 3;
                 const progression = ProgressionService.addXP(preferences, 'arithmancy', isMilestone);
                 updatePreferences({ xp: progression.xp, level: progression.level });
            }, 2000); // 2s delay to ensure theyve stopped typing/settled
            return () => clearTimeout(timer);
        }
    }, [synergyData]); // eslint-disable-line react-hooks/exhaustive-deps

    // Recalculate personal cycles when birthDate or forecastDate changes
    const { personalYear, personalMonth } = React.useMemo(() => {
        if (!birthDate) return { personalYear: 0, personalMonth: 0 };
        const pYear = NumerologyEngine.calculatePersonalYear(birthDate, forecastDate);
        const pMonth = NumerologyEngine.calculatePersonalMonth(pYear, forecastDate);
        return { personalYear: pYear, personalMonth: pMonth };
    }, [birthDate, forecastDate]);



    const shiftMonth = (delta: number) => {
        const newDate = new Date(forecastDate);
        newDate.setMonth(newDate.getMonth() + delta);
        setForecastDate(newDate);
    };

    const resetTime = () => setForecastDate(new Date());

    if (!profile) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-6 text-center">
            <div className="relative">
                <Brain className="text-emerald-500/30 animate-pulse" size={100} />
                <Fingerprint className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-400/50" size={40} />
            </div>
            <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-widest uppercase">Encryption Detected</h3>
                <p className="text-slate-400 text-sm max-w-sm mx-auto leading-relaxed italic">
                    Your soul algorithm is currently encrypted. Enter your birth coordinates and legal name to unlock the Arithmancy Engine.
                </p>
            </div>
            <button 
                onClick={() => {
                    // This triggers the settings modal in the parent
                    const settingsBtn = document.querySelector('[aria-label="Open Cosmic Calibration Settings"]') as HTMLButtonElement;
                    if (settingsBtn) settingsBtn.click();
                }}
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-black rounded-xl font-bold uppercase tracking-[0.2em] text-[10px] transition-all shadow-xl shadow-emerald-500/20 active:scale-95 group flex items-center gap-3"
            >
                Initialize Calibration
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-500" />
            </button>
        </div>
    );

    const cards = [
        {
            title: "Life Path",
            subtitle: "Birth Date • The Blueprint",
            icon: Fingerprint,
            data: profile.lifePath,
            desc: "Your immutable purpose. The road you must travel.",
            color: "text-indigo-400",
            border: "border-indigo-500/30",
            bg: "bg-indigo-950/20"
        },
        {
            title: "Destiny",
            subtitle: "Full Name • The Contract",
            icon: Brain,
            data: profile.destiny,
            desc: "The opportunities you attract based on your birth name.",
            color: "text-purple-400",
            border: "border-purple-500/30",
            bg: "bg-purple-950/20"
        },
        {
            title: "Active Vibration",
            subtitle: "Chosen Name • The Frequency",
            icon: Zap,
            data: profile.active,
            desc: "Your shifting energy. Changed by nicknames & branding.",
            color: "text-emerald-400",
            border: "border-emerald-500/50",
            bg: "bg-emerald-950/30"
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
            {/* Header */}
            <header className="flex justify-between items-center shrink-0 mb-12">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-r from-cyan-400 to-blue-600 uppercase">
                        Arithmancy Engine
                    </h1>
                    <p className="text-cyan-900/50 text-xs font-mono tracking-[0.3em] uppercase mt-1">
                        Mathematical Soul Decoding
                    </p>
                </div>
                <div className="flex gap-2">

                    <button 
                        onClick={() => setShowLayers(!showLayers)}
                        className={`px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${
                            showLayers 
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300' 
                            : 'bg-cyan-950/30 border-cyan-900/50 text-cyan-700 hover:text-cyan-400'
                        }`}
                    >
                        <Layers size={14} />
                        {showLayers ? 'Hide Layers' : 'Reveal Layers'}
                    </button>
                </div>
            </header>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl shrink-0">
                {cards.map((card, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative rounded-2xl p-8 border ${card.border} ${card.bg} flex flex-col items-center text-center group overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform`}
                        onClick={() => handleSelectNumber(card.data.core, card.title)}
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

                         <div className="w-full pt-4 border-t border-white/5">
                            <p className="text-xs text-slate-400 leading-relaxed min-h-[40px]">{card.desc}</p>
                            <div className="mt-2 text-[10px] font-mono text-slate-600 truncate">
                                Source: {card.title === "Life Path" ? new Date(birthDate).toLocaleDateString() : (card.title === "Destiny" ? fullName : (commonName || "Initiate"))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Deep Layers (Soul Urge & Personality) */}
            {showLayers && profile.soulUrge && profile.personality && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl mt-12 mb-20 shrink-0"
                >
                    {[
                        {
                            title: "Soul Urge",
                            subtitle: "Vowels • Inner Motivation",
                            icon: Heart,
                            data: profile.soulUrge,
                            desc: "Derived from the vowels of your name. This is your burning desire—who you are when no one is watching.",
                            color: "text-rose-400",
                            border: "border-rose-500/30",
                            bg: "bg-rose-950/20"
                        },
                        {
                            title: "Personality",
                            subtitle: "Consonants • Outer Mask",
                            icon: User,
                            data: profile.personality,
                            desc: "Derived from the consonants. This is the face you show the world—the first impression you broadcast.",
                            color: "text-sky-400",
                            border: "border-sky-500/30",
                            bg: "bg-sky-950/20"
                        }
                    ].map((card, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: idx === 0 ? 20 : -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className={`relative rounded-2xl p-6 border ${card.border} ${card.bg} flex flex-row items-center gap-6 group cursor-pointer hover:border-opacity-100 hover:scale-[1.02] transition-all`}
                            onClick={() => handleSelectNumber(card.data.core, card.title)}
                        >
                             <div className={`p-4 rounded-full bg-black/40 border border-white/5`}>
                                <div className="text-4xl font-black text-white">{card.data.core}</div>
                             </div>
                             
                             <div className="flex-1 text-left">
                                <div className="flex items-center gap-2 mb-1">
                                    <card.icon size={16} className={card.color} />
                                    <h3 className={`text-lg font-bold ${card.color} uppercase tracking-widest`}>{card.title}</h3>
                                </div>
                                <p className="text-[10px] text-white/40 uppercase tracking-widest mb-2">{card.subtitle}</p>
                                <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                             </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}

            {/* Cosmic Cycles */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 p-8 rounded-2xl border border-indigo-900/30 bg-slate-900/40 max-w-4xl w-full flex flex-col md:flex-row items-center gap-8 relative overflow-hidden shrink-0"
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

            {/* Relationship Synergy */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="mt-8 p-8 rounded-2xl border border-fuchsia-900/30 bg-slate-900/40 max-w-4xl w-full shrink-0"
            >
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Users size={18} className="text-fuchsia-500" />
                        Relationship Synergy
                    </h3>
                    <button 
                        onClick={() => setShowPartner(!showPartner)}
                        className={`px-4 py-2 rounded-lg border transition-all text-xs font-bold uppercase tracking-widest ${
                            showPartner 
                            ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300' 
                            : 'bg-fuchsia-950/30 border-fuchsia-900/50 text-fuchsia-700 hover:text-fuchsia-400'
                        }`}
                    >
                        {showPartner ? 'Close Synergy' : 'Add Synergy'}
                    </button>
                </div>

                <AnimatePresence>
                    {showPartner && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-8">
                                <div className="flex flex-col md:flex-row gap-6 items-end">
                                     <div className="flex-1 space-y-2 w-full">
                                        <label className="text-[10px] text-fuchsia-500/70 uppercase tracking-widest">Partner Name</label>
                                        <input 
                                            type="text" 
                                            value={partnerName}
                                            onChange={(e) => setPartnerName(e.target.value)}
                                            placeholder="Enter full name..."
                                            className="w-full bg-slate-800 border border-fuchsia-900/30 rounded-xl px-4 py-3 text-fuchsia-100 placeholder-fuchsia-900/50 focus:border-fuchsia-500 outline-none"
                                        />
                                     </div>
                                     <div className="flex-1 space-y-2 w-full">
                                        <label className="text-[10px] text-fuchsia-500/70 uppercase tracking-widest">Partner Birth Date</label>
                                        <input 
                                            type="date" 
                                            value={partnerDate}
                                            onChange={(e) => setPartnerDate(e.target.value)}
                                            className="w-full bg-slate-800 border border-fuchsia-900/30 rounded-xl px-4 py-3 text-fuchsia-100 focus:border-fuchsia-500 outline-none"
                                        />
                                     </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[10px] text-fuchsia-400/70 uppercase tracking-widest block">Relationship Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { id: 'romantic', label: 'Romantic', icon: Heart },
                                            { id: 'platonic', label: 'Platonic', icon: Smile },
                                            { id: 'business', label: 'Business', icon: Briefcase },
                                            { id: 'family', label: 'Family', icon: Shield }
                                        ].map(cat => (
                                            <button
                                                key={cat.id}
                                                onClick={() => setRelCategory(cat.id as RelationshipCategory)}
                                                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all ${
                                                    relCategory === cat.id 
                                                    ? 'bg-fuchsia-500/20 border-fuchsia-500/50 text-fuchsia-300' 
                                                    : 'bg-slate-800/40 border-slate-700/50 text-slate-500 hover:text-slate-300'
                                                }`}
                                            >
                                                <cat.icon size={12} />
                                                {cat.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {relCategory === 'family' && (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="space-y-4"
                                    >
                                        <label className="text-[10px] text-fuchsia-400/70 uppercase tracking-widest block">Specific Role</label>
                                        <div className="flex flex-wrap gap-2">
                                            {['Parent', 'Child', 'Sibling', 'Extended'].map(role => (
                                                <button
                                                    key={role}
                                                    onClick={() => setFamilyRole(role.toLowerCase() as FamilyRole)}
                                                    className={`px-3 py-1.5 rounded-lg border text-[9px] font-bold uppercase tracking-wider transition-all ${
                                                        familyRole === role.toLowerCase() 
                                                        ? 'bg-fuchsia-400/20 border-fuchsia-400/50 text-fuchsia-200' 
                                                        : 'bg-slate-800/60 border-slate-800/50 text-slate-600 hover:text-slate-400'
                                                    }`}
                                                >
                                                    {role}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {synergyData && (
                                    <div className="mt-8 space-y-6">
                                        <div className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-950/20 to-slate-900/40 border border-fuchsia-500/30">
                                            <div className="flex justify-between items-center mb-4">
                                                <div>
                                                    <div className="text-[10px] text-fuchsia-400 uppercase tracking-widest mb-1">Archetypal Resonance</div>
                                                    <div className="text-3xl font-black text-white">{synergyData.overallScore}%</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-[10px] text-fuchsia-400 uppercase tracking-widest mb-1">Synergy #</div>
                                                    <div className="text-2xl font-bold text-fuchsia-200">{synergyData.synergyNumber}</div>
                                                </div>
                                            </div>
                                            <div className="p-4 rounded-xl bg-black/40 border border-fuchsia-500/10 italic text-sm text-fuchsia-100 font-light text-center">
                                                &quot;{synergyData.typeInsight}&quot;
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                            {[
                                                { label: 'Life Path', match: synergyData.lifePathMatch, icon: Fingerprint, color: 'text-indigo-400' },
                                                { label: 'Destiny', match: synergyData.destinyMatch, icon: Brain, color: 'text-purple-400' },
                                                { label: 'Soul Urge', match: synergyData.soulUrgeMatch, icon: Heart, color: 'text-rose-400' },
                                                { label: 'Personality', match: synergyData.personalityMatch, icon: User, color: 'text-sky-400' }
                                            ].map((match, i) => (
                                                <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-white/5 space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <match.icon size={14} className={match.color} />
                                                        <span className="text-xs font-bold text-white/90">{match.match.score}%</span>
                                                    </div>
                                                    <div className="text-[9px] uppercase tracking-widest text-white/40">{match.label}</div>
                                                    <div className="text-[10px] text-slate-400 italic leading-snug line-clamp-2">&quot;{match.match.description}&quot;</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Naming Sandbox */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 mb-20 p-8 rounded-2xl border border-emerald-500/30 bg-black/40 max-w-4xl w-full shrink-0"
            >
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
                    <Search size={18} className="text-emerald-500" />
                    The Naming Sandbox
                </h3>

                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                        <div className="flex gap-2 p-1 bg-slate-900 rounded-lg w-fit">
                            <button 
                                onClick={() => setSandboxSystem('chaldean')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${sandboxSystem === 'chaldean' ? 'bg-emerald-900/50 text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                            >
                                Chaldean
                            </button>
                            <button 
                                onClick={() => setSandboxSystem('pythagorean')}
                                className={`px-4 py-2 rounded-md text-xs font-bold uppercase tracking-widest transition-colors ${sandboxSystem === 'pythagorean' ? 'bg-emerald-900/50 text-emerald-400' : 'text-slate-500 hover:text-white'}`}
                            >
                                Pythagorean
                            </button>
                        </div>
                        
                        <input 
                            type="text"
                            value={sandboxInput}
                            onChange={(e) => setSandboxInput(e.target.value)}
                            placeholder="Type a name, brand, or word..."
                            className="w-full bg-slate-800 border-none rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
                        />
                        <p className="text-xs text-slate-500">
                            {sandboxSystem === 'chaldean' ? "Ancient vibration based on sound." : "Modern sequence based on alphabet order."}
                        </p>
                    </div>

                    <div className="flex-1">
                        {sandboxResults ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in">
                                {[
                                    {
                                        title: "Total",
                                        subtitle: "Full Vibration",
                                        icon: Zap,
                                        data: sandboxResults.main,
                                        color: "text-emerald-400",
                                        border: "border-emerald-500/50",
                                        bg: "bg-emerald-950/30"
                                    },
                                    {
                                        title: "Soul",
                                        subtitle: "Inner Fire",
                                        icon: Heart,
                                        data: sandboxResults.soul,
                                        color: "text-rose-400",
                                        border: "border-rose-500/30",
                                        bg: "bg-rose-950/20"
                                    },
                                    {
                                        title: "Mask",
                                        subtitle: "Outer Shell",
                                        icon: User,
                                        data: sandboxResults.persona,
                                        color: "text-sky-400",
                                        border: "border-sky-500/30",
                                        bg: "bg-sky-950/20"
                                    }
                                ].map((card, idx) => (
                                    <div
                                        key={idx}
                                        className={`relative rounded-2xl p-6 border ${card.border} ${card.bg} flex flex-col items-center text-center group overflow-hidden cursor-pointer hover:scale-[1.02] transition-transform`}
                                        onClick={() => handleSelectNumber(card.data.core, `Sandbox: ${card.title}`)}
                                    >
                                        <div className={`absolute top-3 right-3 ${card.color} opacity-20`}>
                                            <card.icon size={18} />
                                        </div>
                                        
                                        <h3 className={`text-sm font-bold ${card.color} uppercase tracking-widest mb-0.5`}>{card.title}</h3>
                                        <p className="text-[9px] text-white/40 uppercase tracking-widest mb-4">{card.subtitle}</p>

                                        <div className="relative mb-4">
                                            <div className="text-5xl font-black text-white relative z-10">
                                                {card.data.core}
                                            </div>
                                            {card.data.isMaster && (
                                                <span className="absolute -top-2 -right-4 text-[8px] bg-red-500 text-white px-1 py-0.5 rounded font-bold tracking-widest animate-pulse">
                                                    MASTER
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-center">
                                             <span className="text-xs font-medium text-white/80 font-serif italic line-clamp-1">
                                                &quot;{card.data.archetype}&quot;
                                             </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="h-full border border-dashed border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center text-center text-slate-600 min-h-[160px]">
                                <RefreshCw size={24} className="mb-2 opacity-50" />
                                <div className="text-xs uppercase tracking-widest">Awaiting Input</div>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default NumerologyView;
