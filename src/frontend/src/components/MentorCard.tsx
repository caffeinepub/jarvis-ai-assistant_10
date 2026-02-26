import { useState, useEffect, useCallback } from 'react';
import { Volume2, RefreshCw, Flame, Zap, Star } from 'lucide-react';
import { getMentorData, getRandomMessage, getRandomGreeting, getRandomChallenge, getDailyTip } from '../utils/mentorMessages';
import { speakWithBestVoice } from '../utils/voiceUtils';

interface MentorCardProps {
  mentorName: string;
}

export default function MentorCard({ mentorName }: MentorCardProps) {
  const mentorData = getMentorData(mentorName);
  const [currentMessage, setCurrentMessage] = useState(() => getDailyTip(mentorName));
  const [isAnimating, setIsAnimating] = useState(false);
  const [mode, setMode] = useState<'tip' | 'greeting' | 'challenge'>('tip');

  const speak = useCallback((text: string) => {
    speakWithBestVoice(text, { rate: 0.95, pitch: 0.85, volume: 1 });
  }, []);

  // Auto-speak greeting on mount
  useEffect(() => {
    const greeting = getRandomGreeting(mentorName);
    const timer = setTimeout(() => {
      speak(greeting);
    }, 2000);
    return () => clearTimeout(timer);
  }, [mentorName, speak]);

  const refreshMessage = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const msg = getRandomMessage(mentorName);
      setCurrentMessage(msg);
      setMode('tip');
      setIsAnimating(false);
      speak(msg.text);
    }, 300);
  }, [mentorName, speak]);

  const showGreeting = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const greeting = getRandomGreeting(mentorName);
      setCurrentMessage({ text: greeting, category: 'greeting' });
      setMode('greeting');
      setIsAnimating(false);
      speak(greeting);
    }, 300);
  }, [mentorName, speak]);

  const showChallenge = useCallback(() => {
    setIsAnimating(true);
    setTimeout(() => {
      const challenge = getRandomChallenge(mentorName);
      setCurrentMessage({ text: challenge, category: 'challenge' });
      setMode('challenge');
      setIsAnimating(false);
      speak(challenge);
    }, 300);
  }, [mentorName, speak]);

  const speakCurrent = useCallback(() => {
    speak(currentMessage.text);
  }, [currentMessage, speak]);

  const mentorColor = mentorData.color;
  const isRengoku = mentorName.toLowerCase().includes('rengoku');
  const isNaruto = mentorName.toLowerCase().includes('naruto');

  return (
    <div
      className="rounded-lg border p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(5,10,15,0.95) 0%, rgba(5,10,15,0.85) 100%)`,
        borderColor: `${mentorColor}40`,
        boxShadow: `0 0 20px ${mentorColor}20`,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${mentorColor}, transparent 70%)` }}
      />

      {/* Header */}
      <div className="flex items-center gap-3 mb-3 relative z-10">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold border-2"
          style={{
            borderColor: mentorColor,
            background: `${mentorColor}20`,
            color: mentorColor,
            boxShadow: `0 0 12px ${mentorColor}40`,
          }}
        >
          {isRengoku ? '🔥' : isNaruto ? '🍥' : '⚙️'}
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ color: mentorColor }}>
            {mentorData.name}
          </h3>
          <p className="text-xs text-gray-500">{mentorData.title}</p>
        </div>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            onClick={speakCurrent}
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            style={{ color: mentorColor }}
            title="Speak message"
          >
            <Volume2 size={14} />
          </button>
          <button
            type="button"
            onClick={refreshMessage}
            className="p-1.5 rounded transition-colors hover:bg-white/10"
            style={{ color: mentorColor }}
            title="New message"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Message */}
      <div
        className={`relative z-10 transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}
      >
        <div
          className="text-sm leading-relaxed font-medium mb-3 p-3 rounded"
          style={{
            color: mode === 'challenge' ? '#ffa726' : mode === 'greeting' ? mentorColor : '#e0e0e0',
            background: `${mentorColor}08`,
            borderLeft: `3px solid ${mentorColor}`,
          }}
        >
          "{currentMessage.text}"
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 relative z-10">
        <button
          type="button"
          onClick={showGreeting}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: `${mentorColor}15`,
            color: mentorColor,
            border: `1px solid ${mentorColor}30`,
          }}
        >
          <Star size={11} />
          Greet
        </button>
        <button
          type="button"
          onClick={refreshMessage}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: `${mentorColor}15`,
            color: mentorColor,
            border: `1px solid ${mentorColor}30`,
          }}
        >
          <Flame size={11} />
          Inspire
        </button>
        <button
          type="button"
          onClick={showChallenge}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 rounded text-xs font-medium transition-all hover:opacity-80"
          style={{
            background: `${mentorColor}15`,
            color: mentorColor,
            border: `1px solid ${mentorColor}30`,
          }}
        >
          <Zap size={11} />
          Challenge
        </button>
      </div>
    </div>
  );
}
