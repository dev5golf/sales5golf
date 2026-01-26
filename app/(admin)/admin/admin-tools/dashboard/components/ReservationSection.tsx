'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DASHBOARD_CONSTANTS } from '../constants';
import { RecruitmentService, RecruitmentListItem, QuotationSubItem } from '../services/recruitmentService';
import { ActivityLogService } from '../services/activityLogService';
import { useAuth } from '@/contexts/AuthContext';

interface ReservationSectionProps {
    onActivityLogRefresh?: () => void;
    onRecruitmentRefresh?: () => void;
    refreshTrigger?: number;
}

export default function ReservationSection({ onActivityLogRefresh, onRecruitmentRefresh, refreshTrigger }: ReservationSectionProps) {
    const { user } = useAuth();
    const [reservations, setReservations] = useState<RecruitmentListItem[]>([]);
    const [loadingReservations, setLoadingReservations] = useState(true);
    const [quotationsByReservation, setQuotationsByReservation] = useState<Record<string, QuotationSubItem[]>>({});
    const [loadingQuotations, setLoadingQuotations] = useState<Record<string, boolean>>({});

    // 예약 목록 불러오기 함수
    const loadReservations = async () => {
        setLoadingReservations(true);
        const response = await RecruitmentService.getReservations();
        if (response.success && response.data) {
            setReservations(response.data);
            // 각 예약의 견적서 목록도 함께 불러오기
            response.data.forEach(async (reservation) => {
                setLoadingQuotations(prev => ({ ...prev, [reservation.id]: true }));
                const quotations = await RecruitmentService.getQuotationsByRecruitmentId(reservation.id);
                setQuotationsByReservation(prev => ({ ...prev, [reservation.id]: quotations }));
                setLoadingQuotations(prev => ({ ...prev, [reservation.id]: false }));
            });
        }
        setLoadingReservations(false);
    };

    // 예약 취소 핸들러
    const handleCancelReservation = async (reservationId: string) => {
        if (!confirm('예약을 취소하시겠습니까?')) {
            return;
        }

        try {
            // 수배의 status를 0으로 변경
            const statusResponse = await RecruitmentService.updateRecruitmentStatus(reservationId, 0);

            if (!statusResponse.success) {
                alert('예약 취소에 실패했습니다.');
                return;
            }

            // 예약 목록 새로고침
            await loadReservations();

            // 수배 섹션도 새로고침
            onRecruitmentRefresh?.();

            // 활동 로그 기록
            if (user) {
                const userName = user.name || user.email || '알 수 없음';
                const reservation = reservations.find(r => r.id === reservationId);
                const targetTitle = reservation?.title;

                await ActivityLogService.createLog({
                    action: 'reservation_cancel',
                    userId: user.id,
                    userName: userName,
                    targetId: reservationId,
                    targetTitle: targetTitle
                });

                onActivityLogRefresh?.();
            }

            alert('예약이 취소되었습니다.');
        } catch (error) {
            console.error('예약 취소 실패:', error);
            alert('예약 취소에 실패했습니다.');
        }
    };

    // 예약 목록 불러오기
    useEffect(() => {
        loadReservations();
    }, [refreshTrigger]);

    return (
        <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {DASHBOARD_CONSTANTS.SECTIONS.RESERVATION}
            </h3>
            <div className="space-y-3">
                {loadingReservations ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : reservations.length === 0 ? (
                    <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                ) : (
                    <>
                        {reservations.map((reservation) => (
                            <div key={reservation.id} className="space-y-2">
                                <div className="flex items-center justify-between gap-1 p-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <span className="text-xs text-gray-500 w-fit max-w-10 truncate flex-shrink-0">
                                        {reservation.createdBy}
                                    </span>
                                    <p className="text-sm font-medium text-gray-800 flex-1 truncate min-w-0">
                                        {reservation.title}
                                    </p>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleCancelReservation(reservation.id)}
                                        className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50 flex-shrink-0"
                                    >
                                        <X className="h-3 w-3" />
                                        취소
                                    </Button>
                                </div>

                                {/* 견적서 목록 표시 */}
                                {quotationsByReservation[reservation.id] && quotationsByReservation[reservation.id].length > 0 && (
                                    <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                                        {loadingQuotations[reservation.id] ? (
                                            <div className="flex items-center justify-center py-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                            </div>
                                        ) : (
                                            quotationsByReservation[reservation.id].map((quotation) => (
                                                <div
                                                    key={quotation.id}
                                                    className="flex items-center justify-between gap-1 p-1 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                                                >
                                                    <div className="flex items-center gap-1 flex-1 min-w-0">
                                                        <span className="text-xs text-gray-500 w-fit max-w-10 truncate flex-shrink-0">
                                                            {quotation.createdBy}
                                                        </span>
                                                        <p className="text-xs font-medium text-gray-800 flex-1 truncate min-w-0">
                                                            {quotation.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </>
                )}
            </div>
        </div>
    );
}

