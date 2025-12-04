'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Copy, ChevronUp, ChevronDown } from 'lucide-react';
import { PickupSchedule } from '@/app/(admin)/admin/admin-tools/quotation/types';
import { VEHICLE_TYPES, DESTINATION_OPTIONS } from '@/constants/quotationConstants';
import { createAddClickHandler } from '@/lib/utils/tableUtils';
import { createMultiFieldDirectInputToggleHandler } from '@/lib/utils/tableHandlers';
import { createTotalChangeHandler } from '@/lib/utils/tableHandlers';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface PickupTableProps {
    schedules: PickupSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof PickupSchedule, value: string) => void;
    onRemove: (id: string) => void;
    onCopy: (id: string) => void;
    onMoveUp: (id: string) => void;
    onMoveDown: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
    calculatePrepayment: (total: string, numberOfPeople: number) => string;
}

export default function PickupTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    onCopy,
    onMoveUp,
    onMoveDown,
    numberOfPeople,
    isFormValid,
    calculatePrepayment
}: PickupTableProps) {
    // 마지막 선택한 날짜를 기억하는 상태
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);
    // 각 스케줄별 직접입력 모드 상태 (행선지, 차종)
    const [directInputMode, setDirectInputMode] = useState<{ [key: string]: { destination: boolean; vehicleType: boolean } }>({});

    const handleAddClick = createAddClickHandler(isFormValid, onAdd);
    const handleTotalChange = createTotalChangeHandler(onUpdate);

    // 직접입력 모드 토글 핸들러
    const handleDirectInputToggle = createMultiFieldDirectInputToggleHandler(directInputMode, setDirectInputMode, onUpdate);

    // schedules가 변경될 때 체크박스 상태 복원
    useEffect(() => {
        const newDirectInputMode: { [key: string]: { destination: boolean; vehicleType: boolean } } = {};

        schedules.forEach(schedule => {
            newDirectInputMode[schedule.id] = {
                // 문자열을 boolean으로 변환
                destination: schedule.destinationDirectInput === 'true',
                vehicleType: schedule.vehicleTypeDirectInput === 'true'
            };
        });

        setDirectInputMode(newDirectInputMode);
    }, [schedules]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                    <h3 className="text-xl font-semibold text-gray-900">픽업 (사전결제)</h3>
                </div>
                <Button
                    onClick={handleAddClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 hover:border-purple-300 transition-colors"
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
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-40">행선지</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-48">탑승지/하차장소</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-28">인원</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-28">차량수</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-24">차종</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">합계</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-32">사전결제(1인)</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">이동</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">복사</th>
                            <th className="px-1 py-1 text-center text-lg font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
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
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        showPopperArrow={false}
                                        popperClassName="react-datepicker-popper"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-40 text-center">
                                    <div className="space-y-2">
                                        {/* 직접입력 체크박스 */}
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={directInputMode[schedule.id]?.destination || false}
                                                    onChange={() => handleDirectInputToggle(schedule.id, 'destination')}
                                                    className="mr-1 w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-gray-600">직접입력</span>
                                            </label>
                                        </div>

                                        {/* 조건부 렌더링: 직접입력 모드일 때 입력폼, 아니면 선택박스 */}
                                        {directInputMode[schedule.id]?.destination ? (
                                            <input
                                                type="text"
                                                value={schedule.destination}
                                                onChange={(e) => onUpdate(schedule.id, 'destination', e.target.value)}
                                                placeholder="직접 입력"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                        ) : (
                                            <select
                                                value={schedule.destination}
                                                onChange={(e) => onUpdate(schedule.id, 'destination', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">선택하세요</option>
                                                {DESTINATION_OPTIONS.map((dest) => (
                                                    <option key={dest} value={dest}>{dest}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td className="px-1 py-1 text-lg w-48 text-center">
                                    <div className="space-y-2">
                                        <div>
                                            <input
                                                type="text"
                                                value={schedule.pickupLocation}
                                                onChange={(e) => onUpdate(schedule.id, 'pickupLocation', e.target.value)}
                                                placeholder="탑승지"
                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs text-gray-600">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule.pickupLocation === schedule.dropoffLocation && schedule.pickupLocation !== ''}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            onUpdate(schedule.id, 'dropoffLocation', schedule.pickupLocation);
                                                        } else {
                                                            onUpdate(schedule.id, 'dropoffLocation', '');
                                                        }
                                                    }}
                                                    className="mr-1 w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                동일
                                            </label>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                value={schedule.dropoffLocation}
                                                onChange={(e) => onUpdate(schedule.id, 'dropoffLocation', e.target.value)}
                                                placeholder="하차장소"
                                                className="w-full px-2 py-1 border border-gray-200 rounded text-xs text-center focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </td>
                                <td className="px-1 py-1 text-lg w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.people}
                                        onChange={(e) => onUpdate(schedule.id, 'people', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.vehicles}
                                        onChange={(e) => onUpdate(schedule.id, 'vehicles', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-24 text-center">
                                    <div className="space-y-2">
                                        {/* 직접입력 체크박스 */}
                                        <div className="flex items-center justify-center">
                                            <label className="flex items-center text-xs cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={directInputMode[schedule.id]?.vehicleType || false}
                                                    onChange={() => handleDirectInputToggle(schedule.id, 'vehicleType')}
                                                    className="mr-1 w-3 h-3 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                                />
                                                <span className="text-gray-600">직접입력</span>
                                            </label>
                                        </div>

                                        {/* 조건부 렌더링: 직접입력 모드일 때 입력폼, 아니면 선택박스 */}
                                        {directInputMode[schedule.id]?.vehicleType ? (
                                            <input
                                                type="text"
                                                value={schedule.vehicleType}
                                                onChange={(e) => onUpdate(schedule.id, 'vehicleType', e.target.value)}
                                                placeholder="직접 입력"
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            />
                                        ) : (
                                            <select
                                                value={schedule.vehicleType}
                                                onChange={(e) => onUpdate(schedule.id, 'vehicleType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                            >
                                                <option value="">선택하세요</option>
                                                {VEHICLE_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </td>
                                <td className="px-1 py-1 text-lg w-32 text-center">
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        value={schedule.total}
                                        onChange={(e) => handleTotalChange(schedule.id, e)}
                                        placeholder="₩0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        translate="no"
                                    />
                                </td>
                                <td className="px-1 py-1 text-lg w-32 text-center" translate="no">
                                    <span className="text-lg font-medium text-gray-900">
                                        {schedule.total ? `₩${calculatePrepayment(schedule.total, parseInt(numberOfPeople))}` : '-'}
                                    </span>
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
                                        className="text-purple-600 border-purple-200 hover:bg-purple-50 hover:border-purple-300 transition-colors"
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
                            <tr className="bg-gradient-to-r from-purple-50 to-purple-100 border-t-2 border-purple-200">
                                <td colSpan={6} className="px-1 py-1 text-lg font-bold text-gray-900 text-left">총 합계(KRW)</td>
                                <td className="px-1 py-1 text-xl font-bold text-purple-900 w-32 text-center" translate="no">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                        return sum + total;
                                    }, 0)}
                                </td>
                                <td className="px-1 py-1 text-xl font-bold text-purple-900 w-32 text-center" translate="no">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const prepayment = calculatePrepayment(schedule.total, parseInt(numberOfPeople));
                                        return sum + parseInt(prepayment) || 0;
                                    }, 0)}
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
