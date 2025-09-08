"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, query, orderBy, where, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Link from 'next/link';
import { User } from '../../../../types';
import UserModal from '../components/UserModal';
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

    // 권한 검사 - 수퍼관리자가 아니면 아예 렌더링하지 않음
    if (!authLoading && currentUser?.role !== 'super_admin') {
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

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'super_admin': return 'role-badge super-admin';
            case 'course_admin': return 'role-badge course-admin';
            case 'site_admin': return 'role-badge site-admin';
            case 'user': return 'role-badge user';
            default: return 'role-badge';
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR');
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>사용자 목록을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>회원 관리</h1>
                <div className="page-actions">
                    <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
                        <i className="fas fa-plus"></i>
                        회원 등록
                    </button>
                </div>
            </div>

            {/* 검색 및 필터 */}
            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="이름, 이메일, 전화번호로 검색..."
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
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="filter-select"
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
                        className="filter-select"
                    >
                        <option value="all">모든 상태</option>
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>
            </div>

            {/* 사용자 목록 */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>이름</th>
                            <th>이메일</th>
                            <th>전화번호</th>
                            <th>역할</th>
                            <th>골프장</th>
                            <th>상태</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id}>
                                <td>
                                    <div className="user-info">
                                        <span className="user-name">{user.name}</span>
                                    </div>
                                </td>
                                <td>{user.email}</td>
                                <td>{user.phone || '-'}</td>
                                <td>
                                    <span className={getRoleBadgeClass(user.role)}>
                                        {getRoleDisplayName(user.role)}
                                    </span>
                                </td>
                                <td>{user.courseName || '-'}</td>
                                <td>
                                    <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? '활성' : '비활성'}
                                    </span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            onClick={() => {
                                                setSelectedUser(user);
                                                setShowEditModal(true);
                                            }}
                                            className="btn btn-sm btn-outline"
                                            title="수정"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id, user.name)}
                                            className="btn btn-sm btn-danger"
                                            title="삭제"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredUsers.length === 0 && (
                    <div className="empty-state">
                        <i className="fas fa-users"></i>
                        <p>등록된 회원이 없습니다.</p>
                    </div>
                )}
            </div>

            {/* 페이지네이션 */}
            <div className="pagination">
                <button
                    onClick={() => {
                        setCurrentPage(prev => Math.max(1, prev - 1));
                    }}
                    disabled={currentPage === 1}
                    className="btn btn-outline"
                >
                    <i className="fas fa-chevron-left"></i>
                    이전
                </button>

                <span className="page-info">
                    페이지 {currentPage} / {Math.ceil(totalUsers / usersPerPage)}
                </span>

                <button
                    onClick={() => {
                        setCurrentPage(prev => prev + 1);
                    }}
                    disabled={!hasMore}
                    className="btn btn-outline"
                >
                    다음
                    <i className="fas fa-chevron-right"></i>
                </button>
            </div>

            {/* 사용자 생성 모달 */}
            <UserModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false);
                    setSelectedUser(null);
                }}
                user={null}
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
                onSave={() => {
                    fetchUsers();
                    setShowEditModal(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
}
