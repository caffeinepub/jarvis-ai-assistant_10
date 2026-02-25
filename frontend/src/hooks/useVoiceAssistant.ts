import { useState, useCallback, useRef, useEffect } from 'react';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { getLanguageCode } from '../utils/languageMaps';
import { detectLanguageFromCommand } from '../utils/languageMaps';
import type {
    ISpeechRecognition,
    ISpeechRecognitionEvent,
    ISpeechRecognitionErrorEvent,
} from '../types/speechRecognition';
// Side-effect import to ensure the global Window augmentation is applied
import '../types/speechRecognition';

export type AssistantState = 'idle' | 'listening' | 'processing' | 'speaking' | 'wake-listening';

export interface ConversationEntry {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    timestamp: Date;
}

interface UseVoiceAssistantOptions {
    language: string;
    mode: string;
    wakeWord: string;
    username: string;
    conversationMemory: string[];
    onSaveEntry?: (entry: string) => void;
    onLanguageChange?: (lang: string) => void;
    onModeChange?: (mode: string) => void;
    pcControls?: {
        volumeUp: () => void;
        volumeDown: () => void;
        brightnessUp: () => void;
        brightnessDown: () => void;
        scrollUp: () => void;
        scrollDown: () => void;
        openURL: (url: string) => void;
        searchWikipedia: (query: string) => Promise<{ title: string; summary: string; url: string }>;
    };
}

