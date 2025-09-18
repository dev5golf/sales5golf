export const INCLUSION_OPTIONS = ['그린피', '캐디피', '카트비', '식사'] as const;

export const VEHICLE_TYPES = ['승용차', 'SUV', '밴', '대형버스'] as const;

export const DESTINATION_OPTIONS = ['공항 > 숙소', '숙소 <> 골프장', '숙소 > 골프장 > 공항', '숙소 > 공항', '일일렌탈 10시간', '일일렌탈 12시간', '편도이동'] as const;

export const ROOM_TYPES = ['스탠다드', '슈페리어', '디럭스', '스위트'] as const;

export const MEAL_OPTIONS = ['조식', '중식', '석식', '전식'] as const;

export const TEE_OFF_TIMES = ['오전', '오후', '새벽'] as const;

export const PAYMENT_TERMS = {
    DOWN_PAYMENT_PERCENTAGE: 30,
    BALANCE_DUE_DAYS: 7
} as const;

export const BANK_INFO = {
    BANK_NAME: '우리은행',
    ACCOUNT_NUMBER: '1005-304-415722',
    ACCOUNT_HOLDER: '(주)엠오엠트래블'
} as const;

export const QUOTATION_NOTES = [
    '일정표의 금액은 요금표에 따라 변경될 수 있습니다.',
    '모든 일정에는 차량이 포함되어 있습니다.',
    '비로 인한 취소는 당일 현장 폐쇄 시에만 처리됩니다.',
    '행사일 20일 전까지 취소/환불이 가능합니다.',
    '티타임 확인은 추후 예정입니다. 골프장 사정으로 토너먼트 행사가 있을 경우 자동 취소될 수 있으니 참고해 주세요.'
] as const;
