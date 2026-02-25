import React from 'react';
import { Globe } from 'lucide-react';
import { useSetLanguage } from '../hooks/useQueries';
import { UserProfile } from '../backend';
import { getSupportedLanguages } from '../utils/languageMaps';
import ThemedPanel from './ThemedPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LanguageSelectorProps {
    profile: UserProfile;
    onLanguageChange?: (lang: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ profile, onLanguageChange }) => {
    const setLanguageMutation = useSetLanguage();
    const languages = getSupportedLanguages();

    const handleChange = async (value: string) => {
        await setLanguageMutation.mutateAsync(value);
        onLanguageChange?.(value);
    };

    return (
        <ThemedPanel title="LANGUAGE" className="p-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-rajdhani text-muted-foreground">
                <Globe className="w-4 h-4 text-cyan-jarvis" />
                <span>Current language: <span className="text-cyan-jarvis font-semibold">{profile.language}</span></span>
            </div>
            <Select
                value={profile.language}
                onValueChange={handleChange}
                disabled={setLanguageMutation.isPending}
            >
                <SelectTrigger
                    className="w-full jarvis-input border-jarvis-cyan/30 text-foreground font-rajdhani"
                >
                    <SelectValue placeholder="Select language..." />
                </SelectTrigger>
                <SelectContent
                    className="bg-jarvis-panel border-jarvis-cyan/30 max-h-64"
                    style={{ background: 'oklch(0.1 0.02 220)', borderColor: 'rgba(0,229,255,0.3)' }}
                >
                    {languages.map(lang => (
                        <SelectItem
                            key={lang.code}
                            value={lang.name}
                            className="text-foreground font-rajdhani hover:bg-jarvis-cyan/10 focus:bg-jarvis-cyan/10"
                        >
                            <span>{lang.name}</span>
                            <span className="ml-2 text-muted-foreground text-xs">{lang.nativeName}</span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground font-rajdhani">
                You can also say "Switch to [language name]" to change language by voice.
            </p>
        </ThemedPanel>
    );
};

export default LanguageSelector;
