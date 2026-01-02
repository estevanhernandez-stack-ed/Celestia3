
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Search, X, Sparkles, Brain, Zap, Fingerprint, Activity } from 'lucide-react';
import { 
    ZODIAC_KNOWLEDGE, 
    PLANET_KNOWLEDGE, 
    HOUSE_KNOWLEDGE, 
    ASPECT_KNOWLEDGE, 
    KnowledgeItem, 
    KnowledgeCategory 
} from '@/lib/KnowledgeBaseData';
import { NumerologyEngine } from '@/utils/NumerologyEngine';

interface GrimoireCodexProps {
    isOpen: boolean;
    onClose: () => void;
}

const CATEGORIES: { id: KnowledgeCategory, label: string, icon: React.ElementType }[] = [
    { id: 'Zodiac', label: 'Zodiac', icon: Sparkles },
    { id: 'Planets', label: 'Planets', icon: Activity },
    { id: 'Houses', label: 'Houses', icon: Brain },
    { id: 'Aspects', label: 'Aspects', icon: Zap },
    { id: 'Numerology', label: 'Numerology', icon: Fingerprint },
];

const GrimoireCodex: React.FC<GrimoireCodexProps> = ({ isOpen, onClose }) => {
    const [activeCategory, setActiveCategory] = useState<KnowledgeCategory>('Zodiac');
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState<KnowledgeItem | null>(null);

    // Filter Logic
    const getItems = () => {
        let items: KnowledgeItem[] = [];
        
        if (activeCategory === 'Numerology') {
            // Generate Numerology items dynamically from engine
            const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33];
            items = nums.map(n => {
                const details = NumerologyEngine.getRichDetails(n);
                return {
                    id: n.toString(),
                    title: n.toString(),
                    subtitle: details.title,
                    description: details.gift + " " + details.challenge,
                    keywords: [details.gift.split(' ')[0], details.shadow.split(' ')[0]],
                    icon: n.toString()
                };
            });
        } else {
            switch(activeCategory) {
                case 'Zodiac': items = ZODIAC_KNOWLEDGE; break;
                case 'Planets': items = PLANET_KNOWLEDGE; break;
                case 'Houses': items = HOUSE_KNOWLEDGE; break;
                case 'Aspects': items = ASPECT_KNOWLEDGE; break;
            }
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            return items.filter(i => 
                i.title.toLowerCase().includes(q) || 
                i.subtitle.toLowerCase().includes(q) ||
                i.keywords?.some(k => k.toLowerCase().includes(q))
            );
        }
        return items;
    };

    const items = getItems();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 backdrop-blur-md">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-5xl h-[80vh] bg-slate-950 border border-emerald-900/50 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20">
                    <div className="flex items-center gap-3">
                        <Book className="text-emerald-500" size={24} />
                        <div>
                            <h2 className="text-xl font-bold text-white uppercase tracking-widest">Cosmic Codex</h2>
                            <p className="text-xs text-emerald-600/60 font-mono">The Akashic Database</p>
                        </div>
                    </div>
                     <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-3 top-2.5 text-slate-500" size={14} />
                            <input 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search the archives..."
                                className="bg-black/40 border border-white/10 rounded-full py-2 pl-9 pr-4 text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/50 w-64 transition-all"
                            />
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-64 bg-black/20 border-r border-white/5 p-4 space-y-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => { setActiveCategory(cat.id); setSelectedItem(null); }}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs uppercase tracking-wider ${
                                    activeCategory === cat.id 
                                    ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-500/30' 
                                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                }`}
                            >
                                <cat.icon size={16} />
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {items.map(item => (
                                <motion.div
                                    key={item.id}
                                    layoutId={item.id}
                                    onClick={() => setSelectedItem(item)}
                                    className="group relative bg-slate-900/50 border border-white/10 rounded-2xl p-6 cursor-pointer hover:border-emerald-500/50 hover:bg-emerald-900/10 transition-all"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="text-3xl">{item.icon}</div>
                                        {item.ruler && <div className="text-[9px] text-slate-500 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded">{item.ruler}</div>}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1">{item.title}</h3>
                                    <p className="text-xs text-emerald-500/80 uppercase tracking-wide mb-3">{item.subtitle}</p>
                                    <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{item.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Detail Overlay */}
                <AnimatePresence>
                    {selectedItem && (
                        <motion.div 
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            className="absolute inset-y-0 right-0 w-[400px] bg-slate-950 border-l border-emerald-500/30 shadow-2xl p-8 overflow-y-auto custom-scrollbar z-50 flex flex-col"
                        >
                            <button onClick={() => setSelectedItem(null)} className="self-end mb-8 text-slate-500 hover:text-white">
                                <X size={24} />
                            </button>

                            <div className="flex items-center justify-center w-20 h-20 bg-emerald-900/20 rounded-full border border-emerald-500/30 text-4xl mb-6 mx-auto">
                                {selectedItem.icon}
                            </div>

                            <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tight">{selectedItem.title}</h2>
                            <p className="text-center text-emerald-500 uppercase tracking-widest text-xs mb-8">{selectedItem.subtitle}</p>

                            <div className="space-y-6">
                                <div className="prose prose-invert prose-sm">
                                    <p className="text-slate-300 leading-relaxed text-base">{selectedItem.description}</p>
                                </div>

                                {selectedItem.keywords && (
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {selectedItem.keywords.map(k => (
                                            <span key={k} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-emerald-300">
                                                {k}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {selectedItem.element && (
                                    <div className="grid grid-cols-2 gap-4 mt-8 pt-8 border-t border-white/10">
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Element</div>
                                            <div className="text-white font-bold">{selectedItem.element}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-1">Modality</div>
                                            <div className="text-white font-bold">{selectedItem.modality}</div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default GrimoireCodex;
