// 공통 유틸리티 함수들

/**
 * 날짜를 한국어 형식으로 포맷팅
 */
export const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * 시간을 12시간 형식으로 포맷팅
 */
export const formatTime = (timeStr: string): string => {
    const [hour, minute] = timeStr.split(':');
    const hourNum = parseInt(hour);
    const period = hourNum >= 12 ? 'PM' : 'AM';
    const displayHour = hourNum > 12 ? hourNum - 12 : hourNum === 0 ? 12 : hourNum;
    return `${displayHour}:${minute} ${period}`;
};

/**
 * 날짜를 상대적 형식으로 표시 (오늘, 내일, 월일)
 */
export const formatRelativeDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dateStr === today.toISOString().split('T')[0]) {
        return '오늘';
    } else if (dateStr === tomorrow.toISOString().split('T')[0]) {
        return '내일';
    } else {
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
    }
};

/**
 * 가격을 천 단위 구분자로 포맷팅
 */
export const formatPrice = (price: number): string => {
    return price.toLocaleString() + '원';
};

/**
 * 가용성 상태 텍스트 반환
 */
export const getAvailabilityText = (slots: number): string => {
    if (slots >= 4) return 'Good availability';
    if (slots >= 2) return 'Limited availability';
    return 'Few spots left';
};

/**
 * 가용성 상태 CSS 클래스 반환
 */
export const getAvailabilityClass = (slots: number): string => {
    if (slots >= 4) return 'availability-good';
    if (slots >= 2) return 'availability-limited';
    return 'availability-few';
};

/**
 * 랜덤 골프장 타입 생성
 */
export const getRandomType = (): 'public' | 'private' | 'resort' => {
    const types = ['public', 'private', 'resort'] as const;
    return types[Math.floor(Math.random() * types.length)];
};

/**
 * 랜덤 평점 생성 (3.5 ~ 5.0)
 */
export const getRandomRating = (): number => {
    return Math.round((Math.random() * 1.5 + 3.5) * 10) / 10;
};

/**
 * 랜덤 리뷰 수 생성 (50 ~ 250)
 */
export const getRandomReviews = (): number => {
    return Math.floor(Math.random() * 200) + 50;
};

/**
 * 원가 계산 (20-50% 할인)
 */
export const getOriginalPrice = (price: number): string => {
    if (!price) return '';
    const originalPrice = Math.floor(price * (1.2 + Math.random() * 0.3));
    return `${originalPrice.toLocaleString()}원`;
};

/**
 * 할인율 계산 (20-50%)
 */
export const getDiscount = (price: number): string => {
    if (!price) return '';
    const discountPercent = Math.floor(20 + Math.random() * 30);
    return `${discountPercent}% 할인`;
};

/**
 * 랜덤 골프장 이미지 URL
 */
export const getRandomImage = (): string => {
    const images = [
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
        'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80'
    ];
    return images[Math.floor(Math.random() * images.length)];
};

/**
 * 랜덤 골프장 특징 생성
 */
export const getRandomFeatures = (): string[] => {
    const allFeatures = ['18홀', '파 72', '골프카트', '프로샵', '레스토랑', '클럽하우스', '스파', '골프박물관'];
    const numFeatures = Math.floor(Math.random() * 4) + 3; // 3-6개
    return allFeatures.sort(() => 0.5 - Math.random()).slice(0, numFeatures);
};

/**
 * 지나간 날짜인지 확인
 */
export const isDatePast = (dateStr: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr < today;
};

/**
 * 골프장 타입 라벨 반환
 */
export const getTypeLabel = (type: 'public' | 'private' | 'resort'): string => {
    const labels = {
        public: '공공',
        private: '사설',
        resort: '리조트'
    };
    return labels[type];
};
