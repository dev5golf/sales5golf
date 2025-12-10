'use client';

import { useState, useEffect } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import { DASHBOARD_CONSTANTS } from '../constants';
import { useAuth } from '@/contexts/AuthContext';
import 'react-datepicker/dist/react-datepicker.css';
import '@/styles/vendor/react-datepicker.css';

export interface DepositFormRow {
    type: string; // 종류: 계좌이체, 카드, 가상계좌, 포인트
    depositDate: string; // 거래일자 (YYYYMMDD)
    depositor: string; // 입금자
    amount: string; // 입금액
}

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rows: DepositFormRow[]) => void;
}

const DEPOSIT_TYPES = ['계좌이체', '카드', '가상계좌', '포인트'];

export default function DepositModal({ isOpen, onClose, onSubmit }: DepositModalProps) {
    const { user } = useAuth();
    const [rows, setRows] = useState<DepositFormRow[]>([
        {
            type: '계좌이체',
            depositDate: '',
            depositor: '',
            amount: ''
        }
    ]);

    const [errors, setErrors] = useState<Record<number, Partial<Record<keyof DepositFormRow, boolean>>>>({});

    // 모달 열릴 때 초기화
    useEffect(() => {
        if (isOpen) {
            setRows([{
                type: '계좌이체',
                depositDate: '',
                depositor: '',
                amount: ''
            }]);
            setErrors({});
        }
    }, [isOpen]);

    const handleRowChange = (index: number, field: keyof DepositFormRow, value: string) => {
        setRows(prev => {
            const newRows = [...prev];
            newRows[index] = { ...newRows[index], [field]: value };
            return newRows;
        });
        // 에러 상태 초기화
        if (errors[index]?.[field]) {
            setErrors(prev => ({
                ...prev,
                [index]: { ...prev[index], [field]: false }
            }));
        }
    };

    const handleAddRow = () => {
        setRows(prev => [...prev, {
            type: '계좌이체',
            depositDate: '',
            depositor: '',
            amount: ''
        }]);
    };

    const handleRemoveRow = (index: number) => {
        if (rows.length > 1) {
            setRows(prev => prev.filter((_, i) => i !== index));
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[index];
                // 인덱스 재정렬
                const reorderedErrors: Record<number, Partial<Record<keyof DepositFormRow, boolean>>> = {};
                Object.keys(newErrors).forEach(key => {
                    const oldIndex = parseInt(key);
                    if (oldIndex > index) {
                        reorderedErrors[oldIndex - 1] = newErrors[oldIndex];
                    } else {
                        reorderedErrors[oldIndex] = newErrors[oldIndex];
                    }
                });
                return reorderedErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<number, Partial<Record<keyof DepositFormRow, boolean>>> = {};
        let isValid = true;

        rows.forEach((row, index) => {
            const rowErrors: Partial<Record<keyof DepositFormRow, boolean>> = {};

            if (!row.type) {
                rowErrors.type = true;
                isValid = false;
            }
            if (!row.depositDate) {
                rowErrors.depositDate = true;
                isValid = false;
            }
            if (!row.depositor.trim()) {
                rowErrors.depositor = true;
                isValid = false;
            }
            if (!row.amount.trim() || parseFloat(row.amount) <= 0) {
                rowErrors.amount = true;
                isValid = false;
            }

            if (Object.keys(rowErrors).length > 0) {
                newErrors[index] = rowErrors;
            }
        });

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = () => {
        if (!validateForm()) {
            return;
        }
        onSubmit(rows);
        // 폼 초기화
        setRows([{
            type: '계좌이체',
            depositDate: '',
            depositor: '',
            amount: ''
        }]);
        setErrors({});
        onClose();
    };

    const handleClose = () => {
        // 폼 초기화
        setRows([{
            type: '계좌이체',
            depositDate: '',
            depositor: '',
            amount: ''
        }]);
        setErrors({});
        onClose();
    };

    // 날짜를 YYYYMMDD 형식으로 변환
    const formatDateToYYYYMMDD = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    // YYYYMMDD를 Date 객체로 변환
    const parseYYYYMMDD = (dateString: string): Date | null => {
        if (!dateString || dateString.length !== 8) return null;
        const year = parseInt(dateString.substring(0, 4));
        const month = parseInt(dateString.substring(4, 6)) - 1;
        const day = parseInt(dateString.substring(6, 8));
        return new Date(year, month, day);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-visible">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-gray-800">
                            입금 등록
                        </DialogTitle>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleAddRow}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            행 추가
                        </Button>
                    </div>
                </DialogHeader>

                <div className="mt-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                    <div className="space-y-4">
                        {rows.map((row, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-semibold text-gray-700">
                                        입금 내역 {index + 1}
                                    </h4>
                                    {rows.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveRow(index)}
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>

                                <div className="grid grid-cols-4 gap-4">
                                    {/* 종류 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            종류 <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={row.type}
                                            onChange={(e) => handleRowChange(index, 'type', e.target.value)}
                                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[index]?.type ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        >
                                            {DEPOSIT_TYPES.map(type => (
                                                <option key={type} value={type}>{type}</option>
                                            ))}
                                        </select>
                                        {errors[index]?.type && (
                                            <p className="mt-1 text-xs text-red-500">종류를 선택해주세요.</p>
                                        )}
                                    </div>

                                    {/* 거래일자 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            거래일자 <span className="text-red-500">*</span>
                                        </label>
                                        <DatePicker
                                            selected={parseYYYYMMDD(row.depositDate)}
                                            onChange={(date: Date | null) => {
                                                handleRowChange(index, 'depositDate', formatDateToYYYYMMDD(date));
                                            }}
                                            dateFormat="yyyy-MM-dd"
                                            locale={ko}
                                            placeholderText="YYYY-MM-DD"
                                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent !text-left ${errors[index]?.depositDate ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                            showPopperArrow={false}
                                            popperClassName="react-datepicker-popper"
                                        />
                                        {errors[index]?.depositDate && (
                                            <p className="mt-1 text-xs text-red-500">거래일자를 선택해주세요.</p>
                                        )}
                                    </div>

                                    {/* 입금자 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            입금자 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={row.depositor}
                                            onChange={(e) => handleRowChange(index, 'depositor', e.target.value)}
                                            placeholder="입금자명을 입력하세요"
                                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[index]?.depositor ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors[index]?.depositor && (
                                            <p className="mt-1 text-xs text-red-500">입금자를 입력해주세요.</p>
                                        )}
                                    </div>

                                    {/* 입금액 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            입금액 <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="number"
                                            value={row.amount}
                                            onChange={(e) => handleRowChange(index, 'amount', e.target.value)}
                                            placeholder="입금액을 입력하세요"
                                            min="0"
                                            step="1"
                                            className={`w-full px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors[index]?.amount ? 'border-red-500' : 'border-gray-300'
                                                }`}
                                        />
                                        {errors[index]?.amount && (
                                            <p className="mt-1 text-xs text-red-500">입금액을 입력해주세요.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
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
