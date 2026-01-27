"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sun, Moon, Zap, Heart, Flame, Crown, 
  Circle, Compass, Waves, Ghost, Sparkles,
  Clock, MapPin, Activity, Info, X, ChevronRight
} from 'lucide-react';
import { SwissEphemerisService } from '@/lib/SwissEphemerisService';
import { NatalChartData, Aspect } from '@/types/astrology';
import { useSettings } from '@/context/SettingsContext';
import BiWheelCompass from './BiWheelCompass';
import { AspectEngine } from '@/utils/AspectEngine';

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

// Transit interpretations for planets through signs (high-level)
const TRANSIT_MEANINGS: Record<string, Record<string, string>> = {
  'Sun': {
    default: "The Sun illuminates the themes of this sign, bringing vitality and focus to its domain for approximately one month.",
    'Aquarius': "Collective consciousness and innovation take center stage. Time to embrace uniqueness and humanitarian ideals.",
    'Pisces': "Spiritual sensitivity heightens. Dreams, intuition, and creative imagination flow more freely.",
    'Aries': "Fresh beginnings and bold initiatives are favored. Energy for new projects peaks.",
    'Taurus': "Focus on stability, comfort, and material security. A time to enjoy life's pleasures.",
    'Gemini': "Communication and mental agility are enhanced. Social connections multiply.",
    'Cancer': "Home, family, and emotional security become priorities. Nurturing energy prevails.",
    'Leo': "Creative self-expression and leadership shine. Time to take center stage.",
    'Virgo': "Analysis, health routines, and practical improvements are highlighted.",
    'Libra': "Relationships and harmony take focus. Balance and fairness are emphasized.",
    'Scorpio': "Deep transformation and intensity. Hidden truths surface.",
    'Sagittarius': "Expansion, adventure, and higher learning call. Optimism flows.",
    'Capricorn': "Ambition and structure dominate. Career and long-term goals take priority."
  },
  'Moon': {
    default: "The Moon cycles through this sign every 2-3 days, coloring our emotional responses and instinctual reactions.",
    'Aquarius': "Emotional detachment allows for objective perspective. Community feelings unite.",
    'Pisces': "Emotional sensitivity peaks. Intuitive insights flow. Dreams are vivid.",
    'Aries': "Quick emotional responses. Initiative in emotional matters. Impatience possible.",
    'Taurus': "Emotional comfort through stability. Sensual needs heighten. Stubborn moods.",
    'Gemini': "Emotional processing through communication. Mood swings. Mental stimulation needed.",
    'Cancer': "Emotions run deep. Home and family feel essential. Nurturing mood.",
    'Leo': "Dramatic emotional expression. Need for recognition and warmth.",
    'Virgo': "Analytical approach to feelings. Health and routine bring comfort.",
    'Libra': "Harmony in relationships feels essential. Indecisive moods possible.",
    'Scorpio': "Intense emotions. Transformative feelings. Deep psychological insights.",
    'Sagittarius': "Optimistic mood. Need for freedom and adventure in emotional life.",
    'Capricorn': "Practical approach to emotions. Self-control emphasized. Ambitious feelings."
  },
  'Mercury': {
    default: "Mercury's transit affects communication, thinking, and information processing for 2-3 weeks per sign.",
    'Aquarius': "Innovative thinking and unconventional ideas flourish. Technology and group communication.",
    'Pisces': "Intuitive communication. Poetic thinking. May lack precision but gains depth.",
    'Aries': "Quick, assertive communication. Direct thinking. Impatient with details.",
    'Taurus': "Practical, deliberate thinking. Voice and communication have weight.",
    'Gemini': "Mercury is home. Mental agility, curiosity, and communication skills peak.",
    'Cancer': "Emotional intelligence in communication. Memory and nostalgia influence thinking.",
    'Leo': "Creative expression. Dramatic communication. Generous with ideas.",
    'Virgo': "Mercury excels here. Analytical precision, detailed thinking, practical solutions.",
    'Libra': "Diplomatic communication. Balanced thinking. Consider multiple perspectives.",
    'Scorpio': "Probing, investigative thinking. Words carry intensity. Secrets uncovered.",
    'Sagittarius': "Big-picture thinking. Philosophical ideas. Blunt but optimistic communication.",
    'Capricorn': "Strategic, structured thinking. Business communication. Serious tone."
  },
  'Venus': {
    default: "Venus colors our relationships, values, and aesthetic appreciation for 3-4 weeks per sign.",
    'Aquarius': "Unconventional attractions. Freedom in relationships valued. Humanitarian love.",
    'Pisces': "Venus is exalted. Romantic, compassionate love. Artistic sensitivity heightens.",
    'Aries': "Passionate, impulsive attractions. Direct approach to love and desire.",
    'Taurus': "Venus is home. Sensual pleasures, loyalty, and material comfort in relationships.",
    'Gemini': "Intellectual connections. Variety in social life. Flirtatious communication.",
    'Cancer': "Nurturing love. Emotional security in relationships essential. Family bonds.",
    'Leo': "Generous, dramatic love. Creative romance. Need for appreciation.",
    'Virgo': "Practical love language. Acts of service. Analytical about relationships.",
    'Libra': "Venus is home. Harmony, partnership, and aesthetic beauty are paramount.",
    'Scorpio': "Intense, transformative relationships. Deep desires. Possessive tendencies.",
    'Sagittarius': "Adventurous love. Freedom in relationships. Optimistic connections.",
    'Capricorn': "Committed, responsible relationships. Long-term considerations dominate."
  },
  'Mars': {
    default: "Mars energizes and activates the sign's themes, staying approximately 6 weeks per sign.",
    'Aquarius': "Taking action for collective causes. Innovative approaches to conflict. Rebellious energy.",
    'Pisces': "Action guided by intuition. Passive-aggressive tendencies possible. Spiritual warrior.",
    'Aries': "Mars is home. Maximum energy, courage, and initiative. Can be impulsive or aggressive.",
    'Taurus': "Persistent, determined action. Slow but unstoppable. Stubborn when opposed.",
    'Gemini': "Mental energy. Multiple projects. Can scatter energy. Arguments through words.",
    'Cancer': "Protective action. Emotional motivation. Indirect approach to conflict.",
    'Leo': "Creative action. Dramatic assertion. Pride drives ambition.",
    'Virgo': "Precise, methodical action. Work energy peaks. Critical when frustrated.",
    'Libra': "Mars in detriment. Action for harmony. Indecision in assertiveness.",
    'Scorpio': "Mars excels. Intense, strategic action. Powerful will. Transformative force.",
    'Sagittarius': "Action motivated by beliefs. Adventurous energy. Can overextend.",
    'Capricorn': "Mars is exalted. Disciplined, ambitious action. Career drives dominate."
  },
  'Jupiter': {
    default: "Jupiter expands and brings opportunity to the sign's themes, staying approximately 1 year per sign.",
    'default_meaning': "Wherever Jupiter transits, growth, luck, and opportunity expand in that life area."
  },
  'Saturn': {
    default: "Saturn brings lessons, structure, and maturation to the sign's themes over 2.5 years.",
    'default_meaning': "Saturn's transits demand responsibility and hard work, but yield lasting achievements."
  },
  'Uranus': {
    default: "Uranus revolutionizes and awakens the sign's themes over 7 years.",
    'default_meaning': "Uranus breaks old patterns and demands authenticity and freedom."
  },
  'Neptune': {
    default: "Neptune dissolves boundaries and inspires the sign's themes over 14 years.",
    'default_meaning': "Neptune asks for surrender, spirituality, and transcendence of ego."
  },
  'Pluto': {
    default: "Pluto transforms the deepest themes of the sign over 12-31 years.",
    'default_meaning': "Pluto demands death and rebirth, revealing hidden power."
  },
  'North Node': {
    default: "The North Node points to collective evolutionary direction for 18 months per sign.",
    'default_meaning': "The North Node highlights the path of growth and destiny."
  }
};

