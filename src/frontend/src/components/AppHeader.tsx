import React from 'react';
import { Settings, LogOut, Zap } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { UserProfile } from '../backend';
import StatusIndicator from './StatusIndicator';
import ModeToggle from './ModeToggle';
import { AssistantState } from '../hooks/useVoiceAssistant';

interface AppHeaderProps {
    profile: UserProfile;
    assistantState: AssistantState;
    onModeChange?: (mode: string) => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({ profile, assistantState, onModeChange }) => {
    const { clear } = useInternetIdentity();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await clear();
        queryClient.clear();
        navigate({ to: '/login' });
    };

    return (
        <header
            className="relative z-20 flex items-center justify-between px-6 py-3 border-b"
            style={{
                background: 'rgba(6, 10, 20, 0.9)',
                borderColor: 'rgba(0, 229, 255, 0.2)',
                backdropFilter: 'blur(12px)',
            }}
        >
            {/* Left: Logo + Title */}
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                    <img
                        src="/assets/generated/arc-reactor-logo.dim_256x256.png"
                        alt="JARVIS"
                        className="w-full h-full object-contain"
                        style={{ filter: 'drop-shadow(0 0 8px rgba(0,229,255,0.8))' }}
                    />
                </div>
                <div>
                    <h1 className="font-orbitron text-base font-bold text-cyan-jarvis text-glow-cyan tracking-widest">
                        J.A.R.V.I.S
                    </h1>
                    <p className="text-[10px] font-mono-tech text-muted-foreground tracking-widest">
                        JUST A RATHER VERY INTELLIGENT SYSTEM
                    </p>
                </div>
            </div>

            {/* Center: Status */}
            <div className="flex items-center gap-4">
                <StatusIndicator state={assistantState} />
                <div className="hidden md:flex items-center gap-1.5 text-xs font-mono-tech text-muted-foreground">
                    <Zap className="w-3 h-3 text-cyan-jarvis" />
                    <span>v3.0.0</span>
                </div>
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
                <ModeToggle profile={profile} onModeChange={onModeChange} />

                <button
                    onClick={() => navigate({ to: '/settings' })}
                    className="p-2 rounded-sm jarvis-btn"
                    title="Settings"
                >
                    <Settings className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-sm jarvis-panel">
                    <div className="w-6 h-6 rounded-full bg-jarvis-cyan/20 border border-jarvis-cyan/40 flex items-center justify-center">
                        <span className="text-[10px] font-orbitron text-cyan-jarvis">
                            {profile.username.charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <span className="text-xs font-rajdhani text-foreground hidden sm:block">
                        {profile.username}
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    className="p-2 rounded-sm text-muted-foreground hover:text-destructive transition-colors"
                    title="Logout"
                >
                    <LogOut className="w-4 h-4" />
                </button>
            </div>
        </header>
    );
};

export default AppHeader;
