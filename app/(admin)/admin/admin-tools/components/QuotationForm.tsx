'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { QuotationData, TravelDates, GolfSchedule, AccommodationSchedule, PickupSchedule } from '../../../../../hooks/useQuotationData';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface QuotationFormProps {
    quotationData: QuotationData;
    travelDates: TravelDates;
    inclusions: string;
    pricePerPerson: string;
    golfSchedules: GolfSchedule[];
    accommodationSchedules: AccommodationSchedule[];
    pickupSchedules: PickupSchedule[];
    onQuotationChange: (field: keyof QuotationData, value: string) => void;
    onTravelDateChange: (field: keyof TravelDates, value: string) => void;
}

export default function QuotationForm({
    quotationData,
    travelDates,
    inclusions,
    pricePerPerson,
    golfSchedules,
    accommodationSchedules,
    pickupSchedules,
    onQuotationChange,
    onTravelDateChange
}: QuotationFormProps) {
    // 마지막 선택한 날짜를 기억하는 상태
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);

    // 골프, 숙박, 픽업 일정이 있는지 확인
    const hasGolfSchedules = golfSchedules && golfSchedules.length > 0;
    const hasAccommodationSchedules = accommodationSchedules && accommodationSchedules.length > 0;
    const hasPickupSchedules = pickupSchedules && pickupSchedules.length > 0;

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        여행기간 시작일
                    </label>
                    <DatePicker
                        selected={(() => {
                            if (!travelDates.startDate) return null;
                            if (travelDates.startDate.includes('/')) {
                                const [year, month, day] = travelDates.startDate.split('/');
                                const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
                                return new Date(fullYear, parseInt(month) - 1, parseInt(day));
                            }
                            return null;
                        })()}
                        onChange={(date: Date | null) => {
                            if (date) {
                                setLastSelectedDate(date);
                                const year = date.getFullYear().toString().slice(-2);
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const formattedDate = `${year}/${month}/${day}`;
                                onTravelDateChange('startDate', formattedDate);
                            } else {
                                onTravelDateChange('startDate', '');
                            }
                        }}
                        dateFormat="yy/MM/dd"
                        locale={ko}
                        placeholderText="YY/MM/DD"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left"
                        showPopperArrow={false}
                        popperClassName="react-datepicker-popper"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        여행기간 종료일
                    </label>
                    <DatePicker
                        selected={(() => {
                            if (!travelDates.endDate) return null;
                            if (travelDates.endDate.includes('/')) {
                                const [year, month, day] = travelDates.endDate.split('/');
                                const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
                                return new Date(fullYear, parseInt(month) - 1, parseInt(day));
                            }
                            return null;
                        })()}
                        onChange={(date: Date | null) => {
                            if (date) {
                                setLastSelectedDate(date);
                                const year = date.getFullYear().toString().slice(-2);
                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                const day = String(date.getDate()).padStart(2, '0');
                                const formattedDate = `${year}/${month}/${day}`;
                                onTravelDateChange('endDate', formattedDate);
                            } else {
                                onTravelDateChange('endDate', '');
                            }
                        }}
                        dateFormat="yy/MM/dd"
                        locale={ko}
                        placeholderText="YY/MM/DD"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left"
                        showPopperArrow={false}
                        popperClassName="react-datepicker-popper"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left"
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

                    {/* 골프/숙박/픽업 포함사항 안내 문구 */}
                    {(hasGolfSchedules || hasAccommodationSchedules || hasPickupSchedules) && (
                        <div className="pt-3 border-t border-gray-200">
                            <div className="text-xs text-gray-600 italic">
                                {(() => {
                                    const sections = [];
                                    if (hasGolfSchedules) sections.push('골프');
                                    if (hasAccommodationSchedules) sections.push('숙박');
                                    if (hasPickupSchedules) sections.push('픽업');

                                    return `* ${sections.join(', ')} 상세 포함사항은 하단 참고부탁드립니다.`;
                                })()}
                            </div>
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
