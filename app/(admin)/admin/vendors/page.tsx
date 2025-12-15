'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Vendor } from './types';
import VendorModal from './components/VendorModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import '../../admin.css';

export default function VendorsPage() {
    const { user: currentUser, loading: authLoading } = useAuth();
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // 모달 상태
    const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // 권한 검사 - 수퍼관리자나 사이트관리자가 아니면 아예 렌더링하지 않음
    if (!authLoading && currentUser?.role !== 'super_admin' && currentUser?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'vendors'), orderBy('createdAt', 'desc'));
            const snapshot = await getDocs(q);
            const vendorData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Vendor[];

            setVendors(vendorData);
        } catch (error) {
            console.error('거래처 목록 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
    };

    const handleDeleteVendor = async (vendorId: string, vendorName: string) => {
        if (!confirm(`"${vendorName}" 거래처를 삭제하시겠습니까?\n\n주의: 이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'vendors', vendorId));
            alert('거래처가 성공적으로 삭제되었습니다.');
            fetchVendors();
        } catch (error) {
            console.error('거래처 삭제 실패:', error);
            alert('거래처 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };

    const filteredVendors = vendors.filter(vendor => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            vendor.name.toLowerCase().includes(searchLower) ||
            (vendor.bankName && vendor.bankName.toLowerCase().includes(searchLower)) ||
            (vendor.depositorName && vendor.depositorName.toLowerCase().includes(searchLower)) ||
            (vendor.accountNumber && vendor.accountNumber.includes(searchTerm))
        );
    });

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR');
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-800">거래처 관리</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">거래처 목록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">거래처 관리</h1>
                <div className="flex gap-3">
                    <Button onClick={() => setShowCreateModal(true)}>
                        <i className="fas fa-plus"></i>
                        거래처 등록
                    </Button>
                </div>
            </div>

            {/* 검색 */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="거래처명, 은행명, 입금자명, 계좌번호로 검색..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button type="submit" variant="secondary">
                            <i className="fas fa-search"></i>
                        </Button>
                    </div>
                </form>
            </div>

            {/* 거래처 목록 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>거래처명</TableHead>
                            <TableHead>분류</TableHead>
                            <TableHead>은행명</TableHead>
                            <TableHead>입금자명</TableHead>
                            <TableHead>계좌번호</TableHead>
                            <TableHead>메모</TableHead>
                            <TableHead>등록일</TableHead>
                            <TableHead>액션</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVendors.map((vendor) => (
                            <TableRow key={vendor.id}>
                                <TableCell>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-900">{vendor.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={vendor.category === '계좌이체' ? 'default' : 'secondary'}>
                                        {vendor.category}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {vendor.bankName || '-'}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {vendor.depositorName || '-'}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {vendor.accountNumber || '-'}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {vendor.memo || '-'}
                                </TableCell>
                                <TableCell className="text-gray-600">
                                    {formatDate(vendor.createdAt)}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={() => {
                                                setSelectedVendor(vendor);
                                                setShowEditModal(true);
                                            }}
                                            size="sm"
                                            variant="outline"
                                            title="수정"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                            onClick={() => handleDeleteVendor(vendor.id, vendor.name)}
                                            size="sm"
                                            variant="destructive"
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

                {filteredVendors.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <i className="fas fa-building text-6xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500">등록된 거래처가 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 거래처 생성 모달 */}
            <VendorModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setSelectedVendor(null);
                }}
                vendor={null}
                onSave={() => {
                    fetchVendors();
                    setShowCreateModal(false);
                    setSelectedVendor(null);
                }}
            />

            {/* 거래처 수정 모달 */}
            <VendorModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedVendor(null);
                }}
                vendor={selectedVendor}
                onSave={() => {
                    fetchVendors();
                    setShowEditModal(false);
                    setSelectedVendor(null);
                }}
            />
        </div>
    );
}

