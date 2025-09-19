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
    '견적서는 예약 확정이 아닙니다. 해당 요금은 현지 사정에 따라 일부 변경될 수 있습니다.',
    '우천취소를 당일 현장 규정에 따르셔야 하며, 예보 취소 불가합니다.',
    '확정 가능여부에 따라 일정이 변경 될 수 있습니다.',
    '티타임 배정은 희망 시간대로 배정 요청해드리며, 불가한 경우 가장 가까운 시간으로 안내드립니다.'
] as const; 