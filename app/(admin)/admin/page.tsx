"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { db } from '../../../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { TeeTime } from '../../../types';

export default function AdminDashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [teeTimes, setTeeTimes] = useState<TeeTime[]>([]);

    // 권한 검사 - 수퍼관리자가 아니면 아예 렌더링하지 않음
    if (!loading && user?.role !== 'super_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    // 실제 티타임 데이터 가져오기
    useEffect(() => {
        const fetchTeeTimes = async () => {
            try {
                const teeTimesRef = collection(db, 'teeTimes');
                const snapshot = await getDocs(teeTimesRef);
                const teeTimesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as TeeTime[];

                setTeeTimes(teeTimesData);
            } catch (error) {
                console.error('티타임 데이터 가져오기 실패:', error);
                // 오류 발생 시 빈 배열로 설정
                setTeeTimes([]);
            }
        };

        if (user?.role === 'super_admin') {
            fetchTeeTimes();
        }
    }, [user]);

    // 페이지 포커스 시 데이터 새로고침
    useEffect(() => {
        const handleFocus = () => {
            if (user?.role === 'super_admin') {
                const fetchTeeTimes = async () => {
                    try {
                        const teeTimesRef = collection(db, 'teeTimes');
                        const snapshot = await getDocs(teeTimesRef);
                        const teeTimesData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        })) as TeeTime[];

                        setTeeTimes(teeTimesData);
                    } catch (error) {
                        console.error('티타임 데이터 새로고침 실패:', error);
                    }
                };
                fetchTeeTimes();
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [user]);



    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>대시보드</h1>
            </div>

            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div className="stat-content">
                        <h3>{teeTimes.length}</h3>
                        <p>등록된 티타임</p>
                    </div>
                </div>
            </div>


        </div>
    );
}
