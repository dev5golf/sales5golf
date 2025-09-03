"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Link from 'next/link';
import '../../admin.css';

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
    provinceName: string;
    countryName: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

export default function CitiesPage() {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const [cities, setCities] = useState<City[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [provinceFilter, setProvinceFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCity, setNewCity] = useState({
        name: '',
        code: '',
        countryCode: '',
        provinceCode: '',
        isActive: true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchCities();
        fetchCountries();
    }, []);

    useEffect(() => {
        if (newCity.countryCode) {
            fetchProvinces(newCity.countryCode);
        } else {
            setProvinces([]);
        }
    }, [newCity.countryCode]);

    const fetchCities = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'cities'), orderBy('name', 'asc'));
            const snapshot = await getDocs(q);
            const cityData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as City[];

            // 시도와 국가 이름 추가
            const citiesWithNames = await Promise.all(
                cityData.map(async (city) => {
                    try {
                        // 시도 정보 가져오기
                        const provinceDoc = await getDocs(query(collection(db, 'provinces'), where('id', '==', city.provinceCode)));
                        const province = provinceDoc.docs[0]?.data();

                        if (province) {
                            // 국가 정보 가져오기
                            const countryDoc = await getDocs(query(collection(db, 'countries'), where('code', '==', province.countryCode)));
                            const countryName = countryDoc.docs[0]?.data()?.name || '알 수 없음';

                            return {
                                ...city,
                                provinceName: province.name || '알 수 없음',
                                countryName
                            };
                        }

                        return { ...city, provinceName: '알 수 없음', countryName: '알 수 없음' };
                    } catch (error) {
                        return { ...city, provinceName: '알 수 없음', countryName: '알 수 없음' };
                    }
                })
            );

            setCities(citiesWithNames);

        } catch (error) {
            console.error('도시 목록 가져오기 실패:', error);
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

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 검색 로직은 클라이언트 사이드에서 처리
    };

    const filteredCities = cities.filter(city => {
        // 검색어 필터
        if (searchTerm && !city.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !city.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !city.provinceName.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !city.countryName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // 국가 필터
        if (countryFilter !== 'all') {
            const cityCountry = countries.find(c => c.code === countryFilter);
            if (cityCountry && city.countryName !== cityCountry.name) {
                return false;
            }
        }

        // 시도 필터
        if (provinceFilter !== 'all' && city.provinceCode !== provinceFilter) {
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

    const validateCityForm = () => {
        const newErrors: Record<string, string> = {};

        if (!newCity.name.trim()) {
            newErrors.name = '도시 이름을 입력해주세요.';
        }

        if (!newCity.code.trim()) {
            newErrors.code = '도시 코드를 입력해주세요.';
        } else if (newCity.code.length < 2) {
            newErrors.code = '도시 코드는 2자리 이상이어야 합니다.';
        }

        if (!newCity.countryCode) {
            newErrors.countryCode = '국가를 선택해주세요.';
        }

        if (!newCity.provinceCode) {
            newErrors.provinceCode = '지방을 선택해주세요.';
        }

        // 중복 체크
        const existingCity = cities.find(c =>
            (c.code.toLowerCase() === newCity.code.toLowerCase() && c.provinceCode === newCity.provinceCode) ||
            (c.name.toLowerCase() === newCity.name.toLowerCase() && c.provinceCode === newCity.provinceCode)
        );
        if (existingCity) {
            newErrors.duplicate = '이미 존재하는 도시 이름 또는 코드입니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCity = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCityForm()) {
            return;
        }

        try {
            const selectedProvince = provinces.find(p => p.id === newCity.provinceCode);
            const cityId = `${newCity.provinceCode}_${newCity.code}`;

            const cityData = {
                name: newCity.name.trim(),
                code: newCity.code.trim(),
                provinceCode: newCity.provinceCode,
                isActive: newCity.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'cities', cityId), cityData);

            // 목록 새로고침
            await fetchCities();

            // 폼 초기화
            setNewCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
            setShowAddForm(false);
            setErrors({});

            alert('도시가 성공적으로 등록되었습니다.');

        } catch (error: any) {
            console.error('도시 등록 실패:', error);
            setErrors({ submit: '도시 등록에 실패했습니다.' });
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

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR');
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>도시 목록을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>도시 관리</h1>
                <div className="page-actions">
                    <Link href="/admin/regions" className="btn btn-secondary">
                        <i className="fas fa-map"></i>
                        통합 지역 관리
                    </Link>
                    <button
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary"
                    >
                        <i className="fas fa-plus"></i>
                        도시 등록
                    </button>
                </div>
            </div>

            {/* 도시 등록 폼 */}
            {showAddForm && (
                <div className="form-container" style={{ marginBottom: '2rem' }}>
                    <div className="form-header">
                        <h3>새 도시 등록</h3>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setNewCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
                                setErrors({});
                            }}
                            className="btn btn-outline btn-sm"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form onSubmit={handleAddCity} className="admin-form">
                        {errors.submit && (
                            <div className="error-message">
                                {errors.submit}
                            </div>
                        )}

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="countryCode">국가 *</label>
                                <select
                                    id="countryCode"
                                    value={newCity.countryCode}
                                    onChange={(e) => setNewCity(prev => ({
                                        ...prev,
                                        countryCode: e.target.value,
                                        provinceCode: '' // 국가 변경 시 시도 초기화
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
                                    value={newCity.provinceCode}
                                    onChange={(e) => setNewCity(prev => ({ ...prev, provinceCode: e.target.value }))}
                                    className={errors.provinceCode ? 'error' : ''}
                                    disabled={!newCity.countryCode}
                                >
                                    <option value="">지방을 선택하세요</option>
                                    {provinces.map(province => (
                                        <option key={province.id} value={province.id}>
                                            {province.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.provinceCode && <span className="error-text">{errors.provinceCode}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="name">도시 이름 *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newCity.name}
                                    onChange={(e) => setNewCity(prev => ({ ...prev, name: e.target.value }))}
                                    className={errors.name ? 'error' : ''}
                                    placeholder="예: 강남구"
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>

                            <div className="form-group">
                                <label htmlFor="code">도시 코드 *</label>
                                <input
                                    type="text"
                                    id="code"
                                    value={newCity.code}
                                    onChange={(e) => setNewCity(prev => ({ ...prev, code: e.target.value }))}
                                    className={errors.code ? 'error' : ''}
                                    placeholder="예: 1123"
                                    maxLength={4}
                                />
                                {errors.code && <span className="error-text">{errors.code}</span>}
                                {errors.duplicate && <span className="error-text">{errors.duplicate}</span>}
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

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                도시 등록
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewCity({ name: '', code: '', countryCode: '', provinceCode: '', isActive: true });
                                    setErrors({});
                                }}
                                className="btn btn-outline"
                            >
                                취소
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* 검색 및 필터 */}
            <div className="filters-section">
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-input-group">
                        <input
                            type="text"
                            placeholder="도시명, 도시코드, 지방명, 국가명으로 검색..."
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
                    <select
                        value={countryFilter}
                        onChange={(e) => {
                            setCountryFilter(e.target.value);
                            setProvinceFilter('all');
                        }}
                        className="filter-select"
                    >
                        <option value="all">모든 국가</option>
                        {countries.map(country => (
                            <option key={country.id} value={country.code}>
                                {country.name}
                            </option>
                        ))}
                    </select>

                    <select
                        value={provinceFilter}
                        onChange={(e) => setProvinceFilter(e.target.value)}
                        className="filter-select"
                        disabled={countryFilter === 'all'}
                    >
                        <option value="all">모든 지방</option>
                        {provinces.map(province => (
                            <option key={province.id} value={province.id}>
                                {province.name}
                            </option>
                        ))}
                    </select>

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

            {/* 도시 목록 */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>도시명</th>
                            <th>도시코드</th>
                            <th>지방</th>
                            <th>국가</th>
                            <th>상태</th>
                            <th>등록일</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCities.map((city) => (
                            <tr key={city.id}>
                                <td>
                                    <div className="course-info">
                                        <span className="course-name">{city.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-mono">{city.code}</span>
                                </td>
                                <td>
                                    <span className="location-text">{city.provinceName}</span>
                                </td>
                                <td>
                                    <span className="location-text">{city.countryName}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${city.isActive ? 'active' : 'inactive'}`}>
                                        {city.isActive ? '활성' : '비활성'}
                                    </span>
                                </td>
                                <td>{formatDate(city.createdAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <Link
                                            href={`/admin/cities/${city.id}/edit`}
                                            className="btn btn-sm btn-outline"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteCity(city.id, city.name)}
                                            className="btn btn-sm btn-danger"
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCities.length === 0 && (
                    <div className="empty-state">
                        <i className="fas fa-city"></i>
                        <p>등록된 도시가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
