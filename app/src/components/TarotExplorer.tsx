"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, ChevronLeft, Search } from 'lucide-react';
import { FULL_DECK } from '@/lib/TarotConstants';
import { TarotCard } from '@/lib/TarotConstants';

// Helper for images (mirrored from TarotDeck to keep this standalone)
const getRWSImageUrl = (cardId: string): string => {
    if (!cardId) return '';
    const BASE_URL = "https://www.sacred-texts.com/tarot/pkt/img/";
    const SUIT_PREFIX: Record<string, string> = { 'Wands': 'wa', 'Cups': 'cu', 'Swords': 'sw', 'Pentacles': 'pe' };
    const RANK_MAP: Record<string, string> = { 'ace': 'ac', '1': 'ac', 'page': 'pa', 'knight': 'kn', 'queen': 'qu', 'king': 'ki' };
    
    const parts = cardId.split('-');
    if (parts[0] === 'major') {
        const num = parseInt(parts[1], 10);
        return `${BASE_URL}ar${num.toString().padStart(2, '0')}.jpg`;
    }
    if (parts.length === 2) {
        const suit = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        const rankRaw = parts[1];
        const prefix = SUIT_PREFIX[suit];
        const suffix = RANK_MAP[rankRaw] || Number(rankRaw).toString().padStart(2, '0');
        return `${BASE_URL}${prefix}${suffix}.jpg`;
    }
    return '';
};

interface TarotExplorerProps {
    onBack: () => void;
}

const TarotExplorer: React.FC<TarotExplorerProps> = ({ onBack }) => {
    const [selectedCard, setSelectedCard] = useState<TarotCard | null>(null);
    const [filterArcana, setFilterArcana] = useState<'All' | 'Major' | 'Minor'>('All');
    const [filterSuit, setFilterSuit] = useState<'All' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles'>('All');
    // const [searchQuery, setSearchQuery] = useState(""); // Removed unused state

    const filteredDeck = FULL_DECK.filter(card => {
        if (filterArcana !== 'All' && card.arcana !== filterArcana) return false;
        if (filterSuit !== 'All' && card.suit !== filterSuit && card.arcana === 'Minor') return false;
        // Search query logic removed as state is unused
        return true;
    });

    return (
        <div className="w-full h-full flex flex-col items-center p-8 overflow-y-auto custom-scrollbar">
            <header className="w-full max-w-6xl mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <button onClick={onBack} className="flex items-center gap-2 text-indigo-400 hover:text-white mb-4 transition-colors">
                        <ChevronLeft size={16} /> Back to Deck
                    </button>
                    <h2 className="text-4xl font-black text-white tracking-tighter uppercase flex items-center gap-4">
                        <Book className="text-indigo-500" size={32} />
                        Tarot Codex
                    </h2>
                    <p className="text-indigo-400/60 text-xs mt-2 uppercase tracking-widest">
                        Archive of Arcane Knowledge
                    </p>
                </div>
                
                <div className="flex flex-col gap-2 w-full md:w-auto">
                    {/* Filters */}
                    <div className="flex gap-2 bg-black/40 p-1 rounded-lg border border-indigo-900/30">
                        {['All', 'Major', 'Minor'].map(f => (
                            <button
                                key={f}
                                onClick={() => setFilterArcana(f as 'All' | 'Major' | 'Minor')}
                                className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
                                    filterArcana === f ? 'bg-indigo-600 text-white' : 'text-indigo-400 hover:text-indigo-200'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    {/* Suit Filters (only if Minor or All) */}
                    {(filterArcana === 'All' || filterArcana === 'Minor') && (
                        <div className="flex gap-2">
                            {['Wands', 'Cups', 'Swords', 'Pentacles'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterSuit(filterSuit === s ? 'All' : s as 'All' | 'Wands' | 'Cups' | 'Swords' | 'Pentacles')} // Toggle
                                    className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold border transition-all ${
                                        filterSuit === s 
                                        ? 'bg-indigo-900/40 border-indigo-500 text-indigo-200' 
                                        : 'border-transparent text-indigo-600 hover:bg-indigo-900/20'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </header>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cards Grid */}
                <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                    {filteredDeck.map(card => (
                        <button
                            key={card.id}
                            onClick={() => setSelectedCard(card)}
                            className={`flex flex-col gap-2 p-2 rounded-xl transition-all hover:bg-white/5 group ${
                                selectedCard?.id === card.id 
                                ? 'bg-indigo-900/20 ring-1 ring-indigo-500/50' 
                                : ''
                            }`}
                        >
                            <div className={`relative aspect-2/3 w-full rounded-lg overflow-hidden border-2 transition-all ${
                                selectedCard?.id === card.id 
                                ? 'border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' 
                                : 'border-indigo-900/30 group-hover:border-indigo-500/50'
                            }`}>
                                <img 
                                    src={getRWSImageUrl(card.id)} 
                                    alt={card.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            </div>
                            <div className="text-center px-1">
                                <span className={`text-[10px] font-bold uppercase tracking-tight block truncate ${
                                    selectedCard?.id === card.id ? 'text-indigo-300' : 'text-indigo-400/60 group-hover:text-indigo-300'
                                }`}>
                                    {card.name}
                                </span>
                            </div>
                        </button>
                    ))}
                    {filteredDeck.length === 0 && (
                        <div className="col-span-full py-12 text-center text-indigo-500/50">
                            No cards found matching criteria.
                        </div>
                    )}
                </div>

                {/* Detail Panel */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedCard ? (
                            <motion.div
                                key={selectedCard.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-indigo-950/20 border border-indigo-500/20 rounded-2xl p-6 sticky top-0"
                            >
                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{selectedCard.name}</h3>
                                    <div className="flex justify-center gap-2 mb-4">
                                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/20">
                                            {selectedCard.arcana} Arcana
                                        </span>
                                        {selectedCard.suit && (
                                            <span className="px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-400 text-[10px] font-bold uppercase tracking-wider border border-indigo-500/10">
                                                {selectedCard.suit}
                                            </span>
                                        )}
                                        {selectedCard.element && (
                                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider border border-slate-700">
                                                {selectedCard.element}
                                            </span>
                                        )}
                                    </div>
                                    <div className="w-48 mx-auto aspect-2/3 rounded-lg overflow-hidden shadow-2xl shadow-indigo-500/20 mb-6">
                                        <img src={getRWSImageUrl(selectedCard.id)} alt={selectedCard.name} className="w-full h-full object-cover" />
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Archetypal Essence</h4>
                                        <p className="text-indigo-100 text-sm leading-relaxed">
                                            {selectedCard.meaningUpright}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Keywords</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedCard.keywords.map(k => (
                                                <span key={k} className="text-[10px] text-indigo-300 bg-indigo-900/30 px-2 py-1 rounded">
                                                    {k}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-2">Shadow Aspect</h4>
                                        <p className="text-indigo-300/60 text-xs italic">
                                            &quot;{selectedCard.meaningReversed}&quot;
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-indigo-900/30 rounded-2xl">
                                <Search className="text-indigo-900 mb-4" size={48} />
                                <p className="text-indigo-500/50 text-sm uppercase tracking-widest font-bold">Select a card to reveal its mysteries</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default TarotExplorer;
