'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { PickupSchedule } from '../../../../../hooks/useQuotationData';
import { VEHICLE_TYPES, DESTINATION_OPTIONS } from '../../../../../constants/quotationConstants';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

interface PickupTableProps {
    schedules: PickupSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof PickupSchedule, value: string) => void;
    onRemove: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
}

export default function PickupTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    numberOfPeople,
    isFormValid
}: PickupTableProps) {
    // 마지막 선택한 날짜를 기억하는 상태
    const [lastSelectedDate, setLastSelectedDate] = useState<Date | null>(null);

    const handleAddClick = () => {
        if (!isFormValid) {
            alert('먼저 고객명, 여행지, 여행기간, 인원을 모두 입력해주세요.');
            return;
        }
        onAdd();
    };
    const handleTotalChange = (id: string, total: string) => {
        onUpdate(id, 'total', total);

        // 인원수에 따라 사전결제(1인) 자동 계산
        const people = parseInt(numberOfPeople) || 1;
        const totalAmount = parseInt(total.replace(/[₩,]/g, '')) || 0;
        const prepaymentPerPerson = Math.floor(totalAmount / people);

        onUpdate(id, 'prepayment', prepaymentPerPerson.toLocaleString());
    };

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
                <table className="w-full table-fixed">
                    <thead>
                        <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">날짜</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-40">행선지</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-48">탑승지/하차장소</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">인원</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-28">차량수</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-24">차종</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">합계</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">사전결제(1인)</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
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
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                        showPopperArrow={false}
                                        popperClassName="react-datepicker-popper"
                                    />
                                </td>
                                <td className="px-4 py-4 w-40 text-center">
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
                                </td>
                                <td className="px-4 py-4 w-48 text-center">
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
                                <td className="px-4 py-4 w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.people}
                                        onChange={(e) => onUpdate(schedule.id, 'people', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-28 text-center">
                                    <input
                                        type="number"
                                        value={schedule.vehicles}
                                        onChange={(e) => onUpdate(schedule.id, 'vehicles', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-24 text-center">
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
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <input
                                        type="text"
                                        value={schedule.total}
                                        onChange={(e) => handleTotalChange(schedule.id, e.target.value)}
                                        placeholder="₩0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <span className="text-lg font-medium text-gray-900">
                                        {schedule.prepayment ? `₩${schedule.prepayment}` : '-'}
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
                            <tr className="bg-gradient-to-r from-purple-50 to-purple-100 border-t-2 border-purple-200">
                                <td colSpan={6} className="px-4 py-4 text-sm font-bold text-gray-900 text-left">총 합계(KRW)</td>
                                <td className="px-4 py-4 text-lg font-bold text-purple-900 w-32 text-center">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                        return sum + total;
                                    }, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-lg font-bold text-purple-900 w-32 text-center">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const prepayment = parseInt(schedule.prepayment.replace(/[₩,]/g, '')) || 0;
                                        return sum + prepayment;
                                    }, 0).toLocaleString()}
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
