import {
    collection,
    doc,
    addDoc,
    updateDoc,
    getDocs,
    getDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import {
    QuotationData,
    GolfSchedule,
    AccommodationSchedule,
    PickupSchedule,
    PaymentInfo
} from '@/hooks/useQuotationData';
import { FlightSchedule, RentalCarSchedule } from '@/app/(admin)/admin/admin-tools/quotation/types';

export interface QuotationDocument {
    id: string;
    title: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    createdBy: string; // 사용자 이름
    userId?: string; // 사용자 ID (선택적, 기존 데이터 호환성)
    status: 'draft' | 'completed';
    regionType: 'basic' | 'japan'; // 지역 타입만 저장
    isPackageQuotation?: boolean; // 패키지견적 여부

    // 견적서 데이터
    quotationData: QuotationData;
    golfSchedules: GolfSchedule[];
    golfOnSiteSchedules: GolfSchedule[];
    accommodationSchedules: AccommodationSchedule[];
    pickupSchedules: PickupSchedule[];
    flightSchedules: FlightSchedule[];
    rentalCarSchedules: RentalCarSchedule[];
    rentalCarOnSiteSchedules: RentalCarSchedule[];
    paymentInfo: PaymentInfo;
    additionalOptions: string;
}

export interface QuotationListItem {
    id: string;
    title: string;
    customerName: string;
    destination: string;
    createdAt: Timestamp;
    updatedAt: Timestamp;
    status: 'draft' | 'completed';
    createdBy: string; // 사용자 이름
    userId?: string; // 사용자 ID (선택적, 기존 데이터 호환성)
}

// 견적서 저장
export const saveQuotation = async (
    quotationData: QuotationData,
    golfSchedules: GolfSchedule[],
    golfOnSiteSchedules: GolfSchedule[],
    accommodationSchedules: AccommodationSchedule[],
    pickupSchedules: PickupSchedule[],
    flightSchedules: FlightSchedule[],
    rentalCarSchedules: RentalCarSchedule[],
    rentalCarOnSiteSchedules: RentalCarSchedule[],
    paymentInfo: PaymentInfo,
    additionalOptions: string,
    regionType: 'basic' | 'japan' = 'basic', // 지역 타입만 저장
    isPackageQuotation: boolean = false, // 패키지견적 여부
    quotationId?: string,
    title?: string,
    currentUserName?: string,
    currentUserId?: string, // 사용자 ID
    targetCollection: 'quotations' | 'orders' = 'quotations', // 저장할 컬렉션 이름
    orderDocumentId?: string // orders 컬렉션의 문서 ID (서브컬렉션 사용 시 필요)
): Promise<string> => {
    try {
        // 인증 상태 확인 (Vercel 프리뷰에서 인증 토큰 문제 방지)
        if (!auth || !auth.currentUser) {
            console.error('인증되지 않은 사용자입니다.');
            throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
        }

        const now = Timestamp.now();

        // 타이틀 생성: 고객명_여행지_여행기간시작일
        const generateTitle = () => {
            if (title) return title;

            const customerName = quotationData.customerName || '고객';
            const destination = quotationData.destination || '여행지';
            const startDate = quotationData.startDate || '날짜미정';

            // 날짜 형식 변환 (YY/MM/DD -> YYYY-MM-DD)
            let formattedDate = startDate;
            if (startDate && startDate !== '날짜미정') {
                try {
                    // YY/MM/DD 형식을 Date 객체로 변환
                    const [year, month, day] = startDate.split('/');
                    const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);

                    // 로컬 시간대로 Date 객체 생성 (UTC 변환 방지)
                    const date = new Date(fullYear, parseInt(month) - 1, parseInt(day));

                    // 로컬 날짜를 YYYY-MM-DD 형식으로 변환
                    const yearStr = date.getFullYear();
                    const monthStr = String(date.getMonth() + 1).padStart(2, '0');
                    const dayStr = String(date.getDate()).padStart(2, '0');
                    formattedDate = `${yearStr}-${monthStr}-${dayStr}`;
                } catch (error) {
                    // 날짜 파싱 실패 시 원본 사용
                    formattedDate = startDate;
                }
            }

            return `${customerName}_${destination}_${formattedDate}`;
        };

        // orders 컬렉션일 때는 서브컬렉션 경로 사용, 아닐 때는 기본 컬렉션 경로 사용
        const getCollectionPath = () => {
            if (targetCollection === 'orders' && orderDocumentId) {
                // orders/{orderDocumentId}/quotations 서브컬렉션 사용
                return collection(db, 'orders', orderDocumentId, 'quotations');
            }
            // 기본 컬렉션 사용
            return collection(db, targetCollection);
        };

        const getDocPath = (id: string) => {
            if (targetCollection === 'orders' && orderDocumentId) {
                // orders/{orderDocumentId}/quotations/{quotationId} 경로 사용
                return doc(db, 'orders', orderDocumentId, 'quotations', id);
            }
            // 기본 컬렉션 경로 사용
            return doc(db, targetCollection, id);
        };

        const collectionRef = getCollectionPath();

        const quotationDoc: Omit<QuotationDocument, 'id'> = {
            title: generateTitle(),
            createdAt: quotationId ? (await getDoc(getDocPath(quotationId))).data()?.createdAt || now : now,
            updatedAt: now,
            createdBy: currentUserName || '관리자',
            userId: currentUserId, // 사용자 ID 저장
            status: 'draft',
            regionType, // 지역 타입만 저장
            isPackageQuotation, // 패키지견적 여부
            quotationData,
            golfSchedules,
            golfOnSiteSchedules,
            accommodationSchedules,
            pickupSchedules,
            flightSchedules,
            rentalCarSchedules,
            rentalCarOnSiteSchedules,
            paymentInfo,
            additionalOptions
        };

        if (quotationId) {
            // 기존 견적서 업데이트
            await updateDoc(getDocPath(quotationId), quotationDoc);
            return quotationId;
        } else {
            // 새 견적서 생성
            console.log('견적서 저장 시도:', {
                targetCollection,
                orderDocumentId,
                collectionPath: targetCollection === 'orders' && orderDocumentId
                    ? `orders/${orderDocumentId}/quotations`
                    : targetCollection,
                userId: auth.currentUser?.uid,
                userRole: currentUserId ? '확인됨' : '없음'
            });

            const docRef = await addDoc(collectionRef, quotationDoc);
            return docRef.id;
        }
    } catch (error: any) {
        console.error('견적서 저장 실패:', error);
        console.error('에러 상세:', {
            code: error?.code,
            message: error?.message,
            targetCollection,
            orderDocumentId,
            userId: auth.currentUser?.uid,
            authState: auth.currentUser ? '인증됨' : '인증 안됨'
        });

        // 권한 오류인 경우 더 자세한 메시지
        if (error?.code === 'permission-denied' || error?.message?.includes('permission')) {
            throw new Error(`권한 오류: ${error.message}. 인증 상태를 확인해주세요.`);
        }

        throw new Error('견적서 저장에 실패했습니다.');
    }
};

