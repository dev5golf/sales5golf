'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuotationData } from '@/hooks/useQuotationData';
import { usePreview } from '@/hooks/usePreview';
import { useQuotationStorage } from '@/hooks/useQuotationStorage';
import { Button } from '@/components/ui/button';
import { Download, Eye, Save, FolderOpen, Plus } from 'lucide-react';
import { RecruitmentService } from '@/app/(admin)/admin/admin-tools/dashboard/services/recruitmentService';
import { ActivityLogService } from '@/app/(admin)/admin/admin-tools/dashboard/services/activityLogService';
import { getQuotation } from '@/lib/quotationService';
import QuotationForm from './QuotationForm';
import GolfScheduleTable from './GolfScheduleTable';
import GolfOnSiteTable from './GolfOnSiteTable';
import AccommodationTable from './AccommodationTable';
import PickupTable from './PickupTable';
import FlightTable from './FlightTable';
import RentalCarTable from './RentalCarTable';
import RentalCarOnsiteTable from './RentalCarOnsiteTable';
import PaymentSummary from './PaymentSummary';
import AdditionalInfoSection from './AdditionalInfoSection';
import FeeSection from './FeeSection';
import PreviewModal from './PreviewModal';
import QuotationListModal from './QuotationListModal';

interface QuotationContentProps {
    onClose?: () => void;
    isModal?: boolean;
    orderDocumentId?: string; // orders 컬렉션의 문서 ID (서브컬렉션 사용 시 필요)
    onSaveSuccess?: () => void; // 저장 성공 후 콜백
    initialQuotationId?: string; // 초기 로드할 견적서 ID (다운로드용)
}

