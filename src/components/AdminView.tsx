"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
    Terminal, 
    Save, 
    RefreshCw, 
    Database, 
    Settings, 
    Lock,
    AlertCircle,
    Monitor,
    FileCode,
    Sparkles,
    Cpu,
    BookOpen
} from 'lucide-react';
import { ConfigService, SystemPrompt, GlobalDirective, DEFAULT_DIRECTIVE } from '@/lib/ConfigService';
import { useSettings } from '@/context/SettingsContext';
import { ProgressionService } from '@/lib/ProgressionService';
import { Zap as ZapIcon, Trash2, Award, ArrowUpCircle, Users } from 'lucide-react';
import { CelebrityService } from '@/lib/CelebrityService';

const AdminView: React.FC = () => {
    const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<SystemPrompt | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'prompts' | 'tools' | 'logs' | 'debug' | 'architect'>('prompts');
    const [directive, setDirective] = useState<GlobalDirective | null>(null);
    const [isDirectiveSaving, setIsDirectiveSaving] = useState(false);
    const [isSyncingPrompts, setIsSyncingPrompts] = useState(false);
    const [isSeedingCelebs, setIsSeedingCelebs] = useState(false);
    const [seedResult, setSeedResult] = useState<{ success: number; failed: string[] } | null>(null);
    const { preferences, updatePreferences } = useSettings();

    const loadPrompts = useCallback(async () => {
        const all = await ConfigService.getAllPrompts();
        setPrompts(all);
        if (all.length > 0 && !selectedPrompt) {
            setSelectedPrompt(all[0]);
            setEditContent(all[0].content);
        }
    }, [selectedPrompt]);

    const loadDirective = useCallback(async () => {
        const d = await ConfigService.getGlobalDirective();
        setDirective(d);
    }, []);

    useEffect(() => {
        loadPrompts();
        loadDirective();
    }, [loadPrompts, loadDirective]);

    const handleSave = async () => {
        if (!selectedPrompt) return;
        setIsSaving(true);
        try {
            await ConfigService.savePrompt({
                ...selectedPrompt,
                content: editContent
            });
            await loadPrompts();
        } catch (error) {
            console.error("Save failed", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="h-full flex flex-col bg-slate-950/50 rounded-3xl border border-white/10 overflow-hidden">
            {/* Admin Header */}
            <div className="bg-slate-900/80 p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <Terminal size={24} className="text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-widest uppercase font-serif">Sanctum Control</h2>
                        <p className="text-[10px] text-indigo-400 font-mono tracking-widest">SYSTEM_ADMIN_ACCESS_GRANTED</p>
                    </div>
                </div>

                <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                    {[
                        { id: 'prompts', icon: FileCode, label: 'Prompts' },
                        { id: 'architect', icon: Sparkles, label: 'Architect' },
                        { id: 'tools', icon: Settings, label: 'Tools' },
                        { id: 'debug', icon: ZapIcon, label: 'DevTools' },
                        { id: 'logs', icon: Database, label: 'Logs' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'prompts' | 'tools' | 'logs' | 'debug')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                activeTab === tab.id 
                                ? 'bg-indigo-500/20 text-indigo-100 shadow-lg border border-indigo-500/30' 
                                : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            <tab.icon size={14} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Prompt List */}
                {activeTab === 'prompts' && (
                    <div className="w-80 border-r border-white/5 bg-slate-900/30 p-4 space-y-2 overflow-y-auto">
                        <div className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mb-4 px-2">Knowledge Engines</div>
                        {prompts.map(p => (
                            <button
                                key={p.id}
                                onClick={() => {
                                    setSelectedPrompt(p);
                                    setEditContent(p.content);
                                }}
                                className={`w-full text-left p-4 rounded-xl transition-all border ${
                                    selectedPrompt?.id === p.id 
                                    ? 'bg-indigo-500/10 border-indigo-500/30 text-white' 
                                    : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`}
                            >
                                <div className="text-sm font-bold truncate">{p.name}</div>
                                <div className="text-[9px] font-mono text-indigo-400/60 mt-1 uppercase">v{p.version} • {p.category}</div>
                            </button>
                        ))}
                    </div>
                )}

                {/* Main Content - Editor */}
                <div className="flex-1 flex flex-col bg-black/20 p-6 overflow-hidden relative">
                    {activeTab === 'architect' && directive && (
                        <motion.div 
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar pr-2"
                        >
                            <div className="flex items-center justify-between sticky top-0 bg-slate-950/20 backdrop-blur-md z-10 py-2">
                                <div className="flex items-center gap-3">
                                    <Cpu size={20} className="text-indigo-400" />
                                    <div>
                                        <h3 className="text-lg font-bold text-white uppercase tracking-widest font-serif">Persona Architect</h3>
                                        <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Master AI Configuration</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={async () => {
                                            if (window.confirm("WARNING: This will overwrite the Global Directive with local hardened defaults (The Resurrected Seer). Proceed?")) {
                                                setIsDirectiveSaving(true);
                                                await ConfigService.saveGlobalDirective(DEFAULT_DIRECTIVE);
                                                await loadDirective();
                                                setIsDirectiveSaving(false);
                                            }
                                        }}
                                        disabled={isDirectiveSaving}
                                        className="flex items-center gap-2 px-4 py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border border-amber-500/20"
                                    >
                                        <RefreshCw className={isDirectiveSaving ? "animate-spin" : ""} size={14} />
                                        {isDirectiveSaving ? 'Resetting...' : 'Reset to Hardened Defaults'}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            if (window.confirm("WARNING: This will overwrite all Cloud Prompts with local hardened defaults. Proceed?")) {
                                                setIsSyncingPrompts(true);
                                                await ConfigService.syncLocalPromptsToCloud();
                                                await loadPrompts(); // Refresh the list
                                                setIsSyncingPrompts(false);
                                            }
                                        }}
                                        disabled={isSyncingPrompts}
                                        className="flex items-center gap-2 px-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 border border-indigo-500/20"
                                    >
                                        <RefreshCw className={isSyncingPrompts ? "animate-spin" : ""} size={14} />
                                        {isSyncingPrompts ? 'Syncing...' : 'Force Sync Cloud Prompts'}
                                    </button>

                                    <button
                                        onClick={async () => {
                                            setIsDirectiveSaving(true);
                                            await ConfigService.saveGlobalDirective(directive!);
                                            setIsDirectiveSaving(false);
                                        }}
                                        disabled={isDirectiveSaving || !directive}
                                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-indigo-500/20 active:scale-95"
                                    >
                                        {isDirectiveSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />}
                                        {isDirectiveSaving ? 'Encoding...' : 'Commit Directive'}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8 pb-10">
                                {/* Persona Block */}
                                <div className="space-y-3">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                                        <Monitor size={12} /> The Persona Essence
                                    </label>
                                    <textarea
                                        value={directive.persona}
                                        onChange={(e) => setDirective({ ...directive, persona: e.target.value })}
                                        className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-2xl p-5 font-mono text-sm text-indigo-100 focus:outline-none focus:border-indigo-500/50 transition-all resize-none"
                                        placeholder="Who is the AI?"
                                    />
                                </div>

                                {/* Master Directive */}
                                <div className="space-y-3">
                                    <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                                        <Lock size={12} /> Prime Directive
                                    </label>
                                    <textarea
                                        value={directive.masterDirective}
                                        onChange={(e) => setDirective({ ...directive, masterDirective: e.target.value })}
                                        className="w-full h-32 bg-slate-900/50 border border-white/10 rounded-2xl p-5 font-mono text-sm text-amber-100/80 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                                        placeholder="Core rules the AI must follow..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Knowledge Focus */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                                            <BookOpen size={12} /> Knowledge Focus
                                        </label>
                                        <input
                                            value={directive.knowledgeFocus}
                                            onChange={(e) => setDirective({ ...directive, knowledgeFocus: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 font-mono text-sm text-emerald-100 focus:outline-none focus:border-emerald-500/50 transition-all"
                                            placeholder="Ancient texts to emphasize..."
                                        />
                                    </div>

                                    {/* Default Format */}
                                    <div className="space-y-3">
                                        <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                                            <FileCode size={12} /> Output Protocol
                                        </label>
                                        <input
                                            value={directive.defaultFormat}
                                            onChange={(e) => setDirective({ ...directive, defaultFormat: e.target.value })}
                                            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-5 py-4 font-mono text-sm text-fuchsia-100 focus:outline-none focus:border-fuchsia-500/50 transition-all"
                                            placeholder="Markdown, JSON, Riddle, etc..."
                                        />
                                    </div>
                                </div>

                                {/* Knowledge Sync Toggle */}
                                <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="text-sm font-bold text-white uppercase tracking-wider">Global Knowledge Sync</h4>
                                        <p className="text-[10px] text-indigo-400 uppercase tracking-widest font-mono">Injects Metadata Codex into all packets</p>
                                    </div>
                                    <button 
                                        onClick={() => setDirective({ ...directive, isKnowledgeSyncEnabled: !directive.isKnowledgeSyncEnabled })}
                                        className={`w-14 h-8 rounded-full transition-all relative ${directive.isKnowledgeSyncEnabled ? 'bg-indigo-600' : 'bg-slate-800'}`}
                                    >
                                        <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${directive.isKnowledgeSyncEnabled ? 'left-7' : 'left-1'}`} />
                                    </button>
                                </div>

                                {/* Glitch Sensitivity Slider */}
                                <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-3xl space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="text-sm font-bold text-white uppercase tracking-wider">Glitch Sensitivity</h4>
                                            <p className="text-[10px] text-amber-400 uppercase tracking-widest font-mono">Intensity of Omens from the Void</p>
                                        </div>
                                        <div className="text-lg font-mono font-bold text-amber-300">{directive.glitchSensitivity}%</div>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="100" 
                                        value={directive.glitchSensitivity}
                                        onChange={(e) => setDirective({ ...directive, glitchSensitivity: parseInt(e.target.value) || 0 })}
                                        className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-full appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between text-[8px] text-slate-500 uppercase font-black tracking-widest">
                                        <span>Stable</span>
                                        <span>Liminal</span>
                                        <span>Chaotic</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'prompts' && selectedPrompt && (
                        <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="h-full flex flex-col gap-4"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Monitor size={16} className="text-slate-500" />
                                    <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">
                                        Editing: <span className="text-white">{selectedPrompt.name}</span>
                                    </h3>
                                </div>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex items-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 shadow-indigo-500/20"
                                >
                                    {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />}
                                    {isSaving ? 'Synchronizing...' : 'Save Changes'}
                                </button>
                            </div>

                            <div className="flex-1 relative group">
                                <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full h-full bg-slate-900/50 border border-white/10 rounded-2xl p-6 font-mono text-sm text-indigo-100 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all resize-none shadow-inner"
                                    placeholder="Enter system instructions..."
                                />
                                <div className="absolute top-4 right-6 opacity-0 group-focus-within:opacity-100 transition-opacity pointer-events-none">
                                    <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 text-[9px] text-indigo-300 font-bold tracking-widest uppercase">
                                        Live Pulse Active
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl flex items-start gap-3">
                                <AlertCircle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-amber-400 leading-relaxed uppercase tracking-wider font-medium">
                                    Warning: Modifying core system grimoires will immediately alter the AI&apos;s behavior across all active sessions. Verify syntax and role boundaries before saving.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'tools' && (
                        <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto">
                            <div className="flex items-center gap-3">
                                <Settings size={16} className="text-indigo-400" />
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Tool Registry</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[
                                    { name: 'Natal Engine', status: 'Active', load: '12%', icon: Sparkles },
                                    { name: 'Tarot Logic', status: 'Standby', load: '0%', icon: FileCode },
                                    { name: 'Gemini Proxy', status: 'Healthy', load: '45%', icon: RefreshCw },
                                    { name: 'Akashic Auth', status: 'Active', load: '2%', icon: Lock }
                                ].map(tool => (
                                    <div key={tool.name} className="p-6 bg-white/5 border border-white/10 rounded-2xl space-y-4 hover:border-indigo-500/30 transition-all">
                                        <div className="flex items-center justify-between">
                                            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                <tool.icon size={18} />
                                            </div>
                                            <span className="text-[9px] uppercase font-black tracking-widest text-indigo-300 bg-indigo-500/10 px-2 py-1 rounded-full">{tool.status}</span>
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-white">{tool.name}</div>
                                            <div className="w-full h-1 bg-black/40 mt-2 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500" style={{ width: tool.load }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'logs' && (
                        <div className="h-full flex flex-col p-6 space-y-6">
                            <div className="flex items-center gap-3">
                                <Database size={16} className="text-amber-400" />
                                <h3 className="text-sm font-bold text-slate-300 uppercase tracking-widest">Akashic Logs</h3>
                            </div>
                            <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-6 font-mono text-[11px] space-y-2 overflow-y-auto">
                                <div className="text-indigo-400/60">[SYSTEM] Initialization pulse detected...</div>
                                <div className="text-slate-500">[AUTH] User ID: dev-user-local session started.</div>
                                <div className="text-indigo-400/60">[SYNC] Local storage reconciled with Akashic records.</div>
                                <div className="text-slate-500">[LOGS] Monitoring active. No anomalies found.</div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'debug' && (
                        <div className="h-full flex flex-col p-8 space-y-12 overflow-y-auto custom-scrollbar">
                            <div className="flex items-center gap-3">
                                <ZapIcon size={20} className="text-amber-400" />
                                <h3 className="text-lg font-bold text-white tracking-widest uppercase font-serif">Development Tools</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Unlock All */}
                                <div className="p-8 bg-indigo-500/10 border border-indigo-500/20 rounded-3xl space-y-6 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-indigo-400">
                                            <Award size={32} />
                                            <h4 className="text-xl font-bold text-white uppercase tracking-wider">Aetheric Override</h4>
                                        </div>
                                        <p className="text-sm text-indigo-200/60 leading-relaxed uppercase tracking-widest font-medium">
                                            Immediately ascend to Level 10 (&quot;Avatar of the Stars&quot;). This will unlock all ritual chambers and archives.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => updatePreferences({ level: 10, xp: 0 })}
                                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black tracking-widest uppercase text-sm transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-3"
                                    >
                                        <Sparkles size={18} />
                                        Ascend to Level 10
                                    </button>
                                </div>

                                {/* Reset Progress */}
                                <div className="p-8 bg-rose-500/5 border border-rose-500/20 rounded-3xl space-y-6 flex flex-col justify-between">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4 text-rose-500">
                                            <Trash2 size={32} />
                                            <h4 className="text-xl font-bold text-white uppercase tracking-wider">Soul Purge</h4>
                                        </div>
                                        <p className="text-sm text-rose-200/60 leading-relaxed uppercase tracking-widest font-medium">
                                            Reset your Level and XP to the initial state. Useful for testing onboarding and progression curves.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => updatePreferences({ level: 1, xp: 0 })}
                                        className="w-full py-4 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-500 rounded-2xl font-black tracking-widest uppercase text-sm transition-all flex items-center justify-center gap-3"
                                    >
                                        <RefreshCw size={18} />
                                        Reset to Level 1
                                    </button>
                                </div>

                                {/* Increment XP */}
                                <div className="p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-6 flex flex-col justify-between md:col-span-2">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-4 text-emerald-500">
                                                <ArrowUpCircle size={32} />
                                                <h4 className="text-xl font-bold text-white uppercase tracking-wider">XP Injection</h4>
                                            </div>
                                            <p className="text-sm text-emerald-200/60 leading-relaxed uppercase tracking-widest font-medium">
                                                Current Status: Level {preferences.level} • {preferences.xp} XP
                                            </p>
                                        </div>
                                        <div className="flex gap-4">
                                            {[100, 500, 1000].map(val => (
                                                <button
                                                    key={val}
                                                    onClick={() => {
                                                        let newXP = (preferences.xp || 0) + val;
                                                        let newLevel = preferences.level || 1;
                                                        let xpToNext = ProgressionService.getXPForNextLevel(newLevel);
                                                        while (newXP >= xpToNext && newLevel < 99) {
                                                            newXP -= xpToNext;
                                                            newLevel++;
                                                            xpToNext = ProgressionService.getXPForNextLevel(newLevel);
                                                        }
                                                        updatePreferences({ xp: newXP, level: newLevel });
                                                    }}
                                                    className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                                                >
                                                    +{val} XP
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Seed Celebrity Charts */}
                            <div className="p-8 bg-fuchsia-500/5 border border-fuchsia-500/20 rounded-3xl space-y-6 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 text-fuchsia-400">
                                        <Users size={32} />
                                        <h4 className="text-xl font-bold text-white uppercase tracking-wider">Seed Astral Icons</h4>
                                    </div>
                                    <p className="text-sm text-fuchsia-200/60 leading-relaxed uppercase tracking-widest font-medium">
                                        Precompute and store natal charts for all known celebrities to Firestore. Required for Celebrity Synergy.
                                    </p>
                                    {seedResult && (
                                        <div className={`p-3 rounded-xl text-xs font-mono ${seedResult.failed.length > 0 ? 'bg-rose-500/10 text-rose-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                                            ✅ {seedResult.success} charts seeded. {seedResult.failed.length > 0 && `❌ Failed: ${seedResult.failed.join(', ')}`}
                                        </div>
                                    )}
                                </div>
                                <button
                                    onClick={async () => {
                                        setIsSeedingCelebs(true);
                                        setSeedResult(null);
                                        const result = await CelebrityService.seedAllCelebrityCharts();
                                        setSeedResult(result);
                                        setIsSeedingCelebs(false);
                                    }}
                                    disabled={isSeedingCelebs}
                                    className="w-full py-4 bg-fuchsia-600 hover:bg-fuchsia-500 disabled:opacity-50 text-white rounded-2xl font-black tracking-widest uppercase text-sm transition-all shadow-xl shadow-fuchsia-500/20 flex items-center justify-center gap-3"
                                >
                                    {isSeedingCelebs ? <RefreshCw className="animate-spin" size={18} /> : <Users size={18} />}
                                    {isSeedingCelebs ? 'Seeding Charts...' : 'Seed All Celebrity Charts'}
                                </button>
                            </div>

                            <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-xl">
                                <p className="text-[10px] text-indigo-400/60 uppercase tracking-widest text-center font-bold">
                                    Celestial Debug Mode Active • All updates are persisted to the local soul signature.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminView;
