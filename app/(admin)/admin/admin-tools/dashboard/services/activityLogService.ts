import { collection, addDoc, getDocs, query, orderBy, limit, Timestamp, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 액티비티 로그 타입 정의 (최종 권장 타입)
export interface ActivityLog {
    id: string;
    action: 'recruitment_create' | 'recruitment_update' | 'quotation_save' | 'quotation_download' | 'reservation_create' | 'reservation_cancel' | 'deposit_create' | 'withdrawal_create';
    userId: string;
    userName: string;
    targetId?: string;
    targetTitle?: string;
    timestamp: Timestamp;
}

export interface ActivityLogPayload {
    action: ActivityLog['action'];
    userId: string;
    userName: string;
    targetId?: string;
    targetTitle?: string;
    timestamp: any; // serverTimestamp() 사용
}

export interface ActivityLogResponse {
    success: boolean;
    message?: string;
    data?: ActivityLog[];
}

export class ActivityLogService {
    /**
     * 액티비티 로그 생성
     */
    static async createLog(payload: Omit<ActivityLogPayload, 'timestamp'>): Promise<ActivityLogResponse> {
        try {
            if (!db) {
                throw new Error('Firebase가 초기화되지 않았습니다.');
            }

            const logPayload: ActivityLogPayload = {
                ...payload,
                timestamp: serverTimestamp()
            };

            const docRef = await addDoc(collection(db, 'activity_logs'), logPayload);

            return {
                success: true,
                message: '로그가 성공적으로 기록되었습니다.'
            };
        } catch (error) {
            console.error('액티비티 로그 생성 실패:', error);
            return {
                success: false,
                message: '로그 기록에 실패했습니다.'
            };
        }
    }

    /**
     * 최근 액티비티 로그 조회
     * @param limitCount 조회할 로그 개수 (기본값: 50)
     */
    static async getRecentLogs(limitCount: number = 50): Promise<ActivityLogResponse> {
        try {
            if (!db) {
                throw new Error('Firebase가 초기화되지 않았습니다.');
            }

            const q = query(
                collection(db, 'activity_logs'),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            const logs: ActivityLog[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as ActivityLog));

            return {
                success: true,
                message: '로그를 성공적으로 조회했습니다.',
                data: logs
            };
        } catch (error) {
            console.error('액티비티 로그 조회 실패:', error);
            return {
                success: false,
                message: '로그 조회에 실패했습니다.',
                data: []
            };
        }
    }

    /**
     * 사용자별 액티비티 로그 조회
     */
    static async getLogsByUser(userId: string, limitCount: number = 50): Promise<ActivityLogResponse> {
        try {
            if (!db) {
                throw new Error('Firebase가 초기화되지 않았습니다.');
            }

            const q = query(
                collection(db, 'activity_logs'),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            // 클라이언트 사이드에서 필터링 (Firestore 쿼리로 최적화 가능)
            const logs: ActivityLog[] = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ActivityLog))
                .filter(log => log.userId === userId);

            return {
                success: true,
                message: '로그를 성공적으로 조회했습니다.',
                data: logs
            };
        } catch (error) {
            console.error('액티비티 로그 조회 실패:', error);
            return {
                success: false,
                message: '로그 조회에 실패했습니다.',
                data: []
            };
        }
    }

    /**
     * 액션별 액티비티 로그 조회
     */
    static async getLogsByAction(action: ActivityLog['action'], limitCount: number = 50): Promise<ActivityLogResponse> {
        try {
            if (!db) {
                throw new Error('Firebase가 초기화되지 않았습니다.');
            }

            const q = query(
                collection(db, 'activity_logs'),
                orderBy('timestamp', 'desc'),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);

            // 클라이언트 사이드에서 필터링 (Firestore 쿼리로 최적화 가능)
            const logs: ActivityLog[] = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as ActivityLog))
                .filter(log => log.action === action);

            return {
                success: true,
                message: '로그를 성공적으로 조회했습니다.',
                data: logs
            };
        } catch (error) {
            console.error('액티비티 로그 조회 실패:', error);
            return {
                success: false,
                message: '로그 조회에 실패했습니다.',
                data: []
            };
        }
    }
}

