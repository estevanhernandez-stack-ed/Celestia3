"use client";

import React, { useState, useRef, useCallback } from 'react';
import NextImage from 'next/image';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Zap, Sparkles, Download, Save, RefreshCw } from 'lucide-react';
import { AuraCapture } from '@/types/preferences';
import { technomancerModel } from '@/lib/gemini';
import { NatalChartData } from '@/types/astrology';

interface AuraScannerProps {
    onClose: () => void;
    onSave: (capture: AuraCapture) => void;
    isEmbedded?: boolean;
    natalChart?: NatalChartData | null;
    city?: string;
}

const AuraScanner: React.FC<AuraScannerProps> = ({ onClose, onSave, isEmbedded = false, natalChart, city }) => {
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
            colors: auraColors,
            city,
            resonance: natalChart ? `Sun in ${natalChart.planets.find(p => p.name === 'Sun')?.sign}, Moon in ${natalChart.planets.find(p => p.name === 'Moon')?.sign}` : undefined
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

        const img = new window.Image();
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

            // Dynamic Gradients
            const grad1 = ctx.createRadialGradient(photoX, photoY, 0, photoX, photoY, photoW * 1.2);
            grad1.addColorStop(0, `${colors[0]}88`); // 50% opacity hex
            grad1.addColorStop(1, 'transparent');
            ctx.fillStyle = grad1;
            ctx.fillRect(photoX, photoY, photoW, photoH);

            const grad2 = ctx.createRadialGradient(photoX + photoW, photoY, 0, photoX + photoW, photoY, photoW * 0.8);
            grad2.addColorStop(0, `${colors[1] || colors[0]}66`);
            grad2.addColorStop(1, 'transparent');
            ctx.fillStyle = grad2;
            ctx.fillRect(photoX, photoY, photoW, photoH);

            if (colors[2]) {
                const x = photoX + photoW / 2;
                const y = photoY + photoH / 2;
                const grad3 = ctx.createRadialGradient(x, y, 0, x, y, photoW * 0.6);
                grad3.addColorStop(0, `${colors[2]}44`);
                grad3.addColorStop(1, 'transparent');
                ctx.fillStyle = grad3;
                ctx.fillRect(photoX, photoY, photoW, photoH);
            }

            // Film Grain Effect
            const filmImageData = ctx.getImageData(photoX, photoY, photoW, photoH);
            const filmPixels = filmImageData.data;
            for (let i = 0; i < filmPixels.length; i += 4) {
                const noise = (Math.random() - 0.5) * 15;
                filmPixels[i] = Math.min(255, Math.max(0, filmPixels[i] + noise));
                filmPixels[i+1] = Math.min(255, Math.max(0, filmPixels[i+1] + noise));
                filmPixels[i+2] = Math.min(255, Math.max(0, filmPixels[i+2] + noise));
            }
            ctx.putImageData(filmImageData, photoX, photoY);

            // Vignette
            const vignette = ctx.createRadialGradient(photoX + photoW/2, photoY + photoH/2, photoW * 0.4, photoX + photoW/2, photoY + photoH/2, photoW * 0.8);
            vignette.addColorStop(0, 'rgba(0,0,0,0)');
            vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
            ctx.fillStyle = vignette;
            ctx.fillRect(photoX, photoY, photoW, photoH);

            // Scanlines
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            for (let i = 0; i < photoH; i += 4) {
                ctx.fillRect(photoX, photoY + i, photoW, 1);
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
            const locationString = city ? `${city.toUpperCase()} • ` : '';
            ctx.fillText(`${locationString}${new Date().toLocaleDateString().toUpperCase()}`, canvas.width / 2, currentY);

            if (natalChart) {
                currentY += dateSize + (finalWidth * 0.025);
                ctx.font = `bold ${dateSize}px sans-serif`;
                ctx.fillStyle = '#6366f1';
                const sun = natalChart.planets.find(p => p.name === 'Sun')?.sign;
                const moon = natalChart.planets.find(p => p.name === 'Moon')?.sign;
                ctx.fillText(`☉ ${sun?.toUpperCase()}  ☽ ${moon?.toUpperCase()}`, canvas.width / 2, currentY);
            }

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

            const finalImageUrl = canvas.toDataURL('image/jpeg', 0.85);
            setCapturedImage(finalImageUrl);
        };
    }, [analyzeAura, city, natalChart]);

    const containerClass = isEmbedded 
        ? "relative w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-transparent p-0"
        : "fixed inset-0 z-[100] flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm";

    const contentClass = isEmbedded
        ? "relative w-full h-full bg-slate-950/50 border border-indigo-500/20 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
        : "relative w-full max-w-2xl bg-slate-950 border border-indigo-500/30 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]";

    return (
        <div className={containerClass} onClick={!isEmbedded ? onClose : undefined}>
            <motion.div
                initial={!isEmbedded ? { opacity: 0, scale: 0.9, y: 20 } : { opacity: 0 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={!isEmbedded ? { opacity: 0, scale: 0.9, y: 20 } : { opacity: 0 }}
                className={contentClass}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/40 backdrop-blur-md z-20">
                    <div className="flex items-center gap-3">
                        <Camera className="text-indigo-400" size={20} />
                        <h2 className="text-xl font-serif font-black tracking-widest text-white uppercase">Aura Cam</h2>
                    </div>
                    {!isEmbedded && (
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white">
                            <X size={20} />
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-0 flex flex-col items-center justify-center min-h-[500px] relative">
                    <canvas ref={canvasRef} className="hidden" />

                    <AnimatePresence mode="wait">
                        {step === 'intro' && (
                            <motion.div
                                key="intro"
                                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                                className="text-center space-y-8 max-w-xl w-full p-8"
                            >
                                <div className="relative w-80 h-80 mx-auto rounded-full overflow-hidden border-8 border-indigo-500/10 shadow-[0_0_80px_rgba(99,102,241,0.3)]">
                                    <Webcam
                                        ref={webcamRef}
                                        audio={false}
                                        screenshotFormat="image/jpeg"
                                        videoConstraints={{
                                            width: 1280,
                                            height: 720,
                                            facingMode: "user"
                                        }}
                                        className="w-full h-full object-cover grayscale opacity-60 scale-110"
                                        mirrored={true}
                                    />
                                    <div className="absolute inset-0 bg-linear-to-t from-indigo-950/80 to-transparent pointer-events-none" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="relative">
                                            <Zap className="text-indigo-400 animate-pulse" size={64} />
                                            <motion.div 
                                                animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0.1, 0.3] }}
                                                transition={{ repeat: Infinity, duration: 3 }}
                                                className="absolute inset-0 bg-indigo-500 rounded-full blur-2xl"
                                            />
                                        </div>
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
                                    Initiate Aura Link
                                </button>

                                <p className="text-[10px] text-indigo-400/50 uppercase tracking-[0.3em] font-bold">
                                    Hover your hands over the keyboard to connect with the oracle
                                </p>
                            </motion.div>
                        )}

                        {step === 'scanning' && (
                            <motion.div
                                key="scanning"
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-black"
                            >
                                <Webcam
                                    ref={webcamRef}
                                    audio={false}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{
                                        width: 1920,
                                        height: 1080,
                                        facingMode: "user"
                                    }}
                                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                                    mirrored={true}
                                />
                                <div className="absolute inset-0 bg-linear-to-b from-black/40 via-transparent to-black/80" />
                                <div className="absolute inset-0 border-[20px] border-indigo-500/10 pointer-events-none" />
                                
                                <div className="z-10 flex flex-col items-center space-y-6">
                                    <motion.div 
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-[12rem] font-black text-white drop-shadow-[0_0_40px_rgba(99,102,241,0.8)] font-serif leading-none"
                                    >
                                        {countdown}
                                    </motion.div>
                                    <div className="text-indigo-300 tracking-[0.6em] text-sm font-black animate-pulse flex flex-col items-center gap-6">
                                        <div className="flex items-center gap-3 bg-indigo-500/20 px-6 py-2 rounded-full border border-indigo-500/30 backdrop-blur-xl">
                                            <Sparkles size={16} />
                                            SYNCING BIO-RHYTHMS
                                        </div>
                                        <div className="text-[12px] text-white/60 tracking-[0.3em] font-mono leading-relaxed bg-black/60 px-8 py-3 rounded-2xl backdrop-blur-2xl border border-white/10 text-center max-w-xs uppercase">
                                            Keep your vessel near the interface...
                                        </div>
                                    </div>
                                </div>
                                <motion.div
                                    animate={{ 
                                        scale: [1, 1.3, 1], 
                                        opacity: [0.1, 0.3, 0.1],
                                        rotate: [0, 90, 180, 270, 360]
                                    }}
                                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                                    className="absolute w-[30rem] h-[30rem] border-2 border-indigo-500/20 rounded-full"
                                />
                                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md h-1 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 5, ease: "linear" }}
                                        className="h-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,1)]"
                                    />
                                </div>
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
                                            <NextImage 
                                                src={capturedImage!} 
                                                alt="Aura" 
                                                className="w-full h-auto" 
                                                width={400} 
                                                height={533} 
                                                unoptimized
                                            />
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
