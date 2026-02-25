export interface LanguageOption {
    name: string;
    code: string;
    nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { name: 'English', code: 'en-US', nativeName: 'English' },
    { name: 'Telugu', code: 'te-IN', nativeName: 'తెలుగు' },
    { name: 'Hindi', code: 'hi-IN', nativeName: 'हिन्दी' },
    { name: 'Tamil', code: 'ta-IN', nativeName: 'தமிழ்' },
    { name: 'Kannada', code: 'kn-IN', nativeName: 'ಕನ್ನಡ' },
    { name: 'Malayalam', code: 'ml-IN', nativeName: 'മലയാളം' },
    { name: 'Bengali', code: 'bn-IN', nativeName: 'বাংলা' },
    { name: 'Marathi', code: 'mr-IN', nativeName: 'मराठी' },
    { name: 'Gujarati', code: 'gu-IN', nativeName: 'ગુજરાતી' },
    { name: 'Punjabi', code: 'pa-IN', nativeName: 'ਪੰਜਾਬੀ' },
    { name: 'Spanish', code: 'es-ES', nativeName: 'Español' },
    { name: 'French', code: 'fr-FR', nativeName: 'Français' },
    { name: 'German', code: 'de-DE', nativeName: 'Deutsch' },
    { name: 'Italian', code: 'it-IT', nativeName: 'Italiano' },
    { name: 'Portuguese', code: 'pt-BR', nativeName: 'Português' },
    { name: 'Russian', code: 'ru-RU', nativeName: 'Русский' },
    { name: 'Japanese', code: 'ja-JP', nativeName: '日本語' },
    { name: 'Korean', code: 'ko-KR', nativeName: '한국어' },
    { name: 'Chinese (Simplified)', code: 'zh-CN', nativeName: '中文(简体)' },
    { name: 'Chinese (Traditional)', code: 'zh-TW', nativeName: '中文(繁體)' },
    { name: 'Arabic', code: 'ar-SA', nativeName: 'العربية' },
    { name: 'Turkish', code: 'tr-TR', nativeName: 'Türkçe' },
    { name: 'Dutch', code: 'nl-NL', nativeName: 'Nederlands' },
    { name: 'Polish', code: 'pl-PL', nativeName: 'Polski' },
    { name: 'Swedish', code: 'sv-SE', nativeName: 'Svenska' },
    { name: 'Norwegian', code: 'nb-NO', nativeName: 'Norsk' },
    { name: 'Danish', code: 'da-DK', nativeName: 'Dansk' },
    { name: 'Finnish', code: 'fi-FI', nativeName: 'Suomi' },
    { name: 'Greek', code: 'el-GR', nativeName: 'Ελληνικά' },
    { name: 'Hebrew', code: 'he-IL', nativeName: 'עברית' },
    { name: 'Thai', code: 'th-TH', nativeName: 'ภาษาไทย' },
    { name: 'Vietnamese', code: 'vi-VN', nativeName: 'Tiếng Việt' },
    { name: 'Indonesian', code: 'id-ID', nativeName: 'Bahasa Indonesia' },
    { name: 'Malay', code: 'ms-MY', nativeName: 'Bahasa Melayu' },
    { name: 'Swahili', code: 'sw-KE', nativeName: 'Kiswahili' },
    { name: 'Ukrainian', code: 'uk-UA', nativeName: 'Українська' },
    { name: 'Czech', code: 'cs-CZ', nativeName: 'Čeština' },
    { name: 'Romanian', code: 'ro-RO', nativeName: 'Română' },
    { name: 'Hungarian', code: 'hu-HU', nativeName: 'Magyar' },
    { name: 'Urdu', code: 'ur-PK', nativeName: 'اردو' },
];

const nameToCode: Record<string, string> = {};
const codeToName: Record<string, string> = {};

SUPPORTED_LANGUAGES.forEach(lang => {
    nameToCode[lang.name.toLowerCase()] = lang.code;
    codeToName[lang.code] = lang.name;
});

export function getLanguageCode(name: string): string {
    return nameToCode[name.toLowerCase()] || 'en-US';
}

export function getLanguageName(code: string): string {
    return codeToName[code] || 'English';
}

export function getSupportedLanguages(): LanguageOption[] {
    return SUPPORTED_LANGUAGES;
}

export function detectLanguageFromCommand(transcript: string): string | null {
    const lower = transcript.toLowerCase();
    for (const lang of SUPPORTED_LANGUAGES) {
        if (lower.includes(lang.name.toLowerCase())) {
            return lang.name;
        }
    }
    return null;
}
