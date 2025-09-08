'use client';

import React from 'react';
import { useLanguage } from '../contexts/SimpleLanguageContext';

const SimpleLanguageSwitcher: React.FC = () => {
    const { currentLanguage, setLanguage, availableLanguages } = useLanguage();

    return (
        <div className="relative inline-block text-left">
            <select
                value={currentLanguage}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="appearance-none bg-white border border-gray-300 rounded-md px-3 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
                {availableLanguages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.flag} {lang.name}
                    </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </div>
    );
};

export default SimpleLanguageSwitcher;
