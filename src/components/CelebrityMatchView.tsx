"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CelebrityService, Celebrity } from '@/lib/CelebrityService';
import { Users, Star, Info, ChevronRight, Sparkles, MapPin, Calendar, X, Zap, RefreshCw } from 'lucide-react';
import { NatalChartData } from '@/types/astrology';
import { useSettings } from '@/context/SettingsContext';
import NatalCompass from './NatalCompass';
import BiWheelCompass from './BiWheelCompass';
import { AethericThoughtStream } from './AethericThoughtStream';
import { ChatService } from '@/lib/ChatService';

interface CelebrityMatchViewProps {
  userChart: NatalChartData | null;
}

const CelebrityMatchView: React.FC<CelebrityMatchViewProps> = ({ userChart }) => {
  const { preferences, updatePreferences } = useSettings();
  const [selectedCeleb, setSelectedCeleb] = useState<Celebrity | null>(null);
  const [celebChart, setCelebChart] = useState<NatalChartData | null>(null);
  const [viewMode, setViewMode] = useState<'info' | 'synastry'>('info');
  const [isFetchingChart, setIsFetchingChart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrying, setIsScrying] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  
  const allCelebs = CelebrityService.getCelebrities(preferences.customCelebrities);
  const birthdayMatches = CelebrityService.getChecklistForToday();

  const filteredCelebs = allCelebs.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCeleb = async (celeb: Celebrity) => {
    setSelectedCeleb(celeb);
    setViewMode('info');
    setIsFetchingChart(true);
    setCelebChart(null);
    try {
        const chart = await CelebrityService.getCelebrityChart(celeb.id, celeb);
        setCelebChart(chart);
    } catch (e) {
        console.error("Failed to fetch celebrity chart", e);
    } finally {
        setIsFetchingChart(false);
    }
  };

  const handleScry = async () => {
    if (!searchQuery.trim()) return;
    setIsScrying(true);
    try {
        const result = await CelebrityService.scryCelebrity(searchQuery);
        if (result) {
            console.log("[CelebrityMatchView] Scry successful:", result.name);
            
            // 1. Add to preferences if missing
            const exists = allCelebs.find(c => c.id === result.id);
            if (!exists) {
                const updatedCustom = [...(preferences.customCelebrities || []), result];
                updatePreferences({ customCelebrities: updatedCustom });
            }

            // 2. Select the celebrity and fetch chart
            await handleSelectCeleb(result);
            
            // 3. Clear search so they appear in the list
            setSearchQuery('');
        }
    } catch (e) {
        console.error("Scry UI failed", e);
    } finally {
        setIsScrying(false);
    }
  };

  const handleAnalyzeSynastry = async () => {
    if (!userChart || !celebChart || !selectedCeleb) return;
    
    setAnalysisStatus('loading');
    setViewMode('synastry');
    try {
        const p1Data = userChart.planets.map((p) => `${p.name}: ${p.sign}`).join(', ');
        const p2Data = celebChart.planets.map((p) => `${p.name}: ${p.sign}`).join(', ');
        
        // Helper for basic aspects
        const getAspects = () => {
             const results = [];
             for (const p1 of userChart.planets) {
               for (const p2 of celebChart.planets) {
                 if (['North Node', 'South Node'].includes(p1.name) || ['North Node', 'South Node'].includes(p2.name)) continue;
                 const diff = Math.abs(p1.absoluteDegree - p2.absoluteDegree);
                 const shortestDiff = Math.min(diff, 360 - diff);
                 let type = "";
                 if (shortestDiff < 8) type = "Conjunction";
                 else if (Math.abs(shortestDiff - 180) < 8) type = "Opposition";
                 else if (Math.abs(shortestDiff - 120) < 6) type = "Trine";
                 else if (Math.abs(shortestDiff - 90) < 6) type = "Square";
                 else if (Math.abs(shortestDiff - 60) < 4) type = "Sextile";
                 if (type) results.push(`${p1.name} ${type} ${p2.name}`);
               }
             }
             return results.slice(0, 10).join('\n');
        };

        const report = await ChatService.generateSynastryReport(
            preferences.name || "The Seeker", p1Data, preferences.birthDate || "",
            selectedCeleb.name, p2Data, selectedCeleb.birthDate,
            "Astral Resonance",
            getAspects()
        );
        
        setAnalysisText(report);
        setAnalysisStatus('success');
    } catch {
        setAnalysisStatus('error');
    }
  };

  return (
    <div className="h-full flex flex-col space-y-8 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* Left: Celebrity List */}
        <div className="lg:col-span-1 flex flex-col space-y-6 overflow-y-auto pr-2">
          <div className="space-y-4">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <Star className="text-amber-400" /> Astral Icons
                </h2>
                <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Soul Records of History</p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search icons or eras..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/50 transition-all text-white pr-10"
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                {searchQuery.length > 2 && (
                    <button 
                        onClick={handleScry}
                        disabled={isScrying}
                        className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 p-3 rounded-xl transition-all shadow-lg shadow-indigo-500/20"
                        title="Scry the Aether for this icon"
                    >
                        {isScrying ? <RefreshCw className="animate-spin" size={18} /> : <Zap size={18} />}
                    </button>
                )}
            </div>
          </div>

          {birthdayMatches.length > 0 && searchQuery === '' && (
            <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 space-y-3">
              <h3 className="text-rose-300 font-bold text-[10px] uppercase tracking-[0.2em] flex items-center gap-2">
                <Sparkles size={12} /> Today&apos;s Anniversaries
              </h3>
              {birthdayMatches.map(c => (
                <div key={c.id} className="flex items-center justify-between text-white text-sm">
                  <span>{c.name}</span>
                  <span className="text-[10px] opacity-60 italic">Born this day</span>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-3 pb-8">
            {filteredCelebs.length === 0 && searchQuery !== '' && !isScrying && (
                <div className="text-center py-8 space-y-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-slate-500 uppercase tracking-widest">No local resonance found</p>
                    <button 
                        onClick={handleScry}
                        className="text-rose-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors"
                    >
                        Click ⚡ to scry the aether
                    </button>
                </div>
            )}
            {filteredCelebs.map((celeb) => (
              <button
                key={celeb.id}
                onClick={() => handleSelectCeleb(celeb)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group ${
                  selectedCeleb?.id === celeb.id
                    ? 'bg-rose-500/20 border-rose-500/50 text-white shadow-lg shadow-rose-500/10'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="space-y-1">
                  <div className="font-bold text-sm tracking-wide">{celeb.name}</div>
                  <div className={`text-[10px] uppercase font-black tracking-widest ${
                    selectedCeleb?.id === celeb.id ? 'text-rose-400' : 'text-slate-500'
                  }`}>
                    {celeb.category}
                  </div>
                </div>
                <ChevronRight size={16} className={`transition-transform ${selectedCeleb?.id === celeb.id ? 'translate-x-1' : 'opacity-40'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Analysis Detail */}
        <div className="lg:col-span-2 relative h-full">
          <AnimatePresence mode="wait">
            {selectedCeleb ? (
              <motion.div
                key={selectedCeleb.id + viewMode}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl overflow-hidden flex flex-col"
              >
                {/* Header / Hero */}
                <div className="p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Users size={120} className="text-rose-400" />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-full bg-rose-500/20 flex items-center justify-center border border-rose-400/30">
                        <Users size={32} className="text-rose-400" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-3xl font-bold text-white tracking-tight font-serif">{selectedCeleb.name}</h3>
                        <div className="flex items-center gap-4 text-[10px] text-rose-300 font-bold uppercase tracking-widest">
                          <span className="flex items-center gap-1"><MapPin size={10} /> {selectedCeleb.location}</span>
                          <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(selectedCeleb.birthDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-sm max-w-xl italic">
                      &quot;{selectedCeleb.description}&quot;
                    </p>
                  </div>
                </div>

                {/* Integration Info */}
                <div className="flex-1 p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">
                    {viewMode === 'info' ? (
                      <>
                        <div className="space-y-6">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300">Resonance Report</h4>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-indigo-500/10 pb-2">
                                        <span className="text-xs text-slate-400">Astral Affinity</span>
                                        <span className="text-lg font-black text-rose-400 tracking-tighter">HIGH</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-indigo-500/10 pb-2">
                                        <span className="text-xs text-slate-400">Destiny Thread</span>
                                        <span className="text-lg font-black text-amber-400 tracking-tighter">DESTINED</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-indigo-500/10 pb-2">
                                        <span className="text-xs text-slate-400">Aeon Mirror</span>
                                        <span className="text-sm font-bold text-white uppercase tracking-widest">{selectedCeleb.category}</span>
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed">
                                  Your chart exhibits a distinct synchronization with {selectedCeleb.name.split(' ')[0]}&apos;s core essence. This resonance suggests shared archetypal ties or paralleled destiny paths.
                                </p>
                            </div>

                            <div className="flex flex-col space-y-6">
                                <button 
                                  onClick={handleAnalyzeSynastry}
                                  disabled={analysisStatus === 'loading' || !celebChart}
                                  className="w-full py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2 group"
                                >
                                    {analysisStatus === 'loading' ? (
                                        <RefreshCw className="animate-spin" size={18} />
                                    ) : (
                                        <Sparkles size={18} />
                                    )}
                                    <span>Run Astral Resonance</span>
                                </button>
                                
                                <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-4">
                                    <Info className="text-rose-400 shrink-0" size={18} />
                                    <p className="text-[10px] text-rose-200/60 leading-relaxed uppercase tracking-wider font-bold">
                                      Synergy Analysis targets the deep harmonics between your natal positions and historical astral coordinates.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Celebrity Natal Compass */}
                        <div className="h-full flex items-center justify-center min-h-[400px]">
                            {isFetchingChart ? (
                                <AethericThoughtStream />
                            ) : celebChart ? (
                                <div className="w-full space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-center text-rose-400/60">Celestial Map of {selectedCeleb.name.split(' ')[0]}</h4>
                                    <NatalCompass chart={celebChart} />
                                </div>
                            ) : (
                                <div className="text-center space-y-2 opacity-50">
                                    <RefreshCw className="mx-auto text-rose-500/40 animate-pulse" size={32} />
                                    <p className="text-[10px] uppercase tracking-widest text-rose-300">The aether is silent...</p>
                                </div>
                            )}
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2 space-y-8 pb-12">
                          <div className="flex items-center justify-between">
                             <div className="space-y-1">
                                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300">Resonance Bi-Wheel</h4>
                                <p className="text-[10px] text-slate-500">Outer Ring: {selectedCeleb.name} • Inner Ring: You</p>
                             </div>
                             <button 
                                onClick={() => setViewMode('info')}
                                className="px-4 py-2 border border-white/10 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
                             >
                                Back to Persona
                             </button>
                          </div>

                          <div className="bg-black/20 rounded-3xl p-8 border border-white/5">
                             {userChart && celebChart ? (
                                <BiWheelCompass 
                                    innerChart={userChart} 
                                    outerChart={celebChart} 
                                    innerLabel="You" 
                                    outerLabel={selectedCeleb.name} 
                                />
                             ) : (
                                <div className="h-[400px] flex items-center justify-center">
                                    <AethericThoughtStream />
                                </div>
                             )}
                          </div>

                          <div className="w-full">
                             {analysisStatus === 'loading' && (
                                <div className="p-12 bg-rose-950/20 border border-rose-500/20 rounded-3xl min-h-[300px] flex items-center justify-center">
                                    <AethericThoughtStream />
                                </div>
                             )}
                             
                             {analysisStatus === 'success' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-rose-950/20 border border-rose-500/20 rounded-3xl text-rose-100/90 text-sm leading-relaxed whitespace-pre-wrap font-mono shadow-xl"
                                >
                                    {analysisText}
                                </motion.div>
                             )}

                             {analysisStatus === 'error' && (
                                <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-300 text-sm text-center font-mono">
                                    The archival connection was interrupted.
                                </div>
                             )}

                             {analysisStatus === 'idle' && !analysisText && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-rose-400">Archival Synchronicity</h5>
                                        <p className="text-xs text-rose-200/60 leading-relaxed font-serif italic">
                                        &quot;The geometric interactions between your soul signature and this historical giant suggest a profound resonance in the fourth house of ancestry and roots.&quot;
                                        </p>
                                    </div>
                                    <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-3">
                                        <h5 className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Karmic Tether</h5>
                                        <p className="text-xs text-indigo-200/60 leading-relaxed font-serif italic">
                                        &quot;A Jupiter-Venus trine indicates that engaging with the work of this individual acts as a direct catalyst for your personal expansion.&quot;
                                        </p>
                                    </div>
                                </div>
                             )}
                          </div>
                      </div>
                    )}
                </div>
              </motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                <div className="h-32 w-32 rounded-full border-2 border-dashed border-rose-500/30 flex items-center justify-center">
                  <Star size={48} className="text-rose-500/40" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-medium text-white uppercase tracking-widest">Select an Astral Icon</h3>
                  <p className="text-sm text-slate-400 max-w-xs uppercase tracking-tighter font-medium">To begin the synergy decrystalization process.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default CelebrityMatchView;
