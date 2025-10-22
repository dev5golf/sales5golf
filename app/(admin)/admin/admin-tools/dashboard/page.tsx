"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FileText } from 'lucide-react';

export default function AdminToolsDashboardPage() {
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


    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800">관리자 도구 대시보드</h1>
                    <p className="text-gray-600 mt-1"></p>
                </div>
            </div>


            {/* 수배, 예약 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 수배 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        수배
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">내용을 추가하세요</p>
                    </div>
                </div>

                {/* 예약 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        예약
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">내용을 추가하세요</p>
                    </div>
                </div>
            </div>

            {/* 수배, 예약 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 수배 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        수배
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">내용을 추가하세요</p>
                    </div>
                </div>

                {/* 예약 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        예약
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">내용을 추가하세요</p>
                    </div>
                </div>
            </div>

            {/* 입금, 출금 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 hidden">
                {/* 입금 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        최근 견적서
                    </h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            고객명 {item}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            2025-10-{20 + item}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    ₩{(Math.random() * 5000000 + 1000000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 빠른 액세스 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        빠른 액세스
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/admin/admin-tools/quotation')}
                            className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                            <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-800">새 견적서 작성</p>
                                    <p className="text-sm text-gray-600">골프 여행 견적서 생성</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>



            {/* 안내 메시지 */}
            <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">
                    💡 Tip
                </h3>
                <p className="text-blue-700">
                    이 대시보드는 관리자 도구의 전체 활동을 한눈에 볼 수 있도록 설계되었습니다.
                    실제 데이터는 향후 업데이트를 통해 연동될 예정입니다.
                </p>
            </div>
        </div>
    );
}

