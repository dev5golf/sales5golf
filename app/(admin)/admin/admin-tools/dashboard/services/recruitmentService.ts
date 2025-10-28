import { RecruitmentData } from '../components';
import { collection, addDoc, serverTimestamp, getDocs, orderBy, query } from 'firebase/firestore';
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
    customerName: string;
    destination: string;
    startDate: string;
    endDate: string;
    numberOfPeople: string;
    createdAt: any;
}

export interface RecruitmentListItem {
    id: string;
    title: string;
    status: number;
    sub_status: number;
    createdBy: string;
    customerName: string;
    destination: string;
    startDate: string;
    endDate: string;
    numberOfPeople: string;
    createdAt: any;
}

export class RecruitmentService {
    /**
     * 수배 데이터를 서버에 저장
     */
    static async createRecruitment(data: RecruitmentData, createdBy: string): Promise<RecruitmentResponse> {
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
                customerName: data.customerName,
                destination: data.destination,
                startDate: data.startDate,
                endDate: data.endDate,
                numberOfPeople: data.numberOfPeople,
                createdAt: serverTimestamp()
            };

            // Firebase에 저장
            const docRef = await addDoc(collection(db, 'test'), payload);

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
     * 수배 목록 조회
     */
    static async getRecruitments(): Promise<RecruitmentResponse> {
        try {
            // Firebase에서 test 컬렉션의 모든 데이터 가져오기
            const q = query(collection(db, 'test'), orderBy('createdAt', 'desc'));
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
        } catch (error) {
            console.error('수배 목록 조회 실패:', error);
            return {
                success: false,
                message: '수배 목록 조회에 실패했습니다.',
                data: []
            };
        }
    }

    /**
     * 수배 데이터 업데이트
     */
    static async updateRecruitment(id: string, data: Partial<RecruitmentData>): Promise<RecruitmentResponse> {
        try {
            // TODO: 실제 Firebase API 호출로 교체
            // await updateDoc(doc(db, 'recruitments', id), {
            //     ...data,
            //     updatedAt: serverTimestamp()
            // });

            await new Promise(resolve => setTimeout(resolve, 1000));

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
}
