"use client";
import { useState, useEffect } from 'react';
import { TeeTime, TeeTimeModalProps } from '../../../../../types';

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
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>
                        {courseName && `${courseName} - `}
                        {formatDate(date)} 티타임 관리
                    </h2>
                    <button className="modal-close" onClick={onClose}>
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                {isDatePast && (
                    <div className="modal-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>지나간 날짜는 조회만 가능하며, 등록/수정/삭제가 제한됩니다.</span>
                    </div>
                )}

                <div className="modal-body">
                    {/* 기존 티타임 목록 */}
                    {existingTeeTimes.length > 0 && (
                        <div className="existing-teetimes">
                            <h3>등록된 티타임</h3>
                            <div className="teetime-list">
                                {existingTeeTimes.map(teeTime => (
                                    <div key={teeTime.id} className="teetime-item">
                                        <div className="teetime-info">
                                            <span className="time">{teeTime.time}</span>
                                            <span className="slots">{teeTime.availableSlots}슬롯</span>
                                            <span className="price">{teeTime.agentPrice.toLocaleString()}원</span>
                                            {teeTime.note && <span className="note">{teeTime.note}</span>}
                                        </div>
                                        <div className="teetime-actions">
                                            <button
                                                className={`btn btn-sm btn-outline ${isDatePast ? 'disabled' : ''}`}
                                                onClick={() => handleEdit(teeTime)}
                                                disabled={isDatePast}
                                                title={isDatePast ? '지나간 날짜는 수정할 수 없습니다' : '수정'}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className={`btn btn-sm btn-danger ${isDatePast ? 'disabled' : ''}`}
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
                    <form onSubmit={handleSubmit} className="teetime-form">
                        <h3>{editingId ? '티타임 수정' : '새 티타임 등록'}</h3>

                        {isDatePast && (
                            <div className="form-disabled-notice">
                                <i className="fas fa-lock"></i>
                                <span>지나간 날짜에는 새 티타임을 등록할 수 없습니다.</span>
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label>티타임 *</label>
                                <div className="time-picker-row">
                                    <div className="time-picker-item">
                                        <select
                                            name="hour"
                                            value={formData.hour}
                                            onChange={handleInputChange}
                                            required
                                            className="time-select"
                                        >
                                            <option value="">시</option>
                                            {Array.from({ length: 24 }, (_, hour) => (
                                                <option key={hour} value={hour}>
                                                    {hour.toString().padStart(2, '0')}시
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="time-picker-item">
                                        <select
                                            name="minute"
                                            value={formData.minute}
                                            onChange={handleInputChange}
                                            required
                                            className="time-select"
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
                                <small className="form-help">시와 분을 각각 선택하세요 (00시~23시, 00분~59분)</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="availableSlots">예약 가능 슬롯 *</label>
                                <input
                                    type="number"
                                    id="availableSlots"
                                    name="availableSlots"
                                    value={formData.availableSlots}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="20"
                                    required
                                    placeholder="예약 가능한 슬롯 수를 입력하세요"
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="agentPrice">에이전트 가격 (원) *</label>
                            <input
                                type="number"
                                id="agentPrice"
                                name="agentPrice"
                                value={formData.agentPrice}
                                onChange={handleInputChange}
                                min="0"
                                required
                                placeholder="예: 2300000"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="note">메모</label>
                            <textarea
                                id="note"
                                name="note"
                                value={formData.note}
                                onChange={handleInputChange}
                                rows={3}
                                placeholder="특별한 사항이나 메모를 입력하세요"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                                취소
                            </button>
                            <button
                                type="submit"
                                className={`btn btn-primary ${isDatePast ? 'disabled' : ''}`}
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
