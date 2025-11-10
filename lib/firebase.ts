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
