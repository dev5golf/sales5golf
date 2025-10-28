"use client";

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import QuotationContent from './components/QuotationContent';

export default function QuotationPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // 권한 검사 - 수퍼관리자와 사이트관리자만 접근 가능
    if (!loading && user?.role !== 'super_admin' && user?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    // 로딩 상태
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    return <QuotationContent />;
}
