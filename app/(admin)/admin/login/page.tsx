"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../../../contexts/AuthContext';
import '../../admin.css';

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
            <div className="admin-login-card">
                <div className="loading-spinner"></div>
                <p>로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="admin-login-card">
            <div className="admin-login-header">
                <h1>5MGOLF 관리자</h1>
                <p>관리자 로그인</p>
            </div>

            <form onSubmit={handleSubmit} className="admin-login-form">
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="admin@5mgolf.com"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">비밀번호</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        placeholder="비밀번호를 입력하세요"
                    />
                </div>

                <button
                    type="submit"
                    className="btn btn-primary admin-login-btn"
                    disabled={isLoading}
                >
                    {isLoading ? '로그인 중...' : '로그인'}
                </button>
            </form>

            <div className="admin-login-footer">
                <Link href="/" className="back-to-site">
                    <i className="fas fa-arrow-left"></i>
                    사이트로 돌아가기
                </Link>
            </div>

            <div className="demo-credentials">
                <p><strong>관리자 계정으로 로그인하세요</strong></p>
                <p>파이어베이스 인증을 사용합니다</p>
            </div>
        </div>
    );
}
