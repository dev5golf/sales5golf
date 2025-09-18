import { useState, useCallback } from 'react';
import {
    saveQuotation,
    getQuotationList,
    getQuotation,
    deleteQuotation,
    updateQuotationStatus,
    QuotationDocument,
    QuotationListItem
} from '@/lib/quotationService';

// Re-export types for external use
export type { QuotationListItem, QuotationDocument };
import {
    QuotationData,
    GolfSchedule,
    AccommodationSchedule,
    PickupSchedule,
    PaymentInfo
} from './useQuotationData';

export const useQuotationStorage = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [quotationList, setQuotationList] = useState<QuotationListItem[]>([]);
    const [currentQuotationId, setCurrentQuotationId] = useState<string | null>(null);

    // 견적서 저장
    const saveQuotationData = useCallback(async (
        quotationData: QuotationData,
        golfSchedules: GolfSchedule[],
        golfOnSiteSchedules: GolfSchedule[],
        accommodationSchedules: AccommodationSchedule[],
        pickupSchedules: PickupSchedule[],
        paymentInfo: PaymentInfo,
        additionalOptions: string,
        title?: string
    ): Promise<string> => {
        setIsLoading(true);
        setError(null);

        try {
            const quotationId = await saveQuotation(
                quotationData,
                golfSchedules,
                golfOnSiteSchedules,
                accommodationSchedules,
                pickupSchedules,
                paymentInfo,
                additionalOptions,
                currentQuotationId || undefined,
                title
            );

            setCurrentQuotationId(quotationId);
            return quotationId;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '저장에 실패했습니다.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [currentQuotationId]);

    // 견적서 목록 불러오기
    const loadQuotationList = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const list = await getQuotationList();
            setQuotationList(list);
            return list;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '목록을 불러오는데 실패했습니다.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 견적서 불러오기
    const loadQuotation = useCallback(async (quotationId: string): Promise<QuotationDocument | null> => {
        setIsLoading(true);
        setError(null);

        try {
            const quotation = await getQuotation(quotationId);
            if (quotation) {
                setCurrentQuotationId(quotationId);
            }
            return quotation;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '견적서를 불러오는데 실패했습니다.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 견적서 삭제
    const removeQuotation = useCallback(async (quotationId: string) => {
        setIsLoading(true);
        setError(null);

        try {
            await deleteQuotation(quotationId);
            setQuotationList(prev => prev.filter(item => item.id !== quotationId));

            // 현재 선택된 견적서가 삭제된 경우
            if (currentQuotationId === quotationId) {
                setCurrentQuotationId(null);
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '삭제에 실패했습니다.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, [currentQuotationId]);

    // 견적서 상태 변경
    const changeQuotationStatus = useCallback(async (
        quotationId: string,
        status: 'draft' | 'completed'
    ) => {
        setIsLoading(true);
        setError(null);

        try {
            await updateQuotationStatus(quotationId, status);
            setQuotationList(prev =>
                prev.map(item =>
                    item.id === quotationId ? { ...item, status } : item
                )
            );
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : '상태 변경에 실패했습니다.';
            setError(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 새 견적서 시작
    const startNewQuotation = useCallback(() => {
        setCurrentQuotationId(null);
        setError(null);
    }, []);

    // 에러 초기화
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isLoading,
        error,
        quotationList,
        currentQuotationId,
        saveQuotationData,
        loadQuotationList,
        loadQuotation,
        removeQuotation,
        changeQuotationStatus,
        startNewQuotation,
        clearError
    };
};
