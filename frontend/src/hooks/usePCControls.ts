import { useState, useRef, useEffect, useCallback } from 'react';

export interface PCControlCapabilities {
  volumeLevel: 'web-audio' | 'none';
  brightnessLevel: 'css-overlay';
  volumeLabel: string;
  brightnessLabel: string;
}

export function usePCControls() {
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(100);
  const [urlToOpen, setUrlToOpen] = useState('');
  const [wikiQuery, setWikiQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{
    title: string;
    summary: string;
    url: string;
    thumbnail?: string;
  } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const capabilities: PCControlCapabilities = {
    volumeLevel: 'web-audio',
    brightnessLevel: 'css-overlay',
    volumeLabel: 'Web Audio (App)',
    brightnessLabel: 'CSS Overlay (App)',
  };

  // Initialize Web Audio API
  useEffect(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.value = volume / 100;
        audioCtxRef.current = ctx;
        gainNodeRef.current = gain;
      }
    } catch {
      // Web Audio not available
    }
    return () => {
      audioCtxRef.current?.close().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Apply brightness overlay whenever brightness changes
  useEffect(() => {
    const overlay = document.getElementById('brightness-overlay') as HTMLElement | null;
    if (overlay) {
      const opacity = 1 - brightness / 100;
      overlay.style.opacity = String(Math.max(0, Math.min(0.9, opacity)));
    }
  }, [brightness]);

  const volumeUp = useCallback(() => {
    setVolume(prev => {
      const next = Math.min(100, prev + 10);
      if (gainNodeRef.current) {
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
        gainNodeRef.current.gain.value = next / 100;
      }
      return next;
    });
  }, []);

  const volumeDown = useCallback(() => {
    setVolume(prev => {
      const next = Math.max(0, prev - 10);
      if (gainNodeRef.current) {
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
        gainNodeRef.current.gain.value = next / 100;
      }
      return next;
    });
  }, []);

  const brightnessUp = useCallback(() => {
    setBrightness(prev => Math.min(100, prev + 10));
  }, []);

  const brightnessDown = useCallback(() => {
    setBrightness(prev => Math.max(10, prev - 10));
  }, []);

  const scrollUp = useCallback(() => {
    window.scrollBy({ top: -300, behavior: 'smooth' });
  }, []);

  const scrollDown = useCallback(() => {
    window.scrollBy({ top: 300, behavior: 'smooth' });
  }, []);

  const openUrl = useCallback((url: string) => {
    let finalUrl = url.trim();
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      // Check known app names
      const appMap: Record<string, string> = {
        youtube: 'https://www.youtube.com',
        google: 'https://www.google.com',
        gmail: 'https://mail.google.com',
        github: 'https://www.github.com',
        twitter: 'https://www.twitter.com',
        facebook: 'https://www.facebook.com',
        instagram: 'https://www.instagram.com',
        netflix: 'https://www.netflix.com',
        spotify: 'https://www.spotify.com',
        amazon: 'https://www.amazon.com',
        reddit: 'https://www.reddit.com',
        linkedin: 'https://www.linkedin.com',
        wikipedia: 'https://www.wikipedia.org',
        whatsapp: 'https://web.whatsapp.com',
        discord: 'https://discord.com',
      };
      const lower = finalUrl.toLowerCase();
      finalUrl = appMap[lower] || (lower.includes('.') ? `https://${lower}` : `https://www.${lower}.com`);
    }
    window.open(finalUrl, '_blank');
  }, []);

  const searchWikipedia = useCallback(async (query: string) => {
    try {
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`
      );
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setSearchResult({
        title: data.title,
        summary: data.extract,
        url: data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`,
        thumbnail: data.thumbnail?.source,
      });
    } catch {
      setSearchResult(null);
    }
  }, []);

  const clearSearchResult = useCallback(() => {
    setSearchResult(null);
  }, []);

  return {
    volume,
    brightness,
    urlToOpen,
    setUrlToOpen,
    wikiQuery,
    setWikiQuery,
    searchResult,
    setSearchResult,
    clearSearchResult,
    capabilities,
    volumeUp,
    volumeDown,
    brightnessUp,
    brightnessDown,
    scrollUp,
    scrollDown,
    openUrl,
    searchWikipedia,
  };
}
