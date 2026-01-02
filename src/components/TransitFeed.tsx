"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sun, Moon, Zap, Heart, Flame, Crown, 
  Circle, Compass, Waves, Ghost, Sparkles,
  Clock, MapPin, Activity
} from 'lucide-react';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { NatalChartData, Aspect } from '@/types/astrology';
import { useSettings } from '@/context/SettingsContext';
import BiWheelCompass from './BiWheelCompass';
import { AspectEngine } from '@/utils/AspectEngine';

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
  const { preferences } = useSettings();
  const [transits, setTransits] = useState<NatalChartData | null>(null);
  const [natalChart, setNatalChart] = useState<NatalChartData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAspects, setActiveAspects] = useState<Aspect[]>([]);

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

  if (!transits) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Activity className="animate-pulse text-blue-500" size={32} />
      <p className="text-[10px] uppercase tracking-[0.5em] text-blue-900">Scanning Temporal Flux...</p>
    </div>
  );

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      <header className="flex justify-between items-center border-b border-blue-900/30 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3">
             <Clock className="text-blue-500" size={24} />
             Chronos Feed
          </h2>
          <p className="text-blue-700 text-[10px] mt-1 uppercase tracking-[0.3em] flex items-center gap-2">
            <MapPin size={10} /> {preferences.birthLocation?.city || "Aetheric Anchor"} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div className="text-right bg-blue-500/5 border border-blue-500/20 px-4 py-2 rounded-lg">
          <span className="block text-[8px] text-blue-900 uppercase font-black tracking-widest">Temporal Variance</span>
          <span className="text-sm font-bold text-blue-400 tabular-nums">±0.00042s</span>
        </div>
      </header>

      {/* BI-WHEEL VISUALIZATION */}
      {natalChart && transits && (
        <section className="relative py-8 bg-blue-900/5 rounded-3xl border border-blue-900/10">
          <div className="absolute top-6 left-6 z-10">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60 block mb-1">Celestial Synthesis</span>
            <h3 className="text-lg font-bold text-white tracking-tighter uppercase">Transit-to-Natal Map</h3>
          </div>
          <BiWheelCompass innerChart={natalChart} outerChart={transits} outerLabel="Current Transit" />
          <div className="absolute bottom-6 right-6 text-right max-w-xs">
            <p className="text-[8px] text-blue-800 uppercase tracking-widest leading-relaxed">
              Dashed lines indicate active aspects between current planetary positions and your natal geometry.
            </p>
          </div>
        </section>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transits.planets.map((p, i) => {
          const Icon = PLANET_ICONS[p.name] || Circle;
          return (
            <motion.div 
              key={p.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="group bg-blue-950/10 border border-blue-900/20 hover:border-blue-500/30 p-4 rounded-xl flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-500/5 flex items-center justify-center border border-blue-500/10 group-hover:border-blue-500/30 transition-all">
                  <Icon size={18} className="text-blue-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-tighter">{p.name}</h4>
                  <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest">{p.sign}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-light text-blue-100 tabular-nums">{p.degree.toFixed(2)}°</div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Esoteric Activity Log */}
      <div className="mt-8 p-8 bg-blue-500/5 border border-blue-900/20 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <h3 className="text-[10px] text-blue-700 uppercase tracking-[0.4em] font-black mb-6 flex items-center gap-2 relative z-10">
          <Activity size={12} /> Recent Ingress Events
        </h3>
        <div className="space-y-4 relative z-10">
          {activeAspects.length === 0 && (
             <p className="text-blue-500/50 text-xs italic text-center">No major aspects detected in current timeline.</p>
          )}
          {activeAspects.map((aspect, i) => (
            <div key={i} className="flex items-center justify-between text-xs border-b border-blue-900/10 pb-4 last:border-0 last:pb-0">
               <span className="text-white font-medium">
                  {aspect.planet1.name} <span className="text-blue-500 font-light">{aspect.type}</span> {aspect.planet2.name}
               </span>
               <span className="text-blue-900 uppercase font-black text-[9px] tracking-widest">
                  {aspect.isSynastry ? 'PERSONAL' : 'GLOBAL'} • {aspect.orb.toFixed(2)}°
               </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransitFeed;
