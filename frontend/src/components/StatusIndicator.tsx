import React from 'react';
import { AssistantState } from '../hooks/useVoiceAssistant';

interface StatusIndicatorProps {
    state: AssistantState;
}

const STATUS_CONFIG: Record<AssistantState, { label: string; color: string; pulse: boolean }> = {
    idle: { label: 'STANDBY', color: 'oklch(0.55 0.14 195)', pulse: false },
    'wake-listening': { label: 'WAKE WORD ACTIVE', color: 'oklch(0.65 0.16 195)', pulse: true },
    listening: { label: 'LISTENING', color: 'oklch(0.88 0.22 195)', pulse: true },
    processing: { label: 'PROCESSING', color: 'oklch(0.72 0.16 65)', pulse: true },
    speaking: { label: 'SPEAKING', color: 'oklch(0.72 0.18 150)', pulse: true },
};

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ state }) => {
    const config = STATUS_CONFIG[state] ?? STATUS_CONFIG['idle'];

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full jarvis-panel">
            <div
                className="w-2 h-2 rounded-full"
                style={{
                    backgroundColor: config.color,
                    boxShadow: `0 0 8px ${config.color}`,
                    animation: config.pulse ? 'pulse-cyan 1s ease-in-out infinite' : 'none',
                }}
            />
            <span
                className="text-xs font-orbitron tracking-widest"
                style={{ color: config.color }}
            >
                {config.label}
            </span>
        </div>
    );
};

export default StatusIndicator;
