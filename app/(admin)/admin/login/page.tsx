"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Alert, AlertDescription } from '../../../../components/ui/alert';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const { signIn, isAdmin, loading } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // 이미 로그인되어 있으면 대시보드로 리다이렉트
    useEffect(() => {
        if (!loading && isAdmin) {
            router.push('/admin');
        }
    }, [isAdmin, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await signIn(formData.email, formData.password);
            // 성공하면 useEffect에서 리다이렉트됨
        } catch (error: any) {
            console.error('로그인 오류:', error);

            // 파이어베이스 오류 메시지를 한국어로 변환
            switch (error.code) {
                case 'auth/user-not-found':
                    setError('등록되지 않은 이메일입니다.');
                    break;
                case 'auth/wrong-password':
                    setError('비밀번호가 올바르지 않습니다.');
                    break;
                case 'auth/invalid-email':
                    setError('유효하지 않은 이메일 형식입니다.');
                    break;
                case 'auth/user-disabled':
                    setError('비활성화된 계정입니다.');
                    break;
                case 'auth/too-many-requests':
                    setError('너무 많은 로그인 시도로 인해 일시적으로 차단되었습니다.');
                    break;
                default:
                    setError('로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    // 로딩 중이면 로딩 화면 표시
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardContent className="flex flex-col items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                        <p className="text-gray-600">로딩 중...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8">
                <Card>
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">
                            5MGOLF 관리자
                        </CardTitle>
                        <CardDescription className="text-center">
                            관리자 계정으로 로그인하세요
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="email">이메일</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    placeholder="admin@5mgolf.com"
                                    className="w-full"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">비밀번호</Label>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    placeholder="비밀번호를 입력하세요"
                                    className="w-full"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        로그인 중...
                                    </>
                                ) : (
                                    '로그인'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 text-center">
                            <Link
                                href="/"
                                className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                사이트로 돌아가기
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
