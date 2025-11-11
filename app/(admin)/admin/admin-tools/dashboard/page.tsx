"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, Clock, X, Download, Calendar, CheckCircle, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RecruitmentModal, ActivityLog } from './components';
import { useRecruitmentModal } from './hooks/useRecruitmentModal';
import { DASHBOARD_CONSTANTS } from './constants';
import { RecruitmentService, RecruitmentListItem, QuotationSubItem } from './services/recruitmentService';
import { ActivityLogService } from './services/activityLogService';
import { RecruitmentData } from './components/RecruitmentModal';
import QuotationContent from '../quotation/components/QuotationContent';
import { getQuotation } from '@/lib/quotationService';
import { generatePreviewImage, downloadImage, generateQuotationFilename, createAdditionalInfoImage, generateAdditionalInfoFilename } from '@/lib/utils/imageUtils';

export default function AdminToolsDashboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [recruitments, setRecruitments] = useState<RecruitmentListItem[]>([]);
    const [loadingRecruitments, setLoadingRecruitments] = useState(true);
    const [quotationsByRecruitment, setQuotationsByRecruitment] = useState<Record<string, QuotationSubItem[]>>({});
    const [loadingQuotations, setLoadingQuotations] = useState<Record<string, boolean>>({});
    const [activityLogRefreshTrigger, setActivityLogRefreshTrigger] = useState(0);
    const [downloadingQuotationId, setDownloadingQuotationId] = useState<string | null>(null);
    const [hiddenQuotationRef, setHiddenQuotationRef] = useState<{ recruitmentId: string; quotationId: string } | null>(null);

    // 수배 등록 모달 훅
    const { isOpen, isLoading, editMode, initialData, openModal, openEditModal, closeModal, handleSubmit } = useRecruitmentModal({
        onLogCreated: () => {
            // 로그 생성 후 활동 로그 새로고침
            setActivityLogRefreshTrigger(prev => prev + 1);
        }
    });

    // 견적서 작성 모달 상태
    const [isQuotationOpen, setIsQuotationOpen] = useState(false);
    const [selectedRecruitment, setSelectedRecruitment] = useState<RecruitmentListItem | null>(null);

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
        // 수배 등록/수정 후 활동 로그 새로고침
        if (!isOpen) {
            setActivityLogRefreshTrigger(prev => prev + 1);
        }
    }, [isOpen]);

    // 대기 버튼 클릭 시 견적서 Dialog 열기
    const handleCreateQuotation = (recruitment: RecruitmentListItem) => {
        // 수배 데이터를 견적서 데이터로 변환하여 localStorage에 저장
        const quotationData = {
            customerName: recruitment.customerName,
            destination: recruitment.destination,
            travelPeriod: `${recruitment.startDate} ~ ${recruitment.endDate}`,
            startDate: recruitment.startDate,
            endDate: recruitment.endDate,
            numberOfPeople: recruitment.numberOfPeople
        };

        // localStorage에 임시 저장
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

    // 견적서 Dialog 닫기
    const handleCloseQuotation = () => {
        const currentRecruitmentId = selectedRecruitment?.id;
        setIsQuotationOpen(false);
        setSelectedRecruitment(null);
        // 견적서 목록 새로고침
        if (currentRecruitmentId) {
            loadQuotationsForRecruitment(currentRecruitmentId);
        }
        // 활동 로그 새로고침
        setActivityLogRefreshTrigger(prev => prev + 1);
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

            // 견적서 데이터 불러오기
            const quotation = await getQuotation(quotationId, recruitmentId);
            if (!quotation) {
                alert('견적서를 찾을 수 없습니다.');
                setDownloadingQuotationId(null);
                return;
            }

            // 숨겨진 렌더링 영역에 견적서 표시 (이미지 생성용)
            setHiddenQuotationRef({ recruitmentId, quotationId });

            // DOM이 렌더링될 때까지 대기 (QuotationContent가 완전히 로드될 때까지)
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

            // 이미지 생성
            const dataUrl = await generatePreviewImage(quotationRenderArea);
            const customerName = quotation.quotationData?.customerName || quotation.title?.split('_')[0] || '고객';
            const filename = generateQuotationFilename(customerName);

            // 견적서 이미지 다운로드
            downloadImage(dataUrl, filename);

            // 추가정보 섹션 찾기 및 이미지 다운로드
            try {
                const additionalInfoSection = hiddenElement.querySelector('[data-additional-info-section]') as HTMLElement;
                if (additionalInfoSection) {
                    // 추가정보 이미지 생성
                    const additionalInfoDataUrl = await createAdditionalInfoImage(additionalInfoSection);
                    const additionalInfoFilename = generateAdditionalInfoFilename(customerName);

                    // 약간의 지연을 두고 추가정보 이미지 다운로드 (순차 다운로드)
                    setTimeout(() => {
                        downloadImage(additionalInfoDataUrl, additionalInfoFilename);
                    }, 500);
                }
            } catch (error) {
                console.error('추가정보 이미지 다운로드 실패:', error);
                // 추가정보 이미지 다운로드 실패해도 견적서는 정상 다운로드됨
            }

            // 정리
            setHiddenQuotationRef(null);
            setDownloadingQuotationId(null);

            // 견적서 다운로드 로그 기록
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

                // 활동 로그 새로고침
                setActivityLogRefreshTrigger(prev => prev + 1);
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
            // 예약 기능은 추후 구현
            alert(`예약 기능은 추후 구현 예정입니다. (수배 ID: ${recruitmentId}, 견적서 ID: ${quotationId})`);

            // 예약 등록 로그 기록
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

                // 활동 로그 새로고침
                setActivityLogRefreshTrigger(prev => prev + 1);
            }
        } catch (error) {
            console.error('예약 로그 기록 실패:', error);
        }
    };

    // 권한 검사 - 수퍼관리자와 사이트관리자만 접근 가능
    if (!loading && user?.role !== 'super_admin' && user?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    // 로딩 상태
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50">
            {/* 헤더 */}
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800">{DASHBOARD_CONSTANTS.TITLES.MAIN}</h1>
                    <p className="text-gray-600 mt-1"></p>
                </div>
            </div>


            {/* 메인 그리드: 왼쪽(수배/예약/입금/출금), 오른쪽(활동 로그) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* 왼쪽: 수배, 예약, 입금, 출금 (2x2 그리드) */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 수배 */}
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between mb-4">
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
                                            <div className="flex items-center justify-between gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
                                                                // 수배 데이터를 RecruitmentData 형식으로 변환
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
                                                                className="flex items-center justify-between gap-2 p-2 bg-white rounded border border-gray-200 hover:bg-gray-50 transition-colors"
                                                            >
                                                                <div className="flex items-center gap-3 flex-1 min-w-0">
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

                    {/* 예약 */}
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {DASHBOARD_CONSTANTS.SECTIONS.RESERVATION}
                        </h3>
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                        </div>
                    </div>

                    {/* 입금 */}
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {DASHBOARD_CONSTANTS.SECTIONS.DEPOSIT}
                        </h3>
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                        </div>
                    </div>

                    {/* 출금 */}
                    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                            {DASHBOARD_CONSTANTS.SECTIONS.WITHDRAWAL}
                        </h3>
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500">{DASHBOARD_CONSTANTS.MESSAGES.NO_DATA}</p>
                        </div>
                    </div>
                </div>

                {/* 오른쪽: 활동 로그 (전체 높이) */}
                <div className="lg:col-span-1 flex">
                    <div className="w-full">
                        <ActivityLog refreshTrigger={activityLogRefreshTrigger} />
                    </div>
                </div>
            </div>

            {/* 입금, 출금 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 hidden">
                {/* 입금 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        최근 견적서
                    </h3>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div
                                key={item}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            고객명 {item}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            2025-10-{20 + item}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500">
                                    ₩{(Math.random() * 5000000 + 1000000).toLocaleString('ko-KR', { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 빠른 액세스 */}
                <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        빠른 액세스
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => router.push('/admin/admin-tools/quotation')}
                            className="w-full p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors border border-blue-200"
                        >
                            <div className="flex items-center space-x-3">
                                <FileText className="h-5 w-5 text-blue-600" />
                                <div>
                                    <p className="font-medium text-gray-800">새 견적서 작성</p>
                                    <p className="text-sm text-gray-600">골프 여행 견적서 생성</p>
                                </div>
                            </div>
                        </button>
                    </div>
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
        </div>
    );
}

