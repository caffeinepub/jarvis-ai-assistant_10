import { useState, useCallback, useEffect, useRef } from 'react';

interface SpeechSynthesisHook {
    speak: (text: string, lang?: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
    voices: SpeechSynthesisVoice[];
    isSupported: boolean;
}

export function useSpeechSynthesis(): SpeechSynthesisHook {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    useEffect(() => {
        if (!isSupported) return;

        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            if (availableVoices.length > 0) {
                setVoices(availableVoices);
            }
        };

        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [isSupported]);

    const speak = useCallback((text: string, lang: string = 'en-US') => {
        if (!isSupported || !text.trim()) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = 0.95;
        utterance.pitch = 0.85;
        utterance.volume = 1;

        // Try to find a good voice for the language
        const availableVoices = window.speechSynthesis.getVoices();
        const langVoice = availableVoices.find(v => v.lang.startsWith(lang.split('-')[0]));
        if (langVoice) {
            utterance.voice = langVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [isSupported]);

    const cancel = useCallback(() => {
        if (isSupported) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, [isSupported]);

    useEffect(() => {
        return () => {
            if (isSupported) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSupported]);

    return { speak, cancel, isSpeaking, voices, isSupported };
}
