/**
 * 거래처 관련 타입 정의
 * vendors 기능에서 사용되는 모든 타입들을 정의
 */

// ==========================================
// 거래처 데이터 타입
// ==========================================

/**
 * 거래처 분류 타입
 */
export type VendorCategory = '계좌이체' | '카드결제';

/**
 * 거래처 데이터 구조
 */
export interface Vendor {
    id: string;
    name: string; // 거래처명
    category: VendorCategory; // 분류: 계좌이체, 카드결제
    bankName?: string; // 은행명 (계좌이체일 때만)
    depositorName?: string; // 입금자명 (계좌이체일 때만)
    accountNumber?: string; // 계좌번호 (계좌이체일 때만)
    memo?: string; // 메모
    createdAt: any;
    updatedAt: any;
}

// ==========================================
// 폼 데이터 타입
// ==========================================

/**
 * 거래처 폼 데이터 구조
 */
export interface VendorFormData {
    name: string;
    category: VendorCategory;
    bankName: string;
    depositorName: string;
    accountNumber: string;
    memo: string;
}

