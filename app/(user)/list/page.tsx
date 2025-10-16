"use client";
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../../lib/firebase';
import { Course } from '@/types';
import {
    getTypeLabel
} from '../../../lib/utils';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// 사용자 페이지용 골프장 타입 (Firebase Course + 추가 UI 필드)
type UserCourse = Course & {
    type: 'public' | 'private' | 'resort';
    rating: number;
    reviews: number;
    originalPrice?: string;
    discount?: string;
    image: string;
    features: string[];
};

export default function ListPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'resort'>('all');
    const [page, setPage] = useState(1);
    const [courses, setCourses] = useState<UserCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const perPage = 6;
    // Firebase에서 골프장 데이터 가져오기
    const fetchCourses = async () => {
        try {
            setLoading(true);
            console.log('Firebase DB 연결 상태:', db ? '연결됨' : '연결 안됨');

            if (!db) {
                console.warn('Firebase DB가 연결되지 않음. 더미 데이터를 사용합니다.');
                // Firebase 연결이 안된 경우 더미 데이터 사용
                const dummyCourses: UserCourse[] = [
                    {
                        id: 'dummy1',
                        name: '더미 골프장 1',
                        countryId: 'KR',
                        provinceId: 'KR_001',
                        cityId: 'KR_001_001',
                        countryName: '대한민국',
                        provinceName: '서울',
                        cityName: '강남구',
                        inclusions: [],
                        adminIds: [],
                        isActive: true,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        createdBy: null,
                        type: 'public' as const,
                        rating: 4.5,
                        reviews: 120,
                        originalPrice: '250,000원',
                        discount: '20% 할인',
                        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                        features: ['18홀', '파 72', '골프카트', '프로샵']
                    }
                ];
                setCourses(dummyCourses);
                setLoading(false);
                return;
            }

            // 인덱스 문제를 피하기 위해 모든 골프장을 가져온 후 클라이언트에서 필터링
            const coursesQuery = query(collection(db, 'courses'));
            const querySnapshot = await getDocs(coursesQuery);
            console.log('Firebase에서 가져온 문서 수:', querySnapshot.docs.length);

            const coursesData: UserCourse[] = querySnapshot.docs
                .map(doc => {
                    const data = doc.data() as Course;
                    return {
                        ...data,
                        // 기본 UI 데이터 추가
                        type: 'public' as const,
                        rating: 4.5,
                        reviews: 120,
                        originalPrice: '가격 문의',
                        discount: '',
                        image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                        features: ['18홀', '파 72', '골프카트', '프로샵']
                    };
                })
                .filter(course => course.isActive) // 활성 골프장만 필터링
                .sort((a, b) => {
                    // 클라이언트 사이드에서 정렬 (createdAt 기준 내림차순)
                    const aTime = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
                    const bTime = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
                    return bTime.getTime() - aTime.getTime();
                });

            console.log('처리된 골프장 데이터 수:', coursesData.length);
            setCourses(coursesData);
        } catch (error) {
            console.error('골프장 데이터 가져오기 실패:', error);
            // 에러 시 더미 데이터 사용
            const dummyCourses: UserCourse[] = [
                {
                    id: 'dummy1',
                    name: '더미 골프장 1',
                    countryId: 'KR',
                    provinceId: 'KR_001',
                    cityId: 'KR_001_001',
                    countryName: '대한민국',
                    provinceName: '서울',
                    cityName: '강남구',
                    inclusions: [],
                    adminIds: [],
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    createdBy: null,
                    type: 'public' as const,
                    rating: 4.5,
                    reviews: 120,
                    originalPrice: '250,000원',
                    discount: '20% 할인',
                    image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                    features: ['18홀', '파 72', '골프카트', '프로샵']
                }
            ];
            setCourses(dummyCourses);
        } finally {
            setLoading(false);
        }
    };



    useEffect(() => {
        fetchCourses();
    }, []);

    const filtered = useMemo(() => {
        let data = courses;
        if (filter !== 'all') data = data.filter(c => c.type === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(c =>
                c.name.toLowerCase().includes(q) ||
                c.provinceName.toLowerCase().includes(q) ||
                c.cityName.toLowerCase().includes(q)
            );
        }
        return data;
    }, [courses, search, filter]);
    const totalPages = Math.ceil(filtered.length / perPage) || 1;
    const coursesToShow = filtered.slice((page - 1) * perPage, page * perPage);
    useEffect(() => { setPage(1); }, [search, filter]);

    return (
        <main className="main">
            <section className="page-header">
                <div className="container"><div className="page-header-content"><h1 className="page-title">골프장 목록</h1><p className="page-subtitle">최고의 골프장을 찾아보세요</p></div></div>
            </section>
            <section className="search-section">
                <div className="container">
                    <div className="search-container">
                        <div className="search-box">
                            <i className="fas fa-search search-icon" />
                            <input value={search} onChange={e => setSearch(e.target.value)} type="text" className="search-input" placeholder="골프장명, 지역, 설명으로 검색..." />
                            <button className="btn btn-primary search-btn" onClick={() => setPage(1)}>검색</button>
                        </div>
                        <div className="filter-toggles">
                            {(['all', 'public', 'private', 'resort'] as const).map(f => (
                                <button key={f} className={`filter-toggle ${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                                    {f === 'all' ? '전체' : f === 'public' ? '공용' : f === 'private' ? '사설' : '리조트'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className="courses-section">
                <div className="container">
                    <div className="courses-grid">
                        {loading && (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>로딩 중...</p>
                            </div>
                        )}
                        {!loading && coursesToShow.length === 0 && (
                            <div className="no-results">
                                <i className="fas fa-search" />
                                <h3>검색 결과가 없습니다</h3>
                                <p>다른 검색어나 필터를 시도해보세요.</p>
                            </div>
                        )}
                        {!loading && coursesToShow.map(course => (
                            <Card key={course.id} className="course-card">
                                <div className="course-card-image" style={{ position: 'relative', height: 250 }}>
                                    <Image src={course.image} alt={course.name} fill sizes="(max-width: 768px) 100vw, 400px" style={{ objectFit: 'cover' }} />
                                    <Badge variant={course.type as any} className="absolute top-4 left-4">
                                        {getTypeLabel(course.type)}
                                    </Badge>
                                    {course.discount && <div className="course-card-discount">{course.discount}</div>}
                                </div>
                                <CardContent className="course-card-content">
                                    <h3 className="course-card-title">{course.name}</h3>
                                    <div className="course-card-location"><i className="fas fa-map-marker-alt" /> {course.provinceName} {course.cityName}</div>
                                    <div className="course-card-rating"><i className="fas fa-star" /> {course.rating} ({course.reviews} reviews)</div>
                                    <p className="course-card-description">아름다운 자연 속에서 즐기는 골프장입니다.</p>
                                    <div className="course-card-features">{course.features.map((f, i) => (<span key={i} className="feature-tag">{f}</span>))}</div>
                                    <div className="course-card-price">
                                        <span className="current-price">가격 문의</span>
                                        {course.originalPrice && <span className="original-price">{course.originalPrice}</span>}
                                    </div>
                                </CardContent>
                                <CardFooter className="course-card-actions">
                                    <Button variant="outline" asChild>
                                        <Link href={`/detail?course=${course.id}`}><i className="fas fa-eye" /> 상세보기</Link>
                                    </Button>
                                    <Button asChild>
                                        <Link href={`/detail?course=${course.id}&booking=true`}><i className="fas fa-calendar-check" /> 예약하기</Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    <div className="pagination">
                        <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}><i className="fas fa-chevron-left" /> 이전</button>
                        <div className="pagination-numbers">{Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 10).map(p => (<button key={p} className={`pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>))}</div>
                        <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>다음 <i className="fas fa-chevron-right" /></button>
                    </div>
                </div>
            </section>
        </main>
    );
}


