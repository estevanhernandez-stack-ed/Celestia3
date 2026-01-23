"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import NextImage from 'next/image';
import { Book, Trash2, Calendar, ChevronDown, ChevronRight } from 'lucide-react';
import { GrimoireService } from '@/lib/GrimoireService';
import { GrimoireEntry, TarotEntryContent, RitualEntryContent, AuraEntryContent, InsightEntryContent } from '@/types/grimoire';
import { useAuth } from '@/context/AuthContext';

export default function GrimoireView() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<GrimoireEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (user) {
        const data = await GrimoireService.getEntries(user.uid);
        setEntries(data);
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Burn this page from the Grimoire?")) {
        await GrimoireService.deleteEntry(id);
        setEntries(prev => prev.filter(en => en.id !== id));
    }
  };

  if (loading) return <div className="text-center text-emerald-500/50 p-12">Summoning Archives...</div>;

  if (entries.length === 0) return (
    <div className="flex flex-col items-center justify-center h-64 text-emerald-900">
      <Book size={48} className="mb-4 opacity-20" />
      <p className="text-sm uppercase tracking-widest">The Grimoire is empty.</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <header className="border-b border-emerald-900/30 pb-4 mb-8">
        <h2 className="text-2xl font-black text-emerald-400 uppercase tracking-tighter flex items-center gap-3">
          <Book className="text-emerald-600" />
          Grimoire
        </h2>
        <p className="text-emerald-700 text-xs uppercase tracking-[0.2em] mt-1">
          {entries.length} Pages Recorded
        </p>
      </header>

      <div className="space-y-4">
        {entries.map((entry) => (
          <motion.div 
            key={entry.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
              bg-emerald-950/10 border border-emerald-900/20 rounded-xl overflow-hidden cursor-pointer transition-all
              ${expandedId === entry.id ? 'bg-emerald-900/10 border-emerald-500/30' : 'hover:border-emerald-500/20'}
            `}
            onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
          >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${
                  entry.type === 'tarot' ? 'bg-indigo-500/10 text-indigo-400' : 
                  entry.type === 'aura' ? 'bg-purple-500/10 text-purple-400' : 
                  entry.type === 'insight' ? 'bg-cyan-500/10 text-cyan-400' :
                  'bg-red-500/10 text-red-400'
                }`}>
                  {entry.type === 'tarot' ? '🔮' : entry.type === 'aura' ? '✨' : entry.type === 'insight' ? '🧠' : '🔥'}
                </div>
                <div>
                  <h3 className="font-bold text-emerald-100 uppercase tracking-wide text-sm">{entry.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] text-emerald-600 font-medium uppercase tracking-wider mt-1">
                    <span className="flex items-center gap-1"><Calendar size={10} /> {new Date(entry.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{entry.type}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                 {expandedId === entry.id ? <ChevronDown size={16} className="text-emerald-500" /> : <ChevronRight size={16} className="text-emerald-700" />}
                 <button onClick={(e) => handleDelete(entry.id, e)} className="p-2 hover:text-red-400 text-emerald-800 transition-colors">
                    <Trash2 size={14} />
                 </button>
              </div>
            </div>

            {/* Content Body */}
            <AnimatePresence>
              {expandedId === entry.id && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-emerald-900/20 bg-black/20"
                >
                  <div className="p-6 text-sm text-emerald-300/80 leading-relaxed font-light">
                     {entry.type === 'tarot' && (
                       <div className="space-y-4">
                         <div className="p-3 bg-indigo-950/30 rounded border border-indigo-500/10 italic">
                           &quot;{(entry.content as TarotEntryContent).question}&quot;
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {(entry.content as TarotEntryContent).cards.map((c, i) => (
                              <div key={i} className="p-2 bg-indigo-500/5 rounded border border-indigo-500/10 text-xs">
                                <span className="block text-indigo-300 font-bold">{c.name}</span>
                                <span className="text-[10px] text-indigo-500 uppercase">{c.position} ({c.orientation})</span>
                              </div>
                            ))}
                         </div>
                         {(entry.content as TarotEntryContent).interpretation && (
                           <div className="mt-4 pt-4 border-t border-white/5">
                             <h4 className="text-[10px] uppercase font-bold text-indigo-400 mb-2">Oracle Interpretation</h4>
                             <p className="whitespace-pre-wrap">{(entry.content as TarotEntryContent).interpretation}</p>
                           </div>
                         )}
                       </div>
                     )}
                     
                     {entry.type === 'ritual' && (
                        <div className="space-y-4">
                           <div className="p-3 bg-red-950/30 rounded border border-red-500/10">
                              <span className="block text-[9px] uppercase text-red-500 font-bold mb-1">Intent</span>
                              {(entry.content as RitualEntryContent).intent}
                           </div>
                           <div className="text-xs text-red-200/60">
                              Result: {(entry.content as RitualEntryContent).result}
                           </div>
                        </div>
                     )}

                     {entry.type === 'aura' && (
                        <div className="space-y-6 flex flex-col items-center py-4">
                            <div className="w-64 h-[280px] bg-[#fdfaf2] p-3 pb-8 rounded-sm shadow-2xl -rotate-1 relative border border-black/5 flex flex-col group hover:rotate-0 transition-transform duration-500">
                                <div className="relative flex-1 bg-black/10 overflow-hidden">
                                     <NextImage 
                                        src={(entry.content as AuraEntryContent).imageUrl} 
                                        alt="Aura Capture" 
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        fill
                                        unoptimized
                                    />
                                </div>
                                <div className="mt-3 px-1">
                                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] mb-0.5">
                                        {(entry.content as AuraEntryContent).city || "NEBULA COORDS"}
                                    </div>
                                    <div className="text-[11px] font-black text-slate-800 uppercase tracking-tighter leading-none">
                                        {(entry.content as AuraEntryContent).resonance || "SPECTRAL RESONANCE"}
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-3 text-[8px] font-mono text-slate-300">
                                    {new Date(entry.date).toLocaleDateString()}
                                </div>
                            </div>
                            <div className="text-center italic font-serif text-purple-300 max-w-lg leading-relaxed px-4">
                                &quot;{(entry.content as AuraEntryContent).analysis}&quot;
                            </div>
                        </div>
                     )}

                     {entry.type === 'insight' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-2">
                                <div className="p-3 bg-cyan-950/30 rounded-xl border border-cyan-500/10 text-center">
                                    <span className="block text-[9px] uppercase text-cyan-500 font-bold mb-1">Life Path</span>
                                    <span className="text-xl font-black text-cyan-200">{(entry.content as InsightEntryContent).profile.lifePath}</span>
                                </div>
                                <div className="p-3 bg-blue-950/30 rounded-xl border border-blue-500/10 text-center">
                                    <span className="block text-[9px] uppercase text-blue-500 font-bold mb-1">Destiny</span>
                                    <span className="text-xl font-black text-blue-200">{(entry.content as InsightEntryContent).profile.destiny}</span>
                                </div>
                                <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/10 text-center">
                                    <span className="block text-[9px] uppercase text-indigo-500 font-bold mb-1">Soul Urge</span>
                                    <span className="text-xl font-black text-indigo-200">{(entry.content as InsightEntryContent).profile.soulUrge}</span>
                                </div>
                            </div>
                            <div className="mt-4 p-4 rounded-xl bg-cyan-950/10 border border-cyan-500/5 whitespace-pre-wrap text-cyan-100/70 leading-relaxed">
                                {(entry.content as InsightEntryContent).analysis}
                            </div>
                        </div>
                     )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
