import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { getTimeGreeting, getTimeEmoji } from '../utils/timeGreeting';
import HUDRings from '../components/HUDRings';

const TransitionScreen: React.FC = () => {
    const navigate = useNavigate();
    const { data: profile } = useGetCallerUserProfile();
    const [phase, setPhase] = useState<'boot' | 'greeting' | 'done'>('boot');
    const [displayText, setDisplayText] = useState('');
    const [showGreeting, setShowGreeting] = useState(false);

    const greeting = getTimeGreeting();
    const emoji = getTimeEmoji();
    const username = profile?.username || 'User';

    useEffect(() => {
        const bootLines = [
            'INITIALIZING JARVIS SYSTEMS...',
            'LOADING NEURAL NETWORKS...',
            'CALIBRATING VOICE MODULES...',
            'SYNCING MEMORY BANKS...',
            'ALL SYSTEMS NOMINAL.',
        ];

        let lineIdx = 0;
        let charIdx = 0;
        let currentText = '';

        const typeInterval = setInterval(() => {
            if (lineIdx >= bootLines.length) {
                clearInterval(typeInterval);
                setPhase('greeting');
                setTimeout(() => setShowGreeting(true), 300);
                setTimeout(() => {
                    navigate({ to: '/dashboard' });
                }, 3500);
                return;
            }

            const line = bootLines[lineIdx];
            if (charIdx < line.length) {
                currentText += line[charIdx];
                charIdx++;
                setDisplayText(currentText);
            } else {
                currentText += '\n';
                setDisplayText(currentText);
                lineIdx++;
                charIdx = 0;
            }
        }, 30);

        return () => clearInterval(typeInterval);
    }, [navigate]);

    return (
        <div
            className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
            style={{ background: 'oklch(0.06 0.01 220)' }}
        >
            {/* Background glow */}
            <div
                className="absolute inset-0"
                style={{
                    background: 'radial-gradient(ellipse at center, rgba(0,229,255,0.08) 0%, transparent 70%)',
                }}
            />

            {/* HUD Rings */}
            <div className="absolute inset-0 flex items-center justify-center opacity-30">
                <HUDRings size={600} isActive state="processing" />
            </div>

            {/* Scanlines */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,229,255,0.02) 2px, rgba(0,229,255,0.02) 4px)',
                }}
            />

            {/* Content */}
            <div className="relative z-10 text-center space-y-8 px-8 max-w-2xl w-full">
                {/* Arc reactor logo */}
                <div className="flex justify-center">
                    <div className="relative">
                        <img
                            src="/assets/generated/arc-reactor-logo.dim_256x256.png"
                            alt="JARVIS"
                            className="w-24 h-24"
                            style={{
                                filter: 'drop-shadow(0 0 30px rgba(0,229,255,1))',
                                animation: 'pulse-cyan 1.5s ease-in-out infinite',
                            }}
                        />
                        <div
                            className="absolute inset-0 rounded-full"
                            style={{
                                background: 'radial-gradient(circle, rgba(0,229,255,0.3) 0%, transparent 70%)',
                                animation: 'pulse-cyan 1.5s ease-in-out infinite',
                            }}
                        />
                    </div>
                </div>

                {/* Boot text */}
                {phase === 'boot' && (
                    <div
                        className="text-left font-mono-tech text-sm leading-relaxed"
                        style={{ color: 'oklch(0.78 0.18 195)' }}
                    >
                        <pre className="whitespace-pre-wrap">
                            {displayText}
                            <span className="animate-typing-cursor">█</span>
                        </pre>
                    </div>
                )}

                {/* Greeting */}
                {showGreeting && (
                    <div className="space-y-4 animate-power-up">
                        <div className="text-5xl">{emoji}</div>
                        <h1
                            className="font-orbitron text-4xl font-bold tracking-widest"
                            style={{
                                color: 'oklch(0.88 0.22 195)',
                                textShadow: '0 0 20px rgba(0,229,255,0.8), 0 0 40px rgba(0,229,255,0.4)',
                            }}
                        >
                            {greeting}
                        </h1>
                        <p
                            className="font-rajdhani text-2xl tracking-widest"
                            style={{ color: 'oklch(0.72 0.16 65)' }}
                        >
                            {username.toUpperCase()}
                        </p>
                        <p className="font-rajdhani text-muted-foreground tracking-wider">
                            JARVIS is ready. All systems online.
                        </p>
                    </div>
                )}
            </div>

            {/* Bottom status bar */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-8 text-[10px] font-mono-tech text-muted-foreground opacity-50">
                <span>NEURAL.NET: ONLINE</span>
                <span>VOICE.SYS: READY</span>
                <span>MEMORY.BANK: LOADED</span>
            </div>
        </div>
    );
};

export default TransitionScreen;
