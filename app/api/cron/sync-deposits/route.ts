import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Firebase Admin SDK 초기화
if (!getApps().length) {
    try {
        let serviceAccount;

        // 환경별 프로젝트 선택 (lib/firebase.ts와 동일한 로직)
        const isDevelopment = process.env.NODE_ENV === 'development' ||
            process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.includes('-dev') ||
            process.env.VERCEL_ENV === 'preview'; // Preview 환경도 개발 환경으로 처리

        // Vercel 환경에서는 환경 변수 사용, 로컬에서는 파일 사용
        if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
            // Vercel 환경: 환경 변수에서 서비스 계정 키 가져오기
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
        } else {
            // 로컬 환경: 환경에 따라 다른 서비스 계정 파일 사용
            const fileName = isDevelopment
                ? 'firebase-service-account-dev.json'
                : 'firebase-service-account-prod.json';
            const serviceAccountPath = join(process.cwd(), fileName);
            serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        }

        initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id
        });
    } catch (error) {
        console.error('Firebase Admin SDK 초기화 실패:', error);
    }
}

/**
 * 뱅크다 API를 통해 입금내역을 자동으로 동기화하는 Cron 엔드포인트
 * Vercel Cron에서 5분마다 호출됨
 */
export async function GET(request: NextRequest) {
    try {
        // 환경변수 확인
        const accessToken = process.env.BANKDA_ACCESS_TOKEN;
        const accountNum = process.env.BANKDA_ACCOUNT_NUM;

        if (!accessToken) {
            console.error('BANKDA_ACCESS_TOKEN 환경변수가 설정되지 않았습니다.');
            return NextResponse.json(
                { error: 'BANKDA_ACCESS_TOKEN이 설정되지 않았습니다.' },
                { status: 500 }
            );
        }

        // 최근 1일치 조회 (YYYYMMDD 형식)
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const formatDate = (date: Date): string => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}${month}${day}`;
        };

        const dateFrom = formatDate(yesterday);
        const dateTo = formatDate(today);

        // 뱅크다 API 호출
        const formData = new FormData();
        if (accountNum) {
            formData.append('accountnum', accountNum);
        }
        formData.append('datatype', 'json');
        formData.append('charset', 'utf8');
        formData.append('datefrom', dateFrom);
        formData.append('dateto', dateTo);
        formData.append('istest', 'y'); // 테스트 모드

        const bankdaResponse = await fetch('https://a.bankda.com/dtsvc/bank_tr.php', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!bankdaResponse.ok) {
            const errorText = await bankdaResponse.text();
            console.error('뱅크다 API 호출 실패:', {
                status: bankdaResponse.status,
                statusText: bankdaResponse.statusText,
                details: errorText
            });
            return NextResponse.json(
                {
                    error: '뱅크다 API 호출 실패',
                    status: bankdaResponse.status,
                    details: errorText
                },
                { status: bankdaResponse.status }
            );
        }

        // 응답 데이터 파싱
        const contentType = bankdaResponse.headers.get('content-type');
        let bankdaData: any;

        if (contentType?.includes('application/json')) {
            bankdaData = await bankdaResponse.json();
        } else {
            const text = await bankdaResponse.text();
            try {
                bankdaData = JSON.parse(text);
            } catch {
                console.error('뱅크다 API 응답 파싱 실패:', text);
                return NextResponse.json(
                    { error: '응답 데이터 파싱 실패' },
                    { status: 500 }
                );
            }
        }

        // 응답 구조 확인
        if (!bankdaData?.response?.bank || !Array.isArray(bankdaData.response.bank)) {
            console.log('입금 내역이 없습니다.');
            return NextResponse.json({
                success: true,
                message: '동기화 완료 (입금 내역 없음)',
                saved: 0
            });
        }

        const bankTransactions = bankdaData.response.bank;
        let savedCount = 0;
        let skippedCount = 0;
        const errors: string[] = [];

        // Admin SDK로 Firestore 접근
        const db = getFirestore();

        // 각 거래 내역 처리
        for (const transaction of bankTransactions) {
            try {
                // 입금만 처리 (bkinput > 0)
                const bkinput = parseInt(transaction.bkinput || '0', 10);
                if (bkinput <= 0) {
                    skippedCount++;
                    continue;
                }

                const bkcode = transaction.bkcode;
                if (!bkcode) {
                    console.warn('bkcode가 없는 거래 내역:', transaction);
                    skippedCount++;
                    continue;
                }

                // 중복 체크: bkcode로 기존 데이터 확인
                const existingQuery = db.collection('deposits').where('bkcode', '==', bkcode);
                const existingSnapshot = await existingQuery.get();

                if (!existingSnapshot.empty) {
                    console.log(`이미 존재하는 거래 내역 (bkcode: ${bkcode})`);
                    skippedCount++;
                    continue;
                }

                // 데이터 변환
                const depositData = {
                    bkcode: transaction.bkcode,
                    type: '계좌이체', // 뱅크다 API는 계좌이체로 고정
                    depositDate: transaction.bkdate, // YYYYMMDD
                    depositTime: transaction.bktime, // HHMMSS
                    depositor: transaction.bkjukyo, // 입금자
                    amount: bkinput, // 입금액
                    representative: '', // 대표자 (빈값, 나중에 추가 가능)
                    manager: '', // 담당자 (빈값, 나중에 추가 가능)
                    reservationId: '', // 예약ID (빈값, 나중에 추가 가능)
                    userId: '', // 사용자ID (빈값, 나중에 추가 가능)
                    status: 'pending', // 기본값: 대기
                    createdBy: 'bankda-sync',
                    createdAt: FieldValue.serverTimestamp()
                };

                // 입금 데이터 저장 (Admin SDK 직접 사용)
                await db.collection('deposits').add(depositData);
                savedCount++;
                console.log(`입금 내역 저장 성공 (bkcode: ${bkcode}, 금액: ${bkinput})`);
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                errors.push(`거래 처리 실패: ${errorMessage}`);
                console.error('거래 내역 처리 중 오류:', error);
            }
        }

        return NextResponse.json({
            success: true,
            message: '동기화 완료',
            saved: savedCount,
            skipped: skippedCount,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('입금 동기화 실패:', error);
        return NextResponse.json(
            {
                error: '동기화 중 오류가 발생했습니다.',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
