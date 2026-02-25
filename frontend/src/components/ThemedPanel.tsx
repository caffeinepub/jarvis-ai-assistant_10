import React from 'react';

interface ThemedPanelProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'cyan' | 'gold' | 'dark';
    title?: string;
    cornerBrackets?: boolean;
}

const ThemedPanel: React.FC<ThemedPanelProps> = ({
    children,
    className = '',
    variant = 'cyan',
    title,
    cornerBrackets = false,
}) => {
    const variantClass = variant === 'gold' ? 'jarvis-panel-gold' : 'jarvis-panel';
    const titleColor = variant === 'gold' ? 'text-gold-jarvis text-glow-gold' : 'text-cyan-jarvis text-glow-cyan';

    return (
        <div className={`relative rounded-sm ${variantClass} ${cornerBrackets ? 'corner-bracket' : ''} ${className}`}>
            {title && (
                <div className={`px-4 py-2 border-b border-current border-opacity-20 font-orbitron text-xs tracking-widest uppercase ${titleColor}`}>
                    {title}
                </div>
            )}
            {children}
        </div>
    );
};

export default ThemedPanel;
