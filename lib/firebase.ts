import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// 환경별 프로젝트 선택
// 개발 환경: NODE_ENV가 'development'이거나 .env.local에 설정된 값 사용
// 프로덕션: NODE_ENV가 'production'이거나 .env.production에 설정된 값 사용
const isDevelopment = process.env.NODE_ENV === 'development' ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.includes('-dev');

// 파이어베이스 설정
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (isDevelopment ? "sales5golf-dev.firebaseapp.com" : "sales5golf.firebaseapp.com"),
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (isDevelopment ? "sales5golf-dev" : "sales5golf"),
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (isDevelopment ? "sales5golf-dev.appspot.com" : "sales5golf.appspot.com"),
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "115716153945355558557",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:115716153945355558557:web:xxxxxxxxxxxxxxxx",
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XXXXXXXXXX"
};

// 파이어베이스 앱 초기화 (환경 변수가 없으면 더미 앱 생성)
let app;
let auth;
let db;
let storage;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);

    // 개발 환경인지 확인하여 콘솔에 표시
    if (isDevelopment) {
        console.log('🔥 Firebase 개발 환경 연결:', firebaseConfig.projectId);
    } else {
        console.log('🔥 Firebase 프로덕션 환경 연결:', firebaseConfig.projectId);
    }

    // 디버깅용: 브라우저 콘솔에서 인증 상태 확인 가능하도록
    if (typeof window !== 'undefined') {
        (window as any).__firebaseDebug = {
            auth,
            db,
            projectId: firebaseConfig.projectId,
            isDevelopment,
            checkAuth: () => {
                if (auth?.currentUser) {
                    console.log('✅ 인증됨:', {
                        uid: auth.currentUser.uid,
                        email: auth.currentUser.email,
                        emailVerified: auth.currentUser.emailVerified
                    });
                    return auth.currentUser;
                } else {
                    console.log('❌ 인증되지 않음');
                    return null;
                }
            },
            checkUserDoc: async () => {
                if (!auth?.currentUser) {
                    console.log('❌ 먼저 로그인하세요');
                    return null;
                }
                try {
                    const { doc, getDoc } = await import('firebase/firestore');
                    const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
                    if (userDoc.exists()) {
                        console.log('✅ 사용자 문서 존재:', userDoc.data());
                        return userDoc.data();
                    } else {
                        console.log('❌ 사용자 문서 없음');
                        return null;
                    }
                } catch (error) {
                    console.error('❌ 사용자 문서 조회 실패:', error);
                    return null;
                }
            },
            testOrdersAccess: async () => {
                if (!auth?.currentUser) {
                    console.log('❌ 먼저 로그인하세요');
                    return null;
                }
                try {
                    const { collection, getDocs, query, orderBy } = await import('firebase/firestore');
                    
                    // 실제 앱에서 사용하는 쿼리와 동일하게 테스트
                    console.log('🔄 orders 컬렉션 접근 시도 중 (orderBy 포함)...');
                    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
                    const snapshot = await getDocs(q);
                    console.log('✅ orders 컬렉션 접근 성공:', snapshot.size, '개 문서');
                    
                    // 서브컬렉션 접근 테스트 (실제 앱에서 사용하는 쿼리)
                    if (snapshot.size > 0) {
                        const firstOrderId = snapshot.docs[0].id;
                        console.log('🔄 서브컬렉션 접근 시도 중 (orders/' + firstOrderId + '/quotations)...');
                        try {
                            const quotationsRef = collection(db, 'orders', firstOrderId, 'quotations');
                            const quotationsQuery = query(quotationsRef, orderBy('updatedAt', 'desc'));
                            const quotationsSnapshot = await getDocs(quotationsQuery);
                            console.log('✅ 서브컬렉션 접근 성공:', quotationsSnapshot.size, '개 문서');
                        } catch (subError: any) {
                            console.error('❌ 서브컬렉션 접근 실패:', subError);
                            console.error('에러 코드:', subError.code);
                            console.error('에러 메시지:', subError.message);
                            return { success: false, error: '서브컬렉션 접근 실패: ' + subError.message, code: subError.code };
                        }
                    }
                    
                    return { success: true, count: snapshot.size };
                } catch (error: any) {
                    console.error('❌ orders 컬렉션 접근 실패:', error);
                    console.error('에러 코드:', error.code);
                    console.error('에러 메시지:', error.message);
                    
                    // 인덱스 오류인지 확인
                    if (error.code === 'failed-precondition' || error.message?.includes('index')) {
                        console.error('⚠️ Firestore 인덱스가 필요합니다. Firebase Console에서 인덱스를 생성하세요.');
                    }
                    
                    return { success: false, error: error.message, code: error.code };
                }
            }
        };
        console.log('🔍 디버깅 도구 사용법:');
        console.log('  window.__firebaseDebug.checkAuth() - 인증 상태 확인');
        console.log('  window.__firebaseDebug.checkUserDoc() - 사용자 문서 확인');
        console.log('  window.__firebaseDebug.testOrdersAccess() - orders 컬렉션 접근 테스트');
    }
} catch (error) {
    console.warn('Firebase 초기화 실패. 더미 설정을 사용합니다:', error);
    // 더미 객체 생성
    app = null;
    auth = null;
    db = null;
    storage = null;
}

export { auth, db, storage };
export default app;
