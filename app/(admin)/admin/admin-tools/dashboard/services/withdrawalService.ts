import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface WithdrawalResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface WithdrawalPayload {
    reservationId: string;
    amount: number;
    withdrawalDate: string;
    createdBy: string;
    userId?: string;
    createdAt: any;
}

export interface WithdrawalListItem {
    id: string;
    reservationId: string;
    amount: number;
    withdrawalDate: string;
    createdBy: string;
    userId?: string;
    createdAt: any;
}

export class WithdrawalService {
    /**
     * 출금 데이터를 서버에 저장
     */
    static async createWithdrawal(data: { reservationId: string; amount: number; withdrawalDate: string }, createdBy: string, userId?: string): Promise<WithdrawalResponse> {
        try {
            const payload: WithdrawalPayload = {
                reservationId: data.reservationId,
                amount: data.amount,
                withdrawalDate: data.withdrawalDate,
                createdBy,
                userId,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'withdrawals'), payload);

            return {
                success: true,
                message: '출금이 성공적으로 등록되었습니다.',
                data: { id: docRef.id, ...payload }
            };
        } catch (error) {
            console.error('출금 등록 실패:', error);
            return {
                success: false,
                message: '출금 등록에 실패했습니다.'
            };
        }
    }

    /**
     * 출금 목록 조회
     */
    static async getWithdrawals(): Promise<WithdrawalResponse> {
        try {
            const q = query(collection(db, 'withdrawals'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const withdrawals = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as WithdrawalListItem[];

            return {
                success: true,
                message: '출금 목록을 성공적으로 조회했습니다.',
                data: withdrawals
            };
        } catch (error: any) {
            console.error('출금 목록 조회 실패:', error);
            return {
                success: false,
                message: '출금 목록 조회에 실패했습니다.',
                data: []
            };
        }
    }

    /**
     * 출금 데이터 업데이트
     */
    static async updateWithdrawal(id: string, data: Partial<WithdrawalPayload>): Promise<WithdrawalResponse> {
        try {
            const docRef = doc(db, 'withdrawals', id);
            await updateDoc(docRef, data);

            return {
                success: true,
                message: '출금이 성공적으로 수정되었습니다.'
            };
        } catch (error) {
            console.error('출금 수정 실패:', error);
            return {
                success: false,
                message: '출금 수정에 실패했습니다.'
            };
        }
    }

    /**
     * 출금 데이터 삭제
     */
    static async deleteWithdrawal(id: string): Promise<WithdrawalResponse> {
        try {
            await deleteDoc(doc(db, 'withdrawals', id));

            return {
                success: true,
                message: '출금이 성공적으로 삭제되었습니다.'
            };
        } catch (error) {
            console.error('출금 삭제 실패:', error);
            return {
                success: false,
                message: '출금 삭제에 실패했습니다.'
            };
        }
    }
}

