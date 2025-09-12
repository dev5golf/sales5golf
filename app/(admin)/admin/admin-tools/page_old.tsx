"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useQuotationData } from '../../../../hooks/useQuotationData';
import { usePreview } from '../../../../hooks/usePreview';
import { useGolfCourses } from '../../../../hooks/useGolfCourses';
import QuotationHeader from './components/QuotationHeader';
import QuotationForm from './components/QuotationForm';
import GolfScheduleTable from './components/GolfScheduleTable';
import PreviewModal from './components/PreviewModal';

export default function AdminTools() {
    const { user, loading } = useAuth();
    const router = useRouter();
    
    // 커스텀 훅 사용
    const quotation = useQuotationData();
    const preview = usePreview();
    const golfCourses = useGolfCourses();

    // 캡처 전용 DOM 생성 함수
    const createCleanPreviewDOM = () => {
        if (!quotationRef.current) return null;

        // DOM 복제
        const clonedElement = quotationRef.current.cloneNode(true) as HTMLElement;

        // 스크롤바 제거
        clonedElement.style.overflow = 'visible';
        clonedElement.classList.add('overflow-visible');

        // 입력 필드를 텍스트로 변환
        const inputs = clonedElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            const htmlInput = input as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
            const value = htmlInput.value || input.textContent || '';
            const textSpan = document.createElement('span');
            textSpan.textContent = value;
            textSpan.className = 'preview-text inline-block';
            input.parentNode?.replaceChild(textSpan, input);
        });

        // 추가/삭제 버튼 제거
        const buttons = clonedElement.querySelectorAll('button');
        buttons.forEach(button => {
            const buttonText = button.textContent || '';
            if (buttonText.includes('추가') ||
                buttonText.includes('삭제') ||
                buttonText.includes('+') ||
                buttonText.includes('×')) {
                button.remove();
            }
        });

        // 체크박스 처리
        const checkboxes = clonedElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            const htmlCheckbox = checkbox as HTMLInputElement;
            const container = checkbox.closest('div') || checkbox.parentElement;
            if (container) {
                if (htmlCheckbox.checked) {
                    // 체크된 경우: 라벨 텍스트만 표시
                    const label = container.querySelector('label') || checkbox.nextElementSibling;
                    if (label) {
                        container.textContent = label.textContent || '';
                        container.className = 'preview-text inline-block';
                    }
                } else {
                    // 체크되지 않은 경우: 요소 제거
                    container.remove();
                }
            }
        });

        // 테이블 정렬을 위한 스타일 조정
        const tables = clonedElement.querySelectorAll('table');
        tables.forEach(table => {
            table.style.tableLayout = 'fixed';
            table.style.width = '100%';
        });

        return clonedElement;
    };

    // 골프장 데이터 가져오기
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const coursesRef = collection(db, 'courses');
                const snapshot = await getDocs(coursesRef);
                const coursesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Course[];
                setCourses(coursesData);
            } catch (error) {
                console.error('골프장 데이터 가져오기 실패:', error);
            }
        };

        fetchCourses();
    }, []);

    // 숙박 일정 상태 관리
    const [accommodationSchedules, setAccommodationSchedules] = useState([]);

    // 픽업 일정 상태 관리
    const [pickupSchedules, setPickupSchedules] = useState([]);

    // 추가선택사항 상태 관리
    const [additionalOptions, setAdditionalOptions] = useState('');

    // 결제 정보 상태 관리
    const [paymentInfo, setPaymentInfo] = useState({
        downPayment: '',
        balance: '',
        total: ''
    });

    // 입력값 변경 핸들러
    const handleInputChange = (field: string, value: string) => {
        setQuotationData(prev => ({
            ...prev,
            [field]: value
        }));

        // 인원 수가 변경되면 모든 일정의 1인당 가격 재계산
        if (field === 'numberOfPeople') {
            const numberOfPeople = parseInt(value) || 1;

            // 골프 일정 재계산
            setGolfSchedules(prev =>
                prev.map(schedule => {
                    const totalAmount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
                    const perPersonAmount = numberOfPeople > 0 ? Math.floor(totalAmount / numberOfPeople) : 0;
                    return {
                        ...schedule,
                        perPerson: perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : ''
                    };
                })
            );

            // 숙박 일정 재계산
            setAccommodationSchedules(prev =>
                prev.map(schedule => {
                    const totalAmount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
                    const perPersonAmount = numberOfPeople > 0 ? Math.floor(totalAmount / numberOfPeople) : 0;
                    return {
                        ...schedule,
                        perPerson: perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : ''
                    };
                })
            );

            // 픽업 일정 재계산
            setPickupSchedules(prev =>
                prev.map(schedule => {
                    const totalAmount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
                    const perPersonAmount = numberOfPeople > 0 ? Math.floor(totalAmount / numberOfPeople) : 0;
                    return {
                        ...schedule,
                        perPerson: perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : ''
                    };
                })
            );
        }
    };

    // 여행기간 변경 핸들러
    const handleTravelDateChange = (field: string, value: string) => {
        setTravelDates(prev => {
            const newDates = {
                ...prev,
                [field]: value
            };

            // 시작일자와 끝일자가 모두 있으면 여행기간 업데이트
            if (newDates.startDate && newDates.endDate) {
                const startDate = new Date(newDates.startDate);
                const endDate = new Date(newDates.endDate);

                const startFormatted = startDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\./g, '.').replace(/\s/g, '');

                const endFormatted = endDate.toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\./g, '.').replace(/\s/g, '');

                setQuotationData(prev => ({
                    ...prev,
                    travelPeriod: `${startFormatted} - ${endFormatted}`
                }));
            }

            return newDates;
        });
    };

    // 결제 정보 변경 핸들러
    const handlePaymentChange = (field: string, value: string) => {
        setPaymentInfo(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // 골프 총합계 계산
    const calculateGolfTotal = () => {
        const total = golfSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);
        return total > 0 ? `₩${total.toLocaleString()}` : '';
    };

    // 골프 1인당 총합계 계산
    const calculateGolfPerPersonTotal = () => {
        const total = golfSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);
        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 1;
        const perPersonAmount = numberOfPeople > 0 ? Math.floor(total / numberOfPeople) : 0;
        return perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : '';
    };

    // 숙박 총합계 계산
    const calculateAccommodationTotal = () => {
        const total = accommodationSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);
        return total > 0 ? `₩${total.toLocaleString()}` : '';
    };

    // 숙박 1인당 총합계 계산
    const calculateAccommodationPerPersonTotal = () => {
        const total = accommodationSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);
        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 1;
        const perPersonAmount = numberOfPeople > 0 ? Math.floor(total / numberOfPeople) : 0;
        return perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : '';
    };

    // 픽업 총합계 계산
    const calculatePickupTotal = () => {
        const total = pickupSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);
        return total > 0 ? `₩${total.toLocaleString()}` : '';
    };

    // 픽업 1인당 총합계 계산
    const calculatePickupPerPersonTotal = () => {
        const total = pickupSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);
        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 1;
        const perPersonAmount = numberOfPeople > 0 ? Math.floor(total / numberOfPeople) : 0;
        return perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : '';
    };

    // 전체 사전결제 총비용 계산
    const calculateTotalPrepayment = () => {
        const golfTotal = golfSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);

        const accommodationTotal = accommodationSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);

        const pickupTotal = pickupSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);

        const totalAmount = golfTotal + accommodationTotal + pickupTotal;
        return totalAmount > 0 ? `₩${totalAmount.toLocaleString()}` : '₩0';
    };

    // 잔금 계산 (합계 - 계약금)
    const calculateBalance = () => {
        const totalAmount = golfSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0) + accommodationSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0) + pickupSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);

        const downPaymentAmount = parseFloat(paymentInfo.downPayment.replace(/[^\d]/g, '')) || 0;
        const balanceAmount = totalAmount - downPaymentAmount;

        return balanceAmount > 0 ? `₩${balanceAmount.toLocaleString()}` : '₩0';
    };

    // 잔금 마감일 계산 (여행 시작일의 한 달 전)
    const calculateBalanceDueDate = () => {
        if (!travelDates.startDate) {
            return '';
        }

        const startDate = new Date(travelDates.startDate);
        const dueDate = new Date(startDate);
        dueDate.setMonth(dueDate.getMonth() - 1);

        return dueDate.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).replace(/\./g, '.').replace(/\s/g, '');
    };

    // 1인당 요금 계산 (사전결제 총비용 / 인원)
    const calculatePricePerPerson = () => {
        const totalAmount = golfSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0) + accommodationSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0) + pickupSchedules.reduce((sum, schedule) => {
            const amount = parseFloat(schedule.total.replace(/[^\d]/g, '')) || 0;
            return sum + amount;
        }, 0);

        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 1;
        const perPersonAmount = numberOfPeople > 0 ? Math.floor(totalAmount / numberOfPeople) : 0;

        return perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : '₩0';
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

    // 골프 일정 추가
    const addGolfSchedule = () => {
        const newId = golfSchedules.length === 0 ? 1 : Math.max(...golfSchedules.map(schedule => schedule.id)) + 1;
        const newSchedule = {
            id: newId,
            date: '',
            courseName: '',
            holes: '',
            inclusions: [],
            teeOff: '',
            total: '',
            perPerson: ''
        };
        setGolfSchedules(prev => [...prev, newSchedule]);
    };

    // 골프 일정 삭제
    const removeGolfSchedule = (id: number) => {
        setGolfSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    // 골프 일정 필드 변경
    const handleGolfScheduleChange = (id: number, field: string, value: string) => {
        setGolfSchedules(prev =>
            prev.map(schedule => {
                if (schedule.id === id) {
                    const updatedSchedule = { ...schedule, [field]: value };

                    // 골프장명이 변경되면 해당 골프장의 포함사항 자동 설정
                    if (field === 'courseName') {
                        const selectedCourse = courses.find(course => course.name === value);
                        if (selectedCourse && selectedCourse.inclusions) {
                            updatedSchedule.inclusions = selectedCourse.inclusions;
                        } else {
                            updatedSchedule.inclusions = [];
                        }
                    }

                    // 합계가 변경되면 1인당 가격 자동 계산
                    if (field === 'total') {
                        const totalAmount = parseFloat(value.replace(/[^\d]/g, '')) || 0;
                        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 1;
                        const perPersonAmount = numberOfPeople > 0 ? Math.floor(totalAmount / numberOfPeople) : 0;
                        updatedSchedule.perPerson = perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : '';
                    }

                    return updatedSchedule;
                }
                return schedule;
            })
        );
    };

    // 골프 일정 포함사항 체크박스 변경
    const handleGolfInclusionChange = (id: number, inclusion: string, checked: boolean) => {
        setGolfSchedules(prev =>
            prev.map(schedule => {
                if (schedule.id === id) {
                    const currentInclusions = schedule.inclusions || [];
                    let newInclusions;

                    if (checked) {
                        newInclusions = [...currentInclusions, inclusion];
                    } else {
                        newInclusions = currentInclusions.filter(item => item !== inclusion);
                    }

                    return { ...schedule, inclusions: newInclusions };
                }
                return schedule;
            })
        );
    };

    // 숙박 일정 추가
    const addAccommodationSchedule = () => {
        const newId = accommodationSchedules.length === 0 ? 1 : Math.max(...accommodationSchedules.map(schedule => schedule.id)) + 1;
        const newSchedule = {
            id: newId,
            date: '',
            hotelName: '',
            nights: '',
            rooms: '',
            roomType: '',
            meals: '',
            total: '',
            perPerson: ''
        };
        setAccommodationSchedules(prev => [...prev, newSchedule]);
    };

    // 숙박 일정 삭제
    const removeAccommodationSchedule = (id: number) => {
        setAccommodationSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    // 숙박 일정 필드 변경
    const handleAccommodationScheduleChange = (id: number, field: string, value: string) => {
        setAccommodationSchedules(prev =>
            prev.map(schedule => {
                if (schedule.id === id) {
                    const updatedSchedule = { ...schedule, [field]: value };

                    // 합계가 변경되면 1인당 가격 자동 계산
                    if (field === 'total') {
                        const totalAmount = parseFloat(value.replace(/[^\d]/g, '')) || 0;
                        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 1;
                        const perPersonAmount = numberOfPeople > 0 ? Math.floor(totalAmount / numberOfPeople) : 0;
                        updatedSchedule.perPerson = perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : '';
                    }

                    return updatedSchedule;
                }
                return schedule;
            })
        );
    };

    // 픽업 일정 추가
    const addPickupSchedule = () => {
        const newId = pickupSchedules.length === 0 ? 1 : Math.max(...pickupSchedules.map(schedule => schedule.id)) + 1;
        const newSchedule = {
            id: newId,
            date: '',
            destination: '',
            people: '',
            vehicles: '',
            vehicleType: '',
            region: '',
            total: '',
            perPerson: ''
        };
        setPickupSchedules(prev => [...prev, newSchedule]);
    };

    // 픽업 일정 삭제
    const removePickupSchedule = (id: number) => {
        setPickupSchedules(prev => prev.filter(schedule => schedule.id !== id));
    };

    // 픽업 일정 필드 변경
    const handlePickupScheduleChange = (id: number, field: string, value: string) => {
        setPickupSchedules(prev =>
            prev.map(schedule => {
                if (schedule.id === id) {
                    const updatedSchedule = { ...schedule, [field]: value };

                    // 합계가 변경되면 1인당 가격 자동 계산
                    if (field === 'total') {
                        const totalAmount = parseFloat(value.replace(/[^\d]/g, '')) || 0;
                        const numberOfPeople = parseInt(quotationData.numberOfPeople) || 1;
                        const perPersonAmount = numberOfPeople > 0 ? Math.floor(totalAmount / numberOfPeople) : 0;
                        updatedSchedule.perPerson = perPersonAmount > 0 ? `₩${perPersonAmount.toLocaleString()}` : '';
                    }

                    return updatedSchedule;
                }
                return schedule;
            })
        );
    };

    // 견적서 미리보기 함수
    const generatePreview = async () => {
        if (!quotationRef.current) return;

        setIsGeneratingPreview(true);
        setIsPreviewOpen(true);

        try {
            // 정제된 DOM 생성
            const cleanDOM = createCleanPreviewDOM();
            if (!cleanDOM) {
                throw new Error('DOM 복제에 실패했습니다.');
            }

            // 임시로 body에 추가 (렌더링을 위해)
            document.body.appendChild(cleanDOM);
            cleanDOM.style.position = 'absolute';
            cleanDOM.style.left = '-9999px';
            cleanDOM.style.top = '0';
            cleanDOM.style.zIndex = '-1';

            // 이미지 생성
            const dataUrl = await toPng(cleanDOM, {
                quality: 1.0, // 최고 품질
                pixelRatio: 2, // 고해상도 (2배)
                backgroundColor: '#ffffff',
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });

            // 임시 DOM 제거
            document.body.removeChild(cleanDOM);

            setPreviewUrl(dataUrl);
        } catch (error) {
            console.error('미리보기 생성 실패:', error);
            alert('미리보기 생성에 실패했습니다.');
            setIsPreviewOpen(false);
        } finally {
            setIsGeneratingPreview(false);
        }
    };

    // 견적서 이미지 다운로드 함수
    const downloadQuotationAsImage = async () => {
        if (!quotationRef.current) return;

        try {
            // 정제된 DOM 생성
            const cleanDOM = createCleanPreviewDOM();
            if (!cleanDOM) {
                throw new Error('DOM 복제에 실패했습니다.');
            }

            // 임시로 body에 추가 (렌더링을 위해)
            document.body.appendChild(cleanDOM);
            cleanDOM.style.position = 'absolute';
            cleanDOM.style.left = '-9999px';
            cleanDOM.style.top = '0';
            cleanDOM.style.zIndex = '-1';

            // 이미지 생성
            const dataUrl = await toPng(cleanDOM, {
                quality: 1.0, // 최고 품질
                pixelRatio: 2, // 고해상도 (2배)
                backgroundColor: '#ffffff',
                style: {
                    transform: 'scale(1)',
                    transformOrigin: 'top left'
                }
            });

            // 임시 DOM 제거
            document.body.removeChild(cleanDOM);

            const link = document.createElement('a');
            link.download = `견적서_${quotationData.customerName || '고객'}_${new Date().toISOString().split('T')[0]}.png`;
            link.href = dataUrl;
            link.click();
        } catch (error) {
            console.error('이미지 다운로드 실패:', error);
            alert('이미지 다운로드에 실패했습니다.');
        }
    };

    // 미리보기에서 다운로드
    const downloadFromPreview = () => {
        if (previewUrl) {
            const link = document.createElement('a');
            link.download = `견적서_${quotationData.customerName || '고객'}_${new Date().toISOString().split('T')[0]}.png`;
            link.href = previewUrl;
            link.click();
        }
    };


    // 권한 검사 - 수퍼관리자와 사이트관리자만 접근 가능
    if (!loading && user?.role !== 'super_admin' && user?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                <div>
                    <h1 className="text-3xl font-semibold text-gray-800">관리자 도구</h1>
                    <p className="text-gray-600 mt-1">편의 기능</p>
                </div>
                <div className="flex gap-3">
                    <Button
                        onClick={generatePreview}
                        variant="outline"
                        className="flex items-center gap-2"
                    >
                        <Eye className="h-4 w-4" />
                        미리보기
                    </Button>
                    <Button
                        onClick={downloadQuotationAsImage}
                        variant="default"
                        className="flex items-center gap-2"
                    >
                        <Download className="h-4 w-4" />
                        이미지 다운로드
                    </Button>
                </div>
            </div>

            <div ref={quotationRef} className="bg-white rounded-lg shadow-sm p-8">
                <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-200">
                    <div>
                        <div className="text-2xl font-bold text-gray-900">오분골프</div>
                        <div className="text-gray-600">해외 골프장 실시간 예약</div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">견적서</h2>
                    </div>
                </div>

                <div className="space-y-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">고객명:</span>
                            <input
                                type="text"
                                value={quotationData.customerName}
                                onChange={(e) => handleInputChange('customerName', e.target.value)}
                                placeholder="손성영"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-gray-600">님</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">여행지:</span>
                            <input
                                type="text"
                                value={quotationData.destination}
                                onChange={(e) => handleInputChange('destination', e.target.value)}
                                placeholder="태국/치앙마이"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">여행기간:</span>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={travelDates.startDate}
                                    onChange={(e) => handleTravelDateChange('startDate', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <span className="text-gray-500">~</span>
                                <input
                                    type="date"
                                    value={travelDates.endDate}
                                    onChange={(e) => handleTravelDateChange('endDate', e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">인원:</span>
                            <input
                                type="text"
                                value={quotationData.numberOfPeople}
                                onChange={(e) => handleInputChange('numberOfPeople', e.target.value)}
                                placeholder="9"
                                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <span className="text-gray-600">명</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">포함사항:</span>
                        <span className="text-gray-900">{generateInclusions()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">1인당 요금:</span>
                        <span className="text-lg font-semibold text-blue-600">{calculatePricePerPerson()} (KRW)</span>
                    </div>
                </div>

                {/* 골프 일정 */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">골프 (사전결제)</h3>
                        <button
                            onClick={addGolfSchedule}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            + 추가
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">골프장명</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">홀수(H)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">포함사항</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">TEE-OFF</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">합계</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사전결제(1인)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">삭제</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {golfSchedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.date}
                                                onChange={(e) => handleGolfScheduleChange(schedule.id, 'date', e.target.value)}
                                                placeholder="1/8"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <GolfCourseAutocomplete
                                                value={schedule.courseName}
                                                onChange={(value) => handleGolfScheduleChange(schedule.id, 'courseName', value)}
                                                placeholder="노스힐 골프 클럽 치앙마이"
                                                className="w-full"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.holes}
                                                onChange={(e) => handleGolfScheduleChange(schedule.id, 'holes', e.target.value)}
                                                placeholder="18"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {inclusionOptions.map((option) => (
                                                    <label key={option} className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={schedule.inclusions?.includes(option) || false}
                                                            onChange={(e) => handleGolfInclusionChange(schedule.id, option, e.target.checked)}
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <span className="ml-2 text-sm text-gray-700">{option}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.teeOff}
                                                onChange={(e) => handleGolfScheduleChange(schedule.id, 'teeOff', e.target.value)}
                                                placeholder="오전"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.total}
                                                onChange={(e) => handleGolfScheduleChange(schedule.id, 'total', e.target.value)}
                                                placeholder="₩1,036,000"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {schedule.perPerson}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => removeGolfSchedule(schedule.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={5} className="px-6 py-3 text-sm font-medium text-gray-900">총 합계(KRW)</td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{calculateGolfTotal()}</td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{calculateGolfPerPersonTotal()}</td>
                                    <td className="px-6 py-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* 숙박 일정 */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">숙박 (사전결제) 실시간 최저가 기준</h3>
                        <button
                            onClick={addAccommodationSchedule}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            + 추가
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">호텔명</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">박수</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">객실수</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">객실타입</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">식사포함여부</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">합계</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사전결제(1인)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">삭제</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {accommodationSchedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.date}
                                                onChange={(e) => handleAccommodationScheduleChange(schedule.id, 'date', e.target.value)}
                                                placeholder="2026.1.7-1.11"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.hotelName}
                                                onChange={(e) => handleAccommodationScheduleChange(schedule.id, 'hotelName', e.target.value)}
                                                placeholder="트래블로지 님만"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.nights}
                                                onChange={(e) => handleAccommodationScheduleChange(schedule.id, 'nights', e.target.value)}
                                                placeholder="4"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.rooms}
                                                onChange={(e) => handleAccommodationScheduleChange(schedule.id, 'rooms', e.target.value)}
                                                placeholder="9"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.roomType}
                                                onChange={(e) => handleAccommodationScheduleChange(schedule.id, 'roomType', e.target.value)}
                                                placeholder="슈페리어룸"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.meals}
                                                onChange={(e) => handleAccommodationScheduleChange(schedule.id, 'meals', e.target.value)}
                                                placeholder="조식"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.total}
                                                onChange={(e) => handleAccommodationScheduleChange(schedule.id, 'total', e.target.value)}
                                                placeholder="₩4,629,000"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {schedule.perPerson}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => removeAccommodationSchedule(schedule.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={6} className="px-6 py-3 text-sm font-medium text-gray-900">총 합계(KRW)</td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{calculateAccommodationTotal()}</td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{calculateAccommodationPerPersonTotal()}</td>
                                    <td className="px-6 py-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* 픽업 일정 */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">픽업 (사전결제)</h3>
                        <button
                            onClick={addPickupSchedule}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                            + 추가
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700">픽업 항공 정보</h4>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700">샌딩 항공 정보</h4>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-700">픽업 숙소명</h4>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">행선지</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">인원</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">차량수</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">차종</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">지역</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">합계</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">사전결제(1인)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">삭제</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {pickupSchedules.map((schedule) => (
                                    <tr key={schedule.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.date}
                                                onChange={(e) => handlePickupScheduleChange(schedule.id, 'date', e.target.value)}
                                                placeholder="1/7"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={schedule.destination}
                                                onChange={(e) => handlePickupScheduleChange(schedule.id, 'destination', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">선택하세요</option>
                                                <option value="공항 > 호텔">공항 &gt; 호텔</option>
                                                <option value="호텔 > 골프장 > 호텔">호텔 &gt; 골프장 &gt; 호텔</option>
                                                <option value="일일렌탈 10시간">일일렌탈 10시간</option>
                                                <option value="일일렌탈 12시간">일일렌탈 12시간</option>
                                                <option value="호텔 > 공항">호텔 &gt; 공항</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.people}
                                                onChange={(e) => handlePickupScheduleChange(schedule.id, 'people', e.target.value)}
                                                placeholder="9"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.vehicles}
                                                onChange={(e) => handlePickupScheduleChange(schedule.id, 'vehicles', e.target.value)}
                                                placeholder="2"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <select
                                                value={schedule.vehicleType}
                                                onChange={(e) => handlePickupScheduleChange(schedule.id, 'vehicleType', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value="">선택하세요</option>
                                                <option value="SUV">SUV</option>
                                                <option value="승용차">승용차</option>
                                                <option value="밴">밴</option>
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.region}
                                                onChange={(e) => handlePickupScheduleChange(schedule.id, 'region', e.target.value)}
                                                placeholder="치앙마이"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input
                                                type="text"
                                                value={schedule.total}
                                                onChange={(e) => handlePickupScheduleChange(schedule.id, 'total', e.target.value)}
                                                placeholder="₩1,594,000"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {schedule.perPerson}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button
                                                onClick={() => removePickupSchedule(schedule.id)}
                                                className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                            >
                                                삭제
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={6} className="px-6 py-3 text-sm font-medium text-gray-900">총 합계(KRW)</td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{calculatePickupTotal()}</td>
                                    <td className="px-6 py-3 text-sm font-semibold text-gray-900">{calculatePickupPerPersonTotal()}</td>
                                    <td className="px-6 py-3"></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>


                {/* 안내사항 */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">안내사항</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>일정표의 금액은 요금표에 따라 변경될 수 있습니다.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>모든 일정에는 차량이 포함되어 있습니다.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>비로 인한 취소는 당일 현장 폐쇄 시에만 처리됩니다.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>행사일 20일 전까지 취소/환불이 가능합니다.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-blue-600 mr-2">•</span>
                            <span>티타임 확인은 추후 예정입니다. 골프장 사정으로 토너먼트 행사가 있을 경우 자동 취소될 수 있으니 참고해 주세요.</span>
                        </li>
                    </ul>
                </div>

                {/* 추가선택사항 */}
                <div className="mb-8">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">추가선택사항</h3>
                    <div>
                        <textarea
                            value={additionalOptions}
                            onChange={(e) => setAdditionalOptions(e.target.value)}
                            placeholder="추가 선택사항을 입력하세요..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={4}
                        />
                    </div>
                </div>


                {/* 결제 정보 */}
                <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="text-center mb-6">
                        <div className="text-sm font-medium text-gray-700 mb-2">사전결제 총비용(KRW)</div>
                        <div className="text-3xl font-bold text-blue-600">{calculateTotalPrepayment()}</div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <div className="text-sm font-medium text-gray-700">계약금</div>
                            <div className="w-32">
                                <input
                                    type="text"
                                    value={paymentInfo.downPayment}
                                    onChange={(e) => handlePaymentChange('downPayment', e.target.value)}
                                    placeholder="₩0"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                                />
                            </div>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-gray-200">
                            <div className="text-sm font-medium text-gray-700">
                                잔금 {calculateBalanceDueDate() && `(${calculateBalanceDueDate()}까지)`}
                            </div>
                            <div className="text-lg font-semibold text-gray-900">{calculateBalance()}</div>
                        </div>
                        <div className="flex justify-between items-center py-2 bg-blue-50 px-4 rounded-md">
                            <div className="text-lg font-semibold text-gray-900">합계</div>
                            <div className="text-xl font-bold text-blue-600">{calculateTotalPrepayment()}</div>
                        </div>
                    </div>
                    <div className="mt-6 space-y-4">
                        <div className="bg-white p-4 rounded-lg border">
                            <div className="text-sm font-medium text-gray-700 mb-3">입금하실 곳:</div>
                            <div className="space-y-1 text-sm text-gray-600">
                                <div>은행: 우리은행</div>
                                <div>계좌번호: 1005-304-415722</div>
                                <div>예금주: (주)엠오엠트래블</div>
                            </div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <div className="space-y-1 text-sm text-yellow-800">
                                <div className="flex items-start">
                                    <span className="text-yellow-600 mr-2">•</span>
                                    <span>현지결제 비용은 실시간 환율에 따라 변동될 수 있습니다.</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-yellow-600 mr-2">•</span>
                                    <span>픽업 차량 이용 시 실제 거리에 따라 측정되므로 골프장에 따라 변동될 수 있습니다.</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="text-yellow-600 mr-2">•</span>
                                    <span>현지결제 비용은 현지에서 결제되는 점 참고해 주세요.</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* 미리보기 모달 */}
            <PreviewModal
                isOpen={isPreviewOpen}
                onClose={() => {
                    setIsPreviewOpen(false);
                    setPreviewUrl(null);
                }}
                onDownload={downloadFromPreview}
                previewUrl={previewUrl}
                isGenerating={isGeneratingPreview}
                fileName={`견적서_${quotationData.customerName || '고객'}_${new Date().toISOString().split('T')[0]}.png`}
            />
        </div>
    );
}

