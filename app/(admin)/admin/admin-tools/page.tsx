"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { FileText, BarChart3, Settings, ArrowRight, LayoutDashboard } from 'lucide-react';

export default function AdminToolsPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 권한 검사 - 수퍼관리자와 사이트관리자만 접근 가능
    if (!loading && user?.role !== 'super_admin' && user?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    // 로딩 상태
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

    const tools = [
        {
            title: '대시보드',
            description: '전체 통계 및 요약 정보를 확인합니다',
            icon: LayoutDashboard,
            href: '/admin/admin-tools/dashboard',
            color: 'indigo',
            available: true
        },
        {
            title: '견적서 작성',
            description: '골프 여행 견적서를 생성하고 관리합니다',
            icon: FileText,
            href: '/admin/admin-tools/quotation',
            color: 'blue',
            available: true
        }
    ];

    const getColorClasses = (color: string) => {
        const colors: { [key: string]: { bg: string; hover: string; icon: string; border: string } } = {
            indigo: {
                bg: 'bg-indigo-50',
                hover: 'hover:bg-indigo-100',
                icon: 'text-indigo-600',
                border: 'border-indigo-200'
            },
            blue: {
                bg: 'bg-blue-50',
                hover: 'hover:bg-blue-100',
                icon: 'text-blue-600',
                border: 'border-blue-200'
            },
            green: {
                bg: 'bg-green-50',
                hover: 'hover:bg-green-100',
                icon: 'text-green-600',
                border: 'border-green-200'
            },
            purple: {
                bg: 'bg-purple-50',
                hover: 'hover:bg-purple-100',
                icon: 'text-purple-600',
                border: 'border-purple-200'
            }
        };
        return colors[color] || colors.blue;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800">관리자 도구</h1>
                    <p className="text-gray-600 mt-1">편의 기능 및 관리 도구 모음</p>
                </div>
            </div>

            {/* 도구 카드 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    const colors = getColorClasses(tool.color);

                    return (
                        <div
                            key={tool.title}
                            className={`
                                relative p-6 rounded-lg border-2 transition-all duration-200
                                ${colors.bg} ${colors.border}
                                ${tool.available ? `${colors.hover} cursor-pointer` : 'opacity-60 cursor-not-allowed'}
                            `}
                            onClick={() => tool.available && router.push(tool.href)}
                        >
                            {/* 준비 중 배지 */}
                            {!tool.available && (
                                <div className="absolute top-4 right-4">
                                    <span className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-600 rounded-full">
                                        준비중
                                    </span>
                                </div>
                            )}

                            <div className="flex flex-col h-full">
                                {/* 아이콘 */}
                                <div className={`mb-4 ${colors.icon}`}>
                                    <Icon className="h-12 w-12" />
                                </div>

                                {/* 제목 */}
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                    {tool.title}
                                </h3>

                                {/* 설명 */}
                                <p className="text-gray-600 mb-4 flex-grow">
                                    {tool.description}
                                </p>

                                {/* 액션 버튼 */}
                                {tool.available && (
                                    <div className="flex items-center text-sm font-medium text-gray-700">
                                        <span>시작하기</span>
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* 안내 메시지 */}
            <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    도구 안내
                </h3>
                <div className="space-y-2 text-gray-600">
                    <p>• <strong>대시보드:</strong> 관리자 도구의 전체 통계 및 요약 정보를 확인할 수 있습니다.</p>
                    <p>• <strong>견적서 작성:</strong> 골프 여행 견적서를 생성하고 이미지로 다운로드할 수 있습니다.</p>
                </div>
            </div>
        </div>
    );
}
