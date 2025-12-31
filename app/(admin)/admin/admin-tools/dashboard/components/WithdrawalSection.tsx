'use client';

import { DASHBOARD_CONSTANTS } from '../constants';

// 더미 데이터 타입 정의
interface WithdrawalDummyData {
    id: string;
    country: string; // 국가
    withdrawalRequestDate: string; // 출금요청일 (YYYYMMDD)
    vendor: string; // 거래처
    customerName: string; // 고객명
    category: string; // 분류
    type: string; // 종류
    eventStartDate: string; // 행사시작일 (YYYYMMDD)
    amount: number; // 출금액
    manager: string; // 담당자
    status: 'pending' | 'completed'; // 상태
}

// 더미 데이터
const dummyWithdrawals: WithdrawalDummyData[] = [
    {
        id: '1',
        country: '대한민국',
        withdrawalRequestDate: '20241215',
        vendor: 'ABC 골프장',
        customerName: '홍길동',
        category: '계약금',
        type: '계좌이체',
        eventStartDate: '20241220',
        amount: 5000000,
        manager: '김담당',
        status: 'pending'
    },
    {
        id: '2',
        country: '베트남',
        withdrawalRequestDate: '20241216',
        vendor: 'XYZ 호텔',
        customerName: '이순신',
        category: '잔금',
        type: '계좌이체',
        eventStartDate: '20241225',
        amount: 3000000,
        manager: '박담당',
        status: 'completed'
    },
    {
        id: '3',
        country: '대한민국',
        withdrawalRequestDate: '20241217',
        vendor: 'DEF 골프장',
        customerName: '강감찬',
        category: '계약금',
        type: '카드',
        eventStartDate: '20241222',
        amount: 4500000,
        manager: '최담당',
        status: 'pending'
    },
    {
        id: '4',
        country: '베트남',
        withdrawalRequestDate: '20241218',
        vendor: 'GHI 리조트',
        customerName: '유관순',
        category: '잔금',
        type: '계좌이체',
        eventStartDate: '20241228',
        amount: 2800000,
        manager: '정담당',
        status: 'pending'
    }
];

export default function WithdrawalSection() {
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
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {DASHBOARD_CONSTANTS.SECTIONS.WITHDRAWAL}
            </h3>
            <div className="space-y-3">
                {dummyWithdrawals.length === 0 ? (
                    <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">국가</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">출금요청일</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">거래처</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">고객명</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">분류</th>
                                </tr>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">종류</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">행사시작일</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">출금액</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">담당자</th>
                                    <th className="text-left py-2 px-2 font-semibold text-gray-700">상태</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dummyWithdrawals.map((withdrawal) => (
                                    <>
                                        <tr key={`${withdrawal.id}-row1`} className="border-b border-gray-100 transition-colors">
                                            <td className="py-2 px-2 text-gray-800">{withdrawal.country || '-'}</td>
                                            <td className="py-2 px-2 text-gray-800">{formatDate(withdrawal.withdrawalRequestDate)}</td>
                                            <td className="py-2 px-2 text-gray-800">{withdrawal.vendor || '-'}</td>
                                            <td className="py-2 px-2 text-gray-800">{withdrawal.customerName || '-'}</td>
                                            <td className="py-2 px-2 text-gray-800">{withdrawal.category || '-'}</td>
                                        </tr>
                                        <tr key={`${withdrawal.id}-row2`} className="border-b border-gray-100 transition-colors">
                                            <td className="py-2 px-2 text-gray-800">{withdrawal.type || '-'}</td>
                                            <td className="py-2 px-2 text-gray-800">{formatDate(withdrawal.eventStartDate)}</td>
                                            <td className="py-2 px-2 text-gray-800">{formatAmount(withdrawal.amount)}</td>
                                            <td className="py-2 px-2 text-gray-800">{withdrawal.manager || '-'}</td>
                                            <td className="py-2 px-2">{getStatusBadge(withdrawal.status)}</td>
                                        </tr>
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

