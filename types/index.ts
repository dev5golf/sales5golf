// 공통 타입 정의

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

export interface Course {
    id: string;
    name: string;
    address: string;
    countryId: string;
    provinceId: string;
    cityId: string;
    countryName: string;
    provinceName: string;
    cityName: string;
    phone: string;
    email?: string;
    website?: string;
    description: string;
    price: number;
    images: string[];
    facilities?: string[];
    inclusions?: string[];
    adminIds: string[];
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}

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

export interface Country {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}

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

// 컴포넌트 Props 타입들
export interface CalendarProps {
    currentMonth: Date;
    onDateClick: (date: string) => void;
    teeTimes: TeeTime[];
}

export interface TeeTimeModalProps {
    date: string;
    onSave: (teeTimeData: Omit<TeeTime, 'id' | 'courseId' | 'courseName'>) => void;
    onClose: () => void;
    existingTeeTimes: TeeTime[];
    onUpdate: (id: string, updatedData: Partial<TeeTime>) => void;
    onDelete: (id: string) => void;
    courseName?: string;
}

// API 응답 타입들
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

// 폼 데이터 타입들
export interface TeeTimeFormData {
    hour: string;
    minute: string;
    availableSlots: string;
    agentPrice: string;
    note: string;
}

export interface CourseFormData {
    name: string;
    address: string;
    countryId: string;
    provinceId: string;
    cityId: string;
    phone: string;
    email: string;
    website: string;
    description: string;
    price: string;
    images: string[];
    facilities: string[];
    adminIds: string[];
    isActive: boolean;
}

export interface UserFormData {
    email: string;
    name: string;
    phone?: string;
    role: 'user' | 'course_admin' | 'super_admin' | 'site_admin';
    courseId?: string;
    isActive: boolean;
}

// 항공 일정 타입
export interface FlightSchedule {
    id: string;
    date: string;
    flightSchedule: string;
    people: string;
    airline: string;
    flightNumber: string;
    baggage: string;
    duration: string;
    total: string;
}

// 렌트카 일정 타입
export interface RentalCarSchedule {
    id: string;
    date: string;
    pickupLocation: string;
    pickupTime: string; // 픽업시간 추가
    returnLocation: string;
    people: string;
    rentalDays: string;
    carType: string;
    insurance: string;
    total: string;
    // 직접입력 모드 필드들
    pickupLocationDirectInput?: string;
    returnLocationDirectInput?: string;
    carTypeDirectInput?: string;
    // 환율 관련 필드들
    yenAmount?: string; // 엔화 금액 (현장결제용)
}