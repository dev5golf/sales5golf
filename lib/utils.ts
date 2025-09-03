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
