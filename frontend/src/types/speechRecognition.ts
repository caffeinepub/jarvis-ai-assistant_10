// Shared Web Speech API type definitions
// Single source of truth to avoid duplicate declare global conflicts

export interface ISpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
}

export interface ISpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): ISpeechRecognitionAlternative;
    [index: number]: ISpeechRecognitionAlternative;
}

export interface ISpeechRecognitionResultList {
    readonly length: number;
    item(index: number): ISpeechRecognitionResult;
    [index: number]: ISpeechRecognitionResult;
}

export interface ISpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: ISpeechRecognitionResultList;
}

export interface ISpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
}

export interface ISpeechRecognition extends EventTarget {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    start(): void;
    stop(): void;
    abort(): void;
    onstart: ((ev: Event) => void) | null;
    onend: ((ev: Event) => void) | null;
    onresult: ((ev: ISpeechRecognitionEvent) => void) | null;
    onerror: ((ev: ISpeechRecognitionErrorEvent) => void) | null;
}

export interface ISpeechRecognitionConstructor {
    new(): ISpeechRecognition;
}

// Single global augmentation — only declared once here
declare global {
    interface Window {
        SpeechRecognition: ISpeechRecognitionConstructor;
        webkitSpeechRecognition: ISpeechRecognitionConstructor;
    }
}
