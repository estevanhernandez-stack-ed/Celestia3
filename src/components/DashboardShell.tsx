"use client";

import React, { useState } from 'react';
import NextImage from 'next/image';
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
  Hash,
  BookOpen,
  Eye,
  Gem,
  Globe,
  Heart, 
  Wind,
  Shield
} from 'lucide-react';
import NatalCompass from './NatalCompass';
import ChatInterface from './ChatInterface';
import TransitFeed from './TransitFeed';
import RitualVision from './RitualVision';
import NumerologyView from './NumerologyView';
import AdminView from './AdminView';
import { LockingRuneIcon } from './AstrologyIcons';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import CosmicCalibration from './CosmicCalibration';
import WelcomeModal from './WelcomeModal';
import OnboardingExperience from './onboarding/OnboardingExperience';
import NumerologyDetailModal from './NumerologyDetailModal';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { NatalChartData } from '@/types/astrology';
import { ARCHETYPES } from '@/utils/astrologyUtils';
import { TarotCard } from '@/lib/TarotConstants';
import RitualControlPanel from './RitualControlPanel';
import { RitualService, RitualResult } from '@/lib/RitualService';
import CosmicInsightPanel from './CosmicInsightPanel';
import SynastryView from './SynastryView';
import TarotDeck from './TarotDeck';
import TarotSpread from './TarotSpread';
import TarotExplorer from './TarotExplorer';
import GrimoireView from './GrimoireView';
import AtmosphereController from './AtmosphereController';
import { Book } from 'lucide-react';
import { GrimoireService } from '@/lib/GrimoireService';
import { NumerologyEngine } from '@/utils/NumerologyEngine';
import { calculateMoonPhase, getNextMoonPhaseDate } from '@/utils/astrologyUtils';
import { Zap } from 'lucide-react';
import GrimoireCodex from './GrimoireCodex';
import CelebrityMatchView from './CelebrityMatchView';
import { ProgressionService, VIEW_LEVEL_REQUIREMENTS, CELESTIAL_QUESTS } from '@/lib/ProgressionService';
import AuraScanner from './AuraScanner';
import { Camera, Target } from 'lucide-react';

type DashboardView = 'compass' | 'synastry' | 'tarot' | 'athanor' | 'rituals' | 'chronos' | 'numerology' | 'grimoire' | 'admin' | 'celebrities' | 'aura';

