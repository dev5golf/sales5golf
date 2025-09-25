"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Link from 'next/link';
import { Course, Country, Province } from '@/types';
import CourseModal from './components/CourseModal';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import '../../admin.css';

export default function CoursesPage() {
    const { user: currentUser, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [provinceFilter, setProvinceFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [countries, setCountries] = useState<Country[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);

    // 모달 상태
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // 권한 검사 - 수퍼관리자가 아니면 아예 렌더링하지 않음
    if (!authLoading && currentUser?.role !== 'super_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    useEffect(() => {
        fetchCourses();
        fetchCountries();
    }, []);

    useEffect(() => {
        if (countryFilter !== 'all') {
            fetchProvinces(countryFilter);
        } else {
            setProvinces([]);
        }
        // 국가 필터가 변경되면 지방 필터 초기화
        setProvinceFilter('all');
    }, [countryFilter]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            let q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'));

            // 권한에 따른 필터링
            if (!isSuperAdmin && currentUser?.role === 'course_admin') {
                // 골프장 관리자는 자신의 골프장만 볼 수 있음
                q = query(q, where('adminIds', 'array-contains', currentUser.id));
            }

            const snapshot = await getDocs(q);
            const courseData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Course[];

            setCourses(courseData);

        } catch (error) {
            console.error('골프장 목록 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'countries'));
            const countryData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Country[];
            setCountries(countryData);
        } catch (error) {
            console.error('국가 목록 가져오기 실패:', error);
        }
    };

    const fetchProvinces = async (countryCode: string) => {
        try {
            console.log('fetchProvinces 호출됨, countryCode:', countryCode);
            const snapshot = await getDocs(collection(db, 'provinces'));
            const allProvinces = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Province[];

            console.log('모든 지방 데이터:', allProvinces);

            // 클라이언트 사이드에서 필터링 (countryId 또는 countryCode로)
            const provinceData = allProvinces.filter(province =>
                (province as any).countryId === countryCode || (province as any).countryCode === countryCode
            );

            console.log('필터링된 지방 데이터:', provinceData);
            setProvinces(provinceData);
        } catch (error) {
            console.error('지방 목록 가져오기 실패:', error);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 검색 로직은 클라이언트 사이드에서 처리
    };

    const filteredCourses = courses.filter(course => {
        // 검색어 필터
        if (searchTerm && !course.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !course.address.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !course.phone.includes(searchTerm)) {
            return false;
        }

        // 국가 필터
        if (countryFilter !== 'all') {
            const courseCountryId = (course as any).countryId || (course as any).countryCode;
            console.log('국가 필터 체크:', { courseCountryId, countryFilter, match: courseCountryId === countryFilter });
            if (courseCountryId !== countryFilter) {
                return false;
            }
        }

        // 지방 필터
        if (provinceFilter !== 'all') {
            const courseProvinceId = (course as any).provinceId || (course as any).provinceCode;
            console.log('지방 필터 체크:', { courseProvinceId, provinceFilter, match: courseProvinceId === provinceFilter });
            if (courseProvinceId !== provinceFilter) {
                return false;
            }
        }

        // 상태 필터
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            if (course.isActive !== isActive) {
                return false;
            }
        }

        return true;
    });

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

    const handleEditCourse = (course: Course) => {
        setSelectedCourse(course);
        setShowEditModal(true);
    };

    const handleCloseModals = () => {
        setShowCreateModal(false);
        setShowEditModal(false);
        setSelectedCourse(null);
    };

    const handleCourseSaved = () => {
        fetchCourses(); // 목록 새로고침
        handleCloseModals();
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
                            placeholder="골프장명, 주소, 전화번호로 검색..."
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
                        onChange={(e) => {
                            setCountryFilter(e.target.value);
                            setProvinceFilter('all');
                        }}
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
                        value={provinceFilter}
                        onChange={(e) => setProvinceFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={countryFilter === 'all'}
                    >
                        <option value="all">모든 지방</option>
                        {provinces.map(province => (
                            <option key={province.id} value={province.id}>
                                {province.name}
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
                            <TableHead>골프장명</TableHead>
                            <TableHead>지역</TableHead>
                            <TableHead>주소</TableHead>
                            <TableHead>전화번호</TableHead>
                            <TableHead>가격</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>등록일</TableHead>
                            <TableHead>액션</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredCourses.map((course) => (
                            <TableRow key={course.id}>
                                <TableCell>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-900">{course.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="text-sm text-gray-600">
                                        {course.countryName} &gt; {course.provinceName} &gt; {course.cityName}
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-600">{course.address}</TableCell>
                                <TableCell className="text-gray-600">{course.phone}</TableCell>
                                <TableCell className="text-gray-600">{course.price ? `${course.price.toLocaleString()}원` : '미설정'}</TableCell>
                                <TableCell>
                                    <Badge variant={course.isActive ? 'active' : 'inactive'}>
                                        {course.isActive ? '활성' : '비활성'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-600">{formatDate(course.createdAt)}</TableCell>
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
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredCourses.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <i className="fas fa-golf-ball text-6xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500">등록된 골프장이 없습니다.</p>
                    </div>
                )}
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
        </div>
    );
}