// Aspect interpretations
const ASPECT_MEANINGS: Record<string, { symbol: string, meaning: string, intensity: 'harmonious' | 'dynamic' | 'neutral' }> = {
  'Conjunction': { symbol: '☌', meaning: 'Fusion of energies. Intensification. A new beginning or powerful focus.', intensity: 'neutral' },
  'Sextile': { symbol: '⚹', meaning: 'Opportunity. Cooperative flow. Harmonious communication between energies.', intensity: 'harmonious' },
  'Square': { symbol: '□', meaning: 'Tension requiring action. Challenge that builds strength. Friction creates motivation.', intensity: 'dynamic' },
  'Trine': { symbol: '△', meaning: 'Natural flow. Talents and ease. Harmonious support between energies.', intensity: 'harmonious' },
  'Opposition': { symbol: '☍', meaning: 'Polarity and awareness. Balance needed between opposite forces. Relationship dynamics.', intensity: 'dynamic' },
  'Quincunx': { symbol: '⚻', meaning: 'Adjustment required. Incompatible energies that need creative adaptation.', intensity: 'neutral' }
};

interface SelectedTransit {
  type: 'planet' | 'aspect';
  data: {
    name?: string;
    sign?: string;
    degree?: number;
    aspect?: Aspect;
  };
}

