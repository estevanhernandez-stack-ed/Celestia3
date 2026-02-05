"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, User, MapPin, Calendar, Clock, RefreshCw, Bot, Loader2, Volume2, Square, Trash2 } from 'lucide-react';
import { NatalChartData } from '@/types/astrology';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { GeocodingService, GeoLocation } from '@/lib/GeocodingService';
import BiWheelCompass from './BiWheelCompass';
import { useSettings } from '@/context/SettingsContext';
import { SavedChart } from '@/types/preferences';
import { ChatService } from '@/lib/ChatService';
import { voiceService } from '@/lib/VoiceService';
import { AethericThoughtStream } from './AethericThoughtStream';

interface SynastryViewProps {
  userChart: NatalChartData | null;
}

const SynastryView: React.FC<SynastryViewProps> = ({ userChart }) => {
  // Relationship Type State
  const [relationshipType, setRelationshipType] = useState<'Romantic' | 'Platonic' | 'Business' | 'Family' | 'Child' | 'Other'>('Romantic');
  const { preferences, updatePreferences } = useSettings();
  
  const [partnerName, setPartnerName] = useState("");
  const [partnerDate, setPartnerDate] = useState("");
  const [partnerTime, setPartnerTime] = useState("");
  const [partnerLocation, setPartnerLocation] = useState({ lat: 0, lng: 0, city: "" });
  const [partnerChart, setPartnerChart] = useState<NatalChartData | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Analysis State
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [analysisText, setAnalysisText] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech if component unmounts
  useEffect(() => {
    return () => {
      voiceService.stop();
    };
  }, []);

  // Location Search State
  const [locationResults, setLocationResults] = useState<GeoLocation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleLocationSearch = async (query: string) => {
    if (query.length < 3) {
        setLocationResults([]);
        return;
    }
    
    setIsSearching(true);
    try {
        const results = await GeocodingService.searchCity(query);
        setLocationResults(results);
    } catch (e) {
        console.error("Location search failed", e);
    } finally {
        setIsSearching(false);
    }
  };

  const handleLocationSelect = (loc: GeoLocation) => {
      setPartnerLocation({
          lat: loc.lat,
          lng: loc.lng,
          city: `${loc.name}, ${loc.country}`
      });
      setLocationResults([]);
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const date = new Date(`${partnerDate}T${partnerTime}`);
      const chart = await SwissEphemerisService.calculateChart(date, partnerLocation.lat, partnerLocation.lng);
      setPartnerChart(chart);
    } catch (e) {
      console.error("Failed to calculate partner chart", e);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleSaveConnection = () => {
    if (!partnerChart || !partnerName) return;
    
    const newSavedChart: SavedChart = {
        id: crypto.randomUUID(),
        name: partnerName,
        date: partnerDate,
        time: partnerTime,
        location: partnerLocation,
        relationshipType: relationshipType
    };

    const currentSaved = preferences.savedCharts || [];
    
    const existingIndex = currentSaved.findIndex(c => c.name.toLowerCase() === partnerName.toLowerCase());

    const chartToSave: SavedChart = {
        ...newSavedChart,
        analysisReport: analysisText // Save the generated report
    };

    if (existingIndex >= 0) {
        const updatedList = [...currentSaved];
        // Merge but keep original ID
        updatedList[existingIndex] = { ...chartToSave, id: currentSaved[existingIndex].id };
        updatePreferences({ savedCharts: updatedList });
    } else {
        updatePreferences({ savedCharts: [...currentSaved, chartToSave] });
    }
  };

  const handleDeleteSaved = (id: string) => {
    const currentSaved = preferences.savedCharts || [];
    const newSaved = currentSaved.filter(c => c.id !== id);
    updatePreferences({ savedCharts: newSaved });
  };

  const handleLoadSaved = (saved: SavedChart) => {
      setPartnerName(saved.name);
      setPartnerDate(saved.date);
      setPartnerTime(saved.time);
      setPartnerLocation(saved.location);
      setRelationshipType(saved.relationshipType);
      
      // Load saved analysis if available
      if (saved.analysisReport) {
          setAnalysisText(saved.analysisReport);
          setAnalysisStatus('success');
      } else {
          setAnalysisText("");
          setAnalysisStatus('idle');
      }
  };

  const handleReset = () => {
    setPartnerChart(null);
    setPartnerName("");
    setPartnerDate("");
    setPartnerTime("");
    setPartnerLocation({ lat: 0, lng: 0, city: "" });
    setAnalysisStatus('idle');
    setAnalysisText("");
    voiceService.stop();
    setIsSpeaking(false);
  };

  const aspects = useMemo(() => {
    if (!userChart || !partnerChart) return [];
    const results = [];
    
    // Naive aspect check
    for (const p1 of userChart.planets) {
      for (const p2 of partnerChart.planets) {
        // Only check major planets for clean output
        if (['North Node', 'South Node'].includes(p1.name) || ['North Node', 'South Node'].includes(p2.name)) continue;

        const diff = Math.abs(p1.absoluteDegree - p2.absoluteDegree);
        const shortestDiff = Math.min(diff, 360 - diff);
        
        let type = "";
        if (shortestDiff < 8) type = "Conjunction";
        else if (Math.abs(shortestDiff - 180) < 8) type = "Opposition";
        else if (Math.abs(shortestDiff - 120) < 6) type = "Trine";
        else if (Math.abs(shortestDiff - 90) < 6) type = "Square";
        else if (Math.abs(shortestDiff - 60) < 4) type = "Sextile";

        if (type) {
          results.push({ p1, p2, type });
        }
      }
    }
    return results.slice(0, 10); // Limit to top 10 for display
  }, [userChart, partnerChart]);

  const handleAnalyzeConnection = async () => {
    if (!userChart || !partnerChart) return;
    
    setAnalysisStatus('loading');
    try {
        const p1Data = userChart.planets.map(p => `${p.name}: ${p.sign}`).join(', ');
        const p2Data = partnerChart.planets.map(p => `${p.name}: ${p.sign}`).join(', ');
        
        const aspectList = aspects.map(a => `${a.p1.name} ${a.type} ${a.p2.name}`).join('\n');

        // Use preferences.birthDate (raw user input) as priority to avoid UTC shifts
        // Only fall back to userChart.date if input is missing
        const rawDate = preferences.birthDate || userChart.date;
        let userDateString = "Unknown";
        
        if (rawDate) {
            // Convert to local date string to fix off-by-one errors from UTC conversion
            // This ensures "1983-05-18T20:00" (UTC 19th) becomes "5/18/1983" (Local)
            userDateString = new Date(rawDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
            });
        }
        
        // Append full name to date string to pass it to AI context without changing the addressing name
        if (preferences.fullName) {
            userDateString += `\nFull Legal Name: ${preferences.fullName}`;
        }
        
        const userName = preferences.name || "The Seeker";

        const report = await ChatService.generateSynastryReport(
            userName, p1Data, userDateString,
            partnerName, p2Data, partnerDate,
            relationshipType,
            aspectList
        );
        
        setAnalysisText(report);
        setAnalysisStatus('success');
    } catch {
        setAnalysisStatus('error');
    }
  };

  const toggleSpeech = async () => {
    if (isSpeaking) {
      voiceService.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      await voiceService.speak(analysisText, {
        rate: 1.0,
        pitch: 1.0,
        volume: 1.0
      });
      setIsSpeaking(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-start p-8 overflow-y-auto custom-scrollbar">
      <header className="max-w-4xl w-full flex justify-between items-end mb-12">
        <div>
          <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
            <Heart className="text-pink-500 fill-pink-500" size={32} />
            Synastry
          </h2>
          <p className="text-pink-700 text-xs mt-2 uppercase tracking-[0.3em]">
             Geometric Compatibility Analysis
          </p>
        </div>
        
        {partnerChart && (
          <div className='flex gap-2'>
              <button 
                onClick={handleSaveConnection}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-900/10 border border-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/20 transition-colors uppercase text-[10px] font-bold tracking-widest"
            >
                <Heart size={12} /> Save Connection
            </button>
            <button 
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 bg-pink-900/10 border border-pink-500/20 text-pink-400 rounded-lg hover:bg-pink-500/20 transition-colors uppercase text-[10px] font-bold tracking-widest"
            >
                <RefreshCw size={12} /> Reset Data
            </button>
          </div>
        )}
      </header>

      {!partnerChart ? (
        <div className="w-full max-w-4xl flex gap-8">
            {/* Input Form */}
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 bg-pink-950/10 border border-pink-900/30 rounded-3xl p-8 backdrop-blur-sm"
            >
            <div className="space-y-6">
                <div className="text-center mb-8">
                <Sparkles className="mx-auto text-pink-500 mb-4" size={24} />
                <h3 className="text-xl font-bold text-white uppercase tracking-tight">Initiate Bond</h3>
                <p className="text-xs text-pink-400 mt-2">Enter partner&apos;s celestial coordinates.</p>
                </div>

                <div className="space-y-4">
                <div className="group">
                    <label className="text-[10px] font-bold text-pink-700 uppercase tracking-widest mb-1 block">Name</label>
                    <div className="flex items-center gap-3 bg-black/40 border border-pink-900/30 rounded-xl px-4 py-3 focus-within:border-pink-500/50 transition-colors">
                    <User size={14} className="text-pink-600" />
                    <input 
                        value={partnerName}
                        onChange={e => setPartnerName(e.target.value)}
                        placeholder="Partner&apos;s Identity"
                        className="bg-transparent border-none outline-none text-pink-100 placeholder:text-pink-900/50 text-sm w-full font-mono"
                    />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="text-[10px] font-bold text-pink-700 uppercase tracking-widest mb-1 block">Date</label>
                        <div className="flex items-center gap-3 bg-black/40 border border-pink-900/30 rounded-xl px-4 py-3 focus-within:border-pink-500/50 transition-colors">
                        <Calendar size={14} className="text-pink-600" />
                        <input 
                            type="date"
                            value={partnerDate}
                            onChange={e => setPartnerDate(e.target.value)}
                            className="bg-transparent border-none outline-none text-pink-100 placeholder:text-pink-900/50 text-sm w-full font-mono"
                        />
                        </div>
                    </div>
                    <div className="group">
                        <label className="text-[10px] font-bold text-pink-700 uppercase tracking-widest mb-1 block">Time</label>
                        <div className="flex items-center gap-3 bg-black/40 border border-pink-900/30 rounded-xl px-4 py-3 focus-within:border-pink-500/50 transition-colors">
                        <Clock size={14} className="text-pink-600" />
                        <input 
                            type="time"
                            value={partnerTime}
                            onChange={e => setPartnerTime(e.target.value)}
                            className="bg-transparent border-none outline-none text-pink-100 placeholder:text-pink-900/50 text-sm w-full font-mono"
                        />
                        </div>
                    </div>
                </div>

                <div className="group relative">
                    <label className="text-[10px] font-bold text-pink-700 uppercase tracking-widest mb-1 block">Location</label>
                    <div className="flex items-center gap-3 bg-black/40 border border-pink-900/30 rounded-xl px-4 py-3 focus-within:border-pink-500/50 transition-colors">
                    <MapPin size={14} className="text-pink-600" />
                    <input 
                        value={partnerLocation.city}
                        onChange={(e) => {
                            setPartnerLocation(prev => ({ ...prev, city: e.target.value }));
                            handleLocationSearch(e.target.value);
                        }}
                        placeholder="Search City..."
                        className="bg-transparent border-none outline-none text-pink-100 placeholder:text-pink-900/50 text-sm w-full font-mono"
                    />
                    {isSearching && <div className="w-4 h-4 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin" />}
                    </div>
                    
                    {/* Location Results Dropdown */}
                    {locationResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-black border border-pink-900/30 rounded-xl overflow-hidden z-50 shadow-2xl shadow-pink-900/20">
                            {locationResults.map((loc, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleLocationSelect(loc)}
                                    className="w-full text-left px-4 py-3 hover:bg-pink-900/20 text-sm text-pink-200 border-b border-pink-900/10 last:border-0 transition-colors block"
                                >
                                    <span className="font-bold">{loc.name}</span>
                                    <span className="text-pink-600/60 ml-2 text-xs">
                                        {loc.admin1 ? `${loc.admin1}, ` : ''}{loc.country}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="group">
                     <label className="text-[10px] font-bold text-pink-700 uppercase tracking-widest mb-1 block">Relationship Type</label>
                     <div className="flex gap-2 flex-wrap">
                        {(['Romantic', 'Platonic', 'Business', 'Family', 'Child', 'Other'] as const).map((type) => (
                            <button
                                key={type}
                                onClick={() => setRelationshipType(type)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                                    relationshipType === type 
                                    ? 'bg-pink-600 text-white border-pink-500' 
                                    : 'bg-black/20 text-pink-700 border-pink-900/30 hover:border-pink-500/50'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                     </div>
                </div>

                </div>

                <button
                onClick={handleCalculate}
                disabled={isCalculating || !partnerName || !partnerDate || !partnerTime || !partnerLocation.city}
                className="w-full py-4 bg-pink-600 hover:bg-pink-500 disabled:opacity-50 disabled:hover:bg-pink-600 text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:shadow-[0_0_30px_rgba(236,72,153,0.5)] mt-4"
                >
                {isCalculating ? "Computing Resonance..." : "Analyze Compatibility"}
                </button>
            </div>
            </motion.div>

            {/* Saved Charts Sidebar */}
            {preferences.savedCharts && preferences.savedCharts.length > 0 && (
                <div className="w-80 bg-pink-950/5 border border-pink-900/20 rounded-3xl p-6 overflow-y-auto max-h-[600px] custom-scrollbar">
                    <h3 className="text-sm font-bold text-pink-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Heart size={14} /> Saved Spirits
                    </h3>
                    <div className="space-y-3">
                        {preferences.savedCharts.map((saved) => (
                            <div key={saved.id} className="relative group">
                                <button
                                    onClick={() => handleLoadSaved(saved)}
                                    className="w-full text-left p-3 rounded-xl border border-pink-900/20 bg-black/20 hover:bg-pink-900/10 hover:border-pink-500/30 transition-all pr-8"
                                >
                                    <div className="font-bold text-pink-200 group-hover:text-pink-100">{saved.name}</div>
                                    <div className="flex justify-between items-center mt-1">
                                        <span className="text-[10px] uppercase tracking-wider text-pink-700 group-hover:text-pink-500">{saved.relationshipType}</span>
                                        <span className="text-[10px] text-pink-800">{saved.location.city}</span>
                                    </div>
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteSaved(saved.id);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 text-pink-900/50 hover:text-red-500 hover:bg-black rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
      ) : (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="w-full flex flex-col items-center justify-center gap-12"
        >
          <div className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center">
            {/* Chart Display */}
            <div className="flex-1 w-full max-w-2xl bg-pink-950/5 border border-pink-900/20 rounded-3xl p-8 relative">
                <div className="absolute top-6 left-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500/60 block mb-1">
                    Resonance Field
                    </span>
                    <h3 className="text-lg font-bold text-white tracking-tighter uppercase">
                    {partnerName} <span className="text-pink-700">&</span> You
                    </h3>
                </div>
                
                {userChart && (
                <BiWheelCompass 
                    innerChart={userChart} 
                    outerChart={partnerChart} 
                    innerLabel="You" 
                    outerLabel={partnerName} 
                />
                )}
            </div>
            
            {/* Aspects List */}
            <div className="w-full lg:w-80 space-y-4">
                <h3 className="text-sm font-bold text-pink-500 uppercase tracking-widest border-b border-pink-900/30 pb-2">
                Key Harmonic Links
                </h3>
                <div className="space-y-3">
                {aspects.length === 0 ? (
                    <p className="text-xs text-pink-800 italic">No strong major aspects detected.</p>
                ) : (
                    aspects.map((asp, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-4 bg-pink-950/10 border border-pink-900/20 rounded-xl flex items-center justify-between group hover:bg-pink-900/20 transition-colors"
                    >
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-white">
                            Your {asp.p1.name}
                            </span>
                            <span className="text-[10px] text-pink-400 capitalize">
                            {asp.type}
                            </span>
                        </div>
                        <div className="flex flex-col text-right">
                            <span className="text-xs font-bold text-white">
                            Their {asp.p2.name}
                            </span>
                        </div>
                    </motion.div>
                    ))
                )}
                </div>
            </div>
          </div>

          {/* AI Analysis Section - Full Width */}
          <div className="w-full max-w-5xl mt-4 border-t border-pink-900/30 pt-8">
            <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-pink-500 uppercase tracking-widest flex items-center gap-3">
                        <Bot size={20} /> Chartradamus Insight
                    </h3>
                    <div className="flex gap-2">
                        {analysisStatus === 'success' && (
                            <button
                                onClick={toggleSpeech}
                                className={`p-3 rounded-lg transition-all ${
                                    isSpeaking 
                                        ? 'bg-pink-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.5)]' 
                                        : 'bg-pink-900/20 text-pink-400 hover:bg-pink-900/40 hover:text-white'
                                }`}
                            >
                                {isSpeaking ? <Square size={16} fill="currentColor" /> : <Volume2 size={16} />}
                            </button>
                        )}
                        {analysisStatus === 'idle' && (
                            <button 
                                onClick={handleAnalyzeConnection}
                                className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-black text-xs font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
                            >
                                <Sparkles size={14} /> Interpret Bond
                            </button>
                        )}
                        {/* Re-analyze button if already success */}
                        {analysisStatus === 'success' && (
                             <button 
                                onClick={handleAnalyzeConnection}
                                className="px-4 py-2 bg-pink-900/20 hover:bg-pink-900/40 border border-pink-500/20 text-pink-400 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-all flex items-center gap-2"
                            >
                                <RefreshCw size={12} /> Refresh
                            </button>
                        )}
                    </div>
            </div>

            {analysisStatus === 'loading' && (
                <div className="p-12 bg-pink-950/10 border border-pink-900/20 rounded-3xl min-h-[400px] flex items-center justify-center">
                    <AethericThoughtStream />
                </div>
            )}

            {analysisStatus === 'success' && (
                <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 bg-pink-950/20 border border-pink-500/20 rounded-3xl text-pink-100/90 text-base leading-relaxed whitespace-pre-wrap font-mono shadow-xl shadow-black/20"
                >
                        {analysisText}
                </motion.div>
            )}
            
            {analysisStatus === 'error' && (
                <div className="p-6 bg-red-900/20 border border-red-500/30 rounded-2xl text-red-300 text-sm text-center">
                    The stars are clouded. Connection failed.
                </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SynastryView;
