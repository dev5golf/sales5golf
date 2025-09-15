'use client';

import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { AccommodationSchedule } from '../../../../../hooks/useQuotationData';

interface AccommodationTableProps {
    schedules: AccommodationSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof AccommodationSchedule, value: string) => void;
    onRemove: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
}

export default function AccommodationTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    numberOfPeople,
    isFormValid
}: AccommodationTableProps) {
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
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-32">날짜</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700">호텔명</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">박수</th>
                            <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-20">객실수</th>
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
                                <td className="px-4 py-4 w-32 text-center">
                                    <input
                                        type="text"
                                        value={schedule.date}
                                        onChange={(e) => onUpdate(schedule.id, 'date', e.target.value)}
                                        placeholder="25/01/17-01/20"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                                <td className="px-4 py-4 w-20 text-center">
                                    <input
                                        type="number"
                                        value={schedule.nights}
                                        onChange={(e) => onUpdate(schedule.id, 'nights', e.target.value)}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </td>
                                <td className="px-4 py-4 w-20 text-center">
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
                                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                            <tr className="bg-gradient-to-r from-green-50 to-green-100 border-t-2 border-green-200">
                                <td colSpan={6} className="px-4 py-4 text-sm font-bold text-gray-900 text-left">총 합계(KRW)</td>
                                <td className="px-4 py-4 text-sm font-bold text-green-900 w-32 text-center">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                        return sum + total;
                                    }, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-sm font-bold text-green-900 w-32 text-center">
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
