import { RecruitmentData } from '../components';
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, doc, updateDoc, getDoc, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface RecruitmentResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface RecruitmentPayload {
    title: string;
    status: number;
    sub_status: number;
    createdBy: string;
    userId?: string; // 사용자 ID 추가
    customerName: string;
    destination: string;
    startDate: string;
    endDate: string;
    numberOfPeople: string;
    memo?: string;
    createdAt: any;
}

export interface RecruitmentListItem {
    id: string;
    title: string;
    status: number;
    sub_status: number;
    createdBy: string;
    userId?: string; // 사용자 ID 추가
    customerName: string;
    destination: string;
    startDate: string;
    endDate: string;
    numberOfPeople: string;
    memo?: string;
    createdAt: any;
}

export interface QuotationSubItem {
    id: string;
    title: string;
    createdBy: string;
    createdAt: any;
    updatedAt: any;
    status: 'draft' | 'completed';
}

export class RecruitmentService {
    /**
     * 수배 데이터를 서버에 저장
     */
    static async createRecruitment(data: RecruitmentData, createdBy: string, userId?: string): Promise<RecruitmentResponse> {
        try {
            // title 생성: 고객명_여행지_여행기간_인원
            const travelPeriod = `${data.startDate}~${data.endDate}`;
            const title = `${data.customerName}_${data.destination}_${travelPeriod}_${data.numberOfPeople}명`;

            // 저장할 데이터 구성
            const payload: RecruitmentPayload = {
                title,
                status: 0, // 수배
                sub_status: 0, // 대기
                createdBy,
                userId, // 사용자 ID 추가
                customerName: data.customerName,
                destination: data.destination,
                startDate: data.startDate,
                endDate: data.endDate,
                numberOfPeople: data.numberOfPeople,
                memo: data.memo,
                createdAt: serverTimestamp()
            };

            // Firebase에 저장
            const docRef = await addDoc(collection(db, 'orders'), payload);

            return {
                success: true,
                message: '수배가 성공적으로 등록되었습니다.',
                data: { id: docRef.id, ...payload }
            };
        } catch (error) {
            console.error('수배 등록 실패:', error);
            return {
                success: false,
                message: '수배 등록에 실패했습니다.'
            };
        }
    }

    /**
     * 수배 목록 조회 (status가 0인 것만)
     */
    static async getRecruitments(): Promise<RecruitmentResponse> {
        try {
            // Firebase에서 orders 컬렉션의 status가 0인 데이터만 가져오기
            const q = query(
                collection(db, 'orders'),
                where('status', '==', 0),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            const recruitments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RecruitmentListItem[];

            return {
                success: true,
                message: '수배 목록을 성공적으로 조회했습니다.',
                data: recruitments
            };
        } catch (error: any) {
            console.error('수배 목록 조회 실패:', error);
            return {
                success: false,
                message: '수배 목록 조회에 실패했습니다.',
                data: []
            };
        }
    }

    /**
     * 수배 단일 조회
     */
    static async getRecruitment(id: string): Promise<RecruitmentListItem | null> {
        try {
            const docRef = doc(db, 'orders', id);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as RecruitmentListItem;
            }
            return null;
        } catch (error) {
            console.error('수배 조회 실패:', error);
            return null;
        }
    }

