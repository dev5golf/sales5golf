"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '../../../../../../contexts/AuthContext';
import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../../../../../lib/firebase';
import { Course, Country, Province, City } from '../../../../../../types';
import '../../../../admin.css';

export default function EditCoursePage() {
    const { user: currentUser, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [countries, setCountries] = useState<Country[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        countryCode: '',
        provinceCode: '',
        cityCode: '',
        price: '',
        isActive: true
    });

    // 권한 검사
    if (!authLoading && currentUser?.role !== 'super_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    useEffect(() => {
        if (courseId) {
            fetchCourse();
            fetchCountries();
        }
    }, [courseId]);

    useEffect(() => {
        if (formData.countryCode && formData.countryCode !== 'all') {
            fetchProvinces(formData.countryCode);
        } else {
            setProvinces([]);
            setCities([]);
        }
    }, [formData.countryCode]);

    useEffect(() => {
        if (formData.provinceCode && formData.provinceCode !== 'all') {
            fetchCities(formData.provinceCode);
        } else {
            setCities([]);
        }
    }, [formData.provinceCode]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const courseDoc = await getDoc(doc(db, 'courses', courseId));

            if (courseDoc.exists()) {
                const courseData = { id: courseDoc.id, ...courseDoc.data() } as Course;
                setCourse(courseData);
                setFormData({
                    name: courseData.name || '',
                    address: courseData.address || '',
                    phone: courseData.phone || '',
                    countryCode: courseData.countryCode || '',
                    provinceCode: courseData.provinceCode || '',
                    cityCode: courseData.cityCode || '',
                    price: courseData.price ? courseData.price.toString() : '',
                    isActive: courseData.isActive !== false
                });
            } else {
                setErrors({ general: '골프장을 찾을 수 없습니다.' });
            }
        } catch (error) {
            console.error('골프장 정보 가져오기 실패:', error);
            setErrors({ general: '골프장 정보를 가져오는데 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'countries'));
            const countryData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Country[];
            setCountries(countryData);
        } catch (error) {
            console.error('국가 목록 가져오기 실패:', error);
        }
    };

    const fetchProvinces = async (countryCode: string) => {
        try {
            const q = query(collection(db, 'provinces'), where('countryCode', '==', countryCode));
            const snapshot = await getDocs(q);
            const provinceData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Province[];
            setProvinces(provinceData);
        } catch (error) {
            console.error('지방 목록 가져오기 실패:', error);
        }
    };

    const fetchCities = async (provinceCode: string) => {
        try {
            const q = query(collection(db, 'cities'), where('provinceCode', '==', provinceCode));
            const snapshot = await getDocs(q);
            const cityData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as City[];
            setCities(cityData);
        } catch (error) {
            console.error('도시 목록 가져오기 실패:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setErrors({});

        // 유효성 검사
        const newErrors: Record<string, string> = {};
        if (!formData.name.trim()) newErrors.name = '골프장명을 입력해주세요.';
        if (!formData.address.trim()) newErrors.address = '주소를 입력해주세요.';
        if (!formData.phone.trim()) newErrors.phone = '전화번호를 입력해주세요.';
        if (!formData.countryCode) newErrors.countryCode = '국가를 선택해주세요.';
        if (!formData.provinceCode) newErrors.provinceCode = '지방을 선택해주세요.';
        if (!formData.cityCode) newErrors.cityCode = '도시를 선택해주세요.';
        if (!formData.price.trim()) newErrors.price = '가격을 입력해주세요.';
        else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) newErrors.price = '올바른 가격을 입력해주세요.';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setSaving(false);
            return;
        }

        try {
            const selectedCountry = countries.find(c => c.code === formData.countryCode);
            const selectedProvince = provinces.find(p => p.code === formData.provinceCode);
            const selectedCity = cities.find(c => c.code === formData.cityCode);

            const courseData = {
                name: formData.name.trim(),
                address: formData.address.trim(),
                phone: formData.phone.trim(),
                countryCode: formData.countryCode,
                countryName: selectedCountry?.name || '',
                provinceCode: formData.provinceCode,
                provinceName: selectedProvince?.name || '',
                cityCode: formData.cityCode,
                cityName: selectedCity?.name || '',
                price: Number(formData.price),
                isActive: formData.isActive,
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'courses', courseId), courseData, { merge: true });
            alert('골프장 정보가 성공적으로 수정되었습니다.');
            router.push('/admin/courses');
        } catch (error) {
            console.error('골프장 수정 실패:', error);
            setErrors({ submit: '골프장 수정에 실패했습니다.' });
        } finally {
            setSaving(false);
        }
    };

    // 골프장 삭제 함수
    const handleDeleteCourse = async () => {
        if (!course) return;

        const confirmMessage = `"${course.name}" 골프장을 삭제하시겠습니까?\n\n주의: 이 작업은 되돌릴 수 없으며, 골프장과 관련된 모든 데이터가 삭제됩니다.`;

        if (!confirm(confirmMessage)) {
            return;
        }

        try {
            setSaving(true);
            await deleteDoc(doc(db, 'courses', courseId));
            alert('골프장이 성공적으로 삭제되었습니다.');
            router.push('/admin/courses');
        } catch (error) {
            console.error('골프장 삭제 실패:', error);
            setErrors({ submit: '골프장 삭제에 실패했습니다.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>골프장 정보를 불러오는 중...</p>
            </div>
        );
    }

    if (errors.general) {
        return (
            <div className="admin-page">
                <div className="error-message">
                    {errors.general}
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
                <h1>골프장 수정</h1>
                <div className="page-actions">
                    <button onClick={() => router.push('/admin/courses')} className="btn btn-outline">
                        <i className="fas fa-arrow-left"></i>
                        목록으로
                    </button>
                    <button
                        onClick={handleDeleteCourse}
                        className="btn btn-danger"
                        disabled={saving}
                    >
                        <i className="fas fa-trash"></i>
                        삭제
                    </button>
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
                            <label htmlFor="name">골프장명 *</label>
                            <input
                                type="text"
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                className={errors.name ? 'error' : ''}
                                placeholder="골프장명을 입력하세요"
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="phone">전화번호 *</label>
                            <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                className={errors.phone ? 'error' : ''}
                                placeholder="전화번호를 입력하세요"
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="address">주소 *</label>
                            <input
                                type="text"
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                                className={errors.address ? 'error' : ''}
                                placeholder="주소를 입력하세요"
                            />
                            {errors.address && <span className="error-text">{errors.address}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="countryCode">국가 *</label>
                            <select
                                id="countryCode"
                                value={formData.countryCode}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    countryCode: e.target.value,
                                    provinceCode: '',
                                    cityCode: ''
                                }))}
                                className={errors.countryCode ? 'error' : ''}
                            >
                                <option value="">국가를 선택하세요</option>
                                {countries.map(country => (
                                    <option key={country.id} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </select>
                            {errors.countryCode && <span className="error-text">{errors.countryCode}</span>}
                        </div>
                        <div className="form-group">
                            <label htmlFor="provinceCode">지방 *</label>
                            <select
                                id="provinceCode"
                                value={formData.provinceCode}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    provinceCode: e.target.value,
                                    cityCode: ''
                                }))}
                                className={errors.provinceCode ? 'error' : ''}
                                disabled={!formData.countryCode}
                            >
                                <option value="">지방을 선택하세요</option>
                                {provinces.map(province => (
                                    <option key={province.id} value={province.code}>
                                        {province.name}
                                    </option>
                                ))}
                            </select>
                            {errors.provinceCode && <span className="error-text">{errors.provinceCode}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="cityCode">도시 *</label>
                            <select
                                id="cityCode"
                                value={formData.cityCode}
                                onChange={(e) => setFormData(prev => ({ ...prev, cityCode: e.target.value }))}
                                className={errors.cityCode ? 'error' : ''}
                                disabled={!formData.provinceCode}
                            >
                                <option value="">도시를 선택하세요</option>
                                {cities.map(city => (
                                    <option key={city.id} value={city.code}>
                                        {city.name}
                                    </option>
                                ))}
                            </select>
                            {errors.cityCode && <span className="error-text">{errors.cityCode}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">가격 (원) *</label>
                            <input
                                type="number"
                                id="price"
                                value={formData.price}
                                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                                className={errors.price ? 'error' : ''}
                                placeholder="예: 2300000"
                                min="0"
                            />
                            {errors.price && <span className="error-text">{errors.price}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                                />
                                <span className="checkmark"></span>
                                활성 상태
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary" disabled={saving}>
                            {saving ? '수정 중...' : '수정하기'}
                        </button>
                        <button type="button" onClick={() => router.push('/admin/courses')} className="btn btn-outline">
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
