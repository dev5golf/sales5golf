"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useQuotationData } from '../../../../hooks/useQuotationData';
import { usePreview } from '../../../../hooks/usePreview';
import { useQuotationStorage } from '../../../../hooks/useQuotationStorage';
import { Button } from '../../../../components/ui/button';
import { Download, Eye, Save, FolderOpen, Plus } from 'lucide-react';
import QuotationHeader from './components/QuotationHeader';
import QuotationForm from './components/QuotationForm';
import GolfScheduleTable from './components/GolfScheduleTable';
import GolfOnSiteTable from './components/GolfOnSiteTable';
import AccommodationTable from './components/AccommodationTable';
import PickupTable from './components/PickupTable';
import PaymentSummary from './components/PaymentSummary';
import PreviewModal from './components/PreviewModal';
import QuotationListModal from './components/QuotationListModal';

export default function AdminTools() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 커스텀 훅 사용
    const quotation = useQuotationData();
    const preview = usePreview();
    const storage = useQuotationStorage();

    // 기본/일본 선택 상태
    const [regionType, setRegionType] = useState<'basic' | 'japan'>('basic');

    // 모달 상태
    const [isQuotationListOpen, setIsQuotationListOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // 자동 저장 (30초마다) - 주석처리
    // useEffect(() => {
    //     const interval = setInterval(() => {
    //         if (hasUnsavedChanges && quotation.isFormValid()) {
    //             handleSaveQuotation();
    //         }
    //     }, 30000);
    //     return () => clearInterval(interval);
    // }, [hasUnsavedChanges, quotation.isFormValid()]);

    // 변경사항 감지
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [quotation.quotationData, quotation.golfSchedules,
    quotation.golfOnSiteSchedules, quotation.accommodationSchedules,
    quotation.pickupSchedules, quotation.paymentInfo, quotation.additionalOptions]);

    // 견적서 저장
    const handleSaveQuotation = async () => {
        try {
            await storage.saveQuotationData(
                quotation.quotationData,
                quotation.golfSchedules,
                quotation.golfOnSiteSchedules,
                quotation.accommodationSchedules,
                quotation.pickupSchedules,
                quotation.paymentInfo,
                quotation.additionalOptions
            );
            setHasUnsavedChanges(false);

            // 저장 성공 팝업 표시
            setShowSaveSuccess(true);
            setTimeout(() => {
                setShowSaveSuccess(false);
            }, 2000); // 2초 후 자동으로 사라짐
        } catch (error) {
            console.error('저장 실패:', error);
        }
    };

    // 견적서 불러오기
    const handleLoadQuotation = async (quotationId: string) => {
        try {
            const quotationData = await storage.loadQuotation(quotationId);
            if (quotationData) {
                // 모든 상태를 불러온 견적서 데이터로 복원
                quotation.setQuotationDataData(quotationData.quotationData);
                quotation.setGolfSchedulesData(quotationData.golfSchedules);
                quotation.setGolfOnSiteSchedulesData(quotationData.golfOnSiteSchedules);
                quotation.setAccommodationSchedulesData(quotationData.accommodationSchedules);
                quotation.setPickupSchedulesData(quotationData.pickupSchedules);
                quotation.setPaymentInfoData(quotationData.paymentInfo);
                quotation.setAdditionalOptions(quotationData.additionalOptions);

                setHasUnsavedChanges(false);
            }
        } catch (error) {
            console.error('불러오기 실패:', error);
        }
    };

    // 새 견적서 시작
    const handleNewQuotation = () => {
        if (hasUnsavedChanges && !confirm('저장되지 않은 변경사항이 있습니다. 새 견적서를 시작하시겠습니까?')) {
            return;
        }

        // 모든 상태 초기화
        quotation.setQuotationDataData({
            customerName: '',
            destination: '',
            travelPeriod: '',
            startDate: '',
            endDate: '',
            numberOfPeople: ''
        });

        quotation.setGolfSchedulesData([]);
        quotation.setGolfOnSiteSchedulesData([]);
        quotation.setAccommodationSchedulesData([]);
        quotation.setPickupSchedulesData([]);

        quotation.setPaymentInfoData({
            downPayment: '',
            downPaymentDate: '',
            balanceDueDate: ''
        });

        quotation.setAdditionalOptions('');

        storage.startNewQuotation();
        setHasUnsavedChanges(false);
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
            <QuotationHeader />

            {/* 지역 선택 */}
            <div className="hidden bg-white border-b border-gray-200 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold text-gray-900"></h1>
                        <div className="flex items-center gap-4">
                            <label className="text-sm font-medium text-gray-700">지역:</label>
                            <select
                                value={regionType}
                                onChange={(e) => setRegionType(e.target.value as 'basic' | 'japan')}
                                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="basic">기본</option>
                                <option value="japan">일본</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            {/* 견적서 컨테이너 */}
            <div ref={preview.quotationRef} className="bg-white rounded-lg shadow-sm p-8">
                {/* 견적서 폼 */}
                <QuotationForm
                    quotationData={quotation.quotationData}
                    inclusions={quotation.generateInclusions()}
                    pricePerPerson={quotation.calculatePricePerPerson()}
                    golfSchedules={quotation.golfSchedules}
                    accommodationSchedules={quotation.accommodationSchedules}
                    pickupSchedules={quotation.pickupSchedules}
                    onQuotationChange={quotation.updateQuotationData}
                />

                {/* 골프 일정 테이블 */}
                <GolfScheduleTable
                    schedules={quotation.golfSchedules}
                    onAdd={quotation.addGolfSchedule}
                    onUpdate={quotation.updateGolfSchedule}
                    onRemove={quotation.removeGolfSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
                    calculatePrepayment={quotation.calculatePrepayment}
                />

                {/* 골프(현장결제) 일정 테이블 - 일본 선택 시에만 표시 */}
                {regionType === 'japan' && (
                    <GolfOnSiteTable
                        schedules={quotation.golfOnSiteSchedules}
                        onAdd={quotation.addGolfOnSiteSchedule}
                        onUpdate={quotation.updateGolfOnSiteSchedule}
                        onRemove={quotation.removeGolfOnSiteSchedule}
                        numberOfPeople={quotation.quotationData.numberOfPeople}
                        isFormValid={quotation.isFormValid()}
                        calculatePrepayment={quotation.calculatePrepayment}
                    />
                )}

                {/* 숙박 일정 테이블 */}
                <AccommodationTable
                    schedules={quotation.accommodationSchedules}
                    onAdd={quotation.addAccommodationSchedule}
                    onUpdate={quotation.updateAccommodationSchedule}
                    onRemove={quotation.removeAccommodationSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
                    calculatePrepayment={quotation.calculatePrepayment}
                />

                {/* 픽업 일정 테이블 */}
                <PickupTable
                    schedules={quotation.pickupSchedules}
                    onAdd={quotation.addPickupSchedule}
                    onUpdate={quotation.updatePickupSchedule}
                    onRemove={quotation.removePickupSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
                    calculatePrepayment={quotation.calculatePrepayment}
                />

                {/* 결제 요약 */}
                <PaymentSummary
                    paymentInfo={quotation.paymentInfo}
                    onPaymentChange={quotation.updatePaymentInfo}
                    additionalOptions={quotation.additionalOptions}
                    onAdditionalOptionsChange={quotation.setAdditionalOptions}
                    totalPrepayment={quotation.calculateTotalPrepayment()}
                    downPayment={quotation.paymentInfo.downPayment}
                    balance={quotation.calculateBalance()}
                    balanceDueDate={quotation.paymentInfo.balanceDueDate}
                    totalAmount={`₩${quotation.calculateTotalAmount()}`}
                />
            </div>

            {/* 액션 버튼 섹션 */}
            <div className="mt-8 flex justify-center gap-4">
                <Button
                    onClick={handleNewQuotation}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 px-6 py-3"
                >
                    <Plus className="h-5 w-5" />
                    새 견적서
                </Button>
                <Button
                    onClick={() => setIsQuotationListOpen(true)}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 px-6 py-3"
                >
                    <FolderOpen className="h-5 w-5" />
                    불러오기
                </Button>
                <Button
                    onClick={handleSaveQuotation}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 px-6 py-3"
                    disabled={!quotation.isFormValid() || storage.isLoading}
                >
                    <Save className="h-5 w-5" />
                    {storage.isLoading ? '저장 중...' : '저장'}
                </Button>
                <Button
                    onClick={preview.generatePreview}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 px-6 py-3"
                >
                    <Eye className="h-5 w-5" />
                    미리보기
                </Button>
                <Button
                    onClick={() => preview.downloadQuotationAsImage(quotation.quotationData.customerName)}
                    variant="default"
                    size="lg"
                    className="flex items-center gap-2 px-6 py-3"
                >
                    <Download className="h-5 w-5" />
                    이미지 다운로드
                </Button>
            </div>

            {/* 미리보기 모달 */}
            <PreviewModal
                isOpen={preview.isPreviewOpen}
                onClose={preview.closePreview}
                onDownload={() => preview.downloadFromPreview(quotation.quotationData.customerName)}
                previewUrl={preview.previewUrl}
                isGenerating={preview.isGeneratingPreview}
                fileName={`견적서_${quotation.quotationData.customerName || '고객'}_${new Date().toISOString().split('T')[0]}.png`}
            />

            {/* 견적서 목록 모달 */}
            <QuotationListModal
                isOpen={isQuotationListOpen}
                onClose={() => setIsQuotationListOpen(false)}
                onSelectQuotation={handleLoadQuotation}
            />

            {/* 저장 성공 팝업 */}
            {showSaveSuccess && (
                <div className="fixed bottom-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-5 duration-300">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">견적서가 저장되었습니다!</span>
                </div>
            )}
        </div>
    );
}