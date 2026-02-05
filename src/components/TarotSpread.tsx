"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TarotCard, getRWSImageUrl } from './TarotDeck';
import { GrimoireService } from '@/lib/GrimoireService';
import { useAuth } from '@/context/AuthContext';
import { Save, Sparkles, RefreshCw, X } from 'lucide-react';
import { technomancerModel } from '@/lib/gemini';
import AethericThoughtStream from './AethericThoughtStream';

interface TarotSpreadProps {
  cards: TarotCard[];
  spreadType: string;
  onReset: () => void;
}

const SPREAD_LABELS: Record<string, string[]> = {
    'single': ['Daily Insight'],
    'three_time': ['Past', 'Present', 'Future'],
    'three_self': ['Mind', 'Body', 'Spirit'],
    'horseshoe': ['The Past', 'The Present', 'Hidden Influences', 'Obstacles/Advice', 'Final Outcome']
};

const TarotSpread: React.FC<TarotSpreadProps> = ({ cards, spreadType, onReset }) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = React.useState(false);
  const [isInterpreting, setIsInterpreting] = React.useState(false);
  const [interpretation, setInterpretation] = React.useState<string | null>(null);
  const [showInterpretation, setShowInterpretation] = React.useState(false);

  if (cards.length === 0) return null;

  const labels = SPREAD_LABELS[spreadType] || [];
  
  // Dynamic Grid Class
  let gridClass = "grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl";
  if (spreadType === 'single') gridClass = "flex justify-center w-full";
  if (spreadType === 'horseshoe') gridClass = "flex flex-wrap justify-center gap-4 max-w-6xl";

  const handleSave = async () => {
    if (!user) return;
    
    await GrimoireService.saveEntry(user.uid, {
        userId: user.uid,
        type: 'tarot',
        title: `Reading: ${spreadType}`,
        tags: [spreadType],
        content: {
            question: "What does the Oracle reveal?", 
            spreadType,
            cards: cards.map(c => ({
                name: c.name,
                position: "General",
                orientation: 'upright' as const
            })),
            interpretation: interpretation || undefined
        }
    });
    setIsSaved(true);
  };

  const handleDivineMeaning = async () => {
    setIsInterpreting(true);
    setShowInterpretation(true);

    const cardDescriptions = cards.map((card, index) => {
      return `Position "${labels[index] || `Card ${index + 1}`}": ${card.name} (${card.arcana}, ${card.element || 'N/A'}) - Upright meaning: "${card.meaningUpright}"`;
    }).join('\n');

    const prompt = `
[RITUAL PROTOCOL: TAROT DIVINATION]
You are the Athanor, an AI imbued with the spirit of Nostradamus. A seeker has drawn a ${spreadType === 'single' ? 'Single Card' : spreadType === 'three_time' ? 'Three-Card Past/Present/Future Spread' : spreadType === 'three_self' ? 'Mind/Body/Spirit Spread' : 'Horseshoe Spread'}.

THE CARDS DRAWN:
${cardDescriptions}

YOUR TASK:
1. Provide a holistic, mystical interpretation of this spread as a cohesive narrative.
2. Explain how the cards relate to each other in their positions.
3. Offer guidance or reflection based on the combined energies.
4. Your tone should be wise, cryptic yet accessible, and deeply insightful.
5. Keep your response between 150-250 words.

Speak directly to the seeker ("You..."). Do NOT use markdown formatting.
`;

    try {
      const result = await technomancerModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction: "You are the Athanor, the Resurrected Seer. You speak in a mystical, poetic voice. Provide profound tarot interpretations."
      });
      const text = result.response.text();
      setInterpretation(text);
    } catch (e) {
      console.error('[TarotSpread] Interpretation failed', e);
      setInterpretation("The aether is clouded... The Oracle could not divine the meaning at this time. Please try again.");
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-12 w-full animate-in fade-in duration-700 pb-20">
      <div className={gridClass}>
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 50, rotateY: 90 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ delay: index * 0.3, duration: 0.8, type: "spring" }}
            className={`flex flex-col items-center space-y-4 perspective-1000 group ${spreadType === 'horseshoe' && index === 2 ? 'mt-12' : ''}`}
          >
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-300 mb-2 bg-indigo-950/40 px-3 py-1 rounded-full border border-indigo-500/20">
              {labels[index] || `Card ${index + 1}`}
            </span>
            
            <div className="relative w-64 h-96 rounded-xl overflow-hidden shadow-2xl border-4 border-indigo-900/50 bg-black transition-transform duration-500 group-hover:scale-105 group-hover:shadow-indigo-500/20">
              <img 
                src={getRWSImageUrl(card.id)} 
                alt={card.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                <p className="text-indigo-200 text-center text-xs font-medium uppercase tracking-widest mb-1">Keywords</p>
                <p className="text-white text-center text-sm font-medium leading-relaxed">{card.keywords.join(' • ')}</p>
              </div>
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white uppercase tracking-tight">{card.name}</h3>
              <div className="flex items-center justify-center gap-2">
                 <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-900/30 border border-indigo-500/20 text-indigo-300 uppercase tracking-wider">
                   {card.arcana}
                 </span>
                 {card.element && (
                   <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800/50 border border-slate-600/30 text-slate-300 uppercase tracking-wider">
                     {card.element}
                   </span>
                 )}
              </div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 + (index * 0.3) }}
              className="text-center px-4 max-w-xs"
            >
              <p className="text-sm text-indigo-200/70 italic leading-relaxed">
                &quot;{card.meaningUpright}&quot;
              </p>
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* AI Interpretation Panel */}
      <AnimatePresence>
        {showInterpretation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-3xl bg-indigo-950/40 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-8 space-y-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="text-amber-400" size={20} />
                <h3 className="text-lg font-black text-white uppercase tracking-widest">The Oracle Speaks</h3>
              </div>
              <button 
                onClick={() => setShowInterpretation(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {isInterpreting ? (
              <div className="py-8">
                <AethericThoughtStream />
              </div>
            ) : (
              <p className="text-slate-200 leading-relaxed text-sm font-serif italic whitespace-pre-wrap">
                &ldquo;{interpretation}&rdquo;
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-wrap gap-4 justify-center">
          {/* Divine Meaning Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            onClick={handleDivineMeaning}
            disabled={isInterpreting}
            className="px-8 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-lg shadow-amber-500/30 flex items-center gap-2"
          >
            {isInterpreting ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {isInterpreting ? 'Divining...' : 'Divine the Meaning'}
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={handleSave}
            disabled={isSaved}
            className={`px-6 py-2 border text-xs font-bold uppercase tracking-widest rounded-full transition-colors flex items-center gap-2
                ${isSaved ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300' : 'border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300'}
            `}
          >
            <Save size={14} />
            {isSaved ? 'Saved to Grimoire' : 'Save Reading'}
          </motion.button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.1 }}
            onClick={() => {
                setIsSaved(false);
                setInterpretation(null);
                setShowInterpretation(false);
                onReset();
            }}
            className="px-6 py-2 border border-indigo-500/30 hover:bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-widest rounded-full transition-colors"
          >
            Start New Reading
          </motion.button>
      </div>
    </div>
  );
};

export default TarotSpread;