const DashboardShell: React.FC = () => {
  const [activeView, setActiveView] = useState<DashboardView>('compass');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isTarotExplorationOpen, setIsTarotExplorationOpen] = useState(false);
  const [isCodexOpen, setIsCodexOpen] = useState(false);
  const [isAuraCamOpen, setIsAuraCamOpen] = useState(false);

  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const { preferences, updatePreferences } = useSettings();
  const { user } = useAuth();
  const [natalChart, setNatalChart] = useState<NatalChartData | null>(null);
  const [ritualResult, setRitualResult] = useState<RitualResult | null>(null);
  const [isPerformingRitual, setIsPerformingRitual] = useState(false);
  
  const [isReplayingFlyby, setIsReplayingFlyby] = useState(false);
  const [selectedNum, setSelectedNum] = useState<{number: number, type: 'Life Path' | 'Destiny' | 'Active' | 'Personal Day', source: string} | null>(null);
  const [lockedView, setLockedView] = useState<string | null>(null);

  // Check for Welcome
  React.useEffect(() => {
    if (!preferences.hasSeenWelcome && preferences.hasCompletedOnboarding && !preferences.dismissWelcomePermanent) {
        // Short delay for effect
        setTimeout(() => setIsWelcomeOpen(true), 1500);
    }
  }, [preferences.hasSeenWelcome, preferences.hasCompletedOnboarding, preferences.dismissWelcomePermanent]);

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

        // Add XP
        const progression = ProgressionService.addXP(preferences, 'ritual');
        updatePreferences({ xp: progression.xp, level: progression.level });
        
    } catch (e) {
        console.error("Ritual failed", e);
    } finally {
        setIsPerformingRitual(false);
    }
  };

  // Handler for Tarot
  const [tarotState, setTarotState] = useState<{ cards: TarotCard[], spreadId: string, intent: string } | null>(null);

  const handleTarotDraw = async (cards: TarotCard[], spreadId: string, intent: string) => {
     setTarotState({ cards, spreadId, intent });
     
     // Persist to Grimoire
     if (user?.uid) {
         await GrimoireService.saveEntry(user.uid, {
             userId: user.uid,
             type: 'tarot',
             title: `Reading: ${spreadId}`,
             content: {
                 question: intent || "General Guidance",
                 spreadType: spreadId,
                 cards: cards.map(c => ({
                     name: c.name,
                     position: "Spread Position", 
                     orientation: 'upright' 
                 })),
                 interpretation: "Interpretation pending..." 
             },
             tags: ['tarot', spreadId]
         });
     }

     // Add XP
     const progression = ProgressionService.addXP(preferences, 'tarot');
     updatePreferences({ xp: progression.xp, level: progression.level });
  };

  React.useEffect(() => {
    async function initChart() {
      if (preferences.birthDate && preferences.birthLocation) {
        try {
          console.log("Shell: Starting Chart Calc for", preferences.birthDate);
          const data = await SwissEphemerisService.calculateChart(
            new Date(preferences.birthDate),
            preferences.birthLocation.lat,
            preferences.birthLocation.lng
          );
          setNatalChart(data);
          console.log("Shell: Chart Calc Success", data);
        } catch (error) {
          console.error("Dashboard Chart Calibration Failed", error);
        }
      } else {
        console.log("Shell: Missing birth data");
      }
    }

    // Delay calculation to ensure smooth initial load animations and WelcomeModal entry
    const timer = setTimeout(() => {
        initChart();
    }, 2000);

    return () => clearTimeout(timer);
  }, [preferences.birthDate, preferences.birthLocation]);

  const isAdmin = user?.uid === 'xfytXgoLE8gRc9FpJxTZEx8hfgy2' || user?.uid === 'dev-user-local';
  
  const navItems = [
    { id: 'compass', label: 'Natal Compass', icon: Compass, color: 'text-indigo-400' },
    { id: 'aura', label: 'Aura Cam', icon: Camera, color: 'text-fuchsia-400' },
    { id: 'numerology', label: 'Arithmancy', icon: Hash, color: 'text-cyan-400' },
    { id: 'tarot', label: 'Tarot Deck', icon: Sparkles, color: 'text-violet-400' },
    { id: 'grimoire', label: 'Grimoire', icon: Book, color: 'text-emerald-300' },
    { id: 'rituals', label: 'Rituals', icon: Flame, color: 'text-orange-500' },
    { id: 'chronos', label: 'Chronos', icon: Clock, color: 'text-amber-400' },
    { id: 'celebrities', label: 'Celebrity Synergy', icon: Users, color: 'text-rose-400' },
    { id: 'codex', label: 'Cosmic Codex', icon: BookOpen, color: 'text-indigo-300' },
    { id: 'synastry', label: 'Synastry', icon: Users, color: 'text-fuchsia-400' },
    { id: 'athanor', label: 'Athanor AI', icon: MessageSquare, color: 'text-blue-400' },
  ].filter(Boolean);

  if (isAdmin) {
    navItems.push({ id: 'admin', label: 'Sanctum Control', icon: Shield, color: 'text-cyan-400' });
  }

  const userLevel = preferences.level || 1;

  const handleViewChange = (view: string) => {
    if (view === 'admin' && !isAdmin) return;
    const req = VIEW_LEVEL_REQUIREMENTS[view];
    if (req && userLevel < req) {
      setLockedView(view);
      return;
    }
    setActiveView(view as DashboardView);
  };

  /* 
    COMPONENTS ARE CURRENTLY DISABLED FOR DEBUGGING 
    Restoring only the skeleton layout.
  */

  return (
    <div className="flex h-screen bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-black text-slate-200 font-sans overflow-hidden">
      {/* Sidebar */}
      <div 
        className={`${isSidebarCollapsed ? 'w-20' : 'w-64'} bg-black/40 backdrop-blur-xl border-r border-white/10 transition-all duration-300 flex flex-col z-20 shadow-2xl`}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
            {!isSidebarCollapsed && (
                <div className="font-bold text-xl tracking-wider text-transparent bg-clip-text bg-linear-to-r from-indigo-400 via-fuchsia-400 to-amber-400">
                    CELESTIA
                </div>
            )}
            <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/50 hover:text-white"
            >
                {isSidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {navItems.map((item) => {
                const isLocked = VIEW_LEVEL_REQUIREMENTS[item.id] > userLevel;
                return (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (item.id === 'codex') {
                                setIsCodexOpen(true);
                            } else {
                                handleViewChange(item.id);
                            }
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl transition-all group border ${
                            activeView === item.id 
                            ? 'bg-white/10 text-white border-white/20 shadow-lg shadow-indigo-500/10' 
                            : 'hover:bg-white/5 text-slate-400 border-transparent hover:text-white'
                        } ${isLocked ? 'opacity-50 grayscale-[0.5]' : ''}`}
                    >
                        <div className="flex items-center gap-4">
                            <item.icon className={activeView === item.id ? item.color : 'text-slate-500 group-hover:text-white transition-colors'} size={24} />
                            {!isSidebarCollapsed && (
                                <span className="font-medium tracking-wide text-sm">{item.label}</span>
                            )}
                        </div>
                        {isLocked && <LockingRuneIcon size={12} className="text-slate-600" />}
                    </button>
                )
            })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-white/5 flex items-center px-6 justify-between bg-black/20 backdrop-blur-md z-10 relative">
            <div className="flex items-center gap-6">
                <h1 className="text-xl font-medium tracking-widest text-indigo-200 uppercase font-serif">
                    {navItems.find(i => i.id === activeView)?.label}
                </h1>
                
                {/* Cosmic Wisdom Ticker */}
                <div className="hidden xl:flex items-center gap-3 px-4 py-1.5 bg-white/5 rounded-full border border-white/10 hover:border-indigo-500/30 transition-colors">
                    <Sparkles size={12} className="text-amber-300" />
                    <span className="text-[10px] text-slate-300 uppercase tracking-wider font-medium">
                         Current Current: Neptune Stationing Direct <span className="text-fuchsia-400 mx-1">→</span> Dreams verify Reality.
                    </span>
                </div>

                {/* Moon Phase Widget */}
                <div className="hidden lg:flex items-center gap-3 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    <span className="text-lg">{calculateMoonPhase().emoji}</span>
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] text-fuchsia-300 font-bold uppercase tracking-widest">
                            {calculateMoonPhase().phase}
                        </span>
                        <span className="text-[9px] text-slate-400">
                            {getNextMoonPhaseDate().phase} in {getNextMoonPhaseDate().timeRemaining}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Ascension Progress */}
                <div className="hidden sm:flex flex-col items-end gap-1 mr-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-indigo-300 uppercase font-black tracking-widest">
                            {ProgressionService.getLevelTitle(preferences.level || 1)}
                        </span>
                        <span className="text-xs font-bold text-white bg-indigo-500/20 px-2 py-0.5 rounded border border-indigo-500/30">
                            Lvl {preferences.level || 1}
                        </span>
                    </div>
                    <div className="w-32 h-1.5 bg-black/40 rounded-full border border-white/5 overflow-hidden">
                        <motion.div 
                            className="h-full bg-linear-to-r from-indigo-500 via-fuchsia-500 to-amber-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${((preferences.xp || 0) / ProgressionService.getXPForNextLevel(preferences.level || 1)) * 100}%` }}
                        />
                    </div>
                </div>
                <div className="text-right hidden xl:block">
                    <div className="text-[10px] text-indigo-400/80 uppercase tracking-widest">Operator</div>
                    <div className="text-sm font-bold text-white leading-tight">{preferences?.name || "Initiate"}</div>
                </div>

                {/* Quest Tracker */}
                {(() => {
                    const currentQuest = CELESTIAL_QUESTS.find(q => q.level === (preferences.level || 1));
                    if (!currentQuest) return null;
                    return (
                        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 group cursor-default">
                            <div className="p-1.5 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                <Target size={14} className="text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest leading-none mb-1">Active Quest</span>
                                <span className="text-[11px] text-white font-medium tracking-wide whitespace-nowrap">{currentQuest.title}</span>
                            </div>
                        </div>
                    );
                })()}
                
                {/* Profile Avatar Button */}
                <button 
                    onClick={() => setIsCalibrationOpen(true)}
                    className="relative group profile-avatar-transition"
                >
                    <div className="h-10 w-10 rounded-full border-2 border-indigo-500/20 group-hover:border-indigo-500/50 transition-all overflow-hidden bg-slate-900 flex items-center justify-center shadow-lg shadow-indigo-500/10 active:scale-90 relative">
                        {preferences.profilePictureUrl ? (
                            <NextImage 
                                src={preferences.profilePictureUrl} 
                                alt="Operator Avatar" 
                                className="w-full h-full object-cover"
                                width={40}
                                height={40}
                                unoptimized
                            />
                        ) : (
                            <span className="text-lg font-bold font-serif text-indigo-300">
                                {preferences.name ? preferences.name[0].toUpperCase() : "O"}
                            </span>
                        )}
                    </div>
                    {/* Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-950 rounded-full shadow-sm" />
                </button>

                <button 
                    onClick={() => setIsCalibrationOpen(true)}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-indigo-400 hover:text-white"
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
                                        <div className="flex items-center gap-3 text-slate-400 text-sm font-medium tracking-wide">
                                            <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setIsReplayingFlyby(true)}
                                        className="mb-1 text-[10px] uppercase tracking-widest text-indigo-400 hover:text-white border border-indigo-500/30 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg transition-all"
                                    >
                                        Replay Flyby
                                    </button>
                                </div>

                                {/* Daily Pulse Card */}
                                {(() => {
                                    const pulse = NumerologyEngine.getDailyPulse(preferences.birthDate || new Date());
                                    return (
                                        <div className="bg-linear-to-r from-indigo-950 to-slate-900 border border-indigo-500/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                            
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shrink-0">
                                                    <Zap className="text-indigo-400" size={24} />
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="space-y-1">
                                                        <div className="text-indigo-300 font-bold uppercase tracking-widest text-xs">Daily Pulse</div>
                                                        <p className="text-slate-100 leading-relaxed font-medium font-serif text-lg">
                                                            {pulse.message}
                                                        </p>
                                                    </div>
                                                    
                                                    {pulse.context && (
                                                        <div className="pt-3 border-t border-indigo-500/10 flex items-start gap-2">
                                                            <div className="mt-0.5 w-1 h-3 bg-indigo-500/50 rounded-full" />
                                                            <p className="text-xs text-indigo-300/80 leading-relaxed">
                                                                <span className="font-bold text-indigo-300 uppercase tracking-wider mr-1">Cosmic Resonance:</span>
                                                                {pulse.context}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 shrink-0">
                                                <div className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-center">
                                                    <div className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1">Focus</div>
                                                    <div className="text-white font-bold text-sm">{pulse.focus}</div>
                                                </div>
                                                <div className="bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-center">
                                                    <div className="text-[10px] text-indigo-400 uppercase tracking-widest mb-1">Color</div>
                                                    <div className={`${pulse.hex} font-bold text-sm`}>{pulse.color}</div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })()}

                                {/* Numerology Row */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     {[
                                        { 
                                            label: "Life Path", 
                                            val: NumerologyEngine.calculateLifePath(preferences.birthDate || new Date()).core, 
                                            color: "text-amber-400",
                                            borderColor: "border-amber-500/30",
                                            bg: "bg-amber-950/10",
                                            desc: "The road you're traveling. Your core purpose.",
                                            source: `Birth Date: ${new Date(preferences.birthDate || Date.now()).toLocaleDateString()}`
                                        },
                                        { 
                                            label: "Destiny", 
                                            val: NumerologyEngine.calculateName(preferences.fullName || preferences.name || "", 'pythagorean').core, 
                                            color: "text-cyan-400",
                                            borderColor: "border-cyan-500/30",
                                            bg: "bg-cyan-950/10",
                                            desc: "Your potential. What you're destined to become.",
                                            source: `Birth Name: ${preferences.fullName || preferences.name || "Unknown"}`
                                        },
                                        { 
                                            label: "Active", 
                                            val: NumerologyEngine.calculateName(preferences.name || "Initiate", 'chaldean').core, 
                                            color: "text-pink-400",
                                            borderColor: "border-pink-500/30",
                                            bg: "bg-pink-950/10",
                                            desc: "Your daily energy. How you interact right now.",
                                            source: `Chosen Name: ${preferences.name || "Initiate"}`
                                        }
                                     ].map((num, i) => {
                                         const details = NumerologyEngine.getRichDetails(num.val);
                                         
                                         // Dynamic Icon Mapping
                                         let Icon = Sparkles;
                                         if (num.val === 1) Icon = Flame;
                                         if (num.val === 2) Icon = Users;
                                         if (num.val === 3) Icon = Sparkles;
                                         if (num.val === 4) Icon = Hash; // Structure
                                         if (num.val === 5) Icon = Wind; // Change
                                         if (num.val === 6) Icon = Heart;
                                         if (num.val === 7) Icon = Eye;
                                         if (num.val === 8) Icon = Gem;
                                         if (num.val === 9) Icon = Globe;
                                         if (num.val === 11) Icon = Zap;
                                         if (num.val === 22) Icon = Compass; // Architect
                                         if (num.val === 33) Icon = Sun;

                                         return (
                                         <button 
                                            key={i} 
                                            onClick={() => setSelectedNum({number: num.val, type: num.label as "Life Path" | "Destiny" | "Active" | "Personal Day", source: num.source})}
                                            className={`relative overflow-hidden rounded-2xl border ${num.borderColor} ${num.bg} p-6 flex flex-col items-start justify-between min-h-[160px] hover:scale-[1.02] transition-all group text-left w-full hover:shadow-2xl hover:shadow-${num.color.replace('text-', '')}/20`}
                                         >
                                             {/* Header */}
                                             <div className="flex justify-between items-start w-full z-10">
                                                 <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500/80 mb-1">{num.label}</span>
                                                    <span className={`text-xs font-bold ${num.color} opacity-90 uppercase tracking-wider max-w-[120px] leading-tight`}>
                                                        {details.title}
                                                    </span>
                                                 </div>
                                                 <div className={`p-2 rounded-lg bg-black/40 border ${num.borderColor}`}>
                                                     <Icon className={`${num.color} opacity-80`} size={18} />
                                                 </div>
                                             </div>
                                             
                                             {/* Big Number Watermark */}
                                             <div className={`absolute -bottom-6 -right-4 text-9xl font-black ${num.color} opacity-[0.07] group-hover:opacity-[0.15] transition-opacity select-none pointer-events-none`}>
                                                 {num.val}
                                             </div>
                                             
                                             {/* Main Number Display */}
                                             <div className="z-10 mt-6 flex items-baseline gap-2">
                                                 <span className={`text-5xl font-black ${num.color} tracking-tighter filter drop-shadow-lg`}>
                                                    {num.val}
                                                 </span>
                                             </div>

                                             <div className="z-10 mt-2 opacity-0 group-hover:opacity-100 transition-opacity absolute bottom-4 right-4 bg-black/90 px-3 py-1.5 rounded-full text-[9px] text-emerald-400 border border-emerald-500/30 font-bold tracking-widest uppercase shadow-xl">
                                                Tap to Decode
                                             </div>
                                         </button>
                                     )})}
                                </div>
                             </div>

                             {/* Chart & Compass Grid */}
                             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px]">
                                 <div className="lg:col-span-2 flex flex-col items-center justify-center relative bg-black/40 rounded-2xl border border-white/5">
                                      <NatalCompass chart={natalChart} />
                                 </div>

                             {/* Cosmic Identity & Analysis Panel */}
                             <div className="flex flex-col justify-center space-y-6 p-4 overflow-y-auto">
                                  {natalChart ? (
                                    <>
                                        {/* Identity Card */}
                                        <div className="bg-slate-900/40 backdrop-blur-md border border-white/10 p-6 rounded-xl space-y-4 shadow-xl">
                                            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                                                <div className="h-10 w-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-400/30">
                                                    <span className="text-lg font-bold text-indigo-300">
                                                        {preferences.name ? preferences.name[0].toUpperCase() : "O"}
                                                    </span>
                                                </div>
                                                <div>
                                                    <h2 className="text-white font-bold tracking-wider text-lg font-serif">
                                                        {preferences.name || "OPERATOR"}
                                                    </h2>
                                                    <p className="text-indigo-400 text-xs font-mono uppercase tracking-widest">
                                                        Level {preferences.level || 1} {ProgressionService.getLevelTitle(preferences.level || 1)}
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
                                                            {natalChart?.planets.find(p => p.name === 'Moon')?.sign}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400/60 uppercase tracking-widest">
                                                            {ARCHETYPES[natalChart?.planets.find(p => p.name === 'Moon')?.sign || 'Aries']}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Ascendant */}
                                                <div className="flex items-center justify-between group">
                                                    <div className="flex items-center gap-2 text-fuchsia-400">
                                                        <Compass size={18} />
                                                        <span className="text-sm font-medium">Rising</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-white font-bold">
                                                            {natalChart?.ascendant?.sign}
                                                        </div>
                                                        <div className="text-[10px] text-fuchsia-400/60 uppercase tracking-widest">
                                                            {ARCHETYPES[natalChart?.ascendant?.sign || 'Aries']}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Chart Explanation / Destiny Thread */}
                                        <CosmicInsightPanel chart={natalChart} />
                                    </>
                                  ) : (
                                    <div className="text-center text-indigo-400/50 animate-pulse font-serif">
                                        Calibrating Astral Sensors...
                                    </div>
                                  )}
                             </div>
                        </div>
                    </div>
                )}

                    {activeView === 'synastry' && <SynastryView userChart={natalChart} />} 
                    {activeView === 'tarot' && (
                        isTarotExplorationOpen ? (
                           <TarotExplorer onBack={() => setIsTarotExplorationOpen(false)} />
                        ) : tarotState ? (
                            <TarotSpread 
                                cards={tarotState.cards}
                                spreadType={tarotState.spreadId}
                                onReset={() => setTarotState(null)}
                            />
                        ) : (
                            <TarotDeck 
                                onDraw={handleTarotDraw} 
                                onExplore={() => setIsTarotExplorationOpen(true)}
                                isDrawing={false} 
                            />
                        )
                    )}
                    {activeView === 'numerology' && (
                        <NumerologyView 
                            birthDate={preferences.birthDate || ""} 
                            fullName={preferences.fullName || preferences.name || ""} 
                            commonName={preferences.name}
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

                    {activeView === 'celebrities' && (
                        <CelebrityMatchView userChart={natalChart as NatalChartData} />
                    )}

                    {activeView === 'aura' && (
                        <AuraScanner 
                            isEmbedded={true}
                            onClose={() => setActiveView('compass')}
                            natalChart={natalChart}
                            city={preferences.birthLocation?.city}
                            onSave={async (capture) => {
                                // Persist to Grimoire
                                if (user?.uid) {
                                    await GrimoireService.saveEntry(user.uid, {
                                        userId: user.uid,
                                        type: 'aura',
                                        title: `Aura Capture: ${new Date(capture.date).toLocaleDateString()}`,
                                        content: {
                                            imageUrl: capture.imageUrl,
                                            analysis: capture.analysis,
                                            colors: capture.colors,
                                            city: capture.city,
                                            resonance: capture.resonance
                                        },
                                        tags: ['aura', 'ritual']
                                    });
                                }
                                
                                // Add XP
                                const progression = ProgressionService.addXP(preferences, 'aura-scan');
                                updatePreferences({ xp: progression.xp, level: progression.level });
                            }}
                        />
                    )}

                    {activeView === 'admin' && isAdmin && (
                        <AdminView />
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
                    onClose={(dontShowAgain) => {
                        setIsWelcomeOpen(false);
                        updatePreferences({ 
                            hasSeenWelcome: true,
                            dismissWelcomePermanent: dontShowAgain 
                        });
                    }}
                    userName={preferences.name || "Initiate"}
                />
            )}
            {selectedNum && (
                <NumerologyDetailModal
                    isOpen={!!selectedNum}
                    onClose={() => setSelectedNum(null)}
                    number={selectedNum.number}
                    type={selectedNum.type}
                    source={selectedNum.source}
                />
            )}
            {isReplayingFlyby && (
                <OnboardingExperience
                    initialStep="flyby"
                    onComplete={() => setIsReplayingFlyby(false)}
                />
            )}
            {isCodexOpen && (
                <GrimoireCodex 
                    isOpen={isCodexOpen} 
                    onClose={() => setIsCodexOpen(false)} 
                />
            )}
            {isAuraCamOpen && (
                <AuraScanner 
                    onClose={() => setIsAuraCamOpen(false)}
                    natalChart={natalChart}
                    city={preferences.birthLocation?.city}
                    onSave={async (capture) => {
                        // Persist to Grimoire
                        if (user?.uid) {
                            await GrimoireService.saveEntry(user.uid, {
                                userId: user.uid,
                                type: 'aura',
                                title: `Aura Capture: ${new Date(capture.date).toLocaleDateString()}`,
                                content: {
                                    imageUrl: capture.imageUrl,
                                    analysis: capture.analysis,
                                    colors: capture.colors,
                                    city: capture.city,
                                    resonance: capture.resonance
                                },
                                tags: ['aura', 'ritual']
                            });
                        }
                        
                        // Add XP
                        const progression = ProgressionService.addXP(preferences, 'aura-scan');
                        updatePreferences({ xp: progression.xp, level: progression.level });
                        setIsAuraCamOpen(false);
                    }}
                />
            )}
            {lockedView && (
                <div 
                    className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
                    onClick={() => setLockedView(null)}
                >
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-slate-950 border border-indigo-500/30 p-12 rounded-[3rem] shadow-2xl shadow-indigo-500/10 max-w-md w-full text-center space-y-8 relative overflow-hidden"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-transparent via-indigo-500/50 to-transparent" />
                        <div className="flex justify-center">
                            <div className="p-6 bg-indigo-500/10 rounded-full border border-indigo-500/20 relative">
                                <LockingRuneIcon size={48} className="text-indigo-400" />
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                                    className="absolute inset-0 border-2 border-dashed border-indigo-500/20 rounded-full"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-2xl font-bold font-serif text-white uppercase tracking-[0.2em]">Talisman Locked Gate</h2>
                            <p className="text-slate-400 text-[11px] leading-relaxed uppercase tracking-widest">
                                Your soul current is not yet tuned to the frequencies of <span className="text-indigo-300 font-black">{lockedView}</span>.
                            </p>
                            
                            <div className="py-2 px-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                                <p className="text-[9px] text-indigo-400 font-medium italic">
                                    &quot;Perform exploration tasks in the Natal Compass or Athanor to level up and unlock this talisman.&quot;
                                </p>
                            </div>

                            <div className="pt-2 flex flex-col items-center gap-1">
                                <div className="text-[9px] text-indigo-500 font-black uppercase tracking-[0.3em]">Required Level</div>
                                <div className="text-2xl font-serif text-white font-black">{lockedView ? VIEW_LEVEL_REQUIREMENTS[lockedView] : 0}</div>
                                <div className="text-[8px] text-slate-500 uppercase tracking-widest">{lockedView ? ProgressionService.getLevelTitle(VIEW_LEVEL_REQUIREMENTS[lockedView]) : ''}</div>
                            </div>
                        </div>
                        <button 
                            onClick={() => setLockedView(null)}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl transition-all active:scale-95"
                        >
                            Understood
                        </button>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
      
      <AtmosphereController activeView={activeView} />
     </div>
    </div>
  );
};

export default DashboardShell;
