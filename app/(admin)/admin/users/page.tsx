"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Link from 'next/link';
import { User } from '../../../../types';
import UserModal from '../components/UserModal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import '../../admin.css';

export default function UsersPage() {
    const { user: currentUser, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const usersPerPage = 10;

    // 모달 상태
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // 권한 검사 - 수퍼관리자나 사이트관리자가 아니면 아예 렌더링하지 않음
    if (!authLoading && currentUser?.role !== 'super_admin' && currentUser?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    useEffect(() => {
        setCurrentPage(1);
        fetchUsers();
    }, [roleFilter, statusFilter, currentUser, isSuperAdmin]);

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    const fetchUsers = async () => {
        try {
            setLoading(true);

            // 모든 사용자 데이터를 가져온 후 클라이언트에서 필터링
            let q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));

            // 권한에 따른 필터링만 서버에서 처리
            if (!isSuperAdmin && currentUser?.role === 'course_admin') {
                q = query(q, where('courseId', '==', currentUser.courseId));
            }

            const snapshot = await getDocs(q);
            let userData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as User[];

            // 클라이언트에서 역할 필터 적용
            if (roleFilter !== 'all') {
                userData = userData.filter(user => user.role === roleFilter);
            }

            // 클라이언트에서 상태 필터 적용
            if (statusFilter !== 'all') {
                const isActive = statusFilter === 'active';
                userData = userData.filter(user => user.isActive === isActive);
            }



            // 페이지네이션 적용
            const startIndex = (currentPage - 1) * usersPerPage;
            const endIndex = startIndex + usersPerPage;
            const paginatedData = userData.slice(startIndex, endIndex);

            setUsers(paginatedData);
            setTotalUsers(userData.length);
            setHasMore(endIndex < userData.length);

        } catch (error) {
            console.error('사용자 목록 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        // 검색어는 클라이언트 사이드 필터링으로 처리됨
    };

    const handleDeleteUser = async (userId: string, userName: string) => {
        if (!confirm(`"${userName}" 회원을 삭제하시겠습니까?\n\n주의: 이 작업은 되돌릴 수 없습니다.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', userId));
            alert('회원이 성공적으로 삭제되었습니다.');
            fetchUsers(); // 목록 새로고침
        } catch (error) {
            console.error('회원 삭제 실패:', error);
            alert('회원 삭제에 실패했습니다. 다시 시도해주세요.');
        }
    };

    // 검색어 변경 시 페이지 리셋 (서버 요청 없이)
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const filteredUsers = users.filter(user => {
        if (!searchTerm.trim()) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            (user.phone && user.phone.includes(searchTerm))
        );
    });

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'super_admin': return '통합 관리자';
            case 'course_admin': return '골프장 관리자';
            case 'site_admin': return '사이트 관리자';
            case 'user': return '일반 회원';
            default: return role;
        }
    };

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'super_admin': return 'super-admin';
            case 'course_admin': return 'course-admin';
            case 'site_admin': return 'site-admin';
            case 'user': return 'user';
            default: return 'default';
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR');
    };

    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-800">회원 관리</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">사용자 목록을 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">회원 관리</h1>
                <div className="flex gap-3">
                    <Button onClick={() => setShowCreateModal(true)}>
                        <i className="fas fa-plus"></i>
                        회원 등록
                    </Button>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="이름, 이메일, 전화번호로 검색..."
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
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">모든 역할</option>
                        <option value="user">일반 회원</option>
                        <option value="course_admin">골프장 관리자</option>
                        <option value="site_admin">사이트 관리자</option>
                        {isSuperAdmin && <option value="super_admin">통합 관리자</option>}
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

            {/* 사용자 목록 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>이름</TableHead>
                            <TableHead>이메일</TableHead>
                            <TableHead>전화번호</TableHead>
                            <TableHead className="hidden">역할</TableHead>
                            <TableHead className="hidden">골프장</TableHead>
                            <TableHead>상태</TableHead>
                            <TableHead>액션</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell>
                                    <div className="flex items-center">
                                        <span className="font-medium text-gray-900">{user.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-600">{user.email}</TableCell>
                                <TableCell className="text-gray-600">{user.phone || '-'}</TableCell>
                                <TableCell className="hidden">
                                    <Badge variant={getRoleBadgeVariant(user.role) as any}>
                                        {getRoleDisplayName(user.role)}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden text-gray-600">{user.courseName || '-'}</TableCell>
                                <TableCell>
                                    <Badge variant={user.isActive ? 'active' : 'inactive'}>
                                        {user.isActive ? '활성' : '비활성'}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        {(isSuperAdmin || (currentUser?.role === 'site_admin' && user.id === currentUser?.id)) && (
                                            <Button
                                                onClick={() => {
                                                    setSelectedUser(user);
                                                    setShowEditModal(true);
                                                }}
                                                size="sm"
                                                variant="outline"
                                                title="수정"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                        )}
                                        {isSuperAdmin && (
                                            <Button
                                                onClick={() => handleDeleteUser(user.id, user.name)}
                                                size="sm"
                                                variant="destructive"
                                                title="삭제"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                {filteredUsers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <i className="fas fa-users text-6xl text-gray-400 mb-4"></i>
                        <p className="text-gray-500">등록된 회원이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 페이지네이션 */}
            <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                    onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    disabled={currentPage === 1}
                    variant="outline"
                >
                    <i className="fas fa-chevron-left"></i>
                    이전
                </Button>

                <span className="text-gray-600 text-sm">
                    페이지 {currentPage} / {Math.ceil(totalUsers / usersPerPage)}
                </span>

                <Button
                    onClick={() => {
                        setCurrentPage(prev => prev + 1);
                    }}
                    disabled={!hasMore}
                    variant="outline"
                >
                    다음
                    <i className="fas fa-chevron-right"></i>
                </Button>
            </div>

            {/* 사용자 생성 모달 */}
            <UserModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setSelectedUser(null);
                }}
                user={null}
                currentUser={currentUser}
                onSave={() => {
                    fetchUsers();
                    setShowCreateModal(false);
                    setSelectedUser(null);
                }}
            />

            {/* 사용자 수정 모달 */}
            <UserModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
                user={selectedUser}
                currentUser={currentUser}
                onSave={() => {
                    fetchUsers();
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
}
