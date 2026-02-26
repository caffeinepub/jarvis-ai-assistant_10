import { useEffect, useRef, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerUserProfile } from '../hooks/useQueries';

const BOOT_LINES = [
  'INITIALIZING JARVIS CORE SYSTEMS...',
  'LOADING NEURAL INTERFACE...',
  'CALIBRATING VOICE RECOGNITION...',
  'ESTABLISHING SECURE CONNECTION...',
  'SYNCING USER PROFILE...',
  'ALL SYSTEMS NOMINAL.',
];

function getTimeGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export default function TransitionScreen() {
  const navigate = useNavigate();
  const { data: userProfile } = useGetCallerUserProfile();
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentChar, setCurrentChar] = useState(0);
  const [done, setDone] = useState(false);
  const greetingSpokenRef = useRef(false);

  // Typewriter effect
  useEffect(() => {
    if (currentLine >= BOOT_LINES.length) {
      setDone(true);
      return;
    }
    const line = BOOT_LINES[currentLine];
    if (currentChar < line.length) {
      const t = setTimeout(() => setCurrentChar(c => c + 1), 28);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => {
        setDisplayedLines(prev => [...prev, line]);
        setCurrentLine(l => l + 1);
        setCurrentChar(0);
      }, 180);
      return () => clearTimeout(t);
    }
  }, [currentLine, currentChar]);

  // Speak greeting and navigate after boot sequence
  useEffect(() => {
    if (!done) return;
    if (greetingSpokenRef.current) return;
    greetingSpokenRef.current = true;

    const username = userProfile?.username || 'Master';
    const timeGreeting = getTimeGreeting();
    const greetingText = `${timeGreeting}. Welcome back, Master ${username}. All systems are online and ready.`;

    // Speak the greeting
    const speakGreeting = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(greetingText);
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 1;
        // Try to find a deep/male voice
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v =>
          v.name.toLowerCase().includes('male') ||
          v.name.toLowerCase().includes('david') ||
          v.name.toLowerCase().includes('daniel') ||
          v.name.toLowerCase().includes('alex')
        );
        if (preferredVoice) utterance.voice = preferredVoice;
        window.speechSynthesis.speak(utterance);
      }
    };

    // Voices may not be loaded yet
    if (window.speechSynthesis.getVoices().length > 0) {
      speakGreeting();
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        speakGreeting();
        window.speechSynthesis.onvoiceschanged = null;
      };
      // Fallback if onvoiceschanged never fires
      setTimeout(speakGreeting, 500);
    }

    const navTimer = setTimeout(() => {
      navigate({ to: '/dashboard' });
    }, 3200);

    return () => clearTimeout(navTimer);
  }, [done, userProfile, navigate]);

  const username = userProfile?.username || 'User';
  const timeGreeting = getTimeGreeting();

  return (
    <div className="min-h-screen bg-jarvis-bg flex flex-col items-center justify-center relative overflow-hidden">
      {/* HUD rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-96 h-96 rounded-full border border-jarvis-cyan/10 animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute w-72 h-72 rounded-full border border-jarvis-cyan/15 animate-spin" style={{ animationDuration: '15s', animationDirection: 'reverse' }} />
        <div className="absolute w-48 h-48 rounded-full border border-jarvis-cyan/20 animate-spin" style={{ animationDuration: '10s' }} />
      </div>

      {/* Arc reactor logo */}
      <div className="relative mb-8 z-10">
        <div className="w-24 h-24 rounded-full border-2 border-jarvis-cyan flex items-center justify-center shadow-[0_0_40px_rgba(0,229,255,0.5)]">
          <div className="w-16 h-16 rounded-full border border-jarvis-cyan/60 flex items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-jarvis-cyan/20 border border-jarvis-cyan animate-pulse" />
          </div>
        </div>
      </div>

      {/* Boot text */}
      <div className="z-10 font-mono text-sm w-full max-w-lg px-8 mb-8">
        {displayedLines.map((line, i) => (
          <div key={i} className="text-jarvis-cyan/70 mb-1">
            <span className="text-jarvis-cyan/40 mr-2">&gt;</span>{line}
          </div>
        ))}
        {currentLine < BOOT_LINES.length && (
          <div className="text-jarvis-cyan mb-1">
            <span className="text-jarvis-cyan/40 mr-2">&gt;</span>
            {BOOT_LINES[currentLine].slice(0, currentChar)}
            <span className="animate-pulse">█</span>
          </div>
        )}
      </div>

      {/* Greeting */}
      {done && (
        <div className="z-10 text-center animate-fade-in">
          <p className="text-jarvis-cyan/60 text-sm font-mono mb-1">{timeGreeting}</p>
          <h1 className="text-3xl font-bold text-jarvis-cyan tracking-widest">
            WELCOME BACK, MASTER {username.toUpperCase()}
          </h1>
          <p className="text-jarvis-cyan/50 text-xs font-mono mt-2 animate-pulse">
            INITIALIZING DASHBOARD...
          </p>
        </div>
      )}
    </div>
  );
}
