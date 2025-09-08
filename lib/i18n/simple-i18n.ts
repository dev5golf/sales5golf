'use client';

// 간단한 다국어 지원 시스템
export type Language = 'ko' | 'en' | 'vi';

export interface Translations {
    [key: string]: string;
}

export interface TranslationResources {
    ko: Translations;
    en: Translations;
    vi: Translations;
}

// 기본 번역 데이터
const defaultTranslations: TranslationResources = {
    ko: {
        // 공통
        'common.search': '검색',
        'common.login': '로그인',
        'common.logout': '로그아웃',
        'common.loading': '로딩 중...',
        'common.save': '저장',
        'common.cancel': '취소',
        'common.edit': '편집',
        'common.delete': '삭제',
        'common.add': '추가',
        'common.close': '닫기',

        // 검색
        'search.placeholder': '골프장 이름, 지역, 도시로 검색...',

        // 필터
        'filter.all': '전체',
        'filter.public': '공공',
        'filter.private': '사설',
        'filter.resort': '리조트',

        // 골프장
        'courses.title': '골프장 목록',
        'courses.subtitle': '전국의 최고 골프장을 찾아보세요',
        'courses.price': '가격',
        'courses.location': '위치',
        'courses.rating': '평점',
        'courses.reviews': '리뷰',
        'courses.features': '특징',
        'courses.description': '설명',
        'courses.phone': '전화번호',
        'courses.address': '주소',

        // 네비게이션
        'nav.home': '홈',
        'nav.courses': '골프장',
        'nav.about': '소개',
        'nav.contact': '문의',

        // 버튼
        'btn.signin': '로그인',
        'btn.join': '회원가입',
        'btn.book': '예약하기',
        'btn.view': '자세히 보기',
        'btn.back': '뒤로가기',

        // 메시지
        'message.noResults': '검색 결과가 없습니다',
        'message.error': '오류가 발생했습니다',
        'message.success': '성공적으로 처리되었습니다'
    },
    en: {
        // Common
        'common.search': 'Search',
        'common.login': 'Login',
        'common.logout': 'Logout',
        'common.loading': 'Loading...',
        'common.save': 'Save',
        'common.cancel': 'Cancel',
        'common.edit': 'Edit',
        'common.delete': 'Delete',
        'common.add': 'Add',
        'common.close': 'Close',

        // Search
        'search.placeholder': 'Search by golf course name, region, city...',

        // Filter
        'filter.all': 'All',
        'filter.public': 'Public',
        'filter.private': 'Private',
        'filter.resort': 'Resort',

        // Golf Courses
        'courses.title': 'Golf Course List',
        'courses.subtitle': 'Find the best golf courses nationwide',
        'courses.price': 'Price',
        'courses.location': 'Location',
        'courses.rating': 'Rating',
        'courses.reviews': 'Reviews',
        'courses.features': 'Features',
        'courses.description': 'Description',
        'courses.phone': 'Phone',
        'courses.address': 'Address',

        // Navigation
        'nav.home': 'Home',
        'nav.courses': 'Courses',
        'nav.about': 'About',
        'nav.contact': 'Contact',

        // Buttons
        'btn.signin': 'Sign In',
        'btn.join': 'Join',
        'btn.book': 'Book Now',
        'btn.view': 'View Details',
        'btn.back': 'Back',

        // Messages
        'message.noResults': 'No results found',
        'message.error': 'An error occurred',
        'message.success': 'Successfully processed'
    },
    vi: {
        // Chung
        'common.search': 'Tìm kiếm',
        'common.login': 'Đăng nhập',
        'common.logout': 'Đăng xuất',
        'common.loading': 'Đang tải...',
        'common.save': 'Lưu',
        'common.cancel': 'Hủy',
        'common.edit': 'Chỉnh sửa',
        'common.delete': 'Xóa',
        'common.add': 'Thêm',
        'common.close': 'Đóng',

        // Tìm kiếm
        'search.placeholder': 'Tìm kiếm theo tên sân golf, khu vực, thành phố...',

        // Bộ lọc
        'filter.all': 'Tất cả',
        'filter.public': 'Công cộng',
        'filter.private': 'Tư nhân',
        'filter.resort': 'Resort',

        // Sân golf
        'courses.title': 'Danh sách sân golf',
        'courses.subtitle': 'Tìm những sân golf tốt nhất trên toàn quốc',
        'courses.price': 'Giá',
        'courses.location': 'Vị trí',
        'courses.rating': 'Đánh giá',
        'courses.reviews': 'Đánh giá',
        'courses.features': 'Tính năng',
        'courses.description': 'Mô tả',
        'courses.phone': 'Điện thoại',
        'courses.address': 'Địa chỉ',

        // Điều hướng
        'nav.home': 'Trang chủ',
        'nav.courses': 'Sân golf',
        'nav.about': 'Giới thiệu',
        'nav.contact': 'Liên hệ',

        // Nút bấm
        'btn.signin': 'Đăng nhập',
        'btn.join': 'Tham gia',
        'btn.book': 'Đặt ngay',
        'btn.view': 'Xem chi tiết',
        'btn.back': 'Quay lại',

        // Thông báo
        'message.noResults': 'Không tìm thấy kết quả',
        'message.error': 'Đã xảy ra lỗi',
        'message.success': 'Xử lý thành công'
    }
};

class SimpleI18n {
    private currentLanguage: Language = 'ko';
    private translations: TranslationResources = defaultTranslations;

    constructor() {
        this.loadFromStorage();
    }

    private loadFromStorage() {
        if (typeof window === 'undefined') return;

        try {
            // 저장된 언어 설정 로드
            const savedLanguage = localStorage.getItem('language') as Language;
            if (savedLanguage && ['ko', 'en', 'vi'].includes(savedLanguage)) {
                this.currentLanguage = savedLanguage;
            }

            // 저장된 번역 데이터 로드
            const koTranslations = localStorage.getItem('translations_ko');
            const enTranslations = localStorage.getItem('translations_en');
            const viTranslations = localStorage.getItem('translations_vi');

            if (koTranslations && enTranslations && viTranslations) {
                this.translations = {
                    ko: JSON.parse(koTranslations),
                    en: JSON.parse(enTranslations),
                    vi: JSON.parse(viTranslations)
                };
            }
        } catch (error) {
            console.error('번역 데이터 로드 중 오류:', error);
        }
    }

    public t(key: string): string {
        return this.translations[this.currentLanguage][key] || key;
    }

    public setLanguage(language: Language) {
        this.currentLanguage = language;
        if (typeof window !== 'undefined') {
            localStorage.setItem('language', language);
        }
    }

    public getCurrentLanguage(): Language {
        return this.currentLanguage;
    }

    public getAvailableLanguages(): { code: Language; name: string; flag: string }[] {
        return [
            { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' },
            { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
            { code: 'vi' as Language, name: 'Tiếng Việt', flag: '🇻🇳' }
        ];
    }

    public updateTranslations(translations: TranslationResources) {
        this.translations = translations;
        if (typeof window !== 'undefined') {
            localStorage.setItem('translations_ko', JSON.stringify(translations.ko));
            localStorage.setItem('translations_en', JSON.stringify(translations.en));
            localStorage.setItem('translations_vi', JSON.stringify(translations.vi));
        }
    }

    public getCurrentTranslations(): TranslationResources {
        return this.translations;
    }
}

// 싱글톤 인스턴스
export const i18n = new SimpleI18n();
