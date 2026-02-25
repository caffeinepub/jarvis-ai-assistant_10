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
            <ScrollArea className="flex-1 h-64">
                <div className="p-3 space-y-3">
                    {entries.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground font-rajdhani text-sm">
                                Say <span className="text-cyan-jarvis font-semibold">"Jarvis"</span> to activate, or press the mic button
                            </p>
                        </div>
                    )}
                    {entries.map((entry) => (
                        <div
                            key={entry.id}
                            className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in-up`}
                        >
                            <div
                                className={`max-w-[85%] px-3 py-2 rounded-sm text-sm font-rajdhani ${
                                    entry.role === 'user'
                                        ? 'bg-jarvis-cyan/10 border border-jarvis-cyan/30 text-cyan-jarvis'
                                        : 'bg-jarvis-gold/10 border border-jarvis-gold/30 text-gold-jarvis'
                                }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-orbitron opacity-60 tracking-wider">
                                        {entry.role === 'user' ? 'YOU' : 'JARVIS'}
                                    </span>
                                    <span className="text-xs opacity-40">
                                        {entry.timestamp.toLocaleTimeString()}
                                    </span>
                                </div>
                                <p className="leading-relaxed">{entry.text}</p>
                            </div>
                        </div>
                    ))}
                    {interimTranscript && (
                        <div className="flex justify-end">
                            <div className="max-w-[85%] px-3 py-2 rounded-sm text-sm font-rajdhani bg-jarvis-cyan/5 border border-jarvis-cyan/20 text-cyan-jarvis opacity-60">
                                <span className="text-xs font-orbitron opacity-60 tracking-wider block mb-1">YOU</span>
                                <p className="italic">{interimTranscript}<span className="animate-typing-cursor">|</span></p>
                            </div>
                        </div>
                    )}
                    <div ref={bottomRef} />
                </div>
            </ScrollArea>
        </ThemedPanel>
    );
};

export default ConversationLog;
