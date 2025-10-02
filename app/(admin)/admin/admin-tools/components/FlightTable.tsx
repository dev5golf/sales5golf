'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { FlightSchedule } from '@/app/(admin)/admin/admin-tools/types';
import { createAddClickHandler } from '@/lib/utils/tableUtils';
import { createTotalChangeHandler } from '@/lib/utils/tableHandlers';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface FlightTableProps {
    schedules: FlightSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof FlightSchedule, value: string) => void;
    onRemove: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
    calculatePrepayment: (total: string, numberOfPeople: number) => string;
    calculateTotalFromPerPerson?: (perPersonValue: string, numberOfPeople: number) => string;
    regionType?: 'basic' | 'japan';
}

export default function FlightTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    numberOfPeople,
    isFormValid,
    calculatePrepayment,
    calculateTotalFromPerPerson,
    regionType
}: FlightTableProps) {
    // 마지막 선택한 날짜를 기억하는 상태
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);

    const handleAddClick = createAddClickHandler(isFormValid, onAdd);
    const handleTotalChange = createTotalChangeHandler(onUpdate);

    // 일본 지역일 때 사전결제(1인) 입력 시 합계 자동 계산 핸들러
    const handlePerPersonInputChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // 숫자만 추출
        const numericValue = value.replace(/[^\d]/g, '');

        if (numericValue && calculateTotalFromPerPerson) {
            // 1인당 요금으로부터 총액 계산
            const perPersonValue = `₩${numericValue}`;
            const totalValue = calculateTotalFromPerPerson(perPersonValue, parseInt(numberOfPeople));
            onUpdate(id, 'total', totalValue);
        } else {
            onUpdate(id, 'total', '');
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">항공 (사전결제)</h3>
                </div>
                <Button
                    onClick={handleAddClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    추가
                </Button>
            </div>

            <div className="w-full h-auto rounded-lg border border-gray-200">
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">날짜</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-40">항공일정</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-28">인원</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">항공사</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">항공편명</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-28">수화물</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-28">소요시간</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">합계</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">사전결제(1인)</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    <DatePicker
                                        key={`${schedule.id}-${lastSelectedDate?.getTime() || 'empty'}`}
                                        selected={(() => {
                                            if (!schedule.date) return null;

                                            // MM/DD 형식인 경우 Date 객체로 변환
                                            if (schedule.date.includes('/')) {
                                                const [month, day] = schedule.date.split('/');
                                                const currentYear = new Date().getFullYear();
                                                return new Date(currentYear, parseInt(month) - 1, parseInt(day));
                                            }

                                            return null;
                                        })()}
                                        openToDate={lastSelectedDate || new Date()}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                // 마지막 선택한 날짜 업데이트
                                                setLastSelectedDate(date);
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const formattedDate = `${month}/${day}`;
                                                onUpdate(schedule.id, 'date', formattedDate);
                                            } else {
                                                onUpdate(schedule.id, 'date', '');
                                            }
                                        }}
                                        dateFormat="MM/dd"
                                        locale={ko}
                                        placeholderText="MM/DD"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        showPopperArrow={false}
                                        popperClassName="react-datepicker-popper"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-40 text-center">
                                    <input
                                        type="text"
                                        value={schedule.flightSchedule}
                                        onChange={(e) => onUpdate(schedule.id, 'flightSchedule', e.target.value)}
                                        placeholder="항공일정"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.people}
                                        onChange={(e) => onUpdate(schedule.id, 'people', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    <input
                                        type="text"
                                        value={schedule.airline}
                                        onChange={(e) => onUpdate(schedule.id, 'airline', e.target.value)}
                                        placeholder="항공사"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    <input
                                        type="text"
                                        value={schedule.flightNumber}
                                        onChange={(e) => onUpdate(schedule.id, 'flightNumber', e.target.value)}
                                        placeholder="항공편명"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-28 text-center">
                                    <input
                                        type="text"
                                        value={schedule.baggage}
                                        onChange={(e) => onUpdate(schedule.id, 'baggage', e.target.value)}
                                        placeholder="수화물"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-28 text-center">
                                    <input
                                        type="text"
                                        value={schedule.duration}
                                        onChange={(e) => onUpdate(schedule.id, 'duration', e.target.value)}
                                        placeholder="소요시간"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    {regionType === 'japan' ? (
                                        <div className="text-lg font-medium text-gray-900" translate="no">
                                            {schedule.total || '-'}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={schedule.total}
                                            onChange={(e) => handleTotalChange(schedule.id, e)}
                                            placeholder="₩0"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            translate="no"
                                        />
                                    )}
                                </td>
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    {regionType === 'japan' ? (
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={schedule.total ? calculatePrepayment(schedule.total, parseInt(numberOfPeople)) : ''}
                                            onChange={(e) => handlePerPersonInputChange(schedule.id, e)}
                                            placeholder="₩0"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            translate="no"
                                        />
                                    ) : (
                                        <span className="text-lg font-medium text-gray-900" translate="no">
                                            {schedule.total ? `₩${calculatePrepayment(schedule.total, parseInt(numberOfPeople))}` : '-'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-1 py-1 text-lg text-center w-20">
                                    <Button
                                        onClick={() => onRemove(schedule.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {/* 총 합계 행 */}
                        {schedules.length > 0 && (
                            <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-t-2 border-blue-200">
                                <td colSpan={7} className="px-1 py-1 text-lg font-bold text-gray-900 text-left">총 합계(KRW)</td>
                                <td className="px-1 py-1 text-xl font-bold text-blue-900 w-32 text-center" translate="no">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                        return sum + total;
                                    }, 0)}
                                </td>
                                <td className="px-1 py-1 text-xl font-bold text-blue-900 w-32 text-center" translate="no">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const prepayment = calculatePrepayment(schedule.total, parseInt(numberOfPeople));
                                        return sum + parseInt(prepayment) || 0;
                                    }, 0)}
                                </td>
                                <td className="px-1 py-1 w-20"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
