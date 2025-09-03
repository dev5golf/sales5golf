"use client";
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { doc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import Link from 'next/link';
import { User } from '../../../../../types';
import '@/app/(admin)/admin.css';

export default function UserDetailPage() {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const params = useParams();
    const router = useRouter();
    const userId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = { id: userDoc.id, ...userDoc.data() } as User;
                setUser(userData);
            } else {
                alert('사용자를 찾을 수 없습니다.');
                router.push('/admin/users');
            }
        } catch (error) {
            console.error('사용자 정보 가져오기 실패:', error);
            alert('사용자 정보를 가져오는데 실패했습니다.');
            router.push('/admin/users');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!user) return;

        setDeleting(true);
        try {
            await deleteDoc(doc(db, 'users', userId));
            alert('회원이 성공적으로 삭제되었습니다.');
            router.push('/admin/users');
        } catch (error) {
            console.error('회원 삭제 실패:', error);
            alert('회원 삭제에 실패했습니다.');
        } finally {
            setDeleting(false);
            setShowDeleteModal(false);
        }
    };

    const getRoleDisplayName = (role: string) => {
        switch (role) {
            case 'super_admin': return '통합 관리자';
            case 'course_admin': return '골프장 관리자';
            case 'user': return '일반 회원';
            default: return role;
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'super_admin': return 'role-badge super-admin';
            case 'course_admin': return 'role-badge course-admin';
            case 'user': return 'role-badge user';
            default: return 'role-badge';
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('ko-KR');
    };

    const canEdit = () => {
        if (!user || !currentUser) return false;

        // 수퍼 관리자는 모든 사용자 수정 가능
        if (isSuperAdmin) return true;

        // 골프장 관리자는 같은 골프장의 사용자만 수정 가능
        if (currentUser.role === 'course_admin' && user.courseId === currentUser.courseId) {
            return true;
        }

        return false;
    };

    const canDelete = () => {
        if (!user || !currentUser) return false;

        // 자신은 삭제할 수 없음
        if (user.id === currentUser.id) return false;

        // 수퍼 관리자는 모든 사용자 삭제 가능
        if (isSuperAdmin) return true;

        // 골프장 관리자는 같은 골프장의 일반 사용자만 삭제 가능
        if (currentUser.role === 'course_admin' &&
            user.courseId === currentUser.courseId &&
            user.role === 'user') {
            return true;
        }

        return false;
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>사용자 정보를 불러오는 중...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="admin-page">
                <div className="error-state">
                    <i className="fas fa-exclamation-triangle"></i>
                    <p>사용자를 찾을 수 없습니다.</p>
                    <Link href="/admin/users" className="btn btn-primary">
                        목록으로 돌아가기
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>회원 상세 정보</h1>
                <div className="page-actions">
                    {canEdit() && (
                        <Link href={`/admin/users/${user.id}/edit`} className="btn btn-primary">
                            <i className="fas fa-edit"></i>
                            정보 수정
                        </Link>
                    )}
                    {canDelete() && (
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn btn-danger"
                        >
                            <i className="fas fa-trash"></i>
                            회원 삭제
                        </button>
                    )}
                    <Link href="/admin/users" className="btn btn-outline">
                        <i className="fas fa-arrow-left"></i>
                        목록으로
                    </Link>
                </div>
            </div>

            {/* 기본 정보 */}
            <div className="info-card">
                <h3>기본 정보</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <label>이름</label>
                        <span>{user.name}</span>
                    </div>
                    <div className="info-item">
                        <label>이메일</label>
                        <span>{user.email}</span>
                    </div>
                    <div className="info-item">
                        <label>전화번호</label>
                        <span>{user.phone || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>역할</label>
                        <span className={getRoleBadgeClass(user.role)}>
                            {getRoleDisplayName(user.role)}
                        </span>
                    </div>
                    <div className="info-item">
                        <label>골프장</label>
                        <span>{user.courseName || '-'}</span>
                    </div>
                    <div className="info-item">
                        <label>상태</label>
                        <span className={`status-badge ${user.isActive ? 'active' : 'inactive'}`}>
                            {user.isActive ? '활성' : '비활성'}
                        </span>
                    </div>
                </div>
            </div>

            {/* 시스템 정보 */}
            <div className="info-card">
                <h3>시스템 정보</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <label>사용자 ID</label>
                        <span className="font-mono">{user.id}</span>
                    </div>
                    <div className="info-item">
                        <label>가입일</label>
                        <span>{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="info-item">
                        <label>마지막 수정일</label>
                        <span>{formatDate(user.updatedAt)}</span>
                    </div>
                    <div className="info-item">
                        <label>마지막 로그인</label>
                        <span>{formatDate(user.lastLoginAt)}</span>
                    </div>
                </div>
            </div>

            {/* 삭제 확인 모달 */}
            {showDeleteModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>회원 삭제 확인</h3>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="modal-close"
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <p>정말로 <strong>{user.name}</strong> 회원을 삭제하시겠습니까?</p>
                            <p className="text-danger">이 작업은 되돌릴 수 없습니다.</p>
                        </div>
                        <div className="modal-footer">
                            <button
                                onClick={handleDelete}
                                className="btn btn-danger"
                                disabled={deleting}
                            >
                                {deleting ? '삭제 중...' : '삭제'}
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="btn btn-outline"
                            >
                                취소
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
