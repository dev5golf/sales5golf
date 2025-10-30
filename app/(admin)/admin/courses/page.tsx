"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, where, deleteDoc, doc, limit, QueryDocumentSnapshot, startAfter, DocumentData, getCountFromServer } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Link from 'next/link';
import { CourseWithTranslations, CourseTranslation } from '@/types';
import CourseModal from './components/CourseModal';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCountries, useCities } from '@/hooks/useRegions';
import { getInclusionName } from '@/constants/courseConstants';
import '../../admin.css';

export default function CoursesPage() {
    const { user: currentUser, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<CourseWithTranslations[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [cityFilter, setCityFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // 페이지네이션 상태
    const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [pageHistory, setPageHistory] = useState<QueryDocumentSnapshot<DocumentData>[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalCourses, setTotalCourses] = useState(0);
    const coursesPerPage = 10;

    // Custom hooks 사용
    const { countries } = useCountries();
    const { cities } = useCities(countryFilter !== 'all' ? countryFilter : undefined);

    // 모달 상태
    const [selectedCourse, setSelectedCourse] = useState<CourseWithTranslations | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<CourseWithTranslations | null>(null);

    // 권한 검사 - 수퍼관리자와 사이트관리자만 접근 가능
    if (!authLoading && currentUser?.role !== 'super_admin' && currentUser?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    useEffect(() => {
        resetPagination();
        fetchCourses(true);
    }, [countryFilter, cityFilter, statusFilter]);

    // 국가 필터 변경 시 도시 필터 초기화
    useEffect(() => {
        if (countryFilter === 'all') {
            setCityFilter('all');
        }
    }, [countryFilter]);

    // 페이지네이션 초기화
    const resetPagination = () => {
        setLastDoc(null);
        setHasNextPage(false);
        setHasPrevPage(false);
        setPageHistory([]);
        setCurrentPage(0);
        setCourses([]);
        setTotalCourses(0);
    };

    // 총 골프장 개수 가져오기 (필터 조건 반영)
    const fetchTotalCount = async () => {
        try {
            let countQuery = query(collection(db, 'courses'));

            // 권한에 따른 필터링
            if (!isSuperAdmin && currentUser?.role === 'course_admin') {
                countQuery = query(countQuery, where('adminIds', 'array-contains', currentUser.id));
            }

            // 상태 필터
            if (statusFilter !== 'all') {
                const isActive = statusFilter === 'active';
                countQuery = query(countQuery, where('isActive', '==', isActive));
            }

            // 국가 필터
            if (countryFilter !== 'all') {
                countQuery = query(countQuery, where('countryId', '==', countryFilter));
            }

            // 도시 필터
            if (countryFilter !== 'all' && cityFilter !== 'all') {
                countQuery = query(countQuery, where('cityId', '==', cityFilter));
            }

            const countSnapshot = await getCountFromServer(countQuery);
            setTotalCourses(countSnapshot.data().count);
        } catch (error) {
            console.error('총 골프장 개수 가져오기 실패:', error);
        }
    };

    const fetchCourses = async (reset: boolean = false) => {
        try {
            setLoading(true);

            // 총 개수 업데이트 (필터가 변경되었거나 reset일 때)
            if (reset) {
                await fetchTotalCount();
            }

            // 쿼리 구성 - 복합 인덱스 사용으로 필터가 있어도 orderBy 사용 가능
            // 필드 순서: where 조건들이 먼저, orderBy는 마지막에
            let q = query(collection(db, 'courses'));

            // 권한에 따른 필터링
            if (!isSuperAdmin && currentUser?.role === 'course_admin') {
                q = query(q, where('adminIds', 'array-contains', currentUser.id));
            }

            // 상태 필터 (서버 사이드)
            if (statusFilter !== 'all') {
                const isActive = statusFilter === 'active';
                q = query(q, where('isActive', '==', isActive));
            }

            // 국가 필터 (서버 사이드)
            if (countryFilter !== 'all') {
                q = query(q, where('countryId', '==', countryFilter));
            }

            // 도시 필터 (서버 사이드, 국가 필터가 있을 때만)
            if (countryFilter !== 'all' && cityFilter !== 'all') {
                q = query(q, where('cityId', '==', cityFilter));
            }

            // orderBy는 항상 마지막에 추가 (복합 인덱스 사용)
            q = query(q, orderBy('createdAt', 'desc'), limit(11));

            // 페이지네이션: reset이 false이고 lastDoc이 있을 때
            if (!reset && lastDoc) {
                q = query(q, startAfter(lastDoc));
            }

            const snapshot = await getDocs(q);

            // 다음 페이지 여부 확인 (11개 가져왔는데 11개면 다음 페이지 있음)
            const hasMore = snapshot.docs.length > 10;
            setHasNextPage(hasMore);

            // 실제로 사용할 문서는 10개만
            const docsToProcess = hasMore ? snapshot.docs.slice(0, 10) : snapshot.docs;

            // 각 골프장의 번역 데이터도 함께 가져오기
            const courseDataPromises = docsToProcess.map(async (courseDoc) => {
                const translationsSnapshot = await getDocs(
                    collection(db, 'courses', courseDoc.id, 'translations')
                );

                const translations: { [key: string]: CourseTranslation } = {};
                translationsSnapshot.docs.forEach(transDoc => {
                    translations[transDoc.id] = transDoc.data() as CourseTranslation;
                });

                return {
                    id: courseDoc.id,
                    ...courseDoc.data(),
                    translations,
                    name: translations['ko']?.name || translations['en']?.name || courseDoc.id
                } as CourseWithTranslations;
            });

            const courseData = await Promise.all(courseDataPromises);
            setCourses(courseData);

            // 마지막 문서 저장 (다음 페이지를 위해)
            if (docsToProcess.length > 0) {
                const lastDocument = docsToProcess[docsToProcess.length - 1];
                setLastDoc(lastDocument);
            }

        } catch (error: any) {
            console.error('골프장 목록 가져오기 실패:', error);

            // Firestore 인덱스 오류인 경우 인덱스 생성 링크 표시
            if (error?.code === 'failed-precondition' && error?.message?.includes('index')) {
                const indexUrl = error.message.match(/https:\/\/console\.firebase\.google\.com[^\s\)]+/)?.[0];
                if (indexUrl) {
                    console.log('📌 인덱스 생성 링크:', indexUrl);
                    console.log('위 링크를 복사하여 브라우저에서 열어주세요.');
                    alert('인덱스가 필요합니다.\n\n콘솔 로그(개발자 도구 → Console)에서 인덱스 생성 링크를 확인하세요.');
                } else {
                    console.error('인덱스 생성 링크를 찾을 수 없습니다. 에러 메시지:', error.message);
                    alert('복합 인덱스가 필요합니다.\n\n콘솔 로그를 확인하여 Firebase Console에서 인덱스를 생성해주세요.');
                }
            } else {
                alert('골프장 목록을 불러오는데 실패했습니다. 콘솔을 확인해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    // 다음 페이지
    const handleNextPage = () => {
        if (hasNextPage && lastDoc) {
            setPageHistory([...pageHistory, lastDoc]);
            setCurrentPage(currentPage + 1);
            setHasPrevPage(true);
            fetchCourses(false);
        }
    };

    // 이전 페이지
    const handlePrevPage = () => {
        if (currentPage > 0 && pageHistory.length > 0) {
            const newHistory = [...pageHistory];
            newHistory.pop();
            setPageHistory(newHistory);
            setCurrentPage(currentPage - 1);
            setLastDoc(newHistory[newHistory.length - 1] || null);
            setHasPrevPage(currentPage - 1 > 0);
            fetchCourses(false);
        }
    };


    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 검색 로직은 클라이언트 사이드에서 처리
    };


    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR');
    };

    // 모달 핸들러 함수들
    const handleCreateCourse = () => {
        setSelectedCourse(null);
        setShowCreateModal(true);
    };

    const handleEditCourse = (course: CourseWithTranslations) => {
        setSelectedCourse(course);
        setShowEditModal(true);
    };

    const handleCloseModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setSelectedCourse(null);
        setCourseToDelete(null);
    };

    const handleCourseSaved = () => {
        resetPagination();
        fetchCourses(true); // 목록 새로고침 (첫 페이지부터)
        handleCloseModals();
    };

    const handleDeleteCourse = (course: CourseWithTranslations) => {
        setCourseToDelete(course);
        setShowDeleteModal(true);
    };

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return;

        try {
            // 1. 먼저 해당 골프장의 모든 티타임 데이터 삭제
            const teeTimesQuery = query(
                collection(db, 'teeTimes'),
                where('courseId', '==', courseToDelete.id)
            );
            const teeTimesSnapshot = await getDocs(teeTimesQuery);

            // 각 티타임 데이터 삭제
            const deletePromises = teeTimesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            console.log(`골프장 "${courseToDelete.name}"의 ${teeTimesSnapshot.docs.length}개 티타임 데이터 삭제 완료`);

            // 2. 골프장의 translations 서브컬렉션 삭제
            const translationsRef = collection(db, 'courses', courseToDelete.id, 'translations');
            const translationsSnapshot = await getDocs(translationsRef);

            const translationDeletePromises = translationsSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(translationDeletePromises);

            console.log(`골프장 "${courseToDelete.name}"의 ${translationsSnapshot.docs.length}개 번역 데이터 삭제 완료`);

            // 3. 골프장 데이터 삭제
            const courseRef = doc(db, 'courses', courseToDelete.id);
            await deleteDoc(courseRef);

            // 목록 새로고침
            resetPagination();
            fetchCourses(true);
            handleCloseModals();

            alert(`골프장 "${courseToDelete.name}"과 관련된 모든 데이터가 성공적으로 삭제되었습니다.`);
        } catch (error) {
            console.error('골프장 삭제 실패:', error);
            alert('골프장 삭제에 실패했습니다.');
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-800">골프장 관리</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">골프장 목록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">골프장 관리</h1>
                <div className="flex gap-3">
                    <Button onClick={handleCreateCourse}>
                        <i className="fas fa-plus"></i>
                        골프장 등록
                    </Button>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="골프장명"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button type="submit" variant="secondary">
                            <i className="fas fa-search"></i>
                        </Button>
                    </div>
                </form>

                <div className="flex gap-4">
                    <select
                        value={countryFilter}
                        onChange={(e) => setCountryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">모든 국가</option>
                        {countries.map(country => (
                            <option key={country.id} value={country.id}>
                                {country.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={cityFilter}
                        onChange={(e) => setCityFilter(e.target.value)}
                        disabled={countryFilter === 'all'}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="all">
                            {countryFilter === 'all' ? '모든 도시' : '모든 도시'}
                        </option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">모든 상태</option>
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>
            </div>

            {/* 골프장 목록 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>골프장명 (한글/영어)</TableHead>
                            <TableHead>국가</TableHead>
                            <TableHead>도시</TableHead>
                            <TableHead>포함사항</TableHead>
                            <TableHead>구글맵</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>액션</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {courses.filter(course => {
                            // 검색어 필터 (클라이언트 사이드)
                            if (searchTerm && !course.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                                return false;
                            }
                            return true;
                        }).map((course) => (
                            <TableRow key={course.id}>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <span className="font-medium text-gray-900">
                                            {course.translations?.ko?.name || '-'}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {course.translations?.en?.name || '-'}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-600">{course.countryName}</TableCell>
                                <TableCell className="text-gray-600">{course.cityName}</TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {course.inclusions && course.inclusions.length > 0 ? (
                                            course.inclusions.map((inclusionCode, index) => (
                                                <Badge key={index} variant="secondary" className="text-xs">
                                                    {getInclusionName(inclusionCode, 'ko')}
                                                </Badge>
                                            ))
                                        ) : (
                                            <span className="text-gray-400 text-sm">미설정</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {course.googleMapsLink ? (
                                        <a
                                            href={course.googleMapsLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            <i className="fas fa-map-marker-alt"></i>
                                            <span className="text-sm">지도보기</span>
                                        </a>
                                    ) : (
                                        <span className="text-gray-400 text-sm">미설정</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={course.isActive ? 'active' : 'inactive'}>
                                        {course.isActive ? '활성' : '비활성'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => handleEditCourse(course)}
                                            size="sm"
                                            variant="outline"
                                            title="수정"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteCourse(course)}
                                            size="sm"
                                            variant="outline"
                                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                            title="삭제"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>


                {courses.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <i className="fas fa-golf-ball text-6xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500">등록된 골프장이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                    onClick={handlePrevPage}
                    disabled={!hasPrevPage || loading || currentPage === 0}
                    variant="outline"
                >
                    <i className="fas fa-chevron-left"></i>
                    이전
                </Button>

                <span className="text-gray-600 text-sm">
                    페이지 {currentPage + 1} / {Math.ceil(totalCourses / coursesPerPage) || 1}
                </span>

                <Button
                    onClick={handleNextPage}
                    disabled={!hasNextPage || loading}
                    variant="outline"
                >
                    다음
                    <i className="fas fa-chevron-right"></i>
                </Button>
            </div>

            {/* 골프장 생성 모달 */}
            <CourseModal
                isOpen={showCreateModal}
                onClose={handleCloseModals}
                course={null}
                onSave={handleCourseSaved}
            />

            {/* 골프장 수정 모달 */}
            <CourseModal
                isOpen={showEditModal}
                onClose={handleCloseModals}
                course={selectedCourse}
                onSave={handleCourseSaved}
            />

            {/* 골프장 삭제 확인 모달 */}
            {showDeleteModal && courseToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 rounded-full flex items-center justify-center">
                                <i className="fas fa-exclamation-triangle text-red-600"></i>
                            </div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                골프장 삭제 확인
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">
                                <strong>"{courseToDelete.name}"</strong> 골프장과 관련된 모든 데이터를 삭제하시겠습니까?<br />
                                <span className="text-red-600 font-medium">• 골프장 정보</span><br />
                                <span className="text-red-600 font-medium">• 골프장 번역 데이터</span><br />
                                <span className="text-red-600 font-medium">• 모든 티타임 데이터</span><br />
                                이 작업은 되돌릴 수 없습니다.
                            </p>
                            <div className="flex gap-3 justify-center">
                                <Button
                                    onClick={handleCloseModals}
                                    variant="outline"
                                    className="px-4 py-2"
                                >
                                    취소
                                </Button>
                                <Button
                                    onClick={confirmDeleteCourse}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    삭제
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
