/**
 * 사용자 관련 타입 정의
 * users 기능에서 사용되는 모든 타입들을 정의
 */

// ==========================================
// 사용자 데이터 타입
// ==========================================

/**
 * 사용자 데이터 구조
 * 시스템 사용자의 기본 정보, 권한, 상태 등을 담는 인터페이스
 */
export interface User {
    id: string;
    email: string;
    name: string;
    phone?: string;
    profileImage?: string;
    role: 'user' | 'course_admin' | 'super_admin' | 'site_admin';
    courseId?: string;
    courseName?: string;
    createdAt: any;
    updatedAt: any;
    lastLoginAt?: any;
    isActive: boolean;
    isEmailVerified: boolean;
}

// ==========================================
// 폼 데이터 타입
// ==========================================

/**
 * 사용자 폼 데이터 구조
 * 사용자 생성/수정 폼에서 사용하는 데이터 인터페이스
 */
export interface UserFormData {
    email: string;
    name: string;
    phone?: string;
    role: 'user' | 'course_admin' | 'super_admin' | 'site_admin';
    courseId?: string;
    isActive: boolean;
}
