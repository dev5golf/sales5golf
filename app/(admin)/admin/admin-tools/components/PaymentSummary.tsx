'use client';

import { PaymentInfo } from '../../../../../hooks/useQuotationData';
import { BANK_INFO, QUOTATION_NOTES } from '../../../../../constants/quotationConstants';

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
    totalAmount
}: PaymentSummaryProps) {
    return (
        <>
            {/* 안내사항 */}
            <div className="mt-8 p-6 bg-gray-50 rounded-lg">
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

            {/* 추가 선택사항 */}
            <div className="mt-8 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">추가선택사항</h3>
                <textarea
                    value={additionalOptions}
                    onChange={(e) => onAdditionalOptionsChange(e.target.value)}
                    placeholder="추가 선택사항을 입력하세요..."
                    className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
            </div>

            {/* 결제 요약 */}
            <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-6">결제 요약</h3>

                <div className="space-y-6">
                    {/* 가로 레이아웃: 계약금, 잔금, 합계 */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 shadow-sm">
                            <div className="text-center">
                                <div className="text-sm font-medium text-blue-700 mb-3">계약금</div>
                                <input
                                    type="text"
                                    value={paymentInfo.downPayment}
                                    onChange={(e) => onPaymentChange('downPayment', e.target.value)}
                                    placeholder="₩0"
                                    className="w-full px-4 py-3 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-semibold text-gray-800 bg-white"
                                />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 shadow-sm">
                            <div className="text-center">
                                <div className="text-sm font-medium text-green-700 mb-3">
                                    잔금 {balanceDueDate && `(${balanceDueDate}까지)`}
                                </div>
                                <div className="text-2xl font-bold text-green-800 py-3">{balance}</div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 shadow-sm">
                            <div className="text-center">
                                <div className="text-sm font-medium text-purple-700 mb-3">합계</div>
                                <div className="text-2xl font-bold text-purple-800 py-3">{totalAmount}</div>
                            </div>
                        </div>
                    </div>

                    {/* 총비용 강조 */}
                    <div className="bg-gradient-to-r from-indigo-500 to-blue-600 p-6 rounded-xl shadow-lg">
                        <div className="flex justify-between items-center">
                            <div className="text-white">
                                <div className="text-lg font-semibold">총비용</div>
                                <div className="text-sm opacity-90">전체 여행 비용</div>
                            </div>
                            <div className="text-3xl font-bold text-white">{totalAmount}</div>
                        </div>
                    </div>
                </div>

                {/* 입금 정보 */}
                <div className="mt-6 space-y-4">
                    <div className="bg-white p-4 rounded-lg border">
                        <div className="text-sm font-medium text-gray-700 mb-3">입금하실 곳:</div>
                        <div className="space-y-1 text-sm text-gray-600">
                            <div>은행: {BANK_INFO.BANK_NAME}</div>
                            <div>계좌번호: {BANK_INFO.ACCOUNT_NUMBER}</div>
                            <div>예금주: {BANK_INFO.ACCOUNT_HOLDER}</div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                        <div className="space-y-1 text-sm text-yellow-800">
                            {QUOTATION_NOTES.map((note, index) => (
                                <div key={index} className="flex items-start">
                                    <span className="text-yellow-600 mr-2">•</span>
                                    <span>{note}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
