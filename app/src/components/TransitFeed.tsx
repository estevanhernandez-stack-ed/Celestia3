"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Zap, Heart, Flame, Crown, 
  Circle, Compass, Waves, Ghost, Sparkles,
  Clock, MapPin, Activity, Info, RefreshCw
} from 'lucide-react';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { NatalChartData, Aspect } from '@/types/astrology';
import { useSettings } from '@/context/SettingsContext';
import BiWheelCompass from './BiWheelCompass';
import { AspectEngine } from '@/utils/AspectEngine';
import { ProgressionService } from '@/lib/ProgressionService';
import { TransitInterpretationEngine } from '@/utils/TransitInterpretationEngine';

type PlanetIconMap = Record<string, React.ComponentType<{ size?: number; className?: string }>>;

const PLANET_ICONS: PlanetIconMap = {
  'Sun': Sun,
  'Moon': Moon,
  'Mercury': Zap,
  'Venus': Heart,
  'Mars': Flame,
  'Jupiter': Crown,
  'Saturn': Circle,
  'Uranus': Compass,
  'Neptune': Waves,
  'Pluto': Ghost,
  'North Node': Sparkles
};

const TransitFeed: React.FC = () => {
  const { preferences, updatePreferences } = useSettings();
  const [transits, setTransits] = useState<NatalChartData | null>(null);
  const [natalChart, setNatalChart] = useState<NatalChartData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAspects, setActiveAspects] = useState<Aspect[]>([]);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Pulse every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function calculateData() {
      const lat = preferences.birthLocation?.lat || 0;
      const lng = preferences.birthLocation?.lng || 0;
      
      try {
        // Calculate Transits (Current Time)
        const transitData = await SwissEphemerisService.calculateChart(currentTime, lat, lng);
        setTransits(transitData);

        // Detect Aspects within Transit Chart (Mundane)
        const mundaneAspects = AspectEngine.calculateAspects(transitData.planets);
        setActiveAspects(mundaneAspects.filter(a => a.orb <= 2)); // Only show tight aspects

        // Calculate Natal Chart (Birth Time)
        if (preferences.birthDate && preferences.birthLocation) {
          const birthDate = new Date(preferences.birthDate);
          const natalData = await SwissEphemerisService.calculateChart(
            birthDate, 
            preferences.birthLocation.lat, 
            preferences.birthLocation.lng
          );
          setNatalChart(natalData);
          
          // Detect Transits to Natal (Personal)
          const personalAspects = AspectEngine.calculateAspects(transitData.planets, natalData.planets, true);
          // Prioritize personal aspects
          setActiveAspects(prev => [...personalAspects.filter(a => a.orb <= 1.5), ...prev].slice(0, 10)); 
        }
      } catch (e) {
        console.error("Celestial calculation failed", e);
      }
    }
    calculateData();
  }, [currentTime, preferences.birthDate, preferences.birthLocation]);

  // Milestone: First exploration triggers Level 6
  useEffect(() => {
    if (transits && natalChart) {
      const timer = setTimeout(() => {
        if (preferences.level === 5) {
          const progression = ProgressionService.addXP(preferences, 'exploration', true);
          updatePreferences({ xp: progression.xp, level: progression.level });
        }
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [transits, natalChart, preferences, updatePreferences]);

  if (!transits) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Activity className="animate-pulse text-blue-500" size={32} />
      <p className="text-[10px] uppercase tracking-[0.5em] text-blue-900">Scanning Temporal Flux...</p>
    </div>
  );

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      <header className="flex justify-between items-center border-b border-indigo-500/20 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3 font-serif">
             <Clock className="text-fuchsia-400" size={24} />
             Chronos Feed
          </h2>
          <p className="text-indigo-400 text-[10px] mt-1 uppercase tracking-[0.3em] flex items-center gap-2">
            <MapPin size={10} /> {preferences.birthLocation?.city || "Aetheric Anchor"} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Info Toggle */}
             <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-full border transition-all ${showInfo ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-transparent text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10'}`}
                title="What is this?"
             >
                <Info size={16} />
             </button>

            <div className="hidden md:block text-right bg-slate-900/50 border border-indigo-500/20 px-4 py-2 rounded-lg">
              <span className="block text-[8px] text-indigo-300 uppercase font-black tracking-widest">Temporal Variance</span>
              <span className="text-sm font-bold text-fuchsia-400 tabular-nums">±0.00042s</span>
            </div>
        </div>
      </header>
      
      {/* Educational Panel */}
      <AnimatePresence>
        {showInfo && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                <div className="bg-slate-900/60 border border-fuchsia-500/20 rounded-2xl p-6 text-sm text-slate-300 space-y-4 shadow-2xl">
                    <h3 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Sparkles size={12} className="text-amber-400" />
                        Understanding Transit Astology
                    </h3>
                    <p>
                        This dashboard, <strong>&quot;Chronos&quot;</strong> (Ancient Greek for Time), displays <strong>Transits</strong>: the current real-time position of the planets in the sky overlayed onto your birth chart.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                             <h4 className="text-indigo-300 font-bold text-xs uppercase mb-2">The Solar System Now (Outer Wheel)</h4>
                             <p className="opacity-80 leading-relaxed">
                                The planets in the sky right now are constantly moving. The <strong>Outer Wheel</strong> shows where they are at this exact second. These are the current energies affecting the collective consciousness.
                             </p>
                        </div>
                        <div>
                             <h4 className="text-fuchsia-400 font-bold text-xs uppercase mb-2">Transit-to-Natal active (Inner Interaction)</h4>
                             <p className="opacity-80 leading-relaxed">
                                When a moving planet connects mathematically (an &quot;Aspect&quot;) to a planet in your fixed birth chart, it triggers a personal event or feeling. This map highlights those active triggers.
                             </p>
                        </div>
                    </div>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* NEW CELESTIAL FORECAST SUMMARY */}
      <section className="bg-linear-to-r from-indigo-500/10 to-fuchsia-500/10 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
              <Sparkles size={120} className="text-indigo-400" />
          </div>
          <div className="relative z-10 space-y-4 max-w-4xl">
              <h3 className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black flex items-center gap-2">
                  <Activity size={12} /> Temporal Focus
              </h3>
              {activeAspects.length > 0 ? (
                  <div className="space-y-6">
                      <h4 className="text-3xl font-serif font-black text-white leading-tight uppercase tracking-tighter">
                          {activeAspects[0].planet1.name} {activeAspects[0].type} {activeAspects[0].planet2.name}
                      </h4>
                      <div className="space-y-4">
                          <p className="text-xl text-indigo-100 font-light leading-relaxed italic">
                              &ldquo;{TransitInterpretationEngine.getAspectMeaning(
                                  activeAspects[0].planet1.name, 
                                  activeAspects[0].type, 
                                  activeAspects[0].planet2.name,
                                  activeAspects[0].isSynastry || false
                              )}&rdquo;
                          </p>
                          <div className="flex items-center gap-3">
                              <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white font-bold uppercase tracking-widest">
                                  Ritual Intent: {TransitInterpretationEngine.getAdvice(activeAspects[0].type)}
                              </span>
                          </div>
                      </div>
                  </div>
              ) : (
                  <p className="text-slate-400 text-sm italic">The Aether is currently in a state of quiet equilibrium. A perfect time for deep calibration.</p>
              )}
          </div>
      </section>

      {/* BI-WHEEL VISUALIZATION */}
      <section className="relative py-12 bg-black/20 rounded-3xl border border-white/5 shadow-2xl overflow-hidden min-h-[400px] flex items-center justify-center">
        {natalChart && transits ? (
          <>
            <div className="absolute top-6 left-6 z-10 pointer-events-none">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/60 block mb-1">Celestial Synthesis</span>
              <motion.h3 
                  layoutId="title"
                  className="text-lg font-bold text-white tracking-tighter uppercase font-serif"
              >
                  Transit-to-Natal Map
              </motion.h3>
            </div>
            <BiWheelCompass innerChart={natalChart} outerChart={transits} outerLabel="Current Transit" />
            <div className="absolute bottom-6 right-6 text-right max-w-xs pointer-events-none">
              <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-relaxed">
                Dashed lines indicate active aspects between current planetary positions and your natal geometry.
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center max-w-md animate-in fade-in zoom-in duration-500">
             <div className="relative">
                <Clock className="text-fuchsia-500/20 animate-spin-slow" size={100} />
                <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-fuchsia-400/50" size={32} />
             </div>
             <div className="space-y-2">
                <h3 className="text-xl font-bold text-white tracking-tighter uppercase font-serif">Temporal Anchor Required</h3>
                <p className="text-slate-400 text-xs leading-relaxed italic">
                  We are currently tracking global transits, but your personal timeline remains disconnected. 
                  Provide your birth coordinates to sync the Current Cycle with your Natal Blueprint.
                </p>
             </div>
             <button 
                onClick={() => {
                    const settingsBtn = document.querySelector('[aria-label="Open Cosmic Calibration Settings"]') as HTMLButtonElement;
                    if (settingsBtn) settingsBtn.click();
                }}
                className="px-8 py-3 bg-fuchsia-600/20 hover:bg-fuchsia-600/30 border border-fuchsia-500/30 text-fuchsia-400 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] transition-all active:scale-95 group flex items-center gap-3"
             >
                Sync Timeline
                <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
             </button>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transits.planets.map((p, i) => {
          const Icon = PLANET_ICONS[p.name] || Circle;
          return (
            <motion.div 
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-slate-900/40 border border-white/10 hover:border-indigo-500/50 p-4 rounded-xl flex items-center justify-between transition-all hover:bg-slate-900/60"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-400/40 transition-all">
                  <Icon size={18} className="text-indigo-400 group-hover:text-white transition-colors" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tighter">{p.name}</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.sign}</p>
                </div>
              </div>
              <div className="text-right flex flex-col items-end">
                <div className="text-sm font-light text-slate-200 tabular-nums">{p.degree.toFixed(2)}°</div>
                <div className="text-[8px] text-indigo-400/60 uppercase font-black tracking-tighter mt-1">
                    {TransitInterpretationEngine.getPlanetInSign(p.name, p.sign).split(' through ')[0]}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Esoteric Activity Log */}
      <div className="mt-8 p-8 bg-slate-900/20 border border-white/5 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <h3 className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black mb-6 flex items-center gap-2 relative z-10">
          <Activity size={12} /> Recent Ingress Events
        </h3>
        <div className="space-y-4 relative z-10">
          {activeAspects.length === 0 && (
             <p className="text-slate-500 text-xs italic text-center">No major aspects detected in current timeline.</p>
          )}
          {activeAspects.map((aspect, i) => (
            <div key={i} className="flex flex-col space-y-2 border-b border-indigo-500/10 pb-4 last:border-0 last:pb-0">
               <div className="flex items-center justify-between">
                  <span className="text-white font-bold uppercase tracking-tight">
                      {aspect.planet1.name} <span className="text-fuchsia-400 font-light mx-1">{aspect.type}</span> {aspect.planet2.name}
                  </span>
                  <span className="text-slate-500 uppercase font-black text-[9px] tracking-widest bg-white/5 px-2 py-0.5 rounded">
                      {aspect.isSynastry ? 'PERSONAL' : 'GLOBAL'} • {aspect.orb.toFixed(2)}°
                  </span>
               </div>
               <p className="text-[11px] text-slate-400 leading-relaxed font-serif italic">
                  {TransitInterpretationEngine.getAspectMeaning(aspect.planet1.name, aspect.type, aspect.planet2.name, aspect.isSynastry || false)}
               </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransitFeed;
