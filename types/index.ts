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
    countryCode: string;
    provinceCode: string;
    cityCode: string;
    countryName: string;
    provinceName: string;
    cityName: string;
    phone: string;
    description: string;
    price: number;
    images: string[];
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
    role: 'user' | 'course_admin' | 'super_admin';
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
    code: string;
    name: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}

export interface Province {
    id: string;
    code: string;
    name: string;
    countryCode: string;
    countryName: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}

export interface City {
    id: string;
    code: string;
    name: string;
    countryCode: string;
    countryName: string;
    provinceCode: string;
    provinceName: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
    createdBy: string | null;
}

export interface Region {
    id: string;
    code: string;
    name: string;
    countryCode: string;
    countryName: string;
    provinceCode: string;
    provinceName: string;
    cityCode: string;
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
    countryCode: string;
    provinceCode: string;
    cityCode: string;
    phone: string;
    description: string;
    price: string;
    images: string[];
    adminIds: string[];
    isActive: boolean;
}

export interface UserFormData {
    email: string;
    name: string;
    phone?: string;
    role: 'user' | 'course_admin' | 'super_admin';
    courseId?: string;
    isActive: boolean;
}
