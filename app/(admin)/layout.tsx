"use client";
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { LogOut, Home, Calendar, Users, Map, Building, Globe, Settings, Menu, ChevronDown, ChevronRight, FileText, BarChart3, Wrench, Building2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, logout, isAdmin, isSiteAdmin } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [adminToolsOpen, setAdminToolsOpen] = useState(false);

    // pathname 변경 시 관리자 도구 하위 메뉴 자동 열기
    useEffect(() => {
        if (pathname.startsWith('/admin/admin-tools')) {
            setAdminToolsOpen(true);
        }
    }, [pathname]);

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

            {/* Sidebar */}
            {sidebarOpen && (
                <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white flex flex-col">
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center">
                            <h2 className="text-lg font-semibold">5MGOLF 관리자</h2>
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
                            onClick={(e) => {
                                e.preventDefault();
                            }}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname === '/admin/tee-times'
                                ? 'bg-blue-600 text-white'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                }`}
                            aria-disabled
                            title="현재 페이지 이동이 비활성화되어 있습니다"
                        >
                            <Calendar className="h-5 w-5" />
                            <span>티타임 관리</span>
                        </Link>

                        {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                            <Link
                                href="/admin/users"
                                onClick={() => {
                                    // 모바일에서만 사이드바 닫기
                                    if (window.innerWidth < 375) {
                                        setSidebarOpen(false);
                                    }
                                }}
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
                                href="/admin/vendors"
                                onClick={() => {
                                    // 모바일에서만 사이드바 닫기
                                    if (window.innerWidth < 375) {
                                        setSidebarOpen(false);
                                    }
                                }}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/vendors')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Building2 className="h-5 w-5" />
                                <span>거래처 관리</span>
                            </Link>
                        )}

                        {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                            <Link
                                href="/admin/regions"
                                onClick={() => {
                                    // 모바일에서만 사이드바 닫기
                                    if (window.innerWidth < 375) {
                                        setSidebarOpen(false);
                                    }
                                }}
                                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/regions')
                                    ? 'bg-blue-600 text-white'
                                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Map className="h-5 w-5" />
                                <span>지역 관리</span>
                            </Link>
                        )}

                        {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                            <>
                                <Link
                                    href="/admin/courses"
                                    onClick={() => {
                                        // 모바일에서만 사이드바 닫기
                                        if (window.innerWidth < 375) {
                                            setSidebarOpen(false);
                                        }
                                    }}
                                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/courses')
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <Building className="h-5 w-5" />
                                    <span>골프장 관리</span>
                                </Link>

                            </>
                        )}

                        {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                            <div>
                                {/* 관리자 도구 메인 버튼 */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        console.log('관리자 도구 클릭, 현재 상태:', adminToolsOpen);
                                        setAdminToolsOpen(!adminToolsOpen);
                                    }}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${pathname.startsWith('/admin/admin-tools')
                                        ? 'bg-blue-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <Settings className="h-5 w-5" />
                                        <span>관리자 도구</span>
                                    </div>
                                    {adminToolsOpen ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* 하위 메뉴 */}
                                {adminToolsOpen && (
                                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-700 pl-3">
                                        <Link
                                            href="/admin/admin-tools/dashboard"
                                            onClick={() => {
                                                if (window.innerWidth < 375) {
                                                    setSidebarOpen(false);
                                                }
                                            }}
                                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${pathname === '/admin/admin-tools/dashboard'
                                                ? 'bg-blue-500 text-white'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                }`}
                                        >
                                            <Home className="h-4 w-4" />
                                            <span>대시보드</span>
                                            <span className="ml-auto text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded">준비중</span>
                                        </Link>

                                        <Link
                                            href="/admin/admin-tools/quotation"
                                            onClick={() => {
                                                if (window.innerWidth < 375) {
                                                    setSidebarOpen(false);
                                                }
                                            }}
                                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-sm ${pathname === '/admin/admin-tools/quotation'
                                                ? 'bg-blue-500 text-white'
                                                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                                }`}
                                        >
                                            <FileText className="h-4 w-4" />
                                            <span>견적서 작성</span>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </nav>
                </aside>
            )}

            {/* Main Content */}
            <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
                <header className="bg-white border-b border-gray-200 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100"
                        >
                            <Menu className="h-5 w-5" />
                            <span>메뉴</span>
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

                <div className={`flex-1 ${pathname === '/admin/admin-tools/dashboard' ? '' : 'p-4 lg:p-6'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
}
