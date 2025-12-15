'use client';

import { useState, useEffect } from 'react';
import { Vendor, VendorCategory } from '../types';
import { db } from '@/lib/firebase';
import { doc, addDoc, collection, updateDoc, serverTimestamp } from 'firebase/firestore';
import Modal from '@/app/(admin)/admin/components/Modal';
import { Button } from '@/components/ui/button';

interface VendorModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendor?: Vendor | null;
    onSave: () => void;
}

export default function VendorModal({ isOpen, onClose, vendor, onSave }: VendorModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        category: '계좌이체' as VendorCategory,
        bankName: '',
        depositorName: '',
        accountNumber: '',
        memo: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (vendor) {
                setFormData({
                    name: vendor.name || '',
                    category: vendor.category || '계좌이체',
                    bankName: vendor.bankName || '',
                    depositorName: vendor.depositorName || '',
                    accountNumber: vendor.accountNumber || '',
                    memo: vendor.memo || ''
                });
            } else {
                setFormData({
                    name: '',
                    category: '계좌이체',
                    bankName: '',
                    depositorName: '',
                    accountNumber: '',
                    memo: ''
                });
            }
        }
    }, [isOpen, vendor]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const vendorData: any = {
                name: formData.name,
                category: formData.category,
                memo: formData.memo || '',
                updatedAt: serverTimestamp()
            };

            // 계좌이체일 때만 은행 관련 정보 추가
            if (formData.category === '계좌이체') {
                vendorData.bankName = formData.bankName || '';
                vendorData.depositorName = formData.depositorName || '';
                vendorData.accountNumber = formData.accountNumber || '';
            } else {
                // 카드결제일 때는 빈 문자열로 설정
                vendorData.bankName = '';
                vendorData.depositorName = '';
                vendorData.accountNumber = '';
            }

            if (vendor) {
                // 수정
                const vendorRef = doc(db, 'vendors', vendor.id);
                await updateDoc(vendorRef, vendorData);
                alert('거래처 정보가 성공적으로 수정되었습니다.');
            } else {
                // 생성
                await addDoc(collection(db, 'vendors'), {
                    ...vendorData,
                    createdAt: serverTimestamp()
                });
                alert('거래처가 성공적으로 등록되었습니다.');
            }

            onSave();
            onClose();
        } catch (error: any) {
            console.error('거래처 저장 실패:', error);
            alert('거래처 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCategoryChange = (category: VendorCategory) => {
        setFormData(prev => ({
            ...prev,
            category
        }));
    };

    const isAccountTransfer = formData.category === '계좌이체';

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={vendor ? '거래처 수정' : '거래처 등록'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        거래처명 *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        분류 *
                    </label>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant={formData.category === '계좌이체' ? 'default' : 'outline'}
                            onClick={() => handleCategoryChange('계좌이체')}
                            className="flex-1"
                        >
                            계좌이체
                        </Button>
                        <Button
                            type="button"
                            variant={formData.category === '카드결제' ? 'default' : 'outline'}
                            onClick={() => handleCategoryChange('카드결제')}
                            className="flex-1"
                        >
                            카드결제
                        </Button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        은행명
                    </label>
                    <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleInputChange}
                        disabled={!isAccountTransfer}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isAccountTransfer ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        입금자명
                    </label>
                    <input
                        type="text"
                        name="depositorName"
                        value={formData.depositorName}
                        onChange={handleInputChange}
                        disabled={!isAccountTransfer}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isAccountTransfer ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        계좌번호
                    </label>
                    <input
                        type="text"
                        name="accountNumber"
                        value={formData.accountNumber}
                        onChange={handleInputChange}
                        disabled={!isAccountTransfer}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!isAccountTransfer ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        메모
                    </label>
                    <textarea
                        name="memo"
                        value={formData.memo}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? '저장 중...' : '저장'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}