const TransitFeed: React.FC = () => {
  const { preferences } = useSettings();
  const [transits, setTransits] = useState<NatalChartData | null>(null);
  const [natalChart, setNatalChart] = useState<NatalChartData | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeAspects, setActiveAspects] = useState<Aspect[]>([]);
  const [showInfo, setShowInfo] = useState(false);
  const [selectedTransit, setSelectedTransit] = useState<SelectedTransit | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Pulse every minute
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function calculateData() {
      const lat = preferences.birthLocation?.lat || 0;
      const lng = preferences.birthLocation?.lng || 0;
      
      try {
        // Calculate Transits (Current Time)
        const transitData = await SwissEphemerisService.calculateChart(currentTime, lat, lng);
        setTransits(transitData);

        // Detect Aspects within Transit Chart (Mundane)
        const mundaneAspects = AspectEngine.calculateAspects(transitData.planets);
        setActiveAspects(mundaneAspects.filter(a => a.orb <= 2)); // Only show tight aspects

        // Calculate Natal Chart (Birth Time)
        if (preferences.birthDate && preferences.birthLocation) {
          const birthDate = new Date(preferences.birthDate);
          const natalData = await SwissEphemerisService.calculateChart(
            birthDate, 
            preferences.birthLocation.lat, 
            preferences.birthLocation.lng
          );
          setNatalChart(natalData);
          
          // Detect Transits to Natal (Personal)
          const personalAspects = AspectEngine.calculateAspects(transitData.planets, natalData.planets, true);
          // Prioritize personal aspects
          setActiveAspects(prev => [...personalAspects.filter(a => a.orb <= 1.5), ...prev].slice(0, 10)); 
        }
      } catch (e) {
        console.error("Celestial calculation failed", e);
      }
    }
    calculateData();
  }, [currentTime, preferences.birthDate, preferences.birthLocation]);

  const getTransitMeaning = (planetName: string, sign: string): string => {
    const planetMeanings = TRANSIT_MEANINGS[planetName];
    if (!planetMeanings) return `${planetName} is currently transiting ${sign}.`;
    return planetMeanings[sign] || planetMeanings.default || `${planetName} is currently transiting ${sign}.`;
  };

  const getAspectInterpretation = (aspect: Aspect): string => {
    const aspectInfo = ASPECT_MEANINGS[aspect.type] || { meaning: 'A significant connection between these planets.' };
    const isPerson = aspect.isSynastry;
    
    if (isPerson) {
      return `Transit ${aspect.planet1.name} ${aspect.type.toLowerCase()} your natal ${aspect.planet2.name}: ${aspectInfo.meaning} This is a PERSONAL transit affecting you directly.`;
    }
    return `${aspect.planet1.name} ${aspect.type.toLowerCase()} ${aspect.planet2.name}: ${aspectInfo.meaning} This is a GLOBAL transit affecting collective energy.`;
  };

  if (!transits) return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <Activity className="animate-pulse text-blue-500" size={32} />
      <p className="text-[10px] uppercase tracking-[0.5em] text-blue-900">Scanning Temporal Flux...</p>
    </div>
  );

  return (
    <div className="space-y-12 max-w-6xl mx-auto pb-20">
      <header className="flex justify-between items-center border-b border-indigo-500/20 pb-6">
        <div>
          <h2 className="text-3xl font-black text-white tracking-tighter uppercase flex items-center gap-3 font-serif">
             <Clock className="text-fuchsia-400" size={24} />
             Chronos Feed
          </h2>
          <p className="text-indigo-400 text-[10px] mt-1 uppercase tracking-[0.3em] flex items-center gap-2">
            <MapPin size={10} /> {preferences.birthLocation?.city || "Aetheric Anchor"} • {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Info Toggle */}
             <button 
                onClick={() => setShowInfo(!showInfo)}
                className={`p-2 rounded-full border transition-all ${showInfo ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-transparent text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/10'}`}
                title="What is this?"
             >
                <Info size={16} />
             </button>

            <div className="hidden md:block text-right bg-slate-900/50 border border-indigo-500/20 px-4 py-2 rounded-lg">
              <span className="block text-[8px] text-indigo-300 uppercase font-black tracking-widest">Temporal Variance</span>
              <span className="text-sm font-bold text-fuchsia-400 tabular-nums">±0.00042s</span>
            </div>
        </div>
      </header>
      
      {/* Educational Panel */}
      <AnimatePresence>
        {showInfo && (
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
            >
                <div className="bg-slate-900/60 border border-fuchsia-500/20 rounded-2xl p-6 text-sm text-slate-300 space-y-4 shadow-2xl">
                    <h3 className="text-white font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                        <Sparkles size={12} className="text-amber-400" />
                        Understanding Transit Astrology
                    </h3>
                    <p>
                        This dashboard, <strong>&quot;Chronos&quot;</strong> (Ancient Greek for Time), displays <strong>Transits</strong>: the current real-time position of the planets in the sky overlayed onto your birth chart.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                        <div>
                             <h4 className="text-indigo-300 font-bold text-xs uppercase mb-2">The Solar System Now (Outer Wheel)</h4>
                             <p className="opacity-80 leading-relaxed">
                                The planets in the sky right now are constantly moving. The <strong>Outer Wheel</strong> shows where they are at this exact second. These are the current energies affecting the collective consciousness.
                             </p>
                        </div>
                        <div>
                             <h4 className="text-fuchsia-400 font-bold text-xs uppercase mb-2">Transit-to-Natal Aspects (Inner Interaction)</h4>
                             <p className="opacity-80 leading-relaxed">
                                When a moving planet connects mathematically (an &quot;Aspect&quot;) to a planet in your fixed birth chart, it triggers a personal event or feeling. This map highlights those active triggers.
                             </p>
                        </div>
                    </div>
                    <p className="text-xs text-amber-300/80 border-t border-white/10 pt-4 mt-4">
                        💡 <strong>Tip:</strong> Click on any planet card or aspect below to learn what it means for you!
                    </p>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* BI-WHEEL VISUALIZATION */}
      {natalChart && transits && (
        <section className="relative py-8 bg-black/20 rounded-3xl border border-white/5 shadow-2xl overflow-hidden">
          <div className="absolute top-6 left-6 z-10 pointer-events-none">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400/60 block mb-1">Celestial Synthesis</span>
            <motion.h3 
                layoutId="title"
                className="text-lg font-bold text-white tracking-tighter uppercase font-serif"
            >
                Transit-to-Natal Map
            </motion.h3>
          </div>
          <BiWheelCompass innerChart={natalChart} outerChart={transits} outerLabel="Current Transit" />
          <div className="absolute bottom-6 right-6 text-right max-w-xs pointer-events-none">
            <p className="text-[8px] text-slate-500 uppercase tracking-widest leading-relaxed">
              Dashed lines indicate active aspects between current planetary positions and your natal geometry.
            </p>
          </div>
        </section>
      )}

      {/* PLANET CARDS - Now Clickable */}
      <div>
        <h3 className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black mb-4 flex items-center gap-2">
          <Activity size={12} /> Current Planetary Positions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {transits.planets.map((p, i) => {
            const Icon = PLANET_ICONS[p.name] || Circle;
            return (
              <motion.button 
                key={p.name}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedTransit({ type: 'planet', data: { name: p.name, sign: p.sign, degree: p.degree } })}
                className="group bg-slate-900/40 border border-white/10 hover:border-indigo-500/50 p-4 rounded-xl flex items-center justify-between transition-all hover:bg-indigo-900/20 cursor-pointer text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 group-hover:border-indigo-400/40 group-hover:bg-indigo-500/20 transition-all">
                    <Icon size={18} className="text-indigo-400 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-tighter">{p.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.sign}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className="text-sm font-light text-slate-200 tabular-nums">{p.degree.toFixed(2)}°</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ACTIVE ASPECTS - Now Clickable */}
      <div className="p-8 bg-slate-900/20 border border-white/5 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
        <h3 className="text-[10px] text-indigo-400 uppercase tracking-[0.4em] font-black mb-6 flex items-center gap-2 relative z-10">
          <Activity size={12} /> Active Transit Aspects
        </h3>
        <div className="space-y-3 relative z-10">
          {activeAspects.length === 0 && (
             <p className="text-slate-500 text-xs italic text-center">No major aspects detected in current timeline.</p>
          )}
          {activeAspects.map((aspect, i) => {
            const aspectInfo = ASPECT_MEANINGS[aspect.type];
            const intensityColor = aspectInfo?.intensity === 'harmonious' ? 'text-emerald-400' : aspectInfo?.intensity === 'dynamic' ? 'text-rose-400' : 'text-amber-400';
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setSelectedTransit({ type: 'aspect', data: { aspect } })}
                className="w-full flex items-center justify-between text-xs border border-transparent hover:border-indigo-500/30 hover:bg-indigo-900/10 p-3 rounded-xl transition-all cursor-pointer group text-left"
              >
                 <div className="flex items-center gap-3">
                   <span className={`text-lg ${intensityColor}`}>{aspectInfo?.symbol || '•'}</span>
                   <span className="text-white font-medium">
                     {aspect.planet1.name} <span className={`${intensityColor} font-light`}>{aspect.type}</span> {aspect.planet2.name}
                   </span>
                 </div>
                 <div className="flex items-center gap-3">
                   <span className={`uppercase font-black text-[9px] tracking-widest ${aspect.isSynastry ? 'text-fuchsia-400' : 'text-slate-500'}`}>
                     {aspect.isSynastry ? 'PERSONAL' : 'GLOBAL'} • {aspect.orb.toFixed(2)}°
                   </span>
                   <ChevronRight size={14} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                 </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* DETAIL MODAL */}
      <AnimatePresence>
        {selectedTransit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedTransit(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-950 border border-indigo-500/30 rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedTransit(null)}
                className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>

              {selectedTransit.type === 'planet' && selectedTransit.data.name && (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      {(() => {
                        const Icon = PLANET_ICONS[selectedTransit.data.name] || Circle;
                        return <Icon size={32} className="text-indigo-400" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedTransit.data.name}</h2>
                      <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest">in {selectedTransit.data.sign}</p>
                    </div>
                  </div>
                  <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6">
                    <h4 className="text-xs text-indigo-300 uppercase tracking-widest font-bold mb-3">Current Transit Meaning</h4>
                    <p className="text-slate-200 leading-relaxed">
                      {getTransitMeaning(selectedTransit.data.name, selectedTransit.data.sign || '')}
                    </p>
                  </div>
                  <div className="mt-6 text-center">
                    <span className="text-4xl font-black text-indigo-400 tabular-nums">{selectedTransit.data.degree?.toFixed(2)}°</span>
                    <span className="text-slate-500 text-sm ml-2">{selectedTransit.data.sign}</span>
                  </div>
                </>
              )}

              {selectedTransit.type === 'aspect' && selectedTransit.data.aspect && (
                <>
                  {(() => {
                    const aspect = selectedTransit.data.aspect!;
                    const aspectInfo = ASPECT_MEANINGS[aspect.type];
                    const intensityColor = aspectInfo?.intensity === 'harmonious' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20' : aspectInfo?.intensity === 'dynamic' ? 'text-rose-400 border-rose-500/30 bg-rose-950/20' : 'text-amber-400 border-amber-500/30 bg-amber-950/20';
                    
                    return (
                      <>
                        <div className="text-center mb-6">
                          <div className={`text-5xl mb-2`}>{aspectInfo?.symbol}</div>
                          <h2 className="text-xl font-black text-white uppercase tracking-tight">
                            {aspect.planet1.name} {aspect.type} {aspect.planet2.name}
                          </h2>
                          <p className={`text-sm font-bold uppercase tracking-widest mt-1 ${aspect.isSynastry ? 'text-fuchsia-400' : 'text-slate-500'}`}>
                            {aspect.isSynastry ? 'Personal Transit' : 'Global Transit'}
                          </p>
                        </div>
                        <div className={`border rounded-2xl p-6 ${intensityColor}`}>
                          <h4 className="text-xs uppercase tracking-widest font-bold mb-3 opacity-80">Interpretation</h4>
                          <p className="text-slate-200 leading-relaxed">
                            {getAspectInterpretation(aspect)}
                          </p>
                        </div>
                        <div className="mt-6 flex justify-between text-sm text-slate-400">
                          <span>Orb: <strong className="text-white">{aspect.orb.toFixed(2)}°</strong></span>
                          <span className={`font-bold uppercase tracking-widest ${aspectInfo?.intensity === 'harmonious' ? 'text-emerald-400' : aspectInfo?.intensity === 'dynamic' ? 'text-rose-400' : 'text-amber-400'}`}>
                            {aspectInfo?.intensity || 'neutral'}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TransitFeed;
