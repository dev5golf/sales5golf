"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useQuotationData } from '../../../../hooks/useQuotationData';
import { usePreview } from '../../../../hooks/usePreview';
import { useGolfCourses } from '../../../../hooks/useGolfCourses';
import QuotationHeader from './components/QuotationHeader';
import QuotationForm from './components/QuotationForm';
import GolfScheduleTable from './components/GolfScheduleTable';
import PreviewModal from './components/PreviewModal';

export default function AdminTools() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 커스텀 훅 사용
    const quotation = useQuotationData();
    const preview = usePreview();
    const golfCourses = useGolfCourses();

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
            <QuotationHeader
                onPreview={preview.generatePreview}
                onDownload={() => preview.downloadQuotationAsImage(quotation.quotationData.customerName)}
            />

            {/* 견적서 컨테이너 */}
            <div ref={preview.quotationRef} className="bg-white rounded-lg shadow-sm p-8">
                {/* 견적서 폼 */}
                <QuotationForm
                    quotationData={quotation.quotationData}
                    travelDates={quotation.travelDates}
                    onQuotationChange={quotation.updateQuotationData}
                    onTravelDateChange={quotation.updateTravelDates}
                />

                {/* 골프 일정 테이블 */}
                <GolfScheduleTable
                    schedules={quotation.golfSchedules}
                    onAdd={quotation.addGolfSchedule}
                    onUpdate={quotation.updateGolfSchedule}
                    onRemove={quotation.removeGolfSchedule}
                />

                {/* 기타 섹션들... */}
                <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">안내사항</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• 현지결제 비용은 실시간 환율에 따라 변동될 수 있습니다.</li>
                        <li>• 픽업 차량 이용 시 실제 거리에 따라 측정되므로 골프장에 따라 변동될 수 있습니다.</li>
                        <li>• 현지결제 비용은 현지에서 결제되는 점 참고해 주세요.</li>
                    </ul>
                </div>

                {/* 추가 선택사항 */}
                <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">추가선택사항</h3>
                    <textarea
                        value={quotation.additionalOptions}
                        onChange={(e) => quotation.setAdditionalOptions(e.target.value)}
                        placeholder="추가 선택사항을 입력하세요..."
                        className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                </div>
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
