"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Zap, Target, BookOpen, Save, History, MessageSquare, Users } from 'lucide-react';
import { ChatService } from '@/lib/ChatService';
import { GrimoireService } from '@/lib/GrimoireService';
import { useAuth } from '@/context/AuthContext';
import { useSettings } from '@/context/SettingsContext';
import { NatalChartData } from '@/types/astrology';

interface DeepDiveViewProps {
    chart: NatalChartData | null;
}

const LOADING_STEPS = [
    { label: "Opening the Akashic Gateway...", icon: BookOpen },
    { label: "Gathering Celestial Data-streams...", icon: Zap },
    { label: "Synthesizing Planetary Council...", icon: Users },
    { label: "Decoding the Destiny Thread...", icon: Target },
    { label: "Finalizing the Oracle's Verdict...", icon: Sparkles }
];

const DeepDiveView: React.FC<DeepDiveViewProps> = ({ chart }) => {
    const { user } = useAuth();
    const { preferences } = useSettings();
    const [step, setStep] = useState<'input' | 'loading' | 'content'>('input');
    const [inquiry, setInquiry] = useState("");
    const [loadingStep, setLoadingStep] = useState(0);
    const [reading, setReading] = useState<{ title: string, sections: { heading: string, content: string }[], summary: string } | null>(null);

    useEffect(() => {
        if (step === 'loading') {
            const interval = setInterval(() => {
                setLoadingStep(prev => (prev < LOADING_STEPS.length - 1 ? prev + 1 : prev));
            }, 4000);
            return () => clearInterval(interval);
        }
    }, [step]);

    const handleStartDeepDive = async () => {
        if (!chart || !inquiry.trim()) return;
        setStep('loading');
        setLoadingStep(0);

        try {
            // Construct full chart data string
            const chartStr = `
                [PLANETS]
                ${chart.planets.map(p => `${p.name} in ${p.sign} (${p.degree.toFixed(2)}°) House ${p.house}${p.retrograde ? ' [RETR]' : ''}`).join('\n')}
                
                [HOUSES]
                ${chart.houses?.map(h => `House ${h.house}: ${h.sign} (${h.degree.toFixed(2)}°)`).join('\n')}
                
                [ASCENDANT]
                ${chart.ascendant?.sign} (${chart.ascendant?.absoluteDegree.toFixed(2)}°)
            `;

            const result = await ChatService.generateDeepDiveReading(
                preferences.name || "Initiate",
                chartStr,
                inquiry
            );

            setReading(result);
            setStep('content');

            // Auto-save to Grimoire
            if (user?.uid) {
                await GrimoireService.saveEntry(user.uid, {
                    userId: user.uid,
                    type: 'deep-dive',
                    title: `Inquiry: ${result.title}`,
                    content: {
                        intent: inquiry,
                        sections: result.sections,
                        summary: result.summary
                    },
                    tags: ['deep-dive', 'oracle-consultation']
                });
            }
        } catch (error: unknown) {
            console.error("Deep Dive failed", error);
            setStep('input');
            
            // Provide more specific feedback based on error type
            const errorMsg = error instanceof Error ? error.message : String(error);
            const isTimeout = errorMsg.includes('deadline-exceeded') || errorMsg.includes('timeout');
            
            if (isTimeout) {
                alert("The Oracle's response took too long. This can happen with complex inquiries. Please try again—the signal is strengthening.");
            } else {
                alert("The aetheric connection was interrupted. Please try establishing the link again.");
            }
        }
    };

    return (
        <div className="h-full flex flex-col overflow-hidden bg-slate-950/20 rounded-3xl border border-white/5 relative">
            <AnimatePresence mode="wait">
                {step === 'input' && (
                    <motion.div 
                        key="input"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-8"
                    >
                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto border border-indigo-500/20 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                                <Sparkles size={40} className="text-indigo-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white uppercase tracking-tighter font-serif">Consult the Oracle</h2>
                            <p className="text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
                                Ask a question about your life, or choose a focus area below. The Oracle will synthesize your <strong className="text-indigo-400">entire natal chart</strong> through the lens of your inquiry.
                            </p>
                        </div>

                        {/* Example Inquiry Chips */}
                        <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                            {[
                                { label: "Who am I?", icon: "✨" },
                                { label: "What is my life purpose?", icon: "🎯" },
                                { label: "How can I find love?", icon: "💜" },
                                { label: "What career suits me?", icon: "🚀" },
                                { label: "What are my hidden gifts?", icon: "🔮" },
                                { label: "How do I heal my wounds?", icon: "🩹" },
                            ].map((example) => (
                                <button
                                    key={example.label}
                                    onClick={() => setInquiry(example.label)}
                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${inquiry === example.label ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-white/5 border-white/10 text-slate-400 hover:border-indigo-500/50 hover:text-indigo-300'}`}
                                >
                                    <span className="mr-1.5">{example.icon}</span>
                                    {example.label}
                                </button>
                            ))}
                        </div>

                        <div className="w-full max-w-lg space-y-4">
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-4 text-indigo-500/50" size={20} />
                                <textarea
                                    value={inquiry}
                                    onChange={(e) => setInquiry(e.target.value)}
                                    placeholder="Or type your own question..."
                                    className="w-full h-24 bg-black/40 border border-white/10 rounded-2xl p-4 pl-12 font-serif text-lg text-white focus:outline-none focus:border-indigo-500/50 transition-all resize-none placeholder:text-slate-600"
                                />
                            </div>
                            <button
                                onClick={handleStartDeepDive}
                                disabled={!inquiry.trim()}
                                className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:grayscale text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-3"
                            >
                                <Zap size={18} />
                                Establish Deep Connection
                            </button>
                        </div>

                        <div className="flex gap-6 mt-8">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                                <History size={12} /> Akashic Persistence Active
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'loading' && (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center p-8 space-y-12"
                    >
                        <div className="relative">
                            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl animate-pulse" />
                            <div className="w-32 h-32 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin relative" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Sparkles size={40} className="text-white animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-4 text-center relative">
                            <AnimatePresence mode="wait">
                                <motion.div 
                                    key={loadingStep}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    {React.createElement(LOADING_STEPS[loadingStep].icon, { size: 32, className: "text-indigo-400" })}
                                    <h3 className="text-xl font-bold text-white uppercase tracking-widest font-serif">{LOADING_STEPS[loadingStep].label}</h3>
                                </motion.div>
                            </AnimatePresence>
                            <div className="w-64 h-1.5 bg-white/5 rounded-full mx-auto overflow-hidden border border-white/10">
                                <motion.div 
                                    className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                    initial={{ width: "0%" }}
                                    animate={{ width: `${((loadingStep + 1) / LOADING_STEPS.length) * 100}%` }}
                                    transition={{ duration: 4 }}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 'content' && reading && (
                    <motion.div 
                        key="content"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex flex-col overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-black/20 backdrop-blur-md">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                    <BookOpen size={24} className="text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white uppercase tracking-tighter font-serif">{reading.title}</h2>
                                    <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Inquiry: {inquiry}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setStep('input')}
                                className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] text-slate-400 uppercase tracking-widest font-bold transition-all"
                            >
                                New Consultation
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12 pb-24">
                            <div className="max-w-3xl mx-auto space-y-16">
                                {reading.sections.map((section, idx) => (
                                    <motion.section 
                                        key={idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="space-y-6"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="h-px flex-1 bg-indigo-500/20" />
                                            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-[0.4em] px-4 py-1.5 bg-indigo-500/5 rounded-full border border-indigo-500/20">
                                                {section.heading}
                                            </h3>
                                            <div className="h-px flex-1 bg-indigo-500/20" />
                                        </div>
                                        <div className="text-slate-200 leading-relaxed font-serif text-xl space-y-4">
                                            {section.content.split('\n\n').map((para, pIdx) => (
                                                <p key={pIdx}>{para}</p>
                                            ))}
                                        </div>
                                    </motion.section>
                                ))}

                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    className="p-8 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl relative overflow-hidden group shadow-2xl"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                        <Zap size={60} className="text-indigo-500" />
                                    </div>
                                    <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2">
                                        <Target size={14} /> The Oracle&apos;s Verdict
                                    </h3>
                                    <p className="text-white italic font-serif text-2xl leading-relaxed">
                                        &quot;{reading.summary}&quot;
                                    </p>
                                </motion.div>
                            </div>
                        </div>

                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                             <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest flex items-center gap-2">
                                 <Save size={14} /> Encoded in Aetheric Blueprint
                             </div>
                             <div className="h-4 w-px bg-white/10" />
                             <button 
                                onClick={() => window.print()} 
                                className="text-[10px] text-slate-400 hover:text-white uppercase tracking-widest font-black transition-colors"
                             >
                                Export Scroll
                             </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Texture Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] bg-repeat" />
            </div>
        </div>
    );
};

export default DeepDiveView;
