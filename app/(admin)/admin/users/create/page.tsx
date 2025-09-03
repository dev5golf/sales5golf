"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../../../../lib/firebase';
import Link from 'next/link';
import { Course } from '../../../../../types';
import '@/app/(admin)/admin.css';

export default function CreateUserPage() {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [courses, setCourses] = useState<Course[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: 'user' as 'user' | 'course_admin' | 'super_admin',
        courseId: '',
        isActive: true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchCourses();
    }, []);

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

        if (!formData.password) {
            newErrors.password = '비밀번호를 입력해주세요.';
        } else if (formData.password.length < 6) {
            newErrors.password = '비밀번호는 최소 6자 이상이어야 합니다.';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.';
        }

        if (formData.role === 'course_admin' && !formData.courseId) {
            newErrors.courseId = '골프장을 선택해주세요.';
        }

        // 권한 체크
        if (formData.role === 'super_admin' && !isSuperAdmin) {
            newErrors.role = '수퍼 관리자 권한이 없습니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});

        try {
            // 1. Firebase Auth에 사용자 생성
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            // 2. 골프장 정보 가져오기
            let courseName = '';
            if (formData.courseId) {
                const course = courses.find(c => c.id === formData.courseId);
                courseName = course?.name || '';
            }

            // 3. Firestore에 사용자 정보 저장
            const userData = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || '',
                role: formData.role,
                courseId: formData.courseId || null,
                courseName: courseName || null,
                isActive: formData.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                lastLoginAt: null,
                createdBy: currentUser?.id || null
            };

            await setDoc(doc(db, 'users', user.uid), userData);

            alert('회원이 성공적으로 등록되었습니다.');
            router.push('/admin/users');

        } catch (error: any) {
            console.error('회원 등록 실패:', error);

            let errorMessage = '회원 등록에 실패했습니다.';
            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = '이미 사용 중인 이메일입니다.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = '유효하지 않은 이메일 형식입니다.';
                    break;
                case 'auth/weak-password':
                    errorMessage = '비밀번호가 너무 약합니다.';
                    break;
            }

            setErrors({ submit: errorMessage });
        } finally {
            setLoading(false);
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

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>회원 등록</h1>
                <div className="page-actions">
                    <Link href="/admin/users" className="btn btn-outline">
                        <i className="fas fa-arrow-left"></i>
                        목록으로
                    </Link>
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
                            <label htmlFor="password">비밀번호 *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={errors.password ? 'error' : ''}
                                placeholder="최소 6자 이상"
                            />
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="confirmPassword">비밀번호 확인 *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className={errors.confirmPassword ? 'error' : ''}
                                placeholder="비밀번호를 다시 입력하세요"
                            />
                            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
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
                            >
                                {getRoleOptions().map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                            {errors.role && <span className="error-text">{errors.role}</span>}
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
                            disabled={loading}
                        >
                            {loading ? '등록 중...' : '회원 등록'}
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
