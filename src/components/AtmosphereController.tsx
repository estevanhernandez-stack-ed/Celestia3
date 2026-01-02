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
    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-emerald-900/40 hover:border-emerald-500/30 transition-all group">
      <button 
        onClick={toggleMute}
        className={`p-2 rounded-full transition-colors ${isMuted ? 'text-emerald-800 hover:text-emerald-500' : 'text-emerald-400 bg-emerald-500/10'}`}
      >
        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
      </button>

      <div className="flex flex-col w-24">
         <div className="flex justify-between items-center text-[9px] uppercase tracking-widest font-bold mb-1">
            <span className={isMuted ? "text-emerald-900" : "text-emerald-500"}>
               {activePlanet}
            </span>
            <span className="text-emerald-800">
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
            className="w-full h-1 bg-emerald-900/50 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 disabled:opacity-50"
            disabled={isMuted}
         />
      </div>

      <div className={`w-2 h-2 rounded-full ${isMuted ? 'bg-emerald-900' : 'bg-emerald-500 animate-pulse'}`} />
    </div>
  );
};

export default AtmosphereController;
