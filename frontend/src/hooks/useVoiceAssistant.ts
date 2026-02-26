import { useState, useEffect, useRef, useCallback } from 'react';
import type { ISpeechRecognition, ISpeechRecognitionEvent } from '../types/speechRecognition';

// Re-export AssistantState so existing components can import it
export type AssistantState = 'idle' | 'wake-listening' | 'listening' | 'processing' | 'speaking';

export interface ConversationEntry {
  id: string;
  role: 'user' | 'jarvis';
  text: string;
  timestamp: Date;
}

interface UseVoiceAssistantOptions {
  wakeWord?: string;
  language?: string;
  mode?: string;
  username?: string;
  conversationMemory?: string[];
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
    openUrl: (url: string) => void;
    searchWikipedia: (query: string) => Promise<void>;
  };
}

// URL mapping for common apps/sites
const URL_MAP: Record<string, string> = {
  youtube: 'https://www.youtube.com',
  google: 'https://www.google.com',
  gmail: 'https://mail.google.com',
  maps: 'https://maps.google.com',
  'google maps': 'https://maps.google.com',
  facebook: 'https://www.facebook.com',
  twitter: 'https://www.twitter.com',
  instagram: 'https://www.instagram.com',
  linkedin: 'https://www.linkedin.com',
  github: 'https://www.github.com',
  netflix: 'https://www.netflix.com',
  spotify: 'https://www.spotify.com',
  amazon: 'https://www.amazon.com',
  reddit: 'https://www.reddit.com',
  wikipedia: 'https://www.wikipedia.org',
  whatsapp: 'https://web.whatsapp.com',
  telegram: 'https://web.telegram.org',
  discord: 'https://discord.com',
  twitch: 'https://www.twitch.tv',
  stackoverflow: 'https://stackoverflow.com',
  'stack overflow': 'https://stackoverflow.com',
};

// Telugu transliteration mappings for common words
const TELUGU_COMMAND_MAP: Record<string, string> = {
  'ఓపెన్': 'open',
  'తెరవు': 'open',
  'వాల్యూమ్': 'volume',
  'వాల్యూమ్ అప్': 'volume up',
  'వాల్యూమ్ డౌన్': 'volume down',
  'బ్రైట్నెస్': 'brightness',
  'స్క్రోల్': 'scroll',
  'సెర్చ్': 'search',
  'యూట్యూబ్': 'youtube',
  'గూగుల్': 'google',
  'జార్విస్': 'jarvis',
};

function normalizeTranscript(text: string): string {
  let normalized = text.toLowerCase().trim();
  for (const [telugu, english] of Object.entries(TELUGU_COMMAND_MAP)) {
    normalized = normalized.replace(new RegExp(telugu, 'g'), english);
  }
  return normalized;
}

function stripWakeWord(text: string, wakeWord: string): string {
  const ww = wakeWord.toLowerCase();
  if (text.startsWith(ww)) return text.slice(ww.length).trim();
  if (text.startsWith('jarvis')) return text.slice('jarvis'.length).trim();
  return text;
}

