"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { Course } from '../../../../../types';
import '../../../admin.css';

export default function CourseDetailPage() {
    const { user: currentUser, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    // 권한 검사
    if (!authLoading && currentUser?.role !== 'super_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    useEffect(() => {
        if (courseId) {
            fetchCourse();
        }
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const courseDoc = await getDoc(doc(db, 'courses', courseId));

            if (courseDoc.exists()) {
                const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
                setCourse(courseData);
            } else {
                setError('골프장을 찾을 수 없습니다.');
            }
        } catch (error) {
            console.error('골프장 정보 가져오기 실패:', error);
            setError('골프장 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>골프장 정보를 불러오는 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="admin-page">
                <div className="error-message">
                    {error}
                </div>
                <button onClick={() => router.push('/admin/courses')} className="btn btn-primary">
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="admin-page">
                <div className="error-message">
                    골프장 정보를 찾을 수 없습니다.
                </div>
                <button onClick={() => router.push('/admin/courses')} className="btn btn-primary">
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>골프장 상세 정보</h1>
                <div className="page-actions">
                    <button onClick={() => router.push('/admin/courses')} className="btn btn-outline">
                        <i className="fas fa-arrow-left"></i>
                        목록으로
                    </button>
                    <button
                        onClick={() => router.push(`/admin/courses/${course.id}/edit`)}
                        className="btn btn-primary"
                    >
                        <i className="fas fa-edit"></i>
                        수정하기
                    </button>
                </div>
            </div>

            <div className="detail-container">
                <div className="detail-card">
                    <div className="detail-header">
                        <h2>{course.name}</h2>
                        <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                            {course.isActive ? '활성' : '비활성'}
                        </span>
                    </div>

                    <div className="detail-content">
                        <div className="detail-section">
                            <h3>기본 정보</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>골프장명</label>
                                    <span>{course.name}</span>
                                </div>
                                <div className="detail-item">
                                    <label>전화번호</label>
                                    <span>{course.phone}</span>
                                </div>
                                <div className="detail-item">
                                    <label>가격</label>
                                    <span>{course.price ? `${course.price.toLocaleString()}원` : '미설정'}</span>
                                </div>
                                <div className="detail-item">
                                    <label>주소</label>
                                    <span>{course.address}</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>지역 정보</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>국가</label>
                                    <span>{course.countryName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>지방</label>
                                    <span>{course.provinceName}</span>
                                </div>
                                <div className="detail-item">
                                    <label>도시</label>
                                    <span>{course.cityName}</span>
                                </div>
                            </div>
                        </div>

                        <div className="detail-section">
                            <h3>시스템 정보</h3>
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label>등록일</label>
                                    <span>{formatDate(course.createdAt)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>수정일</label>
                                    <span>{formatDate(course.updatedAt)}</span>
                                </div>
                                <div className="detail-item">
                                    <label>상태</label>
                                    <span className={`status-badge ${course.isActive ? 'active' : 'inactive'}`}>
                                        {course.isActive ? '활성' : '비활성'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
