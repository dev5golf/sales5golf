'use client';

import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { RECRUITMENT_CONSTANTS, DASHBOARD_CONSTANTS } from '../constants';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

export interface RecruitmentData {
    customerName: string;
    destination: string;
    startDate: string;
    endDate: string;
    numberOfPeople: string;
}

interface RecruitmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: RecruitmentData) => void;
    initialData?: RecruitmentData;
    isEditMode?: boolean;
}

export default function RecruitmentModal({ isOpen, onClose, onSubmit, initialData, isEditMode = false }: RecruitmentModalProps) {
    const [recruitmentData, setRecruitmentData] = useState<RecruitmentData>({
        customerName: '',
        destination: '',
        startDate: '',
        endDate: '',
        numberOfPeople: ''
    });

    const [errors, setErrors] = useState<Partial<Record<keyof RecruitmentData, boolean>>>({});

    // 수정 모드일 때 initialData로 폼 초기화
    useEffect(() => {
        if (isOpen && isEditMode && initialData) {
            setRecruitmentData(initialData);
        } else if (isOpen && !isEditMode) {
            // 등록 모드일 때는 초기화
            setRecruitmentData({
                customerName: '',
                destination: '',
                startDate: '',
                endDate: '',
                numberOfPeople: ''
            });
        }
        setErrors({});
    }, [isOpen, isEditMode, initialData]);

    const handleRecruitmentChange = (field: keyof RecruitmentData, value: string) => {
        setRecruitmentData(prev => ({
            ...prev,
            [field]: value
        }));
        // 에러 상태 초기화
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: false
            }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Partial<Record<keyof RecruitmentData, boolean>> = {};

        if (!recruitmentData.customerName.trim()) {
            newErrors.customerName = true;
        }
        if (!recruitmentData.destination.trim()) {
            newErrors.destination = true;
        }
        if (!recruitmentData.startDate.trim()) {
            newErrors.startDate = true;
        }
        if (!recruitmentData.endDate.trim()) {
            newErrors.endDate = true;
        }
        if (!recruitmentData.numberOfPeople.trim()) {
            newErrors.numberOfPeople = true;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }
        onSubmit(recruitmentData);
        // 폼 초기화
        setRecruitmentData({
            customerName: '',
            destination: '',
            startDate: '',
            endDate: '',
            numberOfPeople: ''
        });
        setErrors({});
        onClose();
    };

    const handleClose = () => {
        // 폼 초기화
        setRecruitmentData({
            customerName: '',
            destination: '',
            startDate: '',
            endDate: '',
            numberOfPeople: ''
        });
        setErrors({});
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-visible">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        {isEditMode ? '수배 수정' : DASHBOARD_CONSTANTS.TITLES.RECRUITMENT_MODAL}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 고객명 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.CUSTOMER_NAME} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={recruitmentData.customerName}
                                onChange={(e) => handleRecruitmentChange('customerName', e.target.value)}
                                placeholder={RECRUITMENT_CONSTANTS.PLACEHOLDERS.CUSTOMER_NAME}
                                className={`w-full px-3 py-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.customerName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.customerName && (
                                <p className="mt-1 text-sm text-red-500">고객명을 입력해주세요.</p>
                            )}
                        </div>

                        {/* 여행지 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.DESTINATION} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={recruitmentData.destination}
                                onChange={(e) => handleRecruitmentChange('destination', e.target.value)}
                                placeholder={RECRUITMENT_CONSTANTS.PLACEHOLDERS.DESTINATION}
                                className={`w-full px-3 py-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.destination ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.destination && (
                                <p className="mt-1 text-sm text-red-500">여행지를 입력해주세요.</p>
                            )}
                        </div>

                        {/* 여행기간 시작일 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.START_DATE} <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                selected={(() => {
                                    if (!recruitmentData.startDate) return null;
                                    if (recruitmentData.startDate.includes('/')) {
                                        const [year, month, day] = recruitmentData.startDate.split('/');
                                        const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
                                        return new Date(fullYear, parseInt(month) - 1, parseInt(day));
                                    }
                                    return null;
                                })()}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        const year = date.getFullYear().toString().slice(-2);
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const formattedDate = `${year}/${month}/${day}`;
                                        handleRecruitmentChange('startDate', formattedDate);
                                    } else {
                                        handleRecruitmentChange('startDate', '');
                                    }
                                }}
                                dateFormat={RECRUITMENT_CONSTANTS.DATE_FORMAT.DISPLAY}
                                locale={ko}
                                placeholderText={RECRUITMENT_CONSTANTS.PLACEHOLDERS.START_DATE}
                                className={`w-full px-3 py-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left ${errors.startDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                showPopperArrow={false}
                                popperClassName="react-datepicker-popper"
                            />
                            {errors.startDate && (
                                <p className="mt-1 text-sm text-red-500">여행 시작일을 선택해주세요.</p>
                            )}
                        </div>

                        {/* 여행기간 종료일 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.END_DATE} <span className="text-red-500">*</span>
                            </label>
                            <DatePicker
                                selected={(() => {
                                    if (!recruitmentData.endDate) return null;
                                    if (recruitmentData.endDate.includes('/')) {
                                        const [year, month, day] = recruitmentData.endDate.split('/');
                                        const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
                                        return new Date(fullYear, parseInt(month) - 1, parseInt(day));
                                    }
                                    return null;
                                })()}
                                onChange={(date: Date | null) => {
                                    if (date) {
                                        const year = date.getFullYear().toString().slice(-2);
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const formattedDate = `${year}/${month}/${day}`;
                                        handleRecruitmentChange('endDate', formattedDate);
                                    } else {
                                        handleRecruitmentChange('endDate', '');
                                    }
                                }}
                                dateFormat={RECRUITMENT_CONSTANTS.DATE_FORMAT.DISPLAY}
                                locale={ko}
                                placeholderText={RECRUITMENT_CONSTANTS.PLACEHOLDERS.END_DATE}
                                className={`w-full px-3 py-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left ${errors.endDate ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                showPopperArrow={false}
                                popperClassName="react-datepicker-popper"
                            />
                            {errors.endDate && (
                                <p className="mt-1 text-sm text-red-500">여행 종료일을 선택해주세요.</p>
                            )}
                        </div>

                        {/* 인원 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.NUMBER_OF_PEOPLE} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                required
                                value={recruitmentData.numberOfPeople}
                                onChange={(e) => handleRecruitmentChange('numberOfPeople', e.target.value)}
                                placeholder={RECRUITMENT_CONSTANTS.PLACEHOLDERS.NUMBER_OF_PEOPLE}
                                min={RECRUITMENT_CONSTANTS.VALIDATION.MIN_PEOPLE}
                                max={RECRUITMENT_CONSTANTS.VALIDATION.MAX_PEOPLE}
                                className={`w-full px-3 py-2 text-lg border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.numberOfPeople ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.numberOfPeople && (
                                <p className="mt-1 text-sm text-red-500">인원을 입력해주세요.</p>
                            )}
                        </div>
                    </div>

                    {/* 버튼 영역 */}
                    <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-gray-200">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="flex items-center gap-2"
                        >
                            <X className="h-4 w-4" />
                            {DASHBOARD_CONSTANTS.BUTTONS.CANCEL}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            {isEditMode ? '수정' : DASHBOARD_CONSTANTS.BUTTONS.REGISTER}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
