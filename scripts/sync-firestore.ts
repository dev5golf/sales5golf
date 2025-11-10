/**
 * Firestore 데이터 동기화 스크립트
 * 
 * 사용법:
 *   npm run sync:firestore -- --from prod --to dev --collections courses,countries
 *   npm run sync:firestore -- --from prod --to dev --all
 */

import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

interface SyncOptions {
    from: 'prod' | 'dev';
    to: 'prod' | 'dev';
    collections?: string[];
    all?: boolean;
    overwrite?: boolean;
}

// 프로젝트 설정
const PROJECTS = {
    prod: 'sales5golf',
    dev: 'sales5golf-dev'
};

// Firebase Admin SDK 초기화 (여러 프로젝트)
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

// 서브컬렉션까지 재귀적으로 복사
async function copySubcollections(
    sourceDb: Firestore,
    targetDb: Firestore,
    collectionName: string,
    docId: string,
    overwrite: boolean
): Promise<number> {
    let count = 0;
    const docRef = sourceDb.collection(collectionName).doc(docId);
    const subcollections = await docRef.listCollections();

    for (const subcollection of subcollections) {
        const subcollectionPath = `${collectionName}/${docId}/${subcollection.id}`;
        const snapshot = await subcollection.get();

        for (const doc of snapshot.docs) {
            const targetRef = targetDb.collection(collectionName).doc(docId)
                .collection(subcollection.id).doc(doc.id);

            if (!overwrite) {
                const exists = await targetRef.get();
                if (exists.exists) {
                    console.log(`  ⏭️  건너뜀 (이미 존재): ${subcollectionPath}/${doc.id}`);
                    continue;
                }
            }

            await targetRef.set(doc.data());
            count++;
            console.log(`  ✅ 복사 완료: ${subcollectionPath}/${doc.id}`);
        }

        // 재귀적으로 서브컬렉션의 서브컬렉션도 복사
        for (const doc of snapshot.docs) {
            const subCount = await copySubcollections(
                sourceDb,
                targetDb,
                `${collectionName}/${docId}/${subcollection.id}`,
                doc.id,
                overwrite
            );
            count += subCount;
        }
    }

    return count;
}

// 컬렉션 복사
async function copyCollection(
    sourceDb: Firestore,
    targetDb: Firestore,
    collectionName: string,
    overwrite: boolean
): Promise<number> {
    console.log(`\n📦 컬렉션 복사 중: ${collectionName}`);

    const snapshot = await sourceDb.collection(collectionName).get();
    let count = 0;

    for (const doc of snapshot.docs) {
        const targetRef = targetDb.collection(collectionName).doc(doc.id);

        if (!overwrite) {
            const exists = await targetRef.get();
            if (exists.exists) {
                console.log(`  ⏭️  건너뜀 (이미 존재): ${collectionName}/${doc.id}`);
                continue;
            }
        }

        await targetRef.set(doc.data());
        count++;
        console.log(`  ✅ 복사 완료: ${collectionName}/${doc.id}`);

        // 서브컬렉션 복사
        const subCount = await copySubcollections(
            sourceDb,
            targetDb,
            collectionName,
            doc.id,
            overwrite
        );
        count += subCount;
    }

    console.log(`✅ ${collectionName} 완료: ${count}개 문서`);
    return count;
}

// 모든 컬렉션 목록 가져오기
async function getAllCollections(db: Firestore): Promise<string[]> {
    const collections = await db.listCollections();
    return collections.map(col => col.id);
}

// 메인 동기화 함수
async function syncFirestore(options: SyncOptions) {
    const { from, to, collections, all, overwrite = false } = options;

    if (from === to) {
        console.error('❌ 소스와 대상이 동일합니다.');
        process.exit(1);
    }

    console.log(`\n🔄 Firestore 동기화 시작`);
    console.log(`   소스: ${PROJECTS[from]} (${from})`);
    console.log(`   대상: ${PROJECTS[to]} (${to})`);
    console.log(`   덮어쓰기: ${overwrite ? '예' : '아니오'}`);

    // Service Account 파일 경로 (각 프로젝트별로 필요)
    const sourceServiceAccount = join(process.cwd(), `firebase-service-account-${from}.json`);
    const targetServiceAccount = join(process.cwd(), `firebase-service-account-${to}.json`);

    try {
        // Admin SDK 초기화
        const sourceApp = initializeAdminApp(PROJECTS[from], sourceServiceAccount);
        const targetApp = initializeAdminApp(PROJECTS[to], targetServiceAccount);

        const sourceDb = getFirestore(sourceApp);
        const targetDb = getFirestore(targetApp);

        // 동기화할 컬렉션 목록 결정
        let collectionsToSync: string[];

        if (all) {
            collectionsToSync = await getAllCollections(sourceDb);
            console.log(`\n📋 전체 컬렉션 동기화: ${collectionsToSync.length}개`);
        } else if (collections && collections.length > 0) {
            collectionsToSync = collections;
            console.log(`\n📋 선택된 컬렉션: ${collectionsToSync.join(', ')}`);
        } else {
            console.error('❌ 컬렉션을 지정하거나 --all 옵션을 사용하세요.');
            process.exit(1);
        }

        // 각 컬렉션 복사
        let totalCount = 0;
        for (const collectionName of collectionsToSync) {
            try {
                const count = await copyCollection(sourceDb, targetDb, collectionName, overwrite);
                totalCount += count;
            } catch (error) {
                console.error(`❌ ${collectionName} 복사 실패:`, error);
            }
        }

        console.log(`\n✅ 동기화 완료! 총 ${totalCount}개 문서 복사됨`);

    } catch (error) {
        console.error('❌ 동기화 실패:', error);
        process.exit(1);
    }
}

// 명령줄 인수 파싱
function parseArgs(): SyncOptions {
    const args = process.argv.slice(2);
    const options: SyncOptions = {
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
        } else if (arg === '--collections' && args[i + 1]) {
            options.collections = args[++i].split(',').map(c => c.trim());
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
    syncFirestore(options).catch(console.error);
}

export { syncFirestore };

