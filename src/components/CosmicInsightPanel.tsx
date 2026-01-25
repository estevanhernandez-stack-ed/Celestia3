"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { ChatService } from '@/lib/ChatService';
import { NatalChartData } from '@/types/astrology';
import { voiceService } from '@/lib/VoiceService';
import { ResonanceService } from '@/lib/ResonanceService';

interface CosmicInsightPanelProps {
    chart: NatalChartData | null;
}

const CosmicInsightPanel: React.FC<CosmicInsightPanelProps> = ({ chart }) => {
    const { preferences, updatePreferences } = useSettings();
    const [isLoading, setIsLoading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleSpeak = async () => {
        if (!preferences.chartAnalysis) return;

        if (isPlaying) {
            voiceService.stop();
            setIsPlaying(false);
            ResonanceService.unduck();
            return;
        }

        setIsPlaying(true);
        ResonanceService.duck();

        const textToRead = `
            ${preferences.chartAnalysis.story}
            
            The Big Three.
            ${preferences.chartAnalysis.bigThree.replace(/\*/g, '')}
            
            Your Cosmic Signature.
            ${preferences.chartAnalysis.cosmicSignature}
        `;

        await voiceService.speak(textToRead, {
            voiceId: preferences.voiceId,
            rate: preferences.voiceSpeed,
            pitch: preferences.voicePitch
        });

        setIsPlaying(false);
        ResonanceService.unduck();
    };

    const normalizeDegrees = (deg: number) => {
        let d = deg % 360;
        if (d < 0) d += 360;
        return d;
    };

    const getMoonPhase = (sunDeg: number, moonDeg: number) => {
        const diff = normalizeDegrees(moonDeg - sunDeg);
        if (diff < 22.5) return "New Moon";
        if (diff < 67.5) return "Waxing Crescent";
        if (diff < 112.5) return "First Quarter";
        if (diff < 157.5) return "Waxing Gibbous";
        if (diff < 202.5) return "Full Moon";
        if (diff < 247.5) return "Waning Gibbous";
        if (diff < 292.5) return "Last Quarter";
        if (diff < 337.5) return "Waning Crescent";
        return "New Moon";
    };

    const [showSafeMode, setShowSafeMode] = useState(false);

    const generateInsight = async (useSafeMode = false) => {
        if (!chart) return;
        setIsLoading(true);
        if (useSafeMode) setShowSafeMode(false);
        
        try {
            // Calculate astronomical details
            const sun = chart.planets.find(p => p.name === 'Sun');
            const moon = chart.planets.find(p => p.name === 'Moon');
            const phase = (sun && moon) ? getMoonPhase(sun.absoluteDegree, moon.absoluteDegree) : "Unknown";
            
            // Format Time of Birth (Local)
            const birthDateObj = chart.date ? new Date(chart.date) : new Date();
            const timeString = birthDateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' });

            // Construct rich chart context
            const chartStr = `
                [ASTRONOMICAL_CONTEXT]
                - Birth Time: ${timeString}
                - Time Zone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}
                - Moon Phase: ${phase}
                
                [CHART_DATA]
                - Rising (Ascendant): ${chart.ascendant?.sign} (${chart.ascendant?.absoluteDegree.toFixed(2)}°)
                - Planets:
                  ${chart.planets.map(p => `  * ${p.name} in ${p.sign} (${p.degree.toFixed(2)}°) in House ${p.house}${p.retrograde ? ' [RETR]' : ''}`).join('\n')}
                
                - Houses (Placidus):
                  ${chart.houses?.map(h => `  * House ${h.house}: ${h.sign} (${h.degree.toFixed(2)}°)`).join('\n')}
            `;

            const analysis = await ChatService.generateNatalInterpretation(
                preferences.name || "Initiate",
                chartStr,
                useSafeMode
            );

            updatePreferences({
                chartAnalysis: {
                    ...analysis,
                    timestamp: Date.now()
                }
            });

        } catch (e) {
            console.error("Analysis failed", e);
            setShowSafeMode(true);
        } finally {
            setIsLoading(false);
        }
    };

    const hasAnalysis = !!preferences.chartAnalysis?.story && 
                       !preferences.chartAnalysis.story.includes('Unknown') &&
                       preferences.chartAnalysis.story.length > 50;

    if (!chart) return null;

    return (
        <div className="bg-slate-900/40 border border-white/10 p-6 rounded-xl relative overflow-hidden flex flex-col max-h-[600px] shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4 shrink-0">
                <div className="flex items-center gap-3">
                    <Sparkles className="text-amber-400" size={24} />
                    <h2 className="text-xl font-bold text-white tracking-widest font-serif">COSMIC INSIGHT</h2>
                </div>
                {hasAnalysis && (
                    <div className="flex gap-2">
                        <button 
                            onClick={handleSpeak}
                            className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-pulse' : 'hover:bg-white/10 text-indigo-400'}`}
                            title={isPlaying ? "Stop Reading" : "Read Aloud"}
                        >
                            {isPlaying ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>
                        <button 
                            onClick={() => generateInsight(false)}
                            disabled={isLoading}
                            className="p-2 hover:bg-white/10 rounded-full text-indigo-400 transition-colors"
                            title="Re-interpret Chart"
                        >
                            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
                        </button>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 animate-pulse text-indigo-400/50">
                        <Sparkles className="animate-spin mb-4" size={32} />
                        <p className="tracking-widest uppercase text-sm font-serif">Consulting the Akashic Records...</p>
                    </div>
                ) : !hasAnalysis ? (
                    <div className="text-center py-12 space-y-4">
                        <p className="text-slate-400 max-w-md mx-auto font-medium">
                            {showSafeMode 
                                ? "The high-fidelity signal is fluctuant. Would you like to attempt a stable 'Safe Mode' interpretation?" 
                                : "The stars have a story to tell about your arrival. Unlock the narrative of your soul's entry into this plane."
                            }
                        </p>
                        <div className="flex flex-col gap-3">
                            <button 
                                onClick={() => generateInsight(false)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg transition-all flex items-center gap-2 mx-auto uppercase tracking-widest text-sm font-bold shadow-lg shadow-indigo-500/20"
                            >
                                <Sparkles size={16} /> {showSafeMode ? "Retry High-Fidelity" : "Reveal Destiny"}
                            </button>
                            {showSafeMode && (
                                <button 
                                    onClick={() => generateInsight(true)}
                                    className="border border-indigo-400/30 hover:bg-indigo-400/10 text-indigo-300 px-6 py-2 rounded-lg transition-all flex items-center gap-2 mx-auto uppercase tracking-widest text-xs font-bold"
                                >
                                    <RefreshCw size={12} /> Use Stable Safe Mode
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <motion.div 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        className="space-y-8"
                    >
                        {/* Story Section */}
                        <section className="space-y-2">
                            <h3 className="text-fuchsia-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2 font-serif">
                                The Story of Your Birth
                            </h3>
                            <p className="text-slate-200 leading-relaxed font-serif text-lg">
                                {preferences.chartAnalysis?.story}
                            </p>
                        </section>

                        {/* Big Three Section */}
                        <section className="space-y-4">
                            <h3 className="text-amber-400 font-bold uppercase tracking-widest text-sm font-serif">
                                The Big Three
                            </h3>
                            <div className="space-y-4 text-slate-300 leading-relaxed text-sm whitespace-pre-wrap font-medium">
                                {preferences.chartAnalysis?.bigThree}
                            </div>
                        </section>

                        {/* Cosmic Signature */}
                        <div className="bg-black/40 border border-indigo-500/30 p-4 rounded-lg relative overflow-hidden">
                             <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />
                            <h3 className="text-indigo-300 font-bold uppercase tracking-widest text-xs mb-2">
                                Your Cosmic Signature
                            </h3>
                            <p className="text-white italic font-serif text-lg">
                                &quot;{preferences.chartAnalysis?.cosmicSignature}&quot;
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default CosmicInsightPanel;
