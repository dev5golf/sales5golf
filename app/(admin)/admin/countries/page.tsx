"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '../../../../contexts/AuthContext';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import Link from 'next/link';
import '../../admin.css';

interface Country {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    createdAt: any;
    updatedAt: any;
}

export default function CountriesPage() {
    const { user: currentUser, isSuperAdmin } = useAuth();
    const [countries, setCountries] = useState<Country[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [showAddForm, setShowAddForm] = useState(false);
    const [newCountry, setNewCountry] = useState({
        name: '',
        code: '',
        isActive: true
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        fetchCountries();
    }, []);

    const fetchCountries = async () => {
        try {
            setLoading(true);
            const q = query(collection(db, 'countries'), orderBy('name', 'asc'));
            const snapshot = await getDocs(q);
            const countryData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Country[];

            setCountries(countryData);

        } catch (error) {
            console.error('국가 목록 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        // 검색 로직은 클라이언트 사이드에서 처리
    };

    const filteredCountries = countries.filter(country => {
        // 검색어 필터
        if (searchTerm && !country.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !country.code.toLowerCase().includes(searchTerm.toLowerCase())) {
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

    const validateCountryForm = () => {
        const newErrors: Record<string, string> = {};

        if (!newCountry.name.trim()) {
            newErrors.name = '국가 이름을 입력해주세요.';
        }

        if (!newCountry.code.trim()) {
            newErrors.code = '국가 코드를 입력해주세요.';
        } else if (newCountry.code.length < 2) {
            newErrors.code = '국가 코드는 2자리 이상이어야 합니다.';
        }

        // 중복 체크
        const existingCountry = countries.find(c =>
            c.code.toLowerCase() === newCountry.code.toLowerCase() ||
            c.name.toLowerCase() === newCountry.name.toLowerCase()
        );
        if (existingCountry) {
            newErrors.duplicate = '이미 존재하는 국가 이름 또는 코드입니다.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleAddCountry = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCountryForm()) {
            return;
        }

        try {
            const countryData = {
                name: newCountry.name.trim(),
                code: newCountry.code.trim().toUpperCase(),
                isActive: newCountry.isActive,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            };

            await setDoc(doc(db, 'countries', newCountry.code.trim().toUpperCase()), countryData);

            // 목록 새로고침
            await fetchCountries();

            // 폼 초기화
            setNewCountry({ name: '', code: '', isActive: true });
            setShowAddForm(false);
            setErrors({});

            alert('국가가 성공적으로 등록되었습니다.');

        } catch (error: any) {
            console.error('국가 등록 실패:', error);
            setErrors({ submit: '국가 등록에 실패했습니다.' });
        }
    };

    const handleDeleteCountry = async (countryId: string, countryName: string) => {
        if (!confirm(`"${countryName}" 국가를 삭제하시겠습니까?\n\n주의: 이 국가와 관련된 모든 시도, 구/군 데이터도 함께 삭제됩니다.`)) {
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

    const formatDate = (timestamp: any) => {
        if (!timestamp) return '-';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('ko-KR');
    };

    if (loading) {
        return (
            <div className="admin-loading">
                <div className="loading-spinner"></div>
                <p>국가 목록을 불러오는 중...</p>
            </div>
        );
    }

    return (
        <div className="admin-page">
            <div className="dashboard-header">
                <h1>국가 관리</h1>
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
                        국가 등록
                    </button>
                </div>
            </div>

            {/* 국가 등록 폼 */}
            {showAddForm && (
                <div className="form-container" style={{ marginBottom: '2rem' }}>
                    <div className="form-header">
                        <h3>새 국가 등록</h3>
                        <button
                            onClick={() => {
                                setShowAddForm(false);
                                setNewCountry({ name: '', code: '', isActive: true });
                                setErrors({});
                            }}
                            className="btn btn-outline btn-sm"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    <form onSubmit={handleAddCountry} className="admin-form">
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
                                    value={newCountry.name}
                                    onChange={(e) => setNewCountry(prev => ({ ...prev, name: e.target.value }))}
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
                                    value={newCountry.code}
                                    onChange={(e) => setNewCountry(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                                    className={errors.code ? 'error' : ''}
                                    placeholder="예: KR"
                                    maxLength={3}
                                />
                                {errors.code && <span className="error-text">{errors.code}</span>}
                                {errors.duplicate && <span className="error-text">{errors.duplicate}</span>}
                            </div>
                        </div>

                        <div className="form-group">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={newCountry.isActive}
                                    onChange={(e) => setNewCountry(prev => ({ ...prev, isActive: e.target.checked }))}
                                />
                                <span className="checkmark"></span>
                                활성 상태
                            </label>
                        </div>

                        <div className="form-actions">
                            <button
                                type="submit"
                                className="btn btn-primary"
                            >
                                국가 등록
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowAddForm(false);
                                    setNewCountry({ name: '', code: '', isActive: true });
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
                            placeholder="국가명, 국가코드로 검색..."
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

            {/* 국가 목록 */}
            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>국가명</th>
                            <th>국가코드</th>
                            <th>상태</th>
                            <th>등록일</th>
                            <th>액션</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCountries.map((country) => (
                            <tr key={country.id}>
                                <td>
                                    <div className="course-info">
                                        <span className="course-name">{country.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className="font-mono">{country.code}</span>
                                </td>
                                <td>
                                    <span className={`status-badge ${country.isActive ? 'active' : 'inactive'}`}>
                                        {country.isActive ? '활성' : '비활성'}
                                    </span>
                                </td>
                                <td>{formatDate(country.createdAt)}</td>
                                <td>
                                    <div className="action-buttons">
                                        <Link
                                            href={`/admin/countries/${country.id}/edit`}
                                            className="btn btn-sm btn-outline"
                                        >
                                            <i className="fas fa-edit"></i>
                                        </Link>
                                        <button
                                            onClick={() => handleDeleteCountry(country.id, country.name)}
                                            className="btn btn-sm btn-danger"
                                            disabled={country.code === 'KR'} // 기본 국가는 삭제 불가
                                        >
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredCountries.length === 0 && (
                    <div className="empty-state">
                        <i className="fas fa-globe"></i>
                        <p>등록된 국가가 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
