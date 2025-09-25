'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { AccommodationSchedule } from '@/app/(admin)/admin/admin-tools/types';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface AccommodationTableProps {
    schedules: AccommodationSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof AccommodationSchedule, value: string) => void;
    onRemove: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
    calculatePrepayment: (total: string, numberOfPeople: number) => string;
}

export default function AccommodationTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    numberOfPeople,
    isFormValid,
    calculatePrepayment
}: AccommodationTableProps) {
    // 마지막 선택한 날짜 범위를 기억하는 상태
    const [lastSelectedDateRange, setLastSelectedDateRange] = useState<[Date | null, Date | null]>([null, null]);

    // 날짜 유효성 검사 함수
    const isValidDate = (date: Date): boolean => {
        return date instanceof Date && !isNaN(date.getTime());
    };

    const handleAddClick = () => {
        if (!isFormValid) {
            alert('먼저 고객명, 여행지, 여행기간, 인원을 모두 입력해주세요.');
            return;
        }
        onAdd();
    };
    const handleTotalChange = (id: string, total: string) => {
        // 숫자만 추출
        const numericValue = total.replace(/[₩,]/g, '');

        // 빈 값이면 그대로 저장
        if (numericValue === '') {
            onUpdate(id, 'total', '');
            return;
        }

        // 숫자로 변환
        const totalAmount = parseInt(numericValue) || 0;

        // 원화 표기만 추가 (천단위 콤마 없음)
        const formattedTotal = `₩${totalAmount}`;
        onUpdate(id, 'total', formattedTotal);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">숙박 (사전결제) 실시간 최저가 기준</h3>
                </div>
                <Button
                    onClick={handleAddClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    추가
                </Button>
            </div>

            <div className="w-full h-auto rounded-lg border border-gray-200">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-48">날짜</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">호텔명</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">박수</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">객실수</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-24">객실타입</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-24">식사포함여부</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">합계</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">사전결제(1인)</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-green-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-4 py-4 w-48 text-center">
                                    <DatePicker
                                        selected={(() => {
                                            if (!schedule.date) return null;
                                            if (schedule.date.includes('-')) {
                                                const [startDateStr] = schedule.date.split('-');
                                                const [year, month, day] = startDateStr.split('/');
                                                const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
                                                const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
                                                return isValidDate(date) ? date : null;
                                            }
                                            return null;
                                        })()}
                                        startDate={(() => {
                                            if (!schedule.date) return lastSelectedDateRange[0];
                                            if (schedule.date.includes('-')) {
                                                const [startDateStr] = schedule.date.split('-');
                                                const [year, month, day] = startDateStr.split('/');
                                                const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
                                                const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
                                                return isValidDate(date) ? date : lastSelectedDateRange[0];
                                            }
                                            return lastSelectedDateRange[0];
                                        })()}
                                        endDate={(() => {
                                            if (!schedule.date) return lastSelectedDateRange[1];
                                            if (schedule.date.includes('-')) {
                                                const [, endDateStr] = schedule.date.split('-');
                                                const parts = endDateStr.split('/');

                                                if (parts.length === 2) {
                                                    // 기존 형식: "10/16" - 시작 날짜의 연도 사용
                                                    const [startDateStr] = schedule.date.split('-');
                                                    const [startYear] = startDateStr.split('/');
                                                    const [month, day] = parts;
                                                    const fullYear = parseInt(startYear) < 50 ? 2000 + parseInt(startYear) : 1900 + parseInt(startYear);
                                                    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
                                                    return isValidDate(date) ? date : lastSelectedDateRange[1];
                                                } else if (parts.length === 3) {
                                                    // 새 형식: "25/10/16" - 연도 포함
                                                    const [year, month, day] = parts;
                                                    const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
                                                    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));
                                                    return isValidDate(date) ? date : lastSelectedDateRange[1];
                                                }
                                            }
                                            return lastSelectedDateRange[1];
                                        })()}
                                        selectsRange
                                        onChange={(dates: [Date | null, Date | null]) => {
                                            const [start, end] = dates;
                                            setLastSelectedDateRange([start, end]);

                                            if (start && end) {
                                                const startYear = start.getFullYear().toString().slice(-2);
                                                const startMonth = String(start.getMonth() + 1).padStart(2, '0');
                                                const startDay = String(start.getDate()).padStart(2, '0');
                                                const endYear = end.getFullYear().toString().slice(-2);
                                                const endMonth = String(end.getMonth() + 1).padStart(2, '0');
                                                const endDay = String(end.getDate()).padStart(2, '0');

                                                const formattedDate = `${startYear}/${startMonth}/${startDay}-${endYear}/${endMonth}/${endDay}`;
                                                onUpdate(schedule.id, 'date', formattedDate);
                                            } else {
                                                onUpdate(schedule.id, 'date', '');
                                            }
                                        }}
                                        dateFormat="yy/MM/dd"
                                        locale={ko}
                                        placeholderText="YY/MM/DD-MM/DD"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        showPopperArrow={false}
                                        popperClassName="react-datepicker-popper"
                                    />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <input
                                        type="text"
                                        value={schedule.hotelName}
                                        onChange={(e) => onUpdate(schedule.id, 'hotelName', e.target.value)}
                                        placeholder="호텔명"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.nights}
                                        onChange={(e) => onUpdate(schedule.id, 'nights', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.rooms}
                                        onChange={(e) => onUpdate(schedule.id, 'rooms', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-24 text-center">
                                    <input
                                        type="text"
                                        value={schedule.roomType}
                                        onChange={(e) => onUpdate(schedule.id, 'roomType', e.target.value)}
                                        placeholder="슈페리어룸"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-24 text-center">
                                    <input
                                        type="text"
                                        value={schedule.meals}
                                        onChange={(e) => onUpdate(schedule.id, 'meals', e.target.value)}
                                        placeholder="조식"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <input
                                        type="text"
                                        value={schedule.total}
                                        onChange={(e) => handleTotalChange(schedule.id, e.target.value)}
                                        placeholder="₩0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        translate="no"
                                    />
                                </td>
                                <td className="px-4 py-4 w-32 text-center" translate="no">
                                    <span className="text-lg font-medium text-gray-900">
                                        {schedule.total ? `₩${calculatePrepayment(schedule.total, parseInt(numberOfPeople))}` : '-'}
                                    </span>
                                </td>
                                <td className="px-4 py-4 text-center w-20">
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
                            <tr className="bg-gradient-to-r from-green-50 to-green-100 border-t-2 border-green-200">
                                <td colSpan={6} className="px-4 py-4 text-sm font-bold text-gray-900 text-left">총 합계(KRW)</td>
                                <td className="px-4 py-4 text-lg font-bold text-green-900 w-32 text-center" translate="no">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                        return sum + total;
                                    }, 0)}
                                </td>
                                <td className="px-4 py-4 text-lg font-bold text-green-900 w-32 text-center" translate="no">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const prepayment = calculatePrepayment(schedule.total, parseInt(numberOfPeople));
                                        return sum + parseInt(prepayment) || 0;
                                    }, 0)}
                                </td>
                                <td className="px-4 py-4 w-20"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
