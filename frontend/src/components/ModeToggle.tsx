import React from 'react';
import { Briefcase, Heart } from 'lucide-react';
import { useSetMode } from '../hooks/useQueries';
import { UserProfile } from '../backend';

interface ModeToggleProps {
    profile: UserProfile;
    onModeChange?: (mode: string) => void;
}

const ModeToggle: React.FC<ModeToggleProps> = ({ profile, onModeChange }) => {
    const setMode = useSetMode();
    const isProfessional = profile.mode === 'professional';

    const handleToggle = async () => {
        const newMode = isProfessional ? 'personal' : 'professional';
        await setMode.mutateAsync(newMode);
        onModeChange?.(newMode);
    };

    return (
        <button
            onClick={handleToggle}
            disabled={setMode.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-all duration-300 font-orbitron text-xs tracking-wider uppercase ${
                isProfessional
                    ? 'bg-jarvis-cyan/10 border border-jarvis-cyan/50 text-cyan-jarvis hover:bg-jarvis-cyan/20'
                    : 'bg-jarvis-gold/10 border border-jarvis-gold/50 text-gold-jarvis hover:bg-jarvis-gold/20'
            }`}
            style={{
                boxShadow: isProfessional
                    ? '0 0 10px rgba(0,229,255,0.2)'
                    : '0 0 10px rgba(255,167,38,0.2)',
            }}
        >
            {isProfessional ? (
                <Briefcase className="w-3.5 h-3.5" />
            ) : (
                <Heart className="w-3.5 h-3.5" />
            )}
            {isProfessional ? 'Professional' : 'Personal'}
        </button>
    );
};

export default ModeToggle;
