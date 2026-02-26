import { useRef, useState, useCallback, useEffect } from 'react';
import type {
    ISpeechRecognition,
    ISpeechRecognitionEvent,
    ISpeechRecognitionErrorEvent,
} from '../types/speechRecognition';
// Side-effect import to ensure the global Window augmentation is applied
import '../types/speechRecognition';

interface SpeechRecognitionOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    autoRestart?: boolean;
    onResult?: (transcript: string, isFinal: boolean) => void;
    onEnd?: () => void;
    onError?: (error: string) => void;
    onStart?: () => void;
}

interface SpeechRecognitionHook {
    isListening: boolean;
    transcript: string;
    interimTranscript: string;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
    isSupported: boolean;
    error: string | null;
}

export function useSpeechRecognition(options: SpeechRecognitionOptions = {}): SpeechRecognitionHook {
    const {
        lang = 'en-US',
        continuous = false,
        interimResults = true,
        autoRestart = false,
        onResult,
        onEnd,
        onError,
        onStart,
    } = options;

    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [error, setError] = useState<string | null>(null);

    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const shouldBeListeningRef = useRef(false);
    const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isStartingRef = useRef(false);

    const isSupported = typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Keep option refs stable so callbacks don't cause re-creation
    const optionsRef = useRef({ lang, continuous, interimResults, autoRestart, onResult, onEnd, onError, onStart });
    useEffect(() => {
        optionsRef.current = { lang, continuous, interimResults, autoRestart, onResult, onEnd, onError, onStart };
    });

    const clearRestartTimer = useCallback(() => {
        if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = null;
        }
    }, []);

    const doStart = useCallback(() => {
        if (!isSupported) return;
        if (isStartingRef.current) return;

        // Abort any existing instance
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = optionsRef.current.lang;
        recognition.continuous = optionsRef.current.continuous;
        recognition.interimResults = optionsRef.current.interimResults;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isStartingRef.current = false;
            setIsListening(true);
            setError(null);
            optionsRef.current.onStart?.();
        };

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript;
                } else {
                    interimText += result[0].transcript;
                }
            }

            if (finalText) {
                setTranscript(prev => prev + finalText);
                optionsRef.current.onResult?.(finalText, true);
            }
            if (interimText) {
                setInterimTranscript(interimText);
                optionsRef.current.onResult?.(interimText, false);
            }
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
            isStartingRef.current = false;
            const errMsg = event.error || 'Unknown error';

            // 'no-speech' and 'aborted' are non-fatal — just restart if needed
            if (errMsg === 'no-speech' || errMsg === 'aborted') {
                return;
            }

            setError(errMsg);
            setIsListening(false);
            optionsRef.current.onError?.(errMsg);
        };

        recognition.onend = () => {
            isStartingRef.current = false;
            setIsListening(false);
            setInterimTranscript('');
            recognitionRef.current = null;

            optionsRef.current.onEnd?.();

            // Auto-restart if we should still be listening
            if (shouldBeListeningRef.current && optionsRef.current.autoRestart) {
                clearRestartTimer();
                restartTimerRef.current = setTimeout(() => {
                    if (shouldBeListeningRef.current) {
                        doStart();
                    }
                }, 800);
            }
        };

        recognitionRef.current = recognition;
        isStartingRef.current = true;

        try {
            recognition.start();
        } catch {
            isStartingRef.current = false;
            setError('Failed to start speech recognition');
            setIsListening(false);
            recognitionRef.current = null;

            // Retry after delay if autoRestart
            if (shouldBeListeningRef.current && optionsRef.current.autoRestart) {
                clearRestartTimer();
                restartTimerRef.current = setTimeout(() => {
                    if (shouldBeListeningRef.current) {
                        doStart();
                    }
                }, 1000);
            }
        }
    }, [isSupported, clearRestartTimer]);

    const startListening = useCallback(() => {
        if (!isSupported) {
            setError('Speech recognition is not supported in this browser.');
            return;
        }
        clearRestartTimer();
        shouldBeListeningRef.current = true;
        doStart();
    }, [isSupported, doStart, clearRestartTimer]);

    const stopListening = useCallback(() => {
        shouldBeListeningRef.current = false;
        clearRestartTimer();
        isStartingRef.current = false;

        if (recognitionRef.current) {
            try { recognitionRef.current.stop(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }
        setIsListening(false);
        setInterimTranscript('');
    }, [clearRestartTimer]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            shouldBeListeningRef.current = false;
            clearRestartTimer();
            if (recognitionRef.current) {
                try { recognitionRef.current.abort(); } catch { /* ignore */ }
                recognitionRef.current = null;
            }
        };
    }, [clearRestartTimer]);

    return {
        isListening,
        transcript,
        interimTranscript,
        startListening,
        stopListening,
        resetTranscript,
        isSupported,
        error,
    };
}
