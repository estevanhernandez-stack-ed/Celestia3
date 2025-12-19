"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, 
  MessageSquare,  
  Activity, Zap, Settings, ChevronLeft, ChevronRight,
  Sparkles,
  Calendar
} from 'lucide-react';
import NatalCompass from './NatalCompass';
import ChatInterface from './ChatInterface';
import TransitFeed from './TransitFeed';
import { useSettings } from '@/context/SettingsContext';
import CosmicCalibration from './CosmicCalibration';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { NatalChartData } from '@/types/astrology';
import { ARCHETYPES, DESTINY_THREADS, SIGN_RULERS } from '@/utils/astrologyUtils';
import { PLANETARY_FREQUENCIES } from '@/lib/ResonanceService';

type DashboardView = 'compass' | 'athanor' | 'rituals' | 'chronos';



const DashboardShell: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>('compass');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const { preferences } = useSettings();
  const [natalChart, setNatalChart] = useState<NatalChartData | null>(null);

  // Calculate Natal Chart once for all dashboard components
  React.useEffect(() => {
    async function initChart() {
      if (preferences.birthDate && preferences.birthLocation) {
        try {
          const data = await SwissEphemerisService.calculateChart(
            new Date(preferences.birthDate),
            preferences.birthLocation.lat,
            preferences.birthLocation.lng
          );
          setNatalChart(data);
        } catch (error) {
          console.error("Dashboard Chart Calibration Failed", error);
        }
      }
    }
    initChart();
  }, [preferences.birthDate, preferences.birthLocation]);

  const navItems = [
    { id: 'compass', icon: Compass, label: 'Natal Compass', color: 'text-emerald-400' },
    { id: 'chronos', icon: Activity, label: 'Chronos Feed', color: 'text-blue-400' },
    { id: 'athanor', icon: MessageSquare, label: 'Athanor (Full)', color: 'text-pink-400' },
    { id: 'rituals', icon: Zap, label: 'Ritual Array', color: 'text-amber-400' },
  ];

  return (
    <div className="flex h-screen bg-black text-emerald-400 font-mono overflow-hidden">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarCollapsed ? '80px' : '280px' }}
        className="border-r border-emerald-900/30 bg-black/40 backdrop-blur-xl flex flex-col z-20"
      >
        <div className="p-6 flex items-center justify-between border-b border-emerald-900/20">
          {!isSidebarCollapsed && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Sparkles size={16} className="text-emerald-500" />
              </div>
              <span className="font-black tracking-tighter text-white uppercase">Celestia <span className="text-emerald-500 text-[8px] border border-emerald-500/20 px-1 rounded ml-1">v3</span></span>
            </motion.div>
          )}
          <button 
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors"
          >
            {isSidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-2 focus-visible:outline-none">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id as DashboardView);
                if (item.id === 'athanor') setIsOracleOpen(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all group ${
                activeView === item.id 
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-white shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                  : 'hover:bg-emerald-950/20 border border-transparent text-emerald-800'
              }`}
            >
              <item.icon size={20} className={`${activeView === item.id ? item.color : 'opacity-40 group-hover:opacity-100 transition-opacity'}`} />
              {!isSidebarCollapsed && (
                <span className="text-xs font-bold uppercase tracking-widest leading-none mt-0.5">
                  {item.label}
                </span>
              )}
            </button>
          ))}

          {/* Persistent Oracle Toggle */}
          {activeView !== 'athanor' && (
            <button
              onClick={() => setIsOracleOpen(!isOracleOpen)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all mt-8 border ${
                isOracleOpen 
                  ? 'bg-pink-500/10 border-pink-500/20 text-pink-400' 
                  : 'hover:bg-pink-900/10 border-transparent text-pink-900/40'
              }`}
            >
              <MessageSquare size={20} />
              {!isSidebarCollapsed && (
                <span className="text-xs font-bold uppercase tracking-widest leading-none mt-0.5">
                  Oracle Logic
                </span>
              )}
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-emerald-900/20">
          <button 
            onClick={() => setIsCalibrationOpen(true)}
            className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-emerald-950/20 transition-all text-emerald-800 group"
          >
            <Settings size={20} className="opacity-40 group-hover:opacity-100 group-hover:rotate-45 transition-all" />
            {!isSidebarCollapsed && (
              <span className="text-xs font-bold uppercase tracking-widest leading-none mt-0.5">
                Calibration
              </span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-hidden flex flex-col">
        {/* View Switcher Container */}
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            {activeView === 'compass' && (
              <motion.div 
                key="compass"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0 p-12 overflow-y-auto custom-scrollbar"
              >
                <div className="max-w-6xl mx-auto space-y-12">
                  <header className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-black text-white tracking-tighter uppercase">Natal Compass</h2>
                      <p className="text-emerald-700 text-xs mt-2 uppercase tracking-[0.3em]">Precision geometry for {preferences.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="block text-[10px] text-emerald-900 uppercase font-black tracking-widest">Stellar Resonance</span>
                      <span className="text-2xl font-light text-emerald-500 tabular-nums">1.61803...</span>
                    </div>
                  </header>

                  <div className="max-w-xl mx-auto">
                    <NatalCompass chart={natalChart} />
                  </div>

                  <div className="grid grid-cols-3 gap-6">
                    {(() => {
                      const sunSign = natalChart?.planets.find(p => p.name === 'Sun')?.sign;
                      const northNodeSign = natalChart?.planets.find(p => p.name === 'North Node')?.sign;
                      const rulingPlanet = sunSign ? SIGN_RULERS[sunSign] : null;
                      const frequency = rulingPlanet ? PLANETARY_FREQUENCIES[rulingPlanet] : null;

                      const cards = [
                        { 
                          title: 'Core Archetype', 
                          value: sunSign ? ARCHETYPES[sunSign] : "Synchronizing...", 
                          sub: sunSign ? `Sun in ${sunSign}` : "Accessing local memory..."
                        },
                        { 
                          title: 'Vibrational Key', 
                          value: frequency ? `${frequency} Hz` : "Calibrating...", 
                          sub: rulingPlanet ? `${rulingPlanet} Resonance` : "Scanning frequencies..."
                        },
                        { 
                          title: 'Destiny Thread', 
                          value: northNodeSign ? DESTINY_THREADS[northNodeSign] : "Tracing...", 
                          sub: northNodeSign ? `Node in ${northNodeSign}` : "Analyzing trajectory..." 
                        }
                      ];

                      return cards.map((card, i) => (
                        <motion.div 
                          key={i} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 + (i * 0.1) }}
                          className="p-6 bg-emerald-950/10 border border-emerald-900/30 rounded-2xl space-y-3 group hover:border-emerald-500/30 transition-colors"
                        >
                          <span className="text-[10px] text-emerald-700 uppercase tracking-widest font-black group-hover:text-emerald-500 transition-colors">{card.title}</span>
                          <div className="space-y-1">
                            <h3 className="text-white font-bold text-lg tracking-tight uppercase">{card.value}</h3>
                            <p className="text-xs text-emerald-100 font-light opacity-60 italic">&quot;{card.sub}&quot;</p>
                          </div>
                          <div className="h-1.5 w-full bg-emerald-900/20 rounded-full overflow-hidden">
                             <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: natalChart ? `${60 + (i*10)}%` : 0 }}
                               transition={{ duration: 2, ease: "easeOut" }}
                               className="h-full bg-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                             />
                          </div>
                        </motion.div>
                      ));
                    })()}
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'chronos' && (
              <motion.div 
                key="chronos"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 p-12 overflow-y-auto custom-scrollbar"
              >
                <TransitFeed />
              </motion.div>
            )}

            {activeView === 'athanor' && (
              <motion.div 
                key="athanor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              >
                <ChatInterface />
              </motion.div>
            )}

            {activeView === 'rituals' && (
              <motion.div 
                key="rituals"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0 flex items-center justify-center p-20"
              >
                <div className="text-center space-y-6">
                  <div className="relative mx-auto w-24 h-24">
                    <Zap size={64} className="text-amber-500/20 absolute inset-0 m-auto animate-pulse" />
                    <Sparkles size={32} className="text-amber-500/40 absolute top-0 right-0 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Ritual Athanor Offline</h3>
                  <p className="text-emerald-800 text-[10px] uppercase tracking-widest max-w-sm mx-auto leading-relaxed border-t border-emerald-900/20 pt-4">
                    The ritual engines are currently cooling. <br/>
                    Interactive spellbooks and sigil generators are scheduled for Phase 11.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Oracle Side-Engine (Chat) */}
      <AnimatePresence mode="wait">
        {isOracleOpen && (
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
            className="w-[450px] border-l border-emerald-900/30 bg-black/80 backdrop-blur-3xl z-30 flex flex-col shadow-[-20px_0_50px_rgba(0,0,0,0.8)] relative"
          >
            <div className="p-4 border-b border-emerald-900/20 flex items-center justify-between bg-black/40">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse shadow-[0_0_8px_#ec4899]" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-pink-500">Oracle Stream</span>
              </div>
              <button 
                onClick={() => setIsOracleOpen(false)}
                className="p-2 hover:bg-emerald-500/10 rounded-lg transition-colors text-emerald-800"
              >
                <ChevronRight size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-hidden relative">
              <ChatInterface />
              {/* Optional: Add a subtle overlay to indicate the side-engine state */}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <CosmicCalibration isOpen={isCalibrationOpen} onClose={() => setIsCalibrationOpen(false)} />
    </div>
  );
};

export default DashboardShell;
