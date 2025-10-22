"use client";
import { useState, useEffect } from 'react';
import { CourseWithTranslations, CourseTranslation } from '@/types';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore';
import Modal from '@/app/(admin)/admin/components/Modal';
import { useAuth } from '@/contexts/AuthContext';
import { useCountries, useProvinces, useCities } from '@/hooks/useRegions';
import { getInclusionOptions } from '@/constants/courseConstants';

interface CourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    course?: CourseWithTranslations | null;
    onSave: () => void;
}

export default function CourseModal({ isOpen, onClose, course, onSave }: CourseModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        nameKo: '',
        nameEn: '',
        countryId: '',
        countryName: '',
        provinceId: '',
        provinceName: '',
        cityId: '',
        cityName: '',
        inclusions: [] as string[],
        adminIds: [] as string[],
        isActive: true,
        googleMapsLink: ''
    });

    // Custom hooks 사용
    const { countries } = useCountries();
    const { provinces } = useProvinces(formData.countryId);
    const { cities } = useCities(formData.provinceId);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (course) {
                setFormData({
                    nameKo: course.translations?.ko?.name || '',
                    nameEn: course.translations?.en?.name || '',
                    countryId: (course as any).countryId || (course as any).countryCode || '',
                    countryName: course.countryName || '',
                    provinceId: (course as any).provinceId || (course as any).provinceCode || '',
                    provinceName: course.provinceName || '',
                    cityId: (course as any).cityId || (course as any).cityCode || '',
                    cityName: course.cityName || '',
                    inclusions: course.inclusions || [],
                    adminIds: course.adminIds || [],
                    isActive: course.isActive !== undefined ? course.isActive : true,
                    googleMapsLink: course.googleMapsLink || ''
                });
            } else {
                setFormData({
                    nameKo: '',
                    nameEn: '',
                    countryId: '',
                    countryName: '',
                    provinceId: '',
                    provinceName: '',
                    cityId: '',
                    cityName: '',
                    inclusions: [],
                    adminIds: [],
                    isActive: true,
                    googleMapsLink: ''
                });
            }
        }
    }, [isOpen, course]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nameKo.trim() || !formData.nameEn.trim()) {
            alert('골프장명 한글과 영어를 모두 입력해주세요.');
            return;
        }

        setLoading(true);

        try {
            if (course) {
                // 수정
                const { nameKo, nameEn, ...courseData } = formData;

                // 1. 골프장 메인 정보 업데이트
                const courseRef = doc(db, 'courses', course.id);
                await updateDoc(courseRef, {
                    ...courseData,
                    updatedAt: serverTimestamp()
                });

                // 2. 한국어 번역 업데이트
                const koTranslation: CourseTranslation = {
                    name: nameKo.trim()
                };
                await setDoc(
                    doc(db, 'courses', course.id, 'translations', 'ko'),
                    koTranslation
                );

                // 3. 영어 번역 업데이트
                const enTranslation: CourseTranslation = {
                    name: nameEn.trim()
                };
                await setDoc(
                    doc(db, 'courses', course.id, 'translations', 'en'),
                    enTranslation
                );
            } else {
                // 생성 - 순차적 ID 생성
                const coursesRef = collection(db, 'courses');
                const snapshot = await getDocs(coursesRef);
                const existingIds = snapshot.docs.map(doc => doc.id);

                // 골프장 ID 찾기 (G_0001, G_0002, ...)
                let courseId = 'G_0001';
                let counter = 1;
                while (existingIds.includes(courseId)) {
                    counter++;
                    courseId = `G_${counter.toString().padStart(4, '0')}`;
                }

                const { nameKo, nameEn, ...courseData } = formData;

                // 1. 골프장 메인 정보 저장
                const courseRef = doc(db, 'courses', courseId);
                await setDoc(courseRef, {
                    ...courseData,
                    id: courseId,
                    adminIds: user?.id ? [user.id] : [],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                    createdBy: user?.id || null
                });

                // 2. 한국어 번역 저장
                const koTranslation: CourseTranslation = {
                    name: nameKo.trim()
                };
                await setDoc(
                    doc(db, 'courses', courseId, 'translations', 'ko'),
                    koTranslation
                );

                // 3. 영어 번역 저장
                const enTranslation: CourseTranslation = {
                    name: nameEn.trim()
                };
                await setDoc(
                    doc(db, 'courses', courseId, 'translations', 'en'),
                    enTranslation
                );
            }
            onSave();
            onClose();
        } catch (error) {
            console.error('골프장 저장 실패:', error);
            alert('저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        if (name === 'countryId') {
            const selectedCountry = countries.find(country => country.id === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                countryName: selectedCountry?.name || '',
                provinceId: '',
                provinceName: '',
                cityId: '',
                cityName: ''
            }));
        } else if (name === 'provinceId') {
            const selectedProvince = provinces.find(province => province.id === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                provinceName: selectedProvince?.name || '',
                cityId: '',
                cityName: ''
            }));
        } else if (name === 'cityId') {
            const selectedCity = cities.find(city => city.id === value);
            setFormData(prev => ({
                ...prev,
                [name]: value,
                cityName: selectedCity?.name || ''
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={course ? '골프장 수정' : '골프장 등록'}
            size="lg"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            골프장명 (한글) *
                        </label>
                        <input
                            type="text"
                            name="nameKo"
                            value={formData.nameKo}
                            onChange={handleInputChange}
                            required
                            placeholder="예: 제주 핀크스"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            골프장명 (영어) *
                        </label>
                        <input
                            type="text"
                            name="nameEn"
                            value={formData.nameEn}
                            onChange={handleInputChange}
                            required
                            placeholder="예: Jeju Pinx"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            국가 *
                        </label>
                        <select
                            name="countryId"
                            value={formData.countryId}
                            onChange={handleInputChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">선택하세요</option>
                            {countries.map(country => (
                                <option key={country.id} value={country.id}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            지역
                        </label>
                        <select
                            name="provinceId"
                            value={formData.provinceId}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">선택하세요</option>
                            {provinces.map(province => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        도시
                    </label>
                    <select
                        name="cityId"
                        value={formData.cityId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">선택하세요</option>
                        {cities.map(city => (
                            <option key={city.id} value={city.id}>
                                {city.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        포함사항
                    </label>
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-4">
                            {getInclusionOptions('ko').map(({ code, label }) => (
                                <label key={code} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        checked={formData.inclusions.includes(code)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    inclusions: [...prev.inclusions, code]
                                                }));
                                            } else {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    inclusions: prev.inclusions.filter(i => i !== code)
                                                }));
                                            }
                                        }}
                                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        구글맵 링크
                    </label>
                    <input
                        type="url"
                        name="googleMapsLink"
                        value={formData.googleMapsLink}
                        onChange={handleInputChange}
                        placeholder="https://maps.google.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        골프장 위치의 구글맵 링크를 입력하세요.
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        상태
                    </label>
                    <select
                        name="isActive"
                        value={formData.isActive ? 'true' : 'false'}
                        onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="true">활성</option>
                        <option value="false">비활성</option>
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
