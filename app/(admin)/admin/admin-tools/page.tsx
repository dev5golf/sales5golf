"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useQuotationData } from '../../../../hooks/useQuotationData';
import { usePreview } from '../../../../hooks/usePreview';
import { Button } from '../../../../components/ui/button';
import { Download, Eye } from 'lucide-react';
import QuotationHeader from './components/QuotationHeader';
import QuotationForm from './components/QuotationForm';
import GolfScheduleTable from './components/GolfScheduleTable';
import GolfOnSiteTable from './components/GolfOnSiteTable';
import AccommodationTable from './components/AccommodationTable';
import PickupTable from './components/PickupTable';
import PaymentSummary from './components/PaymentSummary';
import PreviewModal from './components/PreviewModal';

export default function AdminTools() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 커스텀 훅 사용
    const quotation = useQuotationData();
    const preview = usePreview();

    // 기본/일본 선택 상태
    const [regionType, setRegionType] = useState<'basic' | 'japan'>('basic');

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
                    travelDates={quotation.travelDates}
                    inclusions={quotation.generateInclusions()}
                    pricePerPerson={quotation.calculatePricePerPerson()}
                    onQuotationChange={quotation.updateQuotationData}
                    onTravelDateChange={quotation.updateTravelDates}
                />

                {/* 골프 일정 테이블 */}
                <GolfScheduleTable
                    schedules={quotation.golfSchedules}
                    onAdd={quotation.addGolfSchedule}
                    onUpdate={quotation.updateGolfSchedule}
                    onRemove={quotation.removeGolfSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
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
                />

                {/* 픽업 일정 테이블 */}
                <PickupTable
                    schedules={quotation.pickupSchedules}
                    onAdd={quotation.addPickupSchedule}
                    onUpdate={quotation.updatePickupSchedule}
                    onRemove={quotation.removePickupSchedule}
                    numberOfPeople={quotation.quotationData.numberOfPeople}
                    isFormValid={quotation.isFormValid()}
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
                    totalAmount={`₩${quotation.calculateTotalAmount().toLocaleString()}`}
                />
            </div>

            {/* 액션 버튼 섹션 */}
            <div className="mt-8 flex justify-center gap-4">
                <Button
                    onClick={preview.generatePreview}
                    variant="outline"
                    size="lg"
                    className="flex items-center gap-2 px-8 py-3"
                >
                    <Eye className="h-5 w-5" />
                    미리보기
                </Button>
                <Button
                    onClick={() => preview.downloadQuotationAsImage(quotation.quotationData.customerName)}
                    variant="default"
                    size="lg"
                    className="flex items-center gap-2 px-8 py-3"
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
        </div>
    );
}