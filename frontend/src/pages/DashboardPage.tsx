import React, { useState, useCallback } from 'react';
import { useGetCallerUserProfile } from '../hooks/useQueries';
import { useVoiceAssistant } from '../hooks/useVoiceAssistant';
import { usePCControls } from '../hooks/usePCControls';
import { getLanguageCode } from '../utils/languageMaps';
import AppHeader from '../components/AppHeader';
import HolographicBackground from '../components/HolographicBackground';
import ArcReactorCore from '../components/ArcReactorCore';
import HUDRings from '../components/HUDRings';
import WaveformVisualizer from '../components/WaveformVisualizer';
import ConversationLog from '../components/ConversationLog';
import VoiceControlButton from '../components/VoiceControlButton';
import MentorCard from '../components/MentorCard';
import PCControlsPanel from '../components/PCControlsPanel';
import SearchResultPanel from '../components/SearchResultPanel';
import BrightnessOverlay from '../components/BrightnessOverlay';
import ThemedPanel from '../components/ThemedPanel';
import { useSaveConversationEntry } from '../hooks/useQueries';
import { Mic, MicOff, Radio, Zap } from 'lucide-react';

const DashboardPage: React.FC = () => {
    const { data: profile, isLoading } = useGetCallerUserProfile();
    const saveEntry = useSaveConversationEntry();
    const pcControls = usePCControls();
    const [currentMode, setCurrentMode] = useState<string>('');
    const [currentLanguage, setCurrentLanguage] = useState<string>('');

    const effectiveMode = currentMode || profile?.mode || 'personal';
    const effectiveLanguage = currentLanguage || profile?.language || 'English';

    const handleSaveEntry = useCallback((entry: string) => {
        saveEntry.mutate(entry);
    }, [saveEntry]);

    const assistant = useVoiceAssistant({
        language: effectiveLanguage,
        mode: effectiveMode,
        wakeWord: profile?.wakeWord || 'Jarvis',
        username: profile?.username || 'User',
        conversationMemory: profile?.conversationMemory || [],
        onSaveEntry: handleSaveEntry,
        onLanguageChange: setCurrentLanguage,
        onModeChange: setCurrentMode,
        pcControls,
    });

    const handleVoiceToggle = () => {
        if (assistant.isListening) {
            assistant.stopListening();
        } else {
            assistant.startListening();
        }
    };

    const handleWakeWordToggle = () => {
        if (assistant.isWakeWordActive) {
            assistant.stopWakeWordListening();
        } else {
            assistant.startWakeWordListening();
        }
    };

    if (isLoading || !profile) {
        return (
            <div className="min-h-screen bg-jarvis-dark flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-2 border-jarvis-cyan/50 border-t-jarvis-cyan rounded-full animate-spin mx-auto" />
                    <p className="font-orbitron text-sm text-cyan-jarvis tracking-widest">LOADING SYSTEMS...</p>
                </div>
            </div>
        );
    }

    const langCode = getLanguageCode(effectiveLanguage);

    return (
        <div className="relative min-h-screen bg-jarvis-dark flex flex-col overflow-hidden">
            <BrightnessOverlay />
            <HolographicBackground />

            {/* Header */}
            <AppHeader
                profile={{ ...profile, mode: effectiveMode, language: effectiveLanguage }}
                assistantState={assistant.assistantState}
                onModeChange={setCurrentMode}
            />

            {/* Main content */}
            <main className="relative z-10 flex-1 p-4 grid grid-cols-12 gap-4 min-h-0">

                {/* Left column: PC Controls + Mentor */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                    <PCControlsPanel controls={pcControls} />
                    <MentorCard mentorName={profile.mentor || 'Rengoku Kojiro'} />
                </div>

                {/* Center column: Main JARVIS interface */}
                <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
                    {/* Arc Reactor + HUD Rings */}
                    <ThemedPanel className="flex flex-col items-center justify-center py-6 relative overflow-hidden" cornerBrackets>
                        {/* HUD rings background */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-40">
                            <HUDRings size={320} isActive={assistant.assistantState !== 'idle'} state={assistant.assistantState} />
                        </div>

                        {/* Arc reactor */}
                        <div className="relative z-10">
                            <ArcReactorCore size={180} state={assistant.assistantState} />
                        </div>

                        {/* Status text */}
                        <div className="relative z-10 mt-4 text-center space-y-1">
                            <p className="font-orbitron text-xs tracking-widest text-cyan-jarvis text-glow-cyan">
                                {assistant.assistantState === 'idle' && 'STANDBY MODE'}
                                {assistant.assistantState === 'wake-listening' && `WAKE WORD: "${profile.wakeWord || 'Jarvis'}"`}
                                {assistant.assistantState === 'listening' && 'LISTENING...'}
                                {assistant.assistantState === 'processing' && 'PROCESSING...'}
                                {assistant.assistantState === 'speaking' && 'SPEAKING...'}
                            </p>
                            <p className="font-mono-tech text-[10px] text-muted-foreground">
                                LANG: {langCode.toUpperCase()} | MODE: {effectiveMode.toUpperCase()}
                            </p>
                        </div>

                        {/* Waveform */}
                        <div className="relative z-10 mt-4">
                            <WaveformVisualizer state={assistant.assistantState} width={280} height={60} />
                        </div>

                        {/* Voice control buttons */}
                        <div className="relative z-10 mt-6 flex items-center gap-6">
                            {/* Wake word toggle */}
                            <button
                                onClick={handleWakeWordToggle}
                                className={`flex items-center gap-2 px-3 py-2 rounded-sm text-xs font-orbitron tracking-wider transition-all ${
                                    assistant.isWakeWordActive
                                        ? 'bg-jarvis-cyan/20 border border-jarvis-cyan/60 text-cyan-jarvis'
                                        : 'jarvis-btn opacity-60'
                                }`}
                                title={assistant.isWakeWordActive ? 'Disable wake word' : 'Enable wake word'}
                            >
                                <Radio className="w-3.5 h-3.5" />
                                {assistant.isWakeWordActive ? 'WAKE ON' : 'WAKE OFF'}
                            </button>

                            {/* Main mic button */}
                            <VoiceControlButton
                                state={assistant.assistantState}
                                onToggle={handleVoiceToggle}
                                isSupported={assistant.isSupported}
                            />

                            {/* Mic status indicator */}
                            <div className={`flex items-center gap-1.5 text-xs font-orbitron tracking-wider ${
                                assistant.isListening ? 'text-cyan-jarvis' : 'text-muted-foreground opacity-60'
                            }`}>
                                {assistant.isListening ? (
                                    <Mic className="w-3.5 h-3.5" />
                                ) : (
                                    <MicOff className="w-3.5 h-3.5" />
                                )}
                                {assistant.isListening ? 'ACTIVE' : 'MUTED'}
                            </div>
                        </div>

                        {/* Auto-start notice */}
                        {assistant.isSupported && (
                            <div className="relative z-10 mt-3 flex items-center gap-1.5 text-[10px] font-mono-tech text-jarvis-cyan/60">
                                <Zap className="w-3 h-3" />
                                <span>AUTO-LISTENING • SAY "{profile.wakeWord || 'JARVIS'}" TO ACTIVATE</span>
                            </div>
                        )}

                        {!assistant.isSupported && (
                            <p className="relative z-10 mt-3 text-xs text-destructive font-rajdhani text-center">
                                ⚠ Speech recognition not supported in this browser. Use Chrome for full functionality.
                            </p>
                        )}
                    </ThemedPanel>

                    {/* Conversation Log */}
                    <div className="flex-1 min-h-0">
                        <ConversationLog
                            entries={assistant.conversationLog}
                            interimTranscript={assistant.interimTranscript}
                        />
                    </div>
                </div>

                {/* Right column: System info */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                    {/* System Status */}
                    <ThemedPanel title="SYSTEM STATUS" className="p-4 space-y-3">
                        <StatusRow label="VOICE ENGINE" value="ONLINE" color="green" />
                        <StatusRow label="AUTO-LISTEN" value={assistant.isWakeWordActive ? 'ACTIVE' : 'STANDBY'} color={assistant.isWakeWordActive ? 'green' : 'cyan'} />
                        <StatusRow label="MEMORY BANK" value={`${profile.conversationMemory.length} ENTRIES`} color="cyan" />
                        <StatusRow label="LANGUAGE" value={effectiveLanguage.toUpperCase()} color="cyan" />
                        <StatusRow label="MODE" value={effectiveMode.toUpperCase()} color={effectiveMode === 'professional' ? 'cyan' : 'gold'} />
                        <StatusRow label="WAKE WORD" value={`"${profile.wakeWord || 'Jarvis'}"`} color="cyan" />
                        <StatusRow label="MENTOR" value={profile.mentor.toUpperCase()} color="gold" />
                    </ThemedPanel>

                    {/* Quick Commands */}
                    <ThemedPanel title="VOICE COMMANDS" className="p-4">
                        <div className="space-y-2 text-xs font-rajdhani text-muted-foreground">
                            {[
                                `"${profile.wakeWord || 'Jarvis'}" (wake word)`,
                                '"Volume up/down"',
                                '"Brightness up/down"',
                                '"Scroll up/down"',
                                '"Open YouTube"',
                                '"What is [topic]"',
                                '"Switch to Spanish"',
                                '"Switch to professional"',
                                '"Remember [note]"',
                            ].map((cmd, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-jarvis-cyan/60 flex-shrink-0" />
                                    <span className="text-cyan-jarvis/80">{cmd}</span>
                                </div>
                            ))}
                        </div>
                    </ThemedPanel>
                </div>
            </main>

            {/* Search result overlay */}
            {pcControls.searchResult && (
                <SearchResultPanel
                    result={pcControls.searchResult}
                    onClose={pcControls.clearSearchResult}
                />
            )}

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
                <span>ALL SYSTEMS NOMINAL</span>
            </footer>
        </div>
    );
};

interface StatusRowProps {
    label: string;
    value: string;
    color: 'cyan' | 'gold' | 'green';
}

const StatusRow: React.FC<StatusRowProps> = ({ label, value, color }) => {
    const colorClass = color === 'gold' ? 'text-gold-jarvis' : color === 'green' ? 'text-jarvis-green' : 'text-cyan-jarvis';
    return (
        <div className="flex items-center justify-between">
            <span className="text-xs font-mono-tech text-muted-foreground">{label}</span>
            <span className={`text-xs font-mono-tech ${colorClass}`}>{value}</span>
        </div>
    );
};

export default DashboardPage;
