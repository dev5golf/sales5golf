'use client';

import { QuotationData, TravelDates } from '../../../../../hooks/useQuotationData';

interface QuotationFormProps {
    quotationData: QuotationData;
    travelDates: TravelDates;
    inclusions: string;
    pricePerPerson: string;
    onQuotationChange: (field: keyof QuotationData, value: string) => void;
    onTravelDateChange: (field: keyof TravelDates, value: string) => void;
}

export default function QuotationForm({
    quotationData,
    travelDates,
    inclusions,
    pricePerPerson,
    onQuotationChange,
    onTravelDateChange
}: QuotationFormProps) {
    return (
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">오분골프 해외 골프장 실시간 예약</h2>
                    <p className="text-gray-600 mt-1">전문적인 골프 여행 서비스</p>
                </div>
                <div className="text-right">
                    <h3 className="text-3xl font-bold text-blue-600">견적서</h3>
                    <p className="text-gray-500 text-sm">Quotation</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        고객명
                    </label>
                    <input
                        type="text"
                        value={quotationData.customerName}
                        onChange={(e) => onQuotationChange('customerName', e.target.value)}
                        placeholder="고객명을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        여행지
                    </label>
                    <input
                        type="text"
                        value={quotationData.destination}
                        onChange={(e) => onQuotationChange('destination', e.target.value)}
                        placeholder="태국/치앙마이"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        여행기간 시작일
                    </label>
                    <input
                        type="text"
                        value={travelDates.startDate}
                        onChange={(e) => onTravelDateChange('startDate', e.target.value)}
                        placeholder="25/01/17"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        여행기간 종료일
                    </label>
                    <input
                        type="text"
                        value={travelDates.endDate}
                        onChange={(e) => onTravelDateChange('endDate', e.target.value)}
                        placeholder="25/01/20"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        인원
                    </label>
                    <input
                        type="number"
                        value={quotationData.numberOfPeople}
                        onChange={(e) => onQuotationChange('numberOfPeople', e.target.value)}
                        placeholder="인원수를 입력하세요"
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="flex items-center mb-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <h3 className="text-lg font-semibold text-gray-800">포함사항</h3>
                </div>
                <div className="space-y-3">
                    {inclusions ? (
                        inclusions.split(' / ').map((inclusion, index) => (
                            <div key={index} className="flex items-center text-gray-700">
                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-sm">{inclusion}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-gray-500 text-sm italic">
                            일정을 추가하면 포함사항이 자동으로 표시됩니다.
                        </div>
                    )}
                    <div className="pt-3 border-t border-blue-200">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">1인당 요금</span>
                            <span className="text-lg font-bold text-blue-600">{pricePerPerson}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
