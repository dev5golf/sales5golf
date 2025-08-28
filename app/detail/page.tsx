"use client";
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function DetailPage() {
    const params = useSearchParams();
    const booking = params.get('booking') === 'true';
    const [status, setStatus] = useState<'idle' | 'confirm' | 'done'>('idle');
    useEffect(() => { if (booking) setStatus('confirm'); }, [booking]);
    return (
        <main className="main">
            <section className="page-header" style={{
                backgroundImage: 'url("https://images.unsplash.com/photo-1535131749006-b7f58c99034b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
            }}>
                <div className="page-header-overlay"></div>
                <div className="container"><div className="page-header-content"><h1 className="page-title">탄손녓 골프 코스</h1></div></div>
            </section>
            <section className="filters-section">
                <div className="container">
                    <div className="filters-container">
                        <div className="filter-group"><label className="filter-label">Date</label><input type="date" className="filter-input" /></div>
                        <div className="filter-group"><label className="filter-label">Players</label><select className="filter-select"><option>1</option><option>2</option><option>3</option><option>4</option></select></div>
                        <div className="filter-group"><label className="filter-label">Holes</label><select className="filter-select"><option>9</option><option>18</option></select></div>
                    </div>
                </div>
            </section>
            <section className="search-button-section"><div className="search-button-container"><button className="btn btn-primary filter-btn">Search</button></div></section>
            <section className="tee-times-section">
                <div className="container">
                    <div className="tee-times-grid">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="tee-time-card">
                                <div className="card-header"><div className="time-info"><span className="time">{10 + i}:00 AM</span><span className="date">오늘</span></div><div className="hot-deal-badge">HOT DEAL</div></div>
                                <div className="card-body">
                                    <div className="price-info"><span className="original-price">45,000원</span><span className="current-price">32,000원</span><span className="discount">29% 할인</span></div>
                                    <div className="course-details"><span className="holes">9 holes</span><span className="players">1-4 players</span></div>
                                    <div className="booking-info"><span className="availability">Good availability</span><span className="cancellation">Free cancellation</span></div>
                                </div>
                                <div className="card-footer"><button className="btn btn-primary btn-book" onClick={() => setStatus('done')}>Book Now</button><button className="btn btn-outline btn-details" onClick={() => alert('상세 정보는 골프장에 문의하세요.')}>Details</button></div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </main>
    );
}


