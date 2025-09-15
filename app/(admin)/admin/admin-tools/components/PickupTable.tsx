'use client';

import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { PickupSchedule } from '../../../../../hooks/useQuotationData';
import { VEHICLE_TYPES, DESTINATION_OPTIONS } from '../../../../../constants/quotationConstants';

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
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">인원</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">차량수</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-24">차종</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">지역</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">합계</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">사전결제(1인)</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {schedules.map((schedule, index) => (
                            <tr key={schedule.id} className={`hover:bg-purple-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-4 py-4 w-32 text-center">
                                    <input
                                        type="text"
                                        value={schedule.date}
                                        onChange={(e) => onUpdate(schedule.id, 'date', e.target.value)}
                                        placeholder="01/17"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
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
                                <td className="px-4 py-4 w-20 text-center">
                                    <input
                                        type="number"
                                        value={schedule.people}
                                        onChange={(e) => onUpdate(schedule.id, 'people', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-20 text-center">
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
                                <td className="px-4 py-4 w-20 text-center">
                                    <input
                                        type="text"
                                        value={schedule.region}
                                        onChange={(e) => onUpdate(schedule.id, 'region', e.target.value)}
                                        placeholder="지역명"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <input
                                        type="text"
                                        value={schedule.total}
                                        onChange={(e) => handleTotalChange(schedule.id, e.target.value)}
                                        placeholder="₩0"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-32 text-center">
                                    <span className="text-sm font-medium text-gray-900">
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
                                <td className="px-4 py-4 text-sm font-bold text-purple-900 w-32 text-center">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                        return sum + total;
                                    }, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-sm font-bold text-purple-900 w-32 text-center">
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
