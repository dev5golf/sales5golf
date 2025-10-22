"use client";
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Course, CourseWithTranslations } from '@/types';
import { TeeTime } from '@/app/(admin)/admin/tee-times/types';
import {
    formatTime,
    formatRelativeDate,
    getAvailabilityText,
    getAvailabilityClass,
    isDatePast
} from '../../../lib/utils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function DetailContent() {
    const params = useSearchParams();
    const courseId = params.get('course');
    const booking = params.get('booking') === 'true';
    const [status, setStatus] = useState<'idle' | 'confirm' | 'done'>('idle');
    const [course, setCourse] = useState<CourseWithTranslations | null>(null);
    const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    useEffect(() => {
        if (booking) setStatus('confirm');
    }, [booking]);

    useEffect(() => {
        if (courseId) {
            fetchCourseAndTeeTimes();
        }
    }, [courseId]);

    const fetchCourseAndTeeTimes = async () => {
        try {
            setLoading(true);

            // 골프장 정보 가져오기
            if (db && courseId) {
                const courseDoc = await getDoc(doc(db, 'courses', courseId));
                if (courseDoc.exists()) {
                    const courseData = { id: courseDoc.id, ...courseDoc.data() } as CourseWithTranslations;
                    setCourse(courseData);
                }

                // 티타임 정보 가져오기
                const teeTimesQuery = query(
                    collection(db, 'teeTimes'),
                    where('courseId', '==', courseId)
                );
                const teeTimesSnapshot = await getDocs(teeTimesQuery);
                const teeTimesData = teeTimesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TeeTime[];

                // 지나간 날짜 필터링
                const futureTeeTimes = teeTimesData.filter(teeTime => !isDatePast(teeTime.date));

                setTeeTimes(futureTeeTimes);
            } else {
                // Firebase 연결이 안된 경우 더미 데이터 사용
                setCourse({
                    id: 'dummy1',
                    name: '더미 골프장',
                    countryId: 'KR',
                    provinceId: 'KR_001',
                    cityId: 'KR_001_001',
                    countryName: '대한민국',
                    provinceName: '서울',
                    cityName: '강남구',
                    adminIds: [],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: null
                });
                setTeeTimes(generateDummyTeeTimes());
            }
        } catch (error) {
            console.error('골프장 및 티타임 데이터 가져오기 실패:', error);
            // 에러 시 더미 데이터 사용
            setCourse({
                id: 'dummy1',
                name: '더미 골프장',
                countryId: 'KR',
                provinceId: 'KR_001',
                cityId: 'KR_001_001',
                countryName: '대한민국',
                provinceName: '서울',
                cityName: '강남구',
                adminIds: [],
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
                createdBy: null
            });
            setTeeTimes(generateDummyTeeTimes());
        } finally {
            setLoading(false);
        }
    };

    const generateDummyTeeTimes = (): TeeTime[] => {
        const dummyTeeTimes: TeeTime[] = [];
        const today = new Date();

        // 다음 7일간의 티타임 생성
        for (let i = 0; i < 7; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];

            // 하루에 6-8개의 티타임 생성
            const timesPerDay = Math.floor(Math.random() * 3) + 6;
            for (let j = 0; j < timesPerDay; j++) {
                const hour = 6 + Math.floor(Math.random() * 12); // 6시~17시
                const minute = Math.random() < 0.5 ? 0 : 30;
                const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

                dummyTeeTimes.push({
                    id: `dummy-${dateStr}-${j}`,
                    date: dateStr,
                    time: timeStr,
                    availableSlots: Math.floor(Math.random() * 4) + 1,
                    agentPrice: Math.floor(Math.random() * 100000) + 100000,
                    note: '',
                    courseId: courseId || 'dummy1',
                    courseName: '더미 골프장',
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: null
                });
            }
        }

        return dummyTeeTimes;
    };



    if (loading) {
        return (
            <main className="main">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>골프장 정보를 불러오는 중...</p>
                </div>
            </main>
        );
    }

    if (!course) {
        return (
            <main className="main">
                <div className="no-results">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h3>골프장을 찾을 수 없습니다</h3>
                    <p>요청하신 골프장 정보를 찾을 수 없습니다.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="main">
            <section className="page-header" style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                <div className="page-header-overlay"></div>
                <div className="container">
                    <div className="page-header-content">
                        <h1 className="page-title">{course.name || '골프장'}</h1>
                        <p className="page-subtitle">{course.provinceName} {course.cityName}</p>
                    </div>
                </div>
            </section>

            <section className="filters-section">
                <div className="container">
                    <div className="filters-container">
                        <div className="filter-group">
                            <label className="filter-label">날짜</label>
                            <input
                                type="date"
                                className="filter-input"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">플레이어</label>
                            <select className="filter-select">
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label className="filter-label">홀</label>
                            <select className="filter-select">
                                <option>9</option>
                                <option>18</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>

            <section className="search-button-section">
                <div className="search-button-container">
                    <button className="btn btn-primary filter-btn">검색</button>
                </div>
            </section>

            <section className="tee-times-section">
                <div className="container">
                    {teeTimes.length === 0 ? (
                        <div className="no-results">
                            <i className="fas fa-calendar-times"></i>
                            <h3>예약 가능한 티타임이 없습니다</h3>
                            <p>선택하신 날짜에는 예약 가능한 티타임이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="tee-times-grid">
                            {teeTimes.map((teeTime) => (
                                <Card key={teeTime.id} className="tee-time-card">
                                    <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white">
                                        <div className="time-info">
                                            <span className="time">{formatTime(teeTime.time)}</span>
                                            <span className="date">{formatRelativeDate(teeTime.date)}</span>
                                        </div>
                                        {Math.random() < 0.3 && <div className="hot-deal-badge">HOT DEAL</div>}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="price-info">
                                            <span className="current-price">{teeTime.agentPrice.toLocaleString()}원</span>
                                            {Math.random() < 0.5 && (
                                                <>
                                                    <span className="original-price">
                                                        {Math.floor(teeTime.agentPrice * 1.2).toLocaleString()}원
                                                    </span>
                                                    <span className="discount">20% 할인</span>
                                                </>
                                            )}
                                        </div>
                                        <div className="course-details">
                                            <span className="holes">18 holes</span>
                                            <span className="players">1-4 players</span>
                                        </div>
                                        <div className="booking-info">
                                            <span className={`availability ${getAvailabilityClass(teeTime.availableSlots)}`}>
                                                {getAvailabilityText(teeTime.availableSlots)}
                                            </span>
                                            <span className="cancellation">무료 취소</span>
                                        </div>
                                    </CardContent>
                                    <CardFooter>
                                        <Button className="flex-1" onClick={() => setStatus('done')}>
                                            예약하기
                                        </Button>
                                        <Button variant="outline" onClick={() => alert('상세 정보는 골프장에 문의하세요.')}>
                                            상세보기
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default function DetailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DetailContent />
        </Suspense>
    );
}


