# Specification

## Summary
**Goal:** Fix four broken features in the JARVIS Assistant: voice greeting after login, voice command execution, mentor character authentic dialogue, and PC-level control for volume/brightness.

**Planned changes:**
- After login transition completes, automatically speak "Good [Morning/Afternoon/Evening], Welcome back, Master [username]" using SpeechSynthesis API — no user interaction required
- Rewrite `useVoiceAssistant.ts` command parser to properly identify and execute intents (open YouTube/URLs, volume up/down, brightness up/down, scroll, Wikipedia search) instead of echoing back the transcript with "Got it! You said: ..."
- Handle Telugu-script wake word + command combinations (e.g., "జార్విస్ ఓపెన్ youtube") so they correctly map to the intended action
- After executing a command, speak a contextual confirmation (e.g., "Opening YouTube now, sir.") and return to wake-word listening
- Rewrite `mentorMessages.ts` and `MentorCard.tsx` so Rengoku speaks using authentic Demon Slayer catchphrases and speech style (e.g., "SET YOUR HEART ABLAZE!"), and extend authentic in-character dialogue for Naruto and Tony Stark
- Update `usePCControls.ts` and `PCControlsPanel.tsx` to use Web Audio API GainNode for volume control and `window.screen.brightness` API for brightness (falling back to CSS overlay only if unavailable)
- Label each PC control in the UI as "OS Level" or "App Overlay" so the user knows which controls are truly system-level
- Ensure opening URLs via voice uses `window.open(url, '_blank')` to open in the real OS browser

**User-visible outcome:** After login the assistant greets the user by voice automatically; saying "open YouTube" or Telugu-equivalent commands actually opens YouTube in the browser; mentor characters speak in their authentic movie/anime voices; and volume/brightness controls operate at the OS level where supported, with clear UI labels indicating the control mode.
