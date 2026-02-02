'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ChevronLeft, ChevronRight, Target, Sparkles, Wand2, Volume2, VolumeX, Compass, Shield } from 'lucide-react';
import CelestialScene from './CelestialScene';
import { useAuth } from '@/context/AuthContext';
import { OnboardingService } from '@/lib/OnboardingService';
import { GeocodingService } from '@/lib/GeocodingService';
import { OnboardingBirthInfo, OnboardingChartData } from '@/types/onboarding';
import { useSettings } from '@/context/SettingsContext';
import { voiceService } from '@/lib/VoiceService';
import { ResonanceService } from '@/lib/ResonanceService';

interface OnboardingExperienceProps {
  initialStep?: 'intro' | 'briefing' | 'input' | 'loading' | 'flyby' | 'entrance';
  onComplete?: () => void;
}

const GeminiBadge = () => (
  <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 backdrop-blur-md border border-emerald-500/20 rounded-full group hover:border-emerald-500/50 transition-all pointer-events-auto cursor-default">
      <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Sparkles size={10} className="text-emerald-400 animate-pulse" />
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500/80 group-hover:text-emerald-400">
          Powered by <span className="text-white">Gemini 3</span>
      </span>
  </div>
);

const OnboardingExperience: React.FC<OnboardingExperienceProps> = ({ initialStep = 'intro', onComplete }) => {
  const { preferences, updatePreferences } = useSettings();
  const { user, signInWithGoogle, isAuthenticating } = useAuth();
  const [step, setStep] = useState<'intro' | 'briefing' | 'input' | 'loading' | 'flyby' | 'entrance'>(() => {
    // Always start in loading if initial step is flyby or entrance, to wait for hydration and chart generation
    if (initialStep === 'flyby' || initialStep === 'entrance') return 'loading';
    return initialStep;
  });
  const [birthInfo, setBirthInfo] = useState<OnboardingBirthInfo>(() => {
    if (initialStep === 'flyby' && preferences.birthDate && preferences.birthLocation) {
        const d = new Date(preferences.birthDate);
        const localTime = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        const localISO = localTime.toISOString();

        return {
            date: localISO.split('T')[0],
            time: localISO.split('T')[1].slice(0, 5),
            location: preferences.birthLocation.city || "Unknown",
            fullName: preferences.fullName || "",
            magicName: preferences.name || "Traveler",
            pronouns: preferences.pronouns || "They/Them",
            lat: preferences.birthLocation.lat,
            lng: preferences.birthLocation.lng
        };
    }
    return {
        date: '1995-05-15',
        time: '12:00',
        location: '',
        fullName: '',
        magicName: '',
        pronouns: '',
        lat: 40.7128,
        lng: -74.0060
    };
  });

  const [chartData, setChartData] = useState<OnboardingChartData | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [flybyIndex, setFlybyIndex] = useState(-1);
  const [isFlybyRunning, setIsFlybyRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [viewMode, setViewMode] = useState<'orbit' | 'flyby'>('orbit');

  // Typing timer for geocoding debounce
  const [isSearching, setIsSearching] = useState(false);
  const [coordinatesLocked, setCoordinatesLocked] = useState(false);

  const finishOnboarding = useCallback(() => {
    if (onComplete) {
        onComplete();
        return;
    }

    updatePreferences({
      birthDate: new Date(`${birthInfo.date}T${birthInfo.time}:00`).toISOString(),
      birthLocation: {
        city: birthInfo.location,
        lat: birthInfo.lat || 0,
        lng: birthInfo.lng || 0
      },
      fullName: birthInfo.fullName,
      name: birthInfo.magicName || "Traveler",
      pronouns: birthInfo.pronouns || "They/Them",
      hasCompletedOnboarding: true
    });
  }, [birthInfo, updatePreferences, onComplete]);

  // Auto-geocode when location changes
  React.useEffect(() => {
    // Don't search for short queries
    if (!birthInfo.location || birthInfo.location.length < 3) {
        setIsSearching(false);
        setCoordinatesLocked(false);
        return;
    }
    
    setIsSearching(true);
    setCoordinatesLocked(false);
    
    const timer = setTimeout(async () => {
      const results = await GeocodingService.searchCity(birthInfo.location);
      if (results && results.length > 0) {
        setBirthInfo(prev => ({
          ...prev,
          lat: results[0].lat,
          lng: results[0].lng
        }));
        setCoordinatesLocked(true);
      }
      setIsSearching(false);
    }, 1000); // 1-second debounce

    return () => clearTimeout(timer);
  }, [birthInfo.location]);

  // Handle Chart Generation on Hydration
  useEffect(() => {
    if ((initialStep === 'flyby' || step === 'entrance') && !chartData && preferences.birthDate) {
        OnboardingService.generateChart(birthInfo)
            .then(data => {
                setChartData(data);
                
                // For entrance/returning, find the Sun
                const sun = data.planets.find(p => p.name.toLowerCase() === 'sun');
                if (sun) {
                    setSelectedPlanet(sun.name);
                    const idx = data.planets.findIndex(p => p.name === sun.name);
                    setFlybyIndex(idx);
                } else if (data.planets.length > 0) {
                    setSelectedPlanet(data.planets[0].name);
                    setFlybyIndex(0);
                }

                if (step === 'entrance') {
                    // Stay in entrance for 3 seconds then complete
                    setTimeout(() => {
                        finishOnboarding();
                    }, 4000);
                } else {
                    setStep('flyby');
                    setViewMode('flyby');
                    setIsFlybyRunning(true);
                }
            })
            .catch(err => {
                console.error("Flyby Replay Error:", err);
                setStep('input');
            });
    }
  }, [initialStep, chartData, birthInfo, step, preferences.birthDate, finishOnboarding]);

  // Effect to trigger 'entrance' step for returning users
  useEffect(() => {
    if (!user?.isAnonymous && preferences.hasCompletedOnboarding && step === 'intro') {
        setTimeout(() => {
            setStep('entrance');
            setViewMode('flyby');
        }, 50);
    }
  }, [user, preferences.hasCompletedOnboarding, step]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Force geocoding if location is entered but lat/lng are defaults or search is pending
    let currentLat = birthInfo.lat;
    let currentLng = birthInfo.lng;

    if (birthInfo.location && birthInfo.location.length > 3) {
        if (birthInfo.lat === 40.7128 && birthInfo.lng === -74.0060) {
             setStep('loading'); // Show loading immediately
             try {
                const results = await GeocodingService.searchCity(birthInfo.location);
                if (results && results.length > 0) {
                    currentLat = results[0].lat;
                    currentLng = results[0].lng;
                    setBirthInfo(prev => ({
                        ...prev,
                        lat: currentLat,
                        lng: currentLng
                    }));
                }
             } catch (err) {
                 console.warn("Geocoding failed during submit", err);
             }
        }
    }

    setStep('loading');
    try {
      const data = await OnboardingService.generateChart({
          ...birthInfo,
          lat: currentLat, // Use fresh values
          lng: currentLng
      });
      setChartData(data);
      setStep('flyby');
      setViewMode('flyby');
      // If we just generated, we might want to auto-start or wait? 
      // For now, let's keep it manual unless specified otherwise, but setting viewMode to flyby prepares it.
    } catch (err) {
      console.error(err);
      alert("The stars are obscured. Please try again.");
    }
  };

  const nextFlyby = useCallback(() => {
    if (!chartData) return;
    voiceService.stop();
    setIsSpeaking(false);
    const nextIdx = flybyIndex + 1;
    if (nextIdx < chartData.planets.length) {
      setFlybyIndex(nextIdx);
      setSelectedPlanet(chartData.planets[nextIdx].name);
    } else {
      finishOnboarding();
    }
  }, [chartData, flybyIndex, finishOnboarding]);

  const startFlyby = () => {
    if (!chartData) return;
    setIsFlybyRunning(true);
    setFlybyIndex(0);
    setViewMode('flyby');
    setSelectedPlanet(chartData.planets[0].name);
  };

  const prevFlyby = () => {
    if (!chartData || flybyIndex <= 0) return;
    voiceService.stop();
    setIsSpeaking(false);
    const nextIdx = flybyIndex - 1;
    setFlybyIndex(nextIdx);
    setSelectedPlanet(chartData.planets[nextIdx].name);
  };

  const handleVocalize = async (text: string) => {
    if (isSpeaking) {
      voiceService.stop();
      setIsSpeaking(false);
      ResonanceService.unduck();
      return;
    }
    
    setIsSpeaking(true);
    ResonanceService.duck();
    await voiceService.speak(text, {
      voiceId: preferences.voiceId,
      rate: preferences.voiceSpeed,
      pitch: preferences.voicePitch
    });
    ResonanceService.unduck();
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-100 bg-black overflow-hidden font-mono text-emerald-400">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0 text-white">
        <CelestialScene 
          data={chartData} 
          selectedPlanet={selectedPlanet} 
          onSelectPlanet={(name) => {
            setSelectedPlanet(name);
            if (chartData) {
               const idx = chartData.planets.findIndex(p => p.name === name);
               setFlybyIndex(idx);
            }
          }}
          flybyActive={viewMode === 'flyby' && (isFlybyRunning || selectedPlanet !== null)}
          onReady={() => setIsSceneReady(true)}
        />
      </div>

      {(!isSceneReady && step === 'flyby') && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl font-mono">
             <div className="relative">
                <div className="w-24 h-24 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 border-b-2 border-emerald-900 rounded-full animate-spin-reverse opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <Sparkles className="animate-pulse text-emerald-400" size={32} />
                </div>
              </div>
              <p className="mt-8 text-emerald-400 animate-pulse text-xs font-bold tracking-[0.5em] uppercase">Initializing Holodeck...</p>
              <p className="text-emerald-700 text-[10px] tracking-widest mt-2 uppercase">Calibrating Planetary Sensors</p>
        </div>
      )}

      {/* UI Overlays */}
      <div className="relative z-10 p-8 flex flex-col h-full pointer-events-none">
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-black/60 backdrop-blur-md border border-emerald-500/20 p-6 rounded-2xl max-w-sm shadow-[0_0_30px_rgba(16,185,129,0.1)]"
          >
            <h1 className="text-4xl font-light tracking-tighter text-emerald-400">
              CELESTIA <span className="font-bold text-white">GATEWAY</span>
            </h1>
            <p className="text-[10px] text-emerald-500/50 mt-2 uppercase tracking-[0.3em]">The Stars See You</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'briefing' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex flex-col items-center justify-center h-full w-full pointer-events-auto max-w-6xl mx-auto px-4"
              >
                <div className="bg-black/80 backdrop-blur-2xl border border-emerald-500/30 rounded-3xl md:rounded-[40px] p-6 md:p-12 w-full shadow-[0_0_100px_rgba(16,185,129,0.1)] relative overflow-hidden max-h-[85vh] overflow-y-auto">
                  {/* Glowing background hint */}
                  <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
                  
                  <div className="relative z-10 space-y-12">
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-[10px] font-black uppercase tracking-[0.4em]">
                        <Shield size={12} className="animate-pulse" />
                        Mission Protocol: Authorized
                      </div>
                      <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter uppercase italic">
                        Celestial <span className="text-emerald-500">Intelligence</span> Briefing
                      </h2>
                      <p className="text-emerald-500/60 max-w-2xl mx-auto text-sm md:text-base font-medium leading-relaxed">
                        You are entering a high-fidelity scrying environment. Before we align your local coordinates with the astral grid, review the primary mission modules.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        { 
                          title: "Arithmancy", 
                          subtitle: "Soul Number Engine", 
                          img: "arithmancy.png",
                          desc: "Decompose identities into vibrational frequencies."
                        },
                        { 
                          title: "Rituals", 
                          subtitle: "Sigil Manifestation", 
                          img: "rituals.png",
                          desc: "Procedural sigil logic for intention anchoring."
                        },
                        { 
                          title: "Divination", 
                          subtitle: "Synchronicity Scrying", 
                          img: "tarot.png",
                          desc: "Tarot analytics beyond the veil of coincidence."
                        },
                        { 
                          title: "The Codex", 
                          subtitle: "Knowledge Archive", 
                          img: "codex.png",
                          desc: "A exhaustive repository of celestial archetypes."
                        }
                      ].map((item, i) => (
                        <motion.div 
                          key={i}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                          className="group bg-emerald-950/20 border border-emerald-900/50 rounded-3xl overflow-hidden hover:border-emerald-500/40 transition-all hover:translate-y-[-4px]"
                        >
                          <div className="h-32 bg-emerald-900/20 relative overflow-hidden">
                            <img src={`/previews/${item.img}`} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                          </div>
                          <div className="p-5 space-y-2">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">{item.title}</span>
                              <span className="text-xs font-bold text-white uppercase tracking-tight">{item.subtitle}</span>
                            </div>
                            <p className="text-[10px] text-emerald-500/40 leading-relaxed font-medium uppercase tracking-wider">{item.desc}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="flex flex-col items-center gap-6 pt-4">
                      <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(16,185,129,0.3)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setStep('input')}
                        className="group relative px-16 py-5 bg-emerald-600 rounded-2xl text-black font-black text-sm uppercase tracking-[0.4em] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                      >
                        Secure Genesis Data
                      </motion.button>
                      <button 
                         onClick={() => setStep('intro')}
                         className="text-emerald-500/40 hover:text-emerald-400 text-[10px] uppercase font-bold tracking-[0.4em] transition-colors"
                      >
                        ← Back to Gateway
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'intro' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center justify-center h-full w-full pointer-events-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(16,185,129,0.3)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('briefing')}
                  className="group relative px-12 py-6 bg-transparent border-2 border-emerald-500/50 rounded-full text-emerald-400 font-black text-sm uppercase tracking-[0.5em] transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-4">
                    <Sparkles className="animate-pulse" size={20} />
                    Initiate Genesis
                  </span>
                </motion.button>
                
                <div className="mt-8 flex flex-col items-center gap-4">
                    <p className="text-emerald-500/40 text-[10px] uppercase tracking-[0.4em] font-medium animate-pulse">
                        System Online: Waiting for Operator Input
                    </p>
                    {user?.isAnonymous && (
                        <button 
                            onClick={signInWithGoogle}
                            disabled={isAuthenticating}
                            className="group flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-400 disabled:opacity-50 transition-colors"
                        >
                            <span>{isAuthenticating ? "Synchronizing..." : "Returning Operator?"}</span>
                            {!isAuthenticating && <span className="font-black border-b border-emerald-600/50 group-hover:border-emerald-400">Sign In</span>}
                        </button>
                    )}
                </div>
              </motion.div>
            )}

            {step === 'input' && (
              <motion.form 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onSubmit={handleGenerate} 
                className="bg-black/80 backdrop-blur-xl border border-emerald-500/30 p-6 md:p-8 rounded-3xl w-full max-w-md mx-4 shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6 pointer-events-auto max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <Target size={20} />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-100">Genesis Data</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Magic Name (Avatar)</label>
                    <input 
                      type="text" 
                      placeholder="Your Chosen Identity"
                      className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner"
                      value={birthInfo.magicName || ''}
                      onChange={(e) => setBirthInfo({...birthInfo, magicName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Pronouns</label>
                    <input 
                      type="text" 
                      placeholder="e.g. They/Them"
                      className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner"
                      value={birthInfo.pronouns || ''}
                      onChange={(e) => setBirthInfo({...birthInfo, pronouns: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Full Birth Name</label>
                    <input 
                      type="text" 
                      placeholder="Required for Numerology"
                      className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner"
                      value={birthInfo.fullName || ''}
                      onChange={(e) => setBirthInfo({...birthInfo, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Arrival Date</label>
                    <input 
                      type="date" 
                      className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner"
                      value={birthInfo.date}
                      onChange={(e) => setBirthInfo({...birthInfo, date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Solar Time (Local)</label>
                    <input 
                      type="time" 
                      className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner"
                      value={birthInfo.time}
                      onChange={(e) => setBirthInfo({...birthInfo, time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1 relative">
                    <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Birthplace (City, Country)</label>
                    <div className="relative">
                        <input 
                        type="text" 
                        placeholder="e.g. Paris, France"
                        className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner"
                        value={birthInfo.location}
                        onChange={(e) => setBirthInfo({...birthInfo, location: e.target.value})}
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500/50 pointer-events-none">
                            {isSearching ? (
                                <Sparkles className="animate-spin" size={16} />
                            ) : coordinatesLocked ? (
                                <Target size={16} className="text-emerald-500" />
                            ) : null}
                        </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Latitude</label>
                      <input 
                        type="number" 
                        step="any"
                        className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
                        value={birthInfo.lat}
                        onChange={(e) => setBirthInfo({...birthInfo, lat: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Longitude</label>
                      <input 
                        type="number" 
                        step="any"
                        className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none"
                        value={birthInfo.lng}
                        onChange={(e) => setBirthInfo({...birthInfo, lng: parseFloat(e.target.value) || 0})}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-widest flex items-center justify-center gap-3 overflow-hidden group"
                >
                  <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                  Align the Spheres
                </button>
              </motion.form>
            )}

            {step === 'loading' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/90 backdrop-blur-2xl border border-emerald-500/20 p-16 rounded-[40px] flex flex-col items-center justify-center space-y-6 pointer-events-auto"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 border-b-2 border-emerald-900 rounded-full animate-spin-reverse opacity-50"></div>
                </div>
                <p className="text-emerald-400 animate-pulse text-xs font-bold tracking-[0.5em] uppercase">Consulting the Akashic Records...</p>
              </motion.div>
            )}

            {step === 'entrance' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center space-y-8 pointer-events-none"
              >
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center space-y-4"
                >
                    <h2 className="text-5xl font-black text-white tracking-tighter uppercase italic">
                        Welcome <span className="text-emerald-500">Back</span>, {preferences.name || "Operator"}
                    </h2>
                    <p className="text-emerald-500/60 text-xs font-bold tracking-[0.5em] uppercase animate-pulse">
                        Synchronizing Celestial Grid...
                    </p>
                </motion.div>
                
                <div className="flex items-center gap-4 bg-black/60 backdrop-blur-md border border-emerald-500/20 px-6 py-3 rounded-full">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Targeting {selectedPlanet?.toUpperCase() || "SOL"}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interpretation Box (Bottom) */}
        <AnimatePresence>
          {step === 'flyby' && chartData && (
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="mt-auto flex flex-col gap-6 pointer-events-auto items-end w-full max-w-screen-2xl mx-auto px-8 pb-8"
            >
              {selectedPlanet ? (
                <motion.div 
                  key={selectedPlanet}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-black/60 backdrop-blur-xl border border-emerald-500/20 p-8 rounded-[32px] max-w-xl shadow-[0_0_50px_rgba(16,185,129,0.05)] relative overflow-hidden group"
                >
                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <Wand2 size={120} className="text-emerald-500" />
                  </div>

                  <div className="flex flex-col md:flex-row justify-between items-start mb-4 md:mb-6 border-b border-emerald-900/30 pb-4 gap-4">
                     <div className="flex-1 w-full">
                       <h3 className="text-xl md:text-3xl font-black flex items-center gap-3 md:gap-4 text-white">
                        <span 
                          className="w-3 h-3 md:w-4 md:h-4 rounded-full shadow-[0_0_15px_currentColor] shrink-0"
                          style={{ color: chartData.planets.find(p => p.name === selectedPlanet)?.color }} 
                        />
                        <span className="truncate">
                            {selectedPlanet.toUpperCase()} <span className="text-emerald-500 font-light">IN</span> {chartData.planets.find(p => p.name === selectedPlanet)?.sign.toUpperCase()}
                        </span>
                      </h3>
                      <div className="flex flex-wrap gap-2 md:gap-4 mt-2">
                        <span className="text-[9px] md:text-[10px] text-emerald-500/50 tracking-widest uppercase bg-black/40 px-2 py-1 rounded">
                          Loc: {chartData.planets.find(p => p.name === selectedPlanet)?.degree.toFixed(2)}°
                        </span>
                        <span className="text-[9px] md:text-[10px] text-emerald-500/50 tracking-widest uppercase bg-black/40 px-2 py-1 rounded">
                          House {chartData.planets.find(p => p.name === selectedPlanet)?.house}
                        </span>
                      </div>
                     </div>

                     <button
                       onClick={() => handleVocalize(chartData.planets.find(p => p.name === selectedPlanet)?.interpretation || "")}
                       className={`p-3 md:p-4 rounded-2xl transition-all border shrink-0 ${
                         isSpeaking 
                           ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                           : 'bg-emerald-950/20 text-emerald-500 border-emerald-900/50 hover:bg-emerald-900/40'
                       }`}
                       title={isSpeaking ? "Silence the Athanor" : "Protocol: Listen"}
                     >
                       {isSpeaking ? <VolumeX size={20} className="md:w-6 md:h-6" /> : <Volume2 size={20} className="md:w-6 md:h-6" />}
                     </button>
                  </div>

                  <div className="h-32 md:h-auto overflow-y-auto mb-6 scrollbar-hide">
                    <p className="text-sm md:text-xl text-emerald-50/90 leading-relaxed font-light italic">
                        &quot;{chartData.planets.find(p => p.name === selectedPlanet)?.interpretation}&quot;
                    </p>
                  </div>
                  
                  {isFlybyRunning && (
                     <div className="flex items-center gap-3 md:gap-6">
                      <button 
                        onClick={prevFlyby}
                        disabled={flybyIndex === 0}
                        className="p-3 md:p-4 bg-emerald-950/20 hover:bg-emerald-900/40 disabled:opacity-20 rounded-xl md:rounded-2xl text-emerald-400 transition-all border border-emerald-900/50 shrink-0"
                      >
                        <ChevronLeft size={20} className="md:w-6 md:h-6" />
                      </button>
                      <div className="flex-1 h-1 bg-emerald-950 rounded-full overflow-hidden shadow-inner">
                        <motion.div 
                          className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                          initial={{ width: 0 }}
                          animate={{ width: `${((flybyIndex + 1) / chartData.planets.length) * 100}%` }}
                        />
                      </div>
                      <button 
                        onClick={nextFlyby}
                        className="px-4 py-3 md:px-8 md:py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl md:rounded-2xl text-black font-black transition-all flex items-center gap-2 md:gap-3 shadow-lg shadow-emerald-600/20 group text-xs md:text-base shrink-0"
                      >
                        {flybyIndex === chartData.planets.length - 1 ? 'TRANSCEND' : 'NEXT'} 
                        <ChevronRight size={16} className="md:w-5 md:h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="flex gap-4 mb-20">
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={startFlyby}
                    className="bg-emerald-600 hover:bg-emerald-500 text-black px-8 py-5 rounded-2xl font-black shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all flex items-center gap-4 group"
                  >
                    <Rocket size={24} className="group-hover:-translate-y-1 transition-transform" />
                    Begin Celestial Flyby
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode(viewMode === 'orbit' ? 'flyby' : 'orbit')}
                    className="bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 px-8 py-5 rounded-2xl font-bold hover:bg-emerald-900/40 transition-all flex items-center gap-3"
                  >
                    <Compass size={24} />
                    {viewMode === 'orbit' ? 'Orbit View' : 'Free Camera'}
                  </motion.button>
                  <button 
                    onClick={() => {setChartData(null); setStep('input'); setSelectedPlanet(null);}}
                    className="bg-black/40 backdrop-blur-md border border-emerald-900 text-emerald-700 px-6 py-5 rounded-2xl font-bold hover:bg-emerald-950/30 transition-all"
                  >
                    Reset
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Branding */}
        <div className="mt-auto pointer-events-none">
            <GeminiBadge />
        </div>
      </div>

      <style jsx>{`
        @keyframes spin-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-reverse {
          animation: spin-reverse 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default OnboardingExperience;
