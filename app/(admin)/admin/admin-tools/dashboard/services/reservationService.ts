import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface ReservationResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface ReservationPayload {
    quotationId: string;
    recruitmentId: string;
    status: string;
    createdBy: string;
    userId?: string;
    createdAt: any;
}

export interface ReservationListItem {
    id: string;
    quotationId: string;
    recruitmentId: string;
    status: string;
    createdBy: string;
    userId?: string;
    createdAt: any;
}

export class ReservationService {
    /**
     * 예약 데이터를 서버에 저장
     */
    static async createReservation(data: { quotationId: string; recruitmentId: string }, createdBy: string, userId?: string): Promise<ReservationResponse> {
        try {
            const payload: ReservationPayload = {
                quotationId: data.quotationId,
                recruitmentId: data.recruitmentId,
                status: 'pending',
                createdBy,
                userId,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'reservations'), payload);

            return {
                success: true,
                message: '예약이 성공적으로 등록되었습니다.',
                data: { id: docRef.id, ...payload }
            };
        } catch (error) {
            console.error('예약 등록 실패:', error);
            return {
                success: false,
                message: '예약 등록에 실패했습니다.'
            };
        }
    }

    /**
     * 예약 목록 조회
     */
    static async getReservations(): Promise<ReservationResponse> {
        try {
            const q = query(collection(db, 'reservations'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const reservations = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as ReservationListItem[];

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

    /**
     * 예약 데이터 업데이트
     */
    static async updateReservation(id: string, data: Partial<ReservationPayload>): Promise<ReservationResponse> {
        try {
            const docRef = doc(db, 'reservations', id);
            await updateDoc(docRef, data);

            return {
                success: true,
                message: '예약이 성공적으로 수정되었습니다.'
            };
        } catch (error) {
            console.error('예약 수정 실패:', error);
            return {
                success: false,
                message: '예약 수정에 실패했습니다.'
            };
        }
    }

    /**
     * 예약 데이터 삭제
     */
    static async deleteReservation(id: string): Promise<ReservationResponse> {
        try {
            await deleteDoc(doc(db, 'reservations', id));

            return {
                success: true,
                message: '예약이 성공적으로 삭제되었습니다.'
            };
        } catch (error) {
            console.error('예약 삭제 실패:', error);
            return {
                success: false,
                message: '예약 삭제에 실패했습니다.'
            };
        }
    }
}

