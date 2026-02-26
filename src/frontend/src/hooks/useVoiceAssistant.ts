import { useState, useEffect, useRef, useCallback } from 'react';
import type { ISpeechRecognition, ISpeechRecognitionEvent } from '../types/speechRecognition';
import { speakWithBestVoice } from '../utils/voiceUtils';
import { getLanguageCode } from '../utils/languageMaps';

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
  'chat gpt': 'https://chat.openai.com',
  chatgpt: 'https://chat.openai.com',
  openai: 'https://chat.openai.com',
  x: 'https://www.twitter.com',
  tiktok: 'https://www.tiktok.com',
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
  // Remove punctuation
  normalized = normalized.replace(/[.,!?;:'"]/g, '');
  for (const [telugu, english] of Object.entries(TELUGU_COMMAND_MAP)) {
    normalized = normalized.replace(new RegExp(telugu, 'g'), english);
  }
  return normalized;
}

function stripWakeWord(text: string, wakeWord: string): string {
  const ww = wakeWord.toLowerCase().replace(/[.,!?;:'"]/g, '');
  // Strip common prefixes: "hey jarvis", "ok jarvis", "okay jarvis", just "jarvis"
  const prefixes = [
    `hey ${ww}`, `ok ${ww}`, `okay ${ww}`, `yo ${ww}`, `hello ${ww}`, `hi ${ww}`,
    `hey jarvis`, `ok jarvis`, `okay jarvis`, `jarvis`,
    ww,
  ];
  let result = text.trim();
  for (const prefix of prefixes) {
    if (result.startsWith(prefix)) {
      result = result.slice(prefix.length).trim();
      // Remove leading comma/punctuation after wake word
      result = result.replace(/^[,\s]+/, '').trim();
      break;
    }
  }
  return result;
}

function containsWakeWord(text: string, wakeWord: string): boolean {
  const normalized = text.toLowerCase().replace(/[.,!?;:'"]/g, '');
  const ww = wakeWord.toLowerCase().replace(/[.,!?;:'"]/g, '');
  return (
    normalized.includes(ww) ||
    normalized.includes('jarvis') ||
    normalized.includes('hey jarvis') ||
    normalized.includes('ok jarvis') ||
    normalized.includes('okay jarvis') ||
    // Handle speech recognition mishearings
    normalized.includes('jar vis') ||
    normalized.includes('jarvas') ||
    normalized.includes('jar boss') ||
    normalized.includes('jarves')
  );
}

export function useVoiceAssistant({
  wakeWord = 'Jarvis',
  language = 'English',
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

  // Resolve language name to BCP-47 code for speech recognition
  const langCode = getLanguageCode(language);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isAwakeRef = useRef(false);
  const isWakeWordActiveRef = useRef(true);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mountedRef = useRef(true);
  // Keep latest langCode in a ref so recognition always uses current language
  const langCodeRef = useRef(langCode);

  // Keep refs in sync
  useEffect(() => { isWakeWordActiveRef.current = isWakeWordActive; }, [isWakeWordActive]);
  useEffect(() => { langCodeRef.current = langCode; }, [langCode]);

  // Initialize Web Audio API for in-app volume control (run once on mount)
  const initialVolume = useRef(volume);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.value = initialVolume.current / 100;
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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const speak = useCallback((text: string) => {
    if (mountedRef.current) setAssistantState('speaking');
    speakWithBestVoice(text, {
      rate: 0.92,
      pitch: 0.8,
      volume: 1,
      onStart: () => { if (mountedRef.current) setAssistantState('speaking'); },
      onEnd: () => {
        if (mountedRef.current) {
          setAssistantState('wake-listening');
        }
      },
    });
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
    const key = siteName.toLowerCase().trim().replace(/[.,!?]/g, '');
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

    // ── OPEN / LAUNCH / PLAY / GO TO command ─────────────────────────────────
    const openMatch = command.match(/^(?:open|launch|play|go to|navigate to|take me to|show me|start|load)\s+(.+)$/i);
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
    if (/volume\s*(up|increase|louder|raise|higher|more)/i.test(command) || /increase\s*(?:the\s*)?volume/i.test(command) || /turn\s*(?:the\s*)?volume\s*up/i.test(command)) {
      if (pcControls?.volumeUp) pcControls.volumeUp(); else adjustVolume('up');
      response = `Volume increased, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── VOLUME DOWN ───────────────────────────────────────────────────────────
    if (/volume\s*(down|decrease|lower|reduce|quiet|less|mute)/i.test(command) || /decrease\s*(?:the\s*)?volume/i.test(command) || /turn\s*(?:the\s*)?volume\s*down/i.test(command)) {
      if (pcControls?.volumeDown) pcControls.volumeDown(); else adjustVolume('down');
      response = `Volume decreased, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── BRIGHTNESS UP ─────────────────────────────────────────────────────────
    if (/brightness\s*(up|increase|higher|raise|more)/i.test(command) || /increase\s*(?:the\s*)?brightness/i.test(command) || /screen\s*brighter/i.test(command)) {
      if (pcControls?.brightnessUp) pcControls.brightnessUp(); else adjustBrightness('up');
      response = `Brightness increased, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── BRIGHTNESS DOWN ───────────────────────────────────────────────────────
    if (/brightness\s*(down|decrease|lower|reduce|dim|less)/i.test(command) || /decrease\s*(?:the\s*)?brightness/i.test(command) || /screen\s*dimmer/i.test(command)) {
      if (pcControls?.brightnessDown) pcControls.brightnessDown(); else adjustBrightness('down');
      response = `Brightness reduced, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── SCROLL UP ─────────────────────────────────────────────────────────────
    if (/scroll\s*(up|top)/i.test(command) || /go\s*(?:to\s*)?(?:the\s*)?top/i.test(command)) {
      if (pcControls?.scrollUp) pcControls.scrollUp(); else window.scrollBy({ top: -400, behavior: 'smooth' });
      response = `Scrolling up, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── SCROLL DOWN ───────────────────────────────────────────────────────────
    if (/scroll\s*(down|bottom)/i.test(command) || /go\s*(?:to\s*)?(?:the\s*)?bottom/i.test(command)) {
      if (pcControls?.scrollDown) pcControls.scrollDown(); else window.scrollBy({ top: 400, behavior: 'smooth' });
      response = `Scrolling down, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── WIKIPEDIA / SEARCH ────────────────────────────────────────────────────
    const wikiMatch = command.match(/(?:search wikipedia|wikipedia|look up on wikipedia)\s+(?:for\s+)?(.+)/i);
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

    // ── GOOGLE SEARCH ─────────────────────────────────────────────────────────
    const searchMatch = command.match(/^(?:search|search for|google|google for|find|look up|lookup)\s+(.+)$/i);
    if (searchMatch) {
      const query = searchMatch[1].trim();
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_blank');
      response = `Searching Google for ${query}, sir.`;
      addToLog('jarvis', response);
      if (onSaveEntry) onSaveEntry(`JARVIS: ${response}`);
      speak(response);
      return;
    }

    // ── REMEMBER / NOTE ───────────────────────────────────────────────────────
    const rememberMatch = command.match(/(?:remember|note|save|record|keep in mind)\s+(?:that\s+)?(.+)/i);
    if (rememberMatch) {
      const note = rememberMatch[1].trim();
      if (onSaveEntry) onSaveEntry(`Note: ${note}`);
      response = `Noted, sir. I will remember that.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── LANGUAGE SWITCH ───────────────────────────────────────────────────────
    if (/switch to|change to|speak in|change language to|set language/i.test(command)) {
      const langMatch = command.match(/(?:switch to|change to|speak in|change language to|set language(?:\s*to)?)\s+(.+)/i);
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
    if (/professional mode|switch to professional|be professional|formal mode/i.test(command)) {
      if (onModeChange) onModeChange('professional');
      response = `Switching to Professional mode. Formal protocols engaged, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }
    if (/personal mode|switch to personal|be casual|casual mode|informal mode/i.test(command)) {
      if (onModeChange) onModeChange('personal');
      response = `Switching to Personal mode. Casual interaction protocols activated.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── TIME ──────────────────────────────────────────────────────────────────
    if (/what(?:'s| is)(?: the)? time|current time|time now|tell me the time/i.test(command)) {
      const now = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      response = `The current time is ${now}, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── DATE ──────────────────────────────────────────────────────────────────
    if (/what(?:'s| is)(?: the)? date|today(?:'s)? date|current date|what day is it/i.test(command)) {
      const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      response = `Today is ${today}, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── WEATHER ───────────────────────────────────────────────────────────────
    if (/weather|temperature|forecast/i.test(command)) {
      const searchUrl = 'https://www.google.com/search?q=weather+today';
      window.open(searchUrl, '_blank');
      response = `Opening weather information for you, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── NEWS ──────────────────────────────────────────────────────────────────
    if (/(?:latest\s+)?news|headlines/i.test(command)) {
      window.open('https://news.google.com', '_blank');
      response = `Opening the latest news, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── HELLO / GREETING ──────────────────────────────────────────────────────
    if (/^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i.test(command) || command.trim() === '') {
      const hour = new Date().getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      response = `${greeting}, ${username}. All systems are online and ready to assist you.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── STATUS ────────────────────────────────────────────────────────────────
    if (/how are you|status|system status|are you there|you there/i.test(command)) {
      response = `All systems operational, ${username}. Running at peak efficiency. How can I be of service?`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── WHO ARE YOU ───────────────────────────────────────────────────────────
    if (/who are you|what are you|introduce yourself|your name/i.test(command)) {
      response = `I am JARVIS, Just A Rather Very Intelligent System. I am your personal AI assistant, ${username}. I can open websites, search the web, control your display, and help you with information.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── STOP / CANCEL ─────────────────────────────────────────────────────────
    if (/^(stop|cancel|quiet|silence|shut up|nevermind|never mind)/i.test(command)) {
      window.speechSynthesis?.cancel();
      response = `Understood, sir.`;
      addToLog('jarvis', response);
      speak(response);
      return;
    }

    // ── WHAT / HOW questions → Google search fallback ─────────────────────────
    const questionMatch = command.match(/^(?:what|how|why|when|where|who|which|tell me about|explain|define|what is|what are|how to|how do)\s+(.+)$/i);
    if (questionMatch) {
      const query = questionMatch[0].trim();
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(searchUrl, '_blank');
      response = `Let me search that for you, sir.`;
      addToLog('jarvis', response);
      if (onSaveEntry) onSaveEntry(`JARVIS: ${response}`);
      speak(response);
      return;
    }

    // ── DEFAULT → Google search ───────────────────────────────────────────────
    if (command.trim().length > 2) {
      // Try Google search for anything we don't understand
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(command)}`;
      window.open(searchUrl, '_blank');
      response = `I've searched Google for that, sir.`;
      addToLog('jarvis', response);
      if (onSaveEntry) onSaveEntry(`JARVIS: ${response}`);
      speak(response);
    } else {
      response = `I'm here, sir. How can I assist you?`;
      addToLog('jarvis', response);
      speak(response);
    }
  }, [wakeWord, username, addToLog, speak, adjustVolume, adjustBrightness, openUrl, searchWikipedia, onSaveEntry, onLanguageChange, onModeChange, pcControls]);

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
    recognition.lang = langCodeRef.current;
    recognition.maxAlternatives = 3;
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
        }, 300);
      } else {
        setAssistantState('idle');
      }
    };

    recognition.onerror = (event: any) => {
      if (!mountedRef.current) return;
      // 'no-speech' and 'aborted' are normal — just restart
      const err = event?.error || '';
      if (err === 'no-speech' || err === 'aborted') {
        // Will restart via onend
        return;
      }
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
          // Pick best alternative
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

        if (!isAwakeRef.current) {
          // Check for wake word
          if (containsWakeWord(normalized, wakeWord)) {
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
  }, [isSupported, wakeWord, speak, addToLog, processCommand, stopRecognition]);

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

  // Store latest callbacks in refs to avoid stale closures in mount effect
  const startListeningRef = useRef(startListening);
  const stopRecognitionRef = useRef(stopRecognition);
  useEffect(() => { startListeningRef.current = startListening; }, [startListening]);
  useEffect(() => { stopRecognitionRef.current = stopRecognition; }, [stopRecognition]);

  // Auto-start on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (mountedRef.current) startListeningRef.current();
    }, 1000);
    return () => {
      clearTimeout(timer);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
      stopRecognitionRef.current();
    };
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
