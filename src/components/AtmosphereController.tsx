"use client";

import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { ResonanceService, PLANETARY_FREQUENCIES } from '@/lib/ResonanceService';

// Mapping Views to Planetary Frequencies
const VIEW_RESONANCE_MAP: Record<string, string> = {
  'compass': 'Sun',      // Identity, Vitality
  'synastry': 'Venus',   // Love, Harmony
  'tarot': 'Moon',       // Intuition, Subconscious
  'chronos': 'Saturn',   // Time, Cycles
  'rituals': 'Mars',     // Willpower, Action
  'athanor': 'Mercury',  // Communication
  'numerology': 'Jupiter', // Expansion, Logic
  'grimoire': 'Pluto'    // Transformation, Depth
};

interface AtmosphereProps {
  activeView: string;
}

const AtmosphereController: React.FC<AtmosphereProps> = ({ activeView }) => {
  const activePlanet = VIEW_RESONANCE_MAP[activeView] || 'Earth';
  const [isMuted, setIsMuted] = useState(true); 
  const [volume, setVolume] = useState(0.4);

  // Sync Audio with View
  useEffect(() => {
    if (!isMuted) {
       ResonanceService.startDrone(activePlanet);
    }
  }, [activePlanet, isMuted]);

  // Handle Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    ResonanceService.setVolume(vol);
  };

  // Handle Mute Toggle
  const toggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    ResonanceService.toggleMute(newState);
    
    if (newState) {
       ResonanceService.stopDrone();
    } else {
       ResonanceService.startDrone(activePlanet);
       ResonanceService.setVolume(volume);
    }
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-4 bg-slate-950/80 backdrop-blur-md px-4 py-2 rounded-full border border-indigo-500/30 hover:border-indigo-400/50 transition-all group shadow-2xl">
      <button 
        onClick={toggleMute}
        className={`p-2 rounded-full transition-colors ${isMuted ? 'text-slate-500 hover:text-indigo-400' : 'text-indigo-400 bg-indigo-500/10'}`}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      <div className="flex flex-col w-24">
         <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold mb-1">
            <span className={isMuted ? "text-slate-600" : "text-indigo-400"}>
               {activePlanet}
            </span>
            <span className="text-slate-500">
               {PLANETARY_FREQUENCIES[activePlanet]} Hz
            </span>
         </div>
         <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={handleVolumeChange}
            className="w-full h-1 bg-slate-800 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-500 disabled:opacity-50"
            disabled={isMuted}
         />
      </div>

      <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-slate-800' : 'bg-indigo-500 animate-pulse'}`} />
    </div>
  );
};

export default AtmosphereController;