export function useVoiceAssistant({
  wakeWord = 'Jarvis',
  language = 'en-US',
  mode = 'personal',
  username = 'User',
  conversationMemory: _conversationMemory = [],
  onSaveEntry,
  onLanguageChange,
  onModeChange,
  pcControls,
}: UseVoiceAssistantOptions = {}) {
  const [assistantState, setAssistantState] = useState<AssistantState>('idle');
  const [isListening, setIsListening] = useState(false);
  const [isWakeWordActive, setIsWakeWordActive] = useState(true);
  const [isAwake, setIsAwake] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [conversationLog, setConversationLog] = useState<ConversationEntry[]>([]);
  const [volume, setVolume] = useState(70);
  const [brightness, setBrightness] = useState(100);
  const [searchResult, setSearchResult] = useState<{
    title: string;
    summary: string;
    url: string;
    thumbnail?: string;
  } | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isAwakeRef = useRef(false);
  const isWakeWordActiveRef = useRef(true);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mountedRef = useRef(true);

  // Keep refs in sync
  useEffect(() => { isWakeWordActiveRef.current = isWakeWordActive; }, [isWakeWordActive]);

  // Initialize Web Audio API for volume control
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
      mountedRef.current = false;
      audioCtxRef.current?.close().catch(() => {});
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const speak = useCallback((text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.8;
    utterance.volume = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.toLowerCase().includes('male') ||
      v.name.toLowerCase().includes('david') ||
      v.name.toLowerCase().includes('daniel')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onstart = () => { if (mountedRef.current) setAssistantState('speaking'); };
    utterance.onend = () => {
      if (mountedRef.current) {
        setAssistantState('wake-listening');
      }
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const addToLog = useCallback((role: 'user' | 'jarvis', text: string): ConversationEntry => {
    const entry: ConversationEntry = {
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      role,
      text,
      timestamp: new Date(),
    };
    if (mountedRef.current) {
      setConversationLog(prev => [...prev.slice(-50), entry]);
    }
    return entry;
  }, []);

  const adjustVolume = useCallback((direction: 'up' | 'down') => {
    setVolume(prev => {
      const next = direction === 'up' ? Math.min(100, prev + 10) : Math.max(0, prev - 10);
      if (gainNodeRef.current) {
        if (audioCtxRef.current?.state === 'suspended') audioCtxRef.current.resume();
        gainNodeRef.current.gain.value = next / 100;
      }
      return next;
    });
  }, []);

  const adjustBrightness = useCallback((direction: 'up' | 'down') => {
    setBrightness(prev => {
      const next = direction === 'up' ? Math.min(100, prev + 10) : Math.max(10, prev - 10);
      const overlay = document.getElementById('brightness-overlay') as HTMLElement | null;
      if (overlay) overlay.style.opacity = String(1 - next / 100);
      return next;
    });
  }, []);

  const openUrl = useCallback((siteName: string) => {
    const key = siteName.toLowerCase().trim();
    const url = URL_MAP[key] || (key.includes('.') ? `https://${key}` : `https://www.${key}.com`);
    window.open(url, '_blank');
    return url;
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
      return data.extract as string;
    } catch {
      return null;
    }
  }, []);

  const processCommand = useCallback(async (rawTranscript: string) => {
    const normalized = normalizeTranscript(rawTranscript);
    const command = stripWakeWord(normalized, wakeWord);

    addToLog('user', rawTranscript);
    if (onSaveEntry) onSaveEntry(`User: ${rawTranscript}`);
    setAssistantState('processing');

    let response = '';

    // ── OPEN command ──────────────────────────────────────────────────────────
    const openMatch = command.match(/^open\s+(.+)$/i);
    if (openMatch) {
      const target = openMatch[1].trim();
      if (pcControls?.openUrl) {
        pcControls.openUrl(target);
      } else {
        openUrl(target);
      }
      response = `Opening ${target} now, sir.`;
      addToLog('jarvis', response);
      if (onSaveEntry) onSaveEntry(`JARVIS: ${response}`);
      speak(response);
      return;
    }

    // ── VOLUME UP ─────────────────────────────────────────────────────────────
    if (/volume\s*(up|increase|louder|raise)/i.test(command)) {
      if (pcControls?.volumeUp) pcControls.volumeUp(); else adjustVolume('up');
      response = `Volume increased, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── VOLUME DOWN ───────────────────────────────────────────────────────────
    if (/volume\s*(down|decrease|lower|reduce|quiet)/i.test(command)) {
      if (pcControls?.volumeDown) pcControls.volumeDown(); else adjustVolume('down');
      response = `Volume decreased, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── BRIGHTNESS UP ─────────────────────────────────────────────────────────
    if (/brightness\s*(up|increase|higher|raise)/i.test(command)) {
      if (pcControls?.brightnessUp) pcControls.brightnessUp(); else adjustBrightness('up');
      response = `Brightness increased, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── BRIGHTNESS DOWN ───────────────────────────────────────────────────────
    if (/brightness\s*(down|decrease|lower|reduce|dim)/i.test(command)) {
      if (pcControls?.brightnessDown) pcControls.brightnessDown(); else adjustBrightness('down');
      response = `Brightness reduced, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── SCROLL UP ─────────────────────────────────────────────────────────────
    if (/scroll\s*(up|top)/i.test(command)) {
      if (pcControls?.scrollUp) pcControls.scrollUp(); else window.scrollBy({ top: -300, behavior: 'smooth' });
      response = `Scrolling up, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── SCROLL DOWN ───────────────────────────────────────────────────────────
    if (/scroll\s*(down|bottom)/i.test(command)) {
      if (pcControls?.scrollDown) pcControls.scrollDown(); else window.scrollBy({ top: 300, behavior: 'smooth' });
      response = `Scrolling down, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── WIKIPEDIA SEARCH ──────────────────────────────────────────────────────
    const wikiMatch = command.match(/(?:search|look up|find|wikipedia)\s+(?:for\s+)?(.+)/i);
    if (wikiMatch) {
      const query = wikiMatch[1].trim();
      response = `Searching Wikipedia for ${query}, sir.`;
      addToLog('jarvis', response);
      speak(response);
      const result = await searchWikipedia(query);
      if (result) {
        const summary = (result as string).length > 120 ? (result as string).slice(0, 120) + '...' : result as string;
        const followUp = `Here is what I found: ${summary}`;
        addToLog('jarvis', followUp);
        if (onSaveEntry) onSaveEntry(`JARVIS: ${followUp}`);
      }
      return;
    }

    // ── REMEMBER / NOTE ───────────────────────────────────────────────────────
    const rememberMatch = command.match(/(?:remember|note|save)\s+(?:that\s+)?(.+)/i);
    if (rememberMatch) {
      const note = rememberMatch[1].trim();
      if (onSaveEntry) onSaveEntry(`Note: ${note}`);
      response = `Noted, sir. I will remember that.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── LANGUAGE SWITCH ───────────────────────────────────────────────────────
    if (/switch to|change to|speak in/i.test(command)) {
      const langMatch = command.match(/(?:switch to|change to|speak in)\s+(.+)/i);
      if (langMatch && onLanguageChange) {
        const lang = langMatch[1].trim();
        onLanguageChange(lang);
        response = `Switching to ${lang}, sir.`;
        addToLog('jarvis', response);
        speak(response);
        return;
      }
    }

    // ── MODE SWITCH ───────────────────────────────────────────────────────────
    if (/professional mode|switch to professional/i.test(command)) {
      if (onModeChange) onModeChange('professional');
      response = `Switching to Professional mode. Formal protocols engaged, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }
    if (/personal mode|switch to personal/i.test(command)) {
      if (onModeChange) onModeChange('personal');
      response = `Switching to Personal mode. Casual interaction protocols activated.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── TIME ──────────────────────────────────────────────────────────────────
    if (/what(?:'s| is) the time|current time|time now/i.test(command)) {
      const now = new Date().toLocaleTimeString();
      response = `The current time is ${now}, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── DATE ──────────────────────────────────────────────────────────────────
    if (/what(?:'s| is) the date|today(?:'s)? date|current date/i.test(command)) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      response = `Today is ${today}, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── HELLO ─────────────────────────────────────────────────────────────────
    if (/^(hello|hi|hey|greetings)/i.test(command)) {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      response = `${greeting}, ${username}. All systems are online and ready to assist you.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── STATUS ────────────────────────────────────────────────────────────────
    if (/how are you|status|system status/i.test(command)) {
      response = `All systems operational, ${username}. Running at peak efficiency. How can I be of service?`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── DEFAULT ───────────────────────────────────────────────────────────────
    if (mode === 'professional') {
      response = `Understood, ${username}. I'm processing your request. As a browser-based assistant, I can open websites, control volume and brightness, search Wikipedia, and manage your notes.`;
    } else {
      response = `I'm sorry, sir. I didn't quite catch that. You can ask me to open websites, control volume or brightness, search Wikipedia, or check the time.`;
    }
    addToLog('jarvis', response);
    speak(response);
  }, [wakeWord, username, mode, addToLog, speak, adjustVolume, adjustBrightness, openUrl, searchWikipedia, onSaveEntry, onLanguageChange, onModeChange, pcControls]);

  // ── Recognition engine ────────────────────────────────────────────────────

  const stopRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch { /* ignore */ }
      recognitionRef.current = null;
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported) return;
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) return;

    stopRecognition();
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);

    const recognition = new SpeechRecognitionAPI() as ISpeechRecognition;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      if (!mountedRef.current) return;
      setIsListening(true);
      if (!isAwakeRef.current) {
        setAssistantState('wake-listening');
      } else {
        setAssistantState('listening');
      }
    };

    recognition.onend = () => {
      if (!mountedRef.current) return;
      setIsListening(false);
      setInterimTranscript('');
      recognitionRef.current = null;
      // Auto-restart if wake word mode is active
      if (isWakeWordActiveRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (mountedRef.current && isWakeWordActiveRef.current) {
            startListening();
          }
        }, 400);
      } else {
        setAssistantState('idle');
      }
    };

    recognition.onerror = () => {
      if (!mountedRef.current) return;
      setIsListening(false);
      setInterimTranscript('');
      recognitionRef.current = null;
      if (isWakeWordActiveRef.current) {
        restartTimerRef.current = setTimeout(() => {
          if (mountedRef.current && isWakeWordActiveRef.current) {
            startListening();
          }
        }, 1000);
      } else {
        setAssistantState('idle');
      }
    };

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      let finalText = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interim += result[0].transcript;
        }
      }

      if (interim && mountedRef.current) setInterimTranscript(interim);

      if (finalText) {
        setInterimTranscript('');
        setTranscript(finalText.trim());

        const normalized = normalizeTranscript(finalText);
        const ww = wakeWord.toLowerCase();

        if (!isAwakeRef.current) {
          // Check for wake word
          if (normalized.includes(ww) || normalized.includes('jarvis')) {
            isAwakeRef.current = true;
            setIsAwake(true);

            // Check if command follows wake word in same utterance
            const afterWake = stripWakeWord(normalized, wakeWord).trim();
            if (afterWake.length > 2) {
              // Command in same utterance — process immediately
              processCommand(finalText.trim());
              setTimeout(() => {
                isAwakeRef.current = false;
                setIsAwake(false);
              }, 8000);
            } else {
              // Just wake word — acknowledge and wait for next utterance
              speak('Yes, sir. How can I assist you?');
              addToLog('jarvis', 'Yes, sir. How can I assist you?');
              setTimeout(() => {
                isAwakeRef.current = false;
                setIsAwake(false);
              }, 10000);
            }
          }
        } else {
          // Already awake — process as command
          isAwakeRef.current = false;
          setIsAwake(false);
          processCommand(finalText.trim());
        }
      }
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, [isSupported, language, wakeWord, speak, addToLog, processCommand, stopRecognition]);

  const stopListening = useCallback(() => {
    if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    stopRecognition();
    setIsListening(false);
    setAssistantState('idle');
  }, [stopRecognition]);

  const startWakeWordListening = useCallback(() => {
    setIsWakeWordActive(true);
    isWakeWordActiveRef.current = true;
    startListening();
  }, [startListening]);

  const stopWakeWordListening = useCallback(() => {
    setIsWakeWordActive(false);
    isWakeWordActiveRef.current = false;
    stopListening();
  }, [stopListening]);

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mountedRef.current) startListening();
    }, 1000);
    return () => {
      clearTimeout(timer);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      stopRecognition();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    // State
    assistantState,
    isListening,
    isWakeWordActive,
    isAwake,
    isSupported,
    transcript,
    interimTranscript,
    conversationLog,
    // Compat alias
    conversation: conversationLog,
    volume,
    brightness,
    searchResult,
    setSearchResult,
    // Actions
    speak,
    adjustVolume,
    adjustBrightness,
    openUrl,
    searchWikipedia,
    startListening,
    stopListening,
    startWakeWordListening,
    stopWakeWordListening,
    setVolume,
    setBrightness,
  };
}
