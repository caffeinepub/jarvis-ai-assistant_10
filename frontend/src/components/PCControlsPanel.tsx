import React, { useState } from 'react';
import { Volume2, VolumeX, Sun, SunDim, ChevronUp, ChevronDown, ExternalLink, Search, LucideProps } from 'lucide-react';
import ThemedPanel from './ThemedPanel';
import { usePCControls } from '../hooks/usePCControls';

interface PCControlsPanelProps {
    controls: ReturnType<typeof usePCControls>;
}

interface ControlBtnProps {
    onClick: () => void;
    icon: React.ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>>;
    label: string;
}

const ControlBtn: React.FC<ControlBtnProps> = ({ onClick, icon: Icon, label }) => (
    <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 p-2 rounded-sm jarvis-btn hover:scale-105 transition-transform"
        title={label}
    >
        <Icon className="w-4 h-4" />
        <span className="text-[9px]">{label}</span>
    </button>
);

const PCControlsPanel: React.FC<PCControlsPanelProps> = ({ controls }) => {
    const [urlInput, setUrlInput] = useState('');
    const [searchInput, setSearchInput] = useState('');

    const handleOpenURL = () => {
        if (urlInput.trim()) {
            controls.openURL(urlInput.trim());
            setUrlInput('');
        }
    };

    const handleSearch = async () => {
        if (searchInput.trim()) {
            await controls.searchWikipedia(searchInput.trim());
            setSearchInput('');
        }
    };

    return (
        <ThemedPanel title="PC CONTROLS" className="h-full">
            <div className="p-3 space-y-3">
                {/* Volume & Brightness */}
                <div className="grid grid-cols-4 gap-1.5">
                    <ControlBtn onClick={controls.volumeUp} icon={Volume2} label="VOL +" />
                    <ControlBtn onClick={controls.volumeDown} icon={VolumeX} label="VOL -" />
                    <ControlBtn onClick={controls.brightnessUp} icon={Sun} label="BRT +" />
                    <ControlBtn onClick={controls.brightnessDown} icon={SunDim} label="BRT -" />
                </div>

                {/* Scroll */}
                <div className="grid grid-cols-2 gap-1.5">
                    <ControlBtn onClick={controls.scrollUp} icon={ChevronUp} label="SCROLL ↑" />
                    <ControlBtn onClick={controls.scrollDown} icon={ChevronDown} label="SCROLL ↓" />
                </div>

                {/* Volume indicator */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono-tech text-muted-foreground">
                        <span>VOL</span>
                        <span className="text-cyan-jarvis">{controls.volume}%</span>
                    </div>
                    <div className="h-1 bg-jarvis-dark rounded-full overflow-hidden">
                        <div
                            className="h-full bg-jarvis-cyan rounded-full transition-all"
                            style={{ width: `${controls.volume}%` }}
                        />
                    </div>
                </div>

                {/* Brightness indicator */}
                <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono-tech text-muted-foreground">
                        <span>BRT</span>
                        <span className="text-cyan-jarvis">{controls.brightness}%</span>
                    </div>
                    <div className="h-1 bg-jarvis-dark rounded-full overflow-hidden">
                        <div
                            className="h-full bg-jarvis-gold rounded-full transition-all"
                            style={{ width: `${controls.brightness}%` }}
                        />
                    </div>
                </div>

                {/* Open URL */}
                <div className="flex gap-1.5">
                    <input
                        type="text"
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleOpenURL()}
                        placeholder="Open URL or app..."
                        className="flex-1 px-2 py-1.5 text-xs rounded-sm jarvis-input"
                    />
                    <button onClick={handleOpenURL} className="p-1.5 rounded-sm jarvis-btn">
                        <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Wikipedia Search */}
                <div className="flex gap-1.5">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Search Wikipedia..."
                        className="flex-1 px-2 py-1.5 text-xs rounded-sm jarvis-input"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={controls.isSearching}
                        className="p-1.5 rounded-sm jarvis-btn disabled:opacity-50"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </ThemedPanel>
    );
};

export default PCControlsPanel;
