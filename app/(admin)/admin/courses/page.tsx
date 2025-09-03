"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Link from 'next/link';
import { Course, Country, Province } from '../../../../types';
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

    // 권한 검사 - 수퍼관리자가 아니면 아예 렌더링하지 않음
    if (!authLoading && currentUser?.role !== 'super_admin') {
        router.push('/admin/tee-times');
        return null;
    }
    const [provinces, setProvinces] = useState<Province[]>([]);

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
            const q = query(collection(db, 'provinces'), where('countryCode', '==', countryCode));
            const snapshot = await getDocs(q);
            const provinceData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Province[];
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
        if (countryFilter !== 'all' && course.countryCode !== countryFilter) {
            return false;
        }

        // 지방 필터
        if (provinceFilter !== 'all' && course.provinceCode !== provinceFilter) {
            return false;
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

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>골프장 목록을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>골프장 관리</h1>
                <div className="page-actions">
                    <Link href="/admin/courses/create" className="btn btn-primary">
                        <i className="fas fa-plus"></i>
                        골프장 등록
                    </Link>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="골프장명, 주소, 전화번호로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="btn btn-secondary">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </form>

                <div className="filter-group">
                    <select
                        value={countryFilter}
                        onChange={(e) => {
                            setCountryFilter(e.target.value);
                            setProvinceFilter('all');
                        }}
                        className="filter-select"
                    >
                        <option value="all">모든 국가</option>
                        {countries.map(country => (
                            <option key={country.id} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={provinceFilter}
                        onChange={(e) => setProvinceFilter(e.target.value)}
                        className="filter-select"
                        disabled={countryFilter === 'all'}
                    >
                        <option value="all">모든 지방</option>
                        {provinces.map(province => (
                            <option key={province.id} value={province.code}>
                                {province.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">모든 상태</option>
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>
            </div>

            {/* 골프장 목록 */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>골프장명</th>
                            <th>지역</th>
                            <th>주소</th>
                            <th>전화번호</th>
                            <th>가격</th>
                            <th>상태</th>
                            <th>등록일</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCourses.map((course) => (
                            <tr key={course.id}>
                                <td>
                                    <div className="course-info">
                                        <span className="course-name">{course.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="location-info">
                                        <span className="location-text">
                                            {course.countryName} > {course.provinceName} > {course.cityName}
                                        </span>
                                    </div>
                                </td>
                                <td>{course.address}</td>
                                <td>{course.phone}</td>
                                <td>{course.price ? `${course.price.toLocaleString()}원` : '미설정'}</td>
                                <td>
                                    <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                                        {course.isActive ? '활성' : '비활성'}
                                    </span>
                                </td>
                                <td>{formatDate(course.createdAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <Link
                                            href={`/admin/courses/${course.id}/edit`}
                                            className="btn btn-sm btn-outline"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <Link
                                            href={`/admin/courses/${course.id}`}
                                            className="btn btn-sm btn-outline"
                                        >
                                            <i className="fas fa-eye"></i>
                                        </Link>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCourses.length === 0 && (
                    <div className="empty-state">
                        <i className="fas fa-golf-ball"></i>
                        <p>등록된 골프장이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
