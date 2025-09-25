"use client";
import { useState, useEffect } from 'react';
import { TeeTime } from '@/app/(admin)/admin/tee-times/types';

/**
 * 티타임 모달 컴포넌트 Props
 * 티타임 생성/수정/삭제 기능을 담는 인터페이스
 */
interface TeeTimeModalProps {
    date: string;
    onSave: (teeTimeData: Omit<TeeTime, 'id' | 'courseId' | 'courseName'>) => void;
    onClose: () => void;
    existingTeeTimes: TeeTime[];
    onUpdate: (id: string, updatedData: Partial<TeeTime>) => void;
    onDelete: (id: string) => void;
    courseName?: string;
}

export default function TeeTimeModal({
    date,
    onSave,
    onClose,
    existingTeeTimes,
    onUpdate,
    onDelete,
    courseName
}: TeeTimeModalProps) {
    const [formData, setFormData] = useState({
        hour: '',
        minute: '',
        availableSlots: '',
        agentPrice: '',
        note: ''
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    // 지나간 날짜인지 확인하는 함수
    const isPastDate = (dateStr: string) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // 오늘의 시작 시간으로 설정
        const targetDate = new Date(dateStr);
        targetDate.setHours(0, 0, 0, 0); // 비교할 날짜의 시작 시간으로 설정
        return targetDate < today;
    };

    const isDatePast = isPastDate(date);

    useEffect(() => {
        // 모달이 열릴 때 폼 초기화
        setFormData({
            hour: '',
            minute: '',
            availableSlots: '',
            agentPrice: '',
            note: ''
        });
        setEditingId(null);
    }, [date]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isDatePast) {
            alert('지나간 날짜에는 티타임을 등록하거나 수정할 수 없습니다.');
            return;
        }

        if (!formData.hour || !formData.minute) {
            alert('시간과 분을 모두 선택해주세요.');
            return;
        }

        if (!formData.availableSlots || formData.availableSlots === '') {
            alert('예약 가능 슬롯을 입력해주세요.');
            return;
        }

        if (!formData.agentPrice || formData.agentPrice === '') {
            alert('에이전트 가격을 입력해주세요.');
            return;
        }

        // 시와 분을 합쳐서 time 필드 생성
        const time = `${formData.hour.padStart(2, '0')}:${formData.minute.padStart(2, '0')}`;
        const submitData = {
            time,
            availableSlots: Number(formData.availableSlots),
            agentPrice: Number(formData.agentPrice),
            note: formData.note
        };

        if (editingId) {
            // 기존 티타임 수정
            onUpdate(editingId, submitData);
        } else {
            // 새 티타임 추가
            onSave({
                date,
                ...submitData
            });
        }

        setFormData({
            hour: '',
            minute: '',
            availableSlots: '',
            agentPrice: '',
            note: ''
        });
        setEditingId(null);
    };

    const handleEdit = (teeTime: TeeTime) => {
        if (isDatePast) {
            alert('지나간 날짜의 티타임은 수정할 수 없습니다.');
            return;
        }

        // time을 시와 분으로 분리하고 숫자로 변환
        const [hourStr, minuteStr] = teeTime.time.split(':');
        const hour = hourStr ? parseInt(hourStr, 10).toString() : '';
        const minute = minuteStr ? parseInt(minuteStr, 10).toString() : '';

        setFormData({
            hour: hour,
            minute: minute,
            availableSlots: teeTime.availableSlots.toString(),
            agentPrice: teeTime.agentPrice.toString(),
            note: teeTime.note
        });
        setEditingId(teeTime.id);
    };

    const handleDelete = (id: string) => {
        if (isDatePast) {
            alert('지나간 날짜의 티타임은 삭제할 수 없습니다.');
            return;
        }
        onDelete(id);
    };

    const handleCancel = () => {
        setFormData({
            hour: '',
            minute: '',
            availableSlots: '',
            agentPrice: '',
            note: ''
        });
        setEditingId(null);
        onClose();
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {courseName && `${courseName} - `}
                        {formatDate(date)} 티타임 관리
                    </h2>
                    <button
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        onClick={onClose}
                    >
                        <i className="fas fa-times text-gray-500"></i>
                    </button>
                </div>

                {isDatePast && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mx-6 mt-4">
                        <div className="flex items-center">
                            <i className="fas fa-exclamation-triangle text-yellow-400 mr-2"></i>
                            <span className="text-yellow-800 text-sm">지나간 날짜는 조회만 가능하며, 등록/수정/삭제가 제한됩니다.</span>
                        </div>
                    </div>
                )}

                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {/* 기존 티타임 목록 */}
                    {existingTeeTimes.length > 0 && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">등록된 티타임</h3>
                            <div className="space-y-3">
                                {existingTeeTimes.map(teeTime => (
                                    <div key={teeTime.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <span className="font-medium text-gray-900">{teeTime.time}</span>
                                            <span className="text-sm text-gray-600">{teeTime.availableSlots}슬롯</span>
                                            <span className="text-sm font-medium text-green-600">{teeTime.agentPrice.toLocaleString()}원</span>
                                            {teeTime.note && <span className="text-sm text-gray-500">{teeTime.note}</span>}
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                className={`px-3 py-1 text-sm border rounded-md transition-colors ${isDatePast
                                                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                                    : 'border-blue-300 text-blue-600 hover:bg-blue-50'
                                                    }`}
                                                onClick={() => handleEdit(teeTime)}
                                                disabled={isDatePast}
                                                title={isDatePast ? '지나간 날짜는 수정할 수 없습니다' : '수정'}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className={`px-3 py-1 text-sm border rounded-md transition-colors ${isDatePast
                                                    ? 'border-gray-300 text-gray-400 cursor-not-allowed'
                                                    : 'border-red-300 text-red-600 hover:bg-red-50'
                                                    }`}
                                                onClick={() => handleDelete(teeTime.id)}
                                                disabled={isDatePast}
                                                title={isDatePast ? '지나간 날짜는 삭제할 수 없습니다' : '삭제'}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 새 티타임 등록 폼 */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-800">{editingId ? '티타임 수정' : '새 티타임 등록'}</h3>

                        {isDatePast && (
                            <div className="bg-gray-100 border border-gray-300 rounded-md p-3">
                                <div className="flex items-center">
                                    <i className="fas fa-lock text-gray-500 mr-2"></i>
                                    <span className="text-gray-600 text-sm">지나간 날짜에는 새 티타임을 등록할 수 없습니다.</span>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">티타임 *</label>
                                <div className="flex gap-2">
                                    <div className="flex-1">
                                        <select
                                            name="hour"
                                            value={formData.hour}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isDatePast}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">시</option>
                                            {Array.from({ length: 24 }, (_, hour) => (
                                                <option key={hour} value={hour}>
                                                    {hour.toString().padStart(2, '0')}시
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <select
                                            name="minute"
                                            value={formData.minute}
                                            onChange={handleInputChange}
                                            required
                                            disabled={isDatePast}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                        >
                                            <option value="">분</option>
                                            {Array.from({ length: 60 }, (_, minute) => (
                                                <option key={minute} value={minute}>
                                                    {minute.toString().padStart(2, '0')}분
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <small className="text-gray-500 text-xs">시와 분을 각각 선택하세요 (00시~23시, 00분~59분)</small>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="availableSlots" className="block text-sm font-medium text-gray-700">예약 가능 슬롯 *</label>
                                <input
                                    type="number"
                                    id="availableSlots"
                                    name="availableSlots"
                                    value={formData.availableSlots}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="20"
                                    required
                                    disabled={isDatePast}
                                    placeholder="예약 가능한 슬롯 수를 입력하세요"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="agentPrice" className="block text-sm font-medium text-gray-700">에이전트 가격 (원) *</label>
                            <input
                                type="number"
                                id="agentPrice"
                                name="agentPrice"
                                value={formData.agentPrice}
                                onChange={handleInputChange}
                                min="0"
                                required
                                disabled={isDatePast}
                                placeholder="예: 2300000"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="note" className="block text-sm font-medium text-gray-700">메모</label>
                            <textarea
                                id="note"
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                rows={3}
                                disabled={isDatePast}
                                placeholder="특별한 사항이나 메모를 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                onClick={handleCancel}
                            >
                                취소
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDatePast
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                                disabled={isDatePast}
                            >
                                {editingId ? '수정' : '등록'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
