'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { PaymentInfo } from '@/app/(admin)/admin/admin-tools/types';
import { BANK_INFO, QUOTATION_NOTES } from '../../../../../constants/quotationConstants';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface PaymentSummaryProps {
    paymentInfo: PaymentInfo;
    onPaymentChange: (field: keyof PaymentInfo, value: string) => void;
    additionalOptions: string;
    onAdditionalOptionsChange: (value: string) => void;
    totalPrepayment: string;
    downPayment: string;
    balance: string;
    balanceDueDate: string;
    totalAmount: string;
    // 현장결제 관련 props
    golfOnSiteTotal?: string;
    rentalCarOnSiteTotal?: string;
    golfOnSiteYenTotal?: number; // 골프 현장결제 엔화 총합계
    rentalCarOnSiteYenTotal?: number; // 렌트카 현장결제 엔화 총합계
    isJapanRegion?: boolean;
    exchangeRate?: number; // 환율 추가
}

export default function PaymentSummary({
    paymentInfo,
    onPaymentChange,
    additionalOptions,
    onAdditionalOptionsChange,
    totalPrepayment,
    downPayment,
    balance,
    balanceDueDate,
    totalAmount,
    golfOnSiteTotal = '₩0',
    rentalCarOnSiteTotal = '₩0',
    golfOnSiteYenTotal = 0,
    rentalCarOnSiteYenTotal = 0,
    isJapanRegion = false,
    exchangeRate = 8.5 // 환율 기본값 8.5
}: PaymentSummaryProps) {
    // 마지막 선택한 날짜를 기억하는 상태
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);

    // 현장결제 총비용 계산 (원화)
    const calculateOnSiteTotal = () => {
        const golfTotal = parseInt(golfOnSiteTotal.replace(/[₩,]/g, '')) || 0;
        const rentalCarTotal = parseInt(rentalCarOnSiteTotal.replace(/[₩,]/g, '')) || 0;
        return golfTotal + rentalCarTotal;
    };

    // 현장결제 총비용 계산 (엔화)
    const calculateOnSiteYenTotal = () => {
        return golfOnSiteYenTotal + rentalCarOnSiteYenTotal;
    };

    // 원화를 엔화로 변환하는 함수
    const convertWonToYen = (wonAmount: number): number => {
        return Math.round(wonAmount / exchangeRate);
    };

    // 계약금 입력 처리
    const handleDownPaymentChange = (value: string) => {
        // 숫자만 추출
        const numericValue = value.replace(/[₩,]/g, '');

        // 빈 값이면 그대로 저장
        if (numericValue === '') {
            onPaymentChange('downPayment', '');
            return;
        }

        // 숫자로 변환
        const amount = parseInt(numericValue) || 0;

        // 원화 표기만 추가 (천단위 콤마 없음)
        const formattedAmount = `₩${amount}`;
        onPaymentChange('downPayment', formattedAmount);
    };


    return (
        <>

            {/* 결제 요약 */}
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">결제 요약</h3>

                <div className="space-y-6">
                    {/* 가로 레이아웃: 계약금, 잔금, 합계 */}
                    <div className={`grid gap-4 ${isJapanRegion ? 'grid-cols-1' : 'grid-cols-3'}`}>
                        {!isJapanRegion && (
                            <>
                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-purple-700 mb-3">계약금</div>
                                        <input
                                            type="text"
                                            value={paymentInfo.downPayment}
                                            onChange={(e) => handleDownPaymentChange(e.target.value)}
                                            placeholder="₩0"
                                            className="w-full px-4 py-3 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-semibold text-gray-800 bg-white"
                                            translate="no"
                                        />
                                        <div className="mt-3">
                                            <label className="block text-xs text-purple-600 mb-1">계약금 납부일</label>
                                            <DatePicker
                                                selected={paymentInfo.downPaymentDate ? new Date(paymentInfo.downPaymentDate) : null}
                                                onChange={(date: Date | null) => {
                                                    if (date) {
                                                        setLastSelectedDate(date);
                                                        // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (UTC 변환 방지)
                                                        const year = date.getFullYear();
                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                        const day = String(date.getDate()).padStart(2, '0');
                                                        const formattedDate = `${year}-${month}-${day}`;
                                                        onPaymentChange('downPaymentDate', formattedDate);
                                                    } else {
                                                        onPaymentChange('downPaymentDate', '');
                                                    }
                                                }}
                                                dateFormat="yyyy-MM-dd"
                                                locale={ko}
                                                placeholderText="날짜 선택"
                                                className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-center bg-white"
                                                showPopperArrow={false}
                                                popperClassName="react-datepicker-popper"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-green-700 mb-3">잔금</div>
                                        <div className="text-2xl font-bold text-green-800 py-3" translate="no">{balance}</div>
                                        <div className="mt-3">
                                            <label className="block text-xs text-green-600 mb-1">잔금 납부일</label>
                                            <DatePicker
                                                selected={paymentInfo.balanceDueDate ? new Date(paymentInfo.balanceDueDate) : null}
                                                onChange={(date: Date | null) => {
                                                    if (date) {
                                                        setLastSelectedDate(date);
                                                        // 로컬 날짜를 YYYY-MM-DD 형식으로 변환 (UTC 변환 방지)
                                                        const year = date.getFullYear();
                                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                                        const day = String(date.getDate()).padStart(2, '0');
                                                        const formattedDate = `${year}-${month}-${day}`;
                                                        onPaymentChange('balanceDueDate', formattedDate);
                                                    } else {
                                                        onPaymentChange('balanceDueDate', '');
                                                    }
                                                }}
                                                dateFormat="yyyy-MM-dd"
                                                locale={ko}
                                                placeholderText="날짜 선택"
                                                className="w-full px-3 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm text-center bg-white"
                                                showPopperArrow={false}
                                                popperClassName="react-datepicker-popper"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {isJapanRegion ? (
                            <div className="grid grid-cols-2 gap-4">
                                {/* 사전결제(합계) */}
                                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-xl shadow-lg">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-white mb-3">사전결제 총비용</div>
                                        <div className="text-3xl font-bold text-white" translate="no">{totalAmount}</div>
                                    </div>
                                </div>

                                {/* 현장결제 */}
                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-xl shadow-lg">
                                    <div className="text-center">
                                        <div className="text-sm font-medium text-white mb-3">현장결제 총비용</div>
                                        <div className="text-3xl font-bold text-white" translate="no">
                                            ¥{calculateOnSiteYenTotal()}
                                        </div>
                                        <div className="text-2xl font-medium text-green-100 mt-1" translate="no">
                                            ₩{calculateOnSiteTotal()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-xl shadow-lg">
                                <div className="text-center">
                                    <div className="text-sm font-medium text-white mb-3">합계</div>
                                    <div className="text-5xl font-bold text-white py-3" translate="no">{totalAmount}</div>
                                </div>
                            </div>
                        )}
                    </div>

                </div>


                {/* 추가 선택사항 */}
                <div className="mt-6 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">추가선택사항</h3>
                    <textarea
                        value={additionalOptions}
                        onChange={(e) => onAdditionalOptionsChange(e.target.value)}
                        placeholder=""
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>

                {/* 안내사항 */}
                <div className="mt-6 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">안내사항</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        {QUOTATION_NOTES.map((note, index) => (
                            <li key={index} className="flex items-start">
                                <span className="text-gray-400 mr-2">•</span>
                                <span>{note}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 입금 정보 */}
                <div className="mt-6">
                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* 입금하실 곳 */}
                            <div>
                                <div className="text-sm font-medium text-yellow-800 mb-3">입금하실 곳:</div>
                                <div className="space-y-1 text-sm text-yellow-700">
                                    <div>은행: {BANK_INFO.BANK_NAME}</div>
                                    <div>계좌번호: {BANK_INFO.ACCOUNT_NUMBER}</div>
                                    <div>예금주: {BANK_INFO.ACCOUNT_HOLDER}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
