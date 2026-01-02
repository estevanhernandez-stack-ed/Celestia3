"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles,
  Compass, 
  Users, 
  Sun,
  Moon, 
  MessageSquare, 
  Settings, 
  ChevronRight, 
  ChevronLeft,
  Clock, 
  Flame, 
  Hash
} from 'lucide-react';
import NatalCompass from './NatalCompass';
import ChatInterface from './ChatInterface';
import TransitFeed from './TransitFeed';
import RitualVision from './RitualVision';
import NumerologyView from './NumerologyView';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import CosmicCalibration from './CosmicCalibration';
import WelcomeModal from './WelcomeModal';
import OnboardingExperience from './onboarding/OnboardingExperience';
import NumerologyDetailModal from './NumerologyDetailModal';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { NatalChartData } from '@/types/astrology';
import { ARCHETYPES, DESTINY_THREADS, SIGN_RULERS } from '@/utils/astrologyUtils';
import { PLANETARY_FREQUENCIES } from '@/lib/ResonanceService';
import { TarotCard } from '@/lib/TarotConstants';
import RitualControlPanel from './RitualControlPanel';
import { RitualService, RitualResult } from '@/lib/RitualService';
import FeatureDetailModal from './FeatureDetailModal';
import CosmicInsightPanel from './CosmicInsightPanel';
import SynastryView from './SynastryView';
import TarotDeck from './TarotDeck';
import TarotSpread from './TarotSpread';
import GrimoireView from './GrimoireView';
import AtmosphereController from './AtmosphereController';
import { Book } from 'lucide-react';
import { GrimoireService } from '@/lib/GrimoireService';
import { NumerologyEngine } from '@/utils/NumerologyEngine';
import { calculateMoonPhase, getNextMoonPhaseDate } from '@/utils/astrologyUtils';
import { Zap } from 'lucide-react';

type DashboardView = 'compass' | 'synastry' | 'tarot' | 'athanor' | 'rituals' | 'chronos' | 'numerology' | 'grimoire';

