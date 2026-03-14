import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// ─── Locales (lazy-loaded JSON) ──────────────────────────────────────
import fr from '@/i18n/locales/fr.json';
import en from '@/i18n/locales/en.json';
import zh from '@/i18n/locales/zh.json';
import ko from '@/i18n/locales/ko.json';
import ja from '@/i18n/locales/ja.json';
import ru from '@/i18n/locales/ru.json';
import es from '@/i18n/locales/es.json';
import ar from '@/i18n/locales/ar.json';
import pt from '@/i18n/locales/pt.json';
import de from '@/i18n/locales/de.json';

// ─── Types ───────────────────────────────────────────────────────────
export type Language = 'fr' | 'en' | 'zh' | 'ko' | 'ja' | 'ru' | 'es' | 'ar' | 'pt' | 'de';

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ─── Language List ───────────────────────────────────────────────────
export const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

// ─── Translation Map ─────────────────────────────────────────────────
const translations: Record<Language, Record<string, string>> = {
    fr, en, zh, ko, ja, ru, es, ar, pt, de,
};

const RTL_LANGUAGES: Language[] = ['ar'];
const STORAGE_KEY = 'idn-language';

// ─── Provider ────────────────────────────────────────────────────────
export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        return (stored as Language) || 'fr';
    });

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
        localStorage.setItem(STORAGE_KEY, lang);
    };

    useEffect(() => {
        document.documentElement.lang = language;
        document.documentElement.dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
    }, [language]);

    const t = (key: string): string => {
        return translations[language]?.[key] || translations.fr[key] || key;
    };

    const dir: 'ltr' | 'rtl' = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
            {children}
        </LanguageContext.Provider>
    );
}

// ─── Hook ────────────────────────────────────────────────────────────
export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
