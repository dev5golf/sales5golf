'use client';

import { useState, useEffect } from 'react';
import { Plus, Clock, Download, Calendar, CheckCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';
import { RecruitmentModal } from './index';
import { useRecruitmentModal } from '../hooks/useRecruitmentModal';
import { DASHBOARD_CONSTANTS } from '../constants';
import { RecruitmentService, RecruitmentListItem, QuotationSubItem } from '../services/recruitmentService';
import { ActivityLogService } from '../services/activityLogService';
import { RecruitmentData } from './RecruitmentModal';
import QuotationContent from '../../quotation/components/QuotationContent';
import { getQuotation } from '@/lib/quotationService';
import { generatePreviewImage, downloadImage, generateQuotationFilename, createAdditionalInfoImage, generateAdditionalInfoFilename } from '@/lib/utils/imageUtils';
import { useAuth } from '@/contexts/AuthContext';

interface RecruitmentSectionProps {
    onActivityLogRefresh?: () => void;
}

export default function RecruitmentSection({ onActivityLogRefresh }: RecruitmentSectionProps) {
    const { user } = useAuth();
    const [recruitments, setRecruitments] = useState<RecruitmentListItem[]>([]);
    const [loadingRecruitments, setLoadingRecruitments] = useState(true);
    const [quotationsByRecruitment, setQuotationsByRecruitment] = useState<Record<string, QuotationSubItem[]>>({});
    const [loadingQuotations, setLoadingQuotations] = useState<Record<string, boolean>>({});
    const [downloadingQuotationId, setDownloadingQuotationId] = useState<string | null>(null);
    const [hiddenQuotationRef, setHiddenQuotationRef] = useState<{ recruitmentId: string; quotationId: string } | null>(null);
    const [isQuotationOpen, setIsQuotationOpen] = useState(false);
    const [selectedRecruitment, setSelectedRecruitment] = useState<RecruitmentListItem | null>(null);

    // 수배 등록 모달 훅
    const { isOpen, isLoading, editMode, initialData, openModal, openEditModal, closeModal, handleSubmit } = useRecruitmentModal({
        onLogCreated: () => {
            onActivityLogRefresh?.();
        }
    });

    // 수배 목록 불러오기 함수
    const loadRecruitments = async () => {
        setLoadingRecruitments(true);
        const response = await RecruitmentService.getRecruitments();
        if (response.success && response.data) {
            setRecruitments(response.data);
            // 각 수배의 견적서 목록도 함께 불러오기
            response.data.forEach(async (recruitment) => {
                setLoadingQuotations(prev => ({ ...prev, [recruitment.id]: true }));
                const quotations = await RecruitmentService.getQuotationsByRecruitmentId(recruitment.id);
                setQuotationsByRecruitment(prev => ({ ...prev, [recruitment.id]: quotations }));
                setLoadingQuotations(prev => ({ ...prev, [recruitment.id]: false }));
            });
        }
        setLoadingRecruitments(false);
    };

    // 수배 목록 불러오기
    useEffect(() => {
        loadRecruitments();
        if (!isOpen) {
            onActivityLogRefresh?.();
        }
    }, [isOpen]);

    // 대기 버튼 클릭 시 견적서 Dialog 열기
    const handleCreateQuotation = (recruitment: RecruitmentListItem) => {
        const quotationData = {
            customerName: recruitment.customerName,
            destination: recruitment.destination,
            travelPeriod: `${recruitment.startDate} ~ ${recruitment.endDate}`,
            startDate: recruitment.startDate,
            endDate: recruitment.endDate,
            numberOfPeople: recruitment.numberOfPeople
        };

        localStorage.setItem('pendingQuotationData', JSON.stringify(quotationData));
        setSelectedRecruitment(recruitment);
        setIsQuotationOpen(true);
    };

    // 수배 목록 새로고침 함수
    const refreshRecruitments = async () => {
        setLoadingRecruitments(true);
        const response = await RecruitmentService.getRecruitments();
        if (response.success && response.data) {
            setRecruitments(response.data);
            response.data.forEach(async (recruitment) => {
                setLoadingQuotations(prev => ({ ...prev, [recruitment.id]: true }));
                const quotations = await RecruitmentService.getQuotationsByRecruitmentId(recruitment.id);
                setQuotationsByRecruitment(prev => ({ ...prev, [recruitment.id]: quotations }));
                setLoadingQuotations(prev => ({ ...prev, [recruitment.id]: false }));
            });
        }
        setLoadingRecruitments(false);
    };

    // 견적서 Dialog 닫기
    const handleCloseQuotation = () => {
        const currentRecruitmentId = selectedRecruitment?.id;
        setIsQuotationOpen(false);
        setSelectedRecruitment(null);
        if (currentRecruitmentId) {
            loadQuotationsForRecruitment(currentRecruitmentId);
        }
        onActivityLogRefresh?.();
    };

    // 특정 수배의 견적서 목록 불러오기
    const loadQuotationsForRecruitment = async (recruitmentId: string) => {
        setLoadingQuotations(prev => ({ ...prev, [recruitmentId]: true }));
        const quotations = await RecruitmentService.getQuotationsByRecruitmentId(recruitmentId);
        setQuotationsByRecruitment(prev => ({ ...prev, [recruitmentId]: quotations }));
        setLoadingQuotations(prev => ({ ...prev, [recruitmentId]: false }));
    };

    // 견적서 다운로드 핸들러
    const handleDownloadQuotation = async (recruitmentId: string, quotationId: string) => {
        try {
            setDownloadingQuotationId(quotationId);

            const quotation = await getQuotation(quotationId, recruitmentId);
            if (!quotation) {
                alert('견적서를 찾을 수 없습니다.');
                setDownloadingQuotationId(null);
                return;
            }

            setHiddenQuotationRef({ recruitmentId, quotationId });

            let quotationRenderArea: HTMLElement | null = null;
            let hiddenElement: HTMLElement | null = null;
            let retryCount = 0;
            const maxRetries = 10;

            while (!quotationRenderArea && retryCount < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 500));
                hiddenElement = document.getElementById(`hidden-quotation-${quotationId}`);
                if (hiddenElement) {
                    quotationRenderArea = hiddenElement.querySelector('[data-quotation-render]') as HTMLElement;
                }
                retryCount++;
            }

            if (!quotationRenderArea || !hiddenElement) {
                alert('견적서 렌더링에 실패했습니다. 잠시 후 다시 시도해주세요.');
                setDownloadingQuotationId(null);
                setHiddenQuotationRef(null);
                return;
            }

            const dataUrl = await generatePreviewImage(quotationRenderArea);
            const customerName = quotation.quotationData?.customerName || quotation.title?.split('_')[0] || '고객';
            const filename = generateQuotationFilename(customerName);

            downloadImage(dataUrl, filename);

            try {
                const additionalInfoSection = hiddenElement.querySelector('[data-additional-info-section]') as HTMLElement;
                if (additionalInfoSection) {
                    const additionalInfoDataUrl = await createAdditionalInfoImage(additionalInfoSection);
                    const additionalInfoFilename = generateAdditionalInfoFilename(customerName);
                    setTimeout(() => {
                        downloadImage(additionalInfoDataUrl, additionalInfoFilename);
                    }, 500);
                }
            } catch (error) {
                console.error('추가정보 이미지 다운로드 실패:', error);
            }

            setHiddenQuotationRef(null);
            setDownloadingQuotationId(null);

            if (user) {
                const userName = user.name || user.email || '알 수 없음';
                const quotationItem = quotationsByRecruitment[recruitmentId]?.find(q => q.id === quotationId);
                const targetTitle = quotationItem?.title || quotation.title;

                await ActivityLogService.createLog({
                    action: 'quotation_download',
                    userId: user.id,
                    userName: userName,
                    targetId: quotationId,
                    targetTitle: targetTitle
                });

                onActivityLogRefresh?.();
            }
        } catch (error) {
            console.error('견적서 다운로드 실패:', error);
            alert('견적서 다운로드에 실패했습니다.');
            setDownloadingQuotationId(null);
            setHiddenQuotationRef(null);
        }
    };

    // 예약 버튼 핸들러
    const handleReserveQuotation = async (recruitmentId: string, quotationId: string) => {
        try {
            alert(`예약 기능은 추후 구현 예정입니다. (수배 ID: ${recruitmentId}, 견적서 ID: ${quotationId})`);

            if (user) {
                const userName = user.name || user.email || '알 수 없음';
                const quotation = quotationsByRecruitment[recruitmentId]?.find(q => q.id === quotationId);
                const targetTitle = quotation?.title;

                await ActivityLogService.createLog({
                    action: 'reservation_create',
                    userId: user.id,
                    userName: userName,
                    targetId: quotationId,
                    targetTitle: targetTitle
                });

                onActivityLogRefresh?.();
            }
        } catch (error) {
            console.error('예약 로그 기록 실패:', error);
        }
    };

    return (
        <>
            <div className="p-1 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {DASHBOARD_CONSTANTS.SECTIONS.RECRUITMENT}
                    </h3>
                    <Button size="sm" className="flex items-center gap-2" onClick={openModal}>
                        <Plus className="h-4 w-4" />
                        {DASHBOARD_CONSTANTS.BUTTONS.REGISTER}
                    </Button>
                </div>
                <div className="space-y-3">
                    {loadingRecruitments ? (
                        <div className="flex items-center justify-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        </div>
                    ) : recruitments.length === 0 ? (
                        <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                    ) : (
                        <>
                            {recruitments.map((recruitment) => (
                                <div key={recruitment.id} className="space-y-2">
                                    <div className="flex items-center justify-between gap-1 p-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                        <span className="text-xs text-gray-500 w-fit max-w-10 truncate flex-shrink-0">
                                            {recruitment.createdBy}
                                        </span>
                                        <p className="text-sm font-medium text-gray-800 flex-1 truncate min-w-0">
                                            {recruitment.title}
                                        </p>
                                        {recruitment.sub_status === 0 && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleCreateQuotation(recruitment)}
                                                className="flex items-center gap-1 text-orange-600 border-orange-300 hover:bg-orange-50 flex-shrink-0"
                                            >
                                                <Clock className="h-3 w-3" />
                                                대기
                                            </Button>
                                        )}
                                        {recruitment.sub_status === 1 && (
                                            <>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    disabled
                                                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white flex-shrink-0 cursor-default"
                                                >
                                                    <CheckCircle className="h-3 w-3" />
                                                    완료
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => {
                                                        const recruitmentData: RecruitmentData = {
                                                            customerName: recruitment.customerName || '',
                                                            destination: recruitment.destination || '',
                                                            startDate: recruitment.startDate || '',
                                                            endDate: recruitment.endDate || '',
                                                            numberOfPeople: recruitment.numberOfPeople || ''
                                                        };
                                                        openEditModal(recruitment.id, recruitmentData);
                                                    }}
                                                    className="flex items-center gap-1 text-blue-600 border-blue-300 hover:bg-blue-50 flex-shrink-0"
                                                >
                                                    <Edit className="h-3 w-3" />
                                                    수정
                                                </Button>
                                            </>
                                        )}
                                    </div>

                                    {/* 견적서 목록 표시 */}
                                    {quotationsByRecruitment[recruitment.id] && quotationsByRecruitment[recruitment.id].length > 0 && (
                                        <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                                            {loadingQuotations[recruitment.id] ? (
                                                <div className="flex items-center justify-center py-2">
                                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                                </div>
                                            ) : (
                                                quotationsByRecruitment[recruitment.id].map((quotation) => (
                                                    <div
                                                        key={quotation.id}
                                                        className="flex items-center justify-between gap-1 p-1 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                                                    >
                                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                                            <span className="text-xs text-gray-500 w-fit max-w-10 truncate flex-shrink-0">
                                                                {quotation.createdBy}
                                                            </span>
                                                            <p className="text-xs font-medium text-gray-800 flex-1 truncate min-w-0">
                                                                {quotation.title}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-shrink-0">
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => handleDownloadQuotation(recruitment.id, quotation.id)}
                                                                disabled={downloadingQuotationId === quotation.id}
                                                                className="h-7 px-2 text-xs"
                                                            >
                                                                {downloadingQuotationId === quotation.id ? (
                                                                    <>
                                                                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                                                        생성 중
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Download className="h-3 w-3 mr-1" />
                                                                        다운
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="default"
                                                                onClick={() => handleReserveQuotation(recruitment.id, quotation.id)}
                                                                className="h-7 px-2 text-xs"
                                                            >
                                                                <Calendar className="h-3 w-3 mr-1" />
                                                                예약
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </div>

            {/* 수배 등록 모달 */}
            <RecruitmentModal
                isOpen={isOpen}
                onClose={closeModal}
                onSubmit={handleSubmit}
                initialData={initialData}
                isEditMode={editMode}
            />

            {/* 견적서 작성 Dialog */}
            <Dialog open={isQuotationOpen} onOpenChange={setIsQuotationOpen}>
                <DialogContent className="max-w-[95vw] w-[1400px] h-[90vh] overflow-auto p-0">
                    <DialogHeader className="px-6 pt-6 pb-4 border-b sticky top-0 bg-white z-10">
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-semibold text-gray-800">
                                견적서 작성
                            </DialogTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={handleCloseQuotation}
                                className="h-8 w-8"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </DialogHeader>
                    <div className="overflow-auto">
                        {selectedRecruitment && (
                            <QuotationContent
                                isModal={true}
                                orderDocumentId={selectedRecruitment.id}
                                onSaveSuccess={refreshRecruitments}
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* 숨겨진 견적서 렌더링 영역 (이미지 다운로드용) */}
            {hiddenQuotationRef && (
                <div
                    id={`hidden-quotation-${hiddenQuotationRef.quotationId}`}
                    className="fixed -left-[9999px] top-0 w-[1400px]"
                    style={{ position: 'absolute', visibility: 'hidden' }}
                >
                    <QuotationContent
                        isModal={false}
                        orderDocumentId={hiddenQuotationRef.recruitmentId}
                        initialQuotationId={hiddenQuotationRef.quotationId}
                        onClose={() => { }}
                    />
                </div>
            )}
        </>
    );
}

