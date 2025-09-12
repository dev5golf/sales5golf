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
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">대시보드</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 flex items-center gap-4">
                    <div className="w-15 h-15 rounded-full bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center text-white text-2xl">
                        <i className="fas fa-calendar-alt"></i>
                    </div>
                    <div>
                        <h3 className="text-3xl font-bold text-gray-800 mb-1">{teeTimes.length}</h3>
                        <p className="text-gray-600 text-sm">등록된 티타임</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
