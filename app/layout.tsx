import './globals.css';
import type { Metadata } from 'next';
import { AuthProvider } from '../contexts/AuthContext';
import { LanguageProvider } from '../contexts/SimpleLanguageContext';

export const metadata: Metadata = {
    title: '5MGOLF - 땡처리 기반 실시간 부킹 현황',
    description: '남는 티타임을 실시간으로 모아 합리적인 가격으로 제공합니다.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="ko">
            <head>
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
            </head>
            <body>
                <LanguageProvider>
                    <AuthProvider>
                        {children}
                    </AuthProvider>
                </LanguageProvider>
            </body>
        </html>
    );
}


