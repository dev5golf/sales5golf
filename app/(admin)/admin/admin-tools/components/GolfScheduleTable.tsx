'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2, Copy } from 'lucide-react';
import { GolfSchedule } from '@/app/(admin)/admin/admin-tools/types';
import { INCLUSION_OPTIONS } from '../../../../../constants/quotationConstants';
import GolfCourseAutocomplete from '../../components/GolfCourseAutocomplete';
import { Course } from '@/types';
import { createAddClickHandler } from '@/lib/utils/tableUtils';
import { createInclusionChangeHandler, createCourseSelectHandler, createTotalChangeHandler, createSingleFieldDirectInputToggleHandler } from '@/lib/utils/tableHandlers';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface GolfScheduleTableProps {
    schedules: GolfSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof GolfSchedule, value: string | string[]) => void;
    onRemove: (id: string) => void;
    onCopy: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
    calculatePrepayment: (total: string, numberOfPeople: number) => string;
    regionType?: 'basic' | 'japan';
    calculateTotalFromPerPerson?: (perPersonAmount: string, numberOfPeople: number) => string;
}

export default function GolfScheduleTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    onCopy,
    numberOfPeople,
    isFormValid,
    calculatePrepayment,
    regionType = 'basic',
    calculateTotalFromPerPerson
}: GolfScheduleTableProps) {
    // 마지막 선택한 날짜를 기억하는 상태
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);
    // 각 스케줄별 직접입력 모드 상태
    const [directInputMode, setDirectInputMode] = useState<{ [key: string]: boolean }>({});
    // 각 스케줄별 예상금액 체크박스 상태
    const [estimatedAmountMode, setEstimatedAmountMode] = useState<{ [key: string]: boolean }>({});

    const handleAddClick = createAddClickHandler(isFormValid, onAdd);
    // 공통 핸들러 함수들
    const handleInclusionChange = createInclusionChangeHandler(schedules, onUpdate);
    const handleCourseSelect = createCourseSelectHandler(onUpdate);
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

    // 직접입력 모드 토글 핸들러
    const handleDirectInputToggle = createSingleFieldDirectInputToggleHandler(directInputMode, setDirectInputMode, onUpdate, 'teeOffDirectInput');

    // 예상금액 모드 토글 핸들러
    const handleEstimatedAmountToggle = (id: string) => {
        const newValue = !estimatedAmountMode[id];
        setEstimatedAmountMode(prev => ({
            ...prev,
            [id]: newValue
        }));
        // DB에도 저장
        onUpdate(id, 'isEstimatedAmount', newValue.toString());
    };

    // schedules가 변경될 때 체크박스 상태 복원
    useEffect(() => {
        const newDirectInputMode: { [key: string]: boolean } = {};
        const newEstimatedAmountMode: { [key: string]: boolean } = {};

        schedules.forEach(schedule => {
            // 문자열을 boolean으로 변환
            newDirectInputMode[schedule.id] = schedule.teeOffDirectInput === 'true';
            newEstimatedAmountMode[schedule.id] = schedule.isEstimatedAmount === 'true';
        });

        setDirectInputMode(newDirectInputMode);
        setEstimatedAmountMode(newEstimatedAmountMode);
    }, [schedules]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">골프 (사전결제)</h3>
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
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700">골프장명</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-28">홀수(H)</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-40">포함사항</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-40">TEE-OFF</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">합계</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">사전결제(1인)</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">복사</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-blue-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-1 py-1 w-32 text-center text-lg">
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
                                <td className="px-1 py-1 text-center text-lg">
                                    <GolfCourseAutocomplete
                                        value={schedule.courseName}
                                        onChange={(value) => onUpdate(schedule.id, 'courseName', value)}
                                        onSelect={(course) => handleCourseSelect(schedule.id, course)}
                                        placeholder="골프장명을 검색하세요"
                                        className="w-full"
                                    />
                                </td>
                                <td className="px-1 py-1 w-28 text-center text-lg">
                                    <input
                                        type="number"
                                        value={schedule.holes}
                                        onChange={(e) => onUpdate(schedule.id, 'holes', e.target.value)}
                                        placeholder="18"
                                        defaultValue="18"
                                        min="9"
                                        max="36"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-center text-lg">
                                    <div className="flex flex-wrap gap-2 justify-center">
                                        {INCLUSION_OPTIONS.map((option) => (
                                            <label key={option} className="flex items-center text-sm cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule.inclusions.includes(option)}
                                                    onChange={(e) => handleInclusionChange(schedule.id, option, e.target.checked)}
                                                    className="mr-2 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-gray-700">{option}</span>
                                            </label>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-1 py-1 w-32 text-center text-lg">
                                    <div className="space-y-2">
                                        {/* 직접입력 체크박스 */}
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={directInputMode[schedule.id] || false}
                                                    onChange={() => handleDirectInputToggle(schedule.id)}
                                                    className="mr-1 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-gray-600">직접입력</span>
                                            </label>
                                        </div>

                                        {/* 조건부 렌더링: 직접입력 모드일 때 입력폼, 아니면 선택박스 */}
                                        {directInputMode[schedule.id] ? (
                                            <input
                                                type="text"
                                                value={schedule.teeOff}
                                                onChange={(e) => onUpdate(schedule.id, 'teeOff', e.target.value)}
                                                placeholder="직접 입력"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            />
                                        ) : (
                                            <select
                                                value={schedule.teeOff}
                                                onChange={(e) => onUpdate(schedule.id, 'teeOff', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">선택</option>
                                                <option value="오전">오전</option>
                                                <option value="오후">오후</option>
                                                <option value="야간">야간</option>
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td className="px-1 py-1 w-32 text-center text-lg">
                                    <div className="space-y-2">
                                        {/* 합계 표시 */}
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
                                            />
                                        )}

                                        {/* 예상금액 체크박스 */}
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={estimatedAmountMode[schedule.id] || false}
                                                    onChange={() => handleEstimatedAmountToggle(schedule.id)}
                                                    className="mr-1 w-3 h-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                />
                                                <span className="text-gray-600">(예상금액)</span>
                                            </label>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-1 py-1 w-32 text-center text-lg" translate="no">
                                    {regionType === 'japan' ? (
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={schedule.total ? `₩${calculatePrepayment(schedule.total, parseInt(numberOfPeople))}` : ''}
                                            onChange={(e) => handlePerPersonInputChange(schedule.id, e)}
                                            placeholder="₩0"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                        />
                                    ) : (
                                        <span className="font-medium text-gray-900">
                                            {schedule.total ? `₩${calculatePrepayment(schedule.total, parseInt(numberOfPeople))}` : '-'}
                                        </span>
                                    )}
                                </td>
                                <td className="px-1 py-1 text-center w-20 text-lg">
                                    <Button
                                        onClick={() => onCopy(schedule.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </td>
                                <td className="px-1 py-1 text-center w-20 text-lg">
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
                                <td colSpan={5} className="px-1 py-1 text-lg font-bold text-gray-900 text-left">
                                    총 합계(KRW){schedules.some(schedule => estimatedAmountMode[schedule.id]) && <span className="text-blue-600 ml-1">(예상금액)</span>}
                                </td>
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
                                <td className="px-1 py-1 w-20"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
