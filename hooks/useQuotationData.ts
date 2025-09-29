import { useState } from 'react';
import { FlightSchedule, RentalCarSchedule } from '../types';

export interface QuotationData {
    customerName: string;
    destination: string;
    travelPeriod: string;
    startDate: string;
    endDate: string;
    numberOfPeople: string;
}

export interface GolfSchedule {
    id: string;
    date: string;
    courseName: string;
    holes: string;
    inclusions: string[];
    teeOff: string;
    teeOffDirectInput: string;
    total: string;
    isEstimatedAmount: string;
    yenAmount?: string; // 엔화 금액 추가 (현장결제용)
}

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

export interface PaymentInfo {
    downPayment: string;
    downPaymentDate: string;
    balanceDueDate: string;
}

export const useQuotationData = () => {
    const [quotationData, setQuotationData] = useState<QuotationData>({
        customerName: '',
        destination: '',
        travelPeriod: '',
        startDate: '',
        endDate: '',
        numberOfPeople: ''
    });

    const [golfSchedules, setGolfSchedules] = useState<GolfSchedule[]>([]);
    const [golfOnSiteSchedules, setGolfOnSiteSchedules] = useState<GolfSchedule[]>([]);
    const [accommodationSchedules, setAccommodationSchedules] = useState<AccommodationSchedule[]>([]);
    const [pickupSchedules, setPickupSchedules] = useState<PickupSchedule[]>([]);
    const [flightSchedules, setFlightSchedules] = useState<FlightSchedule[]>([]);
    const [rentalCarSchedules, setRentalCarSchedules] = useState<RentalCarSchedule[]>([]);
    const [rentalCarOnSiteSchedules, setRentalCarOnSiteSchedules] = useState<RentalCarSchedule[]>([]);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
        downPayment: '',
        downPaymentDate: '',
        balanceDueDate: ''
    });

    const [additionalOptions, setAdditionalOptions] = useState('');

    const updateQuotationData = (field: keyof QuotationData, value: string) => {
        setQuotationData(prev => ({ ...prev, [field]: value }));
    };

    const updatePaymentInfo = (field: keyof PaymentInfo, value: string) => {
        setPaymentInfo(prev => ({ ...prev, [field]: value }));
    };

    const addGolfSchedule = () => {
        const newSchedule: GolfSchedule = {
            id: Date.now().toString(),
            date: '',
            courseName: '',
            holes: '18',
            inclusions: [],
            teeOff: '',
            teeOffDirectInput: 'false',
            total: '',
            isEstimatedAmount: 'false'
        };
        setGolfSchedules(prev => [...prev, newSchedule]);
    };

    const updateGolfSchedule = (id: string, field: keyof GolfSchedule, value: string | string[]) => {
        setGolfSchedules(prev =>
            prev.map(schedule =>
                schedule.id === id
                    ? { ...schedule, [field]: value }
                    : schedule
            )
        );
    };

    const removeGolfSchedule = (id: string) => {
        setGolfSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    const addGolfOnSiteSchedule = () => {
        const newSchedule: GolfSchedule = {
            id: Date.now().toString(),
            date: '',
            courseName: '',
            holes: '18',
            inclusions: [],
            teeOff: '',
            teeOffDirectInput: 'false',
            total: '',
            isEstimatedAmount: 'false'
        };
        setGolfOnSiteSchedules(prev => [...prev, newSchedule]);
    };

    const updateGolfOnSiteSchedule = (id: string, field: keyof GolfSchedule, value: string | string[]) => {
        setGolfOnSiteSchedules(prev =>
            prev.map(schedule =>
                schedule.id === id
                    ? { ...schedule, [field]: value }
                    : schedule
            )
        );
    };

    const removeGolfOnSiteSchedule = (id: string) => {
        setGolfOnSiteSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    const addAccommodationSchedule = () => {
        const newSchedule: AccommodationSchedule = {
            id: Date.now().toString(),
            date: '',
            hotelName: '',
            nights: '',
            rooms: '',
            roomType: '',
            meals: '',
            total: ''
        };
        setAccommodationSchedules(prev => [...prev, newSchedule]);
    };

    const updateAccommodationSchedule = (id: string, field: keyof AccommodationSchedule, value: string) => {
        setAccommodationSchedules(prev =>
            prev.map(schedule =>
                schedule.id === id
                    ? { ...schedule, [field]: value }
                    : schedule
            )
        );
    };

    const removeAccommodationSchedule = (id: string) => {
        setAccommodationSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    const addPickupSchedule = () => {
        const newSchedule: PickupSchedule = {
            id: Date.now().toString(),
            date: '',
            destination: '',
            destinationDirectInput: 'false',
            pickupLocation: '',
            dropoffLocation: '',
            people: '',
            vehicles: '',
            vehicleType: '',
            vehicleTypeDirectInput: 'false',
            region: '',
            total: ''
        };
        setPickupSchedules(prev => [...prev, newSchedule]);
    };

    const updatePickupSchedule = (id: string, field: keyof PickupSchedule, value: string) => {
        setPickupSchedules(prev =>
            prev.map(schedule =>
                schedule.id === id
                    ? { ...schedule, [field]: value }
                    : schedule
            )
        );
    };

    const removePickupSchedule = (id: string) => {
        setPickupSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    const addFlightSchedule = () => {
        const newSchedule: FlightSchedule = {
            id: Date.now().toString(),
            date: '',
            flightSchedule: '',
            people: '',
            airline: '',
            flightNumber: '',
            baggage: '',
            duration: '',
            total: ''
        };
        setFlightSchedules(prev => [...prev, newSchedule]);
    };

    const updateFlightSchedule = (id: string, field: keyof FlightSchedule, value: string) => {
        setFlightSchedules(prev =>
            prev.map(schedule =>
                schedule.id === id
                    ? { ...schedule, [field]: value }
                    : schedule
            )
        );
    };

    const removeFlightSchedule = (id: string) => {
        setFlightSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    const addRentalCarSchedule = () => {
        const newSchedule: RentalCarSchedule = {
            id: Date.now().toString(),
            date: '',
            pickupLocation: '',
            pickupTime: '', // 픽업시간 추가
            returnLocation: '',
            returnTime: '', // 반납시간 추가
            people: '',
            rentalDays: '',
            carType: '',
            insurance: '',
            total: ''
        };
        setRentalCarSchedules(prev => [...prev, newSchedule]);
    };

    const updateRentalCarSchedule = (id: string, field: keyof RentalCarSchedule, value: string) => {
        setRentalCarSchedules(prev =>
            prev.map(schedule =>
                schedule.id === id
                    ? { ...schedule, [field]: value }
                    : schedule
            )
        );
    };

    const removeRentalCarSchedule = (id: string) => {
        setRentalCarSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    const addRentalCarOnSiteSchedule = () => {
        const newSchedule: RentalCarSchedule = {
            id: Date.now().toString(),
            date: '',
            pickupLocation: '',
            pickupTime: '', // 픽업시간 추가
            returnLocation: '',
            returnTime: '', // 반납시간 추가
            people: '',
            rentalDays: '',
            carType: '',
            insurance: '',
            total: ''
        };
        setRentalCarOnSiteSchedules(prev => [...prev, newSchedule]);
    };

    const updateRentalCarOnSiteSchedule = (id: string, field: keyof RentalCarSchedule, value: string) => {
        setRentalCarOnSiteSchedules(prev =>
            prev.map(schedule =>
                schedule.id === id
                    ? { ...schedule, [field]: value }
                    : schedule
            )
        );
    };

    const removeRentalCarOnSiteSchedule = (id: string) => {
        setRentalCarOnSiteSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    // 총 사전결제 금액 계산 (골프 + 골프(현장결제) + 숙박 + 픽업 + 항공 + 렌트카(사전결제))
    const calculateTotalPrepayment = () => {
        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 1;

        const golfTotal = golfSchedules.reduce((sum, schedule) => {
            const prepayment = calculatePrepayment(schedule.total, numberOfPeople);
            return sum + parseInt(prepayment) || 0;
        }, 0);

        const golfOnSiteTotal = golfOnSiteSchedules.reduce((sum, schedule) => {
            const prepayment = calculatePrepayment(schedule.total, numberOfPeople);
            return sum + parseInt(prepayment) || 0;
        }, 0);

        const accommodationTotal = accommodationSchedules.reduce((sum, schedule) => {
            const prepayment = calculatePrepayment(schedule.total, numberOfPeople);
            return sum + parseInt(prepayment) || 0;
        }, 0);

        const pickupTotal = pickupSchedules.reduce((sum, schedule) => {
            const prepayment = calculatePrepayment(schedule.total, numberOfPeople);
            return sum + parseInt(prepayment) || 0;
        }, 0);

        const flightTotal = (flightSchedules || []).reduce((sum, schedule) => {
            const prepayment = calculatePrepayment(schedule.total, numberOfPeople);
            return sum + parseInt(prepayment) || 0;
        }, 0);

        const rentalCarTotal = (rentalCarSchedules || []).reduce((sum, schedule) => {
            const prepayment = calculatePrepayment(schedule.total, numberOfPeople);
            return sum + parseInt(prepayment) || 0;
        }, 0);

        const total = golfTotal + golfOnSiteTotal + accommodationTotal + pickupTotal + flightTotal + rentalCarTotal;
        return `₩${total}`;
    };

    // 총 합계 금액 계산 (골프 + 숙박 + 픽업 + 항공 + 렌트카(사전결제))
    // 현장결제 항목들(골프 현장결제, 렌트카 현장결제)은 제외
    const calculateTotalAmount = () => {
        const golfTotal = golfSchedules.reduce((sum, schedule) => {
            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
            return sum + total;
        }, 0);

        const accommodationTotal = accommodationSchedules.reduce((sum, schedule) => {
            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
            return sum + total;
        }, 0);

        const pickupTotal = pickupSchedules.reduce((sum, schedule) => {
            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
            return sum + total;
        }, 0);

        const flightTotal = (flightSchedules || []).reduce((sum, schedule) => {
            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
            return sum + total;
        }, 0);

        const rentalCarTotal = (rentalCarSchedules || []).reduce((sum, schedule) => {
            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
            return sum + total;
        }, 0);

        const total = golfTotal + accommodationTotal + pickupTotal + flightTotal + rentalCarTotal;
        return total;
    };

    // 잔금 계산
    const calculateBalance = () => {
        const totalAmount = calculateTotalAmount();
        const downPayment = parseInt(paymentInfo.downPayment.replace(/[₩,]/g, '')) || 0;
        const balance = totalAmount - downPayment;
        return `₩${balance}`;
    };

    // 현장결제 총비용 계산 (골프(현장결제) + 렌트카(현장결제))
    const calculateOnSiteTotal = () => {
        const golfOnSiteTotal = golfOnSiteSchedules.reduce((sum, schedule) => {
            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
            return sum + total;
        }, 0);

        const rentalCarOnSiteTotal = (rentalCarOnSiteSchedules || []).reduce((sum, schedule) => {
            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
            return sum + total;
        }, 0);

        return golfOnSiteTotal + rentalCarOnSiteTotal;
    };


    // 포함사항 동적 생성
    const generateInclusions = () => {
        const inclusions = [];

        // 골프 회수
        if (golfSchedules.length > 0) {
            inclusions.push(`골프 ${golfSchedules.length}회`);
        }

        // 골프 현장결제 회수
        if (golfOnSiteSchedules.length > 0) {
            inclusions.push(`골프(현장결제) ${golfOnSiteSchedules.length}회`);
        }

        // 숙박 박수 (모든 숙박의 박수 합산)
        const totalNights = accommodationSchedules.reduce((sum, schedule) => {
            const nights = parseInt(schedule.nights) || 0;
            return sum + nights;
        }, 0);

        if (totalNights > 0) {
            inclusions.push(`숙박 ${totalNights}박`);
        }

        // 픽업 행선지 카운트
        const destinationCounts: { [key: string]: number } = {};
        pickupSchedules.forEach(schedule => {
            if (schedule.destination) {
                destinationCounts[schedule.destination] = (destinationCounts[schedule.destination] || 0) + 1;
            }
        });

        // 픽업 행선지들을 포함사항에 추가
        const pickupInclusions = Object.entries(destinationCounts).map(([destination, count]) => {
            return `${destination} ${count}회`;
        });

        if (pickupInclusions.length > 0) {
            inclusions.push(pickupInclusions.join(", "));
        }

        // 렌트카 사전결제 대수
        if (rentalCarSchedules.length > 0) {
            inclusions.push(`렌트카(사전결제) ${rentalCarSchedules.length}대`);
        }

        // 렌트카 현장결제 대수
        if (rentalCarOnSiteSchedules.length > 0) {
            inclusions.push(`렌트카(현장결제) ${rentalCarOnSiteSchedules.length}대`);
        }

        // 항공 (행의 수에 상관없이 그냥 "항공"으로 표기)
        if (flightSchedules.length > 0) {
            inclusions.push(`항공`);
        }

        return inclusions.join(" / ");
    };

    // 필수 입력값 검증 (고객명, 여행지, 여행기간, 인원)
    const isFormValid = () => {
        return !!(
            quotationData.customerName?.trim() &&
            quotationData.destination?.trim() &&
            quotationData.startDate?.trim() &&
            quotationData.endDate?.trim() &&
            quotationData.numberOfPeople?.trim() &&
            parseInt(quotationData.numberOfPeople) > 0
        );
    };

    // 1인당 요금 계산 (전체 총 금액 / 인원)
    const calculatePricePerPerson = () => {
        const totalAmount = calculateTotalAmount();
        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 0;

        if (numberOfPeople === 0) {
            return '₩0';
        }

        const pricePerPerson = Math.floor(totalAmount / numberOfPeople);

        return `₩${pricePerPerson}`;
    };

    // 사전결제(1인) 계산 (개별 일정의 총액 / 인원)
    const calculatePrepayment = (total: string, numberOfPeople: number): string => {
        const totalAmount = parseInt(total.replace(/[₩,]/g, '')) || 0;
        const people = numberOfPeople || 1;
        const prepaymentPerPerson = Math.floor(totalAmount / people);
        return prepaymentPerPerson.toString();
    };

    // 일정 데이터 직접 설정 함수들 (저장/불러오기용)
    const setGolfSchedulesData = (schedules: GolfSchedule[]) => {
        setGolfSchedules(schedules);
    };

    const setGolfOnSiteSchedulesData = (schedules: GolfSchedule[]) => {
        setGolfOnSiteSchedules(schedules);
    };

    const setAccommodationSchedulesData = (schedules: AccommodationSchedule[]) => {
        setAccommodationSchedules(schedules);
    };

    const setPickupSchedulesData = (schedules: PickupSchedule[]) => {
        setPickupSchedules(schedules);
    };

    const setFlightSchedulesData = (schedules: FlightSchedule[]) => {
        setFlightSchedules(schedules);
    };

    const setRentalCarSchedulesData = (schedules: RentalCarSchedule[]) => {
        setRentalCarSchedules(schedules);
    };

    const setRentalCarOnSiteSchedulesData = (schedules: RentalCarSchedule[]) => {
        setRentalCarOnSiteSchedules(schedules);
    };

    const setPaymentInfoData = (info: PaymentInfo) => {
        setPaymentInfo(info);
    };

    const setQuotationDataData = (data: QuotationData) => {
        setQuotationData(data);
    };

    return {
        quotationData,
        golfSchedules,
        golfOnSiteSchedules,
        accommodationSchedules,
        pickupSchedules,
        flightSchedules,
        rentalCarSchedules,
        rentalCarOnSiteSchedules,
        paymentInfo,
        additionalOptions,
        updateQuotationData,
        updatePaymentInfo,
        addGolfSchedule,
        updateGolfSchedule,
        removeGolfSchedule,
        addGolfOnSiteSchedule,
        updateGolfOnSiteSchedule,
        removeGolfOnSiteSchedule,
        addAccommodationSchedule,
        updateAccommodationSchedule,
        removeAccommodationSchedule,
        addPickupSchedule,
        updatePickupSchedule,
        removePickupSchedule,
        addFlightSchedule,
        updateFlightSchedule,
        removeFlightSchedule,
        addRentalCarSchedule,
        updateRentalCarSchedule,
        removeRentalCarSchedule,
        addRentalCarOnSiteSchedule,
        updateRentalCarOnSiteSchedule,
        removeRentalCarOnSiteSchedule,
        setAdditionalOptions,
        calculateTotalPrepayment,
        calculateTotalAmount,
        calculateBalance,
        calculateOnSiteTotal,
        generateInclusions,
        isFormValid,
        calculatePricePerPerson,
        calculatePrepayment,
        // 저장/불러오기용 setter 함수들
        setGolfSchedulesData,
        setGolfOnSiteSchedulesData,
        setAccommodationSchedulesData,
        setPickupSchedulesData,
        setFlightSchedulesData,
        setRentalCarSchedulesData,
        setRentalCarOnSiteSchedulesData,
        setPaymentInfoData,
        setQuotationDataData
    };
};
