# Specification

## Summary
**Goal:** Fix the broken voice interaction system and implement fully autonomous hands-free background operation for the JARVIS Assistant dashboard.

**Planned changes:**
- Fix Web Speech API (SpeechRecognition) initialization so it starts correctly on page load without any user interaction
- Automatically request microphone permission on dashboard load
- Start continuous wake word listening immediately after permission is granted
- Implement automatic restart of speech recognition within 1 second after any error, stop, or timeout
- Ensure the full voice interaction loop (wake word → listen → process → respond → return to listening) cycles automatically with no manual input
- Voice commands alone (no UI clicks) must trigger all supported actions: open URL, volume up/down, brightness up/down, scroll up/down, Wikipedia search
- Keep WaveformVisualizer and StatusIndicator in sync with real-time states (wake-listening, listening, processing, speaking)

**User-visible outcome:** The assistant starts listening for the wake word automatically when the dashboard loads, processes voice commands hands-free, responds with synthesized speech, and continuously returns to listening — all without any clicks or touch input from the user.
