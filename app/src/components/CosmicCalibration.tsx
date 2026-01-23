"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, BookOpen, Atom, Zap, Shield, Target, Volume2, MapPin, Loader2 } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { KnowledgeLevel, Paradigm } from '@/types/preferences';
import { GeocodingService } from '@/lib/GeocodingService';

interface CosmicCalibrationProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFeedback?: () => void;
}

export default function CosmicCalibration({ isOpen, onClose, onOpenFeedback }: CosmicCalibrationProps) {
  const { preferences, updatePreferences, hardReset } = useSettings();

  const paradigms: Paradigm[] = ['Antiquity', 'Picatrix', 'Agrippa', 'PGM', 'Oracles', 'Hermetica'];
  const levels: KnowledgeLevel[] = ['Beginner', 'Intermediate', 'Advanced'];

  // Local state for smooth typing
  const [localDate, setLocalDate] = React.useState('');
  const [localCity, setLocalCity] = React.useState('');
  const [localNames, setLocalNames] = React.useState({
    name: preferences.name,
    fullName: preferences.fullName || '',
    phoneticName: preferences.phoneticName || ''
  });
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [syncStatus, setSyncStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  // Sync with global prefs on open or external change
  React.useEffect(() => {
    if (preferences.birthDate) {
      const d = new Date(preferences.birthDate);
      const localISO = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
      setLocalDate(localISO);
    }
    setLocalCity(preferences.birthLocation?.city || '');
    setLocalNames({
        name: preferences.name,
        fullName: preferences.fullName || '',
        phoneticName: preferences.phoneticName || ''
    });
  }, [preferences.birthDate, preferences.birthLocation?.city, preferences.name, preferences.fullName, preferences.phoneticName, isOpen]);

  const syncLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsSyncing(true);
    setSyncStatus('idle');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const geo = await GeocodingService.reverseGeocode(latitude, longitude);
        
        if (geo) {
          updatePreferences({
            birthLocation: {
              city: geo.name,
              lat: latitude,
              lng: longitude
            }
          });
          setLocalCity(geo.name);
          setSyncStatus('success');
        } else {
          updatePreferences({
            birthLocation: {
              ...(preferences.birthLocation || { city: '' }),
              lat: latitude,
              lng: longitude
            }
          });
          setSyncStatus('success');
        }
        setIsSyncing(false);
        setTimeout(() => setSyncStatus('idle'), 3000);
      },
      (error) => {
        console.error("Location sync failed:", error);
        setSyncStatus('error');
        setIsSyncing(false);
        setTimeout(() => setSyncStatus('idle'), 3000);
      },
      { enableHighAccuracy: true }
    );
  };

  const toggleParadigm = (p: Paradigm) => {
    const active = preferences.activeParadigms.includes(p)
      ? preferences.activeParadigms.filter(item => item !== p)
      : [...preferences.activeParadigms, p];
    updatePreferences({ activeParadigms: active });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-zinc-900 border border-emerald-900 rounded-2xl shadow-[0_0_50px_-12px_rgba(16,185,129,0.3)] overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-emerald-900/50 flex justify-between items-center bg-emerald-950/20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/30 rounded-lg text-emerald-400">
                <Atom size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-emerald-100">Cosmic Calibration</h2>
                <p className="text-xs text-emerald-500 font-mono">ADJUST THEURGIC PARAMETERS</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-emerald-900/30 rounded-full text-emerald-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            {/* Identity */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <User size={16} />
                <span className="text-sm font-bold uppercase tracking-widest">Identity Presence</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-emerald-700 uppercase">Magical Name</label>
                  <input 
                    value={localNames.name}
                    onChange={(e) => {
                        setLocalNames(p => ({ ...p, name: e.target.value }));
                        updatePreferences({ name: e.target.value });
                    }}
                    className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm text-emerald-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-emerald-700 uppercase">Phonetic Spelling</label>
                  <input 
                    placeholder="e.g. Stee-ven"
                    value={localNames.phoneticName}
                    onChange={(e) => {
                        setLocalNames(p => ({ ...p, phoneticName: e.target.value }));
                        updatePreferences({ phoneticName: e.target.value });
                    }}
                    className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm text-pink-400 focus:border-pink-500 outline-none placeholder:text-pink-900/30"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-emerald-700 uppercase">Full Legal Name</label>
                <input 
                  placeholder="Required for Destiny Number"
                  value={localNames.fullName}
                  onChange={(e) => {
                      setLocalNames(p => ({ ...p, fullName: e.target.value }));
                      updatePreferences({ fullName: e.target.value });
                  }}
                  className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm text-emerald-200 focus:border-emerald-500 outline-none placeholder:text-emerald-900/30"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-emerald-700 uppercase">Vibrational Pronouns</label>
                <input 
                  value={preferences.pronouns}
                  onChange={(e) => updatePreferences({ pronouns: e.target.value })}
                  className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm text-emerald-200 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Knowledge Level */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <BookOpen size={16} />
                <span className="text-sm font-bold uppercase tracking-widest">Knowledge Tier</span>
              </div>
              <div className="flex bg-black rounded-xl p-1 border border-emerald-950">
                {levels.map(l => (
                  <button
                    key={l}
                    onClick={() => updatePreferences({ knowledgeLevel: l })}
                    className={`flex-1 py-2 text-xs rounded-lg transition-all ${
                      preferences.knowledgeLevel === l 
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40' 
                        : 'text-emerald-800 hover:text-emerald-500'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* Paradigms */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Shield size={16} />
                <span className="text-sm font-bold uppercase tracking-widest">Active Paradigms</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(paradigms)).map(p => (
                  <button
                    key={p}
                    onClick={() => toggleParadigm(p)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-mono border transition-all ${
                      preferences.activeParadigms.includes(p)
                        ? 'bg-emerald-900/40 border-emerald-500 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                        : 'bg-black border-emerald-950 text-emerald-900 grayscale opacity-50'
                    }`}
                  >
                    {p.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Birth Data (NASA Grounding) */}
            <div className="space-y-4 pt-4 border-t border-emerald-900/30">
              <div className="flex items-center gap-2 text-emerald-400 mb-2">
                <Target size={16} />
                <span className="text-sm font-bold uppercase tracking-widest">Astro Grounding</span>
              </div>

              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 flex items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                        syncStatus === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 
                        syncStatus === 'error' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-900/30 text-emerald-600'
                    }`}>
                        {isSyncing ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-200">Browser Sync</h4>
                        <p className="text-[9px] text-emerald-700">Detect local coordinates via GPS</p>
                    </div>
                </div>
                <button
                    onClick={syncLocation}
                    disabled={isSyncing}
                    className={`px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                        syncStatus === 'success' ? 'bg-emerald-500 text-black' :
                        syncStatus === 'error' ? 'bg-red-950 border border-red-500 text-red-500' :
                        'bg-emerald-900/40 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500 hover:text-black'
                    }`}
                >
                    {isSyncing ? 'Linking...' : syncStatus === 'success' ? 'Harmonized' : syncStatus === 'error' ? 'Failed' : 'Sync Currents'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-emerald-700 uppercase">Birth Date & Time (Local)</label>
                  <input 
                    type="datetime-local"
                    value={localDate}
                    onChange={(e) => {
                      setLocalDate(e.target.value);
                      if (!e.target.value) return;
                      const d = new Date(e.target.value);
                      if (!isNaN(d.getTime())) {
                        updatePreferences({ birthDate: d.toISOString() });
                      }
                    }}
                    className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm text-emerald-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-emerald-700 uppercase">City / Location</label>
                  <input 
                    placeholder="e.g. London, UK"
                    value={localCity}
                    onChange={(e) => {
                      setLocalCity(e.target.value);
                      updatePreferences({ 
                        birthLocation: { 
                          ...(preferences.birthLocation || { lat: 0, lng: 0 }),
                          city: e.target.value
                        } 
                      });
                    }}
                    className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm text-emerald-200 focus:border-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-[10px] text-emerald-700 uppercase">Latitude</label>
                  <input 
                    type="number"
                    step="any"
                    value={preferences.birthLocation?.lat || 0}
                    onChange={(e) => updatePreferences({ 
                      birthLocation: { 
                        ...preferences.birthLocation!,
                        lat: parseFloat(e.target.value) || 0,
                        city: preferences.birthLocation?.city || ''
                      } 
                    })}
                    className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm text-emerald-200 focus:border-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-emerald-700 uppercase">Longitude</label>
                  <input 
                    type="number"
                    step="any"
                    value={preferences.birthLocation?.lng || 0}
                    onChange={(e) => updatePreferences({ 
                      birthLocation: { 
                        ...preferences.birthLocation!,
                        lng: parseFloat(e.target.value) || 0,
                        city: preferences.birthLocation?.city || ''
                      } 
                    })}
                    className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-sm text-emerald-200 focus:border-emerald-500 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>
              </div>
            </div>

            {/* Voice Studio */}
            <div className="space-y-4 pt-4 border-t border-emerald-900/30">
              <div className="flex items-center gap-2 text-pink-400 mb-2">
                <Volume2 size={16} />
                <span className="text-sm font-bold uppercase tracking-widest">Voice Studio</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-pink-900 uppercase">Volume</label>
                  <input 
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={preferences.voiceVolume ?? 1.0}
                    onChange={(e) => updatePreferences({ voiceVolume: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-pink-900 uppercase">Speed</label>
                  <input 
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={preferences.voiceSpeed || 1}
                    onChange={(e) => updatePreferences({ voiceSpeed: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
                <div className="space-y-1 col-span-2">
                  <label className="text-[10px] text-pink-900 uppercase">Pitch</label>
                  <input 
                    type="range"
                    min="-20"
                    max="20"
                    step="1"
                    value={preferences.voicePitch || 0}
                    onChange={(e) => updatePreferences({ voicePitch: parseFloat(e.target.value) })}
                    className="w-full accent-pink-500"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-pink-900 uppercase">Voice Selection</label>
                <select 
                  value={preferences.voiceId || "en-US-Journey-F"}
                  onChange={(e) => updatePreferences({ voiceId: e.target.value })}
                  className="w-full bg-black border border-emerald-900 rounded-lg p-2 text-xs text-pink-400 outline-none focus:border-pink-500"
                >
                  <option value="en-US-Journey-F">JOURNEY (Female)</option>
                  <option value="en-US-Journey-M">JOURNEY (Male)</option>
                  <option value="en-US-Standard-C">STANDARD (Neutral)</option>
                </select>
              </div>
            </div>

            {/* Toggles */}
            <div className="pt-4 border-t border-emerald-900/30 grid grid-cols-2 gap-6">
              <button 
                onClick={() => updatePreferences({ highEntropyMode: !preferences.highEntropyMode })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  preferences.highEntropyMode 
                    ? 'border-purple-500 bg-purple-500/10 text-purple-200' 
                    : 'border-emerald-950 bg-black text-emerald-900'
                }`}
              >
                <Zap size={20} className={preferences.highEntropyMode ? 'animate-pulse' : ''} />
                <span className="text-[10px] uppercase font-bold tracking-tighter">High Entropy</span>
              </button>

              <button 
                onClick={() => updatePreferences({ isKidMode: !preferences.isKidMode })}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                  preferences.isKidMode 
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-200' 
                    : 'border-emerald-950 bg-black text-emerald-900'
                }`}
              >
                <div className="text-xl">✨</div>
                <span className="text-[10px] uppercase font-bold tracking-tighter">Kid Mode</span>
              </button>
            </div>
          </div>

          <div className="p-4 bg-black/50 text-center">
            <button 
              onClick={onClose}
              className="text-xs text-emerald-700 hover:text-emerald-400 transition-colors tracking-widest uppercase font-bold"
            >
              Calibrate Reality [ESC]
            </button>
            {/* Danger Zone / Reset */}
            <div className="pt-8 mt-8 border-t border-red-500/20">
              <div className="flex justify-between items-center mb-4">
                <div>
                <h3 className="text-red-400 font-bold uppercase tracking-widest text-xs">Danger Zone</h3>
                  <p className="text-[10px] text-red-500/50 mt-1">This will permanently delete your astral identity from this device and the cloud.</p>
                </div>
                <button 
                  onClick={() => {
                    if (confirm("PURGE ACCOUNT & HARD RESET?\n\nThis will permanently delete your cloud profile and clear all local data. You will be signed out and redirected to onboarding. This cannot be undone.")) {
                      hardReset();
                    }
                  }}
                  className="px-6 py-2 bg-red-950/20 border border-red-900/50 text-red-500 rounded-lg hover:bg-red-500 hover:text-black transition-all font-bold text-[10px] uppercase tracking-widest"
                >
                  Hard Reset
                </button>
              </div>
            </div>

            {/* Privacy Reassurance Banner */}
            <div className="mt-8 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Target size={14} className="text-emerald-500 opacity-50" />
              </div>
              <p className="text-[9px] text-emerald-500/40 uppercase tracking-widest leading-relaxed">
                <span className="text-emerald-400 font-bold">Privacy Protocol:</span> Your astral data is isolated via Anonymous Authentication. It is visible only to this browser instance and is never cross-referenced with other users.
              </p>
            </div>

            {/* Legal Footer */}
            <div className="mt-6 pt-6 border-t border-white/5 flex justify-center gap-6 items-center">
              <a href="/terms" target="_blank" className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
                Terms
              </a>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <a href="/privacy" target="_blank" className="text-[10px] text-slate-500 hover:text-indigo-400 uppercase tracking-widest transition-colors">
                Privacy
              </a>
              <div className="w-1 h-1 rounded-full bg-white/10" />
              <button 
                onClick={onOpenFeedback}
                className="text-[10px] text-indigo-400 hover:text-white uppercase tracking-widest transition-colors font-bold"
              >
                Report Issue
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
