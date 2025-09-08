'use client';

import React, { useState, useRef } from 'react';
import { parseCSVToTranslations, validateCSV, generateCSVTemplate, translationsToCSV, Translations } from '@/lib/i18n/csv-parser';
import Papa from 'papaparse';

const TranslationManager: React.FC = () => {
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [csvFile, setCsvFile] = useState<File | null>(null);
    const [translations, setTranslations] = useState<Translations | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleResetTranslations = () => {
        if (confirm('정말로 번역을 초기화하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 사용자 정의 번역이 모두 삭제됩니다.')) {
            try {
                // localStorage에서 번역 데이터 제거
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('translations_ko');
                    localStorage.removeItem('translations_en');
                    localStorage.removeItem('translations_vi');
                    localStorage.removeItem('language');
                }

                setSuccessMessage('번역이 기본값으로 초기화되었습니다.');

                // 페이지 새로고침하여 번역 적용
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } catch (error) {
                console.error('번역 초기화 중 오류:', error);
                setSuccessMessage('번역 초기화 중 오류가 발생했습니다.');
            }
        }
    };

    const handleBackupTranslations = () => {
        try {
            // 현재 번역 데이터를 JSON으로 다운로드
            const translations = {
                ko: JSON.parse(localStorage.getItem('translations_ko') || '{}'),
                en: JSON.parse(localStorage.getItem('translations_en') || '{}'),
                vi: JSON.parse(localStorage.getItem('translations_vi') || '{}'),
                language: localStorage.getItem('language') || 'ko'
            };

            const dataStr = JSON.stringify(translations, null, 2);
            const blob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `translations-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setSuccessMessage('번역 백업이 완료되었습니다.');
        } catch (error) {
            console.error('번역 백업 중 오류:', error);
            setSuccessMessage('번역 백업 중 오류가 발생했습니다.');
        }
    };

    const handleRestoreTranslations = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const translations = JSON.parse(e.target?.result as string);

                if (translations.ko && translations.en && translations.vi) {
                    localStorage.setItem('translations_ko', JSON.stringify(translations.ko));
                    localStorage.setItem('translations_en', JSON.stringify(translations.en));
                    localStorage.setItem('translations_vi', JSON.stringify(translations.vi));
                    if (translations.language) {
                        localStorage.setItem('language', translations.language);
                    }

                    setSuccessMessage('번역이 성공적으로 복원되었습니다.');

                    setTimeout(() => {
                        window.location.reload();
                    }, 1000);
                } else {
                    setSuccessMessage('올바르지 않은 백업 파일입니다.');
                }
            } catch (error) {
                console.error('번역 복원 중 오류:', error);
                setSuccessMessage('번역 복원 중 오류가 발생했습니다.');
            }
        };
        reader.readAsText(file);
    };

    const handleFileUpload = async (file: File) => {
        try {
            const csvContent = await file.text();
            const parsedTranslations = parseCSVToTranslations(csvContent);

            // CSV 데이터 검증
            const csvData = Papa.parse(csvContent, { header: true, skipEmptyLines: true }).data;
            const validationErrors = validateCSV(csvData as any[]);

            if (validationErrors.length > 0) {
                setErrors(validationErrors);
                setSuccessMessage('');
            } else {
                setTranslations(parsedTranslations);
                setErrors([]);
                setSuccessMessage('CSV 파일이 성공적으로 파싱되었습니다.');
            }
        } catch (error) {
            setErrors([`CSV 파일 파싱 중 오류가 발생했습니다: ${error}`]);
            setSuccessMessage('');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCsvFile(file);
            handleFileUpload(file);
        }
    };

    const handleSaveTranslations = () => {
        if (!translations) return;

        try {
            // localStorage에 저장
            localStorage.setItem('translations_ko', JSON.stringify(translations.ko));
            localStorage.setItem('translations_en', JSON.stringify(translations.en));
            localStorage.setItem('translations_vi', JSON.stringify(translations.vi));

            setSuccessMessage('번역이 성공적으로 저장되었습니다.');

            // 페이지 새로고침하여 번역 적용
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } catch (error) {
            setErrors([`번역 저장 중 오류가 발생했습니다: ${error}`]);
        }
    };

    const handleDownloadTemplate = () => {
        const template = generateCSVTemplate();
        const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'translations-template.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleDownloadCurrent = () => {
        if (!translations) return;

        const csv = translationsToCSV(translations);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'current-translations.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-3xl font-bold mb-6">번역 관리</h1>

            {/* 기본 정보 섹션 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">현재 번역 상태</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-900">한국어 (기본)</h3>
                            <p className="text-sm text-blue-700">기본 번역이 적용됨</p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-900">English</h3>
                            <p className="text-sm text-green-700">기본 번역이 적용됨</p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-medium text-purple-900">Tiếng Việt</h3>
                            <p className="text-sm text-purple-700">기본 번역이 적용됨</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CSV 업로드 섹션 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">CSV 파일 업로드</h2>

                {/* CSV 업로드 주의사항 */}
                <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                    <h3 className="text-sm font-medium text-amber-800 mb-3">📋 CSV 파일 업로드 주의사항</h3>
                    <div className="text-sm text-amber-700 space-y-2">
                        <div className="flex items-start">
                            <span className="font-medium mr-2">•</span>
                            <span><strong>CSV 형식 유지:</strong> 쉼표로 구분된 형식을 정확히 지켜주세요</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-medium mr-2">•</span>
                            <span><strong>따옴표 처리:</strong> 쉼표가 포함된 텍스트는 따옴표로 감싸주세요</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-medium mr-2">•</span>
                            <span><strong>빈 값 방지:</strong> key, ko, en, vi 모든 컬럼에 값이 있어야 합니다</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-medium mr-2">•</span>
                            <span><strong>키 중복 방지:</strong> 같은 key를 두 번 사용하지 마세요</span>
                        </div>
                        <div className="flex items-start">
                            <span className="font-medium mr-2">•</span>
                            <span><strong>기존 번역 유지:</strong> 템플릿의 기존 번역은 그대로 두고 새로운 번역만 추가하세요</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            번역 CSV 파일 선택
                        </label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={handleDownloadTemplate}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            템플릿 다운로드
                        </button>

                        {translations && (
                            <button
                                onClick={handleDownloadCurrent}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                현재 번역 다운로드
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* 에러 메시지 */}
            {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                    <h3 className="text-sm font-medium text-red-800 mb-2">오류가 발생했습니다:</h3>
                    <ul className="list-disc list-inside text-sm text-red-700">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* 번역 관리 섹션 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">번역 관리</h2>

                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={handleBackupTranslations}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            백업 다운로드
                        </button>

                        <label className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 flex items-center justify-center cursor-pointer">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                            백업 복원
                            <input
                                type="file"
                                accept=".json"
                                onChange={handleRestoreTranslations}
                                className="hidden"
                            />
                        </label>

                        <button
                            onClick={handleResetTranslations}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            초기화
                        </button>

                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center justify-center"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            새로고침
                        </button>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                        <h3 className="text-sm font-medium text-yellow-800 mb-2">📋 사용법 안내</h3>
                        <div className="text-sm text-yellow-700 space-y-1">
                            <p><strong>백업 다운로드:</strong> 현재 번역 설정을 JSON 파일로 저장</p>
                            <p><strong>백업 복원:</strong> 이전에 저장한 번역 설정을 불러오기</p>
                            <p><strong>초기화:</strong> 사용자 정의 번역을 삭제하고 기본값으로 복원</p>
                            <p><strong>새로고침:</strong> 페이지를 새로고침하여 최신 상태 확인</p>
                        </div>
                    </div>

                    <div className="text-sm text-gray-600">
                        <p>• 현재 기본 번역이 적용되어 있습니다.</p>
                        <p>• 번역을 수정하려면 개발자가 코드를 직접 수정해야 합니다.</p>
                        <p>• 언어 전환은 사용자 페이지에서 테스트할 수 있습니다.</p>
                        <p>• <strong>중요:</strong> 초기화 전에 반드시 백업을 다운로드하세요!</p>
                    </div>
                </div>
            </div>

            {/* 번역 미리보기 */}
            {translations && (
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">번역 미리보기</h2>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Key
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        한국어
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        English
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tiếng Việt
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {Object.keys(translations.ko).slice(0, 10).map((key) => (
                                    <tr key={key}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {key}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {translations.ko[key]}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {translations.en[key]}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {translations.vi[key]}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {Object.keys(translations.ko).length > 10 && (
                        <p className="text-sm text-gray-500 mt-2">
                            ... 및 {Object.keys(translations.ko).length - 10}개 더
                        </p>
                    )}

                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSaveTranslations}
                            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        >
                            번역 저장
                        </button>
                    </div>
                </div>
            )}

            {/* 기본 번역 미리보기 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">기본 번역 미리보기</h2>

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Key
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    한국어
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    English
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Tiếng Việt
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    common.search
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    검색
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Search
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Tìm kiếm
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    courses.title
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    골프장 목록
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Golf Course List
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Danh sách sân golf
                                </td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    nav.home
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    홈
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Home
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    Trang chủ
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 성공 메시지 */}
            {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
                    <p className="text-sm text-green-800">{successMessage}</p>
                </div>
            )}
        </div>
    );
};

export default TranslationManager;