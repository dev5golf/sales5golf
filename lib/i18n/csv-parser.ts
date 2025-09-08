import Papa from 'papaparse';

export interface TranslationRow {
    key: string;
    ko: string;
    en: string;
    vi: string;
}

export interface Translations {
    ko: Record<string, string>;
    en: Record<string, string>;
    vi: Record<string, string>;
}

/**
 * CSV 파일을 파싱하여 번역 객체로 변환
 */
export const parseCSVToTranslations = (csvContent: string): Translations => {
    const result = Papa.parse<TranslationRow>(csvContent, {
        header: true,
        skipEmptyLines: true
    });

    const translations: Translations = {
        ko: {},
        en: {},
        vi: {}
    };

    result.data.forEach((row: TranslationRow) => {
        if (row.key && row.ko && row.en && row.vi) {
            translations.ko[row.key] = row.ko;
            translations.en[row.key] = row.en;
            translations.vi[row.key] = row.vi;
        }
    });

    return translations;
};

/**
 * 번역 객체를 CSV 형태로 변환
 */
export const translationsToCSV = (translations: Translations): string => {
    const keys = new Set([
        ...Object.keys(translations.ko),
        ...Object.keys(translations.en),
        ...Object.keys(translations.vi)
    ]);

    const rows = Array.from(keys).map(key => ({
        key,
        ko: translations.ko[key] || '',
        en: translations.en[key] || '',
        vi: translations.vi[key] || ''
    }));

    return Papa.unparse(rows);
};

/**
 * CSV 데이터 검증
 */
export const validateCSV = (data: TranslationRow[]): string[] => {
    const errors: string[] = [];

    data.forEach((row, index) => {
        const rowNum = index + 2; // 헤더 행을 고려하여 +2

        if (!row.key || row.key.trim() === '') {
            errors.push(`Row ${rowNum}: key is required`);
        }
        if (!row.ko || row.ko.trim() === '') {
            errors.push(`Row ${rowNum}: Korean translation is required`);
        }
        if (!row.en || row.en.trim() === '') {
            errors.push(`Row ${rowNum}: English translation is required`);
        }
        if (!row.vi || row.vi.trim() === '') {
            errors.push(`Row ${rowNum}: Vietnamese translation is required`);
        }
    });

    return errors;
};

/**
 * CSV 템플릿 생성
 */
export const generateCSVTemplate = (): string => {
    const template = [
        ['key', 'ko', 'en', 'vi'],
        ['common.search', '검색', 'Search', 'Tìm kiếm'],
        ['common.login', '로그인', 'Login', 'Đăng nhập'],
        ['common.logout', '로그아웃', 'Logout', 'Đăng xuất'],
        ['common.loading', '로딩 중...', 'Loading...', 'Đang tải...'],
        ['common.save', '저장', 'Save', 'Lưu'],
        ['common.cancel', '취소', 'Cancel', 'Hủy'],
        ['search.placeholder', '골프장 이름, 지역, 도시로 검색...', 'Search by golf course name, region, city...', 'Tìm kiếm theo tên sân golf, khu vực, thành phố...'],
        ['filter.all', '전체', 'All', 'Tất cả'],
        ['filter.public', '공공', 'Public', 'Công cộng'],
        ['filter.private', '사설', 'Private', 'Tư nhân'],
        ['filter.resort', '리조트', 'Resort', 'Resort'],
        ['courses.title', '골프장 목록', 'Golf Course List', 'Danh sách sân golf'],
        ['courses.subtitle', '전국의 최고 골프장을 찾아보세요', 'Find the best golf courses nationwide', 'Tìm những sân golf tốt nhất trên toàn quốc'],
        ['courses.price', '가격', 'Price', 'Giá'],
        ['courses.location', '위치', 'Location', 'Vị trí'],
        ['courses.rating', '평점', 'Rating', 'Đánh giá'],
        ['courses.reviews', '리뷰', 'Reviews', 'Đánh giá'],
        ['nav.home', '홈', 'Home', 'Trang chủ'],
        ['nav.courses', '골프장', 'Courses', 'Sân golf'],
        ['btn.signin', '로그인', 'Sign In', 'Đăng nhập'],
        ['btn.join', '회원가입', 'Join', 'Tham gia'],
        ['btn.book', '예약하기', 'Book Now', 'Đặt ngay'],
        ['btn.view', '자세히 보기', 'View Details', 'Xem chi tiết']
    ];

    return Papa.unparse(template);
};