const DashboardShell: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>('compass');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isOracleOpen, setIsOracleOpen] = useState(false);

  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const { preferences, updatePreferences } = useSettings();
  const { user } = useAuth();
  const [natalChart, setNatalChart] = useState<NatalChartData | null>(null);
  const [ritualResult, setRitualResult] = useState<RitualResult | null>(null);
  const [isPerformingRitual, setIsPerformingRitual] = useState(false);
  
  const [selectedFeature, setSelectedFeature] = useState<{ title: string; value: string; sub: string } | null>(null);
  const [oraclePrompt, setOraclePrompt] = useState<string | null>(null);
  const [isReplayingFlyby, setIsReplayingFlyby] = useState(false);
  const [selectedNum, setSelectedNum] = useState<{number: number, type: 'Life Path' | 'Destiny' | 'Active' | 'Personal Day'} | null>(null);



  // Check for Welcome
  React.useEffect(() => {
    if (!preferences.hasSeenWelcome && preferences.hasCompletedOnboarding) {
        // Short delay for effect
        setTimeout(() => setIsWelcomeOpen(true), 1500);
    }
  }, [preferences.hasSeenWelcome, preferences.hasCompletedOnboarding]);

  // Handler for Rituals
  const handlePerformRitual = async (intent: string, paradigm: string) => {
    if (!user) return;
    setIsPerformingRitual(true);
    try {
        const result = await RitualService.performRitual(user.uid, intent, paradigm);
        setRitualResult(result);
        
        // Persist to Grimoire
        if (user.uid) {
            await GrimoireService.saveEntry(user.uid, {
                userId: user.uid,
                type: 'ritual',
                title: `Ritual: ${paradigm}`,
                content: {
                    intent,
                    paradigm,
                    result: result.vision.thought
                },
                tags: ['ritual', paradigm.toLowerCase().replace(' ', '-')]
            });
        }
    } catch (e) {
        console.error("Ritual failed", e);
    } finally {
        setIsPerformingRitual(false);
    }
  };

  // Handler for Tarot
  const [tarotState, setTarotState] = useState<{ cards: TarotCard[], spreadId: string } | null>(null);

  // Handler for Tarot
  const handleTarotDraw = async (cards: TarotCard[], spreadId: string) => {
     setTarotState({ cards, spreadId });
     
     // Persist to Grimoire
     if (user?.uid) {
         await GrimoireService.saveEntry(user.uid, {
             userId: user.uid,
             type: 'tarot',
             title: `Reading: ${spreadId}`,
             content: {
                 question: oraclePrompt || "General Guidance",
                 spreadType: spreadId,
                 cards: cards.map(c => ({
                     name: c.name,
                     position: "Spread Position", // Ideally mapped to spread definition
                     orientation: 'upright' 
                 })),
                 interpretation: "Interpretation pending..." // AI integration would go here
             },
             tags: ['tarot', spreadId]
         });
     }
  };

  // Calculate Natal Chart once for all dashboard components
  React.useEffect(() => {
    async function initChart() {
      console.log("Shell: Starting Chart Calc for", preferences.birthDate);
      if (preferences.birthDate && preferences.birthLocation) {
        try {
          const data = await SwissEphemerisService.calculateChart(
            new Date(preferences.birthDate),
            preferences.birthLocation.lat,
            preferences.birthLocation.lng
          );
          console.log("Shell: Chart Calc Success", data);
          setNatalChart(data);
        } catch (error) {
          console.error("Dashboard Chart Calibration Failed", error);
        }
      } else {
        console.log("Shell: Missing birth data");
      }
    }
    initChart();
  }, [preferences.birthDate, preferences.birthLocation]);

  const navItems = [
    { id: 'compass', label: 'Natal Compass', icon: Compass, color: 'text-emerald-500' },
    { id: 'synastry', label: 'Synastry', icon: Users, color: 'text-pink-500' },
    { id: 'tarot', label: 'Tarot Oracle', icon: Sparkles, color: 'text-indigo-400' },
    { id: 'numerology', label: 'Arithmancy', icon: Hash, color: 'text-purple-400' },
    { id: 'chronos', label: 'Chronos', icon: Clock, color: 'text-amber-500' },
    { id: 'rituals', label: 'Rituals', icon: Flame, color: 'text-red-500' },
    { id: 'grimoire', label: 'Grimoire', icon: Book, color: 'text-emerald-300' },
    { id: 'athanor', label: 'Athanor AI', icon: MessageSquare, color: 'text-blue-500' },
  ];

  /* 
    COMPONENTS ARE CURRENTLY DISABLED FOR DEBUGGING 
    Restoring only the skeleton layout.
  */

  return (
    <div className="flex h-screen bg-black text-emerald-400 font-mono overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-black/80 backdrop-blur-xl border-r border-emerald-900/30 transition-all duration-300 flex flex-col z-20`}
      >
        <div className="p-4 border-b border-emerald-900/30 flex items-center justify-between">
            {!isSidebarCollapsed && (
                <div className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    CELESTIA
                </div>
            )}
            <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-emerald-900/20 rounded-lg transition-colors"
            >
                {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
                const Icon = item.icon;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveView(item.id as DashboardView)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all group ${
                            activeView === item.id 
                            ? 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/30' 
                            : 'hover:bg-emerald-900/10 text-emerald-600'
                        }`}
                    >
                        <Icon className={item.color} size={24} />
                        {!isSidebarCollapsed && (
                            <span className="font-medium tracking-wide">{item.label}</span>
                        )}
                    </button>
                )
            })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-emerald-900/30 flex items-center px-6 justify-between bg-black/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-medium tracking-widest text-emerald-400 uppercase">
                    {navItems.find(i => i.id === activeView)?.label}
                </h1>
                
                {/* Moon Phase Widget */}
                <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-emerald-900/20 rounded-full border border-emerald-500/10">
                    <span className="text-lg">{calculateMoonPhase().emoji}</span>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
                            {calculateMoonPhase().phase}
                        </span>
                        <span className="text-[9px] text-emerald-600/70">
                            {getNextMoonPhaseDate().phase} in {getNextMoonPhaseDate().timeRemaining}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                    <div className="text-xs text-emerald-600 uppercase tracking-widest">Operator</div>
                    <div className="text-sm font-bold text-white">{preferences?.name || "Initiate"}</div>
                </div>
                <button 
                    onClick={() => setIsCalibrationOpen(true)}
                    className="p-2 hover:bg-emerald-900/30 rounded-full transition-colors text-emerald-500"
                    title="Cosmic Calibration"
                >
                    <Settings size={20} />
                </button>
            </div>
        </header>

        {/* View Switcher */}
        <main className="flex-1 overflow-auto p-6 relative scrollbar-hide">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeView}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="h-full"
                >
                    {activeView === 'compass' && (
                        <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2">
                             {/* Welcome & Pulse Section */}
                             <div className="space-y-6">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-1">
                                        <h1 className="text-3xl font-bold text-white tracking-tight">
                                            Welcome back, {preferences.name || "Initiate"}
                                        </h1>
                                        <div className="flex items-center gap-3 text-emerald-500/60 text-sm font-mono">
                                            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsReplayingFlyby(true)}
                                        className="mb-1 text-[10px] uppercase tracking-widest text-emerald-600 hover:text-emerald-400 border border-emerald-900/30 hover:bg-emerald-900/20 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        Replay Flyby
                                    </button>
                                </div>

                                {/* Daily Pulse Card */}
                                {(() => {
                                    const pulse = NumerologyEngine.getDailyPulse(preferences.birthDate || new Date());
                                    return (
                                        <div className="bg-gradient-to-r from-slate-900 to-black border border-emerald-900/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                                    <Zap className="text-indigo-400" size={24} />
                                                </div>
                                                <div className="space-y-2">
                                                    <div className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Daily Pulse</div>
                                                    <p className="text-emerald-100/90 leading-relaxed font-medium">
                                                        {pulse.message}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className="bg-black/40 border border-emerald-900 rounded-lg px-4 py-2 text-center">
                                                    <div className="text-[10px] text-emerald-600 uppercase tracking-widest mb-1">Focus</div>
                                                    <div className="text-white font-bold text-sm">{pulse.focus}</div>
                                                </div>
                                                <div className="bg-black/40 border border-emerald-900 rounded-lg px-4 py-2 text-center">
                                                    <div className="text-[10px] text-emerald-600 uppercase tracking-widest mb-1">Color</div>
                                                    <div className={`${pulse.hex} font-bold text-sm`}>{pulse.color}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                 {/* Numerology Row */}
                                <div className="grid grid-cols-3 gap-4">
                                     {[
                                        { 
                                            label: "Life Path", 
                                            val: NumerologyEngine.calculateLifePath(preferences.birthDate || new Date()).core, 
                                            color: "text-amber-400",
                                            desc: "The road you're traveling. Your core purpose."
                                        },
                                        { 
                                            label: "Destiny", 
                                            val: NumerologyEngine.calculateName(preferences.fullName || preferences.name || "", 'pythagorean').core, 
                                            color: "text-cyan-400",
                                            desc: "Your potential. What you're destined to become."
                                        },
                                        { 
                                            label: "Active", 
                                            val: NumerologyEngine.calculateName(preferences.name || "Initiate", 'chaldean').core, 
                                            color: "text-pink-400",
                                            desc: "Your daily energy. How you interact right now."
                                        }
                                     ].map((num, i) => (
                                         <div key={i} className="bg-black/40 border border-emerald-900/30 rounded-xl p-4 flex flex-col items-center justify-center hover:border-emerald-500/30 transition-all group relative cursor-help">
                                             <span className={`text-4xl font-black ${num.color}`}>{num.val}</span>
                                             <span className="text-[10px] uppercase tracking-widest text-emerald-600 mt-1">{num.label}</span>
                                             
                                             {/* Tooltip */}
                                             <div className="absolute top-full mt-2 w-32 p-2 bg-black border border-emerald-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none">
                                                <p className="text-[9px] text-emerald-300 text-center leading-tight">
                                                    {num.desc}
                                                </p>
                                             </div>
                                         </div>
                                     ))}
                                </div>
                             </div>

                             {/* Chart & Compass Grid */}
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                                 <div className="lg:col-span-2 flex flex-col items-center justify-center relative bg-emerald-900/5 rounded-2xl border border-emerald-900/20">
                                      <NatalCompass chart={natalChart} />
                                 </div>

                             {/* Cosmic Identity & Analysis Panel */}
                             <div className="flex flex-col justify-center space-y-6 p-4 overflow-y-auto">
                                  {natalChart ? (
                                    <>
                                        {/* Identity Card */}
                                        <div className="bg-black/40 backdrop-blur-md border border-emerald-500/30 p-6 rounded-xl space-y-4">
                                            <div className="flex items-center gap-3 border-b border-emerald-900/50 pb-3">
                                                <div className="h-10 w-10 rounded-full bg-emerald-900/40 flex items-center justify-center border border-emerald-500/50">
                                                    <span className="text-lg font-bold text-emerald-300">
                                                        {preferences.name ? preferences.name[0].toUpperCase() : "O"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-emerald-300 font-bold tracking-wider text-lg">
                                                        {preferences.name || "OPERATOR"}
                                                    </h2>
                                                    <p className="text-emerald-600 text-xs font-mono uppercase">
                                                        Level 1 Initiate
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                {/* Sun */}
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-2 text-amber-400">
                                                        <Sun size={18} />
                                                        <span className="text-sm font-medium">Sun</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white font-bold">
                                                            {natalChart.planets.find(p => p.name === 'Sun')?.sign}
                                                        </div>
                                                        <div className="text-[10px] text-amber-400/60 uppercase tracking-widest">
                                                            {ARCHETYPES[natalChart.planets.find(p => p.name === 'Sun')?.sign || 'Aries']}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Moon */}
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-2 text-slate-300">
                                                        <Moon size={18} />
                                                        <span className="text-sm font-medium">Moon</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white font-bold">
                                                            {natalChart.planets.find(p => p.name === 'Moon')?.sign}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400/60 uppercase tracking-widest">
                                                            {ARCHETYPES[natalChart.planets.find(p => p.name === 'Moon')?.sign || 'Aries']}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Ascendant */}
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-2 text-purple-400">
                                                        <Compass size={18} />
                                                        <span className="text-sm font-medium">Rising</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white font-bold">
                                                            {natalChart.ascendant?.sign}
                                                        </div>
                                                        <div className="text-[10px] text-purple-400/60 uppercase tracking-widest">
                                                            {ARCHETYPES[natalChart.ascendant?.sign || 'Aries']}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chart Explanation / Destiny Thread */}
                                        <CosmicInsightPanel chart={natalChart} />
                                    </>
                                  ) : (
                                    <div className="text-center text-emerald-500/50 animate-pulse">
                                        Calibrating Astral Sensors...
                                    </div>
                                  )}
                             </div>
                        </div>
                    </div>
                )}

                    {activeView === 'synastry' && <SynastryView userChart={natalChart} />} 
                    {activeView === 'tarot' && (
                        tarotState ? (
                            <TarotSpread 
                                cards={tarotState.cards}
                                spreadType={tarotState.spreadId}
                                onReset={() => setTarotState(null)}
                            />
                        ) : (
                            <TarotDeck 
                                onDraw={handleTarotDraw} 
                                isDrawing={false} 
                            />
                        )
                    )}
                    {activeView === 'numerology' && (
                        <NumerologyView 
                            birthDate={preferences.birthDate || ""} 
                            fullName={preferences.fullName || preferences.name || ""} 
                        />
                    )}
                    {activeView === 'rituals' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                            <RitualControlPanel 
                                onPerformRitual={handlePerformRitual} 
                                isPerforming={isPerformingRitual} 
                            />
                            <RitualVision 
                                isOpen={!!ritualResult}
                                thought={ritualResult?.vision?.thought || null}
                                sigilSvg={ritualResult?.sigil || null}
                                incantation={ritualResult?.vision?.incantation || null}
                                context={ritualResult?.context || null}
                                onClose={() => setRitualResult(null)}
                            />
                        </div>
                    )}
                    {activeView === 'grimoire' && <GrimoireView />}
                    
                    {activeView === 'chronos' && <TransitFeed />}
                    
                    {activeView === 'athanor' && (
                        <div className="h-full">
                            <ChatInterface />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </main>

        {/* Modals & Overlays */}
        <AnimatePresence>
            {isCalibrationOpen && (
                <CosmicCalibration 
                    isOpen={isCalibrationOpen} 
                    onClose={() => setIsCalibrationOpen(false)} 
                />
            )}
            {isWelcomeOpen && (
                <WelcomeModal
                    isOpen={isWelcomeOpen}
                    onClose={() => setIsWelcomeOpen(false)}
                    userName={preferences.name || "Initiate"}
                />
            )}
            {selectedNum && (
                <NumerologyDetailModal
                    isOpen={!!selectedNum}
                    onClose={() => setSelectedNum(null)}
                    number={selectedNum.number}
                    type={selectedNum.type}
                />
            )}
            {isReplayingFlyby && (
                <OnboardingExperience
                    initialStep="flyby"
                    onComplete={() => setIsReplayingFlyby(false)}
                />
            )}
        </AnimatePresence>
      
      <AtmosphereController activeView={activeView} />
     </div>
    </div>
  );
};

export default DashboardShell;

