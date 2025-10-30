/**
 * 견적서 관련 타입 정의
 * admin-tools 기능에서 사용되는 모든 타입들을 정의
 */

// ==========================================
// 견적서 기본 정보 타입
// ==========================================

/**
 * 견적서 기본 정보 데이터 구조
 * 고객명, 여행지, 여행기간, 인원 등 견적서의 기본 정보를 담는 인터페이스
 */
export interface QuotationData {
    customerName: string;
    destination: string;
    travelPeriod: string;
    startDate: string;
    endDate: string;
    numberOfPeople: string;
}

// ==========================================
// 견적서 일정 타입들
// ==========================================

/**
 * 골프 일정 데이터 구조
 * 골프장 정보, 날짜, 홀수, 포함사항, 티오프 시간, 금액 등을 담는 인터페이스
 * 사전결제와 현장결제 모두에서 사용됨
 */
export interface GolfSchedule {
    id: string;
    date: string;
    courseName: string;
    courseId?: string; // 골프장 ID (지도링크 조회용)
    holes: string;
    inclusions: string[];
    teeOff: string;
    teeOffDirectInput: string;
    total: string;
    isEstimatedAmount: string;
    yenAmount?: string; // 엔화 금액 추가 (현장결제용)
}

/**
 * 숙박 일정 데이터 구조
 * 호텔명, 숙박일수, 객실 수, 룸 타입, 식사 옵션, 금액 등을 담는 인터페이스
 */
export interface AccommodationSchedule {
    id: string;
    date: string;
    hotelName: string;
    nights: string;
    rooms: string;
    roomType: string;
    meals: string;
    total: string;
}

/**
 * 픽업 서비스 일정 데이터 구조
 * 목적지, 픽업/드롭오프 위치, 인원, 차량 정보, 금액 등을 담는 인터페이스
 * 직접입력 모드와 선택 모드를 모두 지원
 */
export interface PickupSchedule {
    id: string;
    date: string;
    destination: string;
    destinationDirectInput: string;
    pickupLocation: string;
    dropoffLocation: string;
    people: string;
    vehicles: string;
    vehicleType: string;
    vehicleTypeDirectInput: string;
    region: string;
    total: string;
}

/**
 * 항공 일정 데이터 구조
 * 항공편 정보, 인원, 수하물, 금액 등을 담는 인터페이스
 */
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

/**
 * 렌트카 일정 데이터 구조
 * 픽업/반납 위치, 시간, 차량 정보, 보험, 금액 등을 담는 인터페이스
 * 직접입력 모드와 환율 변환을 지원
 */
export interface RentalCarSchedule {
    id: string;
    date: string;
    pickupLocation: string;
    pickupTime: string; // 픽업시간 추가
    returnLocation: string;
    returnTime: string; // 반납시간 추가
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

// ==========================================
// 결제 정보 타입
// ==========================================

/**
 * 결제 정보 데이터 구조
 * 사전결제 금액, 사전결제 날짜, 잔금 지급일 등을 담는 인터페이스
 */
export interface PaymentInfo {
    downPayment: string;
    downPaymentDate: string;
    balanceDueDate: string;
}
