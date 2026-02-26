import React, { useEffect, useRef } from 'react';
import { ConversationEntry } from '../hooks/useVoiceAssistant';
import { ScrollArea } from '@/components/ui/scroll-area';
import ThemedPanel from './ThemedPanel';

interface ConversationLogProps {
    entries: ConversationEntry[];
    interimTranscript?: string;
}

const ConversationLog: React.FC<ConversationLogProps> = ({ entries, interimTranscript }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [entries, interimTranscript]);

    return (
        <ThemedPanel title="CONVERSATION LOG" className="h-full flex flex-col">
            <ScrollArea className="flex-1 px-3 pb-3">
                {entries.length === 0 && !interimTranscript && (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                        <div className="w-12 h-12 rounded-full border border-jarvis-cyan/20 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-jarvis-cyan/20 animate-pulse" />
                        </div>
                        <p className="text-xs font-mono-tech text-muted-foreground">
                            AWAITING VOICE INPUT...
                        </p>
                        <p className="text-[10px] text-muted-foreground/60 font-rajdhani">
                            Say the wake word to begin
                        </p>
                    </div>
                )}

                <div className="space-y-3 pt-2">
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className={`flex flex-col ${entry.role === 'user' ? 'items-end' : 'items-start'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-orbitron tracking-widest ${
                                    entry.role === 'user' ? 'text-gold-jarvis' : 'text-cyan-jarvis'
                                }`}>
                                    {entry.role === 'user' ? 'YOU' : 'JARVIS'}
                                </span>
                                <span className="text-[9px] text-muted-foreground font-mono-tech">
                                    {entry.timestamp.toLocaleTimeString()}
                                </span>
                            </div>
                            <div
                                className={`max-w-[85%] px-3 py-2 rounded-sm text-xs font-rajdhani leading-relaxed ${
                                    entry.role === 'user'
                                        ? 'bg-jarvis-gold/10 border border-jarvis-gold/30 text-gold-jarvis'
                                        : 'bg-jarvis-cyan/5 border border-jarvis-cyan/20 text-cyan-jarvis'
                                }`}
                            >
                                {entry.text}
                            </div>
                        </div>
                    ))}

                    {/* Interim transcript */}
                    {interimTranscript && (
                        <div className="flex flex-col items-end">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[10px] font-orbitron tracking-widest text-gold-jarvis/60">YOU</span>
                                <span className="text-[9px] text-muted-foreground font-mono-tech">...</span>
                            </div>
                            <div className="max-w-[85%] px-3 py-2 rounded-sm text-xs font-rajdhani leading-relaxed bg-jarvis-gold/5 border border-jarvis-gold/20 text-gold-jarvis/60 italic">
                                {interimTranscript}
                            </div>
                        </div>
                    )}
                </div>

                <div ref={bottomRef} />
            </ScrollArea>
        </ThemedPanel>
    );
};

export default ConversationLog;
