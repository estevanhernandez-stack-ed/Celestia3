"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Zap, Heart, Flame, Crown, 
  Circle, Compass, Waves, Ghost, Sparkles
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { NatalChartData, PlanetPosition } from '@/types/astrology';

type PlanetIconMap = Record<string, React.ComponentType<{ size?: number; className?: string }>>;

const PLANET_ICONS: PlanetIconMap = {
  'Sun': Sun,
  'Moon': Moon,
  'Mercury': Zap,
  'Venus': Heart,
  'Mars': Flame,
  'Jupiter': Crown,
  'Saturn': Circle,
  'Uranus': Compass,
  'Neptune': Waves,
  'Pluto': Ghost,
  'North Node': Sparkles
};

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
  const { preferences } = useSettings();
  const [internalChart, setInternalChart] = useState<NatalChartData | null>(null);

  const chart = externalChart || internalChart;
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);

  useEffect(() => {
    if (externalChart) return; // Use external if provided
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
  }, [preferences.birthDate, preferences.birthLocation]);

  const radius = 200;
  const cx = 250;
  const cy = 250;

  // Standard birth charts anchor the Ascendant (AC) at the 9 o'clock position (180 degrees).
  // We calculate a rotation offset to achieve this.
  const rotationOffset = useMemo(() => {
    if (!chart || !chart.ascendant) return 0;
    return 180 - chart.ascendant.absoluteDegree;
  }, [chart]);

  const planetNodes = useMemo(() => {
    if (!chart) return [];
    return chart.planets.map((p) => {
      const angleInDegrees = (p.absoluteDegree + rotationOffset) % 360;
      const angle = angleInDegrees * (Math.PI / 180);
      const x = cx + Math.cos(angle) * (radius - 40);
      const y = cy - Math.sin(angle) * (radius - 40); // Inverted Y for CCW
      return { ...p, x, y, angle };
    });
  }, [chart, rotationOffset, cx, cy, radius]);

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
      <Sparkles className="animate-pulse text-emerald-500" size={48} />
      <p className="text-xs uppercase tracking-[0.5em] text-emerald-900">Synchronizing with Birth Spheres...</p>
    </div>
  );

  return (
    <div className="relative w-full max-w-2xl mx-auto group">
      <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-[0_0_30px_rgba(16,185,129,0.1)]">
        {/* Background Gradients */}
        <defs>
          <radialGradient id="compassGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#064e3b" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.7" />
          </radialGradient>
        </defs>

        {/* Inner glow */}
        <circle cx={cx} cy={cy} r={radius} fill="url(#compassGradient)" />

        {/* Outer Wheel Rings */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#065f46" strokeWidth="2" strokeOpacity="0.3" />
        <circle cx={cx} cy={cy} r={radius - 20} fill="none" stroke="#065f46" strokeWidth="1" strokeOpacity="0.2" />
        <circle cx={cx} cy={cy} r={radius - 60} fill="none" stroke="#065f46" strokeWidth="1" strokeOpacity="0.2" />

        {/* Zodiac Segments - Also rotated by rotationOffset */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = (i * 30 + rotationOffset) * (Math.PI / 180);
          const endAngle = ((i + 1) * 30 + rotationOffset) * (Math.PI / 180);
          const midAngle = (startAngle + endAngle) / 2;
          
          const x1 = cx + Math.cos(startAngle) * radius;
          const y1 = cy - Math.sin(startAngle) * radius; // Inverted Y
          const x2 = cx + Math.cos(startAngle) * (radius - 60);
          const y2 = cy - Math.sin(startAngle) * (radius - 60); // Inverted Y
          
          const labelX = cx + Math.cos(midAngle) * (radius - 10);
          const labelY = cy - Math.sin(midAngle) * (radius - 10); // Inverted Y

          return (
            <g key={sign}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#059669" strokeWidth="1" strokeOpacity="0.3" />
              <text 
                x={labelX} 
                y={labelY} 
                fill="#059669" 
                fontSize="6" 
                textAnchor="middle" 
                transform={`rotate(${-(i * 30 + 15 + rotationOffset)}, ${labelX}, ${labelY})`}
                className="font-bold uppercase tracking-widest opacity-40"
              >
                {sign.substring(0, 3)}
              </text>
            </g>
          );
        })}

        {/* Aspect Lines */}
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

        {/* Planet Nodes */}
        {planetNodes.map((p) => {
          const Icon = PLANET_ICONS[p.name] || Circle;
          const isHovered = hoveredPlanet === p.name;
          
          return (
            <motion.g 
              key={p.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: isHovered ? 1.2 : 1 }}
              transition={{ type: 'spring', damping: 12 }}
              onMouseEnter={() => setHoveredPlanet(p.name)}
              onMouseLeave={() => setHoveredPlanet(null)}
              className="cursor-pointer"
            >
              {/* Orb Glow */}
              <circle cx={p.x} cy={p.y} r="12" fill={isHovered ? "#10b981" : "#064e3b"} fillOpacity={isHovered ? "0.2" : "0.1"} />
              <circle cx={p.x} cy={p.y} r="8" fill="#000000" fillOpacity="0.6" stroke={isHovered ? "#34d399" : "#059669"} strokeWidth="1" />
              
              {/* Icon */}
              <foreignObject x={p.x - 5} y={p.y - 5} width="10" height="10">
                <div className="flex items-center justify-center w-full h-full">
                  <Icon size={8} className={isHovered ? "text-emerald-300" : "text-emerald-500"} />
                </div>
              </foreignObject>
            </motion.g>
          );
        })}

        {/* Center Point */}
        <circle cx={cx} cy={cy} r="4" fill="#059669" className="animate-pulse shadow-[0_0_15px_#10b981]" />
      </svg>

      {/* Hover Information */}
      <div className="absolute top-0 left-0 p-4 pointer-events-none">
        <AnimatePresence>
          {hoveredPlanet && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-black/80 backdrop-blur-md border border-emerald-500/30 p-4 rounded-xl shadow-2xl space-y-1"
            >
              <h4 className="text-emerald-400 font-black uppercase text-xs tracking-tighter">{hoveredPlanet}</h4>
              <p className="text-[10px] text-white">
                {chart.planets.find(p => p.name === hoveredPlanet)?.degree.toFixed(2)}° {chart.planets.find(p => p.name === hoveredPlanet)?.sign}
              </p>
              <p className="text-[10px] text-emerald-700 uppercase tracking-widest">House {chart.planets.find(p => p.name === hoveredPlanet)?.house}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

       {/* Ascendant Marker */}
       <div className="absolute right-0 top-0 text-right p-4">
          <span className="text-[10px] text-emerald-900 uppercase font-black tracking-widest">Ascendant</span>
          <p className="text-emerald-500 font-bold">{chart.ascendant?.sign} {chart.ascendant?.degree.toFixed(2)}°</p>
       </div>
    </div>
  );
};

export default NatalCompass;
