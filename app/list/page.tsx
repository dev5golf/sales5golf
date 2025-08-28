"use client";
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Course = {
    id: number; name: string; location: string; type: 'public' | 'private' | 'resort'; rating: number; reviews: number; price: string; originalPrice?: string; discount?: string; image: string; description: string; features: string[];
};

const golfCourses: Course[] = [
    { id: 1, name: '탄손녓 골프 코스', location: 'Winter Park, FL', type: 'public', rating: 4.2, reviews: 128, price: '45,000원', originalPrice: '65,000원', discount: '31% 할인', image: 'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', description: '아름다운 자연 속에서 즐기는 18홀 공공 골프장', features: ['18홀', '파 72', '6,500야드', '프로샵', '레스토랑'] },
    { id: 2, name: '파인 밸리 골프 클럽', location: 'Pine Valley, NJ', type: 'private', rating: 4.8, reviews: 89, price: '350,000원', originalPrice: '450,000원', discount: '22% 할인', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', description: '세계 최고의 프라이빗 골프장 중 하나', features: ['18홀', '파 70', '7,000야드', '클럽하우스', '골프카트'] },
    { id: 3, name: '어거스타 내셔널 골프 클럽', location: 'Augusta, GA', type: 'private', rating: 4.9, reviews: 156, price: '500,000원', originalPrice: '600,000원', discount: '17% 할인', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', description: '마스터스 토너먼트의 성지', features: ['18홀', '파 72', '7,475야드', '골프카트', '캐디'] },
    { id: 4, name: '페블 비치 골프 링크스', location: 'Pebble Beach, CA', type: 'resort', rating: 4.7, reviews: 203, price: '550,000원', originalPrice: '650,000원', discount: '15% 할인', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', description: '태평양을 바라보는 세계적인 리조트 골프장', features: ['18홀', '파 72', '7,075야드', '리조트', '스파'] },
    { id: 5, name: '세인트 앤드류스 올드 코스', location: 'St. Andrews, Scotland', type: 'public', rating: 4.6, reviews: 178, price: '200,000원', originalPrice: '250,000원', discount: '20% 할인', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', description: '골프의 발상지, 역사적인 링크스 코스', features: ['18홀', '파 72', '7,305야드', '골프박물관', '골프카트'] },
    { id: 6, name: '휘슬링 스트레이츠', location: 'Kohler, WI', type: 'resort', rating: 4.5, reviews: 134, price: '300,000원', originalPrice: '380,000원', discount: '21% 할인', image: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', description: '미시간 호수를 바라보는 아름다운 리조트 코스', features: ['18홀', '파 72', '7,790야드', '리조트', '골프카트'] },
    { id: 7, name: 'TPC 소그래스', location: 'Ponte Vedra Beach, FL', type: 'resort', rating: 4.4, reviews: 167, price: '400,000원', originalPrice: '480,000원', discount: '17% 할인', image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', description: 'PLAYERS 챔피언십의 홈 코스', features: ['18홀', '파 72', '7,245야드', '리조트', '골프카트'] },
    { id: 8, name: '베스페이지 블랙 코스', location: 'Farmingdale, NY', type: 'public', rating: 4.3, reviews: 145, price: '75,000원', originalPrice: '95,000원', discount: '21% 할인', image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80', description: '뉴욕의 대표적인 공공 골프장', features: ['18홀', '파 71', '7,468야드', '골프카트', '프로샵'] },
];

export default function ListPage() {
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState<'all' | 'public' | 'private' | 'resort'>('all');
    const [page, setPage] = useState(1);
    const perPage = 6;
    const filtered = useMemo(() => {
        let data = golfCourses;
        if (filter !== 'all') data = data.filter(c => c.type === filter);
        if (search.trim()) {
            const q = search.toLowerCase();
            data = data.filter(c => c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
        }
        return data;
    }, [search, filter]);
    const totalPages = Math.ceil(filtered.length / perPage) || 1;
    const coursesToShow = filtered.slice((page - 1) * perPage, page * perPage);
    useEffect(() => { setPage(1); }, [search, filter]);
    const typeLabel = (t: Course['type']) => ({ public: '공공', private: '사설', resort: '리조트' }[t]);
    return (
        <main className="main">
            <section className="page-header">
                <div className="container"><div className="page-header-content"><h1 className="page-title">골프장 목록</h1><p className="page-subtitle">전국의 최고 골프장을 찾아보세요</p></div></div>
            </section>
            <section className="search-section">
                <div className="container">
                    <div className="search-container">
                        <div className="search-box">
                            <i className="fas fa-search search-icon" />
                            <input value={search} onChange={e => setSearch(e.target.value)} type="text" className="search-input" placeholder="골프장 이름, 지역, 도시로 검색..." />
                            <button className="btn btn-primary search-btn" onClick={() => setPage(1)}>검색</button>
                        </div>
                        <div className="filter-toggles">
                            {(['all', 'public', 'private', 'resort'] as const).map(f => (
                                <button key={f} className={`filter-toggle ${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                                    {f === 'all' ? '전체' : f === 'public' ? '공공' : f === 'private' ? '사설' : '리조트'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
            <section className="courses-section">
                <div className="container">
                    <div className="courses-grid">
                        {coursesToShow.length === 0 && (<div className="no-results"><i className="fas fa-search" /><h3>검색 결과가 없습니다</h3><p>다른 검색어나 필터를 시도해보세요.</p></div>)}
                        {coursesToShow.map(course => (
                            <div key={course.id} className="course-card">
                                <div className="course-card-image" style={{ position: 'relative', height: 250 }}>
                                    <Image src={course.image} alt={course.name} fill sizes="(max-width: 768px) 100vw, 400px" style={{ objectFit: 'cover' }} />
                                    <div className={`course-card-badge ${course.type}`}>{typeLabel(course.type)}</div>
                                    {course.discount && <div className="course-card-discount">{course.discount}</div>}
                                </div>
                                <div className="course-card-content">
                                    <h3 className="course-card-title">{course.name}</h3>
                                    <div className="course-card-location"><i className="fas fa-map-marker-alt" /> {course.location}</div>
                                    <div className="course-card-rating"><i className="fas fa-star" /> {course.rating} ({course.reviews} reviews)</div>
                                    <p className="course-card-description">{course.description}</p>
                                    <div className="course-card-features">{course.features.map((f, i) => (<span key={i} className="feature-tag">{f}</span>))}</div>
                                    <div className="course-card-price"><span className="current-price">{course.price}</span>{course.originalPrice && <span className="original-price">{course.originalPrice}</span>}</div>
                                    <div className="course-card-actions">
                                        <Link className="btn btn-outline" href={`/detail?course=${course.id}`}><i className="fas fa-eye" /> 상세보기</Link>
                                        <Link className="btn btn-primary" href={`/detail?course=${course.id}&booking=true`}><i className="fas fa-calendar-check" /> 예약하기</Link>
                                    </div>
                                </div>
                            </div>
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


