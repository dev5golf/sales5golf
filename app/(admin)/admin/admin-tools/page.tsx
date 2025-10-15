"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useQuotationData } from '../../../../hooks/useQuotationData';
import { usePreview } from '../../../../hooks/usePreview';
import { useQuotationStorage } from '../../../../hooks/useQuotationStorage';
import { Button } from '../../../../components/ui/button';
import { Download, Eye, Save, FolderOpen, Plus } from 'lucide-react';
import QuotationForm from './components/QuotationForm';
import GolfScheduleTable from './components/GolfScheduleTable';
import GolfOnSiteTable from './components/GolfOnSiteTable';
import AccommodationTable from './components/AccommodationTable';
import PickupTable from './components/PickupTable';
import FlightTable from './components/FlightTable';
import RentalCarTable from './components/RentalCarTable';
import RentalCarOnsiteTable from './components/RentalCarOnsiteTable';
import PaymentSummary from './components/PaymentSummary';
import AdditionalInfoSection from './components/AdditionalInfoSection';
import FeeSection from './components/FeeSection';
import PreviewModal from './components/PreviewModal';
import QuotationListModal from './components/QuotationListModal';

export default function AdminTools() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 커스텀 훅 사용
    const quotation = useQuotationData();
    const preview = usePreview();
    const storage = useQuotationStorage(user?.id);

    // 기본/일본 선택 상태
    const [regionType, setRegionType] = useState<'basic' | 'japan'>('basic');

    // 환율 상태 (1엔 = ?원)
    const [exchangeRate, setExchangeRate] = useState<number>(9);
    const [isLoading, setIsLoading] = useState(false);

    // 모달 상태
    const [isQuotationListOpen, setIsQuotationListOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // 자동저장을 위한 최신 quotation 참조
    const quotationRef = useRef(quotation);
    quotationRef.current = quotation;

    // 간단한 참조를 위한 별칭
    const curQuotationRef = quotationRef.current;

    // 자동 저장 (3분마다) - 최신 quotation 데이터 참조
    useEffect(() => {
        const interval = setInterval(() => {
            // 최신 quotation 데이터 사용
            if (hasUnsavedChanges && curQuotationRef.isFormValid()) {
                handleSaveQuotation();
            }
        }, 10000);
        return () => clearInterval(interval);
    }, [hasUnsavedChanges]); // quotation 제거하여 클로저 문제 해결

    // 변경사항 감지 (환율 제외)
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [curQuotationRef.quotationData, curQuotationRef.golfSchedules,
    curQuotationRef.golfOnSiteSchedules, curQuotationRef.accommodationSchedules,
    curQuotationRef.pickupSchedules, curQuotationRef.flightSchedules, curQuotationRef.rentalCarSchedules,
    curQuotationRef.rentalCarOnSiteSchedules, curQuotationRef.paymentInfo, curQuotationRef.additionalOptions]);

    // 일본 지역 선택 시 자동으로 환율 가져오기
    useEffect(() => {
        if (regionType === 'japan') {
            fetchExchangeRate();
        }
    }, [regionType]);

    // 견적서 저장
    const handleSaveQuotation = async () => {
        try {
            // 최신 quotation 데이터 사용
            await storage.saveQuotationData(
                curQuotationRef.quotationData,
                curQuotationRef.golfSchedules,
                curQuotationRef.golfOnSiteSchedules,
                curQuotationRef.accommodationSchedules,
                curQuotationRef.pickupSchedules,
                curQuotationRef.flightSchedules,
                curQuotationRef.rentalCarSchedules,
                curQuotationRef.rentalCarOnSiteSchedules,
                curQuotationRef.paymentInfo,
                curQuotationRef.additionalOptions,
                regionType // 지역 타입만 저장
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

    // 환율 가져오기
    const fetchExchangeRate = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('/api/exchange-rate');
            const data = await response.json();

            if (data.rate) {
                setExchangeRate(data.rate);
            }
        } catch (error) {
            console.error('환율 가져오기 실패:', error);
        } finally {
            setIsLoading(false);
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
                quotation.setFlightSchedulesData(quotationData.flightSchedules || []);
                quotation.setRentalCarSchedulesData(quotationData.rentalCarSchedules || []);
                quotation.setRentalCarOnSiteSchedulesData(quotationData.rentalCarOnSiteSchedules || []);
                quotation.setPaymentInfoData(quotationData.paymentInfo);
                quotation.setAdditionalOptions(quotationData.additionalOptions);

                // 지역 타입 복원 (기존 데이터 호환성을 위해 기본값 'basic' 사용)
                const loadedRegionType = quotationData.regionType || 'basic';
                setRegionType(loadedRegionType);

                // 일본 지역이면 자동으로 최신 환율 가져오기
                if (loadedRegionType === 'japan') {
                    fetchExchangeRate();
                }

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
        quotation.setFlightSchedulesData([]);
        quotation.setRentalCarSchedulesData([]);
        quotation.setRentalCarOnSiteSchedulesData([]);

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
            <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800">관리자 도구</h1>
                    <p className="text-gray-600 mt-1">편의 기능</p>
                </div>
            </div>

            {/* 지역 선택 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
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

                            {/* 일본 선택 시 환율 입력 폼 */}
                            {regionType === 'japan' && (
                                <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-300">
                                    <label className="text-sm font-medium text-gray-700">환율:</label>
                                    <div className="flex items-center gap-1">
                                        <span className="text-sm text-gray-600">1엔 =</span>
                                        <input
                                            type="number"
                                            value={exchangeRate}
                                            readOnly
                                            step="0.01"
                                            min="0"
                                            className="w-20 px-2 py-1 border border-gray-300 rounded text-sm text-center bg-gray-100 cursor-not-allowed"
                                        />
                                        <span className="text-sm text-gray-600">원</span>
                                    </div>
                                </div>
                            )}
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
                    totalAmount={quotation.calculateTotalAmount()}
                    golfSchedules={quotation.golfSchedules}
                    accommodationSchedules={quotation.accommodationSchedules}
                    pickupSchedules={quotation.pickupSchedules}
                    onQuotationChange={quotation.updateQuotationData}
                    isJapanRegion={regionType === 'japan'}
                    exchangeRate={exchangeRate}
                    onSiteYenTotal={quotation.calculateOnSiteYenTotal()}
                />

                {/* 골프 일정 테이블 */}
                <GolfScheduleTable
                    schedules={quotation.golfSchedules}
                    onAdd={quotation.addGolfSchedule}
                    onUpdate={quotation.updateGolfSchedule}
                    onRemove={quotation.removeGolfSchedule}
                    onCopy={quotation.copyGolfSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
                    calculatePrepayment={quotation.calculatePrepayment}
                    regionType={regionType}
                    calculateTotalFromPerPerson={quotation.calculateTotalFromPerPerson}
                />

                {/* 골프(현장결제) 일정 테이블 - 일본 선택 시에만 표시 */}
                {regionType === 'japan' && (
                    <GolfOnSiteTable
                        schedules={quotation.golfOnSiteSchedules}
                        onAdd={quotation.addGolfOnSiteSchedule}
                        onUpdate={quotation.updateGolfOnSiteSchedule}
                        onRemove={quotation.removeGolfOnSiteSchedule}
                        onCopy={quotation.copyGolfOnSiteSchedule}
                        numberOfPeople={quotation.quotationData.numberOfPeople}
                        isFormValid={quotation.isFormValid()}
                        calculatePrepayment={quotation.calculatePrepayment}
                        exchangeRate={exchangeRate}
                        regionType={regionType}
                        calculateTotalFromPerPerson={quotation.calculateTotalFromPerPerson}
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
                    onCopy={quotation.copyPickupSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
                    calculatePrepayment={quotation.calculatePrepayment}
                />

                {/* 항공 일정 테이블 */}
                <FlightTable
                    schedules={quotation.flightSchedules}
                    onAdd={quotation.addFlightSchedule}
                    onUpdate={quotation.updateFlightSchedule}
                    onRemove={quotation.removeFlightSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
                    calculatePrepayment={quotation.calculatePrepayment}
                    calculateTotalFromPerPerson={quotation.calculateTotalFromPerPerson}
                    regionType={regionType}
                />

                {/* 렌트카 일정 테이블들 - 일본 선택 시에만 표시 */}
                {regionType === 'japan' && (
                    <>
                        {/* 렌트카(사전결제) 일정 테이블 */}
                        <RentalCarTable
                            schedules={quotation.rentalCarSchedules}
                            onAdd={quotation.addRentalCarSchedule}
                            onUpdate={quotation.updateRentalCarSchedule}
                            onRemove={quotation.removeRentalCarSchedule}
                            numberOfPeople={quotation.quotationData.numberOfPeople}
                            isFormValid={quotation.isFormValid()}
                            calculatePrepayment={quotation.calculatePrepayment}
                        />

                        {/* 렌트카(현장결제) 일정 테이블 */}
                        <RentalCarOnsiteTable
                            schedules={quotation.rentalCarOnSiteSchedules}
                            onAdd={quotation.addRentalCarOnSiteSchedule}
                            onUpdate={quotation.updateRentalCarOnSiteSchedule}
                            onRemove={quotation.removeRentalCarOnSiteSchedule}
                            numberOfPeople={quotation.quotationData.numberOfPeople}
                            isFormValid={quotation.isFormValid()}
                            calculatePrepayment={quotation.calculatePrepayment}
                            exchangeRate={exchangeRate}
                        />
                    </>
                )}

                {/* 결제 요약 */}
                <PaymentSummary
                    paymentInfo={quotation.paymentInfo}
                    onPaymentChange={quotation.updatePaymentInfo}
                    balance={quotation.calculateBalance()}
                    totalAmount={`₩${quotation.calculateTotalAmount()}`}
                    onSiteYenTotal={quotation.calculateOnSiteYenTotal()}
                    isJapanRegion={regionType === 'japan'}
                    exchangeRate={exchangeRate}
                />

                {/* 오분골프 수수료 */}
                <FeeSection
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    golfSchedules={quotation.golfSchedules}
                    golfOnSiteSchedules={quotation.golfOnSiteSchedules}
                    accommodationSchedules={quotation.accommodationSchedules}
                    rentalCarSchedules={quotation.rentalCarSchedules}
                    rentalCarOnSiteSchedules={quotation.rentalCarOnSiteSchedules}
                    flightSchedules={quotation.flightSchedules}
                    regionType={regionType}
                />

                {/* 추가 정보 섹션 */}
                <AdditionalInfoSection
                    additionalOptions={quotation.additionalOptions}
                    onAdditionalOptionsChange={quotation.setAdditionalOptions}
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
                currentUserId={user?.id}
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