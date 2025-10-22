"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { db } from '../../../../lib/firebase';
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import Calendar from '../components/Calendar';
import TeeTimeModal from '../components/TeeTimeModal';
import { TeeTime } from '@/app/(admin)/admin/tee-times/types';
import { Course, CourseWithTranslations } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function TeeTimeManagement() {
    const { user, isAdmin } = useAuth();
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [courses, setCourses] = useState<CourseWithTranslations[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    // 골프장 목록 가져오기
    const fetchCourses = async () => {
        try {
            console.log('fetchCourses 시작, user:', user);
            console.log('user.courseId:', user?.courseId);
            console.log('user.role:', user?.role);
            setLoading(true);
            let coursesQuery;

            if (user?.role === 'super_admin' || user?.role === 'site_admin') {
                // 수퍼관리자와 사이트 관리자는 모든 골프장 조회
                coursesQuery = query(collection(db, 'courses'), where('isActive', '==', true));
            } else {
                // 골프장 관리자는 본인 골프장만 조회
                // adminIds 배열에 사용자 ID가 있거나, 사용자의 courseId와 일치하는 골프장 조회
                if (user?.courseId) {
                    // 사용자의 courseId로 직접 조회
                    coursesQuery = query(
                        collection(db, 'courses'),
                        where('id', '==', user.courseId),
                        where('isActive', '==', true)
                    );
                } else {
                    // adminIds 배열로 조회 (기존 방식)
                    coursesQuery = query(
                        collection(db, 'courses'),
                        where('adminIds', 'array-contains', user?.id || ''),
                        where('isActive', '==', true)
                    );
                }
            }

            const snapshot = await getDocs(coursesQuery);
            const coursesData = snapshot.docs.map(doc => {
                const data = doc.data() as Omit<CourseWithTranslations, 'id'>;
                return {
                    id: doc.id,
                    ...data
                };
            });

            console.log('조회된 골프장 개수:', coursesData.length);
            console.log('조회된 골프장 목록:', coursesData.map(c => ({ id: c.id, name: c.name || '이름 없음' })));
            setCourses(coursesData);

            // 골프장이 하나만 있으면 자동 선택
            if (coursesData.length === 1) {
                setSelectedCourseId(coursesData[0].id);
            }
        } catch (error) {
            console.error('골프장 목록 가져오기 실패:', error);
            alert('골프장 정보를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침해주세요.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchCourses();
        } else {
            setLoading(false);
        }
    }, [user]);

    // 티타임 데이터 가져오기
    const fetchTeeTimes = async (courseId: string) => {
        try {
            console.log('fetchTeeTimes 시작, courseId:', courseId);
            console.log('Firestore db 객체:', db);

            // 먼저 전체 컬렉션에 접근 가능한지 테스트
            try {
                const testRef = collection(db, 'teeTimes');
                const testSnapshot = await getDocs(testRef);
                console.log('전체 컬렉션 접근 테스트 성공, 문서 개수:', testSnapshot.docs.length);
            } catch (testError) {
                console.error('전체 컬렉션 접근 테스트 실패:', testError);
                throw new Error(`Firestore 접근 권한 오류: ${testError instanceof Error ? testError.message : String(testError)}`);
            }

            const teeTimesRef = collection(db, 'teeTimes');
            console.log('teeTimes 컬렉션 참조:', teeTimesRef);

            const teeTimesQuery = query(
                teeTimesRef,
                where('courseId', '==', courseId)
            );
            console.log('쿼리 객체:', teeTimesQuery);

            const snapshot = await getDocs(teeTimesQuery);
            console.log('스냅샷:', snapshot);
            console.log('문서 개수:', snapshot.docs.length);

            const teeTimesData = snapshot.docs.map(doc => {
                const data = doc.data();
                console.log('문서 데이터:', doc.id, data);
                return {
                    id: doc.id,
                    ...data
                } as TeeTime;
            });

            // 클라이언트 사이드에서 정렬
            teeTimesData.sort((a, b) => {
                if (a.date !== b.date) {
                    return a.date.localeCompare(b.date);
                }
                return a.time.localeCompare(b.time);
            });

            console.log('가져온 티타임 데이터:', teeTimesData);
            setTeeTimes(teeTimesData);
        } catch (error) {
            console.error('티타임 데이터 가져오기 실패:', error);
            console.error('오류 상세:', error);
            console.error('오류 스택:', error instanceof Error ? error.stack : 'No stack trace');
            alert(`티타임 정보를 불러오는 중 오류가 발생했습니다.\n오류: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    useEffect(() => {
        if (selectedCourseId) {
            fetchTeeTimes(selectedCourseId);
        } else {
            setTeeTimes([]);
        }
    }, [selectedCourseId]);

    const handleDateClick = (date: string) => {
        if (!selectedCourseId) {
            alert('골프장을 먼저 선택해주세요.');
            return;
        }

        // 지나간 날짜인지 확인
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        if (targetDate < today) {
            alert('지나간 날짜는 선택할 수 없습니다. 오늘 이후의 날짜를 선택해주세요.');
            return;
        }

        setSelectedDate(date);
        setIsModalOpen(true);
    };

    const handleSaveTeeTime = async (teeTimeData: Omit<TeeTime, 'id' | 'courseId' | 'courseName'>) => {
        try {
            const selectedCourse = courses.find(c => c.id === selectedCourseId);
            if (!selectedCourse) {
                alert('선택된 골프장 정보를 찾을 수 없습니다.');
                return;
            }

            const teeTimeDoc = {
                courseId: selectedCourseId,
                courseName: selectedCourse.name || '이름 없음',
                date: teeTimeData.date,
                time: teeTimeData.time,
                availableSlots: teeTimeData.availableSlots,
                agentPrice: teeTimeData.agentPrice,
                note: teeTimeData.note || '',
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: user?.id || null
            };

            console.log('저장할 티타임 데이터:', teeTimeDoc);

            const docRef = await addDoc(collection(db, 'teeTimes'), teeTimeDoc);
            console.log('티타임 저장 완료, ID:', docRef.id);

            // 로컬 상태 업데이트
            const newTeeTime: TeeTime = {
                id: docRef.id,
                ...teeTimeDoc
            };
            setTeeTimes(prev => [...prev, newTeeTime]);
            setIsModalOpen(false);

            alert('티타임이 성공적으로 등록되었습니다.');
        } catch (error) {
            console.error('티타임 저장 실패:', error);
            alert('티타임 등록 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleCourseChange = (courseId: string) => {
        setSelectedCourseId(courseId);
        setTeeTimes([]); // 골프장 변경 시 티타임 목록 초기화
    };

    const handleUpdateTeeTime = async (id: string, updatedData: Partial<TeeTime>) => {
        try {
            const updateDocData = {
                ...updatedData,
                updatedAt: serverTimestamp()
            };

            console.log('수정할 티타임 데이터:', updateDocData);

            await updateDoc(doc(db, 'teeTimes', id), updateDocData);
            console.log('티타임 수정 완료, ID:', id);

            // 로컬 상태 업데이트
            setTeeTimes(prev =>
                prev.map(teeTime =>
                    teeTime.id === id ? { ...teeTime, ...updatedData } : teeTime
                )
            );

            alert('티타임이 성공적으로 수정되었습니다.');
        } catch (error) {
            console.error('티타임 수정 실패:', error);
            alert('티타임 수정 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const handleDeleteTeeTime = async (id: string) => {
        try {
            if (!confirm('정말로 이 티타임을 삭제하시겠습니까?')) {
                return;
            }

            console.log('삭제할 티타임 ID:', id);

            await deleteDoc(doc(db, 'teeTimes', id));
            console.log('티타임 삭제 완료, ID:', id);

            // 로컬 상태 업데이트
            setTeeTimes(prev => prev.filter(teeTime => teeTime.id !== id));

            alert('티타임이 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('티타임 삭제 실패:', error);
            alert('티타임 삭제 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    };

    const getTeeTimesForDate = (date: string) => {
        return teeTimes.filter(teeTime => teeTime.date === date);
    };

    if (!user) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-800">티타임 관리</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <i className="fas fa-user-times text-6xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">로그인이 필요합니다</h3>
                    <p className="text-gray-500">티타임 관리를 위해 로그인해주세요.</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-800">티타임 관리</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">골프장 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-800">티타임 관리</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <i className="fas fa-golf-ball text-6xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">관리할 수 있는 골프장이 없습니다</h3>
                    <p className="text-gray-500">골프장 관리자 권한이 필요하거나 활성화된 골프장이 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">티타임 관리</h1>
            </div>

            {/* 골프장 선택 필터 - 수퍼관리자와 사이트 관리자만 표시 */}
            {(user?.role === 'super_admin' || user?.role === 'site_admin') && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">골프장 선택</h3>
                        <p className="text-gray-600 text-sm">관리할 골프장을 선택하세요</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        <select
                            value={selectedCourseId}
                            onChange={(e) => handleCourseChange(e.target.value)}
                            className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">골프장을 선택하세요</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name || '이름 없음'} ({course.cityName})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {selectedCourseId && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-semibold text-gray-800">
                            {courses.find(c => c.id === selectedCourseId)?.name || '이름 없음'} - 티타임 등록 캘린더
                        </h2>
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                                variant="outline"
                                size="sm"
                            >
                                <i className="fas fa-chevron-left"></i>
                            </Button>
                            <span className="text-lg font-medium text-gray-700 min-w-[120px] text-center">
                                {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                            </span>
                            <Button
                                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                                variant="outline"
                                size="sm"
                            >
                                <i className="fas fa-chevron-right"></i>
                            </Button>
                        </div>
                    </div>

                    <Calendar
                        currentMonth={currentMonth}
                        onDateClick={handleDateClick}
                        teeTimes={teeTimes}
                    />
                </div>
            )}

            {!selectedCourseId && (user?.role === 'super_admin' || user?.role === 'site_admin') && (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <i className="fas fa-calendar-alt text-6xl text-gray-400 mb-4"></i>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">골프장을 선택해주세요</h3>
                    <p className="text-gray-500">티타임을 관리할 골프장을 위에서 선택하시면 캘린더가 표시됩니다.</p>
                </div>
            )}

            {isModalOpen && (
                <TeeTimeModal
                    date={selectedDate}
                    onSave={handleSaveTeeTime}
                    onClose={() => setIsModalOpen(false)}
                    existingTeeTimes={getTeeTimesForDate(selectedDate)}
                    onUpdate={handleUpdateTeeTime}
                    onDelete={handleDeleteTeeTime}
                    courseName={courses.find(c => c.id === selectedCourseId)?.name || '이름 없음'}
                />
            )}
        </div>
    );
}
