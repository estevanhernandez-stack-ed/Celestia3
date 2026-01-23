"use client";

import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Zap, Sparkles, Download, Save, RefreshCw } from 'lucide-react';
import { AuraCapture } from '@/types/preferences';
import { technomancerModel } from '@/lib/gemini';

interface AuraScannerProps {
    onClose: () => void;
    onSave: (capture: AuraCapture) => void;
    isEmbedded?: boolean;
}

const AuraScanner: React.FC<AuraScannerProps> = ({ onClose, onSave, isEmbedded = false }) => {
    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [step, setStep] = useState<'intro' | 'scanning' | 'result'>('intro');
    const [countdown, setCountdown] = useState(5);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);

    const [auraAnalysis, setAuraAnalysis] = useState<string>('');
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [auraColors, setAuraColors] = useState<string[]>([]);

    const handleSaveToGallery = () => {
        if (!capturedImage) return;
        const capture: AuraCapture = {
            id: Date.now().toString(),
            imageUrl: capturedImage,
            date: new Date().toISOString(),
            analysis: auraAnalysis,
            colors: auraColors
        };
        onSave(capture);
        onClose();
    };

    const analyzeAura = useCallback(async (base64Image: string) => {
        const prompt = `
            You are a Mystical Aura Reader. 
            Look at this person's energy and expression.
            Determine their "Aura Colors" for today based on their vibrational frequency.

            RETURN JSON ONLY:
            {
                "colors": ["#Hex1", "#Hex2", "#Hex3"],
                "analysis": "A short, mystical poetic reading of their energy (max 20 words)."
            }
        `;

        try {
            const base64Data = base64Image.split(',')[1];
            const result = await technomancerModel.generateContent([
                { text: prompt },
                {
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: base64Data
                    }
                }
            ]);

            const text = result.response.text() || "{}";
            const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);

            return {
                colors: parsed.colors || ['#6366f1', '#a855f7', '#ec4899'],
                analysis: parsed.analysis || "Your light is brilliant, though veiled by the mists of the unknown."
            };

        } catch (e) {
            console.error("Aura Read Failed", e);
            return {
                colors: ['#6366f1', '#a855f7', '#ec4899'], // Fallback: Indigo/Purple/Pink
                analysis: "Static interference blocks the vision. Your energy remains a beautiful mystery."
            };
        }
    }, []);

    const startScan = () => {
        setStep('scanning');
        let count = 5;
        setCountdown(count);
        const timer = setInterval(() => {
            count--;
            setCountdown(count);
            if (count === 0) {
                clearInterval(timer);
                capture();
            }
        }, 1000);
    };

    const capture = useCallback(async () => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc || !canvasRef.current) return;

        setLoadingAnalysis(true);
        setStep('result');

        const { colors, analysis } = await analyzeAura(imageSrc);

        setAuraAnalysis(analysis);
        setAuraColors(colors);
        setLoadingAnalysis(false);

        const img = new Image();
        img.src = imageSrc;
        img.onload = () => {
            const canvas = canvasRef.current!;
            const ctx = canvas.getContext('2d')!;

            const originalWidth = img.width;
            const originalHeight = img.height;

            const side = Math.min(originalWidth, originalHeight);
            const sourceX = (originalWidth - side) / 2;
            const sourceY = (originalHeight - side) / 2;

            const PHOTO_SIZE = 800; 
            const borderSize = PHOTO_SIZE * 0.06;
            const finalWidth = PHOTO_SIZE;

            canvas.width = PHOTO_SIZE + (borderSize * 2);
            // Initial height estimate, will adjust
            canvas.height = PHOTO_SIZE + (PHOTO_SIZE * 0.8) + (borderSize * 2);

            const titleSize = Math.floor(finalWidth * 0.06);
            const dateSize = Math.floor(finalWidth * 0.022);
            const bodySize = Math.floor(finalWidth * 0.028);
            const lineHeight = bodySize * 1.4;
            const maxWidth = finalWidth * 0.85;

            ctx.font = `italic ${bodySize}px serif`;
            const words = analysis ? analysis.split(' ') : [];
            let linesCount = 0;
            let currentLine = '';
            
            for (let n = 0; n < words.length; n++) {
                const testLine = currentLine + words[n] + ' ';
                const metrics = ctx.measureText(testLine);
                if (metrics.width > maxWidth && n > 0) {
                    linesCount++;
                    currentLine = words[n] + ' ';
                } else {
                    currentLine = testLine;
                }
            }
            if (currentLine) linesCount++;

            const titleAreaHeight = titleSize + dateSize + (finalWidth * 0.08);
            const bodyAreaHeight = words.length > 0 ? (linesCount * lineHeight) + (finalWidth * 0.06) : 0;
            const footerHeight = titleAreaHeight + bodyAreaHeight + (finalWidth * 0.02);
            const bottomPadding = borderSize * 1.2;

            canvas.height = PHOTO_SIZE + footerHeight + (borderSize * 2) + bottomPadding;

            // Polaroid Background
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const photoX = borderSize;
            const photoY = borderSize;
            const photoW = PHOTO_SIZE;
            const photoH = PHOTO_SIZE;

            ctx.drawImage(img, sourceX, sourceY, side, side, photoX, photoY, photoW, photoH);
            
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 2;
            ctx.strokeRect(photoX, photoY, photoW, photoH);

            // Aura Overlay
            ctx.save();
            ctx.beginPath();
            ctx.rect(photoX, photoY, photoW, photoH);
            ctx.clip();

            const grad1 = ctx.createRadialGradient(photoX, photoY, 0, photoX, photoY, photoW * 0.8);
            grad1.addColorStop(0, colors[0]);
            grad1.addColorStop(1, 'transparent');
            ctx.fillStyle = grad1;
            ctx.globalAlpha = 0.5;
            ctx.fillRect(photoX, photoY, photoW, photoH);

            const grad2 = ctx.createRadialGradient(photoX + photoW, photoY + photoH, 0, photoX + photoW, photoY + photoH, photoW * 0.8);
            grad2.addColorStop(0, colors[1] || colors[0]);
            grad2.addColorStop(1, 'transparent');
            ctx.fillStyle = grad2;
            ctx.fillRect(photoX, photoY, photoW, photoH);

            if (colors[2]) {
                const x = photoX + Math.random() * photoW;
                const y = photoY + Math.random() * photoH;
                const grad3 = ctx.createRadialGradient(x, y, 0, x, y, photoW * 0.4);
                grad3.addColorStop(0, colors[2]);
                grad3.addColorStop(1, 'transparent');
                ctx.fillStyle = grad3;
                ctx.fillRect(photoX, photoY, photoW, photoH);
            }

            ctx.restore();

            // Text Rendering
            ctx.globalAlpha = 1.0;
            ctx.fillStyle = '#1e1e1e';
            ctx.textAlign = 'center';

            const footerTop = PHOTO_SIZE + borderSize;
            let currentY = footerTop + (finalWidth * 0.08); 
            
            currentY += titleSize; 
            ctx.font = `bold ${titleSize}px serif`;
            ctx.fillText('CELESTIA', canvas.width / 2, currentY);

            currentY += dateSize + (finalWidth * 0.015);
            ctx.font = `${dateSize}px sans-serif`;
            ctx.fillStyle = '#64748b';
            ctx.fillText(new Date().toLocaleDateString().toUpperCase(), canvas.width / 2, currentY);

            if (analysis) {
                currentY += bodySize + (finalWidth * 0.025);
                ctx.font = `italic ${bodySize}px serif`;
                ctx.fillStyle = '#475569';
                
                let line = '';
                for (let n = 0; n < words.length; n++) {
                    const testLine = line + words[n] + ' ';
                    const metrics = ctx.measureText(testLine);
                    if (metrics.width > maxWidth && n > 0) {
                        ctx.fillText(line, canvas.width / 2, currentY);
                        line = words[n] + ' ';
                        currentY += lineHeight;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line, canvas.width / 2, currentY);
            }

            const imageData = canvas.toDataURL('image/jpeg', 0.85);
            setCapturedImage(imageData);
        };
    }, [analyzeAura]);

    const containerClass = isEmbedded 
        ? "relative w-full h-full min-h-[600px] flex flex-col items-center justify-center bg-transparent"
        : "fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm";

    return (
        <div className={containerClass} onClick={!isEmbedded ? onClose : undefined}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-2xl bg-slate-950 border border-indigo-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/20">
                    <div className="flex items-center gap-3">
                        <Camera className="text-indigo-400" size={20} />
                        <h2 className="text-xl font-serif font-black tracking-widest text-white uppercase">Bio-Link Ritual</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center min-h-[500px]">
                    <canvas ref={canvasRef} className="hidden" />

                    <AnimatePresence mode="wait">
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="text-center space-y-8 max-w-md w-full"
                            >
                                <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-indigo-500/20 shadow-[0_0_50px_rgba(99,102,241,0.2)]">
                                    <Webcam
                                        ref={webcamRef}
                                        audio={false}
                                        screenshotFormat="image/jpeg"
                                        className="w-full h-full object-cover grayscale opacity-50"
                                        mirrored={true}
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-indigo-950/60 to-transparent pointer-events-none" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Zap className="text-indigo-400 animate-pulse" size={48} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h3 className="text-2xl font-serif text-white">Manifest Your Aura</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">
                                        Align your energy with the machine. Breathe deeply as we scan your vibrational field to collapse the wave function of your daily aura.
                                    </p>
                                </div>

                                <button
                                    onClick={startScan}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black tracking-[0.2em] uppercase text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3 group"
                                >
                                    <Zap size={18} className="group-hover:animate-bounce" />
                                    Initiate Link
                                </button>
                            </motion.div>
                        )}

                        {step === 'scanning' && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="relative w-full h-[400px] flex flex-col items-center justify-center"
                            >
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    className="absolute inset-0 w-full h-full object-cover opacity-30 blur-md"
                                    mirrored={true}
                                />
                                <div className="z-10 flex flex-col items-center space-y-4">
                                    <div className="text-8xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] font-serif">
                                        {countdown}
                                    </div>
                                    <div className="text-indigo-300 tracking-[0.4em] text-xs font-black animate-pulse flex items-center gap-2">
                                        <Sparkles size={14} />
                                        SYNCING BIO-RHYTHMS
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute w-72 h-72 border border-indigo-500/30 rounded-full"
                                />
                            </motion.div>
                        )}

                        {step === 'result' && (
                            <motion.div
                                key="result"
                                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="flex flex-col items-center space-y-8 w-full"
                            >
                                {loadingAnalysis ? (
                                    <div className="h-[400px] flex flex-col items-center justify-center space-y-6">
                                        <RefreshCw className="text-indigo-400 animate-spin" size={48} />
                                        <p className="text-indigo-300 font-mono text-xs tracking-widest uppercase">Deciphering Energy Signature...</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-white p-4 shadow-2xl rotate-1 transform hover:rotate-0 transition-transform duration-500 max-w-sm rounded-sm">
                                            <img src={capturedImage!} alt="Aura" className="w-full h-auto" />
                                        </div>

                                        <div className="text-center space-y-6">
                                            <div className="space-y-2">
                                                <h3 className="text-xl font-serif font-black text-indigo-300 uppercase tracking-widest">Your Cosmic Aura</h3>
                                                <p className="text-slate-300 text-sm italic leading-relaxed px-4 font-serif">
                                                    &ldquo;{auraAnalysis}&rdquo;
                                                </p>
                                            </div>

                                            <div className="flex gap-4 justify-center">
                                                <button
                                                    onClick={handleSaveToGallery}
                                                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
                                                >
                                                    <Save size={14} />
                                                    Record
                                                </button>
                                                <a
                                                    href={capturedImage!}
                                                    download={`celestia-aura-${Date.now()}.jpg`}
                                                    className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center gap-2"
                                                >
                                                    <Download size={14} />
                                                    Export
                                                </a>
                                                <button
                                                    onClick={() => { setStep('intro'); setCapturedImage(null); }}
                                                    className="px-6 py-3 border border-white/10 hover:bg-white/5 text-slate-400 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors"
                                                >
                                                    Reset
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};

export default AuraScanner;
