
import React, { useState, useEffect, useCallback } from 'react';
import CelestialScene from './components/CelestialScene';
import { generateNatalChart } from './services/geminiService';
import { BirthInfo, NatalChartData } from './types';

const App: React.FC = () => {
  const [birthInfo, setBirthInfo] = useState<BirthInfo>({
    date: '1995-05-15',
    time: '12:00',
    location: 'New York, USA'
  });
  const [chartData, setChartData] = useState<NatalChartData | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlanet, setSelectedPlanet] = useState<string | null>(null);
  const [flybyIndex, setFlybyIndex] = useState(-1);
  const [isFlybyRunning, setIsFlybyRunning] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await generateNatalChart(birthInfo);
      setChartData(data);
      setSelectedPlanet(null);
      setFlybyIndex(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to generate chart. Please check your API key.");
    } finally {
      setLoading(false);
    }
  };

  const startFlyby = () => {
    if (!chartData) return;
    setIsFlybyRunning(true);
    setFlybyIndex(0);
    setSelectedPlanet(chartData.planets[0].name);
  };

  const nextFlyby = useCallback(() => {
    if (!chartData) return;
    const nextIdx = flybyIndex + 1;
    if (nextIdx < chartData.planets.length) {
      setFlybyIndex(nextIdx);
      setSelectedPlanet(chartData.planets[nextIdx].name);
    } else {
      setIsFlybyRunning(false);
      setFlybyIndex(-1);
      setSelectedPlanet(null);
    }
  }, [chartData, flybyIndex]);

  const prevFlyby = () => {
    if (!chartData || flybyIndex <= 0) return;
    const nextIdx = flybyIndex - 1;
    setFlybyIndex(nextIdx);
    setSelectedPlanet(chartData.planets[nextIdx].name);
  };

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      {/* 3D Scene */}
      <div className="absolute inset-0 z-0">
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
      <div className="relative z-10 p-6 flex flex-col h-full pointer-events-none">
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
          <div className="bg-black/60 backdrop-blur-md border border-white/10 p-4 rounded-xl max-w-sm">
            <h1 className="text-3xl font-light tracking-tighter text-indigo-300">
              Celestial <span className="font-bold text-white">Flyby</span>
            </h1>
            <p className="text-xs text-white/50 mt-1 uppercase tracking-widest">3D Natal Chart Experience</p>
          </div>

          {!chartData && !loading && (
            <form onSubmit={handleGenerate} className="bg-black/80 backdrop-blur-xl border border-white/10 p-6 rounded-2xl w-80 shadow-2xl space-y-4">
              <h2 className="text-lg font-medium text-white/90">Birth Details</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    value={birthInfo.date}
                    onChange={(e) => setBirthInfo({...birthInfo, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1">Time (Local)</label>
                  <input 
                    type="time" 
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    value={birthInfo.time}
                    onChange={(e) => setBirthInfo({...birthInfo, time: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-white/40 uppercase tracking-wider mb-1">Birth Location</label>
                  <input 
                    type="text" 
                    placeholder="City, Country"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
                    value={birthInfo.location}
                    onChange={(e) => setBirthInfo({...birthInfo, location: e.target.value})}
                  />
                </div>
              </div>
              <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-500/20"
              >
                Generate Chart
              </button>
            </form>
          )}

          {loading && (
            <div className="bg-black/80 backdrop-blur-xl border border-white/10 p-12 rounded-2xl flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-indigo-300 animate-pulse text-sm font-medium tracking-widest">CONSULTING THE STARS...</p>
            </div>
          )}
        </div>

        {/* Interpretation Box (Bottom) */}
        {chartData && (
          <div className="mt-auto flex flex-col gap-4 pointer-events-auto">
            {selectedPlanet && (
              <div className="bg-black/70 backdrop-blur-lg border-l-4 border-indigo-500 p-6 rounded-r-xl max-w-2xl animate-fade-in-up">
                <div className="flex justify-between items-center mb-2">
                   <h3 className="text-2xl font-bold flex items-center gap-2">
                    <span style={{ color: chartData.planets.find(p => p.name === selectedPlanet)?.color }}>
                      ●
                    </span>
                    {selectedPlanet} in {chartData.planets.find(p => p.name === selectedPlanet)?.sign}
                  </h3>
                  <span className="text-xs text-white/40 font-mono">
                    {chartData.planets.find(p => p.name === selectedPlanet)?.degree.toFixed(2)}° | House {chartData.planets.find(p => p.name === selectedPlanet)?.house}
                  </span>
                </div>
                <p className="text-lg text-white/80 italic leading-relaxed">
                  "{chartData.planets.find(p => p.name === selectedPlanet)?.interpretation}"
                </p>
                
                {isFlybyRunning && (
                   <div className="flex items-center gap-4 mt-6">
                    <button 
                      onClick={prevFlyby}
                      disabled={flybyIndex === 0}
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded-lg text-xs transition-colors"
                    >
                      <i className="fa-solid fa-chevron-left mr-2"></i> Previous
                    </button>
                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-indigo-500 transition-all duration-500" 
                        style={{ width: `${((flybyIndex + 1) / chartData.planets.length) * 100}%` }}
                      />
                    </div>
                    <button 
                      onClick={nextFlyby}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-xs font-bold transition-colors"
                    >
                      {flybyIndex === chartData.planets.length - 1 ? 'Finish' : 'Next Body'} <i className="fa-solid fa-chevron-right ml-2"></i>
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isFlybyRunning && chartData && (
              <div className="flex gap-2">
                <button 
                  onClick={startFlyby}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <i className="fa-solid fa-rocket"></i> Start Guided Flyby
                </button>
                <button 
                  onClick={() => {setChartData(null); setSelectedPlanet(null);}}
                  className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full font-medium transition-all"
                >
                  New Chart
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;
