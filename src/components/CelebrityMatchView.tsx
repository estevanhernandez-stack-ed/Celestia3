"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CelebrityService, Celebrity } from '@/lib/CelebrityService';
import { Users, Star, Info, ChevronRight, Sparkles, MapPin, Calendar } from 'lucide-react';
import { NatalChartData } from '@/types/astrology';

interface CelebrityMatchViewProps {
  userChart: NatalChartData | null;
}

const CelebrityMatchView: React.FC<CelebrityMatchViewProps> = ({ userChart }) => {
  const [selectedCeleb, setSelectedCeleb] = useState<Celebrity | null>(null);
  const celebs = CelebrityService.getCelebrities();
  const birthdayMatches = CelebrityService.getChecklistForToday();

  return (
    <div className="h-full flex flex-col space-y-8 p-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
        
        {/* Left: Celebrity List */}
        <div className="lg:col-span-1 flex flex-col space-y-6 overflow-y-auto pr-2">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Star className="text-amber-400" /> Astral Icons
            </h2>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">Soul Records of History</p>
          </div>

          {birthdayMatches.length > 0 && (
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
            {celebs.map((celeb) => (
              <button
                key={celeb.id}
                onClick={() => setSelectedCeleb(celeb)}
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
        <div className="lg:col-span-2 relative">
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
                </div>

                {/* Integration Info */}
                <div className="flex-1 p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
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

                    <div className="flex flex-col space-y-6">
                        <button className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-[0.2em] rounded-xl shadow-xl shadow-rose-500/20 transition-all flex items-center justify-center gap-2 group">
                            <Sparkles size={18} />
                            <span>Run Detailed Synastry</span>
                        </button>
                        
                        <div className="p-6 rounded-xl border border-rose-500/20 bg-rose-500/5 flex items-start gap-4">
                            <Info className="text-rose-400 shrink-0" size={18} />
                            <p className="text-[10px] text-rose-200/60 leading-relaxed uppercase tracking-wider font-bold">
                              Synergy Analysis targets the deep harmonics between your natal positions and historical astral coordinates.
                            </p>
                        </div>
                    </div>
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
