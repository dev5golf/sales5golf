"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';

export default function ApiTestPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [response, setResponse] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // 폼 상태
    const [formData, setFormData] = useState({
        access_token: '',
        accountnum: '',
        datatype: 'json',
        charset: 'utf8',
        datefrom: '',
        dateto: '',
        bkcode: '',
        istest: 'n',
    });

    // 권한 검사
    if (!loading && user?.role !== 'super_admin' && user?.role !== 'site_admin') {
        router.push('/admin/tee-times');
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600">로딩 중...</p>
                </div>
            </div>
        );
    }

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setResponse(null);

        try {
            // FormData 생성
            const requestFormData = new FormData();
            if (formData.accountnum) requestFormData.append('accountnum', formData.accountnum);
            requestFormData.append('datatype', formData.datatype);
            requestFormData.append('charset', formData.charset);
            if (formData.datefrom) requestFormData.append('datefrom', formData.datefrom);
            if (formData.dateto) requestFormData.append('dateto', formData.dateto);
            if (formData.bkcode) requestFormData.append('bkcode', formData.bkcode);
            requestFormData.append('istest', formData.istest);

            // API 호출
            const res = await fetch('/api/bankda-test', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${formData.access_token}`,
                },
                body: requestFormData,
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || '요청 실패');
                setResponse(data);
            } else {
                setResponse(data);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        // YYYYMMDD 형식으로 변환
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}${month}${day}`;
    };

    const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        handleInputChange('datefrom', formatDate(dateValue));
    };

    const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const dateValue = e.target.value;
        handleInputChange('dateto', formatDate(dateValue));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* 헤더 */}
                <div className="flex items-center gap-4 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push('/admin/admin-tools')}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-semibold text-gray-800">Bankda API 테스트</h1>
                        <p className="text-gray-600 mt-1">은행 거래내역 조회 API 테스트</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 입력 폼 */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">요청 파라미터</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Access Token */}
                            <div className="space-y-2">
                                <Label htmlFor="access_token">
                                    Access Token <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="access_token"
                                    type="text"
                                    value={formData.access_token}
                                    onChange={(e) => handleInputChange('access_token', e.target.value)}
                                    placeholder="Bearer 없이 토큰만 입력하세요"
                                    required
                                />
                                <p className="text-xs text-gray-500">
                                    자동으로 Authorization: Bearer 형식으로 전송됩니다
                                </p>
                            </div>

                            {/* 계좌번호 */}
                            <div className="space-y-2">
                                <Label htmlFor="accountnum">계좌번호 (숫자만, 생략시 전체계좌조회)</Label>
                                <Input
                                    id="accountnum"
                                    type="text"
                                    value={formData.accountnum}
                                    onChange={(e) => handleInputChange('accountnum', e.target.value.replace(/\D/g, ''))}
                                    placeholder="숫자만 입력"
                                />
                            </div>

                            {/* 데이터 타입 */}
                            <div className="space-y-2">
                                <Label htmlFor="datatype">데이터 타입</Label>
                                <select
                                    id="datatype"
                                    value={formData.datatype}
                                    onChange={(e) => handleInputChange('datatype', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="json">JSON</option>
                                    <option value="xml">XML</option>
                                </select>
                            </div>

                            {/* 문자셋 */}
                            <div className="space-y-2">
                                <Label htmlFor="charset">문자셋</Label>
                                <select
                                    id="charset"
                                    value={formData.charset}
                                    onChange={(e) => handleInputChange('charset', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="utf8">UTF-8</option>
                                    <option value="euckr">EUC-KR</option>
                                </select>
                            </div>

                            {/* 조회기간 시작일 */}
                            <div className="space-y-2">
                                <Label htmlFor="datefrom">조회기간 시작일 (YYYYMMDD)</Label>
                                <Input
                                    id="datefrom"
                                    type="date"
                                    onChange={handleDateFromChange}
                                    placeholder="YYYYMMDD"
                                />
                                {formData.datefrom && (
                                    <p className="text-sm text-gray-500">입력값: {formData.datefrom}</p>
                                )}
                            </div>

                            {/* 조회기간 종료일 */}
                            <div className="space-y-2">
                                <Label htmlFor="dateto">조회기간 종료일 (YYYYMMDD)</Label>
                                <Input
                                    id="dateto"
                                    type="date"
                                    onChange={handleDateToChange}
                                    placeholder="YYYYMMDD"
                                />
                                {formData.dateto && (
                                    <p className="text-sm text-gray-500">입력값: {formData.dateto}</p>
                                )}
                            </div>

                            {/* 거래내역 고유번호 */}
                            <div className="space-y-2">
                                <Label htmlFor="bkcode">거래내역 고유번호 (숫자만)</Label>
                                <Input
                                    id="bkcode"
                                    type="text"
                                    value={formData.bkcode}
                                    onChange={(e) => handleInputChange('bkcode', e.target.value.replace(/\D/g, ''))}
                                    placeholder="숫자만 입력"
                                />
                            </div>

                            {/* 테스트 여부 */}
                            <div className="space-y-2">
                                <Label htmlFor="istest">테스트 여부</Label>
                                <select
                                    id="istest"
                                    value={formData.istest}
                                    onChange={(e) => handleInputChange('istest', e.target.value)}
                                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                >
                                    <option value="n">N (실제)</option>
                                    <option value="y">Y (테스트)</option>
                                </select>
                            </div>

                            {/* 제출 버튼 */}
                            <Button
                                type="submit"
                                disabled={isLoading || !formData.access_token}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        요청 중...
                                    </>
                                ) : (
                                    <>
                                        <Send className="h-4 w-4 mr-2" />
                                        API 요청
                                    </>
                                )}
                            </Button>
                        </form>
                    </Card>

                    {/* 응답 결과 */}
                    <Card className="p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">응답 결과</h2>
                        <div className="space-y-4">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-800 font-semibold">오류 발생</p>
                                    <p className="text-red-600 text-sm mt-1">{error}</p>
                                </div>
                            )}

                            {response && (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>응답 데이터</Label>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                navigator.clipboard.writeText(JSON.stringify(response, null, 2));
                                            }}
                                        >
                                            복사
                                        </Button>
                                    </div>
                                    <pre className="p-4 bg-gray-900 text-green-400 rounded-md overflow-auto text-xs max-h-[600px]">
                                        {JSON.stringify(response, null, 2)}
                                    </pre>
                                </div>
                            )}

                            {!response && !error && (
                                <div className="p-8 text-center text-gray-400">
                                    <p>요청을 보내면 응답 결과가 여기에 표시됩니다.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* API 정보 */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">API 정보</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                        <p><strong>URL:</strong> https://a.bankda.com/dtsvc/bank_tr.php</p>
                        <p><strong>Method:</strong> POST</p>
                        <p><strong>Headers:</strong> Authorization: Bearer {`{token}`} (필수)</p>
                        <p><strong>Body:</strong> FormData</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}

