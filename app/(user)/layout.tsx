'use client';

import Link from 'next/link';
import { useLanguage } from '../../contexts/SimpleLanguageContext';
import SimpleLanguageSwitcher from '../../components/SimpleLanguageSwitcher';

export default function UserLayout({ children }: { children: React.ReactNode }) {
    const { t } = useLanguage();

    return (
        <>
            <header className="header">
                <div className="header-container">
                    <div className="logo">
                        <Link href="/" className="logo-text">5MGOLF</Link>
                    </div>
                    <nav className="nav">
                        <ul className="nav-list">
                            <li><Link href="/" className="nav-link">{t('nav.home')}</Link></li>
                            <li><Link href="/list" className="nav-link">{t('nav.courses')}</Link></li>
                        </ul>
                    </nav>
                    <div className="user-actions">
                        <SimpleLanguageSwitcher />
                        <button className="btn btn-secondary">{t('btn.signin')}</button>
                        <button className="btn btn-primary">{t('btn.join')}</button>
                    </div>
                </div>
            </header>
            {children}
            <footer className="footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-section">
                            <h3>5MGOLF</h3>
                            <p>최고의 골프 경험을 제공합니다</p>
                        </div>
                        <div className="footer-section">
                            <h4>서비스</h4>
                            <ul>
                                <li><a href="#">티타임 예약</a></li>
                                <li><a href="#">골프장 정보</a></li>
                                <li><a href="#">골프 레슨</a></li>
                            </ul>
                        </div>
                        <div className="footer-section">
                            <h4>고객지원</h4>
                            <ul>
                                <li><a href="#">도움말</a></li>
                                <li><a href="#">문의하기</a></li>
                                <li><a href="#">FAQ</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 5MGOLF. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </>
    );
}