export function useVoiceAssistant(options: UseVoiceAssistantOptions) {
    const {
        language,
        mode,
        wakeWord,
        username,
        conversationMemory,
        onSaveEntry,
        onLanguageChange,
        onModeChange,
        pcControls,
    } = options;

    const [assistantState, setAssistantState] = useState<AssistantState>('idle');
    const [conversationLog, setConversationLog] = useState<ConversationEntry[]>([]);
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported] = useState(() =>
        typeof window !== 'undefined' &&
        ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    );

    const langCode = getLanguageCode(language);
    const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis();

    // Stable refs for mutable values used inside callbacks
    const wakeWordRef = useRef(wakeWord);
    const modeRef = useRef(mode);
    const langCodeRef = useRef(langCode);
    const usernameRef = useRef(username);
    const pcControlsRef = useRef(pcControls);
    const onSaveEntryRef = useRef(onSaveEntry);
    const onLanguageChangeRef = useRef(onLanguageChange);
    const onModeChangeRef = useRef(onModeChange);

    useEffect(() => { wakeWordRef.current = wakeWord; }, [wakeWord]);
    useEffect(() => { modeRef.current = mode; }, [mode]);
    useEffect(() => { langCodeRef.current = langCode; }, [langCode]);
    useEffect(() => { usernameRef.current = username; }, [username]);
    useEffect(() => { pcControlsRef.current = pcControls; }, [pcControls]);
    useEffect(() => { onSaveEntryRef.current = onSaveEntry; }, [onSaveEntry]);
    useEffect(() => { onLanguageChangeRef.current = onLanguageChange; }, [onLanguageChange]);
    useEffect(() => { onModeChangeRef.current = onModeChange; }, [onModeChange]);

    // Single recognition instance ref — we manage it manually for full control
    const recognitionRef = useRef<ISpeechRecognition | null>(null);
    const stateRef = useRef<AssistantState>('idle');
    const processingRef = useRef(false);
    const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const isStartingRef = useRef(false);
    const mountedRef = useRef(true);

    const setStateSync = useCallback((s: AssistantState) => {
        stateRef.current = s;
        if (mountedRef.current) setAssistantState(s);
    }, []);

    const clearTimer = useCallback(() => {
        if (restartTimerRef.current) {
            clearTimeout(restartTimerRef.current);
            restartTimerRef.current = null;
        }
    }, []);

    const addToLog = useCallback((role: 'user' | 'assistant', text: string) => {
        const entry: ConversationEntry = {
            id: Date.now().toString() + Math.random(),
            role,
            text,
            timestamp: new Date(),
        };
        if (mountedRef.current) {
            setConversationLog(prev => [...prev.slice(-50), entry]);
        }
        return entry;
    }, []);

    const generateResponse = useCallback(async (userInput: string): Promise<string> => {
        const lower = userInput.toLowerCase().trim();
        const controls = pcControlsRef.current;

        if (controls) {
            if (lower.includes('volume up') || lower.includes('increase volume')) {
                controls.volumeUp();
                return "Volume increased, sir.";
            }
            if (lower.includes('volume down') || lower.includes('decrease volume') || lower.includes('lower volume')) {
                controls.volumeDown();
                return "Volume decreased, sir.";
            }
            if (lower.includes('brightness up') || lower.includes('increase brightness')) {
                controls.brightnessUp();
                return "Brightness increased, sir.";
            }
            if (lower.includes('brightness down') || lower.includes('decrease brightness') || lower.includes('lower brightness')) {
                controls.brightnessDown();
                return "Brightness decreased, sir.";
            }
            if (lower.includes('scroll up')) {
                controls.scrollUp();
                return "Scrolling up, sir.";
            }
            if (lower.includes('scroll down')) {
                controls.scrollDown();
                return "Scrolling down, sir.";
            }
            if (lower.includes('search for ') || lower.includes('tell me about ') || lower.includes('what is ') || lower.includes('who is ')) {
                const query = lower
                    .replace('search for ', '')
                    .replace('tell me about ', '')
                    .replace('what is ', '')
                    .replace('who is ', '')
                    .trim();
                try {
                    const result = await controls.searchWikipedia(query);
                    return `Here's what I found about ${result.title}: ${result.summary.slice(0, 300)}...`;
                } catch {
                    return `I couldn't find information about "${query}" at this time, sir.`;
                }
            }
            if (lower.includes('open ')) {
                const appName = lower.replace('open ', '').trim();
                controls.openURL(appName);
                return `Opening ${appName} for you, sir.`;
            }
        }

        // Language switching
        const detectedLang = detectLanguageFromCommand(lower);
        if ((lower.includes('switch to') || lower.includes('change to') || lower.includes('speak in')) && detectedLang) {
            onLanguageChangeRef.current?.(detectedLang);
            return `Switching to ${detectedLang} language, sir. Language systems updated.`;
        }

        // Mode switching
        if (lower.includes('switch to professional') || lower.includes('professional mode')) {
            onModeChangeRef.current?.('professional');
            return "Switching to Professional mode. Formal protocols engaged, sir.";
        }
        if (lower.includes('switch to personal') || lower.includes('personal mode')) {
            onModeChangeRef.current?.('personal');
            return "Switching to Personal mode. Casual interaction protocols activated.";
        }

        // Greetings
        if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
            const hour = new Date().getHours();
            const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
            return `${greeting}, ${usernameRef.current}. All systems are online and ready. How may I assist you today?`;
        }

        // Time
        if (lower.includes('what time') || lower.includes('current time')) {
            return `The current time is ${new Date().toLocaleTimeString()}, sir.`;
        }

        // Date
        if (lower.includes('what date') || lower.includes("today's date") || lower.includes('what day')) {
            return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}, sir.`;
        }

        // Status
        if (lower.includes('how are you') || lower.includes('status')) {
            return `All systems operational, ${usernameRef.current}. Running at peak efficiency. How can I be of service?`;
        }

        // Memory
        if (lower.includes('remember') || lower.includes("don't forget")) {
            const memoryNote = userInput.replace(/remember|don't forget/gi, '').trim();
            onSaveEntryRef.current?.(`User note: ${memoryNote}`);
            return `Noted and saved to memory, sir. I'll remember that ${memoryNote}.`;
        }

        // Default
        if (modeRef.current === 'professional') {
            return `I understand your request regarding "${userInput}". I'm processing the information and will provide a comprehensive response. Please note that as a browser-based assistant, my capabilities are optimized for voice interaction, information retrieval, and system controls.`;
        } else {
            return `Got it! You said: "${userInput}". I'm here to help you with anything you need. Try asking me to search Wikipedia, control volume, brightness, or switch languages!`;
        }
    }, []);

    // ── Core recognition engine ──────────────────────────────────────────────

    const destroyRecognition = useCallback(() => {
        if (recognitionRef.current) {
            try { recognitionRef.current.abort(); } catch { /* ignore */ }
            recognitionRef.current = null;
        }
        isStartingRef.current = false;
    }, []);

    /**
     * Start wake-word listening mode.
     * Creates a continuous recognition instance that listens for the wake word.
     */
    const startWakeWordMode = useCallback(() => {
        if (!isSupported || !mountedRef.current) return;
        if (isStartingRef.current) return;

        clearTimer();
        destroyRecognition();

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = 'en-US';
        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isStartingRef.current = false;
            if (mountedRef.current &&
                stateRef.current !== 'listening' &&
                stateRef.current !== 'processing' &&
                stateRef.current !== 'speaking') {
                setStateSync('wake-listening');
            }
        };

        recognition.onresult = (event: ISpeechRecognitionEvent) => {
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    const text = result[0].transcript.toLowerCase().trim();
                    const wake = wakeWordRef.current.toLowerCase();
                    if (text.includes(wake)) {
                        startCommandMode();
                        return;
                    }
                }
            }
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
            isStartingRef.current = false;
            // Non-fatal errors: let onend handle restart
            if (event.error === 'no-speech' || event.error === 'aborted') return;
        };

        recognition.onend = () => {
            isStartingRef.current = false;
            recognitionRef.current = null;

            // Auto-restart wake word listening unless we moved to another state
            if (mountedRef.current &&
                stateRef.current !== 'listening' &&
                stateRef.current !== 'processing' &&
                stateRef.current !== 'speaking') {
                clearTimer();
                restartTimerRef.current = setTimeout(() => {
                    if (mountedRef.current &&
                        stateRef.current !== 'listening' &&
                        stateRef.current !== 'processing' &&
                        stateRef.current !== 'speaking') {
                        startWakeWordMode();
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
            recognitionRef.current = null;
            clearTimer();
            restartTimerRef.current = setTimeout(() => {
                if (mountedRef.current) startWakeWordMode();
            }, 1000);
        }
    }, [isSupported, clearTimer, destroyRecognition, setStateSync]);

    /**
     * Start command listening mode.
     * Creates a non-continuous recognition instance that captures one command.
     */
    const startCommandMode = useCallback(() => {
        if (!isSupported || !mountedRef.current) return;

        clearTimer();
        destroyRecognition();
        cancelSpeech();

        setStateSync('listening');
        if (mountedRef.current) setInterimTranscript('');

        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognitionAPI();
        recognition.lang = langCodeRef.current;
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        let commandCaptured = false;

        recognition.onstart = () => {
            isStartingRef.current = false;
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

            if (interimText && mountedRef.current) {
                setInterimTranscript(interimText);
            }

            if (finalText && !commandCaptured) {
                commandCaptured = true;
                if (mountedRef.current) setInterimTranscript('');
                try { recognition.stop(); } catch { /* ignore */ }
                processCommand(finalText.trim());
            }
        };

        recognition.onerror = (event: ISpeechRecognitionErrorEvent) => {
            isStartingRef.current = false;
            if (event.error === 'no-speech') {
                if (!commandCaptured && mountedRef.current) {
                    if (mountedRef.current) setInterimTranscript('');
                    setStateSync('wake-listening');
                    clearTimer();
                    restartTimerRef.current = setTimeout(() => {
                        if (mountedRef.current) startWakeWordMode();
                    }, 500);
                }
            }
        };

        recognition.onend = () => {
            isStartingRef.current = false;
            recognitionRef.current = null;
            if (mountedRef.current) setInterimTranscript('');

            if (!commandCaptured && mountedRef.current &&
                stateRef.current !== 'processing' &&
                stateRef.current !== 'speaking') {
                setStateSync('wake-listening');
                clearTimer();
                restartTimerRef.current = setTimeout(() => {
                    if (mountedRef.current) startWakeWordMode();
                }, 500);
            }
        };

        recognitionRef.current = recognition;
        isStartingRef.current = true;

        try {
            recognition.start();
        } catch {
            isStartingRef.current = false;
            recognitionRef.current = null;
            setStateSync('wake-listening');
            clearTimer();
            restartTimerRef.current = setTimeout(() => {
                if (mountedRef.current) startWakeWordMode();
            }, 1000);
        }
    }, [isSupported, clearTimer, destroyRecognition, cancelSpeech, setStateSync, startWakeWordMode]);

    /**
     * Process a captured voice command, speak the response, then return to wake word mode.
     */
    const processCommand = useCallback(async (text: string) => {
        if (!text || processingRef.current || !mountedRef.current) return;
        processingRef.current = true;

        addToLog('user', text);
        setStateSync('processing');

        try {
            const response = await generateResponse(text);
            if (!mountedRef.current) return;

            addToLog('assistant', response);
            onSaveEntryRef.current?.(`User: ${text} | JARVIS: ${response}`);

            setStateSync('speaking');
            speak(response, langCodeRef.current);
        } catch {
            if (!mountedRef.current) return;
            const errMsg = "I encountered an error processing your request, sir.";
            addToLog('assistant', errMsg);
            speak(errMsg, langCodeRef.current);
            setStateSync('speaking');
        } finally {
            processingRef.current = false;
        }
    }, [addToLog, generateResponse, speak, setStateSync]);

    // When speaking finishes, return to wake word listening
    useEffect(() => {
        if (!isSpeaking && assistantState === 'speaking' && mountedRef.current) {
            setStateSync('wake-listening');
            clearTimer();
            restartTimerRef.current = setTimeout(() => {
                if (mountedRef.current) startWakeWordMode();
            }, 300);
        }
    }, [isSpeaking, assistantState, setStateSync, clearTimer, startWakeWordMode]);

    // Auto-start wake word listening on mount
    useEffect(() => {
        mountedRef.current = true;

        if (isSupported) {
            const initTimer = setTimeout(() => {
                if (mountedRef.current) {
                    startWakeWordMode();
                }
            }, 500);
            return () => {
                clearTimeout(initTimer);
            };
        }
    }, [isSupported, startWakeWordMode]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            mountedRef.current = false;
            clearTimer();
            destroyRecognition();
            cancelSpeech();
        };
    }, [clearTimer, destroyRecognition, cancelSpeech]);

    // ── Public API ───────────────────────────────────────────────────────────

    const manualStartListening = useCallback(() => {
        cancelSpeech();
        startCommandMode();
    }, [cancelSpeech, startCommandMode]);

    const manualStopListening = useCallback(() => {
        clearTimer();
        destroyRecognition();
        setStateSync('wake-listening');
        restartTimerRef.current = setTimeout(() => {
            if (mountedRef.current) startWakeWordMode();
        }, 500);
    }, [clearTimer, destroyRecognition, setStateSync, startWakeWordMode]);

    const startWakeWordListening = useCallback(() => {
        startWakeWordMode();
    }, [startWakeWordMode]);

    const stopWakeWordListening = useCallback(() => {
        clearTimer();
        destroyRecognition();
        setStateSync('idle');
    }, [clearTimer, destroyRecognition, setStateSync]);

    const clearLog = useCallback(() => {
        setConversationLog([]);
    }, []);

    // Suppress unused variable warning for conversationMemory (kept for API compatibility)
    void conversationMemory;

    return {
        assistantState,
        conversationLog,
        isListening: assistantState === 'listening',
        interimTranscript,
        isSpeaking,
        isWakeWordActive: assistantState === 'wake-listening',
        startListening: manualStartListening,
        stopListening: manualStopListening,
        startWakeWordListening,
        stopWakeWordListening,
        clearLog,
        isSupported,
    };
}
