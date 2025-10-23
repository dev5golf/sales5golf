'use client';

import { useState } from 'react';
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
}

export default function RecruitmentModal({ isOpen, onClose, onSubmit }: RecruitmentModalProps) {
    const [recruitmentData, setRecruitmentData] = useState<RecruitmentData>({
        customerName: '',
        destination: '',
        startDate: '',
        endDate: '',
        numberOfPeople: ''
    });

    const handleRecruitmentChange = (field: keyof RecruitmentData, value: string) => {
        setRecruitmentData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = () => {
        onSubmit(recruitmentData);
        // 폼 초기화
        setRecruitmentData({
            customerName: '',
            destination: '',
            startDate: '',
            endDate: '',
            numberOfPeople: ''
        });
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
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-visible">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-gray-800">
                        {DASHBOARD_CONSTANTS.TITLES.RECRUITMENT_MODAL}
                    </DialogTitle>
                </DialogHeader>

                <div className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 고객명 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.CUSTOMER_NAME}
                            </label>
                            <input
                                type="text"
                                value={recruitmentData.customerName}
                                onChange={(e) => handleRecruitmentChange('customerName', e.target.value)}
                                placeholder={RECRUITMENT_CONSTANTS.PLACEHOLDERS.CUSTOMER_NAME}
                                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* 여행지 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.DESTINATION}
                            </label>
                            <input
                                type="text"
                                value={recruitmentData.destination}
                                onChange={(e) => handleRecruitmentChange('destination', e.target.value)}
                                placeholder={RECRUITMENT_CONSTANTS.PLACEHOLDERS.DESTINATION}
                                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* 여행기간 시작일 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.START_DATE}
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
                                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left"
                                showPopperArrow={false}
                                popperClassName="react-datepicker-popper"
                            />
                        </div>

                        {/* 여행기간 종료일 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.END_DATE}
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
                                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left"
                                showPopperArrow={false}
                                popperClassName="react-datepicker-popper"
                            />
                        </div>

                        {/* 인원 */}
                        <div>
                            <label className="block text-lg font-medium text-gray-700 mb-2">
                                {RECRUITMENT_CONSTANTS.LABELS.NUMBER_OF_PEOPLE}
                            </label>
                            <input
                                type="number"
                                value={recruitmentData.numberOfPeople}
                                onChange={(e) => handleRecruitmentChange('numberOfPeople', e.target.value)}
                                placeholder={RECRUITMENT_CONSTANTS.PLACEHOLDERS.NUMBER_OF_PEOPLE}
                                min={RECRUITMENT_CONSTANTS.VALIDATION.MIN_PEOPLE}
                                max={RECRUITMENT_CONSTANTS.VALIDATION.MAX_PEOPLE}
                                className="w-full px-3 py-2 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
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
                            {DASHBOARD_CONSTANTS.BUTTONS.REGISTER}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
