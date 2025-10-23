"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecruitmentModal } from './components';
import { useRecruitmentModal } from './hooks/useRecruitmentModal';
import { DASHBOARD_CONSTANTS } from './constants';

export default function AdminToolsDashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 수배 등록 모달 훅
    const { isOpen, isLoading, openModal, closeModal, handleSubmit } = useRecruitmentModal();

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
                    <h1 className="text-3xl font-semibold text-gray-800">{DASHBOARD_CONSTANTS.TITLES.MAIN}</h1>
                    <p className="text-gray-600 mt-1"></p>
                </div>
            </div>


            {/* 수배, 예약 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 수배 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {DASHBOARD_CONSTANTS.SECTIONS.RECRUITMENT}
                        </h3>
                        <Button size="sm" className="flex items-center gap-2" onClick={openModal}>
                            <Plus className="h-4 w-4" />
                            {DASHBOARD_CONSTANTS.BUTTONS.REGISTER}
                        </Button>
                    </div>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                    </div>
                </div>

                {/* 예약 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {DASHBOARD_CONSTANTS.SECTIONS.RESERVATION}
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                    </div>
                </div>
            </div>

            {/* 입금, 출금 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* 입금 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {DASHBOARD_CONSTANTS.SECTIONS.DEPOSIT}
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                    </div>
                </div>

                {/* 출금 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {DASHBOARD_CONSTANTS.SECTIONS.WITHDRAWAL}
                    </h3>
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
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
                    {DASHBOARD_CONSTANTS.MESSAGES.TIP_TITLE}
                </h3>
                <p className="text-blue-700">
                    {DASHBOARD_CONSTANTS.MESSAGES.TIP_CONTENT}
                </p>
            </div>

            {/* 수배 등록 모달 */}
            <RecruitmentModal
                isOpen={isOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
            />
        </div>
    );
}

