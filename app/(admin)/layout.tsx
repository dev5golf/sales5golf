"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { LogOut, Home, Calendar, Users, Map, Building, Globe, Settings, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin, isSiteAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        return <>{children}</>;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col transform transition-transform duration-300 ease-in-out
                lg:translate-x-0 lg:static lg:inset-0
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="p-6 border-b border-slate-800">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold">5MGOLF 관리자</h2>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-1 rounded-md hover:bg-slate-800"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    <div className="text-sm text-slate-300 mt-2">
                        <div className="font-medium">{user?.name}</div>
                        <div className="text-slate-400">
                            {user?.role === 'super_admin' ? '통합 관리자' :
                                user?.role === 'site_admin' ? '사이트 관리자' : '골프장 관리자'}
                        </div>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {user?.role === 'super_admin' && (
                        <Link
                            href="/admin"
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Home className="h-5 w-5" />
                            <span>대시보드</span>
                        </Link>
                    )}

                    <Link
                        href="/admin/tee-times"
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/tee-times'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                    >
                        <Calendar className="h-5 w-5" />
                        <span>티타임 관리</span>
                    </Link>

                    {user?.role === 'super_admin' && (
                        <Link
                            href="/admin/users"
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/users')
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Users className="h-5 w-5" />
                            <span>회원 관리</span>
                        </Link>
                    )}

                    {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                        <Link
                            href="/admin/regions"
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/regions')
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Map className="h-5 w-5" />
                            <span>지역 관리</span>
                        </Link>
                    )}

                    {user?.role === 'super_admin' && (
                        <>
                            <Link
                                href="/admin/courses"
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/courses')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Building className="h-5 w-5" />
                                <span>골프장 관리</span>
                            </Link>

                            <Link
                                href="/admin/translations"
                                onClick={() => setSidebarOpen(false)}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/translations')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Globe className="h-5 w-5" />
                                <span>번역 관리</span>
                            </Link>
                        </>
                    )}

                    {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                        <Link
                            href="/admin/admin-tools"
                            onClick={() => setSidebarOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/admin-tools')
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <Settings className="h-5 w-5" />
                            <span>관리자 도구</span>
                        </Link>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:ml-0">
                <header className="bg-white border-b border-gray-200 px-4 py-4 lg:px-6">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            로그아웃
                        </Button>
                    </div>
                </header>

                <div className="flex-1 p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
