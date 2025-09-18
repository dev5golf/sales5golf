'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuotationStorage, QuotationListItem } from '@/hooks/useQuotationStorage';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface QuotationListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectQuotation: (quotationId: string) => void;
}

const QuotationListModal = ({ isOpen, onClose, onSelectQuotation }: QuotationListModalProps) => {
    const {
        quotationList,
        isLoading,
        error,
        loadQuotationList,
        removeQuotation,
        changeQuotationStatus,
        clearError
    } = useQuotationStorage();

    const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        if (isOpen) {
            loadQuotationList();
            clearError();
        }
    }, [isOpen, loadQuotationList, clearError]);

    const handleSelectQuotation = (quotationId: string) => {
        setSelectedQuotationId(quotationId);
    };

    const handleLoadQuotation = () => {
        if (selectedQuotationId) {
            onSelectQuotation(selectedQuotationId);
            onClose();
        }
    };

    const handleDeleteQuotation = async (quotationId: string) => {
        if (confirm('정말로 이 견적서를 삭제하시겠습니까?')) {
            try {
                await removeQuotation(quotationId);
                if (selectedQuotationId === quotationId) {
                    setSelectedQuotationId(null);
                }
            } catch (error) {
                console.error('견적서 삭제 실패:', error);
            }
        }
    };

    const handleStatusChange = async (quotationId: string, newStatus: 'draft' | 'completed') => {
        try {
            await changeQuotationStatus(quotationId, newStatus);
        } catch (error) {
            console.error('상태 변경 실패:', error);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'draft':
                return <Badge variant="secondary">임시저장</Badge>;
            case 'completed':
                return <Badge variant="default">완료</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return format(date, 'yyyy.MM.dd HH:mm', { locale: ko });
    };

    // 필터링된 견적서 목록
    const filteredQuotations = quotationList.filter(quotation => {
        const matchesSearch = (quotation.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (quotation.customerName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (quotation.destination || '').toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>저장된 견적서 목록</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col flex-1 min-h-0">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                            {error}
                        </div>
                    )}

                    {/* 검색 및 필터 섹션 */}
                    <div className="mb-4 space-y-3 flex-shrink-0">
                        <div className="flex gap-3">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    placeholder="견적서 제목, 고객명, 여행지로 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="w-32">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">전체</option>
                                    <option value="draft">임시저장</option>
                                    <option value="completed">완료</option>
                                </select>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            총 {filteredQuotations.length}개의 견적서
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-gray-500">로딩 중...</div>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto min-h-0">
                            {filteredQuotations.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    {quotationList.length === 0
                                        ? '저장된 견적서가 없습니다.'
                                        : '검색 조건에 맞는 견적서가 없습니다.'
                                    }
                                </div>
                            ) : (
                                <div className="space-y-2 pr-2">
                                    {filteredQuotations.map((quotation) => (
                                        <div
                                            key={quotation.id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${selectedQuotationId === quotation.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                }`}
                                            onClick={() => handleSelectQuotation(quotation.id)}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <h3 className="font-semibold text-gray-900">{quotation.title}</h3>
                                                        {getStatusBadge(quotation.status)}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 ml-4">
                                                    <select
                                                        value={quotation.status}
                                                        onChange={(e) => handleStatusChange(quotation.id, e.target.value as any)}
                                                        className="text-xs px-2 py-1 border border-gray-300 rounded"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <option value="draft">임시저장</option>
                                                        <option value="completed">완료</option>
                                                    </select>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteQuotation(quotation.id);
                                                        }}
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    >
                                                        삭제
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
                        <Button variant="outline" onClick={onClose}>
                            취소
                        </Button>
                        <Button
                            onClick={handleLoadQuotation}
                            disabled={!selectedQuotationId}
                        >
                            불러오기
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default QuotationListModal;
