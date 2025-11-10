/**
 * Firebase Authentication 사용자 동기화 스크립트
 * 
 * 사용법:
 *   npm run sync:users -- --from prod --to dev --role super_admin,course_admin
 *   npm run sync:users -- --from prod --to dev --emails admin@example.com
 *   npm run sync:users -- --from prod --to dev --all
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface SyncUserOptions {
    from: 'prod' | 'dev';
    to: 'prod' | 'dev';
    role?: string[];
    emails?: string[];
    all?: boolean;
    resetPassword?: boolean;
}

// 프로젝트 설정
const PROJECTS = {
    prod: 'sales5golf',
    dev: 'sales5golf-dev'
};

// Firebase Admin SDK 초기화
function initializeAdminApp(projectId: string, serviceAccountPath: string): App {
    const existingApp = getApps().find(app => app.options.projectId === projectId);
    if (existingApp) {
        return existingApp;
    }

    try {
        const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
        return initializeApp({
            credential: cert(serviceAccount),
            projectId: projectId
        }, projectId);
    } catch (error) {
        throw new Error(`프로젝트 ${projectId} 초기화 실패: ${error}`);
    }
}

// 사용자 복사 (임시 비밀번호 생성)
async function copyUser(
    sourceAuth: Auth,
    targetAuth: Auth,
    sourceDb: Firestore,
    targetDb: Firestore,
    uid: string,
    resetPassword: boolean
): Promise<string | null> {
    // 소스에서 사용자 정보 가져오기 (catch 블록에서도 사용하기 위해 밖에 선언)
    let userRecord;
    let userDoc;

    try {
        userRecord = await sourceAuth.getUser(uid);
        userDoc = await sourceDb.collection('users').doc(uid).get();

        // 대상에 사용자 생성 (임시 비밀번호)
        const tempPassword = resetPassword ? generateTempPassword() : undefined;

        const newUserRecord = await targetAuth.createUser({
            uid: userRecord.uid, // UID 유지
            email: userRecord.email,
            emailVerified: userRecord.emailVerified,
            displayName: userRecord.displayName,
            disabled: userRecord.disabled,
            password: tempPassword
        });

        console.log(`  ✅ 사용자 생성: ${userRecord.email} (UID: ${uid})`);
        if (tempPassword) {
            console.log(`     임시 비밀번호: ${tempPassword}`);
        }

        // Firestore users 컬렉션도 복사
        if (userDoc.exists) {
            await targetDb.collection('users').doc(uid).set(userDoc.data()!);
            console.log(`  ✅ Firestore 사용자 데이터 복사 완료`);
        }

        return tempPassword || null;

    } catch (error: any) {
        if (error.code === 'auth/uid-already-exists') {
            // 이미 존재하는 사용자의 경우 비밀번호 재설정
            if (resetPassword) {
                const tempPassword = generateTempPassword();
                await targetAuth.updateUser(uid, {
                    password: tempPassword
                });
                console.log(`  🔄 사용자 비밀번호 재설정: ${userRecord.email} (UID: ${uid})`);
                console.log(`     새 임시 비밀번호: ${tempPassword}`);

                // Firestore users 컬렉션도 업데이트
                if (userDoc.exists) {
                    await targetDb.collection('users').doc(uid).set(userDoc.data()!, { merge: true });
                }

                return tempPassword;
            } else {
                console.log(`  ⏭️  건너뜀 (이미 존재): ${uid}`);
                return null;
            }
        } else {
            throw error;
        }
    }
}

// 임시 비밀번호 생성
function generateTempPassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
}

// 역할별 사용자 필터링
async function getUsersByRole(
    db: Firestore,
    roles: string[]
): Promise<string[]> {
    const users: string[] = [];

    for (const role of roles) {
        const snapshot = await db.collection('users')
            .where('role', '==', role)
            .get();

        snapshot.docs.forEach(doc => {
            if (!users.includes(doc.id)) {
                users.push(doc.id);
            }
        });
    }

    return users;
}

// 이메일별 사용자 필터링
async function getUsersByEmails(
    auth: Auth,
    emails: string[]
): Promise<string[]> {
    const uids: string[] = [];

    for (const email of emails) {
        try {
            const user = await auth.getUserByEmail(email);
            uids.push(user.uid);
        } catch (error: any) {
            if (error.code !== 'auth/user-not-found') {
                console.warn(`  ⚠️  사용자 찾기 실패: ${email}`, error.message);
            }
        }
    }

    return uids;
}

// 모든 사용자 가져오기
async function getAllUsers(auth: Auth): Promise<string[]> {
    const uids: string[] = [];
    let nextPageToken: string | undefined;

    do {
        const listUsersResult = await auth.listUsers(1000, nextPageToken);
        listUsersResult.users.forEach(user => {
            uids.push(user.uid);
        });
        nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    return uids;
}

// 메인 동기화 함수
async function syncUsers(options: SyncUserOptions) {
    const { from, to, role, emails, all, resetPassword = true } = options;

    if (from === to) {
        console.error('❌ 소스와 대상이 동일합니다.');
        process.exit(1);
    }

    console.log(`\n🔄 사용자 동기화 시작`);
    console.log(`   소스: ${PROJECTS[from]} (${from})`);
    console.log(`   대상: ${PROJECTS[to]} (${to})`);

    // Service Account 파일 경로
    const sourceServiceAccount = join(process.cwd(), `firebase-service-account-${from}.json`);
    const targetServiceAccount = join(process.cwd(), `firebase-service-account-${to}.json`);

    try {
        // Admin SDK 초기화
        const sourceApp = initializeAdminApp(PROJECTS[from], sourceServiceAccount);
        const targetApp = initializeAdminApp(PROJECTS[to], targetServiceAccount);

        const sourceAuth = getAuth(sourceApp);
        const targetAuth = getAuth(targetApp);
        const sourceDb = getFirestore(sourceApp);
        const targetDb = getFirestore(targetApp);

        // 동기화할 사용자 목록 결정
        let uidsToSync: string[];

        if (all) {
            uidsToSync = await getAllUsers(sourceAuth);
            console.log(`\n📋 전체 사용자 동기화: ${uidsToSync.length}명`);
        } else if (emails && emails.length > 0) {
            uidsToSync = await getUsersByEmails(sourceAuth, emails);
            console.log(`\n📋 이메일로 필터링: ${uidsToSync.length}명`);
        } else if (role && role.length > 0) {
            uidsToSync = await getUsersByRole(sourceDb, role);
            console.log(`\n📋 역할로 필터링: ${uidsToSync.length}명 (${role.join(', ')})`);
        } else {
            console.error('❌ 역할, 이메일을 지정하거나 --all 옵션을 사용하세요.');
            process.exit(1);
        }

        // 각 사용자 복사
        let successCount = 0;
        const passwordLog: Array<{ email: string; password: string }> = [];

        for (const uid of uidsToSync) {
            try {
                const password = await copyUser(sourceAuth, targetAuth, sourceDb, targetDb, uid, resetPassword);
                if (password) {
                    const userRecord = await sourceAuth.getUser(uid);
                    passwordLog.push({ email: userRecord.email || '', password });
                }
                successCount++;
            } catch (error) {
                console.error(`❌ 사용자 복사 실패 (UID: ${uid}):`, error);
            }
        }

        // 비밀번호 로그 파일 저장
        if (passwordLog.length > 0) {
            const logPath = join(process.cwd(), `sync-users-passwords-${Date.now()}.txt`);
            const logContent = passwordLog.map(({ email, password }) =>
                `${email}: ${password}`
            ).join('\n');
            writeFileSync(logPath, logContent, 'utf8');
            console.log(`\n📝 임시 비밀번호가 저장되었습니다: ${logPath}`);
        }

        console.log(`\n✅ 동기화 완료! ${successCount}/${uidsToSync.length}명 복사됨`);

    } catch (error) {
        console.error('❌ 동기화 실패:', error);
        process.exit(1);
    }
}

// 명령줄 인수 파싱
function parseArgs(): SyncUserOptions {
    const args = process.argv.slice(2);
    const options: SyncUserOptions = {
        from: 'prod',
        to: 'dev',
        resetPassword: true
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];

        if (arg === '--from' && args[i + 1]) {
            options.from = args[++i] as 'prod' | 'dev';
        } else if (arg === '--to' && args[i + 1]) {
            options.to = args[++i] as 'prod' | 'dev';
        } else if (arg === '--role' && args[i + 1]) {
            options.role = args[++i].split(',').map(r => r.trim());
        } else if (arg === '--emails' && args[i + 1]) {
            options.emails = args[++i].split(',').map(e => e.trim());
        } else if (arg === '--all') {
            options.all = true;
        } else if (arg === '--no-reset-password') {
            options.resetPassword = false;
        }
    }

    return options;
}

// 실행
if (require.main === module) {
    const options = parseArgs();
    syncUsers(options).catch(console.error);
}

export { syncUsers };

