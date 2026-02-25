import { useState, useCallback, useRef } from 'react';
import { fetchWikipediaSummary, WikiResult } from '../utils/wikipediaApi';

interface PCControlsHook {
    volume: number;
    brightness: number;
    volumeUp: () => void;
    volumeDown: () => void;
    brightnessUp: () => void;
    brightnessDown: () => void;
    scrollUp: () => void;
    scrollDown: () => void;
    openURL: (url: string) => void;
    searchWikipedia: (query: string) => Promise<WikiResult>;
    isSearching: boolean;
    searchResult: WikiResult | null;
    clearSearchResult: () => void;
}

export function usePCControls(): PCControlsHook {
    const [volume, setVolume] = useState(70);
    const [brightness, setBrightness] = useState(100);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResult, setSearchResult] = useState<WikiResult | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const applyBrightness = useCallback((level: number) => {
        const overlay = document.getElementById('brightness-overlay');
        if (overlay) {
            const opacity = (100 - level) / 100 * 0.85;
            overlay.style.opacity = String(opacity);
        }
    }, []);

    const volumeUp = useCallback(() => {
        setVolume(prev => {
            const next = Math.min(100, prev + 10);
            // Apply to all media elements
            document.querySelectorAll('video, audio').forEach(el => {
                (el as HTMLMediaElement).volume = next / 100;
            });
            return next;
        });
    }, []);

    const volumeDown = useCallback(() => {
        setVolume(prev => {
            const next = Math.max(0, prev - 10);
            document.querySelectorAll('video, audio').forEach(el => {
                (el as HTMLMediaElement).volume = next / 100;
            });
            return next;
        });
    }, []);

    const brightnessUp = useCallback(() => {
        setBrightness(prev => {
            const next = Math.min(100, prev + 10);
            applyBrightness(next);
            return next;
        });
    }, [applyBrightness]);

    const brightnessDown = useCallback(() => {
        setBrightness(prev => {
            const next = Math.max(10, prev - 10);
            applyBrightness(next);
            return next;
        });
    }, [applyBrightness]);

    const scrollUp = useCallback(() => {
        window.scrollBy({ top: -300, behavior: 'smooth' });
    }, []);

    const scrollDown = useCallback(() => {
        window.scrollBy({ top: 300, behavior: 'smooth' });
    }, []);

    const openURL = useCallback((url: string) => {
        let finalUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            // Check if it's a known app name
            const appMap: Record<string, string> = {
                'youtube': 'https://youtube.com',
                'wikipedia': 'https://wikipedia.org',
                'google': 'https://google.com',
                'gmail': 'https://gmail.com',
                'github': 'https://github.com',
                'twitter': 'https://twitter.com',
                'facebook': 'https://facebook.com',
                'instagram': 'https://instagram.com',
                'netflix': 'https://netflix.com',
                'spotify': 'https://spotify.com',
                'amazon': 'https://amazon.com',
                'reddit': 'https://reddit.com',
                'linkedin': 'https://linkedin.com',
            };
            const lower = url.toLowerCase().trim();
            finalUrl = appMap[lower] || `https://www.google.com/search?q=${encodeURIComponent(url)}`;
        }
        window.open(finalUrl, '_blank');
    }, []);

    const searchWikipedia = useCallback(async (query: string): Promise<WikiResult> => {
        setIsSearching(true);
        try {
            const result = await fetchWikipediaSummary(query);
            setSearchResult(result);
            return result;
        } finally {
            setIsSearching(false);
        }
    }, []);

    const clearSearchResult = useCallback(() => {
        setSearchResult(null);
    }, []);

    return {
        volume,
        brightness,
        volumeUp,
        volumeDown,
        brightnessUp,
        brightnessDown,
        scrollUp,
        scrollDown,
        openURL,
        searchWikipedia,
        isSearching,
        searchResult,
        clearSearchResult,
    };
}
