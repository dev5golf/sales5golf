'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { GolfSchedule } from '../../../../../hooks/useQuotationData';
import { INCLUSION_OPTIONS } from '../../../../../constants/quotationConstants';
import GolfCourseAutocomplete from '../../components/GolfCourseAutocomplete';
import { Course } from '../../../../../types';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface GolfOnSiteTableProps {
    schedules: GolfSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof GolfSchedule, value: string | string[]) => void;
    onRemove: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
    calculatePrepayment: (total: string, numberOfPeople: number) => string;
}

export default function GolfOnSiteTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    numberOfPeople,
    isFormValid,
    calculatePrepayment
}: GolfOnSiteTableProps) {
    // 마지막 선택한 날짜를 기억하는 상태
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);

    // 환율 (1엔 = 8.5원으로 설정, 실제로는 API에서 가져올 수 있음)
    const exchangeRate = 8.5;

    // 엔화를 원화로 변환하는 함수
    const convertYenToWon = (yenAmount: number): number => {
        return Math.round(yenAmount * exchangeRate);
    };

    // 원화를 엔화로 변환하는 함수
    const convertWonToYen = (wonAmount: number): number => {
        return Math.round(wonAmount / exchangeRate);
    };

    const handleAddClick = () => {
        if (!isFormValid) {
            alert('먼저 고객명, 여행지, 여행기간, 인원을 모두 입력해주세요.');
            return;
        }
        onAdd();
    };
    const handleInclusionChange = (id: string, inclusion: string, checked: boolean) => {
        const schedule = schedules.find(s => s.id === id);
        if (!schedule) return;

        let newInclusions = [...schedule.inclusions];
        if (checked) {
            newInclusions.push(inclusion);
        } else {
            newInclusions = newInclusions.filter(item => item !== inclusion);
        }

        onUpdate(id, 'inclusions', newInclusions);
    };

    const handleCourseSelect = (id: string, course: Course) => {
        // 골프장명 업데이트
        onUpdate(id, 'courseName', course.name);

        // 포함사항 자동 설정 (골프장의 inclusions가 있으면 사용, 없으면 기본값)
        const inclusions = course.inclusions && course.inclusions.length > 0
            ? course.inclusions
            : [...INCLUSION_OPTIONS];

        onUpdate(id, 'inclusions', inclusions);
    };

    const handleTotalChange = (id: string, yenAmount: string) => {
        // 숫자만 추출
        const numericValue = yenAmount.replace(/[¥,]/g, '');

        // 빈 값이면 그대로 저장
        if (numericValue === '') {
            onUpdate(id, 'total', '');
            return;
        }

        // 숫자로 변환
        const yen = parseInt(numericValue) || 0;

        // 엔화 금액을 원화로 변환하여 저장 (천단위 콤마 없음)
        const wonAmount = convertYenToWon(yen);
        const wonFormatted = `₩${wonAmount}`;

        onUpdate(id, 'total', wonFormatted);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">골프 (현장결제)</h3>
                </div>
                <Button
                    onClick={handleAddClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    추가
                </Button>
            </div>

            <div className="w-full h-auto rounded-lg border border-gray-200">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">날짜</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">골프장명</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">홀수(H)</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">포함사항</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">TEE-OFF</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">
                                합계
                            </th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">
                                현장결제(1인)
                            </th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-orange-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-4 py-4 w-32 text-center">
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
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        showPopperArrow={false}
                                        popperClassName="react-datepicker-popper"
                                    />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <GolfCourseAutocomplete
                                        value={schedule.courseName}
                                        onChange={(value) => onUpdate(schedule.id, 'courseName', value)}
                                        onSelect={(course) => handleCourseSelect(schedule.id, course)}
                                        placeholder="골프장명을 검색하세요"
                                        className="w-full"
                                    />
                                </td>
                                <td className="px-4 py-4 w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.holes}
                                        onChange={(e) => onUpdate(schedule.id, 'holes', e.target.value)}
                                        placeholder="18"
                                        defaultValue="18"
                                        min="9"
                                        max="36"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 text-center">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {INCLUSION_OPTIONS.map((option) => (
                                            <label key={option} className="flex items-center text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule.inclusions.includes(option)}
                                                    onChange={(e) => handleInclusionChange(schedule.id, option, e.target.checked)}
                                                    className="mr-2 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                                                />
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <select
                                        value={schedule.teeOff}
                                        onChange={(e) => onUpdate(schedule.id, 'teeOff', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                    >
                                        <option value="">선택</option>
                                        <option value="오전">오전</option>
                                        <option value="오후">오후</option>
                                    </select>
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <div className="space-y-1">
                                        <input
                                            type="text"
                                            value={(() => {
                                                // 저장된 원화 금액을 엔화로 역변환하여 표시
                                                const wonAmount = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                                const yenAmount = convertWonToYen(wonAmount);
                                                return yenAmount > 0 ? `¥${yenAmount.toLocaleString()}` : '';
                                            })()}
                                            onChange={(e) => handleTotalChange(schedule.id, e.target.value)}
                                            placeholder="¥0"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        />
                                        <div className="text-xs text-gray-500">
                                            {schedule.total || '₩0'}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <div className="space-y-1">
                                        {schedule.total ? (
                                            <>
                                                <div className="text-lg font-medium text-gray-900">
                                                    ¥{convertWonToYen(parseInt(calculatePrepayment(schedule.total, parseInt(numberOfPeople)))).toLocaleString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    ₩{calculatePrepayment(schedule.total, parseInt(numberOfPeople))}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-lg font-medium text-gray-900">-</div>
                                        )}
                                    </div>
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
                            <tr className="bg-gradient-to-r from-orange-50 to-orange-100 border-t-2 border-orange-200">
                                <td colSpan={5} className="px-4 py-4 text-sm font-bold text-gray-900 text-left">총 합계(KRW)</td>
                                <td className="px-4 py-4 text-lg font-bold text-orange-900 w-32 text-center">
                                    <div className="space-y-1">
                                        <div>
                                            ¥{convertWonToYen(schedules.reduce((sum, schedule) => {
                                                const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                                return sum + total;
                                            }, 0)).toLocaleString()}
                                        </div>
                                        <div className="text-xs font-normal text-orange-700">
                                            ₩{schedules.reduce((sum, schedule) => {
                                                const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                                return sum + total;
                                            }, 0).toLocaleString()}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-4 text-lg font-bold text-orange-900 w-32 text-center">
                                    <div className="space-y-1">
                                        <div>
                                            ¥{convertWonToYen(schedules.reduce((sum, schedule) => {
                                                const prepayment = calculatePrepayment(schedule.total, parseInt(numberOfPeople));
                                                return sum + parseInt(prepayment) || 0;
                                            }, 0)).toLocaleString()}
                                        </div>
                                        <div className="text-xs font-normal text-orange-700">
                                            ₩{schedules.reduce((sum, schedule) => {
                                                const prepayment = calculatePrepayment(schedule.total, parseInt(numberOfPeople));
                                                return sum + parseInt(prepayment) || 0;
                                            }, 0).toLocaleString()}
                                        </div>
                                    </div>
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
