"use client";

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, User, MapPin, Calendar, Clock, RefreshCw } from 'lucide-react';
import { NatalChartData } from '@/types/astrology';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import BiWheelCompass from './BiWheelCompass';
import { useSettings } from '@/context/SettingsContext';
import { SavedChart } from '@/types/preferences';

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
    updatePreferences({ savedCharts: [...currentSaved, newSavedChart] });
  };

  const handleLoadSaved = (saved: SavedChart) => {
      setPartnerName(saved.name);
      setPartnerDate(saved.date);
      setPartnerTime(saved.time);
      setPartnerLocation(saved.location);
      setRelationshipType(saved.relationshipType);
      // Auto-calculate
      // In a real app we might refactor calculate into a useEffect or separate function
      // For now we just populate fields and let user hit "Analyze" to confirm data fresh
  };

  const handleReset = () => {
    setPartnerChart(null);
    setPartnerName("");
    setPartnerDate("");
    setPartnerTime("");
    setPartnerLocation({ lat: 0, lng: 0, city: "" });
  };

  // Simple hardcoded lat/lng for now for ease of testing user input
  // In a real app we'd need a geocoding lookup
  const setDummyLocation = () => {
    setPartnerLocation({ lat: 51.5074, lng: -0.1278, city: "London, UK" });
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
                <p className="text-xs text-pink-400 mt-2">Enter partner's celestial coordinates.</p>
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

                <div className="group">
                    <label className="text-[10px] font-bold text-pink-700 uppercase tracking-widest mb-1 block">Location</label>
                    <div className="flex items-center gap-3 bg-black/40 border border-pink-900/30 rounded-xl px-4 py-3 focus-within:border-pink-500/50 transition-colors">
                    <MapPin size={14} className="text-pink-600" />
                    <input 
                        value={partnerLocation.city}
                        readOnly
                        placeholder="Select Location..."
                        className="bg-transparent border-none outline-none text-pink-100 placeholder:text-pink-900/50 text-sm w-full font-mono cursor-pointer"
                        onClick={setDummyLocation}
                    />
                    <span className="text-[8px] text-pink-800 uppercase px-2 py-1 bg-pink-900/20 rounded">Dev: Click to set London</span>
                    </div>
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
                            <button
                                key={saved.id}
                                onClick={() => handleLoadSaved(saved)}
                                className="w-full text-left p-3 rounded-xl border border-pink-900/20 bg-black/20 hover:bg-pink-900/10 hover:border-pink-500/30 transition-all group"
                            >
                                <div className="font-bold text-pink-200 group-hover:text-pink-100">{saved.name}</div>
                                <div className="flex justify-between items-center mt-1">
                                    <span className="text-[10px] uppercase tracking-wider text-pink-700 group-hover:text-pink-500">{saved.relationshipType}</span>
                                    <span className="text-[10px] text-pink-800">{saved.location.city}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
      ) : (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="w-full flex flex-col lg:flex-row gap-12 items-start justify-center"
        >
          {/* Chart Display */}
          <div className="flex-1 max-w-2xl bg-pink-950/5 border border-pink-900/20 rounded-3xl p-8 relative">
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
        </motion.div>
      )}
    </div>
  );
};

export default SynastryView;
