"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, X, Flame, MessageSquare, Minimize2, Maximize2 } from "lucide-react";
import { ChatService } from "@/lib/ChatService";
import { ChatMessage } from "@/types/chat";
import { useSettings } from "@/context/SettingsContext";
import { useAuth } from "@/context/AuthContext";
import { PersistenceService } from "@/lib/PersistenceService";

interface AthanorChatBarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export default function AthanorChatBar({ isOpen, onToggle }: AthanorChatBarProps) {
    const { user } = useAuth();
    const { preferences } = useSettings();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Load History
    useEffect(() => {
        if (user && isOpen) {
            PersistenceService.getHistory(user.uid).then(history => {
                const uniqueHistory = Array.from(new Map(history.map(m => [m.id, m])).values());
                setMessages(uniqueHistory.slice(-20)); // Only show last 20 messages
            });
        }
    }, [user, isOpen]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading || !user) return;

        const userMessage: ChatMessage = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: input,
            timestamp: Date.now()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            // Save user message
            await PersistenceService.saveMessage(user.uid, 'user', input);
            
            const response = await ChatService.sendMessage(
                user.uid,
                input,
                preferences,
                messages
            );

            const assistantMessage: ChatMessage = {
                id: `model-${Date.now()}`,
                role: 'model',
                content: response.text,
                timestamp: Date.now(),
                thought_signature: response.thought_signature
            };

            setMessages(prev => [...prev, assistantMessage]);
            
            // Save assistant message
            await PersistenceService.saveMessage(user.uid, 'model', response.text, response.thought_signature);
        } catch (error) {
            console.error("Athanor Chat Error:", error);
            const errorMessage: ChatMessage = {
                id: `error-${Date.now()}`,
                role: 'model',
                content: "The flames flicker... A disturbance in the aether. Please try again.",
                timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={onToggle}
                        className="fixed bottom-6 right-6 z-50 h-14 w-14 bg-linear-to-br from-orange-600 to-amber-700 rounded-full flex items-center justify-center shadow-2xl shadow-orange-500/30 border border-orange-400/30 hover:scale-105 transition-transform group"
                        title="Open Athanor (Philosophical Furnace)"
                    >
                        <Flame size={24} className="text-white group-hover:animate-pulse" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Panel */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className={`fixed bottom-6 right-6 z-50 bg-slate-950/95 backdrop-blur-xl border border-orange-500/20 rounded-2xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col ${isExpanded ? 'w-[500px] h-[600px]' : 'w-[380px] h-[450px]'} transition-all duration-300`}
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-orange-500/20 bg-linear-to-r from-orange-950/50 to-slate-950/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-linear-to-br from-orange-600 to-amber-700 rounded-xl flex items-center justify-center border border-orange-400/30">
                                    <Flame size={20} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider">The Athanor</h3>
                                    <p className="text-[10px] text-orange-400/70 uppercase tracking-widest">Philosophical Furnace</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    title={isExpanded ? "Minimize" : "Maximize"}
                                >
                                    {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                                <button
                                    onClick={onToggle}
                                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white"
                                    title="Close"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                            {messages.length === 0 && (
                                <div className="text-center text-slate-500 py-8 space-y-3">
                                    <MessageSquare size={32} className="mx-auto opacity-50" />
                                    <p className="text-sm font-medium">The furnace awaits your words...</p>
                                    <p className="text-xs text-slate-600">Ask anything about astrology, spirituality, or your chart.</p>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                            msg.role === 'user'
                                                ? 'bg-indigo-600/30 text-indigo-100 rounded-br-sm border border-indigo-500/20'
                                                : 'bg-orange-950/30 text-orange-100 rounded-bl-sm border border-orange-500/20'
                                        }`}
                                    >
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-orange-950/30 px-4 py-3 rounded-2xl rounded-bl-sm border border-orange-500/20">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-orange-500/20 bg-black/30">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    placeholder="Transmute your thoughts..."
                                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50 transition-all"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="px-4 bg-linear-to-br from-orange-600 to-amber-700 text-white rounded-xl disabled:opacity-50 disabled:grayscale hover:scale-105 active:scale-95 transition-transform"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
