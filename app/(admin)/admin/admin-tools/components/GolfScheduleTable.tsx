'use client';

import { useState } from 'react';
import { Button } from '../../../../../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { GolfSchedule } from '../../../../../hooks/useQuotationData';
import { INCLUSION_OPTIONS } from '../../../../../constants/quotationConstants';
import GolfCourseAutocomplete from '../../components/GolfCourseAutocomplete';
import { Course } from '../../../../../types';

interface GolfScheduleTableProps {
    schedules: GolfSchedule[];
    onAdd: () => void;
    onUpdate: (id: string, field: keyof GolfSchedule, value: string | string[]) => void;
    onRemove: (id: string) => void;
    numberOfPeople: string;
    isFormValid: boolean;
}

export default function GolfScheduleTable({
    schedules,
    onAdd,
    onUpdate,
    onRemove,
    numberOfPeople,
    isFormValid
}: GolfScheduleTableProps) {
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

    const handleTotalChange = (id: string, total: string) => {
        onUpdate(id, 'total', total);

        // 인원수에 따라 사전결제(1인) 자동 계산
        const people = parseInt(numberOfPeople) || 1;
        const totalAmount = parseInt(total.replace(/[₩,]/g, '')) || 0;
        const prepaymentPerPerson = Math.floor(totalAmount / people);

        onUpdate(id, 'prepayment', prepaymentPerPerson.toLocaleString());
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">골프 (사전결제)</h3>
                <Button
                    onClick={handleAddClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                >
                    <Plus className="h-4 w-4" />
                    추가
                </Button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">날짜</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">골프장명</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 w-20">홀수(H)</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700">포함사항</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 w-24">TEE-OFF</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">합계</th>
                            <th className="border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-700 w-32">사전결제(1인)</th>
                            <th className="border border-gray-200 px-4 py-3 text-center text-sm font-medium text-gray-700 w-20">삭제</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schedules.map((schedule) => (
                            <tr key={schedule.id} className="hover:bg-gray-50">
                                <td className="border border-gray-200 px-4 py-3 w-32">
                                    <input
                                        type="text"
                                        value={schedule.date}
                                        onChange={(e) => onUpdate(schedule.id, 'date', e.target.value)}
                                        placeholder="01/17"
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    <GolfCourseAutocomplete
                                        value={schedule.courseName}
                                        onChange={(value) => onUpdate(schedule.id, 'courseName', value)}
                                        onSelect={(course) => handleCourseSelect(schedule.id, course)}
                                        placeholder="골프장명을 검색하세요"
                                        className="w-full"
                                    />
                                </td>
                                <td className="border border-gray-200 px-4 py-3 w-20">
                                    <input
                                        type="number"
                                        value={schedule.holes}
                                        onChange={(e) => onUpdate(schedule.id, 'holes', e.target.value)}
                                        placeholder="18"
                                        min="9"
                                        max="36"
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="border border-gray-200 px-4 py-3">
                                    <div className="flex flex-wrap gap-2">
                                        {INCLUSION_OPTIONS.map((option) => (
                                            <label key={option} className="flex items-center text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={schedule.inclusions.includes(option)}
                                                    onChange={(e) => handleInclusionChange(schedule.id, option, e.target.checked)}
                                                    className="mr-1"
                                                />
                                                {option}
                                            </label>
                                        ))}
                                    </div>
                                </td>
                                <td className="border border-gray-200 px-4 py-3 w-24">
                                    <input
                                        type="text"
                                        value={schedule.teeOff}
                                        onChange={(e) => onUpdate(schedule.id, 'teeOff', e.target.value)}
                                        placeholder="오전/오후"
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="border border-gray-200 px-4 py-3 w-32">
                                    <input
                                        type="text"
                                        value={schedule.total}
                                        onChange={(e) => handleTotalChange(schedule.id, e.target.value)}
                                        placeholder="₩0"
                                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </td>
                                <td className="border border-gray-200 px-4 py-3 w-32">
                                    <span className="text-sm text-gray-700">
                                        {schedule.prepayment ? `₩${schedule.prepayment}` : '-'}
                                    </span>
                                </td>
                                <td className="border border-gray-200 px-4 py-3 text-center w-20">
                                    <Button
                                        onClick={() => onRemove(schedule.id)}
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}

                        {/* 총 합계 행 */}
                        {schedules.length > 0 && (
                            <tr className="bg-gray-100 font-semibold">
                                <td colSpan={5} className="px-4 py-3 text-sm font-medium text-gray-900">총 합계(KRW)</td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 w-32">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                                        return sum + total;
                                    }, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-gray-900 w-32">
                                    ₩{schedules.reduce((sum, schedule) => {
                                        const prepayment = parseInt(schedule.prepayment.replace(/[₩,]/g, '')) || 0;
                                        return sum + prepayment;
                                    }, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-3 w-20"></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
