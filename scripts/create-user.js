// 사용자 계정 생성 스크립트
// 사용법: node scripts/create-user.js

require('dotenv').config({ path: '.env.local' });

const { initializeApp } = require('firebase/app');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase 설정 (환경변수에서 가져오기)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createUsers() {
    try {
        console.log('🔥 사용자 계정 생성 시작...');

        // 1. Firebase Auth에 사용자 생성
        const email = 'admin@5mgolf.com';
        const password = 'admin123!';

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        console.log('✅ Firebase Auth 사용자 생성 완료:', user.uid);

        // 2. Firestore에 사용자 정보 저장
        const userData = {
            email: email,
            name: '시스템 관리자',
            phone: '010-1234-5678',
            role: 'super_admin',
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: null
        };

        await setDoc(doc(db, 'users', user.uid), userData);

        console.log('✅ Firestore 사용자 데이터 저장 완료');
        console.log('🎉 수퍼 관리자 계정 생성 완료!');
        console.log('📧 이메일:', email);
        console.log('🔑 비밀번호:', password);
        console.log('👤 역할: super_admin');

        // 3. 골프장 관리자 예시도 생성
        const courseAdminEmail = 'course@5mgolf.com';
        const courseAdminPassword = 'course123!';

        const courseAdminCredential = await createUserWithEmailAndPassword(auth, courseAdminEmail, courseAdminPassword);
        const courseAdmin = courseAdminCredential.user;

        const courseAdminData = {
            email: courseAdminEmail,
            name: '골프장 관리자',
            phone: '010-9876-5432',
            role: 'course_admin',
            courseId: 'course_0001',
            courseName: '테스트 골프장',
            isActive: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: null
        };

        await setDoc(doc(db, 'users', courseAdmin.uid), courseAdminData);

        console.log('✅ 골프장 관리자 계정도 생성 완료!');
        console.log('📧 이메일:', courseAdminEmail);
        console.log('🔑 비밀번호:', courseAdminPassword);
        console.log('👤 역할: course_admin');

        process.exit(0);

    } catch (error) {
        console.error('❌ 사용자 계정 생성 실패:', error);
        process.exit(1);
    }
}

// 스크립트 실행
createUsers();
