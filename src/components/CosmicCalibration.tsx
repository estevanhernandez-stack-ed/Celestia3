"use client";

import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Atom, 
  Zap, 
  Shield, 
  Target, 
  Volume2, 
  Globe, 
  Camera,
  Lock,
  Sparkles,
  RefreshCw,
  Info,
  Rocket
} from 'lucide-react';
import { ConfigService } from '@/lib/ConfigService';
import { useSettings } from '@/context/SettingsContext';
import { useAuth } from '@/context/AuthContext';
import { KnowledgeLevel } from '@/types/preferences';
import { GrimoireService } from '@/lib/GrimoireService';
import { GrimoireEntry, AuraEntryContent } from '@/types/grimoire';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { voiceService } from '@/lib/VoiceService';
import CelestialScene from './onboarding/CelestialScene';
import { OnboardingChartData } from '@/types/onboarding';

interface CosmicCalibrationProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'astro' | 'profile' | 'studio' | 'system' | 'about';

export default function CosmicCalibration({ isOpen, onClose }: CosmicCalibrationProps) {
  const { preferences, updatePreferences } = useSettings();
  const { user, signInWithGoogle, logout, isAuthenticating } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('astro');
  const [auraCaptures, setAuraCaptures] = useState<GrimoireEntry[]>([]);
  const [isLinking, setIsLinking] = useState(false);
  const [eggStatus, setEggStatus] = useState({ count: 0, active: false });
  const [nostradamusChart, setNostradamusChart] = useState<OnboardingChartData | null>(null);

  const levels: KnowledgeLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

  useEffect(() => {
    if (isOpen && user?.uid) {
      GrimoireService.getEntries(user.uid).then(entries => {
        setAuraCaptures(entries.filter(e => e.type === 'aura'));
      });
    }
  }, [isOpen, user?.uid]);

  const handleGoogleLink = async () => {
    setIsLinking(true);
    try {
      await signInWithGoogle();
    } catch (_e) {
      console.error("Linking failed", _e);
    } finally {
      setIsLinking(false);
    }
  };

  const handleEggTrigger = async () => {
    const nextCount = eggStatus.count + 1;
    if (nextCount < 3) {
      setEggStatus({ ...eggStatus, count: nextCount });
      return;
    }

    // Trigger Easter Egg
    setEggStatus({ count: 0, active: true });
    
    // Calculate Nostradamus Chart if not already done
    if (!nostradamusChart) {
        try {
            const date = new Date("1503-12-14T12:00:00Z"); // Dec 14, 1503
            const natal = await SwissEphemerisService.calculateChart(date, 43.7892, 4.8329);
            
            // Map to OnboardingChartData with generic interpretations for the egg
            const onboardingChart: OnboardingChartData = {
                summary: "Prophetic alignment detected.",
                ascendant: (natal.ascendant?.sign as string) || "Aries",
                planets: natal.planets.map((p, idx) => ({
                    name: p.name,
                    sign: p.sign as string,
                    degree: p.degree,
                    absoluteDegree: p.absoluteDegree,
                    retrograde: p.retrograde,
                    house: p.house || 1,
                    distance: (idx + 1) * 25,
                    size: p.name === 'Sun' ? 3 : 1.5,
                    interpretation: "A fragment of the master's own destiny...",
                    color: p.name === 'Sun' ? '#fde047' : p.name === 'Moon' ? '#f1f5f9' : '#818cf8'
                }))
            };
            setNostradamusChart(onboardingChart);
        } catch (_err) {
            console.error("Egg calculation failed", _err);
        }
    }

    // Speak with Journey voice
    voiceService.speak("Welcome to Celestia 3, Your Gateway to the Stars.", { 
        voiceId: 'en-US-Journey-F',
        rate: 0.85
    });
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'astro', label: 'Astro', icon: Target },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'studio', label: 'Studio', icon: Volume2 },
    { id: 'system', label: 'System', icon: Shield },
    { id: 'about', label: 'About', icon: Info },
  ];

  return (
    <>
      <motion.div
        key="calibration-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-zinc-950 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col h-[85vh]"
        >
          {/* Header */}
          <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-white/2">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 rounded-2xl text-indigo-400 border border-indigo-500/20">
                <Atom size={24} className="animate-pulse" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white font-serif tracking-tight">Cosmic Calibration</h2>
                <p className="text-[10px] text-indigo-500 font-black font-mono tracking-[0.4em] uppercase">Adjust Theurgic Parameters</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-3 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="px-8 py-2 bg-black/40 border-b border-white/5 overflow-x-auto scrollbar-hide flex gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-widest transition-all rounded-xl relative group ${
                  activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon size={14} className={activeTab === tab.id ? 'text-indigo-400' : 'text-slate-600'} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="activeTabSlot"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 -z-10"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Main Content scrollable */}
          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar space-y-12">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'astro' && (
                  <div className="space-y-10">
                    <section className="space-y-6">
                       <div className="flex items-center gap-3 text-indigo-400">
                          <Target size={18} />
                          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Astro Grounding</h3>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Birth Date & Time</label>
                            <input 
                              type="datetime-local"
                              value={preferences.birthDate ? new Date(new Date(preferences.birthDate).getTime() - (new Date(preferences.birthDate).getTimezoneOffset() * 60000)).toISOString().slice(0, 16) : ''}
                              onChange={(e) => updatePreferences({ birthDate: new Date(e.target.value).toISOString() })}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-200 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                            />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">City / Birthplace</label>
                             <input 
                                placeholder="e.g. Fort Worth, USA"
                                value={preferences.birthLocation?.city || ''}
                                onChange={(e) => updatePreferences({ 
                                  birthLocation: { 
                                    ...(preferences.birthLocation || { lat: 0, lng: 0, city: "" }),
                                    city: e.target.value 
                                  } 
                                })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-200 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Latitude</label>
                             <input 
                                type="number" step="any"
                                value={preferences.birthLocation?.lat || 0}
                                onChange={(e) => updatePreferences({ 
                                  birthLocation: { 
                                    ...(preferences.birthLocation || { lat: 0, lng: 0, city: "" }),
                                    lat: parseFloat(e.target.value) || 0 
                                  } 
                                })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-200 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5"
                             />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Longitude</label>
                             <input 
                                type="number" step="any"
                                value={preferences.birthLocation?.lng || 0}
                                onChange={(e) => updatePreferences({ 
                                  birthLocation: { 
                                    ...(preferences.birthLocation || { lat: 0, lng: 0, city: "" }),
                                    lng: parseFloat(e.target.value) || 0 
                                  } 
                                })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-200 outline-none focus:border-indigo-500/50 focus:bg-indigo-500/5"
                             />
                          </div>
                       </div>
                    </section>

                    <section className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-center gap-6">
                        <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400">
                          <Globe size={24} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xs font-bold text-indigo-200">NASA-Grade Precision</h4>
                          <p className="text-[10px] text-indigo-400/60 leading-relaxed uppercase tracking-wider">
                            Your astral imprint is calculated using Swiss Ephemeris data for sub-arcsecond accuracy across 5,000 years.
                          </p>
                        </div>
                    </section>
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="space-y-12">
                    <section className="space-y-8">
                       <div className="flex items-center gap-3 text-indigo-400">
                          <Camera size={18} />
                          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Avatar Presence</h3>
                       </div>

                       <div className="flex flex-col md:flex-row gap-10 items-center">
                          <div className="relative group">
                              <div className="w-32 h-32 rounded-full border-4 border-indigo-500/20 overflow-hidden bg-slate-900 shadow-2xl relative">
                                  {preferences.profilePictureUrl ? (
                                      <NextImage 
                                        src={preferences.profilePictureUrl} 
                                        className="w-full h-full object-cover" 
                                        alt="Profile" 
                                        width={128} 
                                        height={128} 
                                        unoptimized 
                                      />
                                  ) : (
                                      <div className="w-full h-full flex items-center justify-center text-4xl font-serif text-indigo-300/30">
                                          {preferences.name ? preferences.name[0].toUpperCase() : 'O'}
                                      </div>
                                  )}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                      <Camera className="text-white" size={24} />
                                  </div>
                              </div>
                              <button 
                                onClick={() => updatePreferences({ profilePictureUrl: "" })}
                                className="absolute -bottom-2 -right-2 p-2 bg-red-950/80 border border-red-500/30 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                                title="Remove Profile Picture"
                              >
                                <X size={14} />
                              </button>
                          </div>

                          <div className="flex-1 space-y-4">
                              <h4 className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Select from Aura Gallery or Identity</h4>
                              <div className="flex flex-wrap gap-3">
                                  {/* Google Photo Option */}
                                  {user?.photoURL && (
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => updatePreferences({ profilePictureUrl: user.photoURL! })}
                                      className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all relative group ${
                                        preferences.profilePictureUrl === user.photoURL ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 scale-110' : 'border-white/10 grayscale hover:grayscale-0'
                                      }`}
                                    >
                                      <NextImage 
                                        src={user.photoURL} 
                                        className="w-full h-full object-cover" 
                                        alt="Google Profile" 
                                        width={56} 
                                        height={56} 
                                        unoptimized 
                                      />
                                      <div className="absolute bottom-0 right-0 bg-white rounded-tl-md p-0.5">
                                        <Globe size={8} className="text-blue-500" />
                                      </div>
                                    </motion.button>
                                  )}
                                  {auraCaptures.length > 0 ? (
                                    auraCaptures.map((aura) => {
                                      const content = aura.content as AuraEntryContent;
                                      return (
                                        <motion.button
                                          key={aura.id}
                                          whileHover={{ scale: 1.05 }}
                                          whileTap={{ scale: 0.95 }}
                                          onClick={() => updatePreferences({ profilePictureUrl: content.imageUrl })}
                                          className={`w-14 h-14 rounded-xl border-2 overflow-hidden transition-all ${
                                            preferences.profilePictureUrl === content.imageUrl ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 scale-110' : 'border-white/10 grayscale hover:grayscale-0'
                                          }`}
                                        >
                                          <NextImage 
                                            src={content.imageUrl} 
                                            className="w-full h-full object-cover" 
                                            alt="Aura Capture" 
                                            width={56} 
                                            height={56} 
                                            unoptimized 
                                          />
                                        </motion.button>
                                      );
                                    })
                                  ) : (
                                    <p className="text-[10px] text-slate-600 italic">No aura captures found in your Grimoire. Perform an Aura Cam scan to expand your gallery.</p>
                                  )}
                              </div>
                          </div>
                       </div>
                    </section>

                    <section className="space-y-6 pt-6 border-t border-white/5">
                        <div className="flex items-center justify-between p-6 bg-white/5 border border-white/10 rounded-3xl">
                           <div className="space-y-1">
                              <h4 className="text-xs font-bold text-white flex items-center gap-2">
                                <Globe size={14} className="text-blue-400" />
                                Google Resonance
                              </h4>
                              <p className="text-[10px] text-slate-400">
                                {user?.isAnonymous 
                                  ? "Link your Google account to sync your Grimoire across devices." 
                                  : `Signed in as ${user?.email}`}
                              </p>
                           </div>
                           {user?.isAnonymous ? (
                             <button
                               onClick={handleGoogleLink}
                               disabled={isLinking}
                               className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                             >
                               {isLinking ? "Synchronizing..." : "Link Account"}
                             </button>
                           ) : (
                             <button
                               onClick={async () => {
                                 await logout();
                                 onClose();
                               }}
                               disabled={isAuthenticating}
                               className="px-6 py-2 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/50 text-slate-400 hover:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50"
                             >
                               {isAuthenticating ? "Synchronizing..." : "Sign Out"}
                             </button>
                           )}
                        </div>
                    </section>

                    <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2 md:col-span-2">
                           <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Full Birth Name</label>
                           <input 
                               placeholder="For Arithmancy (e.g. Bruce Thomas Wayne)"
                               value={preferences.fullName || ''}
                               onChange={(e) => updatePreferences({ fullName: e.target.value })}
                               className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-200 outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-700"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Magical Name</label>
                           <input 
                              value={preferences.name}
                              onChange={(e) => updatePreferences({ name: e.target.value })}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-200 outline-none focus:border-indigo-500/50 transition-all"
                           />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Phonetic Spelling</label>
                           <input 
                              placeholder="e.g. Stee-ven"
                              value={preferences.phoneticName || ''}
                              onChange={(e) => updatePreferences({ phoneticName: e.target.value })}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-pink-400 outline-none focus:border-pink-500/50 transition-all placeholder:text-pink-900/30"
                           />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                           <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Digital Grimoire Bio</label>
                           <textarea 
                              placeholder="Write your cosmic intent..."
                              rows={3}
                              value={preferences.bio || ''}
                              onChange={(e) => updatePreferences({ bio: e.target.value })}
                              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-indigo-200 outline-none focus:border-indigo-500/50 transition-all resize-none"
                           />
                        </div>
                    </section>
                  </div>
                )}

                {activeTab === 'studio' && (
                  <div className="space-y-12">
                     <section className="space-y-6">
                        <div className="flex items-center gap-3 text-pink-500">
                           <Volume2 size={18} />
                           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Voice Studio</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                           <div className="space-y-3">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span>Volume</span>
                                <span>{Math.round((preferences.voiceVolume || 0) * 100)}%</span>
                              </div>
                              <input 
                                type="range" min="0" max="1" step="0.1"
                                value={preferences.voiceVolume ?? 1}
                                onChange={(e) => updatePreferences({ voiceVolume: parseFloat(e.target.value) || 0 })}
                                className="w-full accent-pink-500"
                              />
                           </div>
                           <div className="space-y-3">
                              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                <span>Tempo</span>
                                <span>{preferences.voiceSpeed || 1}x</span>
                              </div>
                              <input 
                                type="range" min="0.5" max="2" step="0.1"
                                value={preferences.voiceSpeed || 1}
                                onChange={(e) => updatePreferences({ voiceSpeed: parseFloat(e.target.value) || 1 })}
                                className="w-full accent-pink-500"
                              />
                           </div>
                           <div className="space-y-4 md:col-span-2">
                             <label className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Persona Matrix</label>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {[
                                  { id: 'en-US-Journey-F', label: 'JOURNEY (F)', icon: Sparkles },
                                  { id: 'en-US-Journey-M', label: 'JOURNEY (M)', icon: Zap },
                                  { id: 'en-US-Standard-C', label: 'STANDARD', icon: Globe }
                                ].map(voice => (
                                  <button
                                    key={voice.id}
                                    onClick={() => updatePreferences({ voiceId: voice.id })}
                                    className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-[10px] font-bold tracking-widest uppercase transition-all ${
                                      preferences.voiceId === voice.id ? 'bg-pink-500/10 border-pink-500 text-pink-400' : 'bg-black/50 border-white/5 text-slate-600 hover:border-white/20'
                                    }`}
                                  >
                                    <voice.icon size={12} />
                                    {voice.label}
                                  </button>
                                ))}
                             </div>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-6 pt-10 border-t border-white/5">
                        <div className="flex items-center gap-3 text-indigo-400">
                           <Shield size={18} />
                           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Knowledge Tier</h3>
                        </div>
                        <div className="flex bg-black rounded-2xl p-1.5 border border-white/5">
                           {levels.map(l => (
                              <button
                                key={l}
                                onClick={() => updatePreferences({ knowledgeLevel: l })}
                                className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                  preferences.knowledgeLevel === l 
                                    ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' 
                                    : 'text-slate-600 hover:text-slate-300'
                                }`}
                              >
                                {l}
                              </button>
                           ))}
                        </div>
                     </section>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-12">
                     <section className="grid grid-cols-1 gap-6">
                        <button 
                          onClick={() => updatePreferences({ allowEntropy: !preferences.allowEntropy })}
                          className={`flex flex-col items-start gap-4 p-8 rounded-[2.5rem] border transition-all relative overflow-hidden group ${
                            preferences.allowEntropy 
                              ? 'border-purple-500 bg-purple-500/10 text-purple-200' 
                              : 'border-white/5 bg-black/40 text-slate-600 hover:border-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-4 w-full justify-between">
                            <div className="flex items-center gap-4">
                              <Zap size={32} className={preferences.allowEntropy ? 'animate-pulse text-purple-400' : 'text-slate-700'} />
                              <div className="text-left">
                                <span className="text-lg font-black uppercase tracking-tighter">Entropy Mode</span>
                                <p className="text-[10px] font-mono tracking-widest opacity-60">PROTOCOL: CHAOS_INVOCATION</p>
                              </div>
                            </div>
                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border transition-all ${
                                preferences.allowEntropy ? 'bg-purple-500 text-white border-purple-400' : 'bg-transparent border-slate-700 text-slate-700'
                            }`}>
                                {preferences.allowEntropy ? 'ACTIVE' : 'DORMANT'}
                            </div>
                          </div>
                          
                          <p className="text-[11px] leading-relaxed opacity-60 max-w-md text-left">
                            Invite the **Entropist** to dismantle stagnant logic. Surrender binary certainty to randomized algorithms and sacred liminality.
                          </p>

                          {preferences.allowEntropy && (
                            <motion.div 
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="absolute inset-0 pointer-events-none"
                            >
                                <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-purple-500 to-transparent animate-glitch-line" />
                                <div className="absolute bottom-0 right-0 w-px h-full bg-linear-to-b from-transparent via-purple-500 to-transparent animate-glitch-line-v" />
                            </motion.div>
                          )}
                        </button>

                        <button 
                          onClick={async () => {
                             try {
                                await ConfigService.syncLocalPromptsToCloud();
                                alert("Archives Synchronized.");
                             } catch (_err) {
                                alert("Synchronization Failed.");
                             }
                          }}
                          className="flex items-center justify-between p-8 rounded-[2.5rem] border border-white/5 bg-black/40 text-slate-600 hover:border-white/10 transition-all group w-full"
                        >
                          <div className="flex items-center gap-4">
                            <RefreshCw size={32} className="text-slate-700 group-hover:rotate-180 transition-transform duration-500" />
                            <div className="text-left">
                              <span className="text-lg font-black uppercase tracking-tighter">Sync Archives</span>
                              <p className="text-[10px] font-mono tracking-widest opacity-60">REPAIR_CLOUD_PROMPTS</p>
                            </div>
                          </div>
                          <div className="px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest border border-slate-700 text-slate-700">
                             ADMIN_ONLY
                          </div>
                        </button>
                     </section>

                     <section className="space-y-6 pt-10 border-t border-red-500/20">
                        <div className="flex items-center gap-3 text-red-500">
                           <Lock size={18} />
                           <h3 className="text-sm font-black uppercase tracking-[0.2em] text-white">Danger Zone</h3>
                        </div>
                        <div className="p-8 bg-red-950/10 border border-red-900/20 rounded-4xl flex flex-col md:flex-row items-center justify-between gap-6">
                           <div className="space-y-1 text-center md:text-left">
                              <h4 className="text-xs font-bold text-red-400">Purge Astral Imprint</h4>
                              <p className="text-[10px] text-red-900 leading-relaxed max-w-xs">
                                Permanently delete your birth data, level history, and digital signatures. This action is irreversible.
                              </p>
                           </div>
                           <button 
                             onClick={() => {
                               if (confirm("PURGE ARCHIVE? This will reset your story to zero.")) {
                                 updatePreferences({
                                   hasCompletedOnboarding: false,
                                   birthDate: undefined,
                                   xp: 0,
                                   level: 1,
                                   profilePictureUrl: ""
                                 });
                                 onClose();
                               }
                             }}
                             className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-xl shadow-red-600/20 transition-all font-mono"
                           >
                             Purge All
                           </button>
                        </div>
                     </section>
                  </div>
                )}

                {activeTab === 'about' && (
                    <div className="space-y-12 pb-10">
                        <section className="space-y-8 text-center">
                            <div className="flex justify-center">
                                <div className="p-6 bg-indigo-500/10 rounded-full border border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                    <Sparkles size={48} className="text-indigo-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-4xl font-black text-white italic tracking-tighter">CELESTIA <span className="text-indigo-500">3</span></h3>
                                <p className="text-xs font-bold text-indigo-400/60 uppercase tracking-[0.4em]">The High-Fidelity Spiritual Engine</p>
                            </div>
                            <p className="text-sm text-slate-400 max-w-lg mx-auto leading-relaxed">
                                Celestia 3 is a multimodal agentic environment where astronomical precision meets the ethereal. Built with Gemini 3 for the next generation of seekers.
                            </p>
                        </section>

                        <section className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-white/2 border border-white/5 rounded-3xl text-center space-y-1">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Version</div>
                                <div 
                                    className="text-lg font-mono text-white cursor-help hover:text-indigo-400 transition-colors"
                                    onClick={handleEggTrigger}
                                >
                                    v3.0.4-LUMINA
                                </div>
                            </div>
                            <div className="p-6 bg-white/2 border border-white/5 rounded-3xl text-center space-y-1">
                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Build</div>
                                <div className="text-lg font-mono text-white">HERMETIC_STABLE</div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <h4 className="text-[10px] font-black tracking-[0.2em] text-slate-500 uppercase text-center">Aetheric Architects</h4>
                            <div className="flex flex-wrap justify-center gap-6">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10" />
                                    <span className="text-[10px] font-bold text-white uppercase">Nostradamus</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10" />
                                    <span className="text-[10px] font-bold text-white uppercase">The Seer</span>
                                </div>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 rounded-full bg-slate-900 border border-white/10" />
                                    <span className="text-[10px] font-bold text-white uppercase">Gemini 3</span>
                                </div>
                            </div>
                        </section>
                    </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="px-8 py-6 bg-black/60 border-t border-white/5 flex items-center justify-between">
            <div className="text-[9px] text-slate-600 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-1 bg-indigo-500 rounded-full animate-ping" />
              Operational Resonance: Fixed
            </div>
            <button 
              onClick={onClose}
              className="px-8 py-3 bg-white text-black hover:bg-indigo-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95"
            >
              Commit Calibration
            </button>
          </div>
        </motion.div>
      </motion.div>
      
      <AnimatePresence>
          {eggStatus.active && (
              <NostradamusEgg 
                key="nostradamus-egg-overlay"
                chart={nostradamusChart} 
                onClose={() => setEggStatus({ ...eggStatus, active: false })} 
              />
          )}
      </AnimatePresence>
    </>
  );
}

// --- Nostradamus Easter Egg Overlay ---
function NostradamusEgg({ onClose, chart }: { onClose: () => void, chart: OnboardingChartData | null }) {
    return (
        <motion.div 
            key="nostradamus-egg-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-200 bg-black flex flex-col items-center justify-center"
        >
            <div className="absolute top-12 left-0 w-full flex justify-center z-10">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-black text-white/40 tracking-[1em] uppercase ml-[1em]">Celestia 3</h1>
                    <div className="w-64 h-px bg-linear-to-r from-transparent via-white/20 to-transparent" />
                </div>
            </div>

            <div className="absolute inset-0 z-0">
                {chart && (
                    <CelestialScene 
                        data={chart}
                        selectedPlanet={null}
                        onSelectPlanet={() => {}}
                        flybyActive={false} // Zoomed out, not as a flyby
                        onReady={() => {}}
                    />
                )}
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8 bg-black/40 backdrop-blur-md p-12 rounded-[3rem] border border-white/10 max-w-2xl text-center">
                <div className="space-y-4">
                    <h2 className="text-6xl font-black text-white italic tracking-tighter">MICHEL DE <span className="text-indigo-500">NOSTREDAME</span></h2>
                    <p className="text-xs font-bold text-indigo-400/60 uppercase tracking-[0.5em]">The Eternal Eye • Dec 14, 1503</p>
                </div>

                <div className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-2xl">
                    <p className="text-lg text-indigo-200 leading-relaxed font-serif italic">
                        &quot;Through the machine, the ancient stars speak once more. Welcome to the fusion of logic and prophecy.&quot;
                    </p>
                </div>

                <button 
                    onClick={onClose}
                    className="px-12 py-4 bg-white text-black rounded-full font-black uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-3"
                >
                    <Rocket size={18} />
                    Return to the Present
                </button>
            </div>
        </motion.div>
    );
}
