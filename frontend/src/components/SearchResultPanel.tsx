import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { WikiResult } from '../utils/wikipediaApi';
import ThemedPanel from './ThemedPanel';

interface SearchResultPanelProps {
    result: WikiResult;
    onClose: () => void;
}

const SearchResultPanel: React.FC<SearchResultPanelProps> = ({ result, onClose }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)' }}>
            <div className="w-full max-w-2xl animate-slide-in-up">
                <ThemedPanel title={`SEARCH: ${result.title.toUpperCase()}`} className="relative">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-3 text-muted-foreground hover:text-cyan-jarvis transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="p-4 space-y-4">
                        <div className="flex gap-4">
                            {result.thumbnail && (
                                <img
                                    src={result.thumbnail}
                                    alt={result.title}
                                    className="w-24 h-24 object-cover rounded-sm flex-shrink-0 border border-jarvis-cyan/30"
                                />
                            )}
                            <div className="flex-1">
                                <h3 className="font-orbitron text-lg text-cyan-jarvis text-glow-cyan mb-2">
                                    {result.title}
                                </h3>
                                <p className="text-sm font-rajdhani text-foreground leading-relaxed">
                                    {result.summary}
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-jarvis-cyan/20">
                            <span className="text-xs text-muted-foreground font-mono-tech">SOURCE: WIKIPEDIA</span>
                            <a
                                href={result.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs jarvis-btn px-3 py-1.5 rounded-sm"
                            >
                                <ExternalLink className="w-3 h-3" />
                                OPEN ARTICLE
                            </a>
                        </div>
                    </div>
                </ThemedPanel>
            </div>
        </div>
    );
};

export default SearchResultPanel;
