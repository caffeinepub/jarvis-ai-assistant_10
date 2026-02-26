import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { AssistantState } from '../hooks/useVoiceAssistant';

interface VoiceControlButtonProps {
    state: AssistantState;
    onToggle: () => void;
    isSupported: boolean;
}

const VoiceControlButton: React.FC<VoiceControlButtonProps> = ({ state, onToggle, isSupported }) => {
    const isListening = state === 'listening';
    const isProcessing = state === 'processing';
    const isSpeaking = state === 'speaking';

    const getButtonStyle = () => {
        if (isListening) return {
            background: 'radial-gradient(circle, rgba(0,229,255,0.3) 0%, rgba(0,229,255,0.1) 100%)',
            border: '2px solid rgba(0,229,255,0.8)',
            boxShadow: '0 0 30px rgba(0,229,255,0.5), 0 0 60px rgba(0,229,255,0.2)',
        };
        if (isSpeaking) return {
            background: 'radial-gradient(circle, rgba(0,200,150,0.3) 0%, rgba(0,200,150,0.1) 100%)',
            border: '2px solid rgba(0,200,150,0.8)',
            boxShadow: '0 0 30px rgba(0,200,150,0.5)',
        };
        return {
            background: 'radial-gradient(circle, rgba(0,150,180,0.2) 0%, rgba(0,150,180,0.05) 100%)',
            border: '2px solid rgba(0,180,220,0.4)',
            boxShadow: '0 0 15px rgba(0,180,220,0.2)',
        };
    };

    return (
        <button
            onClick={onToggle}
            disabled={!isSupported || isProcessing || isSpeaking}
            className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            style={getButtonStyle()}
            title={isListening ? 'Stop listening' : 'Start listening'}
        >
            {/* Pulse rings when listening */}
            {isListening && (
                <>
                    <div className="absolute inset-0 rounded-full border border-jarvis-cyan/40 animate-ping" />
                    <div className="absolute inset-[-8px] rounded-full border border-jarvis-cyan/20 animate-ping" style={{ animationDelay: '0.3s' }} />
                </>
            )}

            {isProcessing ? (
                <Loader2 className="w-8 h-8 text-jarvis-gold animate-spin" />
            ) : isListening ? (
                <Mic className="w-8 h-8 text-cyan-jarvis" />
            ) : (
                <MicOff className="w-8 h-8 text-muted-foreground" />
            )}
        </button>
    );
};

export default VoiceControlButton;
