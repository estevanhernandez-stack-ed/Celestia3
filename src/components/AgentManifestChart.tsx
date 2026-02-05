"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    Sparkles, 
    Search, 
    Music, 
    Activity, 
    Eye, 
    Cpu, 
    Compass,
    Bot,
    GripVertical,
    LucideIcon
} from 'lucide-react';

const ToolNode = ({ icon: Icon, title, desc, color, tech, badge, address }: { icon: LucideIcon, title: string, desc: string, color: string, tech?: string, badge?: string, address?: string }) => (
    <motion.div 
        whileHover={{ scale: 1.01, y: -2 }}
        className="bg-black/40 backdrop-blur-3xl border border-white/5 p-5 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all flex flex-col justify-between h-full shadow-2xl shadow-indigo-500/0 hover:shadow-indigo-500/10"
    >
        {/* Scanned Line Animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-full h-px bg-indigo-400/20 absolute top-0 animate-[scan_3s_linear_infinite]" />
        </div>

        <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
            <Icon size={64} className={color} />
        </div>
        
        <div className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl bg-black/60 border border-white/5 flex items-center justify-center ${color} shadow-inner`}>
                    <Icon size={20} />
                </div>
                <div className="flex flex-col items-end gap-1">
                    {badge && (
                        <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10">
                            <span className="text-[7px] font-black uppercase tracking-widest text-slate-400">{badge}</span>
                        </div>
                    )}
                    {address && (
                        <span className="text-[6px] font-mono font-black text-slate-500 tracking-tighter uppercase">{address}</span>
                    )}
                </div>
            </div>
            <div>
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black uppercase tracking-tighter text-white/90 group-hover:text-white transition-colors">{title}</h3>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed mt-2 font-bold tracking-tight group-hover:text-slate-300 transition-colors">{desc}</p>
            </div>
        </div>

        {tech && (
            <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">EXEC_STATUS::ACTIVE</span>
                </div>
                <span className={`text-[8px] font-mono font-bold tracking-widest ${color} uppercase`}>{tech}</span>
            </div>
        )}
    </motion.div>
);

export default function AgentManifestChart() {
    return (
        <div className="min-h-screen bg-[#050505] text-slate-300 p-8 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            {/* Technical Overlays */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[size:40px_40px] opacity-[0.03] pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-size-[100%_2px,3px_100%] pointer-events-none opacity-20" />
            
            {/* Background Atmosphere */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.08),transparent_70%)] pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto space-y-12 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col items-start gap-6 border-b border-white/10 pb-12">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">System Audit 3.5.0</span>
                            </div>
                            <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">Status: Operational</span>
                            </div>
                        </div>
                        <h1 className="text-6xl font-black text-white italic tracking-tighter uppercase leading-none">
                            Gemini 3 <span className="text-indigo-500 italic">Agentic</span> Heart
                        </h1>
                        <p className="text-slate-400 max-w-xl font-medium leading-relaxed">
                            A technical mapping of the function-calling architecture and multimodal manifestations governing the Celestia 3 ecosystem.
                        </p>
                    </div>
                </div>

                {/* Main Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 lg:grid-rows-2 gap-6 items-stretch">
                    {/* Central Master Node */}
                    <div className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-linear-to-br from-indigo-950/20 via-black to-black border border-indigo-500/10 rounded-4xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-indigo-500/5">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                            <Bot size={320} className="text-indigo-400" />
                        </div>
                        
                        <div className="space-y-8 relative z-10">
                            <div className="flex items-start justify-between">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 shadow-[0_0_50px_rgba(99,102,241,0.2)] flex items-center justify-center">
                                    <Cpu size={32} className="text-indigo-400" />
                                </div>
                                <div className="text-right font-mono font-bold text-[8px] text-indigo-500/60 uppercase tracking-widest leading-relaxed">
                                    Kernel Revision: 3.5.0-ALPHA<br/>
                                    Architecture: Multimodal-Refined<br/>
                                    Entropy Masking: Disabled
                                </div>
                            </div>
                            <div>
                                <h2 className="text-5xl font-black text-white uppercase tracking-tighter italic">Unified Intelligence</h2>
                                <div className="mt-4 flex gap-4">
                                    <div className="flex-1 space-y-2">
                                        <p className="text-indigo-200/70 leading-relaxed font-bold text-sm max-w-md">
                                            The core kernel utilizes Gemini 3 Pro Preview to synthesize astronomical data, multimodal vision, and autonomous reasoning.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 pt-4">
                                            <div className="space-y-1">
                                                <span className="text-[7px] font-black text-indigo-500 uppercase tracking-widest">Neural Load</span>
                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "65%" }}
                                                        className="h-full bg-indigo-500"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <span className="text-[7px] font-black text-cyan-500 uppercase tracking-widest">Memory Sync</span>
                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: "82%" }}
                                                        className="h-full bg-cyan-500"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5 flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="flex -space-x-3">
                                    {[1,2,3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-xl border-2 border-black bg-indigo-950/50 flex items-center justify-center text-indigo-400/60">
                                            <Activity size={16} />
                                        </div>
                                    ))}
                                </div>
                                <div className="h-10 w-px bg-white/5" />
                                <div className="flex flex-col">
                                    <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">Neural Link State</span>
                                    <span className="text-[9px] font-mono font-bold text-emerald-500 uppercase">PROTOCOL_ACTIVE::STREAMING</span>
                                </div>
                            </div>
                            <div className="text-right font-mono font-bold text-[7px] text-slate-500">
                                LOC::0x3F_A912<br/>
                                TS::2026-02-05
                            </div>
                        </div>
                    </div>

                    {/* Explicit Tools Column */}
                    <ToolNode 
                        icon={Activity}
                        title="trigger_resonance"
                        desc="Real-time environmental manipulation via planetary frequency synthesis."
                        color="text-cyan-400"
                        tech="FUNCTION_CALL"
                        badge="AGENTIC"
                        address="0x1A_RESONANCE"
                    />
                    <ToolNode 
                        icon={Music}
                        title="spotify_resonance"
                        desc="Procedural music generation and external API orchestration for ritual immersion."
                        color="text-fuchsia-400"
                        tech="TOOL_USE"
                        badge="MULTIMODAL"
                        address="0x2B_SONIC"
                    />

                    {/* Esoteric Tools Column */}
                    <ToolNode 
                        icon={Search}
                        title="search_ethereal_knowledge"
                        desc="Autonomous archival retrieval expanding the agent's internal scrying memory."
                        color="text-indigo-400"
                        tech="KNOWLEDGE_RETRIEVAL"
                        badge="RESEARCH"
                        address="0x3C_SCRIBE"
                    />
                    <ToolNode 
                        icon={Sparkles}
                        title="sigil_manifest"
                        desc="Generates unique vector paths and visual sigils directly from AI-synthesized intent."
                        color="text-amber-400"
                        tech="SVG_PROTOCOL"
                        badge="AGENTIC"
                        address="0x4D_GLYPH"
                    />
                </div>

                {/* Secondary Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
                    <div className="md:col-span-2">
                        <ToolNode 
                            icon={Eye}
                            title="Aetheric Thought Stream"
                            desc="Internal Chain-of-Thought transparency layer, exposing the agent's decision-making process."
                            color="text-emerald-400"
                            tech="PROMPT_REASONING"
                            badge="TRANSPARENT AI"
                            address="0x5E_COGITO"
                        />
                    </div>
                    <div>
                        <ToolNode 
                            icon={Compass}
                            title="Chronos Scrying"
                            desc="Autonomous researcher identifying historical coordinates from zero-shot memory."
                            color="text-rose-400"
                            tech="ZERO_SHOT"
                            badge="MEMORY"
                            address="0x6F_CHRONOS"
                        />
                    </div>
                    <div className="flex items-center justify-center p-6 bg-white/2 border border-dashed border-white/10 rounded-4xl opacity-40 hover:opacity-100 transition-opacity cursor-default group">
                        <div className="text-center group-hover:scale-105 transition-transform">
                            <Bot size={40} className="mx-auto mb-4 text-slate-800 group-hover:text-indigo-500" />
                            <p className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-700 group-hover:text-slate-500 leading-relaxed">
                                Neural Architecture Expansion<br/>Pending Final Protocol
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Manifest Label */}
                <div className="pt-20 flex flex-col items-center gap-6">
                    <GripVertical className="text-indigo-500/20" />
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[1em] text-slate-700 ml-[1em]">Celestial 3 • Technomancy Manifest</p>
                        <p className="text-[9px] font-mono text-slate-800 mt-2 uppercase">Checksum: 0x8A73_B31F_CELESTIA</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
