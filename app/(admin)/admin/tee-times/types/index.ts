/**
 * 티타임 관련 타입 정의
 * tee-times 기능에서 사용되는 모든 타입들을 정의
 */

// ==========================================
// 티타임 데이터 타입
// ==========================================

/**
 * 티타임 데이터 구조
 * 골프장의 특정 날짜/시간대 예약 가능한 슬롯과 가격 정보를 담는 인터페이스
 */
export interface TeeTime {
    id: string;
    date: string;
    time: string;
    availableSlots: number;
    agentPrice: number;
    note: string;
    courseId: string;
    courseName?: string;
    createdAt?: any;
    updatedAt?: any;
    createdBy?: string | null;
}

// ==========================================
// 폼 데이터 타입
// ==========================================

/**
 * 티타임 폼 데이터 구조
 * 티타임 생성/수정 폼에서 사용하는 데이터 인터페이스
 */
export interface TeeTimeFormData {
    hour: string;
    minute: string;
    availableSlots: string;
    agentPrice: string;
    note: string;
}
