'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, ChevronLeft, ChevronRight, Target, Sparkles, Wand2, Volume2, VolumeX } from 'lucide-react';
import CelestialScene from './CelestialScene';
import { OnboardingService } from '@/lib/OnboardingService';
import { OnboardingBirthInfo, OnboardingChartData } from '@/types/onboarding';
import { useSettings } from '@/context/SettingsContext';
import { voiceService } from '@/lib/VoiceService';

const OnboardingExperience: React.FC = () => {
  const { preferences, updatePreferences } = useSettings();
  const [step, setStep] = useState<'input' | 'loading' | 'flyby'>('input');
  const [birthInfo, setBirthInfo] = useState<OnboardingBirthInfo>({
    date: '1995-05-15',
    time: '12:00',
    location: 'New York, USA',
    lat: 40.7128,
    lng: -74.0060
  });
  const [chartData, setChartData] = useState<OnboardingChartData | null>(null);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [flybyIndex, setFlybyIndex] = useState(-1);
  const [isFlybyRunning, setIsFlybyRunning] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    try {
      const data = await OnboardingService.generateChart(birthInfo);
      setChartData(data);
      setStep('flyby');
    } catch (err) {
      console.error(err);
      alert("The stars are obscured. Please try again.");
      setStep('input');
    }
  };

  const startFlyby = () => {
    if (!chartData) return;
    setIsFlybyRunning(true);
    setFlybyIndex(0);
    setSelectedPlanet(chartData.planets[0].name);
  };

  const finishOnboarding = useCallback(() => {
    updatePreferences({
      birthDate: new Date(`${birthInfo.date}T${birthInfo.time}:00Z`).toISOString(),
      birthLocation: {
        city: birthInfo.location,
        lat: birthInfo.lat || 0,
        lng: birthInfo.lng || 0
      },
      hasCompletedOnboarding: true
    });
  }, [birthInfo, updatePreferences]);

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
      return;
    }
    
    setIsSpeaking(true);
    await voiceService.speak(text, {
      voiceId: preferences.voiceId,
      rate: preferences.voiceSpeed,
      pitch: preferences.voicePitch
    });
    setIsSpeaking(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black overflow-hidden font-mono text-emerald-400">
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
          flybyActive={isFlybyRunning || selectedPlanet !== null}
        />
      </div>

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
              KALYX <span className="font-bold text-white">GENESIS</span>
            </h1>
            <p className="text-[10px] text-emerald-500/50 mt-2 uppercase tracking-[0.3em]">Precision Natal Flyby engine</p>
          </motion.div>

          <AnimatePresence mode="wait">
            {step === 'input' && (
              <motion.form 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onSubmit={handleGenerate} 
                className="bg-black/80 backdrop-blur-xl border border-emerald-500/30 p-8 rounded-3xl w-[400px] shadow-[0_0_50px_rgba(0,0,0,0.5)] space-y-6 pointer-events-auto"
              >
                <div className="flex items-center gap-3 text-emerald-400 mb-2">
                  <Target size={20} />
                  <h2 className="text-xl font-bold uppercase tracking-widest text-emerald-100">Genesis Data</h2>
                </div>
                
                <div className="space-y-4">
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
                  <div className="space-y-1">
                    <label className="text-[10px] text-emerald-700 uppercase tracking-widest pl-1">Earthly Coordinates</label>
                    <input 
                      type="text" 
                      placeholder="City, Country"
                      className="w-full bg-emerald-950/20 border border-emerald-900/50 rounded-xl px-4 py-3 text-emerald-100 focus:border-emerald-500 outline-none transition-all shadow-inner"
                      value={birthInfo.location}
                      onChange={(e) => setBirthInfo({...birthInfo, location: e.target.value})}
                    />
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

                  <div className="flex justify-between items-start mb-6 border-b border-emerald-900/30 pb-4">
                     <div className="flex-1">
                       <h3 className="text-3xl font-black flex items-center gap-4 text-white">
                        <span 
                          className="w-4 h-4 rounded-full shadow-[0_0_15px_currentColor]"
                          style={{ color: chartData.planets.find(p => p.name === selectedPlanet)?.color }} 
                        />
                        {selectedPlanet.toUpperCase()} <span className="text-emerald-500 font-light">IN</span> {chartData.planets.find(p => p.name === selectedPlanet)?.sign.toUpperCase()}
                      </h3>
                      <div className="flex gap-4 mt-2">
                        <span className="text-[10px] text-emerald-500/50 tracking-widest uppercase">
                          Location: {chartData.planets.find(p => p.name === selectedPlanet)?.degree.toFixed(2)}°
                        </span>
                        <span className="text-[10px] text-emerald-500/50 tracking-widest uppercase">
                          Domain: House {chartData.planets.find(p => p.name === selectedPlanet)?.house}
                        </span>
                      </div>
                     </div>

                     <button
                       onClick={() => handleVocalize(chartData.planets.find(p => p.name === selectedPlanet)?.interpretation || "")}
                       className={`p-4 rounded-2xl transition-all border ${
                         isSpeaking 
                           ? 'bg-emerald-500 text-black border-emerald-400 animate-pulse shadow-[0_0_20px_rgba(16,185,129,0.5)]' 
                           : 'bg-emerald-950/20 text-emerald-500 border-emerald-900/50 hover:bg-emerald-900/40'
                       }`}
                       title={isSpeaking ? "Silence the Oracle" : "Protocol: Listen"}
                     >
                       {isSpeaking ? <VolumeX size={24} /> : <Volume2 size={24} />}
                     </button>
                  </div>

                  <p className="text-xl text-emerald-50/90 leading-relaxed font-light italic mb-8">
                    &quot;{chartData.planets.find(p => p.name === selectedPlanet)?.interpretation}&quot;
                  </p>
                  
                  {isFlybyRunning && (
                     <div className="flex items-center gap-6">
                      <button 
                        onClick={prevFlyby}
                        disabled={flybyIndex === 0}
                        className="p-4 bg-emerald-950/20 hover:bg-emerald-900/40 disabled:opacity-20 rounded-2xl text-emerald-400 transition-all border border-emerald-900/50"
                      >
                        <ChevronLeft size={24} />
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
                        className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl text-black font-black transition-all flex items-center gap-3 shadow-lg shadow-emerald-600/20 group"
                      >
                        {flybyIndex === chartData.planets.length - 1 ? 'TRANSCEND' : 'NEXT BODY'} 
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
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
                    className="bg-emerald-600 hover:bg-emerald-500 text-black px-12 py-5 rounded-2xl font-black shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all flex items-center gap-4 group"
                  >
                    <Rocket size={24} className="group-hover:-translate-y-1 transition-transform" />
                    Begin Celestial Flyby
                  </motion.button>
                  <button 
                    onClick={() => {setChartData(null); setStep('input'); setSelectedPlanet(null);}}
                    className="bg-black/40 backdrop-blur-md border border-emerald-900 text-emerald-500 px-10 py-5 rounded-2xl font-bold hover:bg-emerald-950/30 transition-all"
                  >
                    Recalibrate Input
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
