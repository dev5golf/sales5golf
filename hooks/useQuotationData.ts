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
    pickupLocation: string;
    dropoffLocation: string;
    people: string;
    vehicles: string;
    vehicleType: string;
    region: string;
    total: string;
    prepayment: string;
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
        numberOfPeople: ''
    });

    const [travelDates, setTravelDates] = useState<TravelDates>({
        startDate: '',
        endDate: ''
    });

    const [golfSchedules, setGolfSchedules] = useState<GolfSchedule[]>([]);
    const [golfOnSiteSchedules, setGolfOnSiteSchedules] = useState<GolfSchedule[]>([]);
    const [accommodationSchedules, setAccommodationSchedules] = useState<AccommodationSchedule[]>([]);
    const [pickupSchedules, setPickupSchedules] = useState<PickupSchedule[]>([]);
    const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
        downPayment: '',
        downPaymentDate: '',
        balanceDueDate: ''
    });

    const [additionalOptions, setAdditionalOptions] = useState('');

    const updateQuotationData = (field: keyof QuotationData, value: string) => {
        setQuotationData(prev => {
            const newData = { ...prev, [field]: value };

            // 인원이 변경되면 모든 일정의 사전결제를 재계산
            if (field === 'numberOfPeople') {
                const people = parseInt(value) || 1;

                // 골프 일정 사전결제 재계산
                setGolfSchedules(prevGolf =>
                    prevGolf.map(schedule => {
                        const totalAmount = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                        const prepaymentPerPerson = Math.floor(totalAmount / people);
                        return {
                            ...schedule,
                            prepayment: prepaymentPerPerson.toLocaleString()
                        };
                    })
                );

                // 골프(현장결제) 일정 사전결제 재계산
                setGolfOnSiteSchedules(prevGolfOnSite =>
                    prevGolfOnSite.map(schedule => {
                        const totalAmount = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                        const prepaymentPerPerson = Math.floor(totalAmount / people);
                        return {
                            ...schedule,
                            prepayment: prepaymentPerPerson.toLocaleString()
                        };
                    })
                );

                // 숙박 일정 사전결제 재계산
                setAccommodationSchedules(prevAccommodation =>
                    prevAccommodation.map(schedule => {
                        const totalAmount = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                        const prepaymentPerPerson = Math.floor(totalAmount / people);
                        return {
                            ...schedule,
                            prepayment: prepaymentPerPerson.toLocaleString()
                        };
                    })
                );

                // 픽업 일정 사전결제 재계산
                setPickupSchedules(prevPickup =>
                    prevPickup.map(schedule => {
                        const totalAmount = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
                        const prepaymentPerPerson = Math.floor(totalAmount / people);
                        return {
                            ...schedule,
                            prepayment: prepaymentPerPerson.toLocaleString()
                        };
                    })
                );
            }

            return newData;
        });
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
            holes: '18',
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

    const addGolfOnSiteSchedule = () => {
        const newSchedule: GolfSchedule = {
            id: Date.now().toString(),
            date: '',
            courseName: '',
            holes: '18',
            inclusions: [],
            teeOff: '',
            total: '',
            prepayment: ''
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
            pickupLocation: '',
            dropoffLocation: '',
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

    // 총 사전결제 금액 계산 (골프 + 골프(현장결제) + 숙박 + 픽업)
    const calculateTotalPrepayment = () => {
        const golfTotal = golfSchedules.reduce((sum, schedule) => {
            const prepayment = parseInt(schedule.prepayment.replace(/[₩,]/g, '')) || 0;
            return sum + prepayment;
        }, 0);

        const golfOnSiteTotal = golfOnSiteSchedules.reduce((sum, schedule) => {
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

        const total = golfTotal + golfOnSiteTotal + accommodationTotal + pickupTotal;
        return `₩${total.toLocaleString()}`;
    };

    // 총 합계 금액 계산 (골프 + 골프(현장결제) + 숙박 + 픽업)
    const calculateTotalAmount = () => {
        const golfTotal = golfSchedules.reduce((sum, schedule) => {
            const total = parseInt(schedule.total.replace(/[₩,]/g, '')) || 0;
            return sum + total;
        }, 0);

        const golfOnSiteTotal = golfOnSiteSchedules.reduce((sum, schedule) => {
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

        const total = golfTotal + golfOnSiteTotal + accommodationTotal + pickupTotal;
        return total;
    };

    // 잔금 계산
    const calculateBalance = () => {
        const totalAmount = calculateTotalAmount();
        const downPayment = parseInt(paymentInfo.downPayment.replace(/[₩,]/g, '')) || 0;
        const balance = totalAmount - downPayment;
        return `₩${balance.toLocaleString()}`;
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
        golfOnSiteSchedules,
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
        addGolfOnSiteSchedule,
        updateGolfOnSiteSchedule,
        removeGolfOnSiteSchedule,
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
        generateInclusions,
        isFormValid,
        calculatePricePerPerson
    };
};