// 견적서 목록 조회
export const getQuotationList = async (): Promise<QuotationListItem[]> => {
    try {
        const q = query(
            collection(db, 'quotations'),
            orderBy('updatedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as QuotationListItem));
    } catch (error) {
        console.error('견적서 목록 조회 실패:', error);
        throw new Error('견적서 목록을 불러오는데 실패했습니다.');
    }
};

// 견적서 상세 조회
export const getQuotation = async (quotationId: string, recruitmentId?: string): Promise<QuotationDocument | null> => {
    try {
        // recruitmentId가 있으면 orders 컬렉션의 서브컬렉션에서 가져오기
        const docRef = recruitmentId
            ? doc(db, 'orders', recruitmentId, 'quotations', quotationId)
            : doc(db, 'quotations', quotationId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                id: docSnap.id,
                ...data,
                regionType: data.regionType || 'basic', // 기존 견적서에 regionType이 없는 경우 'basic'으로 설정
                isPackageQuotation: data.isPackageQuotation || false, // 기존 견적서에 isPackageQuotation이 없는 경우 false로 설정
                flightSchedules: data.flightSchedules || [], // 기존 견적서에 flightSchedules가 없는 경우 빈 배열로 설정
                rentalCarSchedules: data.rentalCarSchedules || [], // 기존 견적서에 rentalCarSchedules가 없는 경우 빈 배열로 설정
                rentalCarOnSiteSchedules: data.rentalCarOnSiteSchedules || [] // 기존 견적서에 rentalCarOnSiteSchedules가 없는 경우 빈 배열로 설정
            } as QuotationDocument;
        } else {
            return null;
        }
    } catch (error) {
        console.error('견적서 조회 실패:', error);
        throw new Error('견적서를 불러오는데 실패했습니다.');
    }
};

// 견적서 삭제
export const deleteQuotation = async (quotationId: string): Promise<void> => {
    try {
        await deleteDoc(doc(db, 'quotations', quotationId));
    } catch (error) {
        console.error('견적서 삭제 실패:', error);
        throw new Error('견적서 삭제에 실패했습니다.');
    }
};

// 견적서 상태 변경
export const updateQuotationStatus = async (
    quotationId: string,
    status: 'draft' | 'completed'
): Promise<void> => {
    try {
        await updateDoc(doc(db, 'quotations', quotationId), {
            status,
            updatedAt: Timestamp.now()
        });
    } catch (error) {
        console.error('견적서 상태 변경 실패:', error);
        throw new Error('견적서 상태 변경에 실패했습니다.');
    }
};
