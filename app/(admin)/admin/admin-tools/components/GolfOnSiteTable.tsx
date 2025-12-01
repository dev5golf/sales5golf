'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { GolfSchedule } from '@/app/(admin)/admin/admin-tools/types';
import { INCLUSION_OPTIONS } from '../../../../../constants/quotationConstants';
import GolfCourseAutocomplete from '../../components/GolfCourseAutocomplete';
import { CourseWithTranslations } from '../../../../../types';
import { createAddClickHandler } from '@/lib/utils/tableUtils';
import { createInclusionChangeHandler, createCourseSelectHandler, createOnSiteTotalChangeHandler, createSingleFieldDirectInputToggleHandler } from '@/lib/utils/tableHandlers';
import { convertYenToWon, convertWonToYen } from '../../../../../lib/utils';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface GolfOnSiteTableProps {
    schedules: GolfSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof GolfSchedule, value: string | string[]) => void;
    onRemove: (id: string) => void;
    onCopy: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
    calculatePrepayment: (total: string, numberOfPeople: number) => string;
    exchangeRate?: number; // 환율 추가
    regionType?: 'basic' | 'japan';
    calculateTotalFromPerPerson?: (perPersonAmount: string, numberOfPeople: number) => string;
}

export default function GolfOnSiteTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    onCopy,
    onMoveUp,
    onMoveDown,
    numberOfPeople,
    isFormValid,
    calculatePrepayment,
    exchangeRate = 8.5, // 환율 기본값 8.5
    regionType = 'basic',
    calculateTotalFromPerPerson
}: GolfOnSiteTableProps) {
    // 마지막 선택한 날짜를 기억하는 상태
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);
    // 각 스케줄별 직접입력 모드 상태 (티오프)
    const [directInputMode, setDirectInputMode] = useState<{ [key: string]: boolean }>({});


    const handleAddClick = createAddClickHandler(isFormValid, onAdd);
    // 공통 핸들러 함수들
    const handleInclusionChange = createInclusionChangeHandler(schedules, onUpdate);
    const handleCourseSelect = createCourseSelectHandler(onUpdate);
    const handleTotalChange = createOnSiteTotalChangeHandler(onUpdate, (yenAmount: number) => convertYenToWon(yenAmount, exchangeRate));

    // 직접입력 모드 토글 핸들러
    const handleDirectInputToggle = createSingleFieldDirectInputToggleHandler(directInputMode, setDirectInputMode, onUpdate, 'teeOffDirectInput');


    // 일본 지역일 때 현장결제(1인) 입력 시 합계 자동 계산 핸들러
    const handlePerPersonInputChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // 숫자만 추출 (엔화 입력)
        const numericValue = value.replace(/[^\d]/g, '');

        if (numericValue) {
            // 1인당 엔화 요금을 총 엔화 금액으로 계산
            const perPersonYen = parseInt(numericValue);
            const totalYen = perPersonYen * parseInt(numberOfPeople);

            // 총 엔화 금액을 원화로 변환 (내부 저장용)
            const totalWon = Math.round(totalYen * exchangeRate);

            onUpdate(id, 'yenAmount', totalYen.toString());
            onUpdate(id, 'total', `₩${totalWon}`);
        } else {
            onUpdate(id, 'total', '');
            onUpdate(id, 'yenAmount', '');
        }
    };

    // schedules가 변경될 때 체크박스 상태 복원
    useEffect(() => {
        const newDirectInputMode: { [key: string]: boolean } = {};

        schedules.forEach(schedule => {
            newDirectInputMode[schedule.id] = schedule.teeOffDirectInput === 'true';
        });

        setDirectInputMode(newDirectInputMode);
    }, [schedules]);

    // 환율이 변경될 때 원화 금액만 다시 계산
    useEffect(() => {
        schedules.forEach(schedule => {
            if (schedule.yenAmount) {
                const yenAmount = parseInt(schedule.yenAmount);
                const wonAmount = convertYenToWon(yenAmount, exchangeRate);
                const wonFormatted = `₩${wonAmount}`;

                // 원화 금액만 업데이트 (엔화는 그대로 유지)
                if (schedule.total !== wonFormatted) {
                    onUpdate(schedule.id, 'total', wonFormatted);
                }
            }
        });
    }, [exchangeRate, schedules, onUpdate, convertYenToWon]);

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
                <table className="w-full table-auto">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">날짜</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700">골프장명</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-28">홀수(H)</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-40">포함사항</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-40">TEE-OFF</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">
                                합계
                            </th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">
                                현장결제(1인)
                            </th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">이동</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">복사</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-orange-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    <DatePicker
                                        key={`${schedule.id}-${lastSelectedDate?.getTime() || 'empty'}`}
                                        selected={(() => {
                                            if (!schedule.date) return null;

                                            // YY/MM/DD 또는 MM/DD 형식인 경우 Date 객체로 변환
                                            if (schedule.date.includes('/')) {
                                                const parts = schedule.date.split('/');
                                                if (parts.length === 3) {
                                                    // YY/MM/DD 형식
                                                    const [year, month, day] = parts;
                                                    const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
                                                    return new Date(fullYear, parseInt(month) - 1, parseInt(day));
                                                } else if (parts.length === 2) {
                                                    // MM/DD 형식 (기존 호환성)
                                                    const [month, day] = parts;
                                                    const currentYear = new Date().getFullYear();
                                                    return new Date(currentYear, parseInt(month) - 1, parseInt(day));
                                                }
                                            }

                                            return null;
                                        })()}
                                        openToDate={lastSelectedDate || new Date()}
                                        onChange={(date: Date | null) => {
                                            if (date) {
                                                // 마지막 선택한 날짜 업데이트
                                                setLastSelectedDate(date);
                                                const year = String(date.getFullYear()).slice(-2); // 마지막 2자리
                                                const month = String(date.getMonth() + 1).padStart(2, '0');
                                                const day = String(date.getDate()).padStart(2, '0');
                                                const formattedDate = `${year}/${month}/${day}`;
                                                onUpdate(schedule.id, 'date', formattedDate);
                                            } else {
                                                onUpdate(schedule.id, 'date', '');
                                            }
                                        }}
                                        dateFormat="yy/MM/dd (E)"
                                        locale={ko}
                                        placeholderText="YY/MM/DD (요일)"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        showPopperArrow={false}
                                        popperClassName="react-datepicker-popper"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg text-center">
                                    <GolfCourseAutocomplete
                                        value={schedule.courseName}
                                        onChange={(value) => onUpdate(schedule.id, 'courseName', value)}
                                        onSelect={(course) => handleCourseSelect(schedule.id, course)}
                                        placeholder="골프장명을 검색하세요"
                                        className="w-full"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-28 text-center">
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
                                <td className="px-1 py-1 text-lg text-center">
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
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    <div className="space-y-2">
                                        {/* 직접입력 체크박스 */}
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={directInputMode[schedule.id] || false}
                                                    onChange={() => handleDirectInputToggle(schedule.id)}
                                                    className="mr-1 w-3 h-3 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
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
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            />
                                        ) : (
                                            <select
                                                value={schedule.teeOff}
                                                onChange={(e) => onUpdate(schedule.id, 'teeOff', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">선택</option>
                                                <option value="오전">오전</option>
                                                <option value="오후">오후</option>
                                                <option value="야간">야간</option>
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    {regionType === 'japan' ? (
                                        <div className="text-lg font-medium text-gray-900" translate="no">
                                            {schedule.yenAmount ? `¥${schedule.yenAmount}` : '-'}
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={schedule.yenAmount ? `¥${schedule.yenAmount}` : ''}
                                            onChange={(e) => handleTotalChange(schedule.id, e)}
                                            placeholder="¥0"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                            translate="no"
                                        />
                                    )}
                                </td>
                                <td className="px-1 py-1 text-lg w-32 text-center" translate="no">
                                    {regionType === 'japan' ? (
                                        <input
                                            type="text"
                                            inputMode="numeric"
                                            pattern="[0-9]*"
                                            value={schedule.yenAmount ? `¥${Math.round(parseInt(schedule.yenAmount) / parseInt(numberOfPeople))}` : ''}
                                            onChange={(e) => handlePerPersonInputChange(schedule.id, e)}
                                            placeholder="¥0"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                                        />
                                    ) : (
                                        <div className="font-medium text-gray-900">
                                            {schedule.yenAmount ? (
                                                `¥${Math.round(parseInt(schedule.yenAmount) / parseInt(numberOfPeople))}`
                                            ) : (
                                                '-'
                                            )}
                                        </div>
                                    )}
                                </td>
                                <td className="px-1 py-1 text-center w-20 text-lg">
                                    <div className="flex flex-col items-center gap-1">
                                        <Button
                                            onClick={() => onMoveUp(schedule.id)}
                                            variant="outline"
                                            size="sm"
                                            disabled={index === 0}
                                            className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1"
                                            title="위로 이동"
                                        >
                                            <ChevronUp className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            onClick={() => onMoveDown(schedule.id)}
                                            variant="outline"
                                            size="sm"
                                            disabled={index === schedules.length - 1}
                                            className="text-gray-600 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed p-1"
                                            title="아래로 이동"
                                        >
                                            <ChevronDown className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                                <td className="px-1 py-1 text-center w-20 text-lg">
                                    <Button
                                        onClick={() => onCopy(schedule.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:border-orange-300 transition-colors"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
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
                            <tr className="bg-gradient-to-r from-orange-50 to-orange-100 border-t-2 border-orange-200">
                                <td colSpan={5} className="px-1 py-1 text-lg font-bold text-gray-900 text-left">총 합계(JPY)</td>
                                <td className="px-1 py-1 text-xl font-bold text-orange-900 w-32 text-center" translate="no">
                                    ¥{schedules.reduce((sum, schedule) => {
                                        const yenAmount = parseInt(schedule.yenAmount || '0') || 0;
                                        return sum + yenAmount;
                                    }, 0)}
                                </td>
                                <td className="px-1 py-1 text-xl font-bold text-orange-900 w-32 text-center" translate="no">
                                    ¥{Math.round(schedules.reduce((sum, schedule) => {
                                        const yenAmount = parseInt(schedule.yenAmount || '0') || 0;
                                        return sum + yenAmount;
                                    }, 0) / parseInt(numberOfPeople))}
                                </td>
                                <td className="px-1 py-1 w-20"></td>
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
