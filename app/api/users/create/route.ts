import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Firebase Admin SDK 초기화
if (!getApps().length) {
    try {
        // JSON 파일에서 서비스 계정 키 가져오기
        const serviceAccountPath = join(process.cwd(), 'firebase-service-account.json');
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

        initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
    } catch (error) {
        console.error('Firebase Admin SDK 초기화 실패:', error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { name, email, password, phone, role, isActive, courseId } = await request.json();

        // 입력 검증
        if (!name || !email || !password) {
            return NextResponse.json(
                { error: '이름, 이메일, 비밀번호는 필수입니다.' },
                { status: 400 }
            );
        }

        const auth = getAuth();
        const db = getFirestore();

        // 1. Firebase Authentication에 사용자 생성 (자동 로그인 없음)
        const userRecord = await auth.createUser({
            email: email,
            password: password,
            displayName: name,
            disabled: !isActive
        });

        // 2. Firestore에 추가 정보 저장
        await db.collection('users').doc(userRecord.uid).set({
            name: name,
            email: email,
            phone: phone || '',
            role: role || 'user',
            isActive: isActive !== undefined ? isActive : true,
            courseId: courseId || '',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        return NextResponse.json({
            success: true,
            message: '회원이 성공적으로 등록되었습니다.',
            userId: userRecord.uid
        });

    } catch (error: any) {
        console.error('사용자 생성 실패:', error);

        // Firebase Auth 에러 처리
        if (error.code === 'auth/email-already-exists') {
            return NextResponse.json(
                { error: '이미 사용 중인 이메일입니다.' },
                { status: 400 }
            );
        } else if (error.code === 'auth/weak-password') {
            return NextResponse.json(
                { error: '비밀번호는 6자 이상이어야 합니다.' },
                { status: 400 }
            );
        } else if (error.code === 'auth/invalid-email') {
            return NextResponse.json(
                { error: '유효하지 않은 이메일 형식입니다.' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: '회원 등록에 실패했습니다.' },
            { status: 500 }
        );
    }
}
