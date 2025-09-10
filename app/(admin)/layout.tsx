"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import './admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin, isSiteAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // 로그인 페이지가 아니고, 로딩이 완료되었으며, 관리자가 아닌 경우 로그인 페이지로 리다이렉트
        if (!loading && pathname !== '/admin/login' && !isAdmin) {
            router.push('/admin/login');
        }

        // 골프장 관리자와 사이트 관리자가 대시보드에 접근했을 때 티타임 관리로 리다이렉트
        if (!loading && (user?.role === 'course_admin' || user?.role === 'site_admin') && pathname === '/admin') {
            router.push('/admin/tee-times');
        }
    }, [loading, pathname, isAdmin, router, user]);

    const handleLogout = async () => {
        await logout();
        router.push('/admin/login');
    };

    // 로그인 페이지는 별도 처리
    if (pathname === '/admin/login') {
        return (
            <div className="admin-login-container">
                {children}
            </div>
        );
    }

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>5MGOLF 관리자</h2>
                    <div className="admin-user-info">
                        <span className="admin-user-name">{user?.name}</span>
                        <span className="admin-user-role">
                            {user?.role === 'super_admin' ? '통합 관리자' :
                                user?.role === 'site_admin' ? '사이트 관리자' : '골프장 관리자'}
                        </span>
                    </div>
                </div>

                <nav className="admin-nav">
                    <ul className="admin-nav-list">
                        {user?.role === 'super_admin' && (
                            <li>
                                <Link
                                    href="/admin"
                                    className={`admin-nav-link ${pathname === '/admin' ? 'active' : ''}`}
                                >
                                    <i className="fas fa-home"></i>
                                    대시보드
                                </Link>
                            </li>
                        )}
                        <li>
                            <Link
                                href="/admin/tee-times"
                                className={`admin-nav-link ${pathname === '/admin/tee-times' ? 'active' : ''}`}
                            >
                                <i className="fas fa-calendar-alt"></i>
                                티타임 관리
                            </Link>
                        </li>
                        {user?.role === 'super_admin' && (
                            <li>
                                <Link
                                    href="/admin/users"
                                    className={`admin-nav-link ${pathname.startsWith('/admin/users') ? 'active' : ''}`}
                                >
                                    <i className="fas fa-users"></i>
                                    회원 관리
                                </Link>
                            </li>
                        )}
                        {/* 사이트 관리자는 지역 관리만 접근 가능 */}
                        {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                            <li>
                                <Link
                                    href="/admin/regions"
                                    className={`admin-nav-link ${pathname.startsWith('/admin/regions') ? 'active' : ''}`}
                                >
                                    <i className="fas fa-map"></i>
                                    지역 관리
                                </Link>
                            </li>
                        )}

                        {/* 통합 관리자만 접근 가능한 메뉴들 */}
                        {user?.role === 'super_admin' && (
                            <>
                                <li>
                                    <Link
                                        href="/admin/courses"
                                        className={`admin-nav-link ${pathname.startsWith('/admin/courses') ? 'active' : ''}`}
                                    >
                                        <i className="fas fa-golf-ball"></i>
                                        골프장 관리
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/admin/translations"
                                        className={`admin-nav-link ${pathname.startsWith('/admin/translations') ? 'active' : ''}`}
                                    >
                                        <i className="fas fa-language"></i>
                                        번역 관리
                                    </Link>
                                </li>
                            </>
                        )}

                        {/* 통합 관리자와 사이트 관리자만 접근 가능한 메뉴들 */}
                        {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                            <li>
                                <Link
                                    href="/admin/admin-tools"
                                    className={`admin-nav-link ${pathname.startsWith('/admin/admin-tools') ? 'active' : ''}`}
                                >
                                    <i className="fas fa-tools"></i>
                                    관리자 도구
                                </Link>
                            </li>
                        )}
                    </ul>
                </nav>


            </aside>

            <main className="admin-main">
                <header className="admin-header">
                    <div className="admin-header-content">
                        <div className="admin-header-actions">
                            <button onClick={handleLogout} className="admin-logout-btn">
                                <i className="fas fa-sign-out-alt"></i>
                                로그아웃
                            </button>
                        </div>
                    </div>
                </header>

                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
}
