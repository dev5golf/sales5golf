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
    countryName: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

export default function ProvincesPage() {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const [provinces, setProvinces] = useState<Province[]>([]);
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [countryFilter, setCountryFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newProvince, setNewProvince] = useState({
        name: '',
        code: '',
        countryCode: '',
        isActive: true
    });
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchProvinces();
        fetchCountries();
    }, []);

    const fetchProvinces = async () => {
        try {
            setLoading(true);
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
                        const countryDoc = await getDocs(query(collection(db, 'countries'), where('code', '==', province.countryCode)));
                        const countryName = countryDoc.docs[0]?.data()?.name || '알 수 없음';
                        return { ...province, countryName };
                    } catch (error) {
                        return { ...province, countryName: '알 수 없음' };
                    }
                })
            );

            setProvinces(provincesWithCountryNames);

        } catch (error) {
            console.error('지방 목록 가져오기 실패:', error);
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

    // 특정 국가의 provinces에서 마지막 코드를 가져오는 함수
    const getLastProvinceCodeByCountry = async (countryCode: string) => {
        try {
            setIsGeneratingCode(true);
            const provincesRef = collection(db, 'provinces');
            const q = query(provincesRef, orderBy('code', 'desc'));
            const snapshot = await getDocs(q);

            let lastCode = '000';

            // 해당 국가의 provinces만 필터링하여 마지막 코드 찾기
            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (data.countryCode === countryCode) {
                    const provinceCode = data.code;
                    // 마지막 3자리 숫자 추출
                    const match = provinceCode.match(/(\d{3})$/);
                    if (match) {
                        lastCode = match[1];
                    }
                    break; // 첫 번째 매칭되는 것이 가장 큰 코드
                }
            }

            return lastCode;
        } catch (error) {
            console.error('provinces 데이터 조회 실패:', error);
            return '000';
        } finally {
            setIsGeneratingCode(false);
        }
    };

    // 국가 선택 시 자동으로 다음 코드 생성
    const handleCountryChange = async (countryCode: string) => {
        setNewProvince(prev => ({ ...prev, countryCode, code: '' }));

        if (countryCode) {
            const lastCode = await getLastProvinceCodeByCountry(countryCode);
            const nextCodeNumber = (parseInt(lastCode) + 1).toString().padStart(3, '0');
            const provinceCode = `${countryCode}_${nextCodeNumber}`;

            setNewProvince(prev => ({ ...prev, code: provinceCode }));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 검색 로직은 클라이언트 사이드에서 처리
    };

    const filteredProvinces = provinces.filter(province => {
        // 검색어 필터
        if (searchTerm && !province.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !province.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !province.countryName.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // 국가 필터
        if (countryFilter !== 'all' && province.countryCode !== countryFilter) {
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

    const validateProvinceForm = () => {
        const newErrors: Record<string, string> = {};

        if (!newProvince.name.trim()) {
            newErrors.name = '지방 이름을 입력해주세요.';
        }

        if (!newProvince.countryCode) {
            newErrors.countryCode = '국가를 선택해주세요.';
        }

        if (!newProvince.code.trim()) {
            newErrors.code = '코드가 자동 생성되지 않았습니다. 국가를 다시 선택해주세요.';
        }

        // 중복 체크 (이름만 체크, 코드는 자동 생성되므로 중복될 가능성 낮음)
        const existingProvince = provinces.find(p =>
            p.name.toLowerCase() === newProvince.name.toLowerCase() && p.countryCode === newProvince.countryCode
        );
        if (existingProvince) {
            newErrors.duplicate = '이미 존재하는 지방 이름입니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddProvince = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateProvinceForm()) {
            return;
        }

        try {
            const selectedCountry = countries.find(c => c.code === newProvince.countryCode);
            const provinceId = `province_${newProvince.code}`;

            const provinceData = {
                id: provinceId,
                name: newProvince.name.trim(),
                code: newProvince.code.trim(),
                countryCode: newProvince.countryCode,
                countryName: selectedCountry?.name || '',
                isActive: newProvince.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'provinces', provinceId), provinceData);

            // 목록 새로고침
            await fetchProvinces();

            // 폼 초기화
            setNewProvince({ name: '', code: '', countryCode: '', isActive: true });
            setShowAddForm(false);
            setErrors({});

            alert('지방이 성공적으로 등록되었습니다.');

        } catch (error: any) {
            console.error('지방 등록 실패:', error);
            setErrors({ submit: '지방 등록에 실패했습니다.' });
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

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR');
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>지방 목록을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>지방 관리</h1>
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
                        지방 등록
                    </button>
                </div>
            </div>

            {/* 지방 등록 폼 */}
            {showAddForm && (
                <div className="form-container" style={{ marginBottom: '2rem' }}>
                    <div className="form-header">
                        <h3>새 지방 등록</h3>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setNewProvince({ name: '', code: '', countryCode: '', isActive: true });
                                setErrors({});
                            }}
                            className="btn btn-outline btn-sm"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form onSubmit={handleAddProvince} className="admin-form">
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
                                    value={newProvince.countryCode}
                                    onChange={(e) => handleCountryChange(e.target.value)}
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
                                <small className="form-help">국가를 선택하면 지방 코드가 자동으로 생성됩니다.</small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="name">지방 이름 *</label>
                                <input
                                    type="text"
                                    id="name"
                                    value={newProvince.name}
                                    onChange={(e) => setNewProvince(prev => ({ ...prev, name: e.target.value }))}
                                    className={errors.name ? 'error' : ''}
                                    placeholder="예: 서울특별시"
                                />
                                {errors.name && <span className="error-text">{errors.name}</span>}
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="code">지방 코드 *</label>
                                <div className="input-with-loading">
                                    <input
                                        type="text"
                                        id="code"
                                        value={newProvince.code}
                                        readOnly
                                        className={`${errors.code ? 'error' : ''} ${isGeneratingCode ? 'loading' : ''}`}
                                        placeholder={isGeneratingCode ? "코드 생성 중..." : "국가를 선택하면 자동 생성됩니다"}
                                    />
                                    {isGeneratingCode && (
                                        <div className="loading-spinner-small">
                                            <i className="fas fa-spinner fa-spin"></i>
                                        </div>
                                    )}
                                </div>
                                {errors.code && <span className="error-text">{errors.code}</span>}
                                {errors.duplicate && <span className="error-text">{errors.duplicate}</span>}
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

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                지방 등록
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewProvince({ name: '', code: '', countryCode: '', isActive: true });
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
                            placeholder="지방명, 지방코드, 국가명으로 검색..."
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
                        onChange={(e) => setCountryFilter(e.target.value)}
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

            {/* 지방 목록 */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>지방명</th>
                            <th>지방코드</th>
                            <th>국가</th>
                            <th>상태</th>
                            <th>등록일</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProvinces.map((province) => (
                            <tr key={province.id}>
                                <td>
                                    <div className="course-info">
                                        <span className="course-name">{province.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-mono">{province.code}</span>
                                </td>
                                <td>
                                    <span className="location-text">{province.countryName}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${province.isActive ? 'active' : 'inactive'}`}>
                                        {province.isActive ? '활성' : '비활성'}
                                    </span>
                                </td>
                                <td>{formatDate(province.createdAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <Link
                                            href={`/admin/provinces/${province.id}/edit`}
                                            className="btn btn-sm btn-outline"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteProvince(province.id, province.name)}
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

                {filteredProvinces.length === 0 && (
                    <div className="empty-state">
                        <i className="fas fa-map-marked-alt"></i>
                        <p>등록된 지방이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
