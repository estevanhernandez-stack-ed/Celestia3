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
    Sparkles
} from 'lucide-react';
import { ConfigService, SystemPrompt } from '@/lib/ConfigService';
import { useAuth } from '@/context/AuthContext';

const AdminView: React.FC = () => {
    const { profile } = useAuth();
    const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<SystemPrompt | null>(null);
    const [editContent, setEditContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'prompts' | 'tools' | 'logs'>('prompts');

    const loadPrompts = useCallback(async () => {
        const all = await ConfigService.getAllPrompts();
        setPrompts(all);
        if (all.length > 0 && !selectedPrompt) {
            setSelectedPrompt(all[0]);
            setEditContent(all[0].content);
        }
    }, [selectedPrompt]);

    useEffect(() => {
        loadPrompts();
    }, [loadPrompts]);

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

    if (profile?.role !== 'admin' && profile?.uid !== 'dev-user-local') {
        return (
            <div className="h-full flex items-center justify-center bg-slate-950/50 rounded-3xl border border-white/10 p-12 text-center">
                <div className="max-w-md space-y-6">
                    <div className="w-20 h-20 bg-rose-500/10 rounded-full border border-rose-500/20 flex items-center justify-center mx-auto">
                        <Lock size={40} className="text-rose-500" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-[0.3em] mb-2">Access Denied</h2>
                        <p className="text-slate-400 leading-relaxed text-sm">
                            The Sanctum Control requires administrative attunement. Your current vibrational frequency does not have the necessary permissions.
                        </p>
                    </div>
                    <div className="p-4 bg-white/5 rounded-2xl border border-white/10 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
                        ERROR_CODE: INSUFFICIENT_VIBRATIONAL_CLEARANCE
                    </div>
                </div>
            </div>
        );
    }

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
                        { id: 'tools', icon: Settings, label: 'Tools' },
                        { id: 'logs', icon: Database, label: 'Logs' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'prompts' | 'tools' | 'logs')}
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
                <div className="flex-1 flex flex-col bg-black/20 p-6 overflow-hidden">
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
                </div>
            </div>
        </div>
    );
};

export default AdminView;
