"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CelebrityService, Celebrity } from '@/lib/CelebrityService';
import { Users, Star, Info, ChevronRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { NatalChartData } from '@/types/astrology';
import { useSettings } from '@/context/SettingsContext';
import { ProgressionService } from '@/lib/ProgressionService';
import { ARCHETYPES, DESTINY_THREADS } from '@/utils/astrologyUtils';
import NatalCompass from './NatalCompass';
import BiWheelCompass from './BiWheelCompass';

interface CelebrityMatchViewProps {
  userChart: NatalChartData | null;
}

const CelebrityMatchView: React.FC<CelebrityMatchViewProps> = ({ userChart }) => {
  const { preferences, updatePreferences } = useSettings();
  const [selectedCeleb, setSelectedCeleb] = useState<Celebrity | null>(null);
  const [celebChart, setCelebChart] = useState<NatalChartData | null>(null);
  const [viewMode, setViewMode] = useState<'report' | 'natal' | 'synastry'>('report');
  const [isCalculating, setIsCalculating] = useState(false);

  const celebs = CelebrityService.getCelebrities();
  const birthdayMatches = CelebrityService.getChecklistForToday();

  const handleSelectCeleb = async (celeb: Celebrity) => {
    setSelectedCeleb(celeb);
    setViewMode('report');
    setIsCalculating(true);
    
    try {
      const chart = await CelebrityService.getCelebrityChart(celeb.id);
      setCelebChart(chart);
    } catch (e) {
      console.error("Failed to load celebrity chart", e);
    } finally {
      setIsCalculating(false);
    }

    // Milestone: First celebrity exploration triggers Level 8
    const isMilestone = preferences.level === 7;
    const progression = ProgressionService.addXP(preferences, 'exploration', isMilestone);
    updatePreferences({ xp: progression.xp, level: progression.level });
  };

  const getCelebrityNatalReading = (chart: NatalChartData) => {
    const sun = chart.planets.find(p => p.name === 'Sun');
    const moon = chart.planets.find(p => p.name === 'Moon');
    const asc = chart.ascendant;

    if (!sun || !moon || !asc) return "The astral data is currently encoded. Calibration required.";

    const sunArch = ARCHETYPES[sun.sign as keyof typeof ARCHETYPES] || "The Seeker";
    const dest = DESTINY_THREADS[asc.sign as keyof typeof DESTINY_THREADS] || "A Unique Path";

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-[8px] text-indigo-400 font-black uppercase tracking-widest block mb-1">Core Archetype</span>
                    <span className="text-white font-bold text-sm">{sunArch}</span>
                    <span className="text-[10px] text-slate-500 block">Sun in {sun.sign}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-[8px] text-fuchsia-400 font-black uppercase tracking-widest block mb-1">Soul Vibe</span>
                    <span className="text-white font-bold text-sm">Emotional {sun.sign === moon.sign ? 'Purity' : 'Depth'}</span>
                    <span className="text-[10px] text-slate-500 block">Moon in {moon.sign}</span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/10">
                    <span className="text-[8px] text-amber-500 font-black uppercase tracking-widest block mb-1">Destiny Thread</span>
                    <span className="text-white font-bold text-sm">{dest}</span>
                    <span className="text-[10px] text-slate-500 block">Ascendant in {asc.sign}</span>
                </div>
            </div>
            <p className="text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/30 pl-4">
                Born under the sign of {sun.sign}, this icon embodies the essence of {sunArch}. 
                Their destiny, anchored by an {asc.sign} ascendant, focuses on {dest}. 
                The interaction between their {sun.sign} core and {moon.sign} subconscious creates a powerful resonance of {selectedCeleb?.category} mastery.
            </p>
        </div>
    );
  };

  return (
    <div className="h-full flex flex-col space-y-8 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-4 xl:grid-cols-12 gap-6 h-full">
        
        {/* Column 1: Today's Birthdays (Dynamic) */}
        <div className="lg:col-span-1 xl:col-span-2 flex flex-col space-y-6 overflow-y-auto pr-2 border-r border-indigo-500/5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-rose-400 tracking-tight flex items-center gap-2">
              <Sparkles size={18} /> Today
            </h2>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Anniversaries</p>
          </div>

          <div className="space-y-3 pb-8">
            {birthdayMatches.length > 0 ? (
              birthdayMatches.map((celeb) => (
                <button
                  key={`today-${celeb.id}`}
                  onClick={() => handleSelectCeleb(celeb)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col group relative overflow-hidden ${
                    selectedCeleb?.id === celeb.id
                      ? 'bg-rose-500/20 border-rose-500/50 text-white shadow-lg shadow-rose-500/10'
                      : 'bg-rose-500/5 border-rose-500/20 text-rose-200/60 hover:bg-rose-500/10 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs tracking-wide">{celeb.name}</div>
                  <div className="text-[8px] uppercase font-black tracking-[0.2em] opacity-60 mt-1">Born This Day</div>
                  {selectedCeleb?.id === celeb.id && (
                    <motion.div 
                      layoutId="today-active"
                      className="absolute inset-y-0 left-0 w-1 bg-rose-500" 
                    />
                  )}
                </button>
              ))
            ) : (
                <div className="p-4 rounded-xl border border-white/5 bg-white/2 text-[10px] text-slate-600 italic">
                    The Celestial Vault is resting. No major icons recorded for this rotation.
                </div>
            )}
          </div>
        </div>

        {/* Column 2: All Icons (The Vault) */}
        <div className="lg:col-span-1 xl:col-span-2 flex flex-col space-y-6 overflow-y-auto pr-2 border-r border-indigo-500/5">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Star className="text-amber-400" size={18} /> Vault
            </h2>
            <p className="text-[8px] text-slate-500 uppercase tracking-widest font-black">Astral Records</p>
          </div>

          <div className="space-y-2 pb-8">
            {celebs.map((celeb) => (
              <button
                key={`vault-${celeb.id}`}
                onClick={() => handleSelectCeleb(celeb)}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-all flex items-center justify-between group ${
                  selectedCeleb?.id === celeb.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-white'
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-[11px] tracking-wide">{celeb.name}</div>
                  <div className={`text-[8px] uppercase font-black tracking-widest ${
                    selectedCeleb?.id === celeb.id ? 'text-indigo-400' : 'text-slate-500'
                  }`}>
                    {celeb.category}
                  </div>
                </div>
                <ChevronRight size={12} className={`transition-transform ${selectedCeleb?.id === celeb.id ? 'translate-x-1' : 'opacity-20'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Analysis Detail */}
        <div className="lg:col-span-2 xl:col-span-8 relative">
          <AnimatePresence mode="wait">
            {selectedCeleb ? (
              <motion.div
                key={selectedCeleb.id}
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

                  {/* View Switching Tabs */}
                  <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/10 self-start">
                    {[
                      { id: 'report', label: 'Resonance', icon: Info },
                      { id: 'natal', label: 'Icon Map', icon: Star },
                      { id: 'synastry', label: 'Soul Synergy', icon: Sparkles }
                    ].map(tab => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setViewMode(tab.id as 'report' | 'natal' | 'synastry')}
                          className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                            viewMode === tab.id 
                              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' 
                              : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                          }`}
                        >
                          <Icon size={12} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-8 pt-0 overflow-y-auto">
                    {isCalculating ? (
                        <div className="h-full flex flex-col items-center justify-center space-y-4">
                            <Sparkles className="animate-spin text-rose-400" size={32} />
                            <p className="text-[10px] uppercase tracking-[0.4em] text-rose-300">Decrystalizing Astral coordinates...</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {viewMode === 'report' && (
                                <motion.div 
                                    key="report"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-indigo-300">Resonance Report</h4>
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-end border-b border-indigo-500/10 pb-2">
                                                <span className="text-xs text-slate-400">Soul Affinity</span>
                                                <span className="text-lg font-black text-rose-400 tracking-tighter">HIGH</span>
                                            </div>
                                            <div className="flex justify-between items-end border-b border-indigo-500/10 pb-2">
                                                <span className="text-xs text-slate-400">Karma Thread</span>
                                                <span className="text-lg font-black text-amber-400 tracking-tighter">DESTINED</span>
                                            </div>
                                            <div className="flex justify-between items-end border-b border-indigo-500/10 pb-2">
                                                <span className="text-xs text-slate-400">Archetypal Mirror</span>
                                                <span className="text-sm font-bold text-white uppercase tracking-widest">{selectedCeleb.category}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-slate-500 leading-relaxed">
                                        Your chart exhibits a distinct synchronization with {selectedCeleb.name.split(' ')[0]}&apos;s core essence. This resonance suggests shared past-life archetypes or paralleled destiny paths.
                                        </p>
                                    </div>

                                    {celebChart && (
                                        <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-6 space-y-4">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-fuchsia-400">Soul Signature Analysis</h4>
                                            {getCelebrityNatalReading(celebChart)}
                                        </div>
                                    )}

                                    <div className="flex flex-col space-y-6">
                                        <button 
                                            onClick={() => setViewMode('synastry')}
                                            className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <Sparkles size={18} />
                                            <span>Enter Soul Synergy</span>
                                        </button>
                                        
                                        <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-4">
                                            <Info className="text-rose-400 shrink-0" size={18} />
                                            <p className="text-[10px] text-rose-200/60 leading-relaxed uppercase tracking-wider font-bold">
                                            Synergy Analysis targets the deep harmonics between your natal positions and historical astral coordinates.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {viewMode === 'natal' && celebChart && (
                                <motion.div 
                                    key="natal"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full flex flex-col items-center justify-center"
                                >
                                    <div className="w-full max-w-lg">
                                        <NatalCompass chart={celebChart} />
                                    </div>
                                    <p className="mt-4 text-[10px] text-slate-500 uppercase tracking-widest italic">
                                        The Celestial Blueprint of {selectedCeleb.name}
                                    </p>
                                </motion.div>
                            )}

                            {viewMode === 'synastry' && celebChart && userChart && (
                                <motion.div 
                                    key="synastry"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="h-full flex flex-col items-center justify-center"
                                >
                                    <div className="w-full max-w-lg">
                                        <BiWheelCompass 
                                            innerChart={userChart} 
                                            outerChart={celebChart} 
                                            innerLabel="Your Path" 
                                            outerLabel={selectedCeleb.name.split(' ')[0]} 
                                        />
                                    </div>
                                    <p className="mt-4 text-[10px] text-rose-400 uppercase tracking-widest font-black">
                                        Celestial Overlays: Natal Resonance Synchronization
                                    </p>
                                </motion.div>
                            ) || (viewMode === 'synastry' && (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-40">
                                    <Users size={48} className="text-rose-500" />
                                    <p className="text-xs uppercase tracking-widest">Awaiting User Calibration...</p>
                                </div>
                            ))}
                        </AnimatePresence>
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
