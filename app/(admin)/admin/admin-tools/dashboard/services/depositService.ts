import { collection, addDoc, serverTimestamp, getDocs, orderBy, query, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface DepositResponse {
    success: boolean;
    message: string;
    data?: any;
}

export interface DepositPayload {
    reservationId?: string; // 예약ID (선택)
    type?: string; // 종류
    amount: number; // 입금액
    depositDate: string; // 거래일자 (YYYYMMDD)
    depositTime?: string; // 거래시간 (HHMMSS)
    depositor?: string; // 입금자
    representative?: string; // 대표자
    manager?: string; // 담당자
    status?: 'pending' | 'completed'; // 상태 (대기/완료)
    bkcode?: string;
    country?: string; // 국가
    category?: string; // 분류
    createdBy: string;
    userId?: string;
    createdAt: any;
}

export interface DepositListItem {
    id: string;
    reservationId?: string; // 예약ID (선택)
    type?: string; // 종류
    amount: number;
    depositDate: string; // 거래일자 (YYYYMMDD)
    depositTime?: string; // 거래시간 (HHMMSS)
    depositor?: string; // 입금자
    representative?: string; // 대표자
    manager?: string; // 담당자
    status?: 'pending' | 'completed'; // 상태 (대기/완료)
    bkcode?: string;
    country?: string; // 국가
    category?: string; // 분류
    createdBy: string;
    userId?: string;
    createdAt: any;
}

export class DepositService {
    /**
     * 입금 데이터를 서버에 저장
     */
    static async createDeposit(
        data: {
            reservationId?: string; // 예약ID (선택)
            type?: string; // 종류
            amount: number; // 입금액
            depositDate: string; // 거래일자 (YYYYMMDD)
            depositTime?: string; // 거래시간 (HHMMSS)
            depositor?: string; // 입금자
            representative?: string; // 대표자
            manager?: string; // 담당자
            status?: 'pending' | 'completed'; // 상태 (대기/완료)
            bkcode?: string;
            country?: string; // 국가
            category?: string; // 분류
        },
        createdBy: string,
        userId?: string
    ): Promise<DepositResponse> {
        try {
            // undefined 값을 제거한 payload 생성 (Firestore는 undefined를 허용하지 않음)
            // 뱅크다 API와 일관성을 위해 모든 필드를 빈 문자열로 통일
            const payload: any = {
                amount: data.amount,
                depositDate: data.depositDate,
                type: data.type ?? '', // 필수 필드 (빈 문자열로 기본값)
                depositTime: data.depositTime ?? '', // 필수 필드 (빈 문자열로 기본값)
                depositor: data.depositor ?? '', // 필수 필드 (빈 문자열로 기본값)
                status: data.status || 'pending', // 기본값: 대기
                representative: data.representative ?? '', // 빈 문자열로 통일
                manager: data.manager ?? '', // 빈 문자열로 통일
                reservationId: data.reservationId ?? '', // 빈 문자열로 통일
                userId: userId ?? '', // 빈 문자열로 통일
                bkcode: data.bkcode ?? '', // 빈 문자열로 통일
                country: data.country ?? '', // 국가 (빈 문자열로 기본값)
                category: data.category ?? '', // 분류 (빈 문자열로 기본값)
                createdBy,
                createdAt: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'deposits'), payload);

            return {
                success: true,
                message: '입금이 성공적으로 등록되었습니다.',
                data: { id: docRef.id, ...payload }
            };
        } catch (error) {
            console.error('입금 등록 실패:', error);
            return {
                success: false,
                message: '입금 등록에 실패했습니다.'
            };
        }
    }

    /**
     * 입금 목록 조회
     */
    static async getDeposits(): Promise<DepositResponse> {
        try {
            const q = query(collection(db, 'deposits'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);

            const deposits = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as DepositListItem[];

            return {
                success: true,
                message: '입금 목록을 성공적으로 조회했습니다.',
                data: deposits
            };
        } catch (error: any) {
            console.error('입금 목록 조회 실패:', error);
            return {
                success: false,
                message: '입금 목록 조회에 실패했습니다.',
                data: []
            };
        }
    }

    /**
     * 입금 데이터 업데이트
     */
    static async updateDeposit(id: string, data: Partial<DepositPayload>): Promise<DepositResponse> {
        try {
            const docRef = doc(db, 'deposits', id);
            await updateDoc(docRef, data);

            return {
                success: true,
                message: '입금이 성공적으로 수정되었습니다.'
            };
        } catch (error) {
            console.error('입금 수정 실패:', error);
            return {
                success: false,
                message: '입금 수정에 실패했습니다.'
            };
        }
    }

    /**
     * 입금 데이터 삭제
     */
    static async deleteDeposit(id: string): Promise<DepositResponse> {
        try {
            await deleteDoc(doc(db, 'deposits', id));

            return {
                success: true,
                message: '입금이 성공적으로 삭제되었습니다.'
            };
        } catch (error) {
            console.error('입금 삭제 실패:', error);
            return {
                success: false,
                message: '입금 삭제에 실패했습니다.'
            };
        }
    }
}

