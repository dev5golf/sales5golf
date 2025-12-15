'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DASHBOARD_CONSTANTS } from '../constants';
import { useDeposits } from '../hooks/useDeposits';
import { DepositListItem } from '../services/depositService';
import DepositModal, { DepositFormRow } from './DepositModal';
import { DepositService } from '../services/depositService';
import { useAuth } from '@/contexts/AuthContext';

export default function DepositSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { deposits, loading, refresh } = useDeposits();
    const { user } = useAuth();

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmitDeposits = async (rows: DepositFormRow[]) => {
        if (!user) {
            alert('로그인이 필요합니다.');
            return;
        }

        setIsSubmitting(true);
        try {
            let successCount = 0;
            let failCount = 0;

            // 현재 시간을 HHMMSS 형식으로 변환
            const getCurrentTime = (): string => {
                const now = new Date();
                const hours = String(now.getHours()).padStart(2, '0');
                const minutes = String(now.getMinutes()).padStart(2, '0');
                const seconds = String(now.getSeconds()).padStart(2, '0');
                return `${hours}${minutes}${seconds}`;
            };

            // 각 행을 순차적으로 저장
            for (const row of rows) {
                const depositData = {
                    type: row.type,
                    depositDate: row.depositDate, // YYYYMMDD
                    depositTime: getCurrentTime(), // HHMMSS (등록 시점의 현재 시간)
                    depositor: row.depositor,
                    amount: parseFloat(row.amount),
                    representative: '', // 빈값
                    manager: '', // 빈값
                    reservationId: '', // 빈값
                    country: row.country, // 국가
                    category: '', // 분류 (빈값)
                    status: 'pending' as const, // 기본값: 대기
                };

                const result = await DepositService.createDeposit(
                    depositData,
                    user.name || user.email || 'unknown',
                    user.id
                );

                if (result.success) {
                    successCount++;
                } else {
                    failCount++;
                    console.error('입금 등록 실패:', result.message);
                }
            }

            if (successCount > 0) {
                alert(`${successCount}건의 입금 내역이 등록되었습니다.${failCount > 0 ? ` (${failCount}건 실패)` : ''}`);
                await refresh(); // 목록 새로고침
                handleCloseModal();
            } else {
                alert('입금 등록에 실패했습니다.');
            }
        } catch (error) {
            console.error('입금 등록 중 오류:', error);
            alert('입금 등록 중 오류가 발생했습니다.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // 날짜 포맷팅 (YYYYMMDD)
    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        // 이미 YYYYMMDD 형식이면 그대로 반환
        if (/^\d{8}$/.test(dateString)) {
            return dateString;
        }
        // Date 객체나 다른 형식이면 변환
        try {
            const date = new Date(dateString);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        } catch {
            return dateString;
        }
    };

    // 시간 포맷팅 (HHMMSS)
    const formatTime = (timeString?: string) => {
        if (!timeString) return '-';
        // 이미 HHMMSS 형식이면 그대로 반환
        if (/^\d{6}$/.test(timeString)) {
            return timeString;
        }
        return timeString;
    };

    // 금액 포맷팅
    const formatAmount = (amount: number) => {
        return `₩${amount.toLocaleString('ko-KR')}`;
    };

    // 상태 표시
    const getStatusBadge = (status?: string) => {
        if (status === 'completed') {
            return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">완료</span>;
        }
        return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">대기</span>;
    };

    return (
        <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-semibold text-gray-800">
                    {DASHBOARD_CONSTANTS.SECTIONS.DEPOSIT}
                </h3>
                <Button size="sm" className="flex items-center gap-2" onClick={handleOpenModal}>
                    <Plus className="h-4 w-4" />
                    {DASHBOARD_CONSTANTS.BUTTONS.REGISTER}
                </Button>
            </div>
            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                ) : deposits.length === 0 ? (
                    <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">국가</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">거래일자</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">입금자</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">대표자</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">분류</th>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">종류</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">거래시간</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">입금액</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">담당자</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {deposits.map((deposit: DepositListItem) => (
                                    <>
                                        <tr key={`${deposit.id}-row1`} className="border-b border-gray-100 transition-colors">
                                            <td className="py-2 px-2 text-gray-800">{deposit.country || '-'}</td>
                                            <td className="py-2 px-2 text-gray-800">{formatDate(deposit.depositDate)}</td>
                                            <td className="py-2 px-2 text-gray-800">{deposit.depositor || '-'}</td>
                                            <td className="py-2 px-2 text-gray-800">{deposit.representative || '-'}</td>
                                            <td className="py-2 px-2 text-gray-800">{deposit.category || '-'}</td>
                                        </tr>
                                        <tr key={`${deposit.id}-row2`} className="border-b border-gray-100 transition-colors">
                                            <td className="py-2 px-2 text-gray-800">{deposit.type || '-'}</td>
                                            <td className="py-2 px-2 text-gray-800">{formatTime(deposit.depositTime)}</td>
                                            <td className="py-2 px-2 text-gray-800">{formatAmount(deposit.amount)}</td>
                                            <td className="py-2 px-2 text-gray-800">{deposit.manager || deposit.createdBy || '-'}</td>
                                            <td className="py-2 px-2">{getStatusBadge(deposit.status)}</td>
                                        </tr>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* 입금 등록 모달 */}
            <DepositModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSubmit={handleSubmitDeposits}
            />
        </div>
    );
}

