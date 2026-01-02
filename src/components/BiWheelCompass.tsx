"use client";

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Zap, Heart, Flame, Crown, 
  Circle, Compass, Waves, Ghost, Sparkles
} from 'lucide-react';
import { NatalChartData, PlanetPosition } from '@/types/astrology';

interface BiWheelCompassProps {
  innerChart: NatalChartData;
  outerChart: NatalChartData;
  innerLabel?: string;
  outerLabel?: string;
}

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

const BiWheelCompass: React.FC<BiWheelCompassProps> = ({ 
  innerChart, 
  outerChart, 
  innerLabel = "Natal",
  outerLabel = "Transit"
}) => {
  const [hoveredPlanet, setHoveredPlanet] = useState<{ name: string; type: 'inner' | 'outer' } | null>(null);

  const radius = 200;
  const cx = 250;
  const cy = 250;

  const rotationOffset = useMemo(() => {
    if (!innerChart.ascendant) return 0;
    return 180 - innerChart.ascendant.absoluteDegree;
  }, [innerChart]);

  const innerNodes = useMemo<ChartNode[]>(() => {
    return innerChart.planets.map((p) => {
      const angleInDegrees = (p.absoluteDegree + rotationOffset) % 360;
      const angle = angleInDegrees * (Math.PI / 180);
      const x = cx + Math.cos(angle) * (radius - 60);
      const y = cy - Math.sin(angle) * (radius - 60); // Inverted Y
      return { ...p, x, y, angle };
    });
  }, [innerChart, rotationOffset]);

  const outerNodes = useMemo<ChartNode[]>(() => {
    return outerChart.planets.map((p) => {
      const angleInDegrees = (p.absoluteDegree + rotationOffset) % 360;
      const angle = angleInDegrees * (Math.PI / 180);
      // Transits are on an outer ring
      const x = cx + Math.cos(angle) * (radius - 15);
      const y = cy - Math.sin(angle) * (radius - 15); // Inverted Y
      return { ...p, x, y, angle };
    });
  }, [outerChart, rotationOffset]);

  const aspects = useMemo(() => {
    const results: Array<{ p1: ChartNode, p2: ChartNode, type: string, color: string, opacity: number }> = [];
    
    // For Bi-Wheel, we usually focus on Outer-to-Inner aspects
    outerNodes.forEach(tp => {
      innerNodes.forEach(np => {
        const diff = Math.abs(tp.absoluteDegree - np.absoluteDegree);
        const shortestDiff = Math.min(diff, 360 - diff);

        const checkAspect = (target: number, orb: number) => Math.abs(shortestDiff - target) <= orb;

        let type = null;
        let color = "";

        if (checkAspect(0, 5)) { type = "Conjunction"; color = "#ffffff"; }
        else if (checkAspect(180, 5)) { type = "Opposition"; color = "#ec4899"; }
        else if (checkAspect(120, 4)) { type = "Trine"; color = "#f59e0b"; }
        else if (checkAspect(90, 4)) { type = "Square"; color = "#ef4444"; }
        else if (checkAspect(60, 3)) { type = "Sextile"; color = "#3b82f6"; }

        if (type) {
          results.push({ p1: tp, p2: np, type, color, opacity: 0.5 });
        }
      });
    });

    return results;
  }, [outerNodes, innerNodes]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-[0_0_30px_rgba(59,130,246,0.1)]">
        <defs>
          <radialGradient id="biWheelGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.75" />
          </radialGradient>
        </defs>

        <circle cx={cx} cy={cy} r={radius} fill="url(#biWheelGradient)" />
        
        {/* Rings */}
        <circle cx={cx} cy={cy} r={radius} fill="none" stroke="#1e40af" strokeWidth="1" strokeOpacity="0.3" />
        <circle cx={cx} cy={cy} r={radius - 30} fill="none" stroke="#1e40af" strokeWidth="4" strokeOpacity="0.1" />
        <circle cx={cx} cy={cy} r={radius - 80} fill="none" stroke="#065f46" strokeWidth="1" strokeOpacity="0.2" />

        {/* Zodiac */}
        {ZODIAC_SIGNS.map((sign, i) => {
          const startAngle = (i * 30 + rotationOffset) * (Math.PI / 180);
          const endAngle = ((i + 1) * 30 + rotationOffset) * (Math.PI / 180);
          const midAngle = (startAngle + endAngle) / 2;
          
          const x1 = cx + Math.cos(startAngle) * radius;
          const y1 = cy - Math.sin(startAngle) * radius; // Inverted Y
          const x2 = cx + Math.cos(startAngle) * (radius - 30);
          const y2 = cy - Math.sin(startAngle) * (radius - 30); // Inverted Y
          
          const labelX = cx + Math.cos(midAngle) * (radius - 45);
          const labelY = cy - Math.sin(midAngle) * (radius - 45); // Inverted Y

          return (
            <g key={sign}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#1d4ed8" strokeWidth="1" strokeOpacity="0.2" />
              <text 
                x={labelX} 
                y={labelY} 
                fill="#1e40af" 
                fontSize="5" 
                textAnchor="middle" 
                transform={`rotate(${-(i * 30 + 15 + rotationOffset)}, ${labelX}, ${labelY})`}
                className="font-bold uppercase tracking-widest opacity-30"
              >
                {sign.substring(0, 3)}
              </text>
            </g>
          );
        })}

        {/* Outer-to-Inner Aspects */}
        <g strokeWidth="1.2">
          {aspects.map((asp, i) => (
            <motion.line 
              key={i} 
              x1={asp.p1.x} y1={asp.p1.y} 
              x2={asp.p2.x} y2={asp.p2.y} 
              stroke={asp.color}
              strokeOpacity={asp.opacity}
              strokeDasharray="2,2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: asp.opacity }}
              transition={{ duration: 1, delay: i * 0.05 }}
            />
          ))}
        </g>

        {/* Inner Chart Planets (Inner) */}
        {innerNodes.map((p) => {
          const Icon = PLANET_ICONS[p.name] || Circle;
          return (
            <g key={`inner-${p.name}`}>
              <circle cx={p.x} cy={p.y} r="8" fill="#064e3b" fillOpacity="0.4" stroke="#059669" strokeWidth="0.5" />
              <foreignObject x={p.x - 4} y={p.y - 4} width="8" height="8">
                <div className="flex items-center justify-center w-full h-full">
                  <Icon size={6} className="text-emerald-500" />
                </div>
              </foreignObject>
              <circle 
                cx={p.x} cy={p.y} r="12" fill="transparent" 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPlanet({ name: p.name, type: 'inner' })}
                onMouseLeave={() => setHoveredPlanet(null)}
              />
            </g>
          );
        })}

        {/* Outer Chart Planets (Outer) */}
        {outerNodes.map((p) => {
          const Icon = PLANET_ICONS[p.name] || Circle;
          const isHovered = hoveredPlanet?.name === p.name && hoveredPlanet?.type === 'outer';
          return (
            <motion.g 
              key={`outer-${p.name}`}
              animate={{ scale: isHovered ? 1.2 : 1 }}
            >
              <circle cx={p.x} cy={p.y} r="10" fill="#1e3a8a" fillOpacity="0.6" stroke="#3b82f6" strokeWidth="1" />
              <foreignObject x={p.x - 5} y={p.y - 5} width="10" height="10">
                <div className="flex items-center justify-center w-full h-full">
                  <Icon size={7} className="text-blue-200" />
                </div>
              </foreignObject>
              <circle 
                cx={p.x} cy={p.y} r="15" fill="transparent" 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPlanet({ name: p.name, type: 'outer' })}
                onMouseLeave={() => setHoveredPlanet(null)}
              />
            </motion.g>
          );
        })}

        <circle cx={cx} cy={cy} r="3" fill="#3b82f6" className="animate-pulse" />
      </svg>

      {/* Hover Info */}
      <AnimatePresence>
        {hoveredPlanet && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`absolute top-0 right-0 p-4 rounded-xl border backdrop-blur-md ${
              hoveredPlanet.type === 'inner' 
                ? 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400' 
                : 'bg-blue-950/80 border-blue-500/30 text-blue-400'
            }`}
          >
            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-1">
              {hoveredPlanet.type === 'inner' ? innerLabel : outerLabel}
            </div>
            <div className="text-sm font-bold">{hoveredPlanet.name}</div>
            <div className="text-xs">
              {(hoveredPlanet.type === 'inner' ? innerChart : outerChart).planets.find(p => p.name === hoveredPlanet.name)?.degree.toFixed(2)}° {(hoveredPlanet.type === 'inner' ? innerChart : outerChart).planets.find(p => p.name === hoveredPlanet.name)?.sign}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BiWheelCompass;
