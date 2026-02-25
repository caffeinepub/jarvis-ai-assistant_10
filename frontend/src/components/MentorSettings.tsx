import React, { useState } from 'react';
import { Save, Flame } from 'lucide-react';
import { useSetMentor } from '../hooks/useQueries';
import { UserProfile } from '../backend';
import ThemedPanel from './ThemedPanel';

interface MentorSettingsProps {
    profile: UserProfile;
}

const PRESET_MENTORS = [
    'Rengoku Kojiro',
    'Naruto Uzumaki',
    'Goku',
    'Tony Stark',
    'Yoda',
    'Dumbledore',
    'Sherlock Holmes',
    'Batman',
];

const MentorSettings: React.FC<MentorSettingsProps> = ({ profile }) => {
    const [mentorName, setMentorName] = useState(profile.mentor || 'Rengoku Kojiro');
    const [saved, setSaved] = useState(false);
    const setMentorMutation = useSetMentor();

    const handleSave = async () => {
        if (!mentorName.trim()) return;
        await setMentorMutation.mutateAsync(mentorName.trim());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <ThemedPanel variant="gold" title="MENTOR CHARACTER" className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-rajdhani text-muted-foreground">
                <Flame className="w-4 h-4 text-gold-jarvis" />
                <span>Current mentor: <span className="text-gold-jarvis font-semibold">"{profile.mentor}"</span></span>
            </div>

            {/* Preset buttons */}
            <div className="flex flex-wrap gap-2">
                {PRESET_MENTORS.map(name => (
                    <button
                        key={name}
                        onClick={() => setMentorName(name)}
                        className={`px-2 py-1 text-xs rounded-sm transition-all font-rajdhani ${
                            mentorName === name
                                ? 'bg-jarvis-gold/20 border border-jarvis-gold/60 text-gold-jarvis'
                                : 'bg-jarvis-dark border border-jarvis-gold/20 text-muted-foreground hover:border-jarvis-gold/40'
                        }`}
                    >
                        {name}
                    </button>
                ))}
            </div>

            <div className="flex gap-2">
                <input
                    type="text"
                    value={mentorName}
                    onChange={e => setMentorName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    placeholder="Enter any character name..."
                    className="flex-1 px-3 py-2 text-sm rounded-sm jarvis-input"
                />
                <button
                    onClick={handleSave}
                    disabled={setMentorMutation.isPending || !mentorName.trim()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-sm jarvis-btn-gold disabled:opacity-50"
                >
                    <Save className="w-3.5 h-3.5" />
                    {setMentorMutation.isPending ? 'SAVING...' : saved ? 'SAVED!' : 'SAVE'}
                </button>
            </div>
            <p className="text-xs text-muted-foreground font-rajdhani">
                Enter any anime, movie, or fictional character as your personal mentor.
            </p>
        </ThemedPanel>
    );
};

export default MentorSettings;