    /**
     * 수배 데이터 업데이트
     */
    static async updateRecruitment(id: string, data: Partial<RecruitmentData>, createdBy?: string, userId?: string): Promise<RecruitmentResponse> {
        try {
            // title 생성: 고객명_여행지_여행기간_인원
            let updateData: any = {};

            if (data.customerName || data.destination || data.startDate || data.endDate || data.numberOfPeople) {
                const travelPeriod = `${data.startDate || ''}~${data.endDate || ''}`;
                const customerName = data.customerName || '';
                const destination = data.destination || '';
                const numberOfPeople = data.numberOfPeople || '';
                const title = `${customerName}_${destination}_${travelPeriod}_${numberOfPeople}명`;
                updateData.title = title;
            }

            // 업데이트할 데이터 구성
            if (data.customerName !== undefined) updateData.customerName = data.customerName;
            if (data.destination !== undefined) updateData.destination = data.destination;
            if (data.startDate !== undefined) updateData.startDate = data.startDate;
            if (data.endDate !== undefined) updateData.endDate = data.endDate;
            if (data.numberOfPeople !== undefined) updateData.numberOfPeople = data.numberOfPeople;
            if (data.memo !== undefined) updateData.memo = data.memo;
            if (createdBy) updateData.createdBy = createdBy;
            if (userId) updateData.userId = userId; // 사용자 ID 업데이트

            // 수정 완료 시 sub_status를 0으로 변경
            updateData.sub_status = 0;

            // Firebase에 업데이트
            const docRef = doc(db, 'orders', id);
            await updateDoc(docRef, updateData);

            return {
                success: true,
                message: '수배가 성공적으로 수정되었습니다.'
            };
        } catch (error) {
            console.error('수배 수정 실패:', error);
            return {
                success: false,
                message: '수배 수정에 실패했습니다.'
            };
        }
    }

    /**
     * 수배 데이터 삭제
     */
    static async deleteRecruitment(id: string): Promise<RecruitmentResponse> {
        try {
            // TODO: 실제 Firebase API 호출로 교체
            // await deleteDoc(doc(db, 'recruitments', id));

            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                message: '수배가 성공적으로 삭제되었습니다.'
            };
        } catch (error) {
            console.error('수배 삭제 실패:', error);
            return {
                success: false,
                message: '수배 삭제에 실패했습니다.'
            };
        }
    }

    /**
     * 수배의 서브컬렉션 견적서 목록 조회
     */
    static async getQuotationsByRecruitmentId(recruitmentId: string): Promise<QuotationSubItem[]> {
        try {
            const quotationsRef = collection(db, 'orders', recruitmentId, 'quotations');
            const q = query(quotationsRef, orderBy('updatedAt', 'desc'));
            const snapshot = await getDocs(q);

            const quotations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as QuotationSubItem));

            return quotations;
        } catch (error) {
            console.error('견적서 목록 조회 실패:', error);
            return [];
        }
    }

    /**
     * 수배의 sub_status 업데이트
     */
    static async updateRecruitmentSubStatus(recruitmentId: string, subStatus: number): Promise<RecruitmentResponse> {
        try {
            const docRef = doc(db, 'orders', recruitmentId);
            await updateDoc(docRef, {
                sub_status: subStatus
            });

            return {
                success: true,
                message: '수배 상태가 성공적으로 업데이트되었습니다.'
            };
        } catch (error) {
            console.error('수배 상태 업데이트 실패:', error);
            return {
                success: false,
                message: '수배 상태 업데이트에 실패했습니다.'
            };
        }
    }

    /**
     * 수배의 status 업데이트
     */
    static async updateRecruitmentStatus(recruitmentId: string, status: number): Promise<RecruitmentResponse> {
        try {
            const docRef = doc(db, 'orders', recruitmentId);
            await updateDoc(docRef, {
                status: status
            });

            return {
                success: true,
                message: '수배 상태가 성공적으로 업데이트되었습니다.'
            };
        } catch (error) {
            console.error('수배 상태 업데이트 실패:', error);
            return {
                success: false,
                message: '수배 상태 업데이트에 실패했습니다.'
            };
        }
    }

    /**
     * 예약 목록 조회 (status가 1인 것만)
     */
    static async getReservations(): Promise<RecruitmentResponse> {
        try {
            // Firebase에서 orders 컬렉션의 status가 1인 데이터만 가져오기
            const q = query(
                collection(db, 'orders'),
                where('status', '==', 1),
                orderBy('createdAt', 'desc')
            );
            const snapshot = await getDocs(q);

            const reservations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as RecruitmentListItem[];

            return {
                success: true,
                message: '예약 목록을 성공적으로 조회했습니다.',
                data: reservations
            };
        } catch (error: any) {
            console.error('예약 목록 조회 실패:', error);
            return {
                success: false,
                message: '예약 목록 조회에 실패했습니다.',
                data: []
            };
        }
    }
}
