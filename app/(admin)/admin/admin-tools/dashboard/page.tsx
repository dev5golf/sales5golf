"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityLog, RecruitmentSection, ReservationSection, DepositSection, WithdrawalSection } from './components';
import { DASHBOARD_CONSTANTS } from './constants';

export default function AdminToolsDashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activityLogRefreshTrigger, setActivityLogRefreshTrigger] = useState(0);

    const handleActivityLogRefresh = () => {
        setActivityLogRefreshTrigger(prev => prev + 1);
    };

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


            {/* 메인 그리드: 왼쪽(수배/예약/입금/출금), 오른쪽(활동 로그) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-1 mb-6">
                {/* 왼쪽: 수배, 예약, 입금, 출금 (2x2 그리드) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-1">
                    <RecruitmentSection onActivityLogRefresh={handleActivityLogRefresh} />
                    <ReservationSection />
                    <DepositSection />
                    <WithdrawalSection />
                </div>

                {/* 오른쪽: 활동 로그 (전체 높이) */}
                <div className="lg:col-span-1 flex">
                    <div className="w-full">
                        <ActivityLog refreshTrigger={activityLogRefreshTrigger} />
                    </div>
                </div>
            </div>
        </div>
    );
}

