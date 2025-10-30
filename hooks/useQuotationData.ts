import { useState } from 'react';
import {
    FlightSchedule,
    RentalCarSchedule,
    QuotationData,
    GolfSchedule,
    AccommodationSchedule,
    PickupSchedule,
    PaymentInfo
} from '@/app/(admin)/admin/admin-tools/quotation/types';

// Export types for use in other files
export type {
    FlightSchedule,
    RentalCarSchedule,
    QuotationData,
    GolfSchedule,
    AccommodationSchedule,
    PickupSchedule,
    PaymentInfo
};

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
    const [regionType, setRegionType] = useState<'basic' | 'japan'>('basic');
    const [isPackageQuotation, setIsPackageQuotation] = useState<boolean>(false);

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

    // 범용 복사 함수 - 모든 일정 복사용 (골프, 픽업, 숙박 등)
    const copySchedule = <T extends { id: string }>(id: string, schedules: T[], setSchedules: React.Dispatch<React.SetStateAction<T[]>>) => {
        const scheduleToCopy = schedules.find(schedule => schedule.id === id);
        if (scheduleToCopy) {
            const copiedSchedule: T = {
                ...scheduleToCopy,
                id: Date.now().toString() // 새로운 ID 생성
            };
            setSchedules(prev => [...prev, copiedSchedule]);
        }
    };

    // 골프 사전결제 복사 함수
    const copyGolfSchedule = (id: string) => {
        copySchedule(id, golfSchedules, setGolfSchedules);
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

    // 골프 현장결제 복사 함수
    const copyGolfOnSiteSchedule = (id: string) => {
        copySchedule(id, golfOnSiteSchedules, setGolfOnSiteSchedules);
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

    // 픽업 복사 함수
    const copyPickupSchedule = (id: string) => {
        copySchedule(id, pickupSchedules, setPickupSchedules);
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


    // 오분골프 수수료 계산
    const calculateFee = () => {
        const people = parseInt(quotationData.numberOfPeople) || 0;

        // 골프 수수료 계산 (1인당 1회 1만원 × 골프 행 수)
        // 기본 지역의 경우 골프수수료는 무료(0원)로 적용
        // 패키지견적 선택 시 항공 제외 나머지는 0원 처리
        const golfFeePerPerson = regionType === 'japan' ? 10000 : 0;
        const totalGolfFee = isPackageQuotation ? 0 : people * (golfSchedules.length + golfOnSiteSchedules.length) * golfFeePerPerson;

        // 숙박 수수료 계산 (숙박 테이블 행의 객실수 × 1만원)
        const accommodationFeePerRoom = 10000;
        const totalAccommodationFee = isPackageQuotation ? 0 : accommodationSchedules.reduce((total, schedule) => {
            const rooms = parseInt(schedule.rooms) || 0;
            return total + (rooms * accommodationFeePerRoom);
        }, 0);

        // 렌트카 수수료 계산 (1대당 1만원 × 렌트카 행 수)
        const rentalCarFeePerCar = 10000;
        const totalRentalCarFee = isPackageQuotation ? 0 : (rentalCarSchedules.length + rentalCarOnSiteSchedules.length) * rentalCarFeePerCar;

        // 항공 수수료 계산 (첫 번째 항공 행의 인원수 × 1만원)
        const flightFeePerPerson = 10000;
        const firstFlightPeople = flightSchedules.length > 0 ? (parseInt(flightSchedules[0].people) || 0) : 0;
        const totalFlightFee = firstFlightPeople * flightFeePerPerson;

        // 8인 이상 시 골프 수수료에만 30% 할인 적용
        const isDiscountEligible = people >= 8;
        const discountRate = isDiscountEligible ? 0.3 : 0;
        const golfDiscountAmount = totalGolfFee * discountRate;
        const finalGolfFee = totalGolfFee - golfDiscountAmount;

        // 총 수수료 (할인 적용된 골프 수수료 + 숙박 수수료 + 렌트카 수수료 + 항공 수수료)
        const finalFee = finalGolfFee + totalAccommodationFee + totalRentalCarFee + totalFlightFee;
        return finalFee;
    };

    // 총 합계 금액 계산 (사전결제 항목만: 골프 + 숙박 + 픽업 + 항공 + 렌트카(사전결제))
    // 현장결제 항목(골프 현장결제, 렌트카 현장결제)은 별도로 처리
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

        // 오분골프 수수료 추가
        const fee = calculateFee();

        const total = golfTotal + accommodationTotal + pickupTotal + flightTotal + rentalCarTotal + fee;
        return total;
    };

    // 잔금 계산
    const calculateBalance = () => {
        const totalAmount = calculateTotalAmount();
        const downPayment = parseInt(paymentInfo.downPayment.replace(/[₩,]/g, '')) || 0;
        const balance = totalAmount - downPayment;
        return `₩${balance}`;
    };


    // 현장결제 총비용 계산 (엔화)
    const calculateOnSiteYenTotal = () => {
        const golfOnSiteYenTotal = golfOnSiteSchedules.reduce((sum, schedule) => {
            const yenAmount = parseInt(schedule.yenAmount || '0') || 0;
            return sum + yenAmount;
        }, 0);

        const rentalCarOnSiteYenTotal = rentalCarOnSiteSchedules.reduce((sum, schedule) => {
            const yenAmount = parseInt(schedule.yenAmount || '0') || 0;
            return sum + yenAmount;
        }, 0);

        return golfOnSiteYenTotal + rentalCarOnSiteYenTotal;
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


    // 사전결제(1인) 계산 (개별 일정의 총액 / 인원)
    const calculatePrepayment = (total: string, numberOfPeople: number): string => {
        const totalAmount = parseInt(total.replace(/[₩,]/g, '')) || 0;
        const people = numberOfPeople || 1;
        const prepaymentPerPerson = Math.floor(totalAmount / people);
        return prepaymentPerPerson.toString();
    };

    // 1인당 요금으로부터 총액 계산 (일본 골프 테이블용)
    const calculateTotalFromPerPerson = (perPersonAmount: string, numberOfPeople: number): string => {
        const amount = parseInt(perPersonAmount.replace(/[₩,]/g, '')) || 0;
        const total = amount * numberOfPeople;
        return `₩${total}`;
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
        regionType,
        updateQuotationData,
        updatePaymentInfo,
        addGolfSchedule,
        updateGolfSchedule,
        removeGolfSchedule,
        copyGolfSchedule,
        copyGolfOnSiteSchedule,
        addGolfOnSiteSchedule,
        updateGolfOnSiteSchedule,
        removeGolfOnSiteSchedule,
        addAccommodationSchedule,
        updateAccommodationSchedule,
        removeAccommodationSchedule,
        addPickupSchedule,
        updatePickupSchedule,
        removePickupSchedule,
        copyPickupSchedule,
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
        calculateTotalAmount,
        calculateBalance,
        calculateOnSiteYenTotal,
        calculateFee,
        generateInclusions,
        isFormValid,
        calculatePrepayment,
        calculateTotalFromPerPerson,
        setRegionType,
        setIsPackageQuotation,
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
