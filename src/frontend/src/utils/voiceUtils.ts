/**
 * Shared voice utilities for consistent voice selection across the app
 */

/**
 * Get the best available TTS voice - prefers natural-sounding male voices.
 * Returns null if no voices are available yet.
 */
export function getBestVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // Priority order: Google UK English Male → Microsoft David → Daniel → Alex → any Google English → any male
  const priorities = [
    (v: SpeechSynthesisVoice) => v.name === 'Google UK English Male',
    (v: SpeechSynthesisVoice) => v.name === 'Microsoft David Desktop - English (United States)',
    (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('david'),
    (v: SpeechSynthesisVoice) => v.name === 'Daniel',
    (v: SpeechSynthesisVoice) => v.name === 'Alex',
    (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('google') && v.lang.startsWith('en') && v.name.toLowerCase().includes('male'),
    (v: SpeechSynthesisVoice) => v.name.toLowerCase().includes('google') && v.lang.startsWith('en'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && v.name.toLowerCase().includes('male'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en') && !v.name.toLowerCase().includes('female'),
    (v: SpeechSynthesisVoice) => v.lang.startsWith('en'),
  ];

  for (const matcher of priorities) {
    const found = voices.find(matcher);
    if (found) return found;
  }

  return voices[0] || null;
}

/**
 * Returns a promise that resolves with the best available voice.
 * Waits for voices to load if they aren't ready yet.
 */
export function loadBestVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      resolve(getBestVoice(voices));
      return;
    }

    // Voices not loaded yet — wait for event
    let resolved = false;
    const handler = () => {
      if (resolved) return;
      resolved = true;
      window.speechSynthesis.onvoiceschanged = null;
      resolve(getBestVoice(window.speechSynthesis.getVoices()));
    };

    window.speechSynthesis.onvoiceschanged = handler;

    // Fallback timeout in case onvoiceschanged never fires (some browsers)
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        window.speechSynthesis.onvoiceschanged = null;
        resolve(getBestVoice(window.speechSynthesis.getVoices()));
      }
    }, 1000);
  });
}

/**
 * Speak text using the best available voice.
 * Handles async voice loading automatically.
 */
export async function speakWithBestVoice(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onStart?: () => void;
    onEnd?: () => void;
  } = {}
): Promise<void> {
  if (!('speechSynthesis' in window) || !text.trim()) return;

  window.speechSynthesis.cancel();

  const voice = await loadBestVoice();

  // Small delay after cancel to avoid Chrome TTS bug
  await new Promise(r => setTimeout(r, 100));

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = options.rate ?? 0.92;
  utterance.pitch = options.pitch ?? 0.8;
  utterance.volume = options.volume ?? 1;
  utterance.lang = 'en-US';

  if (voice) utterance.voice = voice;

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  utterance.onerror = () => { options.onEnd?.(); };

  window.speechSynthesis.speak(utterance);
}
