import React from 'react';

const BrightnessOverlay: React.FC = () => {
    return (
        <div
            id="brightness-overlay"
            className="fixed inset-0 bg-black pointer-events-none z-[9999]"
            style={{ opacity: 0, transition: 'opacity 0.3s ease' }}
        />
    );
};

export default BrightnessOverlay;
