'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { i18n, Language } from '../lib/i18n/simple-i18n';

interface LanguageContextType {
    currentLanguage: Language;
    setLanguage: (language: Language) => void;
    t: (key: string) => string;
    availableLanguages: { code: Language; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const [currentLanguage, setCurrentLanguage] = useState<Language>('ko');

    useEffect(() => {
        // 클라이언트에서만 실행
        if (typeof window === 'undefined') return;

        // 브라우저 언어 감지
        const browserLanguage = navigator.language.split('-')[0];
        const detectedLanguage = ['ko', 'en', 'vi'].includes(browserLanguage)
            ? browserLanguage as Language
            : 'ko';

        setCurrentLanguage(i18n.getCurrentLanguage() || detectedLanguage);
    }, []);

    const setLanguage = (language: Language) => {
        setCurrentLanguage(language);
        i18n.setLanguage(language);
    };

    const t = (key: string) => {
        return i18n.t(key);
    };

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            setLanguage,
            t,
            availableLanguages: i18n.getAvailableLanguages()
        }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
