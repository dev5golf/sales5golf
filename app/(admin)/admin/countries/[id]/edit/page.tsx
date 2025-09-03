"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../../../../lib/firebase';
import Link from 'next/link';
import '@/app/(admin)/admin.css';

interface Country {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

// generateStaticParams 함수 추가 (동적 라우팅을 위한 필수 함수)
export async function generateStaticParams() {
    // 빈 배열을 반환하여 모든 경로를 동적으로 생성
    return [];
}

export default function EditCountryPage() {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const router = useRouter();
    const params = useParams();
    const countryId = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [country, setCountry] = useState<Country | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        code: '',
        isActive: true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (countryId) {
            fetchCountry();
        }
    }, [countryId]);

    const fetchCountry = async () => {
        try {
            setLoading(true);
            const docRef = doc(db, 'countries', countryId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const countryData = {
                    id: docSnap.id,
                    ...docSnap.data()
                } as Country;

                setCountry(countryData);
                setFormData({
                    name: countryData.name,
                    code: countryData.code,
                    isActive: countryData.isActive
                });
            } else {
                alert('국가를 찾을 수 없습니다.');
                router.push('/admin/countries');
            }

        } catch (error) {
            console.error('국가 정보 가져오기 실패:', error);
            alert('국가 정보를 가져오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = '국가 이름을 입력해주세요.';
        }

        if (!formData.code.trim()) {
            newErrors.code = '국가 코드를 입력해주세요.';
        } else if (formData.code.length < 2) {
            newErrors.code = '국가 코드는 2자리 이상이어야 합니다.';
        }

        // 중복 체크 (자신 제외)
        if (formData.code !== country?.code || formData.name !== country?.name) {
            checkDuplicate();
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const checkDuplicate = async () => {
        try {
            const q = query(
                collection(db, 'countries'),
                where('code', '==', formData.code.toUpperCase())
            );
            const snapshot = await getDocs(q);

            const duplicateByCode = snapshot.docs.find(doc => doc.id !== countryId);
            if (duplicateByCode) {
                setErrors(prev => ({
                    ...prev,
                    code: '이미 존재하는 국가 코드입니다.'
                }));
                return;
            }

            // 이름 중복 체크
            const nameQuery = query(
                collection(db, 'countries'),
                where('name', '==', formData.name.trim())
            );
            const nameSnapshot = await getDocs(nameQuery);

            const duplicateByName = nameSnapshot.docs.find(doc => doc.id !== countryId);
            if (duplicateByName) {
                setErrors(prev => ({
                    ...prev,
                    name: '이미 존재하는 국가 이름입니다.'
                }));
                return;
            }

        } catch (error) {
            console.error('중복 체크 실패:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        setErrors({});

        try {
            const updateData = {
                name: formData.name.trim(),
                code: formData.code.trim().toUpperCase(),
                isActive: formData.isActive,
                updatedAt: serverTimestamp()
            };

            await updateDoc(doc(db, 'countries', countryId), updateData);

            alert('국가 정보가 성공적으로 수정되었습니다.');
            router.push('/admin/countries');

        } catch (error: any) {
            console.error('국가 수정 실패:', error);
            setErrors({ submit: '국가 수정에 실패했습니다.' });
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // 에러 메시지 제거
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>국가 정보를 불러오는 중...</p>
            </div>
        );
    }

    if (!country) {
        return (
            <div className="error-state">
                <i className="fas fa-exclamation-triangle"></i>
                <p>국가를 찾을 수 없습니다.</p>
                <Link href="/admin/countries" className="btn btn-primary">
                    목록으로 돌아가기
                </Link>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="page-header">
                <h1>국가 정보 수정</h1>
                <Link href="/admin/countries" className="btn btn-outline">
                    <i className="fas fa-arrow-left"></i>
                    목록으로
                </Link>
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
                            <label htmlFor="name">국가 이름 *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                                placeholder="예: 대한민국"
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="code">국가 코드 *</label>
                            <input
                                type="text"
                                id="code"
                                name="code"
                                value={formData.code}
                                onChange={handleChange}
                                className={errors.code ? 'error' : ''}
                                placeholder="예: KR"
                                maxLength={3}
                                disabled={country.code === 'KR'} // 기본 국가는 코드 수정 불가
                            />
                            {errors.code && <span className="error-text">{errors.code}</span>}
                            {country.code === 'KR' && (
                                <span className="form-help">기본 국가는 코드를 수정할 수 없습니다.</span>
                            )}
                        </div>
                    </div>

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
                            {saving ? '수정 중...' : '수정 완료'}
                        </button>
                        <Link href="/admin/countries" className="btn btn-outline">
                            취소
                        </Link>
                    </div>
                </form>
            </div>

            {/* 국가 정보 카드 */}
            <div className="info-card">
                <h3>국가 정보</h3>
                <div className="info-grid">
                    <div className="info-item">
                        <span className="info-label">국가 ID:</span>
                        <span className="info-value font-mono">{country.id}</span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">등록일:</span>
                        <span className="info-value">
                            {country.createdAt ?
                                country.createdAt.toDate().toLocaleDateString('ko-KR') :
                                '-'
                            }
                        </span>
                    </div>
                    <div className="info-item">
                        <span className="info-label">수정일:</span>
                        <span className="info-value">
                            {country.updatedAt ?
                                country.updatedAt.toDate().toLocaleDateString('ko-KR') :
                                '-'
                            }
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
