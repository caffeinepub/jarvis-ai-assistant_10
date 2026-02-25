import React, { useState } from 'react';
import { Save, Mic } from 'lucide-react';
import { useSetWakeWord } from '../hooks/useQueries';
import { UserProfile } from '../backend';
import ThemedPanel from './ThemedPanel';

interface WakeWordSettingsProps {
    profile: UserProfile;
}

const WakeWordSettings: React.FC<WakeWordSettingsProps> = ({ profile }) => {
    const [wakeWord, setWakeWord] = useState(profile.wakeWord || 'Jarvis');
    const [saved, setSaved] = useState(false);
    const setWakeWordMutation = useSetWakeWord();

    const handleSave = async () => {
        if (!wakeWord.trim()) return;
        await setWakeWordMutation.mutateAsync(wakeWord.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <ThemedPanel title="WAKE WORD" className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-rajdhani text-muted-foreground">
                <Mic className="w-4 h-4 text-cyan-jarvis" />
                <span>Current wake word: <span className="text-cyan-jarvis font-semibold">"{profile.wakeWord}"</span></span>
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={wakeWord}
                    onChange={e => setWakeWord(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="Enter new wake word..."
                    className="flex-1 px-3 py-2 text-sm rounded-sm jarvis-input"
                />
                <button
                    onClick={handleSave}
                    disabled={setWakeWordMutation.isPending || !wakeWord.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-sm jarvis-btn disabled:opacity-50"
                >
                    <Save className="w-3.5 h-3.5" />
                    {setWakeWordMutation.isPending ? 'SAVING...' : saved ? 'SAVED!' : 'SAVE'}
                </button>
            </div>
            <p className="text-xs text-muted-foreground font-rajdhani">
                Say your wake word to activate JARVIS hands-free. Default is "Jarvis".
            </p>
        </ThemedPanel>
    );
};

export default WakeWordSettings;
