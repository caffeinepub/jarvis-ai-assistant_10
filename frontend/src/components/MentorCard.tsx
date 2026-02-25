import React, { useState, useEffect } from 'react';
import { Flame, RefreshCw } from 'lucide-react';
import { getMentorMessage, getMentorStyle } from '../utils/mentorMessages';
import ThemedPanel from './ThemedPanel';

interface MentorCardProps {
    mentorName: string;
}

const MentorCard: React.FC<MentorCardProps> = ({ mentorName }) => {
    const [message, setMessage] = useState('');
    const style = getMentorStyle(mentorName);
    const isRengoku = mentorName.toLowerCase().includes('rengoku');
    const isGold = style === 'flame' || style === 'power';

    useEffect(() => {
        setMessage(getMentorMessage(mentorName));
    }, [mentorName]);

    const refreshMessage = () => {
        setMessage(getMentorMessage(mentorName));
    };

    return (
        <ThemedPanel variant={isGold ? 'gold' : 'cyan'} title="MENTOR" className="h-full">
            <div className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div className="relative w-14 h-14 rounded-sm overflow-hidden flex-shrink-0">
                        {isRengoku ? (
                            <img
                                src="/assets/generated/rengoku-avatar.dim_256x256.png"
                                alt={mentorName}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div
                                className="w-full h-full flex items-center justify-center"
                                style={{
                                    background: isGold
                                        ? 'linear-gradient(135deg, rgba(255,167,38,0.3), rgba(255,87,34,0.2))'
                                        : 'linear-gradient(135deg, rgba(0,229,255,0.3), rgba(0,150,180,0.2))',
                                    border: `1px solid ${isGold ? 'rgba(255,167,38,0.4)' : 'rgba(0,229,255,0.4)'}`,
                                }}
                            >
                                <Flame
                                    className="w-7 h-7"
                                    style={{ color: isGold ? 'oklch(0.85 0.18 65)' : 'oklch(0.88 0.22 195)' }}
                                />
                            </div>
                        )}
                        {/* Glow overlay */}
                        <div
                            className="absolute inset-0"
                            style={{
                                background: isGold
                                    ? 'linear-gradient(to bottom, transparent 60%, rgba(255,167,38,0.3))'
                                    : 'linear-gradient(to bottom, transparent 60%, rgba(0,229,255,0.3))',
                            }}
                        />
                    </div>

                    <div>
                        <p className={`font-orbitron text-sm font-bold ${isGold ? 'text-gold-jarvis text-glow-gold' : 'text-cyan-jarvis text-glow-cyan'}`}>
                            {mentorName.toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground font-rajdhani tracking-wider">
                            {isRengoku ? 'FLAME HASHIRA' : 'PERSONAL MENTOR'}
                        </p>
                    </div>
                </div>

                {/* Message */}
                <div
                    className="p-3 rounded-sm text-sm font-rajdhani leading-relaxed"
                    style={{
                        background: isGold ? 'rgba(255,167,38,0.05)' : 'rgba(0,229,255,0.05)',
                        borderLeft: `2px solid ${isGold ? 'rgba(255,167,38,0.5)' : 'rgba(0,229,255,0.5)'}`,
                    }}
                >
                    <p className={isGold ? 'text-gold-jarvis' : 'text-cyan-jarvis'}>
                        "{message}"
                    </p>
                </div>

                <button
                    onClick={refreshMessage}
                    className={`flex items-center gap-1.5 text-xs font-orbitron tracking-wider uppercase transition-opacity hover:opacity-100 opacity-60 ${isGold ? 'text-gold-jarvis' : 'text-cyan-jarvis'}`}
                >
                    <RefreshCw className="w-3 h-3" />
                    New Message
                </button>
            </div>
        </ThemedPanel>
    );
};

export default MentorCard;
