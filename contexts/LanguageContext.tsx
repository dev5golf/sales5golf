'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { loadTranslationsFromStorage } from '../lib/i18n/translation-loader';
import '../lib/i18n/client'; // 클라이언트에서 i18n 초기화

interface LanguageContextType {
    currentLanguage: string;
    setLanguage: (language: string) => void;
    availableLanguages: { code: string; name: string; flag: string }[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const availableLanguages = [
    { code: 'ko', name: '한국어', flag: '🇰🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
];

interface LanguageProviderProps {
    children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
    const { i18n } = useTranslation();
    const [currentLanguage, setCurrentLanguage] = useState<string>('ko');

    // 브라우저 언어 감지 및 번역 로드
    useEffect(() => {
        // 클라이언트 사이드에서만 실행
        if (typeof window === 'undefined') return;

        // 저장된 번역 데이터 로드
        loadTranslationsFromStorage();

        const savedLanguage = localStorage.getItem('language');
        const browserLanguage = navigator.language.split('-')[0];

        const detectedLanguage = savedLanguage ||
            (availableLanguages.find(lang => lang.code === browserLanguage)?.code) ||
            'ko';

        setCurrentLanguage(detectedLanguage);
        i18n.changeLanguage(detectedLanguage);
    }, [i18n]);

    const setLanguage = (language: string) => {
        setCurrentLanguage(language);
        i18n.changeLanguage(language);

        // 클라이언트 사이드에서만 localStorage 사용
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', language);
        }
    };

    return (
        <LanguageContext.Provider value={{
            currentLanguage,
            setLanguage,
            availableLanguages
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
