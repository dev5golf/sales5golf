"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../../contexts/AuthContext';
import { collection, getDocs, doc, setDoc, serverTimestamp, query, where } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import Link from 'next/link';
import '@/app/(admin)/admin.css';

interface Country {
    id: string;
    name: string;
    code: string;
}

interface Province {
    id: string;
    name: string;
    code: string;
    countryCode: string;
}

interface City {
    id: string;
    name: string;
    code: string;
    provinceCode: string;
}

export default function CreateCoursePage() {
    const { user: currentUser, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // 권한 검사 - 수퍼관리자가 아니면 아예 렌더링하지 않음
    if (!authLoading && currentUser?.role !== 'super_admin') {
        router.push('/admin/tee-times');
        return null;
    }
    const [countries, setCountries] = useState<Country[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        countryCode: '',
        provinceCode: '',
        cityCode: '',
        phone: '',
        description: '',
        price: '',
        isActive: true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchCountries();
    }, []);

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

    const generateNextCourseId = async () => {
        try {
            const q = query(collection(db, 'courses'), where('id', '>=', 'course_0001'), where('id', '<=', 'course_9999'));
            const snapshot = await getDocs(q);

            let maxNumber = 0;
            snapshot.docs.forEach(doc => {
                const id = doc.id;
                const match = id.match(/course_(\d{4})$/);
                if (match) {
                    const number = parseInt(match[1]);
                    if (number > maxNumber) {
                        maxNumber = number;
                    }
                }
            });

            const nextNumber = maxNumber + 1;
            return `course_${nextNumber.toString().padStart(4, '0')}`;
        } catch (error) {
            console.error('골프장 ID 생성 실패:', error);
            // 오류 시 기본값 반환
            return `course_0001`;
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = '골프장 이름을 입력해주세요.';
        }

        if (!formData.address.trim()) {
            newErrors.address = '주소를 입력해주세요.';
        }

        if (!formData.countryCode) {
            newErrors.countryCode = '국가를 선택해주세요.';
        }

        if (!formData.provinceCode) {
            newErrors.provinceCode = '지방을 선택해주세요.';
        }

        if (!formData.cityCode) {
            newErrors.cityCode = '도시를 선택해주세요.';
        }

        if (!formData.phone.trim()) {
            newErrors.phone = '전화번호를 입력해주세요.';
        }

        if (!formData.price.trim()) {
            newErrors.price = '가격을 입력해주세요.';
        } else if (isNaN(Number(formData.price)) || Number(formData.price) < 0) {
            newErrors.price = '올바른 가격을 입력해주세요.';
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
            // 지역 정보 가져오기
            const country = countries.find(c => c.code === formData.countryCode);
            const province = provinces.find(p => p.code === formData.provinceCode);
            const city = cities.find(c => c.code === formData.cityCode);

            // 골프장 ID 생성 (순차적)
            const courseId = await generateNextCourseId();

            // Firestore에 골프장 정보 저장
            const courseData = {
                id: courseId,
                name: formData.name,
                address: formData.address,
                countryCode: formData.countryCode,
                provinceCode: formData.provinceCode,
                cityCode: formData.cityCode,
                countryName: country?.name || '',
                provinceName: province?.name || '',
                cityName: city?.name || '',
                phone: formData.phone,
                description: formData.description || '',
                price: Number(formData.price),
                images: [],
                adminIds: [],
                isActive: formData.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                createdBy: currentUser?.id || null
            };

            await setDoc(doc(db, 'courses', courseId), courseData);

            alert('골프장이 성공적으로 등록되었습니다.');
            router.push('/admin/courses');

        } catch (error: any) {
            console.error('골프장 등록 실패:', error);
            setErrors({ submit: '골프장 등록에 실패했습니다.' });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

        // 지역 선택 시 하위 지역 초기화 및 로드
        if (name === 'countryCode') {
            setFormData(prev => ({
                ...prev,
                countryCode: value,
                provinceCode: '',
                cityCode: ''
            }));
            setProvinces([]);
            setCities([]);
            if (value) {
                fetchProvinces(value);
            }
        } else if (name === 'provinceCode') {
            setFormData(prev => ({
                ...prev,
                provinceCode: value,
                cityCode: ''
            }));
            setCities([]);
            if (value) {
                fetchCities(value);
            }
        }
    };

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>골프장 등록</h1>
                <div className="page-actions">
                    <Link href="/admin/courses" className="btn btn-outline">
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
                            <label htmlFor="name">골프장 이름 *</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={errors.name ? 'error' : ''}
                                placeholder="골프장 이름을 입력하세요"
                            />
                            {errors.name && <span className="error-text">{errors.name}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="phone">전화번호 *</label>
                            <input
                                type="tel"
                                id="phone"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={errors.phone ? 'error' : ''}
                                placeholder="031-123-4567"
                            />
                            {errors.phone && <span className="error-text">{errors.phone}</span>}
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="countryCode">국가 *</label>
                            <select
                                id="countryCode"
                                name="countryCode"
                                value={formData.countryCode}
                                onChange={handleChange}
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
                                name="provinceCode"
                                value={formData.provinceCode}
                                onChange={handleChange}
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
                                name="cityCode"
                                value={formData.cityCode}
                                onChange={handleChange}
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

                        <div className="form-group">
                            <label htmlFor="address">상세 주소 *</label>
                            <input
                                type="text"
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={errors.address ? 'error' : ''}
                                placeholder="상세 주소를 입력하세요"
                            />
                            {errors.address && <span className="error-text">{errors.address}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">골프장 설명</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            placeholder="골프장에 대한 설명을 입력하세요"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="price">가격 (원) *</label>
                        <input
                            type="number"
                            id="price"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            className={errors.price ? 'error' : ''}
                            placeholder="예: 2300000"
                            min="0"
                        />
                        {errors.price && <span className="error-text">{errors.price}</span>}
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
                            disabled={loading}
                        >
                            {loading ? '등록 중...' : '골프장 등록'}
                        </button>
                        <Link href="/admin/courses" className="btn btn-outline">
                            취소
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
