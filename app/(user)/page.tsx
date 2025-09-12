import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

export default function HomePage() {
    return (
        <main className="main">
            <section className="page-header" style={{ padding: '80px 0' }}>
                <div className="container">
                    <div className="page-header-content" style={{ textAlign: 'center' }}>
                        <h1 className="page-title">땡처리 기반 실시간 부킹 현황 사이트</h1>
                        <p className="page-subtitle">남는 티타임을 실시간으로 모아 가장 합리적인 가격으로 제공합니다. 지금 바로 가까운 골프장의 핫딜을 확인하세요.</p>
                        <div style={{ marginTop: 25, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                            <Button asChild>
                                <Link href="/list">지금 핫딜 보기</Link>
                            </Button>
                            {/* <Button variant="outline" asChild>
                                <Link href="/detail">샘플 상세페이지 보기</Link>
                            </Button> */}
                        </div>
                    </div>
                </div>
            </section>
            <section style={{ background: '#fff', padding: '50px 0' }}>
                <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                    <div className="feature" style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                        <i className="fas fa-bolt" style={{ fontSize: 28, color: '#007bff' }} />
                        <h3 style={{ margin: '12px 0 8px' }}>실시간 업데이트</h3>
                        <p style={{ color: '#6c757d', fontSize: 14 }}>남는 티타임과 가격이 실시간으로 반영됩니다.</p>
                    </div>
                    <div className="feature" style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                        <i className="fas fa-tags" style={{ fontSize: 28, color: '#28a745' }} />
                        <h3 style={{ margin: '12px 0 8px' }}>땡처리 핫딜</h3>
                        <p style={{ color: '#6c757d', fontSize: 14 }}>막판 할인 상품으로 알뜰한 라운딩을.</p>
                    </div>
                    <div className="feature" style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                        <i className="fas fa-map-marker-alt" style={{ fontSize: 28, color: '#dc3545' }} />
                        <h3 style={{ margin: '12px 0 8px' }}>내 주변 검색</h3>
                        <p style={{ color: '#6c757d', fontSize: 14 }}>가까운 골프장을 빠르게 찾아 예약하세요.</p>
                    </div>
                    <div className="feature" style={{ background: '#fff', border: '1px solid #e9ecef', borderRadius: 12, padding: 24, textAlign: 'center' }}>
                        <i className="fas fa-shield-alt" style={{ fontSize: 28, color: '#6c757d' }} />
                        <h3 style={{ margin: '12px 0 8px' }}>안전한 예약</h3>
                        <p style={{ color: '#6c757d', fontSize: 14 }}>신뢰할 수 있는 파트너와 안전한 결제.</p>
                    </div>
                </div>
            </section>
            <section className="search-section" style={{ textAlign: 'center' }}>
                <div className="container">
                    <div className="search-container" style={{ alignItems: 'center' }}>
                        <Link href="/list" className="btn btn-primary" style={{ padding: '14px 26px', fontSize: 16 }}>지금 바로 티타임 찾기</Link>
                    </div>
                </div>
            </section>
        </main>
    );
}


