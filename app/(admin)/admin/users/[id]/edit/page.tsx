"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { doc, getDoc, setDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../../lib/firebase';
import Link from 'next/link';
import { User, Course } from '../../../../../../types';
import '@/app/(admin)/admin.css';

export default function EditUserPage() {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const router = useRouter();
    const params = useParams();
    const userId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user' as 'user' | 'course_admin' | 'super_admin',
        courseId: '',
        isActive: true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (userId) {
            fetchUser();
            fetchCourses();
        }
    }, [userId]);

    const fetchUser = async () => {
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                const userData = { id: userDoc.id, ...userDoc.data() } as User;
                setUser(userData);
                setFormData({
                    name: userData.name,
                    email: userData.email,
                    phone: userData.phone || '',
                    role: userData.role,
                    courseId: userData.courseId || '',
                    isActive: userData.isActive
                });
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

    const fetchCourses = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'courses'));
            const courseData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Course[];
            setCourses(courseData);
        } catch (error) {
            console.error('골프장 목록 가져오기 실패:', error);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = '이름을 입력해주세요.';
        }

        if (!formData.email.trim()) {
            newErrors.email = '이메일을 입력해주세요.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = '올바른 이메일 형식을 입력해주세요.';
        }

        if (formData.role === 'course_admin' && !formData.courseId) {
            newErrors.courseId = '골프장을 선택해주세요.';
        }

        // 권한 체크
        if (formData.role === 'super_admin' && !isSuperAdmin) {
            newErrors.role = '수퍼 관리자 권한이 없습니다.';
        }

        // 자신의 권한을 변경하려는 경우 체크
        if (userId === currentUser?.id && formData.role !== currentUser.role) {
            newErrors.role = '자신의 권한은 변경할 수 없습니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            // 골프장 정보 가져오기
            let courseName = '';
            if (formData.courseId) {
                const course = courses.find(c => c.id === formData.courseId);
                courseName = course?.name || '';
            }

            // Firestore에 사용자 정보 업데이트
            const userData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                role: formData.role,
                courseId: formData.courseId || null,
                courseName: courseName || null,
                isActive: formData.isActive,
                updatedAt: serverTimestamp(),
                updatedBy: currentUser?.id || null
            };

            await setDoc(doc(db, 'users', userId), userData, { merge: true });

            alert('회원 정보가 성공적으로 수정되었습니다.');
            router.push('/admin/users');

        } catch (error: any) {
            console.error('회원 정보 수정 실패:', error);
            setErrors({ submit: '회원 정보 수정에 실패했습니다.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));

        // 에러 메시지 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const getRoleOptions = () => {
        const options = [
            { value: 'user', label: '일반 회원' }
        ];

        if (isSuperAdmin) {
            options.push(
                { value: 'course_admin', label: '골프장 관리자' },
                { value: 'super_admin', label: '통합 관리자' }
            );
        } else if (currentUser?.role === 'course_admin') {
            options.push({ value: 'course_admin', label: '골프장 관리자' });
        }

        return options;
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleString('ko-KR');
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
                <h1>회원 정보 수정</h1>
                <div className="page-actions">
                    <Link href="/admin/users" className="btn btn-outline">
                        <i className="fas fa-arrow-left"></i>
                        목록으로
                    </Link>
                </div>
            </div>

            {/* 사용자 기본 정보 */}
            <div className="info-card">
                <h3>기본 정보</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <label>사용자 ID</label>
                        <span>{user.id}</span>
                    </div>
                    <div className="info-item">
                        <label>가입일</label>
                        <span>{formatDate(user.createdAt)}</span>
                    </div>
                    <div className="info-item">
                        <label>마지막 수정일</label>
                        <span>{formatDate(user.updatedAt)}</span>
                    </div>
                </div>
            </div>

            <div className="form-container">
                <form onSubmit={handleSubmit} className="admin-form">
                    {errors.submit && (
                        <div className="error-message">
                            {errors.submit}
                        </div>
                    )}

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="name">이름 *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                                placeholder="이름을 입력하세요"
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">이메일 *</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={errors.email ? 'error' : ''}
                                placeholder="example@email.com"
                            />
                            {errors.email && <span className="error-text">{errors.email}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="phone">전화번호</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="010-1234-5678"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">역할 *</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className={errors.role ? 'error' : ''}
                                disabled={userId === currentUser?.id} // 자신의 권한은 변경 불가
                            >
                                {getRoleOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.role && <span className="error-text">{errors.role}</span>}
                            {userId === currentUser?.id && (
                                <small className="form-help">자신의 권한은 변경할 수 없습니다.</small>
                            )}
                        </div>
                    </div>

                    {formData.role === 'course_admin' && (
                        <div className="form-group">
                            <label htmlFor="courseId">골프장 *</label>
                            <select
                                id="courseId"
                                name="courseId"
                                value={formData.courseId}
                                onChange={handleChange}
                                className={errors.courseId ? 'error' : ''}
                            >
                                <option value="">골프장을 선택하세요</option>
                                {courses.map(course => (
                                    <option key={course.id} value={course.id}>
                                        {course.name}
                                    </option>
                                ))}
                            </select>
                            {errors.courseId && <span className="error-text">{errors.courseId}</span>}
                        </div>
                    )}

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                            />
                            <span className="checkmark"></span>
                            활성 상태
                        </label>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}
                        >
                            {saving ? '저장 중...' : '정보 수정'}
                        </button>
                        <Link href="/admin/users" className="btn btn-outline">
                            취소
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
