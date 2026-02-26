# JARVIS AI Assistant

## Current State
A voice-activated AI assistant with: login/register, transition screen with voice greeting, dashboard with arc reactor UI, wake word detection, voice commands, PC controls panel, mentor card (Rengoku), conversation log, multi-language support, memory stored per user on backend.

## Requested Changes (Diff)

### Add
- Robust voice loading: wait for voices to load before selecting, pick the best available deep male voice (Google UK English Male, Microsoft David, Daniel, Alex, etc.)
- A `getBestVoice()` utility used consistently across TransitionScreen AND useVoiceAssistant
- Expanded command recognition: more flexible regex patterns to catch variations (e.g. "open youtube", "play youtube", "go to youtube", "launch youtube")
- Google search fallback: if command is not recognized, open Google search with the query
- Character-accurate Rengoku quotes in MentorCard that sound like the actual movie character
- Language code mapping fix: pass actual BCP-47 lang code to SpeechRecognition when language changes

### Modify
- `TransitionScreen.tsx`: Use proper async voice loading with promise-based approach; don't navigate until greeting actually starts speaking (or 500ms after voices load)
- `useVoiceAssistant.ts`: 
  - Fix `speak()` to load voices properly with voiceschanged event
  - Fix language passed to SpeechRecognition (use getLanguageCode() properly)
  - Broaden wake word detection: match partial words and common mishearings
  - Make command processing smarter: strip punctuation, handle "hey jarvis", "ok jarvis"
  - For unrecognized commands: do a Google search instead of saying "I didn't understand"
  - Add more command patterns: "play [site]", "launch [app]", "go to [site]", "show me [topic]"
- `MentorCard.tsx`: Replace generic quotes with Rengoku-accurate dialogue matching his passionate, fire-breathing, "SET YOUR HEART ABLAZE" personality

### Remove
- Nothing removed

## Implementation Plan
1. Create `src/frontend/src/utils/voiceUtils.ts` - shared getBestVoice() and getLanguageCode() utilities
2. Update `useVoiceAssistant.ts` - fix speak(), broaden command patterns, Google fallback for unknowns
3. Update `TransitionScreen.tsx` - fix voice loading with proper async approach
4. Update `MentorCard.tsx` - add authentic Rengoku quotes and dialogue
5. Validate build passes

## UX Notes
- Voice MUST start speaking within 1 second of the transition screen finishing boot sequence
- Wake word detection should be forgiving: "Jarvis", "hey Jarvis", "ok Jarvis", "hey jarvis" all work
- Unknown commands should open Google search: user says "what is quantum physics" → opens Google search for that query
- Mentor Rengoku should say things like "BECOME THE FLAME! YOUR TRAINING DEMANDS NOTHING LESS!" in his passionate style
