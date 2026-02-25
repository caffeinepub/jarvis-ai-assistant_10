import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Settings } from 'lucide-react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import HolographicBackground from '../components/HolographicBackground';
import WakeWordSettings from '../components/WakeWordSettings';
import LanguageSelector from '../components/LanguageSelector';
import MentorSettings from '../components/MentorSettings';
import MemoryPanel from '../components/MemoryPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SettingsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data: profile, isLoading } = useGetCallerUserProfile();

    if (isLoading || !profile) {
        return (
            <div className="min-h-screen bg-jarvis-dark flex items-center justify-center">
                <div className="w-12 h-12 border-2 border-jarvis-cyan/50 border-t-jarvis-cyan rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-jarvis-dark flex flex-col overflow-hidden">
            <HolographicBackground />

            {/* Header */}
            <header
                className="relative z-20 flex items-center gap-4 px-6 py-4 border-b"
                style={{
                    background: 'rgba(6, 10, 20, 0.9)',
                    borderColor: 'rgba(0, 229, 255, 0.2)',
                    backdropFilter: 'blur(12px)',
                }}
            >
                <button
                    onClick={() => navigate({ to: '/dashboard' })}
                    className="flex items-center gap-2 jarvis-btn px-3 py-2 rounded-sm text-xs"
                >
                    <ArrowLeft className="w-4 h-4" />
                    BACK
                </button>
                <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-cyan-jarvis" />
                    <h1 className="font-orbitron text-lg font-bold text-cyan-jarvis text-glow-cyan tracking-widest">
                        SYSTEM SETTINGS
                    </h1>
                </div>
            </header>

            {/* Content */}
            <main className="relative z-10 flex-1 p-6 max-w-4xl mx-auto w-full">
                <Tabs defaultValue="voice" className="space-y-6">
                    <TabsList
                        className="grid grid-cols-4 w-full rounded-sm"
                        style={{
                            background: 'rgba(6,10,20,0.8)',
                            border: '1px solid rgba(0,229,255,0.2)',
                        }}
                    >
                        {['voice', 'language', 'mentor', 'memory'].map(tab => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="font-orbitron text-xs tracking-widest uppercase data-[state=active]:bg-jarvis-cyan/20 data-[state=active]:text-cyan-jarvis rounded-sm"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    <TabsContent value="voice" className="space-y-4 animate-slide-in-up">
                        <WakeWordSettings profile={profile} />
                        <div
                            className="p-4 rounded-sm text-sm font-rajdhani text-muted-foreground"
                            style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.1)' }}
                        >
                            <p className="text-cyan-jarvis font-semibold mb-2">Voice Tips:</p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Say your wake word to activate JARVIS hands-free</li>
                                <li>Speak clearly and at a normal pace</li>
                                <li>Chrome browser provides the best speech recognition</li>
                                <li>Allow microphone permissions when prompted</li>
                            </ul>
                        </div>
                    </TabsContent>

                    <TabsContent value="language" className="space-y-4 animate-slide-in-up">
                        <LanguageSelector profile={profile} />
                        <div
                            className="p-4 rounded-sm text-sm font-rajdhani text-muted-foreground"
                            style={{ background: 'rgba(0,229,255,0.03)', border: '1px solid rgba(0,229,255,0.1)' }}
                        >
                            <p className="text-cyan-jarvis font-semibold mb-2">Language Tips:</p>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Say "Switch to Telugu" to change language by voice</li>
                                <li>Personal mode uses your selected language naturally</li>
                                <li>Professional mode uses formal English</li>
                                <li>Language changes apply to both input and output</li>
                            </ul>
                        </div>
                    </TabsContent>

                    <TabsContent value="mentor" className="space-y-4 animate-slide-in-up">
                        <MentorSettings profile={profile} />
                    </TabsContent>

                    <TabsContent value="memory" className="space-y-4 animate-slide-in-up">
                        <MemoryPanel />
                    </TabsContent>
                </Tabs>
            </main>

            {/* Footer */}
            <footer
                className="relative z-10 px-6 py-2 border-t flex items-center justify-between text-[10px] font-mono-tech text-muted-foreground"
                style={{ borderColor: 'rgba(0,229,255,0.1)', background: 'rgba(6,10,20,0.8)' }}
            >
                <span>JARVIS AI ASSISTANT © {new Date().getFullYear()}</span>
                <span>
                    Built with ❤ using{' '}
                    <a
                        href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname || 'jarvis-ai-assistant')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-cyan-jarvis hover:text-glow-cyan transition-all"
                    >
                        caffeine.ai
                    </a>
                </span>
                <span>v3.0.0</span>
            </footer>
        </div>
    );
};

export default SettingsPage;
