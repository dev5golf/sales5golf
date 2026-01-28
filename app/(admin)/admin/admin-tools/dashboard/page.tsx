"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ActivityLog, RecruitmentSection, ReservationSection, DepositSection, WithdrawalSection } from './components';
import { DASHBOARD_CONSTANTS } from './constants';

export default function AdminToolsDashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [activityLogRefreshTrigger, setActivityLogRefreshTrigger] = useState(0);
    const [recruitmentRefreshTrigger, setRecruitmentRefreshTrigger] = useState(0);
    const [reservationRefreshTrigger, setReservationRefreshTrigger] = useState(0);

    const handleActivityLogRefresh = () => {
        setActivityLogRefreshTrigger(prev => prev + 1);
    };

    const handleRecruitmentRefresh = () => {
        setRecruitmentRefreshTrigger(prev => prev + 1);
    };

    const handleReservationRefresh = () => {
        setReservationRefreshTrigger(prev => prev + 1);
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
            <div className="mb-1 p-6 bg-white rounded-lg shadow-sm hidden">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800">{DASHBOARD_CONSTANTS.TITLES.MAIN}</h1>
                    <p className="text-gray-600 mt-1"></p>
                </div>
            </div>


            {/* 메인 그리드: 수배(4)/예약(6) | 입금(3)/출금(5)/활동로그(2) */}
            <div className="grid grid-cols-1 lg:grid-cols-10 gap-1 mb-6">
                {/* 첫 번째 줄: 수배(4) / 예약(6) */}
                <div className="lg:col-span-4">
                    <RecruitmentSection
                        onActivityLogRefresh={handleActivityLogRefresh}
                        onReservationRefresh={handleReservationRefresh}
                        refreshTrigger={recruitmentRefreshTrigger}
                    />
                </div>
                <div className="lg:col-span-6">
                    <ReservationSection
                        onActivityLogRefresh={handleActivityLogRefresh}
                        onRecruitmentRefresh={handleRecruitmentRefresh}
                        refreshTrigger={reservationRefreshTrigger}
                    />
                </div>

                {/* 두 번째 줄: 입금(3) / 출금(5) / 활동로그(2) */}
                <div className="lg:col-span-3">
                    <DepositSection />
                </div>
                <div className="lg:col-span-5">
                    <WithdrawalSection />
                </div>
                <div className="lg:col-span-2">
                    <ActivityLog refreshTrigger={activityLogRefreshTrigger} />
                </div>
            </div>
        </div>
    );
}

