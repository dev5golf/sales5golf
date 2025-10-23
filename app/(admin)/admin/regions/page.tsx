"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '@/components/ui/table';
import { CountryWithTranslations, CountryTranslation, CityWithTranslations, CityTranslation } from '@/types';
import '../../admin.css';

type TabType = 'countries' | 'cities';

export default function RegionsPage() {
    const { user: currentUser, isSuperAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('countries');

    // 권한 검사 - 수퍼관리자와 사이트 관리자만 접근 가능
    if (!authLoading && currentUser?.role !== 'super_admin' && currentUser?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    // 데이터 상태
    const [countries, setCountries] = useState<CountryWithTranslations[]>([]);
    const [cities, setCities] = useState<CityWithTranslations[]>([]);
    const [cityCountByCountry, setCityCountByCountry] = useState<Record<string, number>>({});

    // 로딩 상태
    const [loading, setLoading] = useState(true);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);

    // 검색 및 필터 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // 폼 상태
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCountry, setNewCountry] = useState({
        nameKo: '',
        nameEn: '',
        code: '',
        isActive: true
    });
    const [newCity, setNewCity] = useState({ nameKo: '', nameEn: '', code: '', countryCode: '', isActive: true });

    // 편집 상태
    const [editingItem, setEditingItem] = useState<{ type: string, id: string, data: any } | null>(null);
    const [editCountry, setEditCountry] = useState({ name: '', nameEn: '', code: '', isActive: true });
    const [editCity, setEditCity] = useState({ name: '', nameEn: '', code: '', countryCode: '', isActive: true });

    // 오류 상태
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchAllData();
    }, []);

    // 도시 데이터가 변경될 때마다 도시 수 재계산
    useEffect(() => {
        calculateCityCountByCountry();
    }, [cities]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchCountries(),
                fetchCities()
            ]);
            // 도시 수 계산
            calculateCityCountByCountry();
        } finally {
            setLoading(false);
        }
    };

    const fetchCountries = async () => {
        try {
            const snapshot = await getDocs(collection(db, 'countries'));

            // 각 국가의 번역 데이터도 함께 가져오기
            const countryDataPromises = snapshot.docs.map(async (countryDoc) => {
                const translationsSnapshot = await getDocs(
                    collection(db, 'countries', countryDoc.id, 'translations')
                );

                const translations: { [key: string]: CountryTranslation } = {};
                translationsSnapshot.docs.forEach(transDoc => {
                    translations[transDoc.id] = transDoc.data() as CountryTranslation;
                });

                return {
                    id: countryDoc.id,
                    ...countryDoc.data(),
                    translations,
                    name: translations['ko']?.name || translations['en']?.name || countryDoc.id // 기본값으로 한글명 사용
                } as CountryWithTranslations;
            });

            const countryData = await Promise.all(countryDataPromises);
            setCountries(countryData);
        } catch (error) {
            console.error('국가 목록 가져오기 실패:', error);
        }
    };

    const fetchCities = async () => {
        try {
            // Collection Group으로 모든 국가의 도시 조회
            const { collectionGroup } = await import('firebase/firestore');
            const snapshot = await getDocs(collectionGroup(db, 'cities'));

            const citiesWithTranslations = await Promise.all(
                snapshot.docs.map(async (docSnap) => {
                    const cityData = docSnap.data() as CityWithTranslations;
                    cityData.id = docSnap.id;

                    // countryId 추출 (경로: countries/{countryId}/cities/{cityId})
                    const pathSegments = docSnap.ref.path.split('/');
                    cityData.countryId = pathSegments[1];

                    // translations 서브컬렉션 가져오기
                    const translationsSnapshot = await getDocs(
                        collection(db, 'countries', cityData.countryId, 'cities', docSnap.id, 'translations')
                    );

                    const translations: { [key: string]: CityTranslation } = {};
                    translationsSnapshot.forEach(transDoc => {
                        translations[transDoc.id] = transDoc.data() as CityTranslation;
                    });

                    cityData.translations = translations;
                    // 표시용 이름 설정 (한국어 우선, 없으면 영어, 없으면 ID)
                    cityData.name = translations['ko']?.name || translations['en']?.name || cityData.id;

                    // 국가 이름 가져오기
                    try {
                        const countryDoc = await getDoc(doc(db, 'countries', cityData.countryId));
                        if (countryDoc.exists()) {
                            const countryTranslationsSnapshot = await getDocs(
                                collection(db, 'countries', cityData.countryId, 'translations')
                            );
                            const countryTranslations: { [key: string]: CountryTranslation } = {};
                            countryTranslationsSnapshot.forEach(transDoc => {
                                countryTranslations[transDoc.id] = transDoc.data() as CountryTranslation;
                            });
                            cityData.countryName = countryTranslations['ko']?.name || countryTranslations['en']?.name || cityData.countryId;
                        } else {
                            cityData.countryName = '알 수 없음';
                        }
                    } catch (error) {
                        cityData.countryName = '알 수 없음';
                    }

                    return cityData;
                })
            );

            // 이름으로 정렬
            citiesWithTranslations.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

            setCities(citiesWithTranslations);
        } catch (error) {
            console.error('도시 목록 가져오기 실패:', error);
            // Collection Group 권한이 없거나 도시가 없을 경우 빈 배열 설정
            setCities([]);
        }
    };

    // 국가별 도시 수 계산 함수
    const calculateCityCountByCountry = () => {
        const countMap: Record<string, number> = {};

        cities.forEach(city => {
            const countryId = city.countryId;
            if (countryId) {
                countMap[countryId] = (countMap[countryId] || 0) + 1;
            }
        });

        setCityCountByCountry(countMap);
    };

    // 자동 코드 생성 함수들
    const getLastCityCodeByCountry = async (countryCode: string) => {
        try {
            setIsGeneratingCode(true);
            console.log('getLastCityCodeByCountry 호출됨, countryCode:', countryCode);

            // 해당 국가의 도시 서브컬렉션 조회
            const citiesRef = collection(db, 'countries', countryCode, 'cities');
            const snapshot = await getDocs(citiesRef);

            let lastCode = '000';

            for (const docSnap of snapshot.docs) {
                const cityCode = docSnap.id; // doc.id 사용 (예: KR_001 또는 001)
                console.log('도시 코드 확인:', cityCode);

                const match = cityCode.match(/(\d{3})$/);
                if (match) {
                    const currentCode = match[1];
                    if (parseInt(currentCode) > parseInt(lastCode)) {
                        lastCode = currentCode;
                        console.log('더 큰 코드 발견:', lastCode);
                    }
                }
            }

            console.log('최종 반환 코드:', lastCode);
            return lastCode;
        } catch (error) {
            console.error('cities 데이터 조회 실패:', error);
            return '000';
        } finally {
            setIsGeneratingCode(false);
        }
    };


    // 국가 선택 시 시도 코드 자동 생성
    const handleCountryChangeForCity = async (countryCode: string) => {
        setNewCity(prev => ({ ...prev, countryCode, code: '' }));

        if (countryCode) {
            const lastCode = await getLastCityCodeByCountry(countryCode);
            const nextCodeNumber = (parseInt(lastCode) + 1).toString().padStart(3, '0');
            const cityCode = `${countryCode}_${nextCodeNumber}`;

            setNewCity(prev => ({ ...prev, code: cityCode }));
        }
    };


    // 국가 등록
    const handleAddCountry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCountry.nameKo.trim() || !newCountry.nameEn.trim() || !newCountry.code.trim()) {
            setErrors({ submit: '한글명, 영어명, 국가코드를 모두 입력해주세요.' });
            return;
        }

        try {
            const countryId = newCountry.code.trim().toUpperCase();

            // 1. 국가 메인 정보 저장
            const countryData = {
                isActive: newCountry.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'countries', countryId), countryData);

            // 2. 한국어 번역 저장
            const koTranslation: CountryTranslation = {
                name: newCountry.nameKo.trim()
            };
            await setDoc(
                doc(db, 'countries', countryId, 'translations', 'ko'),
                koTranslation
            );

            // 3. 영어 번역 저장
            const enTranslation: CountryTranslation = {
                name: newCountry.nameEn.trim()
            };
            await setDoc(
                doc(db, 'countries', countryId, 'translations', 'en'),
                enTranslation
            );

            await fetchCountries();

            setNewCountry({ nameKo: '', nameEn: '', code: '', isActive: true });
            setShowAddForm(false);
            setErrors({});

            alert('국가가 성공적으로 등록되었습니다.');
        } catch (error: any) {
            console.error('국가 등록 실패:', error);
            setErrors({ submit: '국가 등록에 실패했습니다.' });
        }
    };

    // 시도 등록
    const handleAddCity = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCity.nameKo.trim() || !newCity.nameEn.trim() || !newCity.countryCode || !newCity.code.trim()) {
            setErrors({ submit: '한글명, 영어명, 국가, 도시코드를 모두 입력해주세요.' });
            return;
        }

        try {
            const selectedCountry = countries.find(c => c.id === newCity.countryCode);
            const cityId = newCity.code.trim(); // 이미 KR_001 형태로 생성됨

            // 1. 도시 메인 정보 저장 (서브컬렉션으로)
            const cityData = {
                countryId: newCity.countryCode,
                countryName: selectedCountry?.name || '',
                isActive: newCity.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'countries', newCity.countryCode, 'cities', cityId), cityData);

            // 2. 한국어 번역 저장
            const koTranslation: CityTranslation = {
                name: newCity.nameKo.trim()
            };
            await setDoc(
                doc(db, 'countries', newCity.countryCode, 'cities', cityId, 'translations', 'ko'),
                koTranslation
            );

            // 3. 영어 번역 저장
            const enTranslation: CityTranslation = {
                name: newCity.nameEn.trim()
            };
            await setDoc(
                doc(db, 'countries', newCity.countryCode, 'cities', cityId, 'translations', 'en'),
                enTranslation
            );

            await fetchCities();
            calculateCityCountByCountry();

            setNewCity({ nameKo: '', nameEn: '', code: '', countryCode: '', isActive: true });
            setShowAddForm(false);
            setErrors({});

            alert('도시이 성공적으로 등록되었습니다.');
        } catch (error: any) {
            console.error('도시 등록 실패:', error);
            setErrors({ submit: '도시 등록에 실패했습니다.' });
        }
    };


    const resetForm = () => {
        setNewCountry({ nameKo: '', nameEn: '', code: '', isActive: true });
        setNewCity({ nameKo: '', nameEn: '', code: '', countryCode: '', isActive: true });
        setShowAddForm(false);
        setEditingItem(null);
        setErrors({});
    };

    // 편집 함수들
    const handleEditCountry = (country: CountryWithTranslations) => {
        setEditingItem({ type: 'country', id: country.id, data: country });
        setEditCountry({
            name: country.translations?.['ko']?.name || '',
            nameEn: country.translations?.['en']?.name || '',
            code: country.id,
            isActive: country.isActive
        });
        setShowAddForm(false);
    };

    const handleEditCity = (city: CityWithTranslations) => {
        setEditingItem({ type: 'city', id: city.id, data: city });
        setEditCity({
            name: city.translations?.['ko']?.name || '',
            nameEn: city.translations?.['en']?.name || '',
            code: city.id,
            countryCode: city.countryId,
            isActive: city.isActive
        });
        setShowAddForm(false);
    };


    // 업데이트 함수들
    const handleUpdateCountry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editCountry.name.trim() || !editCountry.nameEn.trim() || !editCountry.code.trim()) {
            setErrors({ submit: '한글명, 영어명, 국가코드를 모두 입력해주세요.' });
            return;
        }

        try {
            // 1. 국가 메인 정보 업데이트
            const countryData = {
                isActive: editCountry.isActive,
                updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'countries', editingItem!.id), countryData, { merge: true });

            // 2. 한국어 번역 업데이트
            const koTranslation: CountryTranslation = {
                name: editCountry.name.trim()
            };
            await setDoc(
                doc(db, 'countries', editingItem!.id, 'translations', 'ko'),
                koTranslation
            );

            // 3. 영어 번역 업데이트
            const enTranslation: CountryTranslation = {
                name: editCountry.nameEn.trim()
            };
            await setDoc(
                doc(db, 'countries', editingItem!.id, 'translations', 'en'),
                enTranslation
            );

            await fetchCountries();

            setEditingItem(null);
            setErrors({});
            alert('국가가 성공적으로 수정되었습니다.');
        } catch (error: any) {
            console.error('국가 수정 실패:', error);
            setErrors({ submit: '국가 수정에 실패했습니다.' });
        }
    };

    const handleUpdateCity = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editCity.name.trim() || !editCity.nameEn.trim() || !editCity.countryCode || !editCity.code.trim()) {
            setErrors({ submit: '한글명, 영어명, 국가, 도시코드를 모두 입력해주세요.' });
            return;
        }

        try {
            const selectedCountry = countries.find(c => c.id === editCity.countryCode);

            // 1. 도시 메인 정보 업데이트 (서브컬렉션)
            const cityData = {
                countryId: editCity.countryCode,
                countryName: selectedCountry?.name || '',
                isActive: editCity.isActive,
                updatedAt: serverTimestamp()
            };
            await setDoc(doc(db, 'countries', editCity.countryCode, 'cities', editingItem!.id), cityData, { merge: true });

            // 2. 한국어 번역 업데이트
            const koTranslation: CityTranslation = {
                name: editCity.name.trim()
            };
            await setDoc(
                doc(db, 'countries', editCity.countryCode, 'cities', editingItem!.id, 'translations', 'ko'),
                koTranslation
            );

            // 3. 영어 번역 업데이트
            const enTranslation: CityTranslation = {
                name: editCity.nameEn.trim()
            };
            await setDoc(
                doc(db, 'countries', editCity.countryCode, 'cities', editingItem!.id, 'translations', 'en'),
                enTranslation
            );

            await fetchCities();
            calculateCityCountByCountry();

            setEditingItem(null);
            setErrors({});
            alert('도시이 성공적으로 수정되었습니다.');
        } catch (error: any) {
            console.error('도시 수정 실패:', error);
            setErrors({ submit: '도시 수정에 실패했습니다.' });
        }
    };


    // 삭제 함수들
    const handleDeleteCountry = async (countryId: string, countryName: string) => {
        if (!confirm(`"${countryName}" 국가를 삭제하시겠습니까?\n\n주의: 이 국가의 모든 도시 데이터도 함께 삭제됩니다.`)) {
            return;
        }

        try {
            // 1. 해당 국가의 모든 도시 조회 (서브컬렉션)
            const citiesSnapshot = await getDocs(collection(db, 'countries', countryId, 'cities'));

            // 2. 모든 도시 삭제 (translations 포함)
            const cityDeletePromises = citiesSnapshot.docs.map(async cityDoc => {
                // 도시의 translations 서브컬렉션 삭제
                const translationsSnapshot = await getDocs(
                    collection(db, 'countries', countryId, 'cities', cityDoc.id, 'translations')
                );
                await Promise.all(translationsSnapshot.docs.map(transDoc => deleteDoc(transDoc.ref)));

                // 도시 삭제
                return deleteDoc(cityDoc.ref);
            });
            await Promise.all(cityDeletePromises);

            // 3. 국가의 translations 서브컬렉션 삭제
            const countryTranslationsSnapshot = await getDocs(collection(db, 'countries', countryId, 'translations'));
            await Promise.all(countryTranslationsSnapshot.docs.map(transDoc => deleteDoc(transDoc.ref)));

            // 4. 마지막으로 국가 삭제
            await deleteDoc(doc(db, 'countries', countryId));

            // 5. 데이터 새로고침
            await fetchCountries();
            await fetchCities();
            calculateCityCountByCountry();

            alert('국가와 관련된 모든 도시 데이터가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('국가 삭제 실패:', error);
            alert('국가 삭제에 실패했습니다.');
        }
    };

    const handleDeleteCity = async (cityId: string, cityName: string, countryId: string) => {
        if (!confirm(`"${cityName}" 도시를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            // 1. 도시의 translations 서브컬렉션 삭제
            const cityTranslationsSnapshot = await getDocs(
                collection(db, 'countries', countryId, 'cities', cityId, 'translations')
            );
            await Promise.all(cityTranslationsSnapshot.docs.map(transDoc => deleteDoc(transDoc.ref)));

            // 2. 도시 삭제 (서브컬렉션)
            await deleteDoc(doc(db, 'countries', countryId, 'cities', cityId));

            // 3. 데이터 새로고침
            await fetchCities();
            calculateCityCountByCountry();

            alert('도시 데이터가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('도시 삭제 실패:', error);
            alert('도시 삭제에 실패했습니다.');
        }
    };


    // 검색 및 필터링 로직
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 검색 로직은 클라이언트 사이드에서 처리
    };

    const filteredCountries = countries.filter(country => {
        // 검색어 필터
        if (searchTerm && !country.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !country.id.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // 상태 필터
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            if (country.isActive !== isActive) {
                return false;
            }
        }

        return true;
    });

    const filteredCitys = cities.filter(city => {
        // 검색어 필터
        if (searchTerm && !city.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !city.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !city.countryName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // 국가 필터
        if (countryFilter !== 'all' && ((city as any).countryId || (city as any).countryCode) !== countryFilter) {
            return false;
        }

        // 상태 필터
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            if (city.isActive !== isActive) {
                return false;
            }
        }

        return true;
    });



    if (loading) {
        return (
            <div className="p-8 bg-gray-50 min-h-screen">
                <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                    <h1 className="text-3xl font-semibold text-gray-800">지역 관리</h1>
                </div>
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-600">지역 데이터를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-8 p-6 bg-white rounded-lg shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">지역 관리</h1>
                <div className="flex gap-3">
                    <Button
                        onClick={() => setShowAddForm(!showAddForm)}
                    >
                        <i className="fas fa-plus"></i>
                        {activeTab === 'countries' ? '국가 등록' : '도시 등록'}
                    </Button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
                <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'countries'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    onClick={() => {
                        setActiveTab('countries');
                        setSearchTerm('');
                        setCountryFilter('all');
                        setStatusFilter('all');
                        setShowAddForm(false);
                        setEditingItem(null);
                        setErrors({});
                        // 폼 상태 초기화
                        setNewCountry({ nameKo: '', nameEn: '', code: '', isActive: true });
                        setNewCity({ nameKo: '', nameEn: '', code: '', countryCode: '', isActive: true });
                        setEditCountry({ name: '', nameEn: '', code: '', isActive: true });
                        setEditCity({ name: '', nameEn: '', code: '', countryCode: '', isActive: true });
                    }}
                >
                    <i className="fas fa-globe"></i>
                    국가 ({countries.length})
                </button>
                <button
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'cities'
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    onClick={() => {
                        setActiveTab('cities');
                        setSearchTerm('');
                        setCountryFilter('all');
                        setStatusFilter('all');
                        setShowAddForm(false);
                        setEditingItem(null);
                        setErrors({});
                        // 폼 상태 초기화
                        setNewCountry({ nameKo: '', nameEn: '', code: '', isActive: true });
                        setNewCity({ nameKo: '', nameEn: '', code: '', countryCode: '', isActive: true });
                        setEditCountry({ name: '', nameEn: '', code: '', isActive: true });
                        setEditCity({ name: '', nameEn: '', code: '', countryCode: '', isActive: true });
                    }}
                >
                    <i className="fas fa-map-marked-alt"></i>
                    도시 ({cities.length})
                </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                <form onSubmit={handleSearch} className="mb-4">
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder={
                                activeTab === 'countries' ? '국가명, 국가코드로 검색...' :
                                    activeTab === 'cities' ? '도시명, 도시코드, 국가명으로 검색...' :
                                        '도시명, 도시코드, 도시명으로 검색...'
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Button type="submit" variant="secondary">
                            <i className="fas fa-search"></i>
                        </Button>
                    </div>
                </form>

                <div className="flex gap-4">
                    {activeTab === 'cities' && (
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">모든 국가</option>
                            {countries.map(country => (
                                <option key={country.id} value={country.id}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="all">모든 상태</option>
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>
            </div>

            {/* 등록 폼 */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {activeTab === 'countries' ? '새 국가 등록' :
                                activeTab === 'cities' ? '새 도시 등록' : '새 도시 등록'}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={
                        activeTab === 'countries' ? handleAddCountry : handleAddCity
                    } className="space-y-6">
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 rounded-md p-3">
                                <div className="flex items-center">
                                    <i className="fas fa-exclamation-circle text-red-400 mr-2"></i>
                                    <span className="text-red-800 text-sm">{errors.submit}</span>
                                </div>
                            </div>
                        )}

                        {activeTab === 'countries' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="countryNameKo" className="block text-sm font-medium text-gray-700">한글명 *</label>
                                        <input
                                            type="text"
                                            id="countryNameKo"
                                            value={newCountry.nameKo}
                                            onChange={(e) => setNewCountry(prev => ({ ...prev, nameKo: e.target.value }))}
                                            placeholder="예: 대한민국"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="countryNameEn" className="block text-sm font-medium text-gray-700">영어명 *</label>
                                        <input
                                            type="text"
                                            id="countryNameEn"
                                            value={newCountry.nameEn}
                                            onChange={(e) => setNewCountry(prev => ({ ...prev, nameEn: e.target.value }))}
                                            placeholder="예: South Korea"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="countryCode" className="block text-sm font-medium text-gray-700">국가코드 *</label>
                                        <input
                                            type="text"
                                            id="countryCode"
                                            value={newCountry.code}
                                            onChange={(e) => setNewCountry(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                            placeholder="예: KR"
                                            maxLength={3}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'cities' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="cityCountry" className="block text-sm font-medium text-gray-700">국가 *</label>
                                        <select
                                            id="cityCountry"
                                            value={newCity.countryCode}
                                            onChange={(e) => handleCountryChangeForCity(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">국가를 선택하세요</option>
                                            {countries.map(country => (
                                                <option key={country.id} value={country.id}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="text-gray-500 text-xs">국가를 선택하면 도시 코드가 자동으로 생성됩니다.</small>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="cityNameKo" className="block text-sm font-medium text-gray-700">한글명 *</label>
                                        <input
                                            type="text"
                                            id="cityNameKo"
                                            value={newCity.nameKo}
                                            onChange={(e) => setNewCity(prev => ({ ...prev, nameKo: e.target.value }))}
                                            placeholder="예: 서울특별시"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="cityNameEn" className="block text-sm font-medium text-gray-700">영어명 *</label>
                                        <input
                                            type="text"
                                            id="cityNameEn"
                                            value={newCity.nameEn}
                                            onChange={(e) => setNewCity(prev => ({ ...prev, nameEn: e.target.value }))}
                                            placeholder="예: Seoul"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label htmlFor="cityCode" className="block text-sm font-medium text-gray-700">도시 코드 *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            id="cityCode"
                                            value={newCity.code}
                                            readOnly
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 ${isGeneratingCode ? 'opacity-50' : ''}`}
                                            placeholder={isGeneratingCode ? "코드 생성 중..." : "국가를 선택하면 자동 생성됩니다"}
                                        />
                                        {isGeneratingCode && (
                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                                <i className="fas fa-spinner fa-spin text-gray-400"></i>
                                            </div>
                                        )}
                                    </div>
                                    <small className="text-gray-500 text-xs">도시 코드는 자동으로 생성됩니다. (형식: 국가코드_001, 국가코드_002...)</small>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={newCity.isActive}
                                            onChange={(e) => setNewCity(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">활성 상태</span>
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {activeTab === 'countries' ? '국가 등록' : '도시 등록'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 편집 폼 */}
            {editingItem && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900">
                            {editingItem.type === 'country' ? '국가 수정' :
                                editingItem.type === 'city' ? '도시 수정' : '도시 수정'}
                        </h3>
                        <button
                            onClick={resetForm}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <form
                        onSubmit={
                            editingItem.type === 'country' ? handleUpdateCountry : handleUpdateCity
                        }
                        className="space-y-6"
                    >
                        {errors.submit && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                                {errors.submit}
                            </div>
                        )}

                        {editingItem.type === 'country' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="editCountryNameKo" className="block text-sm font-medium text-gray-700">한글명 *</label>
                                        <input
                                            type="text"
                                            id="editCountryNameKo"
                                            value={editCountry.name}
                                            onChange={(e) => setEditCountry(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="예: 대한민국"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="editCountryNameEn" className="block text-sm font-medium text-gray-700">영어명 *</label>
                                        <input
                                            type="text"
                                            id="editCountryNameEn"
                                            value={editCountry.nameEn}
                                            onChange={(e) => setEditCountry(prev => ({ ...prev, nameEn: e.target.value }))}
                                            placeholder="예: South Korea"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="editCountryCode" className="block text-sm font-medium text-gray-700">국가코드 *</label>
                                        <input
                                            type="text"
                                            id="editCountryCode"
                                            value={editCountry.code}
                                            readOnly
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500">코드는 수정할 수 없습니다.</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {editingItem.type === 'city' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="editCityCountry" className="block text-sm font-medium text-gray-700">국가 *</label>
                                        <select
                                            id="editCityCountry"
                                            value={editCity.countryCode}
                                            onChange={(e) => setEditCity(prev => ({ ...prev, countryCode: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="">국가를 선택하세요</option>
                                            {countries.map(country => (
                                                <option key={country.id} value={country.id}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="editCityNameKo" className="block text-sm font-medium text-gray-700">한글명 *</label>
                                        <input
                                            type="text"
                                            id="editCityNameKo"
                                            value={editCity.name}
                                            onChange={(e) => setEditCity(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="예: 서울특별시"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label htmlFor="editCityNameEn" className="block text-sm font-medium text-gray-700">영어명 *</label>
                                        <input
                                            type="text"
                                            id="editCityNameEn"
                                            value={editCity.nameEn}
                                            onChange={(e) => setEditCity(prev => ({ ...prev, nameEn: e.target.value }))}
                                            placeholder="예: Seoul"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label htmlFor="editCityCode" className="block text-sm font-medium text-gray-700">도시 코드 *</label>
                                        <input
                                            type="text"
                                            id="editCityCode"
                                            value={editCity.code}
                                            readOnly
                                            disabled
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                                        />
                                        <p className="text-xs text-gray-500">코드는 수정할 수 없습니다.</p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={editCity.isActive}
                                            onChange={(e) => setEditCity(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">활성 상태</span>
                                    </label>
                                </div>
                            </>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                            <button
                                type="submit"
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {editingItem.type === 'country' ? '국가 수정' : '도시 수정'}
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 데이터 테이블 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                {activeTab === 'countries' && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>국가명</TableHead>
                                <TableHead>국가코드</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCountries.map((country) => (
                                <TableRow key={country.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-gray-900 flex items-center gap-2">
                                                {country.translations?.['ko']?.name || '-'}
                                                <Badge variant="secondary" className="text-xs">
                                                    도시 {cityCountByCountry[country.id] || 0}개
                                                </Badge>
                                            </div>
                                            <div className="text-sm text-gray-500">{country.translations?.['en']?.name || '-'}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell><span className="font-mono text-sm text-gray-600">{country.id}</span></TableCell>
                                    <TableCell>
                                        <Badge variant={country.isActive ? 'active' : 'inactive'}>
                                            {country.isActive ? '활성' : '비활성'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditCountry(country)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteCountry(country.id, country.name)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {activeTab === 'cities' && (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>도시명</TableHead>
                                <TableHead>도시코드</TableHead>
                                <TableHead>국가</TableHead>
                                <TableHead>상태</TableHead>
                                <TableHead>액션</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredCitys.map((city) => (
                                <TableRow key={city.id}>
                                    <TableCell>
                                        <div>
                                            <div className="font-medium text-gray-900">{city.translations?.['ko']?.name || '-'}</div>
                                            <div className="text-sm text-gray-500">{city.translations?.['en']?.name || '-'}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell><span className="font-mono text-sm text-gray-600">{city.id}</span></TableCell>
                                    <TableCell className="text-gray-600">{city.countryName}</TableCell>
                                    <TableCell>
                                        <Badge variant={city.isActive ? 'active' : 'inactive'}>
                                            {city.isActive ? '활성' : '비활성'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditCity(city)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => handleDeleteCity(city.id, city.name, city.countryId)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}

                {/* 빈 상태 */}
                {((activeTab === 'countries' && filteredCountries.length === 0) ||
                    (activeTab === 'cities' && filteredCitys.length === 0)) && (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <i className="fas fa-map-marked-alt text-6xl text-gray-400 mb-4"></i>
                            <p className="text-gray-500">
                                {searchTerm || countryFilter !== 'all' || statusFilter !== 'all'
                                    ? '검색 조건에 맞는 데이터가 없습니다.'
                                    : `등록된 ${activeTab === 'countries' ? '국가' : '도시'}가 없습니다.`
                                }
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
}
