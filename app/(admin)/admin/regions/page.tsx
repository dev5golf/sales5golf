"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, getDoc, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import '../../admin.css';

interface Country {
    id: string;
    name: string;
    isActive: boolean;
    createdAt: any;
}

interface Province {
    id: string;
    name: string;
    code: string;
    countryCode: string;
    countryName: string;
    isActive: boolean;
    createdAt: any;
}

interface City {
    id: string;
    name: string;
    code: string;
    countryCode: string;
    provinceCode: string;
    provinceName: string;
    isActive: boolean;
    createdAt: any;
}

type TabType = 'countries' | 'provinces' | 'cities';

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
    const [countries, setCountries] = useState<Country[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);

    // 로딩 상태
    const [loading, setLoading] = useState(true);
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);

    // 검색 및 필터 상태
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [provinceFilter, setProvinceFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    // 폼 상태
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCountry, setNewCountry] = useState({ name: '', code: '', isActive: true });
    const [newProvince, setNewProvince] = useState({ name: '', code: '', countryCode: '', isActive: true });
    const [newCity, setNewCity] = useState({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });

    // 편집 상태
    const [editingItem, setEditingItem] = useState<{ type: string, id: string, data: any } | null>(null);
    const [editCountry, setEditCountry] = useState({ name: '', code: '', isActive: true });
    const [editProvince, setEditProvince] = useState({ name: '', code: '', countryCode: '', isActive: true });
    const [editCity, setEditCity] = useState({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });

    // 오류 상태
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            await Promise.all([
                fetchCountries(),
                fetchProvinces(),
                fetchCities()
            ]);
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

    const fetchProvinces = async () => {
        try {
            const q = query(collection(db, 'provinces'), orderBy('name', 'asc'));
            const snapshot = await getDocs(q);
            const provinceData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Province[];

            // 국가 이름 추가
            const provincesWithCountryNames = await Promise.all(
                provinceData.map(async (province) => {
                    try {
                        const countryDoc = await getDoc(doc(db, 'countries', (province as any).countryId || (province as any).countryCode));
                        const countryName = countryDoc.data()?.name || '알 수 없음';
                        return { ...province, countryName };
                    } catch (error) {
                        return { ...province, countryName: '알 수 없음' };
                    }
                })
            );

            setProvinces(provincesWithCountryNames);
        } catch (error) {
            console.error('지방 목록 가져오기 실패:', error);
        }
    };

    const fetchCities = async () => {
        try {
            const q = query(collection(db, 'cities'), orderBy('name', 'asc'));
            const snapshot = await getDocs(q);
            const cityData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as City[];

            // 시도 이름 추가
            const citiesWithProvinceNames = await Promise.all(
                cityData.map(async (city) => {
                    try {
                        // provinceId 또는 provinceCode로 지방 찾기 (하위 호환성)
                        const provinceId = (city as any).provinceId || (city as any).provinceCode;
                        if (!provinceId) {
                            return { ...city, provinceName: '알 수 없음' };
                        }

                        // doc.id로 직접 지방 문서 가져오기
                        const provinceDoc = await getDoc(doc(db, 'provinces', provinceId));
                        const provinceName = provinceDoc.exists() ? provinceDoc.data()?.name || '알 수 없음' : '알 수 없음';
                        return { ...city, provinceName };
                    } catch (error) {
                        console.error('지방명 조회 실패:', error);
                        return { ...city, provinceName: '알 수 없음' };
                    }
                })
            );

            setCities(citiesWithProvinceNames);
        } catch (error) {
            console.error('도시 목록 가져오기 실패:', error);
        }
    };

    // 자동 코드 생성 함수들
    const getLastProvinceCodeByCountry = async (countryCode: string) => {
        try {
            setIsGeneratingCode(true);
            console.log('getLastProvinceCodeByCountry 호출됨, countryCode:', countryCode);
            const provincesRef = collection(db, 'provinces');
            const snapshot = await getDocs(provincesRef);

            let lastCode = '000';

            for (const doc of snapshot.docs) {
                const data = doc.data();
                console.log('지방 데이터 확인:', { docId: doc.id, data });
                if ((data as any).countryId === countryCode || (data as any).countryCode === countryCode) {
                    const provinceCode = doc.id; // doc.id 사용 (예: KR_001)
                    console.log('매칭된 지방 코드:', provinceCode);
                    const match = provinceCode.match(/(\d{3})$/);
                    if (match) {
                        const currentCode = match[1];
                        // 더 큰 번호를 찾기 위해 비교
                        if (parseInt(currentCode) > parseInt(lastCode)) {
                            lastCode = currentCode;
                            console.log('더 큰 코드 발견:', lastCode);
                        }
                    }
                }
            }

            console.log('최종 반환 코드:', lastCode);
            return lastCode;
        } catch (error) {
            console.error('provinces 데이터 조회 실패:', error);
            return '000';
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const getLastCityCodeByProvince = async (provinceCode: string) => {
        try {
            setIsGeneratingCode(true);
            console.log('getLastCityCodeByProvince 호출됨, provinceCode:', provinceCode);
            const citiesRef = collection(db, 'cities');
            const snapshot = await getDocs(citiesRef);

            let lastCode = '000';

            for (const doc of snapshot.docs) {
                const data = doc.data();
                console.log('도시 데이터 확인:', { docId: doc.id, data });
                if ((data as any).provinceId === provinceCode || (data as any).provinceCode === provinceCode) {
                    const cityCode = doc.id; // doc.id 사용 (예: KR_001_001)
                    console.log('매칭된 도시 코드:', cityCode);
                    const match = cityCode.match(/(\d{3})$/);
                    if (match) {
                        const currentCode = match[1];
                        // 더 큰 번호를 찾기 위해 비교
                        if (parseInt(currentCode) > parseInt(lastCode)) {
                            lastCode = currentCode;
                            console.log('더 큰 도시 코드 발견:', lastCode);
                        }
                    }
                }
            }

            console.log('최종 반환 도시 코드:', lastCode);
            return lastCode;
        } catch (error) {
            console.error('cities 데이터 조회 실패:', error);
            return '000';
        } finally {
            setIsGeneratingCode(false);
        }
    };

    // 국가 선택 시 시도 코드 자동 생성
    const handleCountryChangeForProvince = async (countryCode: string) => {
        setNewProvince(prev => ({ ...prev, countryCode, code: '' }));

        if (countryCode) {
            const lastCode = await getLastProvinceCodeByCountry(countryCode);
            const nextCodeNumber = (parseInt(lastCode) + 1).toString().padStart(3, '0');
            const provinceCode = `${countryCode}_${nextCodeNumber}`;

            setNewProvince(prev => ({ ...prev, code: provinceCode }));
        }
    };

    // 시도 선택 시 구군 코드 자동 생성
    const handleProvinceChangeForCity = async (provinceCode: string) => {
        const selectedProvince = provinces.find(p => p.id === provinceCode);
        setNewCity(prev => ({
            ...prev,
            provinceCode,
            countryCode: (selectedProvince as any)?.countryId || (selectedProvince as any)?.countryCode || '',
            code: ''
        }));

        if (provinceCode) {
            const lastCode = await getLastCityCodeByProvince(provinceCode);
            const nextCodeNumber = (parseInt(lastCode) + 1).toString().padStart(3, '0');
            const cityCode = `${provinceCode}_${nextCodeNumber}`;

            setNewCity(prev => ({ ...prev, code: cityCode }));
        }
    };

    // 국가 등록
    const handleAddCountry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCountry.name.trim() || !newCountry.code.trim()) {
            setErrors({ submit: '국가명과 국가코드를 입력해주세요.' });
            return;
        }

        try {
            const countryId = newCountry.code.trim().toUpperCase();
            const countryData = {
                id: countryId,
                name: newCountry.name.trim(),
                isActive: newCountry.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'countries', countryId), countryData);
            await fetchCountries();

            setNewCountry({ name: '', code: '', isActive: true });
            setShowAddForm(false);
            setErrors({});

            alert('국가가 성공적으로 등록되었습니다.');
        } catch (error: any) {
            console.error('국가 등록 실패:', error);
            setErrors({ submit: '국가 등록에 실패했습니다.' });
        }
    };

    // 시도 등록
    const handleAddProvince = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newProvince.name.trim() || !newProvince.countryCode || !newProvince.code.trim()) {
            setErrors({ submit: '모든 필드를 입력해주세요.' });
            return;
        }

        try {
            const selectedCountry = countries.find(c => c.id === newProvince.countryCode);
            const provinceId = newProvince.code.trim(); // 이미 KR_001 형태로 생성됨

            const provinceData = {
                id: provinceId,
                name: newProvince.name.trim(),
                countryId: newProvince.countryCode,
                countryName: selectedCountry?.name || '',
                isActive: newProvince.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'provinces', provinceId), provinceData);
            await fetchProvinces();

            setNewProvince({ name: '', code: '', countryCode: '', isActive: true });
            setShowAddForm(false);
            setErrors({});

            alert('지방이 성공적으로 등록되었습니다.');
        } catch (error: any) {
            console.error('지방 등록 실패:', error);
            setErrors({ submit: '지방 등록에 실패했습니다.' });
        }
    };

    // 도시 등록
    const handleAddCity = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newCity.name.trim() || !newCity.provinceCode || !newCity.code.trim()) {
            setErrors({ submit: '모든 필드를 입력해주세요.' });
            return;
        }

        try {
            const selectedProvince = provinces.find(p => p.id === newCity.provinceCode);
            const cityId = newCity.code.trim(); // 이미 KR_001_001 형태로 생성됨

            const cityData = {
                id: cityId,
                name: newCity.name.trim(),
                countryId: newCity.countryCode,
                provinceId: newCity.provinceCode,
                provinceName: selectedProvince?.name || '',
                isActive: newCity.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'cities', cityId), cityData);
            await fetchCities();

            setNewCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
            setShowAddForm(false);
            setErrors({});

            alert('도시가 성공적으로 등록되었습니다.');
        } catch (error: any) {
            console.error('도시 등록 실패:', error);
            setErrors({ submit: '도시 등록에 실패했습니다.' });
        }
    };

    const resetForm = () => {
        setNewCountry({ name: '', code: '', isActive: true });
        setNewProvince({ name: '', code: '', countryCode: '', isActive: true });
        setNewCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
        setShowAddForm(false);
        setEditingItem(null);
        setErrors({});
    };

    // 편집 함수들
    const handleEditCountry = (country: Country) => {
        setEditingItem({ type: 'country', id: country.id, data: country });
        setEditCountry({ name: country.name, code: country.id, isActive: country.isActive });
        setShowAddForm(false);
    };

    const handleEditProvince = (province: Province) => {
        setEditingItem({ type: 'province', id: province.id, data: province });
        setEditProvince({
            name: province.name,
            code: province.id,
            countryCode: (province as any).countryId || (province as any).countryCode,
            isActive: province.isActive
        });
        setShowAddForm(false);
    };

    const handleEditCity = (city: City) => {
        setEditingItem({ type: 'city', id: city.id, data: city });
        setEditCity({
            name: city.name,
            code: city.id,
            countryCode: (city as any).countryId || (city as any).countryCode || '',
            provinceCode: (city as any).provinceId || (city as any).provinceCode,
            isActive: city.isActive
        });
        setShowAddForm(false);
    };

    // 업데이트 함수들
    const handleUpdateCountry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editCountry.name.trim() || !editCountry.code.trim()) {
            setErrors({ submit: '국가명과 국가코드를 입력해주세요.' });
            return;
        }

        try {
            const countryData = {
                id: editingItem!.id,
                name: editCountry.name.trim(),
                isActive: editCountry.isActive,
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'countries', editingItem!.id), countryData, { merge: true });
            await fetchCountries();

            setEditingItem(null);
            setErrors({});
            alert('국가가 성공적으로 수정되었습니다.');
        } catch (error: any) {
            console.error('국가 수정 실패:', error);
            setErrors({ submit: '국가 수정에 실패했습니다.' });
        }
    };

    const handleUpdateProvince = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editProvince.name.trim() || !editProvince.countryCode || !editProvince.code.trim()) {
            setErrors({ submit: '모든 필드를 입력해주세요.' });
            return;
        }

        try {
            const selectedCountry = countries.find(c => c.id === editProvince.countryCode);
            const provinceData = {
                id: editingItem!.id,
                name: editProvince.name.trim(),
                countryId: editProvince.countryCode,
                countryName: selectedCountry?.name || '',
                isActive: editProvince.isActive,
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'provinces', editingItem!.id), provinceData, { merge: true });
            await fetchProvinces();

            setEditingItem(null);
            setErrors({});
            alert('지방이 성공적으로 수정되었습니다.');
        } catch (error: any) {
            console.error('지방 수정 실패:', error);
            setErrors({ submit: '지방 수정에 실패했습니다.' });
        }
    };

    const handleUpdateCity = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editCity.name.trim() || !editCity.provinceCode || !editCity.code.trim()) {
            setErrors({ submit: '모든 필드를 입력해주세요.' });
            return;
        }

        try {
            const selectedProvince = provinces.find(p => p.id === editCity.provinceCode);
            const cityData = {
                id: editingItem!.id,
                name: editCity.name.trim(),
                countryId: editCity.countryCode,
                provinceId: editCity.provinceCode,
                provinceName: selectedProvince?.name || '',
                isActive: editCity.isActive,
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'cities', editingItem!.id), cityData, { merge: true });
            await fetchCities();

            setEditingItem(null);
            setErrors({});
            alert('도시가 성공적으로 수정되었습니다.');
        } catch (error: any) {
            console.error('도시 수정 실패:', error);
            setErrors({ submit: '도시 수정에 실패했습니다.' });
        }
    };

    // 삭제 함수들
    const handleDeleteCountry = async (countryId: string, countryName: string) => {
        if (!confirm(`"${countryName}" 국가를 삭제하시겠습니까?\n\n주의: 이 국가와 관련된 모든 지방과 도시 데이터도 함께 삭제됩니다.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'countries', countryId));
            await fetchCountries();
            alert('국가가 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('국가 삭제 실패:', error);
            alert('국가 삭제에 실패했습니다.');
        }
    };

    const handleDeleteProvince = async (provinceId: string, provinceName: string) => {
        if (!confirm(`"${provinceName}" 지방을 삭제하시겠습니까?\n\n주의: 이 지방과 관련된 모든 도시 데이터도 함께 삭제됩니다.`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'provinces', provinceId));
            await fetchProvinces();
            alert('지방이 성공적으로 삭제되었습니다.');
        } catch (error) {
            console.error('지방 삭제 실패:', error);
            alert('지방 삭제에 실패했습니다.');
        }
    };

    const handleDeleteCity = async (cityId: string, cityName: string) => {
        if (!confirm(`"${cityName}" 도시를 삭제하시겠습니까?`)) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'cities', cityId));
            await fetchCities();
            alert('도시가 성공적으로 삭제되었습니다.');
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

    const filteredProvinces = provinces.filter(province => {
        // 검색어 필터
        if (searchTerm && !province.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !province.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !province.countryName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // 국가 필터
        if (countryFilter !== 'all' && ((province as any).countryId || (province as any).countryCode) !== countryFilter) {
            return false;
        }

        // 상태 필터
        if (statusFilter !== 'all') {
            const isActive = statusFilter === 'active';
            if (province.isActive !== isActive) {
                return false;
            }
        }

        return true;
    });

    const filteredCities = cities.filter(city => {
        // 검색어 필터
        if (searchTerm && !city.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !city.id.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !city.provinceName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // 국가 필터
        if (countryFilter !== 'all' && ((city as any).countryId || (city as any).countryCode) !== countryFilter) {
            return false;
        }

        // 시도 필터
        if (provinceFilter !== 'all' && ((city as any).provinceId || (city as any).provinceCode) !== provinceFilter) {
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
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>지역 데이터를 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>지역 관리</h1>
                <div className="page-actions">
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        <i className="fas fa-plus"></i>
                        {activeTab === 'countries' ? '국가 등록' :
                            activeTab === 'provinces' ? '지방 등록' : '도시 등록'}
                    </button>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${activeTab === 'countries' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('countries');
                        setSearchTerm('');
                        setCountryFilter('all');
                        setProvinceFilter('all');
                        setStatusFilter('all');
                        setShowAddForm(false);
                        setEditingItem(null);
                        setErrors({});
                        // 폼 상태 초기화
                        setNewCountry({ name: '', code: '', isActive: true });
                        setNewProvince({ name: '', code: '', countryCode: '', isActive: true });
                        setNewCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
                        setEditCountry({ name: '', code: '', isActive: true });
                        setEditProvince({ name: '', code: '', countryCode: '', isActive: true });
                        setEditCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
                    }}
                >
                    <i className="fas fa-globe"></i>
                    국가 ({countries.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'provinces' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('provinces');
                        setSearchTerm('');
                        setCountryFilter('all');
                        setProvinceFilter('all');
                        setStatusFilter('all');
                        setShowAddForm(false);
                        setEditingItem(null);
                        setErrors({});
                        // 폼 상태 초기화
                        setNewCountry({ name: '', code: '', isActive: true });
                        setNewProvince({ name: '', code: '', countryCode: '', isActive: true });
                        setNewCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
                        setEditCountry({ name: '', code: '', isActive: true });
                        setEditProvince({ name: '', code: '', countryCode: '', isActive: true });
                        setEditCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
                    }}
                >
                    <i className="fas fa-map-marked-alt"></i>
                    지방 ({provinces.length})
                </button>
                <button
                    className={`tab-button ${activeTab === 'cities' ? 'active' : ''}`}
                    onClick={() => {
                        setActiveTab('cities');
                        setSearchTerm('');
                        setCountryFilter('all');
                        setProvinceFilter('all');
                        setStatusFilter('all');
                        setShowAddForm(false);
                        setEditingItem(null);
                        setErrors({});
                        // 폼 상태 초기화
                        setNewCountry({ name: '', code: '', isActive: true });
                        setNewProvince({ name: '', code: '', countryCode: '', isActive: true });
                        setNewCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
                        setEditCountry({ name: '', code: '', isActive: true });
                        setEditProvince({ name: '', code: '', countryCode: '', isActive: true });
                        setEditCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
                    }}
                >
                    <i className="fas fa-city"></i>
                    도시 ({cities.length})
                </button>
            </div>

            {/* 검색 및 필터 */}
            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder={
                                activeTab === 'countries' ? '국가명, 국가코드로 검색...' :
                                    activeTab === 'provinces' ? '지방명, 지방코드, 국가명으로 검색...' :
                                        '도시명, 도시코드, 지방명으로 검색...'
                            }
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="btn btn-secondary">
                            <i className="fas fa-search"></i>
                        </button>
                    </div>
                </form>

                <div className="filter-group">
                    {activeTab === 'provinces' && (
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">모든 국가</option>
                            {countries.map(country => (
                                <option key={country.id} value={country.id}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {activeTab === 'cities' && (
                        <select
                            value={countryFilter}
                            onChange={(e) => setCountryFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">모든 국가</option>
                            {countries.map(country => (
                                <option key={country.id} value={country.id}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    )}

                    {activeTab === 'cities' && (
                        <select
                            value={provinceFilter}
                            onChange={(e) => setProvinceFilter(e.target.value)}
                            className="filter-select"
                        >
                            <option value="all">모든 지방</option>
                            {provinces.map(province => (
                                <option key={province.id} value={province.id}>
                                    {province.name}
                                </option>
                            ))}
                        </select>
                    )}

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">모든 상태</option>
                        <option value="active">활성</option>
                        <option value="inactive">비활성</option>
                    </select>
                </div>
            </div>

            {/* 등록 폼 */}
            {showAddForm && (
                <div className="form-container" style={{ marginBottom: '2rem' }}>
                    <div className="form-header">
                        <h3>
                            {activeTab === 'countries' ? '새 국가 등록' :
                                activeTab === 'provinces' ? '새 지방 등록' : '새 도시 등록'}
                        </h3>
                        <button onClick={resetForm} className="btn btn-outline btn-sm">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={
                        activeTab === 'countries' ? handleAddCountry :
                            activeTab === 'provinces' ? handleAddProvince : handleAddCity
                    } className="admin-form">
                        {errors.submit && (
                            <div className="error-message">
                                {errors.submit}
                            </div>
                        )}

                        {activeTab === 'countries' && (
                            <div className="form-row">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="countryName">국가명 *</label>
                                        <input
                                            type="text"
                                            id="countryName"
                                            value={newCountry.name}
                                            onChange={(e) => setNewCountry(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="예: 대한민국"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="countryCode">국가코드 *</label>
                                        <input
                                            type="text"
                                            id="countryCode"
                                            value={newCountry.code}
                                            onChange={(e) => setNewCountry(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                            placeholder="예: KR"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>

                            </div>
                        )}

                        {activeTab === 'provinces' && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="provinceCountry">국가 *</label>
                                        <select
                                            id="provinceCountry"
                                            value={newProvince.countryCode}
                                            onChange={(e) => handleCountryChangeForProvince(e.target.value)}
                                        >
                                            <option value="">국가를 선택하세요</option>
                                            {countries.map(country => (
                                                <option key={country.id} value={country.id}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                        <small className="form-help">국가를 선택하면 지방 코드가 자동으로 생성됩니다.</small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="provinceName">지방명 *</label>
                                        <input
                                            type="text"
                                            id="provinceName"
                                            value={newProvince.name}
                                            onChange={(e) => setNewProvince(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="예: 서울특별시"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="provinceCode">지방 코드 *</label>
                                        <div className="input-with-loading">
                                            <input
                                                type="text"
                                                id="provinceCode"
                                                value={newProvince.code}
                                                readOnly
                                                className={isGeneratingCode ? 'loading' : ''}
                                                placeholder={isGeneratingCode ? "코드 생성 중..." : "국가를 선택하면 자동 생성됩니다"}
                                            />
                                            {isGeneratingCode && (
                                                <div className="loading-spinner-small">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                </div>
                                            )}
                                        </div>
                                        <small className="form-help">지방 코드는 자동으로 생성됩니다. (형식: 국가코드_001, 국가코드_002...)</small>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={newProvince.isActive}
                                                onChange={(e) => setNewProvince(prev => ({ ...prev, isActive: e.target.checked }))}
                                            />
                                            <span className="checkmark"></span>
                                            활성 상태
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {activeTab === 'cities' && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cityProvince">지방 *</label>
                                        <select
                                            id="cityProvince"
                                            value={newCity.provinceCode}
                                            onChange={(e) => handleProvinceChangeForCity(e.target.value)}
                                        >
                                            <option value="">지방을 선택하세요</option>
                                            {provinces.map(province => (
                                                <option key={province.id} value={province.id}>
                                                    {province.name} ({province.countryName})
                                                </option>
                                            ))}
                                        </select>
                                        <small className="form-help">지방을 선택하면 도시 코드가 자동으로 생성됩니다.</small>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="cityName">도시명 *</label>
                                        <input
                                            type="text"
                                            id="cityName"
                                            value={newCity.name}
                                            onChange={(e) => setNewCity(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="예: 강남구"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="cityCode">도시 코드 *</label>
                                        <div className="input-with-loading">
                                            <input
                                                type="text"
                                                id="cityCode"
                                                value={newCity.code}
                                                readOnly
                                                className={isGeneratingCode ? 'loading' : ''}
                                                placeholder={isGeneratingCode ? "코드 생성 중..." : "시도를 선택하면 자동 생성됩니다"}
                                            />
                                            {isGeneratingCode && (
                                                <div className="loading-spinner-small">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                </div>
                                            )}
                                        </div>
                                        <small className="form-help">도시 코드는 자동으로 생성됩니다. (형식: 지방코드_001, 지방코드_002...)</small>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={newCity.isActive}
                                                onChange={(e) => setNewCity(prev => ({ ...prev, isActive: e.target.checked }))}
                                            />
                                            <span className="checkmark"></span>
                                            활성 상태
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {activeTab === 'countries' ? '국가 등록' :
                                    activeTab === 'provinces' ? '지방 등록' : '도시 등록'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-outline">
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 편집 폼 */}
            {editingItem && (
                <div className="form-container" style={{ marginBottom: '2rem' }}>
                    <div className="form-header">
                        <h3>
                            {editingItem.type === 'country' ? '국가 수정' :
                                editingItem.type === 'province' ? '지방 수정' : '도시 수정'}
                        </h3>
                        <button onClick={resetForm} className="btn btn-outline btn-sm">
                            <i className="fas fa-times"></i>
                        </button>
                    </div>

                    <form onSubmit={
                        editingItem.type === 'country' ? handleUpdateCountry :
                            editingItem.type === 'province' ? handleUpdateProvince : handleUpdateCity
                    } className="admin-form">
                        {errors.submit && (
                            <div className="error-message">
                                {errors.submit}
                            </div>
                        )}

                        {editingItem.type === 'country' && (
                            <div className="form-row">
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="editCountryName">국가명 *</label>
                                        <input
                                            type="text"
                                            id="editCountryName"
                                            value={editCountry.name}
                                            onChange={(e) => setEditCountry(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="예: 대한민국"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editCountryCode">국가코드 *</label>
                                        <input
                                            type="text"
                                            id="editCountryCode"
                                            value={editCountry.code}
                                            onChange={(e) => setEditCountry(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                            placeholder="예: KR"
                                            maxLength={3}
                                        />
                                    </div>
                                </div>

                            </div>
                        )}

                        {editingItem.type === 'province' && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="editProvinceCountry">국가 *</label>
                                        <select
                                            id="editProvinceCountry"
                                            value={editProvince.countryCode}
                                            onChange={(e) => setEditProvince(prev => ({ ...prev, countryCode: e.target.value }))}
                                        >
                                            <option value="">국가를 선택하세요</option>
                                            {countries.map(country => (
                                                <option key={country.id} value={country.id}>
                                                    {country.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editProvinceName">지방명 *</label>
                                        <input
                                            type="text"
                                            id="editProvinceName"
                                            value={editProvince.name}
                                            onChange={(e) => setEditProvince(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="예: 서울특별시"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="editProvinceCode">지방 코드 *</label>
                                        <input
                                            type="text"
                                            id="editProvinceCode"
                                            value={editProvince.code}
                                            readOnly
                                            className="readonly-input"
                                            placeholder="예: KR_001"
                                        />
                                        <small className="form-help">코드는 수정할 수 없습니다.</small>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={editProvince.isActive}
                                                onChange={(e) => setEditProvince(prev => ({ ...prev, isActive: e.target.checked }))}
                                            />
                                            <span className="checkmark"></span>
                                            활성 상태
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {editingItem.type === 'city' && (
                            <>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="editCityProvince">지방 *</label>
                                        <select
                                            id="editCityProvince"
                                            value={editCity.provinceCode}
                                            onChange={(e) => setEditCity(prev => ({ ...prev, provinceCode: e.target.value }))}
                                        >
                                            <option value="">지방을 선택하세요</option>
                                            {provinces.map(province => (
                                                <option key={province.id} value={province.id}>
                                                    {province.name} ({province.countryName})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="editCityName">도시명 *</label>
                                        <input
                                            type="text"
                                            id="editCityName"
                                            value={editCity.name}
                                            onChange={(e) => setEditCity(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="예: 강남구"
                                        />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="editCityCode">도시 코드 *</label>
                                        <input
                                            type="text"
                                            id="editCityCode"
                                            value={editCity.code}
                                            readOnly
                                            className="readonly-input"
                                            placeholder="예: KR_001_001"
                                        />
                                        <small className="form-help">코드는 수정할 수 없습니다.</small>
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={editCity.isActive}
                                                onChange={(e) => setEditCity(prev => ({ ...prev, isActive: e.target.checked }))}
                                            />
                                            <span className="checkmark"></span>
                                            활성 상태
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary">
                                {editingItem.type === 'country' ? '국가 수정' :
                                    editingItem.type === 'province' ? '지방 수정' : '도시 수정'}
                            </button>
                            <button type="button" onClick={resetForm} className="btn btn-outline">
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 데이터 테이블 */}
            <div className="table-container">
                {activeTab === 'countries' && (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>국가명</th>
                                <th>국가코드</th>
                                <th>상태</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCountries.map((country) => (
                                <tr key={country.id}>
                                    <td>{country.name}</td>
                                    <td><span className="font-mono">{country.id}</span></td>
                                    <td>
                                        <span className={`status-badge ${country.isActive ? 'active' : 'inactive'}`}>
                                            {country.isActive ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleEditCountry(country)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteCountry(country.id, country.name)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'provinces' && (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>지방명</th>
                                <th>지방코드</th>
                                <th>국가</th>
                                <th>상태</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProvinces.map((province) => (
                                <tr key={province.id}>
                                    <td>{province.name}</td>
                                    <td><span className="font-mono">{province.id}</span></td>
                                    <td>{province.countryName}</td>
                                    <td>
                                        <span className={`status-badge ${province.isActive ? 'active' : 'inactive'}`}>
                                            {province.isActive ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleEditProvince(province)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteProvince(province.id, province.name)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {activeTab === 'cities' && (
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>도시명</th>
                                <th>도시코드</th>
                                <th>지방</th>
                                <th>상태</th>
                                <th>액션</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCities.map((city) => (
                                <tr key={city.id}>
                                    <td>{city.name}</td>
                                    <td><span className="font-mono">{city.id}</span></td>
                                    <td>{city.provinceName}</td>
                                    <td>
                                        <span className={`status-badge ${city.isActive ? 'active' : 'inactive'}`}>
                                            {city.isActive ? '활성' : '비활성'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="btn btn-sm btn-outline"
                                                onClick={() => handleEditCity(city)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDeleteCity(city.id, city.name)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}

                {/* 빈 상태 */}
                {((activeTab === 'countries' && filteredCountries.length === 0) ||
                    (activeTab === 'provinces' && filteredProvinces.length === 0) ||
                    (activeTab === 'cities' && filteredCities.length === 0)) && (
                        <div className="empty-state">
                            <i className="fas fa-map-marked-alt"></i>
                            <p>
                                {searchTerm || countryFilter !== 'all' || provinceFilter !== 'all' || statusFilter !== 'all'
                                    ? '검색 조건에 맞는 데이터가 없습니다.'
                                    : `등록된 ${activeTab === 'countries' ? '국가' : activeTab === 'provinces' ? '지방' : '도시'}가 없습니다.`
                                }
                            </p>
                        </div>
                    )}
            </div>
        </div>
    );
}
