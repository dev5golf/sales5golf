// 수배 관련 상수들
export const RECRUITMENT_CONSTANTS = {
    // 폼 필드 라벨
    LABELS: {
        CUSTOMER_NAME: '고객명',
        DESTINATION: '여행지',
        START_DATE: '여행기간 시작일',
        END_DATE: '여행기간 종료일',
        NUMBER_OF_PEOPLE: '인원'
    },

    // 플레이스홀더 텍스트
    PLACEHOLDERS: {
        CUSTOMER_NAME: '고객명을 입력하세요',
        DESTINATION: '태국/치앙마이',
        START_DATE: 'YY/MM/DD',
        END_DATE: 'YY/MM/DD',
        NUMBER_OF_PEOPLE: '인원수를 입력하세요'
    },

    // 메시지
    MESSAGES: {
        SUCCESS: {
            CREATE: '수배가 성공적으로 등록되었습니다.',
            UPDATE: '수배가 성공적으로 수정되었습니다.',
            DELETE: '수배가 성공적으로 삭제되었습니다.',
            FETCH: '수배 목록을 성공적으로 조회했습니다.'
        },
        ERROR: {
            CREATE: '수배 등록에 실패했습니다.',
            UPDATE: '수배 수정에 실패했습니다.',
            DELETE: '수배 삭제에 실패했습니다.',
            FETCH: '수배 목록 조회에 실패했습니다.',
            VALIDATION: '필수 정보를 모두 입력해주세요.'
        }
    },

    // 유효성 검사 규칙
    VALIDATION: {
        MIN_PEOPLE: 1,
        MAX_PEOPLE: 50,
        REQUIRED_FIELDS: ['customerName', 'destination', 'startDate', 'endDate', 'numberOfPeople'] as const
    },

    // 날짜 포맷
    DATE_FORMAT: {
        DISPLAY: 'yy/MM/dd',
        API: 'YYYY-MM-DD'
    }
} as const;

// 대시보드 관련 상수들
export const DASHBOARD_CONSTANTS = {
    // 섹션 제목
    SECTIONS: {
        RECRUITMENT: '수배',
        RESERVATION: '예약',
        DEPOSIT: '입금',
        WITHDRAWAL: '출금'
    },

    // 버튼 텍스트
    BUTTONS: {
        REGISTER: '등록',
        CANCEL: '취소',
        EDIT: '수정',
        DELETE: '삭제'
    },

    // 페이지 제목
    TITLES: {
        MAIN: '관리자 도구 대시보드',
        RECRUITMENT_MODAL: '수배 등록'
    },

    // 안내 메시지
    MESSAGES: {
        LOADING: '로딩 중...',
        NO_DATA: '내용을 추가하세요',
        TIP_TITLE: '💡 Tip',
        TIP_CONTENT: '이 대시보드는 관리자 도구의 전체 활동을 한눈에 볼 수 있도록 설계되었습니다. 실제 데이터는 향후 업데이트를 통해 연동될 예정입니다.'
    }
} as const;

// 액티비티 로그 관련 상수들
export const ACTIVITY_LOG_CONSTANTS = {
    // 섹션 제목
    SECTIONS: {
        TITLE: '활동 로그'
    },

    // 액션 타입
    ACTIONS: {
        LABELS: {
            recruitment_create: '수배 등록',
            recruitment_update: '수배 수정',
            quotation_save: '견적서 저장',
            quotation_download: '견적서 다운로드',
            reservation_create: '예약 등록',
            deposit_create: '입금 등록',
            withdrawal_create: '출금 등록'
        },
        COLORS: {
            recruitment_create: {
                bg: 'bg-blue-100',
                text: 'text-blue-600',
                badge: 'bg-blue-100 text-blue-700'
            },
            recruitment_update: {
                bg: 'bg-yellow-100',
                text: 'text-yellow-600',
                badge: 'bg-yellow-100 text-yellow-700'
            },
            quotation_save: {
                bg: 'bg-green-100',
                text: 'text-green-600',
                badge: 'bg-green-100 text-green-700'
            },
            quotation_download: {
                bg: 'bg-purple-100',
                text: 'text-purple-600',
                badge: 'bg-purple-100 text-purple-700'
            },
            reservation_create: {
                bg: 'bg-orange-100',
                text: 'text-orange-600',
                badge: 'bg-orange-100 text-orange-700'
            },
            deposit_create: {
                bg: 'bg-emerald-100',
                text: 'text-emerald-600',
                badge: 'bg-emerald-100 text-emerald-700'
            },
            withdrawal_create: {
                bg: 'bg-red-100',
                text: 'text-red-600',
                badge: 'bg-red-100 text-red-700'
            }
        }
    },

    // 메시지
    MESSAGES: {
        NO_DATA: '활동 로그가 없습니다.',
        LOADING: '로딩 중...'
    }
} as const;

// 타입 정의
export type RecruitmentLabels = typeof RECRUITMENT_CONSTANTS.LABELS;
export type RecruitmentPlaceholders = typeof RECRUITMENT_CONSTANTS.PLACEHOLDERS;
export type DashboardSections = typeof DASHBOARD_CONSTANTS.SECTIONS;
