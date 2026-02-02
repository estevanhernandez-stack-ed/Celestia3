"use client";

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPlanetIcon } from './AstrologyIcons';
import { Sparkles, Info, X } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { NatalChartData, PlanetPosition } from '@/types/astrology';
import { PlanetSceneOrb } from './PlanetOrb';
import { Canvas } from '@react-three/fiber';
import { ProgressionService } from '@/lib/ProgressionService';
import { ResonanceService } from '@/lib/ResonanceService';

const ZODIAC_SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

interface ChartNode extends PlanetPosition {
  x: number;
  y: number;
  angle: number;
}

interface Aspect {
  p1: ChartNode;
  p2: ChartNode;
  type: string;
  color: string;
  opacity: number;
}

interface NatalCompassProps {
  chart?: NatalChartData | null;
}

const NatalCompass: React.FC<NatalCompassProps> = ({ chart: externalChart }) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const [meditationStartTime, setMeditationStartTime] = useState<number | null>(null);
  const [meditatedPlanets, setMeditatedPlanets] = useState<Set<string>>(new Set());
  const { preferences, updatePreferences } = useSettings();
  const [internalChart, setInternalChart] = useState<NatalChartData | null>(null);

  const chart = externalChart || internalChart;
  const [webglSupport, setWebglSupport] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true; 
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch {
      return false;
    }
  });
  const [showLegend, setShowLegend] = useState(false);

  // Helper to determine orbital distance (The Celestial Spheres)
  const getPlanetRadius = (name: string) => {
    switch (name) {
      case 'Pluto': case 'Neptune': case 'Uranus':
        return 175; // Trans-Saturnian (Deepest)
      case 'Saturn': case 'Jupiter':
        return 155; // Social/Chronos
      case 'Mars': case 'Venus': case 'Mercury':
        return 135; // Personal
      case 'Sun': case 'Moon':
        return 115; // Luminaries (Core)
      default:
        return 160;
    }
  };

  useEffect(() => {
    if (hoveredPlanet && meditationStartTime && !meditatedPlanets.has(hoveredPlanet)) {
      const timer = setTimeout(() => {
        const progression = ProgressionService.addXP(preferences, 'meditation');
        updatePreferences({ xp: progression.xp, level: progression.level });
        setMeditatedPlanets(prev => new Set(prev).add(hoveredPlanet));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hoveredPlanet, meditationStartTime, meditatedPlanets, preferences, updatePreferences]);

  useEffect(() => {
    if (externalChart) return;
    async function initChart() {
      if (preferences.birthDate && preferences.birthLocation) {
        try {
          const data = await SwissEphemerisService.calculateChart(
            new Date(preferences.birthDate),
            preferences.birthLocation.lat,
            preferences.birthLocation.lng
          );
          setInternalChart(data);
        } catch (error) {
          console.error("Compass Calibration Failed", error);
        }
      }
    }
    initChart();
  }, [preferences.birthDate, preferences.birthLocation, externalChart]);

  const radius = 200;
  const cx = 250;
  const cy = 250;

  const rotationOffset = useMemo(() => {
    if (!chart || !chart.ascendant) return 0;
    return 180 - chart.ascendant.absoluteDegree;
  }, [chart]);

  const planetNodes = useMemo(() => {
    if (!chart) return [];
    return chart.planets.map((p: PlanetPosition) => {
      const angleInDegrees = (p.absoluteDegree + rotationOffset) % 360;
      const angle = angleInDegrees * (Math.PI / 180);
      const r = getPlanetRadius(p.name);
      const x = cx + Math.cos(angle) * r;
      const y = cy - Math.sin(angle) * r; 
      return { ...p, x, y, angle };
    });
  }, [chart, rotationOffset, cx, cy]);

  const aspects = useMemo(() => {
    if (!chart || planetNodes.length === 0) return [];
    const results: Aspect[] = [];
    const planets = chart.planets;

    for (let i = 0; i < planets.length; i++) {
      for (let j = i + 1; j < planets.length; j++) {
        const p1 = planets[i];
        const p2 = planets[j];
        const p1Node = planetNodes[i];
        const p2Node = planetNodes[j];

        if (!p1Node || !p2Node) continue;

        const diff = Math.abs(p1.absoluteDegree - p2.absoluteDegree);
        const shortestDiff = Math.min(diff, 360 - diff);

        const checkAspect = (target: number, orb: number) => Math.abs(shortestDiff - target) <= orb;

        let type = null;
        let color = "";
        let opacity = 0.2;

        if (checkAspect(0, 8)) { type = "Conjunction"; color = "#ffffff"; opacity = 0.6; }
        else if (checkAspect(180, 8)) { type = "Opposition"; color = "#ec4899"; opacity = 0.5; }
        else if (checkAspect(120, 8)) { type = "Trine"; color = "#f59e0b"; opacity = 0.45; }
        else if (checkAspect(90, 7)) { type = "Square"; color = "#ef4444"; opacity = 0.45; }
        else if (checkAspect(60, 6)) { type = "Sextile"; color = "#3b82f6"; opacity = 0.4; }

        if (type) {
          results.push({ p1: p1Node, p2: p2Node, type, color, opacity });
        }
      }
    }
    return results;
  }, [chart, planetNodes]);

  if (!chart) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <Sparkles className="animate-pulse text-indigo-400" size={48} />
      <p className="text-xs uppercase tracking-[0.5em] text-indigo-300">Synchronizing with Birth Spheres...</p>
    </div>
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto group aspect-square">
      {/* 1. Background Layers (Static UI, Decorative SVG) */}
      <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-[0_0_30px_rgba(99,102,241,0.15)] absolute inset-0 z-0">
        <defs>
          <radialGradient id="compassGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={radius} fill="url(#compassGradient)" />
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#6366f1" strokeWidth="2" strokeOpacity="0.2" />
        <circle cx={cx} cy={cy} r={radius - 20} fill="none" stroke="#6366f1" strokeWidth="1" strokeOpacity="0.1" />
        
        <circle cx={cx} cy={cy} r={175} fill="none" stroke="#a5b4fc" strokeWidth="0.5" strokeOpacity="0.05" />
        <circle cx={cx} cy={cy} r={155} fill="none" stroke="#a5b4fc" strokeWidth="0.5" strokeOpacity="0.05" />
        <circle cx={cx} cy={cy} r={135} fill="none" stroke="#a5b4fc" strokeWidth="0.5" strokeOpacity="0.05" />
        <circle cx={cx} cy={cy} r={115} fill="none" stroke="#a5b4fc" strokeWidth="0.5" strokeOpacity="0.05" />

        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = (i * 30 + rotationOffset) * (Math.PI / 180);
          const endAngle = ((i + 1) * 30 + rotationOffset) * (Math.PI / 180);
          const midAngle = (startAngle + endAngle) / 2;
          
          const x1 = cx + Math.cos(startAngle) * radius;
          const y1 = cy - Math.sin(startAngle) * radius;
          const x2 = cx + Math.cos(startAngle) * (radius - 160);
          const y2 = cy - Math.sin(startAngle) * (radius - 160); 
          
          const labelX = cx + Math.cos(midAngle) * (radius - 10);
          const labelY = cy - Math.sin(midAngle) * (radius - 10);

          return (
            <g key={sign}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a5b4fc" strokeWidth="1" strokeOpacity="0.2" />
              <text 
                x={labelX} 
                y={labelY} 
                fill="#e0e7ff" 
                fontSize="6" 
                textAnchor="middle" 
                transform={`rotate(${-(i * 30 + 15 + rotationOffset)}, ${labelX}, ${labelY})`}
                className="font-bold uppercase tracking-widest opacity-60 font-serif"
                data-testid={`zodiac-label-${sign}`}
              >
                {sign.substring(0, 3)}
              </text>
            </g>
          );
        })}

        <g strokeWidth="1.2">
          {aspects.map((asp, i) => (
            <motion.line 
              key={i} 
              x1={asp.p1.x} y1={asp.p1.y} 
              x2={asp.p2.x} y2={asp.p2.y} 
              stroke={asp.color}
              strokeOpacity={asp.opacity}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: asp.opacity }}
              transition={{ duration: 1, delay: i * 0.02 }}
            />
          ))}
        </g>
      </svg>

      {/* 2. Celestial Layer (3D Orbs with 2D Fallback) */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        {webglSupport === true && (
          <div className="absolute inset-0">
            <Canvas 
              orthographic 
              camera={{ left: 0, right: 500, top: 0, bottom: 500, near: 0.1, far: 1000, position: [0, 0, 10] }}
              gl={{ 
                alpha: true, 
                antialias: true,
                powerPreference: "default",
                preserveDrawingBuffer: false
              }}
              onCreated={({ gl }) => {
                gl.domElement.addEventListener('webglcontextlost', (e) => {
                  console.warn('🛡️ [NatalCompass] WebGL Context Lost', e);
                  setWebglSupport(false);
                }, false);
                gl.domElement.addEventListener('webglcontextrestored', () => {
                  console.log('🌌 [NatalCompass] WebGL Context Restored');
                  setWebglSupport(true);
                }, false);
              }}
              dpr={[1, 2]}
            >
              <ambientLight intensity={1.5} />
              <pointLight position={[250, 250, 20]} intensity={1} />
              <Suspense fallback={null}>
                {planetNodes.map((p: ChartNode) => (
                  <PlanetSceneOrb 
                    key={p.name}
                    name={p.name}
                    x={p.x}
                    y={p.y}
                    size={12} 
                    isHovered={hoveredPlanet === p.name}
                  />
                ))}
              </Suspense>
            </Canvas>
          </div>
        )}

        {(webglSupport === false) && (
          <svg viewBox="0 0 500 500" className="w-full h-full absolute inset-0">
            {planetNodes.map((p) => {
                const isHovered = hoveredPlanet === p.name;
                const Icon = getPlanetIcon(p.name);
                return (
                    <g key={`fallback-${p.name}`} transform={`translate(${p.x}, ${p.y})`}>
                        <motion.circle 
                            r={isHovered ? 16 : 10}
                            fill="#1e1b4b"
                            fillOpacity="0.8"
                            stroke="#6366f1"
                            strokeWidth="1.5"
                            strokeOpacity="0.4"
                            animate={{ 
                              scale: isHovered ? 1.2 : 1,
                              strokeOpacity: isHovered ? 0.8 : 0.4
                            }}
                        />
                        <g transform="translate(-6, -6)">
                            <Icon size={12} className={isHovered ? "text-indigo-200" : "text-indigo-400"} />
                        </g>
                    </g>
                );
            })}
          </svg>
        )}
      </div>

      {/* 3. Interactive Hotspots Layer (Highest Interactivity) */}
      <svg viewBox="0 0 500 500" className="w-full h-full absolute inset-0 z-30">
        {planetNodes.map((p) => {
          const isHovered = hoveredPlanet === p.name;
          return (
            <motion.g 
              key={p.name}
              data-testid={`planet-hotspot-${p.name}`}
              onMouseEnter={() => {
                setHoveredPlanet(p.name);
                setMeditationStartTime(Date.now());
                ResonanceService.startDrone(p.name);
              }}
              onMouseLeave={() => {
                setHoveredPlanet(null);
                setMeditationStartTime(null);
                ResonanceService.stopDrone();
              }}
              className="cursor-pointer"
            >
              {/* Invisible touch target (larger) */}
              <circle cx={p.x} cy={p.y} r="20" fill="transparent" />
              
              {/* Visual feedback rings (Transparent fill to reveal 3D Orbs underneath) */}
              <circle cx={p.x} cy={p.y} r="18" fill={isHovered ? "#6366f1" : "transparent"} fillOpacity="0.15" />
              <circle cx={p.x} cy={p.y} r="16" fill="transparent" stroke={isHovered ? "#6366f1" : "transparent"} strokeWidth="1" />
            </motion.g>
          );
        })}

        {/* Central Sun/Core (Visual only in this layer) */}
        <g className="pointer-events-none">
            <circle cx={cx} cy={cy} r="25" fill="none" stroke="#6366f1" strokeWidth="0.5" strokeDasharray="4 4" className="opacity-20 animate-[spin_60s_linear_infinite]" />
            <circle cx={cx} cy={cy} r="45" fill="none" stroke="#a5b4fc" strokeWidth="0.5" strokeOpacity="0.05" />
            
            <path 
                d={`M ${cx} ${cy-50} L ${cx+15} ${cy-15} L ${cx+50} ${cy} L ${cx+15} ${cy+15} L ${cx} ${cy+50} L ${cx-15} ${cy+15} L ${cx-50} ${cy} L ${cx-15} ${cy-15} Z`} 
                fill="none" 
                stroke="#6366f1"
                strokeWidth="0.5"
                strokeOpacity="0.15"
            />

            <path 
                d={`M ${cx} ${cy-35} L ${cx+10} ${cy-10} L ${cx+35} ${cy} L ${cx+10} ${cy+10} L ${cx} ${cy+35} L ${cx-10} ${cy+10} L ${cx-35} ${cy} L ${cx-10} ${cy-10} Z`} 
                fill="#4f46e5" 
                fillOpacity="0.08"
                stroke="#818cf8"
                strokeWidth="1"
                strokeOpacity="0.3"
            />

            <circle cx={cx} cy={cy} r="4" fill="#fbbf24" className="shadow-[0_0_20px_#fcd34d]" />
            <circle cx={cx} cy={cy} r="2" fill="#fff" className="animate-pulse" />
        </g>
      </svg>

      {/* 4. Overlay Layers (Tooltips, Details) */}
      <div className="absolute inset-0 pointer-events-none z-40">
        {planetNodes.map((p) => {
          const isHovered = hoveredPlanet === p.name;
          return (
            <AnimatePresence key={`label-${p.name}`}>
              {isHovered && (
                <div
                  className="absolute pointer-events-none"
                  style={{ 
                    left: `${(p.x / 500) * 100}%`,
                    top: `${(p.y / 500) * 100}%`,
                    transform: 'translate(-50%, -100%)'
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: -12 }}
                    exit={{ opacity: 0, scale: 0.8, y: 5 }}
                    className="px-2 py-1 bg-black/90 backdrop-blur-md border border-indigo-500/50 rounded-lg shadow-xl whitespace-nowrap relative min-w-[60px]"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] text-indigo-300 font-bold uppercase tracking-widest leading-none mb-1">{p.name}</span>
                      <span className="text-[8px] text-white/90 font-mono leading-none">
                        {p.sign} {Math.floor(p.degree)}° {Math.floor((p.degree % 1) * 60)}&apos;
                      </span>
                    </div>
                    {/* Small Arrow */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black border-r border-b border-indigo-500/50 rotate-45" />
                  </motion.div>
                </div>
              )}
            </AnimatePresence>
          );
        })}
      </div>

      <div className="absolute top-0 left-0 p-4 pointer-events-none z-50">
        <AnimatePresence>
          {hoveredPlanet && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-black/80 backdrop-blur-md border border-indigo-500/30 p-4 rounded-xl shadow-2xl space-y-1"
            >
              <h4 className="text-indigo-200 font-black uppercase text-xs tracking-tighter">{hoveredPlanet}</h4>
              <p className="text-[10px] text-white">
                {chart.planets.find(p => p.name === hoveredPlanet)?.degree.toFixed(2)}° {chart.planets.find(p => p.name === hoveredPlanet)?.sign}
              </p>
              <p className="text-[10px] text-indigo-400 uppercase tracking-widest">House {chart.planets.find(p => p.name === hoveredPlanet)?.house}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

       <div className="absolute right-0 top-0 text-right p-4">
          <span className="text-[10px] text-fuchsia-400 uppercase font-black tracking-widest">Ascendant</span>
          <p className="text-white font-bold">{chart.ascendant?.sign} {chart.ascendant?.degree.toFixed(2)}°</p>
       </div>

       <div className="absolute bottom-0 left-0 p-4">
          <button 
            onClick={() => setShowLegend(!showLegend)}
            className="w-8 h-8 rounded-full bg-slate-900/80 border border-indigo-500/30 text-indigo-400 flex items-center justify-center hover:bg-indigo-500/20 hover:text-white transition-colors pointer-events-auto"
          >
            {showLegend ? <X size={14} /> : <Info size={14} />}
          </button>
       </div>

       <AnimatePresence>
         {showLegend && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute bottom-14 left-4 z-40 w-64 bg-slate-950/95 border border-indigo-500/20 backdrop-blur-xl rounded-xl p-4 shadow-2xl"
            >
              <h4 className="text-[10px] uppercase font-black tracking-widest text-white mb-3 flex items-center gap-2">
                <Sparkles size={10} className="text-fuchsia-400" /> Celestial Legend
              </h4>
              
              <div className="space-y-4">
                <div>
                  <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-2 block">Aspect Geometry</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
                    <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-white opacity-60"></div> Conjunction</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-pink-500 opacity-60"></div> Opposition</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-amber-500 opacity-60"></div> Trine</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-red-500 opacity-60"></div> Square</div>
                    <div className="flex items-center gap-2"><div className="w-2 h-0.5 bg-blue-500 opacity-60"></div> Sextile</div>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-2 block">Cosmic Bodies</span>
                  <div className="grid grid-cols-4 gap-2">
                    {['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto', 'North Node'].map((name: string) => {
                      const Icon = getPlanetIcon(name);
                      return (
                        <div key={name} className="flex flex-col items-center justify-center p-1 bg-white/5 rounded hover:bg-indigo-500/20 transition-colors" title={name}>
                          <Icon size={12} className="text-indigo-300 mb-1" />
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
         )}
       </AnimatePresence>
    </div>
  );
};

export default NatalCompass;
