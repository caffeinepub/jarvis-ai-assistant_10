import React from 'react';
import { Trash2, Brain, AlertTriangle } from 'lucide-react';
import { useGetConversationMemory, useClearConversationMemory } from '../hooks/useQueries';
import ThemedPanel from './ThemedPanel';
import { ScrollArea } from '@/components/ui/scroll-area';

const MemoryPanel: React.FC = () => {
    const { data: memory = [], isLoading } = useGetConversationMemory();
    const clearMemory = useClearConversationMemory();
    const [confirmClear, setConfirmClear] = React.useState(false);

    const handleClear = async () => {
        if (!confirmClear) {
            setConfirmClear(true);
            setTimeout(() => setConfirmClear(false), 3000);
            return;
        }
        await clearMemory.mutateAsync();
        setConfirmClear(false);
    };

    return (
        <ThemedPanel title="CONVERSATION MEMORY" className="space-y-0">
            <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-rajdhani text-muted-foreground">
                        <Brain className="w-4 h-4 text-cyan-jarvis" />
                        <span><span className="text-cyan-jarvis font-semibold">{memory.length}</span> memory entries stored</span>
                    </div>
                    {memory.length > 0 && (
                        <button
                            onClick={handleClear}
                            disabled={clearMemory.isPending}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-sm transition-all font-orbitron tracking-wider ${
                                confirmClear
                                    ? 'bg-destructive/20 border border-destructive/60 text-destructive'
                                    : 'jarvis-btn'
                            } disabled:opacity-50`}
                        >
                            {confirmClear ? (
                                <>
                                    <AlertTriangle className="w-3 h-3" />
                                    CONFIRM CLEAR
                                </>
                            ) : (
                                <>
                                    <Trash2 className="w-3 h-3" />
                                    CLEAR ALL
                                </>
                            )}
                        </button>
                    )}
                </div>

                {isLoading ? (
                    <div className="text-center py-6 text-muted-foreground font-rajdhani text-sm">
                        Loading memory...
                    </div>
                ) : memory.length === 0 ? (
                    <div className="text-center py-6 space-y-2">
                        <Brain className="w-8 h-8 text-muted-foreground mx-auto opacity-40" />
                        <p className="text-muted-foreground font-rajdhani text-sm">No memory entries yet.</p>
                        <p className="text-muted-foreground font-rajdhani text-xs">Start a conversation to build memory.</p>
                    </div>
                ) : (
                    <ScrollArea className="h-64">
                        <div className="space-y-2 pr-2">
                            {memory.map((entry, idx) => (
                                <div
                                    key={idx}
                                    className="p-2.5 rounded-sm text-xs font-rajdhani leading-relaxed"
                                    style={{
                                        background: 'rgba(0,229,255,0.04)',
                                        borderLeft: '2px solid rgba(0,229,255,0.3)',
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-mono-tech text-muted-foreground opacity-60">
                                            #{String(idx + 1).padStart(3, '0')}
                                        </span>
                                    </div>
                                    <p className="text-foreground">{entry}</p>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </div>
        </ThemedPanel>
    );
};

export default MemoryPanel;
