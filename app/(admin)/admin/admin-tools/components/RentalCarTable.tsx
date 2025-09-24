'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { RentalCarSchedule } from '../../../../../types';
import { RENTAL_CAR_PICKUP_LOCATIONS, RENTAL_CAR_RETURN_LOCATIONS, RENTAL_CAR_TYPES, RENTAL_CAR_PICKUP_TIMES, RENTAL_CAR_RETURN_TIMES } from '../../../../../constants/quotationConstants';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface RentalCarTableProps {
    schedules: RentalCarSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof RentalCarSchedule, value: string) => void;
    onRemove: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
    calculatePrepayment: (total: string, numberOfPeople: number) => string;
    isOnSite?: boolean; // 현장결제 여부
    exchangeRate?: number; // 환율 추가
}

export default function RentalCarTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    numberOfPeople,
    isFormValid,
    calculatePrepayment,
    isOnSite = false,
    exchangeRate = 8.5 // 환율 기본값 8.5
}: RentalCarTableProps) {
    // 마지막 선택한 날짜 범위를 기억하는 상태
    const [lastSelectedDateRange, setLastSelectedDateRange] = useState<[Date | null, Date | null]>([null, null]);
    // 각 스케줄별 직접입력 모드 상태 (픽업장소, 반납장소, 대표차종)
    const [directInputMode, setDirectInputMode] = useState<{ [key: string]: { pickupLocation: boolean; returnLocation: boolean; carType: boolean } }>({});

    // 날짜 유효성 검사 함수
    const isValidDate = (date: Date): boolean => {
        return date instanceof Date && !isNaN(date.getTime());
    };

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

    // 직접입력 모드 토글 핸들러
    const handleDirectInputToggle = (id: string, field: 'pickupLocation' | 'returnLocation' | 'carType') => {
        const newValue = !directInputMode[id]?.[field];
        setDirectInputMode(prev => ({
            ...prev,
            [id]: {
                ...prev[id],
                [field]: newValue
            }
        }));
        // DB에도 저장
        const dbField = `${field}DirectInput`;
        onUpdate(id, dbField as keyof RentalCarSchedule, newValue.toString());
    };

    const handleTotalChange = (id: string, total: string) => {
        // 숫자만 추출
        const numericValue = total.replace(/[₩,¥]/g, '');

        // 빈 값이면 그대로 저장
        if (numericValue === '') {
            onUpdate(id, 'total', '');
            if (isOnSite) {
                onUpdate(id, 'yenAmount', '');
            }
            return;
        }

        // 숫자로 변환
        const totalAmount = parseInt(numericValue) || 0;

        if (isOnSite) {
            // 현장결제: 엔화 금액을 별도로 저장하고 원화로 변환하여 저장
            onUpdate(id, 'yenAmount', totalAmount.toString());
            const wonAmount = convertYenToWon(totalAmount);
            const wonFormatted = `₩${wonAmount}`;
            onUpdate(id, 'total', wonFormatted);
        } else {
            // 사전결제: 원화 그대로 저장
            const formattedTotal = `₩${totalAmount}`;
            onUpdate(id, 'total', formattedTotal);
        }
    };

    // schedules가 변경될 때 체크박스 상태 복원
    useEffect(() => {
        const newDirectInputMode: { [key: string]: { pickupLocation: boolean; returnLocation: boolean; carType: boolean } } = {};

        schedules.forEach(schedule => {
            newDirectInputMode[schedule.id] = {
                pickupLocation: schedule.pickupLocationDirectInput === 'true',
                returnLocation: schedule.returnLocationDirectInput === 'true',
                carType: schedule.carTypeDirectInput === 'true'
            };
        });

        setDirectInputMode(newDirectInputMode);
    }, [schedules]);

    // 환율이 변경될 때 원화 금액만 다시 계산 (현장결제만)
    useEffect(() => {
        if (isOnSite) {
            schedules.forEach(schedule => {
                if (schedule.yenAmount) {
                    const yenAmount = parseInt(schedule.yenAmount);
                    const wonAmount = convertYenToWon(yenAmount);
                    const wonFormatted = `₩${wonAmount}`;

                    // 원화 금액만 업데이트 (엔화는 그대로 유지)
                    if (schedule.total !== wonFormatted) {
                        onUpdate(schedule.id, 'total', wonFormatted);
                    }
                }
            });
        }
    }, [exchangeRate, schedules, isOnSite, onUpdate, convertYenToWon]);

    const tableTitle = isOnSite ? '렌트카 (현장결제)' : '렌트카 (사전결제)';
    const colorClass = isOnSite ? 'green' : 'orange';
    const bgColorClass = isOnSite ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300' : 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100 hover:border-orange-300';
    const headerColorClass = isOnSite ? 'from-green-50 to-green-100 border-green-200' : 'from-orange-50 to-orange-100 border-orange-200';
    const rowHoverClass = isOnSite ? 'hover:bg-green-50/50' : 'hover:bg-orange-50/50';
    const totalRowClass = isOnSite ? 'from-green-50 to-green-100 border-green-200' : 'from-orange-50 to-orange-100 border-orange-200';
    const totalTextClass = isOnSite ? 'text-green-900' : 'text-orange-900';
    const focusRingClass = isOnSite ? 'focus:ring-green-500' : 'focus:ring-orange-500';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className={`w-1 h-6 bg-${colorClass}-500 rounded-full`}></div>
                    <h3 className="text-xl font-semibold text-gray-900">{tableTitle}</h3>
                </div>
                <Button
                    onClick={handleAddClick}
                    variant="outline"
                    size="sm"
                    className={`flex items-center gap-2 ${bgColorClass} transition-colors`}
                >
                    <Plus className="h-4 w-4" />
                    추가
                </Button>
            </div>

            <div className="w-full h-auto rounded-lg border border-gray-200">
                <table className="w-full table-fixed">
                    <thead>
                        <tr className={`bg-gradient-to-r ${headerColorClass} border-b border-gray-200`}>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-48">날짜</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-40">픽업장소</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">픽업시간</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-40">반납장소</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">반납시간</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">인원</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">이용일수</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">대표차종</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">합계</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">현장결제(1인)</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`${rowHoverClass} transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
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
                                        className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                        showPopperArrow={false}
                                        popperClassName="react-datepicker-popper"
                                    />
                                </td>
                                <td className="px-4 py-4 w-40 text-center">
                                    <div className="space-y-2">
                                        {/* 직접입력 체크박스 */}
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={directInputMode[schedule.id]?.pickupLocation || false}
                                                    onChange={() => handleDirectInputToggle(schedule.id, 'pickupLocation')}
                                                    className="mr-1 w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-gray-600">직접입력</span>
                                            </label>
                                        </div>

                                        {/* 조건부 렌더링: 직접입력 모드일 때 입력폼, 아니면 선택박스 */}
                                        {directInputMode[schedule.id]?.pickupLocation ? (
                                            <input
                                                type="text"
                                                value={schedule.pickupLocation}
                                                onChange={(e) => onUpdate(schedule.id, 'pickupLocation', e.target.value)}
                                                placeholder="픽업장소 입력"
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                            />
                                        ) : (
                                            <select
                                                value={schedule.pickupLocation}
                                                onChange={(e) => onUpdate(schedule.id, 'pickupLocation', e.target.value)}
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                            >
                                                <option value="">선택하세요</option>
                                                {RENTAL_CAR_PICKUP_LOCATIONS.map((location) => (
                                                    <option key={location} value={location}>{location}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4 w-28 text-center">
                                    <select
                                        value={schedule.pickupTime}
                                        onChange={(e) => onUpdate(schedule.id, 'pickupTime', e.target.value)}
                                        className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                    >
                                        <option value="">선택하세요</option>
                                        {RENTAL_CAR_PICKUP_TIMES.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-4 w-40 text-center">
                                    <div className="space-y-2">
                                        {/* 직접입력 체크박스 */}
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={directInputMode[schedule.id]?.returnLocation || false}
                                                    onChange={() => handleDirectInputToggle(schedule.id, 'returnLocation')}
                                                    className="mr-1 w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-gray-600">직접입력</span>
                                            </label>
                                        </div>

                                        {/* 조건부 렌더링: 직접입력 모드일 때 입력폼, 아니면 선택박스 */}
                                        {directInputMode[schedule.id]?.returnLocation ? (
                                            <input
                                                type="text"
                                                value={schedule.returnLocation}
                                                onChange={(e) => onUpdate(schedule.id, 'returnLocation', e.target.value)}
                                                placeholder="반납장소 입력"
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                            />
                                        ) : (
                                            <select
                                                value={schedule.returnLocation}
                                                onChange={(e) => onUpdate(schedule.id, 'returnLocation', e.target.value)}
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                            >
                                                <option value="">선택하세요</option>
                                                {RENTAL_CAR_RETURN_LOCATIONS.map((location) => (
                                                    <option key={location} value={location}>{location}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4 w-28 text-center">
                                    <select
                                        value={(schedule as any).returnTime || ''}
                                        onChange={(e) => onUpdate(schedule.id, 'returnTime' as keyof RentalCarSchedule, e.target.value)}
                                        className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                    >
                                        <option value="">선택하세요</option>
                                        {RENTAL_CAR_RETURN_TIMES.map((time) => (
                                            <option key={time} value={time}>{time}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-4 w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.people}
                                        onChange={(e) => onUpdate(schedule.id, 'people', e.target.value)}
                                        min="1"
                                        className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                    />
                                </td>
                                <td className="px-4 py-4 w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.rentalDays}
                                        onChange={(e) => onUpdate(schedule.id, 'rentalDays', e.target.value)}
                                        min="1"
                                        className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                    />
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <div className="space-y-2">
                                        {/* 직접입력 체크박스 */}
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={directInputMode[schedule.id]?.carType || false}
                                                    onChange={() => handleDirectInputToggle(schedule.id, 'carType')}
                                                    className="mr-1 w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-gray-600">직접입력</span>
                                            </label>
                                        </div>

                                        {/* 조건부 렌더링: 직접입력 모드일 때 입력폼, 아니면 선택박스 */}
                                        {directInputMode[schedule.id]?.carType ? (
                                            <input
                                                type="text"
                                                value={schedule.carType}
                                                onChange={(e) => onUpdate(schedule.id, 'carType', e.target.value)}
                                                placeholder="차종 입력"
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                            />
                                        ) : (
                                            <select
                                                value={schedule.carType}
                                                onChange={(e) => onUpdate(schedule.id, 'carType', e.target.value)}
                                                className={`w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                            >
                                                <option value="">선택하세요</option>
                                                {RENTAL_CAR_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    {isOnSite ? (
                                        <input
                                            type="text"
                                            value={schedule.yenAmount ? `¥${schedule.yenAmount}` : ''}
                                            onChange={(e) => handleTotalChange(schedule.id, e.target.value)}
                                            placeholder="¥0"
                                            className={`w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                        />
                                    ) : (
                                        <input
                                            type="text"
                                            value={schedule.total}
                                            onChange={(e) => handleTotalChange(schedule.id, e.target.value)}
                                            placeholder="₩0"
                                            className={`w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 ${focusRingClass} focus:border-transparent transition-all`}
                                        />
                                    )}
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    {isOnSite ? (
                                        <div className="text-lg font-medium text-gray-900">
                                            {schedule.yenAmount ? (
                                                `¥${Math.round(parseInt(schedule.yenAmount) / parseInt(numberOfPeople))}`
                                            ) : (
                                                '-'
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-lg font-medium text-gray-900">
                                            {schedule.total ? `₩${calculatePrepayment(schedule.total, parseInt(numberOfPeople))}` : '-'}
                                        </span>
                                    )}
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
                            <tr className={`bg-gradient-to-r ${totalRowClass} border-t-2 border-gray-200`}>
                                <td colSpan={8} className="px-4 py-4 text-sm font-bold text-gray-900 text-left">총 합계({isOnSite ? 'JPY' : 'KRW'})</td>
                                <td className={`px-4 py-4 text-lg font-bold ${totalTextClass} w-32 text-center`}>
                                    {isOnSite ? (
                                        `¥${schedules.reduce((sum, schedule) => {
                                            const yenAmount = parseInt(schedule.yenAmount || '0') || 0;
                                            return sum + yenAmount;
                                        }, 0)}`
                                    ) : (
                                        `₩${schedules.reduce((sum, schedule) => {
                                            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                            return sum + total;
                                        }, 0)}`
                                    )}
                                </td>
                                <td className={`px-4 py-4 text-lg font-bold ${totalTextClass} w-32 text-center`}>
                                    {isOnSite ? (
                                        `¥${Math.round(schedules.reduce((sum, schedule) => {
                                            const yenAmount = parseInt(schedule.yenAmount || '0') || 0;
                                            return sum + yenAmount;
                                        }, 0) / parseInt(numberOfPeople))}`
                                    ) : (
                                        `₩${schedules.reduce((sum, schedule) => {
                                            const prepayment = calculatePrepayment(schedule.total, parseInt(numberOfPeople));
                                            return sum + parseInt(prepayment) || 0;
                                        }, 0)}`
                                    )}
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
