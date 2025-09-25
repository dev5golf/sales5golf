"use client";
import { useState, useEffect } from 'react';
import { User } from '@/app/(admin)/admin/users/types';
import { db } from '@/lib/firebase';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import Modal from '@/app/(admin)/admin/components/Modal';

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user?: User | null;
    currentUser?: User | null;
    onSave: () => void;
}

export default function UserModal({ isOpen, onClose, user, currentUser, onSave }: UserModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'user' as 'user' | 'course_admin' | 'super_admin' | 'site_admin',
        isActive: true,
        courseId: '',
        password: ''
    });

    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Firebase Admin SDK API를 통한 사용자 생성
    const createUserWithAdminAPI = async (userData: any) => {
        try {
            const response = await fetch('/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || '사용자 생성에 실패했습니다.');
            }

            return result;
        } catch (error) {
            console.error('API 사용자 생성 실패:', error);
            throw error;
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCourses();
            if (user) {
                setFormData({
                    name: user.name || '',
                    email: user.email || '',
                    phone: user.phone || '',
                    role: user.role || 'user',
                    isActive: user.isActive !== undefined ? user.isActive : true,
                    courseId: user.courseId || '',
                    password: ''
                });
            } else {
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: 'user',
                    isActive: true,
                    courseId: '',
                    password: ''
                });
            }
        }
    }, [isOpen, user]);

    const fetchCourses = async () => {
        try {
            const coursesRef = collection(db, 'courses');
            const snapshot = await getDocs(coursesRef);
            const coursesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setCourses(coursesData);
        } catch (error) {
            console.error('골프장 데이터 가져오기 실패:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const userData = { ...formData };

            // 새 사용자 생성 시에만 비밀번호 포함
            if (!user && userData.password) {
                // 실제로는 Firebase Auth를 사용해야 하지만, 여기서는 간단히 처리
                delete userData.password;
            } else if (user) {
                // 수정 시에는 비밀번호 제외
                delete userData.password;
            }

            if (user) {
                // 수정
                const userRef = doc(db, 'users', user.id);
                await updateDoc(userRef, userData);
                alert('회원 정보가 성공적으로 수정되었습니다.');
                onSave();
                onClose();
            } else {
                // 생성 - Firebase Authentication + Firestore 통합
                if (!formData.password) {
                    alert('비밀번호를 입력해주세요.');
                } else {
                    // Firebase Admin SDK API를 통한 사용자 생성
                    await createUserWithAdminAPI({
                        name: formData.name,
                        email: formData.email,
                        password: formData.password,
                        phone: formData.phone,
                        role: formData.role,
                        isActive: formData.isActive,
                        courseId: formData.courseId
                    });

                    // 등록 완료 (관리자 세션은 그대로 유지됨)
                    alert('회원이 성공적으로 등록되었습니다.');
                    onSave();
                    onClose();
                }
            }
        } catch (error: any) {
            console.error('사용자 저장 실패:', error);
            alert('회원 등록에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={user ? '사용자 수정' : '사용자 등록'}
            size="md"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        이름 *
                    </label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        이메일 *
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        disabled={!!user} // 수정 모드일 때 비활성화
                        placeholder={!user ? "이메일은 등록 후 수정할 수 없습니다" : ""}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${!!user ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {user && (
                        <p className="text-xs text-gray-500 mt-1">이메일은 수정할 수 없습니다.</p>
                    )}
                </div>

                {!user && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            비밀번호 *
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required={!user}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        전화번호
                    </label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        역할 *
                    </label>
                    <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="user">일반 사용자</option>
                        <option value="course_admin">골프장 관리자</option>
                        <option value="site_admin">사이트 관리자</option>
                        {currentUser?.role === 'super_admin' && (
                            <option value="super_admin">통합 관리자</option>
                        )}
                    </select>
                </div>

                {formData.role === 'course_admin' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            담당 골프장
                        </label>
                        <select
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">선택하세요</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id}>
                                    {course.name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        상태
                    </label>
                    <select
                        name="isActive"
                        value={formData.isActive ? 'active' : 'inactive'}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'active' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {loading ? '저장 중...' : '저장'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
