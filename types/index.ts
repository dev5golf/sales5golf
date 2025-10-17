/**
 * 공통 타입 정의
 * 여러 기능에서 공통으로 사용되는 타입들만 정의
 */

// ==========================================
// API 응답 타입들
// ==========================================

/**
 * API 응답 공통 구조
 * 모든 API 응답의 성공/실패 상태와 데이터를 담는 제네릭 인터페이스
 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// ==========================================
// 공통 유틸리티 타입들
// ==========================================

/**
 * 폼 제출 상태를 나타내는 타입
 */
export type FormStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * 페이지네이션 정보를 담는 타입
 */
export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
}

/**
 * 정렬 옵션을 담는 타입
 */
export interface SortOption {
    field: string;
    direction: 'asc' | 'desc';
}

/**
 * 필터 옵션을 담는 타입
 */
export interface FilterOption {
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'gt' | 'lt' | 'gte' | 'lte';
    value: any;
}

// ==========================================
// 골프장 관련 타입들 (공통 사용)
// ==========================================

/**
 * 골프장 데이터 구조
 * 골프장의 기본 정보, 위치, 연락처, 시설, 포함사항 등을 담는 인터페이스
 */
export interface Course {
    id: string;
    name: string;
    countryId: string;
    provinceId: string;
    cityId: string;
    countryName: string;
    provinceName: string;
    cityName: string;
    inclusions?: string[];
    adminIds: string[];
    isActive: boolean;
    googleMapsLink?: string;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}

/**
 * 국가 데이터 구조
 * 국가 정보와 활성화 상태를 담는 인터페이스
 */
export interface Country {
    id: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

/**
 * 국가 번역 데이터 구조
 * 각 언어별 국가명을 담는 인터페이스
 */
export interface CountryTranslation {
    name: string;
}

/**
 * 번역이 포함된 국가 데이터 (프론트엔드 사용)
 */
export interface CountryWithTranslations extends Country {
    translations?: {
        [language: string]: CountryTranslation;
    };
    name?: string; // 현재 선택된 언어의 이름
}

/**
 * 도/주 데이터 구조
 * 국가 하위의 도/주 정보를 담는 인터페이스
 */
export interface Province {
    id: string;
    name: string;
    countryId: string;
    countryName: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}

/**
 * 도시 데이터 구조
 * 도/주 하위의 도시 정보를 담는 인터페이스
 */
export interface City {
    id: string;
    name: string;
    countryId: string;
    countryName: string;
    provinceId: string;
    provinceName: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}

/**
 * 지역 데이터 구조
 * 국가-도/주-도시의 계층 구조를 담는 인터페이스
 */
export interface Region {
    id: string;
    name: string;
    countryId: string;
    countryName: string;
    provinceId: string;
    provinceName: string;
    cityId: string;
    cityName: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}