export default function QuotationContent({ onClose, isModal = false, orderDocumentId, onSaveSuccess, initialQuotationId }: QuotationContentProps) {
    const { user } = useAuth();

    // 커스텀 훅 사용
    const quotation = useQuotationData();
    const preview = usePreview();
    const userName = user?.name || user?.email || '관리자';
    const storage = useQuotationStorage(userName, user?.id);

    // 기본/일본 선택 상태
    const [regionType, setRegionType] = useState<'basic' | 'japan'>('basic');

    // 환율 상태 (1엔 = ?원)
    const [exchangeRate, setExchangeRate] = useState<number>(9);
    const [isLoading, setIsLoading] = useState(false);

    // 패키지견적 체크박스 상태
    const [isPackageQuotation, setIsPackageQuotation] = useState<boolean>(false);

    // 모달 상태
    const [isQuotationListOpen, setIsQuotationListOpen] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);

    // 자동저장을 위한 최신 quotation 참조
    const quotationRef = useRef(quotation);
    quotationRef.current = quotation;

    const regionTypeRef = useRef<'basic' | 'japan'>('basic');
    regionTypeRef.current = regionType;

    const isPackageQuotationRef = useRef<boolean>(false);
    isPackageQuotationRef.current = isPackageQuotation;

    // useQuotationData 훅의 regionType도 동기화
    useEffect(() => {
        quotation.setRegionType(regionType);
    }, [regionType]);

    // useQuotationData 훅의 isPackageQuotation도 동기화
    useEffect(() => {
        quotation.setIsPackageQuotation(isPackageQuotation);
    }, [isPackageQuotation]);

    // 자동 저장 (3분마다) - 최신 quotation 데이터 참조
    useEffect(() => {
        const interval = setInterval(() => {
            // 최신 quotation 데이터 사용
            if (hasUnsavedChanges && quotationRef.current.isFormValid()) {
                console.log(hasUnsavedChanges, quotationRef.current.isFormValid());
                handleSaveQuotation();
            }
            console.log('자동저장', hasUnsavedChanges, quotationRef.current.isFormValid());
        }, 180000);
        return () => clearInterval(interval);
    }, [hasUnsavedChanges]);

    // 변경사항 감지 (환율 제외)
    useEffect(() => {
        setHasUnsavedChanges(true);
    }, [quotationRef.current.quotationData, quotationRef.current.golfSchedules,
    quotationRef.current.golfOnSiteSchedules, quotationRef.current.accommodationSchedules,
    quotationRef.current.pickupSchedules, quotationRef.current.flightSchedules, quotationRef.current.rentalCarSchedules,
    quotationRef.current.rentalCarOnSiteSchedules, quotationRef.current.paymentInfo, quotationRef.current.additionalOptions,
        regionType]);

    // 일본 지역 선택 시 자동으로 환율 가져오기
    useEffect(() => {
        if (regionType === 'japan') {
            fetchExchangeRate();
        } else {
            // 기본 지역으로 변경 시 패키지견적 체크박스 초기화
            setIsPackageQuotation(false);
        }
    }, [regionType]);

    // localStorage에서 pendingQuotationData 불러오기 또는 초기 견적서 로드
    useEffect(() => {
        // 초기 견적서 ID가 있으면 해당 견적서 로드
        if (initialQuotationId && orderDocumentId) {
            const loadInitialQuotation = async () => {
                try {
                    const quotationData = await getQuotation(initialQuotationId, orderDocumentId);
                    if (quotationData) {
                        quotation.setQuotationDataData(quotationData.quotationData);
                        quotation.setGolfSchedulesData(quotationData.golfSchedules);
                        quotation.setGolfOnSiteSchedulesData(quotationData.golfOnSiteSchedules);
                        quotation.setAccommodationSchedulesData(quotationData.accommodationSchedules);
                        quotation.setPickupSchedulesData(quotationData.pickupSchedules);
                        quotation.setFlightSchedulesData(quotationData.flightSchedules);
                        quotation.setRentalCarSchedulesData(quotationData.rentalCarSchedules);
                        quotation.setRentalCarOnSiteSchedulesData(quotationData.rentalCarOnSiteSchedules);
                        quotation.setPaymentInfoData(quotationData.paymentInfo);
                        quotation.setAdditionalOptions(quotationData.additionalOptions);
                        setRegionType(quotationData.regionType || 'basic');
                        setIsPackageQuotation(quotationData.isPackageQuotation || false);
                    }
                } catch (error) {
                    console.error('초기 견적서 로드 실패:', error);
                }
            };
            loadInitialQuotation();
        } else {
            // localStorage에서 pendingQuotationData 불러오기
            const pendingData = localStorage.getItem('pendingQuotationData');
            if (pendingData) {
                try {
                    const data = JSON.parse(pendingData);
                    quotation.setQuotationDataData(data);
                    localStorage.removeItem('pendingQuotationData');
                } catch (error) {
                    console.error('데이터 불러오기 실패:', error);
                }
            }
        }
    }, [initialQuotationId, orderDocumentId]);

    // 견적서 저장
    const handleSaveQuotation = async () => {
        try {
            // isModal이 true면 orders 컬렉션, false면 quotations 컬렉션에 저장
            const targetCollection = isModal ? 'orders' : 'quotations';

            const quotationId = await storage.saveQuotationData(
                quotationRef.current.quotationData,
                quotationRef.current.golfSchedules,
                quotationRef.current.golfOnSiteSchedules,
                quotationRef.current.accommodationSchedules,
                quotationRef.current.pickupSchedules,
                quotationRef.current.flightSchedules,
                quotationRef.current.rentalCarSchedules,
                quotationRef.current.rentalCarOnSiteSchedules,
                quotationRef.current.paymentInfo,
                quotationRef.current.additionalOptions,
                regionTypeRef.current, // 지역 타입만 저장
                isPackageQuotationRef.current, // 패키지견적 여부
                undefined, // title (optional)
                targetCollection, // 저장할 컬렉션 이름
                orderDocumentId // orders 컬렉션의 문서 ID (서브컬렉션 사용 시 필요)
            );
            setHasUnsavedChanges(false);

            // orders 컬렉션에 저장했을 때 sub_status를 1로 업데이트
            if (isModal && orderDocumentId) {
                // 수배 대기에서 견적서 저장 시에만 활동 로그 기록 (대시보드용)
                if (user) {
                    const userName = user.name || user.email || '알 수 없음';
                    const quotationData = quotationRef.current.quotationData;
                    const targetTitle = quotationData.customerName
                        ? `${quotationData.customerName}_${quotationData.destination}_${quotationData.travelPeriod}`
                        : undefined;

                    await ActivityLogService.createLog({
                        action: 'quotation_save',
                        userId: user.id,
                        userName: userName,
                        targetId: quotationId,
                        targetTitle: targetTitle
                    });
                }

                try {
                    await RecruitmentService.updateRecruitmentSubStatus(orderDocumentId, 1);
                    // 저장 성공 후 콜백 호출하여 수배 목록 새로고침
                    if (onSaveSuccess) {
                        onSaveSuccess();
                    }
                } catch (error) {
                    console.error('수배 상태 업데이트 실패:', error);
                    // 상태 업데이트 실패해도 견적서 저장은 성공했으므로 계속 진행
                }
            }

            // 저장 성공 팝업 표시
            setShowSaveSuccess(true);
            setTimeout(() => {
                setShowSaveSuccess(false);
            }, 2000);
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

                // 패키지견적 여부 복원 (기존 데이터 호환성을 위해 기본값 false 사용)
                const loadedIsPackageQuotation = quotationData.isPackageQuotation || false;
                setIsPackageQuotation(loadedIsPackageQuotation);

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

    return (
        <div className={`${isModal ? '' : 'min-h-screen'} bg-gray-50`}>
            {/* 헤더 - 모달 모드에서는 간소화 */}
            {!isModal && (
                <div className="mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800">견적서 작성</h1>
                        <p className="text-gray-600 mt-1">골프 여행 견적서 생성 도구</p>
                    </div>
                </div>
            )}

            {/* 지역 선택 */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className={`${isModal ? '' : 'max-w-7xl'} mx-auto`}>
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
                                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
                                    <div className="flex items-center gap-2">
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
                                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isPackageQuotation}
                                            onChange={(e) => setIsPackageQuotation(e.target.checked)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="font-medium">패키지견적</span>
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* 견적서 컨테이너 */}
            <div ref={preview.quotationRef} data-quotation-render className="bg-white rounded-lg shadow-sm p-8">
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

                <AccommodationTable
                    schedules={quotation.accommodationSchedules}
                    onAdd={quotation.addAccommodationSchedule}
                    onUpdate={quotation.updateAccommodationSchedule}
                    onRemove={quotation.removeAccommodationSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
                    calculatePrepayment={quotation.calculatePrepayment}
                />

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

                {regionType === 'japan' && (
                    <>
                        <RentalCarTable
                            schedules={quotation.rentalCarSchedules}
                            onAdd={quotation.addRentalCarSchedule}
                            onUpdate={quotation.updateRentalCarSchedule}
                            onRemove={quotation.removeRentalCarSchedule}
                            numberOfPeople={quotation.quotationData.numberOfPeople}
                            isFormValid={quotation.isFormValid()}
                            calculatePrepayment={quotation.calculatePrepayment}
                        />

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
                    isPackageQuotation={isPackageQuotation}
                />

                <PaymentSummary
                    paymentInfo={quotation.paymentInfo}
                    onPaymentChange={quotation.updatePaymentInfo}
                    balance={quotation.calculateBalance()}
                    totalAmount={`₩${quotation.calculateTotalAmount()}`}
                    onSiteYenTotal={quotation.calculateOnSiteYenTotal()}
                    isJapanRegion={regionType === 'japan'}
                    exchangeRate={exchangeRate}
                />

                <AdditionalInfoSection
                    additionalOptions={quotation.additionalOptions}
                    onAdditionalOptionsChange={quotation.setAdditionalOptions}
                    golfSchedules={quotation.golfSchedules}
                    golfOnSiteSchedules={quotation.golfOnSiteSchedules}
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

