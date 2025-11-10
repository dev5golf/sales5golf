/**
 * Firebase Storage 동기화 스크립트
 * 
 * 사용법:
 *   npm run sync:storage -- --from prod --to dev --path images
 *   npm run sync:storage -- --from prod --to dev --all
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getStorage, Storage } from 'firebase-admin/storage';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SyncStorageOptions {
    from: 'prod' | 'dev';
    to: 'prod' | 'dev';
    path?: string;
    all?: boolean;
    overwrite?: boolean;
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
            projectId: projectId,
            storageBucket: `${projectId}.appspot.com`
        }, projectId);
    } catch (error) {
        throw new Error(`프로젝트 ${projectId} 초기화 실패: ${error}`);
    }
}

// 파일 복사
async function copyFile(
    sourceStorage: Storage,
    targetStorage: Storage,
    filePath: string,
    overwrite: boolean
): Promise<boolean> {
    try {
        const sourceBucket = sourceStorage.bucket();
        const targetBucket = targetStorage.bucket();
        
        const sourceFile = sourceBucket.file(filePath);
        const targetFile = targetBucket.file(filePath);
        
        // 파일 존재 여부 확인
        if (!overwrite) {
            const [exists] = await targetFile.exists();
            if (exists) {
                console.log(`  ⏭️  건너뜀 (이미 존재): ${filePath}`);
                return false;
            }
        }
        
        // 파일 다운로드 및 업로드
        const [buffer] = await sourceFile.download();
        await targetFile.save(buffer, {
            metadata: {
                contentType: (await sourceFile.getMetadata())[0].contentType
            }
        });
        
        console.log(`  ✅ 복사 완료: ${filePath}`);
        return true;
    } catch (error: any) {
        if (error.code === 404) {
            console.log(`  ⚠️  파일 없음: ${filePath}`);
            return false;
        }
        throw error;
    }
}

// 경로의 모든 파일 목록 가져오기
async function listFiles(
    storage: Storage,
    prefix?: string
): Promise<string[]> {
    const bucket = storage.bucket();
    const [files] = await bucket.getFiles({ prefix });
    
    return files.map(file => file.name);
}

// 메인 동기화 함수
async function syncStorage(options: SyncStorageOptions) {
    const { from, to, path, all, overwrite = false } = options;
    
    if (from === to) {
        console.error('❌ 소스와 대상이 동일합니다.');
        process.exit(1);
    }
    
    console.log(`\n🔄 Storage 동기화 시작`);
    console.log(`   소스: ${PROJECTS[from]} (${from})`);
    console.log(`   대상: ${PROJECTS[to]} (${to})`);
    console.log(`   덮어쓰기: ${overwrite ? '예' : '아니오'}`);
    
    // Service Account 파일 경로
    const sourceServiceAccount = join(process.cwd(), `firebase-service-account-${from}.json`);
    const targetServiceAccount = join(process.cwd(), `firebase-service-account-${to}.json`);
    
    try {
        // Admin SDK 초기화
        const sourceApp = initializeAdminApp(PROJECTS[from], sourceServiceAccount);
        const targetApp = initializeAdminApp(PROJECTS[to], targetServiceAccount);
        
        const sourceStorage = getStorage(sourceApp);
        const targetStorage = getStorage(targetApp);
        
        // 동기화할 파일 목록 결정
        let filesToSync: string[];
        
        if (all) {
            filesToSync = await listFiles(sourceStorage);
            console.log(`\n📋 전체 파일 동기화: ${filesToSync.length}개`);
        } else if (path) {
            filesToSync = await listFiles(sourceStorage, path);
            console.log(`\n📋 경로별 파일 동기화: ${filesToSync.length}개 (경로: ${path})`);
        } else {
            console.error('❌ 경로를 지정하거나 --all 옵션을 사용하세요.');
            process.exit(1);
        }
        
        // 각 파일 복사
        let successCount = 0;
        for (const filePath of filesToSync) {
            try {
                const copied = await copyFile(sourceStorage, targetStorage, filePath, overwrite);
                if (copied) successCount++;
            } catch (error) {
                console.error(`❌ 파일 복사 실패: ${filePath}`, error);
            }
        }
        
        console.log(`\n✅ 동기화 완료! ${successCount}/${filesToSync.length}개 파일 복사됨`);
        
    } catch (error) {
        console.error('❌ 동기화 실패:', error);
        process.exit(1);
    }
}

// 명령줄 인수 파싱
function parseArgs(): SyncStorageOptions {
    const args = process.argv.slice(2);
    const options: SyncStorageOptions = {
        from: 'prod',
        to: 'dev',
        overwrite: false
    };
    
    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        
        if (arg === '--from' && args[i + 1]) {
            options.from = args[++i] as 'prod' | 'dev';
        } else if (arg === '--to' && args[i + 1]) {
            options.to = args[++i] as 'prod' | 'dev';
        } else if (arg === '--path' && args[i + 1]) {
            options.path = args[++i];
        } else if (arg === '--all') {
            options.all = true;
        } else if (arg === '--overwrite') {
            options.overwrite = true;
        }
    }
    
    return options;
}

// 실행
if (require.main === module) {
    const options = parseArgs();
    syncStorage(options).catch(console.error);
}

export { syncStorage };

