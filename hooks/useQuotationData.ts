import { useState } from 'react';

export interface QuotationData {
    customerName: string;
    destination: string;
    travelPeriod: string;
    numberOfPeople: string;
}

export interface TravelDates {
    startDate: string;
    endDate: string;
}

export interface GolfSchedule {
    id: string;
    date: string;
    courseName: string;
    holes: string;
    inclusions: string[];
    teeOff: string;
    total: string;
    prepayment: string;
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
    prepayment: string;
}

export interface PickupSchedule {
    id: string;
    date: string;
    destination: string;
    people: string;
    vehicles: string;
    vehicleType: string;
    region: string;
    total: string;
    prepayment: string;
}

export interface PaymentInfo {
    downPayment: string;
    balanceDueDate: string;
}

export const useQuotationData = () => {
    const [quotationData, setQuotationData] = useState<QuotationData>({
        customerName: '',
        destination: '',
        travelPeriod: '',
        numberOfPeople: ''
    });

    const [travelDates, setTravelDates] = useState<TravelDates>({
        startDate: '',
        endDate: ''
    });

    const [golfSchedules, setGolfSchedules] = useState<GolfSchedule[]>([]);
    const [accommodationSchedules, setAccommodationSchedules] = useState<AccommodationSchedule[]>([]);
    const [pickupSchedules, setPickupSchedules] = useState<PickupSchedule[]>([]);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
        downPayment: '',
        balanceDueDate: ''
    });

    const [additionalOptions, setAdditionalOptions] = useState('');

    const updateQuotationData = (field: keyof QuotationData, value: string) => {
        setQuotationData(prev => ({ ...prev, [field]: value }));
    };

    const updateTravelDates = (field: keyof TravelDates, value: string) => {
        setTravelDates(prev => ({ ...prev, [field]: value }));
    };

    const updatePaymentInfo = (field: keyof PaymentInfo, value: string) => {
        setPaymentInfo(prev => ({ ...prev, [field]: value }));
    };

    const addGolfSchedule = () => {
        const newSchedule: GolfSchedule = {
            id: Date.now().toString(),
            date: '',
            courseName: '',
            holes: '',
            inclusions: [],
            teeOff: '',
            total: '',
            prepayment: ''
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

    const addAccommodationSchedule = () => {
        const newSchedule: AccommodationSchedule = {
            id: Date.now().toString(),
            date: '',
            hotelName: '',
            nights: '',
            rooms: '',
            roomType: '',
            meals: '',
            total: '',
            prepayment: ''
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
            people: '',
            vehicles: '',
            vehicleType: '',
            region: '',
            total: '',
            prepayment: ''
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

    // 총 사전결제 금액 계산 (골프 + 숙박 + 픽업)
    const calculateTotalPrepayment = () => {
        const golfTotal = golfSchedules.reduce((sum, schedule) => {
            const prepayment = parseInt(schedule.prepayment.replace(/[₩,]/g, '')) || 0;
            return sum + prepayment;
        }, 0);

        const accommodationTotal = accommodationSchedules.reduce((sum, schedule) => {
            const prepayment = parseInt(schedule.prepayment.replace(/[₩,]/g, '')) || 0;
            return sum + prepayment;
        }, 0);

        const pickupTotal = pickupSchedules.reduce((sum, schedule) => {
            const prepayment = parseInt(schedule.prepayment.replace(/[₩,]/g, '')) || 0;
            return sum + prepayment;
        }, 0);

        const total = golfTotal + accommodationTotal + pickupTotal;
        return `₩${total.toLocaleString()}`;
    };

    // 총 합계 금액 계산 (골프 + 숙박 + 픽업)
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

        const total = golfTotal + accommodationTotal + pickupTotal;
        return total;
    };

    // 잔금 계산
    const calculateBalance = () => {
        const totalAmount = calculateTotalAmount();
        const downPayment = parseInt(paymentInfo.downPayment.replace(/[₩,]/g, '')) || 0;
        const balance = totalAmount - downPayment;
        return `₩${balance.toLocaleString()}`;
    };

    // 잔금 납부일 계산 (여행 시작일 30일 전)
    const calculateBalanceDueDate = () => {
        if (!travelDates.startDate) return '';

        // 날짜 형식 파싱 (25/01/07 형식)
        const [year, month, day] = travelDates.startDate.split('/');
        const fullYear = parseInt(year) < 50 ? 2000 + parseInt(year) : 1900 + parseInt(year);
        const startDate = new Date(fullYear, parseInt(month) - 1, parseInt(day));

        const dueDate = new Date(startDate);
        dueDate.setDate(dueDate.getDate() - 30);

        // YY/MM/DD 형식으로 반환
        const dueYear = dueDate.getFullYear() % 100;
        const dueMonth = String(dueDate.getMonth() + 1).padStart(2, '0');
        const dueDay = String(dueDate.getDate()).padStart(2, '0');

        return `${dueYear}/${dueMonth}/${dueDay}`;
    };

    // 포함사항 동적 생성
    const generateInclusions = () => {
        const inclusions = [];

        // 골프 회수
        if (golfSchedules.length > 0) {
            inclusions.push(`골프 ${golfSchedules.length}회`);
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

        return inclusions.join(" / ");
    };

    // 필수 입력값 검증 (고객명, 여행지, 여행기간, 인원)
    const isFormValid = () => {
        return !!(
            quotationData.customerName?.trim() &&
            quotationData.destination?.trim() &&
            travelDates.startDate?.trim() &&
            travelDates.endDate?.trim() &&
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

        return `₩${pricePerPerson.toLocaleString()}`;
    };

    return {
        quotationData,
        travelDates,
        golfSchedules,
        accommodationSchedules,
        pickupSchedules,
        paymentInfo,
        additionalOptions,
        updateQuotationData,
        updateTravelDates,
        updatePaymentInfo,
        addGolfSchedule,
        updateGolfSchedule,
        removeGolfSchedule,
        addAccommodationSchedule,
        updateAccommodationSchedule,
        removeAccommodationSchedule,
        addPickupSchedule,
        updatePickupSchedule,
        removePickupSchedule,
        setAdditionalOptions,
        calculateTotalPrepayment,
        calculateTotalAmount,
        calculateBalance,
        calculateBalanceDueDate,
        generateInclusions,
        isFormValid,
        calculatePricePerPerson
    };
};
